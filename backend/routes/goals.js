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

const cglTier2OverallPath = path.join(
  __dirname,
  "..",
  "data",
  "exams",
  "ssc_cgl",
  "post_cutoffs_tier2_2023.json"
);

const cglTier2PostWisePath = path.join(
  __dirname,
  "..",
  "data",
  "exams",
  "ssc_cgl",
  "post_cutoffs_tier2_2024.json"
);

const testEntriesPath = path.join(
  __dirname,
  "..",
  "data",
  "test-entries.json"
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

const EXAM_CONFIG = {
  ssc_cgl: { tier1Factor: 1, tier2Factor: 1 },
  ssc_chsl: { tier1Factor: 0.72, tier2Factor: 0.74 },
  ssc_mts: { tier1Factor: 0.58, tier2Factor: 0.6 },
  ssc_cpo: { tier1Factor: 0.82, tier2Factor: 0.85 }
};

const CATEGORIES = ["UR", "OBC", "SC", "ST", "EWS"];

// ── CACHE DISABLED: Always re-read exam data files ──
// const _goalsCache = new Map();

function readCachedJSON(fpath) {
  try {
    // CACHE DISABLED - always re-read from disk
    const data = JSON.parse(fs.readFileSync(fpath, "utf8"));
    return data;
  } catch {
    return null;
  }
}

function clampScore(value, max = 250) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(Number(max || 250), Math.round(n)));
}

