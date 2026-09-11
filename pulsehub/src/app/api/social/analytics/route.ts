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

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as any;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const provider = getSocialProvider();
    const analytics = await provider.getAnalytics({
      userId: user.id,
      platform,
      dateFrom,
      dateTo,
    });

    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
