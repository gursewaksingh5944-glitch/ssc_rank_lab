const fs = require('fs');
const data = require('./data/question-bank.json');
const now = new Date().toISOString();

// SET 1 (22 Qs): 1(c) 2(a) 3(c) 4(c) 5(b) 6(d) 7(d) 8(c) 9(c) 10(b) 11(a) 12(a) 13(b) 14(a) 15(d) 16(c) 17(d) 18(b) 19(b) 20(d) 21(a) 22(d)
const set1 = [
  { question: 'A man buys 10 identical articles for a total of \u20B915. If he sells each of them for \u20B91.7, then his profit percentage will be ______% (rounded off to two decimal places).', options: ['14.33%', '12.76%', '13.33%', '11.76%'], answerIndex: 2, tier: 'tier2', source: 'SSC CGL TIER-II (18/01/2025)' },
  { question: 'The cost price of an article is \u20B96,450. If it is sold at a profit of 16%, how much would be its selling price?', options: ['\u20B97,482', '\u20B97,428', '\u20B97,842', '\u20B97,282'], answerIndex: 0, source: 'SSC CHSL 25/05/2022 (Shift-02)' },
  { question: 'Sandeep made a profit of 22% when he sold an overcoat for Rs.8,540. Find the cost price of the overcoat.', options: ['\u20B96,500', '\u20B96,000', '\u20B97,000', '\u20B97,500'], answerIndex: 2, tier: 'tier2', source: 'SSC CHSL TIER-II (18/11/2024)' },
  { question: 'If an article is sold for \u20B9402, there is a loss of 33%. At what price should it be sold to get 37% profit?', options: ['\u20B9911', '\u20B9846', '\u20B9822', '\u20B9781'], answerIndex: 2, source: 'SSC CHSL 14/08/2023 (Shift-01)' },
  { question: 'When an article is sold for \u20B9480, there is a loss of 16\u2154%. To gain 8\u2153%, it should be sold for:', options: ['\u20B9620', '\u20B9624', '\u20B9605', '\u20B9750'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A grocer purchased 10 kg rice for \u20B9700. He spends some amount on transportation and then sells it for \u20B91,400. If the percentage of profit made by the grocer is 30%, then what is the amount (in \u20B9) he spends on transportation? (Round off to the nearest integer)', options: ['350', '380', '300', '377'], answerIndex: 3, source: 'SSC CPO 27/06/2024 (Shift-03)' },
  { question: 'If I gain 124% by selling an item for \u20B91,232, then what would be my gain or loss percentage if I sell it for \u20B9572?', options: ['6% Gain', '6% Loss', '4% Loss', '4% Gain'], answerIndex: 3, source: 'SSC MTS 05/10/2021 (Shift-01)' },
  { question: 'A man loses 28% by selling an article for Rs.144. If he sells it for Rs.288, what will be his gain/loss percentage?', options: ['Gain, 41%', 'Loss, 43%', 'Gain, 44%', 'Loss, 46%'], answerIndex: 2, source: 'SSC CGL 25/09/2024 (Shift-02)' },
  { question: 'If the selling price of an almirah is doubled, then the profit is tripled. Find the initial profit percentage.', options: ['50%', '10%', '100%', '25%'], answerIndex: 2, source: 'RRB Technician G-III 26/12/2024 (Shift-02)' },
  { question: 'If the selling price is tripled, the profit becomes 5 times. Then find the profit percentage.', options: ['80%', '100%', '125%', '150%'], answerIndex: 1, source: 'UP Constable 27/01/2019 (Shift-01)' },
  { question: 'A mobile phone dealer buys a phone for \u20B910,000 and sells it for \u20B912,000. Later, he realizes that he could have sold it for \u20B913,000. What is the percentage loss that he incurs?', options: ['10%', '20%', '15%', '25%'], answerIndex: 0, source: 'SSC CHSL 05/07/2024 (Shift-03)' },
  { question: 'A shopkeeper sold an article at a 26% profit. On selling it for \u20B92,250 more, he would get a profit of 41%. If this article is sold at 12% profit, then the selling price would be:', options: ['\u20B916,800', '\u20B915,000', '\u20B915,800', '\u20B916,120'], answerIndex: 0, source: 'SSC CHSL 11/07/2024 (Shift-03)' },
  { question: 'The selling price of 80 items is equal to the cost price of 72 items. What is the percentage of loss incurred in the transaction?', options: ['12%', '10%', '9%', '11\u2151%'], answerIndex: 1, source: 'SSC Phase-XII 24/06/2024 (Shift-02)' },
  { question: 'If the selling price of 40 articles is equal to the cost price of 50 articles, then the percentage gain is:', options: ['25%', '20%', '35%', '30%'], answerIndex: 0, source: 'SSC CHSL 01/07/2024 (Shift-04)' },
  { question: 'The cost price of 36 articles is the same as the selling price of N articles. If the profit is 20%, then the value of N is:', options: ['25', '42', '40', '30'], answerIndex: 3, source: 'SSC CPO 27/06/2024 (Shift-01)' },
  { question: 'By selling 60 pens, a man gains an amount equal to the selling price of 12 pens. What is his gain percentage?', options: ['20%', '22%', '25%', '27%'], answerIndex: 2, source: 'SSC CHSL 09/07/2024 (Shift-03)' },
  { question: 'By selling two articles for \u20B9800, a person gains the cost price of three articles. The profit percent is:', options: ['125%', '140%', '120%', '150%'], answerIndex: 3, tier: 'tier2', source: 'SSC CGL TIER-II 11/09/2019 (Shift-04)' },
  { question: 'By selling 30 meters of cloth a shopkeeper makes a profit equivalent to the selling price of 10 meters of cloth. Find the selling price of 1 meter of cloth when the cost price of 1 meter of cloth is \u20B9480.', options: ['\u20B9520', '\u20B9720', '\u20B9960', '\u20B9820'], answerIndex: 1, source: 'SSC CHSL 03/07/2024 (Shift-03)' },
  { question: 'A man purchased a cell phone for \u20B924,500 and sold it at a gain of 12.5% calculated on the selling price. The selling price of the cell phone was:', options: ['\u20B925,000', '\u20B928,000', '\u20B927,500', '\u20B925,500'], answerIndex: 1, source: 'SSC CHSL 24/05/2022 (Shift-01)' },
  { question: 'By selling an article for \u20B9640, a person loses 15% of its selling price. At what price (in \u20B9) should he sell it to gain 15% on its cost price?', options: ['\u20B9835', '\u20B9832', '\u20B9836.60', '\u20B9846.40'], answerIndex: 3, source: 'SSC CGL 17/08/2021 (Shift-01)' },
  { question: 'By selling an article at 4/10 of its actual selling price, Nirbhay incurs a loss of 17%. If he sells it at 88% of its actual selling price, then the profit percentage is:', options: ['82.6%', '81.3%', '83.4%', '84.4%'], answerIndex: 0, source: 'RPF SI 13/12/2024 (Shift-01)' },
  { question: 'By selling an article at 2/5 of its actual selling price, Manav incurs a loss of 27%. If he sells it at 84% of its actual selling price, then the profit percentage is:', options: ['56.9%', '52.6%', '55.5%', '53.3%'], answerIndex: 3, source: 'RRB JE 16/12/2024 (Shift-02)' }
];

// SET 2 (10 Qs): 1(b) 2(c) 3(a) 4(c) 5(c) 6(b) 7(d) 8(a) 9(b) 10(b)
const set2 = [
  { question: 'A shopkeeper bought an oven for \u20B925,000 and sold it for \u20B929,500. He spent \u20B91,500 as overheads. What is his loss or gain percentage (rounded off to the nearest integer)?', options: ['Gain by 13%', 'Gain by 11%', 'Loss by 11%', 'Loss by 13%'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A man sells a cow for \u20B922,000 and gains 10%. At what price should he sell the same cow, in order to gain 14%?', options: ['\u20B923,000', '\u20B923,800', '\u20B922,800', '\u20B922,900'], answerIndex: 2, source: 'Profit and Loss PYQ Set' },
  { question: 'A seller decreased the selling price of each item from \u20B95,000 to \u20B94,680, by which his loss percentage increased by 4%. If he has to get 4% profit, then the selling price of the item should be:', options: ['\u20B98,320', '\u20B97,280', '\u20B97,800', '\u20B98,840'], answerIndex: 0, source: 'Profit and Loss PYQ Set' },
  { question: 'Ram sold a chair at a profit of 7\u00BD%. If he had sold it for \u20B91,430 more, he would have gained 35%. What is the cost price of the chair?', options: ['\u20B94,800', '\u20B95,000', '\u20B95,200', '\u20B94,000'], answerIndex: 2, source: 'Profit and Loss PYQ Set' },
  { question: 'If the purchase price of 5 shirts is equal to the selling price of 3 shirts, find the profit percentage.', options: ['Profit 55.33%', 'Profit 63.33%', 'Profit 66.66%', 'Profit 33.66%'], answerIndex: 2, source: 'Profit and Loss PYQ Set' },
  { question: 'Raju lost 13% by selling a radio set for \u20B94,524. What percentage of profit would he have earned by selling it for \u20B96,400 (rounded off to two decimal places)?', options: ['28.52%', '23.08%', '21.05%', '25.25%'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'By selling an article, a shopkeeper makes a profit of 30% of its selling price. Find his profit percentage.', options: ['44%', '40%', '46\u2153%', '42\u2076\u2044\u2087%'], answerIndex: 3, source: 'Profit and Loss PYQ Set' },
  { question: 'Gopi purchased an article at 7/8 of its selling price. Had he sold it at 20% more than the selling price, then what would his profit percentage be?', options: ['37\u2151%', '37%', '35%', '35\u2151%'], answerIndex: 0, source: 'Profit and Loss PYQ Set' },
  { question: 'A vendor buys 20 laptop bags for \u20B913,000 and sells them at 15 for \u20B910,125. How many laptop bags should be bought and sold to earn a profit of \u20B93,225?', options: ['123', '129', '120', '127'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A shopkeeper bought 95 dozen oranges at \u20B94.50 each. 7 dozen oranges were rotten and so were discarded. He sold the remaining oranges at \u20B978 per dozen. What is his profit or loss per cent (to the nearest integer)?', options: ['Loss, 45%', 'Profit, 34%', 'Loss, 34%', 'Profit, 45%'], answerIndex: 1, source: 'Profit and Loss PYQ Set' }
];

// SET 3 (8 Qs): 1(d) 2(b) 3(d) 4(d) 5(c) 6(d) 7(a) 8(b)
const set3 = [
  { question: 'A man sells a mobile phone for Rs.680 and loses something. If he had sold it for Rs.1,070, his gain would have been double the former loss. The cost price (in \u20B9) of the mobile phone is:', options: ['820', '800', '830', '810'], answerIndex: 3, tier: 'tier2', source: 'SSC CGL TIER-II (20/01/2025)' },
  { question: 'The percentage profit earned by James by selling an article for Rs.1,920, equals the percentage loss suffered by selling it at Rs.1,500. What should be the selling price if he wants to earn 10% profit?', options: ['\u20B94,000', '\u20B91,881', '\u20B97,000', '\u20B92,000'], answerIndex: 1, source: 'RRB Technician G-III 24/12/2024 (Shift-03)' },
  { question: 'The profit earned when a book is sold for Rs.600 is thrice the profit earned when the same book is sold for Rs.400. What should be the selling price if seller wants to earn 60% profit?', options: ['Rs.420', 'Rs.440', 'Rs.460', 'Rs.480'], answerIndex: 3, source: 'Profit and Loss PYQ Set' },
  { question: 'If a man bought 6 pencils for Rs.5, and sold them at 5 pencils for Rs.6, then the gain percentage is:', options: ['42%', '41%', '43%', '44%'], answerIndex: 3, source: 'RRB Technician G-III 20/12/2024 (Shift-02)' },
  { question: 'A retailer purchased at a rate of 11 mangoes for Rs.100 and sold at a rate of 10 mangoes for Rs.110. The percentage of profit for per mango sold is:', options: ['11%', '22%', '21%', '15.5%'], answerIndex: 2, source: 'Profit and Loss PYQ Set' },
  { question: 'A vendor buys 20 pens for \u20B915 and sells them at 15 for \u20B920. How many pens should be bought and sold to earn a profit of \u20B9245?', options: ['280', '540', '320', '420'], answerIndex: 3, source: 'SSC Phase-XII 25/06/2024 (Shift-04)' },
  { question: 'A person bought two types of pens one at \u20B98 for 9 pens, and the other at \u20B98 per pen. He bought an equal number of pens of each type. If he sold all the pens at \u20B96 per pen, what was his profit percentage?', options: ['35%', '33%', '32%', '45%'], answerIndex: 0, source: 'ALP CBT-02 02/05/2025 (Shift-01)' },
  { question: 'A shopkeeper bought 60 pencils at a rate of 4 for \u20B95 and another 60 pencils at a rate of 2 for \u20B93. He mixed all the pencils and sold them at a rate of 3 for \u20B94. Find his gain or loss percentage.', options: ['Profit 3\u215B%', 'Loss 3\u00B9\u2044\u2083\u2083%', 'Profit 2\u215E%', 'Loss 2\u215E%'], answerIndex: 1, source: 'SSC CGL 19/04/2022 (Shift-03)' }
];

// SET 4 (4 Qs): 1(a) 2(c) 3(b) 4(a)
const set4 = [
  { question: 'The profit obtained by a vendor on selling goods at \u20B93,200 is equal to 7/5th of the profit obtained by selling the same goods at \u20B93,000. What is the cost price (in \u20B9) of the goods?', options: ['2,500', '2,700', '2,900', '2,400'], answerIndex: 0, source: 'Profit and Loss PYQ Set' },
  { question: 'The percentage profit earned by selling an article for \u20B92,100 is equal to the percentage loss incurred by selling the same article for \u20B91,460. At what price should the article be sold to make 20% profit?', options: ['\u20B92,156', '\u20B92,256', '\u20B92,136', '\u20B92,056'], answerIndex: 2, source: 'Profit and Loss PYQ Set' },
  { question: 'A person bought two varieties of apples at the rate of \u20B94 per 5 apples and \u20B94 per apple respectively. If he bought equal number of apples of each variety and then sold all the apples at the rate of \u20B93 per apple, what would be his profit percentage?', options: ['23%', '25%', '24%', '2%'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A trader bought some oranges at 7 for \u20B911. He sold all at 2 for \u20B93. Thereby he loses \u20B930. Find the number of oranges sold.', options: ['420', '400', '210', '280'], answerIndex: 0, source: 'Profit and Loss PYQ Set' }
];

// SET 5 (12 Qs): 1(d) 2(a) 3(a) 4(c) 5(d) 6(d) 7(a) 8(c) 9(d) 10(a) 11(a) 12(d)
const set5 = [
  { question: 'A man bought three articles for \u20B93,000 each. He sold the articles respectively at 10% profit, 5% profit and 15% loss. The total percentage profit/loss he earned is:', options: ['10% loss', '5% loss', '5% profit', 'No profit no loss'], answerIndex: 3, source: 'SSC CHSL 09/07/2019 (Shift-01)' },
  { question: 'A man bought three articles for \u20B96,000 each. He sold the articles respectively at 15% profit, 12% profit and 15% loss. The total percentage profit/loss he earned is:', options: ['4% profit', '3% loss', '4% loss', 'No profit no loss'], answerIndex: 0, source: 'SSC CHSL 09/07/2019 (Shift-02)' },
  { question: 'If 70% of the total goods are sold at a profit of 20% and the remaining goods are sold at a loss of 10%, what will be the overall profit percentage?', options: ['11%', '15%', '12%', '8%'], answerIndex: 0, source: 'SSC GD 21/02/2024 (Shift-01)' },
  { question: 'A material was purchased for \u20B9600. If 3/4 parts of the material are sold at a 10% profit and the remaining part is sold at a 20% loss, find the overall profit or loss percentage.', options: ['3% loss', '4% loss', '2.5% profit', '5% profit'], answerIndex: 2, source: 'UPSI 19/12/2017 (Shift-3)' },
  { question: 'One-third of the goods are sold at a profit of 15%, 25% of the goods are sold at a profit of 20%, and the remaining goods are sold at a loss of 10%. If a total profit of \u20B9350 is made in the entire transaction, what was the actual cost price of the goods (in \u20B9)?', options: ['9,000', '7,200', '5,400', '6,000'], answerIndex: 3, source: 'SSC GD 18/11/2021 (Shift-01)' },
  { question: 'A shopkeeper sold 40% of the total pineapples at 4/5 of the cost price, 36% at half of the cost price, and the remaining at the original cost price. What is the overall loss percentage on the entire transaction?', options: ['36%', '28%', '24%', '26%'], answerIndex: 3, source: 'UPSI 19/12/2017 (Shift-1)' },
  { question: 'A man sells two houses at the rate of Rs.1.995 lakhs each. On one he gains 5% and on the other he loses 5%. His gain or loss percentage in the whole transaction is:', options: ['0.25% loss', '0.25% profit', '25% loss', '2.5% loss'], answerIndex: 0, source: 'RRB Technician G-III 29/12/2024 (Shift-03)' },
  { question: 'Radha bought a fridge and a washing machine together for \u20B957,300. She sold the fridge at a profit of 15% and washing machine at a loss of 24% and both are sold at the same price. The cost price of washing machine (in \u20B9) is:', options: ['22,800', '28,650', '34,500', '24,500'], answerIndex: 2, source: 'SSC CGL 23/08/2021 (Shift-02)' },
  { question: 'A person sells two articles for \u20B95,000 each with no loss and no profit in the overall transaction. If one is sold at a 16\u2154% loss, then the other is sold at a profit of:', options: ['24%', '15%', '20%', '25%'], answerIndex: 3, source: 'DP CONSTABLE 23/11/2023 (Shift-01)' },
  { question: 'In a village fair, a man buys a horse and a camel for a total amount of \u20B95,125. He sells the horse at a 25% profit and the camel at a 20% loss. If he sells both animals at the same price, what was the cost price of the cheaper animal?', options: ['\u20B92,000', '\u20B96,900', '\u20B98,500', '\u20B92,500'], answerIndex: 0, source: 'UP CONSTABLE 24/08/2024 (Shift-02)' },
  { question: 'By selling 3 dozen oranges for Rs.405, a trader loses 25%. How many oranges should he sell for Rs.288 if he needs to earn a profit of 20% in the transaction?', options: ['16', '15', '18', '12'], answerIndex: 0, source: 'SSC CHSL 04/08/2021 (Shift-03)' },
  { question: 'By selling 18 table fans for \u20B911,664 a man incurs a loss of 10%. How many fans should he sell for \u20B917,424 to earn 10% profit?', options: ['23', '18', '20', '22'], answerIndex: 3, source: 'SSC CGL 07/03/2020 (Shift-01)' }
];

// SET 6 (8 Qs): 1(b) 2(d) 3(b) 4(b) 5(d) 6(b) 7(a) 8(b)
const set6 = [
  { question: 'Ramesh purchased 130 books at the rate of \u20B9200 each and sold half of them at the rate of \u20B9300 each, 1/5 of them at the rate of \u20B9350 each and the rest at the cost price. Find his profit percentage.', options: ['35%', '40%', '38%', '44%'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A shopkeeper sold 5/8 of his articles at a gain of 20% and the remaining at the cost price. What is his gain percentage in the whole transaction?', options: ['16\u00BD%', '14\u00BD%', '13\u00BD%', '12\u00BD%'], answerIndex: 3, source: 'Profit and Loss PYQ Set' },
  { question: 'A fruit merchant bought some bananas. 1/5th of them got rotten and were thrown away. He sold remaining 2/5th of the bananas with him at 15% profit and the remaining bananas at 10% profit. Find his overall loss or profit percent.', options: ['Profit 9.6%', 'Loss 10.4%', 'Loss 9.6%', 'Profit 10.4%'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A person sold two cars for \u20B960,000 each. On one, he gained 20% while on the other he lost 20%. Find the percentage of his gain or loss.', options: ['No profit and no loss', '4% Loss', '2% Loss', '4% Profit'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'A person bought two goods for \u20B919,500. He sold one at a loss of 20% and the other at a profit of 15%. If the selling price of each goods is the same, find the cost price of goods sold at profit.', options: ['\u20B911,475', '\u20B99,750', '\u20B911,500', '\u20B98,000'], answerIndex: 3, source: 'Profit and Loss PYQ Set' },
  { question: 'Manoj bought two T.V. for \u20B92,280. He sold one at a loss of 20 percent and other at a profit of 10 percent. If each T.V. was sold for the same price, then what is the cost price of the T.V. which was sold at loss?', options: ['\u20B91,380', '\u20B91,320', '\u20B91,050', '\u20B91,440'], answerIndex: 1, source: 'Profit and Loss PYQ Set' },
  { question: 'By selling 90 ball pens for \u20B9160 a person loses 20%. The number of ball pens which should be sold for \u20B996 so as to have a profit of 20% is:', options: ['36', '37', '46', '47'], answerIndex: 0, source: 'Profit and Loss PYQ Set' },
  { question: 'After selling 4 articles for \u20B91 a person incurred loss of 4%. If he had sold 3 articles for \u20B91, his profit percentage would be:', options: ['24', '28', '32', '36'], answerIndex: 1, source: 'Profit and Loss PYQ Set' }
];

const allSets = [...set1, ...set2, ...set3, ...set4, ...set5, ...set6];

// Deduplicate internally and against existing bank
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
  const id = Date.now() + '_pnl' + (i + 1);
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
console.log(`Added ${formatted.length} Profit & Loss PYQs (${t1} tier1, ${t2} tier2) with confidenceScore=1`);
console.log(`Total questions now: ${data.questions.length}`);
