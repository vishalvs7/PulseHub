import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/services/social/oauth.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const userId = req.nextUrl.searchParams.get('user_id');

  if (!OAuthService.isConfigured(platform)) {
    return NextResponse.json(
      { error: `${platform} OAuth is not configured. Set the required environment variables.` },
      { status: 400 }
    );
  }

  const state = JSON.stringify({ platform, userId, timestamp: Date.now() });
  const url = OAuthService.getAuthorizeUrl(platform, state);

  if (!url) {
    return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
  }

  return NextResponse.redirect(url);
}
