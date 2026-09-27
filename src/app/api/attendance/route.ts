import { NextResponse } from 'next/server';
import { getAttendanceLogs, insertAttendanceLog, getGuardPosts, getGuards, getSettingsMap } from '@/lib/data-service';
import { verifyGeofence } from '@/lib/geofence';
import { sendTelegramAlert } from '@/lib/telegram';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const guardId = searchParams.get('guardId') || undefined;
    const postId = searchParams.get('postId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');

    const logs = await getAttendanceLogs({ status, guardId, postId, limit });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Error fetching attendance logs:', error);
    return NextResponse.json({ success: false, message: 'Ralat memuat log kehadiran.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      guardId,
      postId,
      type = 'CLOCK_IN',
      latitude,
      longitude,
      accuracy = 10,
      selfieBase64,
      isMockLocation = 0,
      isOfflineSync = 0,
      clientTimestamp,
    } = body;

    if (!guardId || !postId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Maklumat pengawal, pos, dan koordinat GPS diperlukan.'
      }, { status: 400 });
    }

    const [allGuards, allPosts, settings] = await Promise.all([
      getGuards(),
      getGuardPosts(),
      getSettingsMap(),
    ]);

    const guard = allGuards.find((g: any) => g.id.toUpperCase() === guardId.toUpperCase());
    if (!guard) {
      return NextResponse.json({ success: false, message: 'Pengawal tidak dijumpai.' }, { status: 404 });
    }

    const post = allPosts.find((p: any) => p.id === postId);
    if (!post) {
      return NextResponse.json({ success: false, message: 'Pos kawalan tidak dijumpai.' }, { status: 404 });
    }

    // 1. Perform Geofence Validation
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const userAcc = parseFloat(accuracy);
    const geofenceResult = verifyGeofence(userLat, userLng, post.latitude, post.longitude, post.radius, userAcc);

    // 2. Server timestamp
    const timestamp = isOfflineSync && clientTimestamp ? clientTimestamp : new Date().toISOString();

    // 3. Determine status & flagged condition
    let status = 'ON_TIME';
    let reviewStatus = 'APPROVED';
    let reviewNotes = '';

    if (isMockLocation) {
      status = 'FLAGGED_OUT_OF_BOUNDS';
      reviewStatus = 'PENDING';
      reviewNotes = 'Aplikasi Mock GPS dikesan pada peranti';
    } else if (!geofenceResult.isWithin) {
      status = 'FLAGGED_OUT_OF_BOUNDS';
      reviewStatus = 'PENDING';
      reviewNotes = `Di luar radius pos: ${geofenceResult.distance}m (had radius: ${post.radius}m)`;
    } else {
      if (type === 'CLOCK_IN') {
        const logTime = new Date(timestamp);
        const [shiftHours, shiftMins] = (guard.shiftStart || '08:00').split(':').map(Number);
        const shiftTime = new Date(logTime);
        shiftTime.setHours(shiftHours, shiftMins, 0, 0);

        const graceMins = parseInt(settings.grace_period_mins || '15');
        const diffMinutes = (logTime.getTime() - shiftTime.getTime()) / (1000 * 60);

        if (diffMinutes > graceMins) {
          status = 'LATE';
          reviewNotes = `Lewat ${Math.round(diffMinutes)} minit dari jadual mula syif`;
        }
      }
    }

    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // 4. Save to Database (Supabase or SQLite)
    await insertAttendanceLog({
      id: logId,
      guardId,
      postId,
      type,
      timestamp,
      latitude: userLat,
      longitude: userLng,
      accuracy: userAcc,
      distanceFromCenter: geofenceResult.distance,
      isWithinGeofence: geofenceResult.isWithin ? 1 : 0,
      status,
      selfieBase64: selfieBase64 || null,
      isMockLocation: isMockLocation ? 1 : 0,
      isOfflineSync: isOfflineSync ? 1 : 0,
      reviewStatus,
      reviewNotes,
    });

    // 5. Trigger Telegram Alert in background
    if (status === 'FLAGGED_OUT_OF_BOUNDS' || isMockLocation) {
      sendTelegramAlert({
        guardName: guard.name,
        guardId: guard.id,
        postName: post.name,
        type: isMockLocation ? 'MOCK_DETECTED' : 'FLAGGED_OUT_OF_BOUNDS',
        distance: geofenceResult.distance,
        radius: post.radius,
        timestamp,
        notes: reviewNotes,
      }).catch(err => console.error('Telegram dispatch error:', err));
    } else if (status === 'LATE') {
      sendTelegramAlert({
        guardName: guard.name,
        guardId: guard.id,
        postName: post.name,
        type: 'TARDINESS',
        distance: geofenceResult.distance,
        radius: post.radius,
        timestamp,
        notes: reviewNotes,
      }).catch(err => console.error('Telegram dispatch error:', err));
    } else {
      sendTelegramAlert({
        guardName: guard.name,
        guardId: guard.id,
        postName: post.name,
        type: type as any,
        distance: geofenceResult.distance,
        radius: post.radius,
        timestamp,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      logId,
      type,
      status,
      distance: geofenceResult.distance,
      radius: post.radius,
      isWithinGeofence: geofenceResult.isWithin,
      reviewStatus,
      reviewNotes,
      timestamp,
      message: geofenceResult.isWithin
        ? `Kehadiran (${type === 'CLOCK_IN' ? 'Masuk' : 'Keluar'}) berjaya direkodkan di pos.`
        : `Amaran: Anda berada ${geofenceResult.distance}m dari pusat pos (Had: ${post.radius}m). Rekod ditandakan untuk semakan penyelia.`
    });
  } catch (error: any) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ success: false, message: 'Ralat memproses kehadiran: ' + error.message }, { status: 500 });
  }
}
