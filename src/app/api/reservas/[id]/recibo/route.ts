import {headers,cookies} from 'next/headers';
import {z} from 'zod';
import {authorized,SESSION_COOKIE} from '@/lib/auth';
import {getBookingById} from '@/lib/queries';
import {receiptPdf} from '@/lib/receipt-pdf';
import {reservationReference} from '@/lib/whatsapp-links';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 if(!authorized((await headers()).get('authorization'),(await cookies()).get(SESSION_COOKIE)?.value))return new Response(null,{status:401});
 const {id}=await params;if(!z.uuid().safeParse(id).success)return new Response(null,{status:404});
 const booking=await getBookingById(id);if(!booking)return new Response(null,{status:404});
 return new Response(new Uint8Array(await receiptPdf(booking)),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="recibo-${reservationReference(id)}.pdf"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
