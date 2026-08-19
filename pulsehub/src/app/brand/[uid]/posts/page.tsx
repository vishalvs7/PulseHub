'use client';

import { useParams } from 'next/navigation';
import RecentPosts from '@/components/posting/RecentPosts';

export default function BrandPostsPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Posts</h1>
        <p className="text-secondary-600 mt-2">
          Every scheduled and published post, with the ability to cancel anything still queued.
        </p>
      </div>
      <RecentPosts />
    </div>
  );
}