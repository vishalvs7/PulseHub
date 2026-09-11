import type { SocialProvider } from './types';

export type SocialProviderType = 'zernio' | 'selfhosted';

function getProviderName(): SocialProviderType {
  const raw = process.env.SOCIAL_PROVIDER || 'zernio';
  if (raw === 'selfhosted') return 'selfhosted';
  return 'zernio';
}

let cachedProvider: SocialProvider | null = null;

export function getSocialProvider(): SocialProvider {
  if (cachedProvider) return cachedProvider;

  const name = getProviderName();
  let provider: SocialProvider;

  if (name === 'selfhosted') {
    // Lazy-load the self-hosted provider
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SelfHostedProvider } = require('../selfHosted/selfHosted.provider');
    provider = new SelfHostedProvider();
  } else {
    // Lazy-load the Zernio provider
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ZernioProvider } = require('../zernio/zernio.provider');
    provider = new ZernioProvider();
  }

  cachedProvider = provider;
  return provider;
}

export function resetProvider(): void {
  cachedProvider = null;
}

export function getActiveProviderName(): SocialProviderType {
  return getProviderName();
}
