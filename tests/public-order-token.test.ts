import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicOrderToken,validPublicOrderToken,validPublicToken} from '../src/lib/public-form-token';
test('Tela de sucesso exige token específico do pedido e rejeita adulteração',()=>{
 const original=process.env.PUBLIC_FORM_SECRET;process.env.PUBLIC_FORM_SECRET='chave-temporaria-apenas-teste-123';
 try {const id='12345678-abcd-4abc-8abc-123456789abc';const token=publicOrderToken(id);assert.equal(validPublicOrderToken(id,token),true);assert.equal(validPublicOrderToken('outro-pedido',token),false);assert.equal(validPublicOrderToken(id,token+'0'),false);assert.equal(validPublicOrderToken(id,'1.'+'0'.repeat(64)),false);assert.equal(validPublicToken(token,id),false);} finally {if(original===undefined)delete process.env.PUBLIC_FORM_SECRET;else process.env.PUBLIC_FORM_SECRET=original;}
});
