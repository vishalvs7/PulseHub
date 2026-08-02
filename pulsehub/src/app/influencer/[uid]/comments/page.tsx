'use client';

import { useParams } from 'next/navigation';
import CommentsInbox from '@/components/messaging/CommentsInbox';

export default function InfluencerCommentsPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Comments</h1>
        <p className="text-secondary-600 mt-2">
          Replies to your posts across every connected platform, all in one place.
        </p>
      </div>
      <CommentsInbox userId={uid} />
    </div>
  );
}
