'use client';

import { useParams } from 'next/navigation';
import ZernioConnections from '@/components/posting/ZernioConnections';

export default function BrandConnectionsPage() {
  const params = useParams();
  const uid = params.uid as string;

  return <ZernioConnections userId={uid} />;
}
