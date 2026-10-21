import { test } from 'node:test';
import assert from 'node:assert/strict';
import { overlaps,periodSchema,reservationSchema,validDocument,equipmentSchema } from '../src/lib/validation';
import { authorized } from '../src/lib/auth';
import { DisabledWhatsAppAdapter } from '../src/lib/notifications';
import { calculateDays, calculatePricing, formatBRL } from '../src/lib/pricing';

test('intervalos consecutivos são permitidos; sobreposição e contenção bloqueiam',()=>{
  const d=(hour:number)=>new Date(Date.UTC(2026,0,1,hour));
  assert.equal(overlaps(d(8),d(10),d(10),d(12)),false);
  assert.equal(overlaps(d(8),d(10),d(9),d(12)),true);
  assert.equal(overlaps(d(8),d(14),d(9),d(12)),true);
});

test('CPF/CNPJ usam dígitos verificadores',()=>{
  assert.equal(validDocument('529.982.247-25'),true);
  assert.equal(validDocument('11.222.333/0001-81'),true);
  assert.equal(validDocument('11111111111'),false);
  assert.equal(validDocument('52998224726'),false);
});

test('período exige fuso e fim posterior',()=>{
  assert.equal(periodSchema.safeParse({start:'2026-10-01T08:00:00-04:00',end:'2026-10-01T08:00:00-04:00'}).success,false);
  assert.equal(periodSchema.safeParse({start:'2026-10-01T08:00:00',end:'2026-10-01T10:00:00'}).success,false);
  assert.equal(periodSchema.safeParse({start:'2026-10-01T08:00:00-04:00',end:'2026-10-01T13:00:00Z'}).success,true);
});

test('cliente incompleto não pode gerar reserva',()=>{
  assert.equal(reservationSchema.safeParse({name:'Cliente'}).success,false);
});

test('autenticação falha sem configuração e com credenciais incorretas',()=>{
  const oldUser=process.env.ADMIN_USER,oldPassword=process.env.ADMIN_PASSWORD;
  try {
    process.env.ADMIN_USER='admin';process.env.ADMIN_PASSWORD='test-secret-at-least-16';
    assert.equal(authorized(null),false);
    assert.equal(authorized(`Basic ${Buffer.from('admin:wrong').toString('base64')}`),false);
    assert.equal(authorized(`Basic ${Buffer.from('admin:test-secret-at-least-16').toString('base64')}`),true);
    delete process.env.ADMIN_PASSWORD;assert.equal(authorized('Basic abc'),false);
  } finally {if(oldUser===undefined) delete process.env.ADMIN_USER;else process.env.ADMIN_USER=oldUser;if(oldPassword===undefined) delete process.env.ADMIN_PASSWORD;else process.env.ADMIN_PASSWORD=oldPassword;}
});

test('adaptador desativado nunca simula envio bem sucedido',async()=>{
  await assert.rejects(()=>new DisabledWhatsAppAdapter().send(),/desativado/);
});

test('cálculo de diárias respeita frações de 24 horas',()=>{
  assert.equal(calculateDays('2026-10-01T08:00:00Z','2026-10-01T18:00:00Z'),1);
  assert.equal(calculateDays('2026-10-01T08:00:00Z','2026-10-02T08:00:00Z'),1);
  assert.equal(calculateDays('2026-10-01T08:00:00Z','2026-10-02T09:00:00Z'),2);
  assert.equal(calculateDays('2026-10-01T08:00:00Z','2026-10-04T08:00:00Z'),3);
});

test('cálculo financeiro computa diária, frete, desconto e caução',()=>{
  const res = calculatePricing({
    dailyRate: 150,
    days: 3,
    freightAmount: 80,
    discountAmount: 30,
    depositAmount: 200,
  });
  assert.equal(res.subtotalAmount, 450);
  assert.equal(res.freightAmount, 80);
  assert.equal(res.discountAmount, 30);
  assert.equal(res.depositAmount, 200);
  assert.equal(res.totalAmount, 500); // 450 + 80 - 30

  // Desconto maior que o total não gera valor negativo
  const freebie = calculatePricing({ dailyRate: 100, days: 1, discountAmount: 500 });
  assert.equal(freebie.totalAmount, 0);

  // Formatação em Real brasileiro
  assert.match(formatBRL(150), /150,00/);
});

test('validação de equipamentos e reservas suporta valores financeiros',()=>{
  const validEq = equipmentSchema.safeParse({
    name: 'Compactador de Solo',
    category: 'Compactação',
    description: 'Motor 4 tempos',
    dailyRate: '180.50',
    minDays: '2',
    depositAmount: '300.00',
  });
  assert.equal(validEq.success, true);
  if(validEq.success) {
    assert.equal(validEq.data.dailyRate, 180.5);
    assert.equal(validEq.data.minDays, 2);
    assert.equal(validEq.data.depositAmount, 300);
  }

  const negEq = equipmentSchema.safeParse({
    name: 'Trator',
    category: 'Pesada',
    dailyRate: -50,
  });
  assert.equal(negEq.success, false);
});
