'use client';

import {
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiYoutube,
  SiPinterest,
  SiReddit,
  SiThreads,
  SiX,
} from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';
import { PLATFORM_CONFIGS } from '@/lib/socialPlatforms';

const ICONS: Record<CrossPostPlatform, IconType> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  twitter: SiX,
  linkedin: FaLinkedinIn,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  threads: SiThreads,
  pinterest: SiPinterest,
  reddit: SiReddit,
};

export default function BrandIcon({
  platform,
  className,
}: {
  platform: CrossPostPlatform;
  className?: string;
}) {
  const Icon = ICONS[platform];
  const cfg = PLATFORM_CONFIGS[platform];
  const gradient = cfg.color.split(' ');
  return (
    <span className={`bg-gradient-to-r ${gradient[0]} ${gradient[1]} rounded-lg flex items-center justify-center text-white shrink-0 ${className || 'w-8 h-8'}`}>
      <Icon className="w-[55%] h-[55%]" />
    </span>
  );
}
