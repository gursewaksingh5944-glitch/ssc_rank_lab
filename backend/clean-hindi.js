const fs = require("fs");
const path = require("path");

const bankPath = path.join(__dirname, "data", "question-bank.json");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
let cleaned = 0;

bank.questions.forEach((q) => {
  if (!q.question) return;
  const text = q.question;

  // Find where Hindi starts: look for a question mark followed by Hindi text
  const qmarkIdx = text.lastIndexOf("?");
  if (qmarkIdx > 20) {
    const afterQmark = text.slice(qmarkIdx + 1).trim();
    if (/\b(dk|ds|gS|gSA|djsa|fdr|Kkr|rks|vkSj|pyrk|fcUnq|dh|esa)\b/.test(afterQmark) && afterQmark.length > 10) {
      q.question = text.slice(0, qmarkIdx + 1).trim();
      cleaned++;
      return;
    }
  }

  // For questions without a ?  mark: look for Hindi pattern start
  const hindiStart = text.search(/\s+(fn\s|vxj|fdr|rks\b|Kkr|gSA|djsa|dk\s+\d|ds\s+\d)/);
  if (hindiStart > 20) {
    q.question = text.slice(0, hindiStart).trim();
    cleaned++;
  }
});

// Also clean options
let optsCleaned = 0;
bank.questions.forEach((q) => {
  if (!Array.isArray(q.options)) return;
  q.options = q.options.map((opt) => {
    if (typeof opt !== "string") return opt;
    // Remove Hindi after semicolons in options
    if (/;\s*.{5,}/.test(opt)) {
      const parts = opt.split(/\s*;\s*/);
      if (parts[0] && parts[0].length >= 2) {
        optsCleaned++;
        return parts[0].trim();
      }
    }
    // Remove standalone Hindi patterns in options
    const hindiStart = opt.search(/\s+(fn\s|Kkr|gSA|djsa|pyrk|fcUnq|dh\s)/);
    if (hindiStart > 5) {
      optsCleaned++;
      return opt.slice(0, hindiStart).trim();
    }
    return opt;
  });
});

fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), "utf8");
console.log("Additional questions cleaned:", cleaned);
console.log("Additional options cleaned:", optsCleaned);

const still = bank.questions.filter((q) => /gSA|djsa|fdr|Kkr|pyrk|fcUnq/.test(q.question || ""));
console.log("Remaining Hindi in questions:", still.length);
if (still.length > 0) {
  still.slice(0, 3).forEach((q, i) => console.log(`  Sample ${i + 1}:`, q.question.slice(0, 150)));
}
