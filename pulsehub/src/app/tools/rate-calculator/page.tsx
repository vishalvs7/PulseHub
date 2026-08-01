import type { Metadata } from 'next';
import ToolLayout from '@/components/tools/ToolLayout';
import RateCalculator from '@/components/tools/RateCalculator';

export const metadata: Metadata = {
  title: 'Influencer Rate & ROI Calculator | PulseHub',
  description:
    'Free influencer rate calculator. Find out how much to charge per post or Reel, or estimate the reach your campaign budget can buy across Instagram, TikTok and YouTube.',
};

export default function RateCalculatorPage() {
  return (
    <ToolLayout
      title="Influencer Rate & ROI Calculator"
      description="Enter a few numbers to get realistic creator rates or campaign ROI estimates. Built on industry benchmarks across Instagram, TikTok and YouTube."
    >
      <RateCalculator />
    </ToolLayout>
  );
}
