const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// ============ SET 1: 40 Questions ============
// Answer Key: 1(b) 2(c) 3(d) 4(a) 5(d) 6(c) 7(d) 8(c) 9(c*) 10(d)
//            11(c) 12(b) 13(b) 14(a) 15(d*) 16(b) 17(a) 18(a) 19(b) 20(c)
//            21(b) 22(d) 23(d) 24(b) 25(c) 26(b) 27(a) 28(c) 29(a) 30(d)
//            31(d) 32(a) 33(b) 34(d) 35(b) 36(b) 37(c) 38(c) 39(c) 40(d)
// *Q9: key says (d)=12 but math gives 8=(c). Using (c).
// *Q15: key says (c)=27 but math gives 18=(d). Using (d).

const set1 = [
  {
    q: "Akhil can complete a work in 24 days. Shyam can complete the same work in 12 days. If both of them work together, in how many days can they complete the same work?",
    o: ["6 days", "8 days", "10 days", "12 days"],
    a: 1, tier: "tier1", sub: "Basic Combined Work", exam: "SSC CHSL 04/07/2024 (Shift-04)"
  },
  {
    q: "A can complete 1/3 of a work in 7 days and B can complete 2/7 of the same work in 10 days. In how many days can both A and B together complete the work?",
    o: ["12 3/8", "11 7/8", "13 1/8", "15 1/7"],
    a: 2, tier: "tier1", sub: "Basic Combined Work", exam: "SSC CGL 25/07/2023 (Shift-02)"
  },
  {
    q: "Sumit and Rajiv, working together, can do a work in 20 hours whereas Sumit alone can do the same work in 25 hours. In how many hours can Rajiv alone do the work?",
    o: ["70", "90", "80", "100"],
    a: 3, tier: "tier1", sub: "Basic Combined Work", exam: "SSC CPO 29/06/2024 (Shift-03)"
  },
  {
    q: "A and B complete a work in 18 days. If A alone can do it in 24 days, then B alone can do one-fourth of the same work in _______ days.",
    o: ["18", "72", "36", "54"],
    a: 0, tier: "tier1", sub: "Basic Combined Work", exam: "RRB NTPC GL CBT-I 19/06/2025 (Shift-03)"
  },
  {
    q: "A can do 20% of a work in 7 days and B can do 25% of the work in 7 days if they worked alone. How much of the work (in percentage) can they complete in 7 days if they worked together?",
    o: ["38%", "52%", "56%", "45%"],
    a: 3, tier: "tier1", sub: "Basic Combined Work", exam: "SSC CGL 17/07/2023 (Shift-04)"
  },
  {
    q: "Vipin can do a piece of work in 2 days; Vaibhav can do the same work in 3 days and Chirag can do the same work in 6 days. If they start working together, how many days will they take to complete the work?",
    o: ["3", "5", "1", "4"],
    a: 2, tier: "tier1", sub: "Basic Combined Work", exam: "SSC CPO 05/10/2023 (Shift-02)"
  },
  {
    q: "A can do 20% of a work in 4 days and B can do 33 1/3% of the same work in 10 days. They worked together for 9 days and then C finished the remaining work in 6 days. In how many days will B and C together complete 75% of the same work?",
    o: ["12 days", "9 days", "11 days", "10 days"],
    a: 3, tier: "tier1", sub: "Work and Leave", exam: "SSC CGL 21/07/2023 (Shift-03)"
  },
  {
    q: "A can do 1/3 of a work in 15 days, B can do 3/4 of the same work in 18 days and C can do the same work in 36 days. B and C work together for 8 days. In how many days will A alone complete the remaining work?",
    o: ["24 days", "18 days", "20 days", "16 days"],
    a: 2, tier: "tier2", sub: "Work and Leave", exam: "SSC CGL TIER-II (13/09/2019)"
  },
  {
    q: "A and B can do a piece of work in 10 days. B and C can do the same work in 12 days. C and A can do the same work in 15 days. If all the three work together, find the number of days required to complete the work.",
    o: ["6", "10", "8", "12"],
    a: 2, tier: "tier1", sub: "Basic Combined Work", exam: "SSC Phase XII 25/06/2024 (Shift-03)"
    // NOTE: Answer key says (d)=12, but math: 2(A+B+C)=1/10+1/12+1/15=1/4 → A+B+C=1/8 → 8 days=(c). Using correct (c).
  },
  {
    q: "A and B together can finish a piece of work in 12.5 days; B and C together can finish the same piece of work in 18.75 days, while C and A together can finish the same piece of work in 15 days. Taking along D, who is only 40% as efficient as C, in how many days will A, B, C and D together be able to finish the same piece of work?",
    o: ["9 1/3", "9 17/27", "9 2/3", "9 7/27"],
    a: 3, tier: "tier2", sub: "Efficiency Based", exam: "SSC CGL TIER-II 26/10/2023"
  },
  {
    q: "A can do a piece of work in 57 hours, B and C together can do it in 28 hours, while A and C together can do it in 19 hours. How long (in hours) will B alone take to do it?",
    o: ["1597", "1595", "1596", "1598"],
    a: 2, tier: "tier1", sub: "Basic Combined Work", exam: "RRB NTPC GL CBT-I 09/06/2025 (Shift-03)"
  },
  {
    q: "Virat can complete a work in 30 days and Daniel is 60% more efficient than Virat to complete the same work. Find the total time taken by Daniel to complete the work.",
    o: ["16 3/5 days", "18 3/4 days", "19 5/3 days", "17 5/3 days"],
    a: 1, tier: "tier1", sub: "Efficiency Based", exam: "SSC CGL 14/07/2023 (Shift-03)"
  },
  {
    q: "P takes twice as long as Q or thrice as long as R to complete a piece of work. If they work together, they can finish the work in two days. How much time will Q take to finish the work alone?",
    o: ["8 days", "6 days", "5 days", "7 days"],
    a: 1, tier: "tier1", sub: "Efficiency Based", exam: "SSC CGL 24/07/2023 (Shift-01)"
  },
  {
    q: "To do a certain work, the ratio of efficiencies of X and Y is 5 : 7. Working together, X and Y can complete the same work in 70 days. X alone started the work and left after 42 days. Y alone will complete the remaining work in:",
    o: ["90 days", "96 days", "80 days", "72 days"],
    a: 0, tier: "tier1", sub: "Work and Leave", exam: "SSC CGL 23/08/2021 (Shift-03)"
  },
  {
    q: "A and B together can finish a work in 12 days. If A worked half as efficiently as he usually does and B works thrice as efficiently as he usually does, the work gets completed in 9 days. How long would A take to finish the task if he worked independently?",
    o: ["12 days", "24 days", "27 days", "18 days"],
    a: 3, tier: "tier1", sub: "Efficiency Based"
    // NOTE: Answer key says (c)=27, but math: A+B=1/12, A/2+3B=1/9 → A=1/18 → 18 days=(d). Using correct (d).
  },
  {
    q: "When they work alone, B needs 25% more time to finish a work than A does. They two finish the work in 13 days in the following manner: A works alone till half the work is done, then A and B work together for four days, and finally B works alone to complete the remaining 5% of the work. In how many days can B alone finish the entire work?",
    o: ["16", "20", "22", "18"],
    a: 1, tier: "tier1", sub: "Work and Leave"
  },
  {
    q: "A and B can do a work in 13 days and 26 days, respectively. If they work for a day alternately, starting with A, then in how many days will the work be completed?",
    o: ["17", "16", "13", "14"],
    a: 0, tier: "tier1", sub: "Alternate Day Work", exam: "SSC CPO 27/06/2024 (Shift-02)"
  },
  {
    q: "A, B and C can complete a work in 10, 15 and 20 days, respectively. They work on alternate days such that 1st day A, 2nd day B and 3rd day C. Again 4th day A, 5th day B and so on. If they work in the same way, in how many days will the work be completed?",
    o: ["13 1/2", "14", "13 1/4", "15"],
    a: 0, tier: "tier1", sub: "Alternate Day Work", exam: "SSC MTS 04/09/2023 (Shift-02)"
  },
  {
    q: "A can do a piece of work in 24 days and B can do it in 80 days. B works alone for 2 days and A works alone on the 3rd day. This process continues till the work is completed. In how many days will the work be completed?",
    o: ["42", "45", "48", "44"],
    a: 1, tier: "tier1", sub: "Alternate Day Work", exam: "SSC CHSL 25/05/2022 (Shift-01)"
  },
  {
    q: "P, Q and R can finish a work in 5 days, 10 days and 15 days, respectively, working alone. P and Q work on first day, P and R work on second day and P and Q work on third day and so on till the work is completed. In how many days the work will be completed?",
    o: ["13/2", "9/2", "7/2", "5/2"],
    a: 2, tier: "tier2", sub: "Alternate Day Work", exam: "SSC CGL TIER-II 07/03/2023"
  },
  {
    q: "A and B complete a work in 24 and 30 days, respectively, working 10 hours per day. The work is to be done in two shifts. The morning shift is for 6 hours and the evening shift is for 4 hours. On the first day, A works in the morning and B works in the evening and they interchange their shifts every day. On which day did the work get completed?",
    o: ["24th day", "27th day", "30th day", "21st day"],
    a: 1, tier: "tier1", sub: "Shift Work", exam: "SSC CPO 05/10/2023 (Shift-01)"
  },
  {
    q: "A and B are equally efficient and each can individually complete a piece of work in 36 days, if none takes any holiday. A and B started working together on this piece of work but A took a day off after every five days of work, while B took a day off after every seven days of work. If they had started work on 1 July 2021, on which date was the work completed?",
    o: ["19 July 2021", "20 July 2021", "22 July 2021", "21 July 2021"],
    a: 3, tier: "tier1", sub: "Holidays and Leaves", exam: "SSC CPO 05/10/2023 (Shift-03)"
  },
  {
    q: "To do a certain work, Ajay and Bharat work on alternate days, with Bharat starting the work on the first day. Ajay can finish the work alone in 32 days. If the work gets completed in exactly 8 days, then Bharat alone can finish 7 times the same work in ____ days.",
    o: ["28/8", "4", "32/7", "32"],
    a: 3, tier: "tier1", sub: "Alternate Day Work", exam: "SSC CGL 14/07/2023 (Shift-04)"
  },
  {
    q: "To do a certain work, A and B work on alternate days with B beginning the work on the first day. A alone can complete the same work in 24 days. If the work gets completed in 11 1/3 days, then B alone can complete 7/9 part of the original work in:",
    o: ["5 1/2 days", "4 days", "4 1/2 days", "6 days"],
    a: 1, tier: "tier1", sub: "Alternate Day Work", exam: "SSC CGL 13/08/2021 (Shift-01)"
  },
  {
    q: "Aman and Rajan are working at a construction site. In some engineering experiment, Aman is constructing a wall, while Rajan is demolishing that wall. Aman can completely build the wall in 15 days, while Rajan will take 20 days to completely demolish the wall. In how many days will the complete wall be built for the first time if they work on alternate days, with Aman working on the 1st day?",
    o: ["57", "117", "113", "120"],
    a: 2, tier: "tier1", sub: "Build and Destroy", exam: "SSC Phase XII 21/06/2024 (Shift-03)"
  },
  {
    q: "In a computer game, a builder can build a wall in 10 hours while a destroyer can completely demolish such a wall in 25 hours. Both builders and destroyers were initially designed to work together on level ground. But after 15 hours the destroyers were removed. How much time did it take to build the entire wall?",
    o: ["16 hours 20 min", "16 hours", "17 hours 2 min", "18 hours 24 min"],
    a: 1, tier: "tier1", sub: "Build and Destroy"
  },
  {
    q: "A and B can do a work in 15 days and 30 days, respectively. They start working together, but A leaves after 3 days. How much time will B take to complete the remaining work?",
    o: ["21 days", "28 days", "24 days", "32 days"],
    a: 0, tier: "tier1", sub: "Work and Leave", exam: "SSC Phase XII 20/06/2024 (Shift-03)"
  },
  {
    q: "A and B can do a piece of work in 12 days and 18 days, respectively. Both work for 2 days and then A goes away and B completed the remaining work alone. The whole work was completed in _______ days.",
    o: ["13", "14", "15", "16"],
    a: 2, tier: "tier1", sub: "Work and Leave", exam: "RRB NTPC GL CBT-I 18/06/2025 (Shift-01)"
  },
  {
    q: "Nirbhay can complete a piece of work alone in 19 days and Vismay can complete the same piece of work alone in 6 days. They started the work together, but Nirbhay had to leave 4 days before the completion of the work. In how many days will the work get completed?",
    o: ["5 13/25 days", "5 6/25 days", "5 8/25 days", "5 24/25 days"],
    a: 0, tier: "tier1", sub: "Work and Leave", exam: "RRB NTPC GL CBT-I 16/06/2025 (Shift-02)"
  },
  {
    q: "Robert, Chris and Jeremy can finish a certain piece of work in 10, 14 and 21 days, respectively. All three of them started the work together. Robert left the work after 5 days and Chris left just 2 days before the work was completed. Find the total number of days taken for the work to be completed.",
    o: ["9.5", "1.7", "10.9", "5.4"],
    a: 3, tier: "tier1", sub: "Work and Leave", exam: "RRB NTPC GL CBT-I 17/06/2025 (Shift-01)"
  },
  {
    q: "A group of 25 tourists consume 5 containers of food in 8 days in a hotel. How many containers will be required for 10 tourists to eat for 16 days?",
    o: ["6", "3", "5", "4"],
    a: 3, tier: "tier1", sub: "Man Days", exam: "SSC Phase XII 24/06/2024 (Shift-02)"
  },
  {
    q: "(N + 15) persons, each working for 9 hours a day, can complete 36% of a work in 8 days. (N + 9) persons can complete the remaining work in 20 days, if each of them works for 7 hours per day. Determine the value of N.",
    o: ["55", "52", "64", "50"],
    a: 0, tier: "tier1", sub: "Man Days", exam: "SSC CGL 19/07/2023 (Shift-04)"
  },
  {
    q: "18 workers can complete a piece of work in 96 days. They start working together and after 26 days 10 more workers join them. In how many days in all will the work be completed?",
    o: ["69", "71", "72", "70"],
    a: 1, tier: "tier1", sub: "Man Days", exam: "SSC CPO 27/06/2024 (Shift-03)"
  },
  {
    q: "64 men working 8 hours a day plan to complete a piece of work in 9 days. However, 5 days later they found that they had completed only 40% of the work. They now wanted to finish the remaining work in 4 more days. How many hours per day should they need to work in order to achieve the target?",
    o: ["11", "12", "13", "15"],
    a: 3, tier: "tier1", sub: "Man Days"
  },
  {
    q: "Each one of five men independently can complete a work in 20 days. The work is started by one person. Next day one more person joins and every next day one more person joins. From the fifth day, five persons continued working as a team. In how many days, will the work be completed?",
    o: ["2", "6", "3", "5"],
    a: 1, tier: "tier1", sub: "Man Days", exam: "SSC CGL 17/08/2021 (Shift-03)"
  },
  {
    q: "15 men and 25 women can complete a piece of work in 9.6 days. If 16 women can complete the same work in 27 days, find the number of days in which 16 men can complete the same work.",
    o: ["22.50", "20.25", "19.20", "21.60"],
    a: 1, tier: "tier1", sub: "Men Women Workers", exam: "SSC CGL 17/07/2023 (Shift-01)"
  },
  {
    q: "2 men and 7 women can complete a work in 28 days, whereas 6 men and 16 women can do the work in 11 days. In how many days will 5 men and 4 women, working together, will complete the work?",
    o: ["18", "14", "22", "20"],
    a: 2, tier: "tier2", sub: "Men Women Workers", exam: "SSC CGL TIER-II 2019"
  },
  {
    q: "9 men or 8 women can do a job in 19 days. 9 men work for 9 days and leave. The number of women required to complete the remaining work in 8 days is:",
    o: ["12", "11", "10", "8"],
    a: 2, tier: "tier1", sub: "Men Women Workers", exam: "RRB NTPC GL CBT-I 09/06/2025 (Shift-02)"
  },
  {
    q: "4 women or 6 men can finish a work in the same number of days. A man can finish it in 60 days. In how many days can 5 women finish the work, working together every day?",
    o: ["4", "10", "8", "6"],
    a: 2, tier: "tier1", sub: "Men Women Workers", exam: "SSC CGL 14/07/2023 (Shift-02)"
  },
  {
    q: "3 men can finish a work in 10 days, 4 women can finish it in 12 days and 10 qualified workers can finish it in 6 days. In how many days can the work be finished by 4 men, 4 women and 4 qualified workers, working together every day?",
    o: ["30/19", "45/17", "60/19", "60/17"],
    a: 3, tier: "tier1", sub: "Men Women Workers", exam: "SSC Phase XII 21/06/2024 (Shift-02)"
  }
];

