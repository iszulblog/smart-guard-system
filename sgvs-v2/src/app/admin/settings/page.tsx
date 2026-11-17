'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Send, ShieldCheck, CheckCircle2, BellRing, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    telegram_bot_token: '',
    telegram_chat_id: '',
    grace_period_mins: '15',
    enable_mock_detection: '1',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'System settings saved successfully.' });
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to save settings.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" />
          System Settings & Integrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure real-time Telegram incident alerts, shift grace windows, and GPS integrity heuristics.
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Telegram Alerts */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Telegram Bot Notifications</h2>
              <p className="text-[11px] text-slate-500">Instant security alerts dispatched to supervisor chat channels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                value={settings.telegram_bot_token}
                onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Channel / Group Chat ID</label>
              <input
                type="text"
                value={settings.telegram_chat_id}
                onChange={(e) => handleChange('telegram_chat_id', e.target.value)}
                placeholder="-1001234567890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Attendance Compliance Rules */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Compliance & Anti-Spoofing Rules</h2>
              <p className="text-[11px] text-slate-500">Heuristics for late arrival tolerance and mock location detection.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shift Grace Window (Minutes)</label>
              <input
                type="number"
                min={0}
                max={60}
                value={settings.grace_period_mins}
                onChange={(e) => handleChange('grace_period_mins', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-sky-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Arrivals beyond this window are flagged as LATE.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mock Location Detection</label>
              <select
                value={settings.enable_mock_detection}
                onChange={(e) => handleChange('enable_mock_detection', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-sky-500 outline-none"
              >
                <option value="1">Enabled (Flag fake GPS apps)</option>
                <option value="0">Disabled (Permissive testing)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Settings...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
