const PLATFORM_CONFIGS: Record<string, {
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  extraParams?: Record<string, string>;
  tokenHeaders?: Record<string, string>;
  tokenBodyTransform?: (params: URLSearchParams) => URLSearchParams;
  extractAccountId: (data: any) => string;
  extractUsername: (data: any) => string;
}> = {
  instagram: {
    authorizeUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    clientId: process.env.INSTAGRAM_APP_ID || '',
    clientSecret: process.env.INSTAGRAM_APP_SECRET || '',
    scope: 'instagram_basic,instagram_content_publish,pages_read_engagement',
    extractAccountId: (data) => data?.ig_user_id || data?.user_id || '',
    extractUsername: (data: any) => data?.username || '',
  },
  twitter: {
    authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    scope: 'tweet.read tweet.write users.read offline.access',
    tokenHeaders: {
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.TWITTER_CLIENT_ID || ''}:${process.env.TWITTER_CLIENT_SECRET || ''}`
      ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    tokenBodyTransform: (params) => {
      params.set('code_verifier', 'challenge');
      return params;
    },
    extractAccountId: (data: any) => data?.data?.id || data?.id || '',
    extractUsername: (data: any) => data?.data?.username || data?.username || '',
  },
  linkedin: {
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    scope: 'w_member_social r_liteprofile w_organization_social',
    extractAccountId: (data: any) => data?.sub || '',
    extractUsername: (data: any) => data?.name || data?.given_name || '',
  },
};

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export class OAuthService {

  static isConfigured(platform: string): boolean {
    const config = PLATFORM_CONFIGS[platform];
    if (!config) return false;
    return !!(config.clientId && config.clientSecret);
  }

  static getAuthorizeUrl(platform: string, state: string): string | null {
    const config = PLATFORM_CONFIGS[platform];
    if (!config) return null;

    const redirectUri = `${getBaseUrl()}/api/social/${platform}/callback`;
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope,
      state,
    });

    if (config.extraParams) {
      Object.entries(config.extraParams).forEach(([k, v]) => params.set(k, v));
    }

    return `${config.authorizeUrl}?${params.toString()}`;
  }

  static async exchangeCode(platform: string, code: string): Promise<{
    accessToken: string;
    accountId: string;
    username: string;
  }> {
    const config = PLATFORM_CONFIGS[platform];
    if (!config) throw new Error(`Unknown platform: ${platform}`);

    const redirectUri = `${getBaseUrl()}/api/social/${platform}/callback`;
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const transformed = config.tokenBodyTransform ? config.tokenBodyTransform(params) : params;

    const res = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: config.tokenHeaders || { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: transformed,
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error_description || data.error);

    const accessToken = data.access_token;

    let accountId = '';
    let username = '';

    // Fetch profile info using platform-specific API
    if (platform === 'instagram') {
      const longToken = data.access_token;
      const meRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account{id,username}&access_token=${longToken}`);
      const meData = await meRes.json();
      const igAccount = meData?.data?.[0]?.instagram_business_account;
      if (igAccount) {
        accountId = igAccount.id;
        username = igAccount.username;
      }
    } else if (platform === 'twitter') {
      const meRes = await fetch('https://api.twitter.com/2/users/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const meData = await meRes.json();
      accountId = meData?.data?.id || '';
      username = meData?.data?.username || '';
    } else if (platform === 'linkedin') {
      const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const meData = await meRes.json();
      accountId = meData?.sub || '';
      username = meData?.name || meData?.given_name || '';
    }

    return { accessToken, accountId, username };
  }
}
