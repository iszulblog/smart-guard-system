import { isSupabaseConfigured, supabase } from './supabase';

let sqliteDb: any = null;

function getSqlite() {
  if (!sqliteDb) {
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

// ==============================================================================
// GUARD POSTS
// ==============================================================================

export async function getGuardPosts() {
  if (isSupabaseConfigured() && supabase) {
    const { data: posts, error } = await supabase
      .from('guard_posts')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

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
      (SELECT COUNT(*) FROM guards g WHERE g.activePostId = p.id AND g.status = 'ACTIVE') as assignedGuardsCount,
      (SELECT COUNT(*) FROM patrol_checkpoints cp WHERE cp.postId = p.id) as checkpointsCount
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

// ==============================================================================
// GUARDS ROSTER
// ==============================================================================

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
      postName: g.guard_posts?.name || 'Unassigned',
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
      postName: data.guard_posts?.name || 'Unassigned',
      postLat: data.guard_posts?.latitude,
      postLng: data.guard_posts?.longitude,
      postRadius: data.guard_posts?.radius || 35.0,
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

// ==============================================================================
// ATTENDANCE LOGS
// ==============================================================================

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
      postRadius: l.guard_posts?.radius || 35,
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

// ==============================================================================
// SETTINGS
// ==============================================================================

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

// ==============================================================================
// PATROL CHECKPOINTS & TOURS MANAGEMENT
// ==============================================================================

export async function getPatrolCheckpoints(postId?: string) {
  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('patrol_checkpoints').select('*, guard_posts(name)').order('sequence', { ascending: true });
    if (postId) query = query.eq('post_id', postId);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((cp: any) => ({
      id: cp.id,
      postId: cp.post_id,
      postName: cp.guard_posts?.name || cp.post_id,
      name: cp.name,
      latitude: cp.latitude,
      longitude: cp.longitude,
      radius: cp.radius,
      sequence: cp.sequence,
      requiredTasks: typeof cp.required_tasks === 'string' ? JSON.parse(cp.required_tasks) : cp.required_tasks || [],
      createdAt: cp.created_at,
    }));
  }

  const db = getSqlite();
  let query = `
    SELECT cp.*, p.name as postName
    FROM patrol_checkpoints cp
    JOIN guard_posts p ON cp.postId = p.id
  `;
  const params: any[] = [];
  if (postId) {
    query += ` WHERE cp.postId = ?`;
    params.push(postId);
  }
  query += ` ORDER BY cp.sequence ASC`;

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    ...r,
    requiredTasks: typeof r.requiredTasks === 'string' ? JSON.parse(r.requiredTasks) : r.requiredTasks || [],
  }));
}

