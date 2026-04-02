const path = require("path");
const fs = require("fs");

// ── Cached JSON loader (avoids re-reading static exam data per request) ──
const _jsonCache = new Map();

function readJSONSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  const cached = _jsonCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.data;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  _jsonCache.set(filePath, { data, mtimeMs: stat.mtimeMs });
  return data;
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