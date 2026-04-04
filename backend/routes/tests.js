// Test Generation & Grading Routes
// Full mock, PYQ, topic-wise with real question selection and scoring

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { TestAnalytics } = require("../modules/test-analytics");

// ── Question bank loader ────────────────────────────────────
const BANK_PATH = path.join(__dirname, "..", "data", "question-bank.json");

let _bankCache = null;
let _bankMtime = 0;

function loadBank() {
  try {
    const stat = fs.statSync(BANK_PATH);
    if (_bankCache && stat.mtimeMs === _bankMtime) return _bankCache;
    const raw = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
    _bankCache = (raw.questions || []).filter(q => q.reviewStatus === "approved");
    _bankMtime = stat.mtimeMs;
    return _bankCache;
  } catch {
    return [];
  }
}

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(bank, subject, tier, count, opts = {}) {
  // quant, reasoning, english overlap between tier1 and tier2; include both tiers
  const sharedSubjects = new Set(["quant", "reasoning", "english", "gk"]);
  let pool = bank.filter(q => q.subject === subject && (sharedSubjects.has(subject) || q.tier === tier || q.tier === "tier1"));
  if (opts.isPYQ) pool = pool.filter(q => q.isPYQ);
  if (opts.difficulty) pool = pool.filter(q => q.difficulty === opts.difficulty);
  if (opts.topics && opts.topics.length) {
    const topicSet = new Set(opts.topics.map(t => t.toLowerCase()));
    pool = pool.filter(q => topicSet.has((q.topic || "").toLowerCase()));
  }

  // Separate set-based questions from standalone
  const standalone = pool.filter(q => !q.setId);
  const setGroups = {};
  for (const q of pool.filter(q => q.setId)) {
    if (!setGroups[q.setId]) setGroups[q.setId] = [];
    setGroups[q.setId].push(q);
  }
  // Sort set questions by setIndex
  for (const g of Object.values(setGroups)) {
    g.sort((a, b) => (a.setIndex || 0) - (b.setIndex || 0));
  }

  const result = [];
  const usedSets = new Set();
  const shuffledStandalone = shuffle(standalone);
  const shuffledSetIds = shuffle(Object.keys(setGroups));

  // First, try to include complete question sets
  for (const sid of shuffledSetIds) {
    const group = setGroups[sid];
    if (result.length + group.length <= count) {
      result.push(...group);
      usedSets.add(sid);
    }
    if (result.length >= count) break;
  }

  // Fill rest with standalone questions
  for (const q of shuffledStandalone) {
    if (result.length >= count) break;
    result.push(q);
  }

  return result;
}

// Strip answers before sending to client
function sanitize(q) {
  const out = {
    id: q.id,
    question: q.question,
    options: q.options,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
    marks: q.marks || 2,
    negativeMarks: q.negativeMarks || 0.5,
    isPYQ: q.isPYQ || false
  };
  if (q.setId) { out.setId = q.setId; out.setIndex = q.setIndex; out.setSize = q.setSize; }
  return out;
}

// ── Session store (in-memory, bounded + TTL cleanup) ────────
const testSessions = new Map();
const MAX_SESSIONS = 500;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function storeSession(testId, session) {
  session._createdAt = Date.now();
  // Evict expired sessions first
  const now = Date.now();
  for (const [id, s] of testSessions) {
    if (now - (s._createdAt || 0) > SESSION_TTL_MS) testSessions.delete(id);
  }
  if (testSessions.size >= MAX_SESSIONS) {
    // Evict oldest
    const oldest = testSessions.keys().next().value;
    testSessions.delete(oldest);
  }
  testSessions.set(testId, session);
}

