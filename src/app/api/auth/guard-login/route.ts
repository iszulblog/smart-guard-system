import { NextResponse } from 'next/server';
import { getGuardByLogin } from '@/lib/data-service';

export async function POST(req: Request) {
  try {
    const { guardId, pin } = await req.json();

    if (!guardId || !pin) {
      return NextResponse.json(
        { success: false, message: 'Sila masukkan ID Pengawal dan PIN 4-digit.' },
        { status: 400 }
      );
    }

    const guard = await getGuardByLogin(guardId, pin);

    if (!guard) {
      return NextResponse.json(
        { success: false, message: 'ID Pengawal atau PIN tidak tepat. Sila semak semula.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      guard: {
        id: guard.id,
        name: guard.name,
        phone: guard.phone,
        activePostId: guard.activePostId,
        postName: guard.postName || 'Belum Ditetapkan',
        postLat: guard.postLat,
        postLng: guard.postLng,
        postRadius: guard.postRadius || 30.0,
        shiftStart: guard.shiftStart,
        shiftEnd: guard.shiftEnd,
      },
    });
  } catch (error: any) {
    console.error('Guard Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Ralat pelayan semasa log masuk.' },
      { status: 500 }
    );
  }
}
