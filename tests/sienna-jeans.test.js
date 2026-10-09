import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const SIENNA_ID='mango-sienna-flare-crop-jeans-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Mango Sienna jeans: white, high rise, slim to the knee, flaring to a raw frayed hem above the ankle',()=>{
  const g=GARMENTS[SIENNA_ID];assert.equal(g.slot,'bottom');assert.equal(g.build.template,'jeans');
  assert.ok(OUTFITS.some(look=>look.recipe.bottomId===SIENNA_ID),'a study preset wears them');
  const outfit=makeOutfit({bottomId:SIENNA_ID});outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jeans-leg',2],['shank-button',1],['rivet',4],['back-patch-pocket',2],['coin-pocket-stitch',1]])
    assert.equal(named(outfit,name).length,count,name);
  assert.ok(named(outfit,'frayed-hem').length>=100,'raw frayed hems');
  assert.equal(named(outfit,'leather-patch').length,0,'no back patch');
  // The leg's width across (in outfit units) at a height: narrowest about the knee, wider again at the hem.
  const leg=named(outfit,'jeans-leg').find(m=>new T.Box3().setFromObject(m).getCenter(new T.Vector3()).x>0),p=leg.geometry.attributes.position,v=new T.Vector3();
  const width=y=>{let lo=Infinity,hi=-Infinity;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(leg.matrixWorld);if(Math.abs(v.y/.76-y)<.012){lo=Math.min(lo,v.x);hi=Math.max(hi,v.x);}}return (hi-lo)/1.06;};
  const thigh=width(.85),knee=width(.55),hem=width(.32);
  assert.ok(knee<thigh&&hem>knee*1.15,`thigh ${thigh.toFixed(3)} knee ${knee.toFixed(3)} hem ${hem.toFixed(3)}`);
  // Cropped above her ankle: the hem is well clear of the floor.
  const bottom=new T.Box3().setFromObject(leg).min.y/.76;assert.ok(bottom>.25&&bottom<.34,`hem at ${bottom.toFixed(3)}`);
  // White: without the swatch the stand-in colour is a soft white.
  const c=leg.material.map.image.data;let sum=0;for(let i=0;i<c.length;i+=4)sum+=(c[i]+c[i+1]+c[i+2])/3;assert.ok(sum/(c.length/4)>200,'white denim');
  disposeObject(outfit);
});
