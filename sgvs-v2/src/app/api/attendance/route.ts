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
    return NextResponse.json({ success: false, message: 'Failed to retrieve attendance logs.' }, { status: 500 });
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
        message: 'Guard ID, Post ID, and GPS coordinates are required.'
      }, { status: 400 });
    }

    const [allGuards, allPosts, settings] = await Promise.all([
      getGuards(),
      getGuardPosts(),
      getSettingsMap(),
    ]);

    const guard = allGuards.find((g: any) => g.id.toUpperCase() === guardId.toUpperCase());
    if (!guard) {
      return NextResponse.json({ success: false, message: 'Guard record not found.' }, { status: 404 });
    }

    const post = allPosts.find((p: any) => p.id === postId);
    if (!post) {
      return NextResponse.json({ success: false, message: 'Guard post not found.' }, { status: 404 });
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
      reviewNotes = 'Mock Location / GPS spoofing tool detected on device';
    } else if (!geofenceResult.isWithin) {
      status = 'FLAGGED_OUT_OF_BOUNDS';
      reviewStatus = 'PENDING';
      reviewNotes = `Outside perimeter: ${geofenceResult.distance}m (Fence limit: ${post.radius}m)`;
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
          reviewNotes = `Arrived ${Math.round(diffMinutes)} minutes past scheduled shift start`;
        }
      }
    }

    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    await insertAttendanceLog({
      id: logId,
      guardId: guard.id,
      postId: post.id,
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

    // 4. Instant Telegram Alert on Flagged Incidents
    if (status === 'FLAGGED_OUT_OF_BOUNDS') {
      const alertMsg = `⚠️ *SECURITY INTEGRITY BREACH FLAGGED*\nGuard: ${guard.name} (${guard.id})\nPost: ${post.name}\nAction: ${type}\nDistance: ${geofenceResult.distance}m from center (Fence: ${post.radius}m)\nStatus: Pending Investigation`;
      sendTelegramAlert(alertMsg).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: status === 'FLAGGED_OUT_OF_BOUNDS'
        ? `Location outside allowed radius (${geofenceResult.distance}m). Attendance flagged for supervisory review.`
        : `${type === 'CLOCK_IN' ? 'Clock-in' : 'Clock-out'} verified successfully.`,
      log: {
        id: logId,
        guardName: guard.name,
        postName: post.name,
        type,
        timestamp,
        distanceFromCenter: geofenceResult.distance,
        isWithinGeofence: geofenceResult.isWithin,
        status,
        reviewStatus,
      },
    });
  } catch (error: any) {
    console.error('Error logging attendance:', error);
    return NextResponse.json({ success: false, message: 'Server error processing attendance: ' + error.message }, { status: 500 });
  }
}
