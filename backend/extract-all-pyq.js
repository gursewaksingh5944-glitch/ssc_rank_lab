#!/usr/bin/env node
/**
 * Comprehensive PYQ extraction from all text-extractable PDFs.
 * Handles multiple formats:
 *   1. Adda247-style (numbered Q, (a)-(d) options, solutions section)
 *   2. SSC response-sheet (Q.N, numbered options 1-4, Chosen Option, Section headers)
 *   3. GK SmartBook (numbered Q, A)-D) options, chapter headers)
 *   4. Reasoning bilingual (numbered Q, (a)-(d), Ans:(x))
 */

const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BASE = path.join(__dirname);
const OUT = path.join(BASE, "data", "extracted-pyq.json");

function uid() {
  return crypto.randomBytes(4).toString("hex");
}

function now() {
  return new Date().toISOString();
}

// ─── Format 1: Adda247 Tier-2 Quant (100Q) ─────────────────────
function parseAdda247Quant(text) {
  const questions = [];

  // Split into questions section and solutions section
  const solIdx = text.indexOf("Solutions\n");
  if (solIdx === -1) {
    console.warn("  No Solutions section found, trying without answers");
  }

  const qText = solIdx > -1 ? text.substring(0, solIdx) : text;
  const sText = solIdx > -1 ? text.substring(solIdx) : "";

  // Parse answer key from solutions
  const answerKey = {};
  if (sText) {
    const ansMatches = sText.matchAll(/(\d+)\.\s*\(([a-d])\)/g);
    for (const m of ansMatches) {
      answerKey[parseInt(m[1])] = m[2];
    }
  }

  // Parse questions: numbered with (a)-(d) options
  const qPattern =
    /(?:^|\n)(\d+)\.\s+([\s\S]*?)(?=\n\d+\.\s|\n--\s*\d+\s*of|\nSolutions\n|$)/g;
  let match;
  while ((match = qPattern.exec(qText)) !== null) {
    const num = parseInt(match[1]);
    const block = match[2].trim();

    // Skip header/footer lines
    if (
      block.includes("www.teachersadda.com") ||
      block.includes("www.sscadda.com") ||
      block.length < 10
    )
      continue;

    // Extract options
    const optMatch = block.match(
      /\(a\)\s*([\s\S]*?)\s*\(b\)\s*([\s\S]*?)\s*\(c\)\s*([\s\S]*?)\s*\(d\)\s*([\s\S]*?)$/i
    );
    if (!optMatch) continue;

    const qTextClean = block
      .substring(0, block.search(/\(a\)/i))
      .replace(/\n/g, " ")
      .trim();
    if (qTextClean.length < 5) continue;

    const options = [
      optMatch[1].replace(/\n/g, " ").trim(),
      optMatch[2].replace(/\n/g, " ").trim(),
      optMatch[3].replace(/\n/g, " ").trim(),
      optMatch[4].replace(/\n/g, " ").trim(),
    ];

    const ansLetter = answerKey[num];
    const ansIdx = ansLetter
      ? { a: 0, b: 1, c: 2, d: 3 }[ansLetter]
      : undefined;

    if (ansIdx === undefined) continue; // skip if no answer

    questions.push({
      num,
      question: qTextClean,
      options,
      answerIndex: ansIdx,
      subject: "quant",
      tier: "tier2",
      topic: inferQuantTopic(qTextClean),
    });
  }

  return questions;
}

function inferQuantTopic(text) {
  const t = text.toLowerCase();
  if (/age|ratio.*age|present age/.test(t)) return "Ages";
  if (/profit|loss|cost price|selling price|discount/.test(t)) return "Profit & Loss";
  if (/interest|principal|compound|simple interest/.test(t)) return "Interest";
  if (/speed|distance|train|km\/hr|m\/s/.test(t)) return "Time & Distance";
  if (/work|day.*complete|pipe|cistern|fill/.test(t)) return "Time & Work";
  if (/triangle|circle|area|perimeter|radius|circumference|∆|inscribed/.test(t))
    return "Geometry";
  if (/sin|cos|tan|cot|sec|cosec|trigonometr/.test(t)) return "Trigonometry";
  if (/percentage|percent|%/.test(t)) return "Percentage";
  if (/ratio|proportion/.test(t)) return "Ratio & Proportion";
  if (/average|mean/.test(t)) return "Average";
  if (/algebra|equation|polynomial|x\s*[+=]|x²|x³/.test(t)) return "Algebra";
  if (/mensuration|volume|surface area|cube|cylinder|sphere|cone/.test(t))
    return "Mensuration";
  if (/number system|divisible|factor|remainder|hcf|lcm|prime/.test(t))
    return "Number System";
  if (/data interpretation|bar.*graph|pie.*chart|table/.test(t))
    return "Data Interpretation";
  if (/simplification|bodmas/.test(t)) return "Simplification";
  return "Quant";
}

