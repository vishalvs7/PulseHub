'use client';

import { useParams } from 'next/navigation';
import DealsInbox from '@/components/messaging/DealsInbox';

export default function InfluencerDealsPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Deals</h1>
        <p className="text-secondary-600 mt-2">Messages and collaboration offers from brands.</p>
      </div>
      <DealsInbox userId={uid} emptyTitle="No deals yet" emptyDescription="When a brand messages you, conversations will appear here." />
    </div>
  );
}
