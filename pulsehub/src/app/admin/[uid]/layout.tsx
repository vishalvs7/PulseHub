'use client';

import { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Zap, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      <aside className="w-64 bg-white border-r border-secondary-200">
        <div className="p-6 border-b border-secondary-100">
          <Link href={`/admin/${uid}`} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">PulseHub</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            href={`/admin/${uid}`}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 border-l-4 border-primary-600"
          >
            <Zap className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-secondary-100 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