// ─── Format 2: SSC Response Sheet (Tier-2 English & Jan papers) ──
function parseResponseSheet(text, defaultSubject, defaultTier) {
  const questions = [];

  // Detect section headers for subject mapping
  const sectionMap = [];
  const secPattern =
    /Section\s*:\s*(Module\s+\w+\s+)?(.+?)(?:\n|$)/gi;
  let sm;
  while ((sm = secPattern.exec(text)) !== null) {
    const secName = (sm[2] || "").trim().toLowerCase();
    let subject = defaultSubject;
    if (/math|quant|arithmetic|numerical/.test(secName)) subject = "quant";
    else if (/english|language|comprehension/.test(secName))
      subject = "english";
    else if (/reasoning|analytic|logical/.test(secName))
      subject = "reasoning";
    else if (/general.*awareness|general.*knowledge|general.*studies/.test(secName))
      subject = "gk";
    else if (/computer/.test(secName)) subject = "computer";
    sectionMap.push({ index: sm.index, subject });
  }

  // Parse questions
  const qPattern =
    /Q\.(\d+)\s+([\s\S]*?)Ans\s+([\s\S]*?)(?:Question ID\s*:\s*(\d+)[\s\S]*?)?(?:Status\s*:\s*(\w+)[\s\S]*?)?Chosen Option\s*:\s*(\d+|--)/g;

  let qm;
  while ((qm = qPattern.exec(text)) !== null) {
    const num = parseInt(qm[1]);
    let qText = qm[2].trim();
    const ansBlock = qm[3].trim();
    const chosenOpt = qm[6];

    // Skip if no answer chosen
    if (chosenOpt === "--" || !chosenOpt) continue;

    // Clean question text (remove comprehension passage duplicates)
    qText = qText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    if (qText.length < 5) continue;

    // Parse options (numbered 1. 2. 3. 4.)
    const optPattern = /(\d)\.\s*([\s\S]*?)(?=\d\.\s|$)/g;
    const options = [];
    let om;
    const ansLines = ansBlock.replace(/\n/g, " ").replace(/\s+/g, " ");
    // Simple approach: split by option numbers
    const optParts = ansLines.match(
      /1\.\s*(.*?)\s*2\.\s*(.*?)\s*3\.\s*(.*?)\s*4\.\s*(.*?)$/
    );
    if (!optParts) continue;

    for (let i = 1; i <= 4; i++) {
      options.push(optParts[i].trim());
    }

    if (options.some((o) => o.length === 0)) continue;

    const ansIdx = parseInt(chosenOpt) - 1;
    if (ansIdx < 0 || ansIdx > 3) continue;

    // Determine subject from section headers
    let subject = defaultSubject;
    for (let i = sectionMap.length - 1; i >= 0; i--) {
      if (qm.index >= sectionMap[i].index) {
        subject = sectionMap[i].subject;
        break;
      }
    }

    let topic = subject === "quant" ? inferQuantTopic(qText) : "";
    if (subject === "english") topic = inferEnglishTopic(qText);
    if (subject === "reasoning") topic = inferReasoningTopic(qText);
    if (subject === "gk") topic = "General Knowledge";

    questions.push({
      num,
      question: qText,
      options,
      answerIndex: ansIdx,
      subject,
      tier: defaultTier,
      topic,
    });
  }

  return questions;
}

function inferEnglishTopic(text) {
  const t = text.toLowerCase();
  if (/fill.*blank|passage.*deleted/.test(t)) return "Cloze Test";
  if (/synonym|similar.*meaning/.test(t)) return "Vocabulary";
  if (/antonym|opposite.*meaning/.test(t)) return "Vocabulary";
  if (/idiom|phrase|proverb/.test(t)) return "Idioms & Phrases";
  if (/error|incorrect|grammatically/.test(t)) return "Error Spotting";
  if (/sentence.*improvement|replace/.test(t)) return "Sentence Improvement";
  if (/active.*passive|passive.*active/.test(t)) return "Active Passive";
  if (/direct.*indirect|indirect.*direct|narration/.test(t))
    return "Direct Indirect";
  if (/spelling|correctly.*spel/.test(t)) return "Spelling";
  if (/one.*word|single.*word/.test(t)) return "One Word Substitution";
  if (/comprehension|passage|read.*following/.test(t))
    return "Reading Comprehension";
  if (/rearrange|sentence.*order|para.*jumble/.test(t)) return "Para Jumbles";
  return "English";
}

