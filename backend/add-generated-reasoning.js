#!/usr/bin/env node
const fs = require("fs");
const crypto = require("crypto");

const bankPath = "backend/data/question-bank.json";
const raw = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const bank = Array.isArray(raw) ? { updatedAt: new Date().toISOString(), questions: raw } : raw;
const questions = Array.isArray(bank.questions) ? bank.questions : [];
const now = new Date().toISOString();

function makeId(tag) {
  return `q_reasoning_gen_${crypto.randomBytes(5).toString("hex")}_${tag}`;
}

function base(partial) {
  return {
    ...partial,
    type: "question",
    examFamily: "ssc",
    subject: "reasoning",
    difficulty: "medium",
    tier: "tier1",
    questionMode: "objective",
    marks: 2,
    negativeMarks: 0.5,
    isChallengeCandidate: false,
    confidenceScore: 1,
    reviewStatus: "approved",
    isPYQ: false,
    year: null,
    frequency: 1,
    subtopic: partial.topic,
    source: {
      kind: "generated",
      generator: "deterministic-reasoning-pack",
      importedAt: now
    },
    createdAt: now,
    updatedAt: now
  };
}

const generated = [];

for (let n = 11; n <= 20; n += 1) {
  generated.push(base({
    id: makeId(`num_${n}`),
    topic: "Number Series",
    question: `Find the next number in the series: ${n}, ${n + 2}, ${n + 4}, ${n + 6}, ?`,
    options: [String(n + 7), String(n + 8), String(n + 9), String(n + 10)],
    answerIndex: 1,
    explanation: "Common difference is 2."
  }));
}

for (let i = 1; i <= 10; i += 1) {
  const a = String.fromCharCode(64 + i);
  const b = String.fromCharCode(65 + i);
  const c = String.fromCharCode(66 + i);
  generated.push(base({
    id: makeId(`ana_${i}`),
    topic: "Analogy",
    question: `${a} : ${b} :: ${c} : ?`,
    options: [String.fromCharCode(66 + i), String.fromCharCode(67 + i), String.fromCharCode(68 + i), String.fromCharCode(69 + i)],
    answerIndex: 1,
    explanation: "Alphabetic position increases by 1."
  }));
}

for (let i = 1; i <= 10; i += 1) {
  const p1 = i + 2;
  const p2 = i + 5;
  const sum = p1 + p2;
  generated.push(base({
    id: makeId(`arith_${i}`),
    topic: "Arithmetic Reasoning",
    question: `If x + ${p1} = ${sum}, then x = ?`,
    options: [String(i - 1), String(i), String(i + 1), String(i + 2)],
    answerIndex: 1,
    explanation: "Subtract constants from both sides."
  }));
}

for (let i = 0; i < 10; i += 1) {
  const start = 65 + i;
  generated.push(base({
    id: makeId(`alnum_${i}`),
    topic: "Alphanumeric Series",
    question: `Choose the next letter: ${String.fromCharCode(start)}, ${String.fromCharCode(start + 2)}, ${String.fromCharCode(start + 4)}, ?`,
    options: [String.fromCharCode(start + 5), String.fromCharCode(start + 6), String.fromCharCode(start + 7), String.fromCharCode(start + 8)],
    answerIndex: 1,
    explanation: "Letter positions increase by 2."
  }));
}

for (let i = 1; i <= 10; i += 1) {
  generated.push(base({
    id: makeId(`code_${i}`),
    topic: "Coding-Decoding",
    question: "In a code language, if CAT is written as DBU (each letter shifted +1), then DOG is written as ?",
    options: ["EPH", "EOH", "EOG", "FPH"],
    answerIndex: 0,
    explanation: "Apply +1 shift to each letter."
  }));
}

for (let i = 1; i <= 20; i += 1) {
  const n = 20 + i;
  generated.push(base({
    id: makeId(`num3_${i}`),
    topic: "Number Series",
    question: `Find the missing term: ${n}, ${n + 3}, ${n + 6}, ?, ${n + 12}`,
    options: [String(n + 8), String(n + 9), String(n + 10), String(n + 11)],
    answerIndex: 1,
    explanation: "Common difference is 3."
  }));
}

for (let i = 1; i <= 10; i += 1) {
  const words = ["CAT", "DOG", "SUN", "MAP", "BOX", "RAT", "PEN", "CUP", "BAT", "TIN"];
  const word = words[i - 1];
  const shifted = word
    .split("")
    .map((ch) => String.fromCharCode(ch.charCodeAt(0) + 1))
    .join("");
  generated.push(base({
    id: makeId(`code2_${i}`),
    topic: "Coding-Decoding",
    question: `If each letter is shifted by +1, then code for ${word} is ?`,
    options: [shifted, `${shifted[0]}${shifted[1]}${word[2]}`, `${word[0]}${shifted[1]}${shifted[2]}`, word],
    answerIndex: 0,
    explanation: "Each letter moves to the next alphabet letter."
  }));
}

const seen = new Set(questions.map((q) => `${String(q.question || "").toLowerCase()}|${(q.options || []).join("|").toLowerCase()}`));
let added = 0;
for (const q of generated) {
  const key = `${String(q.question || "").toLowerCase()}|${(q.options || []).join("|").toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  questions.push(q);
  added += 1;
}

bank.questions = questions;
bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(Array.isArray(raw) ? questions : bank, null, 2));

console.log(`Generated reasoning added: ${added}`);
console.log(`Total bank count: ${questions.length}`);
