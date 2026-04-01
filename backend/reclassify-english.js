#!/usr/bin/env node
/**
 * Reclassify English questions from generic "English" topic
 * into proper SSC canonical topics based on content analysis.
 *
 * Run: node backend/reclassify-english.js --dry-run   (preview)
 * Run: node backend/reclassify-english.js              (apply)
 */

const fs = require("fs");
const path = require("path");

const BANK_PATH = path.join(__dirname, "data", "question-bank.json");
const dryRun = process.argv.includes("--dry-run");

// ── Content-based classifiers ─────────────────────────────────────

/**
 * Detects passive voice constructions in text.
 * Looks for: be-verb + past-participle patterns (regular -ed AND irregular).
 */
function hasPassiveConstruction(text) {
  // Regular past participle: "was/were/been/being/be + word-ed"
  if (/\b(was|were|been|being|be|is|are|am)\s+\w+ed\b/.test(text)) return true;
  // With adverb: "was carefully examined"
  if (/\b(was|were|been|being|be|is|are)\s+\w+ly\s+\w+ed\b/.test(text)) return true;
  // Irregular past participles
  const irr = "given|taken|driven|broken|written|spoken|chosen|known|shown|sent|built|sold|told|made|kept|left|found|cut|put|shut|done|seen|heard|held|read|run|thought|brought|bought|caught|taught|drawn|grown|thrown|worn|torn|born|hung|dug|dealt|felt|fed|fled|led|lent|met|paid|rid|sat|set|shed|shut|slit|slung|spun|split|spread|sprung|stuck|stung|stunk|struck|strung|swung|wound|wrung";
  const irrRegex = new RegExp("\\b(was|were|been|being|be|is|are|am)\\s+(" + irr + ")\\b");
  if (irrRegex.test(text)) return true;
  // "let X be done/called/given" etc
  if (/\blet\s+.+\s+be\s+\w+/.test(text)) return true;
  // Modal passive: "must/should/can/will/may + be + verb"
  if (/\b(must|should|can|could|will|would|may|might|shall)\s+be\s+\w+/.test(text)) return true;
  // "have/has/had + been + verb"
  if (/\b(have|has|had)\s+been\s+\w+/.test(text)) return true;
  return false;
}

