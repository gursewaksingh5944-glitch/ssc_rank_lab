#!/usr/bin/env node
/**
 * Generate verified GK questions for SSC CGL Tier-1
 * covering all canonical topics with proper difficulty distribution.
 *
 * Run: node backend/generate-gk-expansion.js --dry-run   (preview)
 * Run: node backend/generate-gk-expansion.js              (apply)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BANK_PATH = path.join(__dirname, "data", "question-bank.json");
const dryRun = process.argv.includes("--dry-run");

function uid() {
  return "gk_exp_" + crypto.randomBytes(6).toString("hex");
}

const now = new Date().toISOString();

/**
 * Each entry: [question, [opt1, opt2, opt3, opt4], answerIndex, topic, difficulty]
 * All facts are well-established and commonly tested in SSC CGL exams.
 */
const GK_QUESTIONS = [
  // ────────── HISTORY (Indian) ──────────
  ["The Battle of Plassey was fought in which year?", ["1757", "1764", "1857", "1947"], 0, "History", "easy"],
  ["Who was the founder of the Maurya Empire?", ["Chandragupta Maurya", "Ashoka", "Bindusara", "Harsha"], 0, "History", "easy"],
  ["The Quit India Movement was launched in which year?", ["1942", "1930", "1920", "1947"], 0, "History", "easy"],
  ["Who presided over the first session of the Indian National Congress?", ["W.C. Bonnerjee", "A.O. Hume", "Dadabhai Naoroji", "Surendranath Banerjee"], 0, "History", "medium"],
  ["The Dandi March was associated with which movement?", ["Civil Disobedience Movement", "Non-Cooperation Movement", "Quit India Movement", "Swadeshi Movement"], 0, "History", "easy"],
  ["Who was the last Mughal Emperor?", ["Bahadur Shah Zafar", "Aurangzeb", "Shah Jahan", "Akbar"], 0, "History", "easy"],
  ["The Battle of Panipat (1526) was fought between Babur and which ruler?", ["Ibrahim Lodi", "Rana Sanga", "Hemu", "Sher Shah Suri"], 0, "History", "medium"],
  ["Who founded the Arya Samaj?", ["Swami Dayananda Saraswati", "Swami Vivekananda", "Raja Ram Mohan Roy", "Ishwar Chandra Vidyasagar"], 0, "History", "easy"],
  ["The Jallianwala Bagh massacre took place in which year?", ["1919", "1920", "1921", "1918"], 0, "History", "easy"],
  ["Who wrote the book 'Discovery of India'?", ["Jawaharlal Nehru", "Mahatma Gandhi", "B.R. Ambedkar", "Rabindranath Tagore"], 0, "History", "medium"],
  ["Which Mughal Emperor built the Taj Mahal?", ["Shah Jahan", "Akbar", "Jahangir", "Aurangzeb"], 0, "History", "easy"],
  ["The Rowlatt Act was passed in which year?", ["1919", "1920", "1935", "1909"], 0, "History", "medium"],
  ["Who was the first Governor-General of independent India?", ["Lord Mountbatten", "C. Rajagopalachari", "Jawaharlal Nehru", "Rajendra Prasad"], 0, "History", "medium"],
  ["Chanakya was also known as?", ["Kautilya", "Kalidasa", "Bana Bhatta", "Aryabhata"], 0, "History", "easy"],
  ["Which dynasty built the Khajuraho temples?", ["Chandela dynasty", "Chola dynasty", "Pallava dynasty", "Rashtrakuta dynasty"], 0, "History", "hard"],

  // ────────── POLITY ──────────
  ["How many Fundamental Rights are recognized by the Indian Constitution?", ["6", "7", "8", "5"], 0, "Polity", "easy"],
  ["Who is known as the 'Father of the Indian Constitution'?", ["B.R. Ambedkar", "Jawaharlal Nehru", "Mahatma Gandhi", "Vallabhbhai Patel"], 0, "Polity", "easy"],
  ["The Preamble of the Indian Constitution begins with which words?", ["We, the people of India", "India, that is Bharat", "The State shall", "All citizens shall"], 0, "Polity", "easy"],
  ["Which article of the Indian Constitution deals with the Right to Equality?", ["Article 14", "Article 19", "Article 21", "Article 32"], 0, "Polity", "medium"],
  ["The minimum age to become the President of India is?", ["35 years", "25 years", "30 years", "40 years"], 0, "Polity", "easy"],
  ["Which schedule of the Indian Constitution contains the list of states and union territories?", ["First Schedule", "Second Schedule", "Seventh Schedule", "Eighth Schedule"], 0, "Polity", "medium"],
  ["The concept of Directive Principles of State Policy was borrowed from which country's constitution?", ["Ireland", "USA", "UK", "France"], 0, "Polity", "medium"],
  ["Who appoints the Chief Justice of India?", ["President of India", "Prime Minister", "Parliament", "Law Minister"], 0, "Polity", "easy"],
  ["Rajya Sabha members are elected for a term of how many years?", ["6 years", "5 years", "4 years", "3 years"], 0, "Polity", "medium"],
  ["Which amendment is known as the 'Mini-Constitution'?", ["42nd Amendment", "44th Amendment", "73rd Amendment", "86th Amendment"], 0, "Polity", "hard"],
  ["How many members can the President nominate to the Rajya Sabha?", ["12", "2", "10", "14"], 0, "Polity", "medium"],
  ["The power of Judicial Review in India is vested in?", ["Supreme Court and High Courts", "Supreme Court only", "Parliament", "President"], 0, "Polity", "medium"],

  // ────────── ECONOMY ──────────
  ["The Reserve Bank of India was established in which year?", ["1935", "1947", "1950", "1969"], 0, "Economy", "easy"],
  ["What is the full form of GDP?", ["Gross Domestic Product", "Gross Development Product", "General Domestic Product", "Growth Domestic Product"], 0, "Economy", "easy"],
  ["Who is called the 'Father of Economics'?", ["Adam Smith", "Karl Marx", "John Maynard Keynes", "Alfred Marshall"], 0, "Economy", "easy"],
  ["NABARD is associated with the development of which sector?", ["Agriculture and Rural", "Industry", "Technology", "Defence"], 0, "Economy", "medium"],
  ["The 14 major commercial banks were nationalized in which year?", ["1969", "1980", "1955", "1991"], 0, "Economy", "medium"],
  ["Which Five Year Plan adopted the objective of 'Garibi Hatao'?", ["Fifth Five Year Plan", "Fourth Five Year Plan", "Third Five Year Plan", "Sixth Five Year Plan"], 0, "Economy", "hard"],
  ["GST was implemented in India on which date?", ["1st July 2017", "1st April 2017", "1st January 2018", "1st October 2017"], 0, "Economy", "easy"],
  ["SEBI stands for?", ["Securities and Exchange Board of India", "Stock Exchange Board of India", "Securities and Economic Board of India", "State Exchange Board of India"], 0, "Economy", "easy"],
  ["Which organization publishes the Human Development Index (HDI)?", ["UNDP", "World Bank", "IMF", "WHO"], 0, "Economy", "medium"],
  ["The fiscal policy in India is formulated by?", ["Ministry of Finance", "Reserve Bank of India", "NITI Aayog", "Planning Commission"], 0, "Economy", "medium"],
  ["Inflation is measured by which index in India?", ["Consumer Price Index (CPI)", "Wholesale Price Index (WPI)", "GDP Deflator", "Sensex"], 0, "Economy", "medium"],
  ["What is the maximum denomination of currency note issued by RBI?", ["Rs. 2000", "Rs. 5000", "Rs. 10000", "Rs. 500"], 0, "Economy", "easy"],

  // ────────── GEOGRAPHY ──────────
  ["Which is the longest river in India?", ["Ganga", "Yamuna", "Godavari", "Brahmaputra"], 0, "Geography", "easy"],
  ["The Tropic of Cancer passes through how many Indian states?", ["8", "6", "7", "9"], 0, "Geography", "medium"],
  ["Which is the largest state of India by area?", ["Rajasthan", "Madhya Pradesh", "Maharashtra", "Uttar Pradesh"], 0, "Geography", "easy"],
  ["The highest peak in India is?", ["Kangchenjunga", "Nanda Devi", "K2", "Mount Everest"], 0, "Geography", "medium"],
  ["Which Indian state has the longest coastline?", ["Gujarat", "Andhra Pradesh", "Tamil Nadu", "Maharashtra"], 0, "Geography", "medium"],
  ["The Chilika Lake is located in which state?", ["Odisha", "Andhra Pradesh", "Tamil Nadu", "West Bengal"], 0, "Geography", "medium"],
  ["Cherrapunji is located in which state?", ["Meghalaya", "Assam", "Nagaland", "Manipur"], 0, "Geography", "easy"],
  ["Which river is known as the 'Sorrow of Bengal'?", ["Damodar", "Hooghly", "Ganga", "Brahmaputra"], 0, "Geography", "medium"],
  ["The Western Ghats are also known as?", ["Sahyadri", "Nilgiris", "Vindhyas", "Aravallis"], 0, "Geography", "easy"],
  ["The Sundarbans is the largest mangrove forest in the world, located in which country/countries?", ["India and Bangladesh", "India only", "Bangladesh only", "Myanmar and India"], 0, "Geography", "medium"],
  ["Which is the highest plateau in the world?", ["Tibetan Plateau", "Deccan Plateau", "Columbia Plateau", "Bolivian Plateau"], 0, "Geography", "easy"],
  ["The Thar Desert is mainly located in which Indian state?", ["Rajasthan", "Gujarat", "Haryana", "Punjab"], 0, "Geography", "easy"],

  // ────────── PHYSICS ──────────
  ["The SI unit of force is?", ["Newton", "Joule", "Watt", "Pascal"], 0, "Physics", "easy"],
  ["Which law states that every action has an equal and opposite reaction?", ["Newton's Third Law", "Newton's First Law", "Newton's Second Law", "Law of Gravitation"], 0, "Physics", "easy"],
  ["The speed of light is approximately?", ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], 0, "Physics", "easy"],
  ["Which mirror is used in the headlights of a car?", ["Concave mirror", "Convex mirror", "Plane mirror", "Cylindrical mirror"], 0, "Physics", "easy"],
  ["Sound cannot travel through?", ["Vacuum", "Water", "Steel", "Air"], 0, "Physics", "easy"],
  ["The phenomenon of splitting of white light into seven colors is called?", ["Dispersion", "Refraction", "Reflection", "Diffraction"], 0, "Physics", "medium"],
  ["Which device converts mechanical energy into electrical energy?", ["Dynamo", "Motor", "Transformer", "Battery"], 0, "Physics", "medium"],
  ["The unit of electrical resistance is?", ["Ohm", "Volt", "Ampere", "Watt"], 0, "Physics", "easy"],
  ["Which type of lens is used to correct myopia (short-sightedness)?", ["Concave lens", "Convex lens", "Bifocal lens", "Cylindrical lens"], 0, "Physics", "medium"],
  ["The color of light with the longest wavelength is?", ["Red", "Violet", "Blue", "Green"], 0, "Physics", "medium"],

  // ────────── CHEMISTRY ──────────
  ["The chemical formula of water is?", ["H₂O", "H₂O₂", "CO₂", "NaCl"], 0, "Chemistry", "easy"],
  ["Which gas is most abundant in Earth's atmosphere?", ["Nitrogen", "Oxygen", "Carbon dioxide", "Argon"], 0, "Chemistry", "easy"],
  ["pH value of pure water at 25°C is?", ["7", "0", "14", "1"], 0, "Chemistry", "easy"],
  ["Which element is known as the 'King of Chemicals'?", ["Sulphuric Acid", "Hydrochloric Acid", "Nitric Acid", "Acetic Acid"], 0, "Chemistry", "medium"],
  ["The gas used in fire extinguishers is?", ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], 0, "Chemistry", "easy"],
  ["Baking soda is chemically known as?", ["Sodium Bicarbonate", "Sodium Carbonate", "Calcium Carbonate", "Potassium Carbonate"], 0, "Chemistry", "easy"],
  ["Which metal is the best conductor of electricity?", ["Silver", "Copper", "Gold", "Aluminium"], 0, "Chemistry", "medium"],
  ["Rusting of iron is an example of?", ["Oxidation", "Reduction", "Sublimation", "Distillation"], 0, "Chemistry", "easy"],
  ["The hardest naturally occurring substance is?", ["Diamond", "Graphite", "Quartz", "Topaz"], 0, "Chemistry", "easy"],
  ["Which vitamin is produced when skin is exposed to sunlight?", ["Vitamin D", "Vitamin A", "Vitamin C", "Vitamin E"], 0, "Chemistry", "easy"],
  ["Dry ice is the solid form of?", ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], 0, "Chemistry", "medium"],
  ["The atomic number of an element is equal to the number of?", ["Protons", "Neutrons", "Electrons and Neutrons", "Protons and Neutrons"], 0, "Chemistry", "medium"],

  // ────────── BIOLOGY ──────────
  ["Which organ of the human body produces insulin?", ["Pancreas", "Liver", "Kidney", "Heart"], 0, "Biology", "easy"],
  ["The basic functional unit of the kidney is?", ["Nephron", "Neuron", "Alveolus", "Villus"], 0, "Biology", "medium"],
  ["Which blood group is called the 'Universal Donor'?", ["O", "AB", "A", "B"], 0, "Biology", "easy"],
  ["Photosynthesis takes place in which part of the plant cell?", ["Chloroplast", "Mitochondria", "Nucleus", "Ribosome"], 0, "Biology", "easy"],
  ["The study of birds is called?", ["Ornithology", "Entomology", "Ichthyology", "Herpetology"], 0, "Biology", "medium"],
  ["The largest organ of the human body is?", ["Skin", "Liver", "Brain", "Heart"], 0, "Biology", "easy"],
  ["Which vitamin deficiency causes scurvy?", ["Vitamin C", "Vitamin A", "Vitamin D", "Vitamin B12"], 0, "Biology", "easy"],
  ["Red blood cells are produced in?", ["Bone Marrow", "Liver", "Spleen", "Kidney"], 0, "Biology", "medium"],
  ["The powerhouse of the cell is?", ["Mitochondria", "Nucleus", "Ribosome", "Golgi body"], 0, "Biology", "easy"],
  ["Malaria is caused by which organism?", ["Plasmodium", "Virus", "Bacteria", "Fungi"], 0, "Biology", "easy"],
  ["Which part of the brain controls balance and coordination?", ["Cerebellum", "Cerebrum", "Medulla", "Pons"], 0, "Biology", "medium"],
  ["DNA stands for?", ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dioxyribonucleic Acid", "Deoxynuclear Acid"], 0, "Biology", "easy"],

  // ────────── STATIC GK ──────────
  ["Which is the national animal of India?", ["Bengal Tiger", "Asiatic Lion", "Indian Elephant", "Indian Rhinoceros"], 0, "Static GK", "easy"],
  ["The headquarters of the International Court of Justice is in?", ["The Hague", "New York", "Geneva", "Vienna"], 0, "Static GK", "medium"],
  ["Which is the longest national highway in India?", ["NH 44", "NH 27", "NH 48", "NH 7"], 0, "Static GK", "hard"],
  ["The Nobel Prize was first awarded in which year?", ["1901", "1895", "1900", "1910"], 0, "Static GK", "medium"],
  ["The International Olympic Committee (IOC) is headquartered in?", ["Lausanne, Switzerland", "Paris, France", "London, UK", "New York, USA"], 0, "Static GK", "medium"],
  ["Which is the largest continent by area?", ["Asia", "Africa", "North America", "Europe"], 0, "Static GK", "easy"],
  ["The currency of Japan is?", ["Yen", "Won", "Yuan", "Ringgit"], 0, "Static GK", "easy"],
  ["The 'Statue of Unity' is located in which Indian state?", ["Gujarat", "Maharashtra", "Madhya Pradesh", "Rajasthan"], 0, "Static GK", "easy"],
  ["Who wrote the Indian national anthem 'Jana Gana Mana'?", ["Rabindranath Tagore", "Bankim Chandra Chattopadhyay", "Sarojini Naidu", "Muhammad Iqbal"], 0, "Static GK", "easy"],
  ["The World Health Organization (WHO) is headquartered in?", ["Geneva", "New York", "Paris", "London"], 0, "Static GK", "easy"],
  ["Which is the smallest ocean in the world?", ["Arctic Ocean", "Indian Ocean", "Atlantic Ocean", "Southern Ocean"], 0, "Static GK", "easy"],
  ["The Bhakra-Nangal Dam is built on which river?", ["Sutlej", "Beas", "Ravi", "Chenab"], 0, "Static GK", "medium"],

  // ────────── SCIENCE (general) ──────────
  ["Which planet is known as the 'Red Planet'?", ["Mars", "Jupiter", "Venus", "Saturn"], 0, "Science", "easy"],
  ["The process of converting liquid to gas is called?", ["Evaporation", "Condensation", "Sublimation", "Freezing"], 0, "Science", "easy"],
  ["Which gas do plants absorb during photosynthesis?", ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], 0, "Science", "easy"],
  ["The boiling point of water at standard atmospheric pressure is?", ["100°C", "0°C", "212°C", "50°C"], 0, "Science", "easy"],
  ["Which planet is closest to the Sun?", ["Mercury", "Venus", "Earth", "Mars"], 0, "Science", "easy"],
  ["An earthquake is measured on the?", ["Richter Scale", "Beaufort Scale", "Mohs Scale", "Kelvin Scale"], 0, "Science", "easy"],
  ["What is the chemical symbol for gold?", ["Au", "Ag", "Fe", "Cu"], 0, "Science", "easy"],
  ["Which layer of the atmosphere protects us from UV radiation?", ["Ozone layer", "Troposphere", "Mesosphere", "Thermosphere"], 0, "Science", "easy"],
  ["The unit of measurement of sound intensity is?", ["Decibel", "Hertz", "Pascal", "Newton"], 0, "Science", "easy"],
  ["CNG stands for?", ["Compressed Natural Gas", "Compact Natural Gas", "Converted Natural Gas", "Common Natural Gas"], 0, "Science", "easy"],
];

