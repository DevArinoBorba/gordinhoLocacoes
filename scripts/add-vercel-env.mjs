import { spawnSync } from 'node:child_process';

const envVars = {
  BRAND_PRIMARY: '#f6bc28',
  BUSINESS_TIMEZONE: 'America/Cuiaba',
  ADMIN_USER: 'admin',
  ADMIN_PASSWORD: 'senha-super-segura-16caracteres',
  PUBLIC_FORM_SECRET: 'senha-super-segura-16caracteres',
  WHATSAPP_PROVIDER: 'disabled',
  NEXT_PUBLIC_SUPABASE_URL: 'https://hpaysycuyoeehvrzrdlv.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYXlzeWN1eW9lZWh2cnpyZGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTcwMjIsImV4cCI6MjEwNjc5MzAyMn0.C0EoJvp-sQGBEszWs8YVOcW-0PmssJZSD8_n0z07rIw',
};

for (const [key, value] of Object.entries(envVars)) {
  for (const env of ['production', 'preview']) {
    console.log(`Adding ${key} (${env})...`);
    const res = spawnSync('npx', ['vercel', 'env', 'add', key, env], {
      input: value + '\n',
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true,
    });
    if (res.status !== 0) {
      console.warn(`Note: Could not add ${key} to ${env} (might already exist)`);
    }
  }
}
console.log('Finished configuring env vars.');
