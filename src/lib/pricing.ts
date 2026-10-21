export const paymentMethods = ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'boleto', 'faturado'] as const;
export type PaymentMethod = typeof paymentMethods[number];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  boleto: 'Boleto Bancário',
  faturado: 'Faturado / A Prazo',
};

export const paymentStatuses = ['pending', 'paid', 'partial', 'waived'] as const;
export type PaymentStatus = typeof paymentStatuses[number];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  partial: 'Parcial',
  waived: 'Isento / Cortesia',
};

export function calculateDays(start: string | Date, end: string | Date): number {
  const s = start instanceof Date ? start.getTime() : new Date(start).getTime();
  const e = end instanceof Date ? end.getTime() : new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return 1;
  const hours = (e - s) / (1000 * 60 * 60);
  // Fração de dia conta como 1 diária completa com mínimo de 1
  return Math.max(1, Math.ceil(hours / 24));
}

export interface PricingBreakdown {
  days: number;
  dailyRate: number;
  subtotalAmount: number;
  freightAmount: number;
  discountAmount: number;
  depositAmount: number;
  totalAmount: number;
}

export function calculatePricing(params: {
  dailyRate: number;
  days: number;
  freightAmount?: number;
  discountAmount?: number;
  depositAmount?: number;
}): PricingBreakdown {
  const dailyRate = Math.max(0, Number(Number(params.dailyRate || 0).toFixed(2)));
  const days = Math.max(1, Math.floor(params.days || 1));
  const subtotalAmount = Number((dailyRate * days).toFixed(2));
  const freightAmount = Math.max(0, Number(Number(params.freightAmount || 0).toFixed(2)));
  const discountAmount = Math.max(0, Number(Number(params.discountAmount || 0).toFixed(2)));
  const depositAmount = Math.max(0, Number(Number(params.depositAmount || 0).toFixed(2)));
  const totalAmount = Number(Math.max(0, subtotalAmount + freightAmount - discountAmount).toFixed(2));

  return {
    days,
    dailyRate,
    subtotalAmount,
    freightAmount,
    discountAmount,
    depositAmount,
    totalAmount,
  };
}

export function formatBRL(amount: number | string | null | undefined): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}
