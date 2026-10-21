import type {Pool} from 'pg';
import {z} from 'zod';
import {reservationSchema} from './validation';
import {createReservation,ConflictError} from './reservations';
export const publicReservationSchema=z.object({
  equipmentId:z.uuid(),requestId:z.uuid(),
  name:reservationSchema.shape.name,document:reservationSchema.shape.document,
  phone:reservationSchema.shape.phone,address:reservationSchema.shape.address,
  notes:reservationSchema.shape.notes,whatsappConsent:z.boolean(),
  start:reservationSchema.shape.start,end:reservationSchema.shape.end,
}).refine(v=>Date.parse(v.end)>Date.parse(v.start),'O fim deve ser posterior ao início.');
export async function createPublicReservation(pool:Pool,raw:unknown) {
  const input=publicReservationSchema.parse(raw);
  if(Date.parse(input.start)<Date.now()) throw new ConflictError('Escolha uma data de início futura.');
  const previous=await pool.query("SELECT id FROM reservations WHERE request_id=$1 AND source='public'",[input.requestId]);
  if(previous.rowCount) return previous.rows[0].id as string;
  const units=await pool.query("SELECT id FROM units WHERE equipment_id=$1 AND state='available' ORDER BY code",[input.equipmentId]);
  for(const unit of units.rows) {
    try {return await createReservation(pool,{...input,unitId:unit.id,dailyRate:0,depositAmount:0,freightAmount:0,discountAmount:0,paymentMethod:'pix',paymentStatus:'pending'},'Cliente pelo site','public');}
    catch(error) {if(!(error instanceof ConflictError)) throw error;if(!error.message.toLowerCase().includes('unidade')) throw error;}
  }
  throw new ConflictError('Esse equipamento não tem unidades disponíveis no período. Escolha outro horário.');
}
