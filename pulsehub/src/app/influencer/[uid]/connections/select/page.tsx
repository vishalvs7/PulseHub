'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import AccountSelectPicker from '@/components/posting/AccountSelectPicker';
import { Loader2 } from 'lucide-react';

export default function InfluencerSelectPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-secondary-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…</div>}>
      <AccountSelectPicker basePath={`/influencer/${uid}`} />
    </Suspense>
  );
}