function classifyEnglish(q, engIndex) {
  const text = (q.question || "").toLowerCase();
  const opts = (q.options || []).map(o => o.toLowerCase());
  const allOpts = opts.join(" ");

  // ── 0. OCR noise / grammar notes (check first to exclude garbage) ──
  if (
    text.includes("https://digitallylearn.com") ||
    (text.includes("chapter") && text.includes("424")) ||
    /^(noun|verb|pronoun|adjective|adverb|preposition|conjunction|article)\s+(chapter|gender)/i.test(text.trim()) ||
    // Heavy Hindi content with no clear question structure
    (text.match(/[^\x00-\x7F]/g) || []).length > text.length * 0.3 ||
    // Textbook grammar note patterns (not real questions)
    /^(subject verb|non-finite|main clause|abstract noun|envy jealous)/i.test(text.trim()) ||
    /^v\s+(had|played)\s+/i.test(text.trim()) ||
    /^(very\s+r|dqn|uhps|\d+s\s+mp)/i.test(text.trim()) ||
    /\bapostrophe\b.*\bpossessiv/i.test(text)
  ) {
    return "__GRAMMAR_NOISE__";
  }

  // ── 1. Direct / Indirect speech ──
  // Check FIRST because DI questions can contain passive constructions in options
  const diTextPatterns = [
    /said to /,
    /said,\s*"/,
    /said,\s*\u201c/,
    /\bhe said\b/,
    /\bshe said\b/,
    /\bthey said\b/,
    /\bwe said\b/,
    /\bi said\b/,
    /\bsaid the\b/,         // "said the judge"
    /\bsaid \w+\./,         // "said Jaya."
    /\bcried,?\s*"/,         // "cried, " or "cried "
    /\bcried\b.*\bhe\b/,
    /\bshouted\b/,
    /\byelled\b/,
    /\bwhispered\b/,
    /\bexclaimed\b/,
    /\benquired\b/,
    /\breplied\b/,
    /\bpleaded\b/,
    /\bannounced that\b/,
    /\breiterated\b/,
    /\bwondered\b.*\bhow\b/,
    /\bwrote in (his|her) report\b/,
    /\bwanted to know\b/,
    /\bregretted\b/,
    /\brequested\b/,
    /\bpromised\b/,
    /\bhe says\b/,
    /\bshe says\b/,
    /\b\w+ says\b/,
    /\b\w+ reported that\b/,
    /reported speech/,
    /direct.*indirect/,
    /indirect.*direct/,
    /told .+ that\b/,
    /told .+ not to\b/,
    /told .+ to\b/,
    /asked .+ if\b/,
    /asked .+ whether\b/,
    /ordered .+ to\b/,
    /advised .+ to\b/,
    /commanded .+ to\b/,
    /begged .+ to\b/,
    /suggested .+ing\b/,
    /blessed .+ with\b/,
  ];
  // Quotation marks are a strong signal for direct speech
  const hasQuotes = /[""\u201c\u201d]/.test(q.question || "");
  const hasSpeechVerb = /\b(said|asked|told|replied|cried|shouted|yelled|whispered|exclaimed|enquired|pleaded|suggested|commanded|ordered|begged|warned|reiterated|wondered|reported|wrote|announced|requested|promised|says)\b/.test(text);

  if (diTextPatterns.some(p => p.test(text))) {
    return "Direct Indirect";
  }
  // Quotation marks + speech verb = direct/indirect
  if (hasQuotes && hasSpeechVerb) {
    return "Direct Indirect";
  }
  // Options converting to/from reported speech
  const diOptPatterns = [
    /\btold .+ that\b/,
    /\basked .+ (if|whether)\b/,
    /\benquired\b/,
    /\bexclaimed\b.*\bthat\b/,
    /\breplied that\b/,
    /\bsaid to .+,\s*"/,
    /\bgreeted\b/,
    /\bblessed\b/,
    /\bregretted that\b/,
    /\bsaid,\s*"/,
    /\bsaid to .+,/,
    /please\b.*said/,
    /"don't|"do not|"did you/,
  ];
  if (diOptPatterns.filter(p => p.test(allOpts)).length >= 2) {
    return "Direct Indirect";
  }
  // Options with quoted speech markers ("..." in options → converting indirect to direct)
  const optsWithQuotes = opts.filter(o => o.includes('"') || o.includes('\u201c')).length;
  if (optsWithQuotes >= 2 && hasSpeechVerb) {
    return "Direct Indirect";
  }
  // If options contain 'he told' / 'she told' etc → reported speech
  if (
    allOpts.includes("he told") || allOpts.includes("she told") ||
    allOpts.includes("he asked") || allOpts.includes("she asked") ||
    allOpts.includes("he enquired") || allOpts.includes("she enquired") ||
    allOpts.includes("he exclaimed") || allOpts.includes("she exclaimed") ||
    allOpts.includes("he replied") || allOpts.includes("she replied")
  ) {
    return "Direct Indirect";
  }

  // ── 2. Active / Passive voice ──
  // Question-text signals
  const apTextSignals = [
    /\bpassive\b/,
    /\bactive voice\b/,
    /\bvoice.*changed\b/,
    /\bchange.*voice\b/,
  ];
  if (apTextSignals.some(p => p.test(text))) {
    return "Active Passive";
  }

  // Count how many options contain passive constructions
  const passiveOptsCount = opts.filter(o => hasPassiveConstruction(o)).length;
  // Count how many options contain active constructions
  // (converting passive back to active: options won't have passive patterns)
  const activeOptsCount = opts.filter(o => !hasPassiveConstruction(o)).length;

  // If the question itself has passive patterns and options don't (or vice versa)
  // → voice conversion question
  const qHasPassive = hasPassiveConstruction(text);

  // Strong signal: at least 2 options have passive constructions
  if (passiveOptsCount >= 2) {
    return "Active Passive";
  }
  // Question is passive, options are active conversions
  if (qHasPassive && activeOptsCount >= 2 && passiveOptsCount === 0) {
    return "Active Passive";
  }
  // At least 1 option has passive + position is in the AP section of the textbook
  // (questions 0-196 are from the Active/Passive chapter)
  if (passiveOptsCount >= 1 && engIndex <= 200) {
    return "Active Passive";
  }
  // "by" phrase in options as a passive marker (weaker signal)
  const byPhraseCount = opts.filter(o => /\bby (him|her|them|us|me|the|a|\w+body|somebody|someone)\b/.test(o)).length;
  if (byPhraseCount >= 2 && engIndex <= 200) {
    return "Active Passive";
  }
  // Reverse AP: question has passive, options convert to active (no passive in opts)
  if (qHasPassive && passiveOptsCount <= 1 && engIndex <= 200) {
    return "Active Passive";
  }
  // "It is said/it was said" in options = impersonal passive construction
  const impersonalPassive = opts.filter(o => /\bit (is|was|has been) (said|believed|known|reported|thought)\b/.test(o)).length;
  if (impersonalPassive >= 1 && engIndex <= 200) {
    return "Active Passive";
  }

  // ── 3. Idioms & Phrases ──
  const idiomPatterns = [
    /^to [a-z]+ (a |the |one'?s? |every )/,
    /^to [a-z]+ [a-z]+ [a-z]/,
    /^a [a-z]+ (from|in|of|on) /,
    /^an? \w+ \w+ (on|in|of|from|for) /,
    /^in (the )?[a-z]+ and /,
    /^by [a-z]+ (means|of)/,
    /^mad as /,
    /\bidiom\b/,
    /\bproverb\b/,
    /\bphrase\b/,
    /\bmeaning of\b/,
  ];
  // If short phrase-like question → idiom
  if (text.length < 100 && idiomPatterns.some(p => p.test(text))) {
    return "Idioms";
  }
  // Known idiom/phrasal-verb patterns in the question
  const phrasalVerbs = [
    "turned down", "gave up", "broke out", "put off", "took up",
    "called off", "get.+across", "set in", "brought about", "carried out",
    "run into", "stand for", "look into", "cut off", "keep up",
    "bring up", "come across", "show the white feather", "face the music",
    "dark horse", "beat about the bush", "send .+ to coventry",
    "kick the bucket", "at sea", "took to .+ heels", "bite the dust",
    "bolt from the blue", "in the red", "stole the show",
    "on good terms", "in lieu of", "the ghost", "measure up",
    "playing to the gallery", "blind eye", "fair means or foul",
    "two and two together", "off the cuff", "break the ice",
    "strike a bargain", "stand on ceremony", "beggar description",
    "march hare", "in the doldrums", "haul over the coals",
    "draw the long bow", "sackcloth and ashes",
    "feather.+nest", "flog a dead horse", "die in harness",
    "doctor the accounts", "strain every nerve", "keep .+ head",
    "fond of .+ own voice", "to be in.+doldrums",
    "nine days.+wonder", "make hay while", "put the cart",
    "add insult to injury", "burn the midnight oil",
    "leave no stone", "spill the beans", "cost an arm",
    "once in a blue moon", "piece of cake", "let the cat out",
    "ride roughshod", "drink life to the lees", "white elephant",
    "blue moon", "for a song", "fair.?weather friend",
    "make good the loss", "bone of contention", "deaf ear",
    "fits and starts", "stand on (his|her|their) feet",
    "out of (his|her|their) shell", "man in the street",
    "a leg to stand on", "cast aspersions?", "passed .+ off as",
    "pillar to post", "cart before the horse", "all greek",
    "trumped up", "gift of the gab", "had a hand in",
    "cold shoulder", "turn over a new leaf", "burn (his|her) fingers",
    "tongue in cheek", "at sixes and sevens", "bread and butter",
    "under the weather", "red tape", "crocodile tears",
    "get the sack", "wild goose chase", "hot water",
    "lend an ear", "out of the blue", "turn a blind eye",
  ];
  if (phrasalVerbs.some(pv => new RegExp(pv, "i").test(text))) {
    return "Idioms";
  }
  // Options that explain meanings → idiom
  const idiomOptionHints = [
    /\bto exaggerate\b/,
    /\bto be cautious\b/,
    /\bto be in .+ spirit/,
    /\bto refuse\b/,
    /\bto be lazy\b/,
    /\bto scold\b/,
    /\bcowardice\b/,
    /\bnot to notice\b/,
    /\bwithout preparation\b/,
    /\binsist on excessive\b/,
    /\bbeyond description\b/,
    /\bto be extravagant\b/,
    /\bto finalize a deal\b/,
    /\bnegotiate\b/,
    /\bboycott\b/,
    /\bcommence an interaction\b/,
    /\bto start quarrel/,
    /\bgreat mourning\b/,
    /\blow spirits?\b/,
    /\bto praise loudly\b/,
    /\bin a crisis\b/,
    /\bto criticize\b/,
    /\bto admire\b/,
    /\bsent back\b/,
    /\brefused\b/,
    /\bhanded over\b/,
    /\badopting cheap tactics\b/,
    /\bbefooling\b/,
    /\bfighting for votes\b/,
    /\bappeasing\b/,
    /\bsigns of cowardice\b/,
    /\bact arrogantly\b/,
    /\bpunished severely\b/,
    /\bpretended not to\b/,
    /\bpaid special attention\b/,
    /\bmake .+ understand\b/,
    /\bhonest or dishonest\b/,
    /\bwise beyond\b/,
    /\bwithout difficulty\b/,
    /\bdeduce from given facts\b/,
    /\bvery cheaply\b/,
    /\bon loan\b/,
    /\bcostly and useless\b/,
    /\bunkindly\b/,
    /\btake for granted\b/,
    /\bbest of fun\b/,
    /\bfavourable friends\b/,
    /\bminimize the loss\b/,
    /\bsubject of (peace|trade|contention)\b/,
    /\bpaid no heed\b/,
    /\bwent far away\b/,
    /\birregularly\b/,
    /\bto be independent\b/,
    /\bmore sociable\b/,
    /\bordinary person\b/,
    /\billiterate person\b/,
    /\binjured in an accident\b/,
    /\braise aspirations\b/,
    /\bdeceived everyone\b/,
    /\bwent to pillars\b/,
    /\bbehaving thoughtlessly\b/,
    /\bincomprehensible\b/,
    /\bsang with the music\b/,
    /\bgifts from many\b/,
    /\blot of money\b/,
  ];
  if (idiomOptionHints.some(p => p.test(allOpts))) {
    return "Idioms";
  }
  // Idiom position heuristic: questions 382+ in the textbook are from the Idioms chapter
  if (engIndex >= 382 && engIndex <= 593 && text.length < 200) {
    return "Idioms";
  }

  // ── 4. Specific grammar sub-topics ──
  if (text.includes("fill in") || text.includes("blank")) {
    return "Fill in the Blanks";
  }
  if (text.includes("error") || text.includes("incorrect")) {
    return "Error Detection";
  }
  if (text.includes("synonym") || text.includes("antonym") || text.includes("meaning of the word")) {
    return "Vocabulary";
  }
  if (text.includes("spelling") || text.includes("spelt")) {
    return "Spelling";
  }

  // ── 5. Grammar (catch-all) ──
  return "Grammar";
}

// ── Main ──────────────────────────────────────────────────────────

const data = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
const bank = data.questions;

const engIndices = [];
bank.forEach((q, i) => {
  if (q.subject === "english") engIndices.push(i);
});

console.log(`Total English questions: ${engIndices.length}`);

const stats = {};
const noiseIndices = [];
let engCounter = 0;

engIndices.forEach(idx => {
  const q = bank[idx];
  const newTopic = classifyEnglish(q, engCounter);
  engCounter++;
  stats[newTopic] = (stats[newTopic] || 0) + 1;

  if (newTopic === "__GRAMMAR_NOISE__") {
    noiseIndices.push(idx);
  }

  if (!dryRun && newTopic !== "__GRAMMAR_NOISE__") {
    bank[idx].topic = newTopic;
    bank[idx].updatedAt = new Date().toISOString();
  }
  if (!dryRun && newTopic === "__GRAMMAR_NOISE__") {
    bank[idx].topic = "Grammar";
    bank[idx].reviewStatus = "needs_review";
    bank[idx].updatedAt = new Date().toISOString();
  }
});

console.log("\nReclassification results:");
Object.entries(stats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([topic, count]) => {
    console.log(`  ${topic}: ${count}`);
  });

if (noiseIndices.length) {
  console.log(`\n⚠ ${noiseIndices.length} grammar-noise entries → marked needs_review`);
  noiseIndices.forEach(idx => {
    console.log(`  bank[${idx}]: ${bank[idx].question.substring(0, 60)}`);
  });
}

if (dryRun) {
  console.log("\n[DRY RUN] No changes written.");
} else {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(BANK_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log("\n✓ question-bank.json updated.");
}
