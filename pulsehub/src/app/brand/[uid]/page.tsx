import { redirect } from 'next/navigation';

export default async function BrandHomePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  redirect(`/brand/${uid}/posting`);
}