// ── Config ──────────────────────────────────────────────────
const SSC_EXAM_CONFIG = {
  tier1: {
    name: "SSC CGL Tier-1",
    totalQuestions: 100,
    totalTime: 60,
    marksPerQ: 2,
    negPerQ: 0.5,
    sections: {
      gk: { label: "General Awareness", code: "gk", questions: 25 },
      reasoning: { label: "Reasoning", code: "reasoning", questions: 25 },
      quant: { label: "Quantitative Aptitude", code: "quant", questions: 25 },
      english: { label: "English Comprehension", code: "english", questions: 25 }
    },
    totalMarks: 200
  },
  tier2: {
    name: "SSC CGL Tier-2",
    totalQuestions: 130,
    totalTime: 120,
    marksPerQ: 3,
    negPerQ: 1,
    sections: {
      quant: { label: "Quantitative Aptitude", code: "quant", questions: 35 },
      reasoning: { label: "Reasoning", code: "reasoning", questions: 30 },
      english: { label: "English Comprehension", code: "english", questions: 30 },
      gk: { label: "General Awareness", code: "gk", questions: 20 },
      computer: { label: "Computer Knowledge", code: "computer", questions: 15 }
    },
    totalMarks: 390
  }
};

const TEST_MODES = {
  full_mock: { name: "Full Mock Test", description: "Complete SSC CGL exam simulation" },
  pyq_based: { name: "PYQ Based Exam", description: "Real previous year questions" },
  random_mixed: { name: "Random Mixed Test", description: "Mix of PYQ and fresh questions" },
  topic_wise: { name: "Topic Wise Test", description: "Practice specific topics" }
};

const testAnalytics = new TestAnalytics();

// ── Helper: build section questions ─────────────────────────
function buildSectionQuestions(bank, config, tier, opts = {}) {
  const sections = [];
  const allQuestions = [];

  for (const [key, sec] of Object.entries(config.sections)) {
    const picked = pickQuestions(bank, sec.code, tier, sec.questions, opts);
    const sectionQuestions = picked.map(q => ({
      ...sanitize(q),
      _answerId: q.id, // internal only, stripped before send
      _answerIndex: q.answerIndex,
      section: key
    }));
    sections.push({
      key,
      label: sec.label,
      code: sec.code,
      targetCount: sec.questions,
      servedCount: sectionQuestions.length,
      questions: sectionQuestions.map(q => {
        const { _answerId, _answerIndex, ...clean } = q;
        return clean;
      })
    });
    allQuestions.push(...sectionQuestions);
  }

  return { sections, allQuestions };
}

