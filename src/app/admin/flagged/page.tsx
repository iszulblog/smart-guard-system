'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Eye, ShieldAlert, MapPin, Clock } from 'lucide-react';

interface FlaggedLog {
  id: string;
  guardId: string;
  guardName: string;
  postId: string;
  postName: string;
  postRadius: number;
  type: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  distanceFromCenter: number;
  isWithinGeofence: number;
  status: string;
  selfieBase64?: string;
  isMockLocation: number;
  reviewStatus: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export default function FlaggedIncidents() {
  const [logs, setLogs] = useState<FlaggedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);
  const [reviewNoteInputs, setReviewNoteInputs] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance?status=FLAGGED_OUT_OF_BOUNDS&limit=50');
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

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleReviewAction = async (logId: string, action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(logId);
    try {
      const notes = reviewNoteInputs[logId] || '';
      const res = await fetch('/api/attendance/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId,
          action,
          reviewNotes: notes,
          reviewedBy: 'Penyelia Operasi (SV-01)',
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchLogs();
      } else {
        alert(data.message || 'Ralat mengemas kini semakan.');
      }
    } catch (err: any) {
      alert('Ralat sambungan: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'PENDING') return log.reviewStatus === 'PENDING';
    if (filter === 'RESOLVED') return log.reviewStatus === 'APPROVED' || log.reviewStatus === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Pusat Siasatan & Rekod "Flagged" (Audit Trail)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Semakan terperinci cubaan log luar radius keselamatan pos kawalan dan pemalsuan lokasi (*mock GPS*).
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 transition hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          Segar Semula
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            filter === 'ALL'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Semua Insiden ({logs.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            filter === 'PENDING'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Menunggu Semakan ({logs.filter((l) => l.reviewStatus === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            filter === 'RESOLVED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Telah Disemak ({logs.filter((l) => l.reviewStatus !== 'PENDING').length})
        </button>
      </div>

      {/* Flagged Incidents List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-500" />
            <p className="text-xs">Memuatkan senarai insiden flagged...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Tiada Insiden Flagged</h3>
            <p className="text-xs text-slate-400">
              Semua pengawal mencatatkan kehadiran di dalam radius perimeter yang sah!
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toLocaleDateString('ms-MY', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString('ms-MY', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className="bg-slate-900/90 border border-rose-900/40 rounded-3xl p-5 shadow-xl flex flex-col lg:flex-row gap-5 items-start justify-between"
              >
                {/* Selfie Proof Thumbnail */}
                <div className="flex items-center gap-4">
                  {log.selfieBase64 ? (
                    <div
                      onClick={() => setSelectedSelfie(log.selfieBase64 || null)}
                      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-rose-500/40 bg-slate-950 shrink-0 cursor-pointer group shadow-lg"
                    >
                      <img
                        src={log.selfieBase64}
                        alt="Bukti Swafoto Insiden"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-white font-mono">
                        Klik Zoom
                      </span>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs shrink-0">
                      Tiada Swafoto
                    </div>
                  )}

                  {/* Incident Info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {log.isMockLocation ? 'MOCK GPS DETECTED' : 'LUAR RADIUS POS'}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.reviewStatus === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : log.reviewStatus === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        Status: {log.reviewStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white">
                      {log.guardName}{' '}
                      <span className="text-xs font-mono font-normal text-slate-400">
                        ({log.guardId})
                      </span>
                    </h3>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{log.postName}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{dateStr} • {timeStr}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-rose-300">
                      Jarak dikesan: <b>{log.distanceFromCenter} meter</b> (Had perimeter: {log.postRadius}m, Tercicir: +{Math.round(log.distanceFromCenter - log.postRadius)}m)
                    </div>
                  </div>
                </div>

                {/* Supervisor Review Action Box */}
                <div className="w-full lg:w-80 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between self-stretch text-xs">
                  {log.reviewStatus === 'PENDING' ? (
                    <>
                      <div className="mb-3">
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                          Catatan Semakan Penyelia:
                        </label>
                        <input
                          type="text"
                          placeholder="Cth: Rondaan perimeter blok C..."
                          value={reviewNoteInputs[log.id] || ''}
                          onChange={(e) =>
                            setReviewNoteInputs({ ...reviewNoteInputs, [log.id]: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewAction(log.id, 'APPROVED')}
                          disabled={actionLoading === log.id}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Luluskan
                        </button>
                        <button
                          onClick={() => handleReviewAction(log.id, 'REJECTED')}
                          disabled={actionLoading === log.id}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Tolak
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5 my-auto">
                      <p className="text-[11px] text-slate-400">
                        Disemak oleh: <b className="text-white">{log.reviewedBy || 'Penyelia'}</b>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Catatan: <span className="text-slate-200">{log.reviewNotes || '—'}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {log.reviewedAt ? new Date(log.reviewedAt).toLocaleString('ms-MY') : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selfie Preview Modal */}
      {selectedSelfie && (
        <div
          onClick={() => setSelectedSelfie(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-md w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-3">
            <h3 className="text-sm font-bold text-white mb-2 px-2">Bukti Forensik Swafoto</h3>
            <img src={selectedSelfie} alt="Bukti Swafoto" className="w-full h-auto rounded-2xl" />
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
