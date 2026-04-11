const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// Map: first 70 chars (lowercased, whitespace-normalized) → explanation
const explanations = {};
function addExp(qStart, explanation) {
  const key = qStart.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 70);
  explanations[key] = explanation;
}

// ===========================
// SET 1 — SIMPLE INTEREST
// ===========================

addExp(
  "Find the simple interest on ₹15,000 at the rate of 7% p.a. for 3 years",
  "SI = P×R×T/100 = 15000×7×3/100 = ₹3,150."
);

addExp(
  "An amount invested fetched a total simple interest of ₹4,050 at the rate of 9% per annum in 5 years",
  "SI = P×R×T/100 → 4050 = P×9×5/100 → P = 4050×100/45 = ₹9,000."
);

addExp(
  "A sum at simple interest at the rate of 5% per annum amounts to ₹4160 in 6 years",
  "A = P(1 + RT/100) → 4160 = P(1 + 5×6/100) = 1.3P → P = 4160/1.3 = ₹3,200."
);

addExp(
  "Find the simple interest (in ₹) on ₹2000 at 6.25% per annum rate of interest for the period from 14 February 2023 to 28 April 2023",
  "Days: Feb(14 remaining) + Mar(31) + Apr(28) = 73 days. SI = 2000×6.25×73/(100×365) = ₹25."
);

addExp(
  "Find the simple interest (rounded off to Rs.) on Rs.4000 at an interest rate of 5.25% per annum for the period from 12 February 2024 to 13 April 2024",
  "2024 is leap year. Days: Feb(17 remaining) + Mar(31) + Apr(13) = 61 days. SI = 4000×5.25×61/(100×366) ≈ ₹35."
);

addExp(
  "In how many years will a sum of ₹2,500 invested at 16% simple interest become ₹4,100",
  "SI = 4100 - 2500 = 1600. T = SI×100/(P×R) = 1600×100/(2500×16) = 4 years."
);

addExp(
  "A person borrowed some money on simple interest. After 3 years, he returned 4/3 of the money",
  "Returned 4/3 → SI = 4/3 - 1 = 1/3 of P. SI = P×R×3/100 = P/3 → R = 100/9 = 11 1/9% p.a."
);

addExp(
  "A sum of ₹16,875 was lent out at simple interest, and at the end of 1 year 8 months",
  "T = 1 yr 8 mo = 5/3 yr. SI = 18000 - 16875 = 1125. R = SI×100/(P×T) = 1125×100/(16875×5/3) = 1125×300/84375 = 4%."
);

addExp(
  "The difference between the simple interests on the principal of ₹500 at an interest rate of 5% per annum for 3 years and 4% per annum for 4 years",
  "SI₁ = 500×5×3/100 = 75. SI₂ = 500×4×4/100 = 80. Difference = 80 - 75 = Rs.5."
);

addExp(
  "A sum of ₹10,500 amounts to ₹13,825 in 3 4/5 years at a certain rate percent per annum simple interest",
  "SI = 13825-10500 = 3325. R = 3325×100/(10500×19/5) = 3325×500/199500 = 25/3 %. At 2R for 5yr: SI = 10500×(50/3)×5/100 = 10500×250/300 = ₹8,750."
);

addExp(
  "An amount of P was put at a certain rate for 4 years. If it had been put at a 6% higher rate",
  "Extra SI = P×6×4/100 = 24P/100 = 600 → P = 2500. 2.5P = 2.5×2500 = ₹6,250."
);

addExp(
  "A certain sum of money is given at a certain rate of simple interest for 6 years. Had it been given at 7% higher",
  "Extra SI = P×7×6/100 = 42P/100 = 1512 → P = 1512×100/42 = ₹3,600."
);

addExp(
  "A certain sum of money becomes 4 times in 12 years when invested at simple interest. In how many years will it become 10 times",
  "4x in 12yr → SI = 3P → R = 3P×100/(P×12) = 25%. 10x → SI = 9P → T = 9P×100/(P×25) = 36 years."
);

addExp(
  "A sum of money doubles itself in 4 years at simple interest. In what time will it become 7 times",
  "2x in 4yr → SI = P → R = P×100/(P×4) = 25%. 7x → SI = 6P → T = 6P×100/(P×25) = 24 years."
);

