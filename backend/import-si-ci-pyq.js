const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// ============================================================
// SIMPLE INTEREST & COMPOUND INTEREST PYQ IMPORT
// Source: Maths by Aditya Ranjan (SSC CGL/CHSL/MTS/CPO PYQs)
// ============================================================

const questions = [

  // ========== SET 1: Simple Interest (15 Qs) ==========
  // AK: 1(c) 2(d) 3(c) 4(b) 5(c) 6(c) 7(d) 8(b) 9(b) 10(b) 11(b) 12(b) 13(d) 14(a) 15(b)

  {q: "Find the simple interest on ₹15,000 at the rate of 7% p.a. for 3 years.", o: ["₹3,000", "₹3,100", "₹3,150", "₹3,120"], a: 2, topic: "Simple Interest", sub: "Basic SI", exam: "SSC Phase XII 26/06/2024 (Shift-02)"},
  {q: "An amount invested fetched a total simple interest of ₹4,050 at the rate of 9% per annum in 5 years. What is the amount invested (in ₹)?", o: ["8,300", "7,500", "9,050", "9,000"], a: 3, topic: "Simple Interest", sub: "Basic SI", exam: "SSC CHSL 09/07/2024 (Shift-03)"},
  {q: "A sum at simple interest at the rate of 5% per annum amounts to ₹4160 in 6 years. Find the sum.", o: ["₹2800", "₹2900", "₹3200", "₹3100"], a: 2, topic: "Simple Interest", sub: "Basic SI", exam: "SSC CHSL TIER-II (18/11/2024)"},
  {q: "Find the simple interest (in ₹) on ₹2000 at 6.25% per annum rate of interest for the period from 14 February 2023 to 28 April 2023.", o: ["26", "25", "23", "24"], a: 1, topic: "Simple Interest", sub: "Basic SI", exam: "RPF SI 02/12/2024 (Shift-02)"},
  {q: "Find the simple interest (rounded off to Rs.) on Rs.4000 at an interest rate of 5.25% per annum for the period from 12 February 2024 to 13 April 2024.", o: ["34", "36", "35", "33"], a: 2, topic: "Simple Interest", sub: "Basic SI", exam: ""},
  {q: "In how many years will a sum of ₹2,500 invested at 16% simple interest become ₹4,100?", o: ["3", "5", "4", "6"], a: 2, topic: "Simple Interest", sub: "Basic SI", exam: "SSC CHSL TIER-II 10/01/2024"},
  {q: "A person borrowed some money on simple interest. After 3 years, he returned 4/3 of the money to the lender. What was the rate of interest?", o: ["11 2/9 % p.a.", "11 4/9 % p.a.", "11 3/9 % p.a.", "11 1/9 % p.a."], a: 3, topic: "Simple Interest", sub: "Basic SI", exam: "SSC CHSL TIER-II 02/11/2023"},
  {q: "A sum of ₹16,875 was lent out at simple interest, and at the end of 1 year 8 months, the total amount was ₹18,000. Find the rate of interest per annum.", o: ["3.7%", "4%", "5%", "6.66%"], a: 1, topic: "Simple Interest", sub: "Basic SI", exam: "SSC Phase XI 27/06/2023 (Shift-04)"},
  {q: "The difference between the simple interests on the principal of ₹500 at an interest rate of 5% per annum for 3 years and 4% per annum for 4 years is:", o: ["Rs.7.5", "Rs.5", "Rs.15", "Rs.10"], a: 1, topic: "Simple Interest", sub: "Basic SI", exam: "SSC CGL 23/09/2024 (Shift-01)"},
  {q: "A sum of ₹10,500 amounts to ₹13,825 in 3 4/5 years at a certain rate percent per annum simple interest. What will be the simple interest on the same sum for 5 years at double the earlier rate?", o: ["₹8,470", "₹8,750", "₹8,670", "₹8,560"], a: 1, topic: "Simple Interest", sub: "Basic SI", exam: "SSC CGL TIER-II 13/09/2019"},
  {q: "An amount of P was put at a certain rate for 4 years. If it had been put at a 6% higher rate for the same period, it would have fetched ₹600 more interest. What is the value of 2.5P?", o: ["₹3,750", "₹6,250", "₹4,850", "₹2,500"], a: 1, topic: "Simple Interest", sub: "Rate Higher/Lower", exam: "SSC CHSL 10/08/2023 (Shift-04)"},
  {q: "A certain sum of money is given at a certain rate of simple interest for 6 years. Had it been given at 7% higher rate, it would have fetched Rs.1,512 more. Find the sum (in ₹).", o: ["₹3,200", "₹3,600", "₹3,100", "₹4,200"], a: 1, topic: "Simple Interest", sub: "Rate Higher/Lower", exam: "SSC CGL 18/09/2024 (Shift-01)"},
  {q: "A certain sum of money becomes 4 times in 12 years when invested at simple interest. In how many years will it become 10 times of itself at the same rate?", o: ["60", "48", "24", "36"], a: 3, topic: "Simple Interest", sub: "Times Concept", exam: "SSC MTS 18/10/2021 (Shift-02)"},
  {q: "A sum of money doubles itself in 4 years at simple interest. In what time will it become 7 times at the same rate of interest?", o: ["24 years", "23 years", "21 years", "25 years"], a: 0, topic: "Simple Interest", sub: "Times Concept", exam: "SSC CHSL TIER-II 26/06/2023"},
  {q: "The rate at which a sum becomes four times of itself in 12 years at simple interest will be:", o: ["20%", "25%", "35%", "30%"], a: 1, topic: "Simple Interest", sub: "Times Concept", exam: "SSC CGL 24/07/2023 (Shift-01)"},

  // ========== SET 2: Simple Interest (9 Qs) ==========
  // AK: 1(d) 2(c) 3(d) 4(c) 5(b) 6(d) 7(a) 8(b) 9(c)

  {q: "The simple interest on Rs. 73,000 at the rate of 15% per annum from 12-02-2022 to 11-02-2023 is:", o: ["₹13,450", "₹14,750", "₹12,050", "₹10,950"], a: 3, topic: "Simple Interest", sub: "Basic SI", exam: ""},
  {q: "A sum of Rs.1,456, when invested for ten years, amounts to Rs.2,366 on maturity. Find the rate of simple interest per annum that was to be paid on the sum invested.", o: ["5.75%", "6.5%", "6.25%", "6.15%"], a: 2, topic: "Simple Interest", sub: "Basic SI", exam: ""},
  {q: "How many years will it take for Rs.8,400 to amount to Rs.11,928 at a simple interest rate of 7% per annum?", o: ["8", "5", "2", "6"], a: 3, topic: "Simple Interest", sub: "Basic SI", exam: ""},
  {q: "Find the simple interest (in Rs.) on Rs.2000 at 6.5% per annum rate of interest for the period from 13 February 2023 to 27 April 2023.", o: ["27", "25", "26", "24"], a: 2, topic: "Simple Interest", sub: "Basic SI", exam: ""},
  {q: "The simple interest on a sum of money is 9/45 of the sum. If the number of years is numerically 5 times of rate per cent per annum, then find the rate per cent per annum.", o: ["5%", "2%", "7%", "3%"], a: 1, topic: "Simple Interest", sub: "Basic SI", exam: ""},
  {q: "Sum of ₹20000 and ₹40000 are given on simple interest at the rate of 10 percent and 15 percent per annum respectively for three years. What will be the total simple interest?", o: ["₹36000", "₹32000", "₹28000", "₹24000"], a: 3, topic: "Simple Interest", sub: "Total SI", exam: ""},
  {q: "A person took a loan at 5% per annum simple interest during the first year and with an increase of 0.5% simple interest every year from the second year onwards. After 4 years, he paid ₹4,600 as a total interest to settle the loan completely. How much was the loan?", o: ["20,000", "19,000", "18,000", "21,000"], a: 0, topic: "Simple Interest", sub: "Total SI", exam: ""},
  {q: "A person invested one-fourth of the sum of ₹25,000 at a certain rate of simple interest and the rest at 4% p.a. higher rate. If the total interest received for 2 years is ₹4,125. What is the rate at which the second sum was invested?", o: ["9.5%", "9.25%", "9.255%", "7.5%"], a: 1, topic: "Simple Interest", sub: "Alligation", exam: ""},
  {q: "An amount becomes double in 7 years on simple interest. The amount would be four times in ____ years on the same rate of simple interest.", o: ["14", "28", "21", "18"], a: 2, topic: "Simple Interest", sub: "Times Concept", exam: ""},

  // ========== SET 3: Simple Interest Types 04-08 (12 Qs) ==========
  // AK: 1(a) 2(c) 3(a) 4(a) 5(d) 6(d) 7(a) 8(c) 9(a) 10(c) 11(b) 12(b)

  {q: "A certain sum of money amounts to ₹1,860 in 2 years and to ₹2,130 in 3½ years at simple interest. Find the sum and the rate of interest, respectively.", o: ["₹1,500, 12%", "₹1,200, 10%", "₹1,500, 15%", "₹1,200, 12%"], a: 0, topic: "Simple Interest", sub: "Amount Concept", exam: "SSC CHSL 10/07/2024 (Shift-03)"},
  {q: "A sum of money at a fixed rate of simple interest amounts to ₹1,630 in 3 years and to ₹1,708 in 4 years. Find the sum (in ₹).", o: ["1132", "1296", "1396", "1448"], a: 2, topic: "Simple Interest", sub: "Amount Concept", exam: "SSC CGL 19/07/2023 (Shift-04)"},
  {q: "If a sum of money becomes ₹6,000 in 3 years and ₹10,500 in 7 years and 6 months at the same rate of simple interest, then what is the rate of interest?", o: ["33 1/3%", "25 1/2%", "45 2/3%", "66 1/3%"], a: 0, topic: "Simple Interest", sub: "Amount Concept", exam: "SSC CHSL 07/08/2023 (Shift-04)"},
  {q: "A total of Rs.2,00,000 is divided into two parts for investing in different banks on simple interest. One yields 4% p.a. while the other yields 6% p.a. If the total interest at the end of one year is equivalent to 4.7% p.a. on the whole amount, the amount (in Rs.) invested in each bank is _____, respectively.", o: ["1,30,000 & 70,000", "1,45,000 & 55,000", "1,20,000 & 80,000", "1,60,000 & 40,000"], a: 0, topic: "Simple Interest", sub: "Alligation", exam: "SSC CGL 18/09/2024 (Shift-02)"},
  {q: "An amount of Rs.8,000 was invested for 2 years, partly in scheme 1 at the rate of 5% simple interest per annum and the rest in scheme 2 at the rate of 4% simple interest per annum. The total interest received at the end was ₹720. The amount of money invested in scheme 1 is:", o: ["₹3,640", "₹7,200", "₹4,400", "₹4,000"], a: 3, topic: "Simple Interest", sub: "Alligation", exam: "SSC CHSL 04/07/2024 (Shift-04)"},
  {q: "A person borrowed some money at the rate of 8% per annum for the first two years, at the rate of 11% per annum for the next three years, and at the rate of 16% per annum for the period beyond five years. If he pays a total interest of Rs.21,400 at the end of nine years, how much money did he borrow?", o: ["Rs.11,938", "Rs.18,738", "Rs.15,938", "Rs.18,938"], a: 3, topic: "Simple Interest", sub: "Total SI", exam: "SSC CHSL 03/07/2024 (Shift-01)"},
  {q: "Ramesh borrowed some money at rate of 5% per annum for the first four years, 8% per annum for the next six years, and 12% per annum for the period beyond ten years. If the total interest paid by him at the end of twelve years is ₹9,016, then find the money borrowed by Ramesh.", o: ["₹9,800", "₹9,616", "₹9,816", "₹9,016"], a: 0, topic: "Simple Interest", sub: "Total SI", exam: "SSC CPO 03/10/2023 (Shift-03)"},
  {q: "Ramesh has ₹18,000. He deposited ₹7,000 in a bank at the rate of 5% per annum and Rs.6,000 in other bank at the rate of 6% per annum simple interest. If he received ₹1,160 as simple interest at the end of one year, then the rate of interest per annum on rest of the capital is equal to:", o: ["10%", "11%", "9%", "8%"], a: 2, topic: "Simple Interest", sub: "Total SI", exam: "SSC CGL 09/09/2024 (Shift-03)"},
  {q: "A person invested a total of ₹9,000 in three parts at 3%, 4% and 6% per annum on simple interest. At the end of a year, he received equal interest in all three cases. The amount invested at 6% is", o: ["₹2,000", "₹3,000", "₹4,000", "₹5,000"], a: 0, topic: "Simple Interest", sub: "Equal SI", exam: "SSC CHSL 16/10/2020 (Shift-03)"},
  {q: "A man invests an amount of ₹1,05,750 at simple interest in the name of his son, daughter and his wife in such a way that they get the same interest after 3, 4 and 5 years, respectively. If the rate of interest is 5% per annum, then the amount invested for the wife is:", o: ["₹25,000", "₹28,000", "₹27,000", "₹30,000"], a: 2, topic: "Simple Interest", sub: "Equal SI", exam: "SSC CHSL 12/08/2021 (Shift-03)"},
  {q: "S borrowed some amount from R and promised to pay him 8% interest. Then S invested the borrowed amount in a scheme, upon which he earned a profit of 5% after paying R the principal amount with interest. How much percentage R would have gained, if he would have invested in the scheme directly?", o: ["13.4%", "13%", "14.4%", "14%"], a: 1, topic: "Simple Interest", sub: "Mixed SI", exam: "SSC CGL 11/09/2024 (Shift-02)"},
  {q: "A sum of ₹10,000 is taken as a loan by Rajesh at a rate of 15% p.a. simple interest for 2 years. But Rajesh could not repay it at the agreed time and asked for an extension of two more years. So, the lender included the interest amount for the period as principal for the next two years at the same rate of interest. The total amount paid by Rajesh at the end of 4 years is:", o: ["₹18,590", "₹16,900", "₹17,650", "₹15,630"], a: 1, topic: "Simple Interest", sub: "Mixed SI", exam: "SSC CGL 13/09/2024 (Shift-03)"},

  // ========== SET 4: Simple Interest Additional (8 Qs) ==========
  // AK: 1(b) 2(a) 3(c) 4(a) 5(a) 6(a) 7(d) 8(b)

  {q: "A certain sum of money lent out at simple interest amounts to ₹12,600 in 2 years and ₹16,200 in 4 years. The rate percent per annum is:", o: ["25%", "20%", "12 6/7%", "17 1/2%"], a: 1, topic: "Simple Interest", sub: "Amount Concept", exam: ""},
  {q: "A sum of money invested at a certain rate of simple interest per annum amounts to ₹14,522 in seven years and to ₹18,906 in eleven years. Find the sum invested (in ₹).", o: ["6850", "6900", "6800", "6750"], a: 0, topic: "Simple Interest", sub: "Amount Concept", exam: ""},
  {q: "Mr Gogia invested an amount of ₹13,900 divided into two different schemes A and B at the simple interest rate of 14% pa and 11% pa, respectively. If the total amount of simple interest earned in 2 years is ₹3,508, what was the amount invested in scheme B?", o: ["₹7200", "₹7500", "₹6400", "₹6500"], a: 2, topic: "Simple Interest", sub: "Alligation", exam: ""},
  {q: "Ravi borrowed some money at the rate of 5% per annum for the first three years, 8% per annum for the next two years, and 10% per annum for the period beyond 5 years. If he paid a total simple interest of ₹12,750 at the end of 7 years, then how much money did he borrow?", o: ["₹25,000", "₹26000", "₹27000", "24,000"], a: 0, topic: "Simple Interest", sub: "Total SI", exam: ""},
  {q: "A man invested a sum of Rs. 5,000 on simple interest for 5 years such that the rate of interest for the first 2 years is 10% per annum, for the next 3 years it is 12% per annum. How much interest (in Rs) will he earn at the end of 5 years?", o: ["2800", "2450", "3000", "3180"], a: 0, topic: "Simple Interest", sub: "Total SI", exam: ""},
  {q: "Reshma took a loan of Rs.12,00,000 with simple interest for as many years as the rate of interest. If she paid Rs.9,72,000 as interest at the end of the loan period, what was the rate of interest per annum?", o: ["9%", "7.5%", "8%", "8.7%"], a: 0, topic: "Simple Interest", sub: "Mixed SI", exam: ""},
  {q: "Simple interest on a certain sum is one-fourth of the sum and the interest rate percentage per annum is 4 times the number of years. If the rate of interest increases by 2%, then what will be the simple interest (in ₹) on ₹5000 for 3 years?", o: ["300", "1500", "2000", "1800"], a: 3, topic: "Simple Interest", sub: "Mixed SI", exam: ""},
  {q: "A sum was invested at simple interest at x% p.a. for 2½ years. Had it been invested at (x + 3)% for the same time, it would have fetched ₹585 more. The simple interest on the same sum for 4⅔ years at 14% p.a. is:", o: ["₹4,732", "₹5,096", "₹4,900", "₹5,460"], a: 1, topic: "Simple Interest", sub: "Rate Higher/Lower", exam: ""},

  // ========== SET 5: Compound Interest (14 Qs) ==========
  // AK: 1(a) 2(c) 3(b) 4(a) 5(d) 6(b) 7(d) 8(a) 9(a) 10(c) 11(b) 12(a) 13(b) 14(b)

  {q: "Shiva borrowed a sum of ₹12,000 from a finance company at the rate of 20% p.a. compound interest, compounded annually. What is the CI for a period of 2 years?", o: ["₹5,280", "₹4,800", "₹4,280", "₹2,400"], a: 0, topic: "Compound Interest", sub: "Basic CI", exam: "DP Head Constable 14/10/2022 (Shift-02)"},
  {q: "What is the compound interest on ₹62,500 for 2 years at 8% per annum compounded yearly?", o: ["₹10,500", "₹10,300", "₹10,400", "₹10,600"], a: 2, topic: "Compound Interest", sub: "Basic CI", exam: "SSC CHSL 03/08/2023 (Shift-03)"},
  {q: "Aruna borrowed a sum of ₹9,000 from Jayshree at 10% per annum on compound interest, compounded annually. Find the total amount paid by Aruna after 2 years to clear all the dues.", o: ["₹10098", "₹10890", "₹10980", "₹10089"], a: 1, topic: "Compound Interest", sub: "Basic CI", exam: "RRB ALP 25/11/2024 (Shift-03)"},
  {q: "Find the compound interest (in ₹) on ₹24,000 at 10% per annum for 3 years.", o: ["7944", "7200", "7494", "7044"], a: 0, topic: "Compound Interest", sub: "Basic CI", exam: "DP CONSTABLE 24/11/2023 (Shift-03)"},
  {q: "A sum of money was lent at 12.5% rate of yearly compound interest for three years. If the present value (i.e. after three years) of the sum of money is ₹13,851, then how much money (in ₹) was lent?", o: ["8728", "10000", "10278", "9728"], a: 3, topic: "Compound Interest", sub: "Basic CI", exam: "DP CONSTABLE 30/11/2023 (Shift-01)"},
  {q: "Kalyan invested a sum of ₹12,000 for two years at the rate of 5% and 10% respectively. What is the compound interest (in ₹) at the end of two years?", o: ["₹1920", "₹1860", "₹1900", "₹1880"], a: 1, topic: "Compound Interest", sub: "Basic CI", exam: "SSC CHSL 07/08/2023 (Shift-03)"},
  {q: "Find the compound interest on ₹11000 in 2 years at 4% p.a., interest compounded yearly.", o: ["₹875.80", "₹906.50", "₹786.60", "₹897.60"], a: 3, topic: "Compound Interest", sub: "Basic CI", exam: "RRB ALP 25/11/2024 (Shift-01)"},
  {q: "The compound interest on ₹2,500 after 2 years, at a rate of 6% per annum, compounded annually, will be:", o: ["₹309", "₹320", "₹318", "₹322"], a: 0, topic: "Compound Interest", sub: "Basic CI", exam: "RRB Technician G-III 26/12/2024 (Shift-03)"},
  {q: "A sum of ₹30000 is lent at compound interest (compounded annually) for 3 years. If the rate of interest is 10 percent for the first year, 20 percent for the second year and 30 percent for the third year, then what will be the total compound interest?", o: ["₹21480", "₹19270", "₹20560", "₹22580"], a: 0, topic: "Compound Interest", sub: "Variable Rate CI", exam: "SSC MTS 14/06/2023 (Shift-02)"},
  {q: "A sum of ₹15,000 was lent for 3 years at the rate of 4%, 5%, 6% per annum, respectively, at compound interest for the first year, second year and third year compounded annually. Find the compound interest for 3 years.", o: ["₹2,335.60", "₹2,338.80", "₹2,362.80", "₹2,388.60"], a: 2, topic: "Compound Interest", sub: "Variable Rate CI", exam: "SSC MTS 12/09/2023 (Shift-03)"},
  {q: "What will be the amount after 1 year if a sum of ₹7,500 is invested at 8% compound interest per annum, compounded half-yearly?", o: ["₹8,300", "₹8,112", "₹8,220", "₹28,140"], a: 1, topic: "Compound Interest", sub: "Half-Yearly CI", exam: "RRB Technician G-3 23/12/2024 (Shift-03)"},
  {q: "Richa took a loan of ₹1,20,000 for 1 year at 20% per annum, compounded quarterly. The amount that Richa has to pay after 1 year is:", o: ["₹1,45,860.75", "₹1,45,863.75", "₹1,45,862.75", "₹1,45,861.75"], a: 0, topic: "Compound Interest", sub: "Quarterly CI", exam: "DP Head Constable 17/10/2022 (Shift-01)"},
  {q: "The compound interest on a sum of ₹5,500 at 15% p.a. for 2 years, when the interest compounded 8 monthly is:", o: ["₹1880", "₹1,820.50", "₹1,773.75", "₹1,850"], a: 1, topic: "Compound Interest", sub: "Periodic CI", exam: "SSC CGL TIER-II 15/11/2020"},
  {q: "A moneylender borrows money at 4% per annum and pays the interest at the end of the year. He lends it at 8% per annum compound interest, compounded half-yearly, and receives the interest at the end of the year. In this way, he gains ₹166.4 a year. Find the amount of money he borrows.", o: ["₹6,500", "₹4,000", "₹5,050", "₹4,500"], a: 1, topic: "Compound Interest", sub: "Mixed CI", exam: "DP CONSTABLE 28/11/2023 (Shift-01)"},

  // ========== SET 6: Compound Interest (9 Qs) ==========
  // AK: 1(b) 2(d) 3(c) 4(d) 5(d) 6(d) 7(b) 8(b) 9(b)

  {q: "Find the compound interest on Rs.32000 for 6 months at 12% per annum compounded quarterly.", o: ["Rs.1947.80", "Rs.1948.80", "Rs.1947", "Rs.1948"], a: 1, topic: "Compound Interest", sub: "Quarterly CI", exam: ""},
  {q: "Rita invested ₹50,000 in a bank. In two years how much compound interest will she get, if the first-year rate of interest was 10% and in the second year it was 4% more than the first year?", o: ["₹12720", "₹12710", "₹12690", "₹12700"], a: 3, topic: "Compound Interest", sub: "Variable Rate CI", exam: ""},
  {q: "The compound interest on a certain sum of money at 8% per annum for 3 years is ₹4,058. Find the simple interest on the same sum for 4 years at 10% p.a.", o: ["₹6,520", "₹6,025", "₹6,250", "₹6,052"], a: 2, topic: "Compound Interest", sub: "CI to SI", exam: ""},
  {q: "The simple interest on ₹24,000 at a certain rate of interest for 3 years is ₹7,200. What will be the compound interest (compounded annually) on the same sum at the same rate and for the same time?", o: ["₹7,854", "₹7,954", "₹7,845", "₹7,944"], a: 3, topic: "Compound Interest", sub: "SI to CI", exam: ""},
  {q: "The compound interest (compounding annually) on a certain sum at the rate of 8 percent per annum for two years is ₹6656. What would be the simple interest on the same sum at the same rate of interest for two years?", o: ["₹6224", "₹6336", "₹5600", "₹6400"], a: 3, topic: "Compound Interest", sub: "CI to SI", exam: ""},
  {q: "Rajveer has invested ₹16,000 at 10% p.a. for 1 year on compound interest, compounded half-yearly. The amount received by him will be:", o: ["₹16,354", "₹17,830", "₹16,542", "₹17,640"], a: 3, topic: "Compound Interest", sub: "Half-Yearly CI", exam: ""},
  {q: "Rodney has invested ₹15,000 at a rate of 8% p.a. for 1 year on compound interest, compounded half-yearly. The amount received by him will be:", o: ["₹15,840", "₹16,224", "₹16,354", "₹15,960"], a: 1, topic: "Compound Interest", sub: "Half-Yearly CI", exam: ""},
  {q: "A man invested ₹96,000 at the rate of 20% per annum, compounded half yearly for 1 year. What would be 80% of the amount (in ₹) which he will get on maturity?", o: ["1,16,160", "92,928", "1,09,856", "98,922"], a: 1, topic: "Compound Interest", sub: "Half-Yearly CI", exam: ""},
  {q: "The compound interest on a sum of ₹8,000 becomes ₹9,261 in 18 months. Find the rate of interest if interest is compounded half-yearly.", o: ["8%", "10%", "20%", "12%"], a: 1, topic: "Compound Interest", sub: "Half-Yearly CI", exam: ""},

  // ========== SET 7: Compound Interest (13 Qs) ==========
  // AK: 1(c) 2(d) 3(c) 4(d) 5(a) 6(b) 7(b) 8(d) 9(b) 10(d) 11(a) 12(b) 13(b)

  {q: "The difference between the simple interest and the compound interest on a certain amount at 9% per annum for two years is ₹162, what is the principal?", o: ["₹19700", "₹19000", "₹20000", "₹18500"], a: 2, topic: "Compound Interest", sub: "Difference SI-CI", exam: "SSC CHSL 09/08/2023 (Shift-01)"},
  {q: "Calculate the difference between the compound interest and the simple interest on a sum of ₹5,000 at the rate of 8% for 3 years (to nearest integer).", o: ["₹108", "₹105", "₹102", "₹99"], a: 3, topic: "Compound Interest", sub: "Difference SI-CI", exam: "SSC CHSL 26/05/2022 (Shift-03)"},
  {q: "A sum of ₹9,500 becomes ₹11,704.95 in 2 years at compound interest. What is the rate of interest?", o: ["9%", "7%", "11%", "10%"], a: 2, topic: "Compound Interest", sub: "Rate & Time CI", exam: "DP CONSTABLE 16/11/2023 (Shift-01)"},
  {q: "At what rate percentage per annum will ₹14,400 amount to ₹15,876 in one year, if interest is compounded half-yearly?", o: ["15%", "12%", "8%", "10%"], a: 3, topic: "Compound Interest", sub: "Rate & Time CI", exam: "SSC Phase-IX 2022"},
  {q: "Suman invested a sum of ₹3500 at 20% per annum compound interest, compounded annually. If she received an amount of ₹6048 after n years, the value of n is:", o: ["3", "2.6", "4", "2"], a: 0, topic: "Compound Interest", sub: "Rate & Time CI", exam: "RRB JE 17/12/2024 (Shift-03)"},
  {q: "In what time will Rs.3,200 invested at 10% per annum compounded quarterly become Rs.3,362?", o: ["2 years", "1/2 year", "2 1/2 years", "1/4 year"], a: 1, topic: "Compound Interest", sub: "Rate & Time CI", exam: "NTPC CBT-1 01/04/2021 (Shift-01)"},
  {q: "What is the compound interest (in Rs.) on a sum of Rs.15600 at 20% p.a. for 2¼ years, the interest being compounded annually?", o: ["7993", "7884", "7895", "7987"], a: 1, topic: "Compound Interest", sub: "Fractional Time CI", exam: "NTPC CBT-2 16/06/2022 (Shift-01)"},
  {q: "A certain amount of money was lent for a period of 1 year 9 months at a rate of 10% per annum compounded annually. If the compound interest is ₹1460, find the amount of money lent.", o: ["₹8200", "₹7500", "₹6000", "₹8000"], a: 3, topic: "Compound Interest", sub: "Fractional Time CI", exam: "SSC CHSL 02/08/2023 (Shift-01)"},
  {q: "A sum of money, on compound interest, amounts to ₹5,290 in 2 years and to ₹6,083.50 in 3 years. If interest is compounded annually, then the rate of interest per annum is:", o: ["16 2/3%", "15%", "14%", "12%"], a: 1, topic: "Compound Interest", sub: "Munni Method CI", exam: "RRB ALP 29/11/2024 (Shift-03)"},
  {q: "The amount received on a certain sum after 3 years and 5 years on compound interest (compounded annually) is ₹20,736 and ₹29,859.84 respectively. What is that sum?", o: ["₹9000", "₹14000", "₹15000", "₹12000"], a: 3, topic: "Compound Interest", sub: "Munni Method CI", exam: "SSC MTS 14/06/2023 (Shift-03)"},
  {q: "A sum amounts to ₹7,562 in 4 years and to ₹8,469.44 in 5 years, at a certain rate percent per annum when the interest is compounded yearly. If ₹10,000 at the same rate of interest is borrowed for two years, then what will be the compound interest (in ₹)?", o: ["2,544", "2,764", "1,965", "1,736"], a: 0, topic: "Compound Interest", sub: "Munni Method CI", exam: "SSC CPO 25/11/2020 (Shift-01)"},
  {q: "A sum of money at compound interest doubles itself in 4 years. In how many years does the sum become 8 times of itself at the same rate of interest?", o: ["15 years", "12 years", "8 years", "10 years"], a: 1, topic: "Compound Interest", sub: "N Times CI", exam: "SSC CPO 27/06/2024 (Shift-01)"},
  {q: "A sum of money on compound interest becomes double of itself in 3 years. How many years will it take for the amount to become eight times of itself at the same rate of interest?", o: ["8", "9", "5", "7"], a: 1, topic: "Compound Interest", sub: "N Times CI", exam: "DP CONSTABLE 15/11/2023 (Shift-03)"},

  // ========== SET 8: Compound Interest Mixed (18 Qs) ==========
  // AK: 1(d) 2(c) 3(b) 4(a) 5(d) 6(a) 7(b) 8(c) 9(b) 10(d) 11(c) 12(c) 13(c) 14(b) 15(b) 16(d) 17(c) 18(d)

  {q: "The difference between the simple interest and the compound interest, compounded annually, on a certain sum of money for 2 years at 14% per annum is ₹633. Find the sum.", o: ["₹32282", "₹32288", "₹32313", "₹32295"], a: 3, topic: "Compound Interest", sub: "Difference SI-CI", exam: ""},
  {q: "If the difference between the compound interest and simple interest on a certain sum of money for 3 years at the rate of 4% per annum is ₹76, then what is the sum?", o: ["₹16,725", "₹12,925", "₹15,625", "₹18,825"], a: 2, topic: "Compound Interest", sub: "Difference SI-CI", exam: ""},
  {q: "In how many years will a sum of ₹18,000 amount to ₹23,958 at the annual rate of 20% compounded half yearly?", o: ["1 1/4 years", "1 1/2 years", "2 1/2 years", "3 1/2 years"], a: 1, topic: "Compound Interest", sub: "Rate & Time CI", exam: ""},
  {q: "The compound interest on ₹18,000 at 7% per annum, compounded annually, is ₹1,260. What is the period of time?", o: ["1 year", "2 years", "3 years", "4 years"], a: 0, topic: "Compound Interest", sub: "Rate & Time CI", exam: ""},
  {q: "Find the yearly rate of compound interest at which ₹2,400 amounts to ₹3650.1 in a duration of 3 years.", o: ["13%", "12%", "14%", "15%"], a: 3, topic: "Compound Interest", sub: "Rate & Time CI", exam: ""},
  {q: "At what rate of annual compound interest, the interest on ₹20000 compounded half-yearly in 1 year 6 months becomes ₹23152.50?", o: ["10% yearly", "5% yearly", "12% yearly", "8% yearly"], a: 0, topic: "Compound Interest", sub: "Rate & Time CI", exam: ""},
  {q: "Find the compound interest on Rs.1,00,000 at 20% per annum for 3 years 3 months, compounded annually.", o: ["Rs.82360", "Rs.81440", "Rs.65000", "Rs.71650"], a: 1, topic: "Compound Interest", sub: "Fractional Time CI", exam: ""},
  {q: "What is the compound interest (in ₹) on a sum of ₹8192 for 1¼ years at 15% per annum, if interest is compounded 5-monthly?", o: ["1,640", "1,740", "1,634", "1,735"], a: 2, topic: "Compound Interest", sub: "Periodic CI", exam: ""},
  {q: "A sum of money, on compound interest, amounts to ₹578.40 in 2 years and to ₹614.55 in 3 years. The rate of interest per annum, in case of annual compounding, is:", o: ["8 1/3%", "6 1/4%", "4%", "5%"], a: 1, topic: "Compound Interest", sub: "Munni Method CI", exam: ""},
  {q: "A certain sum at compound interest amounts to Rs.3,025 in 2 years and Rs.3,327.5 in 3 years, interest compounded annually. The sum and the rate of interest p.a. are respectively:", o: ["2,800 & 9%", "2,200 & 10%", "2,000 & 8.5%", "2,500 & 10%"], a: 3, topic: "Compound Interest", sub: "Munni Method CI", exam: ""},
  {q: "A certain amount of money becomes thrice in 5 years at compound interest. How many years will it take to become 9 times?", o: ["15 years", "8 years", "10 years", "25 years"], a: 2, topic: "Compound Interest", sub: "N Times CI", exam: ""},
  {q: "Money is doubled in a bank account in 7 years, when the interest is compounded annually. What time in years is needed to make an amount 8 times in the bank?", o: ["35 years", "28 years", "21 years", "14 years"], a: 2, topic: "Compound Interest", sub: "N Times CI", exam: ""},
  {q: "If at same rate of interest, in 2 years, the simple interest is Rs.56 and compound interest is Rs.72, then what is the principal (in Rs.)?", o: ["53", "42", "49", "44"], a: 2, topic: "Compound Interest", sub: "SI vs CI", exam: ""},
  {q: "A man invested a total of ₹12,050 in two parts, one at 10% p.a. simple interest for 2 years and the other at the same rate at compound interest, interest being compounded annually, for the same time. The amount he received from both the parts are equal. The sum (in ₹) invested at the compound interest is:", o: ["₹5,850", "₹6,000", "₹5,780", "₹5,800"], a: 1, topic: "Compound Interest", sub: "SI vs CI", exam: ""},
  {q: "Divide ₹66,300 between A and B in such a way that the amount that A receives after 8 years is equal to the amount that B receives after 10 years; with compound interest being compounded annually at a rate of 10% per annum.", o: ["A=₹35,200, B=₹31,100", "A=₹36,300, B=₹30,000", "A=₹37,000, B=₹29,300", "A=₹35,520, B=₹30,810"], a: 1, topic: "Compound Interest", sub: "Mixed CI", exam: ""},
  {q: "A sum of money becomes two times of itself in 8 years at simple interest, and it becomes four times of itself in 2 years at compound interest, when interest is compounded annually. Find the ratio of the rate of simple interest to the rate of compound interest offered per year.", o: ["2 : 3", "3 : 5", "3 : 5", "1 : 8"], a: 3, topic: "Compound Interest", sub: "SI vs CI", exam: ""},
  {q: "If at same rate of interest, in 2 years, the simple interest is ₹60 and compound interest is ₹64, then what is the principal (in ₹)?", o: ["218", "220", "225", "229"], a: 2, topic: "Compound Interest", sub: "SI vs CI", exam: ""},
  {q: "Joseph deposited a total of ₹52,500 in a bank in the names of his two daughters aged 15 years and 16 years in such a way that they would get equal amounts when they become 18 years old. If the bank gives 10% compound interest compounded annually, then what is the amount (in ₹) that Joseph had deposited in the name of his younger daughter?", o: ["25,500", "26,000", "24,500", "25,000"], a: 3, topic: "Compound Interest", sub: "Mixed CI", exam: ""},
];

