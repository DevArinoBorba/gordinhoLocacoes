import {NextRequest,NextResponse} from 'next/server';
import {authorized,createSession,SESSION_COOKIE} from '@/lib/auth';
const attempts=new Map<string,{count:number;until:number}>();
export async function POST(request:NextRequest) {
 const origin=request.headers.get('origin');const host=request.headers.get('x-forwarded-host')||request.headers.get('host');
 if(!origin||new URL(origin).host!==host)return new Response(null,{status:403});
 const key=request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')||'local';
 const now=Date.now();if(attempts.size>1000)for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);
 let entry=attempts.get(key);if(!entry||entry.until<now){entry={count:0,until:now+10*60*1000};attempts.set(key,entry);}
 if(++entry.count>10)return NextResponse.redirect(new URL('/login?erro=limite',request.url),303);
 const form=await request.formData();const user=String(form.get('user')||'');const password=String(form.get('password')||'');
 if(!authorized(`Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`))return NextResponse.redirect(new URL('/login?erro=credenciais',request.url),303);
 attempts.delete(key);
 const response=NextResponse.redirect(new URL('/admin',request.url),303);
 response.cookies.set(SESSION_COOKIE,createSession(),{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:'||request.headers.get('x-forwarded-proto')==='https',path:'/',maxAge:8*60*60});
 response.headers.set('Cache-Control','no-store');return response;
}
