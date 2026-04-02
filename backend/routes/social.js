const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../utils/db");

const router = express.Router();

const STORE_KEY = "social_data";
const dataDir = path.join(__dirname, "..", "data");
const storePath = path.join(dataDir, "social-data.json");

const DEFAULT_GROUP_LIMIT = 20;
const MAX_GROUP_LIMIT = 100;
const MAX_CHAT_MESSAGES_PER_GROUP = 500;
const MAX_NOTIFICATIONS_PER_USER = 100;

// In-memory cache
let _memoryStore = null;

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    const initial = {
      groups: [],
      notificationsByUser: {}
    };
    fs.writeFileSync(storePath, JSON.stringify(initial, null, 2), "utf8");
  }
}

function normalizeShape(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { groups: [], notificationsByUser: {} };
  }
  if (!Array.isArray(parsed.groups)) parsed.groups = [];
  if (!parsed.notificationsByUser || typeof parsed.notificationsByUser !== "object") {
    parsed.notificationsByUser = {};
  }
  return parsed;
}

function readStore() {
  if (_memoryStore) return _memoryStore;

  ensureStoreFile();
  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    _memoryStore = normalizeShape(parsed);
    return _memoryStore;
  } catch (error) {
    console.error("social store read error:", error);
    return { groups: [], notificationsByUser: {} };
  }
}

function writeStore(data) {
  _memoryStore = data;

  ensureStoreFile();
  try {
    const tmpPath = storePath + ".tmp";
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmpPath, storePath);
  } catch (err) {
    console.error("social store file write error:", err.message);
  }

  db.persistStore(STORE_KEY, data);
}

async function loadSocialFromDb() {
  const data = await db.loadStore(STORE_KEY);
  if (data) {
    _memoryStore = normalizeShape(data);
    console.log(`  socialData: loaded ${_memoryStore.groups.length} groups from DB`);
  } else {
    readStore();
    if (_memoryStore && _memoryStore.groups.length > 0) {
      db.persistStore(STORE_KEY, _memoryStore);
      console.log("  socialData: seeded DB from local file");
    }
  }
}

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeGroupId(value) {
  return String(value || "").trim();
}

function nowIso() {
  return new Date().toISOString();
}

function generateId(prefix) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${stamp}${random}`;
}

function generateInviteCode() {
  return `GRP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function toPositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function pushNotification(store, userKey, payload) {
  const key = normalizeUserKey(userKey);
  if (!key) return;

  const list = Array.isArray(store.notificationsByUser[key])
    ? store.notificationsByUser[key]
    : [];

  list.unshift({
    id: generateId("notif"),
    createdAt: nowIso(),
    read: false,
    ...payload
  });

  store.notificationsByUser[key] = list.slice(0, MAX_NOTIFICATIONS_PER_USER);
}

function getGroupSummary(group, currentUserKey) {
  const normalizedUserKey = normalizeUserKey(currentUserKey);
  const isMember = group.members.some((member) => member.userKey === normalizedUserKey);
  const exposeInvite = isMember || group.visibility === "public";
  const owner = group.members.find((member) => member.userKey === group.ownerKey) || null;

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    visibility: group.visibility,
    memberLimit: group.memberLimit,
    memberCount: group.members.length,
    inviteCode: exposeInvite ? group.inviteCode : undefined,
    owner: owner
      ? {
          userKey: owner.userKey,
          displayName: owner.displayName
        }
      : null,
    isMember,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  };
}

