import { getSupabase } from '@/lib/supabase/client';
import { InstagramService } from './instagram.service';
import { TwitterService } from './twitter.service';
import { LinkedInService } from './linkedin.service';

export interface PostAttachment {
  platform: string;
  content: string;
  mediaUrls: string[];
}

export class PostingService {

  static async createPost(userId: string, brandId: string, attachments: PostAttachment[], scheduledFor?: Date) {
    const supabase = getSupabase();

    const now = new Date();
    const status = scheduledFor && scheduledFor > now ? 'scheduled' : 'draft';

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        platform: attachments.map(a => a.platform).join(','),
        content: attachments[0]?.content || '',
        media_urls: attachments.flatMap(a => a.mediaUrls),
        status,
        scheduled_for: scheduledFor?.toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, post };
  }

  static async publishPost(postId: string, attachments: PostAttachment[]) {
    const supabase = getSupabase();

    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('platform, access_token, profile_id')
      .eq('is_connected', true);

    const accounts: { platform: string; access_token: string; profile_id: string | null }[] = socialAccounts || [];

    if (accounts.length === 0) {
      return { success: false, error: 'No connected social accounts found' };
    }

    const results: { platform: string; success: boolean; postId?: string; error?: string }[] = [];

    for (const attachment of attachments) {
      const account = accounts.find((a: { platform: string }) => a.platform === attachment.platform);
      if (!account) {
        results.push({ platform: attachment.platform, success: false, error: 'Account not connected' });
        continue;
      }

      try {
        let result: { postId?: string };
        switch (attachment.platform) {
          case 'instagram':
            result = await InstagramService.post(account.access_token, account.profile_id!, {
              mediaUrl: attachment.mediaUrls[0] || '',
              caption: attachment.content,
              mediaType: 'IMAGE',
            });
            break;
          case 'twitter':
            result = await TwitterService.post(account.access_token, attachment.content, attachment.mediaUrls);
            break;
          case 'linkedin':
            result = await LinkedInService.post(account.access_token, account.profile_id!, attachment.content, attachment.mediaUrls[0]);
            break;
          default:
            results.push({ platform: attachment.platform, success: false, error: 'Unsupported platform' });
            continue;
        }

        results.push({ platform: attachment.platform, success: true, postId: result.postId });

        await supabase.from('posts').update({
          platform_post_id: result.postId,
          status: 'published',
          published_at: new Date().toISOString(),
        }).eq('id', postId);

      } catch (err: any) {
        results.push({ platform: attachment.platform, success: false, error: err.message });
        await supabase.from('posts').update({ status: 'failed' }).eq('id', postId);
      }
    }

    const allSuccess = results.every(r => r.success);

    return {
      success: allSuccess,
      results,
      postId: allSuccess ? postId : undefined,
    };
  }

  static async getScheduledPosts(userId: string) {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return (data || []).map((p: any) => ({
      id: p.id,
      content: p.content,
      platforms: p.platform.split(',').filter(Boolean),
      scheduledFor: p.scheduled_for ? new Date(p.scheduled_for).toLocaleString() : '',
      publishedAt: p.published_at ? new Date(p.published_at).toLocaleString() : '',
      status: p.status,
      media: p.media_urls?.[0],
      createdAt: p.created_at,
    }));
  }
}
