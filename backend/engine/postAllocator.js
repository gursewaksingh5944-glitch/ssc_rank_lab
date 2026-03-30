const fs = require("fs");
const path = require("path");

function loadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error("JSON load error:", filePath, e.message);
    return null;
  }
}

function getExamBaseDirs(examKey) {
  return [
    path.join(__dirname, "..", "data", "exams", examKey),
    path.join(__dirname, "..", "..", "data", "exams", examKey),
    path.join(__dirname, "..", "..", "public", "data", "exams", examKey)
  ];
}

function loadVacancy(examKey) {
  for (const base of getExamBaseDirs(examKey)) {
    const file = path.join(base, "vacancy_2025.json");
    const data = loadJSON(file);
    if (data) return data;
  }
  return null;
}

function loadCutoffs(examKey) {
  const yearFiles = [
    {
      year: 2024,
      names: [
        "post_cutoffs_tier2_2024.json",
        "post_cutoff_tier2_2024.json",
        "cutoff_tier2_2024.json"
      ]
    },
    {
      year: 2023,
      names: [
        "post_cutoffs_tier2_2023.json",
        "post_cutoff_tier2_2023.json",
        "cutoff_tier2_2023.json"
      ]
    },
    {
      year: 2022,
      names: [
        "post_cutoffs_tier2_2022.json",
        "post_cutoff_tier2_2022.json",
        "cutoff_tier2_2022.json"
      ]
    }
  ];

  const byYear = {};

  for (const { year, names } of yearFiles) {
    for (const base of getExamBaseDirs(examKey)) {
      let found = null;

      for (const name of names) {
        const file = path.join(base, name);
        const data = loadJSON(file);
        if (data) {
          found = data;
          break;
        }
      }

      if (found) {
        byYear[year] = found;
        break;
      }
    }
  }

  const allPosts = [];
  for (const year of [2024, 2023, 2022]) {
    const posts = Array.isArray(byYear[year]?.posts) ? byYear[year].posts : [];
    allPosts.push(...posts);
  }

  return {
    byYear,
    posts: allPosts
  };
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[()\-_/.,]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(category) {
  const c = normalizeText(category);

  if (["ur", "general", "gen", "unreserved"].includes(c)) return "UR";
  if (["obc", "obc ncl", "obc-ncl", "ncl"].includes(c)) return "OBC";
  if (["sc"].includes(c)) return "SC";
  if (["st"].includes(c)) return "ST";
  if (["ews"].includes(c)) return "EWS";
  if (["oh", "pwd oh", "pwbd oh"].includes(c)) return "OH";
  if (["hh", "pwd hh", "pwbd hh"].includes(c)) return "HH";
  if (["vh", "pwd vh", "pwbd vh"].includes(c)) return "VH";
  if (["other pwd", "pwd other", "pwbd other", "others"].includes(c)) return "OTHERS";

  return String(category || "").toUpperCase();
}

function getCategoryValue(obj, category) {
  if (!obj || typeof obj !== "object") return 0;

  const normalizedTarget = normalizeCategory(category);

  for (const key of Object.keys(obj)) {
    if (normalizeCategory(key) === normalizedTarget) {
      const value = obj[key];
      return typeof value === "number" ? value : 0;
    }
  }

  return 0;
}

function getCategorySeats(vacancy, category) {
  const totals = vacancy?.category_totals || {};
  return getCategoryValue(totals, category);
}

function getPostCategorySeats(vacancyPost, category) {
  return getCategoryValue(vacancyPost?.vacancies || {}, category);
}

function computeSelectionChance(categoryRank, categorySeats) {
  if (!categoryRank || categoryRank <= 0) return null;

  if (!categorySeats || categorySeats <= 0) {
    return {
      band: "Unavailable",
      probabilityRange: "Seats data missing"
    };
  }

  const ratio = categoryRank / categorySeats;

  if (ratio <= 0.7) return { band: "Very High", probabilityRange: "80-95%" };
  if (ratio <= 1.0) return { band: "High", probabilityRange: "60-80%" };
  if (ratio <= 1.4) return { band: "Moderate", probabilityRange: "30-60%" };
  if (ratio <= 2.0) return { band: "Low", probabilityRange: "10-30%" };
  return { band: "Very Low", probabilityRange: "0-10%" };
}

function chanceBand(scoreGap, categoryRank, categorySeats) {
  const ratio =
    categoryRank && categorySeats > 0
      ? categoryRank / categorySeats
      : null;

  if (ratio === null) {
    if (scoreGap >= 10) return "High";
    if (scoreGap >= 0) return "Moderate";
    if (scoreGap >= -10) return "Low";
    return "Very Low";
  }

  // Candidate-friendly floor: never mark non-negative score gap as Low/Very Low.
  if (scoreGap >= 0) {
    if (scoreGap >= 8 && ratio <= 1.1) return "High";
    if (scoreGap >= 3 && ratio <= 1.3) return "High";
    return "Moderate";
  }

  if (scoreGap >= -5 && ratio <= 1.2) return "Moderate";
  if (scoreGap >= -3 && ratio <= 1.5) return "Moderate";

  if (scoreGap >= -8 && ratio <= 2.0) return "Low";
  if (scoreGap >= -12 && ratio <= 1.5) return "Low";

  return "Very Low";
}

function ladderLevel(scoreGap, categoryRank, seats) {
  const ratio =
    categoryRank && seats > 0
      ? categoryRank / seats
      : null;

  if (ratio === null) {
    if (scoreGap >= 10 && seats >= 50) return "Very High";
    if (scoreGap >= 0 && seats >= 20) return "High";
    if (scoreGap >= -5 && seats >= 10) return "Moderate";
    if (scoreGap >= -10) return "Low";
    return "Very Low";
  }

  // Same floor principle for ladder labels to avoid contradictory messaging.
  if (scoreGap >= 8 && ratio <= 0.9) return "Very High";
  if (scoreGap >= 3 && ratio <= 1.2) return "High";
  if (scoreGap >= 0) return "High";

  if (scoreGap >= -6 && ratio <= 1.8) return "Low";
  return "Very Low";
}

function getPostPriority(postName, department, payLevel) {
  const name = normalizeText(postName);
  const dept = normalizeText(department);
  const pay = normalizeText(payLevel);

  if (name.includes("assistant audit officer") || name.includes("aao")) return 100;
  if (name.includes("assistant accounts officer")) return 99;

  if (name.includes("assistant section officer") || name.includes("assistant aso")) {
    if (dept.includes("external affairs")) return 97;
    if (dept.includes("css")) return 96;
    return 95;
  }

  if (name.includes("inspector of income tax") || name.includes("income tax")) return 94;
  if (name.includes("inspector") && name.includes("examiner")) return 93;
  if (name.includes("inspector") && name.includes("preventive")) return 92;
  if (name.includes("assistant enforcement officer")) return 91;
  if (name.includes("sub inspector") && dept.includes("cbi")) return 90;
  if (name.includes("sub inspector") && dept.includes("nia")) return 89;
  if (name.includes("sub inspector") && dept.includes("narcotics")) return 88;
  if (name.includes("inspector") && name.includes("central excise")) return 87;

  if (name.includes("junior statistical officer")) return 84;
  if (name.includes("statistical investigator")) return 83;
  if (name.includes("executive assistant")) return 82;
  if (name.includes("office superintendent")) return 81;

  if (name.includes("auditor")) return 72;
  if (name.includes("accountant")) return 71;
  if (name.includes("tax assistant")) {
    if (dept.includes("direct taxes") || dept.includes("cbdt")) return 70;
    return 68;
  }

  if (name.includes("upper division clerk") || name.includes("senior secretariat assistant")) return 60;

  if (pay.includes("level 7")) return 58;
  if (pay.includes("level 6")) return 54;
  if (pay.includes("level 5")) return 48;
  if (pay.includes("level 4")) return 42;

  return 35;
}

function estimateCutoffFromProfile(vacancyPost, category, knownCutoffRows) {
  const payLevel = normalizeText(vacancyPost?.pay_level);
  const name = normalizeText(vacancyPost?.post_name);
  const dept = normalizeText(vacancyPost?.department_ministry);

  const categoryValues = knownCutoffRows
    .map((r) => getCategoryValue(r?.cutoffs, category))
    .filter((v) => typeof v === "number" && v > 0);

  const averageKnown =
    categoryValues.length > 0
      ? categoryValues.reduce((a, b) => a + b, 0) / categoryValues.length
      : 340;

  if (name.includes("assistant section officer") || name.includes("assistant aso")) {
    if (dept.includes("external affairs")) return 360;
    if (dept.includes("railways")) return 356;
    if (dept.includes("intelligence bureau")) return 352;
    return 350;
  }

  if (name.includes("income tax")) return 347;
  if (name.includes("examiner")) return 349;
  if (name.includes("preventive")) return 348;
  if (name.includes("central excise")) return 344;
  if (name.includes("assistant enforcement officer")) return 346;
  if (name.includes("sub inspector") && dept.includes("cbi")) return 344;
  if (name.includes("sub inspector") && dept.includes("nia")) return 340;
  if (name.includes("sub inspector") && dept.includes("narcotics")) return 336;

  if (name.includes("junior statistical officer")) return 420;
  if (name.includes("statistical investigator")) return 410;

  if (name.includes("office superintendent")) return 338;
  if (name.includes("executive assistant")) return 339;

  if (name.includes("auditor")) return 334;
  if (name.includes("accountant")) return 334;

  if (name.includes("tax assistant")) {
    if (dept.includes("direct taxes") || dept.includes("cbdt")) return 333;
    return 329;
  }

  if (name.includes("upper division clerk") || name.includes("senior secretariat assistant")) return 332;

  if (payLevel.includes("level 7")) return Math.max(344, averageKnown);
  if (payLevel.includes("level 6")) return Math.max(338, averageKnown - 4);
  if (payLevel.includes("level 5")) return Math.max(332, averageKnown - 8);
  if (payLevel.includes("level 4")) return Math.max(326, averageKnown - 12);

  return averageKnown;
}

function getOverallCategoryOffsets(cutoffs) {
  const yearWeights = {
    2024: 0.5,
    2023: 0.3,
    2022: 0.2
  };

  const sums = {
    UR: 0,
    EWS: 0,
    OBC: 0,
    SC: 0,
    ST: 0
  };

  let usedWeight = 0;

  for (const year of [2024, 2023, 2022]) {
    const data = cutoffs?.byYear?.[year];
    const overall = data?.overall_cutoffs || null;
    if (!overall) continue;

    const ur = getCategoryValue(overall, "UR");
    if (!ur) continue;

    const weight = yearWeights[year];
    usedWeight += weight;

    for (const cat of Object.keys(sums)) {
      const value = getCategoryValue(overall, cat);
      if (typeof value === "number" && value > 0) {
        sums[cat] += value * weight;
      } else {
        sums[cat] += ur * weight;
      }
    }
  }

  if (usedWeight <= 0) {
    return {
      UR: 0,
      EWS: -8,
      OBC: -10,
      SC: -22,
      ST: -30
    };
  }

  const avg = {};
  for (const cat of Object.keys(sums)) {
    avg[cat] = sums[cat] / usedWeight;
  }

  return {
    UR: 0,
    EWS: Number((avg.EWS - avg.UR).toFixed(2)),
    OBC: Number((avg.OBC - avg.UR).toFixed(2)),
    SC: Number((avg.SC - avg.UR).toFixed(2)),
    ST: Number((avg.ST - avg.UR).toFixed(2))
  };
}

function getCategoryAdjustedEstimatedCutoff(vacancyPost, category, cutoffs) {
  const baseCutoff = estimateCutoffFromProfile(vacancyPost, category, cutoffs.posts || []);
  const offsets = getOverallCategoryOffsets(cutoffs);
  const normalizedCategory = normalizeCategory(category);
  const offset = offsets[normalizedCategory] ?? 0;
  return Number((baseCutoff + offset).toFixed(4));
}

function getPostAliases(name) {
  const n = normalizeText(name);
  const aliases = new Set([n]);

  if (n.includes("assistant section officer") || n.includes("aso") || n.includes("assistant aso")) {
    aliases.add("assistant section officer");
    aliases.add("aso");
    aliases.add("assistant aso");
    aliases.add("assistant aso css");
    aliases.add("assistant aso ib");
    aliases.add("assistant aso railways");
    aliases.add("assistant aso external affairs");
  }

  if (n.includes("assistant audit officer") || n.includes("aao")) {
    aliases.add("assistant audit officer");
    aliases.add("aao");
  }

  if (n.includes("assistant accounts officer")) {
    aliases.add("assistant accounts officer");
  }

  if (n.includes("inspector of income tax") || n.includes("income tax")) {
    aliases.add("inspector of income tax");
    aliases.add("income tax");
  }

  if (n.includes("examiner")) {
    aliases.add("inspector examiner");
    aliases.add("examiner");
    aliases.add("inspector examiner cbic");
  }

  if (n.includes("preventive")) {
    aliases.add("inspector preventive officer");
    aliases.add("preventive officer");
    aliases.add("preventive");
    aliases.add("inspector preventive officer cbic");
  }

  if (n.includes("central excise")) {
    aliases.add("inspector central excise");
    aliases.add("central excise");
  }

  if (n.includes("assistant enforcement officer")) {
    aliases.add("assistant enforcement officer");
  }

  if (n.includes("sub inspector")) {
    aliases.add("sub inspector");
    if (n.includes("cbi")) aliases.add("sub inspector cbi");
    if (n.includes("nia")) aliases.add("sub inspector nia");
    if (n.includes("narcotics") || n.includes("ncb")) aliases.add("sub inspector narcotics");
  }

  if (n.includes("tax assistant")) {
    aliases.add("tax assistant");
  }

  if (n.includes("auditor")) aliases.add("auditor");
  if (n.includes("accountant") || n.includes("junior accountant")) {
    aliases.add("accountant");
    aliases.add("junior accountant");
  }
  if (n.includes("junior statistical officer")) aliases.add("junior statistical officer");
  if (n.includes("statistical investigator")) aliases.add("statistical investigator");
  if (n.includes("executive assistant")) aliases.add("executive assistant");
  if (n.includes("office superintendent")) aliases.add("office superintendent");
  if (n.includes("upper division clerk") || n.includes("udc")) {
    aliases.add("upper division clerk");
    aliases.add("udc");
  }
  if (n.includes("senior secretariat assistant") || n.includes("ssa")) {
    aliases.add("senior secretariat assistant");
    aliases.add("ssa");
  }

  if (n.includes("udc") || n.includes("ssa")) {
    aliases.add("udc");
    aliases.add("ssa");
    aliases.add("udc ssa");
  }

  return [...aliases];
}

function getPostFamily(postName) {
  const name = normalizeText(postName);

  if (name.includes("assistant audit officer") || name.includes("aao")) return "aao";
  if (name.includes("assistant accounts officer")) return "assistant_accounts_officer";
  if (name.includes("assistant section officer") || name.includes("aso")) return "aso";
  if (name.includes("inspector of income tax") || name.includes("income tax")) return "income_tax";
  if (name.includes("examiner")) return "examiner";
  if (name.includes("preventive")) return "preventive";
  if (name.includes("central excise")) return "central_excise";
  if (name.includes("assistant enforcement officer")) return "aeo";
  if (name.includes("sub inspector") && name.includes("cbi")) return "si_cbi";
  if (name.includes("sub inspector") && name.includes("nia")) return "si_nia";
  if (name.includes("sub inspector") && (name.includes("narcotics") || name.includes("ncb"))) return "si_ncb";
  if (name.includes("junior statistical officer")) return "jso";
  if (name.includes("statistical investigator")) return "stat_investigator";
  if (name.includes("auditor")) return "auditor";
  if (name.includes("accountant")) return "accountant";
  if (name.includes("tax assistant")) return "tax_assistant";
  if (name.includes("upper division clerk")) return "udc";
  if (name.includes("senior secretariat assistant")) return "ssa";
  if (name.includes("executive assistant")) return "executive_assistant";
  if (name.includes("office superintendent")) return "office_superintendent";

  return normalizeText(postName);
}

function diversifyTopPosts(items, limit = 12, maxPerFamily = 2) {
  const out = [];
  const familyCount = new Map();

  for (const item of items) {
    const family = getPostFamily(item.post);
    const count = familyCount.get(family) || 0;

    if (count >= maxPerFamily) continue;

    out.push(item);
    familyCount.set(family, count + 1);

    if (out.length >= limit) break;
  }

  return out;
}

function filterRelevantPosts(items, score) {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return items;

  const filtered = items.filter((item) => {
    if (item.scoreGap >= -35) return true;
    if ((item.categorySeats || 0) >= 150 && item.scoreGap >= -55) return true;
    if ((item.priorityScore || 0) >= 90 && item.scoreGap >= -50) return true;
    if ((item.totalSeats || 0) >= 80 && item.scoreGap >= -65) return true;
    return false;
  });

  if (filtered.length > 0) return filtered;

  return [...items]
    .sort((a, b) => {
      if ((b.scoreGap || 0) !== (a.scoreGap || 0)) {
        return (b.scoreGap || 0) - (a.scoreGap || 0);
      }
      return (b.totalSeats || 0) - (a.totalSeats || 0);
    })
    .slice(0, 12);
}

function matchPostScore(nameA, nameB) {
  const a = normalizeText(nameA);
  const b = normalizeText(nameB);
  if (!a || !b) return 0;

  if (a === b) return 100;

  const aAliases = getPostAliases(nameA);
  const bAliases = getPostAliases(nameB);

  let score = 0;

  for (const x of aAliases) {
    for (const y of bAliases) {
      if (x === y) score = Math.max(score, 95);
      else if (x.includes(y) || y.includes(x)) score = Math.max(score, 70);
    }
  }

  const aWords = a.split(" ").filter((w) => w.length > 2);
  const bWords = b.split(" ").filter((w) => w.length > 2);

  let common = 0;
  for (const w of aWords) {
    if (bWords.includes(w)) common++;
  }

  score += common * 5;
  return score;
}

function findBestCutoffPost(cutoffPosts, vacancyPostName) {
  let best = null;
  let bestScore = 0;

  for (const post of cutoffPosts || []) {
    const score = matchPostScore(vacancyPostName, post?.post_name);
    if (score > bestScore) {
      best = post;
      bestScore = score;
    }
  }

  return bestScore >= 20 ? best : null;
}

function getWeightedCutoffForPost(cutoffsByYear, vacancyPostName, category) {
  const yearWeights = {
    2024: 0.5,
    2023: 0.3,
    2022: 0.2
  };

  let weightedSum = 0;
  let usedWeight = 0;
  const matchedRows = [];

  for (const year of [2024, 2023, 2022]) {
    const yearData = cutoffsByYear?.[year];
    const yearPosts = Array.isArray(yearData?.posts) ? yearData.posts : [];
    const matchedPost = findBestCutoffPost(yearPosts, vacancyPostName);

    if (!matchedPost) continue;

    const value = getCategoryValue(matchedPost.cutoffs, category);
    if (typeof value === "number" && value > 0) {
      weightedSum += value * yearWeights[year];
      usedWeight += yearWeights[year];
      matchedRows.push(matchedPost);
    }
  }

  if (usedWeight > 0) {
    return {
      cutoff: Number((weightedSum / usedWeight).toFixed(4)),
      estimated: false,
      matchedRows
    };
  }

  return {
    cutoff: null,
    estimated: true,
    matchedRows
  };
}

function buildPostItems(cutoffs, vacancyPosts, score, category, categoryRank) {
  const numericScore = Number(score);
  const items = [];

  if (!Number.isFinite(numericScore)) return items;

  for (const vacancyPost of vacancyPosts) {
    const totalSeats =
      vacancyPost?.vacancies && typeof vacancyPost.vacancies.total === "number"
        ? vacancyPost.vacancies.total
        : 0;

    if (totalSeats <= 0) continue;

    const categorySeats = getPostCategorySeats(vacancyPost, category);
    const weightedCutoffInfo = getWeightedCutoffForPost(
      cutoffs.byYear || {},
      vacancyPost.post_name,
      category
    );

    const finalCutoff =
      weightedCutoffInfo.cutoff != null
        ? weightedCutoffInfo.cutoff
        : getCategoryAdjustedEstimatedCutoff(vacancyPost, category, cutoffs);

    const scoreGap = Number((numericScore - finalCutoff).toFixed(2));
    const rankToSeatsRatio =
      categoryRank && categorySeats > 0
        ? Number((categoryRank / categorySeats).toFixed(2))
        : null;

    const hasPublishedCutoff = weightedCutoffInfo.cutoff != null;

    items.push({
      post: vacancyPost.post_name,
      department: vacancyPost.department_ministry ?? null,
      pay_level: vacancyPost.pay_level ?? null,
      cutoff: finalCutoff,
      scoreGap,
      categorySeats,
      totalSeats,
      estimated: !hasPublishedCutoff,
      sourceType: hasPublishedCutoff ? "published" : "estimated",
      likelihoodBand: chanceBand(scoreGap, categoryRank, categorySeats),
      ladderLevel: ladderLevel(scoreGap, categoryRank, categorySeats),
      note: hasPublishedCutoff
        ? scoreGap >= 0
          ? `Above modeled cutoff by ${scoreGap}`
          : `Below modeled cutoff by ${Math.abs(scoreGap)}`
        : scoreGap >= 0
          ? `Estimated above modeled cutoff by ${scoreGap}`
          : `Estimated below modeled cutoff by ${Math.abs(scoreGap)}`,
      rankToSeatsRatio,
      priorityScore: getPostPriority(
        vacancyPost.post_name,
        vacancyPost.department_ministry,
        vacancyPost.pay_level
      )
    });
  }

  return items;
}

function dedupeItems(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = `${normalizeText(item.post)}|${normalizeText(item.department)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function getPostChances({ examKey, score, category, categoryRank }) {
  const vacancy = loadVacancy(examKey);
  const cutoffs = loadCutoffs(examKey);

  const numericScore = Number(score);
  const vacancyPosts = Array.isArray(vacancy?.posts) ? vacancy.posts : [];

  const categorySeats = getCategorySeats(vacancy, category);

  const selectionChanceBase = computeSelectionChance(categoryRank, categorySeats);
  const selectionChance = selectionChanceBase
    ? {
        ...selectionChanceBase,
        categorySeats,
        categoryRank
      }
    : null;

  if (vacancyPosts.length === 0 || !Number.isFinite(numericScore)) {
    return {
      available: false,
      selectionChance,
      items: [],
      ladder: []
    };
  }

  const safeCutoffs = {
    byYear: cutoffs?.byYear || {},
    posts: Array.isArray(cutoffs?.posts) ? cutoffs.posts : []
  };

  let items = dedupeItems(
    buildPostItems(safeCutoffs, vacancyPosts, numericScore, category, categoryRank)
  );

  items = filterRelevantPosts(items, numericScore);

  const order = ["High", "Moderate", "Low", "Very Low"];
  const ladderOrder = ["Very High", "High", "Moderate", "Low", "Very Low"];

  items.sort((a, b) => {
    const bandDiff = order.indexOf(a.likelihoodBand) - order.indexOf(b.likelihoodBand);
    if (bandDiff !== 0) return bandDiff;

    if ((b.scoreGap || 0) !== (a.scoreGap || 0)) {
      return (b.scoreGap || 0) - (a.scoreGap || 0);
    }

    if (a.estimated !== b.estimated) return a.estimated ? 1 : -1;

    const aRatio = a.rankToSeatsRatio ?? 9999;
    const bRatio = b.rankToSeatsRatio ?? 9999;
    if (aRatio !== bRatio) return aRatio - bRatio;

    if ((b.categorySeats || 0) !== (a.categorySeats || 0)) {
      return (b.categorySeats || 0) - (a.categorySeats || 0);
    }

    if ((b.priorityScore || 0) !== (a.priorityScore || 0)) {
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    }

    return (b.totalSeats || 0) - (a.totalSeats || 0);
  });

  const ladder = [...items]
    .sort((a, b) => {
      const levelDiff = ladderOrder.indexOf(a.ladderLevel) - ladderOrder.indexOf(b.ladderLevel);
      if (levelDiff !== 0) return levelDiff;

      if ((b.scoreGap || 0) !== (a.scoreGap || 0)) {
        return (b.scoreGap || 0) - (a.scoreGap || 0);
      }

      if (a.estimated !== b.estimated) return a.estimated ? 1 : -1;

      const aRatio = a.rankToSeatsRatio ?? 9999;
      const bRatio = b.rankToSeatsRatio ?? 9999;
      if (aRatio !== bRatio) return aRatio - bRatio;

      return (b.categorySeats || 0) - (a.categorySeats || 0);
    })
    .slice(0, 8)
    .map((p) => ({
      post: p.post,
      level: p.ladderLevel,
      scoreGap: p.scoreGap,
      categorySeats: p.categorySeats,
      estimated: p.estimated
    }));

  return {
    available: items.length > 0 || !!selectionChance,
    selectionChance,
    items: diversifyTopPosts(items, 12, 2),
    ladder
  };
}

module.exports = { getPostChances };