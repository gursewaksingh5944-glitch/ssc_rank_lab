const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

let multerLib = null;
let pdfParseLib = null;
let pdfParseClass = null;
let tesseractRecognize = null;
try {
  // Optional dependency. Route still works without it for manual upserts.
  multerLib = require("multer");
} catch (err) {
  multerLib = null;
}

try {
  // Optional dependency. Used for direct PDF text extraction.
  const pdfParseModule = require("pdf-parse");
  if (typeof pdfParseModule === "function") {
    pdfParseLib = pdfParseModule;
  } else if (pdfParseModule && typeof pdfParseModule.PDFParse === "function") {
    pdfParseClass = pdfParseModule.PDFParse;
  }
} catch (err) {
  pdfParseLib = null;
  pdfParseClass = null;
}

try {
  const tesseractModule = require("tesseract.js");
  tesseractRecognize = typeof tesseractModule.recognize === "function" ? tesseractModule.recognize : null;
} catch (err) {
  tesseractRecognize = null;
}

const upload = multerLib
  ? multerLib({ storage: multerLib.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })
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
      quant: 30,
      reasoning: 30,
      english: 45,
      gk: 25
    }
  }
};

// Real SSC CGL exam section order
const SECTION_ORDER = ["quant", "reasoning", "english", "gk"];

// Source hint: Testbook SSC CGL topic-wise weightage (Tier 1, 2025 trend ranges).
// Midpoint weights are used to keep topic proportions realistic during auto-mock generation.
const SSC_CGL_TOPIC_WEIGHTAGE = {
  quant: {
    Geometry: 3,
    Mensuration: 3,
    Trigonometry: 2.5,
    "Profit & Loss": 2,
    Algebra: 1.5,
    "Number System": 1.5,
    "Time & Work": 1.5,
    "Time & Distance": 1.5,
    "Ratio & Proportion": 1,
    "Simple & Compound Interest": 1,
    Percentage: 0.5,
    Average: 1,
    Simplification: 1,
    Arithmetic: 2
  },
  english: {
    "Cloze Test": 4,
    "Active Passive": 3,
    "Direct Indirect": 3,
    Vocabulary: 3,
    "Fill in the Blanks": 2.5,
    Spelling: 2.5,
    Idioms: 1.5,
    "Para Jumbles": 1.5,
    "One Word Substitution": 1,
    "Sentence Completion": 0.5,
    "Error Detection": 2,
    Grammar: 2,
    English: 2
  },
  reasoning: {
    "Coding-Decoding": 3,
    Analogy: 2,
    "Number Series": 2,
    Classification: 1.5,
    Syllogism: 1.5,
    "Blood Relation": 1.5,
    "Venn Diagram": 1,
    "Seating Arrangement": 1,
    "Arithmetic Reasoning": 1,
    Reasoning: 2
  },
  gk: {
    "Current Affairs": 3.5,
    Economy: 3,
    History: 3,
    Polity: 2,
    Geography: 1.5,
    Chemistry: 1.5,
    Biology: 1,
    Physics: 1,
    Science: 1,
    "Static GK": 2,
    GK: 1.5
  },
  computer: {
    "Computer Fundamentals": 4,
    "Internet": 2,
    "Networking": 2,
    "Database": 1.5,
    "MS Office": 2,
    "Operating Systems": 2,
    "Programming": 1.5
  }
};