export async function savePatrolCheckpoint(cp: {
  id?: string;
  postId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius?: number;
  sequence?: number;
  requiredTasks?: string[] | string;
}) {
  const cpId = cp.id || `CP-${Date.now().toString().slice(-4)}`;
  const tasksArr = Array.isArray(cp.requiredTasks)
    ? cp.requiredTasks
    : typeof cp.requiredTasks === 'string'
    ? JSON.parse(cp.requiredTasks || '[]')
    : [];

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('patrol_checkpoints').upsert({
      id: cpId,
      post_id: cp.postId,
      name: cp.name,
      latitude: cp.latitude,
      longitude: cp.longitude,
      radius: cp.radius || 25.0,
      sequence: cp.sequence || 1,
      required_tasks: tasksArr,
    });
    if (error) throw error;
    return cpId;
  }

  const db = getSqlite();
  const existing = db.prepare('SELECT id FROM patrol_checkpoints WHERE id = ?').get(cpId);
  if (existing) {
    db.prepare(`
      UPDATE patrol_checkpoints
      SET postId = ?, name = ?, latitude = ?, longitude = ?, radius = ?, sequence = ?, requiredTasks = ?
      WHERE id = ?
    `).run(
      cp.postId,
      cp.name,
      cp.latitude,
      cp.longitude,
      cp.radius || 25.0,
      cp.sequence || 1,
      JSON.stringify(tasksArr),
      cpId
    );
  } else {
    db.prepare(`
      INSERT INTO patrol_checkpoints (id, postId, name, latitude, longitude, radius, sequence, requiredTasks, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cpId,
      cp.postId,
      cp.name,
      cp.latitude,
      cp.longitude,
      cp.radius || 25.0,
      cp.sequence || 1,
      JSON.stringify(tasksArr),
      new Date().toISOString()
    );
  }
  return cpId;
}

export async function deletePatrolCheckpoint(id: string) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('patrol_checkpoints').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const db = getSqlite();
  db.prepare('DELETE FROM patrol_checkpoints WHERE id = ?').run(id);
  return true;
}

export async function getPatrolRuns(filters?: {
  guardId?: string;
  postId?: string;
  status?: string;
  limit?: number;
}) {
  if (isSupabaseConfigured() && supabase) {
    let query = supabase
      .from('patrol_runs')
      .select('*, guards(name), guard_posts(name)')
      .order('start_time', { ascending: false });

    if (filters?.guardId) query = query.eq('guard_id', filters.guardId);
    if (filters?.postId) query = query.eq('post_id', filters.postId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((r: any) => ({
      id: r.id,
      guardId: r.guard_id,
      guardName: r.guards?.name || r.guard_id,
      postId: r.post_id,
      postName: r.guard_posts?.name || r.post_id,
      status: r.status,
      startTime: r.start_time,
      endTime: r.end_time,
      totalCheckpoints: r.total_checkpoints,
      completedCheckpoints: r.completed_checkpoints,
      notes: r.notes,
    }));
  }

  const db = getSqlite();
  let query = `
    SELECT pr.*, g.name as guardName, p.name as postName
    FROM patrol_runs pr
    JOIN guards g ON pr.guardId = g.id
    JOIN guard_posts p ON pr.postId = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (filters?.guardId) {
    query += ` AND pr.guardId = ?`;
    params.push(filters.guardId);
  }
  if (filters?.postId) {
    query += ` AND pr.postId = ?`;
    params.push(filters.postId);
  }
  if (filters?.status) {
    query += ` AND pr.status = ?`;
    params.push(filters.status);
  }
  query += ` ORDER BY pr.startTime DESC LIMIT ?`;
  params.push(filters?.limit || 50);

  return db.prepare(query).all(...params);
}

export async function startPatrolRun(run: {
  id?: string;
  guardId: string;
  postId: string;
  totalCheckpoints: number;
}) {
  const runId = run.id || `PTR-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('patrol_runs').insert({
      id: runId,
      guard_id: run.guardId,
      post_id: run.postId,
      status: 'IN_PROGRESS',
      start_time: now,
      total_checkpoints: run.totalCheckpoints,
      completed_checkpoints: 0,
    });
    if (error) throw error;
    return runId;
  }

  const db = getSqlite();
  db.prepare(`
    INSERT INTO patrol_runs (id, guardId, postId, status, startTime, totalCheckpoints, completedCheckpoints)
    VALUES (?, ?, ?, 'IN_PROGRESS', ?, ?, 0)
  `).run(runId, run.guardId, run.postId, now, run.totalCheckpoints);

  return runId;
}

export async function completeCheckpointVerification(log: {
  id?: string;
  runId: string;
  checkpointId: string;
  guardId: string;
  latitude: number;
  longitude: number;
  distanceFromCheckpoint: number;
  isWithinGeofence: boolean | number;
  photoBase64?: string;
  tasksCompleted: string[];
  notes?: string;
}) {
  const logId = log.id || `PLOG-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  const isWithin = typeof log.isWithinGeofence === 'boolean' ? (log.isWithinGeofence ? 1 : 0) : log.isWithinGeofence;

  if (isSupabaseConfigured() && supabase) {
    const { error: logErr } = await supabase.from('patrol_logs').insert({
      id: logId,
      run_id: log.runId,
      checkpoint_id: log.checkpointId,
      guard_id: log.guardId,
      timestamp: now,
      latitude: log.latitude,
      longitude: log.longitude,
      distance_from_checkpoint: log.distanceFromCheckpoint,
      is_within_geofence: Boolean(isWithin),
      photo_base64: log.photoBase64 || null,
      tasks_completed: log.tasksCompleted || [],
      notes: log.notes || '',
    });
    if (logErr) throw logErr;

    const { data: runData } = await supabase
      .from('patrol_runs')
      .select('completed_checkpoints, total_checkpoints')
      .eq('id', log.runId)
      .single();

    if (runData) {
      const nextCompleted = (runData.completed_checkpoints || 0) + 1;
      const isComplete = nextCompleted >= runData.total_checkpoints;
      await supabase
        .from('patrol_runs')
        .update({
          completed_checkpoints: nextCompleted,
          status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
          end_time: isComplete ? now : null,
        })
        .eq('id', log.runId);
    }

    return logId;
  }

  const db = getSqlite();
  db.prepare(`
    INSERT INTO patrol_logs (
      id, runId, checkpointId, guardId, timestamp,
      latitude, longitude, distanceFromCheckpoint, isWithinGeofence,
      photoBase64, tasksCompleted, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    logId,
    log.runId,
    log.checkpointId,
    log.guardId,
    now,
    log.latitude,
    log.longitude,
    log.distanceFromCheckpoint,
    isWithin,
    log.photoBase64 || null,
    JSON.stringify(log.tasksCompleted || []),
    log.notes || ''
  );

  const run = db.prepare('SELECT completedCheckpoints, totalCheckpoints FROM patrol_runs WHERE id = ?').get(log.runId) as any;
  if (run) {
    const nextCompleted = (run.completedCheckpoints || 0) + 1;
    const isComplete = nextCompleted >= run.totalCheckpoints;
    db.prepare(`
      UPDATE patrol_runs
      SET completedCheckpoints = ?, status = ?, endTime = ?
      WHERE id = ?
    `).run(nextCompleted, isComplete ? 'COMPLETED' : 'IN_PROGRESS', isComplete ? now : null, log.runId);
  }

  return logId;
}

export async function finishPatrolRun(runId: string, notes?: string) {
  const now = new Date().toISOString();
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('patrol_runs')
      .update({
        status: 'COMPLETED',
        end_time: now,
        notes: notes || null,
      })
      .eq('id', runId);
    if (error) throw error;
    return true;
  }

  const db = getSqlite();
  db.prepare(`
    UPDATE patrol_runs
    SET status = 'COMPLETED', endTime = ?, notes = ?
    WHERE id = ?
  `).run(now, notes || null, runId);
  return true;
}

export async function getPatrolLogsByRun(runId: string) {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('patrol_logs')
      .select('*, patrol_checkpoints(name, radius, sequence)')
      .eq('run_id', runId)
      .order('timestamp', { ascending: true });
    if (error) throw error;

    return (data || []).map((l: any) => ({
      id: l.id,
      runId: l.run_id,
      checkpointId: l.checkpoint_id,
      checkpointName: l.patrol_checkpoints?.name || l.checkpoint_id,
      sequence: l.patrol_checkpoints?.sequence || 1,
      guardId: l.guard_id,
      timestamp: l.timestamp,
      latitude: l.latitude,
      longitude: l.longitude,
      distanceFromCheckpoint: l.distance_from_checkpoint,
      isWithinGeofence: l.is_within_geofence ? 1 : 0,
      photoBase64: l.photo_base64,
      tasksCompleted: typeof l.tasks_completed === 'string' ? JSON.parse(l.tasks_completed) : l.tasks_completed || [],
      notes: l.notes,
    }));
  }

  const db = getSqlite();
  const rows = db.prepare(`
    SELECT pl.*, cp.name as checkpointName, cp.sequence
    FROM patrol_logs pl
    JOIN patrol_checkpoints cp ON pl.checkpointId = cp.id
    WHERE pl.runId = ?
    ORDER BY pl.timestamp ASC
  `).all(runId) as any[];

  return rows.map((r) => ({
    ...r,
    tasksCompleted: typeof r.tasksCompleted === 'string' ? JSON.parse(r.tasksCompleted) : r.tasksCompleted || [],
  }));
}
