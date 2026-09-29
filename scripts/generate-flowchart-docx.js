const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  Header,
  Footer,
  PageNumber,
} = require('docx');

// Directory for generated diagram assets
const assetsDir = path.join(__dirname, 'diagram_assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// ==============================================================================
// 1. GENERATE SVG FLOWCHART 1: GUARD MOBILE APP WORKFLOW
// ==============================================================================
const svgGuardFlow = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1350" width="1000" height="1350" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <linearGradient id="gradHeader" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.12" />
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
    </marker>
  </defs>

  <!-- Title Banner -->
  <rect x="40" y="30" width="920" height="70" rx="16" fill="url(#gradHeader)" filter="url(#shadow)"/>
  <text x="500" y="62" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">CARTA ALIR ALIRAN KERJA APLIKASI PENGAWAL (GUARD MOBILE APP)</text>
  <text x="500" y="85" fill="#bae6fd" font-size="12" text-anchor="middle">Sistem Pengesahan Lokasi, GPS Geofencing, Swafoto Ber-Watermark &amp; Mod Luar Talian (SGVS)</text>

  <!-- 1. MULA -->
  <rect x="400" y="130" width="200" height="48" rx="24" fill="#334155" filter="url(#shadow)"/>
  <text x="500" y="160" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">MULA: Buka Aplikasi</text>

  <!-- Line to 2 -->
  <line x1="500" y1="178" x2="500" y2="210" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- 2. LOGIN PIN -->
  <rect x="360" y="210" width="280" height="65" rx="14" fill="#f8fafc" stroke="#0284c7" stroke-width="2" filter="url(#shadow)"/>
  <text x="500" y="236" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">1. Log Masuk ID &amp; 4-Digit PIN</text>
  <text x="500" y="258" fill="#64748b" font-size="11" text-anchor="middle">Pengesahan sesi pengawal &amp; jadual syif</text>

  <!-- Line to 3 -->
  <line x1="500" y1="275" x2="500" y2="310" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- 3. GEOFENCE RADAR -->
  <rect x="340" y="310" width="320" height="65" rx="14" fill="#f8fafc" stroke="#0284c7" stroke-width="2" filter="url(#shadow)"/>
  <text x="500" y="336" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">2. Imbas Koordinat GPS &amp; Mock Check</text>
  <text x="500" y="358" fill="#64748b" font-size="11" text-anchor="middle">Kira jarak Haversine ke pusat pos kawalan</text>

  <!-- Line to Diamond Decision -->
  <line x1="500" y1="375" x2="500" y2="415" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- 4. DECISION: DALAM GEOFENCE? -->
  <polygon points="500,415 650,475 500,535 350,475" fill="#f1f5f9" stroke="#0284c7" stroke-width="2" filter="url(#shadow)"/>
  <text x="500" y="470" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">Adakah Berada Dalam</text>
  <text x="500" y="488" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle">Radius Pos? (20m - 50m)</text>

  <!-- Branch YES (Left) -->
  <line x1="350" y1="475" x2="220" y2="475" stroke="#10b981" stroke-width="2.5"/>
  <line x1="220" y1="475" x2="220" y2="570" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow)"/>
  <rect x="250" y="455" width="60" height="22" rx="4" fill="#dcfce7"/>
  <text x="280" y="470" fill="#15803d" font-size="11" font-weight="bold" text-anchor="middle">YA (Sah)</text>

  <!-- Box Green Status -->
  <rect x="100" y="570" width="240" height="60" rx="12" fill="#ecfdf5" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
  <text x="220" y="596" fill="#065f46" font-size="12" font-weight="bold" text-anchor="middle">[✓] DALAM KAWASAN POS</text>
  <text x="220" y="616" fill="#047857" font-size="10" text-anchor="middle">Lencana hijau aktif, butang bersedia</text>

  <!-- Branch NO / FLAGGED (Right) -->
  <line x1="650" y1="475" x2="780" y2="475" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="780" y1="475" x2="780" y2="570" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow)"/>
  <rect x="680" y="455" width="70" height="22" rx="4" fill="#fee2e2"/>
  <text x="715" y="470" fill="#b91c1c" font-size="11" font-weight="bold" text-anchor="middle">TIDAK (Luar)</text>

  <!-- Box Red/Amber Status -->
  <rect x="660" y="570" width="240" height="60" rx="12" fill="#fff1f2" stroke="#ef4444" stroke-width="2" filter="url(#shadow)"/>
  <text x="780" y="596" fill="#9f1239" font-size="12" font-weight="bold" text-anchor="middle">[!] DI LUAR POS (FLAGGED)</text>
  <text x="780" y="616" fill="#be123c" font-size="10" text-anchor="middle">Jarak deviasi direkodkan untuk siasatan</text>

  <!-- Convergence to Action Button -->
  <line x1="220" y1="630" x2="220" y2="675" stroke="#475569" stroke-width="2"/>
  <line x1="220" y1="675" x2="400" y2="675" stroke="#475569" stroke-width="2"/>
  <line x1="780" y1="630" x2="780" y2="675" stroke="#475569" stroke-width="2"/>
  <line x1="780" y1="675" x2="600" y2="675" stroke="#475569" stroke-width="2"/>
  <line x1="500" y1="675" x2="500" y2="705" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- 5. TEKAN BUTANG TINDAKAN -->
  <rect x="350" y="705" width="300" height="65" rx="14" fill="#f8fafc" stroke="#0284c7" stroke-width="2" filter="url(#shadow)"/>
  <text x="500" y="731" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">3. Tekan Butang Tindakan Gergasi</text>
  <text x="500" y="753" fill="#64748b" font-size="11" text-anchor="middle">"MASUK BERTUGAS" / "KELUAR BERTUGAS"</text>

  <!-- Line to Camera Capture -->
  <line x1="500" y1="770" x2="500" y2="805" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- 6. LIVE SELFIE & WATERMARK -->
  <rect x="310" y="805" width="380" height="75" rx="14" fill="#f8fafc" stroke="#0284c7" stroke-width="2" filter="url(#shadow)"/>
  <text x="500" y="830" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">4. Pengesahan Swafoto Langsung (Live Camera)</text>
  <text x="500" y="850" fill="#64748b" font-size="11" text-anchor="middle">• Panduan bulatan muka (sekat muat naik galeri)</text>
  <text x="500" y="868" fill="#64748b" font-size="11" text-anchor="middle">• Cetak tera air (GPS, cap masa NTP, ID) &amp; mampat &lt;120KB</text>

  <!-- Line to Online Check Decision -->
  <line x1="500" y1="880" x2="500" y2="920" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- 7. DECISION: INTERNET ONLINE? -->
  <polygon points="500,920 650,975 500,1030 350,975" fill="#f1f5f9" stroke="#0284c7" stroke-width="2" filter="url(#shadow)"/>
  <text x="500" y="970" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">Adakah Talian Internet</text>
  <text x="500" y="988" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle">Tersedia? (Online)</text>

  <!-- Branch ONLINE (Left) -->
  <line x1="350" y1="975" x2="220" y2="975" stroke="#10b981" stroke-width="2.5"/>
  <line x1="220" y1="975" x2="220" y2="1060" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow)"/>
  <rect x="250" y="955" width="60" height="22" rx="4" fill="#dcfce7"/>
  <text x="280" y="970" fill="#15803d" font-size="11" font-weight="bold" text-anchor="middle">ONLINE</text>

  <!-- Box Realtime Server Transmit -->
  <rect x="80" y="1060" width="280" height="75" rx="12" fill="#ecfdf5" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
  <text x="220" y="1086" fill="#065f46" font-size="12" font-weight="bold" text-anchor="middle">Hantar Terus ke Pelayan Cloud</text>
  <text x="220" y="1106" fill="#047857" font-size="10" text-anchor="middle">• Rekod ke DB Supabase / PostgreSQL</text>
  <text x="220" y="1122" fill="#047857" font-size="10" text-anchor="middle">• Picu notifikasi Telegram jika Flagged/Lewat</text>

  <!-- Branch OFFLINE (Right) -->
  <line x1="650" y1="975" x2="780" y2="975" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="780" y1="975" x2="780" y2="1060" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow)"/>
  <rect x="680" y="955" width="70" height="22" rx="4" fill="#fef3c7"/>
  <text x="715" y="970" fill="#b45309" font-size="11" font-weight="bold" text-anchor="middle">OFFLINE</text>

  <!-- Box Offline Queue -->
  <rect x="640" y="1060" width="280" height="75" rx="12" fill="#fffbeb" stroke="#f59e0b" stroke-width="2" filter="url(#shadow)"/>
  <text x="780" y="1086" fill="#92400e" font-size="12" font-weight="bold" text-anchor="middle">Simpan Tempatan (Offline-First)</text>
  <text x="780" y="1106" fill="#b45309" font-size="10" text-anchor="middle">• Simpan ke SQLite/IndexedDB telefon</text>
  <text x="780" y="1122" fill="#b45309" font-size="10" text-anchor="middle">• Auto-Sync sebaik talian internet pulih</text>

  <!-- Convergence to Final Status -->
  <line x1="220" y1="1135" x2="220" y2="1185" stroke="#475569" stroke-width="2"/>
  <line x1="220" y1="1185" x2="400" y2="1185" stroke="#475569" stroke-width="2"/>
  <line x1="780" y1="1135" x2="780" y2="1185" stroke="#475569" stroke-width="2"/>
  <line x1="780" y1="1185" x2="600" y2="1185" stroke="#475569" stroke-width="2"/>
  <line x1="500" y1="1185" x2="500" y2="1215" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- 8. TAMAT: PAPAR STATUS -->
  <rect x="360" y="1215" width="280" height="55" rx="14" fill="#1e293b" filter="url(#shadow)"/>
  <text x="500" y="1240" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">TAMAT: Papar Ringkasan Status</text>
  <text x="500" y="1258" fill="#94a3b8" font-size="11" text-anchor="middle">Masa direkodkan &amp; status syif dikemaskini</text>