// ============ SET 2: 30 Questions ============
// Answer Key: 1(c) 2(a) 3(b) 4(d) 5(b) 6(c) 7(b) 8(c) 9(b) 10(b)
//            11(b) 12(b) 13(d) 14(d) 15(b) 16(a) 17(b) 18(b) 19(c) 20(b)
//            21(d) 22(b) 23(c) 24(c) 25(c) 26(c) 27(a) 28(a) 29(b) 30(d)

const set2 = [
  {
    q: "A can do 1/4 of a work in 9 days. B can do 2/3 of the same work in 28 days. Working together, in how many days can A and B complete the whole work?",
    o: ["261/15 days", "198/17 days", "252/13 days", "262/11 days"],
    a: 2, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "A and B can do a piece of work in 25 days. B alone can do 66 2/3% of the same work in 30 days. In how many days can A alone do 4/15 part of the same work?",
    o: ["15", "20", "18", "12"],
    a: 0, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "George can do 35% of the total work in 6 days. Jim and George together completed a piece of work in 12 days. In how many days could Jim, working alone, complete the entire task?",
    o: ["36", "40", "42", "45"],
    a: 1, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "Ram alone can do a work in 5 days working 4 hours a day. Seema alone can do the same work in 3 days working 10 hours a day. How many hours do they need to work together in a day to complete the same work in 6 days?",
    o: ["1 hour", "3 hours", "5 hours", "2 hours"],
    a: 3, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "X, Y and Z can do a work in 24 days, 5 days and 12 days, respectively. In how many days can they do the same work if they work together?",
    o: ["24/11 days", "3 1/13 days", "4 days", "24/7 days"],
    a: 1, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "X can do a work in 3 days, Y does three times the same work in 8 days, and Z does five times the same work in 12 days. If they have to work together for 6 hours in a day, then in how much time can they complete the work?",
    o: ["4 hours", "5 hours", "5 hours 20 minutes", "4 hours 10 minutes"],
    a: 2, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "A can do 1/3 of work in 30 days, B can do 2/5 part of the same work in 24 days. They worked together for 20 days. C completed the remaining work in 8 days. In how many days will A, B and C together complete the work?",
    o: ["10", "12", "18", "15"],
    a: 1, tier: "tier1", sub: "Work and Leave"
  },
  {
    q: "A and B together can complete a piece of work in 25 days, B and C together can complete the same piece of work in 36 days, while C and A together can complete it in 30 days. If A, B, C, and D together can complete this piece of work in 18 days, then in how many days can D alone complete this piece of work?",
    o: ["225", "210", "200", "180"],
    a: 2, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "Rani and Adya, working separately, can finish a task in 12 days and 16 days, respectively. They work in stretches of one day alternately. If Rani starts working first, then the task will be completed in",
    o: ["12 1/3 days", "13 2/3 days", "13 1/3 days", "12 2/3 days"],
    a: 1, tier: "tier2", sub: "Alternate Day Work", exam: "SSC CGL TIER-II (18/09/2019)"
  },
  {
    q: "Avi and Bindu can complete a project in 4 and 12 hours, respectively. Avi begins project at 5 a.m., and they work alternately for one hour each. When will the project be completed?",
    o: ["9 am", "11 am", "1 pm", "10 am"],
    a: 1, tier: "tier1", sub: "Alternate Day Work"
  },
  {
    q: "A and B complete a work in 24 and 30 days, respectively, working 10 hours per day. The work is to be done in two shifts. The morning shift is for 6 hours and the evening shift is for 4 hours. On the first day, A works in the morning and B works in the evening, and they interchange their shifts every day. On which day did the work get completed?",
    o: ["24th day", "27th day", "30th day", "21st day"],
    a: 1, tier: "tier1", sub: "Shift Work", exam: "SSC CPO 05/10/2023 (Shift-01)"
  },
  {
    q: "A can complete a piece of work alone in 200 days, while B can complete the same piece of work alone in 100 days. In every three-day cycle, both A and B work on day 1, only A works on day 2, and only B works on day 3. This cycle continues till the work is completed. How many days in all does it take the duo to complete the work?",
    o: ["100 1/3", "99 2/3", "100 1/2", "100"],
    a: 1, tier: "tier1", sub: "Cycle Work"
  },
  {
    q: "A alone can do a work in 11 days. B alone can do the same work in 22 days. C alone can do the same work in 33 days. They work in the following manner: Day 1: A and B work. Day 2: B and C work. Day 3: C and A work. Day 4: A and B work, and so on. In how many days will the work be completed?",
    o: ["12 days", "3 days", "6 days", "9 days"],
    a: 3, tier: "tier1", sub: "Cycle Work"
  },
  {
    q: "A and B can complete a work in 36 days and 45 days respectively. They worked together for 2 days and then A left the work. In how many days will B complete the remaining work?",
    o: ["41.5", "40", "41", "40.5"],
    a: 3, tier: "tier1", sub: "Work and Leave"
  },
  {
    q: "A and B can individually complete a piece of work in 18 days and 30 days, respectively. A and B started working together, but A left 16 2/3 days before the work is completed and B alone completed the rest of the work. For how many days did A work?",
    o: ["4", "5", "6", "3"],
    a: 1, tier: "tier1", sub: "Work and Leave"
  },
  {
    q: "A can do 1/5 of a piece of work in 20 days, B can do 30% of the same work in 36 days, while C can do 80% of the same work in 160 days. B and C together started and worked for x days. After x days B left the work, and A joined C and both completed the remaining work in (x - 41) days. If the ratio between the work done by (B + C) together to the work done by (A + C) together is 19 : 6, then what fraction of the same work can be completed by C alone in 2x days?",
    o: ["57/100", "19/25", "13/25", "6/25"],
    a: 0, tier: "tier1", sub: "Work and Leave"
  },
  {
    q: "Tarun is twice as good as Tripti in doing a work. Together, they can complete the work in 16 days. In how many days can Tripti alone complete the same work?",
    o: ["24", "48", "25", "50"],
    a: 1, tier: "tier1", sub: "Efficiency Based"
  },
  {
    q: "Working 5 hours a day, A can complete a task in 8 days and working 6 hours a day, B can finish the same task in 10 days. Working 8 hours a day, they can jointly complete the task in _____.",
    o: ["5 days", "3 days", "4.5 days", "6 days"],
    a: 1, tier: "tier1", sub: "Basic Combined Work"
  },
  {
    q: "P can do one-fourth piece of some work in 18 days. She completed 37.5% of that work and left it. Q completed the remaining work in 40 days. Working together they will complete 17/48 part of the same work in:",
    o: ["10 days", "8 days", "12 days", "6 days"],
    a: 2, tier: "tier1", sub: "Work and Leave"
  },
  {
    q: "The ratio of work efficiency of A, B and C is 2 : 5 : 3. Working together, they can complete a work in 27 days. In how many days will B and C together complete 4/9 parts of the work?",
    o: ["27 days", "15 days", "17 1/7 days", "24 days"],
    a: 1, tier: "tier1", sub: "Efficiency Based"
  },
  {
    q: "A takes twice as much time as B and thrice as much time as C to finalise a task. Working together, they can complete the task in 8 days. The time (in days) taken by A, B and C, respectively, to complete the task is:",
    o: ["42, 21, 14", "60, 30, 20", "54, 27, 18", "48, 24, 16"],
    a: 3, tier: "tier1", sub: "Efficiency Based"
  },
  {
    q: "47 masons can dig a 35 m long trench in one day. How many masons should be employed for digging a 105 m long trench of the same type in one day?",
    o: ["94", "141", "125", "70"],
    a: 1, tier: "tier1", sub: "Man Days"
  },
  {
    q: "30 men working 5 hours a day can do work in 18 days. In how many days will 20 men working 7 hours a day do the same work?",
    o: ["16 5/7", "13 1/7", "19 2/7", "11 3/7"],
    a: 2, tier: "tier1", sub: "Man Days"
  },
  {
    q: "100 workers working 8 hours a day can dig a canal 2000 metres long in 25 days. Find the number of workers required to dig a similar canal of 2800 metres long in 32 days working 5 hours a day.",
    o: ["165", "170", "175", "180"],
    a: 2, tier: "tier1", sub: "Man Days"
  },
  {
    q: "A hostel had food provision for 300 students for a month. After 20 days, 50 students left the hostel. How long would the remaining food last? (1 month = 30 days)",
    o: ["10 days", "14 days", "12 days", "16 days"],
    a: 2, tier: "tier1", sub: "Man Days"
  },
  {
    q: "A work can be completed by N men in 15 days. 5 men leave the work after 3 days. The remaining work was completed in 18 days. What is the value of N?",
    o: ["18", "21", "15", "12"],
    a: 2, tier: "tier1", sub: "Man Days"
  },
  {
    q: "2 men can finish a work in 6 days and 3 women can finish the same work in 4 days. In how many days will the work be finished by 1 man and 2 women, working together every day?",
    o: ["4", "6", "8", "9"],
    a: 0, tier: "tier1", sub: "Men Women Workers"
  },
  {
    q: "1 man and 4 women can complete a work in 65/4 days, while 3 men and 4 women can complete it in 13/2 days. In how many days will 13 women complete the same work?",
    o: ["20", "16", "14", "18"],
    a: 0, tier: "tier1", sub: "Men Women Workers"
  },
  {
    q: "The one-day work of 2 men is equal to the one-day work of 4 women or the one-day work of 8 qualified workers. 10 qualified workers can finish a work in 8 days. If a man, a woman and a qualified worker work in the same order on three different days, the work is finished in ____ days.",
    o: ["203/6", "135/4", "131/4", "166/5"],
    a: 1, tier: "tier1", sub: "Men Women Workers"
  },
  {
    q: "4 men and 8 women complete a job in 10 days and 5 men and 24 women complete the same work in 4 days. In how many days will 1 man and 1 woman complete the same work?",
    o: ["63 1/3", "69 7/9", "67 1/3", "62 2/9"],
    a: 3, tier: "tier1", sub: "Men Women Workers"
  }
];

