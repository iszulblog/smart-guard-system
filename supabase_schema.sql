-- ==============================================================================
-- SMART GUARD LOCATION VERIFICATION & ATTENDANCE SYSTEM (SGVS)
-- SUPABASE POSTGRESQL SCHEMA & INITIAL SEED DATA
-- ==============================================================================

-- 1. Create Guard Posts Table (Pos Kawalan)
CREATE TABLE IF NOT EXISTS guard_posts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL DEFAULT 30.0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Guards Table (Pengawal Keselamatan)
CREATE TABLE IF NOT EXISTS guards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  pin TEXT NOT NULL,
  active_post_id TEXT REFERENCES guard_posts(id) ON DELETE SET NULL,
  shift_start TEXT NOT NULL DEFAULT '08:00',
  shift_end TEXT NOT NULL DEFAULT '20:00',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Attendance Logs Table (Log Kehadiran & Forensik)
CREATE TABLE IF NOT EXISTS attendance_logs (
  id TEXT PRIMARY KEY,
  guard_id TEXT NOT NULL REFERENCES guards(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES guard_posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'CLOCK_IN' / 'CLOCK_OUT'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  distance_from_center DOUBLE PRECISION NOT NULL,
  is_within_geofence BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL, -- 'ON_TIME', 'LATE', 'FLAGGED_OUT_OF_BOUNDS'
  selfie_base64 TEXT, -- Watermarked image
  is_mock_location BOOLEAN DEFAULT FALSE,
  is_offline_sync BOOLEAN DEFAULT FALSE,
  review_status TEXT DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING', 'REJECTED'
  review_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

-- 4. Create Settings Table (Tetapan Sistem & Telegram)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexing for fast search and geospatial queries
CREATE INDEX IF NOT EXISTS idx_attendance_guard ON attendance_logs(guard_id);
CREATE INDEX IF NOT EXISTS idx_attendance_post ON attendance_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_attendance_time ON attendance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_logs(status);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Guard Posts
INSERT INTO guard_posts (id, name, latitude, longitude, radius, description)
VALUES 
  ('POST-01', 'Pos Utama - Pintu Masuk A', 3.139003, 101.686855, 35.0, 'Pintu masuk kawalan utama pelawat & staf'),
  ('POST-02', 'Pos Pintu Belakang - Gate B', 3.140200, 101.687900, 30.0, 'Laluan keluar masuk kenderaan kargo & logistik'),
  ('POST-03', 'Pos Perimeter Zon Bawah Tanah', 3.137800, 101.685500, 45.0, 'Kawasan basement letak kereta B2 & zon utiliti')
ON CONFLICT (id) DO NOTHING;

-- Seed Guards
INSERT INTO guards (id, name, phone, pin, active_post_id, shift_start, shift_end, status)
VALUES
  ('SG-101', 'MOHD KHAIRUL BIN ISMAIL', '012-3456789', '1234', 'POST-01', '08:00', '20:00', 'ACTIVE'),
  ('SG-102', 'AHMAD FIRDAUS BIN RAZAK', '013-9876543', '2345', 'POST-02', '08:00', '20:00', 'ACTIVE'),
  ('SG-103', 'SURESH KUMAR A/L RAMAN', '017-5544332', '3456', 'POST-03', '20:00', '08:00', 'ACTIVE'),
  ('SG-104', 'AZMAN BIN HASHIM', '019-1122334', '4567', 'POST-01', '20:00', '08:00', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Seed Settings
INSERT INTO settings (key, value)
VALUES
  ('telegram_bot_token', ''),
  ('telegram_chat_id', ''),
  ('grace_period_mins', '15'),
  ('enable_mock_detection', '1')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR PUBLIC ACCESS (OR AS NEEDED)
-- ==============================================================================
ALTER TABLE guard_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guards ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read & write via API anon/service keys
CREATE POLICY "Allow public read posts" ON guard_posts FOR SELECT USING (true);
CREATE POLICY "Allow public all posts" ON guard_posts FOR ALL USING (true);

CREATE POLICY "Allow public read guards" ON guards FOR SELECT USING (true);
CREATE POLICY "Allow public all guards" ON guards FOR ALL USING (true);

CREATE POLICY "Allow public read attendance" ON attendance_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendance" ON attendance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendance" ON attendance_logs FOR UPDATE USING (true);

CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public all settings" ON settings FOR ALL USING (true);
