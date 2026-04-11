/**
 * Import extracted DI questions into question-bank.json
 * - 500 DI questions from Smartkeeda PDF (100 sets × 5 questions)
 * - Stores passage/directions as shared set context
 * - References chart images in public/images/di/
 * - Supports 5 options (A-E) with answerIndex 0-4
 */

const fs = require('fs');
const path = require('path');

const BANK_PATH = path.join(__dirname, 'data', 'question-bank.json');
const DI_PATH = path.join(__dirname, 'data', 'di_extracted.json');

function generateId() {
  return 'di_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function main() {
  // Load existing bank
  const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));
  const existing = bank.questions;
  console.log(`Existing questions: ${existing.length}`);

  // Load extracted DI questions
  const diData = JSON.parse(fs.readFileSync(DI_PATH, 'utf8'));
  const diQuestions = diData.questions;
  console.log(`DI questions to import: ${diQuestions.length}`);

  // Build dedup index on first 50 chars
  const dedupIndex = new Map();
  for (const q of existing) {
    const key = (q.question || '').toLowerCase().trim().slice(0, 50);
    if (key.length > 10) dedupIndex.set(key, q);
  }

  let added = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const diq of diQuestions) {
    // Dedup check
    const dedupKey = (diq.question || '').toLowerCase().trim().slice(0, 50);
    if (dedupIndex.has(dedupKey)) {
      skipped++;
      continue;
    }

    // Build the question text with passage prefix
    let questionText = diq.question;
    // Clean up newlines
    questionText = questionText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Build passage (directions text)
    let passage = (diq.passage || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    const entry = {
      id: generateId(),
      type: 'question',
      examFamily: 'ssc',
      subject: 'quant',
      difficulty: 'medium',
      tier: 'tier2',
      questionMode: 'objective',
      topic: 'Data Interpretation',
      subtopic: null,
      passage: passage,
      question: questionText,
      options: diq.options,
      answerIndex: diq.answerIndex,
      explanation: (diq.explanation || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
      diagram: diq.diagram ? `/images/di/${diq.diagram}` : null,
      diSetNum: diq.set_num,
      marks: 3,
      negativeMarks: 1,
      isChallengeCandidate: false,
      confidenceScore: 0.85,
      reviewStatus: 'approved',
      isPYQ: false,
      year: null,
      frequency: 1,
      source: {
        kind: 'practice_pdf',
        fileName: 'Data_Interpretation_Combo_PDF_for_Bank_PO_Pre.pdf',
        importedAt: now,
        extractedBy: 'extract-di-smartkeeda'
      },
      createdAt: now,
      updatedAt: now,
      reviewAudit: {
        reviewedAt: now,
        reviewedBy: 'di-import-script',
        decision: 'approve',
        rejectReason: ''
      }
    };

    existing.push(entry);
    dedupIndex.set(dedupKey, entry);
    added++;
  }

  console.log(`\nAdded: ${added}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`New total: ${existing.length}`);

  // Stats
  const diCount = existing.filter(q => q.topic === 'Data Interpretation').length;
  const quantCount = existing.filter(q => q.subject === 'quant').length;
  const withPassage = existing.filter(q => q.passage).length;
  const withDiagram = existing.filter(q => q.diagram).length;

  console.log(`\nDI questions in bank: ${diCount}`);
  console.log(`Total quant questions: ${quantCount}`);
  console.log(`Questions with passages: ${withPassage}`);
  console.log(`Questions with diagrams: ${withDiagram}`);

  // Save
  bank.questions = existing;
  fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2), 'utf8');
  console.log('\nSaved to question-bank.json');
}

main();
