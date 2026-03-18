-- =========================================
-- SSC RANK LAB - DATABASE SCHEMA
-- PostgreSQL
-- =========================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  user_key VARCHAR(120) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================

-- USER GOALS (TARGET POST)
CREATE TABLE IF NOT EXISTS user_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_key VARCHAR(50) NOT NULL DEFAULT 'ssc_cgl',
  target_post VARCHAR(120) NOT NULL,
  target_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, exam_key)
);

-- =========================================

-- TEST ENTRIES (DAILY MOCK DATA)
CREATE TABLE IF NOT EXISTS test_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_key VARCHAR(50) NOT NULL DEFAULT 'ssc_cgl',
  test_date DATE NOT NULL,
  mock_name VARCHAR(150),

  quant NUMERIC(6,2) DEFAULT 0,
  reasoning NUMERIC(6,2) DEFAULT 0,
  english NUMERIC(6,2) DEFAULT 0,
  gk NUMERIC(6,2) DEFAULT 0,

  total NUMERIC(6,2) NOT NULL,
  attempts INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  time_taken_minutes INTEGER DEFAULT 0,

  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_entries_user_id
ON test_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_test_entries_user_date
ON test_entries(user_id, test_date DESC);

-- =========================================

-- TEST PREDICTIONS (RANK + SELECTION + TARGET ANALYSIS)
CREATE TABLE IF NOT EXISTS test_predictions (
  id BIGSERIAL PRIMARY KEY,

  test_entry_id BIGINT NOT NULL REFERENCES test_entries(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  plan_used INTEGER DEFAULT 0,

  predicted_rank_min INTEGER,
  predicted_rank_max INTEGER,

  percentile NUMERIC(5,2),
  selection_probability NUMERIC(5,2),

  likely_post VARCHAR(150),
  cutoff_band VARCHAR(100),

  -- TARGET POST ANALYSIS
  target_post VARCHAR(120),
  readiness_status VARCHAR(50),

  safe_score_min INTEGER,
  safe_score_max INTEGER,

  gap_marks_min INTEGER,
  gap_marks_max INTEGER,

  priority_sections TEXT[], -- ['quant','gk','english']

  raw_response_json JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_predictions_user_id
ON test_predictions(user_id);

CREATE INDEX IF NOT EXISTS idx_test_predictions_test_entry_id
ON test_predictions(test_entry_id);

-- =========================================

-- PAYMENT RECORDS (RAZORPAY)
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,

  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  plan INTEGER NOT NULL,

  razorpay_order_id VARCHAR(120),
  razorpay_payment_id VARCHAR(120),
  razorpay_signature VARCHAR(200),

  amount_paise INTEGER,
  status VARCHAR(50) DEFAULT 'created',

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id
ON payments(user_id);

-- =========================================

-- UNLOCKS (PREMIUM ACCESS)
CREATE TABLE IF NOT EXISTS unlocks (
  id BIGSERIAL PRIMARY KEY,

  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  plan INTEGER NOT NULL,
  source VARCHAR(50) DEFAULT 'payment',

  payment_id BIGINT REFERENCES payments(id) ON DELETE SET NULL,

  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_unlocks_user_id
ON unlocks(user_id);

-- =========================================

-- TARGET POSTS MASTER DATA
CREATE TABLE IF NOT EXISTS post_targets (
  id BIGSERIAL PRIMARY KEY,

  exam_key VARCHAR(50) NOT NULL,
  post_name VARCHAR(120) NOT NULL,

  safe_score_min INTEGER NOT NULL,
  safe_score_max INTEGER NOT NULL,

  priority_1 VARCHAR(50),
  priority_2 VARCHAR(50),
  priority_3 VARCHAR(50),

  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_targets_exam
ON post_targets(exam_key);

-- =========================================
-- END OF SCHEMA
-- =========================================