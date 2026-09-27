import { isSupabaseConfigured, supabase } from './supabase';

let sqliteDb: any = null;

function getSqlite() {
  if (!sqliteDb) {
    // Only import better-sqlite3 when Supabase is not configured
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');

    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'sgvs.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
  }
  return sqliteDb;
}

export async function getGuardPosts() {
  if (isSupabaseConfigured() && supabase) {
    const { data: posts, error } = await supabase
      .from('guard_posts')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    // Attach count of assigned guards
    const { data: guards } = await supabase.from('guards').select('active_post_id');
    const guardCounts: Record<string, number> = {};
    (guards || []).forEach((g: any) => {
      if (g.active_post_id) {
        guardCounts[g.active_post_id] = (guardCounts[g.active_post_id] || 0) + 1;
      }
    });

    return (posts || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      radius: p.radius,
      description: p.description,
      createdAt: p.created_at,
      assignedGuardsCount: guardCounts[p.id] || 0,
    }));
  }

  const db = getSqlite();
  return db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM guards g WHERE g.activePostId = p.id AND g.status = 'ACTIVE') as assignedGuardsCount
    FROM guard_posts p
    ORDER BY p.name ASC
  `).all();
}

export async function saveGuardPost(post: {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  description?: string;
}) {
  const postId = post.id || `POST-${Date.now().toString().slice(-4)}`;

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('guard_posts').upsert({
      id: postId,
      name: post.name,
      latitude: post.latitude,
      longitude: post.longitude,
      radius: post.radius,
      description: post.description || '',
    });
    if (error) throw error;
    return postId;
  }

  const db = getSqlite();
  const existing = db.prepare('SELECT id FROM guard_posts WHERE id = ?').get(postId);
  if (existing) {
    db.prepare(`
      UPDATE guard_posts
      SET name = ?, latitude = ?, longitude = ?, radius = ?, description = ?
      WHERE id = ?
    `).run(post.name, post.latitude, post.longitude, post.radius, post.description || '', postId);
  } else {
    db.prepare(`
      INSERT INTO guard_posts (id, name, latitude, longitude, radius, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(postId, post.name, post.latitude, post.longitude, post.radius, post.description || '', new Date().toISOString());
  }
  return postId;
}

export async function deleteGuardPost(id: string) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('guard_posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const db = getSqlite();
  db.prepare('DELETE FROM guard_posts WHERE id = ?').run(id);
  return true;
}

export async function getGuards() {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('guards')
      .select('*, guard_posts(name)')
      .order('id', { ascending: true });
    if (error) throw error;

    return (data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      phone: g.phone,
      pin: g.pin,
      activePostId: g.active_post_id,
      postName: g.guard_posts?.name || 'Belum Ditetapkan',
      shiftStart: g.shift_start,
      shiftEnd: g.shift_end,
      status: g.status,
    }));
  }

  const db = getSqlite();
  return db.prepare(`
    SELECT g.*, p.name as postName,
      (SELECT type FROM attendance_logs a WHERE a.guardId = g.id ORDER BY a.timestamp DESC LIMIT 1) as lastAction
    FROM guards g
    LEFT JOIN guard_posts p ON g.activePostId = p.id
    ORDER BY g.id ASC
  `).all();
}

