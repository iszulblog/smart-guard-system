import { NextResponse } from 'next/server';
import { updateAttendanceReview } from '@/lib/data-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { logId, action, notes, reviewedBy = 'SUPERVISOR' } = body;

    if (!logId || !action) {
      return NextResponse.json({ success: false, message: 'Log ID and action are required.' }, { status: 400 });
    }

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action. Must be APPROVED or REJECTED.' }, { status: 400 });
    }

    await updateAttendanceReview(logId, action, notes || '', reviewedBy);

    return NextResponse.json({
      success: true,
      message: `Log successfully marked as ${action}.`,
    });
  } catch (error: any) {
    console.error('Error reviewing attendance log:', error);
    return NextResponse.json({ success: false, message: 'Failed to update review status.' }, { status: 500 });
  }
}
