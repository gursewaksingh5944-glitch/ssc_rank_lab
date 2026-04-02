const fs = require("fs");
const path = require("path");
const db = require("./db");

const STORE_KEY = "test_entries";
const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "test-entries.json");

let _memoryStore = null;

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ users: {} }, null, 2), "utf8");
  }
}

function readStore() {
  if (_memoryStore) return _memoryStore;

  ensureStoreFile();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    _memoryStore = parsed && typeof parsed === "object" ? parsed : { users: {} };
    if (!_memoryStore.users) _memoryStore.users = {};
    return _memoryStore;
  } catch (err) {
    console.error("test store read error:", err);
    return { users: {} };
  }
}

function writeStore(data) {
  _memoryStore = data;

  ensureStoreFile();
  try {
    const tmpPath = filePath + ".tmp";
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.error("test store file write error:", err.message);
  }

  db.persistStore(STORE_KEY, data);
}

async function loadFromDb() {
  const data = await db.loadStore(STORE_KEY);
  if (data) {
    _memoryStore = data && typeof data === "object" ? data : { users: {} };
    if (!_memoryStore.users) _memoryStore.users = {};
    const count = Object.keys(_memoryStore.users).length;
    console.log(`  testEntries: loaded ${count} users from DB`);
  } else {
    readStore();
    if (_memoryStore && Object.keys(_memoryStore.users || {}).length > 0) {
      db.persistStore(STORE_KEY, _memoryStore);
      console.log("  testEntries: seeded DB from local file");
    }
  }
}

module.exports = { readStore, writeStore, loadFromDb };
