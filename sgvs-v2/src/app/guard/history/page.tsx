'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, MapPin, RefreshCw, Eye, Compass, ShieldCheck } from 'lucide-react';

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
  const [patrols, setPatrols] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'patrols'>('attendance');
  const [loading, setLoading] = useState(true);
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('sgvs_guard_session');
    if (!raw) {
      router.push('/guard/login');
      return;
    }
    const guard = JSON.parse(raw);
    fetchData(guard.id);
  }, [router]);

  const fetchData = async (guardId: string) => {
    setLoading(true);
    try {
      const [resLogs, resPatrols] = await Promise.all([
        fetch(`/api/attendance?guardId=${guardId}&limit=25`),
        fetch(`/api/patrol/runs?guardId=${guardId}&limit=25`),
      ]);
      const [dataLogs, dataPatrols] = await Promise.all([resLogs.json(), resPatrols.json()]);

      if (dataLogs.success) setLogs(dataLogs.logs || []);
      if (dataPatrols.success) setPatrols(dataPatrols.runs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between max-w-md mx-auto w-full text-slate-900 shadow-xl">
      {/* Top Bar */}
      <header className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => router.push('/guard/checkin')}
          className="flex items-center gap-1.5 text-xs text-sky-700 font-bold hover:text-sky-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-xs font-bold text-slate-900">Activity History</h1>
        <div className="w-10"></div>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-1 bg-slate-200/60 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Attendance ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('patrols')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'patrols' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Patrol Tours ({patrols.length})
          </button>
        </div>
      </div>

      {/* History List */}
      <main className="p-4 flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-xs font-medium">Loading activity records...</p>
          </div>
        ) : activeTab === 'attendance' ? (
          logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-6">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No Attendance Records</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Perform your first Clock-In on the check-in screen.</p>
            </div>
          ) : (
            logs.map((log) => {
              const dateObj = new Date(log.timestamp);
              const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
              const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          log.type === 'CLOCK_IN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {log.type === 'CLOCK_IN' ? 'Shift Clock In' : 'Shift Clock Out'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dateStr} • {timeStr}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{log.postName}</h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {Math.round(log.distanceFromCenter)}m from center
                      </span>
                      {log.isWithinGeofence === 1 ? (
                        <span className="text-emerald-700 font-semibold">• Within Fence</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">• Outside Fence</span>
                      )}
                    </div>
                  </div>

                  {log.selfieBase64 && (
                    <button
                      onClick={() => setSelectedSelfie(log.selfieBase64!)}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative group"
                    >
                      <img src={log.selfieBase64} alt="Proof" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : patrols.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-6">
            <Compass className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No Patrol Tours Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Start your first waypoint tour on the check-in screen.</p>
          </div>
        ) : (
          patrols.map((run) => {
            const startObj = new Date(run.startTime);
            const dateStr = startObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            const startStr = startObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const isDone = run.status === 'COMPLETED';

            return (
              <div
                key={run.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {dateStr} • {startStr}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}
                  >
                    {isDone ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">{run.postName}</h4>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Waypoints Verified:</span>
                  <span className="font-bold text-slate-900">
                    {run.completedCheckpoints} / {run.totalCheckpoints}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Selfie Modal */}
      {selectedSelfie && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSelfie(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-sm w-full border border-slate-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold text-slate-900">Security Verification Proof</h3>
              <button onClick={() => setSelectedSelfie(null)} className="text-xs text-slate-400 hover:text-slate-600">
                Close ✕
              </button>
            </div>
            <img src={selectedSelfie} alt="Verification audit" className="w-full rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