const TOPIC_ALIASES = {
  quant: {
    "profit loss": "Profit & Loss",
    "profit and loss": "Profit & Loss",
    "profit, loss & discount": "Profit & Loss",
    "si ci": "Simple & Compound Interest",
    "simple interest": "Simple & Compound Interest",
    "compound interest": "Simple & Compound Interest",
    "ci & si": "Simple & Compound Interest",
    "time distance": "Time & Distance",
    "speed time distance": "Time & Distance",
    "speed of train": "Time & Distance",
    "boat stream": "Time & Distance",
    "boats and streams": "Time & Distance",
    "time work": "Time & Work",
    "ratio proportion": "Ratio & Proportion",
    "percentages": "Percentage",
    "number system": "Number System",
    "data interpretation": "Data Interpretation",
    "geometry": "Geometry",
    "trigonometry": "Trigonometry",
    "mensuration": "Mensuration",
    "algebra": "Algebra",
    "average": "Average",
    "simplification": "Simplification",
    "arithmetic": "Arithmetic"
  },
  english: {
    "synonym": "Vocabulary",
    "synonyms": "Vocabulary",
    "antonym": "Vocabulary",
    "antonyms": "Vocabulary",
    "vocabulary": "Vocabulary",
    "cloze test": "Cloze Test",
    "fill in the blanks": "Fill in the Blanks",
    "one word substitution": "One Word Substitution",
    "direct indirect": "Direct Indirect",
    "active passive": "Active Passive",
    "error spotting": "Error Detection",
    "error detection": "Error Detection",
    "para jumbles": "Para Jumbles",
    "idioms": "Idioms",
    "spelling": "Spelling",
    "grammar": "Grammar",
    "sentence completion": "Sentence Completion",
    "english": "English"
  },
  reasoning: {
    "coding decoding": "Coding-Decoding",
    "analogy": "Analogy",
    "number series": "Number Series",
    "series": "Number Series",
    "blood relations": "Blood Relation",
    "blood relation": "Blood Relation",
    "venn diagram": "Venn Diagram",
    "seating arrangement": "Seating Arrangement",
    "arithmetic reasoning": "Arithmetic Reasoning",
    "reasoning": "Reasoning"
  },
  gk: {
    "current affairs": "Current Affairs",
    "economy": "Economy",
    "history": "History",
    "polity": "Polity",
    "geography": "Geography",
    "chemistry": "Chemistry",
    "biology": "Biology",
    "physics": "Physics",
    "science": "Science",
    "gk": "GK",
    "general awareness": "GK",
    "static gk": "Static GK"
  },
  computer: {
    "computer fundamentals": "Computer Fundamentals",
    "computer basics": "Computer Fundamentals",
    "internet": "Internet",
    "networking": "Networking",
    "network": "Networking",
    "database": "Database",
    "dbms": "Database",
    "ms office": "MS Office",
    "microsoft office": "MS Office",
    "operating systems": "Operating Systems",
    "os": "Operating Systems",
    "programming": "Programming"
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

// ── CACHE DISABLED: Always re-read question bank to avoid stale data ──
// let _qbCache = null;
// let _qbMtime = 0;

function readBank() {
  ensureFile();

  try {
    // CACHE DISABLED - always re-read from disk
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    const result = { updatedAt: parsed.updatedAt || null, questions };
    return result;
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
  // CACHE DISABLED - no invalidation needed, always re-reads on next request
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
  if (!incomingKey || incomingKey.length !== adminKey.length ||
      !crypto.timingSafeEqual(Buffer.from(incomingKey), Buffer.from(adminKey))) {
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

function cleanOcrLine(line = "") {
  return String(line || "")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAlphaLine(line = "") {
  return cleanOcrLine(line).replace(/[^A-Za-z0-9%()/:?.,'+\- ]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseQuestionsFromSscOcrText(rawText = "", defaults = {}) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => normalizeAlphaLine(line))
    .filter(Boolean);

  const questionStartRx = /^Q\s*\.?\s*No\s*[:\-. ]*\d+/i;
  const questionAltRx = /^Q\s*\.?\s*\d+[\).:-]?/i;
  const markers = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (questionStartRx.test(lines[i]) || questionAltRx.test(lines[i])) {
      markers.push(i);
    }
  }

  if (markers.length === 0) return [];

  const out = [];
  const isPYQ = Boolean(defaults.isPYQ);
  const parsedYear = toInt(defaults.year, 0);
  const normalizedYear = parsedYear >= 2000 && parsedYear <= 2030 ? parsedYear : null;
  const frequency = Math.max(1, Math.min(20, toInt(defaults.frequency, 1)));
  const subtopic = String(defaults.subtopic || "").trim().slice(0, 100) || null;

  for (let m = 0; m < markers.length; m += 1) {
    const start = markers[m];
    const end = m + 1 < markers.length ? markers[m + 1] : lines.length;
    const block = lines.slice(start, end).filter(Boolean);
    if (block.length < 2) continue;

    const content = block.slice(1).filter((line) => !/^PART[- ]/i.test(line));
    if (content.length === 0) continue;

    const questionBits = [];
    for (const line of content) {
      if (line.length < 8) continue;
      questionBits.push(line);
      if (line.includes("?")) break;
      if (questionBits.length >= 3) break;
    }

    let questionText = questionBits.join(" ").trim();
    if (!questionText) {
      questionText = content.slice(0, 2).join(" ").trim();
    }
    if (!questionText || questionText.length < 15) continue;

    const tailCandidates = [];
    for (let i = content.length - 1; i >= 0; i -= 1) {
      const line = content[i];
      if (!line || /^Q\s*\.?\s*/i.test(line)) continue;
      if (line.length > 42) continue;
      const words = line.split(/\s+/).filter(Boolean);
      if (words.length > 6) continue;
      if (!/[A-Za-z]/.test(line)) continue;
      if (/following question|given alternatives|select/i.test(line)) continue;
      tailCandidates.push(line);
      if (tailCandidates.length >= 8) break;
    }

    const uniqueOptions = [];
    const seen = new Set();
    for (const option of tailCandidates.reverse()) {
      const key = normalize(option);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniqueOptions.push(option);
      if (uniqueOptions.length >= 4) break;
    }

    if (uniqueOptions.length < 2) continue;

    out.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: "question",
      examFamily: normalize(defaults.examFamily) || "ssc",
      subject: normalizeSubject(defaults.subject),
      difficulty: normalize(defaults.difficulty) || "medium",
      topic: String(defaults.topic || "Imported Topic").trim(),
      tier: normalizeTier(defaults.tier) || "tier1",
      questionMode: normalizeQuestionMode(defaults.questionMode),
      question: questionText,
      options: uniqueOptions,
      answerIndex: 0,
      explanation: "",
      marks: Number(defaults.marks || 2),
      negativeMarks: Number(defaults.negativeMarks || 0.5),
      source: {
        kind: String(defaults.sourceKind || "pdf").trim() || "pdf",
        fileName: String(defaults.fileName || "").trim(),
        importedAt: new Date().toISOString()
      },
      isChallengeCandidate: Boolean(defaults.isChallengeCandidate),
      confidenceScore: 0.4,
      isPYQ,
      year: isPYQ ? normalizedYear : null,
      frequency: isPYQ ? frequency : 1,
      subtopic
    });
  }

  return out;
}

function parseQuestionsFromText(rawText = "", defaults = {}) {
  const preset = getParserPreset(defaults.parserPreset);
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const items = [];
  let current = null;
  const isPYQ = Boolean(defaults.isPYQ);
  const parsedYear = toInt(defaults.year, 0);
  const normalizedYear = parsedYear >= 2000 && parsedYear <= 2030 ? parsedYear : null;
  const frequency = Math.max(1, Math.min(20, toInt(defaults.frequency, 1)));
  const subtopic = String(defaults.subtopic || "").trim().slice(0, 100) || null;

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
          kind: String(defaults.sourceKind || "pdf").trim() || "pdf",
          fileName: String(defaults.fileName || "").trim(),
          importedAt: new Date().toISOString()
        },
        isChallengeCandidate: Boolean(defaults.isChallengeCandidate),
        confidenceScore: 0,
        isPYQ,
        year: isPYQ ? normalizedYear : null,
        frequency: isPYQ ? frequency : 1,
        subtopic
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

  if (items.length === 0) {
    const maybeOcrBlockItems = parseQuestionsFromSscOcrText(rawText, defaults);
    if (maybeOcrBlockItems.length > 0) {
      return maybeOcrBlockItems;
    }
  }

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

function isLikelyScannedPdfText(rawText = "", totalPages = 0) {
  const text = String(rawText || "");
  const stripped = text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const minLength = Math.max(200, Number(totalPages || 0) * 20);
  return stripped.length < minLength;
}

async function extractPdfText(pdfBuffer, options = {}) {
  if (!pdfParseLib && !pdfParseClass) {
    throw new Error("PDF parser dependency missing. Install pdf-parse to use PDF ingestion.");
  }

  let text = "";
  let totalPages = 0;
  let source = "pdf-text";

  if (pdfParseLib) {
    const parsed = await pdfParseLib(pdfBuffer);
    text = String(parsed?.text || "");
    totalPages = Number(parsed?.numpages || 0);
  } else {
    const parser = new pdfParseClass({ data: pdfBuffer });
    try {
      const parsed = await parser.getText();
      text = String(parsed?.text || "");
      totalPages = Number(parsed?.total || 0);
    } finally {
      await parser.destroy();
    }
  }

  const useOCR = toBool(options.useOCR, false);
  if (useOCR && isLikelyScannedPdfText(text, totalPages)) {
    if (!pdfParseClass || !tesseractRecognize) {
      return { text, totalPages, source: "pdf-text", ocrUsed: false, warning: "OCR fallback unavailable" };
    }

    const pageLimit = Math.max(1, Math.min(80, toInt(options.ocrPageLimit, 20)));
    const pageStart = Math.max(1, toInt(options.ocrPageStart, 1));
    const pageEnd = Math.min(totalPages || pageLimit, pageStart + pageLimit - 1);
    const pages = [];
    for (let p = pageStart; p <= pageEnd; p += 1) pages.push(p);

    const parser = new pdfParseClass({ data: pdfBuffer });
    try {
      const shots = await parser.getScreenshot({ partial: pages, scale: 1.7 });
      const out = [];

      const shotPages = Array.isArray(shots?.pages) ? shots.pages : [];
      for (let idx = 0; idx < shotPages.length; idx += 1) {
        const image = shotPages[idx]?.data;
        if (!image) continue;
        const ocr = await tesseractRecognize(image, "eng");
        const ocrText = String(ocr?.data?.text || "").trim();
        if (ocrText) {
          out.push(`Page ${pages[idx]}\n${ocrText}`);
        }
      }

      if (out.length > 0) {
        text = out.join("\n\n");
        source = "ocr";
      }
    } finally {
      await parser.destroy();
    }
  }

  return {
    text,
    totalPages,
    source,
    ocrUsed: source === "ocr"
  };
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

function pickWeightedUnique(input, count, randomFn = Math.random) {
  if (!Array.isArray(input) || input.length === 0) return [];

  const expanded = [];
  input.forEach((item) => {
    const repeat = item.isPYQ ? Math.max(1, Math.min(5, Number(item.frequency || 1))) : 1;
    for (let i = 0; i < repeat; i += 1) {
      expanded.push(item);
    }
  });

  const shuffled = shuffleWithRandom(expanded, randomFn);
  const selected = [];
  const seen = new Set();

  for (const item of shuffled) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    selected.push(item);
    if (selected.length >= count) break;
  }

  if (selected.length < count) {
    const remain = input.filter((item) => !seen.has(item.id));
    selected.push(...pickRandomUnique(remain, count - selected.length, randomFn));
  }

  return selected;
}

function normalizeTopicKey(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function canonicalTopic(subject, topic) {
  const sub = normalizeSubject(subject);
  const key = normalizeTopicKey(topic);
  const aliases = TOPIC_ALIASES[sub] || {};
  return aliases[key] || String(topic || "").trim();
}

function allocateCountsByWeights(weightedBuckets, targetCount) {
  if (!Array.isArray(weightedBuckets) || weightedBuckets.length === 0 || targetCount <= 0) return [];
  const totalWeight = weightedBuckets.reduce((sum, b) => sum + Math.max(0, Number(b.weight || 0)), 0) || 1;
  const allocations = weightedBuckets.map((bucket) => {
    const exact = (Math.max(0, Number(bucket.weight || 0)) / totalWeight) * targetCount;
    const base = Math.floor(exact);
    return { bucket, count: base, fraction: exact - base };
  });

  let used = allocations.reduce((sum, item) => sum + item.count, 0);
  const sortedByFraction = [...allocations].sort((a, b) => b.fraction - a.fraction);
  for (const item of sortedByFraction) {
    if (used >= targetCount) break;
    item.count += 1;
    used += 1;
  }

  return allocations;
}

function pickTopicWeightedUnique(input, count, subject, randomFn = Math.random, options = {}) {
  if (!Array.isArray(input) || input.length === 0 || count <= 0) return [];
  const sub = normalizeSubject(subject);
  const weightMap = SSC_CGL_TOPIC_WEIGHTAGE[sub];
  if (!weightMap) return pickWeightedUnique(input, count, randomFn);

  const preferPYQ = options.preferPYQ !== false;
  const grouped = new Map();
  input.forEach((item) => {
    const key = canonicalTopic(sub, item.topic);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  const weightedBuckets = [];
  for (const [key, items] of grouped.entries()) {
    const weight = Number(weightMap[key] || 0);
    if (weight <= 0) continue;
    const pyqItems = items.filter((q) => q.isPYQ === true);
    const pool = preferPYQ && pyqItems.length > 0 ? pyqItems : items;
    weightedBuckets.push({ key, items: pool, weight });
  }

  if (weightedBuckets.length === 0) {
    return pickWeightedUnique(input, count, randomFn);
  }

  const allocations = allocateCountsByWeights(weightedBuckets, count);
  const selected = [];
  const seen = new Set();

  allocations.forEach(({ bucket, count: bucketCount }) => {
    if (bucketCount <= 0) return;
    const picks = pickWeightedUnique(bucket.items.filter((q) => !seen.has(q.id)), bucketCount, randomFn);
    picks.forEach((item) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      selected.push(item);
    });
  });

  if (selected.length < count) {
    const remain = input.filter((q) => !seen.has(q.id));
    selected.push(...pickWeightedUnique(remain, count - selected.length, randomFn));
  }

  return selected.slice(0, count);
}

function isExactAnswerQuestion(item) {
  const options = Array.isArray(item?.options) ? item.options : [];
  const answerIndex = Number(item?.answerIndex);
  const confidence = Number(item?.confidenceScore);
  const text = String(item?.question || "").trim();

  if (String(item?.questionMode || "objective") !== "objective") return false;
  if (options.length < 2) return false;
  if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) return false;
  if (Number.isFinite(confidence) && confidence > 0 && confidence < 0.7) return false;
  if (text.length < 15) return false;
  if (/answer\s*key/i.test(text)) return false;

  return true;
}

function isFigureDependentQuestion(item) {
  // Questions with actual diagram images are usable
  if (item.diagram) return false;
  const text = String(item?.question || "").toLowerCase();
  return /\b(in the (given|following|adjoining) (figure|diagram)|from the figure|as shown in the figure|refer.{0,10}figure|the following figure|given figure|see the figure|in the figure)\b/.test(text);
}

function isBrokenPassageQuestion(item) {
  const text = String(item?.question || "").trim();
  if (text.length > 120) return false;
  return /^\s*select the most appropriate option to fill in (the )?blank\s*(no\.?|number)?\s*\d/i.test(text);
}

function isOrphanPassageQuestion(item) {
  const topic = String(item?.topic || "").toLowerCase();
  const text = String(item?.question || "").toLowerCase();
  // Reading Comprehension questions without embedded passage text are unusable
  if (topic === "reading comprehension") {
    const hasPassage = item.passage || item.passageText || item.context;
    if (!hasPassage) return true;
  }
  // Questions that reference "the passage" / "the paragraph" but lack context
  if (/\b(the (given |above |following )?passage|the (given |above |following )?paragraph)\b/.test(text)) {
    const hasPassage = item.passage || item.passageText || item.context;
    if (!hasPassage) return true;
  }
  return false;
}

function parseTopicSelections(value) {
  const list = Array.isArray(value) ? value : [];
  const tokens = new Set();

  list.forEach((entry) => {
    const raw = String(entry || "").trim();
    if (!raw || !raw.includes("::")) return;
    const [subject, topic] = raw.split("::");
    const normalizedSubject = normalizeSubject(subject);
    const normalizedTopic = normalize(topic);
    if (normalizedSubject && normalizedTopic) {
      tokens.add(`${normalizedSubject}::${normalizedTopic}`);
    }
  });

  return tokens;
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
  const isPYQ = Boolean(input.isPYQ);
  const rawYear = toInt(input.year, 0);
  const year = (rawYear >= 2000 && rawYear <= 2030) ? rawYear : null;
  const frequency = Math.max(1, Math.min(20, toInt(input.frequency, 1)));
  const subtopic = String(input.subtopic || "").trim().slice(0, 100);

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
    isPYQ,
    year: isPYQ ? year : null,
    frequency: isPYQ ? frequency : 1,
    subtopic: subtopic || null,
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
  const isPYQFilter = String(query.isPYQ || "").trim();
  const yearFilter = toInt(query.year, 0);
  const yearFrom = toInt(query.yearFrom, 0);
  const yearTo = toInt(query.yearTo, 0);

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
  if (isPYQFilter === "true") results = results.filter((q) => q.isPYQ === true);
  if (isPYQFilter === "false") results = results.filter((q) => !q.isPYQ);
  if (yearFilter) results = results.filter((q) => q.year === yearFilter);
  if (yearFrom) results = results.filter((q) => (q.year || 0) >= yearFrom);
  if (yearTo) results = results.filter((q) => (q.year || 0) <= yearTo);

  const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
  return results.slice(0, limit);
}

function formatSubjectLabel(subject) {
  const map = {
    quant: "Quant",
    reasoning: "Reasoning",
    english: "English",
    gk: "GK",
    computer: "Computer"
  };
  const key = normalizeSubject(subject);
  return map[key] || String(subject || "").trim() || "Unknown";
}

function buildQuestionSetDiagnostics(items = [], context = {}) {
  const list = Array.isArray(items) ? items : [];
  const subjectBreakdown = {};
  const difficultyBreakdown = {};
  const subjectTopics = {};
  const uniqueTopics = new Set();
  let pyqCount = 0;
  let confidenceTotal = 0;
  let confidenceCount = 0;

  list.forEach((item) => {
    const subject = normalizeSubject(item?.subject) || "unknown";
    const difficulty = normalize(item?.difficulty) || "unknown";
    const topic = canonicalTopic(subject, item?.topic || "Mixed");

    subjectBreakdown[subject] = (subjectBreakdown[subject] || 0) + 1;
    difficultyBreakdown[difficulty] = (difficultyBreakdown[difficulty] || 0) + 1;

    if (!subjectTopics[subject]) subjectTopics[subject] = new Set();
    if (topic) {
      subjectTopics[subject].add(topic);
      uniqueTopics.add(`${subject}::${topic}`);
    }

    if (item?.isPYQ === true) pyqCount += 1;

    const confidence = Number(item?.confidenceScore);
    if (Number.isFinite(confidence) && confidence > 0) {
      confidenceTotal += confidence;
      confidenceCount += 1;
    }
  });

  const requested = Math.max(0, Number(context.requested || list.length || 0));
  const coverageRatio = requested > 0
    ? Number((list.length / requested).toFixed(2))
    : (list.length > 0 ? 1 : 0);

  const requestedBlueprint = context?.blueprint?.distribution && typeof context.blueprint.distribution === "object"
    ? context.blueprint.distribution
    : null;

  const shortfalls = {};
  if (requestedBlueprint) {
    Object.entries(requestedBlueprint).forEach(([subject, target]) => {
      const actual = subjectBreakdown[subject] || 0;
      if (actual < target) {
        shortfalls[subject] = Math.max(0, target - actual);
      }
    });
  }

  const lowDiversitySubjects = Object.entries(subjectTopics)
    .filter(([subject, topics]) => (subjectBreakdown[subject] || 0) >= 10 && topics.size < 3)
    .map(([subject, topics]) => `${formatSubjectLabel(subject)} (${topics.size} topic${topics.size === 1 ? "" : "s"})`);

  const warnings = [];
  const tierLabel = normalizeTier(context.tier || "tier1") === "tier2" ? "Tier 2" : "Tier 1";

  if (requested > 0 && list.length === 0) {
    warnings.push(`No approved ${tierLabel} questions are available for the current filters yet.`);
  }

  if (requested > 0 && list.length > 0 && list.length < requested) {
    warnings.push(`Only ${list.length} of ${requested} requested questions could be served from the current bank.`);
  }

  if (Object.keys(shortfalls).length > 0) {
    const shortfallText = Object.entries(shortfalls)
      .map(([subject, count]) => `${formatSubjectLabel(subject)} short by ${count}`)
      .join(", ");
    warnings.push(`Balanced mock coverage is limited right now: ${shortfallText}.`);
  }

  if (lowDiversitySubjects.length > 0) {
    warnings.push(`Topic diversity is still thin in ${lowDiversitySubjects.join(", ")}.`);
  }

  let qualityBand = "strong";
  if (list.length === 0) qualityBand = "insufficient";
  else if (coverageRatio < 0.85 || Object.keys(shortfalls).length > 0) qualityBand = "limited";
  else if (lowDiversitySubjects.length > 0 || coverageRatio < 1) qualityBand = "good";

  return {
    warnings,
    summary: {
      total: list.length,
      requested,
      coverageRatio,
      qualityBand,
      subjectBreakdown,
      difficultyBreakdown,
      topicCount: uniqueTopics.size,
      pyqCount,
      pyqSharePct: list.length ? Number(((pyqCount / list.length) * 100).toFixed(1)) : 0,
      avgConfidencePct: confidenceCount ? Number(((confidenceTotal / confidenceCount) * 100).toFixed(1)) : null,
      shortfalls,
      excludedRecentCount: Number(context.excludedRecentCount || 0) || 0
    }
  };
}

function attachQuestionSetDiagnostics(result, context = {}) {
  const meta = buildQuestionSetDiagnostics(result?.items, {
    ...context,
    requested: result?.requested,
    tier: result?.tier,
    excludedRecentCount: result?.excludedRecentCount
  });

  return {
    ...result,
    warnings: meta.warnings,
    summary: meta.summary
  };
}

function buildMockByTier(pool, tier, randomFn, options = {}) {
  const blueprint = MOCK_BLUEPRINTS[tier] || MOCK_BLUEPRINTS.tier1;
  const preferPYQ = options.preferPYQ !== false;
  const useTopicWeightage = options.useTopicWeightage !== false;
  const selected = [];
  const picked = new Set();
  const subjectShortfalls = {};

  // First pass: try to pick exactly the distribution count from each subject
  for (const [subject, count] of Object.entries(blueprint.distribution)) {
    const subjectPool = pool.filter((q) => q.subject === subject && !picked.has(q.id));
    const picks = useTopicWeightage
      ? pickTopicWeightedUnique(subjectPool, count, subject, randomFn, { preferPYQ })
      : pickWeightedUnique(subjectPool, count, randomFn);
    
    picks.forEach((item) => {
      picked.add(item.id);
      selected.push(item);
    });
    
    // Track if this subject came up short
    const shortfall = Math.max(0, count - picks.length);
    if (shortfall > 0) {
      subjectShortfalls[subject] = shortfall;
    }
  }

  // Second pass: if we're short on total questions, try to backfill evenly across subjects with available pool
  if (selected.length < blueprint.total) {
    const remain = pool.filter((q) => !picked.has(q.id));
    const needed = blueprint.total - selected.length;
    
    if (Object.keys(subjectShortfalls).length > 0 && remain.length > 0) {
      // Backfill primarily from subjects that had shortfalls
      const shortfallSubjects = Object.keys(subjectShortfalls);
      let backfilled = 0;
      
      for (const subject of shortfallSubjects) {
        if (backfilled >= needed) break;
        const subjectRemain = remain.filter((q) => q.subject === subject && !picked.has(q.id));
        const toTake = Math.min(subjectRemain.length, subjectShortfalls[subject]);
        
        if (toTake > 0) {
          const picks = pickRandomUnique(subjectRemain, toTake, randomFn);
          picks.forEach((item) => {
            picked.add(item.id);
            selected.push(item);
            backfilled++;
          });
        }
      }
      
      // If still short, do a general backfill
      if (backfilled < needed) {
        const finalRemain = pool.filter((q) => !picked.has(q.id));
        const generalBackfill = pickRandomUnique(finalRemain, needed - backfilled, randomFn);
        selected.push(...generalBackfill);
      }
    } else {
      // No shortfalls but still need questions - general backfill
      const backfill = pickRandomUnique(remain, needed, randomFn);
      selected.push(...backfill);
    }
  }

  // Group questions by section in real SSC exam order instead of random shuffle
  const sectionOrdered = [];
  for (const subject of SECTION_ORDER) {
    const sectionItems = selected.filter((q) => q.subject === subject);
    // Shuffle within each section for variety
    sectionOrdered.push(...shuffleWithRandom(sectionItems, randomFn));
  }
  // Append any questions with subjects not in SECTION_ORDER
  const orderedIds = new Set(sectionOrdered.map((q) => q.id));
  const remaining = selected.filter((q) => !orderedIds.has(q.id));
  sectionOrdered.push(...shuffleWithRandom(remaining, randomFn));

  return {
    requested: blueprint.total,
    selected: sectionOrdered
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
  const requestedCountInput = payload.count ?? payload.practiceCount ?? payload.limit;
  const practiceCount = Math.max(5, Math.min(150, toInt(requestedCountInput, 30)));
  const requestedSubjects = Array.isArray(payload.subjects)
    ? payload.subjects.map(normalizeSubject).filter(Boolean)
    : [];
  const includeUnreviewed = String(payload.includeUnreviewed || "").trim() === "true";
  const topicFilter = normalize(payload.topic);
  const selectedTopics = parseTopicSelections(payload.selectedTopics);
  const mockType = normalize(payload.mockType) || "full_ssc";
  const testType = normalize(payload.testType) || "";
  const sourceMode = normalize(payload.sourceMode) || "pyq";
  const enforceExactAnswers = String(payload.enforceExactAnswers || "true").trim() !== "false";
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

  if (topicFilter) {
    pool = pool.filter((q) => normalize(q.topic).includes(topicFilter));
  }

  if (selectedTopics.size > 0) {
    pool = pool.filter((q) => {
      const token = `${normalizeSubject(q.subject)}::${normalize(q.topic)}`;
      return selectedTopics.has(token);
    });
  }

  if (scope === "selective" && requestedSubjects.length > 0) {
    pool = pool.filter((q) => requestedSubjects.includes(q.subject));
  }

  if (enforceExactAnswers) {
    pool = pool.filter((q) => isExactAnswerQuestion(q));
  }

  // Filter out figure-dependent questions (no images available)
  pool = pool.filter((q) => !isFigureDependentQuestion(q));
  // Filter out broken passage questions (blank-number-only without passage context)
  pool = pool.filter((q) => !isBrokenPassageQuestion(q));
  // Filter out questions with fewer than 3 options (too broken to use)
  pool = pool.filter((q) => Array.isArray(q.options) && q.options.length >= 3);
  // Pad 3-option questions to 4 with "None of these" (standard SSC format)
  pool.forEach((q) => {
    if (q.options.length === 3) {
      q.options = [...q.options, "None of these"];
    }
  });
  // Filter out passage/comprehension questions that lack embedded passage text
  pool = pool.filter((q) => !isOrphanPassageQuestion(q));

  const fallbackPool = [...pool];
  const respond = (result, extra = {}) => attachQuestionSetDiagnostics(result, { tier, ...extra });

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
    return respond({
      mode,
      tier,
      requested: challengeCount,
      served: selected.length,
      seed,
      items: selected,
      excludedRecentCount: recentQuestionIds.size
    });
  }

  const rng = Math.random;
  const preferPYQ = sourceMode === "pyq";

  if (mode === "mock") {
    const isCustomTopicSelection = selectedTopics.size > 0 || Boolean(topicFilter);

    // Sectional mode: exactly 25 questions from one subject
    if (testType === "sectional" || mockType === "sectional") {
      const sectionalCount = 25;
      const subject = requestedSubjects[0] || "quant";
      const subjectPool = pool.filter((q) => q.subject === subject);
      let selected;

      if (subject === "quant" && !isCustomTopicSelection) {
        selected = pickTopicWeightedUnique(subjectPool, sectionalCount, "quant", rng, { preferPYQ });
      } else if (preferPYQ) {
        selected = pickWeightedUnique(subjectPool, sectionalCount, rng);
      } else {
        selected = pickRandomUnique(subjectPool, sectionalCount, rng);
      }

      if (selected.length < sectionalCount && fallbackPool.length > pool.length) {
        const remain = fallbackPool.filter((q) => q.subject === subject && !selected.some((s) => s.id === q.id));
        selected = [...selected, ...pickRandomUnique(remain, sectionalCount - selected.length, rng)];
      }
      selected = shuffleWithRandom(selected.slice(0, sectionalCount), rng);
      return respond({
        mode,
        tier,
        testType: "sectional",
        mockType: "sectional",
        subject,
        requested: sectionalCount,
        served: selected.length,
        items: selected,
        excludedRecentCount: recentQuestionIds.size
      });
    }

    if (mockType === "topic_select") {
      const topicRequested = Math.max(10, practiceCount);
      let topicItems = pickWeightedUnique(pool, topicRequested, rng);
      if (topicItems.length < topicRequested && fallbackPool.length > pool.length) {
        const remain = fallbackPool.filter((q) => !topicItems.some((item) => item.id === q.id));
        topicItems = [...topicItems, ...pickWeightedUnique(remain, topicRequested - topicItems.length, rng)];
      }
      const selected = shuffleWithRandom(topicItems.slice(0, topicRequested), rng);
      return respond({
        mode,
        tier,
        mockType,
        requested: topicRequested,
        served: selected.length,
        selectedTopics: [...selectedTopics],
        items: selected,
        excludedRecentCount: recentQuestionIds.size
      });
    }

    const isQuantOnlyMock = scope === "selective" && requestedSubjects.length === 1 && requestedSubjects[0] === "quant";

    if (!isCustomTopicSelection && isQuantOnlyMock) {
      const requested = Math.max(10, practiceCount);
      let selected = pickTopicWeightedUnique(pool, requested, "quant", rng, { preferPYQ });
      if (selected.length < requested && fallbackPool.length > pool.length) {
        const remain = fallbackPool.filter((q) => q.subject === "quant" && !selected.some((x) => x.id === q.id));
        selected = [...selected, ...pickTopicWeightedUnique(remain, requested - selected.length, "quant", rng, { preferPYQ })];
      }
      selected = shuffleWithRandom(selected.slice(0, requested), rng);
      return respond({
        mode,
        tier,
        mockType: "quant_section",
        requested,
        served: selected.length,
        pattern: "ssc_cgl_topic_weighted_quant",
        items: selected,
        excludedRecentCount: recentQuestionIds.size
      });
    }

    // Full mock — use blueprint distribution
    let built = buildMockByTier(pool, tier, rng, { preferPYQ, useTopicWeightage: !isCustomTopicSelection });
    if (built.selected.length < built.requested && fallbackPool.length > pool.length) {
      built = buildMockByTier(fallbackPool, tier, rng, { preferPYQ, useTopicWeightage: !isCustomTopicSelection });
    }
    return respond({
      mode,
      tier,
      mockType: "full_ssc",
      requested: built.requested,
      served: built.selected.length,
      pattern: MOCK_BLUEPRINTS[tier],
      items: built.selected,
      excludedRecentCount: recentQuestionIds.size
    }, {
      blueprint: MOCK_BLUEPRINTS[tier]
    });
  }

  if (mode === "pyq-smart") {
    const pyqPool = pool.filter((q) => q.isPYQ === true);
    const activePyqPool = pyqPool.length > 0 ? pyqPool : pool;
    const yearGroups = {};
    activePyqPool.forEach((q) => {
      const yr = String(q.year || "unknown");
      if (!yearGroups[yr]) yearGroups[yr] = [];
      yearGroups[yr].push(q);
    });
    const years = Object.keys(yearGroups).sort().reverse();
    const pyqSelected = [];
    const perYear = Math.ceil(practiceCount / Math.max(years.length, 1));
    for (const yr of years) {
      const picks = pickRandomUnique(yearGroups[yr], perYear, rng);
      picks.forEach((q) => { if (!pyqSelected.some((s) => s.id === q.id)) pyqSelected.push(q); });
      if (pyqSelected.length >= practiceCount) break;
    }
    if (pyqSelected.length < practiceCount) {
      const remaining = activePyqPool.filter((q) => !pyqSelected.some((s) => s.id === q.id));
      pyqSelected.push(...pickRandomUnique(remaining, practiceCount - pyqSelected.length, rng));
    }
    const items = shuffleWithRandom(pyqSelected.slice(0, practiceCount), rng);
    return respond({
      mode,
      tier,
      requested: practiceCount,
      served: items.length,
      isPYQ: true,
      items,
      excludedRecentCount: recentQuestionIds.size
    });
  }

  if (mode === "weakness-focused") {
    const rawWeights = typeof payload.subjectWeights === "object" && payload.subjectWeights !== null ? payload.subjectWeights : {};
    const weightEntries = Object.entries(rawWeights)
      .map(([sub, w]) => [normalizeSubject(sub), Math.max(0, Number(w || 0))])
      .filter(([sub, w]) => sub && w > 0);
    const totalWeight = weightEntries.reduce((s, [, w]) => s + w, 0);
    let focusSelected = [];
    if (weightEntries.length === 0 || totalWeight === 0) {
      focusSelected = pickRandomUnique(pool, practiceCount, rng);
    } else {
      for (const [sub, w] of weightEntries) {
        const count = Math.round((w / totalWeight) * practiceCount);
        const subPool = pool.filter((q) => q.subject === sub);
        focusSelected.push(...pickRandomUnique(subPool, count, rng));
      }
      if (focusSelected.length < practiceCount) {
        const extra = pool.filter((q) => !focusSelected.some((s) => s.id === q.id));
        focusSelected.push(...pickRandomUnique(extra, practiceCount - focusSelected.length, rng));
      }
    }
    const items = shuffleWithRandom(focusSelected.slice(0, practiceCount), rng);
    return respond({
      mode,
      tier,
      requested: practiceCount,
      served: items.length,
      subjectWeights: Object.fromEntries(weightEntries),
      items,
      excludedRecentCount: recentQuestionIds.size
    });
  }

  let selected = pickRandomUnique(pool, practiceCount, rng);
  if (selected.length < practiceCount && fallbackPool.length > pool.length) {
    const needed = practiceCount - selected.length;
    const extra = fallbackPool.filter((q) => !selected.some((s) => s.id === q.id));
    selected = [...selected, ...pickRandomUnique(extra, needed, rng)];
  }
  return respond({
    mode,
    tier,
    requested: practiceCount,
    served: selected.length,
    items: selected,
    excludedRecentCount: recentQuestionIds.size
  });
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
    const approvedQuestions = bank.questions.filter((q) => q.type === "question" && String(q.reviewStatus || "approved") === "approved");
    const subjects = [...new Set(approvedQuestions.map((q) => q.subject))].filter(Boolean).sort();

    const topicMap = new Map();
    approvedQuestions.forEach((q) => {
      const subject = normalizeSubject(q.subject);
      const tier = normalizeTier(q.tier || "tier1");
      const topic = canonicalTopic(subject, q.topic);
      if (!subject || !topic) return;
      const key = `${tier}::${subject}::${normalize(topic)}`;
      if (!topicMap.has(key)) {
        topicMap.set(key, { subject, topic, tier, count: 0 });
      }
      topicMap.get(key).count += 1;
    });

    const topicItems = [...topicMap.values()]
      .sort((a, b) => a.tier.localeCompare(b.tier) || a.subject.localeCompare(b.subject) || b.count - a.count || a.topic.localeCompare(b.topic));

    const coverageByTier = {};
    approvedQuestions.forEach((q) => {
      const tier = normalizeTier(q.tier || "tier1");
      const subject = normalizeSubject(q.subject) || "unknown";
      if (!coverageByTier[tier]) {
        coverageByTier[tier] = { total: 0, bySubject: {} };
      }
      coverageByTier[tier].total += 1;
      coverageByTier[tier].bySubject[subject] = (coverageByTier[tier].bySubject[subject] || 0) + 1;
    });

    const topics = [...new Set(topicItems.map((item) => item.topic))].sort();
    const tiers = [...new Set(approvedQuestions.map((q) => q.tier))].filter(Boolean).sort();
    const difficulties = [...new Set(approvedQuestions.map((q) => q.difficulty))].filter(Boolean).sort();
    const questionModes = [...new Set(approvedQuestions.map((q) => q.questionMode))].filter(Boolean).sort();
    const pyqCount = approvedQuestions.filter((q) => q.isPYQ === true).length;
    const years = [...new Set(approvedQuestions.filter((q) => q.year).map((q) => q.year))].sort();

    return res.json({
      success: true,
      updatedAt: bank.updatedAt,
      subjects,
      topics,
      topicItems,
      coverageByTier,
      tiers,
      difficulties,
      questionModes,
      total: approvedQuestions.length,
      pyqCount,
      years
    });
  } catch (error) {
    console.error("/api/questions/meta GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/pyq/stats", (req, res) => {
  try {
    const bank = readBank();
    const tierFilter = normalizeTier(req.query.tier || "");
    let pyqs = bank.questions.filter((q) => q.isPYQ === true && String(q.reviewStatus || "approved") !== "rejected");
    if (tierFilter) pyqs = pyqs.filter((q) => q.tier === tierFilter);

    const topicMap = {};
    pyqs.forEach((q) => {
      const key = q.topic;
      if (!topicMap[key]) topicMap[key] = { topic: key, subject: q.subject, count: 0, years: new Set(), totalFrequency: 0 };
      topicMap[key].count += 1;
      topicMap[key].totalFrequency += (q.frequency || 1);
      if (q.year) topicMap[key].years.add(q.year);
    });
    const topTopics = Object.values(topicMap)
      .map((t) => ({ topic: t.topic, subject: t.subject, count: t.count, years: [...t.years].sort(), totalFrequency: t.totalFrequency }))
      .sort((a, b) => b.totalFrequency - a.totalFrequency)
      .slice(0, 10);

    const yearDist = {};
    pyqs.forEach((q) => { if (q.year) yearDist[q.year] = (yearDist[q.year] || 0) + 1; });

    const highFreq = [...pyqs]
      .filter((q) => (q.frequency || 1) >= 3)
      .sort((a, b) => (b.frequency || 1) - (a.frequency || 1))
      .slice(0, 10)
      .map((q) => ({ id: q.id, topic: q.topic, subtopic: q.subtopic, subject: q.subject, tier: q.tier, year: q.year, frequency: q.frequency, difficulty: q.difficulty }));

    const subjectBreakdown = {};
    pyqs.forEach((q) => { subjectBreakdown[q.subject] = (subjectBreakdown[q.subject] || 0) + 1; });

    return res.json({
      success: true,
      total: pyqs.length,
      topTopics,
      yearDistribution: yearDist,
      highFrequencyPYQs: highFreq,
      subjectBreakdown
    });
  } catch (error) {
    console.error("/api/questions/pyq/stats GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/generate", (req, res) => {
  try {
    const userKey = String(req.body?.userKey || req.query?.userKey || req.headers["x-user-key"] || "").trim().toLowerCase();
    if (userKey) {
      const { getEffectiveAccessPlan } = require("../utils/planStore");
      if (getEffectiveAccessPlan(userKey) < 99) {
        return res.status(403).json({ success: false, error: "Premium subscription required", premiumRequired: true });
      }
    }

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
    const userKey = String(req.body?.userKey || req.query?.userKey || req.headers["x-user-key"] || "").trim().toLowerCase();
    if (userKey) {
      const { getEffectiveAccessPlan } = require("../utils/planStore");
      if (getEffectiveAccessPlan(userKey) < 99) {
        return res.status(403).json({ success: false, error: "Premium subscription required", premiumRequired: true });
      }
    }

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

    if (!pdfParseLib && !pdfParseClass) {
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

    const extraction = await extractPdfText(pdfBuffer, {
      useOCR: req.body.useOCR,
      ocrPageLimit: req.body.ocrPageLimit,
      ocrPageStart: req.body.ocrPageStart
    });
    const isPYQImport = String(req.body.isPYQ || "").trim() === "true";
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
      isPYQ: isPYQImport,
      year: req.body.year || undefined,
      frequency: req.body.frequency || undefined,
      subtopic: req.body.subtopic || undefined,
      sourceKind: req.body.sourceKind || (isPYQImport ? "pyq_pdf" : "daily_practice_pdf"),
      fileName
    };
    const reviewThreshold = Number.isFinite(Number(req.body.reviewThreshold))
      ? Number(req.body.reviewThreshold)
      : 0.65;
    const autoApprove = String(req.body.autoApprove || "").trim() === "true";
    const forceReview = extraction.ocrUsed;

    const extracted = parseQuestionsFromText(extraction.text || "", defaults);
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

      sanitized.reviewStatus = (autoApprove && !forceReview)
        ? "approved"
        : (Number(sanitized.confidenceScore || 0) < Math.max(reviewThreshold, forceReview ? 0.95 : 0) ? "needs_review" : "approved");
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
      extractionSource: extraction.source,
      ocrUsed: extraction.ocrUsed,
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

    if (!pdfParseLib && !pdfParseClass) {
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

    const extraction = await extractPdfText(pdfBuffer, {
      useOCR: req.body.useOCR,
      ocrPageLimit: req.body.ocrPageLimit,
      ocrPageStart: req.body.ocrPageStart
    });
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

    const extracted = parseQuestionsFromText(extraction.text || "", defaults);
    const preview = extracted.slice(0, Math.max(1, Math.min(20, toInt(req.body.previewCount, 5))));

    return res.json({
      success: true,
      parserPreset: defaults.parserPreset,
      extractionSource: extraction.source,
      ocrUsed: extraction.ocrUsed,
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

router.post("/admin/review/auto-decision", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const decision = normalize(req.body.decision);
    const reviewedBy = String(req.body.reviewedBy || "system_admin").trim().slice(0, 80);
    const rejectReason = String(req.body.rejectReason || "Auto-rejected due to very low OCR confidence").trim().slice(0, 500);
    const minConfidence = Number.isFinite(Number(req.body.minConfidence)) ? Number(req.body.minConfidence) : 0.85;
    const maxConfidence = Number.isFinite(Number(req.body.maxConfidence)) ? Number(req.body.maxConfidence) : 0.25;
    const limit = Math.max(1, Math.min(500, toInt(req.body.limit, 200)));

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ success: false, error: "decision must be approve or reject" });
    }

    const bank = readBank();
    const candidates = bank.questions.filter((q) => String(q.reviewStatus || "approved") === "needs_review");
    let filtered = [];

    if (decision === "approve") {
      filtered = candidates.filter((q) => Number(q.confidenceScore || 0) >= minConfidence);
    } else {
      filtered = candidates.filter((q) => Number(q.confidenceScore || 0) <= maxConfidence);
    }

    const picked = filtered.slice(0, limit);
    if (picked.length === 0) {
      return res.json({ success: true, decision, updated: 0, reviewedBy, message: "No matching needs_review questions found" });
    }

    const nowIso = new Date().toISOString();
    const ids = new Set(picked.map((q) => String(q.id || "")));
    bank.questions = bank.questions.map((q) => {
      if (!ids.has(String(q.id || ""))) return q;
      return applyReviewDecision(q, {
        decision,
        reviewedBy,
        rejectReason,
        reviewedAt: nowIso
      });
    });

    const next = writeBank({ questions: ensureUniqueIds(bank.questions) });
    return res.json({
      success: true,
      decision,
      updated: picked.length,
      reviewedBy,
      minConfidence,
      maxConfidence,
      updatedAt: next.updatedAt
    });
  } catch (error) {
    console.error("/api/questions/admin/review/auto-decision POST error:", error);
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

// ============================================================
// ROUTE: Flag/Report a bad question (user-facing, no admin key)
// ============================================================
router.post("/flag", (req, res) => {
  try {
    const { questionId, reason } = req.body;
    if (!questionId) return res.status(400).json({ success: false, error: "questionId required" });

    const bank = readBank();
    const q = bank.questions.find(q => q.id === questionId);
    if (!q) return res.status(404).json({ success: false, error: "Question not found" });

    // Track flags on the question
    if (!q.flags) q.flags = [];
    // Rate limit: max 10 flags per question to prevent abuse
    if (q.flags.length >= 10) {
      return res.json({ success: true, message: "Already flagged" });
    }
    q.flags.push({
      reason: String(reason || "bad quality").substring(0, 200),
      at: new Date().toISOString()
    });

    // Auto-remove: if a question gets 3+ flags, mark it as rejected
    if (q.flags.length >= 3 && q.reviewStatus !== "rejected") {
      q.reviewStatus = "rejected";
    }

    writeBank(bank);
    res.json({ success: true, message: "Question flagged successfully. Thank you for helping improve quality!" });
  } catch (err) {
    console.error("/api/questions/flag error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================================================
// ROUTE: Admin — view flagged questions
// ============================================================
router.get("/admin/flagged", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const bank = readBank();
    const flagged = bank.questions
      .filter(q => q.flags && q.flags.length > 0)
      .map(q => ({
        id: q.id,
        question: q.question.substring(0, 200),
        subject: q.subject,
        topic: q.topic,
        options: q.options,
        flagCount: q.flags.length,
        flags: q.flags,
        reviewStatus: q.reviewStatus
      }))
      .sort((a, b) => b.flagCount - a.flagCount);

    res.json({ success: true, total: flagged.length, flagged });
  } catch (err) {
    console.error("/api/questions/admin/flagged error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================================================
// ROUTE: Admin — remove a specific question by ID
// ============================================================
router.post("/admin/remove", (req, res) => {
  try {
    if (!requireAdminAccess(req, res)) return;

    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ success: false, error: "questionId required" });

    const bank = readBank();
    const idx = bank.questions.findIndex(q => q.id === questionId);
    if (idx === -1) return res.status(404).json({ success: false, error: "Question not found" });

    bank.questions.splice(idx, 1);
    writeBank(bank);

    res.json({ success: true, message: "Question removed", remaining: bank.questions.length });
  } catch (err) {
    console.error("/api/questions/admin/remove error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
