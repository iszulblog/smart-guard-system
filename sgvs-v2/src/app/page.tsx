import Link from 'next/link';
import {
  ShieldCheck,
  Smartphone,
  LayoutDashboard,
  MapPin,
  Camera,
  WifiOff,
  FileSpreadsheet,
  Compass,
  ArrowRight,
  Download,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="py-6 border-b border-slate-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-md shadow-sky-600/10">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              SMART GUARD SYSTEM
            </h1>
            <p className="text-xs text-sky-700 font-semibold">
              Security Geofencing, Attendance & Waypoint Patrol Platform (V2)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Operational (Live)
          </span>
        </div>
      </header>

      {/* Main Portals Selector */}
      <main className="my-auto py-8">
        {/* APK Download Banner */}
        <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                Android APK Package Available
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">V2.0 Ready</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Install directly on field Android devices for on-post guard testing and checkpoint verification.
              </p>
            </div>
          </div>
          <a
            href="/smart-guard.apk"
            download="smart-guard.apk"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download APK
          </a>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Select Portal Access
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated portals for field security officers and operations supervisory personnel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Guard Field App */}
          <Link
            href="/guard/login"
            className="group relative bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-sky-300 rounded-3xl p-6 sm:p-7 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  GUARD FIELD APP
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition">
                Security Guard Portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Streamlined mobile interface: Geofence radar, one-tap shift clocking, watermarked camera proof, and step-by-step waypoint patrols with task checklists.
              </p>

              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 mb-6">
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">📍 Geofence Radar</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">📸 Watermarked Photos</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">🚶 Route Checkpoints</span>
              </div>
            </div>

            <div className="w-full py-3 rounded-xl bg-sky-600 group-hover:bg-sky-700 text-white font-semibold text-xs text-center shadow-sm transition flex items-center justify-center gap-1.5">
              <span>Launch Guard App</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Command Center */}
          <Link
            href="/admin"
            className="group relative bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-300 rounded-3xl p-6 sm:p-7 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  COMMAND CENTER
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">
                Supervisory & Operations Portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Central management dashboard: Live interactive posts & patrol routes map, guard roster, flagged geofence audit center, and Excel report export.
              </p>

              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 mb-6">
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">🗺️ Live Posts Map</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">📊 Excel Reports</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">🚨 Integrity Audits</span>
              </div>
            </div>

            <div className="w-full py-3 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-semibold text-xs text-center shadow-sm transition flex items-center justify-center gap-1.5">
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </main>

      {/* Feature Highlights Footer */}
      <footer className="py-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <MapPin className="w-4 h-4 text-sky-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-800">Geofence Radar</p>
          <p className="text-[10px] text-slate-500">20m - 50m radius fence</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <Compass className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-800">Patrol Waypoints</p>
          <p className="text-[10px] text-slate-500">Step-by-step route checks</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <Camera className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-800">Audit Photos</p>
          <p className="text-[10px] text-slate-500">Anti-proxy timestamp stamp</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <FileSpreadsheet className="w-4 h-4 text-purple-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-800">Excel Export</p>
          <p className="text-[10px] text-slate-500">Payroll & HR compliance</p>
        </div>
      </footer>
    </div>
  );
}
