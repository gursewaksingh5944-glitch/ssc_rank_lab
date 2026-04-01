#!/usr/bin/env node
const pdf = require('pdf-parse');
const fs = require('fs');

async function analyzeReasoningPDF() {
  const buf = fs.readFileSync('backend/pyq/other/SSC Reasoning 7000+ Objective Questions - Bilingual.pdf');
  
  let txt = '';
  if (typeof pdf === 'function') {
    const d = await pdf(buf);
    txt = d.text;
  } else if (pdf.PDFParse) {
    const p = new pdf.PDFParse({ data: buf });
    const o = await p.getText();
    txt = String(o?.text || o || '');
    await p.destroy?.();
  }

  console.log('=== PDF ANALYSIS ===\n');
  console.log('File size:', (buf.length / 1024 / 1024).toFixed(2) + 'MB');
  console.log('Text length:', txt.length + ' chars');
  
  const lines = txt.split('\n');
  console.log('Total lines:', lines.length);

  // Look for question patterns
  const pattern1 = txt.match(/^\d+\)/gm);
  const pattern2 = txt.match(/^Q\.\s*\d+/gm);
  const pattern3 = txt.match(/^Que\.\s*\d+/gm);
  const optionPattern = txt.match(/^\s*\([A-D]\)\s*/gm);

  console.log('\nPattern matches:');
  console.log('  - Lines starting with "N)": ', pattern1 ? pattern1.length : 0);
  console.log('  - Lines starting with "Q.": ', pattern2 ? pattern2.length : 0);
  console.log('  - Lines starting with "Que.": ', pattern3 ? pattern3.length : 0);
  console.log('  - Option lines with (A)-(D): ', optionPattern ? optionPattern.length : 0);

  // Sample the text structure
  console.log('\n=== SAMPLE TEXT STRUCTURE ===\n');
  
  // Find sections
  const chapterMatches = txt.match(/^CHAPTER\s+\d+/gm);
  console.log('Chapters found:', chapterMatches ? chapterMatches.length : 0);

  // Find answer key sections
  const answerSections = txt.match(/ANSWER\s*KEY|ANS(?:WER)?S?\s*(?:\(.*?\))?/gm);
  console.log('Answer key sections:', answerSections ? answerSections.length : 0);

  // Sample from middle of file
  const midPoint = Math.floor(txt.length / 2);
  const sample = txt.substring(midPoint, midPoint + 2000);
  console.log('\nMid-file sample (chars ' + midPoint + ' to ' + (midPoint + 2000) + '):');
  console.log('---');
  console.log(sample);
  console.log('---\n');

  // Count question-like lines
  const questionishLines = lines.filter(l => {
    const t = l.trim();
    return /^\d+\)|^Q\.|^Que\.|^\(A\)|\([A-D]\)/.test(t) && t.length > 5;
  });
  
  console.log('Lines matching question patterns:', questionishLines.length);
  console.log('Estimated questions (rough):', Math.floor(questionishLines.length / 5)); // ~5 lines per question

  console.log('\n=== CONCLUSION ===');
  if (pattern1 && pattern1.length > 100) {
    console.log('✅ Book contains structured questions with "N)" format');
    console.log('   Estimated questions:', Math.max(pattern1.length, 1000));
  } else if (chapterMatches && chapterMatches.length > 5) {
    console.log('✅ Book organized by chapters');
    console.log('   Format appears to be study material with examples');
  } else {
    console.log('❌ Book structure NOT formatted as practice questions');
    console.log('   Appears to be educational content with mixed examples');
  }
}

analyzeReasoningPDF().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
