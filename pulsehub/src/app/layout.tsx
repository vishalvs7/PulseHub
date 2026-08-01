// src/app/layout.tsx
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PulseHub - Unified Social Media Platform',
  description: 'Manage social campaigns, connect with influencers, and track performance all in one dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}