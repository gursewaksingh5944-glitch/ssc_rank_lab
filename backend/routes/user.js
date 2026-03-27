const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  getUserProfile,
  setUserProfile,
  deleteUserProfile,
  getUnlockedPlan
} = require("../utils/planStore");

const router = express.Router();

const TEST_STORE_PATH = path.join(__dirname, "..", "data", "test-entries.json");

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

/* ---------------------------------------------------------------
   OUTCOME ENGINE HELPERS
--------------------------------------------------------------- */

function readTestEntries(userKey) {
  try {
    if (!fs.existsSync(TEST_STORE_PATH)) return [];
    const raw = fs.readFileSync(TEST_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw || "{}");
    const entries = Array.isArray(parsed.users?.[userKey]) ? parsed.users[userKey] : [];
    return [...entries].sort((a, b) => String(b.test_date).localeCompare(String(a.test_date)));
  } catch (err) {
    console.error("readTestEntries error:", err);
    return [];
  }
}

function computeOverallAvg(entries, count = 0) {
  const slice = count > 0 ? entries.slice(0, count) : entries;
  if (!slice.length) return 0;
  return slice.reduce((acc, e) => acc + Number(e.total_marks || 0), 0) / slice.length;
}

function computeSubjectAvgs(entries, count = 7) {
  const slice = entries.slice(0, count);
  if (!slice.length) return null;
  const keys = ["quant_marks", "english_marks", "reasoning_marks", "gk_marks", "computer_marks"];
  const labels = { quant_marks: "Quant", english_marks: "English", reasoning_marks: "Reasoning", gk_marks: "GK", computer_marks: "Computer" };
  const result = {};
  for (const k of keys) {
    result[labels[k]] = slice.reduce((acc, e) => acc + Number(e[k] || 0), 0) / slice.length;
  }
  return result;
}

// Daily gain trend: slope of total_marks over last N days (linear regression)
function computeDailyGainRate(entries, window = 14) {
  const slice = [...entries].slice(0, window).reverse(); // oldest → newest
  if (slice.length < 2) return 0;
  const n = slice.length;
  const xMean = (n - 1) / 2;
  const yMean = slice.reduce((acc, e) => acc + Number(e.total_marks || 0), 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    const xi = i - xMean;
    const yi = Number(slice[i].total_marks || 0) - yMean;
    num += xi * yi;
    den += xi * xi;
  }
  if (den === 0) return 0;
  return Number((num / den).toFixed(2));
}

// Selection probability (0–100) based on avg vs safeScore + trend
function computeSelectionProbability(overallAvg, safeScore, dailyGain) {
  if (!safeScore || safeScore <= 0) return null;

  // Base from how close current avg is to the safe zone
  const rawRatio = overallAvg / safeScore;
  let base;
  if (rawRatio >= 1.05) base = 92;
  else if (rawRatio >= 1.0) base = 82;
  else if (rawRatio >= 0.96) base = 68;
  else if (rawRatio >= 0.92) base = 52;
  else if (rawRatio >= 0.87) base = 38;
  else if (rawRatio >= 0.80) base = 22;
  else base = 10;

  // Trend boost/penalty: +1 per 0.1 gain/day, capped ±10
  const trendBoost = Math.max(-10, Math.min(10, Math.round(dailyGain * 10)));
  const probability = Math.max(3, Math.min(97, base + trendBoost));
  return probability;
}

function selectionZoneLabel(probability) {
  if (probability == null) return "Unavailable";
  if (probability >= 80) return "High Chance";
  if (probability >= 60) return "Above Average";
  if (probability >= 40) return "Moderate";
  if (probability >= 20) return "Low";
  return "Very Low";
}

// Weakest subject for daily plan
function findWeakestSubjects(subjectAvgs, count = 2) {
  if (!subjectAvgs) return [];
  return Object.entries(subjectAvgs)
    .sort(([, a], [, b]) => a - b)
    .slice(0, count)
    .map(([label, avg]) => ({ label, avg: Number(avg.toFixed(1)) }));
}

// How many days at current gain rate to close the gap
function estimateDaysToGoal(marksAway, dailyGain) {
  if (marksAway <= 0) return 0;
  if (dailyGain <= 0) return null;
  return Math.ceil(marksAway / dailyGain);
}

// Weighted impact per subject — higher = needs more focus per mark gained
const SUBJECT_WEIGHTS = { Quant: 1.3, Reasoning: 1.2, GK: 1.0, English: 1.0, Computer: 0.8 };

function computeWeightedImpact(subjectAvgs) {
  if (!subjectAvgs) return [];
  const maxAvg = Math.max(...Object.values(subjectAvgs), 1);
  return Object.entries(subjectAvgs)
    .map(([label, avg]) => {
      const weight = SUBJECT_WEIGHTS[label] || 1.0;
      const relWeakness = 1 - (avg / maxAvg);
      const impact = Number((relWeakness * weight * 10).toFixed(1));
      return { label, avg: Number(avg.toFixed(1)), weight, impact, isWeak: relWeakness > 0.25 };
    })
    .sort((a, b) => b.impact - a.impact);
}

// Confidence level based on number of sessions
function getConfidenceLevel(sessionCount) {
  if (sessionCount >= 14) return "high";
  if (sessionCount >= 5)  return "medium";
  return "low";
}