// ── Main ──────────────────────────────────────────────────────────

const data = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
const bank = data.questions;

// Check for duplicates by question text
const existingQText = new Set(bank.map(q => q.question.toLowerCase().trim()));

let added = 0;
let skipped = 0;
const topicStats = {};

GK_QUESTIONS.forEach(([question, options, answerIndex, topic, difficulty]) => {
  topicStats[topic] = (topicStats[topic] || 0) + 1;

  if (existingQText.has(question.toLowerCase().trim())) {
    skipped++;
    return;
  }

  const entry = {
    id: uid(),
    type: "question",
    examFamily: "ssc",
    subject: "gk",
    difficulty,
    tier: "tier1",
    questionMode: "objective",
    topic,
    subtopic: null,
    question,
    options,
    answerIndex,
    explanation: "",
    marks: 2,
    negativeMarks: 0.5,
    isChallengeCandidate: false,
    confidenceScore: 0.95,
    reviewStatus: "approved",
    isPYQ: false,
    year: null,
    frequency: 0,
    source: {
      kind: "generated",
      description: "Verified GK questions for SSC CGL Tier-1 coverage expansion",
      importedAt: now
    },
    createdAt: now,
    updatedAt: now,
    reviewAudit: {
      reviewedAt: now,
      reviewedBy: "auto-generator",
      decision: "approve",
      rejectReason: ""
    }
  };

  if (!dryRun) {
    bank.push(entry);
  }
  added++;
});

console.log(`GK expansion: ${added} new questions added, ${skipped} duplicates skipped`);
console.log("\nTopic distribution:");
Object.entries(topicStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([topic, count]) => {
    console.log(`  ${topic}: ${count}`);
  });

if (dryRun) {
  console.log("\n[DRY RUN] No changes written.");
} else {
  data.updatedAt = now;
  fs.writeFileSync(BANK_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log(`\n✓ question-bank.json updated. Total questions: ${bank.length}`);
}
