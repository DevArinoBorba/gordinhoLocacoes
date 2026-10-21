import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { supabase } from './supabase';

// Uploaded files are persistent runtime data, not build inputs.
export const photoDirectory = () =>
  resolve(/* turbopackIgnore: true */ process.env.UPLOADS_DIR || '.local/uploads');

export async function saveEquipmentPhoto(file: File) {
  if (
    !file.size ||
    file.size > 5 * 1024 * 1024 ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  ) {
    throw new Error('Envie uma foto JPG, PNG ou WebP de até 5 MB.');
  }

  const pipeline = sharp(Buffer.from(await file.arrayBuffer()), {
    limitInputPixels: 40000000,
  });
  const metadata = await pipeline.metadata();
  if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) {
    throw new Error('Formato de foto inválido.');
  }

  const data = await pipeline
    .rotate()
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const filename = `${randomUUID()}.webp`;

  if (supabase) {
    const { error } = await supabase.storage.from('equipment-photos').upload(filename, data, {
      contentType: 'image/webp',
      upsert: true,
    });
    if (error) {
      console.error('Falha ao enviar foto para o Supabase Storage:', error);
      throw new Error(`Falha no upload da foto: ${error.message}`);
    }
    return filename;
  }

  // Fallback para disco local (desenvolvimento / offline)
  await mkdir(photoDirectory(), { recursive: true });
  await writeFile(join(photoDirectory(), filename), data, { flag: 'wx' });
  return filename;
}

export async function removeNewPhoto(filename: string) {
  if (supabase) {
    await supabase.storage.from('equipment-photos').remove([filename]).catch(() => {});
    return;
  }
  await unlink(join(/* turbopackIgnore: true */ photoDirectory(), filename)).catch(() => {});
}
