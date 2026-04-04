/**
 * Final thorough question bank cleanup.
 * 1. Validates every question + every option character-by-character
 * 2. Removes standalone DI / Passage / Cloze questions (need sets)
 * 3. Groups DI and Passage questions into proper sets of 5
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

// ── Clean fixable text ─────────────────────────────────────
function cleanText(txt) {
  txt = txt.replace(/\s*\(SSC\s+[^)]{3,50}\)\s*/gi, " ");
  txt = txt.replace(/\s*\(RRB\s+[^)]{3,50}\)\s*/gi, " ");
  txt = txt.replace(/\s*\[(?:SSC|IBPS|SBI|RRB)[^\]]{3,50}\]\s*/gi, " ");
  txt = txt.replace(/\s+[A-D]\s+[A-D]\s+[A-D]\s+[A-D]\s*$/, "");
  txt = txt.replace(/\s*Question Type\s*:.*$/i, "");
  txt = txt.replace(/\s*Question\s*ID\s*:\s*\d+\s*/gi, "");
  txt = txt.replace(/\s*Status\s*:\s*(Answered|Not Answered|Marked|Review).*$/gi, "");
  txt = txt.replace(/\s*Chosen\s*Opt(ion)?.*$/gi, "");
  txt = txt.replace(/\s+Ans\.?\s*$/i, "");
  // Timer metadata: "TTA : 20 Seconds" etc.
  txt = txt.replace(/\s*TTA\s*:\s*\d+\s*Seconds?\s*/gi, "");
  txt = txt.replace(/\s*Time\s*Taken\s*:\s*\d+\s*Secs?\s*/gi, "");
  txt = txt.replace(/\s*-+\s*\d+\s*(of|\/)\s*\d+\s*-+\s*$/g, "");
  txt = txt.replace(/\s*https?:\/\/\S+/g, "");
  txt = txt.replace(/\s*www\.\S+/g, "");
  txt = txt.replace(/\s{2,}/g, " ").trim();
  return txt;
}

function cleanOption(opt) {
  let t = String(opt || "").trim();
  t = t.replace(/\s*\(SSC\s+[^)]{3,50}\)\s*/gi, " ");
  t = t.replace(/\s*\(RRB\s+[^)]{3,50}\)\s*/gi, " ");
  t = t.replace(/\s*\[(?:SSC|IBPS|SBI|RRB)[^\]]{3,50}\]\s*/gi, " ");
  t = t.replace(/\s*Question Type\s*:.*$/i, "");
  t = t.replace(/\s*Question\s*ID\s*:\s*\d+\s*/gi, "");
  t = t.replace(/\s*Status\s*:\s*(Answered|Not Answered|Marked|Review).*$/gi, "");
  t = t.replace(/\s*Chosen\s*Opt(ion)?.*$/gi, "");
  t = t.replace(/\s+Ans\.?\s*$/i, "");
  t = t.replace(/\s*https?:\/\/\S+/g, "");
  t = t.replace(/\s*www\.\w+\.\w+\S*/g, "");
  t = t.replace(/\s+[A-D]\s*$/, "");
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

// Pre-clean
for (const q of qs) {
  q.question = cleanText(q.question);
  q.options = q.options.map(cleanOption);
}

