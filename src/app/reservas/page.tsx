import Link from 'next/link';
import { bookings } from '@/lib/queries';
import {customerWhatsAppLink,receiptWhatsAppLink,reservationReference,whatsappPhone} from '@/lib/whatsapp-links';
import { brand } from '@/config/brand';
import { statusLabels, statuses } from '@/lib/validation';
import { StatusForm, PaymentStatusForm } from '../components/forms';
import { formatBRL, paymentMethodLabels, paymentStatusLabels, type PaymentMethod, type PaymentStatus } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default async function Reservations({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const filter = (await searchParams).status;
  const all = await bookings();
  const rows = all.filter((r) => !filter || r.status === filter);
  const date = (d: Date) => d.toLocaleString('pt-BR', { timeZone: brand.timezone });

  return (
    <>
      <section className="section-title">
        <div>
          <p className="eyebrow">CONTROLE DA OPERAÇÃO</p>
          <h1>Reservas & Faturamento</h1>
        </div>
        <Link className="button" href="/reservas/nova">
          + Nova reserva
        </Link>
      </section>

      <form className="filter">
        <label>
          Status da reserva
          <select name="status" defaultValue={filter || ''}>
            <option value="">Todos</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <button>Filtrar</button>
      </form>

      <p className="muted">
        Até 500 reservas mais recentes por data de início. Horário de Brasília.
      </p>

      <div className="booking-list">
        {rows.map((r) => {
          const method = (r.payment_method as PaymentMethod) || 'pix';
          const pStatus = (r.payment_status as PaymentStatus) || 'pending';
          const isPaid = pStatus === 'paid';
          const contactUrl=r.whatsapp_consent?customerWhatsAppLink({id:r.id,phone:r.phone,name:r.name,start:r.starts_at,end:r.ends_at}):null;
          const phone=whatsappPhone(r.phone);
          const receiptUrl=r.whatsapp_consent?receiptWhatsAppLink({id:r.id,phone:r.phone,name:r.name,start:r.starts_at,end:r.ends_at}):null;

          return (
            <article className="panel" key={r.id}>
              <div className="section-title">
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>
                    {r.name} <small>· {r.code}</small>
                  </h3>
                  <span className="muted" style={{ fontSize: '12px' }}>
                    {r.days || 1} {Number(r.days) === 1 ? 'diária' : 'diárias'} ({formatBRL(r.daily_rate)}/dia)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${r.status}`}>{statusLabels[r.status]}</span>
                  <span
                    className="badge"
                    style={{
                      background: isPaid ? '#dcf2e6' : '#fff1c4',
                      color: isPaid ? '#14603e' : '#775708',
                      fontWeight: 'bold',
                    }}
                  >
                    {paymentStatusLabels[pStatus] || pStatus}
                  </span>
                </div>
              </div>

              <div style={{ margin: '14px 0' }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  <strong>{r.customer_name}</strong> · {r.phone}
                </p>
                <p className="muted" style={{fontSize:12}}>Pedido: {reservationReference(r.id)}</p>
                <div className="reservation-contact">{contactUrl&&<a className="button whatsapp-contact" href={contactUrl} target="_blank" rel="noopener noreferrer">Falar com o cliente pelo WhatsApp ↗</a>}{phone&&<a className="button phone-contact" href={`tel:+${phone}`}>Ligar para o cliente</a>}</div>
                <p className="muted" style={{fontSize:11}}>{r.whatsapp_consent?'Mensagem pronta para revisar e enviar. Abrir a conversa não confirma a reserva.':'Contato pelo WhatsApp não autorizado neste pedido. Use o telefone para o atendimento.'}</p>
                <p style={{ margin: '0 0 8px 0', color: 'var(--muted)', fontSize: '13px' }}>
                  {date(r.starts_at)} → {date(r.ends_at)}
                </p>
              </div>

              {/* Destaque financeiro no card */}
              <div
                style={{
                  background: '#f8faf9',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  margin: '12px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>
                    Forma: {paymentMethodLabels[method] || method}
                  </span>
                  {Number(r.deposit_amount) > 0 && (
                    <span style={{ fontSize: '12px', color: '#775708', display: 'block' }}>
                      Caução: {formatBRL(r.deposit_amount)}
                    </span>
                  )}
                  {Number(r.freight_amount) > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>
                      Frete: +{formatBRL(r.freight_amount)}
                    </span>
                  )}
                  {Number(r.discount_amount) > 0 && (
                    <span style={{ fontSize: '12px', color: '#256043', display: 'block' }}>
                      Desconto: -{formatBRL(r.discount_amount)}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>
                    VALOR TOTAL
                  </span>
                  <strong style={{ fontSize: '22px', color: 'var(--ink)' }}>
                    {formatBRL(r.total_amount)}
                  </strong>
                </div>
              </div>

              <details>
                <summary>Detalhes do cliente e observações</summary>
                <p style={{ margin: '6px 0' }}>CPF/CNPJ: {r.document}</p>
                <p style={{ margin: '6px 0' }}>Endereço: {r.address}</p>
                <p style={{ margin: '6px 0' }}>Observações: {r.notes || 'Sem observações.'}</p>
                <small style={{ color: 'var(--muted)' }}>ID Reserva: {r.id}</small>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed var(--line)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px' }}>Atualizar Pagamento</h4>
                  <PaymentStatusForm id={r.id} paymentMethod={r.payment_method} paymentStatus={r.payment_status} />
                </div>
              </details>

              <div
                className="section-title"
                style={{ marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Link
                    href={`/reservas/${r.id}/recibo`}
                    className="button"
                    style={{ background: '#e2e8e5', fontSize: '13px', padding: '8px 14px' }}
                  >
                    📄 Imprimir recibo
                  </Link>
                  <a className="button phone-contact" href={`/api/reservas/${r.id}/recibo`} download>Baixar recibo PDF</a>
                  {receiptUrl&&<a className="button whatsapp-contact" href={receiptUrl} target="_blank" rel="noopener noreferrer">Enviar recibo pelo WhatsApp ↗</a>}
                  <p className="muted" style={{ margin: 0, fontSize: '12px' }}>
                    Aviso automático: {r.notification_status === 'disabled' ? 'não configurado' : r.notification_status === 'sent' ? 'enviado' : r.notification_status === 'failed' ? 'falhou' : 'aguardando envio'}
                  </p>
                </div>
                <StatusForm id={r.id} status={r.status} />
              </div>
              <p className="muted" style={{fontSize:11}}>Para enviar o comprovante, baixe o PDF e anexe-o na conversa do WhatsApp. A mensagem abre pronta; o arquivo precisa ser anexado pelo funcionário.</p>
            </article>
          );
        })}
      </div>

      {!rows.length && <div className="empty">Nenhuma reserva encontrada.</div>}
    </>
  );
}
