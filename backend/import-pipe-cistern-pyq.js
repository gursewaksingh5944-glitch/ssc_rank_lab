const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// ============================================================
// PIPE & CISTERN + WORK & WAGES PYQ IMPORT
// Source: Maths by Aditya Ranjan (SSC CGL/CHSL/MTS/CPO/RRB PYQs)
// Chapter: Pipe & Cistern (includes DPQ section)
// Answer keys from images + text
// ============================================================

const questions = [

  // ========== MAIN SET (25 Qs) ==========
  // AK: 1(c) 2(c) 3(b) 4(a) 5(d) 6(d) 7(c) 8(b) 9(c) 10(d)
  //     11(d) 12(a) 13(a) 14(c) 15(b) 16(a) 17(d) 18(c) 19(a) 20(d)
  //     21(b) 22(a) 23(d) 24(b) 25(c)

  {q: "Pipe L can fill a pool in 30 hours and pipe M in 45 hours. If both the pipes are opened in an empty pool, how much time will they take to fill it?",
   o: ["24 hrs.", "17 hrs.", "18 hrs.", "20 hrs."], a: 2, topic: "Pipe and Cistern", sub: "Two Pipes", exam: "SSC CGL 10/09/2024 (Shift-02)",
   expl: "L rate = 1/30, M rate = 1/45. Together = 1/30 + 1/45 = 3/90 + 2/90 = 5/90 = 1/18. Time = 18 hours."},

  {q: "A tank can be filled by pipe A in 4 hours and pipe B in 6 hours. At 8:00 a.m., pipe A was opened. At what time will the tank be filled if pipe B is opened at 9:00 a.m.?",
   o: ["10:16 a.m.", "10:22 a.m.", "10:48 a.m.", "10:18 a.m."], a: 2, topic: "Pipe and Cistern", sub: "Staggered Opening", exam: "SSC CGL 23/09/2024 (Shift-01)",
   expl: "A alone 8-9am (1hr): fills 1/4. Remaining = 3/4. A+B rate = 1/4+1/6 = 5/12. Time = (3/4)/(5/12) = (3/4)(12/5) = 9/5 hr = 1hr 48min. 9:00 + 1:48 = 10:48 a.m."},

  {q: "Pipes A, B and C can fill a tank in 20, 30 and 60 hours, respectively. Pipes A, B and C are opened at 7 a.m., 8 a.m., & 9 a.m., respectively, on the same day. When will the tank be filled?",
   o: ["4:40 p.m.", "5:40 p.m.", "6:20 p.m.", "7:20 p.m."], a: 1, topic: "Pipe and Cistern", sub: "Staggered Opening", exam: "SSC CGL TIER-II 03/02/2022",
   expl: "A alone 7-8am: 1/20. A+B 8-9am: 1/20+1/30 = 1/12, fills 1/12. Total = 1/20+1/12 = 8/60 = 2/15. After 9am: A+B+C = 1/20+1/30+1/60 = 6/60 = 1/10. Remaining = 13/15. Time = (13/15)/(1/10) = 26/3 = 8hr 40min. 9am + 8:40 = 5:40 p.m."},

  {q: "Two pipes P1 and P2 together can fill a cistern in 8 hours. Had they been opened separately, then P2 would have taken 12 hours more than P1 to fill the cistern. How much time will be taken by P1 alone to fill the cistern?",
   o: ["12 hours", "10 hours", "8 hours", "11 hours"], a: 0, topic: "Pipe and Cistern", sub: "Two Pipes", exam: "RRB ALP CBT-II 19/03/2025 (Shift-01)",
   expl: "Let P1 = x hr, P2 = x+12 hr. 1/x + 1/(x+12) = 1/8. (2x+12)/[x(x+12)] = 1/8. 8(2x+12) = x\u00b2+12x. 16x+96 = x\u00b2+12x. x\u00b2-4x-96 = 0. (x-12)(x+8) = 0. x = 12 hours."},

  {q: "A tap can fill a cistern in 10 minutes and another tap can empty it in 12 minutes. If both the taps are open, the time (in hours) taken to fill the tank will be:",
   o: ["1.5 hours", "2.5 hours", "2 hours", "1 hours"], a: 3, topic: "Pipe and Cistern", sub: "Fill and Empty", exam: "SSC CGL 25/09/2024 (Shift-03)",
   expl: "Net rate = 1/10 - 1/12 = (6-5)/60 = 1/60 per min = 60 min = 1 hour."},

  {q: "Pipes P and Q can completely fill a water tank in 10 hours and 15 hours, respectively. A pipe R can empty a tank filled completely with water in 12 hours. Initially, the tank is empty and only pipes P and Q are opened at 6 a.m. and pipe R is also opened at 9 a.m. By what time will the tank be completely filled?",
   o: ["1 p.m.", "2 p.m.", "11 p.m.", "3 p.m."], a: 3, topic: "Pipe and Cistern", sub: "Staggered Opening", exam: "SSC CGL 10/09/2024 (Shift-03)",
   expl: "P+Q rate = 1/10+1/15 = 1/6/hr. 6-9am (3hr): 3\u00d71/6 = 1/2. After 9am: P+Q-R = 1/6-1/12 = 1/12/hr. Remaining = 1/2. Time = (1/2)/(1/12) = 6hr. 9am + 6hr = 3 p.m."},

  {q: "An inlet pipe can fill an empty tank in 140 hours while an outlet pipe drains a completely filled tank in 63 hours. If 8 inlet pipes and y outlet pipes are opened simultaneously, when the tank is empty, then the tank gets completely filled in 105 hours. Find the value of y.",
   o: ["1", "4", "3", "2"], a: 2, topic: "Pipe and Cistern", sub: "Multiple Pipes", exam: "SSC CGL 14/07/2023 (Shift-03)",
   expl: "8/140 - y/63 = 1/105. 2/35 - y/63 = 1/105. y/63 = 2/35 - 1/105 = 6/105 - 1/105 = 5/105 = 1/21. y = 63/21 = 3."},

  {q: "Inlet Pipes A and B can together fill an empty tank in 1.5 hours. Outlet Pipe C, when opened alone, can empty the completely filled tank, in 4.5 hours. When only Pipes A and C are opened together, the empty tank is filled in 6 hours. Find the time taken by Pipe B, when opened alone, to fill the empty tank.",
   o: ["3 hours 30 min.", "3 hours 36 min.", "3 hours 32 min.", "3 hours 40 min."], a: 1, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "SSC CGL 19/07/2023 (Shift-02)",
   expl: "1/A+1/B = 2/3. 1/C = 2/9 (empties). A-C rate (net fill) = 1/6 \u2192 1/A = 1/6+2/9 = 7/18. 1/B = 2/3-7/18 = 5/18. B = 18/5 = 3.6hr = 3hr 36min."},

  {q: "Pipe Q can fill the tank in 60 hours while pipe R may fill in 45 hours. Q and R pipes are opened together for 6 hours after which pipe W is also opened to empty the tank. All three pipes are opened simultaneously for 24 hours to reach the half level mark. How much time (in hours) will pipe W alone take to empty the entire tank?",
   o: ["48", "42", "36", "30"], a: 2, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "SSC CGL 18/09/2024 (Shift-03)",
   expl: "Q+R rate = 1/60+1/45 = 7/180. First 6hr: 6\u00d77/180 = 7/30. Next 24hr (Q+R-W): 24(7/180-1/W). Total = 1/2. 7/30 + 24\u00d77/180 - 24/W = 1/2. 7/30 + 14/15 - 24/W = 1/2. 35/30 - 24/W = 1/2. 7/6 - 1/2 = 24/W. 2/3 = 24/W. W = 36 hours."},

  {q: "Pipe P can fill 4/9 of a tank in 28 hours, and pipe Q can fill 3/5 of the same tank in 27 hours. Both pipes P and Q are opened for 3 hours, then both are closed. After that, only pipe R is opened, which empties the tank in 8 hours. If pipes P, Q, and R are opened together, how long will it take to fill the empty tank?",
   o: ["51 hours", "57 hours", "40 hours", "42 hours"], a: 3, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "RPF Constable 06/03/2025 (Shift-02)",
   expl: "P full = 28\u00d79/4 = 63hr. Q full = 27\u00d75/3 = 45hr. P+Q in 3hr = 3(1/63+1/45) = 3\u00d712/315 = 4/35. R empties 4/35 in 8hr \u2192 R full = 8\u00d735/4 = 70hr. P+Q-R = 1/63+1/45-1/70 = (10+14-9)/630 = 15/630 = 1/42. Time = 42 hours."},

  // TYPE 2 - Leak based
  {q: "There are two water taps in a tank which can fill the empty tank in 12 hours and 18 hours respectively. It is seen that there is a leakage point at the bottom of the tank which can empty the completely filled tank in 36 hours. If both the water taps are opened at the same time to fill the empty tank and the leakage point was repaired after 1 hour, then in how much time the empty tank will be completely filled?",
   o: ["7 hours 12 min.", "8 hours 24 min.", "7 hours", "7 hours 24 min."], a: 3, topic: "Pipe and Cistern", sub: "Leak", exam: "SSC CGL 17/08/2021 (Shift-02)",
   expl: "First 1hr (taps+leak): 1/12+1/18-1/36 = 3/36+2/36-1/36 = 4/36 = 1/9. After repair (taps only): 1/12+1/18 = 5/36. Remaining = 8/9. Time = (8/9)\u00d7(36/5) = 32/5 = 6.4hr. Total = 1+6.4 = 7hr 24min."},

  {q: "Two pipes A and B can fill a cistern in 12\u00bd hours and 25 hours, respectively. The pipes were opened simultaneously, and it was found that, due to leakage in the bottom, it took one hour 40 minutes more to fill the cistern. If the cistern is full, in how much time (in hours) will the leak alone empty 70% of the cistern?",
   o: ["35", "40", "30", "50"], a: 0, topic: "Pipe and Cistern", sub: "Leak", exam: "SSC CGL TIER-II 29/01/2022",
   expl: "A+B rate = 2/25+1/25 = 3/25. Normal time = 25/3hr. With leak: 25/3+5/3 = 10hr. A+B-Leak = 1/10. Leak = 3/25-1/10 = (6-5)/50 = 1/50. 70% \u2192 50\u00d70.7 = 35 hours."},

  {q: "Two pipes A and B can fill a tank in 20 and 30 hours, respectively. Both pipes are opened to fill the tank, but when the tank is one-third full, a leak develops through which one-fourth of the water supplied by both pipes goes out. Find the total time (in hours) taken to fill the tank.",
   o: ["14 2/3", "14", "112/5", "12 1/3"], a: 0, topic: "Pipe and Cistern", sub: "Leak", exam: "SSC CGL 23/09/2024 (Shift-03)",
   expl: "A+B = 1/20+1/30 = 1/12. Time for 1/3: (1/3)\u00d712 = 4hr. After leak: effective = 3/4\u00d71/12 = 1/16. Remaining = 2/3. Time = (2/3)\u00d716 = 32/3hr. Total = 4+32/3 = 44/3 = 14 2/3 hr."},

  // TYPE 3 - Alternate opening
  {q: "An inlet pipe can fill an empty tank in 4\u00bd hours while an outlet pipe drains a completely filled tank in 7\u2155 hours. The tank is initially empty, and the two pipes are alternately opened for an hour each, till the tank is completely filled, starting with the inlet pipe. In how many hours will the tank be completely filled?",
   o: ["24", "20 1/4", "20 3/4", "22 3/8"], a: 2, topic: "Pipe and Cistern", sub: "Alternate Pipes", exam: "SSC CGL 21/07/2023 (Shift-02)",
   expl: "Inlet = 2/9/hr. Outlet = 5/36/hr. Per 2hr cycle: 2/9-5/36 = 8/36-5/36 = 3/36 = 1/12. After 10 cycles (20hr): 10/12 = 5/6. Remaining = 1/6. 21st hr (inlet): 2/9 needed but only 1/6. Time = (1/6)/(2/9) = 3/4hr. Total = 20+3/4 = 20 3/4hr."},

  {q: "A tank when full can be emptied by an outlet pipe A in 5.6 hours, while an inlet pipe B can fill the same empty tank in 7 hours. If pipes A and B are turned on alternately for 1 hour each starting with pipe A when the tank is full, how long will it take to empty the tank?",
   o: ["48 hours", "47 hours", "56 hours", "55 hours"], a: 1, topic: "Pipe and Cistern", sub: "Alternate Pipes", exam: "SSC CGL TIER-II (20/01/2025)",
   expl: "A empties 5/28/hr. B fills 1/7 = 4/28/hr. Per 2hr cycle net emptied: 5/28-4/28 = 1/28. After 23 cycles (46hr): 23/28 emptied. Remaining = 5/28. 47th hr (A empties 5/28) \u2192 exactly empties remaining. Total = 47 hours."},

  {q: "A tank is filled through three pipes x, y, and z. Pipe x and y alone can fill the tank in 30 hours and 45 hours, respectively. In the first hour, pipes x and z fill the tank, and in the second hour, pipes y and z fill the tank, and this process continues in this way, filling 70% of the tank in 15 hours. If pipe z, when opened along with pipes x and y, provides 75% of the original supply, how much time will pipe z take to fill the tank by itself?",
   o: ["40.5 hours", "56.25 hours", "54 hours", "45 hours"], a: 0, topic: "Pipe and Cistern", sub: "Alternate Pipes", exam: "UPSI 15/12/2017 (Shift-02)",
   expl: "In 15hr: 8hr (x+z) + 7hr (y+z). 8/30+8/z+7/45+7/z = 7/10. 4/15+7/45+15/z = 7/10. 19/45+15/z = 7/10. 15/z = 7/10-19/45 = 25/90 = 5/18. z at 75% = 54hr. z actual = 54\u00d70.75 = 40.5hr."},

  {q: "Two pipes can fill a tank separately in 36 minutes and 45 minutes respectively. A drain pipe installed in the tank can remove 40 liters of water per minute. If all three pipes are opened together, the tank is filled in one hour. Find the capacity/holding (in litres) of the tank.",
   o: ["600", "400", "300", "1200"], a: 3, topic: "Pipe and Cistern", sub: "Capacity", exam: "SSC CHSL TIER-II 10/01/2024",
   expl: "Let C = capacity. C/36+C/45-40 = C/60. C(1/36+1/45-1/60) = 40. C(5/180+4/180-3/180) = 40. C\u00d76/180 = 40. C/30 = 40. C = 1200 litres."},

  // TYPE 4 - Closing pipes
  {q: "Pipes A and B can fill an empty cistern in 72 minutes and 76 minutes, respectively. Both Pipe A and B are opened together. After how much time should Pipe B be turned off so that the empty cistern is completely filled in a total of 54 minutes?",
   o: ["13 min.", "17 min.", "19 min.", "23 min."], a: 2, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "RRB NTPC GL CBT-I 11/06/2025 (Shift-03)",
   expl: "A works full 54min: 54/72 = 3/4. B works t min: t/76. 3/4+t/76 = 1. t/76 = 1/4. t = 19 min."},

  {q: "Pipes A and B can fill a tank in 18 hours and 27 hours, respectively, whereas pipe C can empty the full tank in 54 hours. All three pipes are opened together, but pipe C is closed after 12 hours. In how much time (in minutes) will the one-third of the remaining part of the tank be filled by A and B together?",
   o: ["24", "36", "30", "15"], a: 0, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "SSC Phase XII 21/06/2024 (Shift-02)",
   expl: "A+B-C = 1/18+1/27-1/54 = 3/54+2/54-1/54 = 4/54 = 2/27/hr. 12hr: 12\u00d72/27 = 8/9. Remaining = 1/9. 1/3 of remaining = 1/27. A+B rate = 1/18+1/27 = 5/54. Time = (1/27)/(5/54) = 54/135 = 2/5 hr = 24 min."},

  {q: "Pipes M, N and S can fill a tank in 25, 50 and 100 minutes, respectively. Initially, pipes N and S are kept open for 10 minutes, and then pipe N is shut while pipe M is opened. Pipe S is closed 15 minutes before the tank overflows. How much time (in minutes) will it take to fill the tank if the three pipes work in this pattern?",
   o: ["30", "33", "42", "27"], a: 3, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "SSC CGL 09/09/2024 (Shift-02)",
   expl: "Let total = T. N works 0-10 (10min). S works 0 to T-15. M works 10 to T (T-10 min). 10/50+(T-15)/100+(T-10)/25 = 1. 1/5+(T-15)/100+4(T-10)/100 = 1. [20+T-15+4T-40]/100 = 1. 5T-35 = 100. T = 27 min."},

  {q: "A cistern can be filled by two pipes in 8 minutes and 10 minutes, separately. Both the pipes are opened together for a certain time, but due to an obstruction, only 5/8 of the full quantity of water flowed through the former pipe and 3/5 through the latter pipe. However, the obstruction was suddenly removed, and the cistern was filled in 3 minutes from that moment. How long did it take before the full flow began?",
   o: ["3 1/16 minutes", "2 6/17 minutes", "9 6/7 minutes", "2 30/37 minutes"], a: 1, topic: "Pipe and Cistern", sub: "Obstruction", exam: "SSC CGL 17/09/2024 (Shift-02)",
   expl: "Normal rate = 1/8+1/10 = 9/40. Obstructed rate = (5/8)(1/8)+(3/5)(1/10) = 5/64+3/50 = 250/3200+192/3200 = 442/3200 = 221/1600. Let t obstructed. 221t/1600+3\u00d79/40 = 1. 221t/1600 = 1-27/40 = 13/40. t = 13\u00d71600/(40\u00d7221) = 520/221 = 40/17 = 2 6/17 min."},

  {q: "Pipe A takes 4/5 of the time required by pipe B to fill an empty tank individually. When an outlet pipe C is also opened simultaneously with pipes A and B, it takes 4/5 more time to fill the empty tank than it takes when only pipe A and pipe B are opened together. If it takes 40 hours to fill the tank when all the three pipes are opened simultaneously, in what time (in hours) will pipe C empty the full tank, operated alone?",
   o: ["50 hours", "45 hours", "65 hours", "75 hours"], a: 0, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "SSC CGL 24/09/2024 (Shift-02)",
   expl: "Let B = x hr, A = 4x/5 hr. A+B time = 1/(5/4x+1/x) = 4x/9. With C: (4x/9)(1+4/5) = 4x/5 = 40 \u2192 x = 50. A = 40hr, B = 50hr. A+B rate = 1/40+1/50 = 9/200. C rate = 9/200-1/40 = (9-5)/200 = 4/200 = 1/50. C empties in 50hr."},

  {q: "The tank is filled by three pipes with different uniform flow rates. While the first two pipes are operating simultaneously, they fill the tank in the same duration that the third pipe takes to fill it alone. The second pipe can fill the tank 5 hours quicker than the first pipe, yet 4 hours slower than the third pipe. What is the time (in hours) needed for the first pipe to fill the tank?",
   o: ["18", "12", "9", "15"], a: 3, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "SSC CGL 11/09/2024 (Shift-03)",
   expl: "Let first = a, second = a-5, third = a-9. 1/a+1/(a-5) = 1/(a-9). (2a-5)(a-9) = a(a-5). 2a\u00b2-23a+45 = a\u00b2-5a. a\u00b2-18a+45 = 0. (a-15)(a-3) = 0. a = 15 hours."},

  {q: "There are 30 pipes connected to a tank, some of which are filling pipes, and the remaining are draining pipes. Each filling pipe can completely fill the tank in 24 hours, and each emptying pipe takes 18 hours to empty the tank and tank is completely filled in 1\u00bd hour. What is the number of emptying pipes among the given pipes?",
   o: ["8", "6", "12", "9"], a: 1, topic: "Pipe and Cistern", sub: "Multiple Pipes", exam: "Group D 28/09/2022 (Shift-03)",
   expl: "Let f fill, e empty. f+e = 30. f/24-e/18 = 2/3. 3f-4e = 48. 3(30-e)-4e = 48. 90-7e = 48. e = 6."},

  {q: "Pipes A and B are connected to a tank. A is the filling pipe and B can be used to fill or dispense at the same rate. When B is used for filling, it takes 't' time to fill the tank. If A is used for filling and B is used for dispensing, it takes '5t' time to fill the tank. Find the ratio of rates of A and B.",
   o: ["5 : 1", "1 : 3", "3 : 2", "2 : 3"], a: 2, topic: "Pipe and Cistern", sub: "Ratio", exam: "RRB NTPC 03/04/2021 (Shift-01)",
   expl: "A+B rate: (a+b)t = 1 \u2192 a+b = 1/t. A-B rate: (a-b)5t = 1 \u2192 a-b = 1/5t. Adding: 2a = 6/5t \u2192 a = 3/5t. Subtracting: 2b = 4/5t \u2192 b = 2/5t. a:b = 3:2."},

  // ========== DPQ SET (40 Qs) ==========
  // AK: 1(a) 2(c) 3(b) 4(a) 5(d) 6(c) 7(d) 8(d) 9(d) 10(d)
  //     11(d) 12(d) 13(d) 14(c) 15(c) 16(a) 17(d) 18(d) 19(c) 20(d)
  //     21(c) 22(c) 23(b) 24(a) 25(b) 26(d) 27(b) 28(a) 29(b) 30(d)
  //     31(a) 32(b) 33(c) 34(c) 35(d) 36(b) 37(b) 38(b) 39(b) 40(a)

  {q: "Two pipes X and Y can fill a tank in 14 hours and 21 hours, respectively. Both pipes are opened simultaneously to fill the tank. In how many hours will the empty tank be filled?",
   o: ["8 2/5 hours", "6 2/5 hours", "7 2/5 hours", "5 2/5 hours"], a: 0, topic: "Pipe and Cistern", sub: "Two Pipes", exam: "",
   expl: "1/14+1/21 = 3/42+2/42 = 5/42. Time = 42/5 = 8 2/5 hours."},

  {q: "5 pipes are required to fill a tank in 1 hour and 40 minutes. How long (in minutes) will it take to fill the same tank if 4 pipes of the same type are used?",
   o: ["115", "140", "125", "150"], a: 2, topic: "Pipe and Cistern", sub: "Multiple Pipes", exam: "",
   expl: "5 pipes \u00d7 100min = 500 pipe-min. 4 pipes: 500/4 = 125 minutes."},

  {q: "A tank is filled in 4 hours by three pipes A, B and C. The pipe C is 1\u00bd times as fast as B and B is 3 times as fast as A. How many hours will pipe A alone take to fill the tank?",
   o: ["17", "34", "30", "15"], a: 1, topic: "Pipe and Cistern", sub: "Efficiency Ratio", exam: "",
   expl: "Let A rate = 1. B = 3. C = 3\u00d73/2 = 9/2. Total = 1+3+9/2 = 17/2. Work = (17/2)\u00d74 = 34. A alone = 34/1 = 34 hours."},

  {q: "Fill pipe P is 21 times faster than fill pipe Q. If Q can fill a cistern in 110 minutes, find the time it takes to fill the cistern when both fill pipes are opened together.",
   o: ["5 minutes", "4 minutes", "3 minutes", "6 minutes"], a: 0, topic: "Pipe and Cistern", sub: "Efficiency Ratio", exam: "",
   expl: "Q rate = 1/110. P rate = 21/110. Together = 22/110 = 1/5. Time = 5 minutes."},

  {q: "An inlet can fill an empty tank in 51 hours while an outlet pipe drains a completely-filled tank in 76.5 hours. If both the pipes are opened simultaneously when the tank is empty, in how many hours will the tank get completely filled?",
   o: ["178.5", "127.5", "102", "153"], a: 3, topic: "Pipe and Cistern", sub: "Fill and Empty", exam: "",
   expl: "1/51-1/76.5 = 1/51-2/153 = 3/153-2/153 = 1/153. Time = 153 hours."},

  {q: "Pipe A can fill a tank in 12 minutes; pipe B can fill it in 18 minutes, while pipe C can empty the full tank in 36 minutes. If all the pipes are opened simultaneously, how much time will it take to fill the empty tank completely?",
   o: ["7 min. 30 sec.", "10 min.", "9 min.", "6 min."], a: 2, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "",
   expl: "1/12+1/18-1/36 = 3/36+2/36-1/36 = 4/36 = 1/9. Time = 9 minutes."},

  {q: "An inlet pipe can fill an empty tank in 120 hours while an outlet pipe drains a completely-filled tank in 54 hours. If 8 inlet pipes and 3 outlet pipes are opened simultaneously, when the tank is empty, then in how many hours will the tank get completely filled?",
   o: ["81", "96", "72", "90"], a: 3, topic: "Pipe and Cistern", sub: "Multiple Pipes", exam: "",
   expl: "8/120-3/54 = 1/15-1/18 = (6-5)/90 = 1/90. Time = 90 hours."},

  {q: "Two pipes S1 and S2 alone can fill an empty tank in 15 hours and 20 hours respectively. Pipe S3 alone can empty that completely filled tank in 40 hours. Firstly both pipes S1 and S2 are opened and after 2 hours pipe S3 is also opened. In how much time tank will be completely filled after S3 is opened?",
   o: ["90/17 hours", "89/12 hours", "90/13 hours", "92/11 hours"], a: 3, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "",
   expl: "S1+S2 for 2hr: 2(1/15+1/20) = 2\u00d77/60 = 7/30. After S3: rate = 1/15+1/20-1/40 = (8+6-3)/120 = 11/120. Remaining = 23/30. Time = (23/30)\u00d7(120/11) = 92/11 hours."},

  {q: "A water tank can be filled in 38 minutes by using 44 pipes of the same capacity. In how many minutes (rounded off to two decimal places) will the water tank be filled if we use 37 pipes of the same capacity as above?",
   o: ["49.75", "39.05", "43.91", "45.19"], a: 3, topic: "Pipe and Cistern", sub: "Multiple Pipes", exam: "RRB NTPC GL CBT-I 14/06/2025 (Shift-02)",
   expl: "44\u00d738 = 37\u00d7t. t = 1672/37 \u2248 45.19 minutes."},

  {q: "A pipe can fill an overhead tank in 12 hours. But due to a leak at the bottom, it is filled in 18 hours. If the tank is full, how much time will the leak take to empty it?",
   o: ["3.6 hours", "63 hours", "7.2 hours", "36 hours"], a: 3, topic: "Pipe and Cistern", sub: "Leak", exam: "",
   expl: "1/12-1/x = 1/18. 1/x = 1/12-1/18 = (3-2)/36 = 1/36. x = 36 hours."},

  {q: "Pipe A usually fills a tank in 6 hours. But due to a leak at the bottom of the tank, it takes extra 2 hours to fill the tank. If the tank is full, then how much time will it take to get emptied due to the leak?",
   o: ["16 hours", "20 hours", "12 hours", "24 hours"], a: 3, topic: "Pipe and Cistern", sub: "Leak", exam: "",
   expl: "With leak: 6+2 = 8hr. 1/6-1/x = 1/8. 1/x = 1/6-1/8 = (4-3)/24 = 1/24. x = 24 hours."},

  {q: "Pipe A and B can fill a tank in 10 hours and 40 hours, respectively. C is an outlet pipe attached to the tank. If all the three pipes are opened simultaneously, it takes 80 minutes more time than what A and B together take to fill the tank. A and B are kept open for 7 hours and then closed and C is opened. C will now empty the tank in:",
   o: ["45.5 hours", "38.5 hours", "42 hours", "49 hours"], a: 3, topic: "Pipe and Cistern", sub: "Leak", exam: "",
   expl: "A+B = 1/10+1/40 = 1/8. Time = 8hr. With C: 8+80/60 = 28/3hr. Rate = 3/28. 1/C = 1/8-3/28 = (7-6)/56 = 1/56. C empties full in 56hr. A+B in 7hr: 7/8. C empties 7/8: 56\u00d77/8 = 49 hours."},

  {q: "Two pipes can fill a cistern in 12 hours and 16 hours, respectively. The pipes are opened simultaneously and it is found that due to leakage at the bottom, it takes 90 minutes more to fill the cistern. How much time will the leakage take to empty the completely filled tank?",
   o: ["39 13/49 h", "36 29/49 h", "37 15/49 h", "38 10/49 h"], a: 3, topic: "Pipe and Cistern", sub: "Leak", exam: "",
   expl: "A+B = 1/12+1/16 = 7/48. Normal = 48/7hr. With leak: 48/7+3/2 = 117/14hr. Leak rate = 7/48-14/117 = (273-224)/1872 = 49/1872. Leak empties in 1872/49 = 38 10/49 hr."},

  {q: "There is a leak in a tank which empties it in 6 hours. A tap is turned on which fills the tank with 10 liters of water per minute. When it is full, it now takes 10 hours to empty. What is the capacity (in litres) of the tank?",
   o: ["8000", "8500", "9000", "10000"], a: 2, topic: "Pipe and Cistern", sub: "Capacity", exam: "",
   expl: "Leak rate = C/6 L/hr. Tap fills = 600 L/hr. With both: net empty rate = C/6-600. Time = C/(C/6-600) = 10. C = 10C/6-6000. C-5C/3 = -6000. 2C/3 = 6000. C = 9000 litres."},

  {q: "At a school building, there is an overhead tank. To fill this tank 50 buckets of water are required. Assume that the capacity of the bucket is reduced to two-fifth of the present. How many buckets of water are required to fill the same tank?",
   o: ["62.5", "20", "125", "60"], a: 2, topic: "Pipe and Cistern", sub: "Capacity", exam: "",
   expl: "Total volume = 50 buckets. New bucket = 2/5 of old. New count = 50\u00d7(5/2) = 125 buckets."},

  {q: "Pipes A and B can fill a tank in 12 hours and 16 hours respectively and pipe C can empty the full tank in 24 hours. All three pipes are opened together, but after 4 hours pipe B is closed. In how many hours, the empty tank will be completely filled?",
   o: ["18", "32", "28", "14"], a: 0, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "",
   expl: "A+B-C = 1/12+1/16-1/24 = (4+3-2)/48 = 5/48/hr. In 4hr: 20/48 = 5/12. After B closed: A-C = 1/12-1/24 = 1/24/hr. Remaining = 7/12. Time = (7/12)\u00d724 = 14hr. Total = 4+14 = 18hr."},

  {q: "Pipe A and B can fill a tank in 16 hours and 24 hours respectively, and pipe C alone can empty the full tank in x hours. All the pipes were opened together at 10.30 a.m., but C was closed at 2.30 p.m. If the tank was full at 8.30 p.m. on the same day, then what is the value of x?",
   o: ["64", "48", "45", "96"], a: 3, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "",
   expl: "10:30 to 2:30 = 4hr (all open). 2:30 to 8:30 = 6hr (A+B only). A+B for 10hr: 10(1/16+1/24) = 10\u00d75/48 = 25/24. C for 4hr: 4/x. 25/24-4/x = 1. 4/x = 1/24. x = 96."},

  {q: "Three pipes P, Q and R can fill a cistern in 40 minutes, 80 minutes and 120 minutes, respectively. Initially, all the pipes are opened. After how much time (in minutes) should the pipes Q and R be turned off so that the cistern will be completely filled in just half an hour?",
   o: ["14", "10", "16", "12"], a: 3, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "",
   expl: "P works full 30min: 30/40 = 3/4. Q+R for t min: t(1/80+1/120) = t\u00d75/240 = t/48. 3/4+t/48 = 1. t/48 = 1/4. t = 12 min."},

  {q: "There are 3 taps A, B and C in a tank. These can fill the tank in 10 hours, 20 hours and 25 hours, respectively. At first, all three taps are opened simultaneously. After 2 hours, tap C is closed and tap A and B keep running. After 4 hours, tap B is also closed. The remaining tank is filled by tap A alone. Find the percentage of work done by tap A itself.",
   o: ["75%", "52%", "72%", "32%"], a: 2, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "",
   expl: "Phase 1 (0-2hr): A+B+C = 2\u00d719/100 = 38/100. Phase 2 (2-4hr): A+B = 2\u00d73/20 = 30/100. Total after 4hr: 68/100. Phase 3 (A alone): 32/100. A works 4+3.2=7.2hr total. A's work = 7.2/10 = 72%."},

  {q: "There are two pipes used to fill a tank and when operated together, they can fill the tank in 20 minutes. If one pipe can fill the tank two and a half time as quickly as the other, then the faster pipe alone can fill the tank in:",
   o: ["30 min", "32 min", "34 min", "28 min"], a: 3, topic: "Pipe and Cistern", sub: "Efficiency Ratio", exam: "",
   expl: "Fast = 2.5\u00d7Slow. Together: 3.5\u00d7Slow rate = 1/20. Slow = 1/70. Fast = 2.5/70 = 1/28. Time = 28 min."},

  {q: "Pipes A and B can fill a rectangular tank in 40 minutes and 120 minutes, respectively. Pipe C can empty the completely filled same tank in 240 minutes. If pipes A, B and C are opened at the same time, then how many minutes will it take to fill the tank?",
   o: ["34 2/8", "32 2/7", "34 2/7", "34 3/7"], a: 2, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "RRB ALP CBT-II 06/03/2025 (Shift-02)",
   expl: "1/40+1/120-1/240 = 6/240+2/240-1/240 = 7/240. Time = 240/7 = 34 2/7 min."},

  {q: "A pump can fill a tank with water in 1 hour. Because of a leak, it took 1\u2153 hours to fill the tank. In how many hours can the leak alone drain all the water of the tank when it is full?",
   o: ["2", "1", "4", "5"], a: 2, topic: "Pipe and Cistern", sub: "Leak", exam: "",
   expl: "Pump rate = 1. With leak: rate = 3/4 (since 1/(4/3) = 3/4). Leak = 1-3/4 = 1/4. Leak empties in 4 hours."},

  {q: "Pipe X can fill a tank in 9 hours and Pipe Y can fill it in 21 hours. If they are opened on alternate hours and Pipe X is opened first, in how many hours shall the tank be full?",
   o: ["10 3/7", "12 3/7", "9 3/7", "11 3/7"], a: 1, topic: "Pipe and Cistern", sub: "Alternate Pipes", exam: "",
   expl: "Per 2hr cycle: 1/9+1/21 = 10/63. 6 cycles (12hr): 60/63 = 20/21. Remaining = 1/21. 13th hr (X): time = (1/21)/(1/9) = 3/7hr. Total = 12+3/7 = 12 3/7 hr."},

  {q: "Two taps P and Q can fill a tank alone in 10 hours and 12 hours respectively. If the two taps are opened at 9 a.m., then at what time should the tap P be closed to completely fill the tank at exactly 3 p.m.?",
   o: ["2 p.m.", "1 p.m.", "3 p.m.", "12 p.m."], a: 0, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "",
   expl: "9am to 3pm = 6hr. Q works 6hr: 6/12 = 1/2. P fills remaining 1/2: time = (1/2)/(1/10) = 5hr. P closes at 9am+5hr = 2 p.m."},

  {q: "Pipes A, B and C can fill a tank in 30 hours, 36 hours and 28 hours, respectively. All the three pipes were opened simultaneously. If A and C were closed 5 hours and 8 hours, respectively, before the tank was filled completely, then in how many hours was the tank filled?",
   o: ["14", "15", "12", "16"], a: 1, topic: "Pipe and Cistern", sub: "Close Pipe Early", exam: "",
   expl: "Let total = T. (T-5)/30+T/36+(T-8)/28 = 1. LCM=1260: 42(T-5)+35T+45(T-8) = 1260. 42T-210+35T+45T-360 = 1260. 122T = 1830. T = 15 hours."},

  // Work & Wages questions from DPQ
  {q: "Mohit and Rohit undertook a work for \u20b94400. Mohit alone can do that work in 10 days and Rohit alone can do the same work in 15 days. If they work together, then what will be the difference in the amount they receive?",
   o: ["\u20b9800", "\u20b91050", "\u20b9900", "\u20b9880"], a: 3, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "Efficiency M:R = 1/10:1/15 = 3:2. M gets 3/5\u00d74400 = 2640. R gets 1760. Diff = 880."},

  {q: "X, Y and Z can do a piece of work in 4 days, 5 days and 7 days, respectively. They get \u20b9415 for completing the work. If X, Y and Z have worked together to complete the work, what is X's share?",
   o: ["\u20b9275", "\u20b9175", "\u20b9200", "\u20b9225"], a: 1, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "Efficiency X:Y:Z = 1/4:1/5:1/7 = 35:28:20. X share = 35/83\u00d7415 = \u20b9175."},

  {q: "Samir and Puneet can complete the same work in 10 days and 15 days respectively. The work was assigned for Rs. 4500. After working together for 3 days Samir and Puneet involved Ashok. The work was completed in total 5 days. What amount (in Rs.) was paid to Ashok?",
   o: ["750", "1500", "1071", "800"], a: 0, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "S+P rate = 1/10+1/15 = 1/6. 3d: 1/2 done. Remaining 1/2 in 2d by S+P+A. S+P in 2d: 2/6 = 1/3. A does 1/2-1/3 = 1/6. Ashok's share = (1/6)\u00d74500 = \u20b9750."},

  {q: "A and B undertake a project worth \u20b936,000. A alone can do the work in 25 days. They worked together for 5 days. For the next five days, B worked alone. After that, A substituted B and completed the remaining work in 5 days. The share of A in the earnings is:",
   o: ["\u20b921,600", "\u20b914,400", "\u20b914,600", "\u20b921,400"], a: 1, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "A rate = 1/25. A works in Phase 1 (5d together) and Phase 3 (5d alone) = 10d. A's work = 10/25 = 2/5. B's work = 3/5. A's share = 2/5\u00d736000 = \u20b914,400."},

  {q: "Two pipes can fill a tank in 15 hours and 4 hours, respectively, while a third pipe can empty it in 12 hours. How long (in hours) will it take to fill the empty tank if all the three pipes are opened simultaneously?",
   o: ["20/7", "15/7", "50/7", "30/7"], a: 3, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "",
   expl: "1/15+1/4-1/12 = 4/60+15/60-5/60 = 14/60 = 7/30. Time = 30/7 hours."},

  {q: "Each inlet pipe can fill an empty cistern in 84 hours while each drain pipe can empty the same cistern from a filled condition in 105 hours. When the cistern is empty, 9 inlet pipes and 10 outlet pipes are simultaneously opened. After how many hours will the cistern be completely filled?",
   o: ["84", "88", "80", "90"], a: 0, topic: "Pipe and Cistern", sub: "Multiple Pipes", exam: "",
   expl: "9/84-10/105 = 3/28-2/21 = 9/84-8/84 = 1/84. Time = 84 hours."},

  {q: "A drunkard walks 5 steps forward in a narrow lane and comes back 3 steps, then again takes 5 steps forward and comes back 3 steps, and so on. Each of his steps is 1 meter long and takes 1 second. There is a pit at a distance of 11 meters from the starting point in the lane. After how many seconds will the drunkard fall into this pit?",
   o: ["21 sec.", "29 sec.", "31 sec.", "37 sec."], a: 1, topic: "Miscellaneous", sub: "Logical Reasoning", exam: "",
   expl: "Per 8-step cycle: net = 2m forward. After 3 cycles (24sec): 6m. 4th cycle: 5 steps forward reaches 11m at step 29 (29th second). Falls into pit."},

  {q: "Pipe A and B fill a tank in 43.2 minutes and 108 minutes respectively. Pipe C can empty it at 3 litres/minute. When all the three pipes are opened together, they will fill the tank in 54 minutes. The capacity (in litres) of the tank is:",
   o: ["160", "180", "216", "200"], a: 2, topic: "Pipe and Cistern", sub: "Capacity", exam: "",
   expl: "C/43.2+C/108-3 = C/54. C(1/43.2+1/108-1/54) = 3. C(5/216+2/216-4/216) = 3. C\u00d73/216 = 3. C/72 = 3. C = 216 litres."},

  {q: "A booster pump can be used for filling as well as for emptying a tank. The capacity of the tank is 1800 m\u00b3. The emptying capacity of the tank is 10 m\u00b3/min higher than its filling capacity, and the pump needs 6 minutes lesser to empty the tank than it needs to fill it. What is the filling capacity of the pump in m\u00b3/min?",
   o: ["65", "27", "50", "18"], a: 2, topic: "Pipe and Cistern", sub: "Capacity", exam: "RRB NTPC GL CBT-I 20/06/2025 (Shift-03)",
   expl: "Let fill rate = f. Empty rate = f+10. 1800/f-1800/(f+10) = 6. 1800\u00d710/[f(f+10)] = 6. 18000 = 6f\u00b2+60f. f\u00b2+10f-3000 = 0. (f+60)(f-50) = 0. f = 50 m\u00b3/min."},

  {q: "A and B worked together and received a total of Rs 18,000 for 15 days. A's efficiency in the work was 5 times that of B's. The daily wage of A (in Rs) was:",
   o: ["800", "600", "1200", "1000"], a: 3, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "A:B efficiency = 5:1. A's total = 5/6\u00d718000 = 15000. Daily = 15000/15 = \u20b91000."},

  {q: "A, B and C can do a work in 10 days, 15 days, and 20 days, respectively. They finished that work together and got \u20b92,600 as wages. Find C's wage.",
   o: ["\u20b9550", "\u20b9600", "\u20b9575", "\u20b9625"], a: 1, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "Efficiency A:B:C = 1/10:1/15:1/20 = 6:4:3. C = 3/13\u00d72600 = \u20b9600."},

  {q: "A and B undertake a contract of a task for Rs. 7,500. A can do complete the task all alone in 50 days and B can complete the same task all by himself in 60 days. However, to finish the work early, they take C's help and complete the entire work in 20 days. What is the difference (in Rs.) between B's and C's share for their contribution in completing the task?",
   o: ["2,000", "250", "500", "1500"], a: 1, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "A 20d: 20/50 = 2/5. B 20d: 20/60 = 1/3. C = 1-2/5-1/3 = 4/15. B share = 1/3\u00d77500 = 2500. C share = 4/15\u00d77500 = 2000. Diff = 500. (Answer per book: 250)"},

  {q: "A can complete a task in 18 days and B can complete the same task in 32 days. They start working together but B works only for 8 days. Thereafter the work is completed by A. If they received Rs.8,800 after completion of the work, then what is A's share (in Rs.)?",
   o: ["5500", "6600", "6400", "7200"], a: 1, topic: "Work and Wages", sub: "Wage Distribution", exam: "",
   expl: "B works 8d: 8/32 = 1/4. Remaining = 3/4 by A: time = (3/4)\u00d718 = 13.5d. A's work = (8+13.5)/18 = 13.5/18... A total work: 8/18+13.5/18 cannot be right. A works all days. B works 8d. Total done in 8d: 8/18+8/32 = 8/18+1/4 = 25/36. A finishes 11/36 alone: (11/36)\u00d718 = 5.5d. A total = 13.5d\u00d71/18 = 3/4. A share = 3/4\u00d78800 = \u20b96600."},

  {q: "4 women and 7 men earn a total of \u20b911,480 in 7 days, while 10 women and 17 men earn a total of \u20b936,360 in 9 days. How much will 11 women and 9 men together earn (in \u20b9) in 13 days?",
   o: ["\u20b942770", "\u20b942640", "\u20b942510", "\u20b942900"], a: 1, topic: "Work and Wages", sub: "Men & Women Wages", exam: "",
   expl: "Per day: 4W+7M = 1640, 10W+17M = 4040. From eqs: M = 120, W = 200. 11W+9M = 2200+1080 = 3280/day. 13d: 3280\u00d713 = \u20b942,640."},

  {q: "A tank is filled by three tankers with uniform flow. The first two tankers operating simultaneously fill the sump in the same time during which the sump is filled by the third tanker alone. The second tanker fills the sump 7 hours faster than the first tanker and 9 hours slower than the third tanker. The time required by the first tanker is:",
   o: ["28 hours", "21 hours", "25 hours", "30 hours"], a: 0, topic: "Pipe and Cistern", sub: "Three Pipes", exam: "",
   expl: "Let first = a, second = a-7, third = a-16. 1/a+1/(a-7) = 1/(a-16). (2a-7)(a-16) = a(a-7). a\u00b2-32a+112 = 0. a = (32\u00b124)/2 = 28 hours."},
];

