/**
 * Offline-First Queue and Auto-Synchronization Utility for Guards
 */

export interface QueuedAttendanceLog {
  id: string;
  guardId: string;
  postId: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  latitude: number;
  longitude: number;
  accuracy: number;
  selfieBase64: string;
  clientTimestamp: string;
  isMockLocation?: number;
}

const STORAGE_KEY = 'sgvs_offline_queue';

export function getOfflineQueue(): QueuedAttendanceLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read offline queue:', err);
    return [];
  }
}

export function saveToOfflineQueue(log: QueuedAttendanceLog): void {
  if (typeof window === 'undefined') return;
  const queue = getOfflineQueue();
  queue.push(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncOfflineQueue(onProgress?: (synced: number, total: number) => void): Promise<{ success: boolean; count: number; errors: any[] }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { success: true, count: 0, errors: [] };

  const errors: any[] = [];
  let synced = 0;
  const remainingQueue: QueuedAttendanceLog[] = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isOfflineSync: 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        synced++;
        if (onProgress) onProgress(synced, queue.length);
      } else {
        remainingQueue.push(item);
        errors.push({ item, error: data.message });
      }
    } catch (err: any) {
      remainingQueue.push(item);
      errors.push({ item, error: err.message });
      break; // Network still down
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue));
  return { success: remainingQueue.length === 0, count: synced, errors };
}
