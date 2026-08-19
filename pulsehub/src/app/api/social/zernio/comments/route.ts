import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';
import { ZernioService } from '@/services/social/zernio.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_THREADS = 25;
const MAX_COMMENTS_PER_POST = 25;

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const admin = getAdmin();
    const platform = req.nextUrl.searchParams.get('platform') || undefined;

    const { data: userRow } = await admin
      .from('users')
      .select('zernio_profile_id')
      .eq('id', user.id)
      .single();
    const profileId = userRow?.zernio_profile_id || undefined;

    if (!profileId) {
      return NextResponse.json({ posts: [], comments: [], lastUpdated: null });
    }

    const listing = await ZernioService.listCommentPosts({ profileId, platform, limit: 50 });
    const postRows = (listing.data || []) as Record<string, unknown>[];
    const meta = (listing.meta || {}) as Record<string, unknown>;

    const posts = postRows.map((p) => ({
      id: String(p.id || ''),
      platform: String(p.platform || ''),
      accountId: String(p.accountId || ''),
      accountUsername: String(p.accountUsername || ''),
      content: String(p.content || ''),
      picture: (p.picture as string) || null,
      permalink: (p.permalink as string) || null,
      createdTime: (p.createdTime as string) || null,
      commentCount: typeof p.commentCount === 'number' ? p.commentCount : 0,
      likeCount: typeof p.likeCount === 'number' ? p.likeCount : 0,
    }));

    const comments: Record<string, unknown>[] = [];
    for (const p of posts.slice(0, MAX_THREADS)) {
      if (p.commentCount === 0) continue;
      try {
        const thread = await ZernioService.getPostComments(p.id, p.accountId);
        const rawComments = (thread.comments || []) as Record<string, unknown>[];
        for (const c of rawComments.slice(0, MAX_COMMENTS_PER_POST)) {
          const from = (c.from || {}) as Record<string, unknown>;
          comments.push({
            id: String(c.id || ''),
            platform: String(c.platform || p.platform),
            postId: p.id,
            postContent: p.content,
            postMediaUrl: p.picture,
            postPermalink: p.permalink,
            commentCount: p.commentCount,
            accountId: p.accountId,
            accountUsername: p.accountUsername,
            authorName: String(from.name || ''),
            authorUsername: String(from.username || ''),
            authorAvatar: (from.picture as string) || null,
            content: String(c.message || ''),
            createdAt: (c.createdTime as string) || p.createdTime || null,
            canReply: !!c.canReply,
            canDelete: !!c.canDelete,
            canHide: !!c.canHide,
            replyCount: typeof c.replyCount === 'number' ? c.replyCount : 0,
            url: (c.url as string) || null,
          });
        }
      } catch {
        // A single failing thread shouldn't block the whole inbox.
      }
    }

    return NextResponse.json({
      posts,
      comments,
      lastUpdated: (meta.lastUpdated as string) || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load comments';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const { postId, accountId, message, commentId } = body;

    if (!postId || !accountId || !message?.trim()) {
      return NextResponse.json({ error: 'postId, accountId and message are required.' }, { status: 400 });
    }

    const data = await ZernioService.replyToComment(String(postId), {
      accountId: String(accountId),
      message: String(message).trim(),
      commentId: commentId ? String(commentId) : undefined,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reply';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}