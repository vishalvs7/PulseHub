export interface UnifiedComment {
  id: string;
  platform: string;
  postId: string;
  postContent: string;
  postMediaUrl?: string;
  postPermalink?: string;
  commentCount: number;
  accountId: string;
  accountUsername?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  canReply: boolean;
  canDelete: boolean;
  canHide: boolean;
  replyCount: number;
  url?: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  threads: 'Threads',
  pinterest: 'Pinterest',
  reddit: 'Reddit',
};

export class CommentService {
  static platformLabel(platform: string): string {
    return PLATFORM_LABELS[platform] || platform;
  }

  static async getComments(userId: string): Promise<UnifiedComment[]> {
    const res = await fetch('/api/social/zernio/comments', { method: 'GET' });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to load comments.');
    }
    return (json.comments || []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      platform: c.platform as string,
      postId: c.postId as string,
      postContent: (c.postContent as string) || 'Untitled post',
      postMediaUrl: (c.postMediaUrl as string) || undefined,
      postPermalink: (c.postPermalink as string) || undefined,
      commentCount: c.commentCount as number,
      accountId: c.accountId as string,
      accountUsername: (c.accountUsername as string) || undefined,
      authorName: (c.authorName as string) || 'Unknown',
      authorUsername: (c.authorUsername as string) || '',
      authorAvatar: (c.authorAvatar as string) || undefined,
      content: (c.content as string) || '',
      createdAt: (c.createdAt as string) || new Date().toISOString(),
      canReply: c.canReply as boolean,
      canDelete: c.canDelete as boolean,
      canHide: c.canHide as boolean,
      replyCount: c.replyCount as number,
      url: (c.url as string) || undefined,
    }));
  }

  static async reply(userId: string, comment: UnifiedComment, message: string): Promise<boolean> {
    const res = await fetch('/api/social/zernio/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: comment.postId,
        accountId: comment.accountId,
        message,
        commentId: comment.id,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to send reply.');
    }
    return json.success === true;
  }
}