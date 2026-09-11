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

// GET: List posts
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');

    const provider = getSocialProvider();
    const posts = await provider.listPosts({
      userId: user.id,
      status,
      limit,
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create post
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, platforms, mediaItems, scheduledFor, timezone, publishNow } = body;

    if (!content || !platforms?.length) {
      return NextResponse.json({ error: 'Content and platforms are required' }, { status: 400 });
    }

    const provider = getSocialProvider();
    const result = await provider.createPost({
      userId: user.id,
      content,
      platforms: platforms.map((p: any) => ({
        ...p,
        accountId: user.id, // Use userId for account lookup
      })),
      mediaItems,
      scheduledFor,
      timezone,
      publishNow,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Cancel post
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const provider = getSocialProvider();
    await provider.cancelPost(postId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
