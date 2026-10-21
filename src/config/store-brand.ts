// Public storefront identity; the administrative theme is independent.
const color=(value:string|undefined,fallback:string)=>/^#[0-9a-f]{6}$/i.test(value||'')?value!:fallback;
export const storeBrand={
  primary:color(process.env.STOREFRONT_PRIMARY,'#fab818'),
  background:color(process.env.STOREFRONT_BACKGROUND,'#0f3822'),
  surface:color(process.env.STOREFRONT_SURFACE,'#13442a'),
  mascot:process.env.STOREFRONT_MASCOT||'/brand/gordinho-mascot.png',
  subtitle:process.env.STOREFRONT_SUBTITLE||'LOCAÇÕES',
};
