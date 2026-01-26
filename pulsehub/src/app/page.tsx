// src/app/page.tsx
import { redirect } from 'next/navigation';
import LandingPage from '@/app/(landing)/page';

export default async function Home() {
  // This page redirects to the actual landing page
  // We'll add authentication checks later
  return <LandingPage />;
}