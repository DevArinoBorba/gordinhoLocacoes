import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import type {Booking} from './queries';
import {brand} from '@/config/brand';
import {formatBRL,paymentStatusLabels,paymentMethodLabels,type PaymentStatus,type PaymentMethod} from './pricing';
import {reservationReference,rentalPeriod} from './whatsapp-links';
export async function receiptPdf(booking:Booking) {
 const pdf=await PDFDocument.create();pdf.setTitle(`Locação ${reservationReference(booking.id)}`);
 const regular=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 let page=pdf.addPage([595.28,841.89]),y=790;
 const safe=(text:string)=>text.replace(/[^\u0020-\u00ff]/g,' ');
 const line=(text:string,size=11,strong=false)=>{
  const font=strong?bold:regular;const words=safe(text).split(/\s+/);let current='';
  const draw=()=>{if(y<65){page=pdf.addPage([595.28,841.89]);y=790;}page.drawText(current,{x:48,y,size,font,color:rgb(.07,.16,.1)});y-=size+9;};
  for(const word of words){const candidate=current?`${current} ${word}`:word;if(font.widthOfTextAtSize(candidate,size)>495&&current){draw();current=word;}else current=candidate;}if(current)draw();
 };
 line(brand.name,24,true);line('COMPROVANTE DE LOCAÇÃO',14,true);line(`Pedido: ${reservationReference(booking.id)}`);line(`Emissão: ${new Date().toLocaleDateString('pt-BR',{timeZone:brand.timezone})}`);y-=15;
 line('CLIENTE',12,true);line(booking.customer_name);line(`CPF/CNPJ: ${booking.document}`);line(`Telefone: ${booking.phone}`);line(`Endereço: ${booking.address}`);y-=15;
 line('EQUIPAMENTO E PERÍODO',12,true);line(`${booking.name} - unidade ${booking.code}`);line(rentalPeriod(booking.starts_at,booking.ends_at));line(`Diárias: ${booking.days} | Diária: ${formatBRL(booking.daily_rate)}`);y-=15;
 line('VALORES',12,true);line(`Locação: ${formatBRL(booking.subtotal_amount)}`);line(`Frete: ${formatBRL(booking.freight_amount)}`);line(`Desconto: ${formatBRL(booking.discount_amount)}`);line(`TOTAL DA LOCAÇÃO: ${formatBRL(booking.total_amount)}`,14,true);line(`Caução separada: ${formatBRL(booking.deposit_amount)}`);y-=15;
 line(`Pagamento: ${paymentStatusLabels[booking.payment_status as PaymentStatus]||booking.payment_status}`);line(`Forma: ${paymentMethodLabels[booking.payment_method as PaymentMethod]||booking.payment_method}`);
 if(booking.payment_status!=='paid')line('Este documento apresenta os dados da locação e não comprova quitação.',10,true);
 line('Caução não incluída no total da locação. Condições combinadas com a equipe.',10);y-=25;
 line('Assinatura do cliente: ________________________________________',10);line('Responsável pela locadora: ____________________________________',10);
 return pdf.save();
}
