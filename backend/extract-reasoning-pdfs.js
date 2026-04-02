#!/usr/bin/env node
/**
 * extract-reasoning-pdfs.js
 * Extracts reasoning MCQs from:
 *   1) Cracku "Reasoning Questions for SSC CGL Tier - 2 PDF.pdf" (clean format)
 *   2) Rakesh Yadav "SSC Reasoning 7000+ Objective Questions - Bilingual.pdf" (bilingual)
 *
 * Usage:
 *   node backend/extract-reasoning-pdfs.js              # dry run
 *   node backend/extract-reasoning-pdfs.js --commit      # write to question-bank.json
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PDFParse = require("pdf-parse").PDFParse;

const DATA_DIR = path.join(__dirname, "data");
const BANK_PATH = path.join(DATA_DIR, "question-bank.json");
const PDF_DIR = path.join(__dirname, "pyq", "other");

const COMMIT = process.argv.includes("--commit");

// ── Reasoning topic classification ──────────────────────────
const REASONING_TOPICS = {
  "Analogy": /\banalogy|analogous|related\s+to|is\s+to\b/i,
  "Classification": /\bclassification|odd\s*(one|man)\s*out|does\s*not\s*belong|different\s+from\b/i,
  "Series": /\bseries|next\s+(number|term|in)|missing\s+(number|term)|sequence\b/i,
  "Coding-Decoding": /\bcod(e|ed|ing)\b.*\bdecod(e|ed|ing)\b|\bcoded\s+as\b|\bcode\s+language\b/i,
  "Blood Relations": /\bbrother|sister|father|mother|son|daughter|uncle|aunt|nephew|niece|husband|wife|grandfather|grandmother\b/i,
  "Direction & Distance": /\bdirection|north|south|east|west|left|right|distance\s+between\b/i,
  "Ranking & Arrangement": /\brank|position|sitting|arrangement|seating|row|bench|standing|order|line\b/i,
  "Syllogism": /\bsyllogism|conclusion|statement|all\s+\w+\s+are|some\s+\w+\s+are|no\s+\w+\s+(is|are)\b/i,
  "Mathematical Operations": /\bif\s+['\u2018\u2019+\-×÷=*]\s*(stands|means|represent)|interchange|signs\s+and\s+numbers|equation\s+correct\b/i,
  "Venn Diagram": /\bvenn\s*diagram|circle|region|represent\b/i,
  "Calendar": /\bcalendar|day\s+(of|on)\s+the\s+week|what\s+day|monday|tuesday|wednesday|thursday|friday|saturday|sunday\b/i,
  "Clock": /\bclock|hour\s*hand|minute\s*hand|angle\s+between.*hands|mirror\s+image.*clock|time\s+at\b/i,
  "Dice": /\bdice|die|cube|opposite\s+face|adjacent\s+face\b/i,
  "Number & Letter Series": /\b\d+\s*,\s*\d+\s*,\s*\d+|missing\s+number|what\s+comes\s+next\b/i,
  "Puzzle": /\bpuzzle|who|which\s+of\s+the\s+following\b/i,
  "Mirror & Water Image": /\bmirror\s+image|water\s+image|reflection\b/i,
  "Paper Folding & Cutting": /\bpaper\s*(folding|cutting|fold|cut)\b/i,
  "Embedded Figures": /\bembedded\s+figure|hidden\s+figure\b/i,
  "Alphabet & Word Test": /\balphabet|word\s+formation|rearrange.*word|dictionary\s+order|meaningful\s+word\b/i,
};

function classifyReasoningTopic(text) {
  for (const [topic, regex] of Object.entries(REASONING_TOPICS)) {
    if (regex.test(text)) return topic;
  }
  return "General Reasoning";
}

// ── Utility functions ───────────────────────────────────────
function fingerprint(q) {
  const raw = String(q.question || "").trim().toLowerCase().replace(/\s+/g, " ");
  return crypto.createHash("sha1").update(raw).digest("hex");
}

function isFigureDependentQuestion(text) {
  return /\b(figure|diagram|image|picture|given\s+below|refer\s+(to\s+)?the\s+(figure|image|diagram)|shown\s+(in|below)|look\s+at)\b/i.test(text);
}

function isHindiLine(line) {
  // Hindi in this PDF appears as garbled characters with sequences like:
  // dk, ds, gS, esa, vkSj, ;fn, dks, ugha, etc.
  // Also contains characters like ¡, ², ³, etc.
  const hindiPatterns = /\b(dk|ds|gS|esa|vkSj|;fn|dks|ugha|fd;k|gksrk|izdkj|rks|djrs|tkrk|vFkZ|igys|mlh)\b/;
  const garbledRatio = (line.match(/[^a-zA-Z0-9\s.,;:?!()'\-+×÷=/%&@#$*<>[\]{}|~`"]/g) || []).length / Math.max(line.length, 1);
  return hindiPatterns.test(line) || garbledRatio > 0.25;
}

function cleanOptionText(text) {
  // Options often have format: "English text/Hindi text"
  // Take the English part (before /)
  let clean = text.trim();
  const slashIdx = clean.indexOf("/");
  if (slashIdx > 0) {
    const before = clean.substring(0, slashIdx).trim();
    const after = clean.substring(slashIdx + 1).trim();
    // Use the part before / if it looks like English
    if (!isHindiLine(before) && before.length > 0) {
      clean = before;
    }
  }
  // Remove any remaining Hindi-like text
  if (isHindiLine(clean)) return null;
  return clean.trim();
}

// ── Cracku format extractor ─────────────────────────────────
async function extractCracku(pdfPath) {
  console.log(`\n📄 Extracting Cracku: ${path.basename(pdfPath)}`);
  const buf = fs.readFileSync(pdfPath);
  const doc = new PDFParse({ data: buf });
  const result = await doc.getText();
  await doc.destroy();

  const pages = result.pages || [];
  const fullText = pages.map(p => p.text).join("\n");
  const lines = fullText.split("\n");

  const questions = [];
  let i = 0;

  while (i < lines.length) {
    const qMatch = lines[i].match(/^Question\s+(\d+)\s*$/i);
    if (!qMatch) { i++; continue; }

    const qNum = parseInt(qMatch[1], 10);
    i++;

    // Collect question text
    let questionText = "";
    while (i < lines.length && !/^[A-D]\s+/.test(lines[i]) && !/^Answer:/i.test(lines[i])) {
      const line = lines[i].trim();
      if (line && !line.startsWith("Downloaded from") && !line.startsWith("Instructions")) {
        questionText += (questionText ? " " : "") + line;
      }
      i++;
    }

    // Collect options
    const options = {};
    while (i < lines.length && /^[A-D]\s+/.test(lines[i])) {
      const optMatch = lines[i].match(/^([A-D])\s+(.+)$/);
      if (optMatch) {
        options[optMatch[1].toLowerCase()] = optMatch[2].trim();
      }
      i++;
    }

    // Find answer
    let answer = null;
    while (i < lines.length) {
      const ansMatch = lines[i].match(/^Answer:\s*([A-Da-d])/i);
      if (ansMatch) {
        answer = ansMatch[1].toUpperCase();
        i++;
        break;
      }
      if (/^Question\s+\d+/i.test(lines[i])) break;
      i++;
    }

    if (questionText && answer && Object.keys(options).length >= 2) {
      if (isFigureDependentQuestion(questionText)) continue;
      questions.push({
        question: questionText,
        options,
        answer: answer.toLowerCase(),
        source: path.basename(pdfPath),
        confidence: 1.0,
      });
    }
  }

  console.log(`  Found ${questions.length} questions`);
  return questions;
}

// ── Rakesh Yadav 7000+ bilingual format extractor ───────────
async function extractRakeshYadav(pdfPath) {
  console.log(`\n📄 Extracting Rakesh Yadav: ${path.basename(pdfPath)}`);
  const buf = fs.readFileSync(pdfPath);
  const doc = new PDFParse({ data: buf });
  const result = await doc.getText();
  await doc.destroy();

  const pages = result.pages || [];
  console.log(`  ${pages.length} pages, ${pages.map(p => p.text).join("").length} chars`);

  // STEP 1: Identify answer key pages and build per-section answer maps
  // An "answer key page" has a high density of N. (X) patterns
  const sections = [];
  let currentSection = null;

  for (let pi = 0; pi < pages.length; pi++) {
    const text = pages[pi].text;
    const ansEntries = text.match(/\b(\d+)\s*[\.\)]\s*\(([a-d])\)/gi) || [];

    // Check if this page has ANSWER KEY label
    const isAnsKeyLabel = /ANSWER\s*KEY/i.test(text);

    if (isAnsKeyLabel || ansEntries.length > 8) {
      // This is an answer key page
      if (!currentSection) {
        currentSection = {
          answerKeyStartPage: pi,
          questionStartPage: Math.max(0, pi - 30), // questions are in the pages before
          answers: {},
        };
      }

      // Parse all N. (X) entries
      const re = /\b(\d+)\s*[\.\)]\s*\(([a-d])\)/gi;
      let m;
      while ((m = re.exec(text)) !== null) {
        const num = parseInt(m[1], 10);
        const letter = m[2].toLowerCase();
        // Only accept reasonable question numbers (1-500)
        if (num >= 1 && num <= 500 && !currentSection.answers[num]) {
          currentSection.answers[num] = letter;
        }
      }
    } else if (currentSection) {
      // Non-answer page after answer pages = new section boundary
      sections.push(currentSection);
      currentSection = null;
    }
  }
  if (currentSection) sections.push(currentSection);

  console.log(`  Found ${sections.length} answer key sections with ${sections.reduce((s, sec) => s + Object.keys(sec.answers).length, 0)} total answer entries`);

  // STEP 2: Build a global answer map per "question page range"
  // For each section, we know the answer key pages and the questions come before
  // We'll parse questions from ALL non-answer-key pages and match them

  // STEP 3: Parse questions from question pages
  const allQuestions = [];
  const answerKeyPages = new Set();
  for (const sec of sections) {
    for (let pi = sec.answerKeyStartPage; pi < pages.length; pi++) {
      const text = pages[pi].text;
      const entries = (text.match(/\b\d+\s*[\.\)]\s*\([a-d]\)/gi) || []).length;
      if (entries > 8 || /ANSWER\s*KEY/i.test(text)) {
        answerKeyPages.add(pi);
      } else {
        break;
      }
    }
  }

  // For each section, parse questions from pages before its answer key
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    const prevEnd = si > 0 ? sections[si - 1].answerKeyStartPage : 0;

    // Question pages are between prevEnd and sec.answerKeyStartPage
    const startPage = Math.max(prevEnd, sec.answerKeyStartPage - 50);
    const endPage = sec.answerKeyStartPage;

    const sectionQuestions = extractQuestionsFromPages(pages, startPage, endPage, answerKeyPages);

    // Match with answers
    for (const q of sectionQuestions) {
      const answer = sec.answers[q.num];
      if (answer) {
        q.answer = answer;
        allQuestions.push(q);
      }
    }
  }

  console.log(`  Extracted ${allQuestions.length} questions with matched answers`);
  return allQuestions;
}

function extractQuestionsFromPages(pages, startPage, endPage, answerKeyPages) {
  const questions = [];

  for (let pi = startPage; pi < endPage; pi++) {
    if (answerKeyPages.has(pi)) continue;

    const text = pages[pi].text;
    const lines = text.split("\n");

    let i = 0;
    while (i < lines.length) {
      // Look for question start: N. (with 1-3 digit number followed by . or ))
      const qMatch = lines[i].match(/^(\d{1,3})\.\s+(.+)/);
      if (!qMatch) { i++; continue; }

      const qNum = parseInt(qMatch[1], 10);
      if (qNum < 1 || qNum > 500) { i++; continue; }

      let questionLines = [qMatch[2].trim()];
      i++;

      // Collect more question text until we hit options
      while (i < lines.length) {
        const line = lines[i].trim();
        if (/^\([a-d]\)\s/i.test(line)) break;
        if (/^\d{1,3}\.\s/.test(line)) break;
        if (!line || line.startsWith("Rakesh Yadav") || /ANSWER\s*KEY/i.test(line)) break;
        questionLines.push(line);
        i++;
      }

      // Now parse options
      const options = {};
      while (i < lines.length) {
        const line = lines[i].trim();
        const optMatch = line.match(/^\(([a-d])\)\s+(.+)/i);
        if (!optMatch) break;

        const key = optMatch[1].toLowerCase();
        let optText = optMatch[2].trim();

        // Check if multiple options are on same line
        // Pattern: (a) Text   (b) Text
        const multiOpt = line.match(/\(([a-d])\)\s+(.+?)\s{2,}\(([a-d])\)\s+(.+)/i);
        if (multiOpt) {
          options[multiOpt[1].toLowerCase()] = cleanOptionText(multiOpt[2]) || multiOpt[2].trim();
          options[multiOpt[3].toLowerCase()] = cleanOptionText(multiOpt[4]) || multiOpt[4].trim();
          i++;

          // Check next line for more inline options
          if (i < lines.length) {
            const nextMulti = lines[i].trim().match(/\(([a-d])\)\s+(.+?)\s{2,}\(([a-d])\)\s+(.+)/i);
            if (nextMulti) {
              options[nextMulti[1].toLowerCase()] = cleanOptionText(nextMulti[2]) || nextMulti[2].trim();
              options[nextMulti[3].toLowerCase()] = cleanOptionText(nextMulti[4]) || nextMulti[4].trim();
              i++;
            } else {
              const singleOpt = lines[i].trim().match(/^\(([a-d])\)\s+(.+)/i);
              if (singleOpt) {
                options[singleOpt[1].toLowerCase()] = cleanOptionText(singleOpt[2]) || singleOpt[2].trim();
                i++;
              }
            }
          }
          continue;
        }

        options[key] = cleanOptionText(optText) || optText.trim();
        i++;
      }

      // Build question text - filter Hindi lines
      const englishLines = questionLines.filter(l => !isHindiLine(l));
      const questionText = englishLines.join(" ").replace(/\s+/g, " ").trim();

      if (!questionText || questionText.length < 5) continue;
      if (Object.keys(options).length < 2) continue;
      if (isFigureDependentQuestion(questionText)) continue;

      // Clean options - remove any that are null (Hindi only)
      const cleanOptions = {};
      for (const [k, v] of Object.entries(options)) {
        const cleaned = typeof v === "string" ? v : null;
        if (cleaned) cleanOptions[k] = cleaned;
      }

      if (Object.keys(cleanOptions).length < 2) continue;

      questions.push({
        num: qNum,
        question: questionText,
        options: cleanOptions,
        source: "SSC Reasoning 7000+ Objective Questions - Bilingual.pdf",
        confidence: 1.0,
      });
    }
  }

  return questions;
}

// ── Main ────────────────────────────────────────────────────
(async () => {
  try {
    // Load existing bank
    const bankRaw = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
    const existingQuestions = Array.isArray(bankRaw.questions) ? bankRaw.questions : [];

    // Build existing fingerprint set for dedup
    const existingFP = new Set(existingQuestions.map(q => fingerprint(q)));
    console.log(`📚 Existing bank: ${existingQuestions.length} questions`);

    let allNew = [];

    // 1) Cracku Reasoning PDF
    const crackuPath = path.join(PDF_DIR, "Reasoning Questions for SSC CGL Tier - 2 PDF.pdf");
    if (fs.existsSync(crackuPath)) {
      const cracku = await extractCracku(crackuPath);
      for (const q of cracku) {
        const entry = {
          question: q.question,
          options: q.options,
          answer: q.answer,
          subject: "reasoning",
          tier: "tier2",
          difficulty: "medium",
          topic: classifyReasoningTopic(q.question),
          isPYQ: true,
          source: q.source,
          confidence: q.confidence,
          reviewStatus: "approved",
        };
        if (!existingFP.has(fingerprint(entry))) {
          allNew.push(entry);
          existingFP.add(fingerprint(entry));
        }
      }
    }

    // 2) Rakesh Yadav 7000+ PDF
    const ryPath = path.join(PDF_DIR, "SSC Reasoning 7000+ Objective Questions - Bilingual.pdf");
    if (fs.existsSync(ryPath)) {
      const ry = await extractRakeshYadav(ryPath);
      for (const q of ry) {
        const entry = {
          question: q.question,
          options: q.options,
          answer: q.answer,
          subject: "reasoning",
          tier: "tier2",
          difficulty: "medium",
          topic: classifyReasoningTopic(q.question),
          isPYQ: false,
          source: q.source,
          confidence: q.confidence,
          reviewStatus: "approved",
        };
        if (!existingFP.has(fingerprint(entry))) {
          allNew.push(entry);
          existingFP.add(fingerprint(entry));
        }
      }
    }

    // Also try the other copy if it exists (dedup will handle overlap)
    const ryPath2 = path.join(PDF_DIR, "Rakesh Yadav Reasoning Book Pdf.pdf");
    if (fs.existsSync(ryPath2)) {
      const ry2 = await extractRakeshYadav(ryPath2);
      for (const q of ry2) {
        const entry = {
          question: q.question,
          options: q.options,
          answer: q.answer,
          subject: "reasoning",
          tier: "tier2",
          difficulty: "medium",
          topic: classifyReasoningTopic(q.question),
          isPYQ: false,
          source: q.source,
          confidence: q.confidence,
          reviewStatus: "approved",
        };
        if (!existingFP.has(fingerprint(entry))) {
          allNew.push(entry);
          existingFP.add(fingerprint(entry));
        }
      }
    }

    // Summary
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 EXTRACTION SUMMARY`);
    console.log(`${"=".repeat(60)}`);
    console.log(`  New unique questions: ${allNew.length}`);

    // Topic breakdown
    const topicCounts = {};
    for (const q of allNew) {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    }
    console.log(`\n  Topic breakdown:`);
    for (const [topic, count] of Object.entries(topicCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${topic}: ${count}`);
    }

    // Show some samples
    console.log(`\n  Sample questions:`);
    for (let i = 0; i < Math.min(5, allNew.length); i++) {
      const q = allNew[i];
      console.log(`    [${q.topic}] ${q.question.substring(0, 100)}...`);
      console.log(`      Options: ${Object.entries(q.options).map(([k, v]) => `(${k}) ${v}`).join(" | ")}`);
      console.log(`      Answer: (${q.answer})`);
    }

    if (COMMIT) {
      const merged = [...existingQuestions, ...allNew];
      const output = {
        updatedAt: new Date().toISOString(),
        questions: merged,
      };
      fs.writeFileSync(BANK_PATH, JSON.stringify(output, null, 2), "utf8");
      console.log(`\n✅ COMMITTED: ${allNew.length} new questions added`);
      console.log(`📚 Total bank: ${merged.length} questions`);
    } else {
      console.log(`\n🔍 DRY RUN — use --commit to write to question-bank.json`);
    }
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
})();
