import { readFile,writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { planItem } from './plano.mjs';
const apply=process.argv.includes('--apply');
const project=resolve(process.argv.slice(2).find(a=>!a.startsWith('--'))||'C:/Users/arino/OneDrive/Documentos/Projetos/Gordinho Locacoes');
process.loadEnvFile(resolve(project,'.env'));
if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada no .env do projeto.');
const require=createRequire(resolve(project,'package.json'));
let pg;
try {pg=require('pg');} catch(error) {
  if(error.code!=='MODULE_NOT_FOUND') throw error;
  // Use the validated deliverable's dependencies when the project's install is incomplete.
  pg=createRequire(new URL('../gordinho-locacoes/package.json',import.meta.url))('pg');
}
const {Pool}=pg;
const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000,max:1});
const manifest=JSON.parse(await readFile(new URL('./equipamentos.json',import.meta.url),'utf8'));
const c=await pool.connect().catch(error=>{console.error(`Banco indisponível (${error.code||'conexão'}). Inicie o PostgreSQL configurado no projeto e tente novamente.`);process.exitCode=1;return null;});
if(c) {
  try {
    await c.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await c.query('SELECT pg_advisory_xact_lock(794232)');
    // Schema check fails before any writes when Gemini's pricing migration is absent.
    await c.query('SELECT daily_rate,min_days,deposit_amount FROM equipment LIMIT 0');
    const equipment=(await c.query('SELECT id,name,description,category,daily_rate,min_days,deposit_amount FROM equipment')).rows;
    const units=(await c.query('SELECT id,equipment_id,code,serial,state FROM units')).rows;
    const summary=[];
    for(const item of manifest) {
      const plan=planItem(item,equipment,units);
      if(plan.skip) {summary.push({equipment:item.name,result:plan.reason});continue;}
      for(const unit of plan.createUnits) {
        const collision=units.find(u=>u.code===unit.code||u.id===unit.id);
        if(collision) throw new Error(`Código ${unit.code} já pertence a um cadastro existente. Nenhuma alteração será aplicada.`);
      }
      if(apply&&plan.createEquipment) {
        await c.query('INSERT INTO equipment(id,name,description,category,daily_rate,min_days,deposit_amount) VALUES($1,$2,$3,$4,$5,$6,$7)',[plan.equipmentId,item.name,`[DEMONSTRAÇÃO — DADOS PROVISÓRIOS] Diária, caução, quantidade e séries são fictícias. ${item.description}`,item.category,item.dailyRate,item.minDays,item.depositAmount]);
      }
      for(const unit of plan.createUnits) {
        if(apply) await c.query("INSERT INTO units(id,equipment_id,code,serial,state) VALUES($1,$2,$3,$4,'available')",[unit.id,unit.equipmentId,unit.code,unit.serial]);
      }
      summary.push({equipment:item.name,result:plan.createEquipment?'Novo cadastro provisório':'Cadastro existente preservado',newUnits:plan.createUnits.length,dailyRate:plan.createEquipment?item.dailyRate:'preservada',depositAmount:plan.createEquipment?item.depositAmount:'preservada'});
    }
    if(apply) {
      // Save an inventory-only snapshot before commit. No customers/reservations exported.
      const snapshot={createdAt:new Date().toISOString(),equipment,units};
      await writeFile(new URL(`./inventario-antes-${Date.now()}.json`,import.meta.url),JSON.stringify(snapshot,null,2),'utf8');
      await c.query('COMMIT');
    } else {await c.query('ROLLBACK');}
    console.table(summary);
    const report={applied:apply,createdAt:new Date().toISOString(),summary};
    await writeFile(new URL('./resultado.json',import.meta.url),JSON.stringify(report,null,2),'utf8');
    console.log(apply?'Cadastro concluído. Nenhuma reserva ou cliente foi alterado.':'SIMULAÇÃO: nenhum dado foi gravado. Execute com --apply para cadastrar.');
  } catch(error) {
    await c.query('ROLLBACK');
    console.error(error.code==='40001'?'O inventário mudou durante o cadastro. Execute novamente.':error.code?`Falha no cadastro (${error.code}). Transação desfeita.`:error.message);
    process.exitCode=1;
  } finally {c.release();await pool.end();}
} else {await pool.end();}