// ── Option quality check ───────────────────────────────────
function isOptionBad(opt) {
  const t = String(opt || "").trim();
  if (t.length === 0) return "empty";
  if (t.length > 100) return "too-long";
  // Pipe/URL junk
  if (/\|/.test(t)) return "pipe";
  // OCR junk characters
  if (/[«»©®™§¶△▲◯□◆∠𝑠𝑖𝑛𝑐𝑜€æöçèøü¢£¥¤]/.test(t)) return "ocr-junk";
  // Hindi/Devanagari
  if (/[\u0900-\u097F]/.test(t)) return "hindi";
  // Empty brackets
  if (/\(\s*\)|\[\s*\]/.test(t)) return "empty-brackets";
  // Symbol-only options (just dashes, equals, arrows, punctuation)
  if (/^[=—\-–<>.,;:!@#$%^&*_~`'"()\[\]{}|\\\/\s]+$/.test(t)) return "symbol-only";
  // High noise ratio
  const clean = (t.match(/[a-zA-Z0-9₹%°.,/\s\-+()'"!;:×÷=<>^²³√]/g) || []).length;
  if (t.length > 8 && clean / t.length < 0.65) return "noise";
  // Has @) or similar OCR bracket junk
  if (/@\)|\(\)|0\)\s|1[A-Z]\s|[A-Z]\d[A-Z]/.test(t) && t.length > 5) return "ocr-bracket-junk";
  // Multiple sentences = merged text
  if ((t.match(/\.\s+[A-Z]/g) || []).length >= 2 && t.length > 50) return "multi-sentence";
  // Contains question mark and is long = merged question
  if (/\?/.test(t) && t.length > 35) return "has-question";
  // Contains "LEVEL" or "Questions" metadata
  if (/LEVEL\s*\d|Questions\s+https?/i.test(t)) return "metadata";
  // Contains amzn.to or similar URLs leftover
  if (/amzn\.to|bit\.ly|goo\.gl/i.test(t)) return "url";
  // Underscore junk (OCR artifacts like "XUY_yUe_ 427%")
  if (/_[a-zA-Z]|[a-zA-Z]_/.test(t) && (t.match(/_/g) || []).length >= 2) return "underscore-junk";
  // Trailing junk digit after unit (like "154sq. cm 1" — the "1" is garbled)
  if (/\d+\s*(?:sq|cm|m|kg|km|hr|min)\S*\s+\d{1}$/i.test(t)) return "trailing-junk-digit";
  // OCR bracket artifacts in options
  if (/@\)/.test(t)) return "ocr-bracket";
  // OCR number-letter jams in options (like "I5days", "Sdays")
  if (/[A-Z]\d[a-z]{3,}|^\d[a-z]{4,}/i.test(t) && t.length < 15) return "ocr-number-letter-jam";
  // Hindi transliteration in option (izkFkZuk, vknj, J¼katyh etc.)
  if (/[kzj]{3,}|vknj|izkFk|J¼k|fliQk|xqM|nsuk|\+/.test(t) && /[kgjtnp]{2,}/i.test(t)) return "hindi-translit";  // English/Hindi transliteration pairs separated by "/" (like "Kathakali/dFkdyh")
  if (/\/[a-zA-Z]{2,}/.test(t) && (/[kgjtnp]{3,}/i.test(t) || /[A-Z][a-z]+\/[a-z]+$/i.test(t) && !/http|www/i.test(t)))
    return "hindi-translit";  // Ends with "Ans:" metadata
  if (/Ans:\s*$/i.test(t)) return "ans-metadata";
  // Fifth option marker "(e)" leaked into options (bad PDF parsing)
  if (/\(e\)\s*(None|none|N\/A|NA)/i.test(t)) return "fifth-option-leak";
  // Merged option: "number (letter) number" pattern like "25% (ce) 30%"
  if (/\d+\s*\([a-e]{1,2}\)\s*\d+/.test(t)) return "merged-option-marker";
  // Exam metadata in options ("Status", "Chosen Option", "Answered")
  if (/Status\s*:|Chosen\s*Opt|Answered|Not Answered/i.test(t)) return "exam-metadata";
  // Garbled OCR: common substitutions like "trne" for "true", "Vhich" for "Which"
  if (/\btrne\b|\bVhich\b|\bBvis\b|\btbe\b|\bwie\b|\bber\b|\bbave\b/i.test(t) && t.length > 3) return "ocr-typo";
  return null;
}

// ── Question text quality check ────────────────────────────
function checkQuestion(q) {
  const txt = String(q.question || "").trim();
  const opts = q.options.map(o => String(o || "").trim());
  const validOpts = opts.filter(o => o.length > 0);
  const ai = q.answerIndex;

  // Basic
  if (txt.length < 20) return reject("too-short");
  if (validOpts.length < 4) return reject("less-than-4-options");
  if (!Number.isFinite(ai) || ai < 0 || ai >= validOpts.length) return reject("bad-answer-index");

  // Option quality
  for (let i = 0; i < 4; i++) {
    const bad = isOptionBad(opts[i]);
    if (bad) return reject("option-" + bad);
  }

  // Duplicate options (exact match — at least 2 pairs or any identical pair)
  const lcOpts = opts.slice(0, 4).map(o => o.toLowerCase().trim());
  if (new Set(lcOpts).size < 4) return reject("duplicate-options");

  // Answer key / options-as-text
  if (/^\(?[a-d]\)?\s*\d+[\.\s]/.test(txt) && txt.length < 80 &&
      !/[?]|find|what|which|how|calculate/i.test(txt)) return reject("options-as-text");
  if (/^\d+\.\s*\(?[a-d]\)?\s*\d+\.\s*\(?[a-d]\)?/.test(txt)) return reject("answer-key");

  // Fragment start
  if (/^(and |but |or |so |then |also |still |hence |therefore |thus |nor )/i.test(txt))
    return reject("fragment-start");

  // Non-english
  const alphaChars = (txt.match(/[a-zA-Z]/g) || []).length;
  if (alphaChars < 5 && txt.length > 10) return reject("non-english");

  // Garbled consonants
  if (alphaChars >= 10) {
    const vowels = (txt.match(/[aeiouAEIOU]/g) || []).length;
    if (vowels / alphaChars < 0.12) return reject("garbled-consonants");
  }

  // Too many single-char words
  const words = txt.split(/\s+/);
  const singleAlpha = words.filter(w => w.length === 1 && /[a-zA-Z]/.test(w)).length;
  if (words.length > 5 && singleAlpha > words.length * 0.25 && singleAlpha >= 4)
    return reject("garbled-fragments");

  // Hindi / Devanagari
  if (/[\u0900-\u097F]/.test(txt)) return reject("hindi-mixed");
  // Hindi OCR transliteration
  if (/\bdks\b|\bgS\b|\bvkSj\b|\besa\b|\bdk\b|\bfodkl\b|\beR;q\b|\bcrkb\b|\brc\b(?=\s+[A-Z])/.test(txt)) return reject("hindi-translit");
  // Hindi transliteration at end of question (like ";fn AT = 20" or "crkb,A")
  if (/;fn\s|[a-z]{3,},\s*[A-Z]$/.test(txt) && /[aeioukgjtn]{4,}/i.test(txt.slice(-30))) return reject("hindi-translit-tail");
  // Semicolons used mid-word (Hindi transliteration characteristic: ";k", ";q", "#i;k")
  if (/;[a-zA-Z]|[a-zA-Z];[a-zA-Z]|#[a-zA-Z]{2,}/.test(txt) && !/\s;\s/.test(txt))
    return reject("hindi-translit-semicolon");
  // Hindi transliteration with + signs (like "igkM+", "Hksaxk")
  if (/[a-zA-Z]\+/.test(txt) && /[kgjtnp]{3,}/i.test(txt))
    return reject("hindi-translit-plus");
  // Hindi transliteration after question mark (bilingual format: "English? Hindi transliteration")
  const afterQ = txt.split("?").slice(1).join("?");
  if (afterQ.length > 10) {
    const afterAlpha = (afterQ.match(/[a-zA-Z]/g) || []).length;
    const afterVowels = (afterQ.match(/[aeiouAEIOU]/g) || []).length;
    if (afterAlpha >= 8 && afterVowels / afterAlpha < 0.25)
      return reject("hindi-after-question");
  }
  // Long consonant clusters (Hindi transliteration)
  const longCons = txt.match(/[bcdfghjklmnpqrstvwxyz]{5,}/gi) || [];
  if (longCons.length >= 2) return reject("hindi-translit");

  // Merged questions (2+ question marks and long)
  const qMarks = (txt.match(/\?/g) || []).length;
  if (qMarks >= 2 && txt.length > 150) return reject("merged-questions");

  // Very long non-passage
  if (txt.length > 350 && !/\[passage\]|passage|comprehension|read the following/i.test(txt))
    return reject("too-long-merged");

  // Merged sentences
  const sentCount = txt.split(/\.\s+[A-Z]/).length;
  if (sentCount >= 5 && txt.length > 250 && !/passage|comprehension/i.test(txt))
    return reject("merged-sentences");

  // Table/chart characters
  if (/[\|]{2,}|[─━═\-]{5,}|\+\-\-\-/.test(txt)) return reject("table-chars");

  // Chart/table reference without inline data
  if (/(?:the |given |above |following )(?:table|chart|graph|bar|pie|diagram|figure)/i.test(txt) &&
      !/\d+\s*[%₹,]\s*\d+/.test(txt.substring(0, 80)))
    return reject("chart-reference");

  // OCR special chars (allow °, ×, ÷, √, π for math)
  const ocrJunk = (txt.match(/[©®™§¶«»△▲◯□◆∠≠≤≥∞æöçèøü¢£¥¤]/g) || []).length;
  if (ocrJunk >= 1) return reject("ocr-special-chars");
  // OCR bracket artifacts in question text
  if (/@\)/.test(txt)) return reject("ocr-bracket-in-text");

  // LaTeX
  if (/\$\$/.test(txt)) return reject("latex-formula");
  // Math italic unicode
  if (/[\uD835]|[\u{1D400}-\u{1D7FF}]/u.test(txt)) return reject("math-italic");

  // Garbled rupee (backtick or tilde instead of ₹)
  if (/[`~]\s*\d/.test(txt) && !/₹/.test(txt) && /price|cost|sell|buy|invest|salary|income|loss|profit|earn|wage|pay|₹|Rs/i.test(txt))
    return reject("garbled-rupee");
  // Backtick rupee in options
  const backtickOpts = opts.filter(o => /^[`~]\s*[\d,]+/.test(o.trim()) || /[`]\s*\d/.test(o));
  if (backtickOpts.length >= 2) return reject("garbled-rupee-options");

  // Chapter/page metadata
  if (/CHAPTER\s|-- \d+ of \d+ --|Page\s+\d+\s+of/i.test(txt)) return reject("chapter-metadata");

  // Incomplete ending
  const lastChar = txt[txt.length - 1];
  if (!/[?.:)\]0-9a-zA-Z'""%₹\u201C\u201D\u2018\u2019]/.test(lastChar))
    return reject("incomplete-ending");

  // Mid-sentence start (lowercase, not a known valid starter)
  if (/^[a-z]/.test(txt) && !/^(a |an |the |if |in |on |at |by |to |for |or |is |it |its |he |she |we |sin|cos|tan|log)/i.test(txt))
    return reject("mid-sentence-start");

  // Trailing SSC citation that wasn't fully cleaned
  if (/SSC\s+(CGL|CHSL|MTS|CPO|Sub|GD)\s+\d{4}/i.test(txt)) return reject("leftover-citation");
  // SSC citation in brackets still present [SSC CGL-2012]
  if (/\[SSC\s+/i.test(txt)) return reject("leftover-citation-bracket");
  // SBI/IBPS/RRB citations leftover (handle both space and dash after name)
  if (/\[(?:SBI|IBPS|RRB)[\s\-]/i.test(txt) || /\((?:SBI|IBPS)[\s\-]\w+-?\d{4}\)/i.test(txt))
    return reject("leftover-bank-citation");

  // Jammed words (OCR missed spaces): "coneofheight", "Thesmallest", "Ifthe"
  // Look for lowercase-uppercase transitions without space (camelCase-like in non-code)
  const jammedCount = (txt.match(/[a-z][A-Z]/g) || []).length;
  if (jammedCount >= 3 && !/camelCase|JavaScript|TypeScript/i.test(txt))
    return reject("jammed-words");

  // Trailing punctuation garbage: ". , : . ., ."
  if (/[.,;:\s]{5,}$/.test(txt)) return reject("trailing-punctuation-garbage");

  // Options with ~ or > as rupee substitute
  const tildeRupeeOpts = opts.filter(o => /^[~>]\s*[\d,]+/.test(o.trim()));
  if (tildeRupeeOpts.length >= 2) return reject("garbled-rupee-options");

  // Math formula garbage (lots of =, +, -, (), not a proper question)
  const mathSyms = (txt.match(/[=+\-×÷(){}\[\]<>^_|\\]/g) || []).length;
  if (mathSyms > 15 && mathSyms / txt.length > 0.10) return reject("math-formula-garbage");

  // Merged question number mid-text (like "sphere. 68. Length of each")
  // Look for ". NUMBER. Capital" but exclude "Rs. NUMBER." and "No. NUMBER."
  const mergedNumMatch = txt.match(/(?<!Rs|No|no|rs)\.\s+(\d{2,})\.\s*[A-Z]/g);
  if (mergedNumMatch && mergedNumMatch.length >= 1)
    return reject("merged-question-mid");

  // OCR typo patterns in question text
  if (/\bVhich\b|\btrne\b|\bBvis\b|\btbe\b|\bbave\b|\bofa\b(?!r)|\bofthe\b|\bisthe\b|\bofan\b/i.test(txt))
    return reject("ocr-typo-text");

  // Jammed questions
  if (/\d+[,.]?\s*(?:Two|Three|Four|Five|A |An |The |If )[A-Z]/.test(txt) && txt.length > 150)
    return reject("jammed-questions");

  // Merged question number mid-text: only catch standalone number-period patterns like "75. In a"
  // where the number is large enough to be a question number (>= 2 digits)
  if (/\.\s+\d{2,}\.\s*(?:If|What|Which|Find|The|In |How)\s/g.test(txt))
    return reject("merged-question-number");

  // Garbled words: OCR produces "pee oF" instead of "price of", "ene" etc.
  // Check for high ratio of non-dictionary-looking short words
  const allWords = txt.split(/[\s,;:()\[\]{}]+/).filter(w => w.length >= 2);
  const gibberishWords = allWords.filter(w =>
    /^[bcdfghjklmnpqrstvwxyz]+$/i.test(w) && w.length >= 3 && w.length <= 5
  );
  if (allWords.length > 5 && gibberishWords.length / allWords.length > 0.15 && gibberishWords.length >= 3)
    return reject("garbled-words");

  // Options contain = or — as the entire answer (OCR artifacts)
  const suspectOpts = opts.filter(o => /^[=—\-<>]+$/.test(o.trim()));
  if (suspectOpts.length >= 2) return reject("symbol-only-options");

  // Empty passage
  if (/\[Passage\]/i.test(txt) && txt.replace(/^\[Passage\]\s*/i, "").length < 50)
    return reject("empty-passage");

  // Missing math symbols: too many ", " or " , " placeholders where symbols were lost
  const emptyCommas = (txt.match(/\s,\s|,\s,/g) || []).length;
  if (emptyCommas >= 3) return reject("missing-math-symbols");
  // Question has () or [] as empty placeholders for lost symbols
  const emptyParens = (txt.match(/\(\s*\)|\[\s*\]/g) || []).length;
  if (emptyParens >= 2) return reject("missing-math-symbols");
  // Lost critical values: "by ." or "is ." or "In , " where number/symbol was lost
  const lostValues = (txt.match(/(?:by|is|are|was|of|at|to|In|than)\s+[.,;:]\s/g) || []).length;
  if (lostValues >= 2) return reject("lost-values");
  // Starts with fragments like "is a point on"
  if (/^is\s|^are\s|^was\s|^were\s/.test(txt) && txt.length < 200) return reject("fragment-start-verb");

  // Standalone cloze (fill in blank no.X without any passage context)
  if (/fill in blank no\.\s*\d/i.test(txt) && txt.length < 100 && !/\[passage\]/i.test(txt))
    return reject("cloze-standalone");

  return null;
}

// ── Process all questions ──────────────────────────────────
const kept = [];
const removed = [];

for (const q of qs) {
  const reason = checkQuestion(q);
  if (reason) {
    removed.push({ reason, q: q.question.substring(0, 80), topic: q.topic });
  } else {
    kept.push(q);
  }
}

// ── Remove standalone DI questions ─────────────────────────
// DI questions that reference "the table/chart/graph" are useless alone
// Keep only DI questions with self-contained data in the question text
const diKept = [];
const diRemoved = [];
for (let i = kept.length - 1; i >= 0; i--) {
  const q = kept[i];
  if (q.topic === "Data Interpretation") {
    // Check if question has enough inline data to be self-contained
    const txt = q.question;
    const hasNums = (txt.match(/\d+/g) || []).length;
    const refsExternal = /(?:the |given |above |following )(?:table|chart|graph|bar|pie|data|diagram|figure)/i.test(txt);

    if (refsExternal && hasNums < 5) {
      // References external data without enough inline numbers
      kept.splice(i, 1);
      diRemoved.push(q);
      reasons["di-no-inline-data"] = (reasons["di-no-inline-data"] || 0) + 1;
    }
  }
}

console.log(`Total: ${qs.length}`);
console.log(`Removed: ${removed.length + diRemoved.length}`);
console.log(`Kept: ${kept.length}`);
console.log(`\nRemoval reasons:`);
Object.entries(reasons).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => console.log(`  ${r}: ${c}`));

const subjCount = {};
kept.forEach(q => { subjCount[q.subject] = (subjCount[q.subject] || 0) + 1; });
console.log(`\nKept by subject:`);
Object.entries(subjCount).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${s}: ${c}`));

// ── Build DI/Passage/Cloze SETS ─────────────────────────────
// Group passage-based questions into sets and mark them with a setId
let setId = 1;

// Helper: find passage questions and group by shared passage text
function groupPassageQuestions(questions, topicMatch, tagMatch) {
  const candidates = questions.filter(q =>
    (topicMatch && q.topic === topicMatch) ||
    (tagMatch && tagMatch.test(q.question))
  );

  // Group by source file (same PDF = same passage usually)
  const bySource = {};
  for (const q of candidates) {
    const key = q.source?.fileName || "unknown";
    if (!bySource[key]) bySource[key] = [];
    bySource[key].push(q);
  }

  let setsCreated = 0;
  for (const [src, group] of Object.entries(bySource)) {
    if (group.length >= 3) {
      // Chunk into sets of 5
      for (let i = 0; i < group.length; i += 5) {
        const chunk = group.slice(i, Math.min(i + 5, group.length));
        if (chunk.length >= 3) {
          const sid = `set_${setId++}`;
          chunk.forEach((q, idx) => {
            q.setId = sid;
            q.setIndex = idx;
            q.setSize = chunk.length;
          });
          setsCreated++;
        }
      }
    }
  }
  return setsCreated;
}

// Group Reading Comprehension
const rcSets = groupPassageQuestions(kept, "Reading Comprehension", /\[Passage\]/i);
console.log(`\nPassage/RC sets created: ${rcSets}`);

// Group Cloze Test
const clozeSets = groupPassageQuestions(kept, "Cloze Test", /fill in blank/i);
console.log(`Cloze test sets created: ${clozeSets}`);

// Group Data Interpretation
const diSets = groupPassageQuestions(kept, "Data Interpretation", null);
console.log(`DI sets created: ${diSets}`);

// Count questions in sets vs standalone
const inSets = kept.filter(q => q.setId).length;
console.log(`\nQuestions in sets: ${inSets}`);
console.log(`Standalone questions: ${kept.length - inSets}`);

// Sample sets
console.log("\n=== SAMPLE SETS ===");
const sampleSets = {};
for (const q of kept) {
  if (q.setId && !sampleSets[q.setId]) sampleSets[q.setId] = [];
  if (q.setId) sampleSets[q.setId].push(q);
}
const setEntries = Object.entries(sampleSets).slice(0, 3);
for (const [sid, group] of setEntries) {
  console.log(`\nSet ${sid} (${group[0].topic}, ${group.length} questions):`);
  group.forEach((q, i) => console.log(`  ${i + 1}. ${q.question.substring(0, 100)}`));
}

// Random sample of non-set kept questions
console.log("\n=== RANDOM SAMPLE OF KEPT (30) ===");
const standalone = kept.filter(q => !q.setId);
for (let i = 0; i < 30; i++) {
  const q = standalone[Math.floor(Math.random() * standalone.length)];
  console.log(`${i + 1}. [${q.subject}/${q.topic}] ${q.question.substring(0, 100)}`);
  console.log(`   A:${(q.options[0] || "").substring(0, 35)} B:${(q.options[1] || "").substring(0, 35)} C:${(q.options[2] || "").substring(0, 35)} D:${(q.options[3] || "").substring(0, 35)}`);
}

// Save
if (process.argv.includes("--save")) {
  const cleaned = { ...qb, questions: kept, updatedAt: new Date().toISOString() };
  fs.writeFileSync(BANK, JSON.stringify(cleaned, null, 2), "utf8");
  console.log(`\n✅ Saved ${kept.length} questions to question-bank.json`);
}
