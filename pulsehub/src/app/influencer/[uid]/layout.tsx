// src/app/influencer/[uid]/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';

export default function InfluencerLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const uid = params.uid as string;
  
  // Use existing influencer layout logic but with uid
  return <>{children}</>;
}