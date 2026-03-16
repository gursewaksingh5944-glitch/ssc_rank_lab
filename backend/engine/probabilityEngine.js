function selectionBand({ category, estimatedRankRange, vacancy }) {
  // Uses real vacancy totals only.
  const totalVacancies = vacancy?.totalVacancies || vacancy?.totalVacanciesAnnounced || vacancy?.total || null;
  if (!totalVacancies) return { band: "Unknown", note: "Vacancy total missing" };

  const { rankMin, rankMax } = estimatedRankRange || {};
  if (!rankMin || !rankMax) return { band: "Unknown", note: "Rank range missing" };

  // very rough banding using total vacancies only (still real-data-based)
  const midRank = Math.floor((rankMin + rankMax) / 2);

  if (midRank <= totalVacancies * 0.7) return { band: "High", note: "Based on vacancy total" };
  if (midRank <= totalVacancies * 1.2) return { band: "Moderate", note: "Based on vacancy total" };
  return { band: "Low", note: "Based on vacancy total" };
}

module.exports = { selectionBand };