const fs = require('fs');
const data = require('./data/question-bank.json');
const now = new Date().toISOString();

// SET 1 (15 Qs): Answer Key from image 1
// 1(c) 2(b) 3(d) 4(b) 5(a) 6(b) 7(c) 8(b) 9(d) 10(a)
// 11(b) 12(a) 13(b) 14(b) 15(c)
const set1 = [
  { question: 'What annual installment will discharge a debt of \u20B926,160 due in 4 years at 6% simple interest p.a.?', options: ['\u20B94,500', '\u20B95,500', '\u20B96,000', '\u20B95,800'], answerIndex: 2, subtopic: 'SI Installment', source: 'SSC CGL 10/09/2024 (Shift-02)' },
  { question: 'Find the total amount of debt that will be discharged by 5 equal instalments of \u20B9200 each, if the debt is due in 5 years at 5% p.a. at simple interest.', options: ['\u20B91,400', '\u20B91,100', '\u20B91,200', '\u20B91,255'], answerIndex: 1, subtopic: 'SI Installment', source: 'SSC CHSL 02/07/2024 (Shift-03)' },
  { question: 'An annual installment of \u20B93,500 will discharge a debt of \u20B916,310 due in 4 years at y% simple interest per annum. What is the value of y? [Note: Installments will be paid at the end of Year 1, Year 2, Year 3 and Year 4.]', options: ['10.5', '16.5', '11.5', '11'], answerIndex: 3, subtopic: 'SI Installment', source: 'SSC Phase XII 24/06/2024 (Shift-01)' },
  { question: 'Naman borrows a sum of Rs.3,48,020 at the rate of 8% per annum simple interest. At the end of the first year, he repays Rs.15,090 towards return of principal amount borrowed. If Naman clears all pending dues at the end of the second year, including interest payment that accrued during the first year, how much does he pay (in Rs.) at the end of the second year?', options: ['3,79,386', '3,87,406', '3,88,931', '3,92,733'], answerIndex: 1, subtopic: 'SI Installment', source: 'SSC CGL 25/09/2024 (Shift-02)' },
  { question: 'An electric bike is available for \u20B91,00,000. A customer has to pay \u20B920,800 down payment, followed by 4 equal installments. If the rate of interest charged is 25% per annum simple interest, calculate the 4 yearly installments.', options: ['\u20B928,800', '\u20B921,210', '\u20B922,110', '\u20B921,120'], answerIndex: 0, subtopic: 'SI Installment', source: 'DP CONSTABLE 03/12/2023 (Shift-01)' },
  { question: 'A mobile phone is available for \u20B925,000 or \u20B95,200 down payment, followed by 4 equal monthly instalments. If the rate of interest is 25% p.a. simple interest, calculate the amount of each instalment.', options: ['\u20B95,020', '\u20B95,200', '\u20B95,362', '\u20B95,355'], answerIndex: 1, subtopic: 'SI Installment', source: 'DP Head Constable 20/10/2022 (Shift-02)' },
  { question: 'A laptop charger is sold for \u20B92,540 in cash or for a down payment of \u20B91,340 in cash together with \u20B91,205 to be paid after one month. Find the rate of interest charged in the instalment scheme.', options: ['20% p.a.', '10% p.a.', '5% p.a.', '15% p.a.'], answerIndex: 2, subtopic: 'SI Installment', source: 'SSC CHSL 11/07/2024 (Shift-01)' },
  { question: 'A cell phone is available for \u20B9600 or for \u20B9300 cash down payment together with \u20B9360 to be paid after two months. Find the rate of interest charged under this scheme.', options: ['60%', '120%', '20%', '50%'], answerIndex: 1, subtopic: 'SI Installment', source: 'SSC CGL 24/09/2024 (Shift-02)' },
  { question: 'An item is bought on a condition that three equal installments of \u20B93,993 are to be paid at a rate of 10% compound interest, compounded annually. The cost of the item is:', options: ['\u20B910,000', '\u20B99,050', '\u20B99,590', '\u20B99,930'], answerIndex: 3, subtopic: 'CI Installment', source: 'SSC Phase-XI 27/06/2023 (Shift-01)' },
  { question: 'A sum of \u20B966,550 is taken on loan. This is to be paid back in two equal instalments. If the rate of interest is 20% compounded annually, find the value of each instalment.', options: ['\u20B943,560', '\u20B944,550', '\u20B942,560', '\u20B940,550'], answerIndex: 0, subtopic: 'CI Installment', source: 'DP CONSTABLE 15/11/2023 (Shift-01)' },
  { question: 'A loan of \u20B92,550 is to be paid back in two equal half-yearly installments. How much is each installment if the interest is compounded half-yearly at 8% p.a.?', options: ['\u20B91,250', '\u20B91,352', '\u20B91,745', '\u20B91,457'], answerIndex: 1, subtopic: 'CI Installment', source: 'SSC Phase-XII 24/06/2024 (Shift-01)' },
  { question: 'A sum of \u20B95,19,500 was borrowed at 7\u2074\u2085% per annum compound interest and paid back in 2 years in two equal annual instalments. What is the installment?', options: ['\u20B92,90,521', '\u20B92,70,521', '\u20B92,80,521', '\u20B93,00,521'], answerIndex: 0, subtopic: 'CI Installment', source: 'DP CONSTABLE 21/11/2023 (Shift-01)' },
  { question: 'A man borrowed a sum of money and agreed to pay off by paying \u20B94,200 at the end of the first year and \u20B94,410 at the end of the second year. If the rate of compound interest was 5% per annum, find the sum borrowed.', options: ['\u20B94,500', '\u20B98,000', '\u20B96,500', '\u20B95,000'], answerIndex: 1, subtopic: 'CI Installment', source: 'DP CONSTABLE 14/11/2023 (Shift-01)' },
  { question: 'A mobile phone is available for \u20B979,860 by cash payment or by paying cash of \u20B960,000 as down payment and the remaining amount in three equal annual installments. If the shopkeeper charges interest at the rate of 10% per annum compounded annually, then the amount of each installment (in \u20B9) will be:', options: ['\u20B96,789', '\u20B97,986', '\u20B96,000', '\u20B96,689'], answerIndex: 1, subtopic: 'CI Installment', source: 'SSC CHSL 16/04/2021 (Shift-02)' },
  { question: 'Ramesh borrowed \u20B91,20,000 interest free from Aman. If he pays back 6.25% of this amount quarterly and has already paid \u20B930,000, then for how many months does he need to pay back his loan for the rest of the amount?', options: ['24 months', '42 months', '36 months', '38 months'], answerIndex: 2, subtopic: 'Interest-free Installment', source: 'DP Head Constable 18/10/2022 (Shift-01)' }
];

