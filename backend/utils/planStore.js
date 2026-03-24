const fs = require("fs");
const path = require("path");

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

function setUnlockedPlan(userKey, plan, paymentMeta = {}) {
  if (!userKey) return 0;

  const store = readStore();
  const currentPlan = Number(store.users[userKey]?.unlockedPlan || 0);
  const finalPlan = Math.max(currentPlan, Number(plan || 0));

  store.users[userKey] = {
    unlockedPlan: finalPlan,
    updatedAt: new Date().toISOString(),
    lastPaymentId: paymentMeta.paymentId || store.users[userKey]?.lastPaymentId || "",
    lastOrderId: paymentMeta.orderId || store.users[userKey]?.lastOrderId || ""
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
  setUnlockedPlan,
  hasPaymentId,
  getUserProfile,
  setUserProfile,
  deleteUserProfile
};