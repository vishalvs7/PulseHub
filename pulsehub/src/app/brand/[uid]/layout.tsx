// src/app/brand/[uid]/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';

export default function BrandLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const uid = params.uid as string;
  
  // Use existing brand layout logic but with uid
  return <>{children}</>;
}