const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "test-entries.json");

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ users: {} }, null, 2), "utf8");
  }
}

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

function readStore() {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : { users: {} };
  } catch (err) {
    console.error("test store read error:", err);
    return { users: {} };
  }
}

function writeStore(data) {
  ensureStoreFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function toMarks(value, max) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return Number(n.toFixed(2));
}

function normalizeDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

// POST /api/test - Save daily test marks
router.post("/", (req, res) => {
  try {
    const { userKey, testDate, quant, english, reasoning, gk, computer } = req.body;

    if (!userKey || !testDate) {
      return res.status(400).json({ success: false, error: "userKey and testDate required" });
    }

    const normalizedUserKey = normalizeUserKey(userKey);
    const date = normalizeDate(testDate);
    if (!date) {
      return res.status(400).json({ success: false, error: "Invalid testDate" });
    }

    const quantMarks = toMarks(quant, 50);
    const englishMarks = toMarks(english, 50);
    const reasoningMarks = toMarks(reasoning, 50);
    const gkMarks = toMarks(gk, 50);
    const computerMarks = toMarks(computer, 50);

    if (
      quantMarks === null ||
      englishMarks === null ||
      reasoningMarks === null ||
      gkMarks === null ||
      computerMarks === null
    ) {
      return res.status(400).json({
        success: false,
        error: "Each subject mark must be between 0 and 50"
      });
    }

    const totalMarks = quantMarks + englishMarks + reasoningMarks + gkMarks + computerMarks;
    if (totalMarks > 250) {
      return res.status(400).json({ success: false, error: "Total marks cannot exceed 250" });
    }

    const store = readStore();
    const userEntries = Array.isArray(store.users[normalizedUserKey])
      ? store.users[normalizedUserKey]
      : [];

    const nextEntry = {
      id: `${normalizedUserKey}_${date}`,
      test_date: date,
      quant_marks: quantMarks,
      english_marks: englishMarks,
      reasoning_marks: reasoningMarks,
      gk_marks: gkMarks,
      computer_marks: computerMarks,
      total_marks: Number(totalMarks.toFixed(2)),
      updated_at: new Date().toISOString()
    };

    const existingIndex = userEntries.findIndex((item) => item.test_date === date);
    if (existingIndex >= 0) {
      userEntries[existingIndex] = { ...userEntries[existingIndex], ...nextEntry };
    } else {
      userEntries.push(nextEntry);
    }

    userEntries.sort((a, b) => String(b.test_date).localeCompare(String(a.test_date)));
    store.users[normalizedUserKey] = userEntries.slice(0, 120);
    writeStore(store);

    return res.json({ success: true, id: nextEntry.id, entry: nextEntry });

  } catch (error) {
    console.error("/api/test POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/test/:userKey - Get user's test history
router.get("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const store = readStore();
    const entries = Array.isArray(store.users[userKey]) ? store.users[userKey] : [];
    const sorted = [...entries].sort((a, b) => String(b.test_date).localeCompare(String(a.test_date)));
    return res.json({ success: true, entries: sorted.slice(0, 30) });

  } catch (error) {
    console.error("/api/test GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;