const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const historicalPath = path.join(
  __dirname,
  "..",
  "data",
  "exams",
  "ssc_cgl",
  "historical_data.json"
);

const TARGET_POSTS = [
  { name: "Inspector Income Tax", delta: 30, safeMin: 155, safeMax: 170 },
  { name: "Sub-Inspector CBI", delta: 20, safeMin: 150, safeMax: 165 },
  { name: "Inspector Customs", delta: 24, safeMin: 155, safeMax: 170 },
  { name: "Assistant Section Officer", delta: 28, safeMin: 160, safeMax: 175 },
  { name: "JSO / Statistical Investigator", delta: 18, safeMin: 145, safeMax: 160 },
  { name: "Tax Assistant", delta: 0, safeMin: 125, safeMax: 140 },
  { name: "Upper Division Clerk", delta: -5, safeMin: 120, safeMax: 135 },
  { name: "Other / Not Sure", delta: 0, safeMin: 130, safeMax: 145 }
];

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(250, Math.round(n)));
}

function loadLatestTier1Cutoff() {
  try {
    const raw = fs.readFileSync(historicalPath, "utf8");
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return {
        year: null,
        tier1_cutoff: { UR: 130, OBC: 125, SC: 115, ST: 105, EWS: 128 }
      };
    }

    const sorted = [...parsed]
      .filter((x) => x && typeof x === "object")
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

    const latest = sorted[0] || {};
    return {
      year: Number(latest.year || null),
      tier1_cutoff: latest.tier1_cutoff || { UR: 130, OBC: 125, SC: 115, ST: 105, EWS: 128 }
    };
  } catch (err) {
    console.error("goals cutoff load error:", err);
    return {
      year: null,
      tier1_cutoff: { UR: 130, OBC: 125, SC: 115, ST: 105, EWS: 128 }
    };
  }
}

router.get("/cutoffs", (req, res) => {
  try {
    const examFamily = String(req.query.examFamily || "ssc_cgl").trim().toLowerCase();
    if (examFamily !== "ssc_cgl") {
      return res.json({
        success: true,
        examFamily,
        baseYear: null,
        posts: [],
        note: "Cutoff recommendations are currently available for SSC CGL only"
      });
    }

    const latest = loadLatestTier1Cutoff();
    const base = latest.tier1_cutoff || {};
    const categories = ["UR", "OBC", "SC", "ST", "EWS"];

    const posts = TARGET_POSTS.map((item) => {
      const cutoffByCategory = {};
      categories.forEach((cat) => {
        const baseVal = Number(base[cat] || 0);
        cutoffByCategory[cat] = clampScore(baseVal + Number(item.delta || 0));
      });

      return {
        name: item.name,
        safeRange: { min: item.safeMin, max: item.safeMax },
        cutoffByCategory
      };
    });

    return res.json({
      success: true,
      examFamily,
      baseYear: latest.year,
      categories,
      posts,
      note: "Generated using historical Tier-1 category cutoffs and post target ranges from project data"
    });
  } catch (error) {
    console.error("/api/goals/cutoffs error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;