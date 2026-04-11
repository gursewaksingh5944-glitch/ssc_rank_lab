const fs = require('fs');
const data = require('./data/question-bank.json');
const now = new Date().toISOString();

// SET 1: Answer Key: 1(a) 2(b) 3(d) 4(d) 5(c) 6(c) 7(a) 8(c) 9(d)
const set1 = [
  {
    question: 'In a store, an item with marked price of Rs.82,500 is available at a discounted price of Rs.79,200. What is the percentage of discount given on that item?',
    options: ['4%', '3%', '1%', '2%'], answerIndex: 0, source: 'Discount Practice Set'
  },
  {
    question: 'At a clearance sale, a shopkeeper gives 45% discount. If a customer paid Rs.330 during the sale, then what is the marked price of that shirt?',
    options: ['Rs.550', 'Rs.600', 'Rs.500', 'Rs.650'], answerIndex: 1, source: 'Discount Practice Set'
  },
  {
    question: "Murlidhar, the owner of a grocery store, offers a discount scheme 'buy 5 water bottles get 1 for free' to his customers. What is the effective percentage discount offered by Murlidhar? (correct up to two decimal places)",
    options: ['13.67%', '20.00%', '13.33%', '16.67%'], answerIndex: 3, source: 'Discount Practice Set'
  },
  {
    question: 'If the successive discount of 10%, 15%, then the single equivalent rate of discount is:',
    options: ['32.3%', '24.2%', '43.4%', '23.5%'], answerIndex: 3, source: 'Discount Practice Set'
  },
  {
    question: 'The marked price of an article is Rs.50,000. From three shopkeepers, the first one allows two successive discounts of 25% and 15%. The second one allows two successive discounts 20% and 20%. The third shopkeeper allows two successive discounts of 30% and 10%. From which shopkeeper does the customer get more profit?',
    options: ['First', 'Same for all the shopkeepers', 'Third', 'Second'], answerIndex: 2, source: 'Discount Practice Set'
  },
  {
    question: 'Find a single discount equivalent to the successive discount of 12%, 20%, 24% and 32%. (Correct to two places of decimals)',
    options: ['43.41%', '73.71%', '63.62%', '53.51%'], answerIndex: 2, source: 'Discount Practice Set'
  },
  {
    question: 'The list price of a hand mixer at a showroom is Rs.2,000 and it is being sold at successive discounts of 15% and 10%. What is its net selling price in rupees?',
    options: ['1,530', '1,560', '1,440', '1,600'], answerIndex: 0, source: 'Discount Practice Set'
  },
  {
    question: 'After offering two successive discounts a toy with a marked price of Rs.150 is sold at Rs.105. If the value of the first discount is 12.5%, what is the value of the second discount?',
    options: ['21%', '18%', '20%', '22%'], answerIndex: 2, source: 'Discount Practice Set'
  },
  {
    question: 'A shopkeeper marked an article at Rs.5,000. The shopkeeper allows successive discounts of 20%, 15% and 10%. The selling price of the article is:',
    options: ['Rs.2,750', 'Rs.3,000', 'Rs.2,800', 'Rs.3,060'], answerIndex: 3, source: 'Discount Practice Set'
  }
];

