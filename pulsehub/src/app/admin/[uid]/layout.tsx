// src/app/admin/[uid]/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const uid = params.uid as string;
  
  return <>{children}</>;
}