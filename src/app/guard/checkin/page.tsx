'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  History,
  Shield,
  RefreshCw,
  SlidersHorizontal,
  Smartphone,
  CheckCircle2,
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

  // GPS & Geofence State
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(8);
  const [distance, setDistance] = useState<number>(0);
  const [isWithin, setIsWithin] = useState<boolean>(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isMockLocation, setIsMockLocation] = useState<boolean>(false);

  // Attendance State
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

  // GPS Simulation Modes for effortless desktop/client testing
  const [simMode, setSimMode] = useState<'real' | 'inside' | 'outside' | 'mock'>('inside');

  // Load Session
  useEffect(() => {
    const raw = localStorage.getItem('sgvs_guard_session');
    if (!raw) {
      router.push('/guard/login');
      return;
    }
    try {
      const parsed: GuardSession = JSON.parse(raw);
      setGuard(parsed);
      // Initialize with coordinates near assigned post
      updateLocationCoordinates(parsed.postLat, parsed.postLng, 'inside', parsed);
    } catch (e) {
      router.push('/guard/login');
    }
  }, [router]);

  const updateLocationCoordinates = (
    baseLat: number,
    baseLng: number,
    mode: 'real' | 'inside' | 'outside' | 'mock',
    currentGuard?: GuardSession
  ) => {
    const targetGuard = currentGuard || guard;
    if (!targetGuard) return;

    let targetLat = baseLat;
    let targetLng = baseLng;
    let isMock = false;

    if (mode === 'inside') {
      // 12 meters from post center
      targetLat = baseLat + 0.00008;
      targetLng = baseLng + 0.00008;
    } else if (mode === 'outside') {
      // 85 meters outside post perimeter
      targetLat = baseLat + 0.00080;
      targetLng = baseLng + 0.00080;
    } else if (mode === 'mock') {
      targetLat = baseLat + 0.00010;
      targetLng = baseLng + 0.00010;
      isMock = true;
    }

    setCurrentLat(targetLat);
    setCurrentLng(targetLng);
    setIsMockLocation(isMock);

    const dist = calculateDistance(targetLat, targetLng, targetGuard.postLat, targetGuard.postLng);
    setDistance(dist);
    setIsWithin(dist <= targetGuard.postRadius && !isMock);
  };

  const fetchRealGps = () => {
    if (!navigator.geolocation) {
      alert('Peranti anda tidak menyokong fungsi GPS.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setAccuracy(accuracy || 5);
        setSimMode('real');
        setIsMockLocation(false);

        if (guard) {
          const dist = calculateDistance(latitude, longitude, guard.postLat, guard.postLng);
          setDistance(dist);
          setIsWithin(dist <= guard.postRadius);
        }
      },
      (err) => {
        setGpsLoading(false);
        alert('Gagal membaca GPS: ' + err.message + '. Sila gunakan mod simulasi di bawah.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSimChange = (newMode: 'real' | 'inside' | 'outside' | 'mock') => {
    setSimMode(newMode);
    if (!guard) return;
    if (newMode === 'real') {
      fetchRealGps();
    } else {
      updateLocationCoordinates(guard.postLat, guard.postLng, newMode);
    }
  };

  const handleActionClick = (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setActionType(type);
    setIsCameraOpen(true);
  };

  const handleSelfieCaptured = async (watermarkedBase64: string) => {
    setIsCameraOpen(false);
    if (!guard || currentLat === null || currentLng === null) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const payload = {
      guardId: guard.id,
      postId: guard.activePostId,
      type: actionType,
      latitude: currentLat,
      longitude: currentLng,
      accuracy,
      selfieBase64: watermarkedBase64,
      isMockLocation: isMockLocation ? 1 : 0,
      clientTimestamp: new Date().toISOString(),
    };

    // If device is offline, save directly to offline queue
    if (!navigator.onLine) {
      saveToOfflineQueue({
        id: `OFFLINE-${Date.now()}`,
        ...payload,
      });

      setTodayRecord((prev) => ({
        ...prev,
        isClockedIn: actionType === 'CLOCK_IN',
        clockInTime: actionType === 'CLOCK_IN' ? new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) : prev.clockInTime,
        status: isWithin ? 'Disimpan Luar Talian (Sah)' : 'Disimpan Luar Talian (Flagged)',
      }));

      setFeedbackMsg({
        type: 'warning',
        text: 'Tiada talian internet. Rekod kehadiran disimpan dalam telefon dan akan dihantar sebaik talian pulih.',
      });
      setIsSubmitting(false);
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
        const timeNow = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
        if (actionType === 'CLOCK_IN') {
          setTodayRecord({
            isClockedIn: true,
            clockInTime: timeNow,
            status: data.isWithinGeofence ? 'Sedang Bertugas (Tepat)' : 'Flagged (Luar Sempadan)',
          });
        } else {
          setTodayRecord((prev) => ({
            ...prev,
            isClockedIn: false,
            clockOutTime: timeNow,
            status: 'Tamat Syif',
          }));
        }

        setFeedbackMsg({
          type: data.isWithinGeofence ? 'success' : 'warning',
          text: data.message,
        });
      } else {
        setFeedbackMsg({
          type: 'error',
          text: data.message || 'Gagal memproses kehadiran.',
        });
      }
    } catch (err: any) {
      // In case of sudden network drop, fallback to offline queue
      saveToOfflineQueue({
        id: `OFFLINE-${Date.now()}`,
        ...payload,
      });
      setFeedbackMsg({
        type: 'warning',
        text: 'Sambungan terputus. Rekod kehadiran telah selamat disimpan dalam peranti (Mod Luar Talian).',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sgvs_guard_session');
    router.push('/guard/login');
  };

  if (!guard) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between max-w-md mx-auto w-full text-white shadow-2xl relative">
      {/* Offline Status Banner */}
      <OfflineBanner />

      {/* Top Header App Bar */}
      <header className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white">SMART GUARD APP</h1>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Talian: Stabil & Aktif
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
          title="Log Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Guard Shift Profile Card */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl"></div>

          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selamat Bertugas,
              </span>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {guard.name}
              </h2>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 text-xs font-mono font-bold">
                ID: {guard.id}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/70 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Pos Ditugaskan:</span>
              <span className="font-bold text-slate-200 truncate block">{guard.postName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Waktu Syif:</span>
              <span className="font-bold text-slate-200 block">{guard.shiftStart} - {guard.shiftEnd}</span>
            </div>
          </div>
        </section>

        {/* GPS Geofence Status Badge */}
        <section
          className={`border-2 rounded-3xl p-5 shadow-xl transition-all duration-300 ${
            isWithin
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-950/20'
              : 'bg-rose-950/40 border-rose-500/50 shadow-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className={`w-4 h-4 ${isWithin ? 'text-emerald-400' : 'text-rose-400'}`} />
              STATUS LOKASI ANDA:
            </span>
            <button
              onClick={fetchRealGps}
              disabled={gpsLoading}
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
              Imbas Semula GPS
            </button>
          </div>

          {isWithin ? (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-emerald-300">
                  [✓] DALAM KAWASAN POS
                </p>
                <p className="text-xs text-emerald-200/80">
                  Jarak: {distance}m dari pusat pos (Had jejari: {guard.postRadius}m)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-rose-300">
                  [!] DI LUAR KAWASAN POS
                </p>
                <p className="text-xs text-rose-200/80">
                  {isMockLocation
                    ? 'Aplikasi Mock GPS dikesan aktif pada telefon!'
                    : `Jarak dikesan: ${distance}m (Melebihi had pos ${guard.postRadius}m)`}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : feedbackMsg.type === 'warning'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* GIANT ACTION BUTTON (CLOCK-IN / CLOCK-OUT) */}
        <section className="my-auto py-2">
          {!todayRecord.isClockedIn ? (
            <button
              onClick={() => handleActionClick('CLOCK_IN')}
              disabled={isSubmitting}
              className={`w-full py-8 px-6 rounded-3xl font-black text-lg tracking-wider text-white shadow-2xl transition-all duration-200 flex flex-col items-center justify-center gap-2 group active:scale-95 ${
                isWithin
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 shadow-emerald-950/60 border-2 border-emerald-400/50'
                  : 'bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 shadow-amber-950/60 border-2 border-amber-400/50'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-1 shadow-inner">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black">
                MASUK BERTUGAS
              </span>
              <span className="text-xs uppercase tracking-widest text-emerald-100 font-semibold">
                (CLOCK-IN SYIF) • TEKAN UNTUK SWAFOTO
              </span>
            </button>
          ) : (
            <button
              onClick={() => handleActionClick('CLOCK_OUT')}
              disabled={isSubmitting}
              className="w-full py-8 px-6 rounded-3xl font-black text-lg tracking-wider text-white shadow-2xl transition-all duration-200 flex flex-col items-center justify-center gap-2 group active:scale-95 bg-gradient-to-b from-sky-600 to-sky-800 hover:from-sky-500 hover:to-sky-700 shadow-sky-950/60 border-2 border-sky-400/50"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-1 shadow-inner">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black">
                KELUAR BERTUGAS
              </span>
              <span className="text-xs uppercase tracking-widest text-sky-100 font-semibold">
                (CLOCK-OUT SYIF) • PENGESAHAN TAMAT
              </span>
            </button>
          )}
        </section>

        {/* Record Summary Card */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Rekod Hari Ini:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                todayRecord.isClockedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {todayRecord.isClockedIn ? 'Sedang Bertugas' : 'Belum Masuk Syif'}
            </span>
          </div>

          <div className="space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Masuk Syif:</span>
              <span className="font-bold text-slate-200">
                {todayRecord.clockInTime ? `${todayRecord.clockInTime} (Direkodkan)` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status Kehadiran:</span>
              <span className="font-bold text-emerald-400">
                {todayRecord.status || 'Menunggu Pengesahan'}
              </span>
            </div>
          </div>
        </section>

        {/* GPS Testing & Demo Simulator Switcher */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-400 text-[11px] flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-sky-400" />
              Alat Ujian GPS (Simulasi Lokasi):
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              onClick={() => handleSimChange('inside')}
              className={`p-2 rounded-xl font-bold transition text-center ${
                simMode === 'inside'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ✓ Di Dalam Pos
            </button>
            <button
              onClick={() => handleSimChange('outside')}
              className={`p-2 rounded-xl font-bold transition text-center ${
                simMode === 'outside'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ✗ Luar Pos (85m)
            </button>
            <button
              onClick={() => handleSimChange('mock')}
              className={`p-2 rounded-xl font-bold transition text-center ${
                simMode === 'mock'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ⚠ Mock GPS
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Sticky Navigation */}
      <nav className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-around text-xs sticky bottom-0 z-20 backdrop-blur-md">
        <button className="flex flex-col items-center gap-1 text-sky-400 font-bold">
          <Shield className="w-5 h-5" />
          <span>Utama</span>
        </button>
        <button
          onClick={() => router.push('/guard/history')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition"
        >
          <History className="w-5 h-5" />
          <span>Sejarah Hadir</span>
        </button>
        <button
          onClick={() => router.push('/admin')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Admin Web</span>
        </button>
      </nav>

      {/* Camera Swafoto Modal Overlay */}
      {isCameraOpen && (
        <CameraCapture
          watermarkData={{
            guardName: guard.name,
            guardId: guard.id,
            postName: guard.postName,
            latitude: currentLat || 0,
            longitude: currentLng || 0,
            timestamp: new Date().toISOString(),
            isWithin: isWithin,
            distance: distance,
          }}
          onCaptured={handleSelfieCaptured}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
}
