'use client';

import { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/components/providers/AuthProvider';

export default function BrandLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50 lg:h-screen lg:flex">
      <Sidebar
        type="brand"
        uid={uid}
        userData={{
          name: userData?.displayName || user?.email || 'Brand Account',
          email: user?.email || '',
          avatar: userData?.photoURL,
        }}
        onLogout={handleLogout}
      />
      <main className="flex-1 lg:overflow-y-auto px-4 sm:px-6 lg:p-8 pt-20 lg:pt-8 pb-10">
        {children}
      </main>
    </div>
  );
}
