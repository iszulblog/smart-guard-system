'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, CheckSquare, Square, Sparkles } from 'lucide-react';

export default function GuardLogin() {
  const router = useRouter();
  const [guardId, setGuardId] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if previously logged in
    const saved = localStorage.getItem('sgvs_guard_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session && session.id) {
          router.push('/guard/checkin');
        }
      } catch (e) {}
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!guardId.trim()) {
      setErrorMsg('Sila masukkan ID Pengawal.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Sila masukkan PIN 4-digit.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/guard-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardId, pin }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('sgvs_guard_session', JSON.stringify(data.guard));
        if (rememberMe) {
          localStorage.setItem('sgvs_remember_guard', guardId);
        } else {
          localStorage.removeItem('sgvs_remember_guard');
        }
        router.push('/guard/checkin');
      } else {
        setErrorMsg(data.message || 'Log masuk gagal.');
      }
    } catch (err: any) {
      setErrorMsg('Ralat sambungan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for quick testing
  const selectDemoGuard = (id: string, code: string) => {
    setGuardId(id);
    setPin(code);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 text-white max-w-md mx-auto w-full">
      {/* Top Brand */}
      <div className="pt-8 pb-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-sky-600 to-sky-400 p-0.5 shadow-xl shadow-sky-900/40 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <ShieldCheck className="w-9 h-9 text-sky-400" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">SMART GUARD</h1>
        <p className="text-xs text-slate-400 mt-1">Sistem Kehadiran & Pos Kawalan Pengawal</p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              ID Pengawal
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={guardId}
                onChange={(e) => setGuardId(e.target.value.toUpperCase())}
                placeholder="Contoh: SG-101"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold tracking-wider text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              PIN Keselamatan (4-Digit)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold tracking-widest text-white placeholder-slate-600 outline-none transition text-center sm:text-left"
              />
            </div>
          </div>

          <div
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 cursor-pointer py-1 select-none"
          >
            {rememberMe ? (
              <CheckSquare className="w-4 h-4 text-sky-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-600" />
            )}
            <span className="text-xs text-slate-300">Ingat peranti ini (Auto-Login)</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-extrabold text-base shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Mengesahkan...' : 'LOG MASUK'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Demo Pickers */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Pilih Profil Ujian Pantas (Demo):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => selectDemoGuard('SG-101', '1234')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition"
            >
              <div className="font-bold text-sky-300">SG-101 (Khairul)</div>
              <div className="text-[10px] text-slate-400">Pos Utama A (Pagi)</div>
            </button>
            <button
              type="button"
              onClick={() => selectDemoGuard('SG-102', '2345')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition"
            >
              <div className="font-bold text-emerald-300">SG-102 (Firdaus)</div>
              <div className="text-[10px] text-slate-400">Pos Gate B (Pagi)</div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="py-4 text-center">
        <a
          href="/admin"
          className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-4"
        >
          Masuk ke Portal Pentadbir & HR →
        </a>
      </div>
    </div>
  );
}
