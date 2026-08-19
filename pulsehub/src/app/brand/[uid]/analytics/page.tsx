'use client';

import { useParams } from 'next/navigation';
import AnalyticsView from '@/components/analytics/AnalyticsView';

export default function BrandAnalyticsPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Analytics</h1>
        <p className="text-secondary-600 mt-2">
          Performance per platform — every metric is kept separate, never combined across platforms.
        </p>
      </div>
      <AnalyticsView userId={uid} />
    </div>
  );
}