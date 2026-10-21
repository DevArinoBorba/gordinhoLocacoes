// Adapter contract: a future worker reads outbox, resolves recipient and checks consent.
// Never call an external provider inside the reservation transaction.
export interface WhatsAppAdapter {send(input:{to:string;message:string;idempotencyKey:string}):Promise<{providerId:string}>;}
export class DisabledWhatsAppAdapter implements WhatsAppAdapter {
  async send(): Promise<{providerId:string}> {throw new Error('Envio WhatsApp desativado. Configure um adaptador após aprovação.');}
}
export function whatsappAdapter():WhatsAppAdapter {
  if (process.env.WHATSAPP_PROVIDER && process.env.WHATSAPP_PROVIDER !== 'disabled') throw new Error('Provedor não implementado. Nenhuma mensagem foi enviada.');
  return new DisabledWhatsAppAdapter();
}
