#!/usr/bin/env node
/**
 * Bulk extraction script for:
 * 1. All 12 full exam papers (backend/pyq/other) - extract all sections + quant specifically
 * 2. All 14 quant topic PDFs (backend/pyq/quant) - extract with OCR fallback
 * 3. Create full PYQ mock templates
 * 4. Create random mock generator
 * Goal: Extract 1000+ Quant questions across all topics
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Try to load optional dependencies
let PDFParse = null;
let tesseract = null;
try {
  const pdfModule = require("pdf-parse");
  if (typeof pdfModule === "function") {
    PDFParse = pdfModule;
  } else if (pdfModule && typeof pdfModule.PDFParse === "function") {
    PDFParse = pdfModule.PDFParse;
  }
} catch (err) {
  console.warn("⚠️  pdf-parse not available");
}

try {
  tesseract = require("tesseract.js");
} catch (err) {
  console.warn("⚠️  tesseract.js not available");
}

const PARSER_PRESETS = {
  standard: {
    question: /^\s*(\d{1,4})[\).:-]?\s+(.+)$/,
    option: /^[\[(]?([A-Da-d])[\])\.:\-]?\s+(.+)$/,
    answer: /^(?:ans(?:wer)?|correct\s*answer)\s*[:\-]?\s*([A-Da-d1-4])\b/i,
  },
  coaching: {
    question: /^\s*(?:q(?:uestion)?\s*)?(\d{1,4})[\).:-]?\s+(.+)$/i,
    option: /^[\[(]?([A-Da-d1-4])[\])\.:\-]?\s+(.+)$/,
    answer: /^(?:ans(?:wer)?|correct\s*answer|right\s*answer)\s*[:\-]?\s*([A-Da-d1-4])\b/i,
  }
};

const EXAM_SECTIONS = {
  quant: ["General Intelligence & Reasoning", "Quantitative Aptitude", "Mathematics", "Arithmetic"],
  english: ["English Language & Comprehension", "English"],
  reasoning: ["Reasoning", "Intelligence", "Analytical"],
  gk: ["General Awareness", "GK", "Knowledge"]
};

const QUANT_TOPICS = {
  geometry: "Geometry",
  trigonometry: "Trigonometry",
  algebra: "Algebra",
  "data interpretation": "Data Interpretation",
  "time and distance": "Time & Distance",
  "time and work": "Time & Work",
  "ratio and proportion": "Ratio & Proportion",
  percentage: "Percentage",
  "profit and loss": "Profit & Loss",
  "simple interest": "Simple Interest",
  "compound interest": "Compound Interest",
  average: "Average",
  mensuration: "Mensuration",
  "number system": "Number System",
  simplification: "Simplification",
  si_ci: "Simple & Compound Interest"
};

let extractedCount = 0;
let duplicateCount = 0;
const seenFingerprints = new Set();

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSubject(value) {
  const subject = normalize(value);
  if (subject.includes("math") || subject.includes("arithmetic") || subject.includes("aptitude")) return "quant";
  if (subject.includes("english")) return "english";
  if (subject.includes("reason") || subject.includes("intelligence")) return "reasoning";
  if (subject.includes("general") || subject.includes("awareness") || subject.includes("gk")) return "gk";
  return subject;
}

function detectTopic(filename = "", questionText = "") {
  const fname = normalize(filename);
  const qtext = normalize(questionText.substring(0, 100));

  // Try filename first
  for (const [key, label] of Object.entries(QUANT_TOPICS)) {
    if (fname.includes(normalize(key))) return label;
  }

  // Try question content keywords
  const keywords = {
    Geometry: ["triangle", "circle", "square", "rectangle", "angle", "polygon", "area", "perimeter"],
    Trigonometry: ["sin", "cos", "tan", "trigonometric", "angle", "degrees", "radian"],
    Algebra: ["equation", "polynomial", "factorize", "expand", "variable", "coefficient"],
    "Data Interpretation": ["table", "graph", "chart", "bar", "percentage", "data", "observation"],
    "Time & Distance": ["distance", "speed", "time", "travel", "km/h", "ratio"],
    "Time & Work": ["work", "worker", "complete", "pipe", "tank", "day"],
    "Ratio & Proportion": ["ratio", "proportion", "divide", "multiple"],
    Percentage: ["percent", "%", "increase", "decrease"],
    "Profit & Loss": ["profit", "loss", "cost price", "selling price", "margin"],
    "Simple Interest": ["simple interest", "principal", "rate", "si "],
    "Compound Interest": ["compound interest", "ci"],
    Average: ["average", "mean", "median"],
    Mensuration: ["area", "perimeter", "volume", "surface", "cube", "cylinder"],
    "Number System": ["number", "integer", "divisible", "prime", "factors"],
    Simplification: ["simplify", "calculate", "evaluate", "bodmas", "operation"]
  };

  for (const [topic, kws] of Object.entries(keywords)) {
    if (kws.some(kw => qtext.includes(kw))) return topic;
  }

  return "Arithmetic";
}

function questionFingerprint(q = {}) {
  const qText = normalize(q.question || "").replace(/[^a-z0-9]+/g, " ").trim();
  const options = Array.isArray(q.options)
    ? q.options.map(opt => normalize(opt).replace(/[^a-z0-9]+/g, " ").trim()).join("|")
    : "";
  const subject = normalizeSubject(q.subject || "");
  const payload = [subject, qText, options].join("||");
  return crypto.createHash("sha1").update(payload).digest("hex");
}

function isLikelyScanned(text = "") {
  const lines = text.split(/\n/).filter(Boolean);
  const avgLineLength = lines.reduce((sum, line) => sum + line.trim().length, 0) / Math.max(lines.length, 1);
  return lines.length < 50 || avgLineLength < 10;
}

async function extractPdfText(pdfPath) {
  try {
    if (!fs.existsSync(pdfPath)) {
      console.log(`   ❌ File not found: ${pdfPath}`);
      return "";
    }

    const buffer = fs.readFileSync(pdfPath);
    let text = "";

    if (PDFParse) {
      try {
        let data;
        if (typeof PDFParse === "function") {
          data = await PDFParse(buffer);
        } else {
          const parser = new PDFParse();
          data = await parser.parseBuffer(buffer);
        }
        text = (data.text || "").trim();
      } catch (err) {
        console.log(`   ⚠️  PDF text extraction failed: ${err.message}`);
      }
    }

    // OCR fallback for scanned PDFs
    if (!text || isLikelyScanned(text)) {
      console.log(`   🔍 Attempting OCR on ${path.basename(pdfPath)}...`);
      if (tesseract) {
        try {
          const { data: ocrData } = await tesseract.recognize(buffer, "eng");
          text = (ocrData.text || "").trim();
        } catch (err) {
          console.log(`   ⚠️  OCR failed: ${err.message}`);
        }
      }
    }

    return text;
    } catch (err) {
      console.error(`   ❌ Failed to extract ${pdfPath}:`, err.message);
      return "";
    }
  } catch (err) {
    console.error(`   ❌ Failed to extract ${pdfPath}:`, err.message);
    return "";
  }
}

function parseQuestionsFromText(rawText = "", defaults = {}) {
  const preset = PARSER_PRESETS.standard;
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const items = [];
  let current = null;

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
    const questionMatch = line.match(preset.question);
    const optionMatch = line.match(preset.option);
    const answerMatch = line.match(preset.answer);

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

        if (answerMatch) {
          const answerLetter = answerMatch[1].toUpperCase();
          const answerIndex = ["A", "B", "C", "D"].indexOf(answerLetter);
          if (answerIndex >= 0) {
            current.answerIndex = answerIndex;
            current.confidenceScore = 0.95;
          }
        }
      }
    }
  }

  finalizeCurrent();
  return items;
}

async function processFullExamPdf(filePath, filename) {
  console.log(`\n📄 Processing full exam: ${filename}`);
  const text = await extractPdfText(filePath);

  if (!text || text.length < 100) {
    console.log("   ❌ No text extracted");
    return {};
  }

  const sections = {
    quant: [],
    english: [],
    reasoning: [],
    gk: []
  };

  // Try to split by section headers
  const lines = text.split(/\n/);
  let currentSection = null;
  let sectionText = "";

  for (const line of lines) {
    const lowLine = line.toLowerCase();

    // Detect section
    for (const [section, keywords] of Object.entries(EXAM_SECTIONS)) {
      if (keywords.some(kw => lowLine.includes(kw.toLowerCase()))) {
        if (currentSection && sectionText) {
          const qs = parseQuestionsFromText(sectionText, {
            subject: currentSection,
            tier: "tier1",
            filename: filename,
            topic: `${currentSection} - ${filename}`
          });
          sections[currentSection].push(...qs);
        }
        currentSection = section;
        sectionText = "";
        break;
      }
    }

    if (currentSection) {
      sectionText += "\n" + line;
    }
  }

  // Finalize last section
  if (currentSection && sectionText) {
    const qs = parseQuestionsFromText(sectionText, {
      subject: currentSection,
      tier: "tier1",
      filename: filename,
      topic: `${currentSection} - ${filename}`
    });
    sections[currentSection].push(...qs);
  }

  // For quant section, further categorize by topic
  if (sections.quant.length > 0) {
    sections.quant = sections.quant.map(q => ({
      ...q,
      subject: "quant",
      topic: detectTopic(filename, q.question)
    }));
  }

  const totalCount = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`   ✅ Extracted: Quant=${sections.quant.length}, English=${sections.english.length}, Reasoning=${sections.reasoning.length}, GK=${sections.gk.length}`);

  return sections;
}

async function processQuantTopicPdf(filePath, filename) {
  console.log(`\n📊 Processing Quant topic: ${filename}`);
  const text = await extractPdfText(filePath);

  if (!text || text.length < 100) {
    console.log("   ❌ No text extracted");
    return [];
  }

  const topic = detectTopic(filename, "");
  const questions = parseQuestionsFromText(text, {
    subject: "quant",
    topic: topic,
    tier: "tier1",
    filename: filename
  });

  console.log(`   ✅ Extracted ${questions.length} questions for ${topic}`);
  return questions;
}

async function main() {
  console.log("🚀 Starting Bulk PYQ Extraction Pipeline\n");
  console.log("=" + "=".repeat(70));

  const dataDir = path.join(__dirname, "data");
  const bankPath = path.join(dataDir, "question-bank.json");

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing bank
  let bank = { updatedAt: new Date().toISOString(), questions: [] };
  if (fs.existsSync(bankPath)) {
    try {
      const raw = fs.readFileSync(bankPath, "utf8");
      bank = JSON.parse(raw);
      console.log(`📦 Loaded existing bank with ${bank.questions.length} questions\n`);

      // Seed seenFingerprints with existing questions
      for (const q of bank.questions) {
        seenFingerprints.add(questionFingerprint(q));
      }
    } catch (err) {
      console.error("Failed to load existing bank:", err);
    }
  }

  // Fix: ensure PDFParse is correctly set up
  if (PDFParse && typeof PDFParse === "object" && PDFParse.PDFParse) {
    PDFParse = async (buffer) => {
      const parser = new PDFParse.PDFParse();
      return parser.parseBuffer(buffer);
    };
  }

  console.log("\n📥 PHASE 1: Full Exam Papers (backend/pyq/other)");
  console.log("-".repeat(70));

  const otherDir = path.join(__dirname, "pyq", "other");
  const quantDir = path.join(__dirname, "pyq", "quant");

  let fullExamQuestions = { quant: [], english: [], reasoning: [], gk: [] };

  if (fs.existsSync(otherDir)) {
    const files = fs.readdirSync(otherDir)
      .filter(f => f.endsWith(".pdf"))
      .sort();

    for (const file of files) {
      const filePath = path.join(otherDir, file);
      const sections = await processFullExamPdf(filePath, file);
      fullExamQuestions.quant.push(...(sections.quant || []));
      fullExamQuestions.english.push(...(sections.english || []));
      fullExamQuestions.reasoning.push(...(sections.reasoning || []));
      fullExamQuestions.gk.push(...(sections.gk || []));
    }

    console.log(`\n✅ Full Exams Summary: Quant=${fullExamQuestions.quant.length}, English=${fullExamQuestions.english.length}, Reasoning=${fullExamQuestions.reasoning.length}, GK=${fullExamQuestions.gk.length}`);
  } else {
    console.log("⚠️  backend/pyq/other not found");
  }

  console.log("\n📥 PHASE 2: Quant Topic PDFs (backend/pyq/quant)");
  console.log("-".repeat(70));

  let quantTopicQuestions = [];

  if (fs.existsSync(quantDir)) {
    const files = fs.readdirSync(quantDir)
      .filter(f => f.endsWith(".pdf"))
      .sort();

    for (const file of files) {
      const filePath = path.join(quantDir, file);
      const questions = await processQuantTopicPdf(filePath, file);
      quantTopicQuestions.push(...questions);
    }

    console.log(`\n✅ Topic PDFs Summary: Total Quant=${quantTopicQuestions.length}`);
  } else {
    console.log("⚠️  backend/pyq/quant not found");
  }

  console.log("\n📊 PHASE 3: Aggregation & Statistics");
  console.log("-".repeat(70));

  const allNewQuestions = [
    ...fullExamQuestions.quant,
    ...fullExamQuestions.english,
    ...fullExamQuestions.reasoning,
    ...fullExamQuestions.gk,
    ...quantTopicQuestions
  ];

  const quantByTopic = {};
  for (const q of [...fullExamQuestions.quant, ...quantTopicQuestions]) {
    const topic = q.topic || "Unknown";
    quantByTopic[topic] = (quantByTopic[topic] || 0) + 1;
  }

  console.log(`\n📈 Extraction Results:`);
  console.log(`   Total new questions extracted: ${extractedCount}`);
  console.log(`   Duplicates skipped: ${duplicateCount}`);
  console.log(`   Quant from full exams: ${fullExamQuestions.quant.length}`);
  console.log(`   Quant from topic PDFs: ${quantTopicQuestions.length}`);
  console.log(`   Total Quant questions: ${fullExamQuestions.quant.length + quantTopicQuestions.length}`);
  console.log(`\n📚 Quant Topics Breakdown:`);
  Object.entries(quantByTopic)
    .sort((a, b) => b[1] - a[1])
    .forEach(([topic, count]) => {
      console.log(`   ${topic}: ${count}`);
    });

  // Merge with existing bank
  bank.questions.push(...allNewQuestions);
  bank.updatedAt = new Date().toISOString();

  // Save updated bank
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), "utf8");
  console.log(`\n💾 Saved ${bank.questions.length} total questions to ${bankPath}`);

  // Create extraction summary file
  const summaryPath = path.join(dataDir, "extraction-summary.json");
  const summary = {
    extractedAt: new Date().toISOString(),
    totalQuestions: bank.questions.length,
    newQuestionsAdded: extractedCount,
    duplicatesSkipped: duplicateCount,
    quantByTopic: quantByTopic,
    fullExamCount: fullExamQuestions.quant.length + fullExamQuestions.english.length + fullExamQuestions.reasoning.length + fullExamQuestions.gk.length,
    topicPdfCount: quantTopicQuestions.length,
    sections: {
      quant: {
        fromFullExams: fullExamQuestions.quant.length,
        fromTopicPdfs: quantTopicQuestions.length,
        total: fullExamQuestions.quant.length + quantTopicQuestions.length
      },
      english: fullExamQuestions.english.length,
      reasoning: fullExamQuestions.reasoning.length,
      gk: fullExamQuestions.gk.length
    }
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`📊 Saved extraction summary to ${summaryPath}`);

  console.log("\n" + "=".repeat(70));
  console.log("✅ Extraction complete!");
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
