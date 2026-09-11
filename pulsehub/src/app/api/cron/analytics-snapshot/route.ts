import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdapter } from '@/services/social/selfHosted/adapters/adapterFactory';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  // Get all connected accounts
  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('is_connected', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let snapshotsCreated = 0;

  for (const account of accounts || []) {
    const adapter = getAdapter(account.platform as CrossPostPlatform);
    if (!adapter?.getFollowerStats) continue;

    try {
      const stats = await adapter.getFollowerStats(account.profile_id, account.access_token);

      // Upsert snapshot for today
      const { error: upsertError } = await supabase
        .from('analytics_snapshots')
        .upsert({
          user_id: account.user_id,
          platform: account.platform,
          account_id: account.profile_id,
          snapshot_date: today,
          followers: stats.followers,
          engagement: stats.engagement || 0,
        }, {
          onConflict: 'user_id,platform,account_id,snapshot_date',
        });

      if (!upsertError) snapshotsCreated++;
    } catch {
      // Skip failed accounts
    }
  }

  return NextResponse.json({
    success: true,
    date: today,
    accountsProcessed: accounts?.length || 0,
    snapshotsCreated,
  });
}
