import Link from 'next/link';
import { getBookingById } from '@/lib/queries';
import { brand } from '@/config/brand';
import { statusLabels } from '@/lib/validation';
import {
  formatBRL,
  paymentMethodLabels,
  paymentStatusLabels,
  type PaymentMethod,
  type PaymentStatus,
} from '@/lib/pricing';
import { PrintButton } from './PrintButton';
import {receiptWhatsAppLink} from '@/lib/whatsapp-links';

export const dynamic = 'force-dynamic';

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Reserva não encontrada</h2>
        <p className="muted">O identificador informado não corresponde a nenhuma reserva cadastrada.</p>
        <Link href="/reservas" className="button" style={{ marginTop: '16px' }}>
          Voltar para a lista de reservas
        </Link>
      </div>
    );
  }

  const date = (d: Date) =>
    d.toLocaleString('pt-BR', {
      timeZone: brand.timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const method = (booking.payment_method as PaymentMethod) || 'pix';
  const pStatus = (booking.payment_status as PaymentStatus) || 'pending';
  const receiptUrl=booking.whatsapp_consent?receiptWhatsAppLink({id:booking.id,phone:booking.phone,name:booking.name,start:booking.starts_at,end:booking.ends_at}):null;

  return (
    <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link href="/reservas" className="button" style={{ background: '#e2e8e5' }}>
          ← Voltar para reservas
        </Link>
        <PrintButton />
        <a className="button" href={`/api/reservas/${booking.id}/recibo`} download>Baixar PDF</a>
        {receiptUrl&&<a className="button whatsapp-contact" href={receiptUrl} target="_blank" rel="noopener noreferrer">Enviar pelo WhatsApp ↗</a>}
      </div>
      <p className="no-print muted">Para enviar ao cliente, baixe o PDF e anexe-o na conversa. A mensagem pronta não anexa o arquivo automaticamente.</p>

      <article className="receipt-sheet">
        {/* Cabeçalho do Recibo */}
        <header className="receipt-header">
          <div>
            <h1 style={{ margin: 0, fontSize: '28px' }}>{brand.name}</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              {brand.tagline}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="receipt-tag">COMPROVANTE DE LOCAÇÃO</span>
            <div style={{ fontSize: '12px', marginTop: '6px', color: 'var(--muted)' }}>
              Nº: <code>{booking.id.slice(0, 8).toUpperCase()}</code>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Emissão: {new Date().toLocaleDateString('pt-BR', { timeZone: brand.timezone })}
            </div>
          </div>
        </header>

        <hr style={{ border: '0', borderTop: '1px solid var(--line)', margin: '20px 0' }} />

        {/* Dados do Cliente & Operação */}
        <div className="receipt-grid">
          <div>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', margin: '0 0 8px 0' }}>
              Locatário (Cliente)
            </h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>
              {booking.customer_name}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>CPF/CNPJ:</strong> {booking.document}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>Telefone:</strong> {booking.phone}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>Endereço da obra:</strong> {booking.address}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', margin: '0 0 8px 0' }}>
              Período de Locação
            </h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>Retirada / Início:</strong> {date(booking.starts_at)}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>Devolução prevista:</strong> {date(booking.ends_at)}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>Duração faturada:</strong> {booking.days} {Number(booking.days) === 1 ? 'diária' : 'diárias'}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>Situação da reserva:</strong> {statusLabels[booking.status] || booking.status}
            </p>
          </div>
        </div>

        {/* Equipamento */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', margin: '0 0 10px 0' }}>
            Equipamento Locado
          </h3>
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Descrição do Equipamento</th>
                <th>Código Patrimonial</th>
                <th>Diária</th>
                <th>Qtd. Diárias</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{booking.name}</strong></td>
                <td><code>{booking.code}</code></td>
                <td>{formatBRL(booking.daily_rate)}</td>
                <td>{booking.days}</td>
                <td style={{ textAlign: 'right' }}><strong>{formatBRL(booking.subtotal_amount)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Discriminação Financeira */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <div className="receipt-calc-row">
              <span>Subtotal das diárias:</span>
              <span>{formatBRL(booking.subtotal_amount)}</span>
            </div>
            {Number(booking.freight_amount) > 0 && (
              <div className="receipt-calc-row">
                <span>Frete e entrega/coleta:</span>
                <span>+ {formatBRL(booking.freight_amount)}</span>
              </div>
            )}
            {Number(booking.discount_amount) > 0 && (
              <div className="receipt-calc-row" style={{ color: '#256043' }}>
                <span>Desconto especial:</span>
                <span>- {formatBRL(booking.discount_amount)}</span>
              </div>
            )}
            {Number(booking.deposit_amount) > 0 && (
              <div className="receipt-calc-row" style={{ color: '#775708' }}>
                <span>Caução em garantia:</span>
                <span>{formatBRL(booking.deposit_amount)}</span>
              </div>
            )}
            <div className="receipt-calc-total">
              <span>VALOR TOTAL:</span>
              <span>{formatBRL(booking.total_amount)}</span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '13px', textAlign: 'right', color: 'var(--muted)' }}>
              <span>Pagamento: <strong>{paymentMethodLabels[method] || method}</strong> ({paymentStatusLabels[pStatus] || pStatus})</span>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div style={{ marginTop: '20px', background: '#fafbfa', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--line)' }}>
            <strong style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
              OBSERVAÇÕES OPERACIONAIS:
            </strong>
            <p style={{ margin: 0, fontSize: '13px' }}>{booking.notes}</p>
          </div>
        )}

        {/* Termo de Responsabilidade */}
        <div style={{ marginTop: '28px', fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
          <p style={{ margin: '0 0 6px 0' }}>
            <strong>Termo de Entrega e Responsabilidade:</strong> O locatário declara ter recebido o equipamento acima discriminado em perfeitas condições de uso, funcionamento e conservação, responsabilizando-se integralmente pela guarda, correta operação conforme normas de segurança vigentes, devolução no prazo estipulado e eventuais danos ou avarias decorrentes de negligência ou mau uso.
          </p>
        </div>

        {/* Assinaturas */}
        <div className="receipt-signatures">
          <div className="signature-box">
            <div className="signature-line" />
            <span>{brand.name}</span>
            <small>Locador</small>
          </div>
          <div className="signature-box">
            <div className="signature-line" />
            <span>{booking.customer_name}</span>
            <small>Locatário (Assinatura)</small>
          </div>
        </div>
      </article>
    </>
  );
}