export async function saveGuard(guard: {
  id: string;
  name: string;
  phone?: string;
  pin: string;
  activePostId?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status?: string;
}) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('guards').upsert({
      id: guard.id.toUpperCase(),
      name: guard.name,
      phone: guard.phone || '',
      pin: guard.pin,
      active_post_id: guard.activePostId || null,
      shift_start: guard.shiftStart || '08:00',
      shift_end: guard.shiftEnd || '20:00',
      status: guard.status || 'ACTIVE',
    });
    if (error) throw error;
    return true;
  }

  const db = getSqlite();
  const existing = db.prepare('SELECT id FROM guards WHERE id = ?').get(guard.id);
  if (existing) {
    db.prepare(`
      UPDATE guards
      SET name = ?, phone = ?, pin = ?, activePostId = ?, shiftStart = ?, shiftEnd = ?, status = ?
      WHERE id = ?
    `).run(
      guard.name,
      guard.phone || '',
      guard.pin,
      guard.activePostId || null,
      guard.shiftStart || '08:00',
      guard.shiftEnd || '20:00',
      guard.status || 'ACTIVE',
      guard.id
    );
  } else {
    db.prepare(`
      INSERT INTO guards (id, name, phone, pin, activePostId, shiftStart, shiftEnd, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      guard.id.toUpperCase(),
      guard.name,
      guard.phone || '',
      guard.pin,
      guard.activePostId || null,
      guard.shiftStart || '08:00',
      guard.shiftEnd || '20:00',
      guard.status || 'ACTIVE',
      new Date().toISOString()
    );
  }
  return true;
}

export async function getGuardByLogin(guardId: string, pin: string) {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('guards')
      .select('*, guard_posts(*)')
      .ilike('id', guardId.trim())
      .eq('pin', pin.trim())
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      activePostId: data.active_post_id,
      postName: data.guard_posts?.name || 'Belum Ditetapkan',
      postLat: data.guard_posts?.latitude,
      postLng: data.guard_posts?.longitude,
      postRadius: data.guard_posts?.radius || 30.0,
      shiftStart: data.shift_start,
      shiftEnd: data.shift_end,
    };
  }

  const db = getSqlite();
  const guard = db.prepare(`
    SELECT g.*, p.name as postName, p.latitude as postLat, p.longitude as postLng, p.radius as postRadius
    FROM guards g
    LEFT JOIN guard_posts p ON g.activePostId = p.id
    WHERE UPPER(g.id) = UPPER(?) AND g.pin = ? AND g.status = 'ACTIVE'
  `).get(guardId.trim(), pin.trim()) as any;

  return guard;
}

export async function getAttendanceLogs(filters?: { status?: string; guardId?: string; postId?: string; limit?: number }) {
  if (isSupabaseConfigured() && supabase) {
    let query = supabase
      .from('attendance_logs')
      .select('*, guards(name), guard_posts(name, radius)')
      .order('timestamp', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.guardId) query = query.eq('guard_id', filters.guardId);
    if (filters?.postId) query = query.eq('post_id', filters.postId);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((l: any) => ({
      id: l.id,
      guardId: l.guard_id,
      guardName: l.guards?.name || l.guard_id,
      postId: l.post_id,
      postName: l.guard_posts?.name || l.post_id,
      postRadius: l.guard_posts?.radius || 30,
      type: l.type,
      timestamp: l.timestamp,
      latitude: l.latitude,
      longitude: l.longitude,
      accuracy: l.accuracy,
      distanceFromCenter: l.distance_from_center,
      isWithinGeofence: l.is_within_geofence ? 1 : 0,
      status: l.status,
      selfieBase64: l.selfie_base64,
      isMockLocation: l.is_mock_location ? 1 : 0,
      isOfflineSync: l.is_offline_sync ? 1 : 0,
      reviewStatus: l.review_status,
      reviewNotes: l.review_notes,
      reviewedBy: l.reviewed_by,
      reviewedAt: l.reviewed_at,
    }));
  }

  const db = getSqlite();
  let query = `
    SELECT a.*, g.name as guardName, p.name as postName, p.radius as postRadius
    FROM attendance_logs a
    JOIN guards g ON a.guardId = g.id
    JOIN guard_posts p ON a.postId = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (filters?.status) {
    query += ` AND a.status = ?`;
    params.push(filters.status);
  }
  if (filters?.guardId) {
    query += ` AND a.guardId = ?`;
    params.push(filters.guardId);
  }
  if (filters?.postId) {
    query += ` AND a.postId = ?`;
    params.push(filters.postId);
  }
  query += ` ORDER BY a.timestamp DESC LIMIT ?`;
  params.push(filters?.limit || 100);

  return db.prepare(query).all(...params);
}

export async function insertAttendanceLog(log: any) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('attendance_logs').insert({
      id: log.id,
      guard_id: log.guardId,
      post_id: log.postId,
      type: log.type,
      timestamp: log.timestamp,
      latitude: log.latitude,
      longitude: log.longitude,
      accuracy: log.accuracy,
      distance_from_center: log.distanceFromCenter,
      is_within_geofence: Boolean(log.isWithinGeofence),
      status: log.status,
      selfie_base64: log.selfieBase64 || null,
      is_mock_location: Boolean(log.isMockLocation),
      is_offline_sync: Boolean(log.isOfflineSync),
      review_status: log.reviewStatus,
      review_notes: log.reviewNotes,
    });
    if (error) throw error;
    return true;
  }

  const db = getSqlite();
  db.prepare(`
    INSERT INTO attendance_logs (
      id, guardId, postId, type, timestamp,
      latitude, longitude, accuracy, distanceFromCenter,
      isWithinGeofence, status, selfieBase64,
      isMockLocation, isOfflineSync, reviewStatus, reviewNotes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    log.id,
    log.guardId,
    log.postId,
    log.type,
    log.timestamp,
    log.latitude,
    log.longitude,
    log.accuracy,
    log.distanceFromCenter,
    log.isWithinGeofence,
    log.status,
    log.selfieBase64 || null,
    log.isMockLocation,
    log.isOfflineSync,
    log.reviewStatus,
    log.reviewNotes
  );
  return true;
}

export async function updateAttendanceReview(logId: string, action: string, notes: string, reviewedBy: string) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('attendance_logs')
      .update({
        review_status: action,
        review_notes: notes,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', logId);
    if (error) throw error;
    return true;
  }

  const db = getSqlite();
  db.prepare(`
    UPDATE attendance_logs
    SET reviewStatus = ?, reviewNotes = ?, reviewedBy = ?, reviewedAt = ?
    WHERE id = ?
  `).run(action, notes, reviewedBy, new Date().toISOString(), logId);
  return true;
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from('settings').select('*');
    const settings: Record<string, string> = {};
    (data || []).forEach((r: any) => {
      settings[r.key] = r.value;
    });
    return settings;
  }

  const db = getSqlite();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  rows.forEach((r) => {
    settings[r.key] = r.value;
  });
  return settings;
}

export async function saveSettingsMap(settings: Record<string, string>) {
  if (isSupabaseConfigured() && supabase) {
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
    const { error } = await supabase.from('settings').upsert(rows);
    if (error) throw error;
    return true;
  }

  const db = getSqlite();
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, val] of Object.entries(settings)) {
    upsert.run(key, String(val));
  }
  return true;
}