// SET 2: Answer Key: 1(a) 2(c) 3(a) 4(b) 5(b) 6(a) 7(a) 8(b) 9(d) 10(a) 11(d) 12(b) 13(d) 14(c)
const set2 = [
  {
    question: 'A shopkeeper lists the price of a fan at 22% above its cost price and offers a 15% discount on its list price. What is the cost price (in Rs.) of the fan if he sells it at Rs.5,185?',
    options: ['Rs.5,000', 'Rs.4,500', 'Rs.4,500', 'Rs.5,680'], answerIndex: 0,
    source: 'RRB Technician G-III, 29/12/2024 (Shift-03)'
  },
  {
    question: "If an item is marked 40% above its cost price, and a discount of x% is given on the marked price, a net profit of 12% is obtained. Now, if a new item's cost price is Rs.2,400 and a profit of x% is desired, what should be the selling price of this new item?",
    options: ['Rs.2,480', 'Rs.2,880', 'Rs.3,480', 'Rs.2,400'], answerIndex: 2,
    source: 'UP Constable 25/08/2024 (Shift-02)'
  },
  {
    tier: 'tier2',
    question: 'A merchant fixes the marked price of his goods at 42% above the cost price. He sells his goods at a 15% discount on marked price. His percentage of profit (rounded off to the nearest integer) is:',
    options: ['21%', '35%', '27%', '42%'], answerIndex: 0,
    source: 'SSC CGL TIER II 26/10/2023'
  },
  {
    question: 'A man sold an article for Rs.420 by first giving a d% discount on its marked price, and then another discount having the same nominal value (in Rs.). If the marked price of the article is Rs.560, then what is the value of d?',
    options: ['16.9', '12.5', '18.4', '14.5'], answerIndex: 1,
    source: 'RPF SI 09/12/2024 (Shift-03)'
  },
  {
    question: 'A shopkeeper sells an item for Rs.960.4 after giving two successive discounts of 30% and 80% on its marked price. Had he not given any discount, he would have earned a profit of 40%. What is the cost price (in Rs.) of the item?',
    options: ['4920', '4900', '4931', '4908'], answerIndex: 1,
    source: 'RPF SI 09/12/2024 (Shift-02)'
  },
  {
    question: 'A shopkeeper sells an item by giving 25% discount on its marked price and still gains 35%. If the cost price of the item decreases by 10%, and he sells it by allowing 37.5% discount on the same marked price, then his gain percentage will be _____.',
    options: ['25%', '20.5%', '25.5%', '30%'], answerIndex: 0,
    source: 'IB ACIO GRADE II 18/01/2024 (Shift-02)'
  },
  {
    question: 'The marked price of an article is 20 percent more than its cost price. What minimum discount percentage can be offered by the shopkeeper to sell his article so that there is no loss?',
    options: ['16.66%', '12.56%', '15.33%', '13.33%'], answerIndex: 0,
    source: 'SSC CHSL 10/03/2023 (Shift-03)'
  },
  {
    question: 'The marked price of mustard oil is 10% more than its cost price. At what per cent less than the marked price should it be sold, to have no profit and no loss?',
    options: ['9 2/11%', '9 1/11%', '9 3/11%', '9 4/11%'], answerIndex: 1,
    source: 'MTS 04/09/2023 (Shift-03)'
  },
  {
    question: 'After giving a 25% discount, the selling price of a table is Rs.24,750. If the cost price is 60% of the marked price, what is the cost price (in Rs.)?',
    options: ['19500', '19700', '19600', '19800'], answerIndex: 3,
    source: 'UPSI 16/11/2021 (Shift-03)'
  },
  {
    question: 'The marked price of an article is Rs.10,927. Due to festive season, a certain percentage of discount is declared. Raju buys an article at reduced price and sells it at Rs.10,927 and makes a profit of 11.5%. What was the percentage discount offered?',
    options: ['10.3%', '11.3%', '11.5%', '10.9%'], answerIndex: 0,
    source: 'SSC CGL 03/12/2022 (Shift-02)'
  },
  {
    question: 'Amit and Bilal buy goods for Rs.1,500 and Rs.2,000, respectively. Amit marks his goods up by y%, while Bilal marks his goods up by 2y% and offers a discount of y%. If both make the same profit, then find the value of y?',
    options: ['10.5%', '12%', '11.5%', '12.5%'], answerIndex: 3,
    source: 'SSC CGL 23/09/2024 (Shift-01)'
  },
  {
    question: 'To clear a stock of items, a seller gives an 8% discount on the marked price. He spends Rs.x on the promotion of the discount offer. His total cost of the items is Rs.2,50,000 and the marked price is 10% more than the cost price. Finally, he earns no profit or no loss. What is the value of x?',
    options: ['7500', '3000', '6000', '4500'], answerIndex: 1,
    source: 'SSC Phase XII 21/06/2024 (Shift-01)'
  },
  {
    question: 'Shopkeeper A marks up his price for an item at 25% and offers a discount of 15%. The same item is marked at 20% by another shopkeeper B and sold at a discount of 12%. Who gets a better deal in terms of % profit and by what profit percentage he sells that item?',
    options: ['B by 5.6%', 'B by 0.65%', 'A by 0.55%', 'A by 6.25%'], answerIndex: 3,
    source: 'SSC CHSL 10/07/2024 (Shift-02)'
  },
  {
    question: 'Ramanna purchased raw materials for a certain price to manufacture a product. However, owing to shortage of labour, 22.5% of the raw materials could not be utilised and got wasted. 80% of the cost of raw materials used was added as the cost of manufacturing. If Ramanna could sell his product at a price to earn an overall profit of 20% after offering a discount of 20%, how many times of the total cost of the raw materials purchased was the marked price of the product?',
    options: ['2.44 times', '42 times', '2.43 times', '2.40 times'], answerIndex: 2,
    source: 'SSC CPO 27/06/2024 (Shift-01)'
  }
];

