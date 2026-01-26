// src/components/ui/Card.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({
  children,
  className,
  hover = false,
  gradient = false,
  padding = 'md',
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0',
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300',
        gradient
          ? 'bg-gradient-to-br from-primary-50 to-pink-50 border-primary-100'
          : 'bg-white border-gray-200',
        paddingClasses[padding],
        hover && 'hover:shadow-medium hover:-translate-y-1 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <h3 className={cn('text-xl font-bold text-gray-900', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <p className={cn('text-gray-600 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}