addExp(
  "The rate at which a sum becomes four times of itself in 12 years at simple interest",
  "4x → SI = 3P in 12yr. R = 3P×100/(P×12) = 25%."
);

// ===========================
// SET 2 — SIMPLE INTEREST
// ===========================

addExp(
  "The simple interest on Rs. 73,000 at the rate of 15% per annum from 12-02-2022 to 11-02-2023",
  "Period = exactly 1 year. SI = 73000×15×1/100 = ₹10,950."
);

addExp(
  "A sum of Rs.1,456, when invested for ten years, amounts to Rs.2,366 on maturity",
  "SI = 2366-1456 = 910. R = 910×100/(1456×10) = 91000/14560 = 6.25%."
);

addExp(
  "How many years will it take for Rs.8,400 to amount to Rs.11,928 at a simple interest rate of 7%",
  "SI = 11928-8400 = 3528. T = 3528×100/(8400×7) = 352800/58800 = 6 years."
);

addExp(
  "Find the simple interest (in Rs.) on Rs.2000 at 6.5% per annum rate of interest for the period from 13 February 2023 to 27 April 2023",
  "Days: Feb(15 remaining) + Mar(31) + Apr(27) = 73 days. SI = 2000×6.5×73/(100×365) = ₹26."
);

addExp(
  "The simple interest on a sum of money is 9/45 of the sum. If the number of years is numerically 5 times of rate",
  "SI = P/5 (since 9/45 = 1/5). T = 5R. P×R×5R/100 = P/5 → 5R² = 20 → R² = 4 → R = 2%."
);

addExp(
  "Sum of ₹20000 and ₹40000 are given on simple interest at the rate of 10 percent and 15 percent",
  "SI₁ = 20000×10×3/100 = 6000. SI₂ = 40000×15×3/100 = 18000. Total = ₹24,000."
);

addExp(
  "A person took a loan at 5% per annum simple interest during the first year and with an increase of 0.5%",
  "Rates: 5%, 5.5%, 6%, 6.5% for 4 years. Total rate = 23%. P×23/100 = 4600 → P = ₹20,000."
);

addExp(
  "A person invested one-fourth of the sum of ₹25,000 at a certain rate of simple interest and the rest at 4% p.a. higher",
  "Part1 = 6250 at r%, Part2 = 18750 at (r+4)%. SI for 2yr: 6250×2r/100 + 18750×2(r+4)/100 = 4125. 125r + 375r + 1500 = 4125. 500r = 2625. r = 5.25%. Second rate = 9.25%."
);

addExp(
  "An amount becomes double in 7 years on simple interest. The amount would be four times",
  "2x in 7yr → R = 100/7%. 4x → SI = 3P → T = 3P×100/(P×100/7) = 21 years."
);

// ===========================
// SET 3 — SIMPLE INTEREST
// ===========================

addExp(
  "A certain sum of money amounts to ₹1,860 in 2 years and to ₹2,130 in 3½ years at simple interest",
  "SI for 1.5yr = 2130 - 1860 = 270 → SI/yr = 180. P = 1860 - 2×180 = ₹1,500. R = 180×100/1500 = 12%."
);

addExp(
  "A sum of money at a fixed rate of simple interest amounts to ₹1,630 in 3 years and to ₹1,708 in 4 years",
  "SI/yr = 1708 - 1630 = 78. P = 1630 - 3×78 = 1630 - 234 = ₹1,396."
);

addExp(
  "If a sum of money becomes ₹6,000 in 3 years and ₹10,500 in 7 years and 6 months",
  "SI for 4.5yr = 10500 - 6000 = 4500 → SI/yr = 1000. P = 6000 - 3×1000 = 3000. R = 1000×100/3000 = 33⅓%."
);

addExp(
  "A total of Rs.2,00,000 is divided into two parts for investing in different banks on simple interest. One yields 4%",
  "Alligation: (6-4.7):(4.7-4) = 1.3:0.7 = 13:7. At 4%: 2,00,000×13/20 = ₹1,30,000. At 6%: ₹70,000."
);

addExp(
  "An amount of Rs.8,000 was invested for 2 years, partly in scheme 1 at the rate of 5% simple interest",
  "Let x at 5%, (8000-x) at 4%. 2yr SI: 10x/100 + (8000-x)×8/100 = 720 → 2x + 64000 = 72000 → x = ₹4,000."
);

