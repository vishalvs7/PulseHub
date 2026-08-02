import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';
import { ZernioService } from '@/services/social/zernio.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const profileId = (body.profileId as string) || undefined;

    const admin = getAdmin();

    // Resolve the user's Zernio profile if not passed explicitly.
    let zernioProfileId = profileId;
    if (!zernioProfileId) {
      const { data: userRow } = await admin
        .from('users')
        .select('zernio_profile_id')
        .eq('id', user.id)
        .single();
      zernioProfileId = userRow?.zernio_profile_id || undefined;
    }

    if (!zernioProfileId) {
      return NextResponse.json({ error: 'No Zernio profile found. Connect an account first.' }, { status: 400 });
    }

    const accounts = await ZernioService.listAccounts(zernioProfileId);

    const now = new Date().toISOString();
    const synced: Record<string, unknown>[] = [];

    for (const acct of accounts) {
      const platform = acct.platform.toLowerCase();
      const username = (acct.username as string) || platform;

      // Upsert keyed on zernio_account_id.
      const { data: existing } = await admin
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('zernio_account_id', acct._id)
        .maybeSingle();

      if (existing) {
        const { data } = await admin
          .from('social_accounts')
          .update({
            platform,
            username,
            zernio_profile_id: zernioProfileId,
            is_connected: true,
            last_synced: now,
          })
          .eq('id', existing.id)
          .select()
          .single();
        synced.push(data);
      } else {
        const { data } = await admin
          .from('social_accounts')
          .insert({
            user_id: user.id,
            platform,
            username,
            zernio_profile_id: zernioProfileId,
            zernio_account_id: acct._id,
            access_token: '',
            is_connected: true,
            last_synced: now,
          })
          .select()
          .single();
        synced.push(data);
      }
    }

    return NextResponse.json({ accounts: synced });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
