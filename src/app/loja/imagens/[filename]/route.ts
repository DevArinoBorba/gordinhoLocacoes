import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { photoDirectory } from '@/lib/equipment-photos';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/.test(filename)) {
    return new Response(null, { status: 404 });
  }

  if (supabase) {
    const { data } = supabase.storage.from('equipment-photos').getPublicUrl(filename);
    if (data?.publicUrl) {
      return NextResponse.redirect(data.publicUrl, 301);
    }
  }

  try {
    const data = await readFile(join(photoDirectory(), filename));
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
