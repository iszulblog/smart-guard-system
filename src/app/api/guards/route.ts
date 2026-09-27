import { NextResponse } from 'next/server';
import { getGuards, saveGuard } from '@/lib/data-service';

export async function GET() {
  try {
    const guards = await getGuards();
    return NextResponse.json({ success: true, guards });
  } catch (error: any) {
    console.error('Error fetching guards:', error);
    return NextResponse.json({ success: false, message: 'Ralat memuat senarai pengawal.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, pin, activePostId, shiftStart, shiftEnd, status } = body;

    if (!id || !name || !pin) {
      return NextResponse.json({ success: false, message: 'ID Pengawal, Nama dan PIN 4-digit wajib diisi.' }, { status: 400 });
    }

    await saveGuard({
      id,
      name,
      phone,
      pin,
      activePostId,
      shiftStart,
      shiftEnd,
      status,
    });

    return NextResponse.json({ success: true, message: 'Maklumat pengawal berjaya disimpan.' });
  } catch (error: any) {
    console.error('Error saving guard:', error);
    return NextResponse.json({ success: false, message: 'Ralat menyimpan data pengawal.' }, { status: 500 });
  }
}
