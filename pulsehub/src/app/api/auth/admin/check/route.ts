import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || email !== adminEmail) {
      return NextResponse.json({ isAdmin: false });
    }

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json({ isAdmin: false });
    }

    const { data: userData } = await adminClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userData?.role === 'admin') {
      return NextResponse.json({ isAdmin: true });
    }

    await adminClient
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);

    return NextResponse.json({ isAdmin: true });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
