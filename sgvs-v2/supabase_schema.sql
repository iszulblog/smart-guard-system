-- ==============================================================================
-- SMART GUARD VERIFICATION & PATROL SYSTEM (SGVS V2)
-- PRODUCTION SUPABASE POSTGRESQL SCHEMA & INITIAL SEED DATA
-- ==============================================================================

-- 1. Create Guard Posts Table
CREATE TABLE IF NOT EXISTS guard_posts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL DEFAULT 35.0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Security Guards Table
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

-- 3. Create Attendance Logs Table
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
  selfie_base64 TEXT,
  is_mock_location BOOLEAN DEFAULT FALSE,
  is_offline_sync BOOLEAN DEFAULT FALSE,
  review_status TEXT DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING', 'REJECTED'
  review_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

-- 4. Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 5. Create Patrol Checkpoints Table
CREATE TABLE IF NOT EXISTS patrol_checkpoints (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES guard_posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL DEFAULT 25.0,
  sequence INTEGER NOT NULL DEFAULT 1,
  required_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Patrol Runs (Tours) Table
CREATE TABLE IF NOT EXISTS patrol_runs (
  id TEXT PRIMARY KEY,
  guard_id TEXT NOT NULL REFERENCES guards(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES guard_posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'ABORTED'
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  total_checkpoints INTEGER NOT NULL DEFAULT 0,
  completed_checkpoints INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

-- 7. Create Patrol Logs (Checkpoint Verifications) Table
CREATE TABLE IF NOT EXISTS patrol_logs (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES patrol_runs(id) ON DELETE CASCADE,
  checkpoint_id TEXT NOT NULL REFERENCES patrol_checkpoints(id) ON DELETE CASCADE,
  guard_id TEXT NOT NULL REFERENCES guards(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  distance_from_checkpoint DOUBLE PRECISION NOT NULL,
  is_within_geofence BOOLEAN NOT NULL DEFAULT TRUE,
  photo_base64 TEXT,
  tasks_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT
);

-- Indexing for speed and geolocation lookup
CREATE INDEX IF NOT EXISTS idx_attendance_guard ON attendance_logs(guard_id);
CREATE INDEX IF NOT EXISTS idx_attendance_post ON attendance_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_attendance_time ON attendance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_logs(status);
CREATE INDEX IF NOT EXISTS idx_patrol_checkpoints_post ON patrol_checkpoints(post_id, sequence ASC);
CREATE INDEX IF NOT EXISTS idx_patrol_runs_guard ON patrol_runs(guard_id);
CREATE INDEX IF NOT EXISTS idx_patrol_runs_post ON patrol_runs(post_id);
CREATE INDEX IF NOT EXISTS idx_patrol_logs_run ON patrol_logs(run_id);

-- Initial Seed Data
INSERT INTO guard_posts (id, name, latitude, longitude, radius, description)
VALUES 
  ('POST-01', 'Main Command Gate - Post Alpha', 3.139003, 101.686855, 35.0, 'Primary vehicle barrier & visitor credentials entrance'),
  ('POST-02', 'Logistics & Cargo Bay - Post Bravo', 3.140200, 101.687900, 30.0, 'Freight dispatch dock, heavy truck inspection portal'),
  ('POST-03', 'Subterranean Vault - Post Charlie', 3.137800, 101.685500, 45.0, 'Basement parking B2, electrical substation & plant utilities')
ON CONFLICT (id) DO NOTHING;

INSERT INTO guards (id, name, phone, pin, active_post_id, shift_start, shift_end, status)
VALUES
  ('SG-101', 'KHAIRUL ISMAIL', '+6012-3456789', '1234', 'POST-01', '08:00', '20:00', 'ACTIVE'),
  ('SG-102', 'FIRDAUS RAZAK', '+6013-9876543', '2345', 'POST-02', '08:00', '20:00', 'ACTIVE'),
  ('SG-103', 'SURESH RAMAN', '+6017-5544332', '3456', 'POST-03', '20:00', '08:00', 'ACTIVE'),
  ('SG-104', 'AZMAN HASHIM', '+6019-1122334', '4567', 'POST-01', '20:00', '08:00', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (key, value)
VALUES
  ('telegram_bot_token', ''),
  ('telegram_chat_id', ''),
  ('grace_period_mins', '15'),
  ('enable_mock_detection', '1')
ON CONFLICT (key) DO NOTHING;

INSERT INTO patrol_checkpoints (id, post_id, name, latitude, longitude, radius, sequence, required_tasks)
VALUES
  ('CP-101', 'POST-01', 'Main Lobby Turnstiles & Access Gates', 3.139050, 101.686900, 20.0, 1, '["Verify visitor log signed", "Check speed-gate turnstiles", "Inspect reception emergency panic lock"]'::jsonb),
  ('CP-102', 'POST-01', 'East Emergency Stairwell & Fire Hydrant', 3.139220, 101.687150, 25.0, 2, '["Inspect fire panel status lights (All Green)", "Ensure emergency exit free of obstruction", "Check fire extinguisher pressure gauge"]'::jsonb),
  ('CP-103', 'POST-01', 'Perimeter Fence & North CCTV Tower', 3.139400, 101.686600, 30.0, 3, '["Inspect anti-climb fence razor wire", "Verify CCTV spotlight operational", "Confirm no unauthorized perimeter parking"]'::jsonb),
  ('CP-201', 'POST-02', 'Cargo Loading Dock & Logistics Shutter', 3.140280, 101.688050, 25.0, 1, '["Confirm roller shutter padlocks engaged", "Verify barrier arm calibration", "Inspect loading bay perimeter lighting"]'::jsonb),
  ('CP-202', 'POST-02', 'Hazardous Material & Waste Containment', 3.140450, 101.687700, 25.0, 2, '["Verify chemical storage lock secured", "Check drainage sump for oil or chemical sheen", "Test emergency eye wash station"]'::jsonb),
  ('CP-301', 'POST-03', 'Basement B2 High-Voltage Electrical Vault', 3.137750, 101.685400, 20.0, 1, '["Verify electrical substation door locked", "Check diesel generator fuel level (>80%)", "Listen for abnormal transformer buzzing/overheating"]'::jsonb),
  ('CP-302', 'POST-03', 'Sub-Basement Water Sump & Chiller Plant', 3.137950, 101.685700, 25.0, 2, '["Inspect sump float sensor operation", "Check chiller control panel for alert codes", "Ensure flood protection barriers deployed"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE guard_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guards ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read posts" ON guard_posts FOR SELECT USING (true);
CREATE POLICY "Allow public all posts" ON guard_posts FOR ALL USING (true);

CREATE POLICY "Allow public read guards" ON guards FOR SELECT USING (true);
CREATE POLICY "Allow public all guards" ON guards FOR ALL USING (true);

CREATE POLICY "Allow public read attendance" ON attendance_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendance" ON attendance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendance" ON attendance_logs FOR UPDATE USING (true);

CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public all settings" ON settings FOR ALL USING (true);

CREATE POLICY "Allow public read checkpoints" ON patrol_checkpoints FOR SELECT USING (true);
CREATE POLICY "Allow public all checkpoints" ON patrol_checkpoints FOR ALL USING (true);

CREATE POLICY "Allow public read patrol_runs" ON patrol_runs FOR SELECT USING (true);
CREATE POLICY "Allow public all patrol_runs" ON patrol_runs FOR ALL USING (true);

CREATE POLICY "Allow public read patrol_logs" ON patrol_logs FOR SELECT USING (true);
CREATE POLICY "Allow public all patrol_logs" ON patrol_logs FOR ALL USING (true);
