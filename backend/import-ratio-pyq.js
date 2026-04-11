const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// ============ Ratio PYQ Set ============
// Answer Key: 1(b) 2(c) 3(c) 4(c) 5(a) 6(a) 7(a) 8(b) 9(a) 10(b)
//            11(c) 12(d) 13(b) 14(b) 15(d) 16(b) 17(a) 18(b) 19(a) 20(c)
//            21(b) 22(d) 23(c) 24(d) 25(d) 26(b) 27(c) 28(c) 29(a) 30(c)
//            31(b) 32(b) 33(c) 34(b) 35(d) 36(b) 37(a) 38(b)

const questions = [
  {q: "The strength of a school is 640, with the number of boys being 400. Find the ratio of girls to boys.", o: ["5 : 6", "3 : 5", "8 : 5", "4 : 5"], a: 1, sub: "Basic Ratio", exam: "SSC CHSL 09/07/2024 (Shift-04)"},
  {q: "A sum of money is to be distributed among A, B, C, and D in the ratio of 10 : 4 : 8 : 5. If C gets Rs.24 more than B, how much did A receive?", o: ["Rs.63", "Rs.59", "Rs.60", "Rs.58"], a: 2, sub: "Distribution", exam: "RRB NTPC GL CBT-I 23/06/2025 (Shift-03)"},
  {q: "If a : b = 5 : 7, then (6a^2 – 2b^2) : (b^2 – a^2) will be:", o: ["12 : 5", "21 : 5", "13 : 6", "17 : 8"], a: 2, sub: "Algebraic Ratio", exam: "SSC CHSL 08/08/2023 (Shift-04)"},
  {q: "If a : b = c : d = e : f = 5 : 7, then what is the ratio of (3a + 5c + 11e) : (3b + 5d + 11f)?", o: ["7 : 11", "3 : 7", "5 : 7", "11 : 7"], a: 2, sub: "Compound Ratio", exam: "SSC CGL 26/09/2024 (Shift-02)"},
  {q: "If (7x + y) : (7x – y) = 7 : 2, then what is the value of x : y?", o: ["9 : 35", "11 : 42", "6 : 41", "17 : 52"], a: 0, sub: "Algebraic Ratio", exam: "SSC MTS 19/06/2023 (Shift-03)"},
  {q: "If 674 bananas were distributed among three monkeys in the ratio 17 : 14 : 265 respectively, how many bananas did the third monkey get?", o: ["24", "23", "22", "25"], a: 0, sub: "Distribution", exam: "RRB NTPC GL CBT-I 21/06/2025 (Shift-02)"},
  {q: "If 1/M : 1/N : 1/O = 3 : 4 : 5, then M : N : O is equal to:", o: ["20 : 15 : 12", "15 : 20 : 12", "12 : 15 : 20", "20 : 12 : 15"], a: 0, sub: "Inverse Ratio", exam: "SSC CHSL 05/07/2024 (Shift-02)"},
  {q: "If 2P = 3Q = 4R = 5S, the find P : Q : R : S.", o: ["30 : 20 : 12 : 15", "12 : 20 : 30 : 15", "20 : 30 : 15 : 12", "30 : 20 : 15 : 12"], a: 1, sub: "Compound Ratio", exam: "SSC Phase-XI 28/06/2023 (Shift-03)"},
  {q: "If A : B = 6 : 8 and B : C = 5 : 10, then A : B : C is:", o: ["3 : 4 : 8", "1 : 3 : 4", "4 : 3 : 2", "1 : 2 : 4"], a: 0, sub: "Chain Ratio", exam: "SSC CGL 13/09/2024 (Shift-01)"},
  {q: "A total profit of Rs.25,300 is to be distributed amongst P, Q, and R such that P : Q = 9 : 7 and Q : R = 3 : 12. The share (in Rs.) of R in the profit is:", o: ["16,150", "16,100", "16,000", "16,050"], a: 1, sub: "Distribution", exam: "RRB NTPC GL CBT-I 20/06/2025 (Shift-01)"},
  // ...existing code for all 38 questions...
];

// Build dedup set from existing questions
const existing = new Set();
data.questions.forEach(q => {
  const key = q.question.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 80);
  existing.add(key);
});

const seen = new Set();
const now = new Date().toISOString();
const baseId = Date.now();
let added = 0, skipped = 0, tier1Count = 0, tier2Count = 0;

questions.forEach((item, i) => {
  const key = item.q.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 80);
  if (existing.has(key) || seen.has(key)) {
    skipped++;
    return;
  }
  seen.add(key);
  tier1Count++;
  data.questions.push({
    id: `${baseId}_ratio_${i + 1}`,
    type: "question",
    examFamily: "ssc",
    subject: "quant",
    difficulty: "medium",
    tier: "tier1",
    questionMode: "objective",
    topic: "Ratio and Proportion",
    question: item.q,
    options: item.o,
    answerIndex: item.a,
    explanation: "",
    marks: 2,
    negativeMarks: 0.5,
    isChallengeCandidate: false,
    confidenceScore: 1,
    reviewStatus: "approved",
    isPYQ: true,
    year: null,
    frequency: 1,
    subtopic: item.sub || "Ratio and Proportion",
    source: {
      kind: "pyq",
      fileName: item.exam || "Maths by Aditya Ranjan - Ratio",
      importedAt: now
    },
    createdAt: now,
    updatedAt: now,
    reviewAudit: {
      reviewedAt: now,
      reviewedBy: "manual_import",
      decision: "approve",
      rejectReason: ""
    }
  });
  added++;
});

fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));

console.log(`Total parsed: ${questions.length}`);
console.log(`Unique new: ${added}, Skipped (dupes): ${skipped}`);
console.log(`Added ${added} Ratio PYQs (${tier1Count} tier1)`);
console.log(`Total questions now: ${data.questions.length}`);
