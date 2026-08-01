'use client';

import BestTimeToPost from '@/components/tools/BestTimeToPost';

export default function BrandBestTimeToPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Best Time to Post</h1>
        <p className="text-secondary-600 mt-2">
          Schedule each platform at the moment your audience is most active.
        </p>
      </div>
      <BestTimeToPost />
    </div>
  );
}
