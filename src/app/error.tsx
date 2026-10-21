'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}) {return <section className="panel"><h1>Não foi possível carregar os dados.</h1><p>Confira DATABASE_URL, conectividade e migrações do PostgreSQL.</p><button onClick={()=>reset()}>Tentar novamente</button></section>;}
