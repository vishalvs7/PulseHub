import { NextRequest, NextResponse } from 'next/server';
import { getSocialProvider } from '@/services/social/contracts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const platform = searchParams.get('platform') as any;
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      const errorDesc = searchParams.get('error_description') || error;
      return NextResponse.redirect(
        new URL(`/connections?error=${encodeURIComponent(errorDesc)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/connections?error=Missing+authorization+code', request.url)
      );
    }

    // Try to determine platform from state if not provided
    let detectedPlatform = platform;
    if (!detectedPlatform) {
      // We'll let the provider figure it out from the state token
      detectedPlatform = 'instagram'; // Default, will be overridden by state lookup
    }

    const provider = getSocialProvider();
    const result = await provider.handleCallback({
      platform: detectedPlatform,
      code,
      state,
    });

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/connections?error=${encodeURIComponent(result.error || 'Connection failed')}`, request.url)
      );
    }

    // If selection is needed, redirect to select page
    if (result.needsSelection && result.selectionOptions?.length) {
      const params = new URLSearchParams({
        platform: result.platform || detectedPlatform,
        state,
        options: JSON.stringify(result.selectionOptions),
      });
      return NextResponse.redirect(new URL(`/connections/select?${params.toString()}`, request.url));
    }

    // Success — redirect to connections page
    return NextResponse.redirect(
      new URL(`/connections?connected=1&platform=${result.platform || detectedPlatform}`, request.url)
    );
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL(`/connections?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
