'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, RefreshCw, Calendar, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';

export default function ReportsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [patrols, setPatrols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [resLogs, resPatrols] = await Promise.all([
        fetch('/api/attendance?limit=200'),
        fetch('/api/patrol/runs?limit=100'),
      ]);
      const [dataLogs, dataPatrols] = await Promise.all([resLogs.json(), resPatrols.json()]);

      if (dataLogs.success) setLogs(dataLogs.logs);
      if (dataPatrols.success) setPatrols(dataPatrols.runs);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Audit Reports & Microsoft Excel Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Export comprehensive security telemetry, attendance timestamps, and patrol tour records for payroll and compliance audits.
          </p>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          Export Excel (.xlsx)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 outline-none focus:border-sky-500"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Reset Filters
            </button>
          )}
          <span className="text-slate-500 font-semibold">
            Showing {filteredLogs.length} record(s)
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Sheet 1: Attendance Logs</span>
              <h4 className="text-sm font-bold text-slate-900">{filteredLogs.length} Verified Records</h4>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Included in Excel
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Sheet 2: Patrol Rounds</span>
              <h4 className="text-sm font-bold text-slate-900">{patrols.length} Waypoint Tours</h4>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Included in Excel
          </span>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Workbook Preview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Guard Name</th>
                <th className="py-2.5 px-3">Guard Post</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No records found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 15).map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const dateStr = dateObj.toLocaleDateString('en-GB');
                  const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{dateStr}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{timeStr}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{log.guardName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.postName}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            log.type === 'CLOCK_IN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {log.type === 'CLOCK_IN' ? 'Clock In' : 'Clock Out'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {Math.round(log.distanceFromCenter)}m
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'ON_TIME'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {log.status}
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
