const express = require("express");

const router = express.Router();

const PLAN_PRICES = {
  49: 4900,
  99: 9900
};

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

router.post("/create-order", async (req, res) => {
  try {
    const planNum = Number(req.body.plan);
    const userKey = normalizeUserKey(req.body.userKey);

    if (!PLAN_PRICES[planNum]) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan"
      });
    }

    if (!userKey) {
      return res.status(400).json({
        success: false,
        error: "userKey required"
      });
    }

    return res.status(503).json({
      success: false,
      error: "Payment not live yet. Use demo unlock for now."
    });
  } catch (error) {
    console.error("create-order error:", error);

    return res.status(500).json({
      success: false,
      error: "Payment temporarily unavailable"
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    return res.status(503).json({
      success: false,
      verified: false,
      error: "Payment verification not live yet."
    });
  } catch (err) {
    console.error("verify error:", err);

    return res.status(500).json({
      success: false,
      verified: false,
      error: "Verification temporarily unavailable"
    });
  }
});

module.exports = router;