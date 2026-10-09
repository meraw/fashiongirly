import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { DESIGUAL_PAINTERLY_TEE_ATLAS } from '../src/wardrobe/painterly-tee-atlas.js';
const ID='desigual-painterly-patchwork-vneck-tee-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Desigual painterly patchwork tee: printed panels, deep V with a binding, rust overlocked seams incl. the back band, short sleeves',()=>{
  const g=GARMENTS[ID];assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'a study preset wears it');
  assert.match(DESIGUAL_PAINTERLY_TEE_ATLAS,/^data:image\/webp;base64,/);
  const atlas=new T.DataTexture(new Uint8Array([210,180,150,255]),1,1),outfit=makeOutfit({topId:ID},{[ID]:atlas}),top=outfit.getObjectByName(ID);
  for(const [name,count] of [['printed-tee-body',1],['reference-fitted-sleeve',2],['raglan-seam',4],['centre-front-seam',1],['side-seam',2],['back-band-seam',1],['lettuce-hem',1],['lettuce-neckline',0],['neck-binding',1],['bound-neckline',1],['bare-shoulder-skin',1],['lettuce-sleeve-hem',2]])
    assert.equal(named(top,name).length,count,name);
  const body=named(top,'printed-tee-body')[0],p=body.geometry.attributes.position,B=g.build.body,VN=g.build.vneck;assert.equal(body.material.map.source,atlas.source);
  // The V: at the back the neckline stays at the neck; at centre front it drops to the V's point, its sides symmetric.
  assert.ok(Math.abs(p.getY(64)-B.neck)<.002,`back neck at ${p.getY(64).toFixed(3)}`);
  assert.ok(Math.abs(p.getY(0)-VN.bottom)<.003,`V point at ${p.getY(0).toFixed(3)}`);
  for(const i of [4,10,20])assert.ok(Math.abs(p.getY(128-i)-p.getY(i))<.002,'symmetric V');
  // Each sleeve prints from its own half of the bottom quarter (her right sleeve on the left half), the body above.
  const vs=[...body.geometry.attributes.uv.array].filter((_,k)=>k%2);assert.ok(Math.min(...vs)>=.249&&Math.max(...vs)<=1.0001);
  for(const sleeve of named(top,'reference-fitted-sleeve')){const uv=sleeve.geometry.attributes.uv.array,us=[...uv].filter((_,k)=>!(k%2));
    const right=sleeve.parent.position.x<0;assert.ok(right?Math.max(...us)<=.5:Math.min(...us)>=.5,'each sleeve its own half');
    // Short sleeves, ending high on her upper arm where it turns bare (bareArmBelow).
    let min=Infinity;const q=sleeve.geometry.attributes.position;for(let i=0;i<q.count;i++)min=Math.min(min,q.getY(i));
    assert.ok(min<-.14&&min>g.layering.bareArmBelow-.01,`sleeve ends at ${min.toFixed(3)}`);}
  // Rust-orange overlocking and a printed-orange binding.
  const rust=named(top,'centre-front-seam')[0].material.color;assert.ok(rust.r>rust.g*1.5&&rust.g>rust.b,'rust overlock');
  // The back band's seam runs across the lower back, a third of the way up.
  outfit.updateMatrixWorld(true);const band=named(top,'back-band-seam')[0].geometry.attributes.position,y0=B.hem+(B.neck-B.hem)*g.build.seams.band;
  for(let i=0;i<band.count;i+=5){const y=band.getY(i);assert.ok(Math.abs(y-y0)<.01&&band.getZ(i)<.05,`band seam point at ${y.toFixed(3)}`);}
  // Without the atlas (a failed load) it still dresses her, in a flat cream.
  const plain=makeOutfit({topId:ID});assert.equal(named(plain,'printed-tee-body')[0].material.map,null);
  [outfit,plain].forEach(disposeObject);atlas.dispose();
});
