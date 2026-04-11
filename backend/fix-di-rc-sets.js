/**
 * Fix broken DI and Reading Comprehension questions:
 * 1. Mark DI questions without actual data as 'needs_review'
 * 2. Mark RC questions without passage text as 'needs_review'
 * 3. Create proper DI sets with embedded data tables
 * 4. Create proper RC sets with passage text
 */
const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const questions = bank.questions;

let markedDI = 0, markedRC = 0;

// Mark DI questions that reference graphs/charts but don't have actual data
questions.forEach(q => {
  if (q.reviewStatus !== 'approved') return;

  // DI questions without enough data (< 5 numbers in the text)
  if (q.subject === 'quant' && /data.interpretation/i.test(q.topic)) {
    const nums = (q.question.match(/\d+/g) || []);
    if (nums.length < 5) {
      q.reviewStatus = 'needs_review';
      q._disableReason = 'DI question references graph/chart but no data embedded';
      markedDI++;
    }
  }

  // RC questions that just say "the passage" without including any passage
  if (q.subject === 'english' && /reading.comprehension|passage/i.test(q.topic)) {
    if (q.question.length < 80 && !q.sharedContext) {
      q.reviewStatus = 'needs_review';
      q._disableReason = 'RC question references passage but no passage text included';
      markedRC++;
    }
  }
});

console.log(`Marked ${markedDI} broken DI questions as needs_review`);
console.log(`Marked ${markedRC} broken RC questions as needs_review`);

// =========================================================
// CREATE PROPER DI SETS WITH DATA TABLES
// =========================================================
function makeId() { return Date.now() + '_' + Math.random().toString(36).slice(2, 9); }
const now = new Date().toISOString();

function makeDISet(setLabel, sharedContext, questionsData) {
  const setId = 'diset_' + makeId();
  return questionsData.map((qd, idx) => ({
    id: makeId(),
    type: 'question',
    examFamily: 'ssc',
    subject: 'quant',
    difficulty: qd.difficulty || 'medium',
    tier: qd.tier || 'tier1',
    questionMode: 'objective',
    topic: 'Data Interpretation',
    subtopic: setLabel,
    question: qd.question,
    options: qd.options,
    answerIndex: qd.answerIndex,
    explanation: qd.explanation,
    sharedContext,
    setId,
    setIndex: idx,
    setSize: questionsData.length,
    marks: qd.tier === 'tier2' ? 3 : 2,
    negativeMarks: qd.tier === 'tier2' ? 1 : 0.5,
    isChallengeCandidate: false,
    confidenceScore: 0.95,
    reviewStatus: 'approved',
    isPYQ: false,
    year: null,
    frequency: 0,
    source: { kind: 'template', fileName: 'fix-di-rc-sets.js', importedAt: now },
    createdAt: now,
    updatedAt: now
  }));
}

function makeRCSet(passage, questionsData) {
  const setId = 'rcset_' + makeId();
  return questionsData.map((qd, idx) => ({
    id: makeId(),
    type: 'question',
    examFamily: 'ssc',
    subject: 'english',
    difficulty: qd.difficulty || 'medium',
    tier: qd.tier || 'tier1',
    questionMode: 'objective',
    topic: 'Reading Comprehension',
    subtopic: 'Passage Based',
    question: qd.question,
    options: qd.options,
    answerIndex: qd.answerIndex,
    explanation: qd.explanation,
    sharedContext: passage,
    setId,
    setIndex: idx,
    setSize: questionsData.length,
    marks: qd.tier === 'tier2' ? 3 : 2,
    negativeMarks: qd.tier === 'tier2' ? 1 : 0.5,
    isChallengeCandidate: false,
    confidenceScore: 0.95,
    reviewStatus: 'approved',
    isPYQ: false,
    year: null,
    frequency: 0,
    source: { kind: 'template', fileName: 'fix-di-rc-sets.js', importedAt: now },
    createdAt: now,
    updatedAt: now
  }));
}

