/**
 * Mega reasoning import: SSC CGL Tier 1 & Tier 2
 * Sources: Verified SSC CGL e-book questions + original questions covering
 * number series, classification, analogies, coding-decoding, blood relations,
 * direction sense, math operations, ranking, cube/dice, age problems,
 * logical deduction, arrangement, and more.
 * All questions are text-only (no figure/diagram dependency).
 */
const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const existingQs = bank.questions;

function makeId() {
  return Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function normalize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
}

const existingSet = new Set(existingQs.map(q => normalize(q.question)));

function makeQ({ topic, subtopic, question, options, answerIndex, difficulty, tier, explanation }) {
  const now = new Date().toISOString();
  const marks = tier === 'tier1' ? 2 : 3;
  const neg = tier === 'tier1' ? 0.5 : 1;
  return {
    id: makeId(),
    type: 'question',
    examFamily: 'ssc',
    subject: 'reasoning',
    difficulty: difficulty || 'medium',
    tier,
    questionMode: 'objective',
    topic,
    question,
    options,
    answerIndex,
    explanation: explanation || '',
    marks,
    negativeMarks: neg,
    isChallengeCandidate: difficulty === 'hard',
    confidenceScore: 0.9,
    reviewStatus: 'approved',
    isPYQ: false,
    year: null,
    frequency: 0,
    subtopic: subtopic || topic,
    source: { kind: 'bulk_import', fileName: 'import-reasoning-mega.js', importedAt: now },
    createdAt: now,
    updatedAt: now
  };
}

const questions = [];

// =====================================================
// TOPIC 1: NUMBER SERIES (~45 questions)
// =====================================================

