export const BUSINESS_OFFSET='-03:00';
export const BUSINESS_ZONE='America/Sao_Paulo';
export function isFutureBusinessDate(value:string) {return Date.parse(value)>Date.now();}
export function businessIso(local:string|undefined) {
  if(!local||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return '';
  return `${local}:00${BUSINESS_OFFSET}`;
}
export function businessLocalNow(now=new Date()) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:BUSINESS_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const value=(type:string)=>parts.find(p=>p.type===type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}`;
}
// Only today's elapsed start is adjusted. Previous calendar dates remain invalid.
export function suggestedPublicStart(local:string|undefined,now=new Date()) {
  const current=businessLocalNow(now);
  if(!local||local.slice(0,10)!==current.slice(0,10)||!Number.isFinite(Date.parse(businessIso(local)))||Date.parse(businessIso(local))>now.getTime()) return local;
  const next=businessLocalNow(new Date((Math.floor(now.getTime()/900000)+1)*900000));
  return next.slice(0,10)===current.slice(0,10)?next:local;
}
export function publicDateDefaults() {
  const local=businessLocalNow();
  const date=local.slice(0,10);
  return {start:suggestedPublicStart(`${date}T08:00`)!,end:`${date}T19:00`};
}
