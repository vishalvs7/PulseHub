'use client';

import CommentToDM from '@/components/tools/CommentToDM';

export default function BrandCommentToDMPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Comment-to-DM Automation</h1>
        <p className="text-secondary-600 mt-2">
          Turn comments into leads with automated keyword-triggered DMs.
        </p>
      </div>
      <CommentToDM />
    </div>
  );
}