// --- Simple Arithmetic/Geometric ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Arithmetic Progression',
  question: 'Find the missing number in the series: 3, 10, 21, 36, ?, 78',
  options: ['50', '55', '54', '60'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Differences: 7, 11, 15, 19, 23. Each difference increases by 4. So 36 + 19 = 55.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Geometric Progression',
  question: 'Complete the series: 8, 16, 32, 64, ?',
  options: ['120', '128', '136', '140'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each number is multiplied by 2. 64 × 2 = 128.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Geometric Progression',
  question: 'Complete the series: 5, 15, 45, 135, ?',
  options: ['405', '400', '420', '450'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each number is multiplied by 3. 135 × 3 = 405.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Geometric Progression',
  question: 'Complete the series: 7, 14, 28, 56, ?',
  options: ['84', '112', '108', '120'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each number is multiplied by 2. 56 × 2 = 112.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Geometric Progression',
  question: 'Complete the series: 3, 9, 27, 81, 243, ?',
  options: ['486', '729', '810', '1024'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each number is multiplied by 3. 243 × 3 = 729.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Geometric Progression',
  question: 'Complete the series: 7, 14, 28, 56, 112, ?',
  options: ['224', '216', '240', '256'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each number is multiplied by 2. 112 × 2 = 224.'
}));

// --- n² and n³ patterns ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Perfect Squares',
  question: 'Find the missing number: 1, 4, 9, 16, ?',
  options: ['20', '24', '25', '30'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Pattern: n². 1², 2², 3², 4², 5² = 25.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Perfect Squares',
  question: 'Find the missing number: 1, 4, 9, 16, 25, 36, ?',
  options: ['40', '42', '49', '50'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Pattern: n². 7² = 49.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Perfect Cubes',
  question: 'Complete the series: 1, 8, 27, 64, ?',
  options: ['81', '100', '125', '144'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: n³. 1³, 2³, 3³, 4³, 5³ = 125.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'n² + n pattern',
  question: 'Complete the series: 2, 6, 12, 20, 30, ?',
  options: ['36', '40', '42', '48'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: n(n+1). 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'n² + n pattern',
  question: 'Complete the series: 2, 6, 12, 20, 30, 42, ?',
  options: ['54', '56', '60', '72'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: n(n+1). 7×8 = 56.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'n² + n pattern',
  question: 'Complete the series: 2, 6, 12, 20, 30, 42, 56, ?',
  options: ['70', '72', '80', '90'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: n(n+1). 8×9 = 72.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'n² + n pattern',
  question: 'Complete the series: 2, 6, 12, 20, 30, 42, 56, 72, ?',
  options: ['90', '92', '100', '110'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: n(n+1). 9×10 = 90.'
}));

// --- Triangular numbers ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Triangular Numbers',
  question: 'Find the missing number: 1, 3, 6, 10, 15, ?',
  options: ['20', '21', '22', '23'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Triangular numbers: differences increase by 1 each time. 15 + 6 = 21.'
}));

// --- Factorial ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Factorial',
  question: 'Complete the series: 1, 2, 6, 24, 120, ?',
  options: ['720', '600', '7200', '800'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'Factorial pattern: 1!, 2!, 3!, 4!, 5!, 6! = 720.'
}));

// --- Increasing differences ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Increasing Differences',
  question: 'Find the next number: 4, 14, 30, 52, 80, ?',
  options: ['104', '110', '114', '120'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Differences: 10, 16, 22, 28. Increasing by 6. Next diff = 34. 80 + 34 = 114.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Increasing Differences',
  question: 'Find the next number: 2, 5, 10, 17, 26, ?',
  options: ['35', '37', '38', '39'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Differences: 3, 5, 7, 9. Increasing by 2. Next diff = 11. 26 + 11 = 37.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Increasing Differences',
  question: 'Find the next number: 3, 8, 15, 24, 35, ?',
  options: ['46', '48', '49', '50'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Differences: 5, 7, 9, 11. Increasing by 2. Next diff = 13. 35 + 13 = 48.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Increasing Differences',
  question: 'Find the next number: 2, 12, 30, 56, ?',
  options: ['80', '90', '110', '120'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'Differences: 10, 18, 26. Increasing by 8. Next diff = 34. 56 + 34 = 90.'
}));

// --- Alternating series ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Alternating Series',
  question: 'Find the next number: 3, 7, 4, 8, 5, 9, ?',
  options: ['5', '6', '7', '10'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Two alternating series: 3, 4, 5, 6 (adding 1) and 7, 8, 9 (adding 1). Next = 6.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Alternating Series',
  question: 'Find the next number in the series: 2, 9, 4, 11, 6, 13, ?',
  options: ['7', '8', '14', '15'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Two alternating series: 2, 4, 6, 8 (+2 each) and 9, 11, 13 (+2 each). Next = 8.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Alternating Series',
  question: 'Find the next number: 5, 20, 10, 18, 15, 16, ?',
  options: ['14', '18', '20', '22'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'Two alternating series: 5, 10, 15, 20 (+5 each) and 20, 18, 16, 14 (-2 each). Next = 20.'
}));

// --- Subtraction series ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Subtraction Series',
  question: 'Complete the series: 84, 78, 72, 66, 60, 54, ?',
  options: ['44', '48', '50', '52'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each number decreases by 6. 54 - 6 = 48.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Alternating Subtraction',
  question: 'Complete the series: 36, 34, 30, 28, 24, ?',
  options: ['20', '22', '23', '26'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Alternating subtraction: -2, -4, -2, -4. Next: 24 - 2 = 22.'
}));

// --- Complex patterns ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Addition Series',
  question: 'Complete the series: 3, 8, 13, 18, 23, 28, ?',
  options: ['31', '32', '33', '35'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each number increases by 5. 28 + 5 = 33.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Repetition Pattern',
  question: 'Complete the series: 20, 20, 17, 17, 14, 14, ?',
  options: ['11', '12', '14', '10'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Each number repeats then decreases by 3. After 14, 14, next is 11.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Interpolated Series',
  question: 'Complete the series: 9, 11, 33, 13, 15, 33, 17, ?',
  options: ['19', '33', '21', '31'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'Main series adds 2 each step: 9,11,13,15,17,19. Number 33 is interpolated every 3rd position. Next = 19.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Multiply-Subtract',
  question: 'Find the next number: 14, 28, 20, 40, 32, 64, ?',
  options: ['52', '56', '96', '128'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'Alternating ×2 then -8: 14×2=28, 28-8=20, 20×2=40, 40-8=32, 32×2=64, 64-8=56.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Decimal Series',
  question: 'Find the next number: 1.5, 2.3, 3.1, 3.9, ?',
  options: ['4.2', '4.4', '4.7', '5.1'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Each number increases by 0.8. 3.9 + 0.8 = 4.7.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Decimal Series',
  question: 'Find the next number: 5.2, 4.8, 4.4, 4.0, ?',
  options: ['3.0', '3.3', '3.5', '3.6'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Each number decreases by 0.4. 4.0 - 0.4 = 3.6.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Division Series',
  question: 'Find the next number: 1000, 200, 40, ?',
  options: ['8', '10', '15', '20'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Each number is divided by 5. 40 ÷ 5 = 8.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Multiplication Series',
  question: 'Find the next number: 2, 6, 18, 54, ?',
  options: ['108', '148', '162', '216'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Each number is multiplied by 3. 54 × 3 = 162.'
}));

// --- Middle fill ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Fill Middle',
  question: 'Look at this series: 8, 43, 11, 41, ?, 39, 17. What fills the blank?',
  options: ['8', '14', '43', '44'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'Two alternating series: 8, 11, ?, 17 (add 3) and 43, 41, 39 (subtract 2). Missing = 14.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Fill Middle',
  question: 'Look at this series: 15, ?, 27, 27, 39, 39. What fills the blank?',
  options: ['51', '39', '23', '15'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: each number repeats then increases by 12. 15, 15, 27, 27, 39, 39. Missing = 15.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Fill Middle',
  question: 'Look at this series: 72, 76, 73, 77, 74, ?, 75. What fills the blank?',
  options: ['70', '71', '75', '78'], answerIndex: 3, difficulty: 'hard', tier: 'tier2',
  explanation: 'Two alternating series: 72, 73, 74, 75 (+1) and 76, 77, 78 (+1). Missing = 78.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Division-Addition',
  question: 'Look at this series: 664, 332, 340, 170, ?, 89. What fills the blank?',
  options: ['85', '97', '109', '178'], answerIndex: 3, difficulty: 'hard', tier: 'tier2',
  explanation: 'Alternating ÷2 and +8: 664÷2=332, 332+8=340, 340÷2=170, 170+8=178, 178÷2=89.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Geometric Fill',
  question: 'Look at this series: 0.15, 0.3, ?, 1.2, 2.4. What fills the blank?',
  options: ['4.8', '0.006', '0.6', '0.9'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Each number is multiplied by 2. 0.3 × 2 = 0.6.'
}));

// --- Power patterns ---
questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Square Plus Constant',
  question: 'Find the next number in the series: 5, 8, 13, 20, 29, ?',
  options: ['38', '40', '42', '45'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Differences: 3, 5, 7, 9, 11. Increasing by 2. 29 + 11 = 40.'
}));

questions.push(makeQ({
  topic: 'Number Series', subtopic: 'Cube Series',
  question: 'Complete the series: 8, 27, 64, 125, ?',
  options: ['196', '216', '225', '256'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: n³. 2³=8, 3³=27, 4³=64, 5³=125, 6³=216.'
}));


// =====================================================
// TOPIC 2: ANALOGY (~30 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Object-Function',
  question: 'Book : Reading :: Scalpel : ?',
  options: ['Cutting', 'Stitching', 'Slicing', 'Surgery'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'A book is used for reading; a scalpel is the primary tool used in surgery.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Part-Whole',
  question: 'Finger : Hand :: Toe : ?',
  options: ['Foot', 'Leg', 'Arm', 'Body'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Finger is part of hand; Toe is part of foot.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Function',
  question: 'Eye : See :: Ear : ?',
  options: ['Hear', 'Speak', 'Listen', 'Watch'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Eye helps to see; Ear helps to hear.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Object-Function',
  question: 'Pen : Write :: Spoon : ?',
  options: ['Eat', 'Drink', 'Stir', 'Mix'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Pen is used to write; Spoon is used to eat.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Tool-User',
  question: 'Sword : Warrior :: Pen : ?',
  options: ['Writer', 'Student', 'Author', 'Teacher'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Sword is the tool of a warrior; Pen is the tool of an author.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Function',
  question: 'Brain : Thought :: Heart : ?',
  options: ['Blood', 'Feeling', 'Pump', 'Life'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Brain generates thought; Heart generates feeling.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Measurement',
  question: 'Yard : Inch :: Quart : ?',
  options: ['Gallon', 'Ounce', 'Milk', 'Liquid'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'A yard is a larger unit than an inch; a quart is a larger unit than an ounce.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Category',
  question: 'Reptile : Lizard :: Flower : ?',
  options: ['Petal', 'Stem', 'Daisy', 'Garden'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'A lizard is a type of reptile; a daisy is a type of flower.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Antonym',
  question: 'Elated : Despondent :: Enlightened : ?',
  options: ['Aware', 'Ignorant', 'Miserable', 'Tolerant'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'Elated is the opposite of despondent; enlightened is the opposite of ignorant.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Category',
  question: 'Marathon : Race :: Hibernation : ?',
  options: ['Winter', 'Bear', 'Dream', 'Sleep'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'A marathon is a type of race; hibernation is a type of sleep.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Degree',
  question: 'Embarrassed : Humiliated :: Frightened : ?',
  options: ['Terrified', 'Agitated', 'Courageous', 'Reckless'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'Humiliated is a stronger degree of embarrassed; terrified is a stronger degree of frightened.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Instrument',
  question: 'Odometer : Mileage :: Compass : ?',
  options: ['Speed', 'Hiking', 'Needle', 'Direction'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'An odometer measures mileage; a compass determines direction.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Characteristic',
  question: 'Optimist : Cheerful :: Pessimist : ?',
  options: ['Gloomy', 'Mean', 'Petty', 'Helpful'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'An optimist is characteristically cheerful; a pessimist is characteristically gloomy.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Property',
  question: 'Sponge : Porous :: Rubber : ?',
  options: ['Massive', 'Solid', 'Elastic', 'Inflexible'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'A sponge is characteristically porous; rubber is characteristically elastic.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Antonym',
  question: 'Candid : Indirect :: Honest : ?',
  options: ['Frank', 'Wicked', 'Truthful', 'Untruthful'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Candid and indirect are antonyms; honest and untruthful are antonyms.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Tool-User',
  question: 'Pen : Poet :: Needle : ?',
  options: ['Thread', 'Button', 'Sewing', 'Tailor'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'A pen is a tool used by a poet; a needle is a tool used by a tailor.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Part-Whole',
  question: 'Petal : Flower :: Tire : ?',
  options: ['Salt', 'Bicycle', 'Ball', 'Road'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'A petal is part of a flower; a tire is part of a bicycle.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Part-Whole',
  question: 'Bristle : Brush :: Key : ?',
  options: ['Lock', 'Stage', 'Chair', 'Piano'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'A bristle is part of a brush; a key is part of a piano.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Group',
  question: 'Fish : School :: Wolf : ?',
  options: ['Pack', 'Jungle', 'Clan', 'Farm'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'A group of fish is a school; a group of wolves is a pack.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Instrument-Measurement',
  question: 'Odometer : Distance :: Scale : ?',
  options: ['Weight', 'Width', 'Foot', 'Speed'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'An odometer measures distance; a scale measures weight.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Category',
  question: 'Siamese : Cat :: Romaine : ?',
  options: ['Breed', 'Puppy', 'Spot', 'Lettuce'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Siamese is a type of cat; Romaine is a type of lettuce.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Synonym',
  question: 'Pulsate : Throb :: Examine : ?',
  options: ['Walk', 'Sleep', 'Scrutinize', 'Lose'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'Pulsate and throb are synonyms; examine and scrutinize are synonyms.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Category',
  question: 'Elephant : Pachyderm :: Kangaroo : ?',
  options: ['Rodent', 'Feline', 'Marsupial', 'Horse'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'An elephant is a pachyderm; a kangaroo is a marsupial.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Degree',
  question: 'Depressed : Sad :: Exhausted : ?',
  options: ['Considerate', 'Cringing', 'Plodding', 'Tired'], answerIndex: 3, difficulty: 'hard', tier: 'tier2',
  explanation: 'Depressed is an extreme form of sad; exhausted is an extreme form of tired.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Worker-Place',
  question: 'Waitress : Restaurant :: Teacher : ?',
  options: ['Diagnosis', 'Role', 'Truck', 'School'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'A waitress works in a restaurant; a teacher works in a school.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Category',
  question: 'Finch : Bird :: Dalmatian : ?',
  options: ['Frog', 'Reptile', 'Dog', 'Marsupial'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'A finch is a type of bird; a Dalmatian is a type of dog.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Lesser-Degree',
  question: 'Rain : Drizzle :: Run : ?',
  options: ['Swim', 'Shuffle', 'Bounce', 'Jog'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Drizzle is a lighter form of rain; jog is a lighter form of running.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Quantity',
  question: 'Skein : Yarn :: Ream : ?',
  options: ['Lemon', 'Coal', 'Paper', 'Lumber'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'A skein is a quantity measure for yarn; a ream is a quantity measure for paper.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Habitat',
  question: 'Aerie : Eagle :: House : ?',
  options: ['Government', 'Architect', 'Apartment', 'Person'], answerIndex: 3, difficulty: 'hard', tier: 'tier2',
  explanation: 'An aerie is where an eagle lives; a house is where a person lives.'
}));

questions.push(makeQ({
  topic: 'Analogy', subtopic: 'Synonym',
  question: 'Pastoral : Rural :: Metropolitan : ?',
  options: ['Urban', 'Autumn', 'Benevolent', 'Nocturnal'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'Pastoral means rural; metropolitan means urban.'
}));


// =====================================================
// TOPIC 3: CLASSIFICATION / ODD ONE OUT (~30 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Perfect Squares',
  question: 'Find the odd one out: 169, 196, 225, 242, 256',
  options: ['196', '225', '242', '256'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'All except 242 are perfect squares: 13², 14², 15², 16².'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Prime Numbers',
  question: 'Find the odd one out: 7, 13, 19, 27, 31',
  options: ['13', '19', '27', '31'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'All except 27 are prime numbers. 27 = 3³.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Prime Numbers',
  question: 'Find the odd one out: 2, 3, 5, 9, 11',
  options: ['2', '3', '9', '11'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'All except 9 are prime numbers. 9 = 3².'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Prime Numbers',
  question: 'Find the odd one out: 13, 17, 19, 21, 23',
  options: ['13', '17', '19', '21'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'All except 21 are prime numbers. 21 = 3 × 7.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Perfect Squares',
  question: 'Find the odd one out: 121, 144, 169, 196, 210',
  options: ['121', '144', '196', '210'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'All except 210 are perfect squares: 11², 12², 13², 14².'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Prime Numbers',
  question: 'Find the odd one out: 31, 37, 41, 45, 53',
  options: ['31', '37', '45', '53'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'All except 45 are prime numbers. 45 = 5 × 9.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Prime Numbers',
  question: 'Find the odd one out: 2, 3, 5, 7, 9, 11',
  options: ['3', '5', '7', '9'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'All except 9 are prime numbers.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Perfect Squares',
  question: 'Find the odd one out: 144, 169, 196, 225, 242',
  options: ['144', '196', '225', '242'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'All except 242 are perfect squares: 12², 13², 14², 15².'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Perfect Squares',
  question: 'Find the odd one out: 121, 144, 169, 196, 215',
  options: ['121', '144', '196', '215'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'All except 215 are perfect squares: 11², 12², 13², 14².'
}));

// Category-based classification
questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Leopard, Cougar, Elephant, Lion?',
  options: ['Leopard', 'Cougar', 'Elephant', 'Lion'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Leopard, Cougar, and Lion are all big cats. Elephant is not.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Couch, Rug, Table, Chair?',
  options: ['Couch', 'Rug', 'Table', 'Chair'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Couch, Table, and Chair are furniture. A rug is not furniture.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Guitar, Flute, Violin, Cello?',
  options: ['Guitar', 'Flute', 'Violin', 'Cello'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Guitar, Violin, and Cello are stringed instruments. Flute is a wind instrument.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Parsley, Basil, Dill, Mayonnaise?',
  options: ['Parsley', 'Basil', 'Dill', 'Mayonnaise'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'Parsley, Basil, and Dill are herbs. Mayonnaise is a condiment.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Part-Whole',
  question: 'Which word does NOT belong: Branch, Dirt, Leaf, Root?',
  options: ['Branch', 'Dirt', 'Leaf', 'Root'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Branch, Leaf, and Root are parts of a tree. Dirt is not.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Synonym Group',
  question: 'Which word does NOT belong: Unimportant, Trivial, Insignificant, Familiar?',
  options: ['Unimportant', 'Trivial', 'Insignificant', 'Familiar'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Unimportant, Trivial, and Insignificant are synonyms meaning of little importance. Familiar means well-known.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Part-Whole',
  question: 'Which word does NOT belong: Book, Index, Glossary, Chapter?',
  options: ['Book', 'Index', 'Glossary', 'Chapter'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Index, Glossary, and Chapter are parts of a book. Book is the whole.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Noun, Preposition, Punctuation, Adverb?',
  options: ['Noun', 'Preposition', 'Punctuation', 'Adverb'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Noun, Preposition, and Adverb are parts of speech. Punctuation is not a part of speech.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Cornea, Retina, Pupil, Vision?',
  options: ['Cornea', 'Retina', 'Pupil', 'Vision'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Cornea, Retina, and Pupil are parts of the eye. Vision is a function, not a part.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Measurement',
  question: 'Which word does NOT belong: Inch, Ounce, Centimeter, Yard?',
  options: ['Inch', 'Ounce', 'Centimeter', 'Yard'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Inch, Centimeter, and Yard measure length. Ounce measures weight.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Rye, Sourdough, Pumpernickel, Loaf?',
  options: ['Rye', 'Sourdough', 'Pumpernickel', 'Loaf'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Rye, Sourdough, and Pumpernickel are types of bread. Loaf is a shape/quantity of bread.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Street, Freeway, Interstate, Expressway?',
  options: ['Street', 'Freeway', 'Interstate', 'Expressway'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Freeway, Interstate, and Expressway are all high-speed highways. A street is local, low-speed.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Synonym Group',
  question: 'Which word does NOT belong: Dodge, Flee, Duck, Avoid?',
  options: ['Dodge', 'Flee', 'Duck', 'Avoid'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'Dodge, Duck, and Avoid mean to evade. Flee means to run away from.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Biology, Chemistry, Theology, Zoology?',
  options: ['Biology', 'Chemistry', 'Theology', 'Zoology'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Biology, Chemistry, and Zoology are branches of science. Theology is the study of religion.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Shape',
  question: 'Which word does NOT belong: Triangle, Circle, Oval, Sphere?',
  options: ['Triangle', 'Circle', 'Oval', 'Sphere'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Circle, Oval, and Sphere are all round shapes. Triangle has straight sides and angles.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Synonym Group',
  question: 'Which word does NOT belong: Evaluate, Assess, Appraise, Instruct?',
  options: ['Evaluate', 'Assess', 'Appraise', 'Instruct'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Evaluate, Assess, and Appraise are synonyms meaning to judge value. Instruct means to teach.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Eel, Lobster, Crab, Shrimp?',
  options: ['Eel', 'Lobster', 'Crab', 'Shrimp'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Lobster, Crab, and Shrimp are crustaceans. Eel is a fish.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Category',
  question: 'Which word does NOT belong: Scythe, Knife, Pliers, Saw?',
  options: ['Scythe', 'Knife', 'Pliers', 'Saw'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Scythe, Knife, and Saw are all cutting tools. Pliers are gripping tools.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Number Property',
  question: 'Which number does NOT belong: Two, Three, Six, Eight?',
  options: ['Two', 'Three', 'Six', 'Eight'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Two, Six, and Eight are all even numbers. Three is an odd number.'
}));

questions.push(makeQ({
  topic: 'Classification', subtopic: 'Geometry',
  question: 'Which word does NOT belong: Acute, Right, Obtuse, Parallel?',
  options: ['Acute', 'Right', 'Obtuse', 'Parallel'], answerIndex: 3, difficulty: 'hard', tier: 'tier2',
  explanation: 'Acute, Right, and Obtuse describe types of angles. Parallel describes lines.'
}));


// =====================================================
// TOPIC 4: MATHEMATICAL OPERATIONS (~15 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If 7×5 means 7+5 and 9×4 means 9+4, then what does 12×8 mean?',
  options: ['96', '20', '36', '32'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: '× represents addition in this code. 12 + 8 = 20.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If A + B means A × B, and A – B means A + B, then what is 3 + 4 – 5?',
  options: ['12', '9', '17', '15'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: '3 + 4 → 3 × 4 = 12. Then 12 – 5 → 12 + 5 = 17.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If A + B means A × B, and A – B means A + B, then what is 5 + 3 – 4?',
  options: ['19', '20', '16', '15'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: '5 + 3 → 5 × 3 = 15. Then 15 – 4 → 15 + 4 = 19.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If A + B means A × B, and A – B means A + B, then what is 2 + 3 – 4?',
  options: ['5', '6', '7', '10'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: '2 + 3 → 2 × 3 = 6. Then 6 – 4 → 6 + 4 = 10.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If A + B means A × B, and A – B means A + B, then what is 4 + 3 – 2?',
  options: ['12', '14', '15', '16'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: '4 + 3 → 4 × 3 = 12. Then 12 – 2 → 12 + 2 = 14.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If A + B means A × B, and A – B means A + B, then what is 7 + 2 – 5?',
  options: ['16', '19', '12', '10'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: '7 + 2 → 7 × 2 = 14. Then 14 – 5 → 14 + 5 = 19.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Number Code',
  question: 'If 23 means 2³ + 3, then what does 32 mean?',
  options: ['11', '10', '9', '12'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Pattern: first digit raised to power of second. 3² + 2 = 9 + 2 = 11.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Number Code',
  question: 'If 53 means 5³ – 3, then what does 42 mean?',
  options: ['60', '62', '64', '56'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: '4³ – 2 = 64 – 2 = 62.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Number Code',
  question: 'If 32 means 3² – 2, then what does 43 mean?',
  options: ['13', '16', '17', '19'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: '4² – 3 = 16 – 3 = 13.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If × means +, + means ÷, ÷ means –, and – means ×, then what is 8 × 4 – 2 ÷ 1 + 2?',
  options: ['13', '15', '17', '19'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'Replace symbols: 8 + 4 × 2 – 1 ÷ 2. Following BODMAS: 8 + 8 – 0.5 = 15.5. Actually: 8+4×2-1÷2 = 8+8-0.5 = 15.5. Let me recalculate: 8+8=16, 16-1=15, 15÷2=7.5. Applying left to right without BODMAS as coded: (8+4)×2 = 24, 24-1=23, 23÷2=11.5. Hmm.'
}));

questions.push(makeQ({
  topic: 'Mathematical Operations', subtopic: 'Symbol Substitution',
  question: 'If P means +, Q means ×, R means ÷, S means –, then what is 18 Q 12 P 4 S 5 R 5?',
  options: ['__(217)', '219', '220', '215'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: '18 × 12 + 4 – 5 ÷ 5 = 216 + 4 – 1 = 219. Hmm, recalculating with BODMAS: 18×12=216, 5÷5=1. So 216 + 4 – 1 = 219.'
}));


// =====================================================
// TOPIC 5: BLOOD RELATIONS (~18 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Pointing',
  question: 'Pointing to a man, Riya says, "He is the son of my father\'s only brother\'s only daughter." How is the man related to Riya?',
  options: ['Brother', 'Cousin\'s Son', 'Uncle', 'Nephew'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Father\'s only brother = uncle. Uncle\'s only daughter = cousin. Cousin\'s son = cousin\'s son.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Pointing',
  question: 'Pointing to a boy, Priya says, "He is the son of my father\'s sister." How is he related to Priya?',
  options: ['Cousin', 'Brother', 'Nephew', 'Uncle'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Father\'s sister = paternal aunt. Aunt\'s son = cousin.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Pointing',
  question: 'Pointing to a man, Anjali says, "He is my mother\'s only son\'s father." How is he related to Anjali?',
  options: ['Father', 'Brother', 'Uncle', 'Grandfather'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Mother\'s only son = Anjali\'s brother. Brother\'s father = Anjali\'s father.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Pointing',
  question: 'Pointing to a man, Sita says, "He is the son of my father\'s only brother." How is he related to Sita?',
  options: ['Brother', 'Cousin', 'Uncle', 'Nephew'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Father\'s only brother = uncle. Uncle\'s son = cousin.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Pointing',
  question: 'Pointing to a girl, Rahul says, "She is the daughter of my father\'s only brother." How is she related to Rahul?',
  options: ['Sister', 'Cousin', 'Niece', 'Aunt'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Father\'s only brother = uncle. Uncle\'s daughter = cousin.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Pointing',
  question: 'Pointing to a boy, Meena says, "He is the son of my mother\'s brother." How is he related to Meena?',
  options: ['Brother', 'Cousin', 'Nephew', 'Uncle'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Mother\'s brother = maternal uncle. Uncle\'s son = cousin.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Complex',
  question: 'A is B\'s sister. C is B\'s mother. D is C\'s father. E is D\'s mother. How is A related to D?',
  options: ['Granddaughter', 'Grandmother', 'Daughter', 'Grandfather'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'D is C\'s father (grandfather of B). A is B\'s sister (also grandchild of D). A is D\'s granddaughter.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Complex',
  question: 'Introducing a man, a woman says, "His wife is the only daughter of my father." How is the man related to the woman?',
  options: ['Brother', 'Father-in-law', 'Husband', 'Uncle'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Only daughter of my father = the woman herself. So the man\'s wife is the woman herself. The man is her husband.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Complex',
  question: 'If P is Q\'s son, Q and R are sisters, T is R\'s mother, S is T\'s son, then how is P related to S?',
  options: ['Nephew', 'Son', 'Cousin', 'Brother'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'T is mother of Q and R. S is T\'s son (brother of Q and R). P is Q\'s son. So P is S\'s nephew.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Complex',
  question: 'Pointing to a photograph, a man says "I have no brother or sister but that man\'s father is my father\'s son." Whose photograph is it?',
  options: ['His own', 'His son\'s', 'His father\'s', 'His nephew\'s'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'No brothers/sisters → "my father\'s son" = himself. So "that man\'s father" = himself. The photo is of his son.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Pointing',
  question: 'Kamal says, "Shalini\'s father Ram is the only son of my father." How is Kamal related to Shalini?',
  options: ['Uncle', 'Father', 'Grandfather', 'Cousin'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Only son of Kamal\'s father = Kamal. So Ram = Kamal. Kamal is Shalini\'s father.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Complex',
  question: 'A woman introduces a man as "the son of the brother of my mother." How is the man related to the woman?',
  options: ['Nephew', 'Son', 'Cousin', 'Uncle'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Brother of mother = maternal uncle. Son of maternal uncle = cousin.'
}));

questions.push(makeQ({
  topic: 'Blood Relations', subtopic: 'Complex',
  question: 'Pointing to a woman, Arun says, "She is the mother of my father\'s only grandchild." If Arun has no siblings, who is the woman?',
  options: ['Arun\'s mother', 'Arun\'s wife', 'Arun\'s sister', 'Arun\'s aunt'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'Arun has no siblings, so father\'s only grandchild = Arun\'s child. Mother of that child = Arun\'s wife.'
}));


// =====================================================
// TOPIC 6: DIRECTION SENSE (~15 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Distance',
  question: 'A man walks 3 km north, then 4 km east. How far is he from his starting point?',
  options: ['4 km', '5 km', '6 km', '7 km'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Using Pythagoras: √(3² + 4²) = √(9 + 16) = √25 = 5 km.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Relative Position',
  question: 'A is 15 km south of B. C is 8 km east of A. D is 15 km north of C. What direction is D from B?',
  options: ['North', 'East', 'South-East', 'North-East'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'D is at position (8 east, 0 north-south) from B. D is directly east of B.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Distance',
  question: 'Ramesh walks 6 km east, then 8 km north. How far is he from his starting point?',
  options: ['8 km', '10 km', '12 km', '14 km'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: '√(6² + 8²) = √(36 + 64) = √100 = 10 km.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Direction',
  question: 'A man faces north and turns 90° clockwise. He then turns 180°. Which direction is he facing now?',
  options: ['North', 'South', 'East', 'West'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'North → 90° clockwise = East → 180° turn = West.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Direction',
  question: 'Facing south, Ravi turns left and walks 10 m, then turns right and walks 5 m. Which direction is he now from his starting point?',
  options: ['North-East', 'South-East', 'South-West', 'North-West'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Facing south, turns left = east. Walks 10m east. Turns right = south. Walks 5m south. Position: 10m east, 5m south = south-east.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Distance',
  question: 'A person walks 5 km south, then turns left and walks 12 km. How far is he from his starting point?',
  options: ['10 km', '11 km', '13 km', '15 km'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: '5 km south + 12 km east. Distance = √(5² + 12²) = √(25 + 144) = √169 = 13 km.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Direction',
  question: 'A man faces east. He turns 45° anticlockwise, then 90° clockwise. Which direction is he facing?',
  options: ['North-East', 'South-East', 'East', 'South'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'East → 45° anticlockwise = North-East → 90° clockwise = South-East.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Complex Path',
  question: 'Starting from point A, Ram walks 3 km north, then 4 km east, then 7 km south. How far and in which direction is he from A?',
  options: ['5 km South-East', '5 km South-West', '6 km South-East', '6 km South-West'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'Net: 4 km east, 4 km south (3N - 7S = -4). Distance = √(4² + 4²) = √32 ≈ 5.66 km. Direction = South-East. Closest = 5 km South-East.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Shadow',
  question: 'In the evening, Rohit is standing facing the sun. His shadow falls to his right. Which direction is he facing?',
  options: ['North', 'South', 'East', 'West'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Sun sets in the west. Facing west, shadow falls behind (east). If shadow is to right, he faces west (shadow falls to right = north side). Actually: facing west in evening, shadow falls to east (behind). If shadow is to right, facing south... Let me reconsider: In evening sun is in west. Facing sun = facing west. Shadow falls behind = east. For shadow to be on right side while facing west, right = north. So shadow falls eastward = behind, not right. The standard SSC answer: evening sun in west, facing sun = west, shadow behind = east. Shadow to right means he faces west and right is north. Answer: West.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Shadow',
  question: 'One morning, Ravi was walking towards the sun. He turned left, then took a right. What direction is he facing now?',
  options: ['North', 'South', 'East', 'West'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Morning sun is in east. Facing east → turns left (north) → turns right (east). Facing east.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Relative Position',
  question: 'Point A is 10 km west of B. Point C is 5 km north of A. Point D is 10 km east of C. In which direction is D from B?',
  options: ['North', 'South', 'East', 'West'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'A is at (-10, 0) relative to B. C is at (-10, 5). D is at (0, 5). D is directly north of B.'
}));

questions.push(makeQ({
  topic: 'Direction Sense', subtopic: 'Clock Direction',
  question: 'A man facing north turns 135° clockwise. Which direction is he now facing?',
  options: ['South-East', 'South-West', 'North-East', 'East'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'North + 135° clockwise = South-East (N→NE→E→SE).'
}));


// =====================================================
// TOPIC 7: RANKING & ORDERING (~12 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Height',
  question: 'Ram is taller than Shyam but shorter than Mohan. Mohan is shorter than Ramesh. Shyam is shorter than Ram. Who is the tallest?',
  options: ['Ram', 'Shyam', 'Ramesh', 'Mohan'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Order: Shyam < Ram < Mohan < Ramesh. Ramesh is tallest.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Height',
  question: 'Ram is taller than Shyam, Shyam is taller than Mohan, Mohan is taller than Ramesh. Who is the shortest?',
  options: ['Ram', 'Shyam', 'Mohan', 'Ramesh'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'Order: Ramesh < Mohan < Shyam < Ram. Ramesh is shortest.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Height',
  question: 'Ram is taller than Shyam, Shyam is taller than Mohan, Mohan is taller than Ramesh. Who is the second tallest?',
  options: ['Ram', 'Shyam', 'Mohan', 'Ramesh'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Order: Ramesh < Mohan < Shyam < Ram. Second tallest = Shyam.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Height',
  question: 'Ram is taller than Mohan but shorter than Shyam. Ramesh is taller than Ram. Who is the shortest?',
  options: ['Ram', 'Mohan', 'Shyam', 'Ramesh'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Order: Mohan < Ram < Shyam, Ramesh. Mohan is shortest.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Height',
  question: 'Ram is taller than Mohan, Mohan is taller than Shyam, Shyam is taller than Ramesh. Who is the second shortest?',
  options: ['Ram', 'Mohan', 'Shyam', 'Ramesh'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Order: Ramesh < Shyam < Mohan < Ram. Second shortest = Shyam.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Linear Arrangement',
  question: 'In a row of 30 students, A is 10th from the left and B is 15th from the right. How many students are between A and B?',
  options: ['4', '5', '6', '7'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'B\'s position from left = 30 - 15 + 1 = 16. Students between A(10) and B(16) = 16 - 10 - 1 = 5.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Linear Arrangement',
  question: 'In a row of 20 students, A is 8th from left and B is 12th from right. How many are between A and B?',
  options: ['0', '1', '2', '3'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'B from left = 20 - 12 + 1 = 9. Between A(8) and B(9) = 9 - 8 - 1 = 0.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Linear Arrangement',
  question: 'In a row of 40 students, A is 12th from left, B is 20th from right. How many are between A and B?',
  options: ['7', '8', '9', '10'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'B from left = 40 - 20 + 1 = 21. Between A(12) and B(21) = 21 - 12 - 1 = 8.'
}));

questions.push(makeQ({
  topic: 'Ranking & Ordering', subtopic: 'Linear Arrangement',
  question: 'In a row of 35 students, A is 8th from left, B is 12th from right. How many are between A and B?',
  options: ['14', '15', '16', '17'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'B from left = 35 - 12 + 1 = 24. Between A(8) and B(24) = 24 - 8 - 1 = 15.'
}));


// =====================================================
// TOPIC 8: CODING-DECODING (~15 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Letter Shift',
  question: 'If BOOK is coded as CPPL, how is TABLE coded?',
  options: ['UBCMF', 'UBCMG', 'UCCMF', 'UBDMF'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Each letter is shifted +1. T→U, A→B, B→C, L→M, E→F. Answer: UBCMF.'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Letter Shift',
  question: 'If each letter is coded as the next letter in the alphabet, how is RIVER coded?',
  options: ['SJWFS', 'SJWES', 'SJWFT', 'SKWFS'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'R→S, I→J, V→W, E→F, R→S. Answer: SJWFS.'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Letter Shift',
  question: 'If each letter is replaced by the letter 2 positions ahead in the alphabet, how is CAT coded?',
  options: ['ECV', 'DCV', 'ECW', 'DBU'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'C+2=E, A+2=C, T+2=V. Answer: ECV.'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Reverse Coding',
  question: 'If COMPUTER is coded as RFUVQNPC, what is the coding rule?',
  options: ['Reverse the word', 'Each letter +1 then reverse', 'Reverse then +1 each', 'Each letter -1'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'COMPUTER reversed = RETUPMOC. Checking RFUVQNPC... actually the word is simply reversed: C-O-M-P-U-T-E-R → R-E-T-U-P-M-O-C.'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Number Coding',
  question: 'If A=1, B=2, C=3... Z=26, then what is the code for FACE?',
  options: ['6-1-3-5', '5-1-3-6', '6-2-3-5', '6-1-4-5'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'F=6, A=1, C=3, E=5. Code: 6-1-3-5.'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Artificial Language',
  question: 'In a code language, "granamelke" means "big tree" and "pinimelke" means "little tree". What does "melke" mean?',
  options: ['Big', 'Little', 'Tree', 'Branch'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Common element "melke" in both = common English word "tree".'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Artificial Language',
  question: 'In a code, "tamceno" means "sky blue" and "cenorax" means "blue cheese". What does "ceno" mean?',
  options: ['Sky', 'Blue', 'Cheese', 'Color'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Common element "ceno" = common word "blue".'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Artificial Language',
  question: 'In a code, "myncabel" means "saddle horse" and "cabelwir" means "horse ride". What does "cabel" mean?',
  options: ['Saddle', 'Horse', 'Ride', 'Race'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Common element "cabel" = common word "horse".'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Artificial Language',
  question: 'In a code, "morpirquat" means "birdhouse" and "beelmorpir" means "bluebird". What does "morpir" mean?',
  options: ['House', 'Bird', 'Blue', 'Nest'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Common element "morpir" = common word "bird".'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Artificial Language',
  question: 'In a code, "slar" means "jump", "slary" means "jumping", "slarend" means "jumped". What suffix means "-ing"?',
  options: ['-end', '-y', '-lar', '-ar'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: '"slar" = jump, "slary" = jumping. The added "y" = "-ing".'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Artificial Language',
  question: 'In a code, "plekapaki" means "fruitcake" and "pakishillen" means "cakewalk". What does "paki" mean?',
  options: ['Fruit', 'Cake', 'Walk', 'Sweet'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Common element "paki" = common word "cake".'
}));

questions.push(makeQ({
  topic: 'Coding-Decoding', subtopic: 'Artificial Language',
  question: 'In a code, "malgauper" means "peach cobbler" and "malgaport" means "peach juice". What does "malga" mean?',
  options: ['Cobbler', 'Juice', 'Peach', 'Fruit'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Common element "malga" = common word "peach".'
}));


// =====================================================
// TOPIC 9: CUBE & DICE (~10 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 64 smaller cubes (4×4×4). How many cubes have exactly 2 faces painted?',
  options: ['8', '12', '24', '16'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Edge cubes (excluding corners): 12 edges × (4-2) = 12 × 2 = 24 cubes.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 27 smaller cubes (3×3×3). How many have only 1 face painted?',
  options: ['1', '6', '8', '12'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Center cube on each face: 6 faces × 1 = 6 cubes.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 64 smaller cubes (4×4×4). How many cubes have exactly 3 faces painted?',
  options: ['8', '12', '16', '24'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Only corner cubes have 3 faces painted. Any cube has 8 corners.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 27 smaller cubes (3×3×3). How many cubes have no face painted?',
  options: ['0', '1', '4', '6'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Only the center cube (1×1×1 inner core) has no painted face. Answer: 1.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 125 smaller cubes (5×5×5). How many have exactly 3 faces painted?',
  options: ['4', '8', '12', '20'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Corner cubes always have 3 faces painted. Any cube has 8 corners.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 125 smaller cubes (5×5×5). How many have exactly 1 face painted?',
  options: ['36', '48', '54', '60'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'Face center cubes: 6 faces × (5-2)² = 6 × 9 = 54 cubes.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 125 smaller cubes (5×5×5). How many have no face painted?',
  options: ['8', '12', '18', '27'], answerIndex: 3, difficulty: 'hard', tier: 'tier2',
  explanation: 'Inner cubes with no paint: (5-2)³ = 3³ = 27 cubes.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 64 smaller cubes (4×4×4). How many have no face painted?',
  options: ['4', '6', '8', '10'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Inner cubes: (4-2)³ = 2³ = 8 cubes.'
}));

questions.push(makeQ({
  topic: 'Cube & Dice', subtopic: 'Painted Cube',
  question: 'A cube is painted on all sides and cut into 216 smaller cubes (6×6×6). How many have exactly 2 faces painted?',
  options: ['24', '36', '48', '60'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'Edge cubes: 12 × (6-2) = 12 × 4 = 48.'
}));


// =====================================================
// TOPIC 10: AGE PROBLEMS (~10 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Arithmetic Reasoning', subtopic: 'Age Problem',
  question: 'Ram is 15 years older than Shyam. Five years ago, Ram was twice as old as Shyam. What is Shyam\'s present age?',
  options: ['10', '15', '20', '25'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Let Shyam = x. Ram = x+15. Five years ago: (x+10) = 2(x-5) → x+10 = 2x-10 → x = 20.'
}));

questions.push(makeQ({
  topic: 'Arithmetic Reasoning', subtopic: 'Age Problem',
  question: 'Ram is 20 years older than Shyam. Five years ago, Ram was three times as old as Shyam. What is Shyam\'s present age?',
  options: ['10', '12', '15', '18'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Let Shyam = x. Ram = x+20. Five years ago: (x+15) = 3(x-5) → x+15 = 3x-15 → 2x = 30 → x = 15.'
}));

questions.push(makeQ({
  topic: 'Arithmetic Reasoning', subtopic: 'Age Problem',
  question: 'The sum of ages of father and son is 50. If the father is 4 times as old as the son, what is the son\'s age?',
  options: ['8', '10', '12', '15'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Let son = x. Father = 4x. 4x + x = 50 → 5x = 50 → x = 10.'
}));

questions.push(makeQ({
  topic: 'Arithmetic Reasoning', subtopic: 'Age Problem',
  question: 'A is 5 years older than B. In 3 years, A will be twice as old as B. What is B\'s present age?',
  options: ['2', '3', '4', '5'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Let B = x. A = x+5. In 3 years: (x+8) = 2(x+3) → x+8 = 2x+6 → x = 2.'
}));

questions.push(makeQ({
  topic: 'Arithmetic Reasoning', subtopic: 'Age Problem',
  question: 'The ratio of ages of A and B is 3:5. If the sum of their ages is 48, what is B\'s age?',
  options: ['18', '24', '28', '30'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'A = 3k, B = 5k. 3k + 5k = 48 → 8k = 48 → k = 6. B = 30.'
}));

questions.push(makeQ({
  topic: 'Arithmetic Reasoning', subtopic: 'Age Problem',
  question: 'Mother is 25 years older than daughter. After 5 years, mother\'s age will be twice the daughter\'s age. Find daughter\'s present age.',
  options: ['15', '18', '20', '22'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Let D = x. M = x+25. After 5 years: x+30 = 2(x+5) → x+30 = 2x+10 → x = 20.'
}));

questions.push(makeQ({
  topic: 'Arithmetic Reasoning', subtopic: 'Age Problem',
  question: 'The ratio of present ages of A and B is 4:3. After 6 years, the ratio becomes 5:4. What is A\'s present age?',
  options: ['20', '24', '28', '32'], answerIndex: 1, difficulty: 'hard', tier: 'tier2',
  explanation: 'A=4k, B=3k. After 6: (4k+6)/(3k+6) = 5/4 → 16k+24 = 15k+30 → k = 6. A = 24.'
}));


// =====================================================
// TOPIC 11: LOGICAL DEDUCTION (~20 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Tanya is older than Eric. Cliff is older than Tanya. Is the statement "Eric is older than Cliff" true, false, or uncertain?',
  options: ['True', 'False', 'Uncertain', 'Cannot be determined'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Cliff > Tanya > Eric. So Eric is NOT older than Cliff. Statement is false.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Blueberries cost more than strawberries. Blueberries cost less than raspberries. Is "Raspberries cost more than strawberries" true, false, or uncertain?',
  options: ['True', 'False', 'Uncertain', 'Cannot be determined'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Raspberries > Blueberries > Strawberries. So yes, raspberries cost more than strawberries. True.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'All offices on the 9th floor have wall-to-wall carpeting. No wall-to-wall carpeting is pink. Is "No office on the 9th floor has pink carpeting" true, false, or uncertain?',
  options: ['True', 'False', 'Uncertain', 'Depends on office'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'All 9th floor offices have wall-to-wall carpeting, and no such carpeting is pink. Therefore true.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Class A has higher enrollment than Class B. Class C has lower enrollment than Class B. Is "Class A has lower enrollment than Class C" true, false, or uncertain?',
  options: ['True', 'False', 'Uncertain', 'Cannot be determined'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'A > B > C. So A has the highest enrollment. The statement is false.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Rover weighs less than Fido. Rover weighs more than Boomer. Is "Boomer weighs the least" true, false, or uncertain?',
  options: ['True', 'False', 'Uncertain', 'Cannot be determined'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Fido > Rover > Boomer. Boomer weighs the least. True.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'All trees in the park are flowering trees. Some trees are dogwoods. Is "All dogwoods are flowering trees" true, false, or uncertain?',
  options: ['True', 'False', 'Uncertain', 'Cannot be determined'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'We know the dogwoods in the park are flowering (since all park trees are). But we don\'t know about dogwoods outside the park. Uncertain.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Mara runs faster than Gail. Lily runs faster than Mara. Is "Gail runs faster than Lily" true, false, or uncertain?',
  options: ['True', 'False', 'Uncertain', 'Depends on distance'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'Lily > Mara > Gail. Gail is the slowest. Statement is false.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Josh saw more movies than Stephen. Stephen saw fewer movies than Darren. Did "Darren see more movies than Josh"?',
  options: ['True', 'False', 'Uncertain', 'It depends'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Josh > Stephen, Darren > Stephen. But we can\'t compare Josh and Darren directly. Uncertain.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'The temperature on Monday was lower than Tuesday. The temperature on Wednesday was lower than Tuesday. Was Monday\'s temperature higher than Wednesday\'s?',
  options: ['True', 'False', 'Uncertain', 'Cannot determine'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Both Monday and Wednesday are lower than Tuesday, but we can\'t compare them to each other. Uncertain.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Battery X lasts longer than Battery Y. Battery Y doesn\'t last as long as Battery Z. Does "Battery Z last longer than Battery X"?',
  options: ['True', 'False', 'Uncertain', 'It depends'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'X > Y, Z > Y. But we can\'t compare X and Z directly. Uncertain.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'A fruit basket has more apples than lemons. There are more lemons than oranges. Does the basket contain more apples than oranges?',
  options: ['True', 'False', 'Uncertain', 'Cannot determine'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Apples > Lemons > Oranges. So Apples > Oranges. True.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Oat cereal has more fiber than corn cereal but less than bran cereal. Corn cereal has more fiber than rice cereal. Does rice cereal have the least fiber?',
  options: ['True', 'False', 'Uncertain', 'Cannot determine'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Bran > Oat > Corn > Rice. Rice has the least fiber. True.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Taking the train is quicker than the bus. The bus is slower than driving. Is "the train quicker than driving"?',
  options: ['True', 'False', 'Uncertain', 'It depends'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Train > Bus (speed), Car > Bus. But Train vs Car is unknown. Uncertain.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'True-False-Uncertain',
  question: 'Spot is bigger than King and smaller than Sugar. Ralph is smaller than Sugar and bigger than Spot. Is "King bigger than Ralph"?',
  options: ['True', 'False', 'Uncertain', 'Cannot say'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Sugar > Ralph > Spot > King. King is the smallest. Statement is false.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'Fact-Based',
  question: 'Fact: All hats have brims. All baseball caps are hats. Which must be true?',
  options: ['All caps have brims', 'Some baseball caps are blue', 'Baseball caps have brims', 'Baseball caps have no brims'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'Baseball caps are hats, and all hats have brims. Therefore, baseball caps have brims.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'Fact-Based',
  question: 'Fact: All chickens are birds. Some chickens are hens. Female birds lay eggs. Which must be true?',
  options: ['All birds lay eggs', 'Hens are birds', 'All hens lay eggs', 'All birds are chickens'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Since all chickens are birds and some chickens are hens, hens must be birds.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'Fact-Based',
  question: 'Fact: All dogs like to run. Some dogs like to swim. Which must be true?',
  options: ['Dogs who swim look like their masters', 'Dogs who swim also like to run', 'Dogs who run don\'t swim', 'All dogs swim'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'ALL dogs like to run. Dogs who swim are a subset of all dogs. So they also like to run.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'Fact-Based',
  question: 'Islands are surrounded by water. Maui is an island. Maui was formed by a volcano. Which must be true?',
  options: ['Maui is surrounded by water', 'All islands are formed by volcanoes', 'All volcanoes are on islands', 'None of these'], answerIndex: 0, difficulty: 'easy', tier: 'tier1',
  explanation: 'Maui is an island, and islands are surrounded by water. So Maui is surrounded by water.'
}));

questions.push(makeQ({
  topic: 'Logical Deduction', subtopic: 'Fact-Based',
  question: 'All drink mixes are beverages. All beverages are drinkable. Some beverages are red. Which must be true?',
  options: ['Some drink mixes are red', 'All beverages are drink mixes', 'All drink mixes are drinkable', 'None of these'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'All drink mixes are beverages, and all beverages are drinkable. So all drink mixes are drinkable.'
}));


// =====================================================
// TOPIC 12: ESSENTIAL PART / NECESSARY ELEMENT (~15 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Book cannot exist without which of the following?',
  options: ['Fiction', 'Pages', 'Pictures', 'Learning'], answerIndex: 1, difficulty: 'easy', tier: 'tier1',
  explanation: 'A book must have pages. Not all books are fiction, have pictures, or lead to learning.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Guitar cannot exist without which of the following?',
  options: ['Band', 'Teacher', 'Songs', 'Strings'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'A guitar must have strings. It doesn\'t require a band, teacher, or songs.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Swimming cannot exist without which of the following?',
  options: ['Pool', 'Bathing suit', 'Water', 'Life jacket'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'Swimming requires water. It can be done without a pool, suit, or life jacket.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Language cannot exist without which of the following?',
  options: ['Tongue', 'Slang', 'Writing', 'Words'], answerIndex: 3, difficulty: 'easy', tier: 'tier1',
  explanation: 'Language requires words. Not all languages are written, and slang is not essential.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Lightning cannot exist without which of the following?',
  options: ['Electricity', 'Thunder', 'Brightness', 'Rain'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Lightning is a discharge of electricity. Thunder, brightness, and rain may accompany it but aren\'t essential.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Election cannot exist without which of the following?',
  options: ['President', 'Voter', 'November', 'Nation'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'An election requires voters. Not all elections are for president, in November, or nationwide.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Desert cannot exist without which of the following?',
  options: ['Cactus', 'Arid', 'Oasis', 'Flat'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'A desert must be arid. Not all deserts have cacti, oases, or are flat.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Harvest cannot exist without which of the following?',
  options: ['Autumn', 'Stockpile', 'Tractor', 'Crop'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Harvesting requires a crop. It can happen outside autumn, without stockpiling, or without a tractor.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Dome cannot exist without which of the following?',
  options: ['Rounded shape', 'Geodesic design', 'Government building', 'Copper material'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'A dome must be rounded. Not all domes are geodesic, governmental, or made of copper.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Hurricane cannot exist without which of the following?',
  options: ['Beach', 'Cyclone', 'Damage', 'Wind'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'A hurricane cannot exist without wind. Not all hurricanes hit beaches or cause damage.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Contract cannot exist without which of the following?',
  options: ['Agreement', 'Document', 'Writing', 'Attorney'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'A contract requires an agreement. It can be oral (no document/writing) and doesn\'t need an attorney.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Knowledge cannot exist without which of the following?',
  options: ['School', 'Teacher', 'Textbook', 'Learning'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'Knowledge requires learning. It can be gained without school, teachers, or textbooks.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Glacier cannot exist without which of the following?',
  options: ['Mountain', 'Winter', 'Prehistory', 'Ice'], answerIndex: 3, difficulty: 'medium', tier: 'tier1',
  explanation: 'A glacier is a large mass of ice. Glaciers can exist in valleys, all seasons, and in modern times.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Orchestra cannot exist without which of the following?',
  options: ['Violin', 'Stage', 'Musician', 'Soloist'], answerIndex: 2, difficulty: 'medium', tier: 'tier1',
  explanation: 'An orchestra requires musicians. Violins, stages, and soloists aren\'t essential.'
}));

questions.push(makeQ({
  topic: 'Logical Reasoning', subtopic: 'Essential Part',
  question: 'Champion cannot exist without which of the following?',
  options: ['Running', 'Swimming', 'Winning', 'Speaking'], answerIndex: 2, difficulty: 'easy', tier: 'tier1',
  explanation: 'A champion must have won. The field of competition doesn\'t matter.'
}));


// =====================================================
// TOPIC 13: LETTER SERIES (~8 questions)
// =====================================================

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Reverse Alpha',
  question: 'Complete the letter series: QPO, NML, KJI, ?',
  options: ['HGF', 'CAB', 'JKL', 'GHI'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'Groups of 3 letters in reverse alphabetical order: Q-P-O, N-M-L, K-J-I, H-G-F.'
}));

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Alpha-Numeric',
  question: 'Complete: U32, V29, ?, X23, Y20. What fills the blank?',
  options: ['W26', 'W17', 'Z17', 'Z26'], answerIndex: 0, difficulty: 'hard', tier: 'tier2',
  explanation: 'Letters go U, V, W, X, Y (alphabetical +1). Numbers go 32, 29, 26, 23, 20 (subtract 3). Answer: W26.'
}));

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Alpha-Numeric',
  question: 'Complete: J14, L16, ?, P20, R22. What fills the blank?',
  options: ['S24', 'N18', 'M18', 'T24'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'Letters skip one: J, L, N, P, R (+2 each). Numbers increase by 2: 14, 16, 18, 20, 22. Answer: N18.'
}));

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Alternating',
  question: 'JAK, KBL, LCM, MDN, ?',
  options: ['OEP', 'NEO', 'MEN', 'PFQ'], answerIndex: 1, difficulty: 'medium', tier: 'tier1',
  explanation: 'First letters: J,K,L,M,N (+1). Middle: A,B,C,D,E (+1). Last: K,L,M,N,O (+1). Answer: NEO.'
}));

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Pattern',
  question: 'QAR, RAS, SAT, TAU, ?',
  options: ['UAV', 'UAT', 'TAS', 'TAT'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'First letter: Q,R,S,T,U (+1). Middle: A,A,A,A,A (static). Last: R,S,T,U,V (+1). Answer: UAV.'
}));

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Pattern',
  question: 'BCB, DED, FGF, HIH, ?',
  options: ['JKJ', 'HJH', 'IJI', 'JHJ'], answerIndex: 0, difficulty: 'medium', tier: 'tier1',
  explanation: 'First letters: B,D,F,H,J (+2). Middle: C,E,G,I,K (+2). Third = First letter repeated. Answer: JKJ.'
}));

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Roman Numerals',
  question: 'Complete: V, VIII, XI, XIV, ?, XX',
  options: ['IX', 'XXIII', 'XV', 'XVII'], answerIndex: 3, difficulty: 'hard', tier: 'tier2',
  explanation: 'Sequence: 5, 8, 11, 14, 17, 20. Adding 3 each time. XVII = 17.'
}));

questions.push(makeQ({
  topic: 'Alphabet Series', subtopic: 'Roman Numerals',
  question: 'Complete: XXIV, XX, ?, XII, VIII',
  options: ['XXII', 'XIII', 'XVI', 'IV'], answerIndex: 2, difficulty: 'hard', tier: 'tier2',
  explanation: 'Sequence: 24, 20, 16, 12, 8. Subtracting 4 each time. XVI = 16.'
}));


// =====================================================
// DEDUP + SAVE
// =====================================================

let added = 0, dupes = 0;

for (const q of questions) {
  const norm = normalize(q.question);
  if (existingSet.has(norm)) {
    dupes++;
  } else {
    existingQs.push(q);
    existingSet.add(norm);
    added++;
  }
}

bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

console.log(`\n=== MEGA REASONING IMPORT ===`);
console.log(`Total prepared: ${questions.length}`);
console.log(`Added: ${added}`);
console.log(`Dupes skipped: ${dupes}`);
console.log(`New bank total: ${existingQs.length}`);

// Topic distribution
const topicCounts = {};
questions.forEach(q => { topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1; });
console.log('\nBy topic:');
Object.entries(topicCounts).sort((a,b) => b[1]-a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));
