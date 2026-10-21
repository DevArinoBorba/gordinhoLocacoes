'use client';
import { useState, useActionState } from 'react';
import { addEquipment, addUnit, reserve, updateStatus, updateUnit, updateReservationPayment, type ActionState } from '../actions';
import type { Equipment, Unit } from '@/lib/queries';
import {
  calculateDays,
  calculatePricing,
  formatBRL,
  paymentMethods,
  paymentMethodLabels,
  paymentStatuses,
  paymentStatusLabels,
  type PaymentMethod,
  type PaymentStatus,
} from '@/lib/pricing';

const initial: ActionState = { ok: false, message: '' };

function Message({ state }: { state: ActionState }) {
  return state.message ? (
    <p role="status" className={state.ok ? 'success' : 'error'}>
      {state.message}
    </p>
  ) : null;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return <button disabled={pending}>{pending ? 'Salvando…' : children}</button>;
}

export function EquipmentForm() {
  const [state, action, pending] = useActionState(addEquipment, initial);
  return (
    <form action={action}>
      <h3>Novo equipamento</h3>
      <label>
        Nome
        <input name="name" required minLength={2} maxLength={120} placeholder="Ex.: Betoneira 400 L" />
      </label>
      <label>
        Categoria
        <input name="category" required minLength={2} maxLength={80} placeholder="Ex.: Construção civil" />
      </label>
      <div className="grid">
        <label>
          Valor da diária (R$)
          <input
            name="dailyRate"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue="150.00"
            placeholder="150.00"
          />
        </label>
        <label>
          Mínimo de diárias
          <input name="minDays" type="number" min="1" required defaultValue="1" />
        </label>
      </div>
      <label>
        Caução padrão (R$, opcional)
        <input name="depositAmount" type="number" step="0.01" min="0" defaultValue="0.00" />
      </label>
      <label>
        Descrição
        <textarea name="description" maxLength={1000} placeholder="Detalhes técnicos, voltagem, capacidade..." />
      </label>
      <label>Ideal para<textarea name="idealFor" maxLength={1000} placeholder="Em quais situações o equipamento é indicado?"/></label>
      <label>O que acompanha<textarea name="includedItems" maxLength={1000} placeholder="Um acessório por linha"/></label>
      <Submit pending={pending}>Cadastrar equipamento</Submit>
      <Message state={state} />
    </form>
  );
}

export function UnitForm({ equipment }: { equipment: Equipment[] }) {
  const [state, action, pending] = useActionState(addUnit, initial);
  return (
    <form action={action}>
      <h3>Adicionar unidade</h3>
      <label>
        Equipamento
        <select name="equipmentId" required>
          <option value="">Selecione</option>
          {equipment.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({formatBRL(e.daily_rate)}/dia)
            </option>
          ))}
        </select>
      </label>
      <label>
        Código patrimonial
        <input name="code" required maxLength={60} placeholder="BET-001" />
      </label>
      <label>
        Número de série
        <input name="serial" maxLength={120} placeholder="Opcional" />
      </label>
      <Submit pending={pending}>Adicionar unidade</Submit>
      <Message state={state} />
    </form>
  );
}

export function UnitStateForm({ unit }: { unit: Unit }) {
  const [state, action, pending] = useActionState(updateUnit, initial);
  return (
    <form action={action} className="compact">
      <input type="hidden" name="id" value={unit.id} />
      <select aria-label={`Situação de ${unit.code}`} name="state" defaultValue={unit.state}>
        <option value="available">Operacional</option>
        <option value="maintenance">Manutenção</option>
        <option value="retired">Retirada de uso</option>
      </select>
      <Submit pending={pending}>Atualizar</Submit>
      <Message state={state} />
    </form>
  );
}

