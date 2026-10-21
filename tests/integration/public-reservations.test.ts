import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {Pool} from 'pg';
import {createPublicReservation} from '../../src/lib/public-reservations';
import {ConflictError} from '../../src/lib/reservations';
test('Site: escolha automática, concorrência, preços confiáveis e cadastro preservado',{skip:!process.env.TEST_DATABASE_URL},async()=>{
  const admin=new Pool({connectionString:process.env.TEST_DATABASE_URL});const schema=`test_${randomUUID().replaceAll('-','')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool=new Pool({connectionString:process.env.TEST_DATABASE_URL,options:`-c search_path=${schema},public`,max:6});
  try {
    for(const name of (await readdir('db/migrations')).filter(n=>n.endsWith('.sql')).sort()) await pool.query(await readFile(`db/migrations/${name}`,'utf8'));
    const equipmentId=(await pool.query("INSERT INTO equipment(name,category,daily_rate,min_days,deposit_amount) VALUES('Teste público','Teste',90,2,150) RETURNING id")).rows[0].id;
    await pool.query("INSERT INTO units(equipment_id,code) VALUES($1,'A'),($1,'B')",[equipmentId]);
    await pool.query("INSERT INTO customers(name,document,phone,address,whatsapp_consent) VALUES('Nome original','52998224725','65999999999','Endereço original',false)");
    const base={equipmentId,requestId:randomUUID(),name:'Nome do formulário',document:'52998224725',phone:'47999999999',address:'Endereço do formulário',whatsappConsent:true,notes:'',start:'2035-10-01T08:00:00-03:00',end:'2035-10-01T10:00:00-03:00',dailyRate:0.01,discountAmount:9999,paymentStatus:'paid',unitId:randomUUID()};
    const results=await Promise.allSettled(Array.from({length:3},()=>createPublicReservation(pool,{...base,requestId:randomUUID()})));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,2);
    assert.ok(results.some(r=>r.status==='rejected'&&r.reason instanceof ConflictError));
    const rows=(await pool.query('SELECT * FROM reservations')).rows;
    assert.equal(new Set(rows.map(r=>r.unit_id)).size,2);
    for(const row of rows) {assert.equal(Number(row.total_amount),180);assert.equal(Number(row.deposit_amount),150);assert.equal(row.payment_status,'pending');assert.equal(row.source,'public');assert.equal(row.customer_snapshot.name,base.name);assert.equal(await createPublicReservation(pool,{...base,requestId:row.request_id}),row.id);}
    assert.equal((await pool.query('SELECT name FROM customers')).rows[0].name,'Nome original');
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM notification_outbox')).rows[0].n,2);
  } finally {await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
