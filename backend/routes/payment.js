const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const {
  getUnlockedPlan,
  getEffectiveAccessPlan,
  getTrialInfo,
  startTrial,
  setUnlockedPlan,
  hasPaymentId,
  getOrCreateReferralCode,
  getUserKeyByReferralCode,
  creditReferralJoin,
  getUserProfile
} = require("../utils/planStore");

const router = express.Router();

const PLAN_PRICES = {
  99: 9900
};

const PLAN_NAMES = {
  99: "Monthly Premium ₹99"
};

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeReferralCode(value) {
  return String(value || "").trim().toUpperCase();
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
      description: `${PLAN_NAMES[planNum]} Subscription`,
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

    if (hasPaymentId(razorpayPaymentId)) {
      const unlockedPlan = getUnlockedPlan(userKey);

      return res.status(200).json({
        success: true,
        verified: true,
        unlockedPlan,
        plan: unlockedPlan,
        userKey,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        message: "Payment already verified"
      });
    }

    const newUnlockedPlan = setUnlockedPlan(userKey, planNum, {
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId
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

    const unlockedPlan = getUnlockedPlan(userKey);
    const effectivePlan = getEffectiveAccessPlan(userKey);
    const trial = getTrialInfo(userKey);
    const profile = getUserProfile(userKey) || {};
    const referralCode = getOrCreateReferralCode(userKey);

    return res.status(200).json({
      success: true,
      userKey,
      unlockedPlan,
      effectivePlan,
      trial,
      referralCode,
      referralStats: profile.referralStats || { acceptedJoins: 0, bonusDaysGranted: 0 }
    });
  } catch (err) {
    console.error("status error:", err);

    return res.status(500).json({
      success: false,
      error: "Unable to fetch payment status"
    });
  }
});

router.post("/start-trial", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.body.userKey);
    const planNum = Number(req.body.plan || 99);
    const referralCode = normalizeReferralCode(req.body.referralCode || req.body.ref || "");

    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const trialResult = startTrial(userKey, planNum);
    if (!trialResult.success) {
      return res.status(400).json({
        success: false,
        error: trialResult.error || "Could not start trial"
      });
    }

    let referralReward = null;
    if (referralCode) {
      const referrerKey = getUserKeyByReferralCode(referralCode);
      if (referrerKey) {
        const rewardResult = creditReferralJoin(referrerKey, userKey, 2);
        if (rewardResult.success && rewardResult.rewarded) {
          referralReward = {
            credited: true,
            bonusDays: rewardResult.bonusDays,
            referrerKey: rewardResult.referrerKey
          };
        }
      }
    }

    return res.status(200).json({
      success: true,
      userKey,
      message: "2-day premium trial activated",
      ...trialResult,
      unlockedPlan: getUnlockedPlan(userKey),
      effectivePlan: getEffectiveAccessPlan(userKey),
      trial: getTrialInfo(userKey),
      referralReward
    });
  } catch (err) {
    console.error("start-trial error:", err);
    return res.status(500).json({
      success: false,
      error: "Unable to start trial"
    });
  }
});

module.exports = router;