// SET 2 (11 Qs): Answer Key from image 2
// 1(a) 2(d) 3(a) 4(b) 5(b) 6(c) 7(c) 8(d) 9(c) 10(d) 11(d)
const set2 = [
  { question: 'What annual installment will discharge a debt of \u20B93,270 due in 3 years at 9% per annum simple interest?', options: ['\u20B91,000', '\u20B91,050', '\u20B91,090', '\u20B91,075'], answerIndex: 0, subtopic: 'SI Installment', source: 'Installment PYQ Set' },
  { question: 'What is the amount (in \u20B9) of debt that will be discharged in 6 equal installments of \u20B9800 each, if the debt is due in 6 years at 5% per annum?', options: ['6,600', '7,500', '8,000', '5,400'], answerIndex: 3, subtopic: 'SI Installment', source: 'Installment PYQ Set' },
  { question: 'Sohan borrows a sum of Rs.1,41,545 at the rate of 11% per annum simple interest. At the end of the first year, he repays Rs.25,490 towards return of principal amount borrowed. If Sohan clears all pending dues at the end of the second year, including interest payment that accrued during the first year, how much does he pay (in Rs.) at the end of the second year?', options: ['1,44,391', '1,36,453', '1,41,222', '1,37,407'], answerIndex: 0, subtopic: 'SI Installment', source: 'Installment PYQ Set' },
  { question: 'A customer pays Rs.975 in instalments. The payment is done each month Rs.5 less than the previous month. If the first instalment is Rs.100, how much time will be taken to pay the entire amount?', options: ['14 months', '15 months', '27 months', '26 months'], answerIndex: 1, subtopic: 'SI Installment', source: 'Installment PYQ Set' },
  { question: 'A man has to discharge a debt of \u20B915,600 which is due in 3 years at 4% simple interest per annum. If he pays this amount in equal installments of annual payment, find the amount for annual payment.', options: ['\u20B95,100', '\u20B95,000', '\u20B95,400', '\u20B95,200'], answerIndex: 1, subtopic: 'SI Installment', source: 'Installment PYQ Set' },
  { question: 'A person borrowed a sum of \u20B930,800 at 10% p.a. for 3 years, interest compounded annually. At the end of two years, he paid a sum of \u20B913,268. At the end of 3rd year, he paid \u20B9x to clear the debt. What is the value of x?', options: ['26,200', '26,620', '26,400', '26,510'], answerIndex: 2, subtopic: 'CI Installment', source: 'Installment PYQ Set' },
  { question: 'A music player is sold for \u20B94,510 cash, or \u20B91,200 cash down payment and the balance in three equal easy installments. If 10% is the rate of interest compounded annually, find the amount of instalment.', options: ['\u20B91,330', '\u20B91,332', '\u20B91,331', '\u20B91,333'], answerIndex: 2, subtopic: 'CI Installment', source: 'Installment PYQ Set' },
  { question: 'A person takes a loan of \u20B94,000 for 3 years at 8% per annum compound interest. He repaid \u20B92,000 in each of the first and second years. The amount he should pay at the end of the third year to clear all his debt is:', options: ['\u20B9567.12', '\u20B9525.34', '\u20B9500.20', '\u20B9546.05'], answerIndex: 3, subtopic: 'CI Installment', source: 'Installment PYQ Set' },
  { question: 'A person borrowed some money on compound interest and returned it in 3 equal annual instalments. If the rate of interest is 15% per annum and the annual instalment is \u20B912,167, then find the sum borrowed.', options: ['\u20B926,970', '\u20B928,530', '\u20B927,780', '\u20B925,780'], answerIndex: 2, subtopic: 'CI Installment', source: 'Installment PYQ Set' },
  { question: 'A man borrowed a certain sum and agrees to repay it by paying \u20B94,000 at the end of first year and \u20B97,700 at the end of second year. If the rate of compound interest compounded annually is 10% per annum, then find the sum (in \u20B9).', options: ['11,500', '11,000', '9,000', '10,000'], answerIndex: 3, subtopic: 'CI Installment', source: 'Installment PYQ Set' },
  { question: 'A mobile phone is available for \u20B939,300 cash payment, or for \u20B97,450 cash down payment and three equal yearly instalments. If the shopkeeper charges interest at the rate of 20% per annum, compounded annually, what is the amount of instalment (in \u20B9)?', options: ['16,240', '14,060', '15,000', '15,120'], answerIndex: 3, subtopic: 'CI Installment', source: 'Installment PYQ Set' }
];