function inferReasoningTopic(text) {
  const t = text.toLowerCase();
  if (/analogy|related|same way/.test(t)) return "Analogy";
  if (/series|next.*number|missing/.test(t)) return "Series";
  if (/odd.*one|does not belong|classify/.test(t)) return "Classification";
  if (/coding|decoding|code/.test(t)) return "Coding-Decoding";
  if (/direction|north|south|east|west/.test(t)) return "Directions";
  if (/blood.*relation|father|mother|brother|sister/.test(t))
    return "Blood Relations";
  if (/mirror|water.*image|reflection/.test(t)) return "Mirror Image";
  if (/venn.*diagram|circle|overlap/.test(t)) return "Venn Diagram";
  if (/syllogism|conclusion|statement/.test(t)) return "Syllogism";
  if (/matrix|arrangement|seating/.test(t)) return "Arrangement";
  if (/dice|cube|fold/.test(t)) return "Cube & Dice";
  if (/calendar|day|date/.test(t)) return "Calendar";
  if (/clock|angle.*clock|minute.*hour/.test(t)) return "Clock";
  return "Reasoning";
}

// ─── Format 3: GK SmartBook (Chapter-wise, A-D options) ─────────
function parseGKSmartBook(text) {
  const questions = [];

  // Detect chapter headers
  const chapters = [];
  const chapPattern =
    /\n(Ancient History|Medieval History|Modern History|Indian Polity|Indian Economy|Geography|General Science|Physics|Chemistry|Biology|Computer Awareness|Static GK|Indian Geography|World Geography|Environment|Ecology|Science & Technology|Sports|Awards|Books & Authors|Important Days|Art & Culture)\b/gi;
  let cm;
  while ((cm = chapPattern.exec(text)) !== null) {
    chapters.push({ index: cm.index, name: cm[1].trim() });
  }

  // Parse questions: N. question text\nA) ... B) ... C) ... D) ...
  const qPattern =
    /(?:^|\n)(\d+)\.\s+([\s\S]*?)\n\s*A\)\s*([\s\S]*?)\s*B\)\s*([\s\S]*?)\s*C\)\s*([\s\S]*?)\s*D\)\s*([\s\S]*?)(?=\n\d+\.\s|\n--\s*\d+\s*of|$)/g;

  let match;
  while ((match = qPattern.exec(text)) !== null) {
    const num = parseInt(match[1]);
    let qText = match[2].replace(/TTA\s*:\s*\d+\s*Seconds?\s*/gi, "").trim();
    qText = qText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    if (qText.length < 5) continue;
    // Skip if it looks like a solutions answer line
    if (/^[A-D]\)/.test(qText)) continue;

    const options = [
      match[3].replace(/\n/g, " ").trim(),
      match[4].replace(/\n/g, " ").trim(),
      match[5].replace(/\n/g, " ").trim(),
      match[6].replace(/\n/g, " ").trim(),
    ];

    if (options.some((o) => o.length === 0)) continue;

    // Determine chapter/topic
    let topic = "General Knowledge";
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (match.index >= chapters[i].index) {
        topic = chapters[i].name;
        break;
      }
    }

    questions.push({
      num,
      question: qText,
      options,
      answerIndex: -1, // Will lookup from answer key
      subject: "gk",
      tier: "tier1",
      topic,
    });
  }

  // Parse answer keys: typically at end of chapters
  // Format varies: "1. (A)" or "Q1. A" or answer tables
  const ansPattern = /(\d+)\.\s*\(?([A-D])\)?(?:\s|,|$)/g;
  const answerKeys = {};
  // Look for answer key sections
  const ansSecIdx = text.search(
    /Smart Answer Key|Answer Key|ANSWER KEY|Solutions/i
  );
  if (ansSecIdx > -1) {
    const ansText = text.substring(ansSecIdx);
    let am;
    while ((am = ansPattern.exec(ansText)) !== null) {
      answerKeys[parseInt(am[1])] = { A: 0, B: 1, C: 2, D: 3 }[am[2]];
    }
  }

  // Apply answer keys
  for (const q of questions) {
    if (answerKeys[q.num] !== undefined) {
      q.answerIndex = answerKeys[q.num];
    }
  }

  // Remove questions without answers
  return questions.filter((q) => q.answerIndex >= 0);
}

