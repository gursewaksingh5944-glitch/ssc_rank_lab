const express = require("express");
const router = express.Router();

const { loadExamData } = require("../engine/examLoader");
const { estimateFromCumulative } = require("../engine/rankEngine");
const { buildInsights } = require("../engine/premiumInsights");
const { getPostChances } = require("../engine/postAllocator");
const { getUnlockedPlan } = require("../utils/planStore");

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

router.post("/", (req, res) => {
  try {
    const { examKey, score, category, plan, userKey } = req.body;

    if (!examKey || score === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: "examKey, score, category required"
      });
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore) || numericScore < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid score"
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

    const finalPlan =
      requestedPlan > 0
        ? Math.min(requestedPlan, storedUnlockedPlan)
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
      plan: finalPlan,
      mode: selectedMode,
      ...safeEst
    };

    if (finalPlan >= 99) {
      responsePayload.insights = buildInsights({
        score: numericScore,
        category: cat,
        dataset
      });

      responsePayload.postChances = getPostChances({
        examKey,
        score: numericScore,
        category: cat,
        categoryRank: safeEst.categoryRank ?? null
      });
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