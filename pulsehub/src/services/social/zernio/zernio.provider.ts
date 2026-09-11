import type {
  SocialProvider,
  ConnectRequest,
  ConnectResponse,
  CallbackRequest,
  CallbackResult,
  SelectionOption,
  SelectionRequest,
  SelectionResult,
  SocialAccount,
  CreatePostInput,
  CreatePostResult,
  ListPostsRequest,
  Post,
  ListCommentPostsRequest,
  CommentPost,
  GetCommentsRequest,
  Comment,
  ReplyCommentRequest,
  GetAnalyticsRequest,
  AnalyticsResult,
  UploadRequest,
  UploadResult,
} from '../contracts/types';
import { ZernioService } from '../zernio.service';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class ZernioProvider implements SocialProvider {
  name = 'zernio' as const;

  async getConnectUrl(request: ConnectRequest): Promise<ConnectResponse> {
    const profileId = await this.getOrCreateProfileId(request.userId);
    const result = await ZernioService.getConnectUrl(request.platform, profileId, {
      headless: true,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social/callback`,
    });
    return { authUrl: result.authUrl, state: result.state || '' };
  }

  async handleCallback(request: CallbackRequest): Promise<CallbackResult> {
    // Zernio callback is handled via their redirect — we just sync accounts after
    return { success: true };
  }

  async listSelectionOptions(platform: string, userId: string, state: string): Promise<SelectionOption[]> {
    const result = await ZernioService.listSelectionOptions(platform, {
      pendingDataToken: state,
    });
    return result.options || [];
  }

  async completeSelection(request: SelectionRequest): Promise<SelectionResult> {
    const profileId = await this.getOrCreateProfileId(request.userId);
    await ZernioService.completeSelection(request.platform, {
      profileId,
      tempToken: request.state || '',
      selection: { pageId: request.selectionId },
    });
    return { success: true };
  }

  async listAccounts(userId: string): Promise<SocialAccount[]> {
    const { data } = await getSupabase()
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return (data || []).map((row) => ({
      id: row.id,
      platform: row.platform,
      username: row.username,
      profileId: row.profile_id || '',
      isConnected: row.is_connected,
      lastSynced: row.last_synced,
    }));
  }

  async createPost(input: CreatePostInput): Promise<CreatePostResult> {
    const result = await ZernioService.createPost({
      content: input.content,
      platforms: input.platforms.map((p) => ({
        platform: p.platform,
        accountId: p.accountId,
        customContent: p.customContent,
        platformSpecificData: p.platformSpecificData,
      })),
      mediaItems: input.mediaItems?.map((m) => ({
        type: m.type as 'image' | 'video' | 'gif' | 'document',
        url: m.url,
      })),
      scheduledFor: input.scheduledFor,
      timezone: input.timezone,
      publishNow: input.publishNow,
    });
    return { postId: result.postId, platformResults: [] };
  }

  async listPosts(request: ListPostsRequest): Promise<Post[]> {
    const posts = await ZernioService.listPosts(undefined, request.status, request.limit);
    return posts.map((p) => ({
      id: p._id,
      content: p.content,
      status: p.status as Post['status'],
      scheduledFor: p.scheduledFor,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt || '',
      platforms: (p.platforms || []).map((pt) => ({
        platform: pt.platform as Post['platforms'][number]['platform'],
        accountId: pt.accountId,
        status: (pt.status || p.status) as Post['status'],
      })),
    }));
  }

  async cancelPost(postId: string): Promise<void> {
    await ZernioService.cancelPost(postId);
  }

  async listCommentPosts(request: ListCommentPostsRequest): Promise<CommentPost[]> {
    const posts = await ZernioService.listCommentPosts({
      platform: request.platform,
      limit: request.limit,
    });
    return (posts as unknown as CommentPost[]) || [];
  }

  async getPostComments(request: GetCommentsRequest): Promise<Comment[]> {
    const comments = await ZernioService.getPostComments(request.postId, request.accountId);
    return (comments as unknown as Comment[]) || [];
  }

  async replyToComment(request: ReplyCommentRequest): Promise<Comment> {
    const result = await ZernioService.replyToComment(request.postId, {
      accountId: request.accountId,
      message: request.text,
      commentId: request.commentId,
    });
    return result as unknown as Comment;
  }

  async getAnalytics(request: GetAnalyticsRequest): Promise<AnalyticsResult> {
    return await ZernioService.getAnalytics({
      fromDate: request.dateFrom,
      toDate: request.dateTo,
    }) as unknown as AnalyticsResult;
  }

  async presignUpload(request: UploadRequest): Promise<UploadResult> {
    const result = await ZernioService.presignUpload(request.filename, request.contentType);
    return { uploadUrl: result.uploadUrl, publicUrl: result.publicUrl };
  }

  private async getOrCreateProfileId(userId: string): Promise<string> {
    const { data } = await getSupabase()
      .from('social_accounts')
      .select('zernio_profile_id')
      .eq('user_id', userId)
      .not('zernio_profile_id', 'is', null)
      .limit(1)
      .single();

    if (data?.zernio_profile_id) return data.zernio_profile_id;

    const result = await ZernioService.createProfile(`user-${userId}`);
    return result.profileId;
  }
}