// ─── Format 4: Reasoning bilingual (Ans:(x) inline) ─────────────
function parseReasoningBilingual(text) {
  const questions = [];

  // This book has chapters/types. Parse English-only questions.
  // Pattern: N. question text\n(a) opt (b) opt (c) opt (d) opt\nAns:(x)
  const qPattern =
    /(?:^|\n)(\d+)\.\s+([\s\S]*?)\(a\)\s*([\s\S]*?)\(b\)\s*([\s\S]*?)\(c\)\s*([\s\S]*?)\(d\)\s*([\s\S]*?)Ans\s*:\s*\(([a-d])\)/g;

  let match;
  while ((match = qPattern.exec(text)) !== null) {
    const num = parseInt(match[1]);
    let qText = match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    // Skip Hindi-only text (if >50% Hindi characters)
    const hindiChars = (qText.match(/[\u0900-\u097F]/g) || []).length;
    if (hindiChars > qText.length * 0.5) continue;

    // Remove Hindi portions from bilingual text
    qText = qText
      .replace(/[\u0900-\u097F\u0964\u0965]+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (qText.length < 5) continue;

    const options = [
      match[3]
        .replace(/[\u0900-\u097F\u0964\u0965]+/g, "")
        .replace(/\n/g, " ")
        .trim(),
      match[4]
        .replace(/[\u0900-\u097F\u0964\u0965]+/g, "")
        .replace(/\n/g, " ")
        .trim(),
      match[5]
        .replace(/[\u0900-\u097F\u0964\u0965]+/g, "")
        .replace(/\n/g, " ")
        .trim(),
      match[6]
        .replace(/[\u0900-\u097F\u0964\u0965]+/g, "")
        .replace(/\n/g, " ")
        .trim(),
    ];

    if (options.some((o) => o.length === 0)) continue;

    const ansIdx = { a: 0, b: 1, c: 2, d: 3 }[match[7]];

    questions.push({
      num,
      question: qText,
      options,
      answerIndex: ansIdx,
      subject: "reasoning",
      tier: "tier1",
      topic: inferReasoningTopic(qText),
    });
  }

  return questions;
}

// ─── Format 5: GK Rakesh Yadav ──────────────────────────────────
function parseGKRakeshYadav(text) {
  const questions = [];

  // Detect chapter/section
  const chapters = [];
  const chapPattern =
    /\n(HISTORY|GEOGRAPHY|POLITY|ECONOMICS?|SCIENCE|PHYSICS|CHEMISTRY|BIOLOGY|ANCIENT|MEDIEVAL|MODERN|CONSTITUTION|INDIAN ECONOMY)\b/gi;
  let cm;
  while ((cm = chapPattern.exec(text)) !== null) {
    chapters.push({ index: cm.index, name: cm[1].trim() });
  }

  // Parse numbered Q with A-D or (a)-(d) options
  // Try A)-D) format first
  const qPattern1 =
    /(?:^|\n)(\d+)\.\s+([\s\S]*?)\n\s*[Aa]\)\s*([\s\S]*?)\s*[Bb]\)\s*([\s\S]*?)\s*[Cc]\)\s*([\s\S]*?)\s*[Dd]\)\s*([\s\S]*?)(?:\n\s*Ans\s*[.:]\s*\(?([A-Da-d])\)?)?(?=\n\d+\.\s|\n--\s*\d+\s*of|$)/g;

  let match;
  while ((match = qPattern1.exec(text)) !== null) {
    const num = parseInt(match[1]);
    let qText = match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    // Remove Hindi
    const hindiChars = (qText.match(/[\u0900-\u097F]/g) || []).length;
    if (hindiChars > qText.length * 0.5) continue;
    qText = qText
      .replace(/[\u0900-\u097F\u0964\u0965]+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (qText.length < 5) continue;

    const options = [
      match[3].replace(/\n/g, " ").trim(),
      match[4].replace(/\n/g, " ").trim(),
      match[5].replace(/\n/g, " ").trim(),
      match[6].replace(/\n/g, " ").trim(),
    ];

    if (options.some((o) => o.length === 0)) continue;

    let ansIdx = -1;
    if (match[7]) {
      ansIdx = { a: 0, b: 1, c: 2, d: 3, A: 0, B: 1, C: 2, D: 3 }[match[7]];
    }

    // Determine topic from chapter
    let topic = "General Knowledge";
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (match.index >= chapters[i].index) {
        topic = chapters[i].name;
        break;
      }
    }

    questions.push({
      num,
      question: qText,
      options,
      answerIndex: ansIdx ?? -1,
      subject: "gk",
      tier: "tier1",
      topic,
    });
  }

  return questions.filter((q) => q.answerIndex >= 0);
}

