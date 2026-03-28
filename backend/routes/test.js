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

function normalizeTier(value) {
  const tier = String(value || "tier1").trim().toLowerCase();
  return tier === "tier2" ? "tier2" : "tier1";
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

function getTierLimits(tier) {
  if (normalizeTier(tier) === "tier2") {
    // Tier 2 Paper 1 merit subjects: Math(90) + Reasoning(90) + English(135) + GK(75) = 390
    // Computer Knowledge (60) is qualifying-only — not counted in merit total
    return {
      quant: 90,
      english: 135,
      reasoning: 90,
      gk: 75,
      computer: 60,   // validated and stored, but NOT included in total (qualifying only)
      total: 390      // merit total only
    };
  }

  // Tier 1: 4 subjects × 50 marks = 200 total (qualifying for Tier 2 shortlisting)
  return {
    quant: 50,
    english: 50,
    reasoning: 50,
    gk: 50,
    computer: 0,
    total: 200
  };
}

// POST /api/test - Save daily test marks
router.post("/", (req, res) => {
  try {
    const { userKey, testDate, quant, english, reasoning, gk, computer, tier } = req.body;

    if (!userKey || !testDate) {
      return res.status(400).json({ success: false, error: "userKey and testDate required" });
    }

    const normalizedUserKey = normalizeUserKey(userKey);
    const normalizedTier = normalizeTier(tier);
    const date = normalizeDate(testDate);
    if (!date) {
      return res.status(400).json({ success: false, error: "Invalid testDate" });
    }

    const limits = getTierLimits(normalizedTier);

    const quantMarks = toMarks(quant, limits.quant);
    const englishMarks = toMarks(english, limits.english);
    const reasoningMarks = toMarks(reasoning, limits.reasoning);
    const gkMarks = toMarks(gk, limits.gk);
    const computerMarks = toMarks(computer, limits.computer);

    if (
      quantMarks === null ||
      englishMarks === null ||
      reasoningMarks === null ||
      gkMarks === null ||
      computerMarks === null
    ) {
      return res.status(400).json({
        success: false,
        error: `Marks out of range for ${normalizedTier}. Limits: Quant ${limits.quant}, English ${limits.english}, Reasoning ${limits.reasoning}, GK ${limits.gk}, Computer ${limits.computer}`
      });
    }

    // Merit total excludes computer (qualifying-only for Tier 2)
    const totalMarks = quantMarks + englishMarks + reasoningMarks + gkMarks;
    if (totalMarks > limits.total) {
      return res.status(400).json({ success: false, error: `Total merit marks cannot exceed ${limits.total} for ${normalizedTier}` });
    }

    const store = readStore();
    const userEntries = Array.isArray(store.users[normalizedUserKey])
      ? store.users[normalizedUserKey]
      : [];

    const nextEntry = {
      id: `${normalizedUserKey}_${normalizedTier}_${date}`,
      tier: normalizedTier,
      test_date: date,
      quant_marks: quantMarks,
      english_marks: englishMarks,
      reasoning_marks: reasoningMarks,
      gk_marks: gkMarks,
      computer_marks: computerMarks,
      total_marks: Number(totalMarks.toFixed(2)),
      updated_at: new Date().toISOString()
    };

    const existingIndex = userEntries.findIndex((item) => {
      const entryTier = normalizeTier(item?.tier || "tier1");
      return item.test_date === date && entryTier === normalizedTier;
    });
    if (existingIndex >= 0) {
      userEntries[existingIndex] = { ...userEntries[existingIndex], ...nextEntry };
    } else {
      userEntries.push(nextEntry);
    }

    userEntries.sort((a, b) => String(b.test_date).localeCompare(String(a.test_date)));
    store.users[normalizedUserKey] = userEntries.slice(0, 120);
    writeStore(store);

    return res.json({ success: true, id: nextEntry.id, entry: nextEntry, tier: normalizedTier });

  } catch (error) {
    console.error("/api/test POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/test/:userKey - Get user's test history
router.get("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    const tier = normalizeTier(req.query.tier || "tier1");
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const store = readStore();
    const entriesRaw = Array.isArray(store.users[userKey]) ? store.users[userKey] : [];
    const entries = entriesRaw.filter((item) => normalizeTier(item?.tier || "tier1") === tier);
    const sorted = [...entries].sort((a, b) => String(b.test_date).localeCompare(String(a.test_date)));
    return res.json({ success: true, tier, entries: sorted.slice(0, 30) });

  } catch (error) {
    console.error("/api/test GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;