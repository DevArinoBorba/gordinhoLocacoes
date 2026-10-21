import {NextRequest,NextResponse} from 'next/server';
import {SESSION_COOKIE} from '@/lib/auth';
export async function POST(request:NextRequest) {
 const origin=request.headers.get('origin');const host=request.headers.get('x-forwarded-host')||request.headers.get('host');
 if(!origin||new URL(origin).host!==host)return new Response(null,{status:403});
 const response=NextResponse.redirect(new URL('/login',request.url),303);response.cookies.set(SESSION_COOKIE,'',{path:'/',maxAge:0});return response;
}
