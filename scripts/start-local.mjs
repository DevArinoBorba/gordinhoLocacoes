import {resolve} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {cp,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
process.loadEnvFile('.env');
const database=spawnSync(process.execPath,['scripts/start-local-db.mjs'],{stdio:'inherit',windowsHide:true});
if(database.status!==0) process.exit(database.status||1);
const migration=spawnSync(process.execPath,['--import','tsx','scripts/migrate.ts'],{stdio:'inherit',windowsHide:true});
if(migration.status!==0) process.exit(migration.status||1);
const port = process.env.PORT || '3000';
try {if((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) {console.log(`Sistema já está ativo em http://127.0.0.1:${port}`);process.exit(0);}} catch {}
await access('.next/standalone/server.js');
await cp('.next/static','.next/standalone/.next/static',{recursive:true});
await cp('public','.next/standalone/public',{recursive:true});
const server=spawn(process.execPath,['.next/standalone/server.js'],{stdio:'inherit',windowsHide:true,env:{...process.env,UPLOADS_DIR:resolve(process.env.UPLOADS_DIR||'.local/uploads'),HOSTNAME:'127.0.0.1',PORT:port}});
server.on('exit',code=>process.exit(code||0));
