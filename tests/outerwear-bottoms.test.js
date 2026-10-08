import test from 'node:test';
import assert from 'node:assert/strict';
import { bottoms, check, wearings } from './outerwear-coverage.js';

// The rest of the outerwear coverage test (tops are in outerwear.test.js): split so the two run in parallel.
test('outerwear covers every bottom and the skirt from its hem to its collar, apart from an open front',()=>{
  for(const {id,open,skirt} of wearings){
    for(const bottomId of bottoms)assert.ok(check(id,open,skirt,{bottomId,topId:'desigual-silver-cable-jumper-v1'},n=>n==='trousers')>20,bottomId);
    if(skirt)assert.ok(check(id,open,skirt,{},n=>n==='layered-skirt')>50,'skirt');
  }
});