addExp(
  "A person borrowed some money at the rate of 8% per annum for the first two years, at the rate of 11%",
  "Total SI = P(8×2 + 11×3 + 16×4)/100 = P×113/100. 113P/100 = 21400 → P ≈ ₹18,938."
);

addExp(
  "Ramesh borrowed some money at rate of 5% per annum for the first four years, 8% per annum for the next six years, and 12%",
  "Total SI = P(5×4 + 8×6 + 12×2)/100 = P×92/100. 92P/100 = 9016 → P = ₹9,800."
);

addExp(
  "Ramesh has ₹18,000. He deposited ₹7,000 in a bank at the rate of 5% per annum and Rs.6,000",
  "SI from ₹7000@5% = 350. SI from ₹6000@6% = 360. Rest = ₹5000. Remaining SI = 1160-350-360 = 450. Rate = 450×100/5000 = 9%."
);

addExp(
  "A person invested a total of ₹9,000 in three parts at 3%, 4% and 6% per annum on simple interest. At the end of a year, he received equal interest",
  "Equal SI: P₁×3 = P₂×4 = P₃×6. Ratios: P₁:P₂:P₃ = 1/3:1/4:1/6 = 4:3:2. Total=9 parts. P₃ = 9000×2/9 = ₹2,000."
);

addExp(
  "A man invests an amount of ₹1,05,750 at simple interest in the name of his son, daughter and his wife",
  "Equal interest: P₁×5×3 = P₂×5×4 = P₃×5×5. 3P₁ = 4P₂ = 5P₃. P₁:P₂:P₃ = 20:15:12. Total = 47. Wife (P₃) = 1,05,750×12/47 = ₹27,000."
);

addExp(
  "S borrowed some amount from R and promised to pay him 8% interest. Then S invested the borrowed amount",
  "S borrows at 8%, invests and earns 5% profit after paying R. Total return = 8% + 5% = 13%. If R invested directly, he'd get 13%."
);

addExp(
  "A sum of ₹10,000 is taken as a loan by Rajesh at a rate of 15% p.a. simple interest for 2 years",
  "First 2yr: SI = 10000×15×2/100 = 3000. Amount = 13000. Next 2yr (13000 as new principal): SI = 13000×15×2/100 = 3900. Total = 13000+3900 = ₹16,900."
);

// ===========================
// SET 4 — SIMPLE INTEREST
// ===========================

addExp(
  "A certain sum of money lent out at simple interest amounts to ₹12,600 in 2 years and ₹16,200 in 4 years",
  "SI for 2yr = 16200 - 12600 = 3600 → SI/yr = 1800. P = 12600 - 3600 = 9000. R = 1800×100/9000 = 20%."
);

addExp(
  "A sum of money invested at a certain rate of simple interest per annum amounts to ₹14,522 in seven years and to ₹18,906 in eleven years",
  "SI for 4yr = 18906 - 14522 = 4384 → SI/yr = 1096. P = 14522 - 7×1096 = 14522 - 7672 = ₹6,850."
);

addExp(
  "Mr Gogia invested an amount of ₹13,900 divided into two different schemes A and B at the simple interest rate of 14%",
  "A + B = 13900. 2yr SI: 28A/100 + 22B/100 = 3508. 28A + 22(13900-A) = 350800. 6A = 45000. A = 7500. B = ₹6,400."
);

addExp(
  "Ravi borrowed some money at the rate of 5% per annum for the first three years, 8% per annum for the next two years, and 10%",
  "SI = P(5×3 + 8×2 + 10×2)/100 = 51P/100 = 12750 → P = ₹25,000."
);

addExp(
  "A man invested a sum of Rs. 5,000 on simple interest for 5 years such that the rate of interest for the first 2 years is 10%",
  "SI₁ = 5000×10×2/100 = 1000. SI₂ = 5000×12×3/100 = 1800. Total = ₹2,800."
);

addExp(
  "Reshma took a loan of Rs.12,00,000 with simple interest for as many years as the rate of interest",
  "T = R. SI = P×R×R/100 = PR²/100. 12,00,000×R²/100 = 9,72,000 → R² = 81 → R = 9%."
);

