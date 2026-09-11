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

// GET: List available selection options
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as any;
    const state = searchParams.get('state');

    if (!platform || !state) {
      return NextResponse.json({ error: 'Missing platform or state' }, { status: 400 });
    }

    // Options are passed from callback via URL params on the frontend
    // This endpoint is for re-fetching if needed
    const optionsParam = searchParams.get('options');
    const options = optionsParam ? JSON.parse(optionsParam) : [];

    return NextResponse.json({ options });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Complete selection
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, selectionId, state } = body;

    if (!platform || !selectionId) {
      return NextResponse.json({ error: 'Missing platform or selectionId' }, { status: 400 });
    }

    const provider = getSocialProvider();
    const result = await provider.completeSelection({
      platform,
      userId: user.id,
      selectionId,
      state,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
