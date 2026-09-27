'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  MapPin,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Smartphone,
  Download,
} from 'lucide-react';

export default function AdminNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Papan Pemuka', href: '/admin', icon: LayoutDashboard },
    { label: 'Pos & Geofence', href: '/admin/posts', icon: MapPin },
    { label: 'Pengawal', href: '/admin/guards', icon: Users },
    { label: 'Siasatan Flagged', href: '/admin/flagged', icon: AlertTriangle },
    { label: 'Laporan Excel', href: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Tetapan & Telegram', href: '/admin/settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">SGVS ADMIN</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Command Center
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Kawalan Kehadiran & Pos Keselamatan</span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons: Switch to Guard View & Download APK */}
        <div className="flex items-center gap-2">
          <a
            href="/smart-guard.apk"
            download="smart-guard.apk"
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs items-center gap-1.5 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>APK Android</span>
          </a>
          <Link
            href="/guard/checkin"
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Aplikasi Pengawal (PWA)</span>
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Scrolling Nav */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
