import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile,readdir } from 'node:fs/promises';
import { Pool } from 'pg';
import { createReservation,changeStatus,ConflictError } from '../../src/lib/reservations';
// A unique schema prevents deleting existing tables. Only use a disposable database.
test('PostgreSQL: concorrência, rollback, idempotência, cancelamento, manutenção e status',{skip:!process.env.TEST_DATABASE_URL},async()=>{
  const connectionString=process.env.TEST_DATABASE_URL!;
  const admin=new Pool({connectionString});const schema=`test_${randomUUID().replaceAll('-','')}`;
  await admin.query('CREATE EXTENSION IF NOT EXISTS btree_gist');
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool=new Pool({connectionString,options:`-c search_path=${schema},public`,max:5});
  try {
    for(const name of (await readdir('db/migrations')).filter(n=>n.endsWith('.sql')).sort()) await pool.query(await readFile(`db/migrations/${name}`,'utf8'));
    const equipment=(await pool.query("INSERT INTO equipment(name,category,daily_rate) VALUES('Teste','Teste',120.00) RETURNING id")).rows[0].id;
    const unit=(await pool.query("INSERT INTO units(equipment_id,code) VALUES($1,'TEST-1') RETURNING id",[equipment])).rows[0].id;
    const base={unitId:unit,requestId:randomUUID(),name:'Cliente teste',document:'52998224725',phone:'65999999999',address:'Rua de teste, 100',whatsappConsent:false,notes:'',start:'2026-10-01T08:00:00-04:00',end:'2026-10-01T10:00:00-04:00'};
    const results=await Promise.allSettled([createReservation(pool,base,'test'),createReservation(pool,{...base,requestId:randomUUID()},'test')]);
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    const loser=results.find(r=>r.status==='rejected');assert.ok(loser?.status==='rejected'&&loser.reason instanceof ConflictError);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM notification_outbox')).rows[0].n,1);
    const winner=results.find(r=>r.status==='fulfilled');assert.ok(winner?.status==='fulfilled');const id=winner.value;
    await assert.rejects(()=>pool.query(`INSERT INTO reservations(request_id,unit_id,customer_id,starts_at,ends_at) SELECT $1,unit_id,customer_id,starts_at,ends_at FROM reservations WHERE id=$2`,[randomUUID(),id]),(error:unknown)=>(error as {code:string}).code==='23P01');
    const otherUnit=(await pool.query("INSERT INTO units(equipment_id,code) VALUES($1,'TEST-2') RETURNING id",[equipment])).rows[0].id;
    await createReservation(pool,{...base,unitId:otherUnit,requestId:randomUUID()},'test');
    const saved=(await pool.query('SELECT request_id FROM reservations WHERE id=$1',[id])).rows[0].request_id;
    assert.equal(await createReservation(pool,{...base,requestId:saved},'test'),id);
    await assert.rejects(()=>changeStatus(pool,id,'completed','test'),ConflictError);
    await createReservation(pool,{...base,requestId:randomUUID(),start:base.end,end:'2026-10-01T12:00:00-04:00'},'test');
    await changeStatus(pool,id,'cancelled','test');
    const replacement=await createReservation(pool,{...base,requestId:randomUUID()},'test');
    await changeStatus(pool,replacement,'confirmed','test');await changeStatus(pool,replacement,'active','test');await changeStatus(pool,replacement,'completed','test');
    await assert.rejects(()=>createReservation(pool,{...base,requestId:randomUUID()},'test'),ConflictError);
    await pool.query("UPDATE units SET state='maintenance' WHERE id=$1",[unit]);
    await assert.rejects(()=>createReservation(pool,{...base,requestId:randomUUID(),start:'2026-10-02T08:00:00-04:00',end:'2026-10-02T10:00:00-04:00'},'test'),ConflictError);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM customers')).rows[0].n,1);
  } finally {await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