// Build dedup set from existing questions
const existing = new Set();
data.questions.forEach(q => {
  const key = q.question.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 80);
  existing.add(key);
});

const seen = new Set();
const allSets = [
  { questions: set1, name: "tw_s1" },
  { questions: set2, name: "tw_s2" }
];

const now = new Date().toISOString();
const baseId = Date.now();
let added = 0, skipped = 0, tier1Count = 0, tier2Count = 0;

allSets.forEach(({ questions, name }) => {
  questions.forEach((item, i) => {
    const key = item.q.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 80);

    if (existing.has(key) || seen.has(key)) {
      skipped++;
      return;
    }
    seen.add(key);

    const tier = item.tier;
    const marks = tier === 'tier2' ? 3 : 2;
    const negMarks = tier === 'tier2' ? 1 : 0.5;
    if (tier === 'tier2') tier2Count++; else tier1Count++;

    data.questions.push({
      id: `${baseId}_${name}_${i + 1}`,
      type: "question",
      examFamily: "ssc",
      subject: "quant",
      difficulty: "medium",
      tier: tier,
      questionMode: "objective",
      topic: "Time and Work",
      question: item.q,
      options: item.o,
      answerIndex: item.a,
      explanation: "",
      marks: marks,
      negativeMarks: negMarks,
      isChallengeCandidate: false,
      confidenceScore: 1,
      reviewStatus: "approved",
      isPYQ: true,
      year: null,
      frequency: 1,
      subtopic: item.sub || "Time and Work",
      source: {
        kind: "pyq",
        fileName: item.exam || "Maths by Aditya Ranjan - Time and Work",
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
});

fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));

console.log(`Total parsed: ${set1.length + set2.length}`);
console.log(`Unique new: ${added}, Skipped (dupes): ${skipped}`);
console.log(`Added ${added} Time & Work PYQs (${tier1Count} tier1, ${tier2Count} tier2)`);
console.log(`Total questions now: ${data.questions.length}`);
