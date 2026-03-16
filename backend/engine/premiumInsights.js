const { estimateFromCumulative } = require("./rankEngine");
const fs = require("fs");
const path = require("path");

function loadCutoffs() {
  const base = path.join(__dirname, "..", "data", "exams", "ssc_cgl");

  const possibleFiles = [
    "post_cutoffs_tier2_2024.json",
    "post_cutoff_tier2_2024.json",
    "cutoff_tier2_2024.json"
  ];

  for (const name of possibleFiles) {
    const file = path.join(base, name);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  }

  return null;
}

function buildInsights({ score, category, dataset }) {
  const base = estimateFromCumulative({ score, category, dataset });
  if (!base.ok) return null;

  const plus2 = estimateFromCumulative({ score: score + 2, category, dataset });
  const plus5 = estimateFromCumulative({ score: score + 5, category, dataset });

  const minus5 = estimateFromCumulative({
    score: Math.max(0, score - 5),
    category,
    dataset
  });

  const plus5b = estimateFromCumulative({
    score: score + 5,
    category,
    dataset
  });

  const candidatesInBand =
    minus5.ok &&
    plus5b.ok &&
    typeof minus5.estimatedRank === "number" &&
    typeof plus5b.estimatedRank === "number"
      ? Math.max(0, minus5.estimatedRank - plus5b.estimatedRank)
      : null;

  let selectionBand = "Unknown";
  let note =
    "Band is based on percentile and rank position within the real score distribution.";

  if (typeof base.percentile === "number") {
    if (base.percentile >= 95) selectionBand = "Very High";
    else if (base.percentile >= 90) selectionBand = "High";
    else if (base.percentile >= 75) selectionBand = "Moderate";
    else if (base.percentile >= 60) selectionBand = "Low";
    else selectionBand = "Very Low";
  }

  let scoreZone = "Average Zone";
  if (typeof base.percentile === "number") {
    if (base.percentile >= 95) scoreZone = "Top Competitive Zone";
    else if (base.percentile >= 85) scoreZone = "Strong Competitive Zone";
    else if (base.percentile >= 70) scoreZone = "Borderline Competitive Zone";
    else scoreZone = "Below Competitive Zone";
  }

  const cutoffData = loadCutoffs();
  let safeScores = null;

  if (cutoffData?.posts && Array.isArray(cutoffData.posts)) {
    const categoryCutoffs = cutoffData.posts
      .map((p) => ({
        post: p.post_name,
        cutoff: p.cutoffs?.[category]
      }))
      .filter((x) => typeof x.cutoff === "number")
      .sort((a, b) => b.cutoff - a.cutoff);

    if (categoryCutoffs.length > 0) {
      const high = categoryCutoffs[0].cutoff;
      const middle = categoryCutoffs[Math.floor(categoryCutoffs.length / 2)].cutoff;
      const low = categoryCutoffs[categoryCutoffs.length - 1].cutoff;

      safeScores = {
        higherPosts: {
          score: Number((high + 10).toFixed(2)),
          basedOnCutoff: high
        },
        middlePosts: {
          score: Number((middle + 10).toFixed(2)),
          basedOnCutoff: middle
        },
        lowerPosts: {
          score: Number((low + 10).toFixed(2)),
          basedOnCutoff: low
        }
      };
    }
  }

  return {
    selectionBand,
    note,
    scoreZone,
    percentileExplanation:
      "Percentile means the percentage of candidates you scored higher than.",
    safeScores,
    whatIf: {
      plus2Rank: plus2.ok ? plus2.estimatedRank : null,
      plus5Rank: plus5.ok ? plus5.estimatedRank : null
    },
    density: {
      candidatesInBand
    }
  };
}

module.exports = { buildInsights };