import { NextRequest, NextResponse } from 'next/server';
import { getSocialProvider } from '@/services/social/contracts';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await getSupabase().auth.getUser(token);
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    const provider = getSocialProvider();
    const result = await provider.getConnectUrl({
      platform,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Connect error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
