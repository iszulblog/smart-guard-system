import { NextResponse } from 'next/server';
import { getPatrolCheckpoints, savePatrolCheckpoint, deletePatrolCheckpoint } from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId') || undefined;

    const checkpoints = await getPatrolCheckpoints(postId);
    return NextResponse.json({ success: true, checkpoints });
  } catch (error: any) {
    console.error('Error fetching patrol checkpoints:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve patrol checkpoints.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, postId, name, latitude, longitude, radius, sequence, requiredTasks } = body;

    if (!postId || !name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, message: 'Post ID, checkpoint name, and coordinates are required.' },
        { status: 400 }
      );
    }

    const savedId = await savePatrolCheckpoint({
      id,
      postId,
      name: name.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius ? parseFloat(radius) : 25.0,
      sequence: sequence ? parseInt(sequence) : 1,
      requiredTasks: requiredTasks || [],
    });

    return NextResponse.json({
      success: true,
      message: 'Patrol checkpoint saved successfully.',
      checkpointId: savedId,
    });
  } catch (error: any) {
    console.error('Error saving patrol checkpoint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save patrol checkpoint: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Checkpoint ID is required.' },
        { status: 400 }
      );
    }

    await deletePatrolCheckpoint(id);
    return NextResponse.json({ success: true, message: 'Patrol checkpoint deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting checkpoint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete checkpoint.' },
      { status: 500 }
    );
  }
}
