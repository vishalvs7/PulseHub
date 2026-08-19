import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';
import { ZernioService } from '@/services/social/zernio.service';
import { upsertZernioAccounts } from '@/services/social/accountSync.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function dashboardBase(role: string | undefined, uid: string): string {
  return role === 'brand' ? `/brand/${uid}` : `/influencer/${uid}`;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const origin = req.nextUrl.origin;

  try {
    const user = await requireUser();
    const admin = getAdmin();
    const { data: userRow } = await admin
      .from('users')
      .select('role, zernio_profile_id')
      .eq('id', user.id)
      .single();
    const base = dashboardBase(userRow?.role, user.id);

    // OAuth error → back to Accounts with a message.
    const error = params.get('error');
    if (error) {
      return NextResponse.redirect(new URL(`${base}/connections?error=${encodeURIComponent(error)}`, origin));
    }

    const platform = params.get('platform');
    const step = params.get('step');
    const pendingDataToken = params.get('pendingDataToken');

    // Selection-required platform (facebook/linkedin/pinterest/instagram-fb-login)
    // → our own branded picker to keep Zernio invisible.
    if (step || pendingDataToken) {
      const sel = new URLSearchParams();
      if (platform) sel.set('platform', platform);
      if (pendingDataToken) sel.set('pendingDataToken', pendingDataToken);
      if (params.get('connect_token')) sel.set('connectToken', params.get('connect_token')!);
      if (params.get('profileId')) sel.set('profileId', params.get('profileId')!);
      if (params.get('tempToken')) sel.set('tempToken', params.get('tempToken')!);
      if (params.get('userProfile')) sel.set('userProfile', params.get('userProfile')!);
      return NextResponse.redirect(new URL(`${base}/connections/select?${sel.toString()}`, origin));
    }

    // Account already connected by Zernio → persist and return to Accounts.
    const accountId = params.get('accountId') || params.get('account_id');
    let profileId = params.get('profileId') || undefined;
    if (!profileId) profileId = userRow?.zernio_profile_id || undefined;

    if (profileId && accountId) {
      await upsertZernioAccounts(admin, user.id, [
        { _id: accountId, platform: platform || '', username: params.get('username') || '' },
      ], profileId);
      return NextResponse.redirect(new URL(`${base}/connections?connected=1&platform=${platform || ''}`, origin));
    }

    return NextResponse.redirect(new URL(`${base}/connections`, origin));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection callback failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}