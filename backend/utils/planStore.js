const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TRIAL_DURATION_MS = 2 * 24 * 60 * 60 * 1000;
const DEFAULT_SUBSCRIBER_GOAL = 100000;
const PLAN_MRR_RUPEES = {
  99: 99,
  899: 75
};

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "user-plans.json");

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ users: {}, payments: [], referrals: [], settings: { subscriberGoal: DEFAULT_SUBSCRIBER_GOAL } }, null, 2),
      "utf8"
    );
  }
}

function normalizeSubscriberGoal(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_SUBSCRIBER_GOAL;
  }
  return Math.round(Math.min(parsed, 100000000));
}

function readStore() {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");

    return {
      users: parsed.users && typeof parsed.users === "object" ? parsed.users : {},
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      referrals: Array.isArray(parsed.referrals) ? parsed.referrals : [],
      settings: parsed.settings && typeof parsed.settings === "object"
        ? parsed.settings
        : { subscriberGoal: DEFAULT_SUBSCRIBER_GOAL }
    };
  } catch (err) {
    console.error("planStore read error:", err);
    return {
      users: {},
      payments: [],
      referrals: [],
      settings: { subscriberGoal: DEFAULT_SUBSCRIBER_GOAL }
    };
  }
}

function getSubscriberGoal() {
  const store = readStore();
  const fromStore = normalizeSubscriberGoal(store.settings?.subscriberGoal || 0);
  const fromEnv = normalizeSubscriberGoal(process.env.SUBSCRIBER_GOAL || 0);
  if (fromStore > 0) return fromStore;
  if (fromEnv > 0) return fromEnv;
  return DEFAULT_SUBSCRIBER_GOAL;
}

function setSubscriberGoal(goal) {
  const normalizedGoal = normalizeSubscriberGoal(goal);
  const store = readStore();
  const nextSettings = {
    ...(store.settings && typeof store.settings === "object" ? store.settings : {}),
    subscriberGoal: normalizedGoal,
    updatedAt: new Date().toISOString()
  };

  writeStore({
    ...store,
    settings: nextSettings
  });

  return {
    subscriberGoal: normalizedGoal,
    updatedAt: nextSettings.updatedAt
  };
}

function computePlanMrr(profile = {}) {
  const plan = Number(profile.unlockedPlan || 0);
  return Number(PLAN_MRR_RUPEES[plan] || 0);
}

