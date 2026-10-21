import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planItem,stableId } from './plano.mjs';
const items=JSON.parse(await readFile(new URL('./equipamentos.json',import.meta.url),'utf8'));
test('12 equipamentos dos prints e 24 unidades provisórias com códigos únicos',()=>{
  assert.equal(items.length,12);
  const plans=items.map(item=>planItem(item,[],[]));
  assert.equal(plans.flatMap(p=>p.createUnits).length,24);
  assert.equal(new Set(plans.flatMap(p=>p.createUnits.map(u=>u.code))).size,24);
  assert.equal(new Set(items.map(i=>stableId(i.key))).size,12);
  for(const item of items) {assert.ok(item.dailyRate>0&&item.depositAmount>=0);assert.equal(item.minDays,1);}
});
test('cadastro existente mantém preço e estoque; reexecução não duplica',()=>{
  const item=items[0],id=stableId(item.key);
  const plan=planItem(item,[{id,name:'Equipamento já renomeado'}],[{equipment_id:id,code:'REAL-001'}]);
  assert.equal(plan.createEquipment,false);assert.deepEqual(plan.createUnits,[]);
});
test('nome equivalente é reaproveitado; nome ambíguo exige revisão',()=>{
  const item=items[1];
  const plan=planItem(item,[{id:'existing',name:'ESMERILHADEIRA ANGULAR'}],[]);
  assert.equal(plan.createEquipment,false);assert.equal(plan.equipmentId,'existing');
  assert.equal(planItem(item,[{id:'1',name:item.name},{id:'2',name:item.name}],[]).skip,true);
});
