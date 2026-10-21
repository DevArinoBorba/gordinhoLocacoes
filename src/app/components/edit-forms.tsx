'use client';
import {useActionState} from 'react';
import {editEquipment,editUnitDetails,uploadEquipmentPhoto,type ActionState} from '../actions';
import type {Equipment,Unit} from '@/lib/queries';
const initial:ActionState={ok:false,message:''};
export function EquipmentPhotoForm({id}:{id:string}) {
  const [state,action,pending]=useActionState(uploadEquipmentPhoto,initial);
  return <details className="editor"><summary>Adicionar / trocar foto</summary><form action={action}><input type="hidden" name="id" value={id}/><label>Foto do equipamento<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required/></label><p className="muted">JPG, PNG ou WebP de até 5 MB. A foto aparece no site do cliente.</p><button disabled={pending}>{pending?'Enviando…':'Salvar foto'}</button><Feedback state={state}/></form></details>;
}
function Feedback({state}:{state:ActionState}) {
  return state.message?<p role="status" className={state.ok?'success':'error'}>{state.message}</p>:null;
}
export function EquipmentEditor({equipment}:{equipment:Equipment}) {
  const [state,action,pending]=useActionState(editEquipment,initial);
  return <details className="editor"><summary>Editar equipamento</summary><form action={action}>
    <input type="hidden" name="id" value={equipment.id}/>
    <label>Nome<input name="name" required minLength={2} maxLength={120} defaultValue={equipment.name}/></label>
    <label>Categoria<input name="category" required minLength={2} maxLength={80} defaultValue={equipment.category}/></label>
    <label>Descrição<textarea name="description" maxLength={1000} defaultValue={equipment.description}/></label>
    <label>Ideal para<textarea name="idealFor" maxLength={1000} defaultValue={equipment.ideal_for} placeholder="Ex.: palestras, entrevistas e gravações"/></label>
    <label>O que acompanha<textarea name="includedItems" maxLength={1000} defaultValue={equipment.included_items} placeholder="Um acessório por linha"/></label>
    <label>Diária (R$)<input name="dailyRate" required type="number" step="0.01" min="0" max="99999999.99" defaultValue={Number(equipment.daily_rate)}/></label>
    <label>Mínimo de diárias<input name="minDays" required type="number" step="1" min="1" max="2147483647" defaultValue={equipment.min_days}/></label>
    <label>Caução (R$)<input name="depositAmount" required type="number" step="0.01" min="0" max="99999999.99" defaultValue={Number(equipment.deposit_amount)}/></label>
    <p className="muted">Preços atualizados serão usados como padrão nas novas reservas. Reservas existentes mantêm seus valores.</p>
    <button disabled={pending}>{pending?'Salvando…':'Salvar equipamento'}</button><Feedback state={state}/>
  </form></details>;
}
export function UnitEditor({unit}:{unit:Unit}) {
  const [state,action,pending]=useActionState(editUnitDetails,initial);
  return <details className="editor"><summary>Editar unidade</summary><form action={action}>
    <input type="hidden" name="id" value={unit.id}/>
    <label>Código patrimonial<input name="code" required maxLength={60} defaultValue={unit.code}/></label>
    <label>Número de série<input name="serial" maxLength={120} defaultValue={unit.serial}/></label>
    <button disabled={pending}>{pending?'Salvando…':'Salvar unidade'}</button><Feedback state={state}/>
  </form></details>;
}