addExp(
  "Simple interest on a certain sum is one-fourth of the sum and the interest rate percentage per annum is 4 times the number of years",
  "SI = P/4. R = 4T. P×4T×T/100 = P/4 → 4T² = 25 → T = 2.5yr, R = 10%. At R+2% = 12%: SI on 5000 for 3yr = 5000×12×3/100 = ₹1,800."
);

addExp(
  "A sum was invested at simple interest at x% p.a. for 2½ years. Had it been invested at (x + 3)%",
  "Extra SI = P×3×2.5/100 = 7.5P/100 = 585 → P = 7800. SI at 14% for 14/3 yr = 7800×14×14/(3×100) = 7800×196/300 = ₹5,096."
);

// ===========================
// SET 5 — COMPOUND INTEREST
// ===========================

addExp(
  "Shiva borrowed a sum of ₹12,000 from a finance company at the rate of 20% p.a. compound interest, compounded annually. What is the CI for a period of 2 years",
  "A = 12000×(1.2)² = 12000×1.44 = 17280. CI = 17280 - 12000 = ₹5,280."
);

addExp(
  "What is the compound interest on ₹62,500 for 2 years at 8% per annum compounded yearly",
  "A = 62500×(1.08)² = 62500×1.1664 = 72900. CI = 72900 - 62500 = ₹10,400."
);

addExp(
  "Aruna borrowed a sum of ₹9,000 from Jayshree at 10% per annum on compound interest, compounded annually. Find the total amount",
  "A = 9000×(1.10)² = 9000×1.21 = ₹10,890."
);

addExp(
  "Find the compound interest (in ₹) on ₹24,000 at 10% per annum for 3 years",
  "A = 24000×(1.1)³ = 24000×1.331 = 31944. CI = 31944 - 24000 = ₹7,944."
);

addExp(
  "A sum of money was lent at 12.5% rate of yearly compound interest for three years. If the present value",
  "P×(1.125)³ = 13851. (1.125)³ = 1.423828125. P = 13851/1.423828125 = ₹9,728."
);

addExp(
  "Kalyan invested a sum of ₹12,000 for two years at the rate of 5% and 10% respectively. What is the compound interest",
  "A = 12000×1.05×1.10 = 12000×1.155 = 13860. CI = 13860 - 12000 = ₹1,860."
);

addExp(
  "Find the compound interest on ₹11000 in 2 years at 4% p.a., interest compounded yearly",
  "A = 11000×(1.04)² = 11000×1.0816 = 11897.60. CI = 11897.60 - 11000 = ₹897.60."
);

addExp(
  "The compound interest on ₹2,500 after 2 years, at a rate of 6% per annum, compounded annually",
  "A = 2500×(1.06)² = 2500×1.1236 = 2809. CI = 2809 - 2500 = ₹309."
);

addExp(
  "A sum of ₹30000 is lent at compound interest (compounded annually) for 3 years. If the rate of interest is 10 percent for the first year, 20 percent",
  "A = 30000×1.10×1.20×1.30 = 30000×1.716 = 51480. CI = 51480 - 30000 = ₹21,480."
);

addExp(
  "A sum of ₹15,000 was lent for 3 years at the rate of 4%, 5%, 6% per annum, respectively",
  "A = 15000×1.04×1.05×1.06 = 15000×1.15752 = 17362.80. CI = 17362.80 - 15000 = ₹2,362.80."
);

addExp(
  "What will be the amount after 1 year if a sum of ₹7,500 is invested at 8% compound interest per annum, compounded half-yearly",
  "Half-yearly rate = 4%. A = 7500×(1.04)² = 7500×1.0816 = ₹8,112."
);

addExp(
  "Richa took a loan of ₹1,20,000 for 1 year at 20% per annum, compounded quarterly",
  "Quarterly rate = 5%. A = 120000×(1.05)⁴ = 120000×1.21550625 = ₹1,45,860.75."
);

addExp(
  "The compound interest on a sum of ₹5,500 at 15% p.a. for 2 years, when the interest compounded 8 monthly",
  "8-monthly rate = 15×8/12 = 10%. 2yr = 3 periods of 8 months. A = 5500×(1.10)³ = 5500×1.331 = 7320.50. CI = ₹1,820.50."
);

addExp(
  "A moneylender borrows money at 4% per annum and pays the interest at the end of the year. He lends it at 8%",
  "Effective lending rate (8% half-yearly) = (1.04)²-1 = 8.16%. Borrowing cost = 4%. Gain = P×(8.16-4)/100 = 166.4. P = 16640/4.16 = ₹4,000."
);

