import { availableUnits,catalogue } from '@/lib/queries';
import { randomUUID } from 'node:crypto';
import { periodSchema } from '@/lib/validation';
import {businessIso} from '@/lib/business-time';
import { ReservationForm } from '../../components/forms';
export const dynamic='force-dynamic';
export default async function NewReservation({searchParams}:{searchParams:Promise<{start?:string;end?:string;equipamento?:string}>}) {
  const params=await searchParams;
  const parsed=periodSchema.safeParse({start:businessIso(params.start),end:businessIso(params.end)});
  const equipment=await catalogue();
  const choices=(parsed.success?await availableUnits(parsed.data.start,parsed.data.end):[]).filter(u=>!params.equipamento||u.equipment_id===params.equipamento);
  return <><p className="eyebrow">NOVA LOCAÇÃO</p><h1>Encontre uma unidade disponível.</h1><p className="muted">Informe o período completo antes de cadastrar o cliente. Todos os horários seguem o horário de Brasília.</p><form className="panel filter"><label>Equipamento<select name="equipamento" defaultValue={params.equipamento||''}><option value="">Todos os equipamentos</option>{equipment.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label>Início<input name="start" type="datetime-local" required defaultValue={params.start}/></label><label>Fim<input name="end" type="datetime-local" required defaultValue={params.end}/></label><button>Consultar disponibilidade</button></form>{params.start&&!parsed.success&&<p role="alert" className="error">Informe datas válidas, com fim posterior ao início.</p>}{parsed.success&&(choices.length?<section className="panel"><ReservationForm key={`${parsed.data.start}/${parsed.data.end}`} requestId={randomUUID()} units={choices} start={parsed.data.start} end={parsed.data.end}/></section>:<div className="empty">Nenhuma unidade disponível nesse período. Consulte outro horário ou cadastre unidades operacionais.</div>)}</>;
}
