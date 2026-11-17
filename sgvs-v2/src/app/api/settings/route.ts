import { NextResponse } from 'next/server';
import { getSettingsMap, saveSettingsMap } from '@/lib/data-service';

export async function GET() {
  try {
    const settings = await getSettingsMap();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to retrieve settings.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await saveSettingsMap(body);
    return NextResponse.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to update settings.' }, { status: 500 });
  }
}
