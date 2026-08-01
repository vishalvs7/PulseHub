import type { Metadata } from 'next';
import ToolLayout from '@/components/tools/ToolLayout';
import ThreadSplitter from '@/components/tools/ThreadSplitter';

export const metadata: Metadata = {
  title: 'Caption Trimmer & Thread Splitter | PulseHub',
  description:
    'Free tool to turn long-form content into a numbered X/Twitter thread, a clean LinkedIn post, or an Instagram caption with a hidden hashtag block.',
};

export default function ThreadSplitterPage() {
  return (
    <ToolLayout
      title="Caption Trimmer & Thread Splitter"
      description="Paste your long-form post, script, or article and instantly get platform-ready formats — X threads split at 280 characters, LinkedIn formatting, and Instagram captions with hidden hashtag blocks."
    >
      <ThreadSplitter />
    </ToolLayout>
  );
}
