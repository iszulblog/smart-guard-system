'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  History,
  Shield,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  BookOpen,
} from 'lucide-react';
import OfflineBanner from '@/components/OfflineBanner';
import CameraCapture from '@/components/CameraCapture';
import { calculateDistance } from '@/lib/geofence';
import { saveToOfflineQueue } from '@/lib/offline-sync';

interface GuardSession {
  id: string;
  name: string;
  phone?: string;
  activePostId: string;
  postName: string;
  postLat: number;
  postLng: number;
  postRadius: number;
  shiftStart: string;
  shiftEnd: string;
}

export default function GuardCheckin() {
  const router = useRouter();
  const [guard, setGuard] = useState<GuardSession | null>(null);

  // Real GPS State
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [distance, setDistance] = useState<number>(0);
  const [isWithin, setIsWithin] = useState<boolean>(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Attendance Status
  const [todayRecord, setTodayRecord] = useState<{
    clockInTime?: string;
    clockOutTime?: string;
    status?: string;
    isClockedIn: boolean;
  }>({
    isClockedIn: false,
  });

  // Camera & Submission State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [actionType, setActionType] = useState<'CLOCK_IN' | 'CLOCK_OUT'>('CLOCK_IN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // Load Guard Session
  useEffect(() => {
    const raw = localStorage.getItem('sgvs_guard_session');
    if (!raw) {
      router.push('/guard/login');
      return;
    }
    try {
      const parsed: GuardSession = JSON.parse(raw);
      setGuard(parsed);
    } catch (e) {
      router.push('/guard/login');
    }
  }, [router]);

  // Acquire Real Device GPS
  const requestRealLocation = (targetGuard?: GuardSession) => {
    const g = targetGuard || guard;
    if (!g) return;

    setGpsLoading(true);
    setGpsError(null);

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 6);

          setCurrentLat(lat);
          setCurrentLng(lng);
          setAccuracy(acc);

          const dist = Math.round(calculateDistance(lat, lng, g.postLat, g.postLng));
          setDistance(dist);
          setIsWithin(dist <= g.postRadius);
          setGpsLoading(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGpsLoading(false);
          setGpsError('GPS signal unavailable. Please ensure Location is enabled on your device.');
          // Default fallback within post perimeter
          setCurrentLat(g.postLat);
          setCurrentLng(g.postLng);
          setDistance(0);
          setIsWithin(true);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setGpsLoading(false);
      setGpsError('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    if (guard) {
      requestRealLocation(guard);
      checkRecentAttendance(guard.id);
    }
  }, [guard]);

  const checkRecentAttendance = async (guardId: string) => {
    try {
      const res = await fetch(`/api/attendance?guardId=${guardId}&limit=5`);
      const data = await res.json();
      if (data.success && data.logs && data.logs.length > 0) {
        const latest = data.logs[0];
        const isClockedIn = latest.type === 'CLOCK_IN';
        setTodayRecord({
          clockInTime: isClockedIn ? latest.timestamp : undefined,
          status: latest.status,
          isClockedIn,
        });
      }
    } catch (e) {
      console.warn('Could not fetch recent logs:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sgvs_guard_session');
    router.push('/guard/login');
  };

  const handleStartCapture = (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setActionType(type);
    setIsCameraOpen(true);
  };

  const handleSubmitAttendance = async (watermarkedPhotoBase64: string) => {
    if (!guard) return;

    setIsCameraOpen(false);
    setIsSubmitting(true);
    setFeedbackMsg(null);

    const latToSubmit = currentLat !== null ? currentLat : guard.postLat;
    const lngToSubmit = currentLng !== null ? currentLng : guard.postLng;

    const payload = {
      id: `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      guardId: guard.id,
      postId: guard.activePostId,
      type: actionType,
      latitude: latToSubmit,
      longitude: lngToSubmit,
      accuracy: accuracy,
      selfieBase64: watermarkedPhotoBase64,
      isMockLocation: 0,
      clientTimestamp: new Date().toISOString(),
    };

    // If Offline, store in device queue
    if (!navigator.onLine) {
      saveToOfflineQueue(payload);
      setIsSubmitting(false);
      setFeedbackMsg({
        type: 'warning',
        text: 'Device is offline. Attendance record saved locally and will auto-sync once connected.',
      });
      setTodayRecord({ isClockedIn: actionType === 'CLOCK_IN' });
      return;
    }

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setFeedbackMsg({
          type: data.log?.status === 'FLAGGED_OUT_OF_BOUNDS' ? 'warning' : 'success',
          text: data.message,
        });
        setTodayRecord({ isClockedIn: actionType === 'CLOCK_IN' });
      } else {
        setFeedbackMsg({ type: 'error', text: data.message || 'Submission error.' });
      }
    } catch (err: any) {
      saveToOfflineQueue(payload);
      setFeedbackMsg({
        type: 'warning',
        text: 'Network error. Attendance queued locally on your phone.',
      });
      setTodayRecord({ isClockedIn: actionType === 'CLOCK_IN' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!guard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between max-w-md mx-auto w-full text-slate-900 shadow-xl">
      <OfflineBanner onSyncComplete={() => checkRecentAttendance(guard.id)} />

      {/* Top Officer Bar */}
      <header className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 font-extrabold text-xs flex items-center justify-center font-mono border border-sky-100">
            {guard.id.slice(-3)}
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-900 leading-tight">{guard.name}</h1>
            <p className="text-[10px] text-slate-500 font-medium">Post: {guard.postName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/admin/guide"
            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-50 rounded-xl transition"
            title="System Guide & Feature Manual"
          >
            <BookOpen className="w-4 h-4" />
          </Link>
          <button
            onClick={() => router.push('/guard/history')}
            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-50 rounded-xl transition"
            title="Attendance Logs"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Action Workspace */}
      <main className="p-4 flex-1 space-y-4">
        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2 shadow-xs ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : feedbackMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{feedbackMsg.text}</div>
          </div>
        )}

        {/* Real GPS Geofence Radar Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              Live Geofence Radar
            </span>

            <button
              onClick={() => requestRealLocation()}
              disabled={gpsLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] flex items-center gap-1 border border-slate-200"
            >
              <RefreshCw className={`w-3 h-3 text-sky-600 ${gpsLoading ? 'animate-spin' : ''}`} />
              Refresh GPS
            </button>
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black ${isWithin ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {distance}m
                </span>
                <span className="text-xs text-slate-400 font-semibold">from post center</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Post Fence Limit: <b>{guard.postRadius}m</b> • Accuracy: ±{accuracy}m
              </p>
            </div>

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                isWithin
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              {isWithin ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`mt-3 py-2 px-3 rounded-xl text-center text-xs font-bold ${
              isWithin
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isWithin ? '● Inside Post Geofence Perimeter' : '⚠️ Outside Post Perimeter (Attendance Flagged)'}
          </div>

          {gpsError && (
            <p className="text-[10px] text-rose-600 mt-2 text-center font-medium">{gpsError}</p>
          )}
        </div>

        {/* Primary Attendance Clock In / Out Action */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Scheduled Shift: {guard.shiftStart} - {guard.shiftEnd}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                todayRecord.isClockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {todayRecord.isClockedIn ? 'Shift In Progress' : 'Not Clocked In'}
            </span>
          </div>

          {!todayRecord.isClockedIn ? (
            <button
              onClick={() => handleStartCapture('CLOCK_IN')}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              CLOCK IN (START SHIFT)
            </button>
          ) : (
            <button
              onClick={() => handleStartCapture('CLOCK_OUT')}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5 text-amber-400" />
              CLOCK OUT (END SHIFT)
            </button>
          )}
        </div>

        {/* PATROL TOUR CARD */}
        <div className="bg-gradient-to-tr from-sky-50 via-white to-emerald-50 rounded-3xl p-5 border border-sky-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Waypoint Patrol Rounds</h3>
                <p className="text-[11px] text-slate-500">Scheduled perimeter checks & inspections</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
              Active Module
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Verify assigned waypoints sequentially, audit inspection tasks, and capture geotagged photo proof.
          </p>

          <button
            onClick={() => router.push('/guard/patrol')}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
          >
            <span>Start Patrol Tour</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-4 text-center text-[10px] text-slate-400 border-t border-slate-100 bg-white">
        SGVS Real-Time Guard Client • High-Accuracy GPS Enabled
      </footer>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          title={actionType === 'CLOCK_IN' ? 'Clock-In Selfie Proof' : 'Clock-Out Selfie Proof'}
          initialFacingMode="user"
          watermarkData={{
            guardName: guard.name,
            guardId: guard.id,
            postName: guard.postName,
            latitude: currentLat !== null ? currentLat : guard.postLat,
            longitude: currentLng !== null ? currentLng : guard.postLng,
            timestamp: new Date().toISOString(),
            isWithin: isWithin,
            distance: distance,
          }}
          onCaptured={handleSubmitAttendance}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
}
