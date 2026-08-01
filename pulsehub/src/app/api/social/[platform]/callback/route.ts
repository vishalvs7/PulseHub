import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/services/social/oauth.service';
import { getSupabase } from '@/lib/supabase/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const code = req.nextUrl.searchParams.get('code');
  const stateParam = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(`${platform} auth failed: ${error}`)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=No authorization code received', req.url)
    );
  }

  let userId = '';
  try {
    const state = JSON.parse(stateParam || '{}');
    userId = state.userId || '';
  } catch {
    // state invalid, continue without userId
  }

  try {
    const { accessToken, accountId, username } = await OAuthService.exchangeCode(platform, code);

    const supabase = getSupabase();

    // Check if account already exists
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('platform', platform)
      .eq('profile_id', accountId)
      .single();

    if (existing) {
      // Update existing
      await supabase
        .from('social_accounts')
        .update({
          access_token: accessToken,
          username,
          is_connected: true,
          last_synced: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase
        .from('social_accounts')
        .insert({
          user_id: userId || 'anonymous',
          platform,
          profile_id: accountId,
          username,
          access_token: accessToken,
          is_connected: true,
          last_synced: new Date().toISOString(),
        });
    }

    const redirectUrl = userId
      ? `/influencer/${userId}/connections`
      : '/login';

    return NextResponse.redirect(
      new URL(`${redirectUrl}?connected=${platform}`, req.url)
    );
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message)}`, req.url)
    );
  }
}
