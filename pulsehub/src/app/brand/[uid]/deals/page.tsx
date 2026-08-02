'use client';

import { useParams } from 'next/navigation';
import DealsInbox from '@/components/messaging/DealsInbox';

export default function BrandDealsPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Deals</h1>
        <p className="text-secondary-600 mt-2">Conversations with the influencers you reached out to.</p>      </div>
      <DealsInbox userId={uid} />
    </div>
  );
}
