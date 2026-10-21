import { z } from 'zod';
import { paymentMethods, paymentStatuses } from './pricing';
export const statuses = ['pending','confirmed','active','completed','cancelled'] as const;
export const statusLabels: Record<string,string> = {pending:'Pendente',confirmed:'Confirmada',active:'Em locação',completed:'Concluída',cancelled:'Cancelada'};
const digits = (value: string) => value.replace(/\D/g,'');
export function validDocument(value: string) {
  const n = digits(value);
  if (!/^(\d{11}|\d{14})$/.test(n) || /^(\d)\1+$/.test(n)) return false;
  if (n.length === 11) {
    for (let size = 9; size <= 10; size++) {
      const sum = [...n.slice(0,size)].reduce((acc,d,i)=>acc+Number(d)*(size+1-i),0);
      const check = (sum * 10) % 11;
      if ((check === 10 ? 0 : check) !== Number(n[size])) return false;
    }
  } else {
    for (let size = 12; size <= 13; size++) {
      let weight = size - 7;
      const sum = [...n.slice(0,size)].reduce((acc,d)=>{const result=acc+Number(d)*weight;weight=weight===2?9:weight-1;return result;},0);
      const rest = sum % 11;
      if ((rest < 2 ? 0 : 11-rest) !== Number(n[size])) return false;
    }
  }
  return true;
}
export const periodSchema = z.object({start:z.iso.datetime({offset:true}),end:z.iso.datetime({offset:true})}).refine(v=>Date.parse(v.end)>Date.parse(v.start),'O fim deve ser posterior ao início.');
export const reservationSchema = z.object({
  unitId:z.uuid(), requestId:z.uuid(), name:z.string().trim().min(2).max(120),
  document:z.string().refine(validDocument,'CPF/CNPJ inválido.').transform(digits),
  phone:z.string().transform(digits).refine(v=>/^\d{10,15}$/.test(v),'Telefone inválido (inclua DDD).'),
  address:z.string().trim().min(8).max(500),
  whatsappConsent:z.boolean(), notes:z.string().trim().max(1000).default(''),
  start:z.iso.datetime({offset:true}), end:z.iso.datetime({offset:true}),
  dailyRate:z.coerce.number().min(0,'Diária não pode ser negativa.').default(0),
  freightAmount:z.coerce.number().min(0,'Frete não pode ser negativo.').default(0),
  discountAmount:z.coerce.number().min(0,'Desconto não pode ser negativo.').default(0),
  depositAmount:z.coerce.number().min(0,'Caução não pode ser negativo.').default(0),
  paymentMethod:z.enum(paymentMethods).default('pix'),
  paymentStatus:z.enum(paymentStatuses).default('pending'),
}).refine(v=>Date.parse(v.end)>Date.parse(v.start),'O fim deve ser posterior ao início.');
export const equipmentSchema = z.object({
  idealFor:z.string().trim().max(1000).default(''),
  includedItems:z.string().trim().max(1000).default(''),
  name:z.string().trim().min(2).max(120),
  description:z.string().trim().max(1000).default(''),
  category:z.string().trim().min(2).max(80),
  dailyRate:z.coerce.number().min(0,'Diária não pode ser negativa.').default(0),
  minDays:z.coerce.number().int().min(1,'Mínimo de 1 diária.').default(1),
  depositAmount:z.coerce.number().min(0,'Caução não pode ser negativo.').default(0),
});
export const unitSchema = z.object({equipmentId:z.uuid(),code:z.string().trim().min(1).max(60),serial:z.string().trim().max(120).default('')});
export const bannerSchema = z.object({
  title: z.string().trim().min(2, 'Título obrigatório').max(150),
  subtitle: z.string().trim().max(500).default(''),
  eyebrow: z.string().trim().max(100).default(''),
  linkUrl: z.string().trim().max(300).default('#equipamentos'),
  linkText: z.string().trim().max(100).default('VER EQUIPAMENTOS & PREÇOS'),
  badgeText: z.string().trim().max(80).default(''),
  sortOrder: z.coerce.number().int().default(0),
});
export const noticeSchema = z.object({
  enabled: z.boolean().default(true),
  message: z.string().trim().min(2, 'Mensagem obrigatória').max(300),
  badgeText: z.string().trim().max(50).default('AVISO'),
  linkUrl: z.string().trim().max(300).optional().nullable(),
  linkText: z.string().trim().max(100).optional().nullable(),
  variant: z.enum(['warning', 'info', 'promo', 'success']).default('warning'),
  animated: z.boolean().default(true),
});
export function overlaps(aStart:Date,aEnd:Date,bStart:Date,bEnd:Date) {return aStart<bEnd && bStart<aEnd;}
