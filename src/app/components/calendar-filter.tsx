'use client';
import type {Equipment} from '@/lib/queries';
export function CalendarFilter({equipment,selected,month}:{equipment:Equipment[];selected:string;month:string}) {
 return <form className="filter calendar-filter"><label>Qual equipamento você quer consultar?<select name="equipamento" defaultValue={selected} onChange={event=>event.currentTarget.form?.requestSubmit()}>{equipment.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label>Mês<input type="month" name="mes" required defaultValue={month} onChange={event=>{if(event.currentTarget.validity.valid)event.currentTarget.form?.requestSubmit();}}/></label><button>Ver calendário</button></form>;
}
