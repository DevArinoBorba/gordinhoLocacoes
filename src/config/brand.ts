function cleanBrandText(val: string | undefined, fallback: string): string {
  if (!val || val.includes('?') || val.includes('\uFFFD')) return fallback;
  return val;
}

export const brand = {
  name: cleanBrandText(process.env.BRAND_NAME, 'Gordinho Locações'),
  tagline: cleanBrandText(process.env.BRAND_TAGLINE, 'Equipamentos disponíveis. Obra em movimento.'),
  primary: /^#[0-9a-f]{6}$/i.test(process.env.BRAND_PRIMARY || '') ? process.env.BRAND_PRIMARY! : '#f6bc28',
  timezone: 'America/Sao_Paulo',
};
