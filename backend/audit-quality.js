#!/usr/bin/env node
/**
 * Audit question-bank.json quality — find all remaining garbage
 * Usage: node backend/audit-quality.js
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "data", "question-bank.json");
const raw = JSON.parse(fs.readFileSync(DATA, "utf8"));
const bank = raw.questions || raw;

console.log(`Total questions: ${bank.length}\n`);

// ── Quality checks ──────────────────────────────────────────
const flagged = [];

function flag(q, reason) {
  flagged.push({ id: q.id, reason, question: q.question.substring(0, 120), topic: q.topic });
}

for (const q of bank) {
  const t = q.question.trim();
  const opts = q.options;

  // 1. Truncated question — ends without ? or : and last segment is incomplete
  const cleanEnd = t.replace(/\s*\([^)]*$/g, "").replace(/\s*\[[^\]]*$/g, "").trim();
  if (!cleanEnd.match(/[?:]$/) && !cleanEnd.match(/(equal to|will be|find|calculate|determine|is|are|was|becomes)$/i)) {
    flag(q, "no-question-ending");
  }

  // 2. Truncated citation at the end: (SSC Su, (SSC CG, (RRB, (IBPS
  if (/\(SSC\s*[A-Za-z]{0,3}$|\(RRB\s*[A-Za-z]{0,3}$|\(IBPS\s*[A-Za-z]{0,3}$/i.test(t)) {
    flag(q, "truncated-citation");
  }

  // 3. Merged words: ofhis, ofthe, reacheshis, BandC, etc.
  if (/ofhis|ofthe|tothe|andthe|inthe|forthe|onthe|atthe|isthe|wasthe|reachesh|workin\b/i.test(t)) {
    flag(q, "merged-words");
  }

  // 4. OCR em-dash or tilde replacing a number/fraction
  if (/[—~]\s*\d|\d\s*[—~]|at\s*—\s*of|for\s*~\s*\d/.test(t)) {
    flag(q, "ocr-dash-tilde");
  }

  // 5. Multiple question marks (merged questions)  
  if ((t.match(/\?/g) || []).length >= 2) {
    // Allow "If x? then y?" style but flag "Question1? Question2?"
    const parts = t.split("?");
    if (parts.length >= 3 && parts[1].trim().length > 30) {
      flag(q, "merged-questions");
    }
  }

  // 6. Trailing garbage after final ?
  if (/\?\s+[a-z]\s*$/i.test(t)) {
    flag(q, "trailing-garbage-after-?");
  }

  // 7. Double punctuation ,, or .. (not ellipsis)
  if (/,\s*,|\.\.\s[^.]/.test(t)) {
    flag(q, "double-punctuation");
  }

  // 8. Standalone DI question (no set)
  if (q.topic === "Data Interpretation" && !q.setId) {
    flag(q, "standalone-DI");
  }

  // 9. Two separate problems merged into one question (sentence1. sentence2)
  const sentences = t.split(/\.\s+[A-Z]/);
  if (sentences.length >= 3 && t.length > 200) {
    flag(q, "merged-long-text");
  }

  // 10. Mismatched options: mix of very different types
  const hasPercentOpts = opts.filter(o => /%/.test(o)).length;
  const hasRsOpts = opts.filter(o => /₹|Rs|rs/i.test(o)).length;
  const hasTextOpts = opts.filter(o => o.trim().length > 25 && !/\d/.test(o)).length;
  if (hasPercentOpts >= 1 && hasRsOpts >= 1) flag(q, "mixed-option-types");
  
  // 11. Options referencing other options: "(A) is better", "(B)is better"
  opts.forEach(o => {
    if (/\([A-Da-d]\)\s*(is|are)\s*(better|correct|true|false|wrong)/i.test(o)) {
      flag(q, "option-refers-other");
    }
  });

  // 12. Option has question mark (usually OCR junk)
  if (opts.some(o => /\?/.test(o) && o.length < 20)) {
    flag(q, "option-has-questionmark");
  }

  // 13. Options have multiple values ("25%, 12%, 8%") — more than 2 commas in a short opt
  opts.forEach(o => {
    if ((o.match(/,/g) || []).length >= 2 && o.length < 30 && /\d/.test(o)) {
      flag(q, "multi-value-option");
    }
  });

  // 14. Very garbled options (last option has trailing junk like surface area text)
  opts.forEach(o => {
    if (o.length > 60 && /surface area|length of|area of|volume of/i.test(o)) {
      flag(q, "option-contains-question-text");
    }
  });

  // 15. Trigonometry/topic mismatch — question about cost/diamond but topic is Trig
  // Skip — too many edge cases

  // 16. Question about wrong topic (topic is Trig but question about cost)
  if (q.topic === "Trigonometry" && !/sin|cos|tan|angle|elevation|depression|trig|θ|degree/i.test(t) && !/height|tower|shadow/i.test(t)) {
    flag(q, "topic-mismatch-trig");
  }

  // 17. Truncated at very end (last 3 chars are spaces or single letter)
  if (/\s[a-z]$/i.test(t) && t.length > 30) {
    flag(q, "truncated-end");
  }

  // 18. "The share of C should be:" mixed with separate question
  if (/\?\s+\d+\/\d+\s+of\s+the\s+work/i.test(t)) {
    flag(q, "merged-question-fragments");
  }
}

// ── Summary ─────────────────────────────────────────────────
const reasons = {};
flagged.forEach(f => { reasons[f.reason] = (reasons[f.reason] || 0) + 1; });

const uniqueIds = new Set(flagged.map(f => f.id));
console.log(`Flagged questions: ${uniqueIds.size} (${flagged.length} total flags)\n`);
console.log("Issues breakdown:");
Object.entries(reasons).sort((a,b)=>b[1]-a[1]).forEach(([r,c]) => console.log(`  ${r}: ${c}`));

// Show samples per issue type
console.log("\n── Samples per issue ──");
const shown = new Set();
for (const [reason] of Object.entries(reasons).sort((a,b)=>b[1]-a[1])) {
  const samples = flagged.filter(f => f.reason === reason && !shown.has(f.id)).slice(0, 2);
  if (samples.length) {
    console.log(`\n[${reason}]`);
    samples.forEach(s => {
      shown.add(s.id);
      console.log(`  ${s.topic}: ${s.question}`);
    });
  }
}