// Dynamic daily plan: adapts based on streak, gain trend, and weakness
function buildDynamicPlan(weakestSubjects, marksAway, dailyGainRate, sessionCount) {
  if (!weakestSubjects || weakestSubjects.length === 0) {
    return ["Add today's marks to generate your personalised plan."];
  }
  const [first, second] = weakestSubjects;
  const isImproving = dailyGainRate > 0.3;
  const isStalling  = dailyGainRate <= 0;

  const tasks = [];
  // Primary: hit the weakest high-impact subject hard
  const qtyFirst = isStalling ? 30 : isImproving ? 20 : 25;
  tasks.push(`Solve ${qtyFirst} ${first.label} questions — this is your highest-impact area.`);

  // Secondary: second weakest gets a timed mini-mock
  if (second) {
    tasks.push(`Run 1 timed mini-mock on ${second.label} (15 min) — track accuracy, not just completion.`);
  }

  // Third: urgency/pace task
  if (marksAway > 15) {
    tasks.push(`High urgency: keep daily session ≥ 2 hrs to gain +1.5 marks/day toward your goal.`);
  } else if (marksAway > 5) {
    tasks.push(`You're close — 1 revision pass on weak topics before the next test.`);
  } else if (marksAway === 0) {
    tasks.push(`Maintain consistency. Don't drop below your current average.`);
  } else {
    tasks.push(`Steady pace: one focused 45-min block today will keep your trend positive.`);
  }

  return tasks;
}

/* ---------------------------------------------------------------
   GET /api/user/:userKey/outcome  — real selection analytics
--------------------------------------------------------------- */
router.get("/:userKey/outcome", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const profile = getUserProfile(userKey);
    const goalProfile = profile?.goal || null;

    const entries = readTestEntries(userKey);
    const hasHistory = entries.length > 0;

    // --- safe score and gap ---
    const autoCutoff = Number(goalProfile?.autoCutoff || 0);
    const safeScore = autoCutoff > 0 ? Math.min(250, autoCutoff + 5) : null;
    const targetPost = String(goalProfile?.targetPost || "").trim() || null;
    const category = String(goalProfile?.category || "UR").toUpperCase();

    const overallAvg = hasHistory ? Number(computeOverallAvg(entries, 0).toFixed(1)) : null;
    const avg7 = hasHistory ? Number(computeOverallAvg(entries, 7).toFixed(1)) : null;
    const latestScore = hasHistory ? Number(entries[0]?.total_marks || 0) : null;

    // Use last 7 entries for subject avgs (recency matters)
    const subjectAvgs = hasHistory ? computeSubjectAvgs(entries, 7) : null;
    const weakestByImpact = computeWeightedImpact(subjectAvgs);
    const weakest = weakestByImpact.slice(0, 2).map(({ label, avg }) => ({ label, avg }));

    // Linear regression over last 14 entries for gain rate
    const dailyGainRate = hasHistory ? computeDailyGainRate(entries, 14) : 0;

    const marksAway = (safeScore != null && overallAvg != null)
      ? Math.max(0, Number((safeScore - overallAvg).toFixed(1)))
      : null;

    const selectionProbability = (hasHistory && safeScore != null)
      ? computeSelectionProbability(overallAvg, safeScore, dailyGainRate)
      : null;

    const zoneLabel = selectionZoneLabel(selectionProbability);
    const daysToGoal = (marksAway != null && dailyGainRate > 0)
      ? estimateDaysToGoal(marksAway, dailyGainRate)
      : null;

    // Confidence based on how much data we have
    const confidence = getConfidenceLevel(entries.length);

    // Expected daily gain for display
    const displayDailyGain = dailyGainRate > 0
      ? Number(dailyGainRate.toFixed(1))
      : (marksAway != null && marksAway > 15 ? 2.0 : marksAway > 8 ? 1.6 : 1.0);

    // Status label
    let statusLabel = "No Data";
    if (!hasHistory) statusLabel = "Add Marks to Start";
    else if (marksAway === 0) statusLabel = "In Safe Zone";
    else if (marksAway <= 5) statusLabel = "Near Safe Zone";
    else if (marksAway <= 12) statusLabel = "Slightly Behind";
    else if (marksAway <= 20) statusLabel = "High Attention";
    else statusLabel = "Needs Push";

    // Dynamic daily plan
    const dailyPlan = buildDynamicPlan(weakestByImpact, marksAway, dailyGainRate, entries.length);

    return res.json({
      success: true,
      userKey,
      hasHistory,
      confidence,
      goalProfile: goalProfile ? {
        targetPost,
        category,
        autoCutoff: autoCutoff || null,
        safeScore
      } : null,
      scores: {
        latestScore,
        overallAvg,
        avg7,
        safeScore,
        marksAway
      },
      trend: {
        dailyGainRate,
        displayDailyGain,
        daysToGoal,
        sessionCount: entries.length
      },
      selection: {
        probability: selectionProbability,
        zoneLabel,
        statusLabel
      },
      subjects: {
        avgs: subjectAvgs,
        weighted: weakestByImpact,
        weakest
      },
      dailyPlan
    });
  } catch (error) {
    console.error("/api/user outcome error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const profile = getUserProfile(userKey);
    if (!profile) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const unlockedPlan = getUnlockedPlan(userKey);
    return res.json({ success: true, userKey, profile, unlockedPlan });
  } catch (error) {
    console.error("/api/user GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const profileUpdate = req.body || {};
    const saved = setUserProfile(userKey, profileUpdate);

    return res.status(200).json({ success: true, userKey, profile: saved });
  } catch (error) {
    console.error("/api/user POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.delete("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const removed = deleteUserProfile(userKey);
    if (!removed) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, userKey, message: "User deleted" });
  } catch (error) {
    console.error("/api/user DELETE error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
