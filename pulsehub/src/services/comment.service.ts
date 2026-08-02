import { getSupabase } from '@/lib/supabase/client';

export interface UnifiedComment {
  id: string;
  platform: string;
  postId: string;
  postContent: string;
  postMediaUrl?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  replied: boolean;
  replyContent?: string;
  repliedAt?: string;
  createdAt: string;
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
    const supabase = getSupabase();
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return (data || []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      platform: c.platform as string,
      postId: c.post_id as string,
      postContent: c.post_content as string,
      postMediaUrl: (c.post_media_url as string) || undefined,
      authorName: c.author_name as string,
      authorUsername: c.author_username as string,
      authorAvatar: (c.author_avatar as string) || undefined,
      content: c.content as string,
      replied: c.replied as boolean,
      replyContent: (c.reply_content as string) || undefined,
      repliedAt: (c.replied_at as string) || undefined,
      createdAt: c.created_at as string,
    }));
  }

  static async reply(userId: string, commentId: string, reply: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('comments')
      .update({ replied: true, reply_content: reply, replied_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', userId);

    return !error;
  }
}
