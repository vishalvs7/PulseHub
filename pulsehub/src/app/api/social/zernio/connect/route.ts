import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';
import { ZernioService } from '@/services/social/zernio.service';
import { CROSSPOST_PLATFORMS } from '@/lib/socialPlatforms';
import { getSocialProvider, getActiveProviderName } from '@/services/social/contracts';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const platform = body.platform as CrossPostPlatform;

    if (!CROSSPOST_PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    // ── SELF-HOSTED PATH ──────────────────────────────────────────────────
    if (getActiveProviderName() === 'selfhosted') {
      const provider = getSocialProvider();
      const result = await provider.getConnectUrl({ platform, userId: user.id });
      return NextResponse.json({ authUrl: result.authUrl, profileId: '' });
    }

    // ── ZERNIO PATH (default) ─────────────────────────────────────────────
    if (!ZernioService.isConfigured()) {
      return NextResponse.json({ error: 'ZERNIO_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const admin = getAdmin();
    const { data: userRow } = await admin
      .from('users')
      .select('zernio_profile_id')
      .eq('id', user.id)
      .single();

    let profileId = userRow?.zernio_profile_id || null;

    if (!profileId) {
      const { profileId: created } = await ZernioService.createProfile(`PulseHub ${user.email}`);
      profileId = created;
      await admin.from('users').update({ zernio_profile_id: profileId }).eq('id', user.id);
    }

    const { authUrl } = await ZernioService.getConnectUrl(platform, profileId, {
      headless: true,
      redirectUrl: `${ZernioService.getBaseUrl()}/api/social/zernio/callback`,
    });

    return NextResponse.json({ authUrl, profileId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connect failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
