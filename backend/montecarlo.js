// montecarlo.js - Advanced Stable Rank Simulator

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

module.exports.runSimulation = function(score, category) {

    const simulationsCount = 10000;

    const historicalVacancies = {
        UR: [18000, 17500, 18500, 19000, 20000],
        OBC: [14000, 13500, 14500, 15000, 15500],
        SC: [9000, 8800, 9200, 9500, 9800],
        ST: [4500, 4300, 4700, 4800, 5000],
        EWS: [5000, 5200, 5400, 5500, 5600]
    };

    const meanScores = {
        UR: [270, 272, 275, 278, 280],
        OBC: [265, 266, 268, 270, 272],
        SC: [250, 252, 255, 257, 260],
        ST: [240, 242, 245, 248, 250],
        EWS: [268, 270, 272, 274, 276]
    };

    const stdScore = 25;
    const totalCandidates = 150000;

    let results = {
        "GST Inspector": 0,
        "Income Tax Inspector": 0,
        "Examiner": 0,
        "Auditor": 0,
        "Not Selected": 0
    };

    let simulations = [];
    let rankSum = 0;

    for (let i = 0; i < simulationsCount; i++) {

        const randomYearIndex = Math.floor(
            seededRandom(score + i) * 5
        );

        const vacancy = historicalVacancies[category][randomYearIndex];
        const meanScoreYear = meanScores[category][randomYearIndex];

        // Deterministic variation
        const variation = seededRandom(score * (i + 1));
        const adjustedMean = meanScoreYear + (variation - 0.5) * 10;

        // Percentile approximation (normal distribution style)
        let percentile =
            1 - ((score - adjustedMean) / (3 * stdScore));

        percentile = Math.min(Math.max(percentile, 0), 1);

        const estimatedRank =
            Math.round(percentile * totalCandidates);

        simulations.push(estimatedRank);
        rankSum += estimatedRank;

        const selectionLimit = vacancy * 4;

        if (estimatedRank < selectionLimit * 0.20)
            results["GST Inspector"]++;
        else if (estimatedRank < selectionLimit * 0.40)
            results["Income Tax Inspector"]++;
        else if (estimatedRank < selectionLimit * 0.60)
            results["Examiner"]++;
        else if (estimatedRank < selectionLimit)
            results["Auditor"]++;
        else
            results["Not Selected"]++;
    }

    // Average rank
    const overallRank = Math.round(rankSum / simulationsCount);

    // Category rank adjustment
    const categoryMultiplier = {
        UR: 1,
        OBC: 0.90,
        SC: 0.75,
        ST: 0.70,
        EWS: 0.95
    };

    const categoryRank =
        Math.round(overallRank * (categoryMultiplier[category] || 1));

    // Convert results to percentage
    for (let post in results) {
        results[post] = (
            (results[post] / simulationsCount) * 100
        ).toFixed(2);
    }

    return {
        results,
        overallRank,
        categoryRank,
        simulations
    };
};