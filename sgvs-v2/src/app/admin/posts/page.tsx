'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Compass,
  CheckSquare,
  X,
  ListPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import LeafletMap, { MapPost, MapCheckpoint } from '@/components/LeafletMap';

export default function PostsManagement() {
  const [activeTab, setActiveTab] = useState<'posts' | 'checkpoints'>('posts');

  // Guard Posts State
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [postMsg, setPostMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Post Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formPostName, setFormPostName] = useState('');
  const [formPostLat, setFormPostLat] = useState<number>(3.139003);
  const [formPostLng, setFormPostLng] = useState<number>(101.686855);
  const [formPostRadius, setFormPostRadius] = useState<number>(35);
  const [formPostDesc, setFormPostDesc] = useState('');

  // Patrol Checkpoints State
  const [checkpoints, setCheckpoints] = useState<MapCheckpoint[]>([]);
  const [selectedPostIdForPatrol, setSelectedPostIdForPatrol] = useState<string>('');
  const [isSavingCp, setIsSavingCp] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Checkpoint Form State
  const [editingCpId, setEditingCpId] = useState<string | null>(null);
  const [formCpName, setFormCpName] = useState('');
  const [formCpLat, setFormCpLat] = useState<number>(3.13905);
  const [formCpLng, setFormCpLng] = useState<number>(101.6869);
  const [formCpRadius, setFormCpRadius] = useState<number>(20);
  const [formCpSeq, setFormCpSeq] = useState<number>(1);
  const [formTasks, setFormTasks] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPosts, resCp] = await Promise.all([fetch('/api/posts'), fetch('/api/patrol/checkpoints')]);
      const [dataPosts, dataCp] = await Promise.all([resPosts.json(), resCp.json()]);

      if (dataPosts.success) {
        setPosts(dataPosts.posts || []);
        if (dataPosts.posts.length > 0 && !selectedPostIdForPatrol) {
          setSelectedPostIdForPatrol(dataPosts.posts[0].id);
        }
      }
      if (dataCp.success) {
        setCheckpoints(dataCp.checkpoints || []);
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

  // Map Click Handler
  const handleMapClick = (lat: number, lng: number) => {
    if (activeTab === 'posts') {
      setFormPostLat(lat);
      setFormPostLng(lng);
      setPostMsg({
        type: 'success',
        text: `Post location set: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    } else {
      setFormCpLat(lat);
      setFormCpLng(lng);
      setCpMsg({
        type: 'success',
        text: `Waypoint coordinate pinned: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    }
  };

  // Guard Post Handlers
  const handleEditPost = (p: MapPost) => {
    setEditingPostId(p.id);
    setFormPostName(p.name);
    setFormPostLat(p.latitude);
    setFormPostLng(p.longitude);
    setFormPostRadius(p.radius);
    setFormPostDesc(p.description || '');
    setActiveTab('posts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPostForm = () => {
    setEditingPostId(null);
    setFormPostName('');
    setFormPostLat(3.139003);
    setFormPostLng(101.686855);
    setFormPostRadius(35);
    setFormPostDesc('');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPostName.trim()) {
      setPostMsg({ type: 'error', text: 'Please enter post name.' });
      return;
    }

    setIsSavingPost(true);
    setPostMsg(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPostId,
          name: formPostName,
          latitude: formPostLat,
          longitude: formPostLng,
          radius: formPostRadius,
          description: formPostDesc,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPostMsg({ type: 'success', text: data.message });
        resetPostForm();
        fetchData();
      } else {
        setPostMsg({ type: 'error', text: data.message || 'Failed to save guard post.' });
      }
    } catch (err: any) {
      setPostMsg({ type: 'error', text: err.message });
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guard post?')) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Patrol Checkpoint Handlers
  const filteredCheckpoints = checkpoints.filter((cp: any) => cp.postId === selectedPostIdForPatrol);

  const handleEditCp = (cp: any) => {
    setEditingCpId(cp.id);
    setFormCpName(cp.name);
    setFormCpLat(cp.latitude);
    setFormCpLng(cp.longitude);
    setFormCpRadius(cp.radius);
    setFormCpSeq(cp.sequence);
    setFormTasks(cp.requiredTasks || []);
    setActiveTab('checkpoints');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetCpForm = () => {
    setEditingCpId(null);
    setFormCpName('');
    const targetPost = posts.find((p) => p.id === selectedPostIdForPatrol);
    setFormCpLat(targetPost ? targetPost.latitude : 3.13905);
    setFormCpLng(targetPost ? targetPost.longitude : 101.6869);
    setFormCpRadius(20);
    setFormCpSeq(filteredCheckpoints.length + 1);
    setFormTasks([]);
    setTaskInput('');
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    setFormTasks([...formTasks, taskInput.trim()]);
    setTaskInput('');
  };

  const handleRemoveTask = (index: number) => {
    setFormTasks(formTasks.filter((_, i) => i !== index));
  };

  const addPresetTask = (task: string) => {
    if (!formTasks.includes(task)) {
      setFormTasks([...formTasks, task]);
    }
  };

  const handleSaveCp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCpName.trim()) {
      setCpMsg({ type: 'error', text: 'Please enter checkpoint name.' });
      return;
    }
    if (!selectedPostIdForPatrol) {
      setCpMsg({ type: 'error', text: 'Please select a guard post.' });
      return;
    }

    setIsSavingCp(true);
    setCpMsg(null);

    try {
      const res = await fetch('/api/patrol/checkpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCpId,
          postId: selectedPostIdForPatrol,
          name: formCpName,
          latitude: formCpLat,
          longitude: formCpLng,
          radius: formCpRadius,
          sequence: formCpSeq,
          requiredTasks: formTasks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCpMsg({ type: 'success', text: data.message });
        resetCpForm();
        fetchData();
      } else {
        setCpMsg({ type: 'error', text: data.message || 'Failed to save checkpoint.' });
      }
    } catch (err: any) {
      setCpMsg({ type: 'error', text: err.message });
    } finally {
      setIsSavingCp(false);
    }
  };

  const handleDeleteCp = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patrol waypoint?')) return;
    try {
      const res = await fetch(`/api/patrol/checkpoints?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Perimeter Posts & Patrol Routes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define guard posts, geofence radius buffers, and step-by-step waypoint checklists for officers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'posts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            Guard Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'checkpoints'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Patrol Waypoints ({checkpoints.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GUARD POSTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingPostId ? 'Edit Guard Post' : 'Add New Guard Post'}
                </h2>
              </div>
              {editingPostId && (
                <button onClick={resetPostForm} className="text-xs text-slate-400 hover:text-slate-600">
                  Cancel
                </button>
              )}
            </div>

            {postMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  postMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {postMsg.text}
              </div>
            )}

            <form onSubmit={handleSavePost} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Name & Identifier</label>
                <input
                  type="text"
                  value={formPostName}
                  onChange={(e) => setFormPostName(e.target.value)}
                  placeholder="e.g. Main Command Gate - Alpha"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Geofence Radius: <span className="text-sky-700">{formPostRadius} meters</span>
                </label>
                <input
                  type="range"
                  min={15}
                  max={100}
                  step={5}
                  value={formPostRadius}
                  onChange={(e) => setFormPostRadius(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>15m (Tight Gate)</span>
                  <span>50m (Building)</span>
                  <span>100m (Perimeter)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formPostLat}
                    onChange={(e) => setFormPostLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formPostLng}
                    onChange={(e) => setFormPostLng(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Description</label>
                <textarea
                  rows={2}
                  value={formPostDesc}
                  onChange={(e) => setFormPostDesc(e.target.value)}
                  placeholder="e.g. Primary visitor reception barrier & staff badge check"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                💡 <b>Tip:</b> Click anywhere on the map to set post center coordinates automatically.
              </p>

              <button
                type="submit"
                disabled={isSavingPost}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSavingPost ? 'Saving...' : editingPostId ? 'Update Post' : 'Create Guard Post'}
              </button>
            </form>
          </div>

          {/* Map Preview & List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
              <LeafletMap
                posts={posts}
                interactive={true}
                selectedLocation={{ latitude: formPostLat, longitude: formPostLng, radius: formPostRadius }}
                onLocationSelect={handleMapClick}
                height="320px"
              />
            </div>

            {/* Posts Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posts.map((post: any) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 font-mono block">{post.id}</span>
                      <h3 className="text-sm font-bold text-slate-900">{post.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      Radius: {post.radius}m
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                    {post.description || 'No description added.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {post.assignedGuardsCount || 0} guard(s) assigned
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedPostIdForPatrol(post.id);
                          setActiveTab('checkpoints');
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1"
                        title="Configure Checkpoints"
                      >
                        <Compass className="w-3 h-3" />
                        Patrols
                      </button>
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PATROL WAYPOINTS & CHECKLIST BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'checkpoints' && (
        <div className="space-y-6">
          {/* Post Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Select Post for Patrol Route Setup</h3>
                <p className="text-[11px] text-slate-500">Configure what waypoints and tasks guards must inspect.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedPostIdForPatrol}
                onChange={(e) => {
                  setSelectedPostIdForPatrol(e.target.value);
                  resetCpForm();
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 w-full sm:w-64"
              >
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkpoint Builder Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    {editingCpId ? 'Edit Waypoint' : 'Add Patrol Waypoint'}
                  </h2>
                </div>
                {editingCpId && (
                  <button onClick={resetCpForm} className="text-xs text-slate-400 hover:text-slate-600">
                    Cancel
                  </button>
                )}
              </div>

              {cpMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    cpMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {cpMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveCp} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waypoint Name</label>
                  <input
                    type="text"
                    value={formCpName}
                    onChange={(e) => setFormCpName(e.target.value)}
                    placeholder="e.g. East Emergency Stairwell & Fire Panel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sequence Order</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formCpSeq}
                      onChange={(e) => setFormCpSeq(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fence Radius (m)</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      step={5}
                      value={formCpRadius}
                      onChange={(e) => setFormCpRadius(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formCpLat}
                      onChange={(e) => setFormCpLat(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formCpLng}
                      onChange={(e) => setFormCpLng(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Tasks Checklist Builder */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Inspection Checklist Tasks ({formTasks.length})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Officer must check off</span>
                  </label>

                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTask();
                        }
                      }}
                      placeholder="Add custom task (e.g. Inspect fire gauge)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {[
                      'Verify door padlock locked',
                      'Check emergency exit unblocked',
                      'Inspect fire extinguisher gauge',
                      'Check perimeter fence mesh',
                      'Listen for unusual pump/generator noise',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addPresetTask(preset)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  {/* Task List Items */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {formTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{t}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          className="text-slate-400 hover:text-rose-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingCp}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingCp ? 'Saving...' : editingCpId ? 'Update Waypoint' : 'Add Waypoint to Route'}
                </button>
              </form>
            </div>

            {/* Map & Checkpoints List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
                <LeafletMap
                  posts={posts.filter((p) => p.id === selectedPostIdForPatrol)}
                  checkpoints={filteredCheckpoints}
                  showRouteLine={true}
                  interactive={true}
                  selectedLocation={{ latitude: formCpLat, longitude: formCpLng, radius: formCpRadius }}
                  onLocationSelect={handleMapClick}
                  height="300px"
                />
              </div>

              {/* Waypoints Sequence List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">
                    Patrol Route Sequence ({filteredCheckpoints.length} waypoints)
                  </h3>
                  <span className="text-[11px] text-slate-400">Guards visit sequentially</span>
                </div>

                {filteredCheckpoints.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Compass className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">No patrol waypoints configured for this post.</p>
                    <p className="text-[11px] text-slate-400">Use the form on the left or click the map to add one.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCheckpoints.map((cp: any) => (
                      <div
                        key={cp.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 hover:bg-slate-100/60 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {cp.sequence}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{cp.name}</h4>
                            <p className="text-[11px] text-slate-500">
                              Radius: {cp.radius}m • Lat: {cp.latitude.toFixed(6)}, Lng: {cp.longitude.toFixed(6)}
                            </p>

                            {cp.requiredTasks && cp.requiredTasks.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {cp.requiredTasks.map((task: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-medium"
                                  >
                                    ✓ {task}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditCp(cp)}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
                            title="Edit Waypoint"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCp(cp.id)}
                            className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Delete Waypoint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
