import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';
import { ZernioService } from '@/services/social/zernio.service';
import { upsertZernioAccounts } from '@/services/social/accountSync.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET  → list the pages/orgs/boards available to pick for a headless OAuth.
export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const params = req.nextUrl.searchParams;
    const platform = params.get('platform');
    if (!platform) {
      return NextResponse.json({ error: 'Missing platform' }, { status: 400 });
    }

    const result = await ZernioService.listSelectionOptions(platform, {
      profileId: params.get('profileId') || undefined,
      tempToken: params.get('tempToken') || undefined,
      pendingDataToken: params.get('pendingDataToken') || undefined,
      connectToken: params.get('connectToken') || undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list accounts';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST → complete a headless selection and persist the connected account.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));

    const platform = body.platform as string;
    const profileId = body.profileId as string;
    const tempToken = body.tempToken as string;
    if (!platform || !profileId || !tempToken) {
      return NextResponse.json({ error: 'Missing platform, profileId or tempToken' }, { status: 400 });
    }

    const result = await ZernioService.completeSelection(platform, {
      profileId,
      tempToken,
      userProfile: body.userProfile,
      connectToken: body.connectToken,
      accountType: body.accountType,
      selection: body.selection || {},
    });

    const account = (result.account || {}) as { accountId?: string; platform?: string; username?: string };
    if (account?.accountId) {
      await upsertZernioAccounts(getAdmin(), user.id, [
        {
          _id: account.accountId,
          platform: account.platform || platform,
          username: account.username || '',
        },
      ], profileId);
    }

    return NextResponse.json({ success: true, account });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to connect account';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}