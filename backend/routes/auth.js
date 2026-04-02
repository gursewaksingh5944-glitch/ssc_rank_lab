const express = require("express");
const { getUserProfile, setUserProfile } = require("../utils/planStore");
const testStore = require("../utils/testStore");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function emailToUserKey(email) {
  return `user_${normalizeEmail(email).replace(/[^a-z0-9]/g, "_")}`;
}

/**
 * POST /api/auth/register
 * Body: { email, name }
 * Creates new user or returns existing user if email already registered.
 */
router.post("/register", (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.name || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: "Valid email required" });
    }
    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: "Name required (min 2 chars)" });
    }
    if (name.length > 100) {
      return res.status(400).json({ success: false, error: "Name too long" });
    }

    const userKey = emailToUserKey(email);
    const existing = getUserProfile(userKey);

    if (existing && existing.email) {
      // Already registered — return as login
      return res.json({
        success: true,
        userKey,
        name: existing.name || name,
        email: existing.email,
        isNew: false
      });
    }

    // Create new profile
    const profile = setUserProfile(userKey, {
      email,
      name,
      registeredAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      userKey,
      name: profile.name,
      email: profile.email,
      isNew: true
    });
  } catch (error) {
    console.error("/api/auth/register error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * Body: { email }
 * Looks up existing user by email.
 */
router.post("/login", (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: "Valid email required" });
    }

    const userKey = emailToUserKey(email);
    const profile = getUserProfile(userKey);

    if (!profile || !profile.email) {
      return res.status(404).json({ success: false, error: "No account found with this email. Please register first." });
    }

    return res.json({
      success: true,
      userKey,
      name: profile.name || "",
      email: profile.email
    });
  } catch (error) {
    console.error("/api/auth/login error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/auth/migrate
 * Body: { oldUserKey, newUserKey }
 * Migrates test entries from a guest key to a registered key.
 */
router.post("/migrate", (req, res) => {
  try {
    const oldKey = String(req.body.oldUserKey || "").trim().toLowerCase();
    const newKey = String(req.body.newUserKey || "").trim().toLowerCase();

    if (!oldKey || !newKey || oldKey === newKey) {
      return res.status(400).json({ success: false, error: "Valid old and new user keys required" });
    }

    // Migrate test entries
    const store = testStore.readStore();
    const oldEntries = store.users[oldKey];
    if (oldEntries && Array.isArray(oldEntries) && oldEntries.length > 0) {
      const existingNew = store.users[newKey] || [];
      // Merge: new entries take priority, old entries fill gaps
      const merged = [...existingNew];
      const existingIds = new Set(merged.map(e => e.id));
      for (const entry of oldEntries) {
        const newId = entry.id.replace(oldKey, newKey);
        if (!existingIds.has(newId)) {
          merged.push({ ...entry, id: newId });
        }
      }
      store.users[newKey] = merged.slice(-120); // keep 120 limit
      delete store.users[oldKey];
      testStore.writeStore(store);
    }

    // Migrate user profile (merge, don't overwrite registered fields)
    const oldProfile = getUserProfile(oldKey);
    if (oldProfile) {
      const newProfile = getUserProfile(newKey) || {};
      const merged = { ...oldProfile, ...newProfile };
      // Preserve auth fields from new profile
      merged.email = newProfile.email;
      merged.name = newProfile.name;
      merged.registeredAt = newProfile.registeredAt;
      setUserProfile(newKey, merged);
    }

    return res.json({
      success: true,
      message: "Data migrated successfully",
      migratedEntries: (oldEntries || []).length
    });
  } catch (error) {
    console.error("/api/auth/migrate error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
