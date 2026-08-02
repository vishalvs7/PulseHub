'use client';

import { useParams } from 'next/navigation';
import PostComposer from '@/components/posting/PostComposer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function InfluencerPostingPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">New Post</h1>
        <p className="text-secondary-600 mt-2">
          Write once, publish everywhere. Connect accounts first, then create a cross-platform post.
        </p>
      </div>
      <PostComposer userId={uid} connectionsHref={`/influencer/${uid}/connections`} />
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-500 text-sm">
            Published/scheduled posts will appear here once synced from Zernio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
