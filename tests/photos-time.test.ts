import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {saveEquipmentPhoto} from '../src/lib/equipment-photos';
import {businessIso,suggestedPublicStart} from '../src/lib/business-time';
test('Retirada hoje recebe próximo horário; datas passadas e horários futuros são preservados',()=>{
 const noon=new Date('2026-10-01T12:00:00-03:00');
 assert.equal(suggestedPublicStart('2026-10-01T08:00',noon),'2026-10-01T12:15');
 assert.equal(suggestedPublicStart('2026-10-01T15:00',noon),'2026-10-01T15:00');
 assert.equal(suggestedPublicStart('2026-09-30T08:00',noon),'2026-09-30T08:00');
 assert.equal(suggestedPublicStart('2026-10-02T08:00',noon),'2026-10-02T08:00');
});
test('Datas locais usam Brasília sem depender do fuso do computador',()=>{
 assert.equal(businessIso('2026-10-10T09:30'),'2026-10-10T09:30:00-03:00');assert.equal(businessIso('inválido'),'');
});
test('Fotos são verificadas e convertidas; arquivos inválidos rejeitados',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'rental-photo-'));const original=process.env.UPLOADS_DIR;process.env.UPLOADS_DIR=folder;
 try {const data=await sharp({create:{width:1600,height:800,channels:3,background:'#f1bc29'}}).png().toBuffer();const filename=await saveEquipmentPhoto(new File([new Uint8Array(data)],'foto.png',{type:'image/png'}));const result=await sharp(await readFile(join(folder,filename))).metadata();assert.equal(result.format,'webp');assert.equal(result.width,1200);assert.equal(result.height,600);await assert.rejects(()=>saveEquipmentPhoto(new File(['<svg/>'],'foto.svg',{type:'image/svg+xml'})));await assert.rejects(()=>saveEquipmentPhoto(new File(['invalid'],'foto.png',{type:'image/png'})));} finally {if(original===undefined) delete process.env.UPLOADS_DIR;else process.env.UPLOADS_DIR=original;await rm(folder,{recursive:true,force:true});}
});