</svg>
`;

// ==============================================================================
// 2. GENERATE SVG FLOWCHART 2: WEB ADMIN & OPERATIONS DASHBOARD
// ==============================================================================
const svgAdminFlow = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1350" width="1000" height="1350" style="background:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">
  <defs>
    <linearGradient id="gradHeaderAdmin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <filter id="shadowAdmin" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.12" />
    </filter>
    <marker id="arrowAdmin" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
    </marker>
  </defs>

  <!-- Title Banner -->
  <rect x="40" y="30" width="920" height="70" rx="16" fill="url(#gradHeaderAdmin)" filter="url(#shadowAdmin)"/>
  <text x="500" y="62" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">CARTA ALIR PUSAT KAWALAN PENTADBIR &amp; HR (ADMIN DASHBOARD)</text>
  <text x="500" y="85" fill="#a7f3d0" font-size="12" text-anchor="middle">Pemantauan Masa Nyata, Visual Geofence Configurator, Siasatan Flagged &amp; Laporan Excel</text>

  <!-- 1. MULA ADMIN -->
  <rect x="400" y="130" width="200" height="48" rx="24" fill="#334155" filter="url(#shadowAdmin)"/>
  <text x="500" y="160" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">MULA: Buka Portal Web</text>

  <!-- Line to 2 -->
  <line x1="500" y1="178" x2="500" y2="210" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- 2. LIVE COMMAND CENTER -->
  <rect x="330" y="210" width="340" height="70" rx="14" fill="#f8fafc" stroke="#059669" stroke-width="2" filter="url(#shadowAdmin)"/>
  <text x="500" y="236" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">1. Papan Pemuka Operasi (Live Command Center)</text>
  <text x="500" y="256" fill="#64748b" font-size="11" text-anchor="middle">• Kad KPI: Pengawal Aktif, Kadar Tepat Masa, Flagged</text>
  <text x="500" y="272" fill="#64748b" font-size="11" text-anchor="middle">• Peta Interaktif Leaflet: Status Zon Bulatan Pos</text>

  <!-- Line to Menu Dispatcher -->
  <line x1="500" y1="280" x2="500" y2="330" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- Horizontal Hub for 3 Major Modules -->
  <line x1="180" y1="330" x2="820" y2="330" stroke="#475569" stroke-width="2.5"/>
  <line x1="180" y1="330" x2="180" y2="370" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>
  <line x1="500" y1="330" x2="500" y2="370" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>
  <line x1="820" y1="330" x2="820" y2="370" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- MODULE A: GEOFENCE CONFIGURATOR (Left) -->
  <rect x="50" y="370" width="260" height="85" rx="12" fill="#f0fdf4" stroke="#059669" stroke-width="1.5" filter="url(#shadowAdmin)"/>
  <text x="180" y="396" fill="#065f46" font-size="12" font-weight="bold" text-anchor="middle">Modul Pos &amp; Geofence</text>
  <text x="180" y="416" fill="#047857" font-size="10" text-anchor="middle">• Klik peta untuk tambah pos baharu</text>
  <text x="180" y="432" fill="#047857" font-size="10" text-anchor="middle">• Pelaras slider radius (10m - 100m)</text>
  <text x="180" y="448" fill="#047857" font-size="10" text-anchor="middle">• Kemaskini geofence serta-merta</text>

  <!-- MODULE B: FLAGGED INVESTIGATION (Middle) -->
  <rect x="370" y="370" width="260" height="85" rx="12" fill="#fff1f2" stroke="#e11d48" stroke-width="1.5" filter="url(#shadowAdmin)"/>
  <text x="500" y="396" fill="#9f1239" font-size="12" font-weight="bold" text-anchor="middle">Pusat Siasatan "Flagged"</text>
  <text x="500" y="416" fill="#be123c" font-size="10" text-anchor="middle">• Tapis log cubaan luar perimeter</text>
  <text x="500" y="432" fill="#be123c" font-size="10" text-anchor="middle">• Semak swafoto &amp; jarak deviasi</text>
  <text x="500" y="448" fill="#be123c" font-size="10" text-anchor="middle">• Siasatan cubaan Mock GPS</text>

  <!-- MODULE C: REPORTS & EXCEL (Right) -->
  <rect x="690" y="370" width="260" height="85" rx="12" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" filter="url(#shadowAdmin)"/>
  <text x="820" y="396" fill="#0369a1" font-size="12" font-weight="bold" text-anchor="middle">Laporan &amp; Eksport Excel</text>
  <text x="820" y="416" fill="#0284c7" font-size="10" text-anchor="middle">• Tapis julat tarikh &amp; syif</text>
  <text x="820" y="432" fill="#0284c7" font-size="10" text-anchor="middle">• Jana helaian fail .xlsx 1-klik</text>
  <text x="820" y="448" fill="#0284c7" font-size="10" text-anchor="middle">• Kiraan OT / pemotongan elaun</text>

  <!-- Detailed Flow: Flagged Audit Review -->
  <line x1="500" y1="455" x2="500" y2="520" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- Decision Diamond: Keputusan Penyelia -->
  <polygon points="500,520 660,580 500,640 340,580" fill="#f8fafc" stroke="#e11d48" stroke-width="2" filter="url(#shadowAdmin)"/>
  <text x="500" y="575" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">Semakan Penyelia Terhadap</text>
  <text x="500" y="593" fill="#e11d48" font-size="12" font-weight="bold" text-anchor="middle">Insiden Flagged?</text>

  <!-- Action: APPROVE (Left) -->
  <line x1="340" y1="580" x2="220" y2="580" stroke="#10b981" stroke-width="2.5"/>
  <line x1="220" y1="580" x2="220" y2="680" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>
  <rect x="245" y="560" width="75" height="22" rx="4" fill="#dcfce7"/>
  <text x="282" y="575" fill="#15803d" font-size="11" font-weight="bold" text-anchor="middle">LULUSKAN</text>

  <rect x="90" y="680" width="260" height="70" rx="12" fill="#ecfdf5" stroke="#10b981" stroke-width="2" filter="url(#shadowAdmin)"/>
  <text x="220" y="706" fill="#065f46" font-size="12" font-weight="bold" text-anchor="middle">Status Ditetapkan: APPROVED</text>
  <text x="220" y="726" fill="#047857" font-size="10" text-anchor="middle">• Catat justifikasi (cth: rondaan luar blok)</text>
  <text x="220" y="742" fill="#047857" font-size="10" text-anchor="middle">• Kehadiran dikira sah dalam rekod gaji</text>

  <!-- Action: REJECT (Right) -->
  <line x1="660" y1="580" x2="780" y2="580" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="780" y1="580" x2="780" y2="680" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>
  <rect x="685" y="560" width="70" height="22" rx="4" fill="#fee2e2"/>
  <text x="720" y="575" fill="#b91c1c" font-size="11" font-weight="bold" text-anchor="middle">TOLAK</text>

  <rect x="650" y="680" width="260" height="70" rx="12" fill="#fff1f2" stroke="#ef4444" stroke-width="2" filter="url(#shadowAdmin)"/>
  <text x="780" y="706" fill="#9f1239" font-size="12" font-weight="bold" text-anchor="middle">Status Ditetapkan: REJECTED</text>
  <text x="780" y="726" fill="#be123c" font-size="10" text-anchor="middle">• Catat sebab (cth: tiada di pos tugas)</text>
  <text x="780" y="742" fill="#be123c" font-size="10" text-anchor="middle">• Rekod ditandakan tidak hadir / potong elaun</text>

  <!-- Reconvergence to HR / DB -->
  <line x1="220" y1="750" x2="220" y2="800" stroke="#475569" stroke-width="2"/>
  <line x1="220" y1="800" x2="400" y2="800" stroke="#475569" stroke-width="2"/>
  <line x1="780" y1="750" x2="780" y2="800" stroke="#475569" stroke-width="2"/>
  <line x1="780" y1="800" x2="600" y2="800" stroke="#475569" stroke-width="2"/>
  <line x1="500" y1="800" x2="500" y2="835" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- DATABASE RECONCILIATION -->
  <rect x="330" y="835" width="340" height="65" rx="14" fill="#f8fafc" stroke="#334155" stroke-width="2" filter="url(#shadowAdmin)"/>
  <text x="500" y="860" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">Kemaskini Pangkalan Data Awan (Supabase)</text>
  <text x="500" y="882" fill="#64748b" font-size="11" text-anchor="middle">Log audit masa nyata, nama penyelia &amp; cap masa semakan</text>

  <!-- Line to Alert Engine -->
  <line x1="500" y1="900" x2="500" y2="945" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- TELEGRAM ALERT ENGINE -->
  <rect x="300" y="945" width="400" height="80" rx="14" fill="#f8fafc" stroke="#0284c7" stroke-width="2" filter="url(#shadowAdmin)"/>
  <text x="500" y="972" fill="#0f172a" font-size="13" font-weight="bold" text-anchor="middle">Enjin Notifikasi Automatik (Telegram Bot API)</text>
  <text x="500" y="994" fill="#64748b" font-size="11" text-anchor="middle">• Hantar amaran insiden serta-merta ke telefon pintar penyelia</text>
  <text x="500" y="1012" fill="#64748b" font-size="11" text-anchor="middle">• Notifikasi kelewatan syif melebihi 15 minit (Grace Period)</text>

  <!-- Line to Final Export -->
  <line x1="500" y1="1025" x2="500" y2="1070" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- EXCEL EXPORT & PAYROLL -->
  <rect x="320" y="1070" width="360" height="70" rx="14" fill="#ecfdf5" stroke="#059669" stroke-width="2" filter="url(#shadowAdmin)"/>
  <text x="500" y="1096" fill="#065f46" font-size="13" font-weight="bold" text-anchor="middle">Penjanaan Laporan Bulanan Microsoft Excel</text>
  <text x="500" y="1118" fill="#047857" font-size="11" text-anchor="middle">Fail .xlsx sedia diagihkan ke Bahagian HR &amp; Sistem Pengurusan Gaji</text>

  <!-- Line to End -->
  <line x1="500" y1="1140" x2="500" y2="1190" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowAdmin)"/>

  <!-- END ADMIN -->
  <rect x="380" y="1190" width="240" height="50" rx="14" fill="#1e293b" filter="url(#shadowAdmin)"/>
  <text x="500" y="1221" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">SELESAI: Audit &amp; Operasi Ditutup</text>
</svg>
`;

