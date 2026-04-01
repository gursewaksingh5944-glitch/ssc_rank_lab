const { test, expect } = require("@playwright/test");

test("full mock generates real questions with sections", async ({ request }) => {
  const res = await request.post("/api/tests/full-mock", {
    data: { tier: "tier1", userId: "test_user_grading" }
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.success).toBeTruthy();
  expect(body.readyToStart).toBeTruthy();
  expect(body.test.testId).toBeTruthy();
  expect(body.test.totalQuestions).toBeGreaterThan(0);
  expect(Array.isArray(body.test.sections)).toBeTruthy();

  // All sections should have actual questions
  const totalQs = body.test.sections.reduce((s, sec) => s + sec.servedCount, 0);
  expect(totalQs).toBeGreaterThan(0);

  // Each question should have id, question text, and options (but no answerIndex)
  const firstSection = body.test.sections.find(s => s.servedCount > 0);
  expect(firstSection).toBeTruthy();
  const q = firstSection.questions[0];
  expect(q.id).toBeTruthy();
  expect(q.question).toBeTruthy();
  expect(Array.isArray(q.options)).toBeTruthy();
  expect(q.answerIndex).toBeUndefined(); // Should NOT leak answers
});

test("submit test returns graded results with scores", async ({ request }) => {
  // 1. Generate a mock
  const genRes = await request.post("/api/tests/full-mock", {
    data: { tier: "tier1", userId: "test_grading_submit" }
  });
  const genBody = await genRes.json();
  const testId = genBody.test.testId;
  const sections = genBody.test.sections;

  // 2. Build responses (answer 0 for everything)
  const responses = [];
  for (const sec of sections) {
    for (const q of sec.questions) {
      responses.push({ questionId: q.id, selectedIndex: 0, timeSpent: 5000 });
    }
  }

  // 3. Submit
  const submitRes = await request.post(`/api/tests/${testId}/submit`, {
    data: { responses }
  });
  expect(submitRes.ok()).toBeTruthy();
  const result = await submitRes.json();
  expect(result.success).toBeTruthy();

  // Has graded stats
  expect(result.stats).toBeTruthy();
  expect(result.stats.attempted).toBeGreaterThan(0);
  expect(typeof result.stats.correct).toBe("number");
  expect(typeof result.stats.netMarks).toBe("number");
  expect(result.stats.accuracy).toBeTruthy();

  // Has answer review
  expect(Array.isArray(result.answerReview)).toBeTruthy();
  expect(result.answerReview.length).toBeGreaterThan(0);
  const reviewed = result.answerReview[0];
  expect(typeof reviewed.yourAnswer).toBe("number");
  expect(typeof reviewed.correctAnswer).toBe("number");
  expect(typeof reviewed.isCorrect).toBe("boolean");

  // Has recommendations
  expect(Array.isArray(result.recommendations)).toBeTruthy();
});

test("topic-wise test generation and grading works", async ({ request }) => {
  // Generate topic test
  const genRes = await request.post("/api/tests/topic-wise", {
    data: { topics: ["Algebra", "Geometry"], subject: "quant", count: 10, userId: "test_topic" }
  });
  expect(genRes.ok()).toBeTruthy();
  const genBody = await genRes.json();
  expect(genBody.success).toBeTruthy();
  expect(genBody.test.totalQuestions).toBeGreaterThan(0);
  expect(Array.isArray(genBody.test.questions)).toBeTruthy();

  // Submit answers
  const responses = genBody.test.questions.map(q => ({
    questionId: q.id, selectedIndex: 0, timeSpent: 3000
  }));
  const submitRes = await request.post(`/api/tests/${genBody.test.testId}/submit`, {
    data: { responses }
  });
  expect(submitRes.ok()).toBeTruthy();
  const result = await submitRes.json();
  expect(result.stats.attempted).toBe(responses.length);
});

test("test analytics endpoint returns performance data", async ({ request }) => {
  // First save a test entry
  await request.post("/api/test", {
    data: {
      userKey: "analytics_test_user",
      testDate: "2026-03-28",
      quant: 35, english: 40, reasoning: 38, gk: 30, computer: 0, tier: "tier1"
    }
  });
  await request.post("/api/test", {
    data: {
      userKey: "analytics_test_user",
      testDate: "2026-03-29",
      quant: 37, english: 42, reasoning: 40, gk: 32, computer: 0, tier: "tier1"
    }
  });

  // Get analytics
  const res = await request.get("/api/test/analytics_test_user/analytics?tier=tier1");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.success).toBeTruthy();
  expect(body.hasData).toBeTruthy();
  expect(body.overall).toBeTruthy();
  expect(body.overall.avg).toBeGreaterThan(0);
  expect(body.overall.best).toBeGreaterThan(0);
  expect(body.subjectAnalysis).toBeTruthy();
  expect(body.subjectAnalysis.quant).toBeTruthy();
  expect(body.subjectAnalysis.quant.trend).toBeTruthy();
  expect(Array.isArray(body.weakest)).toBeTruthy();
  expect(Array.isArray(body.strongest)).toBeTruthy();
  expect(Array.isArray(body.timeline)).toBeTruthy();
  expect(typeof body.consistencyScore).toBe("number");
});

test("expired test session returns 404", async ({ request }) => {
  const res = await request.post("/api/tests/nonexistent_test_123/submit", {
    data: { responses: [] }
  });
  expect(res.status()).toBe(404);
});
