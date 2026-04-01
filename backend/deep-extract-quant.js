#!/usr/bin/env node
/**
 * Deep extractor for SSC chapterwise Quant PDFs
 * Format: two-column textbook with inline options (a)/(b)/(c)/(d) per question
 * Handles OCR artifacts: @ = a, 8 = a, (ले/(वी = d, etc.
 * Parses answer key section at end and maps correct answers.
 * Saves directly to question-bank.json.
 *
 * Usage: node backend/deep-extract-quant.js [pdfName] [topic] [subject]
 * Example: node backend/deep-extract-quant.js geometry.pdf Geometry quant
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let PDFParse = null;
let tesseractRecognize = null;
try {
  const pdfMod = require("pdf-parse");
  if (pdfMod && typeof pdfMod.PDFParse === "function") PDFParse = pdfMod.PDFParse;
  else if (typeof pdfMod === "function") PDFParse = { _fn: pdfMod };
} catch (e) {
  console.error("pdf-parse not available:", e.message);
  process.exit(1);
}

try {
  const tesseractModule = require("tesseract.js");
  tesseractRecognize = typeof tesseractModule.recognize === "function" ? tesseractModule.recognize : null;
} catch (e) {
  tesseractRecognize = null;
}

const QUANT_TOPICS = {
  "geometry.pdf":         "Geometry",
  "trigo.pdf":            "Trigonometry",
  "algebra.pdf":          "Algebra",
  "data_interpretation.pdf": "Data Interpretation",
  "time_distance.pdf":    "Time & Distance",
  "time_work.pdf":        "Time & Work",
  "ratio_proportion.pdf": "Ratio & Proportion",
  "percentage.pdf":       "Percentage",
  "profit_loss.pdf":      "Profit & Loss",
  "si_ci.pdf":            "Simple & Compound Interest",
  "average.pdf":          "Average",
  "mensuration.pdf":      "Mensuration",
  "Number_system.pdf":    "Number System",
  "simplification.pdf":   "Simplification"
};

const TOPIC_KEYWORDS = {
  "Geometry": ["triangle", "circle", "chord", "angle", "quadrilateral", "polygon", "diameter", "radius", "perimeter"],
  "Trigonometry": ["sin", "cos", "tan", "cot", "sec", "cosec", "trigonometry"],
  "Algebra": ["equation", "polynomial", "variable", "coefficient", "quadratic", "factor"],
  "Data Interpretation": ["table", "graph", "bar", "pie", "chart", "data", "average marks"],
  "Time & Distance": ["speed", "distance", "train", "km", "journey", "boat", "stream"],
  "Time & Work": ["work", "worker", "pipe", "cistern", "tank", "day", "complete"],
  "Ratio & Proportion": ["ratio", "proportion", "direct variation", "inverse variation"],
  "Percentage": ["percent", "%", "increase", "decrease", "discount"],
  "Profit & Loss": ["profit", "loss", "cost price", "selling price", "marked price"],
  "Simple & Compound Interest": ["interest", "principal", "amount", "rate", "compound", "simple interest"],
  "Average": ["average", "mean", "median"],
  "Mensuration": ["area", "volume", "surface", "cube", "cylinder", "cone", "sphere"],
  "Number System": ["prime", "integer", "divisible", "digit", "number system", "lcm", "hcf"],
  "Simplification": ["simplify", "evaluate", "bodmas", "surd", "fraction"]
};

function classifyQuantTopic(questionText = "", fileTopic = "") {
  if (fileTopic && fileTopic !== "Quant") {
    return fileTopic;
  }

  const text = String(questionText || "").toLowerCase();
  let bestTopic = "Arithmetic";
  let bestScore = 0;

  for (const [topic, words] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    for (const word of words) {
      if (text.includes(word)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

// Normalize OCR artifacts common in scanned SSC books
// Pass the TEXT LINE-BY-LINE so sequence-based replacements work correctly
function normalizeOcrLine(line) {
  // On option lines the sequence is always (a) … (b) … (c) … (d)
  // Replace each option marker with canonical form in left-to-right order
  // so a bare @ means (a) if followed later by (b)/®, etc.

  // Fast pre-norm
  let s = line
    .replace(/\r/g, "")
    // Hindi units → English
    .replace(/लाए/g, "cm").replace(/सेमी/g, "cm")
    .replace(/मीटर/g, "m").replace(/किमी/g, "km")
    .replace(/फीसदी/g, "%").replace(/वर्ग/g, "sq.")
    // Devanagari → space (do after units)
    .replace(/[\u0900-\u097F\uA8E0-\uA8FF]+/g, " ")
    // soft hyphens / zero-width
    .replace(/[\u00AD\u200B-\u200F\uFEFF]/g, "")
    // (a) variants
    .replace(/\(@\)/g,    "(a)")   // (@)
    .replace(/\( @\)/g,   "(a)")
    .replace(/\(@ /g,     "(a) ")  // (@ space
    .replace(/\(@([^)a-z])/g, "(a)$1") // (@ non-paren
    .replace(/\(8\)/g,    "(a)")
    .replace(/\(4\)/g,    "(a)")
    .replace(/\(A\)/g,    "(a)")
    // (b) variants
    .replace(/®\)/g,  "(b)")       // ®)
    .replace(/®(\s)/g,"(b)$1")    // ® space
    .replace(/\(B\)/g,"(b)")
    // (c) variants
    .replace(/\(¢\)/g, "(c)").replace(/\(©\)/g, "(c)")
    .replace(/©(\s)/g, "(c)$1")
    .replace(/\(0\)/g, "(c)").replace(/\(0 /g, "(c) ")
    .replace(/\(c0\)/g,"(c)").replace(/\(C\)/g,"(c)")
    // (d) variants
    .replace(/\(D\)/g, "(d)");

  // Handle bare @ as option marker — only when it appears as the
  // FIRST non-space token OR when preceded by a closing paren/digit+space
  // and the line also contains (b) or ® somewhere (i.e. it's an option line)
  const isOptLine = /\(b\)|®|\(c\)|\(d\)/i.test(s);
  if (isOptLine) {
    // @ at start of line or after whitespace → (a)
    s = s.replace(/(^|\s)@(\s)/g, "$1(a)$2");
    // standalone ® not yet replaced
    s = s.replace(/(^|\s)®(\s|$)/g, "$1(b)$2");
    // standalone © not yet replaced
    s = s.replace(/(^|\s)©(\s|$)/g, "$1(c)$2");
  }

  return s.replace(/\s{2,}/g, " ");
}

function normalizeOcr(text) {
  return text
    .split("\n")
    .map(normalizeOcrLine)
    .join("\n");
}

function looksSparseText(text) {
  const lines = String(text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return true;
  const avgLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  return lines.length < 80 || avgLength < 16;
}

function qFingerprint(q) {
  const txt = (q.question || "").toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  return crypto.createHash("sha1").update(txt).digest("hex");
}

/**
 * Returns true if the text is predominantly English (Latin) characters.
 * Devanagari/Hindi chars are U+0900–U+097F and U+A8E0–U+A8FF.
 * If >20% of alphabetic chars are Devanagari, consider it non-English.
 */
