#!/usr/bin/env node
/**
 * Simplified bulk extraction for PYQ mocks
 * Focuses on reliable PDF text extraction without OCR dependencies
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load pdf-parse
let pdfParse = null;
try {
  pdfParse = require("pdf-parse");
  console.log("✅ pdf-parse loaded");
} catch (err) {
  console.error("❌ pdf-parse not found:", err.message);
  process.exit(1);
}
// Handle both pdf-parse v1 (function) and v2 (class)
let pdfParseFunction = null;
let pdfParseClass = null;

if (typeof pdfParse === "function") {
  pdfParseFunction = pdfParse;
} else if (pdfParse && typeof pdfParse.PDFParse === "function") {
  pdfParseClass = pdfParse.PDFParse;
} else if (pdfParse && pdfParse.PDFParse) {
  pdfParseClass = pdfParse.PDFParse;
}

const QUANT_TOPICS = {
  geometry: "Geometry",
  trigonometry: "Trigonometry",
  algebra: "Algebra",
  "data_interpretation": "Data Interpretation",
  "time_distance": "Time & Distance",
  "time_work": "Time & Work",
  "ratio_proportion": "Ratio & Proportion",
  percentage: "Percentage",
  "profit_loss": "Profit & Loss",
  si_ci: "Simple & Compound Interest",
  average: "Average",
  mensuration: "Mensuration",
  "number_system": "Number System",
  simplification: "Simplification"
};

let extractedCount = 0;
let duplicateCount = 0;
const seenFingerprints = new Set();

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function detectTopic(filename = "") {
  const fname = normalize(filename);
  for (const [key, label] of Object.entries(QUANT_TOPICS)) {
    if (fname.includes(key)) return label;
  }
  return "Arithmetic";
}

function questionFingerprint(q = {}) {
  const qText = normalize(q.question || "").replace(/[^a-z0-9]+/g, " ").trim();
  const options = Array.isArray(q.options)
    ? q.options.map(opt => normalize(opt).replace(/[^a-z0-9]+/g, " ").trim()).join("|")
    : "";
  const subject = normalize(q.subject || "");
  const payload = [subject, qText, options].join("||");
  return crypto.createHash("sha1").update(payload).digest("hex");
}

function parseQuestionsFromText(rawText = "", defaults = {}) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const items = [];
  let current = null;

  // Regex patterns for question parsing
  const qPattern = /^\s*(\d{1,4})[\).:-]?\s+(.+)$/;
  const optPattern = /^[\[(]?([A-Da-d])[\])\.:\-]?\s+(.+)$/;
  const ansPattern = /^(?:ans(?:wer)?|correct\s*answer|right\s*answer)\s*[:\-]?\s*([A-Da-d1-4])\b/i;

  const finalizeCurrent = () => {
    if (!current) return;
    current.question = String(current.question || "").trim();
    current.options = Array.isArray(current.options) ? current.options.filter(Boolean) : [];

    if (current.question && current.options.length >= 2) {
      const fp = questionFingerprint(current);
      if (!seenFingerprints.has(fp)) {
        seenFingerprints.add(fp);
        items.push(current);
        extractedCount++;
      } else {
        duplicateCount++;
      }
    }
    current = null;
  };

  for (const line of lines) {
    const questionMatch = line.match(qPattern);
    const optionMatch = line.match(optPattern);
    const answerMatch = line.match(ansPattern);

    if (questionMatch) {
      finalizeCurrent();
      current = {
        id: `q_${defaults.subject}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: "question",
        examFamily: "ssc",
        subject: defaults.subject || "quant",
        difficulty: "medium",
        topic: defaults.topic || "Imported",
        tier: defaults.tier || "tier1",
        questionMode: "objective",
        question: String(questionMatch[2] || "").trim(),
        options: [],
        answerIndex: -1,
        explanation: "",
        marks: 2,
        negativeMarks: 0.5,
        source: {
          kind: "pdf",
          filename: defaults.filename || "unknown.pdf",
          extractedAt: new Date().toISOString()
        },
        reviewStatus: "needs_review",
        confidenceScore: 0.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else if (optionMatch && current) {
      const optionLetter = optionMatch[1].toUpperCase();
      const optionText = String(optionMatch[2] || "").trim();
      const optionIndex = ["A", "B", "C", "D"].indexOf(optionLetter);

      if (optionIndex >= 0) {
        current.options[optionIndex] = optionText;
      }
    } else if (answerMatch && current) {
      const answerLetter = answerMatch[1].toUpperCase();
      const answerIndex = ["A", "B", "C", "D"].indexOf(answerLetter);
      if (answerIndex >= 0) {
        current.answerIndex = answerIndex;
        current.confidenceScore = 0.95;
      }
    }
  }

  finalizeCurrent();
  return items;
}

async function extractPdf(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File not found`);
      return "";
    }

    const buffer = fs.readFileSync(filePath);
    let text = "";
    
    if (pdfParseFunction) {
      const data = await pdfParseFunction(buffer);
      text = data.text || "";
    } else if (pdfParseClass) {
      const parser = new pdfParseClass({ data: buffer });
      const data = await parser.getText();
      text = data.text || "";
    }
    
    return text;
  } catch (err) {
    console.log(`   ⚠️  Extraction error: ${err.message}`);
    return "";
  }
}

async function processQuantTopicPdf(filePath, filename) {
  process.stdout.write(`📊 ${filename.padEnd(35)} → `);
  
  const text = await extractPdf(filePath);
  if (!text || text.length < 50) {
    console.log("❌ (no text)");
    return [];
  }

  const topic = detectTopic(filename);
  const questions = parseQuestionsFromText(text, {
    subject: "quant",
    topic: topic,
    tier: "tier1",
    filename: filename
  });

  console.log(`✅ (${questions.length} questions)`);
  return questions;
}

async function processFullExamPdf(filePath, filename) {
  process.stdout.write(`📄 ${filename.padEnd(35)} → `);
  
  const text = await extractPdf(filePath);
  if (!text || text.length < 50) {
    console.log("❌ (no text)");
    return [];
  }

  // For full exams, extract all questions (don't try to split by section)
  const questions = parseQuestionsFromText(text, {
    subject: "quant",
    topic: `PYQ - ${filename.replace(".pdf", "")}`,
    tier: "tier1",
    filename: filename
  });

  console.log(`✅ (${questions.length} questions)`);
  return questions;
}

async function main() {
  console.log("🚀 PYQ Bulk Extraction Pipeline\n");
  console.log("=".repeat(70));

  const dataDir = path.join(__dirname, "data");
  const bankPath = path.join(dataDir, "question-bank.json");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing bank
  let bank = { updatedAt: new Date().toISOString(), questions: [] };
  if (fs.existsSync(bankPath)) {
    try {
      const raw = fs.readFileSync(bankPath, "utf8");
      bank = JSON.parse(raw);
      console.log(`📦 Loaded bank: ${bank.questions.length} existing questions\n`);

      for (const q of bank.questions) {
        seenFingerprints.add(questionFingerprint(q));
      }
    } catch (err) {
      console.error("Failed to load bank:", err.message);
    }
  }

  const otherDir = path.join(__dirname, "pyq", "other");
  const quantDir = path.join(__dirname, "pyq", "quant");

  let allNewQuestions = [];
  let quantBreakdown = {};

  // Phase 1: Full exam papers
  console.log("\n📥 PHASE 1: Full Exam Papers (SSC CGL Shifts)");
  console.log("-".repeat(70));

  if (fs.existsSync(otherDir)) {
    const files = fs.readdirSync(otherDir).filter(f => f.endsWith(".pdf")).sort();
    for (const file of files) {
      const qs = await processFullExamPdf(path.join(otherDir, file), file);
      allNewQuestions.push(...qs);
      
      // Count by topic for quant
      for (const q of qs.filter(x => x.subject === "quant")) {
        const t = q.topic || "Unknown";
        quantBreakdown[t] = (quantBreakdown[t] || 0) + 1;
      }
    }
  } else {
    console.log("⚠️  backend/pyq/other not found");
  }

  // Phase 2: Quant  topic PDFs
  console.log("\n📥 PHASE 2: Quant Topic PDFs");
  console.log("-".repeat(70));

  if (fs.existsSync(quantDir)) {
    const files = fs.readdirSync(quantDir).filter(f => f.endsWith(".pdf")).sort();
    for (const file of files) {
      const qs = await processQuantTopicPdf(path.join(quantDir, file), file);
      allNewQuestions.push(...qs);
      
      for (const q of qs) {
        const t = q.topic || "Unknown";
        quantBreakdown[t] = (quantBreakdown[t] || 0) + 1;
      }
    }
  } else {
    console.log("⚠️  backend/pyq/quant not found");
  }

  // Save to bank
  console.log("\n📊 PHASE 3: Results & Storage");
  console.log("-".repeat(70));

  const prevCount = bank.questions.length;
  bank.questions.push(...allNewQuestions);
  bank.updatedAt = new Date().toISOString();

  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), "utf8");

  console.log(`\n📈 Extraction Summary:`);
  console.log(`   New questions extracted: ${extractedCount}`);
  console.log(`   Duplicates skipped: ${duplicateCount}`);
  console.log(`   Total in bank: ${prevCount} → ${bank.questions.length} (+${extractedCount})`);

  const quantTotal = Object.values(quantBreakdown).reduce((a, b) => a + b, 0);
  console.log(`\n📚 Quant Questions: ${quantTotal}`);
  console.log(`   Topics:`);
  
  Object.entries(quantBreakdown)
    .sort((a, b) => b[1] - a[1])
    .forEach(([topic, count]) => {
      const pct = Math.round(count / quantTotal * 100);
      console.log(`     ${topic.padEnd(30)} ${String(count).padStart(4)} (${String(pct).padStart(3)}%)`);
    });

  // Save summary
  const summaryPath = path.join(dataDir, "extraction-summary.json");
  const summary = {
    extractedAt: new Date().toISOString(),
    totalQuestionsInBank: bank.questions.length,
    newQuestionsAdded: extractedCount,
    quantByTopic: quantBreakdown,
    quantTotal: quantTotal
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

  console.log(`\n💾 Saved to: ${bankPath}`);
  console.log(`📊 Summary: ${summaryPath}`);
  console.log("\n" + "=".repeat(70));
  console.log("✅ Extraction complete!");
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
