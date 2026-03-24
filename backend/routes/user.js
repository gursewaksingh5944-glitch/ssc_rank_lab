const express = require("express");
const {
  getUserProfile,
  setUserProfile,
  deleteUserProfile,
  getUnlockedPlan
} = require("../utils/planStore");

const router = express.Router();

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

router.get("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const profile = getUserProfile(userKey);
    if (!profile) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const unlockedPlan = getUnlockedPlan(userKey);
    return res.json({ success: true, userKey, profile, unlockedPlan });
  } catch (error) {
    console.error("/api/user GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const profileUpdate = req.body || {};
    const saved = setUserProfile(userKey, profileUpdate);

    return res.status(200).json({ success: true, userKey, profile: saved });
  } catch (error) {
    console.error("/api/user POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.delete("/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey required" });
    }

    const removed = deleteUserProfile(userKey);
    if (!removed) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, userKey, message: "User deleted" });
  } catch (error) {
    console.error("/api/user DELETE error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