// ─── Convert to question-bank format ────────────────────────────
function toQuestionBankFormat(parsed, source, examName) {
  const ts = now();
  return parsed.map((q) => ({
    id: `q_${q.subject}_pyq_${Date.now()}_${uid()}`,
    type: "question",
    examFamily: "ssc",
    subject: q.subject,
    difficulty: "medium",
    topic: q.topic || q.subject,
    tier: q.tier,
    questionMode: "objective",
    question: q.question,
    options: q.options,
    answerIndex: q.answerIndex,
    explanation: "",
    marks: q.tier === "tier2" ? 3 : 2,
    negativeMarks: q.tier === "tier2" ? 1 : 0.5,
    source: {
      kind: "pyq_pdf",
      fileName: source,
      importedAt: ts,
      extractedBy: "extract-all-pyq",
    },
    isPYQ: true,
    year: examName.match(/\d{4}/)?.[0]
      ? parseInt(examName.match(/\d{4}/)[0])
      : 2024,
    frequency: 1,
    subtopic: q.topic || q.subject,
    isChallengeCandidate: false,
    confidenceScore: 0.75,
    reviewStatus: "approved",
    createdAt: ts,
    updatedAt: ts,
    examName,
  }));
}

// ─── Deduplication ──────────────────────────────────────────────
function dedup(newQs, existingQs) {
  const existingSet = new Set();
  for (const q of existingQs) {
    const key = q.question
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 80);
    existingSet.add(key);
  }

  const seen = new Set();
  const unique = [];
  for (const q of newQs) {
    const key = q.question
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 80);
    if (!existingSet.has(key) && !seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }
  return unique;
}

// ─── Quality filter ─────────────────────────────────────────────
function qualityFilter(questions) {
  return questions.filter((q) => {
    // Must have non-empty question text
    if (!q.question || q.question.length < 10) return false;
    // Must have exactly 4 options (or at least 2)
    if (!q.options || q.options.length < 2) return false;
    // Options must not be empty
    if (q.options.some((o) => !o || o.length === 0)) return false;
    // Must have valid answer index
    if (q.answerIndex < 0 || q.answerIndex >= q.options.length) return false;
    // Question shouldn't be too short
    if (q.question.split(/\s+/).length < 3) return false;
    return true;
  });
}

// ─── Main ───────────────────────────────────────────────────────
async function extractPDF(filePath) {
  const buf = fs.readFileSync(filePath);
  const p = new PDFParse({ data: buf });
  const result = await p.getText();
  await p.destroy();
  return result.text;
}

