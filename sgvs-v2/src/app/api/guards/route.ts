import { NextResponse } from 'next/server';
import { getGuards, saveGuard } from '@/lib/data-service';

export async function GET() {
  try {
    const guards = await getGuards();
    return NextResponse.json({ success: true, guards });
  } catch (error: any) {
    console.error('Error fetching guards:', error);
    return NextResponse.json({ success: false, message: 'Failed to retrieve guard roster.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, pin, activePostId, shiftStart, shiftEnd, status } = body;

    if (!id || !name || !pin) {
      return NextResponse.json({ success: false, message: 'ID, Name, and PIN are required.' }, { status: 400 });
    }

    await saveGuard({
      id: id.toUpperCase(),
      name: name.trim(),
      phone: phone?.trim(),
      pin: pin.trim(),
      activePostId: activePostId || undefined,
      shiftStart: shiftStart || '08:00',
      shiftEnd: shiftEnd || '20:00',
      status: status || 'ACTIVE',
    });

    return NextResponse.json({ success: true, message: 'Guard profile saved successfully.' });
  } catch (error: any) {
    console.error('Error saving guard:', error);
    return NextResponse.json({ success: false, message: 'Failed to save guard: ' + error.message }, { status: 500 });
  }
}
