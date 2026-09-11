import type { CrossPostPlatform } from '@/lib/socialPlatforms';
export type { CrossPostPlatform } from '@/lib/socialPlatforms';

// ─── OAuth ───────────────────────────────────────────────────────────────────

export interface ConnectRequest {
  platform: CrossPostPlatform;
  userId: string;
  redirectUri?: string;
}

export interface ConnectResponse {
  authUrl: string;
  state: string;
}

export interface CallbackRequest {
  platform: CrossPostPlatform;
  code: string;
  state: string;
}

export interface CallbackResult {
  success: boolean;
  accountId?: string;
  username?: string;
  platform?: CrossPostPlatform;
  needsSelection?: boolean;
  selectionOptions?: SelectionOption[];
  error?: string;
}

export interface SelectionOption {
  id: string;
  name: string;
  username?: string;
  description?: string;
  logoUrl?: string;
}

export interface SelectionRequest {
  platform: CrossPostPlatform;
  userId: string;
  selectionId: string;
  state?: string;
}

export interface SelectionResult {
  success: boolean;
  accountId?: string;
  username?: string;
  error?: string;
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export interface SocialAccount {
  id: string;
  platform: CrossPostPlatform;
  username: string;
  displayName?: string;
  profileId: string;
  isConnected: boolean;
  lastSynced?: string;
}

// ─── Publishing ──────────────────────────────────────────────────────────────

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface PublishMediaItem {
  type: 'image' | 'video' | 'gif' | 'document';
  url: string;
}

export interface PlatformTarget {
  platform: CrossPostPlatform;
  accountId: string;
  customContent?: string;
  destination?: string;
  platformSpecificData?: Record<string, unknown>;
}

export interface CreatePostInput {
  userId: string;
  content: string;
  platforms: PlatformTarget[];
  mediaItems?: PublishMediaItem[];
  scheduledFor?: string;
  timezone?: string;
  publishNow?: boolean;
}

export interface CreatePostResult {
  postId: string;
  platformResults: PlatformPublishResult[];
}

export interface PlatformPublishResult {
  platform: CrossPostPlatform;
  accountId: string;
  status: PostStatus;
  platformPostId?: string;
  error?: string;
}

export interface PublishPayload {
  content: string;
  mediaItems?: PublishMediaItem[];
  platformSpecificData?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

export interface ListPostsRequest {
  userId: string;
  status?: PostStatus;
  limit?: number;
  offset?: number;
}

export interface Post {
  id: string;
  content: string;
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  mediaItems?: PublishMediaItem[];
  platforms: PostPlatformTarget[];
}

export interface PostPlatformTarget {
  platform: CrossPostPlatform;
  accountId: string;
  status: PostStatus;
  platformPostId?: string;
  destination?: string;
  error?: string;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface ListCommentPostsRequest {
  userId: string;
  platform?: CrossPostPlatform;
  limit?: number;
}

export interface CommentPost {
  postId: string;
  platform: CrossPostPlatform;
  content: string;
  mediaUrl?: string;
  permalink?: string;
  commentCount: number;
  accountUsername?: string;
}

export interface GetCommentsRequest {
  userId: string;
  postId: string;
  accountId: string;
  platform: CrossPostPlatform;
}

export interface Comment {
  id: string;
  platform: CrossPostPlatform;
  postId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  canReply: boolean;
  replyCount: number;
}

export interface ReplyCommentRequest {
  userId: string;
  postId: string;
  commentId: string;
  text: string;
  platform: CrossPostPlatform;
  accountId: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface GetAnalyticsRequest {
  userId: string;
  platform?: CrossPostPlatform;
  dateFrom?: string;
  dateTo?: string;
}

export interface AnalyticsResult {
  hasAccess: boolean;
  dateRange: { from: string; to: string };
  platforms: PlatformAnalytics[];
  posts: PostAnalytics[];
  followerTrend: FollowerTrend[];
  lastSync?: string;
}

export interface PlatformAnalytics {
  platform: CrossPostPlatform;
  accountId: string;
  username: string;
  followers: number;
  impressions: number;
  reach: number;
  engagement: number;
  engagementRate: number;
}

export interface PostAnalytics {
  postId: string;
  platform: CrossPostPlatform;
  content: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  clicks: number;
  publishedAt: string;
}

export interface FollowerTrend {
  date: string;
  platform: CrossPostPlatform;
  followers: number;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export interface UploadRequest {
  userId: string;
  filename: string;
  contentType: string;
}

export interface UploadResult {
  uploadUrl: string;
  publicUrl: string;
}

// ─── Token ───────────────────────────────────────────────────────────────────

export interface TokenBundle {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'needs_reconnection' | 'revoked';
}

// ─── Platform Adapter Interface ──────────────────────────────────────────────

export interface PlatformAdapter {
  platform: CrossPostPlatform;

  // OAuth
  getAuthorizeUrl(redirectUri: string, state: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<TokenBundle>;
  refreshToken?(refreshToken: string): Promise<TokenBundle>;
  getProfile(accessToken: string): Promise<{ accountId: string; username: string }>;

  // Posting
  publish(accountId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult>;
  deletePost?(accountId: string, accessToken: string, platformPostId: string): Promise<void>;

  // Comments
  getComments?(accountId: string, accessToken: string, postId: string): Promise<Comment[]>;
  replyToComment?(accountId: string, accessToken: string, commentId: string, text: string): Promise<Comment>;

  // Analytics
  getPostInsights?(accountId: string, accessToken: string, postId: string): Promise<Partial<PostAnalytics>>;
  getFollowerStats?(accountId: string, accessToken: string): Promise<{ followers: number; engagement?: number }>;

  // Validation
  validateToken(accessToken: string): Promise<boolean>;
}

// ─── Social Provider Interface ───────────────────────────────────────────────

export interface SocialProvider {
  name: string;

  // Connection
  getConnectUrl(request: ConnectRequest): Promise<ConnectResponse>;
  handleCallback(request: CallbackRequest): Promise<CallbackResult>;
  listSelectionOptions(platform: CrossPostPlatform, userId: string, state: string): Promise<SelectionOption[]>;
  completeSelection(request: SelectionRequest): Promise<SelectionResult>;
  listAccounts(userId: string): Promise<SocialAccount[]>;

  // Publishing
  createPost(input: CreatePostInput): Promise<CreatePostResult>;
  listPosts(request: ListPostsRequest): Promise<Post[]>;
  cancelPost(postId: string): Promise<void>;

  // Comments
  listCommentPosts(request: ListCommentPostsRequest): Promise<CommentPost[]>;
  getPostComments(request: GetCommentsRequest): Promise<Comment[]>;
  replyToComment(request: ReplyCommentRequest): Promise<Comment>;

  // Analytics
  getAnalytics(request: GetAnalyticsRequest): Promise<AnalyticsResult>;

  // Upload
  presignUpload(request: UploadRequest): Promise<UploadResult>;
}
