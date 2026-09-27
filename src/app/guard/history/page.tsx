'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, MapPin, RefreshCw, Eye } from 'lucide-react';

interface AttendanceLog {
  id: string;
  type: string;
  timestamp: string;
  postName: string;
  distanceFromCenter: number;
  isWithinGeofence: number;
  status: string;
  selfieBase64?: string;
  isOfflineSync: number;
  reviewStatus: string;
}

export default function GuardHistory() {
  const router = useRouter();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('sgvs_guard_session');
    if (!raw) {
      router.push('/guard/login');
      return;
    }
    const guard = JSON.parse(raw);
    fetchLogs(guard.id);
  }, [router]);

  const fetchLogs = async (guardId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?guardId=${guardId}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between max-w-md mx-auto w-full text-white shadow-2xl">
      {/* Top Bar */}
      <header className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.push('/guard/checkin')}
          className="flex items-center gap-1.5 text-xs text-sky-400 font-bold hover:text-sky-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <h1 className="text-sm font-bold text-white">Rekod Kehadiran Saya</h1>
        <div className="w-8"></div>
      </header>

      {/* History List */}
      <main className="p-4 flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-500" />
            <p className="text-xs">Memuat rekod kehadiran...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-bold text-slate-400">Tiada Rekod Kehadiran</p>
            <p className="text-xs text-slate-500 mt-1">Lakukan Clock-In pertama anda di skrin utama.</p>
          </div>
        ) : (
          logs.map((log) => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={log.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow flex items-start justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        log.type === 'CLOCK_IN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {log.type === 'CLOCK_IN' ? 'MASUK' : 'KELUAR'}
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-300">
                      {timeStr} • {dateStr}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.postName}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Jarak: <b>{log.distanceFromCenter}m</b></span>
                    <span>•</span>
                    {log.isWithinGeofence ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Sah Dalam Pos
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Luar Radius (Flagged)
                      </span>
                    )}
                  </div>

                  {log.isOfflineSync === 1 && (
                    <span className="inline-block text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium">
                      Disegerak Luar Talian
                    </span>
                  )}
                </div>

                {log.selfieBase64 && (
                  <button
                    onClick={() => setSelectedSelfie(log.selfieBase64 || null)}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 group"
                  >
                    <img
                      src={log.selfieBase64}
                      alt="Selfie"
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </button>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Selfie Preview Modal */}
      {selectedSelfie && (
        <div
          onClick={() => setSelectedSelfie(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-sm w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-2">
            <img src={selectedSelfie} alt="Bukti Swafoto Penuh" className="w-full h-auto rounded-2xl" />
            <button
              onClick={() => setSelectedSelfie(null)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Tutup Paparan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
