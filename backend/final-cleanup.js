/**
 * Final cleanup: mark genuinely broken questions as needs_review
 * Categories:
 * - Hindi transliteration in text
 * - OCR garbled words (mid-word caps with consonant clusters)
 * - Spaced-out OCR options
 * - Truncated quant/reasoning questions (cut off mid-sentence)
 * - Missing figures/graphs without data
 * - Questions with answer text leaked in
 */
const fs = require('fs');
const path = require('path');
const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const questions = bank.questions;

let marked = 0;
const reasons = {};

function markBad(q, reason) {
  if (q.reviewStatus !== 'approved') return;
  q.reviewStatus = 'needs_review';
  q._disableReason = reason;
  marked++;
  reasons[reason] = (reasons[reason] || 0) + 1;
}

questions.forEach(q => {
  if (q.reviewStatus !== 'approved') return;
  const txt = q.question || '';
  const opts = q.options || [];

  // 1. Hindi transliteration in question (3+ consonant-heavy words of length >= 4)
  const hindiChunks = txt.match(/\b[bcdfghjklmnpqrstvwxyz]{4,}\b/gi) || [];
  if (hindiChunks.length >= 3) {
    markBad(q, 'hindi_transliteration');
    return;
  }

  // 2. Devanagari Unicode in question text
  if (/[\u0900-\u097F]/.test(txt)) {
    markBad(q, 'devanagari_in_text');
    return;
  }

  // 3. OCR mid-word capitalization with consonant clusters (actual garbled words)
  // Words like "thMe", "wsas", "oLrq", "byDs", "fWud", "eYw", "kIr", "okLrfod", "samEehnokjksa"
  const ocrWords = txt.match(/\b[a-z]*[A-Z][a-z]*\b/g) || [];
  const badOcr = ocrWords.filter(w => {
    if (w.length < 3) return false;
    if (['pH','WiFi'].includes(w)) return false;
    // Check if this looks like a garbled Hindi word (consonant-heavy)
    const consonants = (w.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
    const vowels = (w.match(/[aeiou]/gi) || []).length;
    return consonants > vowels * 2 && w.length >= 4;
  });
  if (badOcr.length > 0) {
    markBad(q, 'ocr_garbled_text');
    return;
  }

  // 4. Spaced-out OCR text in options ("T h e g o v e r n m e n t")
  for (const opt of opts) {
    if (typeof opt === 'string' && /[A-Za-z]\s[A-Za-z]\s[A-Za-z]\s[A-Za-z]\s[A-Za-z]/.test(opt) && opt.length > 30) {
      markBad(q, 'spaced_ocr_option');
      return;
    }
  }

  // 5. Hindi transliteration in options
  for (const opt of opts) {
    if (typeof opt !== 'string') continue;
    const optChunks = opt.match(/\b[bcdfghjklmnpqrstvwxyz]{4,}\b/gi) || [];
    if (optChunks.length >= 2) {
      markBad(q, 'hindi_in_option');
      return;
    }
  }

  // 6. Truncated quant/reasoning/geometry questions (NOT GK/English which can be fill-in-blank)
  if (['quant', 'reasoning'].includes(q.subject)) {
    const trimmed = txt.trim();
    if (trimmed.length > 30 && /\b(on|the|of|is|and|with|from|to|in|are|was|were|for|at|by|if|or|as|that|this|than|witha|an)\s*$/i.test(trimmed)) {
      markBad(q, 'truncated_question');
      return;
    }
  }

  // 7. Questions referencing figures/graphs/charts without data or sharedContext
  if (/(?:given|shown|following)\s+(?:figure|graph|chart|diagram|picture|image)/i.test(txt) && !q.sharedContext && !q.setId) {
    const nums = (txt.match(/\d+/g) || []);
    if (nums.length < 3) {
      markBad(q, 'missing_figure_data');
      return;
    }
  }

  // 8. "In the given figure" without any data
  if (/in the given figure/i.test(txt) && !q.sharedContext && !q.setId) {
    const nums = (txt.match(/\d+/g) || []);
    if (nums.length < 2) {
      markBad(q, 'missing_figure_data');
      return;
    }
  }

  // 9. Answer leaked into question text like "(a) 62."
  if (/\(a\)\s*\d+\s*[.,;]?\s*$/.test(txt.trim())) {
    markBad(q, 'answer_leaked');
    return;
  }

  // 10. Very long corrupted options (>200 chars)
  for (const opt of opts) {
    if (typeof opt === 'string' && opt.length > 200) {
      markBad(q, 'corrupt_long_option');
      return;
    }
  }

  // 11. [see original] or [image] placeholders
  const allText = txt + ' ' + opts.join(' ');
  if (/\[see original\]|\[image\]|\[figure\]|\[diagram\]/i.test(allText)) {
    markBad(q, 'placeholder');
    return;
  }
});

// Save
bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

const finalApproved = questions.filter(q => q.reviewStatus === 'approved');
console.log(`\n=== CLEANUP COMPLETE ===`);
console.log(`Newly marked as needs_review: ${marked}`);
console.log('\nBy reason:');
Object.entries(reasons).sort((a,b) => b[1]-a[1]).forEach(([r,c]) => console.log(`  ${r}: ${c}`));

console.log(`\nTotal approved: ${finalApproved.length}`);
const subj = {};
finalApproved.forEach(q => { subj[q.subject] = (subj[q.subject] || 0) + 1; });
console.log('By subject:', subj);

// Show mock capacity
const tier1 = Math.min(Math.floor(subj.quant/25), Math.floor(subj.english/25), Math.floor(subj.gk/25), Math.floor(subj.reasoning/25));
const tier2 = Math.min(Math.floor(subj.quant/30), Math.floor(subj.english/45), Math.floor(subj.gk/25), Math.floor(subj.reasoning/30));
console.log(`\nMock capacity: Tier1=${tier1}, Tier2=${tier2}`);