async function main() {
  console.log("=== SSC PYQ Bulk Extraction ===\n");

  const allExtracted = [];

  // 1. Tier-2 Quant (100 Questions)
  console.log("📄 [1/6] Tier-2 Quant (100Q)...");
  try {
    const text = await extractPDF(
      path.join(
        BASE,
        "pyq/quant/100-Quantitative-Aptitude-Questions-With-Solutions-for-SSC-CGL-Tier-2-Exam.pdf"
      )
    );
    const parsed = parseAdda247Quant(text);
    const formatted = toQuestionBankFormat(
      parsed,
      "100-Quantitative-Aptitude-Questions-With-Solutions-for-SSC-CGL-Tier-2-Exam.pdf",
      "SSC CGL Tier-2"
    );
    console.log(`   Extracted: ${parsed.length} → Formatted: ${formatted.length}`);
    allExtracted.push(...formatted);
  } catch (e) {
    console.error("   Error:", e.message);
  }

  // 2. Tier-2 English Paper 2020
  console.log("📄 [2/6] Tier-2 English 2020...");
  try {
    const text = await extractPDF(
      path.join(
        BASE,
        "pyq/english/SSC-CGL-2020-29-Jan-2022-Tier-II-English-1.pdf"
      )
    );
    const parsed = parseResponseSheet(text, "english", "tier2");
    const formatted = toQuestionBankFormat(
      parsed,
      "SSC-CGL-2020-29-Jan-2022-Tier-II-English-1.pdf",
      "SSC CGL 2020 Tier-2 English"
    );
    console.log(`   Extracted: ${parsed.length} → Formatted: ${formatted.length}`);
    allExtracted.push(...formatted);
  } catch (e) {
    console.error("   Error:", e.message);
  }

  // 3. Tier-2 English Paper 2021
  console.log("📄 [3/6] Tier-2 English 2021...");
  try {
    const text = await extractPDF(
      path.join(
        BASE,
        "pyq/english/SSC-CGL-2021-Tier-II-English-8-Aug-2022.pdf"
      )
    );
    const parsed = parseResponseSheet(text, "english", "tier2");
    const formatted = toQuestionBankFormat(
      parsed,
      "SSC-CGL-2021-Tier-II-English-8-Aug-2022.pdf",
      "SSC CGL 2021 Tier-2 English"
    );
    console.log(`   Extracted: ${parsed.length} → Formatted: ${formatted.length}`);
    allExtracted.push(...formatted);
  } catch (e) {
    console.error("   Error:", e.message);
  }

  // 4. Tier-2 Jan 18 Paper (Mixed subjects)
  console.log("📄 [4/6] Tier-2 Jan 18 Paper...");
  try {
    const text = await extractPDF(
      path.join(BASE, "pyq/other/18-Jan-Paper-I-EN.pdf")
    );
    const parsed = parseResponseSheet(text, "quant", "tier2");
    const formatted = toQuestionBankFormat(
      parsed,
      "18-Jan-Paper-I-EN.pdf",
      "SSC CGL 2024 Tier-2 18-Jan-2025"
    );
    console.log(`   Extracted: ${parsed.length} → Formatted: ${formatted.length}`);
    allExtracted.push(...formatted);
  } catch (e) {
    console.error("   Error:", e.message);
  }

  // 5. Tier-2 Jan 20 Paper (Mixed subjects)
  console.log("📄 [5/6] Tier-2 Jan 20 Paper...");
  try {
    const text = await extractPDF(
      path.join(BASE, "pyq/other/20-Jan-Paper-I-EN.pdf")
    );
    const parsed = parseResponseSheet(text, "quant", "tier2");
    const formatted = toQuestionBankFormat(
      parsed,
      "20-Jan-Paper-I-EN.pdf",
      "SSC CGL 2024 Tier-2 20-Jan-2025"
    );
    console.log(`   Extracted: ${parsed.length} → Formatted: ${formatted.length}`);
    allExtracted.push(...formatted);
  } catch (e) {
    console.error("   Error:", e.message);
  }

  // 6. GK SmartBook (4000 Questions)
  console.log("📄 [6/6] GK SmartBook...");
  try {
    const text = await extractPDF(
      path.join(
        BASE,
        "pyq/other/best-4000-smart-question-bank-ssc-general-knowledge-in-english-next-generation-smartbook-by-testbook-and-s-chand-026cc109.pdf"
      )
    );
    const parsed = parseGKSmartBook(text);
    const formatted = toQuestionBankFormat(
      parsed,
      "best-4000-smart-question-bank-ssc-general-knowledge-in-english.pdf",
      "SSC GK SmartBook"
    );
    console.log(`   Extracted: ${parsed.length} → Formatted: ${formatted.length}`);
    allExtracted.push(...formatted);
  } catch (e) {
    console.error("   Error:", e.message);
  }

  // Quality filter
  console.log(`\nTotal raw extracted: ${allExtracted.length}`);
  const quality = qualityFilter(allExtracted);
  console.log(`After quality filter: ${quality.length}`);

  // Dedup against existing bank
  const bank = JSON.parse(
    fs.readFileSync(path.join(BASE, "data/question-bank.json"), "utf8")
  );
  const unique = dedup(quality, bank.questions);
  console.log(`After dedup: ${unique.length}`);

  // Stats
  const bySubject = {};
  const byTier = {};
  for (const q of unique) {
    bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    byTier[q.tier] = (byTier[q.tier] || 0) + 1;
  }
  console.log("\nNew questions by subject:", bySubject);
  console.log("New questions by tier:", byTier);

  // Save extracted file
  fs.writeFileSync(OUT, JSON.stringify({ extractedAt: now(), count: unique.length, questions: unique }, null, 2));
  console.log(`\nSaved ${unique.length} new questions to ${OUT}`);

  // Merge into question bank
  bank.questions.push(...unique);
  bank.updatedAt = now();
  fs.writeFileSync(
    path.join(BASE, "data/question-bank.json"),
    JSON.stringify(bank, null, 2)
  );
  console.log(
    `Question bank updated: ${bank.questions.length} total questions`
  );
}

main().catch(console.error);
