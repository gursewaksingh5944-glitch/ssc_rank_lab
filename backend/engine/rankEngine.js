function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function getCategoryValue(row, category) {
  if (!row || !category) return null;

  if (typeof row[category] === "number") return row[category];

  const aliases = {
    UR: ["UR", "ur", "Gen", "GEN", "General", "GENERAL", "Unreserved", "UNRESERVED"],
    OBC: ["OBC", "obc"],
    EWS: ["EWS", "ews"],
    SC: ["SC", "sc"],
    ST: ["ST", "st"]
  };

  const keysToTry = aliases[category] || [category];

  for (const key of keysToTry) {
    if (typeof row[key] === "number") return row[key];
  }

  return null;
}

/**
 * Uses cumulative distribution rows: Marks >= X => total students above.
 * If score is between steps, interpolate linearly between nearest two rows.
 */
function estimateFromCumulative({ score, category, dataset }) {
  if (!dataset || !Array.isArray(dataset.distribution) || dataset.distribution.length === 0) {
    return { ok: false, error: "Marks distribution dataset missing" };
  }

  const totalStudents = Number(dataset.totalStudents || 0);
  const rows = [...dataset.distribution].sort((a, b) => b.marks - a.marks);

  // Above top band
  if (score >= rows[0].marks) {
    const r = rows[0];
    return finalize(score, category, totalStudents, r.total, getCategoryValue(r, category));
  }

  // Below lowest band
  const last = rows[rows.length - 1];
  if (score < last.marks) {
    return finalize(score, category, totalStudents, totalStudents, getCategoryValue(last, category));
  }

  // Between two rows
  for (let i = 0; i < rows.length - 1; i++) {
    const high = rows[i];
    const low = rows[i + 1];

    if (score <= high.marks && score > low.marks) {
      const t = (high.marks - score) / (high.marks - low.marks);
      const overall = Math.round(high.total + t * (low.total - high.total));

      const highCat = getCategoryValue(high, category);
      const lowCat = getCategoryValue(low, category);

      const catRank =
        highCat !== null && lowCat !== null
          ? Math.round(highCat + t * (lowCat - highCat))
          : null;

      return finalize(score, category, totalStudents, overall, catRank);
    }
  }

  return finalize(score, category, totalStudents, null, null);
}

function finalize(score, category, totalStudents, overallRank, categoryRank) {
  const overall =
    typeof overallRank === "number" && totalStudents > 0
      ? clamp(overallRank, 1, totalStudents)
      : null;

  const percentile =
    typeof overall === "number" && totalStudents > 0
      ? clamp(((totalStudents - overall) / totalStudents) * 100, 0, 100)
      : null;

  return {
    ok: true,
    score,
    category,
    totalStudents,
    estimatedRank: overall,
    categoryRank: typeof categoryRank === "number" ? categoryRank : null,
    percentile: percentile !== null ? Number(percentile.toFixed(2)) : null
  };
}

module.exports = { estimateFromCumulative };