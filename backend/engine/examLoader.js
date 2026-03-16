const path = require("path");
const fs = require("fs");

function readJSONSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadExamData(examKey) {
  const base = path.join(__dirname, "..", "data", "exams", examKey);

  return {
    examKey,
    marksAllRaw: readJSONSafe(path.join(base, "marks_distribution_2025_all_raw.json")),
    marksComputerQualifiedRaw: readJSONSafe(path.join(base, "marks_distribution_2025_computer_qualified_raw.json"))
  };
}

module.exports = { loadExamData };