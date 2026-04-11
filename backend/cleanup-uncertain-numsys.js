const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// These 8 questions have answers that contradict verified math.
// Remove them from the bank for 100% accuracy.
const removePrefixes = [
  "What is the unit digit in the expansion of (57242)",
  "2⁷⁵ + 3¹³ is divisible by",
  "3²⁵ + 2²⁷ is divisible by",
  "If x2945y is divisible by 176",
  "The smallest 1-digit number to be added to the 6-digit number 723265",
  "When positive numbers a, b and c are divided by 13, the remainders are 9, 7 and 10",
  "What is the remainder when 2⁷⁵ is divided by 15",
  "What is the remainder when (32¹⁷ + 2⁶⁸) is divided by 48",
];

const before = data.questions.length;
const removed = [];

data.questions = data.questions.filter(q => {
  for (const prefix of removePrefixes) {
    if (q.question && q.question.startsWith(prefix)) {
      removed.push(q.question.slice(0, 70));
      return false;
    }
  }
  return true;
});

const after = data.questions.length;
data.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));

console.log(`\n=== Uncertain Questions Cleanup ===`);
console.log(`Before: ${before}`);
console.log(`Removed: ${removed.length}`);
removed.forEach((r, i) => console.log(`  ${i+1}. ${r}...`));
console.log(`After: ${after}`);
