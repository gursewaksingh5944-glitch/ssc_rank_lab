const fs = require("fs");
const path = require("path");

const TRIAL_DURATION_MS = 2 * 24 * 60 * 60 * 1000;

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "user-plans.json");

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ users: {}, payments: [] }, null, 2),
      "utf8"
    );
  }
}

function readStore() {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");

    return {
      users: parsed.users && typeof parsed.users === "object" ? parsed.users : {},
      payments: Array.isArray(parsed.payments) ? parsed.payments : []
    };
  } catch (err) {
    console.error("planStore read error:", err);
    return { users: {}, payments: [] };
  }
}

function writeStore(data) {
  ensureStoreFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getUnlockedPlan(userKey) {
  if (!userKey) return 0;
  const store = readStore();
  return Number(store.users[userKey]?.unlockedPlan || 0);
}

function getTrialInfo(userKey) {
  if (!userKey) {
    return {
      active: false,
      trialPlan: 0,
      startedAt: null,
      endsAt: null,
      remainingMs: 0,
      hasUsedTrial: false
    };
  }

  const store = readStore();
  const user = store.users[userKey] || {};
  const trialPlan = Number(user.trialPlan || 0);
  const startedAt = user.trialStartedAt || null;
  const endsAt = user.trialEndsAt || null;
  const hasUsedTrial = Boolean(user.hasUsedTrial);

  if (!trialPlan || !endsAt) {
    return {
      active: false,
      trialPlan: 0,
      startedAt,
      endsAt,
      remainingMs: 0,
      hasUsedTrial
    };
  }

  const remainingMs = new Date(endsAt).getTime() - Date.now();
  return {
    active: remainingMs > 0,
    trialPlan,
    startedAt,
    endsAt,
    remainingMs: Math.max(0, remainingMs),
    hasUsedTrial
  };
}

function getEffectiveAccessPlan(userKey) {
  const unlockedPlan = getUnlockedPlan(userKey);
  const trial = getTrialInfo(userKey);
  if (trial.active) {
    return Math.max(unlockedPlan, Number(trial.trialPlan || 0));
  }
  return unlockedPlan;
}

function startTrial(userKey, plan = 99) {
  if (!userKey) {
    return { success: false, error: "userKey required" };
  }

  const planNum = Number(plan || 0);
  if (![49, 99].includes(planNum)) {
    return { success: false, error: "Invalid trial plan" };
  }

  const store = readStore();
  const existing = store.users[userKey] || {};

  if (existing.hasUsedTrial) {
    return { success: false, error: "Trial already used" };
  }

  const unlockedPlan = Number(existing.unlockedPlan || 0);
  if (unlockedPlan >= planNum) {
    return { success: false, error: "Plan already unlocked" };
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + TRIAL_DURATION_MS);

  store.users[userKey] = {
    ...existing,
    trialPlan: planNum,
    trialStartedAt: now.toISOString(),
    trialEndsAt: endsAt.toISOString(),
    hasUsedTrial: true,
    updatedAt: new Date().toISOString()
  };

  writeStore(store);

  return {
    success: true,
    plan: planNum,
    trialStartedAt: store.users[userKey].trialStartedAt,
    trialEndsAt: store.users[userKey].trialEndsAt
  };
}

function setUnlockedPlan(userKey, plan, paymentMeta = {}) {
  if (!userKey) return 0;

  const store = readStore();
  const existing = store.users[userKey] || {};
  const currentPlan = Number(existing.unlockedPlan || 0);
  const finalPlan = Math.max(currentPlan, Number(plan || 0));

  store.users[userKey] = {
    ...existing,
    unlockedPlan: finalPlan,
    // End any active trial once user pays for a plan.
    trialPlan: 0,
    trialStartedAt: existing.trialStartedAt || "",
    trialEndsAt: existing.trialEndsAt || "",
    updatedAt: new Date().toISOString(),
    lastPaymentId: paymentMeta.paymentId || existing.lastPaymentId || "",
    lastOrderId: paymentMeta.orderId || existing.lastOrderId || ""
  };

  if (paymentMeta.paymentId || paymentMeta.orderId) {
    const alreadyExists = store.payments.some(
      (item) =>
        item.paymentId &&
        paymentMeta.paymentId &&
        item.paymentId === paymentMeta.paymentId
    );

    if (!alreadyExists) {
      store.payments.push({
        userKey,
        plan: Number(plan || 0),
        paymentId: paymentMeta.paymentId || "",
        orderId: paymentMeta.orderId || "",
        at: new Date().toISOString()
      });
    }
  }

  writeStore(store);
  return finalPlan;
}

function hasPaymentId(paymentId) {
  if (!paymentId) return false;
  const store = readStore();
  return store.payments.some((item) => item.paymentId === paymentId);
}

function getUserProfile(userKey) {
  if (!userKey) return null;
  const store = readStore();
  return store.users[userKey] || null;
}

function setUserProfile(userKey, profile = {}) {
  if (!userKey || typeof profile !== "object") return null;

  const store = readStore();
  const existing = store.users[userKey] || {};
  const updated = {
    ...existing,
    ...profile,
    updatedAt: new Date().toISOString()
  };

  store.users[userKey] = updated;
  writeStore(store);

  return updated;
}

function deleteUserProfile(userKey) {
  if (!userKey) return false;

  const store = readStore();
  if (!store.users[userKey]) return false;

  delete store.users[userKey];
  writeStore(store);

  return true;
}

module.exports = {
  getUnlockedPlan,
  getEffectiveAccessPlan,
  getTrialInfo,
  startTrial,
  setUnlockedPlan,
  hasPaymentId,
  getUserProfile,
  setUserProfile,
  deleteUserProfile
};