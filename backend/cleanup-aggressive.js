/**
 * Aggressive question bank cleanup.
 * Removes: merged questions, OCR garbage, garbled options,
 * truncated text, chart/table refs, incomplete questions.
 * Run with --save to overwrite question-bank.json.
 */
const fs = require("fs");
const path = require("path");

const BANK = path.join(__dirname, "data/question-bank.json");
const qb = JSON.parse(fs.readFileSync(BANK, "utf8"));
const qs = qb.questions;

const reasons = {};

function reject(reason) {
  reasons[reason] = (reasons[reason] || 0) + 1;
  return reason;
}

// ── STEP 1: Clean fixable text issues ──────────────────────
function cleanText(txt) {
  // Remove embedded SSC exam citations: (SSC CGL 2017), (SSC CHSL 2019-20), etc.
  txt = txt.replace(/\s*\(SSC\s+[^)]{3,40}\)\s*/gi, " ");
  // Remove embedded RRB citations
  txt = txt.replace(/\s*\(RRB\s+[^)]{3,40}\)\s*/gi, " ");
  // Remove trailing "A B C D" answer markers
  txt = txt.replace(/\s+[A-D]\s+[A-D]\s+[A-D]\s+[A-D]\s*$/, "");
  // Remove trailing "Question Type :" metadata
  txt = txt.replace(/\s*Question Type\s*:.*$/i, "");
  // Remove page numbers and chapter refs at end
  txt = txt.replace(/\s*-+\s*\d+\s*(of|\/)\s*\d+\s*$/, "");
  // Remove trailing URL junk
  txt = txt.replace(/\s*https?:\/\/\S+\s*/g, " ");
  // Collapse multiple spaces
  txt = txt.replace(/\s{2,}/g, " ").trim();
  return txt;
}

function cleanOption(opt) {
  let t = String(opt || "").trim();
  // Remove embedded SSC/RRB citations from options
  t = t.replace(/\s*\(SSC\s+[^)]{3,40}\)\s*/gi, " ");
  t = t.replace(/\s*\(RRB\s+[^)]{3,40}\)\s*/gi, " ");
  // Remove "Question Type : MCQ" metadata leaked into options
  t = t.replace(/\s*Question Type\s*:.*$/i, "");
  // Remove trailing stray single letter that's an answer marker
  t = t.replace(/\s+[A-D]\s*$/, "");
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

// Pre-clean all questions
for (const q of qs) {
  q.question = cleanText(q.question);
  q.options = q.options.map(cleanOption);
}

