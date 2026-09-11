import { NextRequest, NextResponse } from 'next/server';
import { getSocialProvider } from '@/services/social/contracts';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await getSupabase().auth.getUser(token);
  return user;
}

// GET: List comments
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const accountId = searchParams.get('accountId');
    const platform = searchParams.get('platform') as any;

    const provider = getSocialProvider();

    // If specific post requested, get its comments
    if (postId && accountId && platform) {
      const comments = await provider.getPostComments({
        userId: user.id,
        postId,
        accountId,
        platform,
      });
      return NextResponse.json({ comments });
    }

    // Otherwise, list posts with comments (inbox view)
    const posts = await provider.listCommentPosts({
      userId: user.id,
      platform,
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Reply to comment
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, commentId, text, platform, accountId } = body;

    if (!commentId || !text || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const provider = getSocialProvider();
    const reply = await provider.replyToComment({
      userId: user.id,
      postId: postId || '',
      commentId,
      text,
      platform,
      accountId,
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
