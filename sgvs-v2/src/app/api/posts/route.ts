import { NextResponse } from 'next/server';
import { getGuardPosts, saveGuardPost, deleteGuardPost } from '@/lib/data-service';

export async function GET() {
  try {
    const posts = await getGuardPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching guard posts:', error);
    return NextResponse.json({ success: false, message: 'Failed to retrieve guard posts.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, latitude, longitude, radius, description } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, message: 'Name and coordinates are required.' }, { status: 400 });
    }

    const postId = await saveGuardPost({
      id,
      name: name.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius ? parseFloat(radius) : 35.0,
      description: description?.trim() || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Guard post geofence configured successfully.',
      postId,
    });
  } catch (error: any) {
    console.error('Error saving post:', error);
    return NextResponse.json({ success: false, message: 'Failed to save guard post: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Post ID is required.' }, { status: 400 });
    }

    await deleteGuardPost(id);
    return NextResponse.json({ success: true, message: 'Guard post removed successfully.' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete guard post.' }, { status: 500 });
  }
}
