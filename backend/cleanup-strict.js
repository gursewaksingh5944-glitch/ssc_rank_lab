#!/usr/bin/env node
/**
 * Strict quality-gate cleanup — only keeps provably clean questions.
 * Flips the logic: instead of detecting bad, we VERIFY good.
 *
 * Usage:
 *   node backend/cleanup-strict.js          # dry-run with stats
 *   node backend/cleanup-strict.js --save   # overwrite question-bank.json
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "data", "question-bank.json");
const raw = JSON.parse(fs.readFileSync(DATA, "utf8"));
const bank = raw.questions || raw;
const doSave = process.argv.includes("--save");

console.log(`Input: ${bank.length} questions\n`);

// ── Rejection reasons tracker ───────────────────────────────
const rejected = {};
function reject(q, reason) {
  if (!q._rejected) {
    q._rejected = reason;
    rejected[reason] = (rejected[reason] || 0) + 1;
  }
}

// ── CHECKS ──────────────────────────────────────────────────

function checkQuestion(q) {
  const t = (q.question || "").trim();
  const opts = q.options || [];
  const subj = q.subject || "";
  const topic = q.topic || "";

  // ── BASIC STRUCTURE ───────────────────────────────────────

  // Too short to be a real question
  if (t.length < 25) return reject(q, "too-short");

  // Must have exactly 4 options
  if (opts.length !== 4) return reject(q, "not-4-options");

  // answerIndex must be valid
  if (q.answerIndex < 0 || q.answerIndex > 3) return reject(q, "bad-answer-index");

  // ── TRUNCATED TEXT ────────────────────────────────────────

  // Ends with a truncated citation: (SSC Su, (SSC CG, (RRB N, (IBPS
  if (/\(\s*(?:SSC|RRB|IBPS|Staff|Bank)\s*[A-Za-z]{0,4}$/i.test(t)) return reject(q, "truncated-citation");

  // Ends with single letter (truncated word): "then by", "mark his"
  // But allow "?" as ending, and known endings like "is", "are", "to"
  const lastWord = t.split(/\s+/).pop();
  if (lastWord && lastWord.length === 1 && !/[?:)0-9]/.test(lastWord)) return reject(q, "truncated-single-char");

  // ── MERGED / GARBLED TEXT ─────────────────────────────────

  // Common OCR merged words
  if (/\bofhis\b|\bofthe\b|\btothe\b|\bandthe\b|\binthe\b|\bforthe\b|\bonthe\b|\batthe\b|\bisthe\b|\bwasthe\b/i.test(t))
    return reject(q, "merged-words");
  if (/\breachesh\b|\bworkin\b|\bBandC\b|\bAandB\b|\bamountof\b|\bofthefirst\b|\bwillbe\b|\bcanbe\b|\bhasbeen\b/i.test(t))
    return reject(q, "merged-words");
  // General pattern: 3+ letter word merged with "of" and 3+ letter word
  if (/[a-z]{3,}of[a-z]{3,}/i.test(t) && !/\b(?:thereof|hereof|whereof|proof|rooftop|offload|offset|officer|official|office|offline|offspring|offer)\b/i.test(t))
    return reject(q, "merged-words");
  // "remainderis", "answeris", "valueis" patterns
  if (/(?:remainder|answer|value|number|amount|total|result|profit|difference|product|sum|area|volume|ratio|cost|price|speed|rate|distance|time|age|weight|work|share|income|salary|loss|discount)(?:is|are|was|were)\b/i.test(t))
    return reject(q, "merged-words");
  // Broader "XandY" patterns: any letter+and+letter without spaces
  if (/[a-z]and[A-Z]|[A-Z]and[a-z]/g.test(t) && !/\b(?:sand|band|land|hand|wand|rand|brand|grand|stand|demand|command|expand|thousand)\b/i.test(t.replace(/[A-Z]and[A-Z]/g, "")))
    return reject(q, "merged-words");

  // OCR em-dash or tilde replacing a number/fraction in math context
  if (subj === "quant" && /[—~]\s*\d|\bat\s*[—~]\s*of\b|for\s*[—~]\s*\d/i.test(t))
    return reject(q, "ocr-number-replacement");

  // OCR digit-in-word artifacts: "ru1icle" (article), "ru1d" (and), "c0mplete"
  if (/[a-z]\d[a-z]{2,}/i.test(t) && !/\b[a-z]*\d+[a-z]*\d+/i.test(t)) // but allow "x2y3" math vars
    return reject(q, "ocr-digit-in-word");

  // Missing content after ratio/proportion placeholder: "ratio : :" or "ratio , then"
  if (/ratio\s*(?:of\s*)?:\s*:/i.test(t) || /in the ratio\s+:\s+:/i.test(t))
    return reject(q, "missing-ratio-content");
  if (/ratio\s*,\s*(?:then|how|what|find)/i.test(t) || /in the ratio\s+,/i.test(t))
    return reject(q, "missing-ratio-content");

  // "value of ?" or "the value of ?" — missing the actual expression
  if (/(?:value|sum|product)\s+of\s*\?\s*$/i.test(t))
    return reject(q, "missing-expression");
  // "what is the value of" ending — missing the expression entirely
  if (/(?:value|sum|product)\s+of\s*$/i.test(t))
    return reject(q, "missing-expression");

  // OCR digit-letter confusion: "1f" instead of "If", "0f" instead of "Of"
  if (/\b[01][fF]\s+\d/.test(t) || /\b[01][fF]\s+[A-Z]/.test(t))
    return reject(q, "ocr-digit-letter-swap");

  // Missing content between connectives: "If and then", "If , then", ". If and"
  if (/\bIf\s+and\s+then\b|\bIf\s*,\s*then\b|\band\s*=\s*\d/i.test(t) && /\bIf\b/.test(t) && !/\bIf\s+\w{2,}\s+and\b/i.test(t))
    return reject(q, "missing-content-connectives");

  // Missing labels: "°, = " or ", = 10 cm" — angle/side value without name
  if (/[°],\s*=\s*\d|,\s*=\s*\d+\s*(?:cm|m|km)\s*and\s*=\s*\d/i.test(t))
    return reject(q, "missing-labels");

  // Missing geometric/algebraic labels: "of in meets at .", "bisector of in"
  // Detect: preposition followed by another preposition (not article), or prep + punctuation with no content
  if (subj !== "english") {
    const suspiciousPairs = (t.match(/\b(of|at|from|between)\s+(in|at|on|of|from|between|[.,;])\b/gi) || []).length;
    // Also catch "If and ," or "and , then"
    const missingBetween = (t.match(/\b(If|and|or)\s*,\s*(then|and|or|,)/gi) || []).length;
    if (suspiciousPairs + missingBetween >= 2)
      return reject(q, "missing-labels");
  }

  // Merged sentences: two unrelated complete sentences — period + capital letter + different subject
  if (subj === "quant" || subj === "reasoning") {
    const sentenceParts = t.split(/\.\s+(?=[A-Z])/);
    if (sentenceParts.length >= 3) {
      // Check if the parts look like different questions
      const hasMultipleQuestionWords = (t.match(/\b(?:what|how|find|which|if|when)\b/gi) || []).length >= 3;
      if (hasMultipleQuestionWords) return reject(q, "merged-multiple-questions");
    }
  }

  // Garbled fraction-heavy text: multiple "X Y Z" patterns that should be fractions
  // e.g. "5 1 5 − [3 1 2 −" — OCR turned ⅕, ½ etc into "1 5", "1 2"
  if (subj === "quant") {
    const fractionLike = (t.match(/\b\d+\s+\d+\s+\d+\b/g) || []).length;
    if (fractionLike >= 3) return reject(q, "garbled-fractions-in-text");
  }

  // Missing number/value in quant: "is metre away", "is cm", "decreased by ."
  if (subj === "quant") {
    if (/\bis\s+(?:metre|meter|cm|km|m|kg|litre|hour|day|year|percent|%)\b/i.test(t) && !/\d\s*(?:metre|meter|cm|km|m|kg)/.test(t.substring(0, t.search(/\bis\s+(?:metre|meter|cm)/i))))
      return reject(q, "missing-number");
    if (/decreased by\s*\.|increased by\s*\.|reduced by\s*\./i.test(t))
      return reject(q, "missing-number");
  }

  // Two fragments merged — "Find X" + "are what percent of Y" without proper separation
  if (subj === "quant" && /\b(?:find|what)\b.*\b(?:are|is)\s+(?:approximately\s+)?what\s+per\s*cent/i.test(t))
    return reject(q, "merged-question-fragments");

  // Multiple questions merged — two distinct question clauses
  const qmarks = (t.match(/\?/g) || []).length;
  if (qmarks >= 2) {
    // Check if the text between question marks looks like a second question
    const afterFirst = t.substring(t.indexOf("?") + 1).trim();
    if (afterFirst.length > 40 && /\?/.test(afterFirst)) return reject(q, "merged-questions");
  }

  // Very long text likely has multiple merged questions
  if (t.length > 400 && subj !== "english") return reject(q, "too-long-merged");

  // Double/triple punctuation artifacts: ,, or .. (not ...)
  if (/,\s*,/.test(t)) return reject(q, "double-comma");

  // Trailing garbage after the question mark: "? g", "? th"
  if (/\?\s+[a-z]{1,3}\s*$/i.test(t)) return reject(q, "trailing-garbage");

  // ── COMPLETENESS for QUANT/REASONING ──────────────────────

  if (subj === "quant" || subj === "reasoning") {
    // Strip trailing citation attempts for checking ending
    const cleaned = t.replace(/\s*\([^)]{0,30}$/, "").replace(/\s*\[[^\]]{0,30}$/, "").trim();

    // Must end with ?, :, or known conclusive patterns
    const goodEnding = /[?:]$/.test(cleaned)
      || /(?:is|are|was|were|will be|would be|equal to|equals|find|calculate|determine|becomes|be)\s*[.:]?\s*$/i.test(cleaned)
      || /\)$/.test(cleaned); // ends with closing paren (math expression)

    if (!goodEnding) {
      // Check if the question just ends mid-sentence (truncated)
      const lastThreeWords = cleaned.split(/\s+/).slice(-3).join(" ");
      // Common truncation patterns: "the area of the", "he must mark his", "then by"
      if (/\b(of|the|a|an|in|on|at|by|for|to|is|his|her|its|and|or|from|with|than|then|if|was|has|had|as|but|that)\s*$/i.test(cleaned)) {
        return reject(q, "truncated-end");
      }
      // If it ends with a noun/adjective-ish word and no punctuation, likely truncated
      if (!/[.!?:)]$/.test(cleaned)) {
        return reject(q, "no-proper-ending");
      }
    }
  }

  // ── COMPLETENESS for ENGLISH ──────────────────────────────

  if (subj === "english") {
    // English questions can be sentences (no ?) but shouldn't be grammar explanations
    if (/^V\s+Had|^M\.V\.\s|^\(?i\)|tense$/i.test(t)) return reject(q, "grammar-explanation");

    // Passage fragments starting with [Passage]
    if (/^\[Passage\]/i.test(t) && t.length < 50) return reject(q, "empty-passage-ref");
  }

  // ── STANDALONE DI (useless without data) ──────────────────

  if (topic === "Data Interpretation" && !q.setId) return reject(q, "standalone-DI");

  // ── OPTION QUALITY ────────────────────────────────────────

  for (let i = 0; i < opts.length; i++) {
    const o = opts[i].trim();

    // Empty or whitespace-only option
    if (!o || o.length === 0) return reject(q, "empty-option");

    // Option too long (likely contains question text)
    if (o.length > 100 && !/,/.test(o)) return reject(q, "option-too-long");

    // Option contains another question's text
    if (/surface area of|length of the wire|area of the box|volume of/i.test(o) && o.length > 40)
      return reject(q, "option-has-question-text");

    // Option references other options: "(A) is better", "(B)is better"
    if (/\([A-Da-d]\)\s*(?:is|are|was)\s*(?:better|correct|true|false|wrong|right)/i.test(o))
      return reject(q, "option-cross-reference");

    // Option has question mark (OCR junk)
    if (/\?/.test(o) && o.length < 20 && !/\bor\b/i.test(o))
      return reject(q, "option-has-questionmark");

    // Garbled numeric options: "13 3 3 3 5 4" or "1 3h"
    if (/^\d+\s+\d+\s+\d+\s+\d+/.test(o)) return reject(q, "garbled-option-numbers");
    if (/^\d+\s+\d+[a-z]$/i.test(o)) return reject(q, "garbled-option-number-letter");
  }

  // All options are the same
  const uniqueOpts = new Set(opts.map(o => o.trim().toLowerCase()));
  if (uniqueOpts.size < 3) return reject(q, "duplicate-options");

  // OCR digit-in-word in options
  if (opts.some(o => /[a-z]\d[a-z]{2,}/i.test(o) && o.length > 5))
    return reject(q, "option-ocr-digit");

  // ── TOPIC-OPTION MISMATCH ─────────────────────────────────

  // Check if options are wildly inconsistent with each other
  const numericOpts = opts.filter(o => /^[₹Rs.\s]*[\d,.]+\s*(%|Rs\.?|₹|cm|m|km|kg|hrs?|days?|years?|sec|min|litres?)?\s*$/i.test(o.trim()));
  const textOpts = opts.filter(o => o.trim().length > 15 && !/^\d/.test(o.trim()));

  // If 2 options are pure numbers and 2 are long text — almost certainly merged/wrong
  if (numericOpts.length >= 2 && textOpts.length >= 2 && subj === "quant")
    return reject(q, "mixed-option-format");

  // Quant question but options are about something completely different
  if (subj === "quant") {
    // Check topic vs option alignment for currency questions with % options or vice versa
    const hasRs = opts.some(o => /₹|Rs/i.test(o));
    const hasPct = opts.some(o => /%/.test(o));
    const hasText = opts.some(o => /increase|decrease|gain|loss|better|worse/i.test(o));
    if (hasRs && hasPct && hasText) return reject(q, "conflicting-option-types");

    // Percentage question but options are in thousands/lakhs (obvious mismatch)
    if (/per\s*cent|percent|%/i.test(t) && !/how\s+much|what\s+amount|sum|value\s+of|price|cost/i.test(t)) {
      const allBigNums = opts.every(o => {
        const n = parseFloat(o.replace(/[₹Rs.,\s]/g, ""));
        return !isNaN(n) && n > 500;
      });
      if (allBigNums) return reject(q, "option-magnitude-mismatch");
    }
  }

  // ── MERGED WORDS IN OPTIONS ────────────────────────────────

  for (const o of opts) {
    if (/oflndia|ofthe|inthe|forthe|andthe|ofhis|tothe|onthe|oflnd|isthe|wasthe|ofthefirst|willbe|canbe/i.test(o))
      return reject(q, "option-merged-words");
    // "XandY" merge in options 
    if (/[a-z]and[A-Z]|[A-Z]and[a-z]/.test(o) && !/\b(?:sand|band|land|hand|wand|rand|brand|grand|stand)\b/i.test(o))
      return reject(q, "option-merged-words");
  }

  // ── GARBLED FRACTION OPTIONS ──────────────────────────────
  // Detect options that are space-separated numbers (garbled fractions: "6 5" = 6/5, "1 2 hour" = 1/2 hour)
  const garbFractionCount = opts.filter(o => {
    const tr = o.trim();
    return /^\d+\s+\d+\s+\d+\b/.test(tr) || /^\d+\s+\d+\s+[a-z]/i.test(tr) || /^\d+\s+\d+$/.test(tr);
  }).length;
  if (garbFractionCount >= 3) return reject(q, "garbled-fraction-options");

  // ── TOPIC MISMATCH ───────────────────────────────────────

  if (topic === "Trigonometry" && !/\bsin\b|\bcos\b|\btan\b|\bangle\b|elevation|depression|\btrig|θ|°|degree|height.*tower|tower.*height|shadow|ladder/i.test(t))
    return reject(q, "topic-mismatch");

  // "Arithmetic" topic but it's about GK/current affairs
  if (topic === "Arithmetic" && /organisation|corporation|reserve bank|RBI|SEBI|government|minister|parliament|initiative/i.test(t))
    return reject(q, "topic-mismatch-gk");

  // Question about business/investment but topic is Trig
  if (topic === "Trigonometry" && /business|invest|profit|capital|partner|share/i.test(t))
    return reject(q, "topic-mismatch");

  // ── QUANT: LAST WORD TRUNCATION ───────────────────────────
  // If the question ends mid-word for quant/reasoning, reject
  if (subj === "quant" || subj === "reasoning") {
    const words = t.split(/\s+/);
    const last = words[words.length - 1];
    // If last word is a truncated partial word (3-7 chars, no punctuation, not a known ending word)
    const knownEndings = new Set(["is", "are", "was", "were", "be", "to", "of", "by", "cm", "mm", "km", "kg", "hrs", "days", "min", "sec", "years", "months",
      "litres", "meters", "metres", "grams", "rupees", "percent", "respectively", "equal", "find", "determine", "calculate"]);
    const lastClean = last.replace(/[?:.)]+$/, "").toLowerCase();
    if (lastClean.length >= 3 && !knownEndings.has(lastClean)) {
      // Check if it looks like a truncated word (ends with consonant cluster or partial suffix)
      if (/[bcdfghjklmnpqrstvwxz]{2}$/i.test(lastClean) && !/\d/.test(lastClean)) {
        // Could be truncated like "expenditu", "compounde", "reachesh"
        // But also valid words like "path", "length" — check if it's a real word ending
        if (!/(?:th|ng|nt|nd|nk|st|ck|ft|lf|lt|pt|ct|gh|ph|sh|ch|ss|ll|ff|rn|rm|mp|lp|rk|sk|sp|wn|ld|rd|rt|xt)$/i.test(lastClean)) {
          return reject(q, "truncated-mid-word");
        }
      }
    }
  }

  // ── PASSED ALL CHECKS ─────────────────────────────────────
  return true;
}

// ── RUN CHECKS ──────────────────────────────────────────────

const kept = [];
for (const q of bank) {
  q._rejected = null;
  checkQuestion(q);
  if (!q._rejected) {
    const { _rejected, ...clean } = q;
    kept.push(clean);
  }
}

// ── STATS ───────────────────────────────────────────────────

console.log("Rejection breakdown:");
Object.entries(rejected).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
  console.log(`  ${r}: ${c}`);
});

const removedCount = bank.length - kept.length;
console.log(`\nRemoved: ${removedCount}, Kept: ${kept.length}`);

// Subject distribution
const bySubj = {};
kept.forEach(q => { bySubj[q.subject] = (bySubj[q.subject] || 0) + 1; });
console.log("\nSubject distribution:");
Object.entries(bySubj).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${s}: ${c}`));

// Set stats
const setQs = kept.filter(q => q.setId);
const setIds = new Set(setQs.map(q => q.setId));
console.log(`\nSets: ${setIds.size} (${setQs.length} questions in sets)`);

// Mock feasibility
const tier1Needs = { quant: 25, reasoning: 25, english: 25, gk: 25 };
const tier2Needs = { quant: 35, reasoning: 30, english: 30, gk: 20, computer: 15 };
console.log("\nMock feasibility:");
console.log("  Tier-1 (100 Q):", Object.entries(tier1Needs).map(([s, n]) => `${s}: ${bySubj[s] || 0}/${n}`).join(", "));
console.log("  Tier-2 (130 Q):", Object.entries(tier2Needs).map(([s, n]) => `${s}: ${bySubj[s] || 0}/${n}`).join(", "));

// ── RANDOM SAMPLE of KEPT questions ─────────────────────────
console.log("\n── Random sample of KEPT questions ──");
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
shuffle([...kept]).filter(q => q.subject === "quant").slice(0, 10).forEach((q, i) => {
  console.log(`\n  Q${i + 1} [${q.topic}]: ${q.question.substring(0, 130)}`);
  console.log(`  Opts: ${q.options.map(o => o.substring(0, 40)).join(" | ")}`);
});

// ── SAVE ────────────────────────────────────────────────────
if (doSave) {
  const out = { updatedAt: new Date().toISOString(), questions: kept };
  fs.writeFileSync(DATA, JSON.stringify(out, null, 2));
  console.log(`\n✅ Saved ${kept.length} questions to question-bank.json`);
} else {
  console.log("\n⚠️  Dry run. Use --save to write.");
}
