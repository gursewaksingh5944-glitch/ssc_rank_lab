/**
 * Bulk import: English questions for SSC CGL Tier 1 & Tier 2
 * Covers: Synonyms, Antonyms, Idioms, One-word substitution, Spelling, Cloze, Comprehension, Error spotting
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
    subject: 'english',
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
    source: { kind: 'bulk_import', fileName: 'import-english-bulk.js', importedAt: now },
    createdAt: now,
    updatedAt: now
  };
}

const questions = [];

// =====================================================
// SYNONYMS
// =====================================================
const synonyms = [
  { q: "Choose the synonym of 'Abate':", opts: ["Decrease", "Increase", "Create", "Destroy"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the synonym of 'Benevolent':", opts: ["Kind", "Cruel", "Harsh", "Selfish"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the synonym of 'Candid':", opts: ["Frank", "Dishonest", "Reserved", "Hidden"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the synonym of 'Diligent':", opts: ["Hardworking", "Lazy", "Careless", "Slow"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the synonym of 'Eloquent':", opts: ["Articulate", "Silent", "Dull", "Boring"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the synonym of 'Feeble':", opts: ["Weak", "Strong", "Mighty", "Powerful"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the synonym of 'Gregarious':", opts: ["Sociable", "Lonely", "Shy", "Quiet"], ans: 0, d: "hard", t: "tier2" },
  { q: "Choose the synonym of 'Haughty':", opts: ["Arrogant", "Humble", "Modest", "Simple"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the synonym of 'Impede':", opts: ["Hinder", "Help", "Assist", "Speed up"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the synonym of 'Jubilant':", opts: ["Joyful", "Sad", "Angry", "Fearful"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the synonym of 'Lethargic':", opts: ["Sluggish", "Energetic", "Active", "Brisk"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the synonym of 'Meticulous':", opts: ["Careful", "Careless", "Sloppy", "Quick"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the synonym of 'Obscure':", opts: ["Unclear", "Obvious", "Famous", "Bright"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the synonym of 'Prudent':", opts: ["Wise", "Foolish", "Reckless", "Hasty"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the synonym of 'Resilient':", opts: ["Tough", "Fragile", "Weak", "Delicate"], ans: 0, d: "medium", t: "tier2" },
];

synonyms.forEach(item => {
  questions.push(makeQ({
    topic: 'Synonyms', subtopic: 'Vocabulary',
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// ANTONYMS
// =====================================================
const antonyms = [
  { q: "Choose the antonym of 'Abundant':", opts: ["Scarce", "Plentiful", "Ample", "Sufficient"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the antonym of 'Bold':", opts: ["Timid", "Brave", "Courageous", "Fearless"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the antonym of 'Conceal':", opts: ["Reveal", "Hide", "Cover", "Mask"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the antonym of 'Dwindle':", opts: ["Increase", "Decrease", "Shrink", "Reduce"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the antonym of 'Exquisite':", opts: ["Ugly", "Beautiful", "Delicate", "Fine"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the antonym of 'Frugal':", opts: ["Extravagant", "Thrifty", "Economical", "Sparing"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the antonym of 'Gloomy':", opts: ["Cheerful", "Dark", "Sad", "Dismal"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the antonym of 'Hostile':", opts: ["Friendly", "Aggressive", "Angry", "Fierce"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the antonym of 'Ignorant':", opts: ["Knowledgeable", "Stupid", "Foolish", "Unaware"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the antonym of 'Jovial':", opts: ["Gloomy", "Happy", "Cheerful", "Merry"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the antonym of 'Vague':", opts: ["Clear", "Uncertain", "Ambiguous", "Hazy"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the antonym of 'Zenith':", opts: ["Nadir", "Peak", "Summit", "Top"], ans: 0, d: "hard", t: "tier2" },
  { q: "Choose the antonym of 'Opaque':", opts: ["Transparent", "Dark", "Cloudy", "Thick"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the antonym of 'Prolific':", opts: ["Barren", "Fertile", "Productive", "Creative"], ans: 0, d: "hard", t: "tier2" },
  { q: "Choose the antonym of 'Benign':", opts: ["Malignant", "Kind", "Gentle", "Harmless"], ans: 0, d: "medium", t: "tier2" },
];

antonyms.forEach(item => {
  questions.push(makeQ({
    topic: 'Antonyms', subtopic: 'Vocabulary',
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// IDIOMS & PHRASES
// =====================================================
const idioms = [
  { q: "What does the idiom 'A piece of cake' mean?", opts: ["Something very easy", "A slice of cake", "Something expensive", "Something tasty"], ans: 0, d: "easy", t: "tier1" },
  { q: "'To beat around the bush' means:", opts: ["To avoid the main topic", "To hit bushes", "To search for something", "To walk in a garden"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Burning the midnight oil' means:", opts: ["Working late at night", "Wasting oil", "Starting a fire", "Cooking at night"], ans: 0, d: "easy", t: "tier1" },
  { q: "'A bolt from the blue' means:", opts: ["A sudden unexpected event", "A lightning strike", "A blue color", "A loud noise"], ans: 0, d: "easy", t: "tier1" },
  { q: "'To turn over a new leaf' means:", opts: ["To make a fresh start", "To change a page", "To plant a tree", "To pick up leaves"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Hit the nail on the head' means:", opts: ["To be exactly right", "To use a hammer", "To hurt oneself", "To build something"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Once in a blue moon' means:", opts: ["Very rarely", "During full moon", "Every night", "Frequently"], ans: 0, d: "easy", t: "tier1" },
  { q: "'To cry over spilt milk' means:", opts: ["To regret over something that cannot be undone", "To clean milk", "To cry while drinking", "To waste milk"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Break the ice' means:", opts: ["To initiate a conversation", "To break frozen water", "To cool something", "To end a relationship"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Bite the bullet' means:", opts: ["To endure a painful situation bravely", "To eat something hard", "To shoot a gun", "To bite metal"], ans: 0, d: "medium", t: "tier2" },
  { q: "'Spill the beans' means:", opts: ["To reveal a secret", "To drop food", "To cook beans", "To make a mess"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Under the weather' means:", opts: ["Feeling ill", "Standing in rain", "Below the sky", "Cold temperature"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Kill two birds with one stone' means:", opts: ["To achieve two things at once", "Hunting birds", "Throwing stones", "A crime"], ans: 0, d: "easy", t: "tier1" },
  { q: "'To add fuel to the fire' means:", opts: ["To make a situation worse", "To start cooking", "To light a bonfire", "To help someone"], ans: 0, d: "easy", t: "tier1" },
  { q: "'Barking up the wrong tree' means:", opts: ["Making a wrong assumption", "A dog barking", "Climbing a tree", "In a forest"], ans: 0, d: "medium", t: "tier2" },
];

idioms.forEach(item => {
  questions.push(makeQ({
    topic: 'Idioms & Phrases', subtopic: 'Idioms',
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// ONE WORD SUBSTITUTION
// =====================================================
const oneWord = [
  { q: "One who eats human flesh:", opts: ["Cannibal", "Herbivore", "Omnivore", "Carnivore"], ans: 0, d: "easy", t: "tier1" },
  { q: "One who knows everything:", opts: ["Omniscient", "Omnipresent", "Omnipotent", "Omnivore"], ans: 0, d: "easy", t: "tier1" },
  { q: "A person who speaks many languages:", opts: ["Polyglot", "Linguist", "Bilingual", "Translator"], ans: 0, d: "medium", t: "tier1" },
  { q: "A government by the people:", opts: ["Democracy", "Autocracy", "Monarchy", "Theocracy"], ans: 0, d: "easy", t: "tier1" },
  { q: "One who hates mankind:", opts: ["Misanthrope", "Philanthropist", "Anthropologist", "Misogynist"], ans: 0, d: "medium", t: "tier2" },
  { q: "An animal that lives both on land and in water:", opts: ["Amphibian", "Reptile", "Mammal", "Aquatic"], ans: 0, d: "easy", t: "tier1" },
  { q: "A person who loves books:", opts: ["Bibliophile", "Bibliographer", "Librarian", "Scholar"], ans: 0, d: "medium", t: "tier1" },
  { q: "A place where dead bodies are kept:", opts: ["Mortuary", "Cemetery", "Crematorium", "Tomb"], ans: 0, d: "easy", t: "tier1" },
  { q: "One who walks in sleep:", opts: ["Somnambulist", "Insomniac", "Somnolent", "Sleepwalker"], ans: 0, d: "medium", t: "tier2" },
  { q: "A person who is against the use of war or violence:", opts: ["Pacifist", "Anarchist", "Militant", "Activist"], ans: 0, d: "medium", t: "tier1" },
  { q: "Murder of one's own father:", opts: ["Patricide", "Matricide", "Fratricide", "Regicide"], ans: 0, d: "medium", t: "tier2" },
  { q: "A speech made without preparation:", opts: ["Extempore", "Rehearsal", "Soliloquy", "Monologue"], ans: 0, d: "medium", t: "tier1" },
  { q: "One who cannot be corrected:", opts: ["Incorrigible", "Incurable", "Indispensable", "Infallible"], ans: 0, d: "medium", t: "tier2" },
  { q: "A person who collects stamps:", opts: ["Philatelist", "Numismatist", "Archaeologist", "Geologist"], ans: 0, d: "easy", t: "tier1" },
  { q: "Study of the origin and history of words:", opts: ["Etymology", "Entomology", "Ecology", "Ethnology"], ans: 0, d: "hard", t: "tier2" },
];

oneWord.forEach(item => {
  questions.push(makeQ({
    topic: 'One Word Substitution', subtopic: 'Vocabulary',
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// ERROR SPOTTING
// =====================================================
const errorSpotting = [
  { q: "Find the error: 'He go to school every day.'", opts: ["go should be goes", "to should be at", "every should be each", "No error"], ans: 0, d: "easy", t: "tier1" },
  { q: "Find the error: 'She is more taller than her sister.'", opts: ["more taller should be taller", "is should be was", "than should be then", "No error"], ans: 0, d: "easy", t: "tier1" },
  { q: "Find the error: 'The news are not good.'", opts: ["are should be is", "not should be no", "good should be well", "No error"], ans: 0, d: "easy", t: "tier1" },
  { q: "Find the error: 'Each of the boys have done their work.'", opts: ["have should be has", "their should be his", "Both A and B", "No error"], ans: 2, d: "medium", t: "tier2" },
  { q: "Find the error: 'Neither of the girls were present.'", opts: ["were should be was", "of should be from", "girls should be girl", "No error"], ans: 0, d: "medium", t: "tier1" },
  { q: "Find the error: 'He has been living here since five years.'", opts: ["since should be for", "has should be had", "living should be lived", "No error"], ans: 0, d: "medium", t: "tier1" },
  { q: "Find the error: 'One of my friend is a doctor.'", opts: ["friend should be friends", "is should be are", "a should be the", "No error"], ans: 0, d: "easy", t: "tier1" },
  { q: "Find the error: 'If I was you, I would not do this.'", opts: ["was should be were", "would should be will", "not should be never", "No error"], ans: 0, d: "medium", t: "tier2" },
  { q: "Find the error: 'The furniture are very expensive.'", opts: ["are should be is", "very should be too", "expensive should be costly", "No error"], ans: 0, d: "easy", t: "tier1" },
  { q: "Find the error: 'He gave me an advice.'", opts: ["an should be removed (advice is uncountable)", "me should be to me", "gave should be give", "No error"], ans: 0, d: "medium", t: "tier2" },
];

errorSpotting.forEach(item => {
  questions.push(makeQ({
    topic: 'Error Spotting', subtopic: 'Grammar',
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// SENTENCE IMPROVEMENT
// =====================================================
const sentenceImprovement = [
  { q: "Improve the sentence: 'He is working here since 2010.'", opts: ["He has been working here since 2010.", "He was working here since 2010.", "He worked here since 2010.", "No improvement"], ans: 0, d: "medium", t: "tier1" },
  { q: "Improve: 'I have visited Agra last year.'", opts: ["I visited Agra last year.", "I had visited Agra last year.", "I was visiting Agra last year.", "No improvement"], ans: 0, d: "easy", t: "tier1" },
  { q: "Improve: 'He asked me that where I lived.'", opts: ["He asked me where I lived.", "He asked me where did I live.", "He asked that where I lived.", "No improvement"], ans: 0, d: "medium", t: "tier2" },
  { q: "Improve: 'When I reached the station, the train already left.'", opts: ["the train had already left", "the train has already left", "the train was already left", "No improvement"], ans: 0, d: "medium", t: "tier1" },
  { q: "Improve: 'She did not knew the answer.'", opts: ["She did not know the answer.", "She does not knew the answer.", "She had not knew the answer.", "No improvement"], ans: 0, d: "easy", t: "tier1" },
  { q: "Improve: 'He is more stronger than his brother.'", opts: ["He is stronger than his brother.", "He is most stronger than his brother.", "He is much more stronger.", "No improvement"], ans: 0, d: "easy", t: "tier1" },
  { q: "Improve: 'Hardly had he reached there than it started raining.'", opts: ["Hardly had he reached there when it started raining.", "Hardly he reached there when it started raining.", "Hardly had he reached there then it started raining.", "No improvement"], ans: 0, d: "hard", t: "tier2" },
  { q: "Improve: 'Unless you do not work hard, you will not succeed.'", opts: ["Unless you work hard, you will not succeed.", "If you do not work hard, you will not succeed.", "Both A and B are correct", "No improvement"], ans: 2, d: "medium", t: "tier2" },
  { q: "Improve: 'I and my friend went to the market.'", opts: ["My friend and I went to the market.", "My friend and me went to the market.", "Me and my friend went to the market.", "No improvement"], ans: 0, d: "easy", t: "tier1" },
  { q: "Improve: 'The teacher asked the students to do their homework's.'", opts: ["to do their homework", "to did their homeworks", "to doing their homework", "No improvement"], ans: 0, d: "easy", t: "tier1" },
];

sentenceImprovement.forEach(item => {
  questions.push(makeQ({
    topic: 'Sentence Improvement', subtopic: 'Grammar',
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// FILL IN THE BLANKS
// =====================================================
const fillBlanks = [
  { q: "He _____ to the office daily by bus.", opts: ["goes", "go", "going", "gone"], ans: 0, d: "easy", t: "tier1" },
  { q: "She _____ her homework before dinner last night.", opts: ["had completed", "has completed", "completed", "completes"], ans: 0, d: "medium", t: "tier1" },
  { q: "If it _____ tomorrow, we will cancel the picnic.", opts: ["rains", "rain", "rained", "raining"], ans: 0, d: "easy", t: "tier1" },
  { q: "The committee _____ divided in their opinions.", opts: ["were", "was", "is", "has"], ans: 0, d: "medium", t: "tier2" },
  { q: "He is _____ honest man.", opts: ["an", "a", "the", "no article"], ans: 0, d: "easy", t: "tier1" },
  { q: "Neither the teacher nor the students _____ present.", opts: ["were", "was", "is", "has been"], ans: 0, d: "medium", t: "tier2" },
  { q: "She is _____ than her sister.", opts: ["more beautiful", "beautifuller", "most beautiful", "beauty"], ans: 0, d: "easy", t: "tier1" },
  { q: "He has been working here _____ 2015.", opts: ["since", "for", "from", "by"], ans: 0, d: "easy", t: "tier1" },
  { q: "I _____ rather die than beg.", opts: ["would", "should", "could", "will"], ans: 0, d: "medium", t: "tier2" },
  { q: "He is good _____ mathematics.", opts: ["at", "in", "on", "for"], ans: 0, d: "easy", t: "tier1" },
];

fillBlanks.forEach(item => {
  questions.push(makeQ({
    topic: 'Fill in the Blanks', subtopic: 'Grammar',
    question: item.q, options: item.opts, answerIndex: item.ans,
    difficulty: item.d, tier: item.t
  }));
});

// =====================================================
// SPELLING CORRECTION
// =====================================================
const spelling = [
  { q: "Choose the correctly spelt word:", opts: ["Accommodation", "Accomodation", "Acomodation", "Acommodation"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the correctly spelt word:", opts: ["Entrepreneur", "Entrepeneur", "Entreprneur", "Enterprener"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the correctly spelt word:", opts: ["Maintenance", "Maintainance", "Maintenence", "Maintanance"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the correctly spelt word:", opts: ["Occurrence", "Occurence", "Occurance", "Ocurrence"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the correctly spelt word:", opts: ["Privilege", "Priviledge", "Privelege", "Privilage"], ans: 0, d: "medium", t: "tier2" },
  { q: "Choose the correctly spelt word:", opts: ["Restaurant", "Resturant", "Restarant", "Restaurent"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the correctly spelt word:", opts: ["Necessary", "Neccessary", "Necesary", "Neccesary"], ans: 0, d: "easy", t: "tier1" },
  { q: "Choose the correctly spelt word:", opts: ["Conscience", "Concience", "Consience", "Conscince"], ans: 0, d: "hard", t: "tier2" },
  { q: "Choose the correctly spelt word:", opts: ["Definitely", "Definately", "Defenitely", "Definatly"], ans: 0, d: "medium", t: "tier1" },
  { q: "Choose the correctly spelt word:", opts: ["Embarrassment", "Embarassment", "Embarrasment", "Embarassement"], ans: 0, d: "medium", t: "tier2" },
];

spelling.forEach(item => {
  questions.push(makeQ({
    topic: 'Spelling', subtopic: 'Spelling Correction',
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

console.log(`\n=== ENGLISH IMPORT COMPLETE ===`);
console.log(`Total generated: ${questions.length}`);
console.log(`Added: ${added}`);
console.log(`Skipped (dupes): ${skipped}`);
console.log(`New bank total: ${existingQs.length}`);

const topicCount = {};
questions.forEach(q => { topicCount[q.topic] = (topicCount[q.topic] || 0) + 1; });
console.log('\nBy topic:');
Object.entries(topicCount).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log(`  ${t}: ${c}`));
