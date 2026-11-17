'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, MapPin, ShieldAlert } from 'lucide-react';
import LeafletMap from '@/components/LeafletMap';

export default function FlaggedInquiriesPage() {
  const [flaggedLogs, setFlaggedLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFlagged = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance?status=FLAGGED_OUT_OF_BOUNDS&limit=50');
      const data = await res.json();
      if (data.success) {
        setFlaggedLogs(data.logs);
        if (data.logs.length > 0 && !selectedLog) {
          setSelectedLog(data.logs[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleReviewAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedLog) return;
    setIsSubmitting(true);
    setActionMsg(null);

    try {
      const res = await fetch('/api/attendance/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: selectedLog.id,
          action,
          notes: reviewNotes,
          reviewedBy: 'OPERATIONS_SUPERVISOR',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `Log marked as ${action}.` });
        setReviewNotes('');
        fetchFlagged();
      } else {
        setActionMsg({ type: 'error', text: data.message || 'Action failed.' });
      }
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            Integrity & Out-of-Bounds Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit flagged attendance attempts outside post perimeter fences or detected by mock GPS heuristics.
          </p>
        </div>

        <button
          onClick={fetchFlagged}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flagged Queue List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pending Audit ({flaggedLogs.length})
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Action Required
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
              {flaggedLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Zero Integrity Breaches</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All officer check-ins are within post fences.</p>
                </div>
              ) : (
                flaggedLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const dateObj = new Date(log.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-3 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{log.guardName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{timeFormatted}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 truncate max-w-[150px]">{log.postName}</span>
                        <span className="text-rose-600 font-bold font-mono">
                          +{Math.round(log.distanceFromCenter)}m away
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Selected Log Forensic Detail */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          {selectedLog ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider block">
                    INCIDENT REF: {selectedLog.id}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedLog.guardName} ({selectedLog.guardId})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Out of Bounds (+{Math.round(selectedLog.distanceFromCenter)}m)
                  </span>
                </div>
              </div>

              {actionMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    actionMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {actionMsg.text}
                </div>
              )}

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo & Metadata */}
                <div className="space-y-3">
                  <div className="aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                    {selectedLog.selfieBase64 ? (
                      <img
                        src={selectedLog.selfieBase64}
                        alt="Security proof"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No photo captured</span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                    <p><b>Target Post:</b> {selectedLog.postName} (Radius: {selectedLog.postRadius || 35}m)</p>
                    <p><b>Actual Distance:</b> <span className="text-rose-600 font-bold">{Math.round(selectedLog.distanceFromCenter)} meters</span></p>
                    <p><b>GPS Accuracy:</b> ±{selectedLog.accuracy || 8}m</p>
                    <p><b>Flag Heuristic:</b> {selectedLog.reviewNotes || 'Location exceeded allowed boundary'}</p>
                  </div>
                </div>

                {/* Map & Resolution Form */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      Geofence Breach Map
                    </h4>
                    <LeafletMap
                      userLocation={{ latitude: selectedLog.latitude, longitude: selectedLog.longitude }}
                      selectedLocation={{
                        latitude: selectedLog.latitude,
                        longitude: selectedLog.longitude,
                        radius: selectedLog.postRadius || 35,
                      }}
                      height="200px"
                      zoom={17}
                    />
                  </div>

                  {/* Resolution Input */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700">Supervisor Audit Decision</label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add justification or reason (e.g. Officer was guiding emergency vehicles)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleReviewAction('REJECTED')}
                        className="flex-1 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject & Penalize
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleReviewAction('APPROVED')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Exception
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400">
              <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">Select an incident from the queue to inspect telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