function isEnglish(text) {
  const alpha = text.replace(/[^a-zA-Z\u0900-\u097F\uA8E0-\uA8FF]/g, "");
  if (alpha.length < 4) return true; // too short to judge
  const devanagari = (text.match(/[\u0900-\u097F\uA8E0-\uA8FF]/g) || []).length;
  return devanagari / alpha.length < 0.20;
}

/**
 * Parse the answer key section.
 * Returns a Map: questionNumber (int) → answerIndex (0-3 = A-D, or -1 unknown)
 */
function parseAnswerKey(rawText) {
  const ans = new Map();
  // Also run on pre-normalized text to catch Devanagari variants before stripping
  const texts = [rawText];

  for (const text of texts) {
    // Pattern 1: "123. (a)" — standard with both parens
    const rx1 = /(\d{1,3})\s*[.)]\s*\(([a-dAD@8c])\)/g;
    let m;
    while ((m = rx1.exec(text)) !== null) {
      const qnum = parseInt(m[1], 10);
      if (qnum < 1 || qnum > 500) continue;
      const letter = m[2].toLowerCase().replace("@", "a").replace("8", "a");
      const idx = { a: 0, b: 1, c: 2, d: 3 }[letter] ?? -1;
      if (idx >= 0 && !ans.has(qnum)) ans.set(qnum, idx);
    }
    // Pattern 2: "123. @)" — opening paren missing (OCR drop)
    const rx2 = /(\d{1,3})\s*[.)]\s*@\)/g;
    while ((m = rx2.exec(text)) !== null) {
      const qnum = parseInt(m[1], 10);
      if (qnum >= 1 && qnum <= 500 && !ans.has(qnum)) ans.set(qnum, 0);
    }
    // Pattern 3: "123. (c" — closing paren missing (happens after Devanagari norm)
    const rx3 = /(\d{1,3})\s*[.)]\s*\(([abcd])\s*$/gm;
    while ((m = rx3.exec(text)) !== null) {
      const qnum = parseInt(m[1], 10);
      if (qnum < 1 || qnum > 500) continue;
      const idx = { a: 0, b: 1, c: 2, d: 3 }[m[2]] ?? -1;
      if (idx >= 0 && !ans.has(qnum)) ans.set(qnum, idx);
    }
  }
  return ans;
}

