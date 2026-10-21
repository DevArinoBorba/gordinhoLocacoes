import { catalogue } from '@/lib/queries';
import { EquipmentForm, UnitForm } from '../../components/forms';

export const dynamic = 'force-dynamic';

export default async function AdminCadastrosPage() {
  const equipment = await catalogue();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">NOVO PATRIMÔNIO OU MODELO</p>
        <h1>Cadastros</h1>
        <p>
          Adicione novos modelos de equipamentos com valores de diária para o catálogo ou registre unidades físicas no inventário.
        </p>
      </section>

      <section className="grid panel">
        <EquipmentForm />
        <UnitForm equipment={equipment} />
      </section>
    </>
  );
}
