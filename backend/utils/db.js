const { Pool } = require("pg");

let pool = null;
let dbAvailable = false;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on("error", (err) => {
      console.error("Unexpected PG pool error:", err.message);
    });
  }
  return pool;
}

async function initDb() {
  const p = getPool();
  if (!p) {
    console.log("⚠️  DATABASE_URL not set — using file-based storage (data will not persist across deploys).");
    return false;
  }

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        store_key TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    dbAvailable = true;
    console.log("✅ PostgreSQL connected and app_data table ready.");
    return true;
  } catch (err) {
    console.error("❌ PostgreSQL init failed:", err.message);
    dbAvailable = false;
    return false;
  }
}

async function loadStore(storeKey) {
  if (!dbAvailable) return null;
  try {
    const result = await getPool().query(
      "SELECT data FROM app_data WHERE store_key = $1",
      [storeKey]
    );
    return result.rows[0]?.data || null;
  } catch (err) {
    console.error(`DB load error (${storeKey}):`, err.message);
    return null;
  }
}

function persistStore(storeKey, data) {
  if (!dbAvailable) return;
  getPool().query(
    `INSERT INTO app_data (store_key, data, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (store_key)
     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [storeKey, JSON.stringify(data)]
  ).catch((err) => {
    console.error(`DB persist error (${storeKey}):`, err.message);
  });
}

function isDbAvailable() {
  return dbAvailable;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    dbAvailable = false;
  }
}

module.exports = { initDb, loadStore, persistStore, isDbAvailable, closePool };
