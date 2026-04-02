const express = require("express");
const router = express.Router();
const { readStore, writeStore, loadFromDb: loadTestEntriesFromDb } = require("../utils/testStore");

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTier(value) {
  const tier = String(value || "tier1").trim().toLowerCase();
  return tier === "tier2" ? "tier2" : "tier1";
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

// GET /api/test/:userKey/analytics - Performance trends & insights
router.get("/:userKey/analytics", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    const tier = normalizeTier(req.query.tier || "tier1");
    if (!userKey) return res.status(400).json({ success: false, error: "userKey required" });

    const store = readStore();
    const entriesRaw = Array.isArray(store.users[userKey]) ? store.users[userKey] : [];
    const entries = entriesRaw
      .filter(item => normalizeTier(item?.tier || "tier1") === tier)
      .sort((a, b) => String(a.test_date).localeCompare(String(b.test_date)));

    if (!entries.length) {
      return res.json({
        success: true, tier, hasData: false,
        message: "No test entries yet. Add your daily scores to see analytics."
      });
    }

    const limits = getTierLimits(tier);
    const subjects = ["quant", "english", "reasoning", "gk"];
    if (tier === "tier2") subjects.push("computer");

    // ── Overall stats ────────────────────────────────
    const totals = entries.map(e => Number(e.total_marks || 0));
    const overallAvg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const best = Math.max(...totals);
    const worst = Math.min(...totals);
    const latest = totals[totals.length - 1];

    // ── Trend: last 7 vs previous 7 ─────────────────
    const recent7 = entries.slice(-7);
    const prev7 = entries.length > 7 ? entries.slice(-14, -7) : [];
    const avg7 = recent7.reduce((a, e) => a + Number(e.total_marks || 0), 0) / recent7.length;
    const avgPrev7 = prev7.length
      ? prev7.reduce((a, e) => a + Number(e.total_marks || 0), 0) / prev7.length
      : null;
    const weeklyChange = avgPrev7 != null ? Number((avg7 - avgPrev7).toFixed(1)) : null;

    // ── Subject breakdown (last 7) ──────────────────
    const subjectAnalysis = {};
    for (const sub of subjects) {
      const key = `${sub}_marks`;
      const max = limits[sub];
      const vals = recent7.map(e => Number(e[key] || 0));
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const bestSub = Math.max(...vals);
      const worstSub = Math.min(...vals);

      // Trend for this subject
      const allVals = entries.map(e => Number(e[key] || 0));
      const recentSlice = allVals.slice(-5);
      const olderSlice = allVals.length > 5 ? allVals.slice(-10, -5) : [];
      const recentAvg = recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length;
      const olderAvg = olderSlice.length ? olderSlice.reduce((a, b) => a + b, 0) / olderSlice.length : recentAvg;

      let trend = "stable";
      if (recentAvg - olderAvg > 1.5) trend = "improving";
      else if (olderAvg - recentAvg > 1.5) trend = "declining";

      subjectAnalysis[sub] = {
        label: sub.charAt(0).toUpperCase() + sub.slice(1),
        maxMarks: max,
        avg: Number(avg.toFixed(1)),
        best: bestSub,
        worst: worstSub,
        percentage: Number(((avg / max) * 100).toFixed(1)),
        trend
      };
    }

    // ── Weakest & strongest subjects ────────────────
    const ranked = Object.entries(subjectAnalysis)
      .filter(([k]) => k !== "computer")
      .sort(([, a], [, b]) => a.percentage - b.percentage);
    const weakest = ranked.slice(0, 2).map(([k, v]) => ({ subject: k, ...v }));
    const strongest = ranked.slice(-2).reverse().map(([k, v]) => ({ subject: k, ...v }));

    // ── Score timeline (for chart) ──────────────────
    const timeline = entries.slice(-30).map(e => ({
      date: e.test_date,
      total: Number(e.total_marks || 0),
      quant: Number(e.quant_marks || 0),
      english: Number(e.english_marks || 0),
      reasoning: Number(e.reasoning_marks || 0),
      gk: Number(e.gk_marks || 0)
    }));

    // ── Consistency score (std dev based) ───────────
    const mean = overallAvg;
    const variance = totals.reduce((a, t) => a + Math.pow(t - mean, 2), 0) / totals.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, Math.min(100,
      Number((100 - (stdDev / (limits.total || 200)) * 200).toFixed(0))
    ));

    // ── Daily gain rate (linear regression) ─────────
    const recentForSlope = entries.slice(-14);
    let dailyGain = 0;
    if (recentForSlope.length >= 2) {
      const n = recentForSlope.length;
      const xMean = (n - 1) / 2;
      const yMean = recentForSlope.reduce((a, e) => a + Number(e.total_marks || 0), 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (i - xMean) * (Number(recentForSlope[i].total_marks || 0) - yMean);
        den += (i - xMean) * (i - xMean);
      }
      dailyGain = den > 0 ? Number((num / den).toFixed(2)) : 0;
    }

    // ── Streak tracking ─────────────────────────────
    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];
    const sortedDesc = [...entries].reverse();
    for (let i = 0; i < sortedDesc.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedDate = expected.toISOString().split("T")[0];
      if (sortedDesc[i]?.test_date === expectedDate) {
        currentStreak++;
      } else {
        break;
      }
    }

    return res.json({
      success: true,
      tier,
      hasData: true,
      sessionCount: entries.length,
      overall: {
        avg: Number(overallAvg.toFixed(1)),
        best,
        worst,
        latest,
        maxMarks: limits.total,
        percentage: Number(((overallAvg / limits.total) * 100).toFixed(1))
      },
      recentTrend: {
        avg7: Number(avg7.toFixed(1)),
        avgPrev7: avgPrev7 != null ? Number(avgPrev7.toFixed(1)) : null,
        weeklyChange,
        direction: weeklyChange == null ? "new" : weeklyChange > 1 ? "up" : weeklyChange < -1 ? "down" : "stable",
        dailyGain,
        currentStreak
      },
      subjectAnalysis,
      weakest,
      strongest,
      consistencyScore,
      timeline
    });
  } catch (error) {
    console.error("/api/test analytics error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
module.exports.loadTestEntriesFromDb = loadTestEntriesFromDb;