// ── DI SET 1: Production of Cars (Bar Graph data as table) ────────
const diSet1 = makeDISet('Bar Graph - Car Production', 
`The following table shows the production (in thousands) of cars by five companies (A, B, C, D and E) over five years:

Company | 2018 | 2019 | 2020 | 2021 | 2022
--------|------|------|------|------|------
A       | 40   | 45   | 50   | 55   | 60
B       | 30   | 35   | 25   | 40   | 50
C       | 25   | 30   | 35   | 30   | 40
D       | 50   | 55   | 45   | 60   | 65
E       | 35   | 40   | 55   | 45   | 50`,
[
  {
    question: 'What is the total production of cars by company A over the five years?',
    options: ['240 thousand', '250 thousand', '260 thousand', '270 thousand'],
    answerIndex: 1, difficulty: 'easy',
    explanation: '40+45+50+55+60 = 250 thousand.'
  },
  {
    question: 'In which year was the total production of all companies the highest?',
    options: ['2019', '2020', '2021', '2022'],
    answerIndex: 3, difficulty: 'medium',
    explanation: '2018=180, 2019=205, 2020=210, 2021=230, 2022=265. Highest in 2022.'
  },
  {
    question: 'What is the percentage increase in production of company B from 2018 to 2022?',
    options: ['50%', '60%', '66.67%', '75%'],
    answerIndex: 2, difficulty: 'medium',
    explanation: 'Increase = 50-30 = 20. Percentage = (20/30)×100 = 66.67%.'
  },
  {
    question: 'The production of company C in 2020 is what percentage of the production of company D in the same year?',
    options: ['63.64%', '77.78%', '70%', '80%'],
    answerIndex: 1, difficulty: 'medium',
    explanation: '(35/45)×100 = 77.78%.'
  },
  {
    question: 'What is the ratio of the total production of companies A and B in 2019 to the total production of companies D and E in 2021?',
    options: ['4:5', '16:21', '80:105', '16:21'],
    answerIndex: 1, difficulty: 'hard',
    explanation: 'A+B in 2019 = 45+35 = 80. D+E in 2021 = 60+45 = 105. Ratio = 80:105 = 16:21.'
  }
]);

