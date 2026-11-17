'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Camera,
  CheckSquare,
  Square,
  Clock,
  ShieldCheck,
  MapPin,
  RefreshCw,
  AlertOctagon,
  ChevronRight,
  X,
} from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import { calculateDistance } from '@/lib/geofence';

interface GuardSession {
  id: string;
  name: string;
  activePostId: string;
  postName: string;
  postLat: number;
  postLng: number;
  postRadius: number;
}

interface Checkpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  sequence: number;
  requiredTasks: string[];
}

export default function GuardPatrolScreen() {
  const router = useRouter();
  const [guard, setGuard] = useState<GuardSession | null>(null);

  // Patrol Tour State
  const [runId, setRunId] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [tourStartTime, setTourStartTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Checklist Tasks completed for active checkpoint
  const [activeTasks, setActiveTasks] = useState<Record<string, boolean>>({});

  // Real GPS State
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [distanceToActive, setDistanceToActive] = useState<number>(0);
  const [isWithinCp, setIsWithinCp] = useState<boolean>(true);

  // Modals & Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentNotes, setIncidentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourFinishedModal, setTourFinishedModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // 1. Load Session & Start Patrol Run
  useEffect(() => {
    const raw = localStorage.getItem('sgvs_guard_session');
    if (!raw) {
      router.push('/guard/login');
      return;
    }
    const session: GuardSession = JSON.parse(raw);
    setGuard(session);
    initPatrolTour(session);
  }, [router]);

  // 2. Initialize or Resume Patrol Run
  const initPatrolTour = async (session: GuardSession) => {
    try {
      const res = await fetch('/api/patrol/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardId: session.id,
          postId: session.activePostId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRunId(data.runId);
        const sorted = (data.checkpoints || []).sort((a: any, b: any) => a.sequence - b.sequence);
        setCheckpoints(sorted);
        setTourStartTime(new Date());

        // Initialize task checks for first checkpoint
        if (sorted.length > 0 && sorted[0].requiredTasks) {
          const initMap: Record<string, boolean> = {};
          sorted[0].requiredTasks.forEach((t: string) => {
            initMap[t] = false;
          });
          setActiveTasks(initMap);
        }
      }
    } catch (e) {
      console.error('Failed to init patrol run:', e);
    }
  };

  // 3. Tour Elapsed Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Real Device Geolocation Watcher
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 6);

        setCurrentLat(lat);
        setCurrentLng(lng);
        setAccuracy(acc);

        // Calculate distance to active checkpoint
        if (checkpoints.length > 0 && currentIndex < checkpoints.length) {
          const activeCp = checkpoints[currentIndex];
          const dist = Math.round(calculateDistance(lat, lng, activeCp.latitude, activeCp.longitude));
          setDistanceToActive(dist);
          setIsWithinCp(dist <= activeCp.radius);
        }
      },
      (err) => {
        console.warn('GPS watcher error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 6000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [checkpoints, currentIndex]);

  const activeCheckpoint = checkpoints[currentIndex];

  const toggleTask = (task: string) => {
    setActiveTasks((prev) => ({ ...prev, [task]: !prev[task] }));
  };

  const handleOpenVerification = () => {
    setIsCameraOpen(true);
  };

  const handleVerificationPhoto = async (photoBase64: string) => {
    if (!guard || !runId || !activeCheckpoint) return;

    setIsCameraOpen(false);
    setIsSubmitting(true);
    setFeedback(null);

    const lat = currentLat !== null ? currentLat : activeCheckpoint.latitude;
    const lng = currentLng !== null ? currentLng : activeCheckpoint.longitude;

    const completedTaskList = Object.entries(activeTasks)
      .filter(([_, checked]) => checked)
      .map(([task]) => task);

    try {
      const res = await fetch('/api/patrol/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId,
          checkpointId: activeCheckpoint.id,
          guardId: guard.id,
          latitude: lat,
          longitude: lng,
          tasksCompleted: completedTaskList,
          photoBase64,
          notes: `Waypoint #${activeCheckpoint.sequence} verified with ${completedTaskList.length} tasks audited.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCompletedIds((prev) => new Set([...Array.from(prev), activeCheckpoint.id]));
        setFeedback({ type: 'success', text: `Waypoint #${activeCheckpoint.sequence} verified!` });

        // Advance to next checkpoint
        if (currentIndex + 1 < checkpoints.length) {
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          const nextCp = checkpoints[nextIndex];
          const nextTaskMap: Record<string, boolean> = {};
          (nextCp.requiredTasks || []).forEach((t) => {
            nextTaskMap[t] = false;
          });
          setActiveTasks(nextTaskMap);
        } else {
          // All checkpoints completed!
          setTourFinishedModal(true);
        }
      } else {
        setFeedback({ type: 'error', text: data.message || 'Verification failed.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportIncident = async () => {
    if (!incidentNotes.trim() || !runId || !guard) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/patrol/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId,
          checkpointId: activeCheckpoint ? activeCheckpoint.id : 'AD_HOC_INCIDENT',
          guardId: guard.id,
          latitude: currentLat !== null ? currentLat : guard.postLat,
          longitude: currentLng !== null ? currentLng : guard.postLng,
          notes: `INCIDENT ANOMALY: ${incidentNotes}`,
        }),
      });

      setIsIncidentModalOpen(false);
      setIncidentNotes('');
      setFeedback({ type: 'warning', text: 'Incident logged and supervisor notified.' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConcludeTour = async () => {
    if (!runId) return;
    try {
      await fetch('/api/patrol/runs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, notes: 'Tour completed successfully by officer.' }),
      });
      router.push('/guard/checkin');
    } catch (e) {
      router.push('/guard/checkin');
    }
  };

  // Format Elapsed Time
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct =
    checkpoints.length > 0 ? Math.round((completedIds.size / checkpoints.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between max-w-md mx-auto w-full text-slate-900 shadow-xl">
      {/* Top Bar */}
      <header className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => router.push('/guard/checkin')}
          className="flex items-center gap-1.5 text-xs text-sky-700 font-bold hover:text-sky-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Tour</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </header>

      {/* Main Tour Workspace */}
      <main className="p-4 flex-1 space-y-4">
        {/* Tour Header Banner */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                ACTIVE PATROL TOUR
              </span>
              <h2 className="text-base font-extrabold text-slate-900">{guard?.postName}</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              {completedIds.size} / {checkpoints.length} Verified
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Tour Progress</span>
              <span className="text-sky-700 font-bold">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* CURRENT ACTIVE TARGET WAYPOINT CARD */}
        {activeCheckpoint && (
          <div className="bg-white rounded-3xl p-5 border-2 border-sky-500 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  #{activeCheckpoint.sequence}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                    CURRENT TARGET WAYPOINT
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {activeCheckpoint.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Live Distance Meter */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isWithinCp ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-black ${isWithinCp ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {distanceToActive}m
                    </span>
                    <span className="text-[11px] text-slate-500">distance away</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Waypoint Geofence: {activeCheckpoint.radius}m</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isWithinCp
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isWithinCp ? 'Within Range' : 'Approach Point'}
              </span>
            </div>

            {/* Required Tasks Checklist */}
            {activeCheckpoint.requiredTasks && activeCheckpoint.requiredTasks.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  Required Inspection Checks:
                </label>
                <div className="space-y-1.5">
                  {activeCheckpoint.requiredTasks.map((task) => {
                    const isChecked = !!activeTasks[task];
                    return (
                      <div
                        key={task}
                        onClick={() => toggleTask(task)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer select-none transition ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs leading-snug">{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleOpenVerification}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              VERIFY CHECKPOINT WITH PHOTO
            </button>
          </div>
        )}

        {/* ALL WAYPOINTS TIMELINE STEPPER */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Patrol Route Checkpoints ({checkpoints.length})
          </h3>

          <div className="space-y-2.5">
            {checkpoints.map((cp, idx) => {
              const isDone = completedIds.has(cp.id);
              const isCurrent = idx === currentIndex && !isDone;

              return (
                <div
                  key={cp.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isCurrent
                      ? 'bg-sky-50 border-sky-300'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isDone ? '✓' : cp.sequence}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{cp.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        {cp.requiredTasks?.length || 0} inspection task(s)
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? 'Verified' : isCurrent ? 'Active' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly & Early Finish Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsIncidentModalOpen(true)}
            className="flex-1 py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-amber-300 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            Report Anomaly
          </button>
          <button
            onClick={() => setTourFinishedModal(true)}
            className="flex-1 py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
          >
            Finish Tour
          </button>
        </div>
      </main>

      {/* Camera Capture Modal */}
      {isCameraOpen && activeCheckpoint && guard && (
        <CameraCapture
          title={`Verify Waypoint #${activeCheckpoint.sequence}`}
          initialFacingMode="environment"
          watermarkData={{
            guardName: guard.name,
            guardId: guard.id,
            postName: guard.postName,
            checkpointName: activeCheckpoint.name,
            latitude: currentLat !== null ? currentLat : activeCheckpoint.latitude,
            longitude: currentLng !== null ? currentLng : activeCheckpoint.longitude,
            timestamp: new Date().toISOString(),
            isWithin: isWithinCp,
            distance: distanceToActive,
          }}
          onCaptured={handleVerificationPhoto}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}

      {/* Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Report Anomaly or Issue</h3>
              </div>
              <button onClick={() => setIsIncidentModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Describe any security breach, damaged equipment, broken locks, or hazards encountered.
            </p>

            <textarea
              rows={3}
              value={incidentNotes}
              onChange={(e) => setIncidentNotes(e.target.value)}
              placeholder="e.g. Fire exit door lock broken, water pipe leak in utility hallway..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-none resize-none"
            />

            <button
              onClick={handleReportIncident}
              disabled={!incidentNotes.trim() || isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Dispatch Incident Alert'}
            </button>
          </div>
        </div>
      )}

      {/* Tour Complete Modal */}
      {tourFinishedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Patrol Tour Concluded</h3>
              <p className="text-xs text-slate-500 mt-1">
                Completed {completedIds.size} of {checkpoints.length} waypoints in {formatTimer(elapsedSeconds)}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <p><b>Officer:</b> {guard?.name}</p>
              <p><b>Guard Post:</b> {guard?.postName}</p>
              <p><b>Status:</b> All audited timestamps uploaded to server</p>
            </div>

            <button
              onClick={handleConcludeTour}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
            >
              Conclude Tour & Return to Check-In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
