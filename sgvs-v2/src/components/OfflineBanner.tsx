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
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setIsSyncing(true);
        const res = await syncOfflineQueue();
        setIsSyncing(false);
        checkStatus();
        if (res.count > 0) {
          setSyncSuccessMsg(`${res.count} offline record(s) synced successfully!`);
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
      setSyncSuccessMsg(`${res.count} record(s) synced to server!`);
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
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncSuccessMsg}</span>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
            <div>
              <p className="font-bold">Offline Mode Active</p>
              <p className="text-[11px] text-amber-700">Records are queued locally on your device and will auto-sync once connected.</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold text-[10px]">
              {pendingCount} queued
            </span>
          )}
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="bg-sky-50 border-b border-sky-200 text-sky-900 text-xs px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-sky-600" />
            <div>
              <p className="font-bold">Connection Restored ({pendingCount} pending record{pendingCount > 1 ? 's' : ''})</p>
            </div>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}
    </div>
  );
}
