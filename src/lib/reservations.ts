import type { Pool } from 'pg';
import { reservationSchema,statuses } from './validation';
import { calculateDays,calculatePricing,paymentMethods,paymentStatuses } from './pricing';
import { z } from 'zod';
const transitions:Record<string,string[]> = {pending:['confirmed','cancelled'],confirmed:['active','cancelled'],active:['completed'],completed:[],cancelled:[]};
export class ConflictError extends Error {}
export async function createReservation(pool:Pool,raw:unknown,actor:string,source:'admin'|'public'='admin') {
  const input=reservationSchema.parse(raw);
  const c=await pool.connect();
  try {
    await c.query('BEGIN');
    // Lock identical requests before any side effects; retries do not update customer data.
    await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[input.requestId]);
    const previous=await c.query('SELECT id,source FROM reservations WHERE request_id=$1',[input.requestId]);
    if(previous.rowCount) {if(previous.rows[0].source!==source) throw new ConflictError('Solicitação inválida. Atualize a página.');await c.query('COMMIT');return previous.rows[0].id as string;}
    const unitResult=await c.query('SELECT u.state,e.daily_rate,e.deposit_amount,e.min_days FROM units u JOIN equipment e ON e.id=u.equipment_id WHERE u.id=$1 FOR UPDATE OF u',[input.unitId]);
    if(unitResult.rows[0]?.state!=='available') throw new ConflictError('Unidade indisponível ou em manutenção.');
    const defaultDailyRate=Number(unitResult.rows[0]?.daily_rate||0);
    const defaultDeposit=Number(unitResult.rows[0]?.deposit_amount||0);
    const days=Math.max(calculateDays(input.start,input.end),Number(unitResult.rows[0].min_days));
    const pricing=calculatePricing({
      dailyRate:source==='public'?defaultDailyRate:input.dailyRate>0?input.dailyRate:defaultDailyRate,
      days,
      freightAmount:source==='public'?0:input.freightAmount,
      discountAmount:source==='public'?0:input.discountAmount,
      depositAmount:source==='public'?defaultDeposit:input.depositAmount>0?input.depositAmount:defaultDeposit,
    });
    if(source==='public') {
      await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,1))',[input.document]);
      const recent=await c.query("SELECT count(*)::int AS n FROM reservations r JOIN customers c ON c.id=r.customer_id WHERE c.document=$1 AND r.source='public' AND r.status='pending' AND r.created_at>now()-interval '1 hour'",[input.document]);
      if(recent.rows[0].n>=3) throw new ConflictError('Você já tem solicitações pendentes. Aguarde o retorno da equipe.');
    }
    const customer=await c.query(source==='public'?`INSERT INTO customers(name,document,phone,address,whatsapp_consent) VALUES($1,$2,$3,$4,$5) ON CONFLICT(document) DO UPDATE SET document=customers.document RETURNING id`:`INSERT INTO customers(name,document,phone,address,whatsapp_consent) VALUES($1,$2,$3,$4,$5) ON CONFLICT(document) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,address=EXCLUDED.address,whatsapp_consent=EXCLUDED.whatsapp_consent RETURNING id`,[input.name,input.document,input.phone,input.address,input.whatsappConsent]);
    const reservation=await c.query(
      `INSERT INTO reservations(
        request_id,unit_id,customer_id,starts_at,ends_at,notes,
        daily_rate,days,subtotal_amount,freight_amount,discount_amount,deposit_amount,total_amount,
        payment_method,payment_status
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
      [
        input.requestId,input.unitId,customer.rows[0].id,input.start,input.end,input.notes,
        pricing.dailyRate,pricing.days,pricing.subtotalAmount,pricing.freightAmount,pricing.discountAmount,pricing.depositAmount,pricing.totalAmount,
        input.paymentMethod,input.paymentStatus,
      ]
    );
    const id=reservation.rows[0].id;
    if(source==='public') await c.query("UPDATE reservations SET source='public',customer_snapshot=$2::jsonb WHERE id=$1",[id,JSON.stringify({name:input.name,document:input.document,phone:input.phone,address:input.address,whatsappConsent:input.whatsappConsent})]);
    await c.query('INSERT INTO reservation_history(reservation_id,next_status,actor) VALUES($1,$2,$3)',[id,'pending',actor]);
    await c.query("INSERT INTO notification_outbox(reservation_id,event) VALUES($1,'created')",[id]);
    await c.query('COMMIT');return id as string;
  } catch(error) {
    await c.query('ROLLBACK');
    if((error as {code?:string}).code==='23P01') throw new ConflictError('Essa unidade já possui reserva nesse período. Atualize a disponibilidade.');
    throw error;
  } finally {c.release();}
}
export async function changeStatus(pool:Pool,id:string,next:string,actor:string) {
  z.uuid().parse(id); z.enum(statuses).parse(next);
  const c=await pool.connect();
  try {
    await c.query('BEGIN');
    const result=await c.query('SELECT status FROM reservations WHERE id=$1 FOR UPDATE',[id]);
    const previous=result.rows[0]?.status;
    if(!previous || !transitions[previous].includes(next)) throw new ConflictError('Transição de status não permitida.');
    await c.query('UPDATE reservations SET status=$2 WHERE id=$1',[id,next]);
    await c.query('INSERT INTO reservation_history(reservation_id,previous_status,next_status,actor) VALUES($1,$2,$3,$4)',[id,previous,next,actor]);
    await c.query('INSERT INTO notification_outbox(reservation_id,event) VALUES($1,$2)',[id,next]);
    await c.query('COMMIT');
  } catch(error) {await c.query('ROLLBACK');throw error;} finally {c.release();}
}
export async function updatePayment(pool:Pool,id:string,method:string,status:string,actor:string) {
  z.uuid().parse(id);
  z.enum(paymentMethods).parse(method);
  z.enum(paymentStatuses).parse(status);
  const c=await pool.connect();
  try {
    await c.query('BEGIN');
    const result=await c.query('SELECT payment_status,payment_method FROM reservations WHERE id=$1 FOR UPDATE',[id]);
    if(!result.rowCount) throw new ConflictError('Reserva não encontrada.');
    const prevStatus=result.rows[0].payment_status;
    const prevMethod=result.rows[0].payment_method;
    await c.query('UPDATE reservations SET payment_method=$2,payment_status=$3 WHERE id=$1',[id,method,status]);
    await c.query('INSERT INTO reservation_history(reservation_id,previous_status,next_status,actor) VALUES($1,$2,$3,$4)',[id,`pagto:${prevMethod}/${prevStatus}`,`pagto:${method}/${status}`,actor]);
    await c.query('COMMIT');
  } catch(error) {await c.query('ROLLBACK');throw error;} finally {c.release();}
}
