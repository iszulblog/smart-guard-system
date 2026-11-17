import { getSettingsMap } from './data-service';

export interface TelegramAlertPayload {
  guardName: string;
  guardId: string;
  postName: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'FLAGGED_OUT_OF_BOUNDS' | 'TARDINESS' | 'MOCK_DETECTED' | 'PATROL_INCIDENT';
  distance?: number;
  radius?: number;
  timestamp: string;
  selfieBase64?: string;
  notes?: string;
}

export async function sendTelegramAlert(
  payload: TelegramAlertPayload | string
): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSettingsMap();

    const token = settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log('[Telegram Alert Skipped] No Bot Token or Chat ID configured.');
      return { success: false, error: 'Telegram credentials not configured in settings' };
    }

    let messageText = '';

    if (typeof payload === 'string') {
      messageText = payload;
    } else {
      let icon = '🔔';
      let title = 'SGVS SECURITY SYSTEM';

      if (payload.type === 'FLAGGED_OUT_OF_BOUNDS') {
        icon = '🚨 [FLAGGED: OUT OF BOUNDS]';
        title = 'GEOFENCE PERIMETER BREACH';
      } else if (payload.type === 'MOCK_DETECTED') {
        icon = '⛔ [ALERT: MOCK GPS DETECTED]';
        title = 'LOCATION SPOOFING ATTEMPT';
      } else if (payload.type === 'TARDINESS') {
        icon = '⏰ [ALERT: TARDINESS]';
        title = 'LATE SHIFT ARRIVAL RECORDED';
      } else if (payload.type === 'PATROL_INCIDENT') {
        icon = '⚠️ [ALERT: PATROL ANOMALY]';
        title = 'INCIDENT REPORTED DURING PATROL';
      } else if (payload.type === 'CLOCK_IN') {
        icon = '✅ [CLOCK IN RECORDED]';
        title = 'ON-DUTY SHIFT COMMENCED';
      } else if (payload.type === 'CLOCK_OUT') {
        icon = '🚪 [CLOCK OUT RECORDED]';
        title = 'SHIFT CONCLUDED';
      }

      messageText = `
${icon}
*${title}*
━━━━━━━━━━━━━━━━━━━
👤 *Officer:* ${payload.guardName} (${payload.guardId})
📍 *Post:* ${payload.postName}
🕒 *Time:* ${new Date(payload.timestamp).toLocaleString('en-GB')}
${payload.distance !== undefined ? `📏 *Distance:* ${payload.distance} m (Post fence: ${payload.radius} m)` : ''}
${payload.notes ? `📝 *Notes:* ${payload.notes}` : ''}
━━━━━━━━━━━━━━━━━━━
_Smart Guard Verification & Patrol System (SGVS)_
      `.trim();
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
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