// Build dedup set from existing questions
const existing = new Set();
data.questions.forEach(q => {
  const key = q.question.toLowerCase().replace(/[₹`\s]+/g, ' ').trim().slice(0, 80);
  existing.add(key);
});

const seen = new Set();
const now = new Date().toISOString();
const baseId = Date.now();
let added = 0, skipped = 0;
let siCount = 0, ciCount = 0;

questions.forEach((item, i) => {
  const key = item.q.toLowerCase().replace(/[₹`\s]+/g, ' ').trim().slice(0, 80);
  if (existing.has(key) || seen.has(key)) {
    skipped++;
    console.log(`  SKIP (dupe): ${item.q.slice(0, 60)}...`);
    return;
  }
  seen.add(key);

  if (item.topic === "Simple Interest") siCount++;
  else ciCount++;

  data.questions.push({
    id: `${baseId}_sici_${i + 1}`,
    type: "question",
    examFamily: "ssc",
    subject: "quant",
    difficulty: "medium",
    tier: "tier1",
    questionMode: "objective",
    topic: item.topic,
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
    subtopic: item.sub || item.topic,
    source: {
      kind: "pyq",
      fileName: item.exam || "Maths by Aditya Ranjan - SI & CI",
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

data.updatedAt = now;
fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));

console.log(`\n=== SI & CI Import Summary ===`);
console.log(`Total parsed: ${questions.length}`);
console.log(`Unique new: ${added} (SI: ${siCount}, CI: ${ciCount})`);
console.log(`Skipped (dupes): ${skipped}`);
console.log(`Total questions in bank: ${data.questions.length}`);
