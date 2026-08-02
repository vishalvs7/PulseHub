import type { CrossPostPlatform } from './socialPlatforms';

export type PostContentType =
  | 'square-image'
  | 'square-video'
  | 'vertical-video'
  | 'long-video'
  | 'document';

export interface ContentTypeConfig {
  id: PostContentType;
  name: string;
  shortName: string;
  description: string;
  aspect: string;
  accepts: string;
  platforms: CrossPostPlatform[];
  destination: Partial<Record<CrossPostPlatform, string>>;
}

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    id: 'square-image',
    name: 'Square Image',
    shortName: 'Image',
    description: 'A single 1:1 image for feed posts.',
    aspect: '1:1',
    accepts: 'image/*',
    platforms: ['instagram', 'facebook', 'twitter', 'linkedin', 'threads', 'pinterest', 'reddit'],
    destination: {
      instagram: 'Post',
      facebook: 'Post',
      twitter: 'Post',
      linkedin: 'Post',
      threads: 'Post',
      pinterest: 'Pin',
      reddit: 'Image Post',
    },
  },
  {
    id: 'square-video',
    name: 'Square Video',
    shortName: 'Video',
    description: 'A 1:1 video for feed posts.',
    aspect: '1:1',
    accepts: 'video/*',
    platforms: ['instagram', 'facebook', 'twitter', 'linkedin', 'threads'],
    destination: {
      instagram: 'Feed Video',
      facebook: 'Video',
      twitter: 'Video Post',
      linkedin: 'Video',
      threads: 'Video',
    },
  },
  {
    id: 'vertical-video',
    name: 'Vertical Short Video',
    shortName: 'Reel/Shorts',
    description: 'A 9:16 short-form video.',
    aspect: '9:16',
    accepts: 'video/*',
    platforms: ['instagram', 'tiktok', 'youtube', 'facebook'],
    destination: {
      instagram: 'Reel',
      tiktok: 'Video',
      youtube: 'Shorts',
      facebook: 'Reel',
    },
  },
  {
    id: 'long-video',
    name: 'Long Video',
    shortName: 'Long Video',
    description: 'A 16:9 long-form video.',
    aspect: '16:9',
    accepts: 'video/*',
    platforms: ['youtube', 'facebook', 'instagram', 'linkedin', 'twitter'],
    destination: {
      youtube: 'Video',
      facebook: 'Video',
      instagram: 'Feed Video',
      linkedin: 'Video',
      twitter: 'Video Post',
    },
  },
  {
    id: 'document',
    name: 'Document',
    shortName: 'Doc',
    description: 'PDF or Word document for document-style posts.',
    aspect: '—',
    accepts: '.pdf,.doc,.docx',
    platforms: ['linkedin', 'twitter', 'facebook', 'reddit'],
    destination: {
      linkedin: 'Document Post',
      twitter: 'Image/PDF Post',
      facebook: 'Document',
      reddit: 'Link Post',
    },
  },
];

export const CONTENT_TYPE_CONFIGS: Record<PostContentType, ContentTypeConfig> = CONTENT_TYPES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<PostContentType, ContentTypeConfig>
);

export const CONTENT_TYPE_OPTIONS: { value: PostContentType; label: string }[] = CONTENT_TYPES.map(
  (c) => ({ value: c.id, label: c.name })
);
