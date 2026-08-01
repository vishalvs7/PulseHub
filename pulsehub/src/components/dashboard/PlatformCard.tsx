// src/components/dashboard/PlatformCard.tsx
import { LucideIcon } from 'lucide-react';

interface PlatformCardProps {
  platform: string;
  icon: LucideIcon;
  reach: string;
  growth: string;
  posts: number;
  engagement: string;
  color: string;
}

export function PlatformCard({
  platform,
  icon: Icon,
  reach,
  growth,
  posts,
  engagement,
  color,
}: PlatformCardProps) {
  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900">{platform}</h3>
            <p className="text-sm text-secondary-600">{posts} posts</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-lg ${
          growth.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-error-100 text-error-800'
        }`}>
          {growth}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-secondary-900">{reach}</div>
          <div className="text-sm text-secondary-600">Reach</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-secondary-900">{engagement}</div>
          <div className="text-sm text-secondary-600">Engagement</div>
        </div>
      </div>
    </div>
  );
}