async function generateDocx() {
  console.log('Rendering SVG flowcharts to high-resolution PNGs...');

  const guardPngPath = path.join(assetsDir, 'guard_flowchart.png');
  const adminPngPath = path.join(assetsDir, 'admin_flowchart.png');

  // Convert SVGs to PNG with 2x scale for ultra crispness in Word document
  await sharp(Buffer.from(svgGuardFlow)).png({ quality: 95 }).toFile(guardPngPath);
  await sharp(Buffer.from(svgAdminFlow)).png({ quality: 95 }).toFile(adminPngPath);

  const guardPngBuffer = fs.readFileSync(guardPngPath);
  const adminPngBuffer = fs.readFileSync(adminPngPath);

  console.log('Building Word document with docx...');

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SGVS • DOKUMEN SPESIFIKASI CARTA ALIR SISTEM',
                    size: 18,
                    color: '64748B',
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Smart Guard Verification System — Mukasurat ',
                    size: 18,
                    color: '94A3B8',
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    bold: true,
                    color: '0284C7',
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    text: ' daripada ',
                    size: 18,
                    color: '94A3B8',
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: '94A3B8',
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ----------------------------------------------------
          // COVER / HEADER SECTION
          // ----------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'SMART GUARD LOCATION VERIFICATION SYSTEM',
                size: 32,
                bold: true,
                color: '0284C7',
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'DOKUMEN CARTA ALIR & SPESIFIKASI ALIRAN KERJA SISTEM (V1.0)',
                size: 24,
                bold: true,
                color: '0F172A',
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'Merangkumi Aliran Kerja Aplikasi Mudah Alih Pengawal (Mobile App) dan Pusat Kawalan Pentadbir & HR (Admin Dashboard)',
                size: 20,
                italics: true,
                color: '64748B',
                font: 'Segoe UI',
              }),
            ],
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Nama Projek', bold: true, size: 20 })] })],
                    shading: { fill: 'F1F5F9' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Smart Guard Verification System (SGVS)', size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Teknologi Teras', bold: true, size: 20 })] })],
                    shading: { fill: 'F1F5F9' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Next.js 16, Flutter Android APK, Supabase PostgreSQL, Leaflet OSM, Telegram API', size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Status Pelaksanaan', bold: true, size: 20 })] })],
                    shading: { fill: 'F1F5F9' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Sedia Digunakan (Production & Live Web Ready)', size: 20, color: '059669', bold: true })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // ----------------------------------------------------
          // BAHAGIAN 1: CARTA ALIR APLIKASI PENGAWAL
          // ----------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
            children: [
              new TextRun({
                text: '1. Carta Alir Aplikasi Mudah Alih Pengawal (Guard Mobile App)',
                size: 26,
                bold: true,
                color: '0284C7',
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Aplikasi mudah alih pengawal direka khusus berasaskan konsep ',
                size: 20,
              }),
              new TextRun({
                text: '"Zero Friction, High Visibility"',
                bold: true,
                size: 20,
              }),
              new TextRun({
                text: ' bagi memudahkan abang-abang pengawal pelbagai peringkat umur merekodkan kehadiran di pos kawalan secara tepat dan telus.',
                size: 20,
              }),
            ],
          }),

          // Diagram Image: Guard Flowchart
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 250 },
            children: [
              new ImageRun({
                data: guardPngBuffer,
                transformation: {
                  width: 580,
                  height: 780,
                },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Rajah 1.1: Carta Alir Lengkap Aliran Transaksi Kehadiran Pengawal Keselamatan',
                italics: true,
                size: 18,
                color: '64748B',
              }),
            ],
          }),

          // Table: Step-by-step Guard Flow Logic
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: 'Jadual Perincian Logik Langkah Aplikasi Pengawal',
                size: 22,
                bold: true,
                color: '0F172A',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Langkah', bold: true, size: 18 })] })], shading: { fill: '0284C7' } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama Proses', bold: true, size: 18, color: 'FFFFFF' })] })], shading: { fill: '0284C7' } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Penerangan & Mekanisme Teknikal', bold: true, size: 18, color: 'FFFFFF' })] })], shading: { fill: '0284C7' } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kawalan Integriti', bold: true, size: 18, color: 'FFFFFF' })] })], shading: { fill: '0284C7' } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '1', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Log Masuk PIN', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pengawal memasukkan ID Staf (cth: SG-101) dan 4-Digit PIN. Fungsi "Ingat Saya" membolehkan peranti mengekalkan sesi bertugas tanpa perlu taip semula setiap hari.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sesi disimpan selamat dalam localStorage/SQLite peranti.', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '2', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Semakan GPS Geofence', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sistem membaca koordinat GPS masa nyata peranti dan mengira jarak tepat ke pusat pos menggunakan formula Haversine. Memaparkan lencana Hijau jika dalam radius (20m-50m) atau Merah jika di luar.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pengesanan Mock Location automatik bagi menyekat Fake GPS.', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '3', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Swafoto Langsung (Selfie)', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kamera hadapan dibuka secara langsung dengan panduan bulatan muka. Pilihan muat naik daripada galeri gambar disekat 100%.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Menghapuskan amalan "Buddy Punching" (kehadiran berwakil).', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '4', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tera Air & Mampatan', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Imej swafoto dicetak secara forensik dengan koordinat GPS, jarak pos, nama pengawal, dan cap masa tepat sebelum dimampatkan kepada saiz 80KB-120KB.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Cap masa NTP menghalang manipulasi jam dalaman peranti.', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '5', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mod Luar Talian (Offline)', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sekiranya talian internet terputus di pos bawah tanah atau zon terlindung, rekod disimpan dalam storan telefon dan disegerakkan automatik sebaik internet pulih.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Menjamin kelancaran operasi di zon "Dead Spots".', size: 18 })] })] }),
                ],
              }),
            ],
          }),

          // ----------------------------------------------------
          // BAHAGIAN 2: CARTA ALIR PUSAT KAWALAN PENTADBIR & HR
          // ----------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 150 },
            children: [
              new TextRun({
                text: '2. Carta Alir Pusat Kawalan Pentadbir & HR (Admin Dashboard)',
                size: 26,
                bold: true,
                color: '059669',
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Portal Pentadbir menyediakan ketelusan operasi secara berpusat kepada pihak pengurusan keselamatan, penyelia operasi, dan pegawai HR untuk memantau pos, menyiasat ketidakpatuhan perimeter, dan menjana laporan gaji.',
                size: 20,
              }),
            ],
          }),

          // Diagram Image: Admin Flowchart
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 250 },
            children: [
              new ImageRun({
                data: adminPngBuffer,
                transformation: {
                  width: 580,
                  height: 780,
                },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Rajah 2.1: Carta Alir Pusat Kawalan Operasi Pentadbir, Siasatan Flagged & Integrasi HR',
                italics: true,
                size: 18,
                color: '64748B',
              }),
            ],
          }),

          // Table: Admin Core Modules Logic
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: 'Jadual Perincian Modul Pusat Kawalan Pentadbir',
                size: 22,
                bold: true,
                color: '0F172A',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Modul', bold: true, size: 18, color: 'FFFFFF' })] })], shading: { fill: '059669' } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fungsi Utama', bold: true, size: 18, color: 'FFFFFF' })] })], shading: { fill: '059669' } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tindakan Pengguna', bold: true, size: 18, color: 'FFFFFF' })] })], shading: { fill: '059669' } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hasil / Output Sistem', bold: true, size: 18, color: 'FFFFFF' })] })], shading: { fill: '059669' } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Live Command Center', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pengawasan langsung status pos kawalan di atas peta interaktif Leaflet OpenStreetMap.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Memantau indikator pos (Hijau: Ada pengawal, Biru: Tiada pengawal).', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kad KPI: Bilangan pengawal aktif, kadar tepat masa %, bilangan flagged.', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Visual Geofence Configurator', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Penetapan dan pelarasan had jejari bulatan pos kawalan secara visual di atas peta.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Klik pada peta untuk tetapkan lat/lng dan laraskan slider radius (10m - 100m).', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Perubahan perimeter disimpan serta-merta ke database awan.', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pusat Siasatan "Flagged"', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Siasatan audit forensik bagi cubaan log luar sempadan atau peranti mock GPS.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Penyelia klik butang "Luluskan" atau "Tolak" berserta nota justifikasi.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status dikemaskini kepada APPROVED / REJECTED bagi rekod audit.', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Laporan Microsoft Excel', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Penjanaan fail helaian kehadiran untuk pengiraan gaji, elaun syif, dan cuti.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pilih julat tarikh syif dan klik butang muat turun Excel (.xlsx).', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fail .xlsx rasmi mengandungi pecahan waktu masuk, keluar, status & jarak.', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Enjin Amaran Telegram', bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pemberitahuan amaran automatik ke telefon penyelia tanpa sebarang caj (100% Percuma).', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Masukkan Telegram Bot Token & Chat ID di menu tetapan.', size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Amaran segera jika berlaku pelanggaran perimeter atau lewat syif >15 minit.', size: 18 })] })] }),
                ],
              }),
            ],
          }),

          // ----------------------------------------------------
          // BAHAGIAN 3: RINGKASAN KELEBIHAN PERNIAGAAN
          // ----------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 150 },
            children: [
              new TextRun({
                text: '3. Ringkasan Impak Operasi & Nilai Perniagaan (Business ROI)',
                size: 26,
                bold: true,
                color: '0F172A',
                font: 'Segoe UI',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: '• Sifar Manipulasi Lokasi: ',
                bold: true,
                size: 20,
                color: '0284C7',
              }),
              new TextRun({
                text: 'Menggantikan kad QR statik yang mudah disalin dengan gabungan geofencing GPS berketepatan tinggi dan swafoto masa nyata.',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: '• Penjimatan Masa HR Sehingga 80%: ',
                bold: true,
                size: 20,
                color: '059669',
              }),
              new TextRun({
                text: 'Pegawai pengurusan tidak lagi perlu menyalin buku log fizikal secara manual. Laporan Excel dijana secara automatik dengan 1-klik.',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: '• Ketelusan Penuh Pelanggan / JMB: ',
                bold: true,
                size: 20,
                color: 'D97706',
              }),
              new TextRun({
                text: 'Bukti kehadiran yang disahkan dengan foto bertera air masa dan koordinat membina keyakinan tinggi pihak klien keselamatan.',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: '• Kos Operasi Minimum: ',
                bold: true,
                size: 20,
                color: '7C3AED',
              }),
              new TextRun({
                text: 'Pengehosan pelayan percuma di Vercel, pangkalan data awan percuma di Supabase, dan bot notifikasi percuma di Telegram mengurangkan kos bulanan sehingga hampir sifar.',
                size: 20,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const docxOutputPath = path.join(__dirname, '..', 'Carta_Alir_Sistem_Pengawal_Keselamatan_SGVS.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxOutputPath, buffer);
  console.log(`Document successfully generated at: ${docxOutputPath}`);
}

generateDocx().catch((err) => {
  console.error('Error generating document:', err);
  process.exit(1);
});
