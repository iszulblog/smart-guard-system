import { NextResponse } from 'next/server';
import { updateAttendanceReview } from '@/lib/data-service';

export async function POST(req: Request) {
  try {
    const { logId, action, reviewNotes, reviewedBy = 'Penyelia Operasi' } = await req.json();

    if (!logId || !['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json({ success: false, message: 'ID Log dan tindakan (APPROVED/REJECTED) diperlukan.' }, { status: 400 });
    }

    const notes = reviewNotes || (action === 'APPROVED' ? 'Diluluskan atas justifikasi operasi' : 'Ditolak: Pelanggaran geofence tanpa sebab sah');

    await updateAttendanceReview(logId, action, notes, reviewedBy);

    return NextResponse.json({
      success: true,
      message: `Log kehadiran berjaya ${action === 'APPROVED' ? 'diluluskan' : 'ditolak'}.`
    });
  } catch (error: any) {
    console.error('Error reviewing log:', error);
    return NextResponse.json({ success: false, message: 'Ralat mengemas kini semakan.' }, { status: 500 });
  }
}