// ============================================================
// ROUTE 1: Generate Full Mock (real questions)
// ============================================================
router.post("/full-mock", (req, res) => {
  try {
    const { tier = "tier1", userId } = req.body;
    const config = SSC_EXAM_CONFIG[tier];
    if (!config) return res.status(400).json({ error: "Invalid tier" });

    const bank = loadBank();
    const testId = `fullmock_${(userId || "anon").substring(0, 20)}_${Date.now()}`;

    const { sections, allQuestions } = buildSectionQuestions(bank, config, tier);

    // Store answer key server-side
    const answerKey = {};
    allQuestions.forEach(q => { answerKey[q.id] = q._answerIndex; });

    const session = testAnalytics.createTestSession(testId, "full_mock", tier, config);
    session.questions = allQuestions.map(q => ({
      id: q.id, subject: q.subject, topic: q.topic,
      difficulty: q.difficulty, marks: q.marks, negativeMarks: q.negativeMarks
    }));
    session.answerKey = answerKey;
    storeSession(testId, session);

    const totalServed = sections.reduce((s, sec) => s + sec.servedCount, 0);

    res.json({
      success: true,
      test: {
        testId,
        testMode: "full_mock",
        testName: config.name,
        tier,
        totalQuestions: totalServed,
        totalTime: config.totalTime,
        totalMarks: config.totalMarks,
        marksPerQuestion: config.marksPerQ,
        negativePerQuestion: config.negPerQ,
        sections,
        startTime: session.startTime,
        instructions: [
          `Total ${totalServed} questions across ${sections.length} sections.`,
          `Negative marking: -${config.negPerQ} marks per incorrect answer.`,
          `Total time: ${config.totalTime} minutes.`,
          "Click 'Submit Test' when done."
        ]
      },
      readyToStart: totalServed > 0
    });
  } catch (err) {
    console.error("full-mock error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// ROUTE 2: PYQ Metadata
// ============================================================
router.get("/pyq-metadata", (req, res) => {
  try {
    let PYQ_METADATA;
    try { PYQ_METADATA = require("../config/exam-config").PYQ_METADATA; } catch { PYQ_METADATA = null; }
    const fallback = {
      "2023": { exams: ["12-Sep-Shift1", "12-Sep-Shift2", "12-Sep-Shift3"], difficulty: "medium" },
      "2024": { exams: ["14-Sep-Shift1", "14-Sep-Shift2"], difficulty: "medium-hard" },
      "2025": { exams: ["15-Sep-Shift1-2025"], difficulty: "hard" }
    };
    const meta = PYQ_METADATA || fallback;
    res.json({
      success: true,
      metadata: {
        availableYears: Object.keys(meta),
        byYear: meta,
        description: "Select year and exam date to generate PYQ-based mock"
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// ROUTE 3: PYQ Based Exam
// ============================================================
router.post("/pyq-exam", (req, res) => {
  try {
    const { year, exam, tier = "tier1", userId } = req.body;
    if (!year || !exam) return res.status(400).json({ error: "Year and exam required" });

    const config = SSC_EXAM_CONFIG[tier];
    if (!config) return res.status(400).json({ error: "Invalid tier" });

    const bank = loadBank();
    const testId = `pyq_${year}_${(userId || "anon").substring(0, 20)}_${Date.now()}`;
    const { sections, allQuestions } = buildSectionQuestions(bank, config, tier, { isPYQ: true });

    const answerKey = {};
    allQuestions.forEach(q => { answerKey[q.id] = q._answerIndex; });

    const session = testAnalytics.createTestSession(testId, "pyq_based", tier, config);
    session.questions = allQuestions.map(q => ({
      id: q.id, subject: q.subject, topic: q.topic,
      difficulty: q.difficulty, marks: q.marks, negativeMarks: q.negativeMarks
    }));
    session.answerKey = answerKey;
    session.metadata = { year, exam };
    storeSession(testId, session);

    const totalServed = sections.reduce((s, sec) => s + sec.servedCount, 0);

    res.json({
      success: true,
      test: {
        testId,
        testMode: "pyq_based",
        testName: `SSC CGL ${year} - ${exam}`,
        year, exam, tier, isPYQ: true,
        totalQuestions: totalServed,
        totalTime: config.totalTime,
        totalMarks: config.totalMarks,
        sections,
        startTime: session.startTime,
        instructions: [
          `PYQ exam from ${year} (${exam}).`,
          `${totalServed} real previous year questions loaded.`,
          `Negative marking: -${config.negPerQ} per incorrect answer.`
        ]
      },
      readyToStart: totalServed > 0
    });
  } catch (err) {
    console.error("pyq-exam error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// ROUTE 4: Random Mixed Test (PYQ + Fresh)
// ============================================================
router.post("/random-mixed", (req, res) => {
  try {
    const { pyqRatio = 0.5, tier = "tier1", userId } = req.body;
    const config = SSC_EXAM_CONFIG[tier];
    if (!config) return res.status(400).json({ error: "Invalid tier" });

    const bank = loadBank();
    const testId = `random_${(userId || "anon").substring(0, 20)}_${Date.now()}`;

    // Mix PYQ and fresh
    const allQuestions = [];
    const sections = [];

    for (const [key, sec] of Object.entries(config.sections)) {
      const pyqCount = Math.round(sec.questions * Math.max(0, Math.min(1, pyqRatio)));
      const freshCount = sec.questions - pyqCount;
      const pyqPicked = pickQuestions(bank, sec.code, tier, pyqCount, { isPYQ: true });
      const usedIds = new Set(pyqPicked.map(q => q.id));
      const freshPool = bank.filter(q => q.subject === sec.code && !usedIds.has(q.id) &&
        (q.tier === tier || q.tier === "tier1") && q.reviewStatus === "approved");
      const freshPicked = shuffle(freshPool).slice(0, freshCount);
      const combined = shuffle([...pyqPicked, ...freshPicked]);

      const sectionQs = combined.map(q => ({
        ...sanitize(q), _answerIndex: q.answerIndex, section: key
      }));

      sections.push({
        key, label: sec.label, code: sec.code,
        targetCount: sec.questions, servedCount: sectionQs.length,
        questions: sectionQs.map(({ _answerIndex, ...clean }) => clean)
      });
      allQuestions.push(...sectionQs);
    }

    const answerKey = {};
    allQuestions.forEach(q => { answerKey[q.id] = q._answerIndex; });

    const session = testAnalytics.createTestSession(testId, "random_mixed", tier, config);
    session.questions = allQuestions.map(q => ({
      id: q.id, subject: q.subject, topic: q.topic,
      difficulty: q.difficulty, marks: q.marks, negativeMarks: q.negativeMarks
    }));
    session.answerKey = answerKey;
    storeSession(testId, session);

    const totalServed = sections.reduce((s, sec) => s + sec.servedCount, 0);

    res.json({
      success: true,
      test: {
        testId, testMode: "random_mixed",
        testName: "Random Mixed Test (PYQ + Fresh)",
        tier, totalQuestions: totalServed,
        totalTime: config.totalTime,
        totalMarks: config.totalMarks,
        sections, startTime: session.startTime,
        instructions: [
          `Mix of PYQ and fresh questions.`,
          `Negative marking: -${config.negPerQ} per incorrect answer.`
        ]
      },
      readyToStart: totalServed > 0
    });
  } catch (err) {
    console.error("random-mixed error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// ROUTE 5: Topic-Wise Test
// ============================================================
router.post("/topic-wise", (req, res) => {
  try {
    const { topics = [], subject = "quant", difficulty, userId, count = 25, tier = "tier1" } = req.body;
    if (!topics.length) return res.status(400).json({ error: "At least one topic required" });

    const safeCount = Math.min(Math.max(1, Number(count) || 25), 100);
    const bank = loadBank();
    const picked = pickQuestions(bank, subject, tier, safeCount, { topics, difficulty });

    const testId = `topic_${(userId || "anon").substring(0, 20)}_${Date.now()}`;
    const answerKey = {};
    picked.forEach(q => { answerKey[q.id] = q.answerIndex; });

    const session = testAnalytics.createTestSession(testId, "topic_wise", tier, {
      sections: {}, totalTime: 0, marksPerQ: 2, negPerQ: 0.5
    });
    session.questions = picked.map(q => ({
      id: q.id, subject: q.subject, topic: q.topic,
      difficulty: q.difficulty, marks: q.marks || 2, negativeMarks: q.negativeMarks || 0.5
    }));
    session.answerKey = answerKey;
    storeSession(testId, session);

    res.json({
      success: true,
      test: {
        testId, testMode: "topic_wise",
        testName: `Topic Test: ${topics.join(", ")}`,
        topics, difficulty: difficulty || "mixed", subject,
        totalQuestions: picked.length,
        totalTime: "Unlimited",
        isTimedTest: false,
        questions: picked.map(sanitize),
        startTime: session.startTime,
        instructions: [
          `${picked.length} questions on: ${topics.join(", ")}.`,
          "No time limit — answer at your pace.",
          "Detailed analysis after submission."
        ]
      },
      readyToStart: picked.length > 0
    });
  } catch (err) {
    console.error("topic-wise error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// ROUTE 6: Submit Test & Get Graded Report
// ============================================================
router.post("/:testId/submit", (req, res) => {
  try {
    const { testId } = req.params;
    const { responses } = req.body; // [{questionId, selectedIndex, timeSpent}]

    const session = testSessions.get(testId);
    if (!session) return res.status(404).json({ error: "Test session not found or expired" });
    if (!Array.isArray(responses)) return res.status(400).json({ error: "responses array required" });

    const answerKey = session.answerKey || {};

    // Grade each response server-side
    responses.forEach(resp => {
      const correctIndex = answerKey[resp.questionId];
      const userAnswer = Number.isInteger(resp.selectedIndex) ? resp.selectedIndex : -1;
      const isSkipped = userAnswer === -1;

      testAnalytics.recordAnswer(
        session,
        resp.questionId,
        isSkipped ? -1 : userAnswer,
        correctIndex != null ? correctIndex : -1,
        resp.timeSpent || 0
      );
    });

    session.totalTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

    const stats = testAnalytics.calculateStats(session, session.config);
    const report = testAnalytics.generateReport(session);
    const weakAreas = testAnalytics.getWeakAreas(session);

    // Build answer review (shows correct answer after submission)
    const answerReview = responses.map(resp => {
      const q = session.questions.find(x => x.id === resp.questionId);
      const correctIdx = answerKey[resp.questionId];
      const userIdx = Number.isInteger(resp.selectedIndex) ? resp.selectedIndex : -1;
      return {
        questionId: resp.questionId,
        subject: q?.subject,
        topic: q?.topic,
        difficulty: q?.difficulty,
        yourAnswer: userIdx,
        correctAnswer: correctIdx,
        isCorrect: userIdx === correctIdx,
        isSkipped: userIdx === -1,
        marksAwarded: userIdx === correctIdx
          ? (q?.marks || 2)
          : userIdx === -1 ? 0 : -(q?.negativeMarks || 0.5)
      };
    });

    res.json({
      success: true,
      testId,
      stats: {
        attempted: stats.attempted,
        correct: stats.correct,
        incorrect: stats.incorrect,
        skipped: stats.notAttempted,
        netMarks: stats.netMarks,
        maxMarks: session.config.totalMarks || (session.questions.length * 2),
        accuracy: stats.accuracy,
        speed: stats.speed,
        timeUsed: (session.totalTime / 60000).toFixed(1) + " min"
      },
      sectionBreakdown: stats.bySection,
      weakAreas: weakAreas.slice(0, 5),
      recommendations: report.recommendations,
      answerReview,
      nextSteps: [
        weakAreas.length > 0 ? `Focus on ${weakAreas[0].topic} — your weakest area.` : null,
        parseFloat(stats.accuracy) < 60 ? "Revise concepts before next mock." : null,
        parseFloat(stats.accuracy) >= 80 ? "Great accuracy! Try a harder difficulty mix." : null,
        "Take a topic-wise test on weak areas to improve."
      ].filter(Boolean)
    });
  } catch (err) {
    console.error("submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// ROUTE 7: Get Test Report (after submission)
// ============================================================
router.get("/:testId/report", (req, res) => {
  try {
    const { testId } = req.params;
    const session = testSessions.get(testId);
    if (!session) return res.status(404).json({ error: "Test not found or expired" });

    const report = testAnalytics.generateReport(session);
    const weakAreas = testAnalytics.getWeakAreas(session);

    res.json({
      success: true,
      testId,
      testMode: session.testMode,
      tier: session.tier,
      report,
      weakAreas,
      stats: session.stats
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// ROUTE 8: Available Test Modes
// ============================================================
router.get("/modes", (req, res) => {
  res.json({
    success: true,
    modes: Object.entries(TEST_MODES).map(([id, mode]) => ({ id, ...mode })),
    totalModes: Object.keys(TEST_MODES).length
  });
});

module.exports = router;
