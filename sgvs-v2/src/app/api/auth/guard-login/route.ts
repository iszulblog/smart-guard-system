import { NextResponse } from 'next/server';
import { getGuardByLogin } from '@/lib/data-service';

export async function POST(req: Request) {
  try {
    const { guardId, pin } = await req.json();

    if (!guardId || !pin) {
      return NextResponse.json(
        { success: false, message: 'Guard ID and PIN are required.' },
        { status: 400 }
      );
    }

    const guard = await getGuardByLogin(guardId, pin);

    if (!guard) {
      return NextResponse.json(
        { success: false, message: 'Invalid Guard ID or PIN. Please verify credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      guard: {
        id: guard.id,
        name: guard.name,
        phone: guard.phone,
        activePostId: guard.activePostId,
        postName: guard.postName,
        postLat: guard.postLat,
        postLng: guard.postLng,
        postRadius: guard.postRadius,
        shiftStart: guard.shiftStart,
        shiftEnd: guard.shiftEnd,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server authentication error.' },
      { status: 500 }
    );
  }
}
