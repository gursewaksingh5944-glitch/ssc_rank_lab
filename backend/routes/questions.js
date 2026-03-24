const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "question-bank.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const seed = {
      updatedAt: new Date().toISOString(),
      questions: []
    };
    fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), "utf8");
  }
}

function readBank() {
  ensureFile();

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    return {
      updatedAt: parsed.updatedAt || null,
      questions
    };
  } catch (err) {
    console.error("question bank read error:", err);
    return { updatedAt: null, questions: [] };
  }
}

function writeBank(bank) {
  ensureFile();
  const next = {
    updatedAt: new Date().toISOString(),
    questions: Array.isArray(bank.questions) ? bank.questions : []
  };
  fs.writeFileSync(filePath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizeQuestion(input) {
  const type = normalize(input.type) || "question";
  const examFamily = normalize(input.examFamily) || "ssc";
  const subject = normalize(input.subject);
  const difficulty = normalize(input.difficulty);
  const topic = String(input.topic || "").trim();
  const question = String(input.question || "").trim();
  const options = Array.isArray(input.options) ? input.options.map((o) => String(o || "").trim()).filter(Boolean) : [];
  const answerIndex = Number(input.answerIndex);
  const explanation = String(input.explanation || "").trim();

  if (!["question", "mock"].includes(type)) {
    return { error: "Invalid type" };
  }

  if (!subject || !difficulty || !topic || !question) {
    return { error: "subject, difficulty, topic, question are required" };
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "difficulty must be easy, medium, or hard" };
  }

  if (options.length < 2) {
    return { error: "At least 2 options required" };
  }

  if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
    return { error: "answerIndex must point to a valid option" };
  }

  const now = new Date().toISOString();
  const id = String(input.id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

  return {
    id,
    type,
    examFamily,
    subject,
    difficulty,
    topic,
    question,
    options,
    answerIndex,
    explanation,
    marks: Number(input.marks || 2),
    negativeMarks: Number(input.negativeMarks || 0.5),
    createdAt: String(input.createdAt || now),
    updatedAt: now
  };
}

function filterQuestions(all, query) {
  const subject = normalize(query.subject);
  const difficulty = normalize(query.difficulty);
  const topic = normalize(query.topic);
  const examFamily = normalize(query.examFamily);
  const type = normalize(query.type);

  let results = [...all];

  if (subject) results = results.filter((q) => q.subject === subject);
  if (difficulty) results = results.filter((q) => q.difficulty === difficulty);
  if (examFamily) results = results.filter((q) => q.examFamily === examFamily);
  if (type) results = results.filter((q) => q.type === type);
  if (topic) results = results.filter((q) => normalize(q.topic).includes(topic));

  const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
  return results.slice(0, limit);
}

router.get("/", (req, res) => {
  try {
    const bank = readBank();
    const items = filterQuestions(bank.questions, req.query || {});
    return res.json({
      success: true,
      updatedAt: bank.updatedAt,
      count: items.length,
      items
    });
  } catch (error) {
    console.error("/api/questions GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/meta", (req, res) => {
  try {
    const bank = readBank();
    const subjects = [...new Set(bank.questions.map((q) => q.subject))].sort();
    const topics = [...new Set(bank.questions.map((q) => q.topic))].sort();

    return res.json({
      success: true,
      updatedAt: bank.updatedAt,
      subjects,
      topics,
      total: bank.questions.length
    });
  } catch (error) {
    console.error("/api/questions/meta GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/mocks/generate", (req, res) => {
  try {
    const { count = 25, subject = "", difficulty = "" } = req.body || {};

    const bank = readBank();
    let pool = bank.questions.filter((q) => q.type === "question");

    const normalizedSubject = normalize(subject);
    const normalizedDifficulty = normalize(difficulty);

    if (normalizedSubject) {
      pool = pool.filter((q) => q.subject === normalizedSubject);
    }

    if (normalizedDifficulty) {
      pool = pool.filter((q) => q.difficulty === normalizedDifficulty);
    }

    if (pool.length === 0) {
      return res.status(404).json({ success: false, error: "No questions found for selected filters" });
    }

    const targetCount = Math.max(5, Math.min(100, Number(count || 25)));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));

    return res.json({
      success: true,
      total: selected.length,
      items: selected
    });
  } catch (error) {
    console.error("/api/questions/mocks/generate POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/admin/upsert", (req, res) => {
  try {
    const adminKey = String(process.env.ADMIN_API_KEY || "").trim();
    if (!adminKey) {
      return res.status(403).json({ success: false, error: "Admin key not configured" });
    }

    const incomingKey = String(req.headers["x-admin-key"] || "").trim();
    if (!incomingKey || incomingKey !== adminKey) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const payload = req.body || {};
    const list = Array.isArray(payload.items) ? payload.items : [payload.item || payload];

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ success: false, error: "No items provided" });
    }

    const bank = readBank();
    const byId = new Map(bank.questions.map((q) => [q.id, q]));

    for (const raw of list) {
      const sanitized = sanitizeQuestion(raw);
      if (sanitized.error) {
        return res.status(400).json({ success: false, error: sanitized.error });
      }
      byId.set(sanitized.id, { ...byId.get(sanitized.id), ...sanitized });
    }

    const next = writeBank({ questions: [...byId.values()] });

    return res.json({
      success: true,
      updatedAt: next.updatedAt,
      total: next.questions.length
    });
  } catch (error) {
    console.error("/api/questions/admin/upsert POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
