'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, CheckSquare, Square } from 'lucide-react';

export default function GuardLogin() {
  const router = useRouter();
  const [guardId, setGuardId] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sgvs_guard_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session && session.id) {
          router.push('/guard/checkin');
        }
      } catch (e) {}
    }
    const rem = localStorage.getItem('sgvs_remember_guard');
    if (rem) {
      setGuardId(rem);
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!guardId.trim()) {
      setErrorMsg('Please enter your Officer ID.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Please enter your 4-digit PIN.');
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
        setErrorMsg(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMsg('Connection error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-900 max-w-md mx-auto w-full">
      {/* Top Brand */}
      <div className="pt-10 pb-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 p-0.5 shadow-md shadow-sky-600/10 mb-3 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-sky-600" />
          </div>
        </div>
        <h1 className="text-xl font-black tracking-tight text-slate-900">SMART GUARD</h1>
        <p className="text-xs text-slate-500 mt-0.5">Field Attendance & Waypoint Patrol Portal</p>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Officer ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={guardId}
                onChange={(e) => setGuardId(e.target.value.toUpperCase())}
                placeholder="e.g. SG-101"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold tracking-wider text-slate-900 placeholder-slate-400 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Security PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold tracking-widest text-slate-900 placeholder-slate-400 outline-none transition text-center sm:text-left"
              />
            </div>
          </div>

          <div
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 cursor-pointer py-1 select-none"
          >
            {rememberMe ? (
              <CheckSquare className="w-4 h-4 text-sky-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-xs text-slate-600 font-medium">Remember this device</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-extrabold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="py-6 text-center">
        <a
          href="/admin"
          className="text-xs text-slate-500 hover:text-slate-800 transition font-medium underline underline-offset-4"
        >
          Operations & Supervisor Portal →
        </a>
      </div>
    </div>
  );
}