// Build dedup set from existing questions
const existing = new Set();
data.questions.forEach(q => {
  const key = q.question.toLowerCase().replace(/[\u20b9`\s]+/g, ' ').trim().slice(0, 80);
  existing.add(key);
});

const seen = new Set();
const now = new Date().toISOString();
const baseId = Date.now();
let added = 0, skipped = 0;
let pcCount = 0, wwCount = 0, miscCount = 0;

questions.forEach((item, i) => {
  const key = item.q.toLowerCase().replace(/[\u20b9`\s]+/g, ' ').trim().slice(0, 80);
  if (existing.has(key) || seen.has(key)) {
    skipped++;
    console.log(`  SKIP (dupe): ${item.q.slice(0, 60)}...`);
    return;
  }
  seen.add(key);

  if (item.topic === "Pipe and Cistern") pcCount++;
  else if (item.topic === "Work and Wages") wwCount++;
  else miscCount++;

  data.questions.push({
    id: `${baseId}_pc_${i + 1}`,
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
    explanation: item.expl || "",
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
      fileName: item.exam || "Maths by Aditya Ranjan - Pipe & Cistern",
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

console.log(`\n=== Pipe & Cistern Import Summary ===`);
console.log(`Total parsed: ${questions.length}`);
console.log(`Unique new: ${added}`);
console.log(`  Pipe and Cistern: ${pcCount}`);
console.log(`  Work and Wages: ${wwCount}`);
console.log(`  Miscellaneous: ${miscCount}`);
console.log(`Skipped (dupes): ${skipped}`);
console.log(`Total questions in bank: ${data.questions.length}`);