function loadLatestTier1Cutoff() {
  try {
    const parsed = readCachedJSON(historicalPath);
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

function loadCglTier2OverallCutoff() {
  try {
    const parsed = readCachedJSON(cglTier2OverallPath) || {};
    return {
      year: Number(parsed.cycle_year || null),
      overall: parsed.overall_cutoffs || { UR: 287, OBC: 271, SC: 252, ST: 241, EWS: 265 }
    };
  } catch (err) {
    console.error("tier2 overall load error:", err);
    return {
      year: null,
      overall: { UR: 287, OBC: 271, SC: 252, ST: 241, EWS: 265 }
    };
  }
}

function loadCglTier2PostwiseMap() {
  try {
    const parsed = readCachedJSON(cglTier2PostWisePath) || {};
    const posts = Array.isArray(parsed.posts) ? parsed.posts : [];

    const findPost = (predicate) => posts.find((item) => predicate(String(item.post_name || "")));

    // Prefer direct and stable proxies from available 2024 post-wise data.
    const matchedByTarget = {
      "Inspector Income Tax": findPost((name) => /income\s*tax/i.test(name)),
      "Sub-Inspector CBI": findPost((name) => /sub-?inspector\s*\(cbi\)|\bcbi\b/i.test(name)),
      "Inspector Customs":
        findPost((name) => /inspector\s*\(examiner\).*cbic/i.test(name)) ||
        findPost((name) => /inspector\s*\(preventive officer\).*cbic/i.test(name)) ||
        findPost((name) => /customs|preventive|examiner/i.test(name)),
      "Assistant Section Officer":
        findPost((name) => /assistant\/aso\s*-\s*ib/i.test(name)) ||
        findPost((name) => /assistant\/aso\s*-\s*railways/i.test(name)) ||
        findPost((name) => /assistant\/aso(?!.*css)/i.test(name)) ||
        findPost((name) => /assistant\/aso/i.test(name)),
      "JSO / Statistical Investigator":
        findPost((name) => /junior statistical officer/i.test(name)) ||
        findPost((name) => /statistical investigator/i.test(name)),
      "Tax Assistant":
        findPost((name) => /tax assistant/i.test(name)) ||
        findPost((name) => /accountant\/junior accountant/i.test(name)) ||
        findPost((name) => /accountant/i.test(name)),
      "Upper Division Clerk": findPost((name) => /udc\/ssa/i.test(name)) || findPost((name) => /\budc\b|\bssa\b/i.test(name)),
      "Other / Not Sure":
        findPost((name) => /sub-?inspector\s*\(ncb\)/i.test(name)) ||
        findPost((name) => /udc\/ssa/i.test(name)) ||
        findPost((name) => /accountant|assistant|inspector/i.test(name))
    };

    const result = {};
    Object.entries(matchedByTarget).forEach(([targetName, matched]) => {
      if (!matched || !matched.cutoffs) return;
      const cutoffByCategory = {};
      CATEGORIES.forEach((cat) => {
        const n = Number(matched.cutoffs[cat]);
        cutoffByCategory[cat] = Number.isFinite(n) ? clampScore(n, 600) : null;
      });
      result[targetName] = cutoffByCategory;
    });

    return result;
  } catch (err) {
    console.error("tier2 postwise load error:", err);
    return {};
  }
}

function getBaseByTier(tier) {
  if (tier === "tier2") {
    const t2 = loadCglTier2OverallCutoff();
    return { year: t2.year, cutoff: t2.overall };
  }
  const t1 = loadLatestTier1Cutoff();
  return { year: t1.year, cutoff: t1.tier1_cutoff };
}

function getRecentAverageMarks(userKey, limit = 14) {
  const normalized = String(userKey || "").trim().toLowerCase();
  if (!normalized) return null;

  try {
    if (!fs.existsSync(testEntriesPath)) return null;
    const parsed = readCachedJSON(testEntriesPath) || {};
    const rows = Array.isArray(parsed.users?.[normalized]) ? parsed.users[normalized] : [];
    if (!rows.length) return null;

    const recent = [...rows]
      .sort((a, b) => String(b.test_date || "").localeCompare(String(a.test_date || "")))
      .slice(0, Math.max(1, Number(limit) || 14));

    const avg = recent.reduce((acc, row) => acc + Number(row.total_marks || 0), 0) / recent.length;
    return Number.isFinite(avg) ? Number(avg.toFixed(1)) : null;
  } catch (err) {
    console.error("getRecentAverageMarks error:", err);
    return null;
  }
}

function getTier2EquivalentOnTier1Scale(value) {
  return Number(value || 0) * (250 / 600);
}

function getSmartBlendWeights(recentAvg) {
  if (!Number.isFinite(recentAvg)) {
    return { tier1Weight: 0.72, tier2Weight: 0.28 };
  }

  // Shift blend toward Tier-2 only when sustained recent performance is higher.
  const tier2Weight = Math.max(0.18, Math.min(0.82, (recentAvg - 90) / 120));
  const tier1Weight = 1 - tier2Weight;
  return {
    tier1Weight: Number(tier1Weight.toFixed(2)),
    tier2Weight: Number(tier2Weight.toFixed(2))
  };
}

function getSmartBlendedBase(userKey = "") {
  const t1 = loadLatestTier1Cutoff();
  const t2 = loadCglTier2OverallCutoff();
  const recentAvg = getRecentAverageMarks(userKey);
  const weights = getSmartBlendWeights(recentAvg);
  const blended = {};

  CATEGORIES.forEach((cat) => {
    const a = Number(t1.tier1_cutoff?.[cat] || 0);
    const bTier1Equivalent = getTier2EquivalentOnTier1Scale(t2.overall?.[cat]);
    blended[cat] = clampScore(
      (a * weights.tier1Weight) + (bTier1Equivalent * weights.tier2Weight),
      250
    );
  });

  return {
    year: `${t1.year || "NA"}/${t2.year || "NA"}`,
    cutoff: blended,
    smartMeta: {
      recentAvg,
      tier1Weight: weights.tier1Weight,
      tier2Weight: weights.tier2Weight,
      tier2Normalized: true
    }
  };
}

function scaleCutoffByExam(baseCutoff, examFamily, tier) {
  const cfg = EXAM_CONFIG[examFamily] || EXAM_CONFIG.ssc_cgl;
  const factor = tier === "tier2" ? cfg.tier2Factor : cfg.tier1Factor;

  const scaled = {};
  const maxScore = tier === "tier2" ? 600 : 250;
  CATEGORIES.forEach((cat) => {
    scaled[cat] = clampScore(Number(baseCutoff[cat] || 0) * factor, maxScore);
  });
  return scaled;
}

router.get("/cutoffs", (req, res) => {
  try {
    const examFamily = String(req.query.examFamily || "ssc_cgl").trim().toLowerCase();
    const tier = String(req.query.tier || "tier1").trim().toLowerCase();
    const userKey = String(req.query.userKey || "").trim().toLowerCase();

    if (!Object.keys(EXAM_CONFIG).includes(examFamily)) {
      return res.status(400).json({ success: false, error: "Unsupported examFamily" });
    }

    if (!["tier1", "tier2", "smart"].includes(tier)) {
      return res.status(400).json({ success: false, error: "Unsupported tier" });
    }

    const resolvedTier = tier;
    const baseTierData = resolvedTier === "smart" ? getSmartBlendedBase(userKey) : getBaseByTier(resolvedTier);
    const scaledBase = scaleCutoffByExam(baseTierData.cutoff || {}, examFamily, resolvedTier);
    const cglTier2PostMap = resolvedTier === "tier2" && examFamily === "ssc_cgl"
      ? loadCglTier2PostwiseMap()
      : {};
    const maxScore = resolvedTier === "tier2" ? 600 : 250;

    const posts = TARGET_POSTS.map((item) => {
      const cutoffByCategory = {};
      CATEGORIES.forEach((cat) => {
        const modelBase = Number(scaledBase[cat] || 0);
        const modeled = clampScore(modelBase + Number(item.delta || 0), maxScore);
        const cglTier2Real = cglTier2PostMap[item.name]?.[cat];

        if (resolvedTier === "tier2" && examFamily === "ssc_cgl" && Number.isFinite(cglTier2Real)) {
          cutoffByCategory[cat] = clampScore(cglTier2Real, maxScore);
        } else {
          cutoffByCategory[cat] = modeled;
        }
      });

      return {
        name: item.name,
        safeRange: { min: item.safeMin, max: item.safeMax },
        cutoffByCategory
      };
    });

    let note = "Generated from existing project historical cutoffs + post target model";
    if (examFamily !== "ssc_cgl") {
      note = "Generated using calibrated model from SSC CGL historical baseline for this exam family";
    }
    if (resolvedTier === "tier2" && examFamily === "ssc_cgl") {
      note = "Tier-2 mode uses post-wise 2024 cutoffs where available, else modeled fallback";
    }
    if (resolvedTier === "smart") {
      const smartMeta = baseTierData.smartMeta || {};
      const avgTag = Number.isFinite(smartMeta.recentAvg) ? `recent avg ${smartMeta.recentAvg}` : "no marks history yet";
      note = `Smart mode is marks-adaptive (${avgTag}) and blends Tier-1 with normalized Tier-2 cutoffs instead of fixed averaging.`;
    }

    return res.json({
      success: true,
      examFamily,
      tier: resolvedTier,
      baseYear: baseTierData.year,
      categories: CATEGORIES,
      posts,
      smartMeta: baseTierData.smartMeta || null,
      note
    });
  } catch (error) {
    console.error("/api/goals/cutoffs error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;