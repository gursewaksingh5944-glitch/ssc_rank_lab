const { test, expect } = require("@playwright/test");

test("question meta exposes tier-aware topic coverage for the UI", async ({ request }) => {
  const response = await request.get("/api/questions/meta");
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.success).toBeTruthy();
  expect(Array.isArray(body.topicItems)).toBeTruthy();
  expect(body.topicItems.length).toBeGreaterThan(0);
  expect(body.topicItems[0]).toHaveProperty("tier");
  expect(body.topicItems[0]).toHaveProperty("count");
});

test("mock generation returns quality summary for accurate candidate feedback", async ({ request }) => {
  const response = await request.post("/api/questions/mocks/generate", {
    data: {
      tier: "tier1"
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBeTruthy();
  expect(body.summary).toBeTruthy();
  expect(body.summary).toHaveProperty("subjectBreakdown");
  expect(body.summary).toHaveProperty("difficultyBreakdown");
  expect(body.summary).toHaveProperty("qualityBand");
  expect(Array.isArray(body.warnings)).toBeTruthy();
});

test("tier2 mock generation serves questions from all subjects", async ({ request }) => {
  const response = await request.post("/api/questions/mocks/generate", {
    data: {
      tier: "tier2"
    }
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBeTruthy();
  expect(body.served).toBeGreaterThanOrEqual(100);
  expect(Array.isArray(body.items)).toBeTruthy();
  const subjects = new Set(body.items.map(q => q.subject));
  expect(subjects.size).toBeGreaterThanOrEqual(4);
});
