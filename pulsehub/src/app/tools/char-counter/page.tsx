import type { Metadata } from 'next';
import ToolLayout from '@/components/tools/ToolLayout';
import CharCounter from '@/components/tools/CharCounter';

export const metadata: Metadata = {
  title: 'Character & Hashtag Counter | PulseHub',
  description:
    'Free real-time character counter and hashtag validator for X/Twitter (280), TikTok (2,200), Instagram (2,200 + 30 hashtags) and LinkedIn (3,000).',
};

export default function CharCounterPage() {
  return (
    <ToolLayout
      title="Multi-Platform Character & Hashtag Counter"
      description="Write once, validate everywhere. Live character counts and hashtag limits for X, TikTok, Instagram and LinkedIn — before you hit post."
    >
      <CharCounter />
    </ToolLayout>
  );
}