export function ReservationForm({
  units,
  start,
  end,
  requestId,
}: {
  units: Unit[];
  start: string;
  end: string;
  requestId: string;
}) {
  const [state, action, pending] = useActionState(reserve, initial);
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || '');
  const [dailyRate, setDailyRate] = useState<number>(() => Number(units[0]?.daily_rate || 0));
  const [freightAmount, setFreightAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(() => Number(units[0]?.deposit_amount || 0));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  const days = Math.max(calculateDays(start, end),units.find(u=>u.id===selectedUnitId)?.min_days||1);

  // Quando o usuário muda a unidade selecionada, pré-carrega o valor da diária e caução cadastrados
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const found = units.find((u) => u.id === unitId);
    if (found) {
      if (found.daily_rate !== undefined) setDailyRate(Number(found.daily_rate));
      if (found.deposit_amount !== undefined) setDepositAmount(Number(found.deposit_amount));
    }
  };

  const pricing = calculatePricing({
    dailyRate,
    days,
    freightAmount,
    discountAmount,
    depositAmount,
  });

  return (
    <form action={action} key={`${start}/${end}`}>
      <h3>Dados da reserva e valores</h3>
      <p className="muted">
        Período: {new Date(start).toLocaleString('pt-BR')} até {new Date(end).toLocaleString('pt-BR')} (
        <strong>{days} {days === 1 ? 'diária' : 'diárias'}</strong> calculada{days === 1 ? '' : 's'}).
      </p>

      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="start" value={start} />
      <input type="hidden" name="end" value={end} />

      <label>
        Unidade
        <select
          name="unitId"
          required
          value={selectedUnitId}
          onChange={(e) => handleUnitChange(e.target.value)}
        >
          <option value="">Selecione uma unidade disponível</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} · {u.code} ({formatBRL(u.daily_rate)}/dia)
            </option>
          ))}
        </select>
      </label>

      {/* Caixa de Composição Financeira */}
      <div className="pricing-box">
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Composição Financeira da Locação</h4>
        <div className="grid">
          <label>
            Valor da Diária (R$)
            <input
              name="dailyRate"
              type="number"
              step="0.01"
              min="0"
              required
              value={dailyRate}
              onChange={(e) => setDailyRate(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            Frete / Entrega e Coleta (R$)
            <input
              name="freightAmount"
              type="number"
              step="0.01"
              min="0"
              value={freightAmount}
              onChange={(e) => setFreightAmount(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            Desconto (R$)
            <input
              name="discountAmount"
              type="number"
              step="0.01"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            Caução garantia (R$, opcional)
            <input
              name="depositAmount"
              type="number"
              step="0.01"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        <div className="grid">
          <label>
            Forma de Pagamento
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {paymentMethodLabels[m]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Situação do Pagamento
            <select
              name="paymentStatus"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            >
              {paymentStatuses.map((s) => (
                <option key={s} value={s}>
                  {paymentStatusLabels[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Resumo do Cálculo em Tempo Real */}
        <div className="pricing-summary">
          <div className="pricing-row">
            <span>
              Subtotal ({days} {days === 1 ? 'diária' : 'diárias'} × {formatBRL(pricing.dailyRate)}):
            </span>
            <strong>{formatBRL(pricing.subtotalAmount)}</strong>
          </div>
          {pricing.freightAmount > 0 && (
            <div className="pricing-row">
              <span>Frete e transporte:</span>
              <strong>+ {formatBRL(pricing.freightAmount)}</strong>
            </div>
          )}
          {pricing.discountAmount > 0 && (
            <div className="pricing-row" style={{ color: '#256043' }}>
              <span>Desconto concedido:</span>
              <strong>- {formatBRL(pricing.discountAmount)}</strong>
            </div>
          )}
          {pricing.depositAmount > 0 && (
            <div className="pricing-row" style={{ color: '#6a5217' }}>
              <span>Caução de garantia:</span>
              <strong>{formatBRL(pricing.depositAmount)} (reversível)</strong>
            </div>
          )}
          <div className="pricing-total">
            <span>VALOR TOTAL DA LOCAÇÃO:</span>
            <span>{formatBRL(pricing.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="grid">
        <label>
          Nome / Razão Social
          <input name="name" required minLength={2} maxLength={120} autoComplete="organization" />
        </label>
        <label>
          CPF / CNPJ (com dígitos válidos)
          <input name="document" required maxLength={18} inputMode="numeric" placeholder="000.000.000-00" />
        </label>
        <label>
          Telefone / WhatsApp com DDD
          <input name="phone" required type="tel" maxLength={22} autoComplete="tel" placeholder="(65) 99999-9999" />
        </label>
        <label>
          Endereço da obra / entrega
          <input
            name="address"
            required
            minLength={8}
            maxLength={500}
            autoComplete="street-address"
            placeholder="Rua, número, bairro, cidade"
          />
        </label>
      </div>

      <label>
        Observações e instruções operacionais
        <textarea name="notes" maxLength={1000} placeholder="Informações de acesso, contato no local, etc." />
      </label>

      <label className="checkbox">
        <input name="whatsappConsent" type="checkbox" />
        Cliente autorizou receber confirmação pelo WhatsApp
      </label>

      <Submit pending={pending || !requestId || state.ok}>Confirmar e criar reserva</Submit>
      <Message state={state} />
      {state.ok && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <a href="/reservas" className="button">
            Ir para lista de reservas
          </a>
          <a href="/reservas/nova" className="button" style={{ background: '#e2e8e5' }}>
            Nova consulta
          </a>
        </div>
      )}
    </form>
  );
}

const next: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['active', 'cancelled'],
  active: ['completed'],
  completed: [],
  cancelled: [],
};
const labels: Record<string, string> = {
  confirmed: 'Confirmar',
  active: 'Registrar retirada',
  completed: 'Registrar devolução',
  cancelled: 'Cancelar',
};

export function StatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(updateStatus, initial);
  if (!next[status]?.length) return <span className="muted">Encerrada</span>;
  return (
    <form action={action} className="compact">
      <input type="hidden" name="id" value={id} />
      <select aria-label="Novo status" name="status">
        {next[status].map((s) => (
          <option key={s} value={s}>
            {labels[s]}
          </option>
        ))}
      </select>
      <Submit pending={pending}>Aplicar</Submit>
      <Message state={state} />
    </form>
  );
}

export function PaymentStatusForm({
  id,
  paymentMethod,
  paymentStatus,
}: {
  id: string;
  paymentMethod: string;
  paymentStatus: string;
}) {
  const [state, action, pending] = useActionState(updateReservationPayment, initial);
  return (
    <form action={action} className="compact" style={{ marginTop: '6px' }}>
      <input type="hidden" name="id" value={id} />
      <select aria-label="Forma de pagamento" name="paymentMethod" defaultValue={paymentMethod}>
        {paymentMethods.map((m) => (
          <option key={m} value={m}>
            {paymentMethodLabels[m]}
          </option>
        ))}
      </select>
      <select aria-label="Situação do pagamento" name="paymentStatus" defaultValue={paymentStatus}>
        {paymentStatuses.map((s) => (
          <option key={s} value={s}>
            {paymentStatusLabels[s]}
          </option>
        ))}
      </select>
      <Submit pending={pending}>Salvar</Submit>
      <Message state={state} />
    </form>
  );
}
