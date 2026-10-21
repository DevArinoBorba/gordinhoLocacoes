import {notFound} from 'next/navigation';
import {z} from 'zod';
import {db} from '@/lib/db';
import {validPublicOrderToken} from '@/lib/public-form-token';
import {storeWhatsAppLink,reservationReference,rentalPeriod} from '@/lib/whatsapp-links';
import {RequestSuccess} from '../components';
export const dynamic='force-dynamic';
export default async function OrderPage({searchParams}:{searchParams:Promise<{id?:string;token?:string}>}) {
 const params=await searchParams;
 if(!z.uuid().safeParse(params.id).success||!validPublicOrderToken(params.id!,params.token||''))notFound();
 const saved=(await db().query("SELECT r.id,r.starts_at,r.ends_at,e.name FROM reservations r JOIN units u ON u.id=r.unit_id JOIN equipment e ON e.id=u.equipment_id WHERE r.id=$1 AND r.source='public'",[params.id])).rows[0];
 if(!saved)notFound();
 return <section className="store-request"><div className="customer-form-card" style={{maxWidth:680,margin:'auto'}}><RequestSuccess state={{ok:true,message:'Seu pedido foi salvo e está pendente de confirmação da equipe. Você pode avisar a loja pelo WhatsApp ou aguardar o contato pelo telefone informado. Nenhum pagamento foi cobrado.',reference:reservationReference(saved.id),whatsappUrl:storeWhatsAppLink({id:saved.id,name:saved.name,start:saved.starts_at,end:saved.ends_at})||undefined}}/><p className="store-privacy">{saved.name} · {rentalPeriod(saved.starts_at,saved.ends_at)}</p></div></section>;
}
