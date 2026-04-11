const fs = require('fs');
const d = JSON.parse(fs.readFileSync('data/question-bank.json', 'utf-8'));
let count = 0;

const fixes = [
  ['200e0 at 6.5%', 'Days: Feb(15 remaining) + Mar(31) + Apr(27) = 73 days. SI = 2000\u00d76.5\u00d773/(100\u00d7365) = \u20b926.'],
  ['is of the sum. J b45', 'SI = P/5 (since 9/45 = 1/5). T = 5R. P\u00d7R\u00d75R/100 = P/5. 5R\u00b2 = 20. R = 2%.'],
  ['\u20b910,500 amounts to \u20b913,825 in 3 years at a certain rate', 'SI = 13825-10500 = 3325. R = 3325\u00d7100/(10500\u00d719/5) = 25/3%. At 2R for 5yr: SI = 10500\u00d7(50/3)\u00d75/100 = \u20b98,750.'],
  ['oJf money is given at a certain rate of simple interest for 6 year', 'Extra SI = P\u00d77\u00d76/100 = 42P/100 = 1512. P = \u20b93,600.'],
  ['iento two different schemes A and B', 'A + B = 13900. 2yr SI: 28A/100 + 22B/100 = 3508. 6A = 45000. A = 7500. B = \u20b96,400.'],
  ['sat the rate of 5% per anuum', 'SI = P(5\u00d73 + 8\u00d72 + 10\u00d72)/100 = 51P/100 = 12750. P = \u20b925,000.'],
  ['amaount from R and promised', 'S borrows at 8%, invests, earns 5% profit after paying R. Total return = 13%. R would get 13% directly.'],
  ['at 8% per annum for T3 years', 'CI = P[(1.08)\u00b3-1] = P\u00d70.259712 = 4058. P = 15625. SI = 15625\u00d710\u00d74/100 = \u20b96,250.'],
  ['for 3h years is', 'R = 7200\u00d7100/(24000\u00d73) = 10%. CI = 24000[(1.10)\u00b3-1] = 24000\u00d70.331 = \u20b97,944.'],
  ['8% l y p.a. for 1 year on compound', 'Half-yearly rate = 4%. A = 15000\u00d7(1.04)\u00b2 = 15000\u00d71.0816 = \u20b916,224.'],
  ['sumg of \u20b97,500', 'Half-yearly rate = 4%. A = 7500\u00d7(1.04)\u00b2 = 7500\u00d71.0816 = \u20b98,112.'],
  ['compaound interest doubles itself in 4 years', '2x in 4yr. 8x = 2\u00b3. Time = 4\u00d73 = 12 years.'],
  ['Rs.15600 at 20% p.a. for 2', 'A = P(1+R/100)\u00b2 \u00d7 (1+frac\u00d7R/100) = 15600\u00d71.44\u00d71.05 = 23587.2. CI = \u20b97,987.2 (using SI method for fractional year).']
];

d.questions.forEach(q => {
  if (q.topic !== 'Simple Interest' && q.topic !== 'Compound Interest') return;
  if (q.explanation && q.explanation.length > 5) return;
  for (const [substr, expl] of fixes) {
    if (q.question.includes(substr)) {
      q.explanation = expl;
      count++;
      console.log('Fixed:', q.question.slice(0, 60));
      break;
    }
  }
});

d.updatedAt = new Date().toISOString();
fs.writeFileSync('data/question-bank.json', JSON.stringify(d, null, 2));
console.log('\nTotal fixed:', count);
