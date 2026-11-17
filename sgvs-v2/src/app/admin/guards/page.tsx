'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Save, RefreshCw, Smartphone, Clock, ShieldCheck } from 'lucide-react';

interface Guard {
  id: string;
  name: string;
  phone: string;
  pin: string;
  activePostId: string;
  postName?: string;
  shiftStart: string;
  shiftEnd: string;
  status: string;
  lastAction?: string;
}

interface Post {
  id: string;
  name: string;
}

export default function GuardsManagement() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formPostId, setFormPostId] = useState('');
  const [formShiftStart, setFormShiftStart] = useState('08:00');
  const [formShiftEnd, setFormShiftEnd] = useState('20:00');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resG, resP] = await Promise.all([fetch('/api/guards'), fetch('/api/posts')]);
      const [dataG, dataP] = await Promise.all([resG.json(), resP.json()]);

      if (dataG.success) setGuards(dataG.guards);
      if (dataP.success) {
        setPosts(dataP.posts);
        if (dataP.posts.length > 0 && !formPostId) {
          setFormPostId(dataP.posts[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (g: Guard) => {
    setEditingId(g.id);
    setFormId(g.id);
    setFormName(g.name);
    setFormPhone(g.phone || '');
    setFormPin(g.pin);
    setFormPostId(g.activePostId || (posts[0] ? posts[0].id : ''));
    setFormShiftStart(g.shiftStart || '08:00');
    setFormShiftEnd(g.shiftEnd || '20:00');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormId('');
    setFormName('');
    setFormPhone('');
    setFormPin('');
    setFormPostId(posts[0] ? posts[0].id : '');
    setFormShiftStart('08:00');
    setFormShiftEnd('20:00');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formPin.trim()) {
      setMsg({ type: 'error', text: 'Please complete Officer ID, Full Name, and PIN.' });
      return;
    }

    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formId,
          name: formName,
          phone: formPhone,
          pin: formPin,
          activePostId: formPostId,
          shiftStart: formShiftStart,
          shiftEnd: formShiftEnd,
          status: 'ACTIVE',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        resetForm();
        fetchData();
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to save guard.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Security Guard Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage officer profiles, login PIN credentials, post assignments, and scheduled shift hours.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {editingId ? 'Edit Officer Profile' : 'Enroll New Officer'}
              </h2>
            </div>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600">
                Cancel
              </button>
            )}
          </div>

          {msg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guard ID</label>
                <input
                  type="text"
                  value={formId}
                  disabled={!!editingId}
                  onChange={(e) => setFormId(e.target.value.toUpperCase())}
                  placeholder="e.g. SG-105"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs text-center focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Officer Full Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. MOHD KHAIRUL ISMAIL"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Contact</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +6012-3456789"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Guard Post</label>
              <select
                value={formPostId}
                onChange={(e) => setFormPostId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:bg-white focus:border-sky-500 outline-none"
              >
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Start</label>
                <input
                  type="time"
                  value={formShiftStart}
                  onChange={(e) => setFormShiftStart(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift End</label>
                <input
                  type="time"
                  value={formShiftEnd}
                  onChange={(e) => setFormShiftEnd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : editingId ? 'Update Officer' : 'Enroll Officer'}
            </button>
          </form>
        </div>

        {/* Guards Roster Cards */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {guards.map((guard) => {
              const isOnDuty = guard.lastAction === 'CLOCK_IN';

              return (
                <div
                  key={guard.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 font-mono font-black text-xs flex items-center justify-center">
                          {guard.id.slice(-3)}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{guard.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {guard.id}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOnDuty
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOnDuty ? '● On-Duty' : '○ Off-Duty'}
                      </span>
                    </div>

                    <div className="space-y-1 my-3 text-[11px] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                        <span>Post: <b>{guard.postName || 'Unassigned'}</b></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Shift: {guard.shiftStart} - {guard.shiftEnd}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{guard.phone || 'No phone'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">PIN: ••••</span>
                    <button
                      onClick={() => handleEdit(guard)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1 border border-slate-200"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
