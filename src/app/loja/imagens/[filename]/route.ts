import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { photoDirectory } from '@/lib/equipment-photos';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/.test(filename)) {
    return new Response(null, { status: 404 });
  }

  // 1. Tenta servir do disco local (desenvolvimento / offline)
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
    // Arquivo não está no disco local (ex: rodando na Vercel serverless)
  }

  // 2. Redireciona para o Supabase Storage público (nuvem / produção)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://hpaysycuyoeehvrzrdlv.supabase.co';

  return NextResponse.redirect(
    `${supabaseUrl}/storage/v1/object/public/equipment-photos/${filename}`,
    302
  );
}
