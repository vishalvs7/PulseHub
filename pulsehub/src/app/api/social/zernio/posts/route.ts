import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';
import { ZernioService } from '@/services/social/zernio.service';
import { CROSSPOST_PLATFORMS } from '@/lib/socialPlatforms';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreatePostBody {
  content: string;
  mediaUrls?: string[];
  platforms: { platform: CrossPostPlatform; customContent?: string }[];
  scheduledFor?: string; // ISO string, optional → publish now
  timezone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as CreatePostBody;

    const content = (body.content || '').trim();
    const mediaUrls = body.mediaUrls || [];
    const targets = body.platforms || [];
    const timezone = body.timezone || 'UTC';

    if (!content && mediaUrls.length === 0) {
      return NextResponse.json({ error: 'Post content or media is required.' }, { status: 400 });
    }
    if (targets.length === 0) {
      return NextResponse.json({ error: 'Select at least one platform.' }, { status: 400 });
    }
    for (const t of targets) {
      if (!CROSSPOST_PLATFORMS.includes(t.platform)) {
        return NextResponse.json({ error: `Unsupported platform: ${t.platform}` }, { status: 400 });
      }
    }

    const admin = getAdmin();

    // Load the user's Zernio profile.
    const { data: userRow } = await admin
      .from('users')
      .select('zernio_profile_id')
      .eq('id', user.id)
      .single();

    const profileId = userRow?.zernio_profile_id || null;
    if (!profileId) {
      return NextResponse.json(
        { error: 'No Zernio profile. Connect a social account first.' },
        { status: 400 }
      );
    }

    // Map platform → connected Zernio accountId.
    const { data: accounts } = await admin
      .from('social_accounts')
      .select('platform, zernio_account_id')
      .eq('user_id', user.id)
      .eq('zernio_profile_id', profileId)
      .eq('is_connected', true)
      .not('zernio_account_id', 'is', null);

    const accountByPlatform = new Map<string, string>();
    for (const a of accounts || []) {
      if (a.zernio_account_id) accountByPlatform.set(a.platform, a.zernio_account_id);
    }

    const zernioPlatforms = targets
      .filter((t) => accountByPlatform.has(t.platform))
      .map((t) => ({
        platform: t.platform,
        accountId: accountByPlatform.get(t.platform)!,
        ...(t.customContent ? { customContent: t.customContent } : {}),
      }));

    const missing = targets.filter((t) => !accountByPlatform.has(t.platform)).map((t) => t.platform);
    if (zernioPlatforms.length === 0) {
      return NextResponse.json(
        { error: `No connected accounts for selected platforms (${missing.join(', ')}). Connect them first.` },
        { status: 400 }
      );
    }

    const publishNow = !body.scheduledFor;
    const { postId } = await ZernioService.createPost({
      content,
      platforms: zernioPlatforms,
      mediaItems: mediaUrls.map((url) => ({
        type: (url.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image') as 'image' | 'video',
        url,
      })),
      scheduledFor: body.scheduledFor,
      timezone,
      publishNow,
    });

    // Persist local record.
    const now = new Date();
    const scheduledAt = body.scheduledFor ? new Date(body.scheduledFor) : null;
    const status = publishNow ? 'scheduled' : scheduledAt && scheduledAt > now ? 'scheduled' : 'draft';

    const { data: post, error: postError } = await admin
      .from('posts')
      .insert({
        user_id: user.id,
        platform: zernioPlatforms.map((p) => p.platform).join(','),
        content,
        media_urls: mediaUrls,
        status: publishNow ? 'scheduled' : status,
        scheduled_for: body.scheduledFor || null,
      })
      .select()
      .single();

    if (postError) {
      return NextResponse.json({ error: `Post sent to Zernio but local save failed: ${postError.message}` }, { status: 500 });
    }

    const { error: targetsError } = await admin.from('post_targets').insert(
      zernioPlatforms.map((p) => ({
        post_id: post.id,
        platform: p.platform,
        content: p.customContent || content,
        media_urls: mediaUrls,
        status: publishNow ? 'scheduled' : 'scheduled',
        scheduled_for: body.scheduledFor || null,
        platform_post_id: postId,
      }))
    );

    if (targetsError) {
      return NextResponse.json({ error: `Post sent to Zernio but targets save failed: ${targetsError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      postId,
      localPostId: post.id,
      missing,
      platforms: zernioPlatforms.map((p) => p.platform),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Post failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
