'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Filter, RefreshCw, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = '/api/attendance?limit=150';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadExcel = () => {
    let url = '/api/reports';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    window.open(url, '_blank');
  };

  const filteredLogs = logs.filter((log) => {
    const logDate = log.timestamp.split('T')[0];
    if (startDate && logDate < startDate) return false;
    if (endDate && logDate > endDate) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            Laporan Kehadiran & Eksport Microsoft Excel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Jana helaian kehadiran dan rekod syif secara terus untuk pengiraan gaji, elaun, dan audit HR.
          </p>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition"
        >
          <Download className="w-4 h-4" />
          Muat Turun Fail Excel (.xlsx)
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-300">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Hingga:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-slate-400 hover:text-white underline text-xs ml-2"
            >
              Reset Tarikh
            </button>
          )}
        </div>

        <div className="text-slate-400">
          Jumlah Rekod Dipaparkan: <b className="text-white">{filteredLogs.length}</b>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4">
          Pratonton Rekod Helaian (.xlsx Preview)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 px-3">Tarikh / Masa</th>
                <th className="pb-3 px-3">Pengawal</th>
                <th className="pb-3 px-3">Pos Kawalan</th>
                <th className="pb-3 px-3">Tindakan</th>
                <th className="pb-3 px-3">Jarak Pos</th>
                <th className="pb-3 px-3">Status Lokasi</th>
                <th className="pb-3 px-3">Status Kehadiran</th>
                <th className="pb-3 px-3">Semakan Penyelia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tiada rekod pada tarikh yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => {
                  const dateObj = new Date(item.timestamp);
                  const dateStr = dateObj.toLocaleDateString('ms-MY');
                  const timeStr = dateObj.toLocaleTimeString('ms-MY', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition font-medium">
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {dateStr} <br />
                        <span className="text-[10px] text-slate-500">{timeStr}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{item.guardName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.guardId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{item.postName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.type === 'CLOCK_IN'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {item.type === 'CLOCK_IN' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {item.distanceFromCenter} m
                      </td>
                      <td className="py-3 px-3">
                        {item.isWithinGeofence ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">
                            ● Dalam Pos
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold text-[11px]">
                            ▲ Luar Radius
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] ${
                            item.status === 'ON_TIME'
                              ? 'text-emerald-400'
                              : item.status === 'LATE'
                              ? 'text-amber-400'
                              : 'text-rose-400 font-bold'
                          }`}
                        >
                          {item.status === 'ON_TIME'
                            ? 'Tepat Waktu'
                            : item.status === 'LATE'
                            ? 'Lewat'
                            : 'Flagged'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.reviewStatus === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : item.reviewStatus === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {item.reviewStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
