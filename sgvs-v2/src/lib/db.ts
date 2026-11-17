import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sgvs.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS guard_posts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius REAL NOT NULL DEFAULT 35.0,
    description TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    pin TEXT NOT NULL,
    activePostId TEXT,
    shiftStart TEXT NOT NULL DEFAULT '08:00',
    shiftEnd TEXT NOT NULL DEFAULT '20:00',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    createdAt TEXT NOT NULL,
    FOREIGN KEY(activePostId) REFERENCES guard_posts(id)
  );

  CREATE TABLE IF NOT EXISTS attendance_logs (
    id TEXT PRIMARY KEY,
    guardId TEXT NOT NULL,
    postId TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    distanceFromCenter REAL NOT NULL,
    isWithinGeofence INTEGER NOT NULL,
    status TEXT NOT NULL,
    selfieBase64 TEXT,
    isMockLocation INTEGER DEFAULT 0,
    isOfflineSync INTEGER DEFAULT 0,
    reviewStatus TEXT DEFAULT 'PENDING',
    reviewNotes TEXT,
    reviewedBy TEXT,
    reviewedAt TEXT,
    FOREIGN KEY(guardId) REFERENCES guards(id),
    FOREIGN KEY(postId) REFERENCES guard_posts(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patrol_checkpoints (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius REAL NOT NULL DEFAULT 25.0,
    sequence INTEGER NOT NULL DEFAULT 1,
    requiredTasks TEXT NOT NULL DEFAULT '[]',
    createdAt TEXT NOT NULL,
    FOREIGN KEY(postId) REFERENCES guard_posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS patrol_runs (
    id TEXT PRIMARY KEY,
    guardId TEXT NOT NULL,
    postId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    startTime TEXT NOT NULL,
    endTime TEXT,
    totalCheckpoints INTEGER NOT NULL DEFAULT 0,
    completedCheckpoints INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY(guardId) REFERENCES guards(id),
    FOREIGN KEY(postId) REFERENCES guard_posts(id)
  );

  CREATE TABLE IF NOT EXISTS patrol_logs (
    id TEXT PRIMARY KEY,
    runId TEXT NOT NULL,
    checkpointId TEXT NOT NULL,
    guardId TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    distanceFromCheckpoint REAL NOT NULL,
    isWithinGeofence INTEGER NOT NULL DEFAULT 1,
    photoBase64 TEXT,
    tasksCompleted TEXT NOT NULL DEFAULT '[]',
    notes TEXT,
    FOREIGN KEY(runId) REFERENCES patrol_runs(id) ON DELETE CASCADE,
    FOREIGN KEY(checkpointId) REFERENCES patrol_checkpoints(id),
    FOREIGN KEY(guardId) REFERENCES guards(id)
  );
`);

// Seed default data if empty
const countPosts = db.prepare('SELECT count(*) as count FROM guard_posts').get() as { count: number };
if (countPosts.count === 0) {
  const insertPost = db.prepare(`
    INSERT INTO guard_posts (id, name, latitude, longitude, radius, description, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run('POST-01', 'Main Command Gate - Post Alpha', 3.139003, 101.686855, 35.0, 'Primary vehicle barrier & visitor credentials entrance', new Date().toISOString());
  insertPost.run('POST-02', 'Logistics & Cargo Bay - Post Bravo', 3.140200, 101.687900, 30.0, 'Freight dispatch dock, heavy truck inspection portal', new Date().toISOString());
  insertPost.run('POST-03', 'Subterranean Vault - Post Charlie', 3.137800, 101.685500, 45.0, 'Basement parking B2, electrical substation & plant utilities', new Date().toISOString());
}

const countGuards = db.prepare('SELECT count(*) as count FROM guards').get() as { count: number };
if (countGuards.count === 0) {
  const insertGuard = db.prepare(`
    INSERT INTO guards (id, name, phone, pin, activePostId, shiftStart, shiftEnd, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGuard.run('SG-101', 'KHAIRUL ISMAIL', '+6012-3456789', '1234', 'POST-01', '08:00', '20:00', 'ACTIVE', new Date().toISOString());
  insertGuard.run('SG-102', 'FIRDAUS RAZAK', '+6013-9876543', '2345', 'POST-02', '08:00', '20:00', 'ACTIVE', new Date().toISOString());
  insertGuard.run('SG-103', 'SURESH RAMAN', '+6017-5544332', '3456', 'POST-03', '20:00', '08:00', 'ACTIVE', new Date().toISOString());
  insertGuard.run('SG-104', 'AZMAN HASHIM', '+6019-1122334', '4567', 'POST-01', '20:00', '08:00', 'ACTIVE', new Date().toISOString());
}

const countSettings = db.prepare('SELECT count(*) as count FROM settings').get() as { count: number };
if (countSettings.count === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('telegram_bot_token', '');
  insertSetting.run('telegram_chat_id', '');
  insertSetting.run('grace_period_mins', '15');
  insertSetting.run('enable_mock_detection', '1');
}

// Seed default patrol checkpoints
const countCheckpoints = db.prepare('SELECT count(*) as count FROM patrol_checkpoints').get() as { count: number };
if (countCheckpoints.count === 0) {
  const insertCP = db.prepare(`
    INSERT INTO patrol_checkpoints (id, postId, name, latitude, longitude, radius, sequence, requiredTasks, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // POST-01 Patrol Checkpoints
  insertCP.run(
    'CP-101',
    'POST-01',
    'Main Lobby Turnstiles & Access Gates',
    3.139050,
    101.686900,
    20.0,
    1,
    JSON.stringify(['Verify visitor log signed', 'Check speed-gate turnstiles', 'Inspect reception emergency panic lock']),
    new Date().toISOString()
  );
  insertCP.run(
    'CP-102',
    'POST-01',
    'East Emergency Stairwell & Fire Hydrant',
    3.139220,
    101.687150,
    25.0,
    2,
    JSON.stringify(['Inspect fire panel status lights (All Green)', 'Ensure emergency exit free of obstruction', 'Check fire extinguisher pressure gauge']),
    new Date().toISOString()
  );
  insertCP.run(
    'CP-103',
    'POST-01',
    'Perimeter Fence & North CCTV Tower',
    3.139400,
    101.686600,
    30.0,
    3,
    JSON.stringify(['Inspect anti-climb fence razor wire', 'Verify CCTV spotlight operational', 'Confirm no unauthorized perimeter parking']),
    new Date().toISOString()
  );

  // POST-02 Patrol Checkpoints
  insertCP.run(
    'CP-201',
    'POST-02',
    'Cargo Loading Dock & Logistics Shutter',
    3.140280,
    101.688050,
    25.0,
    1,
    JSON.stringify(['Confirm roller shutter padlocks engaged', 'Verify barrier arm calibration', 'Inspect loading bay perimeter lighting']),
    new Date().toISOString()
  );
  insertCP.run(
    'CP-202',
    'POST-02',
    'Hazardous Material & Waste Containment',
    3.140450,
    101.687700,
    25.0,
    2,
    JSON.stringify(['Verify chemical storage lock secured', 'Check drainage sump for oil or chemical sheen', 'Test emergency eye wash station']),
    new Date().toISOString()
  );

  // POST-03 Patrol Checkpoints
  insertCP.run(
    'CP-301',
    'POST-03',
    'Basement B2 High-Voltage Electrical Vault',
    3.137750,
    101.685400,
    20.0,
    1,
    JSON.stringify(['Verify electrical substation door locked', 'Check diesel generator fuel level (>80%)', 'Listen for abnormal transformer buzzing/overheating']),
    new Date().toISOString()
  );
  insertCP.run(
    'CP-302',
    'POST-03',
    'Sub-Basement Water Sump & Chiller Plant',
    3.137950,
    101.685700,
    25.0,
    2,
    JSON.stringify(['Inspect sump float sensor operation', 'Check chiller control panel for alert codes', 'Ensure flood protection barriers deployed']),
    new Date().toISOString()
  );
}

export default db;
