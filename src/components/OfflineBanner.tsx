'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getOfflineQueue, syncOfflineQueue } from '@/lib/offline-sync';

export default function OfflineBanner({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const checkStatus = () => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const queue = getOfflineQueue();
      setPendingCount(queue.length);
    }
  };

  useEffect(() => {
    checkStatus();

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync when coming online
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setIsSyncing(true);
        const res = await syncOfflineQueue();
        setIsSyncing(false);
        checkStatus();
        if (res.count > 0) {
          setSyncSuccessMsg(`${res.count} rekod luar talian berjaya disegerakkan!`);
          setTimeout(() => setSyncSuccessMsg(null), 4000);
          if (onSyncComplete) onSyncComplete();
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const res = await syncOfflineQueue();
    setIsSyncing(false);
    checkStatus();
    if (res.count > 0) {
      setSyncSuccessMsg(`${res.count} rekod berjaya diselaraskan ke pelayan!`);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
      if (onSyncComplete) onSyncComplete();
    }
  };

  if (isOnline && pendingCount === 0 && !syncSuccessMsg) {
    return null;
  }

  return (
    <div className="w-full">
      {syncSuccessMsg && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncSuccessMsg}</span>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <div>
              <p className="font-bold">Mod Luar Talian (Tiada Sambungan Data)</p>
              <p className="text-[11px] text-amber-100">Rekod kehadiran disimpan dalam telefon & disegerak automatik nanti.</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-800 text-amber-100 px-2 py-0.5 rounded-full font-bold">
              {pendingCount} menunggu
            </span>
          )}
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="bg-sky-700 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-300" />
            <div>
              <p className="font-bold">Sambungan Pulih ({pendingCount} rekod belum disegerak)</p>
            </div>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="bg-white text-sky-800 hover:bg-slate-100 px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Menyelaras...' : 'Segerak Sekarang'}
          </button>
        </div>
      )}
    </div>
  );
}