// SET 3: Answer Key: 1(d) 2(c) 3(a) 4(b) 5(a) 6(c) 7(b) 8(b) 9(b) 10(a) 11(c)
const set3 = [
  {
    question: 'A shopkeeper allows 20% discount on the marked price of an article and still makes a profit of 25%. If she gains Rs.44.80 on the sale of the article, then the cost price of the article is:',
    options: ['Rs.188.80', 'Rs.192.80', 'Rs.184.20', 'Rs.179.20'], answerIndex: 3,
    source: 'Discount Practice Set'
  },
  {
    question: 'The cost price of a fan is Rs.4,400. A merchant wants to make a 24% profit by selling it. At the time of sale, merchant declares a discount of 12% on the marked price. Find the marked price.',
    options: ['Rs.2,600', 'Rs.2,060', 'Rs.6,200', 'Rs.6,020'], answerIndex: 2,
    source: 'Discount Practice Set'
  },
  {
    question: 'A shopkeeper sells an item for Rs.287.7 after giving two successive discounts of 86% and 85% on its marked price. Had he not given any discount, he would have earned a profit of 37%. What is the cost price (in Rs.) of the item?',
    options: ['10000', '10038', '9958', '10046'], answerIndex: 0,
    source: 'Discount Practice Set'
  },
  {
    question: 'A man sold an article for Rs.481 by first giving a d% discount on its marked price, and then another discount having the same nominal value (in Rs.). If the marked price of the article is Rs.1924, then what is the value of d?',
    options: ['42.5', '37.5', '32', '33'], answerIndex: 1,
    source: 'Discount Practice Set'
  },
  {
    question: 'In a showroom the price of a washing machine is Rs.65,000. The customer gets cash discount of Rs.2,000 and gets a scratch card promising percentage discount of 10% to 15%. Determine the difference between the least and the maximum selling price of the washing machine.',
    options: ['Rs.3,150', 'Rs.3,570', 'Rs.3,200', 'Rs.3,650'], answerIndex: 0,
    source: 'Discount Practice Set'
  },
  {
    question: 'What is the discount that Rohan should offer on the remaining Rs.8,000 of a laptop priced at Rs.48,000, given that he has already given a 12% discount on the first Rs.28,000 and 8% discount on the next Rs.12,000 to match the discount amount of 9.5% given on the total price?',
    options: ['402', '420', '240', '204'], answerIndex: 2,
    source: 'Discount Practice Set'
  },
  {
    question: 'The marked price of 85 items was equal to the cost price of 153 items. The selling price of 104 items was equal to the marked price of 65 items. Calculate the percentage profit or loss from the sale of each item.',
    options: ['12.5% loss', '12.5% profit', '15% profit', '12.25% profit'], answerIndex: 1,
    source: 'Discount Practice Set'
  },
  {
    question: 'A retailer buys 50 pens at the marked price of 44 pens. If he sells these pens at a discount of 1% on the marked price, what is profit percentage?',
    options: ['10%', '12.5%', '12%', '15%'], answerIndex: 1,
    source: 'Discount Practice Set'
  },
  {
    question: 'By selling an article for Rs.2,160, Prashant allows a 20% discount and earns 28% profit. If the article is sold without any discount, the profit will be:',
    options: ['55%', '60%', '65%', '50%'], answerIndex: 1,
    source: 'Discount Practice Set'
  },
  {
    question: 'Victoria purchased items with a combined book value of $400,000. He was offered a discount of 10% on the portion of payment made in cash and a 2% surcharge on the portion of payment made through credit card. If Victoria paid a total of $378,000, how much did she pay via credit card including surcharges?',
    options: ['$1,53,000', '$1,58,100', '$1,63,200', '$1,47,900'], answerIndex: 0,
    source: 'Discount Practice Set'
  },
  {
    question: 'A shopkeeper allows 18% discount on the market price of an article and still makes a profit of 23%. If he gains Rs.18.40 on the sale of the article, then what is the marked price of the article?',
    options: ['Rs.140', 'Rs.125', 'Rs.120', 'Rs.146'], answerIndex: 2,
    source: 'Discount Practice Set'
  }
];

const allSets = [...set1, ...set2, ...set3];

const formatted = allSets.map((q, i) => {
  const id = Date.now() + '_disc_b' + (i + 1);
  const tier = q.tier || 'tier1';
  return {
    id,
    type: 'question',
    examFamily: 'ssc',
    subject: 'quant',
    difficulty: 'medium',
    tier,
    questionMode: 'objective',
    topic: 'Discount',
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
console.log(`Added ${formatted.length} Discount PYQs (${t1} tier1, ${t2} tier2) with confidenceScore=1`);
console.log(`Total questions now: ${data.questions.length}`);
