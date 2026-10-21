'use client';
import {useActionState} from 'react';
import {requestRental,type PublicState} from './actions';
export function RequestSuccess({state}:{state:PublicState}) {
 return <div className="store-success" role="status"><span>✓</span><h2>Pedido recebido!</h2><p><strong>Referência: {state.reference}</strong></p><p>{state.message}</p>{state.whatsappUrl&&<><a className="store-button" href={state.whatsappUrl} target="_blank" rel="noopener noreferrer">Avisar a loja pelo WhatsApp ↗</a><p className="store-privacy">O WhatsApp abrirá com uma mensagem pronta. Confira e toque em enviar. Seu pedido já está salvo, mesmo se você não enviar.</p></>}<a className="store-return" href="/">Voltar ao catálogo</a></div>;
}
export function CustomerRequestForm({equipmentId,start,end,requestId,token}:{equipmentId:string;start:string;end:string;requestId:string;token:string}) {
  const [state,action,pending]=useActionState<PublicState,FormData>(requestRental,{ok:false,message:''});
  if(state.ok) return <RequestSuccess state={state}/>;
  return <form action={action} className="customer-form">
    <input type="hidden" name="equipmentId" value={equipmentId}/><input type="hidden" name="start" value={start}/><input type="hidden" name="end" value={end}/><input type="hidden" name="requestId" value={requestId}/><input type="hidden" name="token" value={token}/>
    <div className="trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <h2>Como podemos falar com você?</h2><p>Preencha seus dados para solicitar a locação. A equipe confirma os detalhes por telefone.</p>
    <label>Nome completo ou empresa<input name="name" autoComplete="name" required minLength={2} maxLength={120}/></label>
    <div className="grid"><label>CPF ou CNPJ<input name="document" inputMode="numeric" required maxLength={18}/></label><label>Telefone / WhatsApp com DDD<input name="phone" type="tel" autoComplete="tel" required maxLength={22} placeholder="(00) 00000-0000"/></label></div>
    <label>Endereço completo<input name="address" autoComplete="street-address" required minLength={8} maxLength={500}/></label>
    <label>Observações <small>(opcional)</small><textarea name="notes" maxLength={1000} placeholder="Conte sobre a retirada, entrega ou sua necessidade."/></label>
    <label className="checkbox"><input type="checkbox" name="whatsappConsent"/>Autorizo o contato pelo WhatsApp para tratar desta locação.</label>
    <p className="store-privacy">Usaremos seus dados para atender esta solicitação. Não há cobrança online nesta etapa.</p>
    <button className="store-button" disabled={pending}>{pending?'Enviando seu pedido…':'Solicitar reserva →'}</button>
    {state.message&&<p className="error" role="alert">{state.message}</p>}
  </form>;
}