/** Strip option noise from parsed option text */
function cleanOpt(s) {
  return (s || "")
    .replace(/^[)\].\s]+/, "")          // leading ) . ] etc
    .replace(/\([a-d]\).*$/i, "")        // any trailing option marker
    .replace(/\(SSC[^)]{0,60}\)/gi, "")  // SSC source tags
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Extract all question blocks from normalized text.
 * Handles two-column PDFs where a single line may contain options for TWO questions.
 * Strategy:
 *  1. Scan merged lines for any occurrence of (a)…(b) pairs (option blocks)
 *  2. A single line may contain multiple option blocks (two-column) — split them
 *  3. Look back up to 8 lines for the question text + number
 *  4. Return { qNum, question, options:[a,b,c,d] }
 */
function extractQuestions(rawText) {
  const lines = rawText.split("\n").map(l => l.replace(/\s+/g, " ").trim());
  const results = [];

  // Canonical option regex — matches (a)…(b)…(c)?…(d)?
  // Captures each option text (greedy but bounded)
  const OPT_RX = /\(a\)\s*(.{1,100}?)\s*\(b\)\s*(.{1,100}?)\s*(?:\(c\)\s*(.{0,100}?)\s*)?(?:\(d\)\s*(.{0,100}))?$/i;

  // Merge consecutive lines when (a) appears without (b) yet
  const merged = [];
  for (let i = 0; i < lines.length; i++) {
    let cur = lines[i];
    // if line has (a) but not (b), try merging next 1-2 lines
    if (/\(a\)/i.test(cur) && !/\(b\)/i.test(cur)) {
      let j = i + 1;
      while (j <= i + 2 && j < lines.length) {
        const nx = lines[j];
        cur = cur + " " + nx;
        j++;
        if (/\(b\)/i.test(cur)) { i = j - 1; break; }
      }
    }
    merged.push(cur);
  }

  const qNumRx = /(\d{1,3})[.)]\s+(.{5,})/;

  for (let i = 0; i < merged.length; i++) {
    const line = merged[i];

    // A line can have 1 or 2 option blocks (two-column layout)
    // We find all (a) positions and extract one block per (a)
    const aPositions = [];
    let rx = /\(a\)/gi, m;
    while ((m = rx.exec(line)) !== null) aPositions.push(m.index);

    for (const aPos of aPositions) {
      const segment = line.slice(aPos);
      // Extract up to next (a) or end of line
      const nextA = line.indexOf("(a)", aPos + 3);
      const seg = nextA > aPos ? line.slice(aPos, nextA) : segment;

      const optMatch = seg.match(/\(a\)\s*(.{1,100}?)\s*\(b\)\s*(.{1,100}?)(?:\s*\(c\)\s*(.{0,100}?))?(?:\s*\(d\)\s*(.{0,100?}))?$/i)
        || seg.match(/\(a\)\s*(.{1,100}?)\s*\(b\)\s*(.{1,100}?)\s*\(c\)\s*(.{0,100}?)\s*\(d\)\s*(.{0,100})/i);
      if (!optMatch) continue;

      const optA = cleanOpt(optMatch[1]);
      const optB = cleanOpt(optMatch[2]);
      const optC = cleanOpt(optMatch[3]);
      const optD = cleanOpt(optMatch[4]);

      if (!optA || !optB) continue;
      const opts = [optA, optB, optC, optD].map(o => o.trim()).filter(Boolean);
      if (opts.length < 2) continue;

      // ── Find question text ────────────────────────────────────────────────
      // Text before the (a) on this line
      const beforeOpt = line.slice(0, aPos).trim();
      const accumLines = [];
      let qNum = -1;

      // Does the prefix on this line have a question number?
      const leadNum = beforeOpt.match(/(\d{1,3})[.)]\s+(.{5,})/);
      if (leadNum) {
        qNum = parseInt(leadNum[1], 10);
        accumLines.push(leadNum[2]);
      } else if (beforeOpt.length > 8) {
        accumLines.push(beforeOpt);
      }

      // Look back up to 8 lines for question text
      if (qNum < 0 || accumLines.length === 0) {
        for (let k = i - 1; k >= Math.max(0, i - 8); k--) {
          const prev = merged[k];
          if (!prev || prev.length < 3) break;
          if (/^--\s*\d+\s*of\s*\d+/.test(prev)) break;
          if (/\(a\)/i.test(prev) && /\(b\)/i.test(prev)) break; // another option line
          if (/^CHAPTER|^Geometry\b|^Algebra\b|^Trigon/i.test(prev)) break;

          const nm = prev.match(/(\d{1,3})[.)]\s+(.{5,})/);
          if (nm) {
            qNum = parseInt(nm[1], 10);
            accumLines.unshift(nm[2]);
            break;
          }
          accumLines.unshift(prev);
        }
      }

      if (accumLines.length === 0) continue;

      let qText = accumLines
        .join(" ")
        .replace(/\s+/g, " ")
        .replace(/\(SSC[^)]{0,60}\)/gi, "")
        .replace(/SSC\s+\w+[\w\s.]*\d{4}/gi, "")
        .trim();

      if (!qText || qText.length < 8) continue;

      // Truncate question text if it contains embedded option markers (two-column bleed)
      const qOptPos = qText.search(/\s\(a\)\s|\s\(b\)\s|\s\(c\)\s/i);
      if (qOptPos > 15) qText = qText.slice(0, qOptPos).trim();
      if (qText.length < 8) continue;

      // Remove trailing noise (year refs, page noise)
      qText = qText
        .replace(/\s+\(SSC[^)]{0,60}\)\s*$/i, "")
        .replace(/\s+(SSC\s+\w+\s+\d{4})\s*$/i, "")
        .replace(/\s+(15|is|are|then|from)\s*$/i, "")
        .trim();

      // Accept 2+ options to keep partially OCR'd but usable MCQs.
      if (opts.length < 2) continue;

      results.push({ qNum, question: qText, options: opts });
    }
  }

  return results;
}

