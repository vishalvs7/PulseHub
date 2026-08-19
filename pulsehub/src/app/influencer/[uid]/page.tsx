import { redirect } from 'next/navigation';

export default async function InfluencerHomePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  redirect(`/influencer/${uid}/posting`);
}
