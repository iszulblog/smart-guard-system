import { NextResponse } from 'next/server';
import { getGuardPosts, saveGuardPost, deleteGuardPost } from '@/lib/data-service';

export async function GET() {
  try {
    const posts = await getGuardPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ success: false, message: 'Ralat memuat senarai pos.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, latitude, longitude, radius, description } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, message: 'Nama pos dan koordinat diperlukan.' }, { status: 400 });
    }

    const postRadius = parseFloat(radius) || 30.0;
    const postLat = parseFloat(latitude);
    const postLng = parseFloat(longitude);

    const postId = await saveGuardPost({
      id,
      name,
      latitude: postLat,
      longitude: postLng,
      radius: postRadius,
      description: description || '',
    });

    return NextResponse.json({ success: true, message: 'Pos kawalan berjaya disimpan.', postId });
  } catch (error: any) {
    console.error('Error saving post:', error);
    return NextResponse.json({ success: false, message: 'Ralat menyimpan pos kawalan.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID pos diperlukan.' }, { status: 400 });
    }

    await deleteGuardPost(id);
    return NextResponse.json({ success: true, message: 'Pos kawalan berjaya dipadam.' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ success: false, message: 'Ralat memadam pos kawalan.' }, { status: 500 });
  }
}
