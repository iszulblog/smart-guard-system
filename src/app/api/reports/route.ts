import { NextResponse } from 'next/server';
import { getAttendanceLogs } from '@/lib/data-service';
import { generateAttendanceExcel, AttendanceExportItem } from '@/lib/excel';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const logs = await getAttendanceLogs({ limit: 500 });

    const filtered = (logs as AttendanceExportItem[]).filter((l) => {
      const logDate = l.timestamp.split('T')[0];
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      return true;
    });

    const buffer = generateAttendanceExcel(filtered);
    const filename = `Laporan_Kehadiran_SGVS_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting report:', error);
    return NextResponse.json({ success: false, message: 'Ralat menjana laporan Excel.' }, { status: 500 });
  }
}
