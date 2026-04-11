// Premium access enforcement middleware
// Checks server-side that user has active premium (paid or trial)

const { getEffectiveAccessPlan } = require("./planStore");

/**
 * Middleware: requires premium plan >= minPlan.
 * Reads userKey from body, query, or header.
 */
function requirePremium(minPlan = 99) {
  return (req, res, next) => {
    const userKey = String(
      req.body?.userKey || req.query?.userKey || req.headers["x-user-key"] || ""
    ).trim().toLowerCase();

    if (!userKey) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        premiumRequired: true
      });
    }

    const effectivePlan = getEffectiveAccessPlan(userKey);

    if (effectivePlan < minPlan) {
      return res.status(403).json({
        success: false,
        error: "Premium subscription required",
        premiumRequired: true,
        currentPlan: effectivePlan,
        requiredPlan: minPlan
      });
    }

    req.userKey = userKey;
    req.effectivePlan = effectivePlan;
    next();
  };
}

module.exports = { requirePremium };
