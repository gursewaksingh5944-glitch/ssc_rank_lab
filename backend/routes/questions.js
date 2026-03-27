const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

let multerLib = null;
let pdfParseLib = null;
try {
  // Optional dependency. Route still works without it for manual upserts.
  multerLib = require("multer");
} catch (err) {
  multerLib = null;
}

try {
  // Optional dependency. Used for direct PDF text extraction.
  pdfParseLib = require("pdf-parse");
} catch (err) {
  pdfParseLib = null;
}

const upload = multerLib
  ? multerLib({ storage: multerLib.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })
  : null;

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "question-bank.json");

const MOCK_BLUEPRINTS = {
  tier1: {
    total: 100,
    distribution: {
      quant: 25,
      reasoning: 25,
      english: 25,
      gk: 25
    }
  },
  tier2: {
    total: 130,
    distribution: {
      quant: 35,
      reasoning: 30,
      english: 30,
      gk: 20,
      computer: 15
    }
  }
};

const VALID_DIFFICULTY = new Set(["easy", "medium", "hard"]);
const VALID_TIER = new Set(["tier1", "tier2"]);
const VALID_MODE = new Set(["objective", "subjective"]);
const VALID_REVIEW_STATUS = new Set(["approved", "needs_review", "rejected"]);

const PARSER_PRESETS = {
  standard: {
    question: /^\s*(\d{1,4})[\).:-]?\s+(.+)$/,
    option: /^[\[(]?([A-Da-d])[\])\.:\-]?\s+(.+)$/,
    answer: /^(?:ans(?:wer)?|correct\s*answer)\s*[:\-]?\s*([A-Da-d1-4])\b/i,
    explanation: /^(?:explanation|solution)\s*[:\-]?\s*(.+)$/i
  },
  coaching: {
    question: /^\s*(?:q(?:uestion)?\s*)?(\d{1,4})[\).:-]?\s+(.+)$/i,
    option: /^[\[(]?([A-Da-d1-4])[\])\.:\-]?\s+(.+)$/,
    answer: /^(?:ans(?:wer)?|correct\s*answer|right\s*answer)\s*[:\-]?\s*([A-Da-d1-4])\b/i,
    explanation: /^(?:explanation|solution|sol\.)\s*[:\-]?\s*(.+)$/i
  }
};

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

function normalizeTier(value) {
  const raw = normalize(value).replace(/[^a-z0-9]/g, "");
  if (raw === "1" || raw === "tier1" || raw === "t1") return "tier1";
  if (raw === "2" || raw === "tier2" || raw === "t2") return "tier2";
  return "";
}

function normalizeQuestionMode(value) {
  const mode = normalize(value);
  if (mode === "subjective" || mode === "written") return "subjective";
  return "objective";
}

function normalizeSubject(value) {
  const subject = normalize(value);
  if (subject === "ga" || subject === "general awareness") return "gk";
  if (subject === "math" || subject === "mathematics") return "quant";
  return subject;
}

function toInt(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed);
}

function toBool(value, fallback = false) {
  const raw = normalize(value);
  if (!raw) return fallback;
  if (["1", "true", "yes", "y", "on"].includes(raw)) return true;
  if (["0", "false", "no", "n", "off"].includes(raw)) return false;
  return fallback;
}

function maybeUploadSingle(req, res, next) {
  if (!upload) {
    return next();
  }
  return upload.single("file")(req, res, next);
}

function requireAdminAccess(req, res) {
  const adminKey = String(process.env.ADMIN_API_KEY || "").trim();
  if (!adminKey) {
    res.status(403).json({ success: false, error: "Admin key not configured" });
    return false;
  }

  const incomingKey = String(req.headers["x-admin-key"] || "").trim();
  if (!incomingKey || incomingKey !== adminKey) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return false;
  }

  return true;
}

function parseAnswerToken(token) {
  const raw = String(token || "").trim().toUpperCase();
  if (!raw) return -1;
  if (["A", "B", "C", "D"].includes(raw)) return raw.charCodeAt(0) - 65;
  if (["1", "2", "3", "4"].includes(raw)) return Number(raw) - 1;
  return -1;
}

function getParserPreset(name) {
  const normalized = normalize(name) || "standard";
  return PARSER_PRESETS[normalized] || PARSER_PRESETS.standard;
}

