'use client';

import { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/components/providers/AuthProvider';

export default function InfluencerLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      <Sidebar
        type="influencer"
        uid={uid}
        userData={{
          name: userData?.displayName || user?.email || 'Influencer Account',
          email: user?.email || '',
          avatar: userData?.photoURL,
        }}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
