import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe, OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const PAIRS={black:'bershka-low-rise-barrel-jeans-black-v1',blue:'bershka-low-rise-barrel-jeans-blue-v1'};

test('Bershka barrel jeans, black and blue: low rise, barrel legs to the shoes, knee seams, flap back pockets, patch, rivets',()=>{
  for(const [colour,id] of Object.entries(PAIRS)){
    const g=GARMENTS[id];assert.equal(g.slot,'bottom');assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
    assert.ok(OUTFITS.some(o=>o.recipe.bottomId===id),`${colour}: has a study`);
    const outfit=makeOutfit({bottomId:id});outfit.updateMatrixWorld(true);const jeans=outfit.getObjectByName('trousers');
    const all=name=>{const found=[];jeans.traverse(o=>{if(o.name===name)found.push(o);});return found;};
    for(const name of ['shank-button','back-yoke','leather-patch','coin-pocket-stitch','knee-dart'])assert.ok(all(name).length,`${colour}: ${name}`);
    assert.equal(all('pocket-flap').length,2,`${colour}: two back pocket flaps`);assert.equal(all('flap-button').length,2,`${colour}: a button on each flap`);
    assert.equal(all('rivet').length,4,`${colour}: rivets at the pocket corners`);
    // Full length: the legs reach down to the shoes.
    const box=new T.Box3();all('barrel-leg').forEach(l=>box.expandByObject(l));assert.ok(box.min.y/.76<.1,`${colour}: hem at ${(box.min.y/.76).toFixed(3)}`);
    disposeObject(outfit);
  }
  // The two colours: a black patch and grey stitching on the black pair, a tan patch and copper stitching on the blue.
  const patch=id=>{const o=makeOutfit({bottomId:id});let c,t;o.traverse(m=>{if(m.name==='leather-patch')c=m.material.color.clone();if(m.name==='coin-pocket-stitch')t=m.material.color.clone();});disposeObject(o);return [c,t];};
  const [blackPatch,blackThread]=patch(PAIRS.black),[bluePatch,blueThread]=patch(PAIRS.blue);
  assert.ok(blackPatch.r<.05&&bluePatch.r>bluePatch.b*1.5,'black and tan patches');
  assert.ok(Math.abs(blackThread.r-blackThread.b)<.02&&blueThread.r>blueThread.b*2,'grey and copper stitching');
});