function questionFingerprint(input = {}) {
  const qText = normalize(input.question || "").replace(/[^a-z0-9]+/g, " ").trim();
  const subject = normalizeSubject(input.subject || "");
  const topic = normalize(input.topic || "");
  const tier = normalizeTier(input.tier || "") || "tier1";
  const options = Array.isArray(input.options)
    ? input.options.map((item) => normalize(item).replace(/[^a-z0-9]+/g, " ").trim())
    : [];

  const payload = [subject, topic, tier, qText, ...options].join("|");
  return crypto.createHash("sha1").update(payload).digest("hex");
}

function ensureUniqueIds(items = []) {
  const seen = new Set();
  return items.map((item) => {
    const rawId = String(item.id || "").trim() || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    if (!seen.has(rawId)) {
      seen.add(rawId);
      return { ...item, id: rawId };
    }

    let index = 1;
    let nextId = `${rawId}_${index}`;
    while (seen.has(nextId)) {
      index += 1;
      nextId = `${rawId}_${index}`;
    }
    seen.add(nextId);
    return { ...item, id: nextId };
  });
}

function buildReviewAudit({ decision, reviewedBy, rejectReason, reviewedAt }) {
  return {
    reviewedAt: reviewedAt || new Date().toISOString(),
    reviewedBy: String(reviewedBy || "system_admin").trim().slice(0, 80),
    decision,
    rejectReason: decision === "reject" ? String(rejectReason || "").trim().slice(0, 500) : ""
  };
}

function applyReviewDecision(question, { decision, reviewedBy, rejectReason, reviewedAt }) {
  const audit = buildReviewAudit({ decision, reviewedBy, rejectReason, reviewedAt });
  return {
    ...question,
    reviewStatus: decision === "approve" ? "approved" : "rejected",
    reviewAudit: audit,
    updatedAt: audit.reviewedAt
  };
}

function parseQuestionsFromText(rawText = "", defaults = {}) {
  const preset = getParserPreset(defaults.parserPreset);
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const items = [];
  let current = null;

  const finalizeCurrent = () => {
    if (!current) return;
    current.question = String(current.question || "").trim();
    current.options = Array.isArray(current.options) ? current.options.filter(Boolean) : [];

    if (current.question && current.options.length >= 2) {
      items.push(current);
    }
    current = null;
  };

  for (const line of lines) {
    const questionMatch = line.match(preset.question);
    const optionMatch = line.match(preset.option);
    const answerMatch = line.match(preset.answer);
    const explanationMatch = line.match(preset.explanation);

    if (questionMatch) {
      finalizeCurrent();
      current = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: "question",
        examFamily: normalize(defaults.examFamily) || "ssc",
        subject: normalizeSubject(defaults.subject),
        difficulty: normalize(defaults.difficulty) || "medium",
        topic: String(defaults.topic || "Imported Topic").trim(),
        tier: normalizeTier(defaults.tier) || "tier1",
        questionMode: normalizeQuestionMode(defaults.questionMode),
        question: String(questionMatch[2] || "").trim(),
        options: [],
        answerIndex: -1,
        explanation: "",
        marks: Number(defaults.marks || 2),
        negativeMarks: Number(defaults.negativeMarks || 0.5),
        source: {
          kind: "pdf",
          fileName: String(defaults.fileName || "").trim(),
          importedAt: new Date().toISOString()
        },
        isChallengeCandidate: Boolean(defaults.isChallengeCandidate),
        confidenceScore: 0
      };
      continue;
    }

    if (!current) {
      continue;
    }

    if (optionMatch) {
      current.options.push(String(optionMatch[2] || "").trim());
      continue;
    }

    if (answerMatch) {
      current.answerIndex = parseAnswerToken(answerMatch[1]);
      continue;
    }

    if (explanationMatch) {
      current.explanation = String(explanationMatch[1] || "").trim();
      continue;
    }

    // Join wrapped question text from broken PDF lines.
    if (current.options.length === 0) {
      current.question = `${current.question} ${line}`.trim();
    }
  }

  finalizeCurrent();

  return items.map((item) => {
    let confidence = 0.25;
    if (item.options.length >= 4) confidence += 0.35;
    if (item.answerIndex >= 0 && item.answerIndex < item.options.length) confidence += 0.3;
    if (item.question.length > 15) confidence += 0.1;
    item.confidenceScore = Number(Math.min(1, confidence).toFixed(2));

    if (item.answerIndex < 0 || item.answerIndex >= item.options.length) {
      item.answerIndex = 0;
    }

    return item;
  });
}

