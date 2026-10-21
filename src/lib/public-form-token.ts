import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
function secret() {const value=process.env.FORM_SECRET||process.env.PUBLIC_FORM_SECRET||process.env.ADMIN_PASSWORD;if(!value||value.length<16) throw new Error('Configure a chave do formulário público.');return value;}
export function publicFormToken() {
  const requestId=randomUUID(),expires=Date.now()+2*60*60*1000;
  const payload=`${requestId}.${expires}`;
  return {requestId,token:`${payload}.${createHmac('sha256',secret()).update(payload).digest('hex')}`};
}
export function validPublicToken(token:string,requestId:string) {
  const [id,expires,signature,...extra]=token.split('.');
  if(extra.length||id!==requestId||!/^\d+$/.test(expires||'')||Number(expires)<Date.now()||! /^[a-f0-9]{64}$/.test(signature||'')) return false;
  const expected=createHmac('sha256',secret()).update(`${id}.${expires}`).digest();
  return timingSafeEqual(expected,Buffer.from(signature,'hex'));
}
export function publicRateKey(ip:string) {return createHmac('sha256',secret()).update(`public-ip:${ip}`).digest('hex');}
export function publicOrderToken(id:string) {
 const expires=Date.now()+2*60*60*1000;
 const payload=`order:${id}:${expires}`;
 return `${expires}.${createHmac('sha256',secret()).update(payload).digest('hex')}`;
}
export function validPublicOrderToken(id:string,token:string) {
 const [expires,signature,...extra]=token.split('.');
 if(extra.length||!/^\d+$/.test(expires||'')||Number(expires)<Date.now()||! /^[a-f0-9]{64}$/.test(signature||''))return false;
 const expected=createHmac('sha256',secret()).update(`order:${id}:${expires}`).digest();
 return timingSafeEqual(expected,Buffer.from(signature,'hex'));
}
