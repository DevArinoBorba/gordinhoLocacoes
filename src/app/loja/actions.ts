'use server';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {db} from '@/lib/db';
import {createPublicReservation} from '@/lib/public-reservations';
import {ConflictError} from '@/lib/reservations';
import {validPublicToken,publicRateKey} from '@/lib/public-form-token';
import {publicOrderToken} from '@/lib/public-form-token';
export type PublicState={ok:boolean;message:string;reference?:string;whatsappUrl?:string};
export async function requestRental(_state:PublicState,form:FormData):Promise<PublicState> {
  let destination:string;
  try {
    const raw=Object.fromEntries(form);
    if(form.get('website')||!validPublicToken(String(form.get('token')||''),String(form.get('requestId')||''))) return {ok:false,message:'Seu formulário expirou. Atualize a página e tente novamente.'};
    const h=await headers();
    const rateKey=publicRateKey((h.get('x-forwarded-for')||'local').split(',')[0].trim());
    const rate=await db().query(`INSERT INTO public_request_limits(key_hash,window_start,attempts) VALUES($1,now(),1) ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN public_request_limits.window_start<now()-interval '10 minutes' THEN 1 ELSE public_request_limits.attempts+1 END,window_start=CASE WHEN public_request_limits.window_start<now()-interval '10 minutes' THEN now() ELSE public_request_limits.window_start END RETURNING attempts`,[rateKey]);
    if(rate.rows[0].attempts>10) return {ok:false,message:'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'};
    const id=await createPublicReservation(db(),{...raw,whatsappConsent:form.get('whatsappConsent')==='on'});
    revalidatePath('/');revalidatePath('/admin');revalidatePath('/calendario');revalidatePath('/reservas');revalidatePath('/loja');
    destination=`/loja/pedido?id=${id}&token=${publicOrderToken(id)}`;
  } catch(error) {
    if(error instanceof z.ZodError) return {ok:false,message:error.issues.map(i=>i.message).join(' ')};
    if(error instanceof ConflictError) return {ok:false,message:error.message};
    return {ok:false,message:'Não conseguimos registrar agora. Tente novamente em instantes.'};
  }
  redirect(destination);
}
