// src/components/dashboard/StatsCard.tsx
'use client';

import { Card, CardContent } from '@/components/ui/Card';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral' | string;
  icon: LucideIcon;
  color: string;
  description?: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color,
  description,
}: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-error-600',
    neutral: 'text-secondary-600',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary-600">{title}</p>
            <p className="text-2xl font-bold text-secondary-900 mt-1">{value}</p>
            
            {(change || description) && (
              <div className="flex items-center mt-1">
                {change && (
                  <span className={`text-sm ${trendColors[trend as keyof typeof trendColors] || 'text-secondary-600'}`}>
                    {(trendIcons as any)[trend] || '→'} {change}
                  </span>
                )}
                {description && (
                  <span className="text-sm text-secondary-500 ml-2">{description}</span>
                )}
              </div>
            )}
          </div>
          
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}