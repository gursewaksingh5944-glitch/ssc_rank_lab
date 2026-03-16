const express = require("express");
const router = express.Router();
const { runSimulation } = require("../montecarlo");

router.post("/", (req, res) => {
    try {
        const { score, category, premium } = req.body;

        if (score === undefined || !category) {
            return res.status(400).json({
                success: false,
                error: "Score and category required",
            });
        }

        const numericScore = Number(score);

        if (isNaN(numericScore) || numericScore < 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid score",
            });
        }

        console.log("Incoming Prediction:", numericScore, category, premium);

        const { results, avgRank } = runSimulation(
            numericScore,
            category.toUpperCase()
        );

        let finalResults = { ...results };

        // Free users get limited view
        if (!premium) {
            for (let post in finalResults) {
                if (post !== "Not Selected") {
                    finalResults[post] = "Upgrade to Premium 🔒";
                }
            }
        }

        return res.json({
            success: true,
            prediction: finalResults,
            estimatedRank: premium ? avgRank : null,
        });

    } catch (error) {
        console.error("Prediction Error:", error);
        return res.status(500).json({
            success: false,
            error: "Server error occurred",
        });
    }
});

module.exports = router;