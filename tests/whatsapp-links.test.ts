import {test} from 'node:test';
import assert from 'node:assert/strict';
import {whatsappPhone,whatsappLink,storeWhatsAppLink,customerWhatsAppLink} from '../src/lib/whatsapp-links';
test('WhatsApp usa número internacional e mensagem codificada',()=>{
 assert.equal(whatsappPhone('(47) 99259-9063'),'5547992599063');
 assert.equal(whatsappPhone('5547992599063'),'5547992599063');
 assert.equal(whatsappPhone('invalido'),null);
 assert.equal(whatsappLink('123','teste'),null);
 const url=new URL(whatsappLink('(47) 99259-9063','Olá & pedido + ação')!);
 assert.equal(url.hostname,'wa.me');assert.equal(url.searchParams.get('text'),'Olá & pedido + ação');
});
test('Mensagens usam referência e período de Brasília sem expor documento ou endereço',()=>{
 const input={id:'12345678-abcd-4abc-8abc-123456789abc',name:'Balcão PDV',phone:'47992599063',start:'2035-10-01T12:00:00Z',end:'2035-10-08T22:00:00Z'};
 for(const link of [storeWhatsAppLink(input),customerWhatsAppLink(input)]) {assert.ok(link);const text=new URL(link).searchParams.get('text')!;assert.ok(text.includes('12345678'));assert.ok(text.includes('Balcão PDV'));assert.ok(text.includes('09:00'));assert.ok(text.includes('19:00'));assert.ok(!text.includes('CPF'));assert.ok(!text.includes('Endereço'));}
});