function seededRng(seedText) {
  let state = crypto.createHash("sha256").update(String(seedText || "seed")).digest().readUInt32LE(0) || 1;
  return function next() {
    state = (1664525 * state + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function shuffleWithRandom(input, randomFn = Math.random) {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function pickRandomUnique(input, count, randomFn = Math.random) {
  return shuffleWithRandom(input, randomFn).slice(0, Math.max(0, count));
}

function sanitizeQuestion(input) {
  const type = normalize(input.type) || "question";
  const examFamily = normalize(input.examFamily) || "ssc";
  const subject = normalizeSubject(input.subject);
  const difficulty = normalize(input.difficulty);
  const topic = String(input.topic || "").trim();
  const question = String(input.question || "").trim();
  const options = Array.isArray(input.options) ? input.options.map((o) => String(o || "").trim()).filter(Boolean) : [];
  const answerIndex = Number(input.answerIndex);
  const explanation = String(input.explanation || "").trim();
  const tier = normalizeTier(input.tier) || "tier1";
  const questionMode = normalizeQuestionMode(input.questionMode);
  const isChallengeCandidate = Boolean(input.isChallengeCandidate);
  const confidenceScore = Number(input.confidenceScore || 0);
  const reviewStatusRaw = normalize(input.reviewStatus) || "approved";
  const reviewStatus = VALID_REVIEW_STATUS.has(reviewStatusRaw) ? reviewStatusRaw : "approved";

  if (!["question", "mock"].includes(type)) {
    return { error: "Invalid type" };
  }

  if (!subject || !topic || !question) {
    return { error: "subject, topic, question are required" };
  }

  if (!VALID_DIFFICULTY.has(difficulty)) {
    return { error: "difficulty must be easy, medium, or hard" };
  }

  if (!VALID_TIER.has(tier)) {
    return { error: "tier must be tier1 or tier2" };
  }

  if (!VALID_MODE.has(questionMode)) {
    return { error: "questionMode must be objective or subjective" };
  }

  if (questionMode === "objective" && options.length < 2) {
    return { error: "At least 2 options required for objective questions" };
  }

  if (questionMode === "objective" && (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length)) {
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
    tier,
    questionMode,
    topic,
    question,
    options,
    answerIndex: questionMode === "objective" ? answerIndex : -1,
    explanation,
    marks: Number(input.marks || (tier === "tier2" ? 3 : 2)),
    negativeMarks: Number(input.negativeMarks || (tier === "tier2" ? 1 : 0.5)),
    isChallengeCandidate,
    confidenceScore: Number.isFinite(confidenceScore) ? Number(confidenceScore.toFixed(2)) : 0,
    reviewStatus,
    source: input.source && typeof input.source === "object" ? input.source : { kind: "manual" },
    createdAt: String(input.createdAt || now),
    updatedAt: now
  };
}

function filterQuestions(all, query) {
  const subject = normalizeSubject(query.subject);
  const difficulty = normalize(query.difficulty);
  const topic = normalize(query.topic);
  const examFamily = normalize(query.examFamily);
  const type = normalize(query.type);
  const tier = normalizeTier(query.tier);
  const questionMode = normalize(query.questionMode);
  const challengeOnly = String(query.challengeOnly || "").trim() === "true";
  const includeUnreviewed = String(query.includeUnreviewed || "").trim() === "true";

  let results = [...all];

  if (subject) results = results.filter((q) => q.subject === subject);
  if (difficulty) results = results.filter((q) => q.difficulty === difficulty);
  if (tier) results = results.filter((q) => q.tier === tier);
  if (questionMode) results = results.filter((q) => q.questionMode === questionMode);
  if (examFamily) results = results.filter((q) => q.examFamily === examFamily);
  if (type) results = results.filter((q) => q.type === type);
  if (topic) results = results.filter((q) => normalize(q.topic).includes(topic));
  if (challengeOnly) results = results.filter((q) => q.isChallengeCandidate || q.difficulty === "hard");
  if (!includeUnreviewed) results = results.filter((q) => String(q.reviewStatus || "approved") === "approved");

  const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
  return results.slice(0, limit);
}

function buildMockByTier(pool, tier, randomFn) {
  const blueprint = MOCK_BLUEPRINTS[tier] || MOCK_BLUEPRINTS.tier1;
  const selected = [];
  const picked = new Set();

  for (const [subject, count] of Object.entries(blueprint.distribution)) {
    const subjectPool = pool.filter((q) => q.subject === subject && !picked.has(q.id));
    const picks = pickRandomUnique(subjectPool, count, randomFn);
    picks.forEach((item) => {
      picked.add(item.id);
      selected.push(item);
    });
  }

  if (selected.length < blueprint.total) {
    const remain = pool.filter((q) => !picked.has(q.id));
    const backfill = pickRandomUnique(remain, blueprint.total - selected.length, randomFn);
    selected.push(...backfill);
  }

  return {
    requested: blueprint.total,
    selected: shuffleWithRandom(selected, randomFn)
  };
}

function generateQuestionSet(bank, payload = {}) {
  const mode = normalize(payload.mode) || "practice";
  const tier = normalizeTier(payload.tier) || "tier1";
  const scope = normalize(payload.scope) || "overall";
  const examFamily = normalize(payload.examFamily) || "ssc";
  const questionMode = normalize(payload.questionMode);
  const difficulty = normalize(payload.difficulty);
  const challengeCount = Math.max(1, Math.min(10, toInt(payload.challengeCount, 5)));
  const practiceCount = Math.max(5, Math.min(100, toInt(payload.count, 30)));
  const requestedSubjects = Array.isArray(payload.subjects)
    ? payload.subjects.map(normalizeSubject).filter(Boolean)
    : [];
  const includeUnreviewed = String(payload.includeUnreviewed || "").trim() === "true";
  const recentQuestionIds = new Set(
    Array.isArray(payload.recentQuestionIds)
      ? payload.recentQuestionIds.map((item) => String(item || "").trim()).filter(Boolean)
      : []
  );

  let pool = bank.questions.filter((q) => q.type === "question" && q.examFamily === examFamily);
  pool = pool.filter((q) => q.tier === tier);
  if (!includeUnreviewed) {
    pool = pool.filter((q) => String(q.reviewStatus || "approved") === "approved");
  }

  if (questionMode && questionMode !== "any") {
    pool = pool.filter((q) => q.questionMode === questionMode);
  }

  if (difficulty && difficulty !== "any") {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  if (scope === "selective" && requestedSubjects.length > 0) {
    pool = pool.filter((q) => requestedSubjects.includes(q.subject));
  }

  const fallbackPool = [...pool];
  if (recentQuestionIds.size > 0) {
    pool = pool.filter((q) => !recentQuestionIds.has(String(q.id || "").trim()));
    if (pool.length === 0) {
      pool = fallbackPool;
    }
  }

  if (mode === "challenge") {
    const challengePool = pool.filter((q) => q.isChallengeCandidate || q.difficulty === "hard");
    const seed = payload.seed || new Date().toISOString().slice(0, 10);
    const rng = seededRng(`daily-challenge-${tier}-${seed}`);
    let selected = pickRandomUnique(challengePool, challengeCount, rng);
    if (selected.length < challengeCount) {
      const extraPool = fallbackPool.filter((q) => (q.isChallengeCandidate || q.difficulty === "hard") && !selected.some((x) => x.id === q.id));
      selected = [...selected, ...pickRandomUnique(extraPool, challengeCount - selected.length, rng)];
    }
    return {
      mode,
      tier,
      requested: challengeCount,
      served: selected.length,
      seed,
      items: selected,
      excludedRecentCount: recentQuestionIds.size
    };
  }

  const rng = Math.random;
  if (mode === "mock") {
    let built = buildMockByTier(pool, tier, rng);
    if (built.selected.length < built.requested && fallbackPool.length > pool.length) {
      built = buildMockByTier(fallbackPool, tier, rng);
    }
    return {
      mode,
      tier,
      requested: built.requested,
      served: built.selected.length,
      pattern: MOCK_BLUEPRINTS[tier],
      items: built.selected,
      excludedRecentCount: recentQuestionIds.size
    };
  }

  let selected = pickRandomUnique(pool, practiceCount, rng);
  if (selected.length < practiceCount && fallbackPool.length > pool.length) {
    const needed = practiceCount - selected.length;
    const extra = fallbackPool.filter((q) => !selected.some((s) => s.id === q.id));
    selected = [...selected, ...pickRandomUnique(extra, needed, rng)];
  }
  return {
    mode,
    tier,
    requested: practiceCount,
    served: selected.length,
    items: selected,
    excludedRecentCount: recentQuestionIds.size
  };
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
    const tiers = [...new Set(bank.questions.map((q) => q.tier))].filter(Boolean).sort();
    const difficulties = [...new Set(bank.questions.map((q) => q.difficulty))].filter(Boolean).sort();
    const questionModes = [...new Set(bank.questions.map((q) => q.questionMode))].filter(Boolean).sort();

    return res.json({
      success: true,
      updatedAt: bank.updatedAt,
      subjects,
      topics,
      tiers,
      difficulties,
      questionModes,
      total: bank.questions.length
    });
  } catch (error) {
    console.error("/api/questions/meta GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/generate", (req, res) => {
  try {
    const bank = readBank();
    const generated = generateQuestionSet(bank, req.body || {});

    return res.json({
      success: true,
      ...generated
    });
  } catch (error) {
    console.error("/api/questions/generate POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/mocks/generate", (req, res) => {
  try {
    const bank = readBank();
    const generated = generateQuestionSet(bank, {
      ...(req.body || {}),
      mode: "mock",
      tier: req.body?.tier || "tier1"
    });

    return res.json({
      success: true,
      ...generated
    });
  } catch (error) {
    console.error("/api/questions/mocks/generate POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/admin/import-pdf", maybeUploadSingle, async (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    if (!pdfParseLib) {
      return res.status(400).json({
        success: false,
        error: "PDF parser dependency missing. Install pdf-parse to use PDF ingestion."
      });
    }

    const fileBuffer = req.file?.buffer;
    const fileName = req.file?.originalname || "";
    const base64Payload = String(req.body?.pdfBase64 || "").trim();
    const pdfBuffer = fileBuffer || (base64Payload ? Buffer.from(base64Payload, "base64") : null);

    if (!pdfBuffer) {
      return res.status(400).json({
        success: false,
        error: "Provide PDF file as multipart 'file' or body.pdfBase64"
      });
    }

    const parsed = await pdfParseLib(pdfBuffer);
    const defaults = {
      examFamily: req.body.examFamily || "ssc",
      subject: req.body.subject || "",
      difficulty: req.body.difficulty || "medium",
      topic: req.body.topic || "Imported Topic",
      tier: req.body.tier || "tier1",
      questionMode: req.body.questionMode || "objective",
      parserPreset: req.body.parserPreset || "standard",
      marks: req.body.marks || undefined,
      negativeMarks: req.body.negativeMarks || undefined,
      isChallengeCandidate: String(req.body.isChallengeCandidate || "").trim() === "true",
      fileName
    };
    const reviewThreshold = Number.isFinite(Number(req.body.reviewThreshold))
      ? Number(req.body.reviewThreshold)
      : 0.65;
    const autoApprove = String(req.body.autoApprove || "").trim() === "true";

    const extracted = parseQuestionsFromText(parsed.text || "", defaults);
    if (extracted.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No parseable questions found in PDF. Try cleaner source or manual upsert for this file."
      });
    }

    const bank = readBank();
    const byId = new Map(bank.questions.map((q) => [q.id, q]));
    const existingFingerprints = new Set(bank.questions.map((item) => questionFingerprint(item)));
    const batchFingerprints = new Set();
    let accepted = 0;
    let queuedForReview = 0;
    const warnings = [];

    extracted.forEach((raw, index) => {
      const sanitized = sanitizeQuestion(raw);
      if (sanitized.error) {
        warnings.push({ row: index + 1, error: sanitized.error });
        return;
      }

      const fingerprint = questionFingerprint(sanitized);
      if (existingFingerprints.has(fingerprint) || batchFingerprints.has(fingerprint)) {
        warnings.push({ row: index + 1, error: "Duplicate question skipped" });
        return;
      }

      sanitized.reviewStatus = autoApprove
        ? "approved"
        : (Number(sanitized.confidenceScore || 0) < reviewThreshold ? "needs_review" : "approved");
      if (sanitized.reviewStatus === "needs_review") {
        queuedForReview += 1;
      }

      batchFingerprints.add(fingerprint);

      byId.set(sanitized.id, { ...byId.get(sanitized.id), ...sanitized });
      accepted += 1;
    });

    const next = writeBank({ questions: ensureUniqueIds([...byId.values()]) });

    return res.json({
      success: true,
      imported: accepted,
      queuedForReview,
      warnings,
      updatedAt: next.updatedAt,
      total: next.questions.length
    });
  } catch (error) {
    console.error("/api/questions/admin/import-pdf POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/admin/import-pdf/preview", maybeUploadSingle, async (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    if (!pdfParseLib) {
      return res.status(400).json({
        success: false,
        error: "PDF parser dependency missing. Install pdf-parse to use PDF ingestion."
      });
    }

    const fileBuffer = req.file?.buffer;
    const fileName = req.file?.originalname || "";
    const base64Payload = String(req.body?.pdfBase64 || "").trim();
    const pdfBuffer = fileBuffer || (base64Payload ? Buffer.from(base64Payload, "base64") : null);

    if (!pdfBuffer) {
      return res.status(400).json({
        success: false,
        error: "Provide PDF file as multipart 'file' or body.pdfBase64"
      });
    }

    const parsed = await pdfParseLib(pdfBuffer);
    const defaults = {
      examFamily: req.body.examFamily || "ssc",
      subject: req.body.subject || "",
      difficulty: req.body.difficulty || "medium",
      topic: req.body.topic || "Imported Topic",
      tier: req.body.tier || "tier1",
      questionMode: req.body.questionMode || "objective",
      parserPreset: req.body.parserPreset || "standard",
      fileName
    };

    const extracted = parseQuestionsFromText(parsed.text || "", defaults);
    const preview = extracted.slice(0, Math.max(1, Math.min(20, toInt(req.body.previewCount, 5))));

    return res.json({
      success: true,
      parserPreset: defaults.parserPreset,
      extractedCount: extracted.length,
      preview
    });
  } catch (error) {
    console.error("/api/questions/admin/import-pdf/preview POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/admin/review/list", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const maxConfidence = Number.isFinite(Number(req.query.maxConfidence))
      ? Number(req.query.maxConfidence)
      : 0.7;
    const limit = Math.max(1, Math.min(200, toInt(req.query.limit, 50)));
    const offset = Math.max(0, toInt(req.query.offset, 0));
    const status = normalize(req.query.status) || "needs_review";
    const includeStatuses = status === "all"
      ? new Set(["approved", "needs_review", "rejected"])
      : new Set([status]);

    for (const value of includeStatuses) {
      if (!VALID_REVIEW_STATUS.has(value)) {
        return res.status(400).json({ success: false, error: "status must be approved|needs_review|rejected|all" });
      }
    }

    const bank = readBank();
    const filtered = bank.questions
      .filter((q) => includeStatuses.has(String(q.reviewStatus || "approved")))
      .filter((q) => Number(q.confidenceScore || 0) <= maxConfidence)
      .sort((a, b) => {
        const byConfidence = Number(a.confidenceScore || 0) - Number(b.confidenceScore || 0);
        if (byConfidence !== 0) return byConfidence;
        return String(a.updatedAt || a.createdAt || "").localeCompare(String(b.updatedAt || b.createdAt || ""));
      });
    const items = filtered.slice(offset, offset + limit);

    return res.json({
      success: true,
      status: status === "all" ? "all" : [...includeStatuses][0],
      maxConfidence,
      limit,
      offset,
      totalMatched: filtered.length,
      count: items.length,
      items
    });
  } catch (error) {
    console.error("/api/questions/admin/review/list GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/admin/review/decision", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const id = String(req.body.id || "").trim();
    const decision = normalize(req.body.decision);
    const reviewedBy = String(req.body.reviewedBy || "system_admin").trim().slice(0, 80);
    const rejectReason = String(req.body.rejectReason || "").trim().slice(0, 500);
    const force = toBool(req.body.force, false);

    if (!id || !["approve", "reject"].includes(decision)) {
      return res.status(400).json({ success: false, error: "id and decision(approve|reject) are required" });
    }

    if (decision === "reject" && !rejectReason) {
      return res.status(400).json({ success: false, error: "rejectReason is required when decision is reject" });
    }

    const bank = readBank();
    const index = bank.questions.findIndex((q) => String(q.id || "") === id);
    if (index < 0) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const current = bank.questions[index];
    const currentStatus = String(current.reviewStatus || "approved");
    if (!force && currentStatus !== "needs_review") {
      return res.status(409).json({
        success: false,
        error: "Question is not in needs_review state. Pass force=true to override.",
        currentStatus
      });
    }

    const nowIso = new Date().toISOString();
    bank.questions[index] = applyReviewDecision(current, {
      decision,
      reviewedBy,
      rejectReason,
      reviewedAt: nowIso
    });

    const next = writeBank({ questions: ensureUniqueIds(bank.questions) });
    return res.json({
      success: true,
      id,
      reviewStatus: bank.questions[index].reviewStatus,
      reviewAudit: bank.questions[index].reviewAudit,
      updatedAt: next.updatedAt
    });
  } catch (error) {
    console.error("/api/questions/admin/review/decision POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/admin/upsert", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const payload = req.body || {};
    const list = Array.isArray(payload.items) ? payload.items : [payload.item || payload];

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ success: false, error: "No items provided" });
    }

    const bank = readBank();
    const byId = new Map(bank.questions.map((q) => [q.id, q]));
    const existingFingerprints = new Set(bank.questions.map((item) => questionFingerprint(item)));

    for (const raw of list) {
      const sanitized = sanitizeQuestion(raw);
      if (sanitized.error) {
        return res.status(400).json({ success: false, error: sanitized.error });
      }

      const fingerprint = questionFingerprint(sanitized);
      const existing = byId.get(sanitized.id);
      const existingFingerprint = existing ? questionFingerprint(existing) : "";
      if (existingFingerprints.has(fingerprint) && fingerprint !== existingFingerprint) {
        return res.status(400).json({ success: false, error: "Duplicate question detected" });
      }

      existingFingerprints.add(fingerprint);
      byId.set(sanitized.id, { ...byId.get(sanitized.id), ...sanitized });
    }

    const next = writeBank({ questions: ensureUniqueIds([...byId.values()]) });

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

router.post("/admin/review/bulk-decision", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const ids = Array.isArray(req.body.ids)
      ? req.body.ids.map((v) => String(v || "").trim()).filter(Boolean)
      : [];
    const decision = normalize(req.body.decision);
    const reviewedBy = String(req.body.reviewedBy || "system_admin").trim().slice(0, 80);
    const rejectReason = String(req.body.rejectReason || "").trim().slice(0, 500);
    const force = toBool(req.body.force, false);

    if (!ids.length || !["approve", "reject"].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: "ids(array) and decision(approve|reject) are required"
      });
    }

    if (decision === "reject" && !rejectReason) {
      return res.status(400).json({ success: false, error: "rejectReason is required when decision is reject" });
    }

    const idSet = new Set(ids);
    const now = new Date().toISOString();

    const bank = readBank();
    const existingIds = new Set(bank.questions.map((q) => String(q.id || "")));
    let updated = 0;
    let skipped = 0;
    const skippedIds = [];
    const nextQuestions = bank.questions.map((q) => {
      const id = String(q.id || "");
      if (!idSet.has(id)) return q;

      const currentStatus = String(q.reviewStatus || "approved");
      if (!force && currentStatus !== "needs_review") {
        skipped += 1;
        if (skippedIds.length < 50) skippedIds.push(id);
        return q;
      }

      updated += 1;
      return applyReviewDecision(q, {
        decision,
        reviewedBy,
        rejectReason,
        reviewedAt: now
      });
    });

    writeBank({ questions: ensureUniqueIds(nextQuestions) });

  const notFoundIds = ids.filter((id) => !existingIds.has(id)).slice(0, 50);
  const notFoundCount = ids.filter((id) => !existingIds.has(id)).length;
    const reviewStatus = decision === "approve" ? "approved" : "rejected";

    return res.json({
      success: true,
      requested: ids.length,
      updated,
      skipped,
      skippedIds,
      notFoundCount,
      notFoundIds,
      reviewedBy,
      reviewStatus
    });
  } catch (error) {
    console.error("/api/questions/admin/review/bulk-decision POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/admin/review/stats", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const bank = readBank();
    const summary = { approved: 0, needs_review: 0, rejected: 0, unknown: 0 };

    for (const q of bank.questions) {
      const status = String(q.reviewStatus || "approved");
      if (status === "approved") summary.approved += 1;
      else if (status === "needs_review") summary.needs_review += 1;
      else if (status === "rejected") summary.rejected += 1;
      else summary.unknown += 1;
    }

    return res.json({ success: true, total: bank.questions.length, summary });
  } catch (error) {
    console.error("/api/questions/admin/review/stats GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
