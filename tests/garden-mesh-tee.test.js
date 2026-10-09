import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { TOP_TEMPLATES } from '../src/doll/top-templates.js';
import { GARDEN_MESH_TEE_ATLAS } from '../src/wardrobe/garden-mesh-tee-atlas.js';
const ID='desigual-garden-print-mesh-tee-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const box=o=>new T.Box3().setFromObject(o);

test('garden mesh tee: fitted, long-sleeved, a crew neckband, yoke seams front and back, and metallic cuffs at her wrists',()=>{
  const g=GARMENTS[ID];assert.equal(g.slot,'top');assert.ok(g.layering?.coversWaistband);assert.ok(TOP_TEMPLATES[g.build.template]);
  assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'a study preset wears it');
  const outfit=makeOutfit({topId:ID}),top=outfit.getObjectByName(ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['mesh-tee-body',1],['crew-neckband',1],['front-yoke-seam',1],['back-yoke-seam',1],['reference-fitted-sleeve',2],['lame-cuff',2]])
    assert.equal(named(top,name).length,count,name);
  // The yoke seams lie on the front and on the back, the back one lower, as in the photos.
  const front=box(named(top,'front-yoke-seam')[0]),back=box(named(top,'back-yoke-seam')[0]);
  assert.ok(front.min.z>0&&back.max.z<0,'front seam on the front, back seam on the back');
  assert.ok(front.getCenter(new T.Vector3()).y>back.getCenter(new T.Vector3()).y+.03,'the back seam is lower');
  // Each cuff is metallic and covers its sleeve's end.
  for(const sleeve of named(top,'reference-fitted-sleeve')){
    const cuff=sleeve.parent.children.find(o=>o.name==='lame-cuff');assert.ok(cuff.material.metalness>.5,'metallic');
    const s=box(sleeve),c=box(cuff);assert.ok(c.min.y<=s.min.y+.002&&c.max.y>s.min.y+.03,'the cuff covers the sleeve end');
  }
  // Without the atlas (a failed load) it still dresses her, in a flat colour.
  assert.equal(named(top,'mesh-tee-body')[0].material.map,null);
  disposeObject(outfit);
});

test('garden mesh tee: the print comes from its atlas of the product photos, the body above and each sleeve its own half below',()=>{
  assert.match(GARDEN_MESH_TEE_ATLAS,/^data:image\/webp;base64,/);
  const atlas=new T.DataTexture(new Uint8Array([120,115,110,255]),1,1),outfit=makeOutfit({topId:ID},{[ID]:atlas}),top=outfit.getObjectByName(ID);
  const body=GARMENTS[ID].build.atlas.body;
  for(const name of ['mesh-tee-body','reference-fitted-sleeve'])for(const o of named(top,name))assert.equal(o.material.map.source,atlas.source,name);
  const vs=a=>[...a].filter((_,k)=>k%2),us=a=>[...a].filter((_,k)=>!(k%2));
  const bv=vs(named(top,'mesh-tee-body')[0].geometry.attributes.uv.array);assert.ok(Math.min(...bv)>=1-body-1e-4&&Math.max(...bv)<=1+1e-4,'body rows');
  for(const sleeve of named(top,'reference-fitted-sleeve')){const a=sleeve.geometry.attributes.uv.array;
    assert.ok(Math.max(...vs(a))<=1-body+1e-4,'sleeve rows');const right=sleeve.parent.position.x<0;
    assert.ok(right?Math.max(...us(a))<=.5:Math.min(...us(a))>=.5,'each sleeve its own half (her right on the left)');}
  disposeObject(outfit);atlas.dispose();
});
