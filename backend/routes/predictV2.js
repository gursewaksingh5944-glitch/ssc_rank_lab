const express = require("express");
const router = express.Router();

const { loadExamData } = require("../engine/examLoader");
const { estimateFromCumulative } = require("../engine/rankEngine");
const { buildInsights } = require("../engine/premiumInsights");
const { getPostChances } = require("../engine/postAllocator");
const { getUnlockedPlan, getEffectiveAccessPlan, getTrialInfo } = require("../utils/planStore");

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTier(value) {
  const tier = String(value || "tier1").trim().toLowerCase();
  return tier === "tier2" ? "tier2" : "tier1";
}

router.post("/", (req, res) => {
  try {
    const { examKey, score, category, plan, userKey, tier } = req.body;

    if (!examKey || score === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: "examKey, score, category required"
      });
    }

    const numericScore = Number(score);
    const selectedTier = normalizeTier(tier);
    const scoreMax = selectedTier === "tier2" ? 390 : 200;

    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > scoreMax) {
      return res.status(400).json({
        success: false,
        error: `Invalid score for ${selectedTier.toUpperCase()} (allowed: 0-${scoreMax})`
      });
    }

    const requestedPlan = Number(plan || 0);

    if (![0, 49, 99].includes(requestedPlan)) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan (use 0,49,99)"
      });
    }

    const cat = String(category).toUpperCase();

    if (!["UR", "OBC", "EWS", "SC", "ST"].includes(cat)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category"
      });
    }

    const normalizedUserKey = normalizeUserKey(userKey);

    const storedUnlockedPlan = getUnlockedPlan(normalizedUserKey);
    const effectiveAccessPlan = getEffectiveAccessPlan(normalizedUserKey);
    const trial = getTrialInfo(normalizedUserKey);

    const finalPlan =
      requestedPlan > 0
        ? Math.min(requestedPlan, effectiveAccessPlan)
        : 0;

    const unlockedPlan = storedUnlockedPlan;

    const selectedMode =
      finalPlan >= 49 ? "computer_qualified_raw" : "all_raw";

    const data = loadExamData(examKey);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Exam not found"
      });
    }

    let dataset = null;

    if (selectedMode === "all_raw") {
      dataset = data.marksAllRaw;
    }

    if (selectedMode === "computer_qualified_raw") {
      dataset = data.marksComputerQualifiedRaw;
    }

    if (!dataset) {
      return res.status(400).json({
        success: false,
        error: "Invalid mode or dataset missing"
      });
    }

    const est = estimateFromCumulative({
      score: numericScore,
      category: cat,
      dataset
    });

    if (!est.ok) {
      return res.status(500).json({
        success: false,
        error: est.error || "Estimation error"
      });
    }

    const safeEst = {
      estimatedRank: est.estimatedRank ?? est.rank ?? null,
      totalStudents: est.totalStudents ?? est.totalCandidates ?? est.total ?? null,
      categoryRank: finalPlan >= 49 ? (est.categoryRank ?? null) : null,
      percentile: finalPlan >= 49 ? (est.percentile ?? null) : null
    };

    const responsePayload = {
      success: true,
      examKey,
      category: cat,
      userKey: normalizedUserKey || null,
      requestedPlan,
      unlockedPlan,
      effectiveAccessPlan,
      trial,
      plan: finalPlan,
      tier: selectedTier,
      mode: selectedMode,
      ...safeEst
    };

    if (finalPlan >= 99) {
      responsePayload.insights = buildInsights({
        score: numericScore,
        category: cat,
        dataset
      });

      if (selectedTier === "tier2") {
        responsePayload.postChances = getPostChances({
          examKey,
          score: numericScore,
          category: cat,
          categoryRank: safeEst.categoryRank ?? null
        });
      }
    }

    return res.json(responsePayload);
  } catch (e) {
    console.error("predictV2 error:", e);

    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;