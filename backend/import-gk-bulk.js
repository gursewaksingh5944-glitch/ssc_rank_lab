/**
 * Bulk import: GK (General Knowledge) questions for SSC CGL Tier 1 & Tier 2
 * Covers: History, Polity, Geography, Economy, Science, Current Affairs
 */
const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const existingQs = bank.questions;

function makeId() {
  return Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function makeQ({ topic, subtopic, question, options, answerIndex, difficulty, tier, explanation }) {
  const now = new Date().toISOString();
  const marks = tier === 'tier1' ? 2 : 3;
  const neg = tier === 'tier1' ? 0.5 : 1;
  return {
    id: makeId(),
    type: 'question',
    examFamily: 'ssc',
    subject: 'gk',
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
    isChallengeCandidate: false,
    confidenceScore: 0.9,
    reviewStatus: 'imported',
    isPYQ: false,
    year: null,
    frequency: 0,
    subtopic: subtopic || topic,
    source: { kind: 'bulk_import', fileName: 'import-gk-bulk.js', importedAt: now },
    createdAt: now,
    updatedAt: now
  };
}

const questions = [];

// =====================================================
// INDIAN HISTORY
// =====================================================
const history = [
  { q: "Who founded the Maurya Empire?", opts: ["Chandragupta Maurya", "Ashoka", "Bindusara", "Chanakya"], ans: 0, d: "easy", t: "tier1", sub: "Ancient India" },
  { q: "The famous 'Dandi March' was undertaken by Mahatma Gandhi in which year?", opts: ["1930", "1920", "1942", "1935"], ans: 0, d: "easy", t: "tier1", sub: "Modern India" },
  { q: "The Battle of Plassey was fought in which year?", opts: ["1757", "1764", "1857", "1761"], ans: 0, d: "easy", t: "tier1", sub: "Modern India" },
  { q: "Who was the first woman ruler of India?", opts: ["Razia Sultan", "Noor Jahan", "Chand Bibi", "Rani Laxmibai"], ans: 0, d: "easy", t: "tier1", sub: "Medieval India" },
  { q: "The Indus Valley Civilization was discovered in which year?", opts: ["1921", "1911", "1931", "1901"], ans: 0, d: "medium", t: "tier1", sub: "Ancient India" },
  { q: "Who wrote 'Arthashastra'?", opts: ["Kautilya", "Kalidas", "Banabhatta", "Vishakhadatta"], ans: 0, d: "easy", t: "tier1", sub: "Ancient India" },
  { q: "The 'Quit India Movement' was launched in which year?", opts: ["1942", "1940", "1944", "1946"], ans: 0, d: "easy", t: "tier1", sub: "Modern India" },
  { q: "Ashoka embraced Buddhism after the Battle of:", opts: ["Kalinga", "Hydaspes", "Plassey", "Buxar"], ans: 0, d: "easy", t: "tier1", sub: "Ancient India" },
  { q: "Who founded the city of Fatehpur Sikri?", opts: ["Akbar", "Shah Jahan", "Humayun", "Babur"], ans: 0, d: "easy", t: "tier1", sub: "Medieval India" },
  { q: "The Jallianwala Bagh massacre took place in which year?", opts: ["1919", "1920", "1918", "1921"], ans: 0, d: "easy", t: "tier1", sub: "Modern India" },
  { q: "Which Mughal emperor built the Taj Mahal?", opts: ["Shah Jahan", "Akbar", "Aurangzeb", "Jahangir"], ans: 0, d: "easy", t: "tier1", sub: "Medieval India" },
  { q: "The first Indian War of Independence took place in:", opts: ["1857", "1858", "1856", "1860"], ans: 0, d: "easy", t: "tier1", sub: "Modern India" },
  { q: "Who was the founder of the Gupta Dynasty?", opts: ["Sri Gupta", "Chandragupta I", "Samudragupta", "Chandragupta II"], ans: 0, d: "medium", t: "tier2", sub: "Ancient India" },
  { q: "The 'Home Rule Movement' was started by:", opts: ["Annie Besant and Bal Gangadhar Tilak", "Gandhi and Nehru", "Subhas Bose", "Gokhale"], ans: 0, d: "medium", t: "tier1", sub: "Modern India" },
  { q: "Nalanda University was founded by:", opts: ["Kumaragupta I", "Ashoka", "Harshavardhana", "Chandragupta II"], ans: 0, d: "hard", t: "tier2", sub: "Ancient India" },
  { q: "Who introduced the 'Doctrine of Lapse'?", opts: ["Lord Dalhousie", "Lord Wellesley", "Lord Curzon", "Lord Cornwallis"], ans: 0, d: "medium", t: "tier1", sub: "Modern India" },
  { q: "The Vijayanagara Empire was founded by:", opts: ["Harihara and Bukka", "Krishna Deva Raya", "Rama Raya", "Tirumala"], ans: 0, d: "medium", t: "tier2", sub: "Medieval India" },
  { q: "Chandragupta Maurya defeated which Greek General?", opts: ["Seleucus Nicator", "Alexander", "Demetrius", "Menander"], ans: 0, d: "medium", t: "tier1", sub: "Ancient India" },
  { q: "Which Governor-General abolished Sati in India?", opts: ["Lord William Bentinck", "Lord Dalhousie", "Lord Cornwallis", "Lord Ripon"], ans: 0, d: "easy", t: "tier1", sub: "Modern India" },
  { q: "The Chola dynasty is best known for its:", opts: ["Naval power", "Architecture", "Paintings", "Literature"], ans: 0, d: "medium", t: "tier2", sub: "Ancient India" },
];

history.forEach(item => {
  questions.push(makeQ({
    topic: 'History', subtopic: item.sub,
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// INDIAN POLITY & CONSTITUTION
// =====================================================
const polity = [
  { q: "How many Fundamental Rights are mentioned in the Indian Constitution?", opts: ["6", "7", "5", "8"], ans: 0, d: "easy", t: "tier1", sub: "Fundamental Rights" },
  { q: "Which article of the Indian Constitution deals with Right to Equality?", opts: ["Article 14", "Article 19", "Article 21", "Article 32"], ans: 0, d: "medium", t: "tier1", sub: "Fundamental Rights" },
  { q: "The President of India is elected by:", opts: ["Electoral College", "Lok Sabha", "Rajya Sabha", "Parliament"], ans: 0, d: "easy", t: "tier1", sub: "Executive" },
  { q: "Which part of Indian Constitution deals with Directive Principles of State Policy?", opts: ["Part IV", "Part III", "Part V", "Part VI"], ans: 0, d: "medium", t: "tier2", sub: "DPSP" },
  { q: "What is the minimum age to become a member of Rajya Sabha?", opts: ["30 years", "25 years", "35 years", "21 years"], ans: 0, d: "easy", t: "tier1", sub: "Legislature" },
  { q: "The Indian Constitution was adopted on:", opts: ["26 November 1949", "26 January 1950", "15 August 1947", "26 January 1949"], ans: 0, d: "easy", t: "tier1", sub: "Constitutional History" },
  { q: "Who was the Chairman of the Drafting Committee of the Indian Constitution?", opts: ["Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Dr. Rajendra Prasad", "Sardar Patel"], ans: 0, d: "easy", t: "tier1", sub: "Constitutional History" },
  { q: "The concept of 'Judicial Review' in India is borrowed from:", opts: ["USA", "UK", "Ireland", "France"], ans: 0, d: "medium", t: "tier2", sub: "Constitutional Features" },
  { q: "Article 370 was related to which state?", opts: ["Jammu & Kashmir", "Punjab", "Assam", "Nagaland"], ans: 0, d: "easy", t: "tier1", sub: "Special Provisions" },
  { q: "The Speaker of Lok Sabha is elected by:", opts: ["Members of Lok Sabha", "Members of Parliament", "Electoral College", "President"], ans: 0, d: "easy", t: "tier1", sub: "Legislature" },
  { q: "Which Schedule of the Indian Constitution contains provisions relating to anti-defection?", opts: ["10th Schedule", "8th Schedule", "9th Schedule", "7th Schedule"], ans: 0, d: "medium", t: "tier2", sub: "Schedules" },
  { q: "The Panchayati Raj system was introduced by which Constitutional Amendment?", opts: ["73rd Amendment", "74th Amendment", "72nd Amendment", "75th Amendment"], ans: 0, d: "medium", t: "tier1", sub: "Local Government" },
  { q: "What is the term of members of Rajya Sabha?", opts: ["6 years", "5 years", "4 years", "Permanent"], ans: 0, d: "easy", t: "tier1", sub: "Legislature" },
  { q: "Emergency provisions are mentioned in which part of the Constitution?", opts: ["Part XVIII", "Part XVI", "Part XVII", "Part XIX"], ans: 0, d: "medium", t: "tier2", sub: "Emergency" },
  { q: "Who appoints the Chief Justice of India?", opts: ["President", "Prime Minister", "Parliament", "Collegium"], ans: 0, d: "easy", t: "tier1", sub: "Judiciary" },
  { q: "The maximum strength of Lok Sabha is:", opts: ["552", "545", "550", "500"], ans: 0, d: "medium", t: "tier1", sub: "Legislature" },
  { q: "Right to Education (Article 21A) was added by which amendment?", opts: ["86th Amendment", "84th Amendment", "85th Amendment", "87th Amendment"], ans: 0, d: "medium", t: "tier2", sub: "Fundamental Rights" },
  { q: "The Concurrent List is mentioned in which Schedule?", opts: ["7th Schedule", "6th Schedule", "8th Schedule", "9th Schedule"], ans: 0, d: "medium", t: "tier2", sub: "Schedules" },
  { q: "Which writ means 'to have the body'?", opts: ["Habeas Corpus", "Mandamus", "Certiorari", "Quo Warranto"], ans: 0, d: "easy", t: "tier1", sub: "Writs" },
  { q: "The CAG (Comptroller & Auditor General) is appointed by:", opts: ["President", "Prime Minister", "Finance Minister", "Parliament"], ans: 0, d: "easy", t: "tier1", sub: "Constitutional Bodies" },
];

polity.forEach(item => {
  questions.push(makeQ({
    topic: 'Polity', subtopic: item.sub,
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// GEOGRAPHY
// =====================================================
const geography = [
  { q: "Which is the longest river in India?", opts: ["Ganga", "Godavari", "Yamuna", "Brahmaputra"], ans: 0, d: "easy", t: "tier1", sub: "Indian Geography" },
  { q: "The Tropic of Cancer passes through how many Indian states?", opts: ["8", "7", "9", "6"], ans: 0, d: "medium", t: "tier1", sub: "Indian Geography" },
  { q: "Which is the largest desert in the world?", opts: ["Sahara", "Gobi", "Thar", "Arabian"], ans: 0, d: "easy", t: "tier1", sub: "World Geography" },
  { q: "The deepest point in the ocean is:", opts: ["Mariana Trench", "Tonga Trench", "Java Trench", "Puerto Rico Trench"], ans: 0, d: "easy", t: "tier1", sub: "World Geography" },
  { q: "Which planet is known as the 'Red Planet'?", opts: ["Mars", "Jupiter", "Venus", "Saturn"], ans: 0, d: "easy", t: "tier1", sub: "Physical Geography" },
  { q: "The Siachen Glacier is situated in:", opts: ["Karakoram Range", "Himalayas", "Hindu Kush", "Kunlun"], ans: 0, d: "medium", t: "tier2", sub: "Indian Geography" },
  { q: "Which layer of the atmosphere contains the ozone layer?", opts: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"], ans: 0, d: "easy", t: "tier1", sub: "Physical Geography" },
  { q: "Which Indian state has the longest coastline?", opts: ["Gujarat", "Maharashtra", "Tamil Nadu", "Andhra Pradesh"], ans: 0, d: "easy", t: "tier1", sub: "Indian Geography" },
  { q: "The 'Ring of Fire' is associated with:", opts: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], ans: 0, d: "easy", t: "tier1", sub: "World Geography" },
  { q: "Chilika Lake is located in which state?", opts: ["Odisha", "Kerala", "West Bengal", "Andhra Pradesh"], ans: 0, d: "easy", t: "tier1", sub: "Indian Geography" },
  { q: "Which soil is most suitable for cotton cultivation?", opts: ["Black soil", "Red soil", "Alluvial soil", "Laterite soil"], ans: 0, d: "easy", t: "tier1", sub: "Indian Geography" },
  { q: "The highest peak in India is:", opts: ["Kangchenjunga", "Nanda Devi", "K2", "Annapurna"], ans: 0, d: "medium", t: "tier1", sub: "Indian Geography", exp: "K2 is in PoK. Kangchenjunga is the highest peak entirely within India's administered territory." },
  { q: "Tides are caused primarily by:", opts: ["Gravitational pull of the Moon", "Gravitational pull of the Sun", "Earth's rotation", "Wind"], ans: 0, d: "easy", t: "tier1", sub: "Physical Geography" },
  { q: "The Brahmaputra River is known as _____ in Tibet:", opts: ["Tsangpo", "Meghna", "Padma", "Jamuna"], ans: 0, d: "medium", t: "tier2", sub: "Indian Geography" },
  { q: "Which country has the largest area in the world?", opts: ["Russia", "Canada", "China", "USA"], ans: 0, d: "easy", t: "tier1", sub: "World Geography" },
  { q: "The Western Ghats are also known as:", opts: ["Sahyadri", "Vindyas", "Satpura", "Aravalli"], ans: 0, d: "easy", t: "tier1", sub: "Indian Geography" },
  { q: "Which gas is most abundant in Earth's atmosphere?", opts: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"], ans: 0, d: "easy", t: "tier1", sub: "Physical Geography" },
  { q: "The Sundarbans are located in:", opts: ["West Bengal", "Odisha", "Kerala", "Gujarat"], ans: 0, d: "easy", t: "tier1", sub: "Indian Geography" },
  { q: "Which is the largest freshwater lake in the world?", opts: ["Lake Superior", "Lake Baikal", "Lake Victoria", "Lake Michigan"], ans: 0, d: "medium", t: "tier2", sub: "World Geography" },
  { q: "Narmada River flows into which sea?", opts: ["Arabian Sea", "Bay of Bengal", "Indian Ocean", "Pacific Ocean"], ans: 0, d: "easy", t: "tier1", sub: "Indian Geography" },
];

geography.forEach(item => {
  questions.push(makeQ({
    topic: 'Geography', subtopic: item.sub,
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t, explanation: item.exp || ''
  }));
});

// =====================================================
// SCIENCE (Physics, Chemistry, Biology)
// =====================================================
const science = [
  { q: "What is the SI unit of force?", opts: ["Newton", "Joule", "Watt", "Pascal"], ans: 0, d: "easy", t: "tier1", sub: "Physics" },
  { q: "Which vitamin is produced when human skin is exposed to sunlight?", opts: ["Vitamin D", "Vitamin A", "Vitamin C", "Vitamin K"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "The chemical formula of water is:", opts: ["H₂O", "H₂O₂", "HO", "H₃O"], ans: 0, d: "easy", t: "tier1", sub: "Chemistry" },
  { q: "Which organ in the human body produces insulin?", opts: ["Pancreas", "Liver", "Kidney", "Stomach"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "The speed of light is approximately:", opts: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁵ m/s"], ans: 0, d: "easy", t: "tier1", sub: "Physics" },
  { q: "The atomic number of an element is determined by:", opts: ["Number of protons", "Number of neutrons", "Number of electrons", "Atomic mass"], ans: 0, d: "easy", t: "tier1", sub: "Chemistry" },
  { q: "Which disease is caused by deficiency of Vitamin C?", opts: ["Scurvy", "Rickets", "Night blindness", "Beriberi"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "Newton's first law is also known as:", opts: ["Law of Inertia", "Law of Acceleration", "Law of Action-Reaction", "Law of Gravity"], ans: 0, d: "easy", t: "tier1", sub: "Physics" },
  { q: "The pH value of pure water is:", opts: ["7", "0", "14", "1"], ans: 0, d: "easy", t: "tier1", sub: "Chemistry" },
  { q: "The powerhouse of the cell is:", opts: ["Mitochondria", "Nucleus", "Ribosome", "Golgi body"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "Which metal is liquid at room temperature?", opts: ["Mercury", "Bromine", "Gallium", "Cesium"], ans: 0, d: "easy", t: "tier1", sub: "Chemistry" },
  { q: "Sound travels fastest in which medium?", opts: ["Solid", "Liquid", "Gas", "Vacuum"], ans: 0, d: "easy", t: "tier1", sub: "Physics" },
  { q: "Which blood group is called the 'universal donor'?", opts: ["O negative", "AB positive", "A positive", "B negative"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "The chemical name of baking soda is:", opts: ["Sodium bicarbonate", "Sodium carbonate", "Sodium chloride", "Sodium hydroxide"], ans: 0, d: "easy", t: "tier1", sub: "Chemistry" },
  { q: "Which lens is used to correct myopia (near-sightedness)?", opts: ["Concave lens", "Convex lens", "Cylindrical lens", "Bifocal lens"], ans: 0, d: "easy", t: "tier1", sub: "Physics" },
  { q: "The largest bone in the human body is:", opts: ["Femur", "Tibia", "Humerus", "Fibula"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "Which gas is used in fire extinguishers?", opts: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], ans: 0, d: "easy", t: "tier1", sub: "Chemistry" },
  { q: "The unit of electric current is:", opts: ["Ampere", "Volt", "Ohm", "Watt"], ans: 0, d: "easy", t: "tier1", sub: "Physics" },
  { q: "Photosynthesis takes place in which part of the plant?", opts: ["Leaves", "Roots", "Stem", "Flowers"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "The hardest natural substance is:", opts: ["Diamond", "Quartz", "Topaz", "Ruby"], ans: 0, d: "easy", t: "tier1", sub: "Chemistry" },
  { q: "What type of mirror is used in car headlights?", opts: ["Concave", "Convex", "Plane", "Parabolic"], ans: 0, d: "medium", t: "tier2", sub: "Physics" },
  { q: "Hemoglobin contains which metal?", opts: ["Iron", "Copper", "Zinc", "Calcium"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
  { q: "Rust is chemically known as:", opts: ["Iron oxide (Fe₂O₃)", "Iron chloride", "Iron sulfate", "Iron carbonate"], ans: 0, d: "medium", t: "tier2", sub: "Chemistry" },
  { q: "Which device converts mechanical energy into electrical energy?", opts: ["Generator", "Motor", "Transformer", "Battery"], ans: 0, d: "easy", t: "tier1", sub: "Physics" },
  { q: "DNA stands for:", opts: ["Deoxyribonucleic Acid", "Dinitro Acid", "Dinucleic Acid", "Deoxyribo Acid"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
];

science.forEach(item => {
  questions.push(makeQ({
    topic: 'Science', subtopic: item.sub,
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// ECONOMY
// =====================================================
const economy = [
  { q: "The Reserve Bank of India was established in:", opts: ["1935", "1947", "1950", "1930"], ans: 0, d: "easy", t: "tier1", sub: "Banking" },
  { q: "GDP stands for:", opts: ["Gross Domestic Product", "Gross Development Product", "General Domestic Product", "Gross Domestic Price"], ans: 0, d: "easy", t: "tier1", sub: "National Income" },
  { q: "NITI Aayog replaced which body?", opts: ["Planning Commission", "Finance Commission", "National Commission", "Economic Council"], ans: 0, d: "easy", t: "tier1", sub: "Economic Policy" },
  { q: "Which tax replaced multiple indirect taxes in India from July 2017?", opts: ["GST", "VAT", "Service Tax", "Excise Duty"], ans: 0, d: "easy", t: "tier1", sub: "Taxation" },
  { q: "The fiscal deficit is:", opts: ["Total expenditure minus total revenue receipts and non-debt capital receipts", "Revenue expenditure minus revenue receipts", "Total expenditure minus total receipts", "Capital expenditure minus capital receipts"], ans: 0, d: "medium", t: "tier2", sub: "Public Finance" },
  { q: "Who is the current regulator of the stock market in India?", opts: ["SEBI", "RBI", "NABARD", "IRDA"], ans: 0, d: "easy", t: "tier1", sub: "Capital Market" },
  { q: "Mixed economy means:", opts: ["Co-existence of public and private sector", "Only government sector", "Only private sector", "Foreign companies only"], ans: 0, d: "easy", t: "tier1", sub: "Economic System" },
  { q: "The currency of India is issued by:", opts: ["Reserve Bank of India", "Government of India", "Finance Ministry", "State Bank of India"], ans: 0, d: "easy", t: "tier1", sub: "Banking", exp: "Notes are issued by RBI (except ₹1 coin/note by Govt)" },
  { q: "Census in India is conducted every:", opts: ["10 years", "5 years", "15 years", "7 years"], ans: 0, d: "easy", t: "tier1", sub: "Demography" },
  { q: "Which Five Year Plan is associated with the Mahalanobis model?", opts: ["Second Five Year Plan", "First", "Third", "Fourth"], ans: 0, d: "medium", t: "tier2", sub: "Economic Planning" },
  { q: "What does 'Repo Rate' refer to?", opts: ["Rate at which RBI lends to commercial banks", "Rate at which banks lend to public", "Rate at which RBI borrows from banks", "Interest rate on savings accounts"], ans: 0, d: "easy", t: "tier1", sub: "Monetary Policy" },
  { q: "MUDRA Bank was launched to support:", opts: ["Micro enterprises", "Large industries", "Agricultural sector", "Foreign trade"], ans: 0, d: "medium", t: "tier1", sub: "Financial Inclusion" },
  { q: "Which organization gives loans to member countries for development?", opts: ["World Bank", "WTO", "IMF", "UNICEF"], ans: 0, d: "easy", t: "tier1", sub: "International Organizations" },
  { q: "What is the full form of SLR?", opts: ["Statutory Liquidity Ratio", "Standard Lending Rate", "Systematic Liquidity Rate", "Standard Liquidity Ratio"], ans: 0, d: "easy", t: "tier1", sub: "Banking" },
  { q: "Inflation is measured by:", opts: ["Consumer Price Index (CPI)", "GDP", "GNP", "Sensex"], ans: 0, d: "easy", t: "tier1", sub: "Inflation" },
];

economy.forEach(item => {
  questions.push(makeQ({
    topic: 'Economy', subtopic: item.sub,
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t, explanation: item.exp || ''
  }));
});

// =====================================================
// COMPUTER AWARENESS (Common in Tier 2)
// =====================================================
const computer = [
  { q: "What does CPU stand for?", opts: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"], ans: 0, d: "easy", t: "tier2", sub: "Hardware" },
  { q: "Which of the following is an output device?", opts: ["Monitor", "Keyboard", "Mouse", "Scanner"], ans: 0, d: "easy", t: "tier2", sub: "Hardware" },
  { q: "RAM stands for:", opts: ["Random Access Memory", "Read Access Memory", "Random Available Memory", "Read Available Memory"], ans: 0, d: "easy", t: "tier2", sub: "Memory" },
  { q: "1 KB (Kilobyte) equals:", opts: ["1024 Bytes", "1000 Bytes", "512 Bytes", "2048 Bytes"], ans: 0, d: "easy", t: "tier2", sub: "Memory" },
  { q: "Which is NOT an operating system?", opts: ["Oracle", "Windows", "Linux", "macOS"], ans: 0, d: "easy", t: "tier2", sub: "Software" },
  { q: "HTML stands for:", opts: ["HyperText Markup Language", "High Text Markup Language", "HyperText Machine Language", "High Transfer Markup Language"], ans: 0, d: "easy", t: "tier2", sub: "Internet" },
  { q: "Which protocol is used for sending emails?", opts: ["SMTP", "HTTP", "FTP", "TCP"], ans: 0, d: "medium", t: "tier2", sub: "Internet" },
  { q: "The brain of the computer is:", opts: ["CPU", "RAM", "Hard Disk", "Mother Board"], ans: 0, d: "easy", t: "tier2", sub: "Hardware" },
  { q: "Which is a volatile memory?", opts: ["RAM", "ROM", "Hard Disk", "CD-ROM"], ans: 0, d: "easy", t: "tier2", sub: "Memory" },
  { q: "What does URL stand for?", opts: ["Uniform Resource Locator", "Universal Resource Locator", "Uniform Resource Link", "Universal Resource Link"], ans: 0, d: "easy", t: "tier2", sub: "Internet" },
  { q: "Binary number system has base:", opts: ["2", "8", "10", "16"], ans: 0, d: "easy", t: "tier2", sub: "Number System" },
  { q: "Which shortcut key is used to copy text?", opts: ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Z"], ans: 0, d: "easy", t: "tier2", sub: "Shortcuts" },
  { q: "MS Excel is a:", opts: ["Spreadsheet software", "Word processor", "Database software", "Presentation software"], ans: 0, d: "easy", t: "tier2", sub: "Software" },
  { q: "Which of the following is a search engine?", opts: ["Google", "Windows", "Linux", "Oracle"], ans: 0, d: "easy", t: "tier2", sub: "Internet" },
  { q: "What is phishing?", opts: ["A type of cyber attack to steal personal information", "A networking protocol", "A type of firewall", "A programming language"], ans: 0, d: "medium", t: "tier2", sub: "Cyber Security" },
  { q: "What does LAN stand for?", opts: ["Local Area Network", "Large Area Network", "Long Area Network", "Light Area Network"], ans: 0, d: "easy", t: "tier2", sub: "Networking" },
  { q: "Which device is used to connect a computer to the internet?", opts: ["Modem", "Printer", "Scanner", "Speaker"], ans: 0, d: "easy", t: "tier2", sub: "Networking" },
  { q: "The shortcut key for 'Undo' operation is:", opts: ["Ctrl+Z", "Ctrl+Y", "Ctrl+X", "Ctrl+U"], ans: 0, d: "easy", t: "tier2", sub: "Shortcuts" },
  { q: "ROM stands for:", opts: ["Read Only Memory", "Random Only Memory", "Read Open Memory", "Recent Output Memory"], ans: 0, d: "easy", t: "tier2", sub: "Memory" },
  { q: "Which generation of computers used Integrated Circuits?", opts: ["Third Generation", "First Generation", "Second Generation", "Fourth Generation"], ans: 0, d: "medium", t: "tier2", sub: "Computer Generations" },
  { q: "What is the full form of PDF?", opts: ["Portable Document Format", "Printed Document Format", "Public Document Format", "Personal Document Format"], ans: 0, d: "easy", t: "tier2", sub: "Software" },
  { q: "Which key is used to refresh a webpage?", opts: ["F5", "F1", "F7", "F12"], ans: 0, d: "easy", t: "tier2", sub: "Shortcuts" },
  { q: "What is malware?", opts: ["Malicious software", "Multimedia software", "Micro software", "Management software"], ans: 0, d: "easy", t: "tier2", sub: "Cyber Security" },
  { q: "Which language is used for web development?", opts: ["JavaScript", "COBOL", "FORTRAN", "Assembly"], ans: 0, d: "easy", t: "tier2", sub: "Programming" },
  { q: "BIOS stands for:", opts: ["Basic Input Output System", "Binary Input Output System", "Base Input Output System", "Basic Internal Operating System"], ans: 0, d: "medium", t: "tier2", sub: "Hardware" },
  { q: "What does SQL stand for?", opts: ["Structured Query Language", "Standard Query Language", "Simple Query Language", "System Query Language"], ans: 0, d: "easy", t: "tier2", sub: "Database" },
  { q: "The hexadecimal number system has a base of:", opts: ["16", "8", "10", "2"], ans: 0, d: "easy", t: "tier2", sub: "Number System" },
  { q: "Which of these is an input device?", opts: ["Keyboard", "Monitor", "Printer", "Speaker"], ans: 0, d: "easy", t: "tier2", sub: "Hardware" },
  { q: "What is cache memory?", opts: ["High-speed memory between CPU and RAM", "External storage device", "A type of ROM", "Virtual memory"], ans: 0, d: "medium", t: "tier2", sub: "Memory" },
  { q: "Wi-Fi stands for:", opts: ["Wireless Fidelity", "Wired Frequency", "Wireless Frequency", "Wide Fidelity"], ans: 0, d: "easy", t: "tier2", sub: "Networking" },
];

computer.forEach(item => {
  questions.push(makeQ({
    topic: 'Computer Awareness', subtopic: item.sub,
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// STATIC GK (MISC)
// =====================================================
const staticGK = [
  { q: "Which is the national animal of India?", opts: ["Bengal Tiger", "Lion", "Elephant", "Peacock"], ans: 0, d: "easy", t: "tier1", sub: "National Symbols" },
  { q: "Which is the national flower of India?", opts: ["Lotus", "Rose", "Sunflower", "Lily"], ans: 0, d: "easy", t: "tier1", sub: "National Symbols" },
  { q: "The Nobel Prize is awarded in how many fields?", opts: ["6", "5", "7", "8"], ans: 0, d: "easy", t: "tier1", sub: "Awards" },
  { q: "Which is the smallest state of India by area?", opts: ["Goa", "Sikkim", "Tripura", "Delhi"], ans: 0, d: "easy", t: "tier1", sub: "Indian States" },
  { q: "Who wrote the national anthem of India?", opts: ["Rabindranath Tagore", "Bankim Chandra Chatterjee", "Subhas Chandra Bose", "Mahatma Gandhi"], ans: 0, d: "easy", t: "tier1", sub: "National Symbols" },
  { q: "The headquarter of the United Nations is in:", opts: ["New York", "Geneva", "London", "Paris"], ans: 0, d: "easy", t: "tier1", sub: "International Organizations" },
  { q: "Bharat Ratna is the highest civilian award in India. When was it instituted?", opts: ["1954", "1950", "1947", "1960"], ans: 0, d: "medium", t: "tier2", sub: "Awards" },
  { q: "Which is the largest continent by area?", opts: ["Asia", "Africa", "Europe", "North America"], ans: 0, d: "easy", t: "tier1", sub: "World Geography" },
  { q: "Indian Space Research Organisation (ISRO) is headquartered in:", opts: ["Bengaluru", "New Delhi", "Hyderabad", "Chennai"], ans: 0, d: "easy", t: "tier1", sub: "Organizations" },
  { q: "Who is known as the 'Father of the Indian Constitution'?", opts: ["Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Mahatma Gandhi", "Dr. Rajendra Prasad"], ans: 0, d: "easy", t: "tier1", sub: "Famous Personalities" },
  { q: "Which vitamin deficiency causes Night Blindness?", opts: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], ans: 0, d: "easy", t: "tier1", sub: "Health" },
  { q: "Olympic Games are held every:", opts: ["4 years", "2 years", "3 years", "5 years"], ans: 0, d: "easy", t: "tier1", sub: "Sports" },
  { q: "Who invented the telephone?", opts: ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"], ans: 0, d: "easy", t: "tier1", sub: "Inventions" },
  { q: "World Environment Day is celebrated on:", opts: ["June 5", "June 21", "May 5", "April 22"], ans: 0, d: "medium", t: "tier1", sub: "Important Days" },
  { q: "Which organ purifies blood in the human body?", opts: ["Kidney", "Heart", "Liver", "Lungs"], ans: 0, d: "easy", t: "tier1", sub: "Biology" },
];

staticGK.forEach(item => {
  questions.push(makeQ({
    topic: item.sub || 'General Knowledge', subtopic: item.sub,
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// DEDUP & IMPORT
// =====================================================
function isDuplicate(newQ) {
  const normalizedNew = newQ.question.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 60);
  return existingQs.some(eq => {
    const ne = eq.question.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 60);
    return normalizedNew === ne;
  });
}

let added = 0, skipped = 0;
questions.forEach(q => {
  if (!isDuplicate(q)) {
    existingQs.push(q);
    added++;
  } else {
    skipped++;
  }
});

bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

console.log(`\n=== GK IMPORT COMPLETE ===`);
console.log(`Total generated: ${questions.length}`);
console.log(`Added: ${added}`);
console.log(`Skipped (dupes): ${skipped}`);
console.log(`New bank total: ${existingQs.length}`);

const topicCount = {};
questions.forEach(q => { topicCount[q.topic] = (topicCount[q.topic] || 0) + 1; });
console.log('\nBy topic:');
Object.entries(topicCount).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log(`  ${t}: ${c}`));
