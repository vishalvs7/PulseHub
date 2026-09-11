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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 });
    }

    const provider = getSocialProvider();
    const result = await provider.presignUpload({
      userId: user.id,
      filename: file.name,
      contentType: file.type,
    });

    // Upload file to the presigned URL
    const uploadRes = await fetch(result.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file');
    }

    return NextResponse.json({
      url: result.publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
