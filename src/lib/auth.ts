import { createHmac, timingSafeEqual } from 'node:crypto';
export const SESSION_COOKIE='rental_session';
function signature(value:string) {return createHmac('sha256',`${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`).update(`session:${value}`).digest('hex');}
export function createSession() {const expires=String(Date.now()+8*60*60*1000);return `${expires}.${signature(expires)}`;}
export function validSession(value:string|undefined) {
  if(!process.env.ADMIN_USER||!process.env.ADMIN_PASSWORD||!value)return false;
  const [expires,sig,...extra]=value.split('.');
  if(extra.length||!/^\d+$/.test(expires)||Number(expires)<=Date.now()||!sig)return false;
  const actual=Buffer.from(sig);const expected=Buffer.from(signature(expires));
  return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
export function authorized(value: string | null, session?:string) {
  if(validSession(session))return true;
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!user || !password || !value?.startsWith('Basic ')) return false;
  const actual = Buffer.from(value.slice(6), 'base64');
  const expected = Buffer.from(`${user}:${password}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
