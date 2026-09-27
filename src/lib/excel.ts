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

export function generateAttendanceExcel(items: AttendanceExportItem[]): Buffer {
  const data = items.map((item, index) => {
    const dateObj = new Date(item.timestamp);
    const dateStr = dateObj.toLocaleDateString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' });
    const timeStr = dateObj.toLocaleTimeString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let statusLabel = 'Tepat Masa';
    if (item.status === 'LATE') statusLabel = 'Lewat';
    if (item.status === 'FLAGGED_OUT_OF_BOUNDS') statusLabel = 'Luar Sempadan (Flagged)';

    let typeLabel = item.type === 'CLOCK_IN' ? 'MASUK SYIF (CLOCK-IN)' : 'KELUAR SYIF (CLOCK-OUT)';
    let geofenceLabel = item.isWithinGeofence === 1 ? 'Dalam Radius Pos' : 'Luar Radius Pos';
    let modeLabel = item.isOfflineSync === 1 ? 'Luar Talian (Offline Sync)' : 'Dalam Talian (Real-time)';

    let reviewLabel = 'Selesai';
    if (item.reviewStatus === 'APPROVED') reviewLabel = 'Diluluskan Penyelia';
    if (item.reviewStatus === 'REJECTED') reviewLabel = 'Ditolak Penyelia';
    if (item.reviewStatus === 'PENDING' && item.isWithinGeofence === 0) reviewLabel = 'Menunggu Semakan';

    return {
      'Bil': index + 1,
      'Tarikh': dateStr,
      'Masa': timeStr,
      'ID Pengawal': item.guardId,
      'Nama Pengawal': item.guardName,
      'Pos Kawalan': item.postName,
      'Tindakan': typeLabel,
      'Jarak dari Pos (m)': item.distanceFromCenter,
      'Status Geofence': geofenceLabel,
      'Status Kehadiran': statusLabel,
      'Mod Transaksi': modeLabel,
      'Status Semakan': reviewLabel,
      'Catatan Penyelia': item.reviewNotes || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // Bil
    { wch: 12 }, // Tarikh
    { wch: 12 }, // Masa
    { wch: 14 }, // ID Pengawal
    { wch: 28 }, // Nama
    { wch: 30 }, // Pos
    { wch: 24 }, // Tindakan
    { wch: 18 }, // Jarak
    { wch: 20 }, // Status Geofence
    { wch: 22 }, // Status Kehadiran
    { wch: 24 }, // Mod Transaksi
    { wch: 22 }, // Status Semakan
    { wch: 30 }, // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekod Kehadiran Pengawal');

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}
