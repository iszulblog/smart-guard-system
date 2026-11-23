'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Compass,
  MapPin,
  Camera,
  CheckSquare,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Settings,
  Smartphone,
  QrCode,
  Radio,
  FileText,
  Search,
  ExternalLink,
  Lock,
  Layers,
  ChevronRight,
  Download,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  category: 'guard' | 'admin' | 'security' | 'deployment';
  categoryLabel: string;
  route: string;
  badge: string;
  badgeColor: string;
  summary: string;
  whatItDoes: string[];
  howToUse: string[];
  integrityPoints: string[];
}

export default function SystemGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'guard' | 'admin' | 'security' | 'deployment'>('all');
  const [selectedFeature, setSelectedFeature] = useState<string>('patrol_radar');

  const features: FeatureItem[] = [
    // GUARD FEATURES
    {
      id: 'guard_login',
      title: '1. Guard Authentication & Shift Login',
      category: 'guard',
      categoryLabel: 'Guard Mobile',
      route: '/guard/login',
      badge: 'Field Essential',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      summary: 'Secure guard authentication portal using unique Guard ID and 4-digit security PIN.',
      whatItDoes: [
        'Mengesahkan identiti pengawal bertugas sebelum sebarang data direkodkan.',
        'Mencegah akses tanpa kebenaran dengan sekatan PIN peribadi.',
        'Menyediakan fungsi simpanan sesi setempat (Remember Session) untuk akses pantas.',
        'Memaparkan nama pengawal dan pos kawalan aktif yang ditugaskan.'
      ],
      howToUse: [
        'Buka pautan https://smart-guard-system.vercel.app/guard/login di telefon pintar.',
        'Masukkan Guard ID rasmi (contoh: G-001, G-002, G-003).',
        'Masukkan PIN 4-digit yang telah didaftarkan oleh pentadbir.',
        'Tekan "Sign In to Guard Portal" untuk membuka papan kawalan syif.'
      ],
      integrityPoints: [
        'Tiada butang autofill atau bypass olok-olok — setiap percubaan disahkan dengan pangkalan data.',
        'Sesi diikat dengan ID pengawal untuk jejak audit (audit trail) bagi setiap aktiviti.'
      ]
    },
    {
      id: 'geofence_clockin',
      title: '2. GPS Geofence Shift Clock-In & Forensic Selfie',
      category: 'guard',
      categoryLabel: 'Guard Mobile',
      route: '/guard/checkin',
      badge: 'Zero-Proxy Attendance',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      summary: 'High-precision GPS geofencing attendance clock-in with live front camera selfie.',
      whatItDoes: [
        'Menentukan jarak masa nyata pengawal dari pos kawalan menggunakan formula Haversine.',
        'Memaparkan radar status: Hijau (Dalam Pos < 30m) atau Merah (Di Luar Pos).',
        'Mengaktifkan kamera hadapan telefon untuk mengambil gambar swafoto bertugas.',
        'Mengekodkan tera air keselamatan (watermark) terus pada gambar sebelum disimpan.'
      ],
      howToUse: [
        'Di skrin utama pengawal, pastikan lokasi GPS telefon dihidupkan.',
        'Perhatikan meter jarak (contoh: "12m from Main Gate - IN RANGE").',
        'Tekan butang besar "Clock In Duty".',
        'Hadapkan muka ke kamera dan tekan "Snap Selfie". Sistem akan mengesahkan kehadiran serta-merta.'
      ],
      integrityPoints: [
        'Menghalang penipuan kehadiran kawan (buddy punching / proxy clock-in).',
        'Jika pengawal berada di luar radius pos, transaksi automatik ditandakan sebagai FLAGGED untuk audit penyelia.'
      ]
    },
    {
      id: 'patrol_radar',
      title: '3. Real-Time Patrol Radar & Waypoint Stepper',
      category: 'guard',
      categoryLabel: 'Guard Mobile',
      route: '/guard/patrol',
      badge: 'Core V2 Innovation',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      summary: 'Live GPS distance tracking to next checkpoint with sequential waypoint progression.',
      whatItDoes: [
        'Memaparkan laluan rondaan berurutan (contoh: Checkpoint 1 -> Checkpoint 2 -> Checkpoint 3).',
        'Mengira jarak masa nyata pengawal ke checkpoint aktif dalam unit meter.',
        'Menyediakan meter radar sasaran: Terkunci (Kelabu/Jauh) -> Menghampiri (Kuning) -> Dalam Jarak (Hijau < 25m).',
        'Mengira peratusan kemajuan rondaan (Patrol Progress Bar) dan purata masa sepusingan.'
      ],
      howToUse: [
        'Tekan butang "Start Patrol Tour" di skrin pengawal.',
        'Pilih laluan pos dan mulakan berjalan ke Checkpoint #1 mengikut petunjuk radar.',
        'Apabila jarak mencapai kurang daripada 25 meter, butang verifikasi akan bertukar hijau cerah dan aktif.',
        'Sahkan checkpoint untuk mara secara automatik ke Checkpoint seterusnya.'
      ],
      integrityPoints: [
        'Pengawal tidak boleh melangkau (skip) checkpoint tanpa kebenaran.',
        'Butang verifikasi terkunci secara automatik jika jarak melebihi had radius yang ditetapkan oleh admin.'
      ]
    },
    {
      id: 'task_checklist',
      title: '4. Dynamic Waypoint Task Checklist & SOP Compliance',
      category: 'guard',
      categoryLabel: 'Guard Mobile',
      route: '/guard/patrol',
      badge: 'SOP Enforcement',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      summary: 'Custom operational checklists configured by admin that guards must verify at each stop.',
      whatItDoes: [
        'Memaparkan senarai tugasan unik bagi setiap checkpoint (contoh: periksa kunci, paip, lampu kecemasan).',
        'Mewajibkan pengawal menyemak dan menanda setiap item sebelum verifikasi diterima.',
        'Menyimpan rekod pematuhan setiap item senarai semak untuk audit keselamatan bangunan.',
        'Mengelakkan rondaan sambil lewa (touch-and-go tanpa memeriksa keadaan fizikal).'
      ],
      howToUse: [
        'Sebaik tiba di checkpoint, semak senarai tugas yang terpapar pada skrin.',
        'Lakukan pemeriksaan fizikal di tapak (contoh: uji tombol pintu, periksa tolok pemadam api).',
        'Tandakan setiap kotak semak (checkbox) yang telah disempurnakan.',
        'Sistem akan mengira bilangan tugasan yang selesai (contoh: "3 of 3 Tasks Done").'
      ],
      integrityPoints: [
        'Rekod tugasan yang ditanda disimpan bersama cap masa milisaat untuk membuktikan pemeriksaan dilakukan di lokasi.'
      ]
    },
    {
      id: 'watermarked_proof',
      title: '5. Tamper-Proof Watermarked Photo Evidence',
      category: 'guard',
      categoryLabel: 'Guard Mobile',
      route: '/guard/patrol',
      badge: 'Forensic Audit',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      summary: 'On-device HTML5 Canvas engine embedding tamper-evident metadata onto photos.',
      whatItDoes: [
        'Mengakses kamera peranti secara langsung dan menyekat muat naik fail galeri lama.',
        'Mencetak tera air grafik kekal pada imej: Nama Checkpoint, ID Pengawal, Koordinat GPS, dan Cap Masa Tepat.',
        'Memampatkan saiz fail gambar kepada < 120 KB agar pantas dihantar walaupun menggunakan capaian internet lemah.',
        'Menyimpan bukti foto secara kekal di pangkalan data untuk rujukan pihak insurans dan klien.'
      ],
      howToUse: [
        'Tekan butang "Take Photo Proof" di skrin rondaan.',
        'Arahkan kamera ke kawasan atau objek checkpoint (contoh: gembok pintu atau panel elektrik).',
        'Tekan butang pengatup (shutter). Pratonton foto bertanda masa akan dipaparkan serta-merta.'
      ],
      integrityPoints: [
        'Tera air dimeterai di peringkat pemprosesan peranti (client-side canvas) sebelum data dipindahkan ke pelayan.',
        'Menghalang penggunaan gambar lama atau gambar palsu daripada internet.'
      ]
    },
    {
      id: 'incident_sos',
      title: '6. Built-In Incident & Hazard Reporting (SOS Alert)',
      category: 'guard',
      categoryLabel: 'Guard Mobile',
      route: '/guard/patrol',
      badge: 'Emergency Response',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      summary: 'Immediate anomaly and damage reporting with severity categorization and instant dispatch alert.',
      whatItDoes: [
        'Membolehkan pengawal melaporkan kecemasan, kerosakan fasiliti, atau pencerobohan serta-merta.',
        'Kategori keterukan berperingkat: Minor Hazard, Major Damage, atau Critical Emergency.',
        'Memuat naik foto kerosakan bersama koordinat GPS lokasi tepat insiden dikesan.',
        'Memaparkan amaran merah terang pada papan pemuka Command Center pentadbir.'
      ],
      howToUse: [
        'Sekiranya terjumpa kerosakan (contoh: paip bocor atau pintu pecah), tekan butang merah "Report Incident / Hazard".',
        'Pilih tahap keterukan insiden.',
        'Ambil gambar kerosakan dan masukkan nota penerangan ringkas.',
        'Tekan "Submit Incident". Amaran akan dipancarkan terus ke bilik kawalan.'
      ],
      integrityPoints: [
        'Laporan insiden diikat terus dengan pusingan rondaan aktif (Active Patrol Run ID) untuk rujukan siasatan rasmi.'
      ]
    },

    // ADMIN FEATURES
    {
      id: 'admin_command',
      title: '7. Central Command Center & Live Patrol Radar',
      category: 'admin',
      categoryLabel: 'Admin Center',
      route: '/admin',
      badge: 'Command & Control',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      summary: 'Real-time situational awareness dashboard monitoring active guards, tour progress, and alerts.',
      whatItDoes: [
        'Memaparkan metrik KPI utama: Pengawal Aktif, Rondaan Sedang Berjalan, Pos Dilindungi, dan Amaran Tertangguh.',
        'Peta interaktif Leaflet / OpenStreetMap memaparkan kedudukan pos keselamatan dan perimeter rondaan.',
        'Suapan langsung aktiviti (Live Activity Feed) mengemas kini setiap kali pengawal mengimbas checkpoint.',
        'Paparan status pusingan rondaan (IN PROGRESS, COMPLETED, FLAGGED).'
      ],
      howToUse: [
        'Layari https://smart-guard-system.vercel.app/admin di komputer bilik kawalan.',
        'Lihat kad metrik di bahagian atas untuk ringkasan pantas situasi semasa.',
        'Perhatikan senarai "Live Patrol Tours" untuk memantau pusingan pengawal yang sedang berjalan.',
        'Klik pada mana-mana pusingan untuk melihat checkpoint mana yang telah dilalui dan foto bukti yang ditangkap.'
      ],
      integrityPoints: [
        'Data dikemas kini secara langsung tanpa perlu memuat semula pelayar web (real-time stream).'
      ]
    },
    {
      id: 'post_builder',
      title: '8. Post & Checkpoint Task Builder with Leaflet Map',
      category: 'admin',
      categoryLabel: 'Admin Center',
      route: '/admin/posts',
      badge: 'Route Architect',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      summary: 'Visual builder to configure security posts, waypoints, geofence radius, and custom SOP tasks.',
      whatItDoes: [
        'Membolehkan pentadbir mencipta pos kawalan baharu dengan koordinat GPS dan radius geofence (10m–100m).',
        'Menambah titik checkpoint berurutan (Waypoints) bagi setiap pos (contoh: Lobi, Tangga Kecemasan, Stor).',
        'Menetapkan kaedah verifikasi bagi setiap checkpoint: GPS Geofence, Kod QR, atau Tag NFC.',
        'Menyediakan borang senarai tugasan (Task Checklist Builder) untuk setiap titik perhentian pengawal.'
      ],
      howToUse: [
        'Klik menu "Posts & Patrols" (/admin/posts).',
        'Tekan butang "+ Create New Post" atau pilih pos sedia ada untuk disunting.',
        'Klik pada peta untuk menetapkan koordinat atau taipkan latitud & longitud pos.',
        'Di bawah senarai Checkpoints, klik "+ Add Waypoint", masukkan nama lokasi, dan taipkan tugas SOP yang perlu diperiksa.'
      ],
      integrityPoints: [
        'Perubahan yang disimpan oleh admin serta-merta berkuat kuasa pada telefon semua pengawal yang bertugas di pos tersebut.'
      ]
    },
    {
      id: 'guard_roster',
      title: '9. Guard Roster & Duty Assignment Management',
      category: 'admin',
      categoryLabel: 'Admin Center',
      route: '/admin/guards',
      badge: 'Workforce Hub',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      summary: 'Security officer directory management, PIN assignment, and scheduled shift allocations.',
      whatItDoes: [
        'Mendaftarkan pengawal keselamatan baharu bersama Guard ID unik dan nombor telefon.',
        'Menetapkan PIN keselamatan 4-digit bagi setiap pengawal.',
        'Menugaskan pengawal ke pos kawalan tertentu dan menetapkan waktu syif (contoh: 08:00 - 20:00).',
        'Memantau status pengawal: Sedang Bertugas (On Duty) atau Di Luar Syif (Off Duty).'
      ],
      howToUse: [
        'Buka menu "Guards" (/admin/guards).',
        'Klik "Register Guard" untuk mendaftarkan staf keselamatan baharu.',
        'Masukkan maklumat nama, Guard ID, dan tetapkan pos bertugas.',
        'Gunakan fungsi carian untuk menapis pengawal mengikut nama atau status pos.'
      ],
      integrityPoints: [
        'Setiap Guard ID adalah unik dan disahkan dengan pangkalan data untuk mengelakkan kekeliruan rekod.'
      ]
    },
    {
      id: 'audit_flags',
      title: '10. Incident & Flagged Audit Investigation Center',
      category: 'admin',
      categoryLabel: 'Admin Center',
      route: '/admin/flagged',
      badge: 'Security Compliance',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      summary: 'Supervisor review hub for out-of-geofence attempts, delayed checkpoints, and emergency alerts.',
      whatItDoes: [
        'Mengasingkan dan memaparkan semua rekod kehadiran atau rondaan yang meragukan (Flagged Records).',
        'Memaparkan bukti swafoto forensik bertanda masa berserta beza lebihan jarak GPS (contoh: +45 meter luar pos).',
        'Menyediakan butang kelulusan penyelia: "Approve" (dengan justifikasi sah) atau "Reject".',
        'Merekodkan keputusan audit pentadbir bersama cap masa untuk tujuan rekod tatatertib.'
      ],
      howToUse: [
        'Klik menu "Audit Flags" (/admin/flagged).',
        'Semak kes kehadiran luar radius atau checkpoint yang dilaporkan.',
        'Lihat foto bukti bertanda masa dan lokasi GPS pengawal pada masa kejadian.',
        'Buat keputusan sama ada meluluskan rekod tersebut dengan nota penjelasan atau menolaknya.'
      ],
      integrityPoints: [
        'Tiada rekod mencurigakan boleh dipadam secara senyap — semua keputusan audit disimpan dalam jejak rekod kekal.'
      ]
    },
    {
      id: 'reports_analytics',
      title: '11. Multi-Sheet Excel Reports & Compliance Analytics',
      category: 'admin',
      categoryLabel: 'Admin Center',
      route: '/admin/reports',
      badge: 'Audit & Payroll Ready',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      summary: 'Enterprise XLSX data export providing multi-sheet attendance records and waypoint patrol logs.',
      whatItDoes: [
        'Menjana fail lembaran kerja Microsoft Excel (.xlsx) rasmi dengan satu klik.',
        'Sheet 1 (Attendance Summary): Senarai waktu masuk, keluar, jam bertugas, dan status integriti pengawal.',
        'Sheet 2 (Patrol Checkpoint Logs): Log terperinci setiap checkpoint, masa imbasan, skor pematuhan, dan pautan foto.',
        'Menyediakan penapis mengikut tarikh, nama pos, atau pengawal tertentu.'
      ],
      howToUse: [
        'Layari menu "Reports" (/admin/reports).',
        'Pilih julat tarikh (Hari ini, 7 hari lepas, atau bulan ini).',
        'Tekan butang hijau "Export to Excel (.xlsx)". Fail akan dimuat turun secara automatik ke komputer anda.'
      ],
      integrityPoints: [
        'Format fail mematuhi piawaian pengauditan antarabangsa dan sedia digunakan untuk pengiraan gaji serta laporan klien.'
      ]
    },

    // SECURITY & DEPLOYMENT
    {
      id: 'anti_spoofing',
      title: '12. Multi-Layer Anti-Spoofing & Geofence Security',
      category: 'security',
      categoryLabel: 'Security Defense',
      route: '/admin/settings',
      badge: 'Anti-Tamper Core',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      summary: 'Algorithmic security defenses preventing Mock GPS apps, photo spoofing, and clock tampering.',
      whatItDoes: [
        'Menolak data koordinat tiruan daripada perisian Fake GPS / Mock Location.',
        'Mengunci kamera hadapan telefon secara terus tanpa membenarkan pemilihan fail dari galeri peranti.',
        'Menerapkan cap masa pelayan (Server Timestamp) bagi mengelakkan manipulasi jam telefon.',
        'Menghitung jarak ketepatan satelit (GPS Accuracy Radius) untuk memastikan isyarat GPS berkualiti tinggi.'
      ],
      howToUse: [
        'Beroperasi secara automatik di latar belakang tanpa memerlukan sebarang campur tangan manual pengawal.',
        'Pentadbir boleh melaraskan kepekaan toleransi radius di menu Settings (/admin/settings).'
      ],
      integrityPoints: [
        'Menjamin integriti data 100% tepat dan boleh dipercayai di mahkamah atau untuk tuntutan insurans.'
      ]
    },
    {
      id: 'deployment_cloud',
      title: '13. Hybrid Cloud Infrastructure (Vercel & Supabase)',
      category: 'deployment',
      categoryLabel: 'Infrastructure',
      route: 'https://smart-guard-system.vercel.app',
      badge: 'High Availability',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      summary: 'Dual-engine architecture combining local ultra-fast SQLite with scalable Supabase Cloud PostgreSQL.',
      whatItDoes: [
        'Aplikasi dihoskan secara global pada infrastruktur pelayan tanpa pelayan (Serverless) Vercel Cloud.',
        'Pangkalan data berpusat menggunakan PostgreSQL berprestasi tinggi di Supabase Cloud.',
        'Menyokong operasi tempatan luar talian (Offline Intranet) menggunakan enjin SQLite WAL tempatan.',
        'Ketersediaan tinggi (High Availability 99.9%) dengan perlindungan sandaran awan automatik.'
      ],
      howToUse: [
        'Akses boleh dilakukan bila-bila masa melalui pautan rasmi https://smart-guard-system.vercel.app/guard/login.',
        'Pengawal boleh menggunakan pelan data 4G/5G dari mana-mana syarikat telekomunikasi tanpa sekatan IP.'
      ],
      integrityPoints: [
        'Penyulitan data hujung-ke-hujung (HTTPS / TLS 1.3) melindungi semua data pengawal daripada pemintasan.'
      ]
    }
  ];

  // Filtering
  const filteredFeatures = features.filter((feat) => {
    const matchesCategory = activeCategory === 'all' || feat.category === activeCategory;
    const matchesSearch =
      feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.whatItDoes.some((w) => w.toLowerCase().includes(searchQuery.toLowerCase())) ||
      feat.howToUse.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const currentFeature = features.find((f) => f.id === selectedFeature) || features[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>SGVS v2 Interactive Feature Directory & Manual</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Modul Penerangan Fungsi Sistem SGVS
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Panduan interaktif menyeluruh yang menerangkan setiap fungsi, aliran operasi, dan kawalan integriti bagi
              keseluruhan sistem Smart Guard & Patrol Verification System.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/SGVS_V2_Manual_Lengkap.pdf"
              download="SGVS_V2_Manual_Lengkap.pdf"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Muat Turun PDF Modul</span>
            </a>
            <Link
              href="/guard/login"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>Buka Guard App</span>
            </Link>
          </div>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari fungsi (contoh: radar, GPS, checklist, selfie, laporan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'Semua Fungsi' },
              { id: 'guard', label: '📱 Portal Pengawal' },
              { id: 'admin', label: '💻 Pusat Kawalan Admin' },
              { id: 'security', label: '🛡️ Keselamatan & Integriti' },
              { id: 'deployment', label: '☁️ Capaian & Awan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feature Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Feature Directory List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Senarai Fungsi ({filteredFeatures.length})
            </span>
            <span className="text-[11px] text-slate-400">Pilih fungsi untuk butiran</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
            {filteredFeatures.map((feat) => {
              const isSelected = selectedFeature === feat.id;
              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeature(feat.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400/80 shadow-xs ring-1 ring-sky-400/30'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                      {feat.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {feat.summary}
                  </p>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[10px]">
                    <span className="font-mono text-slate-400 truncate max-w-[200px]">{feat.route}</span>
                    <span className="font-semibold text-sky-600 flex items-center gap-0.5">
                      Lihat Perincian <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredFeatures.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                Tiada fungsi ditemui dengan carian &quot;{searchQuery}&quot;.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Function Inspector */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6 sticky top-20">
          {/* Header of selected feature */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {currentFeature.categoryLabel}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentFeature.badgeColor}`}>
                {currentFeature.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentFeature.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {currentFeature.summary}
            </p>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Pautan Sistem:</span>
              <code className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
                {currentFeature.route}
              </code>
              {currentFeature.route.startsWith('http') ? (
                <a
                  href={currentFeature.route}
                  target="_blank"
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold inline-flex items-center gap-1 transition"
                >
                  Buka Pautan <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  href={currentFeature.route}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold inline-flex items-center gap-1 transition"
                >
                  Uji Fungsi Ini <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Section 1: Apa yang fungsi ini lakukan */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-sky-700">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Fungsi & Keupayaan Utama (What It Does)</span>
            </h4>
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
              {currentFeature.whatItDoes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Cara Menggunakannya */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-700">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Langkah Demi Langkah (How To Operate)</span>
            </h4>
            <div className="bg-emerald-50/30 rounded-xl p-3.5 border border-emerald-200/60 space-y-2">
              {currentFeature.howToUse.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Kawalan Integriti & Sekatan Anti-Penipuan */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Kawalan Keselamatan & Integriti (Security & Audit Trail)</span>
            </h4>
            <div className="bg-slate-100/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
              {currentFeature.integrityPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
