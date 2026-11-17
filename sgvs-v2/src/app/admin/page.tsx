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
  ChevronRight,
  ShieldCheck,
  Eye,
  Compass,
  CheckSquare,
} from 'lucide-react';
import LeafletMap, { MapPost, MapCheckpoint } from '@/components/LeafletMap';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [checkpoints, setCheckpoints] = useState<MapCheckpoint[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [patrolRuns, setPatrolRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPosts, resCheckpoints, resLogs, resGuards, resPatrols] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/patrol/checkpoints'),
        fetch('/api/attendance?limit=25'),
        fetch('/api/guards'),
        fetch('/api/patrol/runs?limit=15'),
      ]);

      const [dataPosts, dataCheckpoints, dataLogs, dataGuards, dataPatrols] = await Promise.all([
        resPosts.json(),
        resCheckpoints.json(),
        resLogs.json(),
        resGuards.json(),
        resPatrols.json(),
      ]);

      if (dataPosts.success) {
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

      if (dataCheckpoints.success) setCheckpoints(dataCheckpoints.checkpoints || []);
      if (dataLogs.success) setLogs(dataLogs.logs || []);
      if (dataGuards.success) setGuards(dataGuards.guards || []);
      if (dataPatrols.success) setPatrolRuns(dataPatrols.runs || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeGuardsCount = guards.filter((g) => g.lastAction === 'CLOCK_IN').length;
  const flaggedCount = logs.filter(
    (l) => l.status === 'FLAGGED_OUT_OF_BOUNDS' || l.isWithinGeofence === 0
  ).length;
  const completedPatrolsCount = patrolRuns.filter((r) => r.status === 'COMPLETED').length;
  const inProgressPatrolsCount = patrolRuns.filter((r) => r.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Operations Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time security telemetry, geofence status, and active guard patrol verification.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Guards */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              On-Duty Officers
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{activeGuardsCount}</span>
              <span className="text-xs font-semibold text-slate-400">/ {guards.length} registered</span>
            </div>
          </div>
        </div>

        {/* Card 2: Patrol Tours */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Patrol Tours Today
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{completedPatrolsCount}</span>
              <span className="text-xs font-semibold text-emerald-600">
                {inProgressPatrolsCount > 0 ? `(${inProgressPatrolsCount} active)` : 'completed'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Monitored Posts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Configured Posts
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{posts.length}</span>
              <span className="text-xs font-semibold text-slate-400">({checkpoints.length} waypoints)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Audit Flags */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
              flaggedCount > 0
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Flagged Incidents
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${flaggedCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {flaggedCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {flaggedCount > 0 ? 'require review' : 'all clear'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map & Live Patrol Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Geospatial Map */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                Live Perimeter & Waypoints Map
              </h2>
              <p className="text-xs text-slate-500">
                Real-time geofence boundaries (circles) and patrol inspection routes (numbered waypoints).
              </p>
            </div>
            <Link
              href="/admin/posts"
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              Configure Checkpoints
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <LeafletMap posts={posts} checkpoints={checkpoints} height="390px" zoom={16} />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-slate-600 border-t border-slate-100 mt-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Active Post
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                Standard Post
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                Patrol Waypoint
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Updates every 15 seconds</span>
          </div>
        </div>

        {/* Right 1 Col: Patrol Tour Status Monitor */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Patrol Rounds</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Tours
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {patrolRuns.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Compass className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold">No patrol tours recorded yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Officers start tours from the Guard App.</p>
                </div>
              ) : (
                patrolRuns.map((run) => {
                  const pct =
                    run.totalCheckpoints > 0
                      ? Math.round((run.completedCheckpoints / run.totalCheckpoints) * 100)
                      : 0;
                  const isDone = run.status === 'COMPLETED';

                  return (
                    <div
                      key={run.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                          {run.guardName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800 animate-pulse'
                          }`}
                        >
                          {isDone ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[150px]">{run.postName}</span>
                        <span>
                          {run.completedCheckpoints} / {run.totalCheckpoints} Waypoints
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDone ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            href="/admin/reports"
            className="w-full mt-3 py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
          >
            Export Patrol Audit Log →
          </Link>
        </div>
      </div>

      {/* Recent Attendance & Audit Feed Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Recent Attendance Telemetry
            </h2>
            <p className="text-xs text-slate-500">
              Live stream of guard check-ins, geofence validations, and watermarked camera captures.
            </p>
          </div>
          <Link
            href="/admin/flagged"
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            Review Flagged ({flaggedCount})
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Post</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Geofence Distance</th>
                <th className="py-2.5 px-3">Integrity Status</th>
                <th className="py-2.5 px-3 text-right">Photo Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 10).map((log) => {
                  const isFlagged = log.status === 'FLAGGED_OUT_OF_BOUNDS' || log.isWithinGeofence === 0;
                  const dateObj = new Date(log.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{timeFormatted}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{log.guardName}</td>
                      <td className="py-3 px-3 text-slate-600">{log.postName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            log.type === 'CLOCK_IN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {log.type === 'CLOCK_IN' ? 'Clock In' : 'Clock Out'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            log.distanceFromCenter > (log.postRadius || 35)
                              ? 'text-rose-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {Math.round(log.distanceFromCenter)}m
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">/ {log.postRadius || 35}m</span>
                      </td>
                      <td className="py-3 px-3">
                        {isFlagged ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Flagged Out-of-Bounds
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified Within Fence
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {log.selfieBase64 ? (
                          <button
                            onClick={() => setSelectedSelfie(log.selfieBase64)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="Inspect watermarked photo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Security Audit Photo</h3>
              </div>
              <button
                onClick={() => setSelectedSelfie(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close ✕
              </button>
            </div>
            <img
              src={selectedSelfie}
              alt="Watermarked verification"
              className="w-full rounded-2xl border border-slate-100 shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
