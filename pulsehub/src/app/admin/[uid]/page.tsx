// src/app/admin/[uid]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';

export default function AdminDashboardPage() {
  const params = useParams();
  const uid = params.uid as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, Admin!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-gray-600">Total Users</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-gray-600">Pending Approvals</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-gray-600">Active Campaigns</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">$45K</div>
          <div className="text-gray-600">Total Volume</div>
        </Card>
      </div>
    </div>
  );
}