async function extractPdfText(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  let text = "";
  if (PDFParse._fn) {
    const result = await PDFParse._fn(buf);
    text = result.text || "";
  } else {
    const parser = new PDFParse({ data: buf });
    try {
      const result = await parser.getText();
      text = result.text || "";

      if (looksSparseText(text) && tesseractRecognize) {
        const totalPages = Math.max(1, Number(result.total || 0));
        const ocrChunks = [];
        for (let start = 1; start <= totalPages; start += 6) {
          const pages = [];
          const end = Math.min(totalPages, start + 5);
          for (let page = start; page <= end; page++) pages.push(page);

          const shots = await parser.getScreenshot({ partial: pages, scale: 1.7 });
          const shotPages = Array.isArray(shots?.pages) ? shots.pages : [];

          for (let idx = 0; idx < shotPages.length; idx++) {
            const image = shotPages[idx]?.data;
            if (!image) continue;
            const ocr = await tesseractRecognize(image, "eng");
            const pageText = String(ocr?.data?.text || "").trim();
            if (pageText) {
              ocrChunks.push(pageText);
            }
          }
        }

        if (ocrChunks.length > 0) {
          text = ocrChunks.join("\n");
        }
      }
    } finally {
      await parser.destroy();
    }
  }
  return text;
}

