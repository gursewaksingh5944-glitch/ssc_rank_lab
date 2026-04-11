const fs = require('fs');
const data = require('./data/question-bank.json');
const now = new Date().toISOString();

// SET 1 (14 Qs): 1(a) 2(d) 3(b) 4(b) 5(b) 6(b) 7(a) 8(c) 9(d) 10(c) 11(c) 12(b) 13(b) 14(d)
const set1 = [
  { question: 'By selling 3 dozen oranges for Rs.405, a trader loses 25%. How many oranges should he sell for Rs.288 if he needs to earn a profit of 20% in the transaction?', options: ['16', '15', '18', '12'], answerIndex: 0, source: 'SSC CHSL 04/08/2021 (Shift-03)' },
  { question: 'By selling 18 table fans for \u20B911,664 a man incurs a loss of 10%. How many fans should he sell for \u20B917,424 to earn 10% profit?', options: ['23', '18', '20', '22'], answerIndex: 3, source: 'SSC CGL 07/03/2020 (Shift-01)' },
  { question: 'A dealer professing to sell his goods at cost price uses 950 grams weight for 1 kg. His gain percentage is: (rounded off to two decimal places)', options: ['5.35%', '5.26%', '5.86%', '5.96%'], answerIndex: 1, source: 'SSC CGL 14/07/2023 (Shift-03)' },
  { question: 'A dishonest dealer announces selling his articles with 22% loss, but uses 35% lighter weights. What is the percentage of his profit or loss?', options: ['13% loss', '20% profit', '20% loss', '13% profit'], answerIndex: 1, source: 'SSC CPO 03/10/2023 (Shift-01)' },
  { question: 'A dishonest shopkeeper claims to sell salt at a rate of \u20B925/kg. The cost price of the salt is \u20B925/kg. Not satisfied with this, he tries to make profit by removing 200 gm from each 1 kg. What is the shopkeeper\'s gain percentage?', options: ['15%', '25%', '30%', '20%'], answerIndex: 1, source: 'SSC CGL 09/09/2024 (Shift-03)' },
  { question: 'Ramesh sells rice at \u20B936 per kg, which he purchased for \u20B930 per kg. Moreover, he gives only 800 gm of rice instead of 1 kg while selling. Find the actual profit percentage of Ramesh.', options: ['46%', '50%', '48%', '52%'], answerIndex: 1, source: 'SSC CGL 13/09/2024 (Shift-02)' },
  { question: 'A dishonest trader marks up his goods by 50% and then allows a discount of 20% on its marked price. Additionally, he uses a faulty scale which measures 900 gm for 1 kg. What will be his net profit percentage (rounded off to the nearest integer)?', options: ['33', '36', '27', '24'], answerIndex: 0, tier: 'tier2', source: 'SSC CGL TIER-II 06/03/2023' },
  { question: 'Sohan sells sugar at cost price but he uses faulty weight and thus earns a profit of 28%. How many (grams) of sugar is he giving in exchange of 3.2 kg of sugar?', options: ['1,900', '1,500', '2,500', '2,200'], answerIndex: 2, tier: 'tier2', source: 'SSC CHSL TIER-II 10/01/2024' },
  { question: 'R\'s weighing machine shows 400 gm when the actual weight is 350 gm. The cost price of almonds is \u20B9880 per kg and packets of 200 gm are made using the faulty machine. What should be the selling price (in \u20B9) of each packet to get a profit of 25%?', options: ['197.50', '175.50', '182.50', '192.50'], answerIndex: 3, source: 'SSC CGL 26/07/2023 (Shift-01)' },
  { question: 'A man sells an article at a profit of 25%. If he had bought it at 20% less and sold it for Rs.10.50 less, he would have gained 30%. Find the cost price of the article.', options: ['\u20B925', '\u20B9125', '\u20B950', '\u20B9100'], answerIndex: 2, source: 'RRB ALP Tier-01 27/11/2024 (Shift-02)' },
  { question: 'A man sold a horse at a profit of 25%. If he had bought it for 35% less and sold it for \u20B9732 less, he would have made a profit of 36%. What was the purchase price of the horse?', options: ['\u20B91,800', '\u20B92,500', '\u20B92,000', '\u20B91,500'], answerIndex: 2, source: 'UP Constable 23/08/2024 (Shift-01)' },
  { question: 'Anu fixes the selling price of an article at 25% above its cost of production. If the cost of production goes up by 20% and she raises the selling price by 10%, then her percentage profit is (correct to one decimal place):', options: ['16.4%', '14.6%', '13.8%', '15.2%'], answerIndex: 1, source: 'SSC CGL 03/03/2020 (Shift-02)' },
  { question: 'A dishonest milkman sells milk at cost price but mixes water and gains 16\u2154%. The ratio of mixture to milk is:', options: ['7:5', '7:6', '6:5', '7:7'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A dishonest milkman sells milk at cost price but mixes water and gains 14\u00B2\u20447%. The ratio of mixture to milk is:', options: ['7:8', '7:6', '6:7', '8:7'], answerIndex: 3, source: 'Profit and Loss PYQ Set' }
];

// SET 2 (10 Qs): 1(b) 2(c) 3(d) 4(d) 5(a) 6(b) 7(c) 8(c) 9(a) 10(d)
const set2 = [
  { question: 'A grocer professes to sell rice at the cost price, but uses a fake weight of 870 gm for 1 kg. Find his profit percentage (correct to two decimal places).', options: ['15.11%', '14.94%', '18.21%', '11.11%'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A vendor started selling vegetables at Rs.10 per kg, but couldn\'t find buyers at this rate. So he reduced the price to Rs.7.2 per kg, but uses a faulty weight of 900 gm instead of 1 kg. Find the percentage change in the actual price.', options: ['10%', '15%', '20%', '25%'], answerIndex: 2, source: 'Profit and Loss PYQ Set' },
  { question: 'A shopkeeper sells his items using a faulty balance which measures 25% less. He then marks up his items 15% above the cost price. If he also gives a discount of 10% then find his net profit percentage on 1 kg items.', options: ['32%', '41%', '44%', '38%'], answerIndex: 3, source: 'Profit and Loss PYQ Set' },
  { question: 'A man bought an article and sold it at a gain of 10%. If he had bought the article at 20% less and sold it for \u20B91,000 more, he would have made a profit of 40%. The cost price of the article (in \u20B9) is:', options: ['50,000', '60,000', '25,000', '40,000'], answerIndex: 3, source: 'Profit and Loss PYQ Set' },
  { question: 'The initial profit percentage on the sale of an item was 55%. If the cost price of the item went up by 24% but the selling price remained the same, what would be the new profit percentage?', options: ['25%', '36%', '28%', '33%'], answerIndex: 0, source: 'Profit and Loss PYQ Set' },
  { question: 'Ritika purchased x kg wheat at \u20B930/kg and sold 8 kg of this at \u20B9x per kg and remaining at \u20B945/kg. Overall profit percent earned is 10%, then what quantity of wheat Ritika sold at \u20B945/kg?', options: ['18 kg', '16 kg', '10 kg', '14 kg'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'P buys an article for \u20B9280 and sells it to Q at a profit of 25%. Q sells it to R at some profit. R sells it to S for \u20B9560 marking a profit of 40%. What percentage profit (rounded off to the nearest integer) did Q make?', options: ['32%', '20%', '14%', '26%'], answerIndex: 2, source: 'Profit and Loss PYQ Set' },
  { question: 'Harsh purchased a scooter for \u20B948,000. He sold it at a loss of 15%. With that money he purchased another scooter and sold it at a profit of 22.5%. What is his overall loss/profit percentage?', options: ['Profit 4.125%', 'Profit 2.25%', 'Loss 4.125%', 'Loss 2.25%'], answerIndex: 0, source: 'Profit and Loss PYQ Set' },
  { question: 'An article is sold at a certain price. If it is sold at 33\u2153% of this price, there is a loss of 33\u2153%. What is the percent profit when it is sold at 60% of the original selling price?', options: ['33\u2153%', '17\u2153%', '30%', '20%'], answerIndex: 3, source: 'Profit and Loss PYQ Set' },
  { question: 'A person buys an article and sells it at 10% of its selling price as profit. If he had bought it at 20% less and sold it for \u20B91,000 more, he would have made a profit of 40%. The cost price of the article (in \u20B9) is:', options: ['50,000', '60,000', '25,000', '40,000'], answerIndex: 3, source: 'Profit and Loss PYQ Set' }
];

const allSets = [...set1, ...set2];

const existing = new Set(data.questions.map(q => q.question.substring(0, 80).toLowerCase().replace(/\s+/g, ' ')));
const seen = new Set();
const unique = [];
for (const q of allSets) {
  const key = q.question.substring(0, 80).toLowerCase().replace(/\s+/g, ' ');
  if (!seen.has(key) && !existing.has(key)) {
    seen.add(key);
    unique.push(q);
  } else {
    console.log('SKIPPED (dup):', q.question.substring(0, 60));
  }
}

console.log(`Total parsed: ${allSets.length}, Unique new: ${unique.length}, Skipped: ${allSets.length - unique.length}`);

const formatted = unique.map((q, i) => {
  const id = Date.now() + '_pnl2_' + (i + 1);
  const tier = q.tier || 'tier1';
  return {
    id,
    type: 'question',
    examFamily: 'ssc',
    subject: 'quant',
    difficulty: 'medium',
    tier,
    questionMode: 'objective',
    topic: 'Profit and Loss',
    question: q.question,
    options: q.options,
    answerIndex: q.answerIndex,
    explanation: '',
    marks: tier === 'tier1' ? 2 : 3,
    negativeMarks: tier === 'tier1' ? 0.5 : 1,
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
console.log(`Added ${formatted.length} P&L PYQs (${t1} tier1, ${t2} tier2) with confidenceScore=1`);
console.log(`Total questions now: ${data.questions.length}`);
