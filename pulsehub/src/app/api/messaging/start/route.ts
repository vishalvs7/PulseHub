import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const otherUserId = body.otherUserId as string | undefined;

    if (!otherUserId) {
      return NextResponse.json({ error: 'otherUserId is required.' }, { status: 400 });
    }
    if (otherUserId === user.id) {
      return NextResponse.json({ error: 'Cannot message yourself.' }, { status: 400 });
    }

    const admin = getAdmin();

    // Find an existing 2-party conversation between these users.
    const { data: myConvs } = await admin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    const myIds = (myConvs || []).map((c: { conversation_id: string }) => c.conversation_id);

    let conversationId: string | null = null;
    if (myIds.length > 0) {
      const { data: otherSide } = await admin
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', myIds)
        .eq('user_id', otherUserId);

      // Prefer conversations with exactly these two participants.
      const candidate = otherSide?.[0]?.conversation_id || null;
      if (candidate) {
        const { count } = await admin
          .from('conversation_participants')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', candidate);
        if (count === 2) conversationId = candidate;
      }
    }

    if (!conversationId) {
      const { data: conv, error: convError } = await admin
        .from('conversations')
        .insert({})
        .select()
        .single();
      if (convError || !conv) {
        return NextResponse.json({ error: `Failed to create conversation: ${convError?.message}` }, { status: 500 });
      }
      conversationId = conv.id;

      const { error: pError } = await admin.from('conversation_participants').insert([
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: otherUserId },
      ]);
      if (pError) {
        return NextResponse.json({ error: `Failed to add participants: ${pError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, conversationId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start conversation';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