// POST /api/social/groups/create
router.post("/groups/create", (req, res) => {
  try {
    const ownerKey = normalizeUserKey(req.body.userKey);
    const ownerName = String(req.body.displayName || "").trim() || "Group Owner";
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const visibility = String(req.body.visibility || "private").trim().toLowerCase();
    const memberLimit = Math.min(
      MAX_GROUP_LIMIT,
      Math.max(2, toPositiveInt(req.body.memberLimit, DEFAULT_GROUP_LIMIT))
    );

    if (!ownerKey || !name) {
      return res.status(400).json({ success: false, error: "userKey and group name are required" });
    }

    if (!["private", "public"].includes(visibility)) {
      return res.status(400).json({ success: false, error: "visibility must be private or public" });
    }

    const store = readStore();

    const group = {
      id: generateId("grp"),
      name: name.slice(0, 60),
      description: description.slice(0, 180),
      visibility,
      memberLimit,
      inviteCode: generateInviteCode(),
      ownerKey,
      members: [
        {
          userKey: ownerKey,
          displayName: ownerName.slice(0, 40),
          role: "owner",
          joinedAt: nowIso()
        }
      ],
      messages: [],
      challenges: [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    store.groups.unshift(group);
    writeStore(store);

    return res.json({
      success: true,
      group: getGroupSummary(group, ownerKey)
    });
  } catch (error) {
    console.error("/api/social/groups/create error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/social/groups/join
router.post("/groups/join", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.body.userKey);
    const displayName = String(req.body.displayName || "").trim() || "Member";
    const inviteCode = String(req.body.inviteCode || "").trim().toUpperCase();

    if (!userKey || !inviteCode) {
      return res.status(400).json({ success: false, error: "userKey and inviteCode are required" });
    }

    const store = readStore();
    const group = store.groups.find((item) => String(item.inviteCode || "").toUpperCase() === inviteCode);

    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found for this invite code" });
    }

    const alreadyMember = group.members.some((member) => member.userKey === userKey);
    if (!alreadyMember && group.members.length >= Number(group.memberLimit || DEFAULT_GROUP_LIMIT)) {
      return res.status(409).json({ success: false, error: "Group is full" });
    }

    if (!alreadyMember) {
      group.members.push({
        userKey,
        displayName: displayName.slice(0, 40),
        role: "member",
        joinedAt: nowIso()
      });
      group.updatedAt = nowIso();

      pushNotification(store, group.ownerKey, {
        type: "group_member_joined",
        title: "New member joined",
        message: `${displayName} joined ${group.name}`,
        groupId: group.id
      });
    }

    writeStore(store);

    return res.json({
      success: true,
      joined: true,
      group: getGroupSummary(group, userKey)
    });
  } catch (error) {
    console.error("/api/social/groups/join error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/social/groups/my?userKey=
router.get("/groups/my", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.query.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey is required" });
    }

    const store = readStore();
    const groups = store.groups
      .filter((group) => group.members.some((member) => member.userKey === userKey))
      .map((group) => getGroupSummary(group, userKey));

    return res.json({ success: true, groups });
  } catch (error) {
    console.error("/api/social/groups/my error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/social/groups/discover?userKey=
router.get("/groups/discover", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.query.userKey);
    const store = readStore();

    const groups = store.groups
      .filter((group) => group.visibility === "public")
      .map((group) => getGroupSummary(group, userKey));

    return res.json({ success: true, groups });
  } catch (error) {
    console.error("/api/social/groups/discover error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/social/groups/:groupId/members
router.get("/groups/:groupId/members", (req, res) => {
  try {
    const groupId = normalizeGroupId(req.params.groupId);
    const userKey = normalizeUserKey(req.query.userKey);

    const store = readStore();
    const group = store.groups.find((item) => item.id === groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.userKey === userKey);
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Join this group to view members" });
    }

    return res.json({
      success: true,
      members: group.members.map((member) => ({
        userKey: member.userKey,
        displayName: member.displayName,
        role: member.role,
        joinedAt: member.joinedAt
      }))
    });
  } catch (error) {
    console.error("/api/social/groups/:groupId/members error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/social/groups/:groupId/chat?userKey=&since=
router.get("/groups/:groupId/chat", (req, res) => {
  try {
    const groupId = normalizeGroupId(req.params.groupId);
    const userKey = normalizeUserKey(req.query.userKey);
    const since = String(req.query.since || "").trim();

    const store = readStore();
    const group = store.groups.find((item) => item.id === groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.userKey === userKey);
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Join this group to view chat" });
    }

    let messages = Array.isArray(group.messages) ? group.messages : [];
    if (since) {
      const sinceTime = new Date(since).getTime();
      if (Number.isFinite(sinceTime)) {
        messages = messages.filter((msg) => new Date(msg.createdAt).getTime() > sinceTime);
      }
    }

    return res.json({ success: true, messages });
  } catch (error) {
    console.error("/api/social/groups/:groupId/chat GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/social/groups/:groupId/chat
router.post("/groups/:groupId/chat", (req, res) => {
  try {
    const groupId = normalizeGroupId(req.params.groupId);
    const userKey = normalizeUserKey(req.body.userKey);
    const displayName = String(req.body.displayName || "").trim() || "Member";
    const text = String(req.body.text || "").trim();
    const messageType = String(req.body.messageType || "text").trim().toLowerCase();

    if (!userKey || !text) {
      return res.status(400).json({ success: false, error: "userKey and text are required" });
    }

    const store = readStore();
    const group = store.groups.find((item) => item.id === groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.userKey === userKey);
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Join this group to send messages" });
    }

    const msg = {
      id: generateId("msg"),
      userKey,
      displayName: displayName.slice(0, 40),
      text: text.slice(0, 500),
      messageType: ["text", "challenge", "system"].includes(messageType) ? messageType : "text",
      createdAt: nowIso()
    };

    if (!Array.isArray(group.messages)) group.messages = [];
    group.messages.push(msg);
    group.messages = group.messages.slice(-MAX_CHAT_MESSAGES_PER_GROUP);
    group.updatedAt = nowIso();

    group.members
      .filter((member) => member.userKey !== userKey)
      .forEach((member) => {
        pushNotification(store, member.userKey, {
          type: "group_message",
          title: `${group.name} message`,
          message: `${displayName}: ${msg.text.slice(0, 80)}`,
          groupId: group.id
        });
      });

    writeStore(store);
    return res.json({ success: true, message: msg });
  } catch (error) {
    console.error("/api/social/groups/:groupId/chat POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/social/groups/:groupId/challenges
router.post("/groups/:groupId/challenges", (req, res) => {
  try {
    const groupId = normalizeGroupId(req.params.groupId);
    const userKey = normalizeUserKey(req.body.userKey);
    const displayName = String(req.body.displayName || "").trim() || "Member";
    const title = String(req.body.title || "").trim();
    const questionCount = Math.max(1, Math.min(100, toPositiveInt(req.body.questionCount, 5)));
    const timeLimitMin = Math.max(1, Math.min(180, toPositiveInt(req.body.timeLimitMin, 15)));

    if (!userKey || !title) {
      return res.status(400).json({ success: false, error: "userKey and title are required" });
    }

    const store = readStore();
    const group = store.groups.find((item) => item.id === groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.userKey === userKey);
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Join this group to create challenges" });
    }

    const challenge = {
      id: generateId("chl"),
      title: title.slice(0, 120),
      questionCount,
      timeLimitMin,
      createdBy: {
        userKey,
        displayName: displayName.slice(0, 40)
      },
      createdAt: nowIso(),
      attempts: []
    };

    if (!Array.isArray(group.challenges)) group.challenges = [];
    group.challenges.unshift(challenge);
    group.challenges = group.challenges.slice(0, 100);

    if (!Array.isArray(group.messages)) group.messages = [];
    group.messages.push({
      id: generateId("msg"),
      userKey,
      displayName: displayName.slice(0, 40),
      text: `New challenge: ${challenge.title} (${challenge.questionCount}Q, ${challenge.timeLimitMin} min)` ,
      messageType: "challenge",
      challengeId: challenge.id,
      createdAt: nowIso()
    });
    group.messages = group.messages.slice(-MAX_CHAT_MESSAGES_PER_GROUP);
    group.updatedAt = nowIso();

    group.members
      .filter((member) => member.userKey !== userKey)
      .forEach((member) => {
        pushNotification(store, member.userKey, {
          type: "group_challenge",
          title: `${group.name} challenge`,
          message: `${displayName} posted a challenge: ${challenge.title}`,
          groupId: group.id,
          challengeId: challenge.id
        });
      });

    writeStore(store);
    return res.json({ success: true, challenge });
  } catch (error) {
    console.error("/api/social/groups/:groupId/challenges POST error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/social/groups/:groupId/challenges?userKey=
router.get("/groups/:groupId/challenges", (req, res) => {
  try {
    const groupId = normalizeGroupId(req.params.groupId);
    const userKey = normalizeUserKey(req.query.userKey);

    const store = readStore();
    const group = store.groups.find((item) => item.id === groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.userKey === userKey);
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Join this group to view challenges" });
    }

    const challenges = (Array.isArray(group.challenges) ? group.challenges : []).map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      questionCount: challenge.questionCount,
      timeLimitMin: challenge.timeLimitMin,
      createdBy: challenge.createdBy,
      createdAt: challenge.createdAt,
      attemptCount: Array.isArray(challenge.attempts) ? challenge.attempts.length : 0
    }));

    return res.json({ success: true, challenges });
  } catch (error) {
    console.error("/api/social/groups/:groupId/challenges GET error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/social/groups/:groupId/challenges/:challengeId/attempt
router.post("/groups/:groupId/challenges/:challengeId/attempt", (req, res) => {
  try {
    const groupId = normalizeGroupId(req.params.groupId);
    const challengeId = normalizeGroupId(req.params.challengeId);
    const userKey = normalizeUserKey(req.body.userKey);
    const displayName = String(req.body.displayName || "").trim() || "Member";
    const score = Number(req.body.score);
    const total = Number(req.body.total || 100);
    const timeTakenSec = toPositiveInt(req.body.timeTakenSec, 0);

    if (!userKey || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ success: false, error: "userKey, score, and total are required" });
    }

    const boundedScore = Math.max(0, Math.min(total, score));

    const store = readStore();
    const group = store.groups.find((item) => item.id === groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.userKey === userKey);
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Join this group to submit attempts" });
    }

    const challenge = (Array.isArray(group.challenges) ? group.challenges : []).find((item) => item.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, error: "Challenge not found" });
    }

    if (!Array.isArray(challenge.attempts)) challenge.attempts = [];

    const existing = challenge.attempts.find((item) => item.userKey === userKey);
    const attempt = {
      userKey,
      displayName: displayName.slice(0, 40),
      score: Number(boundedScore.toFixed(2)),
      total: Number(total.toFixed(2)),
      pct: Number(((boundedScore / total) * 100).toFixed(2)),
      timeTakenSec,
      submittedAt: nowIso()
    };

    if (existing) {
      Object.assign(existing, attempt);
    } else {
      challenge.attempts.push(attempt);
    }

    challenge.attempts.sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return a.timeTakenSec - b.timeTakenSec;
    });

    group.updatedAt = nowIso();
    writeStore(store);

    return res.json({ success: true, attempt });
  } catch (error) {
    console.error("/api/social/groups/:groupId/challenges/:challengeId/attempt error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/social/groups/:groupId/challenges/:challengeId/results?userKey=
router.get("/groups/:groupId/challenges/:challengeId/results", (req, res) => {
  try {
    const groupId = normalizeGroupId(req.params.groupId);
    const challengeId = normalizeGroupId(req.params.challengeId);
    const userKey = normalizeUserKey(req.query.userKey);

    const store = readStore();
    const group = store.groups.find((item) => item.id === groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.userKey === userKey);
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Join this group to view results" });
    }

    const challenge = (Array.isArray(group.challenges) ? group.challenges : []).find((item) => item.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, error: "Challenge not found" });
    }

    const results = (Array.isArray(challenge.attempts) ? challenge.attempts : []).map((attempt, index) => ({
      rank: index + 1,
      userKey: attempt.userKey,
      displayName: attempt.displayName,
      score: attempt.score,
      total: attempt.total,
      pct: attempt.pct,
      timeTakenSec: attempt.timeTakenSec,
      submittedAt: attempt.submittedAt
    }));

    return res.json({ success: true, challengeId: challenge.id, title: challenge.title, results });
  } catch (error) {
    console.error("/api/social/groups/:groupId/challenges/:challengeId/results error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/social/notifications/:userKey
router.get("/notifications/:userKey", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey is required" });
    }

    const store = readStore();
    const notifications = Array.isArray(store.notificationsByUser[userKey])
      ? store.notificationsByUser[userKey]
      : [];

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("/api/social/notifications/:userKey error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/social/notifications/:userKey/read-all
router.post("/notifications/:userKey/read-all", (req, res) => {
  try {
    const userKey = normalizeUserKey(req.params.userKey);
    if (!userKey) {
      return res.status(400).json({ success: false, error: "userKey is required" });
    }

    const store = readStore();
    const notifications = Array.isArray(store.notificationsByUser[userKey])
      ? store.notificationsByUser[userKey]
      : [];

    notifications.forEach((item) => {
      item.read = true;
    });

    store.notificationsByUser[userKey] = notifications;
    writeStore(store);

    return res.json({ success: true, updated: notifications.length });
  } catch (error) {
    console.error("/api/social/notifications/:userKey/read-all error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
module.exports.loadSocialFromDb = loadSocialFromDb;
