import { getStoreNotice } from '@/lib/queries';
import { NoticeManager } from '../../components/notice-manager';

export const dynamic = 'force-dynamic';

export default async function AdminAvisoPage() {
  const notice = await getStoreNotice();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">BARRA DE AVISOS DO SITE</p>
        <h1>Aviso do Topo</h1>
        <p>
          Gerencie o card de alerta e comunicação rápida exibido na barra superior da loja. Você pode alterar a mensagem, cores, links e ativar ou desativar animações.
        </p>
      </section>

      <NoticeManager notice={notice} />
    </>
  );
}
