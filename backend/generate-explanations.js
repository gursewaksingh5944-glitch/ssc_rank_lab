/**
 * Bulk-generate explanations for questions that don't have them.
 * Uses rule-based approach per subject to create useful explanations.
 * 
 * Usage: node backend/generate-explanations.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const BANK_PATH = path.join(__dirname, "data", "question-bank.json");
const DRY_RUN = process.argv.includes("--dry-run");

function generateExplanation(q) {
  const correct = q.options[q.answerIndex];
  const letters = ["A", "B", "C", "D", "E"];
  const correctLetter = letters[q.answerIndex] || "?";

  switch (q.subject) {
    case "quant":
      return generateQuantExplanation(q, correct, correctLetter);
    case "english":
      return generateEnglishExplanation(q, correct, correctLetter);
    case "reasoning":
      return generateReasoningExplanation(q, correct, correctLetter);
    case "gk":
      return generateGKExplanation(q, correct, correctLetter);
    default:
      return `The correct answer is (${correctLetter}) ${correct}.`;
  }
}

function generateQuantExplanation(q, correct, letter) {
  const topic = (q.topic || "").toLowerCase();
  const question = q.question || "";

  // Percentage
  if (topic.includes("percentage") || topic.includes("percent")) {
    return `The correct answer is (${letter}) ${correct}. To solve percentage problems, convert the verbal statement into a mathematical expression. For example, "X% of Y" means (X/100) × Y. Solve step by step by converting each percentage operation and simplifying.`;
  }
  // Ratio & Proportion
  if (topic.includes("ratio") || topic.includes("proportion")) {
    return `The correct answer is (${letter}) ${correct}. In ratio problems, express the given relationship as a:b and use the total or difference to find individual values. If a:b = x:y, then a = x/(x+y) × total.`;
  }
  // SI & CI
  if (topic.includes("interest") || topic.includes("si") || topic.includes("ci")) {
    return `The correct answer is (${letter}) ${correct}. For Simple Interest: SI = PRT/100. For Compound Interest: A = P(1 + R/100)^T. The difference between CI and SI for 2 years = PR²/100².`;
  }
  // Profit & Loss
  if (topic.includes("profit") || topic.includes("loss")) {
    return `The correct answer is (${letter}) ${correct}. Profit = SP - CP, Loss = CP - SP. Profit% = (Profit/CP) × 100. When discount is involved: SP = MP × (1 - Discount%/100).`;
  }
  // Speed, Time & Distance
  if (topic.includes("speed") || topic.includes("time") || topic.includes("distance") || topic.includes("train")) {
    return `The correct answer is (${letter}) ${correct}. Use Distance = Speed × Time. Convert units carefully (km/h to m/s: multiply by 5/18). For trains, total distance = length of train(s) + platform/bridge length.`;
  }
  // Geometry / Mensuration
  if (topic.includes("geom") || topic.includes("mensuration") || topic.includes("area") || topic.includes("triangle") || topic.includes("circle")) {
    return `The correct answer is (${letter}) ${correct}. Apply the relevant geometric formula. For triangles: Area = ½ × base × height. For circles: Area = πr², Circumference = 2πr. For composite shapes, break into simpler parts.`;
  }
  // Algebra
  if (topic.includes("algebra") || topic.includes("equation") || topic.includes("quadratic")) {
    return `The correct answer is (${letter}) ${correct}. Simplify the algebraic expression step by step. Use identities like (a+b)² = a² + 2ab + b², (a-b)² = a² - 2ab + b², a² - b² = (a+b)(a-b) to simplify.`;
  }
  // Trigonometry
  if (topic.includes("trigo")) {
    return `The correct answer is (${letter}) ${correct}. Use standard trigonometric identities: sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ. Substitute known values for standard angles (30°, 45°, 60°).`;
  }
  // Number System
  if (topic.includes("number") || topic.includes("hcf") || topic.includes("lcm") || topic.includes("divisibility")) {
    return `The correct answer is (${letter}) ${correct}. For HCF/LCM problems: HCF × LCM = Product of two numbers. For divisibility, apply divisibility rules or factorize the number.`;
  }
  // Average
  if (topic.includes("average")) {
    return `The correct answer is (${letter}) ${correct}. Average = Sum of values / Number of values. When a value is added or removed, recalculate: New Average = (Old sum ± change) / New count.`;
  }
  // Work & Time
  if (topic.includes("work") || topic.includes("pipe") || topic.includes("cistern")) {
    return `The correct answer is (${letter}) ${correct}. If A does work in 'a' days, A's 1 day work = 1/a. Combined rate = 1/a + 1/b. For pipes: filling rate - emptying rate = net rate.`;
  }
  // DI
  if (topic.includes("data interpretation") || topic.includes("di") || topic.includes("table") || topic.includes("chart")) {
    return `The correct answer is (${letter}) ${correct}. Read the data carefully from the given table/chart. Calculate the required value using basic arithmetic operations. Double-check by verifying with the given data points.`;
  }
  // Simplification
  if (topic.includes("simplif")) {
    return `The correct answer is (${letter}) ${correct}. Follow BODMAS order: Brackets → Orders → Division → Multiplication → Addition → Subtraction. Simplify step by step.`;
  }

  return `The correct answer is (${letter}) ${correct}. Solve by applying the relevant ${q.topic || "mathematical"} formula and simplifying step by step.`;
}

function generateEnglishExplanation(q, correct, letter) {
  const topic = (q.topic || "").toLowerCase();

  if (topic.includes("synonym")) {
    return `The correct answer is (${letter}) ${correct}. '${correct}' is the word closest in meaning to the given word. Build vocabulary by reading and noting similar words.`;
  }
  if (topic.includes("antonym")) {
    return `The correct answer is (${letter}) ${correct}. '${correct}' is the word opposite in meaning to the given word. Learn antonym pairs systematically.`;
  }
  if (topic.includes("idiom") || topic.includes("phrase")) {
    return `The correct answer is (${letter}) ${correct}. This idiom/phrase has a figurative meaning different from its literal interpretation. Memorize common idioms and their meanings.`;
  }
  if (topic.includes("active") || topic.includes("passive") || topic.includes("voice")) {
    return `The correct answer is (${letter}) ${correct}. In active voice, the subject performs the action. In passive voice, the subject receives the action. Change: Active 'S + V + O' → Passive 'O + be + V3 + by S'. Match the tense correctly.`;
  }
  if (topic.includes("direct") || topic.includes("indirect") || topic.includes("narration") || topic.includes("speech")) {
    return `The correct answer is (${letter}) ${correct}. When converting speech: change pronouns, shift tense back one step, and adjust time/place references (here→there, now→then, today→that day).`;
  }
  if (topic.includes("error") || topic.includes("spotting") || topic.includes("correction")) {
    return `The correct answer is (${letter}) ${correct}. Check for: subject-verb agreement, correct tense usage, proper preposition, article usage, and pronoun-antecedent agreement.`;
  }
  if (topic.includes("cloze")) {
    return `The correct answer is (${letter}) ${correct}. In cloze tests, read the entire passage for context. The correct word fits grammatically and logically with the surrounding text.`;
  }
  if (topic.includes("spelling") || topic.includes("misspel")) {
    return `The correct answer is (${letter}) ${correct}. This is the correctly spelled word. Pay attention to common patterns: -tion/-sion, -ible/-able, double consonants, and silent letters.`;
  }
  if (topic.includes("fill") || topic.includes("blank")) {
    return `The correct answer is (${letter}) ${correct}. Read the sentence completely to understand context. The correct option fits both grammatically and meaningfully in the blank.`;
  }
  if (topic.includes("one word") || topic.includes("substitution")) {
    return `The correct answer is (${letter}) ${correct}. This single word replaces the given phrase or description. Learn common one-word substitutions for SSC exams.`;
  }
  if (topic.includes("comprehension") || topic.includes("passage") || topic.includes("reading")) {
    return `The correct answer is (${letter}) ${correct}. Read the passage carefully and identify the relevant portion. The answer is directly stated or can be inferred from the text.`;
  }
  if (topic.includes("sentence improvement") || topic.includes("rearrangement")) {
    return `The correct answer is (${letter}) ${correct}. Check if the original sentence is grammatically correct. If not, the replacement should fix the error while maintaining the meaning.`;
  }

  return `The correct answer is (${letter}) ${correct}. Apply the relevant ${q.topic || "English grammar"} rule to identify the correct option.`;
}

function generateReasoningExplanation(q, correct, letter) {
  const topic = (q.topic || "").toLowerCase();

  if (topic.includes("series") || topic.includes("sequence") || topic.includes("pattern")) {
    return `The correct answer is (${letter}) ${correct}. Identify the pattern: look for differences, ratios, squares, cubes, or alternating patterns between consecutive terms. Apply the same pattern to find the missing term.`;
  }
  if (topic.includes("analogy")) {
    return `The correct answer is (${letter}) ${correct}. Identify the relationship between the first pair, then apply the same relationship to the second pair. Common relationships: synonyms, part-whole, function, cause-effect.`;
  }
  if (topic.includes("coding") || topic.includes("decoding")) {
    return `The correct answer is (${letter}) ${correct}. Decode the pattern by comparing coded words with their originals. Look for letter shifts, position-based codes, or symbol substitutions.`;
  }
  if (topic.includes("blood") || topic.includes("relation")) {
    return `The correct answer is (${letter}) ${correct}. Draw a family tree diagram. Use symbols: + for male, - for female. Track each relationship step by step from the starting person.`;
  }
  if (topic.includes("direction") || topic.includes("distance")) {
    return `The correct answer is (${letter}) ${correct}. Draw the path on paper. Track North/South/East/West turns carefully. Use Pythagorean theorem for shortest distance if needed.`;
  }
  if (topic.includes("mirror") || topic.includes("water") || topic.includes("image")) {
    return `The correct answer is (${letter}) ${correct}. In mirror image, left-right gets reversed. In water image, top-bottom gets reversed. Apply the transformation to each element.`;
  }
  if (topic.includes("syllogism")) {
    return `The correct answer is (${letter}) ${correct}. Use Venn diagrams to represent each statement. Check which conclusions definitely follow from all possible valid diagrams.`;
  }
  if (topic.includes("clock") || topic.includes("calendar")) {
    return `The correct answer is (${letter}) ${correct}. For clocks: angle between hands = |30H - 5.5M|°. For calendars: use odd days method — count total odd days from a reference date.`;
  }
  if (topic.includes("figure") || topic.includes("counting") || topic.includes("embedded")) {
    return `The correct answer is (${letter}) ${correct}. Count systematically — go from smallest to largest shapes. Use formulas where available (e.g., triangles in a triangle = n(n+2)(2n+1)/8).`;
  }

  return `The correct answer is (${letter}) ${correct}. Analyze the pattern or relationship carefully and apply logical reasoning to arrive at the answer.`;
}

function generateGKExplanation(q, correct, letter) {
  const topic = (q.topic || "").toLowerCase();

  if (topic.includes("history") || topic.includes("ancient") || topic.includes("medieval") || topic.includes("modern")) {
    return `The correct answer is (${letter}) ${correct}. This is an important historical fact frequently asked in SSC exams. Revise this topic from a standard GK reference book.`;
  }
  if (topic.includes("geography") || topic.includes("river") || topic.includes("mountain") || topic.includes("climate")) {
    return `The correct answer is (${letter}) ${correct}. This is a key geography fact. Refer to maps and atlas for better understanding of physical and political geography concepts.`;
  }
  if (topic.includes("polity") || topic.includes("constitution") || topic.includes("fundamental") || topic.includes("article")) {
    return `The correct answer is (${letter}) ${correct}. This is an important Indian Polity fact. Read the relevant Articles/Schedules of the Indian Constitution for thorough preparation.`;
  }
  if (topic.includes("econom") || topic.includes("budget") || topic.includes("gdp") || topic.includes("fiscal")) {
    return `The correct answer is (${letter}) ${correct}. This is a key economic concept. Stay updated with current economic policies and read the Economic Survey for recent data.`;
  }
  if (topic.includes("science") || topic.includes("physics") || topic.includes("chemistry") || topic.includes("biology")) {
    return `The correct answer is (${letter}) ${correct}. This is a fundamental science concept. Revise NCERT Science textbooks (Class 6-10) for thorough coverage of SSC-level science.`;
  }
  if (topic.includes("current") || topic.includes("award") || topic.includes("scheme") || topic.includes("sport")) {
    return `The correct answer is (${letter}) ${correct}. This is a current affairs / static GK fact. Read monthly current affairs magazines and compilations for SSC exam preparation.`;
  }

  return `The correct answer is (${letter}) ${correct}. This is an important General Knowledge fact. Revise from standard SSC GK reference material like Lucent's GK.`;
}

// ── Main ──
function main() {
  const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
  const questions = bank.questions || [];

  let filled = 0;
  let skipped = 0;
  let alreadyHas = 0;

  for (const q of questions) {
    if (q.explanation && q.explanation.trim()) {
      alreadyHas++;
      continue;
    }

    if (q.answerIndex == null || !q.options || !q.options[q.answerIndex]) {
      skipped++;
      continue;
    }

    q.explanation = generateExplanation(q);
    filled++;
  }

  console.log(`\n📊 Explanation Generation Summary:`);
  console.log(`   Total questions: ${questions.length}`);
  console.log(`   Already had explanation: ${alreadyHas}`);
  console.log(`   Newly generated: ${filled}`);
  console.log(`   Skipped (no answer): ${skipped}`);

  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN — no changes written.`);
    // Show samples
    const samples = questions.filter(q => q.explanation && q.explanation.includes("The correct answer is")).slice(0, 3);
    samples.forEach((q, i) => {
      console.log(`\n--- Sample ${i + 1} (${q.subject}/${q.topic}) ---`);
      console.log(`Q: ${q.question.substring(0, 80)}...`);
      console.log(`A: ${q.explanation}`);
    });
  } else {
    fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2));
    console.log(`\n✅ Written to ${BANK_PATH}`);
  }
}

main();
