import { getSettingsMap } from './data-service';

export interface TelegramAlertPayload {
  guardName: string;
  guardId: string;
  postName: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'FLAGGED_OUT_OF_BOUNDS' | 'TARDINESS' | 'MOCK_DETECTED';
  distance?: number;
  radius?: number;
  timestamp: string;
  selfieBase64?: string;
  notes?: string;
}

export async function sendTelegramAlert(payload: TelegramAlertPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSettingsMap();

    const token = settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log('[Telegram Alert Skipped] No Bot Token or Chat ID configured.');
      return { success: false, error: 'Telegram credentials not configured in settings' };
    }

    let icon = '🔔';
    let title = 'SGVS SISTEM KESELAMATAN';

    if (payload.type === 'FLAGGED_OUT_OF_BOUNDS') {
      icon = '🚨 [AMARAN: LOG LUAR KAWASAN]';
      title = 'PERCUBAAN KEHADIRAN LUAR SEMPADAN';
    } else if (payload.type === 'MOCK_DETECTED') {
      icon = '⛔ [AMARAN: MOCK GPS DIKESAN]';
      title = 'PERCUBAAN PEMALSUAN LOKASI';
    } else if (payload.type === 'TARDINESS') {
      icon = '⏰ [AMARAN: LEWAT BERTUGAS]';
      title = 'PENGESAHAN LEWAT DARI MASA SYIF';
    } else if (payload.type === 'CLOCK_IN') {
      icon = '✅ [LOG MASUK BERTUGAS]';
      title = 'KEHADIRAN DISAHKAN DI POS';
    } else if (payload.type === 'CLOCK_OUT') {
      icon = '🚪 [LOG KELUAR BERTUGAS]';
      title = 'TAMAT WAKTU BERTUGAS';
    }

    const message = `
${icon}
*${title}*
━━━━━━━━━━━━━━━━━━━
👤 *Pengawal:* ${payload.guardName} (${payload.guardId})
📍 *Pos Kawalan:* ${payload.postName}
🕒 *Masa Log:* ${new Date(payload.timestamp).toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
${payload.distance !== undefined ? `📏 *Jarak dikesan:* ${payload.distance} m (Radius pos: ${payload.radius} m)` : ''}
${payload.notes ? `📝 *Nota:* ${payload.notes}` : ''}
━━━━━━━━━━━━━━━━━━━
_Sistem Pengesahan Lokasi & Kehadiran (SGVS)_
    `.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[Telegram Error]', data);
      return { success: false, error: data.description };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Telegram Exception]', err);
    return { success: false, error: err.message };
  }
}
