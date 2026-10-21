import Link from 'next/link';
import {bookings,units,catalogue} from '@/lib/queries';
import {overlaps} from '@/lib/validation';
import {brand} from '@/config/brand';
import {CalendarFilter} from '../components/calendar-filter';
export const dynamic='force-dynamic';
export default async function Calendar({searchParams}:{searchParams:Promise<{mes?:string;equipamento?:string}>}) {
 const params=await searchParams;
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:brand.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(params.mes||'')&&Number(params.mes!.slice(0,4))>=2000&&Number(params.mes!.slice(0,4))<=2100?params.mes!:today.slice(0,7);
 const [year,m]=month.split('-').map(Number);
 const [equipment,inventory]=await Promise.all([catalogue(),units()]);
 const selected=equipment.find(e=>e.id===params.equipamento)||equipment[0];
 if(!selected) return <><h1>Disponibilidade</h1><div className="empty">Cadastre um equipamento e suas unidades para consultar o calendário.</div></>;
 const nextMonth=(delta:number)=>{const date=new Date(Date.UTC(year,m-1+delta,1));return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`;};
 const first=`${month}-01T00:00:00-03:00`;
 const last=`${nextMonth(1)}-01T00:00:00-03:00`;
 const reservations=await bookings(first,last);
 const operational=inventory.filter(u=>u.equipment_id===selected.id&&u.state==='available');
 const daysInMonth=new Date(Date.UTC(year,m,0)).getUTCDate();
 const leading=new Date(Date.UTC(year,m-1,1)).getUTCDay();
 const label=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,m-1,1)));
 const cells=Array.from({length:Math.ceil((leading+daysInMonth)/7)*7},(_,index)=>index-leading+1);
 const href=(value:string)=>`/calendario?equipamento=${selected.id}&mes=${value}`;
 return <><p className="eyebrow">AGENDA DE EQUIPAMENTOS</p><h1>Escolha o equipamento. Veja o mês.</h1><p className="muted">Consulte a disponibilidade por produto, no horário de Brasília.</p><CalendarFilter equipment={equipment} selected={selected.id} month={month}/><section className="panel month-panel"><div className="month-heading"><div><p className="eyebrow">{selected.category}</p><h2>{selected.name}</h2><p className="muted">{operational.length} {operational.length===1?'unidade operacional':'unidades operacionais'}</p></div><div className="month-navigation"><Link href={href(nextMonth(-1))} aria-label="Mês anterior">←</Link><strong>{label}</strong><Link href={href(nextMonth(1))} aria-label="Próximo mês">→</Link></div></div><div className="month-legend"><span><i className="legend-free"/>Livre o dia inteiro</span><span><i className="legend-partial"/>Com reservas no dia</span><span><i className="legend-busy"/>Consultar horários</span></div><div className="month-grid" role="table" aria-label={`Disponibilidade de ${selected.name} em ${label}`}><div className="month-weekdays" role="row">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=><span role="columnheader" key={d}>{d}</span>)}</div>{Array.from({length:cells.length/7},(_,week)=><div className="month-week" role="row" key={week}>{cells.slice(week*7,week*7+7).map((day,index)=>{
 if(day<1||day>daysInMonth)return <div className="month-day month-outside" role="cell" key={index}/>;
 const date=`${month}-${String(day).padStart(2,'0')}`;const start=new Date(`${date}T00:00:00-03:00`);const end=new Date(start.getTime()+86400000);
 const busy=new Set(reservations.filter(r=>operational.some(u=>u.id===r.unit_id)&&r.status!=='cancelled'&&overlaps(start,end,r.starts_at,r.ends_at)).map(r=>r.unit_id));
 const free=operational.length-busy.size;const state=!operational.length?'blocked':free===operational.length?'free':free?'partial':'busy';
 return <div className={`month-day month-${state} ${date===today?'month-today':''}`} role="cell" key={day}><div><strong>{day}</strong>{date===today&&<small>Hoje</small>}</div><span>{!operational.length?'Fora de operação':free?`${free} ${free===1?'unidade livre':'unidades livres'}`:'Com reservas'}</span><small>{free?'dia inteiro':'Consulte o período exato'}</small>{operational.length>0&&<Link aria-label={`Consultar horários de ${selected.name} em ${day} de ${label}`} href={`/reservas/nova?equipamento=${selected.id}&start=${date}T09:00&end=${date}T18:00`}>Ver horários ↗</Link>}</div>;
 })}</div>)}</div><p className="muted calendar-note">Um dia com reservas pode ter horários livres. Clique em “Ver horários” para consultar o período exato. Pendentes também ocupam a unidade; cancelar libera o período.</p></section></>;
}
