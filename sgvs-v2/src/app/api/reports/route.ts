import { NextResponse } from 'next/server';
import { getAttendanceLogs, getPatrolRuns } from '@/lib/data-service';
import { generateAttendanceExcel, AttendanceExportItem, PatrolTourExportItem } from '@/lib/excel';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const [logs, patrolRuns] = await Promise.all([
      getAttendanceLogs({ limit: 500 }),
      getPatrolRuns({ limit: 200 }),
    ]);

    const filteredLogs = (logs as AttendanceExportItem[]).filter((l) => {
      const logDate = l.timestamp.split('T')[0];
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      return true;
    });

    const filteredPatrols = (patrolRuns as PatrolTourExportItem[]).filter((p) => {
      const pDate = p.startTime.split('T')[0];
      if (startDate && pDate < startDate) return false;
      if (endDate && pDate > endDate) return false;
      return true;
    });

    const buffer = generateAttendanceExcel(filteredLogs, filteredPatrols);
    const filename = `SGVS_Security_Audit_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting report:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate Excel report: ' + error.message }, { status: 500 });
  }
}
