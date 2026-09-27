'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import LeafletMap, { MapPost } from '@/components/LeafletMap';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPosts, resLogs, resGuards] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/attendance?limit=25'),
        fetch('/api/guards'),
      ]);

      const [dataPosts, dataLogs, dataGuards] = await Promise.all([
        resPosts.json(),
        resLogs.json(),
        resGuards.json(),
      ]);

      if (dataPosts.success) {
        // Map active guards presence
        const activePostIds = new Set(
          (dataLogs.logs || [])
            .filter((l: any) => l.type === 'CLOCK_IN')
            .map((l: any) => l.postId)
        );

        setPosts(
          dataPosts.posts.map((p: any) => ({
            ...p,
            hasActiveGuard: activePostIds.has(p.id),
          }))
        );
      }

      if (dataLogs.success) setLogs(dataLogs.logs);
      if (dataGuards.success) setGuards(dataGuards.guards);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Polling every 15s for live command center
    return () => clearInterval(interval);
  }, []);

  // Compute KPI Metrics
  const activeGuardsCount = guards.filter((g) => g.lastAction === 'CLOCK_IN').length;
  const flaggedCount = logs.filter(
    (l) => l.status === 'FLAGGED_OUT_OF_BOUNDS' || l.isWithinGeofence === 0
  ).length;
  const onTimeCount = logs.filter((l) => l.status === 'ON_TIME').length;
  const onTimeRate = logs.length > 0 ? Math.round((onTimeCount / logs.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Pusat Kawalan Operasi & Geofence (Live)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pemantauan pengawal keselamatan bertugas, perimeter pos, dan insiden integriti kehadiran secara masa nyata.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          Kemaskini Data
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active On-Duty */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pengawal Bertugas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeGuardsCount}</span>
            <span className="text-xs text-slate-400">/ {guards.length} staf</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Sedang aktif di pos kawalan
          </p>
        </div>

        {/* Card 2: On-Time Rate */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kadar Tepat Masa
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{onTimeRate}%</span>
          </div>
          <p className="text-[11px] text-sky-400 mt-2 font-semibold">
            Pematuhan jadual syif 12-jam
          </p>
        </div>

        {/* Card 3: Flagged Incidents */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Insiden Flagged
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400">{flaggedCount}</span>
            <span className="text-xs text-slate-400">kes luar pos / mock</span>
          </div>
          <Link
            href="/admin/flagged"
            className="text-[11px] text-rose-400 hover:text-rose-300 mt-2 font-bold inline-flex items-center gap-1"
          >
            Siasat insiden sekarang →
          </Link>
        </div>

        {/* Card 4: Registered Guard Posts */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pos & Geofence
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{posts.length}</span>
            <span className="text-xs text-slate-400">pos berpagar GPS</span>
          </div>
          <Link
            href="/admin/posts"
            className="text-[11px] text-amber-400 hover:text-amber-300 mt-2 font-bold inline-flex items-center gap-1"
          >
            Laras radius perimeter →
          </Link>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Geospatial Command Center Map (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-400" />
                Peta Taburan Pos Kawalan & Geofence
              </h2>
              <p className="text-xs text-slate-400">
                Bulatan mewakili radius perimeter sah (20m–50m) bagi setiap pos
              </p>
            </div>
            <Link
              href="/admin/posts"
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              Urus Pos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 min-h-[380px]">
            <LeafletMap posts={posts} zoom={16} height="380px" />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                Ada Pengawal Bertugas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                Pos Kosong / Menunggu Syif
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Dikuasakan oleh OpenStreetMap & Geofencing Haversine
            </span>
          </div>
        </div>

        {/* Right Column: Live Attendance Transactions Feed (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Suapan Kehadiran Terkini
              </h2>
              <p className="text-xs text-slate-400">Transaksi log masuk/keluar langsung</p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {logs.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-bold text-slate-400">Belum ada transaksi log kehadiran</p>
              </div>
            ) : (
              logs.slice(0, 8).map((log) => {
                const dateObj = new Date(log.timestamp);
                const timeStr = dateObj.toLocaleTimeString('ms-MY', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isFlagged = log.status === 'FLAGGED_OUT_OF_BOUNDS' || !log.isWithinGeofence;

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isFlagged
                        ? 'bg-rose-950/20 border-rose-900/40'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {log.selfieBase64 ? (
                        <button
                          onClick={() => setSelectedSelfie(log.selfieBase64)}
                          className="w-11 h-11 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 relative group"
                        >
                          <img
                            src={log.selfieBase64}
                            alt="Swafoto"
                            className="w-full h-full object-cover group-hover:opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs">
                          {log.guardId.slice(-3)}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-white">
                            {log.guardName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({log.guardId})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {log.postName}
                        </p>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span
                            className={`font-bold ${
                              isFlagged ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {isFlagged ? `Flagged (${log.distanceFromCenter}m)` : `Dalam Pos (${log.distanceFromCenter}m)`}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 font-mono">{timeStr}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        log.type === 'CLOCK_IN'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {log.type === 'CLOCK_IN' ? 'IN' : 'OUT'}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Jumlah log direkodkan: <b>{logs.length}</b></span>
            <Link
              href="/admin/reports"
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              Muat Turun Excel <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Selfie Preview Modal */}
      {selectedSelfie && (
        <div
          onClick={() => setSelectedSelfie(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-md w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-3">
            <h3 className="text-sm font-bold text-white mb-2 px-2">Bukti Swafoto Bertera Air</h3>
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
