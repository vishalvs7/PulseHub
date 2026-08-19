import type { SupabaseClient } from '@supabase/supabase-js';
import type { ZernioAccount } from './zernio.service';

/**
 * Upsert Zernio accounts into social_accounts, keyed on zernio_account_id.
 * Shared by the sync route and the OAuth callback route.
 */
export async function upsertZernioAccounts(
  admin: SupabaseClient,
  userId: string,
  accounts: ZernioAccount[],
  profileId: string
) {
  const now = new Date().toISOString();
  const synced: Record<string, unknown>[] = [];

  for (const acct of accounts) {
    const platform = String(acct.platform || '').toLowerCase();
    if (!platform || !acct._id) continue;
    const username = (acct.username as string) || platform;

    const { data: existing } = await admin
      .from('social_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('zernio_account_id', acct._id)
      .maybeSingle();

    if (existing) {
      const { data } = await admin
        .from('social_accounts')
        .update({
          platform,
          username,
          zernio_profile_id: profileId,
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
          user_id: userId,
          platform,
          username,
          zernio_profile_id: profileId,
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

  return synced;
}