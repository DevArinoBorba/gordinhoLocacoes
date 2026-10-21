import {brand} from '@/config/brand';
export function whatsappPhone(raw:string) {
 const phone=raw.replace(/\D/g,'');
 if(/^\d{10,11}$/.test(phone)&&!raw.trim().startsWith('+')) return `55${phone}`;
 return /^[1-9]\d{11,14}$/.test(phone)?phone:null;
}
export function whatsappLink(raw:string,message:string) {
 const phone=whatsappPhone(raw);
 return phone?`https://wa.me/${phone}?text=${encodeURIComponent(message)}`:null;
}
export function reservationReference(id:string) {return id.slice(0,8).toUpperCase();}
export function rentalPeriod(start:Date|string,end:Date|string) {
 const format=(value:Date|string)=>new Date(value).toLocaleString('pt-BR',{timeZone:brand.timezone,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
 return `${format(start)} até ${format(end)} (Brasília)`;
}
export function storeWhatsAppLink(input:{id:string;name:string;start:Date|string;end:Date|string}) {
 // Number supplied in the owner's Gordinho Locações Instagram artwork.
 return whatsappLink(process.env.WHATSAPP_STORE_PHONE||'5547992599063',`Olá! Fiz uma solicitação de locação pelo site ${brand.name}.\nPedido: ${reservationReference(input.id)}\nEquipamento: ${input.name}\nPeríodo: ${rentalPeriod(input.start,input.end)}\nGostaria de combinar os detalhes e confirmar a disponibilidade.`);
}
export function customerWhatsAppLink(input:{id:string;phone:string;name:string;start:Date|string;end:Date|string}) {
 return whatsappLink(input.phone,`Olá! Somos da ${brand.name} e estamos entrando em contato sobre seu pedido ${reservationReference(input.id)}.\nEquipamento: ${input.name}\nPeríodo: ${rentalPeriod(input.start,input.end)}\nPodemos combinar os detalhes da locação?`);
}
export function receiptWhatsAppLink(input:{id:string;phone:string;name:string;start:Date|string;end:Date|string}) {
 return whatsappLink(input.phone,`Olá! Aqui é da ${brand.name}, sobre a locação ${reservationReference(input.id)}.\nEquipamento: ${input.name}\nPeríodo: ${rentalPeriod(input.start,input.end)}\nVamos compartilhar o comprovante da locação nesta conversa.`);
}
