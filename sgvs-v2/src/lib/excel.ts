import * as XLSX from 'xlsx';

export interface AttendanceExportItem {
  id: string;
  guardId: string;
  guardName: string;
  postId: string;
  postName: string;
  type: string;
  timestamp: string;
  distanceFromCenter: number;
  isWithinGeofence: number;
  status: string;
  isOfflineSync: number;
  reviewStatus: string;
  reviewNotes: string | null;
}

export interface PatrolTourExportItem {
  id: string;
  guardId: string;
  guardName: string;
  postId: string;
  postName: string;
  startTime: string;
  endTime: string | null;
  totalCheckpoints: number;
  completedCheckpoints: number;
  status: string;
  notes: string | null;
}

export function generateAttendanceExcel(
  items: AttendanceExportItem[],
  patrolRuns: PatrolTourExportItem[] = []
): Buffer {
  const attendanceData = items.map((item, index) => {
    const dateObj = new Date(item.timestamp);
    const dateStr = dateObj.toLocaleDateString('en-GB');
    const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let statusLabel = 'On Time';
    if (item.status === 'LATE') statusLabel = 'Late Arrival';
    if (item.status === 'FLAGGED_OUT_OF_BOUNDS') statusLabel = 'Flagged (Out of Bounds)';

    let typeLabel = item.type === 'CLOCK_IN' ? 'SHIFT CLOCK-IN' : 'SHIFT CLOCK-OUT';
    let geofenceLabel = item.isWithinGeofence === 1 ? 'Within Post Perimeter' : 'Outside Perimeter';
    let modeLabel = item.isOfflineSync === 1 ? 'Offline Synced' : 'Live Real-time';

    let reviewLabel = 'Auto-Approved';
    if (item.reviewStatus === 'APPROVED') reviewLabel = 'Supervisor Approved';
    if (item.reviewStatus === 'REJECTED') reviewLabel = 'Supervisor Rejected';
    if (item.reviewStatus === 'PENDING' && item.isWithinGeofence === 0) reviewLabel = 'Under Investigation';

    return {
      'No': index + 1,
      'Date': dateStr,
      'Time': timeStr,
      'Guard ID': item.guardId,
      'Guard Name': item.guardName,
      'Assigned Post': item.postName,
      'Action': typeLabel,
      'Distance from Post (m)': item.distanceFromCenter,
      'Geofence Status': geofenceLabel,
      'Compliance Status': statusLabel,
      'Data Mode': modeLabel,
      'Review Status': reviewLabel,
      'Supervisory Notes': item.reviewNotes || '-',
    };
  });

  const patrolData = patrolRuns.map((run, index) => {
    const startObj = new Date(run.startTime);
    const dateStr = startObj.toLocaleDateString('en-GB');
    const startStr = startObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    let durationStr = 'In Progress';

    if (run.endTime) {
      const endObj = new Date(run.endTime);
      const diffMins = Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60));
      durationStr = `${diffMins} mins`;
    }

    const pct = run.totalCheckpoints > 0 ? Math.round((run.completedCheckpoints / run.totalCheckpoints) * 100) : 0;

    return {
      'No': index + 1,
      'Date': dateStr,
      'Tour ID': run.id,
      'Guard Name': run.guardName,
      'Guard Post': run.postName,
      'Started': startStr,
      'Duration': durationStr,
      'Target Waypoints': run.totalCheckpoints,
      'Completed Waypoints': run.completedCheckpoints,
      'Tour Completion %': `${pct}%`,
      'Status': run.status,
      'Field Notes': run.notes || '-',
    };
  });

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Attendance
  const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
  wsAttendance['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // Date
    { wch: 12 }, // Time
    { wch: 14 }, // Guard ID
    { wch: 26 }, // Name
    { wch: 32 }, // Post
    { wch: 22 }, // Action
    { wch: 22 }, // Distance
    { wch: 24 }, // Geofence
    { wch: 22 }, // Compliance
    { wch: 18 }, // Data Mode
    { wch: 22 }, // Review Status
    { wch: 30 }, // Notes
  ];
  XLSX.utils.book_append_sheet(workbook, wsAttendance, 'Attendance Logs');

  // Sheet 2: Patrol Tours
  if (patrolData.length > 0) {
    const wsPatrol = XLSX.utils.json_to_sheet(patrolData);
    wsPatrol['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 16 },
      { wch: 24 },
      { wch: 30 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsPatrol, 'Patrol Tours & Waypoints');
  }

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}
