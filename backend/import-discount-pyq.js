const fs = require('fs');
const data = require('./data/question-bank.json');

const now = new Date().toISOString();
const newQs = [
  {
    tier: 'tier1', source: 'RRB Technician G-III, 26/12/2024 (Shift-03)',
    question: 'A man sold an article for Rs.405 by giving a discount of d% on its marked price. If the marked price of the article is Rs.540, then what is the value of d?',
    options: ['25', '12.5', '20', '12'], answerIndex: 0
  },
  {
    tier: 'tier1', source: 'SSC CPO 29/06/2024 (Shift-02)',
    question: 'The marked price of an immersion rod in an electronic store is Rs.900. The store offers a discount of 12% on its sale. At what price (in Rs.) can a customer buy it from the electronic store?',
    options: ['787', '792', '782', '797'], answerIndex: 1
  },
  {
    tier: 'tier1', source: 'DP CONSTABLE 28/11/2023 (Shift-03)',
    question: 'A cupboard is sold for Rs.6,500 after giving a discount of 20%. Find its marked price (in rupees).',
    options: ['8,125', '8,235', '7,546', '8,000'], answerIndex: 0
  },
  {
    tier: 'tier2', source: 'SSC CGL TIER-II 18/01/2025',
    question: 'On the occasion of Republic Day, a retail store offers a scheme where customers can avail a discount of 26% on their total purchase. If Manish buys items worth Rs.2,050, how much money (in Rs.) will he save through the scheme discount?',
    options: ['533', '544', '522', '511'], answerIndex: 0
  },
  {
    tier: 'tier1', source: 'RRB ALP 28/11/2024 (Shift-02)',
    question: "A scheme like 'Buy 5, Get 1' on the same kind of articles with the same marked price offers a ______ discount.",
    options: ['20%', '16\u2154%', '11\u2151%', '17.5%'], answerIndex: 1
  },
  {
    tier: 'tier1', source: 'SSC CGL 14/07/2023 (Shift-01)',
    question: 'A shopkeeper offers the following two discount schemes. A: Buy 3 get 4 free. B: Buy 5 get 6 free. Which scheme has the maximum discount percentage?',
    options: ['A', 'A does not give any discount', 'A and B both have the same discount percentage', 'B'], answerIndex: 0
  },
  {
    tier: 'tier1', source: 'RRB Technician G-III, 26/12/2024 (Shift-01)',
    question: 'A shopkeeper provides successive discounts of 7% and 2%, which are equivalent to a single discount of _____.',
    options: ['9.14%', '8%', '9%', '8.86%'], answerIndex: 3
  },
  {
    tier: 'tier1', source: 'SSC CGL 21/07/2023 (Shift-03)',
    question: 'What is the equivalent discount percentage corresponding to two successive discounts of 9% and 17%?',
    options: ['27.53%', '26.47%', '26.00%', '24.47%'], answerIndex: 0
  },
  {
    tier: 'tier1', source: 'SSC CGL 17/07/2023 (Shift-01)',
    question: 'A shopkeeper offers the following discount schemes for buyers on an article: I. Two successive discounts of 15% each. II. A discount of 25% followed by a discount of 5%. III. Two successive discounts of 20% and 10%. IV. A discount of 30%. Under which scheme will the selling price be maximum?',
    options: ['Scheme IV', 'Scheme III', 'Scheme II', 'Scheme I'], answerIndex: 3
  },
  {
    tier: 'tier1', source: 'SSC CGL 23/09/2024 (Shift-03)',
    question: 'The single discount equivalent to a series discount of 60%, 70% and 80% is:',
    options: ['97.6%', '70%', '85%', '95.5%'], answerIndex: 0
  },
  {
    tier: 'tier2', source: 'SSC CGL TIER II 26/10/2023',
    question: 'What is the single discount equivalent to the successive discounts of 20%, 35%, and 10%?',
    options: ['53.2%', '48.7%', '65.4%', '42.3%'], answerIndex: 0
  },
  {
    tier: 'tier2', source: 'SSC CGL MAINS 29/01/2022',
    question: 'A discount of 10% is offered on the price of an article if the payment is made online. An additional discount of 5% is given to credit card holders. A person wishes to buy a watch priced at Rs.60,000 by paying online through credit card. How much does he need to pay (in Rs.)?',
    options: ['62,150', '51,300', '61,250', '53,100'], answerIndex: 1
  },
  {
    tier: 'tier1', source: 'SSC Phase X 04/08/2022 (Shift-03)',
    question: 'An article is sold at three successive discounts of 10%, 20% and 25%. If the selling price of the article is Rs.2,592 then what is the marked price of the article?',
    options: ['Rs.5,200', 'Rs.4,800', 'Rs.4,900', 'Rs.5,000'], answerIndex: 1
  },
  {
    tier: 'tier1', source: 'SSC Phase XII 25/06/2024 (Shift-03)',
    question: 'A tractor manufacturing company sells each tractor for Rs.5,00,000. Assuming that KISAN firm buys 50 tractors from them as a part of an annual contract, the company offers a trade discount of 10% to KISAN and an additional 2% discount if the payment is made within 30 days. What will be the amount payable by KISAN within 30 days for the consignment?',
    options: ['Rs.20,051,000', 'Rs.22,050,000', 'Rs.24,050,020', 'Rs.22,080,100'], answerIndex: 1
  },
  {
    tier: 'tier1', source: 'DPHC AWO/TPO 27/10/2022 (Shift-02)',
    question: 'The marked price of a water bottle is Rs.950. A man bought the same for Rs.740, after getting two successive discounts. If the first discount is 12%, then what is the second discount?',
    options: ['13.45%', '12.46%', '14.56%', '11.48%'], answerIndex: 3
  },
  {
    tier: 'tier1', source: 'SSC CGL 16/08/2021 (Shift-01)',
    question: 'The selling price of an article marked for Rs.10,000 after giving three discounts 20%, 10% and k% is Rs.6,120. What will be the selling price (in Rs.) of the same article if a single discount of (k+20)% is allowed?',
    options: ['8,500', '6,800', '8,000', '6,500'], answerIndex: 3
  }
];

const formatted = newQs.map((q, i) => {
  const id = Date.now() + '_disc' + (i + 1);
  return {
    id,
    type: 'question',
    examFamily: 'ssc',
    subject: 'quant',
    difficulty: 'medium',
    tier: q.tier,
    questionMode: 'objective',
    topic: 'Discount',
    question: q.question,
    options: q.options,
    answerIndex: q.answerIndex,
    explanation: '',
    marks: q.tier === 'tier1' ? 2 : 3,
    negativeMarks: q.tier === 'tier1' ? 0.5 : 1,
    isChallengeCandidate: false,
    confidenceScore: 1,
    reviewStatus: 'approved',
    isPYQ: true,
    year: null,
    frequency: 1,
    subtopic: null,
    source: { kind: 'pyq', fileName: q.source, importedAt: now },
    createdAt: now,
    updatedAt: now,
    reviewAudit: { reviewedAt: now, reviewedBy: 'manual_import', decision: 'approve', rejectReason: '' }
  };
});

data.questions.push(...formatted);
data.updatedAt = now;
fs.writeFileSync('./data/question-bank.json', JSON.stringify(data, null, 2));

const t1 = formatted.filter(q => q.tier === 'tier1').length;
const t2 = formatted.filter(q => q.tier === 'tier2').length;
console.log(`Added ${formatted.length} Discount PYQs (${t1} tier1, ${t2} tier2) with confidenceScore=1`);
console.log(`Total questions now: ${data.questions.length}`);