async function deepExtract(pdfPath, topic, subject = "quant") {
  const filename = path.basename(pdfPath);
  console.log(`\n📖 Deep-extracting: ${filename}`);
  console.log(`   Topic: ${topic} | Subject: ${subject}`);

  const rawText = await extractPdfText(pdfPath);
  if (!rawText || rawText.length < 100) {
    console.log("   ❌ No text extracted");
    return [];
  }

  console.log(`   📝 Raw text: ${rawText.length} chars`);

  const normalized = normalizeOcr(rawText);

  // ── Answer key: parse BOTH raw and normalized to maximise hits ────────────
  const ansRaw  = parseAnswerKey(rawText);
  const ansNorm = parseAnswerKey(normalized);
  // Merge: prefer normalized (more reliable letters), fill gaps from raw
  const answerKey = new Map([...ansRaw, ...ansNorm]);
  console.log(`   🔑 Answer key entries found: ${answerKey.size}`);

  // ── Questions ─────────────────────────────────────────────────────────────
  const rawQs = extractQuestions(normalized);
  console.log(`   📊 Raw question blocks: ${rawQs.length}`);

  const now = new Date().toISOString();
  const seen = new Set();
  const out = [];

  for (const q of rawQs) {
    const fp = qFingerprint(q);
    if (seen.has(fp)) continue;
    seen.add(fp);

    const answerIdx = q.qNum > 0 ? (answerKey.get(q.qNum) ?? -1) : -1;
    const hasAnswer = answerIdx >= 0 && answerIdx < q.options.length;
    const confidence = (q.options.length >= 4 ? 0.5 : 0.3) + (hasAnswer ? 0.4 : 0) + (q.question.length > 20 ? 0.1 : 0);

    const resolvedTopic = classifyQuantTopic(q.question, topic);

    out.push({
      id: `q_${subject}_deep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: "question",
      examFamily: "ssc",
      subject,
      difficulty: "medium",
      topic: resolvedTopic,
      tier: "tier1",
      questionMode: "objective",
      question: q.question,
      options: q.options,
      answerIndex: hasAnswer ? answerIdx : (q.options.length > 0 ? 0 : -1),
      explanation: "",
      marks: 2,
      negativeMarks: 0.5,
      source: {
        kind: "daily_practice_pdf",
        fileName: filename,
        importedAt: now,
        extractedBy: "deep-extract-quant"
      },
      isPYQ: false,
      year: null,
      frequency: 1,
      subtopic: resolvedTopic,
      isChallengeCandidate: false,
      confidenceScore: parseFloat(Math.min(1, confidence).toFixed(2)),
      reviewStatus: "approved",
      createdAt: now,
      updatedAt: now
    });
  }

  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const bankPath = path.join(__dirname, "data", "question-bank.json");

  // Load existing bank and fingerprints
  let bank = { updatedAt: new Date().toISOString(), questions: [] };
  let bankFormat = "object";
  const globalSeen = new Set();
  if (fs.existsSync(bankPath)) {
    const rawBank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
    if (Array.isArray(rawBank)) {
      bankFormat = "array";
      bank = { updatedAt: new Date().toISOString(), questions: rawBank };
    } else {
      bank = rawBank || {};
      bank.questions = Array.isArray(bank.questions) ? bank.questions : [];
    }
    for (const q of bank.questions) globalSeen.add(qFingerprint(q));
    console.log(`📦 Loaded bank: ${bank.questions.length} existing questions`);
  }

  const quantDir = path.join(__dirname, "pyq", "quant");

  // Determine which PDFs to process
  let pdfFiles = [];
  if (args[0]) {
    // Single file mode
    const pdfPath = fs.existsSync(args[0]) ? args[0] : path.join(quantDir, args[0]);
    const topic = args[1] || QUANT_TOPICS[path.basename(pdfPath)] || "Quant";
    const subject = args[2] || "quant";
    pdfFiles = [{ pdfPath, topic, subject }];
  } else {
    // All quant PDFs
    const files = fs.readdirSync(quantDir).filter(f => f.toLowerCase().endsWith(".pdf")).sort();
    pdfFiles = files.map(f => ({
      pdfPath: path.join(quantDir, f),
      topic: QUANT_TOPICS[f] || f.replace(".pdf", ""),
      subject: "quant"
    }));
  }

  let totalAdded = 0;
  let totalDupes = 0;
  const topicTotals = {};

  for (const { pdfPath, topic, subject } of pdfFiles) {
    const extracted = await deepExtract(pdfPath, topic, subject);

    let added = 0;
    for (const q of extracted) {
      const fp = qFingerprint(q);
      if (globalSeen.has(fp)) {
        totalDupes++;
        continue;
      }
      globalSeen.add(fp);
      bank.questions.push(q);
      added++;
    }

    totalAdded += added;
    topicTotals[topic] = (topicTotals[topic] || 0) + added;
    console.log(`   ✅ Added ${added} new (${extracted.length - added} dupes skipped)`);
  }

  // Ensure unique IDs
  const usedIds = new Set();
  bank.questions = bank.questions.map(q => {
    let id = q.id || `q_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    while (usedIds.has(id)) id = id + "_" + Math.random().toString(36).slice(2, 5);
    usedIds.add(id);
    return { ...q, id };
  });

  bank.updatedAt = new Date().toISOString();
  const output = bankFormat === "array" ? bank.questions : bank;
  fs.writeFileSync(bankPath, JSON.stringify(output, null, 2), "utf8");

  console.log("\n" + "=".repeat(70));
  console.log(`📈 Total new questions added: ${totalAdded}`);
  console.log(`   Duplicates skipped: ${totalDupes}`);
  console.log(`📦 Bank now has: ${bank.questions.length} questions`);
  console.log("\n📚 By Topic:");
  Object.entries(topicTotals).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log(`   ${t.padEnd(32)} ${c}`));
  console.log("=".repeat(70));
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