const allSets = [...set1, ...set2];

// Deduplicate by question text (first 80 chars)
const existing = new Set(data.questions.map(q => q.question.substring(0, 80).toLowerCase().replace(/\s+/g, ' ')));
const seen = new Set();
const unique = [];
for (const q of allSets) {
  const key = q.question.substring(0, 80).toLowerCase().replace(/\s+/g, ' ');
  if (!seen.has(key) && !existing.has(key)) {
    seen.add(key);
    unique.push(q);
  } else if (seen.has(key) || existing.has(key)) {
    console.log('SKIPPED (dup):', q.question.substring(0, 60));
  }
}

console.log(`Total parsed: ${allSets.length}, Unique new: ${unique.length}, Skipped: ${allSets.length - unique.length}`);

const formatted = unique.map((q, i) => {
  const id = Date.now() + '_inst' + (i + 1);
  return {
    id,
    type: 'question',
    examFamily: 'ssc',
    subject: 'quant',
    difficulty: 'medium',
    tier: 'tier1',
    questionMode: 'objective',
    topic: 'Installment',
    question: q.question,
    options: q.options,
    answerIndex: q.answerIndex,
    explanation: '',
    marks: 2,
    negativeMarks: 0.5,
    isChallengeCandidate: false,
    confidenceScore: 1,
    reviewStatus: 'approved',
    isPYQ: true,
    year: null,
    frequency: 1,
    subtopic: q.subtopic || null,
    source: { kind: 'pyq', fileName: q.source, importedAt: now },
    createdAt: now,
    updatedAt: now,
    reviewAudit: { reviewedAt: now, reviewedBy: 'manual_import', decision: 'approve', rejectReason: '' }
  };
});

data.questions.push(...formatted);
data.updatedAt = now;
fs.writeFileSync('./data/question-bank.json', JSON.stringify(data, null, 2));

console.log(`Added ${formatted.length} Installment PYQs with confidenceScore=1`);
console.log(`Total questions now: ${data.questions.length}`);
