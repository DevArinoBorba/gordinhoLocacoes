import { getAllBanners } from '@/lib/queries';
import { BannerManager } from '../../components/banner-manager';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const banners = await getAllBanners();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">DESTAQUES DA LOJA</p>
        <h1>Banners do Topo</h1>
        <p>
          Gerencie os banners exibidos no carrossel superior do site. Quando houver mais de um banner ativo, eles alternam automaticamente a cada 3 segundos na loja.
        </p>
      </section>

      <BannerManager banners={banners} />
    </>
  );
}
