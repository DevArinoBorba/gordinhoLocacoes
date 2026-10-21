import { EquipmentImage } from '@/app/components/equipment-image';
import Link from 'next/link';
import { catalogue, getActiveBanners } from '@/lib/queries';
import { formatBRL } from '@/lib/pricing';
import { storeBrand } from '@/config/store-brand';
import { HeroBannerSlider } from '@/app/components/hero-banner-slider';

export async function StoreContent({
  searchParams,
  basePath = '',
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
  basePath?: string;
}) {
  const params = await searchParams;
  const [all, banners] = await Promise.all([
    catalogue(),
    getActiveBanners(),
  ]);
  const categories = [...new Set(all.map((e) => e.category))];
  const equipment = all.filter(
    (e) =>
      (!params.categoria || e.category === params.categoria) &&
      (!params.q || e.name.toLocaleLowerCase('pt-BR').includes(params.q.toLocaleLowerCase('pt-BR')))
  );

  const prefix = basePath || '';

  return (
    <>
      <HeroBannerSlider banners={banners} defaultMascot={storeBrand.mascot} />

      <section className="store-catalog" id="equipamentos">
        <div className="store-section-title">
          <div>
            <p className="store-eyebrow">O QUE VOCÊ PRECISA HOJE?</p>
            <h2>CATÁLOGO DE EQUIPAMENTOS</h2>
          </div>
          <span>{all.length} opções para seu projeto</span>
        </div>

        <div className="category-chips">
          <Link className={!params.categoria ? 'active' : ''} href={`${prefix}/#equipamentos`}>
            Todos os equipamentos
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              className={params.categoria === c ? 'active' : ''}
              href={`${prefix}/?categoria=${encodeURIComponent(c)}#equipamentos`}
            >
              {c}
            </Link>
          ))}
        </div>

        <form className="store-search" action={`${prefix}/#equipamentos`}>
          <label className="sr-only" htmlFor="search-equipment">
            Buscar equipamento
          </label>
          <input
            id="search-equipment"
            name="q"
            placeholder="Buscar equipamento…"
            defaultValue={params.q}
          />
          <label className="sr-only" htmlFor="filter-category">
            Categoria
          </label>
          <select id="filter-category" name="categoria" defaultValue={params.categoria || ''}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button className="store-button">Buscar</button>
        </form>

        <div className="store-grid">
          {equipment.map((e) => (
            <article className="store-card" key={e.id}>
              <Link
                className="store-card-art"
                aria-label={`Ver detalhes de ${e.name}`}
                href={`/loja/reservar?equipamento=${e.id}`}
              >
                <span>{e.category}</span>
                <EquipmentImage name={e.name} filename={e.photo_filename} />
                {!e.photo_filename && <small className="art-caption">Imagem ilustrativa</small>}
              </Link>
              <div className="store-card-content">
                <h3>
                  <Link href={`/loja/reservar?equipamento=${e.id}`}>{e.name}</Link>
                </h3>
                <p className="store-card-caption">
                  {e.available > 0 ? 'Consulte as datas disponíveis' : 'Temporariamente fora de operação'} · mínimo de {e.min_days} {e.min_days === 1 ? 'diária' : 'diárias'}
                </p>
                <div className="store-card-bottom">
                  <div>
                    <strong>{formatBRL(e.daily_rate)}</strong>
                    <small>/ diária</small>
                  </div>
                  <Link
                    aria-label={`Consultar ${e.name}`}
                    className="store-card-link"
                    href={`/loja/reservar?equipamento=${e.id}`}
                  >
                    Ver equipamento ↗
                  </Link>
                </div>
                {Number(e.deposit_amount) > 0 && (
                  <p className="store-deposit">Caução: {formatBRL(e.deposit_amount)}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        {!equipment.length && (
          <div className="store-empty">
            Nenhum equipamento encontrado. Tente outro nome ou categoria.
          </div>
        )}
      </section>

      <section id="como-funciona" className="store-how">
        <div>
          <p className="store-eyebrow">SIMPLES DO INÍCIO AO FIM</p>
          <h2>
            Você planeja.<br />
            A gente facilita.
          </h2>
          <p>
            Seu pedido chega direto à nossa equipe. A locação só é confirmada após nosso contato.
          </p>
        </div>
        <div className="store-steps">
          <article>
            <span>01</span>
            <h3>Escolha o equipamento</h3>
            <p>Encontre a opção para sua obra, evento ou produção.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Informe o período</h3>
            <p>Consulte a disponibilidade para suas datas e horários.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Solicite sua reserva</h3>
            <p>Preencha seus dados e aguarde a confirmação da equipe.</p>
          </article>
        </div>
      </section>
    </>
  );
}
