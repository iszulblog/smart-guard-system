'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Send, Save, BellRing, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [gracePeriod, setGracePeriod] = useState('15');
  const [enableMockDetection, setEnableMockDetection] = useState(true);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setTelegramToken(data.settings.telegram_bot_token || '');
          setTelegramChatId(data.settings.telegram_chat_id || '');
          setGracePeriod(data.settings.grace_period_mins || '15');
          setEnableMockDetection(data.settings.enable_mock_detection !== '0');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            telegram_bot_token: telegramToken,
            telegram_chat_id: telegramChatId,
            grace_period_mins: gracePeriod,
            enable_mock_detection: enableMockDetection ? '1' : '0',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Tetapan sistem berjaya disimpan!' });
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Ralat: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTesting(true);
    setMsg(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            telegram_bot_token: telegramToken,
            telegram_chat_id: telegramChatId,
          },
          testAlert: true,
        }),
      });

      const data = await res.json();
      if (data.telegramResult?.success) {
        setMsg({
          type: 'success',
          text: '✓ Mesej ujian amaran berjaya dihantar ke kumpulan Telegram anda!',
        });
      } else {
        setMsg({
          type: 'error',
          text: 'Ralat penghantaran Telegram: ' + (data.telegramResult?.error || data.message),
        });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Ralat sambungan: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          Tetapan Sistem & Integrasi Notifikasi Telegram
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Konfigurasikan enjin amaran automatik, had toleransi masa syif, dan keselamatan anti-spoofing.
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Telegram Bot Integration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-sky-400" />
                Integrasi Telegram Bot (Enjin Amaran Segera)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mesej automatik dihantar terus ke kumpulan operasi penyelia sekiranya berlaku percubaan log luar kawasan atau kelewatan syif.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
              100% Percuma Tanpa Had
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Telegram Bot Token
              </label>
              <input
                type="text"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="Contoh: 7123456789:ABCDefGhIJklMnOpQrStUvWxYz"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-2xl py-3 px-4 font-mono text-white outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Dapatkan token daripada @BotFather di Telegram secara percuma.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Telegram Chat ID / Group ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="Contoh: -100123456789 atau ID peribadi"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-2xl py-3 px-4 font-mono text-white outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                ID kumpulan operasi penyelia di mana bot dimasukkan sebagai pentadbir.
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={isTesting || !telegramToken || !telegramChatId}
              className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              {isTesting ? 'Menghantar Ujian...' : 'Uji Hantar Mesej Amaran'}
            </button>
            <span className="text-[11px] text-slate-400">
              Ujian akan menghantar simulasi amaran insiden luar perimeter ke Telegram.
            </span>
          </div>
        </div>

        {/* Card 2: Shift & Security Rules */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Peraturan Syif & Kawalan Integriti
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Tempoh Toleransi Kelewatan (Minit)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-4 text-white font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Pengawal dikira lewat sekiranya log masuk melebihi had minit ini selepas masa mula syif.
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <input
                  type="checkbox"
                  checked={enableMockDetection}
                  onChange={(e) => setEnableMockDetection(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <div>
                  <span className="font-bold text-slate-200 block text-xs">
                    Pengesanan Perisian Mock Location
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Tandakan cubaan *Fake GPS* sebagai insiden *flagged*.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Tetapan'}
          </button>
        </div>
      </form>
    </div>
  );
}