function writeStore(data) {
  ensureStoreFile();
  const tmpPath = filePath + ".tmp";
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(tmpPath, json, "utf8");
  fs.renameSync(tmpPath, filePath);
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
  if (planNum !== 99) {
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

function buildReferralCode(userKey) {
  const normalized = String(userKey || "").trim().toLowerCase();
  if (!normalized) return "";
  const hash = crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 10);
  return `RL${hash}`.toUpperCase();
}

function getOrCreateReferralCode(userKey) {
  if (!userKey) return "";

  const store = readStore();
  const existing = store.users[userKey] || {};

  if (existing.referralCode) {
    return String(existing.referralCode).trim().toUpperCase();
  }

  const referralCode = buildReferralCode(userKey);
  store.users[userKey] = {
    ...existing,
    referralCode,
    updatedAt: new Date().toISOString()
  };
  writeStore(store);
  return referralCode;
}

function getUserKeyByReferralCode(referralCode) {
  const code = String(referralCode || "").trim().toUpperCase();
  if (!code) return "";

  const store = readStore();
  for (const [userKey, profile] of Object.entries(store.users || {})) {
    if (String(profile?.referralCode || "").trim().toUpperCase() === code) {
      return userKey;
    }
  }

  return "";
}

function creditReferralJoin(referrerKey, invitedUserKey, bonusDays = 2) {
  const referrer = String(referrerKey || "").trim().toLowerCase();
  const invited = String(invitedUserKey || "").trim().toLowerCase();
  const days = Number(bonusDays || 0);

  if (!referrer || !invited) {
    return { success: false, rewarded: false, error: "Missing referral user keys" };
  }

  if (referrer === invited) {
    return { success: false, rewarded: false, error: "Self referral not allowed" };
  }

  if (days <= 0) {
    return { success: false, rewarded: false, error: "Invalid bonus days" };
  }

  const store = readStore();
  const duplicate = store.referrals.some(
    (item) => item.referrerKey === referrer && item.invitedUserKey === invited
  );

  if (duplicate) {
    return { success: true, rewarded: false, duplicate: true };
  }

  const referrerProfile = store.users[referrer] || {};
  const now = Date.now();
  const bonusMs = days * 24 * 60 * 60 * 1000;
  const existingTrialEndMs = new Date(referrerProfile.trialEndsAt || "").getTime();
  const baseMs = Number.isFinite(existingTrialEndMs) && existingTrialEndMs > now ? existingTrialEndMs : now;
  const newTrialEndMs = baseMs + bonusMs;

  store.users[referrer] = {
    ...referrerProfile,
    trialPlan: Math.max(99, Number(referrerProfile.trialPlan || 0)),
    trialStartedAt: referrerProfile.trialStartedAt || new Date(now).toISOString(),
    trialEndsAt: new Date(newTrialEndMs).toISOString(),
    hasUsedTrial: true,
    referralCode: referrerProfile.referralCode || buildReferralCode(referrer),
    referralStats: {
      acceptedJoins: Number(referrerProfile.referralStats?.acceptedJoins || 0) + 1,
      bonusDaysGranted: Number(referrerProfile.referralStats?.bonusDaysGranted || 0) + days
    },
    updatedAt: new Date().toISOString()
  };

  store.referrals.push({
    referrerKey: referrer,
    invitedUserKey: invited,
    bonusDays: days,
    at: new Date().toISOString()
  });

  writeStore(store);

  return {
    success: true,
    rewarded: true,
    bonusDays: days,
    referrerKey: referrer,
    invitedUserKey: invited,
    trialEndsAt: store.users[referrer].trialEndsAt
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

function getSubscriberStats() {
  const store = readStore();
  const users = Object.values(store.users || {});
  const goal = normalizeSubscriberGoal(store.settings?.subscriberGoal || process.env.SUBSCRIBER_GOAL || DEFAULT_SUBSCRIBER_GOAL);
  const now = Date.now();
  const nowDate = new Date(now);
  const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
  const monthEnd = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1);
  const daysInMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).getDate();
  const daysElapsedInMonth = Math.max(1, nowDate.getDate());

  let paidSubscribers = 0;
  let activeTrials = 0;
  let totalMrr = 0;

  for (const profile of users) {
    const unlockedPlan = Number(profile?.unlockedPlan || 0);
    if (unlockedPlan >= 99) {
      paidSubscribers += 1;
      totalMrr += computePlanMrr(profile);
    }

    const trialEndsAtMs = new Date(profile?.trialEndsAt || "").getTime();
    if (Number.isFinite(trialEndsAtMs) && trialEndsAtMs > now) {
      activeTrials += 1;
    }
  }

  const remainingToGoal = Math.max(0, goal - paidSubscribers);
  const goalProgressPct = Number(((paidSubscribers / goal) * 100).toFixed(2));
  const trialToPaidGap = Math.max(0, goal - (paidSubscribers + activeTrials));
  const monthPaidAddsSet = new Set();

  for (const payment of store.payments || []) {
    const plan = Number(payment?.plan || 0);
    if (plan < 99) continue;

    const userKey = String(payment?.userKey || "").trim().toLowerCase();
    if (!userKey) continue;

    const paidAtMs = new Date(payment?.at || "").getTime();
    if (!Number.isFinite(paidAtMs)) continue;
    if (paidAtMs >= monthStart.getTime() && paidAtMs < monthEnd.getTime()) {
      monthPaidAddsSet.add(userKey);
    }
  }

  const currentMonthPaidAdds = monthPaidAddsSet.size;
  const dailyRunRateThisMonth = Number((currentMonthPaidAdds / daysElapsedInMonth).toFixed(2));
  const projectedMonthPaidAdds = Math.round(dailyRunRateThisMonth * daysInMonth);
  const estimatedDaysToGoal = dailyRunRateThisMonth > 0
    ? Math.ceil(remainingToGoal / dailyRunRateThisMonth)
    : null;

  return {
    goalSubscribers: goal,
    paidSubscribers,
    activeTrials,
    trialToPaidGap,
    remainingToGoal,
    goalProgressPct,
    currentMonthPaidAdds,
    dailyRunRateThisMonth,
    projectedMonthPaidAdds,
    estimatedDaysToGoal,
    monthlyRecurringRevenueRs: totalMrr,
    annualRunRateRs: totalMrr * 12,
    generatedAt: new Date().toISOString()
  };
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
  getSubscriberGoal,
  setSubscriberGoal,
  getSubscriberStats,
  startTrial,
  setUnlockedPlan,
  hasPaymentId,
  getUserProfile,
  setUserProfile,
  deleteUserProfile,
  getOrCreateReferralCode,
  getUserKeyByReferralCode,
  creditReferralJoin
};