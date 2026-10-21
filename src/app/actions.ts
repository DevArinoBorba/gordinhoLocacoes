'use server';
import { headers, cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { authorized, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';
import { createReservation,changeStatus,updatePayment,ConflictError } from '@/lib/reservations';
import { equipmentSchema,unitSchema,bannerSchema,noticeSchema } from '@/lib/validation';
import { z } from 'zod';
import {saveEquipmentPhoto,removeNewPhoto} from '@/lib/equipment-photos';
export async function uploadEquipmentPhoto(_state:ActionState,form:FormData):Promise<ActionState> {
  await actor();let filename:string|undefined;
  try {
    const id=z.uuid().parse(form.get('id'));
    if(!(await db().query('SELECT id FROM equipment WHERE id=$1',[id])).rowCount) throw new ConflictError('Equipamento não encontrado.');
    const file=form.get('photo');
    if(!(file instanceof File)) return {ok:false,message:'Selecione uma foto.'};
    try {filename=await saveEquipmentPhoto(file);} catch {return {ok:false,message:'Envie uma foto válida JPG, PNG ou WebP de até 5 MB.'};}
    const updated=await db().query('UPDATE equipment SET photo_filename=$2 WHERE id=$1 RETURNING id',[id,filename]);
    if(!updated.rowCount) throw new ConflictError('Equipamento não encontrado.');
    revalidatePath('/');revalidatePath('/admin');revalidatePath('/loja');revalidatePath('/loja/reservar');
    return {ok:true,message:'Foto salva e publicada no catálogo.'};
  } catch(error) {if(filename) await removeNewPhoto(filename);return feedback(error);}
}
export type ActionState={ok:boolean;message:string};
async function actor() {
  if(!authorized((await headers()).get('authorization'),(await cookies()).get(SESSION_COOKIE)?.value)) throw new Error('Não autorizado.');
  return process.env.ADMIN_USER!;
}
function feedback(error:unknown):ActionState {
  if(error instanceof z.ZodError) return {ok:false,message:error.issues.map(i=>i.message).join(' ')};
  if(error instanceof ConflictError) return {ok:false,message:error.message};
  if((error as {code?:string}).code==='23505') return {ok:false,message:'Código de unidade já cadastrado.'};
  console.error('Operação falhou:',error instanceof Error ? error.name : 'database');
  return {ok:false,message:'Não foi possível salvar. Confira a configuração do banco e tente novamente.'};
}
export async function reserve(_state:ActionState,form:FormData):Promise<ActionState> {
  const user=await actor();
  try {
    const id=await createReservation(db(),{...Object.fromEntries(form),whatsappConsent:form.get('whatsappConsent')==='on'},user);
    revalidatePath('/');revalidatePath('/reservas');revalidatePath('/calendario');
    return {ok:true,message:`Reserva ${id.slice(0,8)} criada com sucesso.`};
  } catch(error) {return feedback(error);}
}
export async function addEquipment(_state:ActionState,form:FormData):Promise<ActionState> {
  await actor();
  try {
    const input=equipmentSchema.parse(Object.fromEntries(form));
    await db().query(
      'INSERT INTO equipment(name,description,category,daily_rate,min_days,deposit_amount,ideal_for,included_items) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
      [input.name,input.description,input.category,input.dailyRate,input.minDays,input.depositAmount,input.idealFor,input.includedItems]
    );
    revalidatePath('/');revalidatePath('/admin');revalidatePath('/admin/cadastros');revalidatePath('/loja');
    return {ok:true,message:'Equipamento cadastrado com valores configurados.'};
  } catch(error) {return feedback(error);}
}
export async function addUnit(_state:ActionState,form:FormData):Promise<ActionState> {
  await actor();
  try {const input=unitSchema.parse(Object.fromEntries(form));await db().query('INSERT INTO units(equipment_id,code,serial) VALUES($1,$2,$3)',[input.equipmentId,input.code,input.serial]);revalidatePath('/');revalidatePath('/admin');revalidatePath('/admin/unidades');revalidatePath('/admin/cadastros');return {ok:true,message:'Unidade cadastrada.'};} catch(error) {return feedback(error);}
}
export async function editEquipment(_state:ActionState,form:FormData):Promise<ActionState> {
  await actor();
  try {
    const id=z.uuid().parse(form.get('id'));
    const input=equipmentSchema.parse(Object.fromEntries(form));
    const result=await db().query('UPDATE equipment SET name=$2,description=$3,category=$4,daily_rate=$5,min_days=$6,deposit_amount=$7,ideal_for=$8,included_items=$9 WHERE id=$1 RETURNING id',[id,input.name,input.description,input.category,input.dailyRate,input.minDays,input.depositAmount,input.idealFor,input.includedItems]);
    if(!result.rowCount) throw new ConflictError('Equipamento não encontrado.');
    revalidatePath('/');revalidatePath('/admin');revalidatePath('/calendario');revalidatePath('/reservas');revalidatePath('/reservas/nova');
    revalidatePath('/loja');revalidatePath('/loja/reservar');
    return {ok:true,message:'Equipamento atualizado. Valores das reservas já criadas foram preservados.'};
  } catch(error) {return feedback(error);}
}
export async function editUnitDetails(_state:ActionState,form:FormData):Promise<ActionState> {
  await actor();
  try {
    const input=unitSchema.omit({equipmentId:true}).extend({id:z.uuid()}).parse(Object.fromEntries(form));
    const result=await db().query('UPDATE units SET code=$2,serial=$3 WHERE id=$1 RETURNING id',[input.id,input.code,input.serial]);
    if(!result.rowCount) throw new ConflictError('Unidade não encontrada.');
    revalidatePath('/');revalidatePath('/admin');revalidatePath('/admin/unidades');revalidatePath('/calendario');revalidatePath('/reservas');revalidatePath('/reservas/nova');
    return {ok:true,message:'Dados da unidade atualizados. Reservas e situação foram preservadas.'};
  } catch(error) {return feedback(error);}
}
export async function updateStatus(_state:ActionState,form:FormData):Promise<ActionState> {
  const user=await actor();
  try {await changeStatus(db(),String(form.get('id')),String(form.get('status')),user);revalidatePath('/reservas');revalidatePath('/calendario');revalidatePath('/');revalidatePath('/admin');return {ok:true,message:'Status atualizado.'};} catch(error) {return feedback(error);}
}
export async function updateReservationPayment(_state:ActionState,form:FormData):Promise<ActionState> {
  const user=await actor();
  try {
    await updatePayment(db(),String(form.get('id')),String(form.get('paymentMethod')),String(form.get('paymentStatus')),user);
    revalidatePath('/reservas');
    return {ok:true,message:'Pagamento atualizado.'};
  } catch(error) {return feedback(error);}
}
export async function updateUnit(_state:ActionState,form:FormData):Promise<ActionState> {
  await actor();const c=await db().connect();
  try {
    const id=z.uuid().parse(form.get('id'));const state=z.enum(['available','maintenance','retired']).parse(form.get('state'));
    await c.query('BEGIN');
    const unit=await c.query('SELECT id FROM units WHERE id=$1 FOR UPDATE',[id]);
    if(!unit.rowCount) throw new ConflictError('Unidade não encontrada.');
    if(state!=='available') {
      const bookings=await c.query("SELECT 1 FROM reservations WHERE unit_id=$1 AND (status='active' OR (status IN ('pending','confirmed') AND ends_at>now())) LIMIT 1",[id]);
      if(bookings.rowCount) throw new ConflictError('Cancele as reservas futuras ou finalize a locação ativa antes de bloquear a unidade.');
    }
    await c.query('UPDATE units SET state=$2 WHERE id=$1',[id,state]);await c.query('COMMIT');revalidatePath('/');revalidatePath('/admin');revalidatePath('/admin/unidades');revalidatePath('/calendario');return {ok:true,message:'Unidade atualizada.'};
  } catch(error) {await c.query('ROLLBACK');return feedback(error);} finally {c.release();}
}

export async function addBanner(_state: ActionState, form: FormData): Promise<ActionState> {
  await actor();
  let filename: string | null = null;
  try {
    const input = bannerSchema.parse(Object.fromEntries(form));
    const file = form.get('photo');
    if (file instanceof File && file.size > 0) {
      try {
        filename = await saveEquipmentPhoto(file);
      } catch {
        return { ok: false, message: 'Envie uma foto válida JPG, PNG ou WebP de até 5 MB.' };
      }
    }
    await db().query(
      `INSERT INTO banners (eyebrow, title, subtitle, link_url, link_text, badge_text, sort_order, image_filename)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.eyebrow,
        input.title,
        input.subtitle,
        input.linkUrl,
        input.linkText,
        input.badgeText,
        input.sortOrder,
        filename,
      ]
    );
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/banners');
    revalidatePath('/loja');
    return { ok: true, message: 'Banner criado e publicado com sucesso.' };
  } catch (error) {
    if (filename) await removeNewPhoto(filename);
    return feedback(error);
  }
}

export async function toggleBanner(_state: ActionState, form: FormData): Promise<ActionState> {
  await actor();
  try {
    const id = z.uuid().parse(form.get('id'));
    const res = await db().query(
      `UPDATE banners SET active = NOT active WHERE id = $1 RETURNING active`,
      [id]
    );
    if (!res.rowCount) throw new ConflictError('Banner não encontrado.');
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/banners');
    revalidatePath('/loja');
    return {
      ok: true,
      message: res.rows[0].active ? 'Banner ativado na loja.' : 'Banner desativado da loja.',
    };
  } catch (error) {
    return feedback(error);
  }
}

export async function deleteBanner(_state: ActionState, form: FormData): Promise<ActionState> {
  await actor();
  try {
    const id = z.uuid().parse(form.get('id'));
    const current = await db().query(`DELETE FROM banners WHERE id = $1 RETURNING image_filename`, [id]);
    if (!current.rowCount) throw new ConflictError('Banner não encontrado.');
    const photo = current.rows[0].image_filename;
    if (photo) await removeNewPhoto(photo);
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/banners');
    revalidatePath('/loja');
    return { ok: true, message: 'Banner excluído com sucesso.' };
  } catch (error) {
    return feedback(error);
  }
}

export async function updateStoreNotice(_state: ActionState, form: FormData): Promise<ActionState> {
  await actor();
  try {
    const input = noticeSchema.parse({
      enabled: form.get('enabled') === 'on' || form.get('enabled') === 'true',
      message: form.get('message'),
      badgeText: form.get('badgeText'),
      linkUrl: form.get('linkUrl') || null,
      linkText: form.get('linkText') || null,
      variant: form.get('variant'),
      animated: form.get('animated') === 'on' || form.get('animated') === 'true',
    });

    await db().query(
      `UPDATE store_notice
       SET enabled = $1, message = $2, badge_text = $3, link_url = $4, link_text = $5, variant = $6, animated = $7, updated_at = now()
       WHERE id = 1`,
      [input.enabled, input.message, input.badgeText, input.linkUrl, input.linkText, input.variant, input.animated]
    );

    revalidatePath('/');
    revalidatePath('/loja');
    revalidatePath('/admin');
    revalidatePath('/admin/aviso');
    return { ok: true, message: 'Aviso do topo atualizado e publicado com sucesso!' };
  } catch (error) {
    return feedback(error);
  }
}


