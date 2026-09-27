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
    radius REAL NOT NULL DEFAULT 30.0,
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
`);

// Seed default data if empty
const countPosts = db.prepare('SELECT count(*) as count FROM guard_posts').get() as { count: number };
if (countPosts.count === 0) {
  const insertPost = db.prepare(`
    INSERT INTO guard_posts (id, name, latitude, longitude, radius, description, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Default coordinates centered around a typical building/perimeter complex
  insertPost.run('POST-01', 'Pos Utama - Pintu Masuk A', 3.139003, 101.686855, 35.0, 'Pintu masuk kawalan utama pelawat & staf', new Date().toISOString());
  insertPost.run('POST-02', 'Pos Pintu Belakang - Gate B', 3.140200, 101.687900, 30.0, 'Laluan keluar masuk kenderaan kargo & logistik', new Date().toISOString());
  insertPost.run('POST-03', 'Pos Perimeter Zon Bawah Tanah', 3.137800, 101.685500, 45.0, 'Kawasan basement letak kereta B2 & zon utiliti', new Date().toISOString());
}

const countGuards = db.prepare('SELECT count(*) as count FROM guards').get() as { count: number };
if (countGuards.count === 0) {
  const insertGuard = db.prepare(`
    INSERT INTO guards (id, name, phone, pin, activePostId, shiftStart, shiftEnd, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGuard.run('SG-101', 'MOHD KHAIRUL BIN ISMAIL', '012-3456789', '1234', 'POST-01', '08:00', '20:00', 'ACTIVE', new Date().toISOString());
  insertGuard.run('SG-102', 'AHMAD FIRDAUS BIN RAZAK', '013-9876543', '2345', 'POST-02', '08:00', '20:00', 'ACTIVE', new Date().toISOString());
  insertGuard.run('SG-103', 'SURESH KUMAR A/L RAMAN', '017-5544332', '3456', 'POST-03', '20:00', '08:00', 'ACTIVE', new Date().toISOString());
  insertGuard.run('SG-104', 'AZMAN BIN HASHIM', '019-1122334', '4567', 'POST-01', '20:00', '08:00', 'ACTIVE', new Date().toISOString());
}

// Seed default settings
const countSettings = db.prepare('SELECT count(*) as count FROM settings').get() as { count: number };
if (countSettings.count === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('telegram_bot_token', '');
  insertSetting.run('telegram_chat_id', '');
  insertSetting.run('grace_period_mins', '15');
  insertSetting.run('enable_mock_detection', '1');
}

export default db;
