import { catalogue } from '@/lib/queries';
import { brand } from '@/config/brand';
import { formatBRL } from '@/lib/pricing';
import { EquipmentEditor, EquipmentPhotoForm } from '../components/edit-forms';
import { EquipmentImage } from '../components/equipment-image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const equipment = await catalogue();

  const totalOperational = equipment.reduce((sum, e) => sum + e.available, 0);
  const totalPhysicalUnits = equipment.reduce((sum, e) => sum + e.total, 0);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">SEU INVENTÁRIO, ORGANIZADO</p>
        <h1>Pronto para a próxima obra.</h1>
        <p>{brand.tagline}</p>
      </section>

      <div className="metrics">
        <article>
          <strong>{equipment.length}</strong>
          <span>Modelos no catálogo</span>
        </article>
        <article>
          <strong>{totalOperational}</strong>
          <span>Unidades operacionais</span>
        </article>
        <article>
          <strong>{totalPhysicalUnits}</strong>
          <span>Total em patrimônio</span>
        </article>
      </div>

      <div className="section-title">
        <div>
          <h2>Catálogo de Equipamentos & Preços</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Gerencie descrições, fotos, valores de diária e caução de cada item.
          </span>
        </div>
        <Link className="button" href="/admin/cadastros">
          + Adicionar equipamento
        </Link>
      </div>

      <div className="cards">
        {equipment.map((e) => (
          <article key={e.id}>
            {e.photo_filename && (
              <div
                style={{
                  height: 180,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  background: '#06180e',
                  marginBottom: '12px',
                }}
              >
                <EquipmentImage name={e.name} filename={e.photo_filename} />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <p className="eyebrow">{e.category}</p>
              <strong style={{ color: 'var(--ink)', fontSize: '18px' }}>
                {formatBRL(e.daily_rate)}
                <small
                  style={{
                    fontSize: '11px',
                    fontWeight: 'normal',
                    color: 'var(--muted)',
                  }}
                >
                  /dia
                </small>
              </strong>
            </div>
            <h3>{e.name}</h3>
            <p>{e.description || 'Sem descrição cadastrada.'}</p>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '12px',
              }}
            >
              <span className="badge">
                {e.available} operacionais / {e.total} unidades
              </span>
              {e.min_days > 1 && (
                <span className="badge">Mín. {e.min_days} diárias</span>
              )}
              {Number(e.deposit_amount) > 0 && (
                <span className="badge">
                  Caução: {formatBRL(e.deposit_amount)}
                </span>
              )}
            </div>
            <EquipmentEditor equipment={e} />
            <EquipmentPhotoForm id={e.id} />
          </article>
        ))}
      </div>

      {!equipment.length && (
        <div className="empty">
          Seu catálogo começa aqui. Cadastre os equipamentos com valores de diária na página de cadastros.
        </div>
      )}
    </>
  );
}
