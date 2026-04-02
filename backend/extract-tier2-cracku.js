#!/usr/bin/env node
/**
 * Batch extractor for Cracku SSC CGL Tier-2 PYQ PDFs.
 *
 * Cracku format (clean text-based):
 *   N. Question text...
 *   A   option1
 *   B   option2
 *   C   option3
 *   D   option4
 *   Answer: C
 *
 * English papers also have passage-based blocks with
 *   Instructions [N-M]
 *   <passage text>
 *   then numbered questions referencing the passage.
 *
 * Extracts questions WITH exact answers only.
 * Deduplicates against existing question bank.
 * Saves directly to question-bank.json.
 *
 * Usage: node backend/extract-tier2-cracku.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let PDFParse;
try {
  const mod = require("pdf-parse");
  PDFParse = mod.PDFParse || mod;
} catch (e) {
  console.error("pdf-parse not available");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

// ── Quant topic classification ──────────────────────────────────────────────
const QUANT_TOPIC_KEYWORDS = {
  "Number System": ["prime", "integer", "divisible", "digit", "number system", "lcm", "hcf", "factorial", "remainder", "unit digit"],
  "Algebra": ["equation", "polynomial", "variable", "quadratic", "factor", "if x +", "if x =", "if a +", "expression"],
  "Geometry": ["triangle", "circle", "chord", "angle", "quadrilateral", "polygon", "diameter", "radius", "bisect", "perpendicular", "tangent", "inscribed", "circumscribed"],
  "Trigonometry": ["sin", "cos", "tan", "cot", "sec", "cosec", "trigonometr"],
  "Mensuration": ["area", "volume", "surface area", "cube", "cylinder", "cone", "sphere", "hemisphere", "prism", "cuboid"],
  "Data Interpretation": ["table", "graph", "bar", "pie chart", "data", "study the"],
  "Time & Distance": ["speed", "distance", "train", "km/h", "km per", "journey", "boat", "stream", "upstream", "downstream"],
  "Time & Work": ["work", "worker", "pipe", "cistern", "tank", "days to complete", "can do a work", "efficiency"],
  "Ratio & Proportion": ["ratio", "proportion", "is to"],
  "Percentage": ["percent", "%", "increase by", "decrease by", "discount"],
  "Profit & Loss": ["profit", "loss", "cost price", "selling price", "marked price", "cp", "sp", "mp"],
  "Simple & Compound Interest": ["interest", "principal", "amount", "rate", "compound interest", "simple interest", "per annum"],
  "Average": ["average", "mean"],
  "Simplification": ["simplify", "evaluate", "value of", "bodmas"],
  "Statistics": ["median", "mode", "standard deviation", "variance", "range", "frequency"],
};

function classifyQuantTopic(questionText) {
  const text = (questionText || "").toLowerCase();
  let best = "Arithmetic";
  let bestScore = 0;
  for (const [topic, words] of Object.entries(QUANT_TOPIC_KEYWORDS)) {
    let score = 0;
    for (const w of words) {
      if (text.includes(w)) score++;
    }
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  return best;
}

// ── English topic classification ────────────────────────────────────────────
function classifyEnglishTopic(questionText, contextHint) {
  const text = (questionText || "").toLowerCase();
  const ctx = (contextHint || "").toLowerCase();
  if (ctx.includes("passage") || ctx.includes("read the") || ctx.includes("comprehension")) return "Reading Comprehension";
  if (/synonym|antonym/.test(text)) return "Vocabulary";
  if (/fill in the blank|fill in blank|sentence completion/.test(text)) return "Fill in the Blanks";
  if (/error|grammatically|grammar/.test(text)) return "Error Detection";
  if (/spelling|spelt|misspelt/.test(text)) return "Spelling";
  if (/idiom|phrase|proverb/.test(text)) return "Idioms & Phrases";
  if (/one word|substitute/.test(text)) return "One Word Substitution";
  if (/rearrange|sentence improvement|improve/.test(text)) return "Sentence Improvement";
  if (/cloze/.test(text) || /cloze/.test(ctx)) return "Cloze Test";
  if (/active|passive|voice/.test(text)) return "Active/Passive Voice";
  if (/direct|indirect|narration/.test(text)) return "Direct/Indirect Speech";
  if (/closest meaning|similar meaning|nearest meaning/.test(text)) return "Vocabulary";
  if (ctx.includes("passage") || /passage|para/.test(text)) return "Reading Comprehension";
  return "English Language";
}

function qFingerprint(text) {
  const t = (text || "").toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  return crypto.createHash("sha1").update(t).digest("hex");
}

function isFigureDependentQuestion(text) {
  return /in the (?:given|following) (?:figure|diagram)|refer to the (?:figure|image|diagram)|as shown in the figure/i.test(text);
}

// ── Cracku PDF parser ───────────────────────────────────────────────────────
async function extractCrackuPdf(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buf });
  const r = await parser.getText();
  await parser.destroy();

  const text = r.text || "";
  const lines = text.split("\n");

  const questions = [];
  let currentPassage = "";
  let passageRange = null; // { start, end }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Detect passage instruction blocks: "Instructions [1 - 10 ]"
    const instrMatch = trimmed.match(/^Instructions?\s*\[?\s*(\d+)\s*[-–]\s*(\d+)\s*\]?/i);
    if (instrMatch) {
      passageRange = { start: parseInt(instrMatch[1]), end: parseInt(instrMatch[2]) };
      // Collect passage text until a numbered question appears
      const passageLines = [];
      let j = i + 1;
      // Skip the instruction line itself, then grab passage text
      while (j < lines.length) {
        const nl = lines[j].trim();
        // Stop when we hit a question number within range, or "Answer:" or another Instructions
        if (/^\d{1,3}\.\s/.test(nl)) break;
        if (/^Instructions?\s*\[/i.test(nl)) break;
        if (/^Downloaded from/i.test(nl)) { j++; continue; }
        if (/^--\s*\d+\s*of\s*\d+/.test(nl)) { j++; continue; }
        if (/^SSC\s+(CGL|CHSL)/i.test(nl) && nl.length < 80) { j++; continue; }
        passageLines.push(nl);
        j++;
      }
      currentPassage = passageLines.filter(l => l.length > 0).join(" ").replace(/\s+/g, " ").trim();
      continue;
    }

    // Reset passage context if we're past the range
    if (passageRange) {
      const qMatch = trimmed.match(/^(\d{1,3})\.\s/);
      if (qMatch && parseInt(qMatch[1]) > passageRange.end) {
        currentPassage = "";
        passageRange = null;
      }
    }

    // Detect question line: "N. question text..."
    const qMatch = trimmed.match(/^(\d{1,3})\.\s+(.+)/);
    if (!qMatch) continue;

    const qNum = parseInt(qMatch[1]);
    let qText = qMatch[2].trim();

    // Collect continuation lines of question text (before options)
    let j = i + 1;
    while (j < lines.length) {
      const nl = lines[j].trim();
      if (/^[A-D]\s{2,}/.test(nl)) break; // option line
      if (/^Answer:/i.test(nl)) break;
      if (/^\d{1,3}\.\s/.test(nl)) break;
      if (/^Downloaded from/i.test(nl)) { j++; continue; }
      if (/^--\s*\d+\s*of\s*\d+/.test(nl)) { j++; continue; }
      if (/^SSC\s+(CGL|CHSL)/i.test(nl) && nl.length < 80) { j++; continue; }
      if (/^Instructions?\s*\[/i.test(nl)) break;
      if (nl.length === 0) { j++; continue; }
      qText += " " + nl;
      j++;
    }

    // Now read options A, B, C, D
    const options = [];
    const optionLetters = ["A", "B", "C", "D"];
    let optIdx = 0;
    while (j < lines.length && optIdx < 4) {
      const nl = lines[j].trim();
      if (/^Downloaded from/i.test(nl) || /^--\s*\d+\s*of\s*\d+/.test(nl) || /^SSC\s+(CGL|CHSL)/i.test(nl) && nl.length < 80) {
        j++;
        continue;
      }

      // Option line: "A   text" or just text on its own line following question
      const optMatch = nl.match(new RegExp(`^${optionLetters[optIdx]}\\s{2,}(.+)`, "i"));
      if (optMatch) {
        let optText = optMatch[1].trim();
        // Option might continue on next line
        let k = j + 1;
        while (k < lines.length) {
          const nk = lines[k].trim();
          if (/^[A-D]\s{2,}/.test(nk)) break;
          if (/^Answer:/i.test(nk)) break;
          if (/^\d{1,3}\.\s/.test(nk)) break;
          if (/^Downloaded from/i.test(nk) || /^--\s*\d+\s*of\s*\d+/.test(nk)) { k++; continue; }
          if (/^SSC\s+(CGL|CHSL)/i.test(nk) && nk.length < 80) { k++; continue; }
          if (/^Instructions?\s*\[/i.test(nk)) break;
          if (nk.length === 0) { k++; continue; }
          optText += " " + nk;
          k++;
        }
        options.push(optText.replace(/\s+/g, " ").trim());
        optIdx++;
        j = k;
      } else {
        // If the line doesn't match expected option letter, it might be
        // continuation of question or garbage - skip
        j++;
        // But if we already have some options, stop looking
        if (options.length > 0) break;
      }
    }

    // Find answer line after options
    let answerIndex = -1;
    while (j < lines.length) {
      const nl = lines[j].trim();
      const ansMatch = nl.match(/^Answer:\s*([A-D])/i);
      if (ansMatch) {
        answerIndex = "ABCD".indexOf(ansMatch[1].toUpperCase());
        break;
      }
      if (/^\d{1,3}\.\s/.test(nl) || /^Instructions?\s*\[/i.test(nl)) break;
      j++;
    }

    // Clean question text
    qText = qText
      .replace(/\(SSC[^)]{0,80}\)/gi, "")
      .replace(/SSC\s+CGL\s+Free\s+Mock/gi, "")
      .replace(/Downloaded from cracku\.in/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!qText || qText.length < 10) continue;
    if (options.length < 2) continue;
    if (answerIndex < 0) continue;
    if (answerIndex >= options.length) continue;
    if (isFigureDependentQuestion(qText)) continue;

    // Build passage context for comprehension questions
    let passageContext = "";
    if (passageRange && qNum >= passageRange.start && qNum <= passageRange.end && currentPassage) {
      passageContext = currentPassage;
    }

    questions.push({
      qNum,
      question: qText,
      options,
      answerIndex,
      passageContext,
    });
  }

  return questions;
}

// ── Determine year from filename ────────────────────────────────────────────
function extractYear(filename) {
  // "SSC CGL Tier-2 8th August 2022 Maths by Cracku.pdf" -> 2022
  // "SSC CGL Tier-2 11th September 2019 English by Cracku.pdf" -> 2019
  const m = filename.match(/\b(20\d{2})\b/);
  return m ? parseInt(m[1]) : null;
}

function extractExamDate(filename) {
  // "SSC CGL Tier-2 8th August 2022" -> "8 Aug 2022"
  const m = filename.match(/(\d{1,2})(?:st|nd|rd|th)?\s*[-]?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s*[-]?\s*(20\d{2})/i);
  if (m) return `${m[1]} ${m[2].slice(0, 3)} ${m[3]}`;
  const m2 = filename.match(/(\d{1,2})[-](January|February|March|April|May|June|July|August|September|October|November|December)[-](20\d{2})/i);
  if (m2) return `${m2[1]} ${m2[2].slice(0, 3)} ${m2[3]}`;
  return null;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const bankPath = path.join(__dirname, "data", "question-bank.json");
  const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  bank.questions = Array.isArray(bank.questions) ? bank.questions : [];

  // Build fingerprint set from existing bank
  const existingFPs = new Set();
  for (const q of bank.questions) existingFPs.add(qFingerprint(q.question));
  console.log(`📦 Loaded bank: ${bank.questions.length} existing questions (${existingFPs.size} unique fingerprints)`);

  // ── Collect all Tier-2 Cracku PDFs ──
  const otherDir = path.join(__dirname, "pyq", "other");
  const allPdfs = fs.readdirSync(otherDir)
    .filter(f => f.includes("Tier-2") && f.endsWith(".pdf") && f.includes("Cracku"))
    .map(f => ({ path: path.join(otherDir, f), name: f }));

  // Skip exact duplicates (files ending with "(1).pdf" that have a non-(1) version)
  const deduped = [];
  const seen = new Set();
  for (const pdf of allPdfs) {
    const canonical = pdf.name.replace(/\s*\(1\)/, "");
    if (seen.has(canonical)) {
      console.log(`⏭️  Skipping duplicate: ${pdf.name}`);
      continue;
    }
    seen.add(canonical);
    deduped.push(pdf);
  }

  console.log(`📁 Found ${deduped.length} unique Tier-2 Cracku PDFs\n`);

  const now = new Date().toISOString();
  let totalNew = 0;
  let totalDupes = 0;
  let totalFigSkipped = 0;
  const newBySubject = { quant: 0, english: 0 };
  const allNew = [];

  for (const pdf of deduped) {
    const subject = pdf.name.toLowerCase().includes("english") ? "english" :
      pdf.name.toLowerCase().includes("maths") || pdf.name.toLowerCase().includes("quantitative") ? "quant" :
        pdf.name.toLowerCase().includes("audit") ? "quant" : "quant"; // AAO paper is mostly quant

    const year = extractYear(pdf.name);
    const examDate = extractExamDate(pdf.name);
    const examLabel = pdf.name.replace(/ by Cracku\.pdf$/i, "").replace(/\.pdf$/i, "");

    console.log(`📖 Extracting: ${pdf.name}`);
    console.log(`   Subject: ${subject} | Year: ${year} | Date: ${examDate}`);

    let questions;
    try {
      questions = await extractCrackuPdf(pdf.path);
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
      continue;
    }

    console.log(`   📊 Parsed: ${questions.length} questions with answers`);

    let newCount = 0;
    let dupeCount = 0;

    for (const q of questions) {
      const fp = qFingerprint(q.question);
      if (existingFPs.has(fp)) {
        dupeCount++;
        continue;
      }
      existingFPs.add(fp);

      const topic = subject === "quant" ? classifyQuantTopic(q.question) :
        classifyEnglishTopic(q.question, q.passageContext);

      // Build full question text (prepend passage for comprehension)
      let fullQuestion = q.question;
      if (q.passageContext && q.passageContext.length > 50) {
        fullQuestion = `[Passage] ${q.passageContext}\n\n[Question] ${q.question}`;
      }

      const entry = {
        id: `t2_${crypto.randomBytes(6).toString("hex")}`,
        type: "question",
        examFamily: "ssc",
        subject,
        difficulty: "medium",
        tier: "tier2",
        questionMode: "objective",
        topic,
        subtopic: topic,
        question: fullQuestion,
        options: q.options,
        answerIndex: q.answerIndex,
        explanation: "",
        marks: 3,
        negativeMarks: 1,
        source: {
          kind: "pyq_cracku",
          fileName: pdf.name,
          importedAt: now,
          extractedBy: "extract-tier2-cracku",
          examLabel,
          examDate,
        },
        isPYQ: true,
        year,
        frequency: 1,
        isChallengeCandidate: false,
        confidenceScore: 1.0, // clean text + explicit Answer: line
        reviewStatus: "approved",
        createdAt: now,
        updatedAt: now,
      };

      allNew.push(entry);
      newCount++;
      newBySubject[subject] = (newBySubject[subject] || 0) + 1;
    }

    totalNew += newCount;
    totalDupes += dupeCount;
    console.log(`   ✅ New: ${newCount} | Dupes: ${dupeCount}\n`);
  }

  console.log("═══════════════════════════════════════");
  console.log(`📊 EXTRACTION COMPLETE`);
  console.log(`   Total new questions: ${totalNew}`);
  console.log(`   Duplicates skipped: ${totalDupes}`);
  console.log(`   New Quant: ${newBySubject.quant}`);
  console.log(`   New English: ${newBySubject.english}`);

  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN - not saving to bank");
    console.log(`   Would add ${totalNew} questions to bank (${bank.questions.length} → ${bank.questions.length + totalNew})`);
    // Print sample
    console.log("\n📝 Sample questions:");
    allNew.slice(0, 3).forEach((q, i) => {
      console.log(`\n${i + 1}. [${q.subject}/${q.topic}] ${q.question.slice(0, 120)}`);
      q.options.forEach((o, j) => console.log(`   ${"ABCD"[j]}. ${o.slice(0, 60)}${j === q.answerIndex ? " ✓" : ""}`));
    });
    // English sample with passage
    const engPassage = allNew.find(q => q.subject === "english" && q.question.includes("[Passage]"));
    if (engPassage) {
      console.log(`\nPassage Q sample: [${engPassage.topic}] ${engPassage.question.slice(0, 200)}...`);
      engPassage.options.forEach((o, j) => console.log(`   ${"ABCD"[j]}. ${o}${j === engPassage.answerIndex ? " ✓" : ""}`));
    }
  } else {
    // Save
    bank.questions.push(...allNew);
    bank.updatedAt = now;
    fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
    console.log(`\n💾 Saved! Bank now has ${bank.questions.length} questions`);

    // Final tier2 breakdown
    const t2 = bank.questions.filter(q => q.tier === "tier2");
    const t2subj = {};
    t2.forEach(q => { t2subj[q.subject] = (t2subj[q.subject] || 0) + 1; });
    console.log("\n📈 Tier 2 breakdown:");
    Object.entries(t2subj).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`   ${s}: ${c}`));
    console.log(`   Total Tier 2: ${t2.length}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
