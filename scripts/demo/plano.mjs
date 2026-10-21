import { createHash } from 'node:crypto';
export function normalize(value) {return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');}
export function stableId(key) {
  const bytes=createHash('sha256').update(`gordinho-instagram-demo-v1:${key}`).digest().subarray(0,16);
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=bytes.toString('hex');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function planItem(item,equipment,units) {
  const id=stableId(item.key);
  const existing=equipment.find(e=>e.id===id);
  const matches=existing?[existing]:equipment.filter(e=>normalize(e.name)===normalize(item.name));
  if(matches.length>1) return {skip:true,reason:'Mais de um cadastro com o mesmo nome. Revisar manualmente.'};
  const selected=matches[0];
  const equipmentId=selected?.id||id;
  // Preserve any existing inventory; do not invent additional physical stock.
  const hasInventory=units.some(u=>u.equipment_id===equipmentId);
  return {skip:false,equipmentId,createEquipment:!selected,createUnits:hasInventory?[]:Array.from({length:item.quantity},(_,i)=>({id:stableId(`${item.key}:unit:${i+1}`),equipmentId,code:`DEMO-${item.codePrefix}-${String(i+1).padStart(3,'0')}`,serial:`FICTICIO-${item.codePrefix}-${String(i+1).padStart(3,'0')}`}))};
}
