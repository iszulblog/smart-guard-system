import { NextResponse } from 'next/server';
import { getPatrolRuns, startPatrolRun, finishPatrolRun, getPatrolLogsByRun, getPatrolCheckpoints } from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');
    const guardId = searchParams.get('guardId') || undefined;
    const postId = searchParams.get('postId') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    if (runId) {
      const logs = await getPatrolLogsByRun(runId);
      return NextResponse.json({ success: true, logs });
    }

    const runs = await getPatrolRuns({ guardId, postId, status, limit });
    return NextResponse.json({ success: true, runs });
  } catch (error: any) {
    console.error('Error fetching patrol runs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve patrol runs.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guardId, postId } = body;

    if (!guardId || !postId) {
      return NextResponse.json(
        { success: false, message: 'Guard ID and Post ID are required.' },
        { status: 400 }
      );
    }

    // Determine total checkpoints configured for this post
    const checkpoints = await getPatrolCheckpoints(postId);
    const totalCheckpoints = checkpoints.length;

    const runId = await startPatrolRun({
      guardId,
      postId,
      totalCheckpoints,
    });

    return NextResponse.json({
      success: true,
      message: 'Patrol tour initialized.',
      runId,
      totalCheckpoints,
      checkpoints,
    });
  } catch (error: any) {
    console.error('Error starting patrol run:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start patrol run: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { runId, notes } = body;

    if (!runId) {
      return NextResponse.json({ success: false, message: 'Run ID is required.' }, { status: 400 });
    }

    await finishPatrolRun(runId, notes);
    return NextResponse.json({ success: true, message: 'Patrol tour concluded.' });
  } catch (error: any) {
    console.error('Error concluding patrol run:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to conclude patrol run.' },
      { status: 500 }
    );
  }
}
