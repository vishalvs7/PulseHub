import { NextRequest, NextResponse } from 'next/server';
import { getSocialProvider } from '@/services/social/contracts';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function dashboardBase(role: string | undefined, uid: string): string {
  return role === 'brand' ? `/brand/${uid}` : `/influencer/${uid}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = request.nextUrl.origin;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const platform = searchParams.get('platform') as any;
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      const errorDesc = searchParams.get('error_description') || error;
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(errorDesc)}`, origin)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/?error=Missing+authorization+code', origin)
      );
    }

    const provider = getSocialProvider();
    const result = await provider.handleCallback({
      platform: platform || 'instagram',
      code,
      state,
    });

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(result.error || 'Connection failed')}`, origin)
      );
    }

    // Look up the user from the state record to determine dashboard path
    const supabase = getSupabase();
    // State was already cleaned up by provider.handleCallback, so look up user
    // from social_accounts using the platform result
    const detectedPlatform = result.platform || platform || 'instagram';

    // Try to find the user by looking at the most recent social_accounts entry
    // for this platform (the callback just stored it)
    let redirectBase = '/';
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('user_id')
      .eq('platform', detectedPlatform)
      .order('created_at', { ascending: false })
      .limit(1);

    if (accounts && accounts.length > 0) {
      const userId = accounts[0].user_id;
      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      redirectBase = dashboardBase(userRow?.role, userId);
    }

    // If selection is needed, redirect to select page
    if (result.needsSelection && result.selectionOptions?.length) {
      const params = new URLSearchParams({
        platform: detectedPlatform,
        state,
        options: JSON.stringify(result.selectionOptions),
      });
      return NextResponse.redirect(new URL(`${redirectBase}/connections/select?${params.toString()}`, origin));
    }

    // Success — redirect to connections page
    return NextResponse.redirect(
      new URL(`${redirectBase}/connections?connected=1&platform=${detectedPlatform}`, origin)
    );
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error.message)}`, request.nextUrl.origin)
    );
  }
}