// ===========================
// SET 6 — COMPOUND INTEREST
// ===========================

addExp(
  "Find the compound interest on Rs.32000 for 6 months at 12% per annum compounded quarterly",
  "Quarterly rate = 3%. 6 months = 2 quarters. A = 32000×(1.03)² = 32000×1.0609 = 33948.80. CI = ₹1,948.80."
);

addExp(
  "Rita invested ₹50,000 in a bank. In two years how much compound interest will she get, if the first-year rate of interest was 10%",
  "2nd year rate = 10+4 = 14%. A = 50000×1.10×1.14 = 50000×1.254 = 62700. CI = ₹12,700."
);

addExp(
  "The compound interest on a certain sum of money at 8% per annum for 3 years is ₹4,058. Find the simple interest on the same sum for 4 years at 10%",
  "CI = P[(1.08)³-1] = P×0.259712 = 4058 → P = 15625. SI = 15625×10×4/100 = ₹6,250."
);

addExp(
  "The simple interest on ₹24,000 at a certain rate of interest for 3 years is ₹7,200. What will be the compound interest",
  "R = 7200×100/(24000×3) = 10%. CI = 24000[(1.10)³-1] = 24000×0.331 = ₹7,944."
);

addExp(
  "The compound interest (compounding annually) on a certain sum at the rate of 8 percent per annum for two years is ₹6656",
  "CI = P[(1.08)²-1] = P×0.1664 = 6656 → P = 40000. SI = 40000×8×2/100 = ₹6,400."
);

addExp(
  "Rajveer has invested ₹16,000 at 10% p.a. for 1 year on compound interest, compounded half-yearly",
  "Half-yearly rate = 5%. A = 16000×(1.05)² = 16000×1.1025 = ₹17,640."
);

addExp(
  "Rodney has invested ₹15,000 at a rate of 8% p.a. for 1 year on compound interest, compounded half-yearly",
  "Half-yearly rate = 4%. A = 15000×(1.04)² = 15000×1.0816 = ₹16,224."
);

addExp(
  "A man invested ₹96,000 at the rate of 20% per annum, compounded half yearly for 1 year. What would be 80%",
  "Half-yearly rate = 10%. A = 96000×(1.10)² = 96000×1.21 = 116160. 80% of 116160 = ₹92,928."
);

addExp(
  "The compound interest on a sum of ₹8,000 becomes ₹9,261 in 18 months. Find the rate of interest if interest is compounded half-yearly",
  "18mo = 3 half-years. 8000×(1+r/2)³ = 9261 → (1+r/2)³ = 1.157625 → 1+r/2 = 1.05 → r = 10%."
);

// ===========================
// SET 7 — COMPOUND INTEREST
// ===========================

addExp(
  "The difference between the simple interest and the compound interest on a certain amount at 9% per annum for two years is ₹162",
  "Diff for 2yr = P(R/100)². P×(9/100)² = 162 → P×0.0081 = 162 → P = ₹20,000."
);

addExp(
  "Calculate the difference between the compound interest and the simple interest on a sum of ₹5,000 at the rate of 8% for 3 years",
  "3yr diff = P[(1+R/100)³ - 1 - 3R/100] = 5000×[1.259712 - 1 - 0.24] = 5000×0.019712 ≈ ₹99."
);

addExp(
  "A sum of ₹9,500 becomes ₹11,704.95 in 2 years at compound interest. What is the rate of interest",
  "(1+R/100)² = 11704.95/9500 = 1.2321. 1+R/100 = 1.11. R = 11%."
);

addExp(
  "At what rate percentage per annum will ₹14,400 amount to ₹15,876 in one year, if interest is compounded half-yearly",
  "(1+R/200)² = 15876/14400 = 1.1025. 1+R/200 = 1.05. R = 10%."
);

addExp(
  "Suman invested a sum of ₹3500 at 20% per annum compound interest, compounded annually. If she received an amount of ₹6048",
  "3500×(1.2)ⁿ = 6048. (1.2)ⁿ = 1.728 = (1.2)³. n = 3 years."
);

addExp(
  "In what time will Rs.3,200 invested at 10% per annum compounded quarterly become Rs.3,362",
  "Quarterly rate = 2.5%. 3200×(1.025)^(4t) = 3362. (1.025)^(4t) = 1.050625 = (1.025)². 4t = 2 → t = ½ year."
);

