import Link from 'next/link';
import { ShieldCheck, Smartphone, LayoutDashboard, MapPin, Camera, WifiOff, FileSpreadsheet, BellRing, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="py-6 border-b border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              SMART GUARD SYSTEM
            </h1>
            <p className="text-xs text-sky-400 font-medium">
              Sistem Pengesahan Lokasi & Kehadiran Pengawal Keselamatan (SGVS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Sistem Aktif (Live)
          </span>
        </div>
      </header>

      {/* Main Portals Selector */}
      <main className="my-auto py-10">
        {/* APK Download Banner */}
        <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 justify-center sm:justify-start">
                Muat Turun Fail Android APK (Pemasangan Terus)
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">V1.0 Ready</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Pasang aplikasi pengawal secara terus pada mana-mana telefon Android untuk ujian di pos lapangan.
              </p>
            </div>
          </div>
          <a
            href="/smart-guard.apk"
            download="smart-guard.apk"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition shrink-0"
          >
            <Download className="w-4 h-4" />
            Muat Turun APK (Android)
          </a>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Pilih Mod Akses Sistem
          </h2>
          <p className="text-sm text-slate-400">
            Sistem dwifungsi: Aplikasi pantas mesra pengguna untuk pengawal di pos, dan portal pemantauan berpusat untuk pegawai operasi & HR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Guard Mobile Portal */}
          <Link
            href="/guard/checkin"
            className="group relative bg-slate-900/80 hover:bg-slate-800/90 border-2 border-sky-500/40 hover:border-sky-400 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xl shadow-sky-950/30 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/20 text-sky-300">
                Aplikasi Pengawal (BYOD)
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-300 transition">
                Portal Pengawal Bertugas
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Antara muka <b>Zero Friction</b> untuk abang-abang pengawal: Semakan GPS Geofence (radius 30m), butang besar satu klik, swafoto langsung berpandukan bulatan, dan mod luar talian (offline).
              </p>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300 mb-6">
                <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">📍 Geofence Radar</span>
                <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">📸 Swafoto Ber-watermark</span>
                <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">📶 Offline-First</span>
              </div>
            </div>

            <div className="w-full py-3.5 rounded-xl bg-sky-600 group-hover:bg-sky-500 text-white font-bold text-sm text-center shadow-lg transition flex items-center justify-center gap-2">
              Buka Aplikasi Pengawal →
            </div>
          </Link>

          {/* Card 2: Web Admin & Operations Portal */}
          <Link
            href="/admin"
            className="group relative bg-slate-900/80 hover:bg-slate-800/90 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xl shadow-emerald-950/30 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                Penyelia & HR Admin
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition">
                Pusat Kawalan Operasi (Admin)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Papan pemuka pengurusan berpusat: Peta interaktif Leaflet pos kawalan, siasatan log <i>flagged</i> luar radius, eksport laporan syif ke Microsoft Excel, dan bot notifikasi segera Telegram.
              </p>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300 mb-6">
                <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">🗺️ Peta Live Pos</span>
                <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">📊 Laporan Excel</span>
                <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">🚨 Siasatan Flagged</span>
              </div>
            </div>

            <div className="w-full py-3.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-sm text-center shadow-lg transition flex items-center justify-center gap-2">
              Buka Papan Pemuka Admin →
            </div>
          </Link>
        </div>
      </main>

      {/* Feature Highlights Footer */}
      <footer className="py-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60">
          <MapPin className="w-5 h-5 text-sky-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-200">GPS Geofencing</p>
          <p className="text-[10px] text-slate-400">Radius tepat 20m - 50m</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60">
          <Camera className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-200">Swafoto Langsung</p>
          <p className="text-[10px] text-slate-400">Anti-proksi kehadiran</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60">
          <WifiOff className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-200">Offline-First</p>
          <p className="text-[10px] text-slate-400">Penyegerakan automatik</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60">
          <FileSpreadsheet className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-200">Eksport Excel</p>
          <p className="text-[10px] text-slate-400">Integrasi gaji & HR</p>
        </div>
      </footer>
    </div>
  );
}
