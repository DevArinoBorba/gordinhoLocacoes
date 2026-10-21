import { units } from '@/lib/queries';
import { UnitStateForm } from '../../components/forms';
import { UnitEditor } from '../../components/edit-forms';
import { formatBRL } from '@/lib/pricing';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminUnidadesPage() {
  const inventory = await units();

  const available = inventory.filter((u) => u.state === 'available').length;
  const maintenance = inventory.filter((u) => u.state === 'maintenance').length;
  const retired = inventory.filter((u) => u.state === 'retired').length;

  return (
    <>
      <section className="hero">
        <p className="eyebrow">CONTROLE DE INVENTÁRIO FÍSICO</p>
        <h1>Unidades Físicas</h1>
        <p>
          Gerenciamento individual de cada equipamento físico, códigos de patrimônio, números de série e situação operacional.
        </p>
      </section>

      <div className="metrics">
        <article>
          <strong>{inventory.length}</strong>
          <span>Total de unidades</span>
        </article>
        <article>
          <strong style={{ color: '#14603e' }}>{available}</strong>
          <span>Disponíveis para locação</span>
        </article>
        <article>
          <strong style={{ color: maintenance > 0 ? '#b45309' : 'var(--ink)' }}>{maintenance}</strong>
          <span>Em manutenção</span>
        </article>
      </div>

      <section className="panel">
        <div className="section-title">
          <div>
            <h2>Inventário de Unidades</h2>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {inventory.length} unidades cadastradas no sistema
            </span>
          </div>
          <Link className="button" href="/admin/cadastros">
            + Cadastrar nova unidade
          </Link>
        </div>

        {inventory.length === 0 ? (
          <div className="empty" style={{ marginTop: '20px' }}>
            Nenhuma unidade física cadastrada ainda. Cadastre um equipamento e depois adicione suas unidades físicas.
          </div>
        ) : (
          <div className="table-wrap" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>Código</th>
                  <th>Série</th>
                  <th>Diária base</th>
                  <th>Situação operacional</th>
                  <th>Editar dados</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>
                      <code>{u.code}</code>
                    </td>
                    <td>{u.serial || '—'}</td>
                    <td>{formatBRL(u.daily_rate)}</td>
                    <td>
                      <UnitStateForm unit={u} />
                    </td>
                    <td>
                      <UnitEditor unit={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