// Q7 Set 7 — skipping (answer verification uncertain for 2¼ year fractional CI)

addExp(
  "A certain amount of money was lent for a period of 1 year 9 months at a rate of 10% per annum compounded annually",
  "1yr 9mo = 1¾yr. A = P×1.1×(1 + 0.10×9/12) = P×1.1×1.075 = 1.1825P. CI = 0.1825P = 1460 → P = ₹8,000."
);

addExp(
  "A sum of money, on compound interest, amounts to ₹5,290 in 2 years and to ₹6,083.50 in 3 years",
  "Munni Method: R = (A₃-A₂)/A₂ × 100 = (6083.50-5290)/5290 × 100 = 793.5/5290 × 100 = 15%."
);

addExp(
  "The amount received on a certain sum after 3 years and 5 years on compound interest (compounded annually) is ₹20,736 and ₹29,859.84",
  "(1+R/100)² = 29859.84/20736 = 1.44. 1+R/100 = 1.2 → R = 20%. P = 20736/(1.2)³ = 20736/1.728 = ₹12,000."
);

addExp(
  "A sum amounts to ₹7,562 in 4 years and to ₹8,469.44 in 5 years, at a certain rate percent",
  "R = (8469.44-7562)/7562 × 100 = 907.44/7562 × 100 = 12%. CI on 10000 for 2yr = 10000×[(1.12)²-1] = 10000×0.2544 = ₹2,544."
);

addExp(
  "A sum of money at compound interest doubles itself in 4 years. In how many years does the sum become 8 times",
  "2x in 4yr. 8x = 2³ → Time = 4×3 = 12 years."
);

addExp(
  "A sum of money on compound interest becomes double of itself in 3 years. How many years will it take for the amount to become eight times",
  "2x in 3yr. 8x = 2³ → Time = 3×3 = 9 years."
);

// ===========================
// SET 8 — COMPOUND INTEREST
// ===========================

addExp(
  "The difference between the simple interest and the compound interest, compounded annually, on a certain sum of money for 2 years at 14%",
  "Diff for 2yr = P×(R/100)² = P×(0.14)² = 0.0196P = 633 → P = ₹32,295 (approx)."
);

addExp(
  "If the difference between the compound interest and simple interest on a certain sum of money for 3 years at the rate of 4%",
  "3yr diff = P×R²(300+R)/10⁶ = P×16×304/10⁶ = 4864P/10⁶ = 76 → P = 76×10⁶/4864 = ₹15,625."
);

addExp(
  "In how many years will a sum of ₹18,000 amount to ₹23,958 at the annual rate of 20% compounded half yearly",
  "Half-yearly rate = 10%. 18000×(1.1)^(2n) = 23958. (1.1)^(2n) = 1.331 = (1.1)³. 2n = 3 → n = 1½ years."
);

addExp(
  "The compound interest on ₹18,000 at 7% per annum, compounded annually, is ₹1,260. What is the period",
  "CI = 18000×(1.07^t - 1) = 1260. 1.07^t - 1 = 0.07. 1.07^t = 1.07 → t = 1 year."
);

addExp(
  "Find the yearly rate of compound interest at which ₹2,400 amounts to ₹3650.1 in a duration of 3 years",
  "(1+R/100)³ = 3650.1/2400 = 1.520875. Cube root = 1.15. R = 15%."
);

addExp(
  "At what rate of annual compound interest, the interest on ₹20000 compounded half-yearly in 1 year 6 months",
  "1.5yr = 3 half-years. 20000×(1+R/200)³ = 23152.50. (1+R/200)³ = 1.157625. Cube root = 1.05. R = 10%."
);

addExp(
  "Find the compound interest on Rs.1,00,000 at 20% per annum for 3 years 3 months, compounded annually",
  "A = 100000×(1.2)³×(1+0.2×3/12) = 100000×1.728×1.05 = 181440. CI = ₹81,440."
);

addExp(
  "What is the compound interest (in ₹) on a sum of ₹8192 for 1¼ years at 15% per annum, if interest is compounded 5-monthly",
  "5-monthly rate = 15×5/12 = 6.25%. 15 months = 3 periods. A = 8192×(1.0625)³ = 8192×1.19946 = 9826. CI = ₹1,634."
);

