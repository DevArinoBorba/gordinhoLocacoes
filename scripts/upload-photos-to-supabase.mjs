import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpaysycuyoeehvrzrdlv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYXlzeWN1eW9lZWh2cnpyZGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTcwMjIsImV4cCI6MjEwNjc5MzAyMn0.C0EoJvp-sQGBEszWs8YVOcW-0PmssJZSD8_n0z07rIw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const dir = '.local/uploads';
  const files = await readdir(dir);
  console.log(`Found ${files.length} images to upload to Supabase Storage bucket 'equipment-photos'...`);

  for (const filename of files) {
    if (!filename.endsWith('.webp')) continue;
    const filePath = join(dir, filename);
    const buffer = await readFile(filePath);

    const { data, error } = await supabase.storage.from('equipment-photos').upload(filename, buffer, {
      contentType: 'image/webp',
      upsert: true,
    });

    if (error) {
      console.error(`Failed to upload ${filename}:`, error.message);
    } else {
      const { data: urlData } = supabase.storage.from('equipment-photos').getPublicUrl(filename);
      console.log(`✓ Uploaded ${filename} -> ${urlData.publicUrl}`);
    }
  }

  console.log('\nAll photos uploaded to Supabase Storage!');
}

main().catch(console.error);
