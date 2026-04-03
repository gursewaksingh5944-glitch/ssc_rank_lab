const fs = require('fs');
const path = require('path');

const qb = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/question-bank.json'), 'utf8'));
const qs = qb.questions;

// Common English words that appear in real questions
const ENGLISH_WORDS = /\b(the|is|of|in|to|a|an|and|or|if|what|which|how|find|that|was|are|has|had|will|can|from|for|with|this|his|her|its|than|by|at|on|not|but|be|as|have|do|did|does|who|where|when|why|each|all|were|been|their|them|these|those|between|both|same|one|two|three|four|five|given|total|number|value|ratio|average|percent|price|cost|area|length|angle|triangle|circle|square|speed|time|distance|age|weight|sum|difference|product|select|correct|following|sentence|word|meaning|opposite|similar|blank|passage|statement|answer|option|question)\b/i;

let reasons = {};
let removed = [];
let kept = [];

for (const q of qs) {
  const txt = String(q.question || '').trim();
  const opts = Array.isArray(q.options) ? q.options : [];
  const validOpts = opts.filter(o => String(o || '').trim().length > 0);
  const ai = q.answerIndex;
  let bad = null;

  // 1. Options-as-text or answer-key text like "(a) 2. (c) 3."
  if (/^\(?[a-d]\)?\s*\d+[\.\s]/.test(txt) && txt.length < 80 && !/\?|find|what|which|how|calculate|determine/i.test(txt)) {
    bad = 'options-as-text';
  }
  // 2. Answer key pattern: '1. (a) 2. (b) 3. (c)'
  else if (/^\d+\.\s*\(?[a-d]\)?\s*\d+\.\s*\(?[a-d]\)?/.test(txt)) {
    bad = 'answer-key';
  }
  // 3. Too short (<15 chars)
  else if (txt.length < 15) {
    bad = 'too-short';
  }
  // 4. Fragment start
  else if (/^(and |but |or |so |then |also |still |hence |therefore |thus |nor )/i.test(txt)) {
    bad = 'fragment-start';
  }
  // 5. Less than 4 valid options
  else if (validOpts.length < 4) {
    bad = 'less-than-4-options';
  }
  // 6. answerIndex out of range or -1
  else if (!Number.isFinite(ai) || ai < 0 || ai >= validOpts.length) {
    bad = 'bad-answer-index';
  }
  // 7. Only numbers/symbols (garbled OCR)
  else if (/^[\d\s\.\,\(\)\-\+\*\/\=\:\;\[\]]+$/.test(txt) && txt.length < 60) {
    bad = 'garbled-numbers';
  }
  // 8. Non-english (fewer than 5 latin chars in text > 10 chars)
  else if ((txt.match(/[a-zA-Z]/g) || []).length < 5 && txt.length > 10) {
    bad = 'non-english';
  }
  // 9. Duplicate options (3+ identical)
  else if (new Set(validOpts.map(o => String(o).trim().toLowerCase())).size < 3) {
    bad = 'duplicate-options';
  }
  // 10. Garbled OCR: very low vowel ratio in text (Hindi transliteration / OCR gibberish)
  else if (txt.length > 15) {
    const alphaChars = (txt.match(/[a-zA-Z]/g) || []);
    const vowels = (txt.match(/[aeiouAEIOU]/g) || []);
    if (alphaChars.length >= 10 && vowels.length / alphaChars.length < 0.12) {
      bad = 'garbled-ocr';
    }
    // 11. Too many single-char words (garbled OCR fragments like "FE 2 3 1 eR SRE")
    if (!bad) {
      const words = txt.split(/\s+/);
      const singleCharWords = words.filter(w => w.length === 1 && /[a-zA-Z]/.test(w)).length;
      if (singleCharWords > words.length * 0.3 && singleCharWords >= 4) {
        bad = 'garbled-fragments';
      }
    }
  }

  if (bad) {
    reasons[bad] = (reasons[bad] || 0) + 1;
    removed.push({ reason: bad, q: txt.substring(0, 80), opts: validOpts.length, ai: ai });
  } else {
    kept.push(q);
  }
}

console.log('Total:', qs.length);
console.log('Removed:', removed.length);
console.log('Kept:', kept.length);
console.log('\nRemoval reasons:');
Object.entries(reasons).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => console.log(' ', r, ':', c));

// Subject breakdown of kept
const subjCount = {};
kept.forEach(q => { subjCount[q.subject] = (subjCount[q.subject] || 0) + 1; });
console.log('\nKept by subject:');
Object.entries(subjCount).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(' ', s, ':', c));

// Show some removed samples
console.log('\n--- Sample removed (options-as-text) ---');
removed.filter(r => r.reason === 'options-as-text').slice(0, 5).forEach(r => console.log(' ', r.q));
console.log('\n--- Sample removed (too-short) ---');
removed.filter(r => r.reason === 'too-short').slice(0, 5).forEach(r => console.log(' ', r.q));
console.log('\n--- Sample removed (fragment-start) ---');
removed.filter(r => r.reason === 'fragment-start').slice(0, 5).forEach(r => console.log(' ', r.q));
console.log('\n--- Sample removed (less-than-4-options) ---');
removed.filter(r => r.reason === 'less-than-4-options').slice(0, 5).forEach(r => console.log(' ', JSON.stringify(r)));
console.log('\n--- Sample removed (bad-answer-index) ---');
removed.filter(r => r.reason === 'bad-answer-index').slice(0, 5).forEach(r => console.log(' ', JSON.stringify(r)));

// Save cleaned version
if (process.argv.includes('--save')) {
  const cleaned = { ...qb, questions: kept };
  fs.writeFileSync(path.join(__dirname, 'data/question-bank.json'), JSON.stringify(cleaned, null, 2), 'utf8');
  console.log('\n✅ Saved cleaned question-bank.json with', kept.length, 'questions');
}