function isGarbageOption(opt) {
  const t = String(opt || "").trim();
  if (t.length === 0) return true;
  // Option too long (merged with next question text)
  if (t.length > 100) return true;
  // Has formula/table junk: multiple pipes, long dashes
  if (/[\|]{2,}|[─━═]{2,}/.test(t)) return true;
  // OCR junk characters in option
  if (/[«»©®™§¶△▲◯□◆∠𝑠𝑖𝑛𝑐𝑜]/.test(t)) return true;
  // High ratio of non-alphanumeric chars (OCR noise)
  const clean = (t.match(/[a-zA-Z0-9₹%°.,/\s\-()'"]/g) || []).length;
  if (t.length > 8 && clean / t.length < 0.6) return true;
  // Contains obvious OCR math junk patterns
  if (/[△▲◯□◆∠]{2,}/.test(t)) return true;
  // Multiple sentences in one option (merged text)
  if ((t.match(/\.\s+[A-Z]/g) || []).length >= 2) return true;
  // Option contains question text (a question mark in the option)
  if (/\?/.test(t) && t.length > 30) return true;
  return false;
}

function checkQuestion(q) {
  const txt = String(q.question || "").trim();
  const opts = Array.isArray(q.options) ? q.options.map(o => String(o || "").trim()) : [];
  const validOpts = opts.filter(o => o.length > 0);
  const ai = q.answerIndex;

  // === BASIC CHECKS ===

  if (txt.length < 15) return reject("too-short");
  if (validOpts.length < 4) return reject("less-than-4-options");
  if (!Number.isFinite(ai) || ai < 0 || ai >= validOpts.length) return reject("bad-answer-index");

  // === OPTION QUALITY ===

  // Any garbled option
  if (opts.slice(0, 4).some(isGarbageOption)) return reject("garbled-option");

  // All options identical
  if (new Set(opts.slice(0, 4).map(o => o.toLowerCase())).size < 3) return reject("duplicate-options");

  // === QUESTION TEXT QUALITY ===

  // Options-as-text
  if (/^\(?[a-d]\)?\s*\d+[\.\s]/.test(txt) && txt.length < 80 &&
      !/[?]|find|what|which|how|calculate/i.test(txt)) return reject("options-as-text");

  // Answer key pattern
  if (/^\d+\.\s*\(?[a-d]\)?\s*\d+\.\s*\(?[a-d]\)?/.test(txt)) return reject("answer-key");

  // Fragment start
  if (/^(and |but |or |so |then |also |still |hence |therefore |thus |nor )/i.test(txt))
    return reject("fragment-start");

  // Non-english (Hindi OCR garbage)
  const alphaChars = (txt.match(/[a-zA-Z]/g) || []).length;
  if (alphaChars < 5 && txt.length > 10) return reject("non-english");

  // Garbled OCR: very low vowel ratio
  if (alphaChars >= 10) {
    const vowels = (txt.match(/[aeiouAEIOU]/g) || []).length;
    if (vowels / alphaChars < 0.12) return reject("garbled-consonants");
  }

  // Too many single-char words (fragmented OCR)
  const words = txt.split(/\s+/);
  const singleAlpha = words.filter(w => w.length === 1 && /[a-zA-Z]/.test(w)).length;
  if (words.length > 5 && singleAlpha > words.length * 0.25 && singleAlpha >= 4)
    return reject("garbled-fragments");

  // === MERGED QUESTIONS ===
  // Multiple question marks in text = merged questions
  const qMarks = (txt.match(/\?/g) || []).length;
  if (qMarks >= 2 && txt.length > 150) return reject("merged-questions");

  // Very long question (>350 chars) without being a passage
  if (txt.length > 350 && !/\[passage\]|passage|comprehension|read the following/i.test(txt))
    return reject("too-long-merged");

  // Contains multiple full sentences jammed together (merged from OCR)
  const sentences = txt.split(/\.\s+[A-Z]/).length;
  if (sentences >= 5 && txt.length > 250 && !/passage|comprehension/i.test(txt))
    return reject("merged-sentences");

  // Contains embedded SSC exam citation mid-text (should have been cleaned but wasn't)
  if (/\(SSC\s+(?:CGL|CHSL|MTS|CPO|Sub|GD|JE)\b/.test(txt)) return reject("leftover-citation");

  // === TABLE/CHART/DI GARBAGE ===
  // Contains table drawing characters
  if (/[\|]{2,}|[─━═\-]{5,}|\+\-\-\-|\-\-\-\+/.test(txt)) return reject("table-chars");

  // Data interpretation questions referencing charts/tables/graphs that can't be shown
  if (/(?:the following|given|above)\s*(?:table|chart|graph|diagram|figure|bar|pie|line)/i.test(txt) &&
      !/\d+\s*%|\d+\s*,\s*\d+/.test(txt.substring(0, 100)))
    return reject("chart-reference");

  // === OCR SPECIAL CHAR GARBAGE ===
  // High density of OCR artifacts (©, ®, non-ASCII math junk) — but allow ° and × in math
  const ocrJunk = (txt.match(/[©®™§¶«»÷△▲◯□◆∠≠≤≥∞√π]/g) || []).length;
  if (ocrJunk > 3) return reject("ocr-special-chars");
  // × is OK in math but not if there are other junk chars too
  const multiplyCount = (txt.match(/×/g) || []).length;
  if (ocrJunk > 0 && multiplyCount > 2) return reject("ocr-special-chars");

  // Tilde used as rupee symbol (~80, ~720) — indicates OCR couldn't parse ₹
  // combined with other garble
  const tildeNums = (txt.match(/~\s*\d/g) || []).length;
  if (tildeNums >= 2 && ocrJunk > 0) return reject("ocr-rupee-garble");

  // === INCOMPLETE / TRUNCATED ===
  // Question ends abruptly (not with ? . : ) digit letter " ')
  const lastChar = txt[txt.length - 1];
  if (!/[?.:)\]0-9a-zA-Z'""%₹\u201C\u201D\u2018\u2019]/.test(lastChar)) return reject("incomplete-ending");

  // Question starts mid-sentence (lowercase start, no question word)
  if (/^[a-z]/.test(txt) && !/^(a |an |the |if |in |on |at |by |to |for |of |or |is |it |its |he |she |we )/i.test(txt))
    return reject("mid-sentence-start");

  // === Hindi mixed in English text ===
  // Has Devanagari
  if (/[\u0900-\u097F]/.test(txt)) return reject("hindi-mixed");
  // Common Hindi OCR transliteration patterns
  if (/\b[vdkfg][kSs][jJh]\b|\bdks\b|\bgS\b|\besa\b|\bdk\b|\bvkSj\b/.test(txt))
    return reject("hindi-transliteration");
  // Hindi transliteration in same question (backtick + special char patterns)
  if (/[`'"][A-Z][a-z]*[\`']/.test(txt) === false && /[\`][a-zA-Z]{2,}/.test(txt))
    return reject("hindi-transliteration");
  // Long Hindi-like sequences: consonant clusters without vowels
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(txt)) {
    const longConsonants = txt.match(/[bcdfghjklmnpqrstvwxyz]{5,}/gi) || [];
    if (longConsonants.length >= 2) return reject("hindi-transliteration");
  }

  // === PASSAGE QUALITY CHECK ===
  // Passage questions should be long enough to be useful
  if (/\[passage\]/i.test(txt) && txt.length < 80) return reject("empty-passage");

  // === MATH FORMULA GARBLE ===
  // $$...$$ LaTeX that renders as garbage in plain text
  if (/\$\$/.test(txt)) return reject("latex-formula");

  // Math symbols that are OCR noise: 𝑠𝑖𝑛 𝑐𝑜𝑠 etc (mathematical italic)
  if (/[\uD835]|[\u{1D400}-\u{1D7FF}]/u.test(txt)) return reject("math-italic-garble");

  // Question has two different numbers jammed: "days 77, Two pipes" pattern
  if (/\d+[,.]?\s*(?:Two|Three|Four|Five|A |An |The |If )[A-Z]/.test(txt) && txt.length > 150)
    return reject("jammed-questions");

  // Trailing metadata appended to question
  if (/Question Type\s*:/i.test(txt)) return reject("trailing-metadata");
  if (/SSC\s+(?:CGL|CHSL|MTS|CPO|Sub\s*Inspector)\s+\d{4}/i.test(txt) && txt.length > 200)
    return reject("trailing-metadata");

  return null; // passes all checks
}

// Process all questions
const kept = [];
const removed = [];

for (const q of qs) {
  const reason = checkQuestion(q);
  if (reason) {
    removed.push({ reason, id: q.id, q: q.question.substring(0, 80), topic: q.topic });
  } else {
    kept.push(q);
  }
}

// Report
console.log(`Total: ${qs.length}`);
console.log(`Removed: ${removed.length}`);
console.log(`Kept: ${kept.length}`);
console.log(`\nRemoval reasons:`);
Object.entries(reasons).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => console.log(`  ${r}: ${c}`));

const subjCount = {};
kept.forEach(q => { subjCount[q.subject] = (subjCount[q.subject] || 0) + 1; });
console.log(`\nKept by subject:`);
Object.entries(subjCount).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${s}: ${c}`));

const topicCount = {};
kept.forEach(q => { topicCount[q.topic || "General"] = (topicCount[q.topic || "General"] || 0) + 1; });
console.log(`\nKept by topic:`);
Object.entries(topicCount).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));

// Samples
for (const reason of ["garbled-option", "merged-questions", "too-long-merged", "incomplete-ending", "hindi-transliteration", "ocr-special-chars"]) {
  const samples = removed.filter(r => r.reason === reason).slice(0, 3);
  if (samples.length) {
    console.log(`\n--- ${reason} ---`);
    samples.forEach(s => console.log(`  ${s.q}`));
  }
}

// Random sample of kept questions for manual review
console.log("\n=== RANDOM SAMPLE OF KEPT (10) ===");
for (let i = 0; i < 10; i++) {
  const q = kept[Math.floor(Math.random() * kept.length)];
  console.log(`${i + 1}. [${q.subject}/${q.topic}] ${q.question.substring(0, 120)}`);
  console.log(`   A:${q.options[0]?.substring(0, 40)} B:${q.options[1]?.substring(0, 40)} C:${q.options[2]?.substring(0, 40)} D:${q.options[3]?.substring(0, 40)}`);
}

// Save if --save flag
if (process.argv.includes("--save")) {
  const cleaned = { ...qb, questions: kept, updatedAt: new Date().toISOString() };
  fs.writeFileSync(BANK, JSON.stringify(cleaned, null, 2), "utf8");
  console.log(`\n✅ Saved cleaned question-bank.json with ${kept.length} questions`);
}
