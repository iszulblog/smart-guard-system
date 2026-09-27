'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, Save, RefreshCw, Layers } from 'lucide-react';
import LeafletMap, { MapPost } from '@/components/LeafletMap';

export default function PostsManagement() {
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formLat, setFormLat] = useState<number>(3.139003);
  const [formLng, setFormLng] = useState<number>(101.686855);
  const [formRadius, setFormRadius] = useState<number>(30);
  const [formDesc, setFormDesc] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setFormLat(lat);
    setFormLng(lng);
    setMsg({
      type: 'success',
      text: `Koordinat dipilih: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  };

  const handleEdit = (p: MapPost) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormLat(p.latitude);
    setFormLng(p.longitude);
    setFormRadius(p.radius);
    setFormDesc(p.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormLat(3.139003);
    setFormLng(101.686855);
    setFormRadius(30);
    setFormDesc('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setMsg({ type: 'error', text: 'Sila masukkan nama pos kawalan.' });
      return;
    }

    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name: formName,
          latitude: formLat,
          longitude: formLng,
          radius: formRadius,
          description: formDesc,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        resetForm();
        fetchPosts();
      } else {
        setMsg({ type: 'error', text: data.message || 'Gagal menyimpan pos.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Ralat: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Adakah anda pasti ingin memadam "${name}"?`)) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Pos berjaya dipadam.' });
        fetchPosts();
      }
    } catch (err) {
      alert('Ralat memadam pos.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Pengurusan Pos Kawalan & Radius Geofence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tetapkan lokasi pusat pos dan jejari perimeter (20m - 50m) secara visual di atas peta.
          </p>
        </div>

        <button
          onClick={fetchPosts}
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

      {/* Grid: Map Configurator on Left, Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map Selector */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Peta Visual Geofence Configurator
            </h2>
            <p className="text-xs text-slate-400">
              💡 <b>Klik mana-mana titik pada peta</b> untuk menetapkan koordinat pusat pos kawalan secara terus.
            </p>
          </div>

          <div className="flex-1 min-h-[420px]">
            <LeafletMap
              posts={posts}
              interactive={true}
              selectedLocation={{ latitude: formLat, longitude: formLng, radius: formRadius }}
              onLocationSelect={handleMapClick}
              zoom={16}
              height="420px"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              Jejari Geofence Semasa: <b>{formRadius} meter</b>
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Lat: {formLat.toFixed(6)}, Lng: {formLng.toFixed(6)}
            </span>
          </div>
        </div>

        {/* Post Add/Edit Form */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              {editingId ? <Edit3 className="w-5 h-5 text-sky-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
              {editingId ? 'Kemaskini Pos Kawalan' : 'Daftar Pos Kawalan Baharu'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Isi butiran pos dan selaraskan had jejari keselamatan.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Pos Kawalan *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Pos Pintu Masuk Utama C"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl py-3 px-4 text-xs font-semibold text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLat}
                    onChange={(e) => setFormLat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-3 text-xs font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLng}
                    onChange={(e) => setFormLng(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-3 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Geofence Radius Slider */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Jejari Geofence (Radius)
                  </label>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {formRadius} Meter
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={formRadius}
                  onChange={(e) => setFormRadius(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>10m (Ketat)</span>
                  <span>30m - 50m (Disyorkan)</span>
                  <span>100m (Luas)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Penerangan Kawasan / Catatan
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Catatan tugasan (cth: laluan pelawat & kad akses)..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-2.5 px-3.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-sky-900/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Daftar Pos Kawalan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Existing Guard Posts Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-400" />
          Senarai Pos Kawalan Berdaftar ({posts.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 px-4">Nama Pos</th>
                <th className="pb-3 px-4">Koordinat GPS</th>
                <th className="pb-3 px-4">Radius Geofence</th>
                <th className="pb-3 px-4">Penerangan</th>
                <th className="pb-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    {p.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                      {p.radius} m
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                    {p.description || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-800 text-sky-400 hover:bg-slate-700"
                        title="Sunting Pos"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-slate-700"
                        title="Padam Pos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
