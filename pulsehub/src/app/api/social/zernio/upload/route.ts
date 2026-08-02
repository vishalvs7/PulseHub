import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds 100MB limit.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const admin = getAdmin();
    const { error } = await admin.storage
      .from('post-media')
      .upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    const { data: publicUrl } = admin.storage.from('post-media').getPublicUrl(path);

    return NextResponse.json({
      url: publicUrl.publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