// ── DI SET 2: Pie Chart - Monthly Expenses ──────────────────────
const diSet2 = makeDISet('Pie Chart - Monthly Expenses',
`A family's total monthly expenditure is ₹60,000. The percentage breakup is:

Category      | Percentage
--------------|------------
Rent          | 30%
Food          | 25%
Education     | 15%
Transport     | 12%
Medical       | 8%
Entertainment | 6%
Savings       | 4%`,
[
  {
    question: 'How much does the family spend on Food per month?',
    options: ['₹12,000', '₹15,000', '₹18,000', '₹20,000'],
    answerIndex: 1, difficulty: 'easy',
    explanation: '25% of 60,000 = ₹15,000.'
  },
  {
    question: 'The expenditure on Education is how much more than the expenditure on Medical?',
    options: ['₹3,600', '₹4,200', '₹4,800', '₹5,400'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'Education = 15% = ₹9,000. Medical = 8% = ₹4,800. Diff = ₹4,200.'
  },
  {
    question: 'What is the ratio of expenditure on Rent to expenditure on Entertainment?',
    options: ['5:1', '4:1', '3:1', '6:1'],
    answerIndex: 0, difficulty: 'easy',
    explanation: 'Rent=30%, Entertainment=6%. Ratio = 30:6 = 5:1.'
  },
  {
    question: 'If the family increases total expenditure by 20%, what will be the new expenditure on Transport?',
    options: ['₹7,200', '₹8,640', '₹9,000', '₹8,400'],
    answerIndex: 1, difficulty: 'hard',
    explanation: 'New total = 60000×1.2 = 72000. Transport = 12% of 72000 = ₹8,640.'
  },
  {
    question: 'The central angle for the Food sector in a pie chart would be:',
    options: ['72°', '90°', '108°', '120°'],
    answerIndex: 1, difficulty: 'medium',
    explanation: '25% of 360° = 90°.'
  }
]);

// ── DI SET 3: Table - Students in different departments ─────────
const diSet3 = makeDISet('Table - Student Enrollment',
`The table shows the number of students enrolled in different departments of a university in 2023:

Department    | Male | Female | Total
--------------|------|--------|------
Computer Sci  | 120  | 80     | 200
Mechanical    | 150  | 30     | 180
Electrical    | 100  | 60     | 160
Civil         | 90   | 50     | 140
Electronics   | 80   | 70     | 150
Total         | 540  | 290    | 830`,
[
  {
    question: 'What is the percentage of female students in the Computer Science department?',
    options: ['35%', '40%', '45%', '50%'],
    answerIndex: 1, difficulty: 'easy',
    explanation: '(80/200)×100 = 40%.'
  },
  {
    question: 'The number of male students in Mechanical department is what percentage more than the male students in Civil department?',
    options: ['60%', '66.67%', '50%', '75%'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'Diff = 150-90 = 60. Percentage more = (60/90)×100 = 66.67%.'
  },
  {
    question: 'What is the ratio of total female students to total male students?',
    options: ['27:54', '29:54', '29:52', '29:56'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'Female:Male = 290:540 = 29:54.'
  },
  {
    question: 'Which department has the highest percentage of female students?',
    options: ['Computer Science', 'Electronics', 'Electrical', 'Civil'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'CS=40%, Mech=16.67%, Elec=37.5%, Civil=35.7%, Electronics=46.67%. Electronics is highest.'
  },
  {
    question: 'If 10% of male students from each department are transferred out, what will be the new total number of students?',
    options: ['776', '784', '790', '800'],
    answerIndex: 0, difficulty: 'hard',
    explanation: '10% of 540 males = 54 leave. New total = 830 - 54 = 776.'
  }
]);

// ── DI SET 4: Line Graph Data - Temperature ────────────────────
const diSet4 = makeDISet('Line Graph - Temperature',
`The table shows the maximum and minimum temperatures (°C) recorded in a city over a week:

Day       | Max Temp | Min Temp
----------|----------|---------
Monday    | 38       | 24
Tuesday   | 40       | 26
Wednesday | 36       | 22
Thursday  | 42       | 28
Friday    | 35       | 20
Saturday  | 39       | 25
Sunday    | 37       | 23`,
[
  {
    question: 'On which day was the difference between maximum and minimum temperature the highest?',
    options: ['Monday', 'Thursday', 'Friday', 'Sunday'],
    answerIndex: 2, difficulty: 'easy',
    explanation: 'Mon=14, Tue=14, Wed=14, Thu=14, Fri=15, Sat=14, Sun=14. Friday has highest difference of 15°C.'
  },
  {
    question: 'What is the average maximum temperature over the week?',
    options: ['37°C', '38°C', '38.14°C', '39°C'],
    answerIndex: 2, difficulty: 'medium',
    explanation: '(38+40+36+42+35+39+37)/7 = 267/7 = 38.14°C.'
  },
  {
    question: 'The minimum temperature on Thursday is what percentage of the maximum temperature on the same day?',
    options: ['60%', '62.5%', '66.67%', '70%'],
    answerIndex: 2, difficulty: 'medium',
    explanation: '(28/42)×100 = 66.67%.'
  },
  {
    question: 'What is the ratio of the sum of maximum temperatures on Monday and Wednesday to the sum of minimum temperatures on Tuesday and Saturday?',
    options: ['37:25', '37:26', '74:51', '38:25'],
    answerIndex: 2, difficulty: 'hard',
    explanation: 'Max Mon+Wed = 38+36 = 74. Min Tue+Sat = 26+25 = 51. Ratio = 74:51.'
  },
  {
    question: 'How many days had a maximum temperature above the weekly average maximum temperature?',
    options: ['2', '3', '4', '5'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'Average max = 38.14°C. Days above: Tue(40), Thu(42), Sat(39) = 3 days.'
  }
]);

// ── DI SET 5: Tier 2 level - Revenue & Expenses ─────────────────
const diSet5 = makeDISet('Bar Graph - Revenue & Expenses',
`The table shows the Revenue and Expenses (in ₹ lakhs) of a company over 6 years:

Year | Revenue | Expenses | Profit (R-E)
-----|---------|----------|-------------
2017 | 150     | 120      | 30
2018 | 180     | 130      | 50
2019 | 200     | 160      | 40
2020 | 140     | 150      | -10
2021 | 220     | 170      | 50
2022 | 260     | 190      | 70`,
[
  {
    question: 'In which year did the company incur a loss?',
    options: ['2017', '2019', '2020', '2022'],
    answerIndex: 2, difficulty: 'easy', tier: 'tier2',
    explanation: 'Only in 2020, expenses (150) exceeded revenue (140), resulting in a loss of ₹10 lakhs.'
  },
  {
    question: 'What is the average profit over the 6 years?',
    options: ['₹35 lakhs', '₹38.33 lakhs', '₹40 lakhs', '₹42 lakhs'],
    answerIndex: 1, difficulty: 'medium', tier: 'tier2',
    explanation: 'Total profit = 30+50+40+(-10)+50+70 = 230. Average = 230/6 = 38.33 lakhs.'
  },
  {
    question: 'The revenue in 2022 is what percentage more than the revenue in 2017?',
    options: ['66.67%', '70%', '73.33%', '80%'],
    answerIndex: 2, difficulty: 'medium', tier: 'tier2',
    explanation: 'Increase = 260-150 = 110. Percentage = (110/150)×100 = 73.33%.'
  },
  {
    question: 'What is the ratio of total expenses in the first three years to total expenses in the last three years?',
    options: ['41:51', '410:510', '40:51', '41:50'],
    answerIndex: 0, difficulty: 'hard', tier: 'tier2',
    explanation: 'First 3: 120+130+160=410. Last 3: 150+170+190=510. Ratio = 410:510 = 41:51.'
  },
  {
    question: 'If expenses in 2023 increase by 15% over 2022 while revenue increases by 10%, what will be the profit in 2023?',
    options: ['₹67.5 lakhs', '₹64 lakhs', '₹68.5 lakhs', '₹67.5 lakhs'],
    answerIndex: 2, difficulty: 'hard', tier: 'tier2',
    explanation: 'Revenue 2023 = 260×1.10 = 286. Expenses = 190×1.15 = 218.5. Profit = 286-218.5 = ₹67.5. Wait: 286-218.5 = 67.5. Hmm checking options... 67.5 appears in A and D. Let me recalculate: 260*1.10=286, 190*1.15=218.5, 286-218.5=67.5. Answer is 67.5 lakhs.'
  }
]);

// ── DI SET 6: Pie Chart - Market Share ──────────────────────────
const diSet6 = makeDISet('Pie Chart - Market Share',
`The table shows the market share (%) of six smartphone brands in a country in 2023. Total smartphones sold = 50 million.

Brand    | Market Share (%)
---------|------------------
Samsung  | 24%
Apple    | 18%
Xiaomi   | 20%
Vivo     | 15%
Oppo     | 13%
Others   | 10%`,
[
  {
    question: 'How many smartphones (in millions) were sold by Xiaomi?',
    options: ['8', '9', '10', '12'],
    answerIndex: 2, difficulty: 'easy',
    explanation: '20% of 50 = 10 million.'
  },
  {
    question: 'Samsung sold how many more smartphones (in millions) than Oppo?',
    options: ['4.5', '5', '5.5', '6'],
    answerIndex: 2, difficulty: 'easy',
    explanation: 'Samsung=24%=12M, Oppo=13%=6.5M. Difference=5.5M.'
  },
  {
    question: 'What is the ratio of Apple\'s market share to Vivo\'s market share?',
    options: ['6:5', '5:6', '3:2', '2:3'],
    answerIndex: 0, difficulty: 'easy',
    explanation: '18:15 = 6:5.'
  },
  {
    question: 'The central angle for Samsung in a pie chart would be:',
    options: ['72°', '86.4°', '90°', '100°'],
    answerIndex: 1, difficulty: 'medium',
    explanation: '24% of 360° = 86.4°.'
  },
  {
    question: 'If total sales increase by 20% next year and Xiaomi\'s share increases to 25%, how many millions will Xiaomi sell?',
    options: ['12', '15', '18', '20'],
    answerIndex: 1, difficulty: 'hard',
    explanation: 'New total = 50×1.2 = 60M. Xiaomi = 25% of 60 = 15M.'
  }
]);

// Fix DI Set 5 option issue
diSet5[4].options = ['₹67.5 lakhs', '₹64 lakhs', '₹68.5 lakhs', '₹60 lakhs'];
diSet5[4].answerIndex = 0;
diSet5[4].explanation = 'Revenue 2023 = 260×1.10 = 286. Expenses = 190×1.15 = 218.5. Profit = 286-218.5 = ₹67.5 lakhs.';


// ── RC SET 1: Passage about Technology ──────────────────────────
const rcSet1 = makeRCSet(
`The rapid advancement of artificial intelligence (AI) has sparked a global debate about its impact on employment. While some experts predict massive job losses as machines become capable of performing tasks previously done by humans, others argue that AI will create new types of jobs that we cannot yet imagine. History shows that technological revolutions have always been accompanied by significant economic restructuring. The industrial revolution, for instance, displaced millions of agricultural workers, but it also created entirely new industries and occupations.

Today, AI is already transforming sectors such as healthcare, finance, and transportation. In healthcare, AI algorithms can analyse medical images with remarkable accuracy, sometimes outperforming human doctors. In finance, automated trading systems handle billions of dollars in transactions every day. Self-driving vehicles promise to revolutionise transportation, though widespread adoption remains years away.

However, the transition will not be painless. Workers in routine jobs — data entry, basic accounting, simple manufacturing — face the highest risk of displacement. Education systems must adapt to prepare the next generation for a world where human creativity, emotional intelligence, and complex problem-solving will be the most valued skills. Governments must also develop policies to support displaced workers through retraining programmes and social safety nets.

The key question is not whether AI will change the nature of work — it certainly will — but whether society can manage this transition in a way that shares the benefits widely rather than concentrating them among a technological elite.`,
[
  {
    question: 'What is the most appropriate title for this passage?',
    options: ['The End of Human Employment', 'AI and the Future of Work', 'Why Machines Are Better Than Humans', 'The History of Industrial Revolution'],
    answerIndex: 1, difficulty: 'easy',
    explanation: 'The passage discusses AI\'s impact on employment and how society should manage the transition. "AI and the Future of Work" best captures this central theme.'
  },
  {
    question: 'According to the passage, which of the following skills will be most valued in an AI-driven world?',
    options: ['Data entry and basic accounting', 'Routine manufacturing skills', 'Human creativity and emotional intelligence', 'Computer programming only'],
    answerIndex: 2, difficulty: 'medium',
    explanation: 'The passage states "human creativity, emotional intelligence, and complex problem-solving will be the most valued skills."'
  },
  {
    question: 'The author\'s tone in this passage can best be described as:',
    options: ['Extremely pessimistic', 'Balanced and analytical', 'Enthusiastically optimistic', 'Harshly critical'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'The author presents both positive and negative aspects of AI\'s impact, making the tone balanced and analytical.'
  },
  {
    question: 'The author mentions the industrial revolution to:',
    options: ['Argue that AI will definitely create more jobs', 'Show that technological change has historical precedent', 'Prove that agricultural workers suffered permanently', 'Criticse modern technology'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'The industrial revolution example shows that technological disruptions have happened before and led to economic restructuring.'
  },
  {
    question: 'According to the passage, what is the "key question" about AI?',
    options: ['Whether AI will replace all human jobs', 'Whether AI can outperform doctors', 'Whether society can manage the transition equitably', 'Whether self-driving cars will be adopted'],
    answerIndex: 2, difficulty: 'hard',
    explanation: 'The final paragraph states the key question is "whether society can manage this transition in a way that shares the benefits widely."'
  }
]);

// ── RC SET 2: Passage about Indian Heritage ─────────────────────
const rcSet2 = makeRCSet(
`India's cultural heritage is one of the oldest and richest in the world. The country's history spans over five thousand years, during which it has produced some of humanity's greatest achievements in art, architecture, literature, philosophy, mathematics, and science. The ancient universities of Nalanda and Takshashila attracted scholars from across Asia, making India a centre of learning for centuries.

The architectural marvels left behind by various dynasties tell the story of India's diverse cultural tapestry. From the intricately carved temples of Khajuraho and Hampi to the magnificent Mughal monuments like the Taj Mahal and Red Fort, each structure reflects the artistic sensibilities and engineering prowess of its era. The rock-cut caves of Ajanta and Ellora, created over several centuries, display extraordinary paintings and sculptures that continue to inspire artists today.

Indian classical traditions in music and dance have been passed down through generations in an unbroken chain of guru-shishya (teacher-student) tradition. Forms like Bharatanatyam, Kathak, Odissi, and Kathakali each represent the cultural ethos of different regions. Similarly, Indian classical music, whether Hindustani or Carnatic, follows complex systems of ragas and talas that are unique to the subcontinent.

Despite modernisation and globalisation, India continues to maintain a delicate balance between preserving its traditional heritage and embracing contemporary innovation. This synthesis of the old and new is perhaps what makes Indian culture so enduringly vibrant and relevant.`,
[
  {
    question: 'What is the central theme of this passage?',
    options: ['India\'s economic growth', 'India\'s rich and diverse cultural heritage', 'The decline of Indian traditions', 'Modern Indian architecture'],
    answerIndex: 1, difficulty: 'easy',
    explanation: 'The passage discusses India\'s cultural heritage across various domains — art, architecture, music, dance — making cultural heritage the central theme.'
  },
  {
    question: 'According to the passage, Nalanda and Takshashila were important because they:',
    options: ['Were built by the Mughal dynasty', 'Attracted scholars from across Asia', 'Were centres of military training', 'Were the largest cities in ancient India'],
    answerIndex: 1, difficulty: 'easy',
    explanation: 'The passage states these universities "attracted scholars from across Asia, making India a centre of learning."'
  },
  {
    question: 'The word "tapestry" in the second paragraph is used to suggest:',
    options: ['A type of cloth', 'A rich and varied mix', 'A historical document', 'A painting technique'],
    answerIndex: 1, difficulty: 'medium',
    explanation: '"Cultural tapestry" is used metaphorically to mean a rich, varied, and interwoven mix of cultures.'
  },
  {
    question: 'Which of the following is NOT mentioned in the passage as an example of Indian architectural heritage?',
    options: ['Temples of Khajuraho', 'Caves of Ajanta', 'Qutub Minar', 'Taj Mahal'],
    answerIndex: 2, difficulty: 'medium',
    explanation: 'Khajuraho, Ajanta, and Taj Mahal are all mentioned. Qutub Minar is not mentioned in the passage.'
  },
  {
    question: 'The passage suggests that Indian culture remains vibrant because:',
    options: ['It rejects all modern influences', 'It has completely modernised', 'It balances tradition with contemporary innovation', 'It copies Western cultural models'],
    answerIndex: 2, difficulty: 'medium',
    explanation: 'The last paragraph states India "maintains a delicate balance between preserving its traditional heritage and embracing contemporary innovation."'
  }
]);

// ── RC SET 3: Science passage ───────────────────────────────────
const rcSet3 = makeRCSet(
`Water is often called the "universal solvent" because it dissolves more substances than any other liquid. This property is essential for life on Earth, as it allows water to carry nutrients, minerals, and other vital compounds throughout the bodies of living organisms and through the environment. The water cycle — evaporation, condensation, and precipitation — ensures that this precious resource is continuously recycled.

However, the world is facing a growing water crisis. Although approximately 71% of the Earth's surface is covered with water, only about 2.5% of it is freshwater, and much of that is locked in glaciers and ice caps. The amount of readily available freshwater for human use is less than 1% of all the water on Earth. Population growth, industrialisation, and agricultural expansion have placed enormous pressure on these limited freshwater resources.

Climate change is making the situation worse. Rising temperatures are causing glaciers to melt, altering rainfall patterns, and increasing the frequency of droughts in many regions. Meanwhile, water pollution from industrial waste, agricultural runoff, and untreated sewage is rendering existing freshwater supplies unusable. The World Health Organisation estimates that over 2 billion people worldwide lack access to safely managed drinking water.

Addressing the water crisis requires a multi-pronged approach: improving water efficiency in agriculture (which accounts for about 70% of global freshwater use), investing in water treatment and recycling technologies, protecting watersheds and wetlands, and reducing pollution. Without urgent action, water scarcity could become one of the defining challenges of the 21st century.`,
[
  {
    question: 'Why is water called the "universal solvent"?',
    options: ['Because it is available everywhere', 'Because it dissolves more substances than any other liquid', 'Because it is essential for life', 'Because it covers 71% of Earth'],
    answerIndex: 1, difficulty: 'easy',
    explanation: 'The passage directly states water is called the universal solvent "because it dissolves more substances than any other liquid."'
  },
  {
    question: 'What percentage of Earth\'s water is readily available freshwater for human use?',
    options: ['2.5%', '71%', 'Less than 1%', '29%'],
    answerIndex: 2, difficulty: 'easy',
    explanation: 'The passage states "The amount of readily available freshwater for human use is less than 1% of all the water on Earth."'
  },
  {
    question: 'According to the passage, which sector uses the most freshwater globally?',
    options: ['Industry', 'Domestic use', 'Agriculture', 'Energy production'],
    answerIndex: 2, difficulty: 'medium',
    explanation: 'The passage states agriculture "accounts for about 70% of global freshwater use."'
  },
  {
    question: 'The tone of the passage is primarily:',
    options: ['Humorous and light-hearted', 'Informative and concerned', 'Angry and accusatory', 'Nostalgic and sentimental'],
    answerIndex: 1, difficulty: 'medium',
    explanation: 'The passage provides factual information about the water crisis while expressing concern about its severity, making it informative and concerned.'
  },
  {
    question: 'Which of the following is NOT mentioned as a cause of the water crisis?',
    options: ['Population growth', 'Climate change', 'Volcanic eruptions', 'Water pollution'],
    answerIndex: 2, difficulty: 'medium',
    explanation: 'Population growth, climate change, and water pollution are all mentioned. Volcanic eruptions are not mentioned in the passage.'
  }
]);

// ── RC SET 4: Tier 2 level passage ──────────────────────────────
const rcSet4 = makeRCSet(
`The concept of "emotional intelligence" (EI), popularised by psychologist Daniel Goleman in the 1990s, has fundamentally altered our understanding of what makes a person successful. Traditional intelligence quotient (IQ) tests measure logical reasoning, mathematical ability, and linguistic skills, but they fail to capture equally important competencies such as self-awareness, empathy, and social skills. Goleman argued that these emotional competencies often matter more than IQ in determining success in both personal and professional life.

Research supports this claim. Studies have shown that people with high emotional intelligence tend to have better mental health, stronger relationships, and more successful careers. In the workplace, leaders with high EI are more effective at motivating teams, resolving conflicts, and navigating organisational politics. They can read the emotional undercurrents in a room and respond appropriately, a skill that purely intellectual ability cannot provide.

However, the concept of emotional intelligence has also attracted criticism. Some psychologists argue that EI is too broadly defined, encompassing traits that are better understood as aspects of personality rather than a distinct form of intelligence. Others question whether EI can be reliably measured, pointing out that unlike IQ tests, which have decades of validation, EI assessments rely heavily on self-reporting and are susceptible to social desirability bias.

Despite these criticisms, the practical value of emotional competencies is hard to deny. Whether we call it emotional intelligence, social skills, or interpersonal competence, the ability to understand and manage one's own emotions — and to respond effectively to the emotions of others — remains one of the most important determinants of a fulfilling and successful life.`,
[
  {
    question: 'According to Daniel Goleman, what often matters more than IQ for success?',
    options: ['Mathematical ability', 'Linguistic skills', 'Emotional competencies', 'Logical reasoning'],
    answerIndex: 2, difficulty: 'easy', tier: 'tier2',
    explanation: 'The passage states Goleman argued that "emotional competencies often matter more than IQ in determining success."'
  },
  {
    question: 'What criticism do some psychologists have of the concept of emotional intelligence?',
    options: ['That it is too narrowly defined', 'That it overlaps with personality traits and is hard to measure', 'That it only applies to leaders', 'That it contradicts IQ research'],
    answerIndex: 1, difficulty: 'medium', tier: 'tier2',
    explanation: 'Critics argue EI is "too broadly defined" and encompasses personality traits, and question whether it "can be reliably measured."'
  },
  {
    question: 'The phrase "social desirability bias" in the passage most likely means:',
    options: ['A preference for socialising', 'The tendency to present oneself in a favourable light', 'A bias towards desirable test outcomes', 'A measurement of social popularity'],
    answerIndex: 1, difficulty: 'hard', tier: 'tier2',
    explanation: 'In the context of self-reporting assessments, "social desirability bias" refers to respondents presenting themselves in a more favourable light than reality.'
  },
  {
    question: 'What is the author\'s overall position on emotional intelligence?',
    options: ['Completely supportive without reservation', 'Dismissive and critical', 'Balanced — acknowledges both value and criticism', 'Neutral with no opinion'],
    answerIndex: 2, difficulty: 'medium', tier: 'tier2',
    explanation: 'The author presents both the benefits and criticisms of EI, concluding that its practical value is real despite valid criticisms — a balanced position.'
  },
  {
    question: 'According to research cited in the passage, leaders with high EI are better at all of the following EXCEPT:',
    options: ['Motivating teams', 'Solving mathematical problems', 'Resolving conflicts', 'Navigating organisational politics'],
    answerIndex: 1, difficulty: 'medium', tier: 'tier2',
    explanation: 'The passage mentions motivating teams, resolving conflicts, and navigating politics. Solving mathematical problems is an IQ-related skill, not EI.'
  }
]);

// Add all new sets to bank
const allNewSets = [...diSet1, ...diSet2, ...diSet3, ...diSet4, ...diSet5, ...diSet6,
                    ...rcSet1, ...rcSet2, ...rcSet3, ...rcSet4];

// Dedup
function normalize(text) { return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60); }
const existingSet = new Set(questions.map(q => normalize(q.question)));

let added = 0, dupes = 0;
for (const q of allNewSets) {
  const norm = normalize(q.question);
  if (existingSet.has(norm)) { dupes++; }
  else { questions.push(q); existingSet.add(norm); added++; }
}

bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

const finalApproved = questions.filter(q => q.reviewStatus === 'approved');
console.log(`\n=== DI & RC FIX COMPLETE ===`);
console.log(`Broken DI questions marked needs_review: ${markedDI}`);
console.log(`Broken RC questions marked needs_review: ${markedRC}`);
console.log(`New DI set questions added: ${allNewSets.filter(q=>q.subject==='quant').length} (${added} after dedup)`);
console.log(`New RC set questions added: ${allNewSets.filter(q=>q.subject==='english').length}`);
console.log(`Total dupes skipped: ${dupes}`);
console.log(`Total bank: ${questions.length}`);
console.log(`Total approved: ${finalApproved.length}`);

// Subject breakdown
const subj = {};
finalApproved.forEach(q => { subj[q.subject] = (subj[q.subject] || 0) + 1; });
console.log('Approved by subject:', subj);
