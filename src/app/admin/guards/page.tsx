'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Save, RefreshCw, Smartphone, Clock } from 'lucide-react';

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
  lastActionTime?: string;
  lastActionStatus?: string;
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
    setFormPostId(g.activePostId || '');
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
    setFormShiftStart('08:00');
    setFormShiftEnd('20:00');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formPin.trim()) {
      setMsg({ type: 'error', text: 'Sila lengkapkan ID, Nama dan PIN 4-digit.' });
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
        setMsg({ type: 'error', text: data.message || 'Gagal menyimpan maklumat pengawal.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Ralat: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Pendaftaran & Profil Pengawal Keselamatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Urus ID staf, penetapan 4-digit PIN log masuk, jadual syif bertugas, dan pos penugasan.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 transition hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          Segar Semula
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Grid: Form on Left, Guards List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Guard Form */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            {editingId ? <Edit3 className="w-5 h-5 text-sky-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
            {editingId ? 'Kemaskini Pengawal' : 'Daftar Pengawal Baharu'}
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Daftarkan telefon peribadi (BYOD) pengawal ke dalam sistem.
          </p>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                ID Pengawal (Unik) *
              </label>
              <input
                type="text"
                value={formId}
                onChange={(e) => setFormId(e.target.value.toUpperCase())}
                placeholder="Contoh: SG-105"
                disabled={!!editingId}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-2xl py-3 px-3.5 font-bold tracking-wider text-white outline-none disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Penuh *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Mohd Firdaus Bin Ismail"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-2xl py-3 px-3.5 font-semibold text-white outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  No Telefon
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="012-3456789"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  PIN 4-Digit *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-3 font-mono font-bold tracking-widest text-center text-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Pos Ditugaskan
              </label>
              <select
                value={formPostId}
                onChange={(e) => setFormPostId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-3 text-white outline-none"
              >
                <option value="">Pilih Pos Kawalan...</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mula Syif
                </label>
                <input
                  type="time"
                  value={formShiftStart}
                  onChange={(e) => setFormShiftStart(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tamat Syif
                </label>
                <input
                  type="time"
                  value={formShiftEnd}
                  onChange={(e) => setFormShiftEnd(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-3 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : editingId ? 'Simpan Profil' : 'Daftar Pengawal'}
              </button>
            </div>
          </form>
        </div>

        {/* Guards List Table */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Senarai Pengawal Keselamatan ({guards.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 px-4">Pengawal</th>
                  <th className="pb-3 px-4">Pos Kawalan</th>
                  <th className="pb-3 px-4">Syif Waktu</th>
                  <th className="pb-3 px-4">PIN Akses</th>
                  <th className="pb-3 px-4">Status Terkini</th>
                  <th className="pb-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {guards.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-white">{g.name}</div>
                      <div className="text-[11px] font-mono text-sky-400">ID: {g.id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {g.postName || <span className="text-slate-500 italic">Belum ditetapkan</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {g.shiftStart} - {g.shiftEnd}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-400 tracking-wider">
                      {g.pin}
                    </td>
                    <td className="py-3 px-4">
                      {g.lastAction === 'CLOCK_IN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Sedang Bertugas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                          Tamat Syif / Luar Waktu
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(g)}
                        className="p-1.5 rounded-lg bg-slate-800 text-sky-400 hover:bg-slate-700"
                        title="Sunting Pengawal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
