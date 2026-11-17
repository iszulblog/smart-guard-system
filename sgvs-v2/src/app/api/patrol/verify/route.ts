import { NextResponse } from 'next/server';
import { completeCheckpointVerification, getPatrolCheckpoints } from '@/lib/data-service';
import { calculateDistance } from '@/lib/geofence';
import { sendTelegramAlert } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      runId,
      checkpointId,
      guardId,
      latitude,
      longitude,
      tasksCompleted = [],
      notes = '',
      photoBase64 = null,
    } = body;

    if (!runId || !checkpointId || !guardId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters for checkpoint verification.' },
        { status: 400 }
      );
    }

    // Lookup checkpoint to verify coordinates & radius
    const allCheckpoints = await getPatrolCheckpoints();
    const cp = allCheckpoints.find((c: any) => c.id === checkpointId);

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const cpLat = cp ? cp.latitude : userLat;
    const cpLng = cp ? cp.longitude : userLng;
    const cpRadius = cp ? cp.radius : 25.0;

    const distance = Math.round(calculateDistance(userLat, userLng, cpLat, cpLng));
    const isWithin = distance <= cpRadius;

    const logId = await completeCheckpointVerification({
      runId,
      checkpointId,
      guardId,
      latitude: userLat,
      longitude: userLng,
      distanceFromCheckpoint: distance,
      isWithinGeofence: isWithin,
      photoBase64,
      tasksCompleted,
      notes,
    });

    // If an incident or out-of-bounds anomaly is reported with notes
    if (notes && notes.toLowerCase().includes('incident')) {
      sendTelegramAlert(
        `🚨 *PATROL INCIDENT REPORTED*\nGuard: ${guardId}\nCheckpoint: ${cp?.name || checkpointId}\nNotes: ${notes}\nDistance: ${distance}m (Radius: ${cpRadius}m)`
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: isWithin ? 'Checkpoint verified successfully.' : `Checkpoint verified with distance note (${distance}m).`,
      logId,
      distance,
      isWithin,
    });
  } catch (error: any) {
    console.error('Error verifying checkpoint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify checkpoint: ' + error.message },
      { status: 500 }
    );
  }
}
