// src/app/(auth)/layout.tsx
import { ReactNode } from 'react';
import '@/app/globals.css';

export const metadata = {
  title: 'PulseHub - Authentication',
  description: 'Login or register to access PulseHub dashboard',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="font-montserrat">
      <body className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        {children}
      </body>
    </html>
  );
}