addExp(
  "A sum of money, on compound interest, amounts to ₹578.40 in 2 years and to ₹614.55 in 3 years. The rate of interest",
  "R = (614.55-578.40)/578.40 × 100 = 36.15/578.40 × 100 = 6.25% = 6¼%."
);

addExp(
  "A certain sum at compound interest amounts to Rs.3,025 in 2 years and Rs.3,327.5 in 3 years",
  "R = (3327.5-3025)/3025 × 100 = 302.5/3025 × 100 = 10%. P = 3025/(1.1)² = 3025/1.21 = ₹2,500."
);

addExp(
  "A certain amount of money becomes thrice in 5 years at compound interest. How many years will it take to become 9 times",
  "3x in 5yr. 9x = 3² → Time = 5×2 = 10 years."
);

addExp(
  "Money is doubled in a bank account in 7 years, when the interest is compounded annually. What time in years is needed to make an amount 8 times",
  "2x in 7yr. 8x = 2³ → Time = 7×3 = 21 years."
);

addExp(
  "If at same rate of interest, in 2 years, the simple interest is Rs.56 and compound interest is Rs.72",
  "SI/yr = 28 → PR/100 = 28. CI-SI = 16. P(R/100)² = 16. (PR/100)×(R/100) = 16 → 28×R/100 = 16 → R = 400/7%. P = 2800/(400/7) = 49."
);

addExp(
  "A man invested a total of ₹12,050 in two parts, one at 10% p.a. simple interest for 2 years and the other at the same rate at compound interest",
  "Let x at CI. Equal amounts: (12050-x)×1.2 = x×1.21. 14460-1.2x = 1.21x → 2.41x = 14460 → x = ₹6,000."
);

addExp(
  "Divide ₹66,300 between A and B in such a way that the amount that A receives after 8 years is equal to the amount that B receives after 10 years",
  "A×(1.1)⁸ = B×(1.1)¹⁰ → A/B = (1.1)² = 1.21 = 121:100. Total=221. A = 66300×121/221 = ₹36,300. B = ₹30,000."
);

addExp(
  "A sum of money becomes two times of itself in 8 years at simple interest, and it becomes four times of itself in 2 years at compound interest",
  "SI: 2x in 8yr → R_SI = 100/8 = 12.5%. CI: 4x in 2yr → (1+R_CI/100)²=4 → R_CI = 100%. Ratio = 12.5:100 = 1:8."
);

addExp(
  "If at same rate of interest, in 2 years, the simple interest is ₹60 and compound interest is ₹64",
  "SI/yr = 30 → PR/100 = 30. CI-SI = 4. 30×R/100 = 4 → R = 40/3%. P = 3000/(40/3) = 225."
);

addExp(
  "Joseph deposited a total of ₹52,500 in a bank in the names of his two daughters aged 15 years and 16 years",
  "Younger (15→18): 3yr. Older (16→18): 2yr. P₁×(1.1)³ = P₂×(1.1)². P₁/P₂ = 1/(1.1) = 10/11. P₁+P₂ = 52500. P₁ = 52500×10/21 = ₹25,000."
);

// ===========================
// EARLIER IMPORTED DUPLICATES (add explanations to those too)
// Some questions were imported earlier with OCR artifacts but same content
// ===========================

// Now apply all explanations
let updated = 0;
let notFound = 0;

data.questions.forEach(q => {
  if (q.topic !== 'Simple Interest' && q.topic !== 'Compound Interest') return;
  if (q.explanation && q.explanation.length > 5) return; // already has explanation

  const key = q.question.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 70);
  if (explanations[key]) {
    q.explanation = explanations[key];
    updated++;
  }
});

// Check which explanations didn't match
const matchedKeys = new Set();
data.questions.forEach(q => {
  const key = q.question.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 70);
  if (explanations[key]) matchedKeys.add(key);
});
Object.keys(explanations).forEach(k => {
  if (!matchedKeys.has(k)) {
    notFound++;
    console.log('  NO MATCH:', k.slice(0, 60));
  }
});

data.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));

console.log(`\n=== Explanation Update Summary ===`);
console.log(`Templates prepared: ${Object.keys(explanations).length}`);
console.log(`Questions updated: ${updated}`);
console.log(`Not matched: ${notFound}`);
