const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sgvs.db');
const db = new Database(dbPath);

console.log('--- SEEDING SAMPLE ATTENDANCE DATA ---');

function generateMockSelfie(name, id, status, dist) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <rect width="400" height="500" fill="#0f172a"/>
      <circle cx="200" cy="180" r="80" fill="#334155"/>
      <ellipse cx="200" cy="380" rx="140" ry="100" fill="#334155"/>
      <rect y="400" width="400" height="100" fill="#1e293b"/>
      <text x="20" y="430" fill="#38bdf8" font-size="14" font-weight="bold" font-family="sans-serif">SGVS • PENGESAHAN KEHADIRAN</text>
      <text x="20" y="455" fill="#f8fafc" font-size="12" font-family="monospace">${id} | ${name}</text>
      <text x="20" y="475" fill="#94a3b8" font-size="11" font-family="monospace">STATUS: ${status} | JARAK: ${dist}m</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const checkCount = db.prepare('SELECT count(*) as count FROM attendance_logs').get();
if (checkCount.count < 3) {
  const insert = db.prepare(`
    INSERT INTO attendance_logs (
      id, guardId, postId, type, timestamp,
      latitude, longitude, accuracy, distanceFromCenter,
      isWithinGeofence, status, selfieBase64,
      isMockLocation, isOfflineSync, reviewStatus, reviewNotes, reviewedBy, reviewedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  
  // 1. Valid Clock In by Mohd Khairul
  const t1 = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();
  insert.run(
    'LOG-DEMO-001',
    'SG-101',
    'POST-01',
    'CLOCK_IN',
    t1,
    3.139015,
    101.686865,
    6.5,
    12.4,
    1,
    'ON_TIME',
    generateMockSelfie('MOHD KHAIRUL BIN ISMAIL', 'SG-101', 'DALAM POS', 12.4),
    0,
    0,
    'APPROVED',
    'Disahkan tepat di pos pintu masuk utama',
    'Sistem Automatik',
    t1
  );

  // 2. Late Clock In by Ahmad Firdaus
  const t2 = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  insert.run(
    'LOG-DEMO-002',
    'SG-102',
    'POST-02',
    'CLOCK_IN',
    t2,
    3.140210,
    101.687910,
    5.0,
    15.8,
    1,
    'LATE',
    generateMockSelfie('AHMAD FIRDAUS BIN RAZAK', 'SG-102', 'LEWAT 20 MINIT', 15.8),
    0,
    0,
    'APPROVED',
    'Lewat 20 minit dari jadual mula syif',
    'Sistem Automatik',
    t2
  );

  // 3. Flagged Out of Bounds Check-in by Suresh Kumar (needs supervisor review)
  const t3 = new Date(now.getTime() - 1 * 3600 * 1000).toISOString();
  insert.run(
    'LOG-DEMO-003',
    'SG-103',
    'POST-03',
    'CLOCK_IN',
    t3,
    3.138800,
    101.686900,
    8.2,
    78.5,
    0,
    'FLAGGED_OUT_OF_BOUNDS',
    generateMockSelfie('SURESH KUMAR A/L RAMAN', 'SG-103', 'LUAR RADIUS (78.5m)', 78.5),
    0,
    0,
    'PENDING',
    'Di luar radius pos: 78.5m (had radius: 45m)',
    null,
    null
  );

  console.log('✓ 3 contoh rekod kehadiran berjaya dimasukkan (1 Sah, 1 Lewat, 1 Flagged Luar Pos)!');
} else {
  console.log('Rekod kehadiran sedia ada ditemui.');
}
