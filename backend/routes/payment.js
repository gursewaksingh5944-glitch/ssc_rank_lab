const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const router = express.Router();

const PLAN_PRICES = {
  49: 4900,
  99: 9900
};

const PLAN_NAMES = {
  49: "Premium ₹49",
  99: "Premium ₹99"
};

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

function getRazorpayClient() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

function getUserPlansStore(req) {
  if (!req.app.locals.userPlans) {
    req.app.locals.userPlans = new Map();
  }
  return req.app.locals.userPlans;
}

function getPaymentHistoryStore(req) {
  if (!req.app.locals.paymentHistory) {
    req.app.locals.paymentHistory = [];
  }
  return req.app.locals.paymentHistory;
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

    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: PLAN_PRICES[planNum],
      currency: "INR",
      receipt: `sscranklab_${planNum}_${Date.now()}`,
      notes: {
        userKey,
        plan: String(planNum),
        product: PLAN_NAMES[planNum]
      }
    });

    return res.status(200).json({
      success: true,
      keyId: String(process.env.RAZORPAY_KEY_ID || "").trim(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      description: `${PLAN_NAMES[planNum]} Unlock`,
      brandName: "SSCRankLab",
      themeColor: "#7c3aed",
      notes: order.notes || {}
    });
  } catch (error) {
    console.error("create-order error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Payment temporarily unavailable"
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const planNum = Number(req.body.plan);
    const userKey = normalizeUserKey(req.body.userKey);
    const razorpayOrderId = String(req.body.razorpay_order_id || "").trim();
    const razorpayPaymentId = String(req.body.razorpay_payment_id || "").trim();
    const razorpaySignature = String(req.body.razorpay_signature || "").trim();

    if (!PLAN_PRICES[planNum]) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Invalid plan"
      });
    }

    if (!userKey) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "userKey required"
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Missing payment verification fields"
      });
    }

    const secret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!secret) {
      throw new Error("Missing Razorpay credentials");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Invalid payment signature"
      });
    }

    const userPlans = getUserPlansStore(req);
    const currentUnlockedPlan = Number(userPlans.get(userKey) || 0);
    const newUnlockedPlan = Math.max(currentUnlockedPlan, planNum);

    userPlans.set(userKey, newUnlockedPlan);

    const paymentHistory = getPaymentHistoryStore(req);
    paymentHistory.push({
      userKey,
      plan: planNum,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      at: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      verified: true,
      unlockedPlan: newUnlockedPlan,
      plan: newUnlockedPlan,
      userKey,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      message: `${PLAN_NAMES[planNum]} unlocked successfully`
    });
  } catch (err) {
    console.error("verify error:", err);

    return res.status(500).json({
      success: false,
      verified: false,
      error: err.message || "Verification temporarily unavailable"
    });
  }
});

router.get("/status", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.query.userKey);
    if (!userKey) {
      return res.status(400).json({
        success: false,
        error: "userKey required"
      });
    }

    const userPlans = getUserPlansStore(req);
    const unlockedPlan = Number(userPlans.get(userKey) || 0);

    return res.status(200).json({
      success: true,
      userKey,
      unlockedPlan
    });
  } catch (err) {
    console.error("status error:", err);
    return res.status(500).json({
      success: false,
      error: "Unable to fetch payment status"
    });
  }
});

module.exports = router;