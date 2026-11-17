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
  Compass,
} from 'lucide-react';

export default function AdminNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Posts & Patrols', href: '/admin/posts', icon: Compass },
    { label: 'Guards', href: '/admin/guards', icon: Users },
    { label: 'Audit Flags', href: '/admin/flagged', icon: AlertTriangle },
    { label: 'Reports', href: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">SGVS</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  Command Center
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block -mt-0.5">Verification & Patrol System</span>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-slate-100 text-sky-700 border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/smart-guard.apk"
            download="smart-guard.apk"
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs items-center gap-1.5 border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Android APK</span>
          </a>
          <Link
            href="/guard/login"
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Guard App</span>
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Scrolling Nav */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50/80 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition ${
                isActive
                  ? 'bg-white text-sky-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
