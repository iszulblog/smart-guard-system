import { NextResponse } from 'next/server';
import { getSettingsMap, saveSettingsMap } from '@/lib/data-service';
import { sendTelegramAlert } from '@/lib/telegram';

export async function GET() {
  try {
    const settings = await getSettingsMap();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: 'Ralat memuat tetapan.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { settings, testAlert } = await req.json();

    if (settings) {
      await saveSettingsMap(settings);
    }

    if (testAlert) {
      const result = await sendTelegramAlert({
        guardName: 'UJIAN SISTEM (TEST GUARD)',
        guardId: 'SG-TEST',
        postName: 'Pos Utama - Pintu Masuk A',
        type: 'FLAGGED_OUT_OF_BOUNDS',
        distance: 75.5,
        radius: 35.0,
        timestamp: new Date().toISOString(),
        notes: 'Ini adalah mesej ujian integrasi Telegram Bot SGVS.',
      });

      return NextResponse.json({
        success: true,
        message: result.success ? 'Tetapan disimpan & mesej ujian berjaya dihantar ke Telegram!' : `Tetapan disimpan, tetapi Telegram ralat: ${result.error}`,
        telegramResult: result,
      });
    }

    return NextResponse.json({ success: true, message: 'Tetapan berjaya dikemas kini.' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, message: 'Ralat menyimpan tetapan: ' + error.message }, { status: 500 });
  }
}
