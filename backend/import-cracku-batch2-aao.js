const fs = require('fs');
const path = require('path');
const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const cracku = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'cracku_extracted.json'), 'utf8'));

const aao = cracku.filter(q => q.source_file && q.source_file.includes('Assistant Audit'));

// Skip: matching questions without tables, unclear references
const skipNums = new Set([43]); // Q43 is "Match the following" without table

// Topic classification: Q2-Q40 = Accounting, Q41+ = Economics
function getTopic(num) {
  return num <= 40 ? 'Accounting' : 'Economics';
}

// Build dedup map
const keyMap = new Map();
bank.questions.forEach((q, idx) => {
  keyMap.set(q.question.trim().toLowerCase().substring(0, 50), idx);
});

let added = 0, updated = 0, skipped = 0;

for (const q of aao) {
  if (skipNums.has(q.num)) { skipped++; continue; }

  const key = q.question.trim().toLowerCase().substring(0, 50);
  const answerIndex = q.answer_index;
  const topic = getTopic(q.num);
  
  const existIdx = keyMap.get(key);
  if (existIdx !== undefined) {
    // Update existing with better topic classification
    bank.questions[existIdx].topic = topic;
    bank.questions[existIdx].year = 2022;
    bank.questions[existIdx].updatedAt = new Date().toISOString();
    updated++;
  } else {
    const qObj = {
      id: Date.now().toString() + '_' + Math.random().toString(36).slice(2, 9),
      type: 'question', examFamily: 'ssc', subject: 'gk',
      difficulty: 'medium', tier: 'tier2', questionMode: 'objective',
      topic, question: q.question, options: q.options, answerIndex,
      explanation: '', marks: 2, negativeMarks: 0.5,
      isPYQ: true, year: 2022, subtopic: null,
      source: { kind: 'cracku-extract', fileName: 'CGL Tier-2 28-Jan-2022 AAO', importedAt: new Date().toISOString() },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    bank.questions.push(qObj);
    keyMap.set(key, bank.questions.length - 1);
    added++;
  }
}

bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
console.log(`AAO Import: ${added} added, ${updated} updated, ${skipped} skipped`);
console.log(`Total bank: ${bank.questions.length}`);

// Subject breakdown
const subjects = {};
bank.questions.forEach(q => { subjects[q.subject] = (subjects[q.subject] || 0) + 1; });
for (const [k, v] of Object.entries(subjects).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
