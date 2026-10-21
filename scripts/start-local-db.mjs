import {mkdir,readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import pg from 'pg';
process.loadEnvFile('.env');
const url=new URL(process.env.DATABASE_URL);
if(!['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('A inicialização local exige host localhost.');
const adminUrl=new URL(url);adminUrl.pathname='/postgres';
const data=resolve('.local/postgres-data');
const binaries='C:/Users/arino/Documents/Codex/2026-10-01/referenced-chatgpt-conversation-this-is-an/work/pg-bin/bin';
let client=new pg.Client({connectionString:adminUrl.toString(),connectionTimeoutMillis:3000});
try {await client.connect();} catch(error) {
  await client.end();
  if(error.code!=='ECONNREFUSED') throw new Error(`Conexão com banco existente falhou (${error.code}); nenhum banco novo foi criado.`);
  let initialized=false;try {await readFile(resolve(data,'PG_VERSION'));initialized=true;} catch {}
  if(!initialized) {
    await mkdir('.local',{recursive:true});
    const passwordFile=resolve('.local/init-password.tmp');
    const password=decodeURIComponent(url.password);
    if(!password) throw new Error('Configure uma senha em DATABASE_URL.');
    await writeFile(passwordFile,password+'\n');
    try {
      const result=spawnSync(resolve(binaries,'initdb.exe'),['-D',data,'-U',decodeURIComponent(url.username),'-A','scram-sha-256',`--pwfile=${passwordFile}`,'--encoding=UTF8','--locale=C'],{stdio:'inherit',windowsHide:true});
      if(result.status!==0) throw new Error('Falha ao inicializar PostgreSQL local.');
    } finally {await unlink(passwordFile);}
  }
  const result=spawnSync(resolve(binaries,'pg_ctl.exe'),['-D',data,'-l',resolve('.local/postgres.log'),'-o',`-h 127.0.0.1 -p ${url.port||5432}`,'-w','start'],{stdio:'inherit',windowsHide:true});
  if(result.status!==0) throw new Error('Falha ao iniciar PostgreSQL local.');
  client=new pg.Client({connectionString:adminUrl.toString(),connectionTimeoutMillis:5000});
  await client.connect();
}
try {
  const name=decodeURIComponent(url.pathname.slice(1));
  if(!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1',[name])).rowCount) {await client.query(`CREATE DATABASE ${pg.escapeIdentifier(name)}`);console.log('Banco local criado.');}
  else console.log('Banco existente preservado.');
} finally {await client.end();}
