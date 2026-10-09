import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, MOTEL_TIE_DYE_SHIRT_ID, DESIGUAL_SPRAY_FLORAL_SHIRT_ID, DESIGUAL_SPLIT_FLORAL_SHIRT_ID, DESIGUAL_MOUNTAIN_SHIRT_ID, MANGO_DOT_SHIRT_ID, PINK_YOKE_SHIRT_ID, LEVIS_PLAID_FLANNEL_ID } from '../src/wardrobe/catalog.js';
import { PAISLEY_SHIRT_ATLAS } from '../src/wardrobe/paisley-shirt-atlas.js';
const PAISLEY_SHIRT_ID='paisley-print-relaxed-shirt-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const box=o=>new T.Box3().setFromObject(o);

test('paisley shirt: relaxed and longer than the fitted shirts, cuffed sleeves, a back yoke with a pleat, printed from its photo atlas',()=>{
  const g=GARMENTS[PAISLEY_SHIRT_ID];assert.equal(g.slot,'top');assert.ok(g.layering?.coversWaistband);assert.ok(OUTFITS.some(look=>look.recipe.topId===PAISLEY_SHIRT_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:PAISLEY_SHIRT_ID,knit:false,shirt:false}),top=outfit.getObjectByName(PAISLEY_SHIRT_ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['mesh-shirt-body',1],['mesh-shirt-sleeve',2],['shirt-cuff',2],['cuff-button',2],['cuff-seam',2],['shirt-collar-fall',1],['shirt-button',8],['yoke-seam',1],['back-pleat',2],['hem-stitch',1]])
    assert.equal(named(top,name).length,count,name);
  // Relaxed: wider than the fitted shirts at her waist, and longer, to a hem below the waistband.
  const fitted=makeOutfit({topId:MOTEL_TIE_DYE_SHIRT_ID,knit:false,shirt:false});fitted.updateMatrixWorld(true);
  const ours=box(named(top,'mesh-shirt-body')[0]),theirs=box(named(fitted,'mesh-shirt-body')[0]);
  assert.ok(ours.max.x>theirs.max.x+.01,`wider (${ours.max.x.toFixed(3)} against ${theirs.max.x.toFixed(3)})`);
  assert.ok(ours.min.y/.76<theirs.min.y/.76-.05,`longer (hem ${(ours.min.y/.76).toFixed(3)} against ${(theirs.min.y/.76).toFixed(3)})`);
  // The yoke seam and pleat are on her back.
  for(const name of ['yoke-seam','back-pleat'])for(const o of named(top,name))assert.ok(box(o).max.z<0,`${name} on the back`);
  // The print comes from its atlas of the product photos: the body from the top three quarters, each sleeve from its own
  // half of the bottom quarter (her right sleeve on the left half), the cuffs and collar from it too.
  assert.match(PAISLEY_SHIRT_ATLAS,/^data:image\/webp;base64,/);
  const atlas=new T.DataTexture(new Uint8Array([210,200,185,255]),1,1),printed=makeOutfit({topId:PAISLEY_SHIRT_ID,knit:false,shirt:false},{[PAISLEY_SHIRT_ID]:atlas});
  const shirt=printed.getObjectByName(PAISLEY_SHIRT_ID),body=named(shirt,'mesh-shirt-body')[0],uv=body.geometry.attributes.uv;
  for(const name of ['mesh-shirt-body','mesh-shirt-sleeve','shirt-cuff','shirt-collar-fall'])for(const o of named(shirt,name))assert.equal(o.material.map.source,atlas.source,name);
  const vs=[...uv.array].filter((_,k)=>k%2);assert.ok(Math.min(...vs)>=.249&&Math.max(...vs)<=1.0001,'body rows');
  for(const sleeve of named(shirt,'mesh-shirt-sleeve')){const a=sleeve.geometry.attributes.uv.array,us=[...a].filter((_,k)=>!(k%2)),v=[...a].filter((_,k)=>k%2);
    assert.ok(Math.max(...v)<=.2501,'sleeve rows');const right=sleeve.parent.position.x<0;assert.ok(right?Math.max(...us)<=.5:Math.min(...us)>=.5,'each sleeve its own half');}
  // Without the atlas (a failed load) it still dresses her, in a flat cream.
  const plain=named(top,'mesh-shirt-body')[0].material;assert.equal(plain.map,null);assert.ok(plain.color.r>plain.color.b);
  [outfit,fitted,printed].forEach(disposeObject);atlas.dispose();
});

test('the other shirts keep their own construction: no yoke or relaxed body, and the fitted ones no cuffs',()=>{
  for(const id of [MOTEL_TIE_DYE_SHIRT_ID,DESIGUAL_SPRAY_FLORAL_SHIRT_ID,DESIGUAL_SPLIT_FLORAL_SHIRT_ID]){
    const outfit=makeOutfit({topId:id,knit:false,shirt:false}),top=outfit.getObjectByName(id);outfit.updateMatrixWorld(true);
    for(const name of ['shirt-cuff','cuff-button','cuff-seam','yoke-seam','back-pleat'])assert.equal(named(top,name).length,0,`${id}: ${name}`);
    assert.equal(named(top,'sleeve-hem-stitch').length,2);assert.ok(Math.abs(box(named(top,'mesh-shirt-body')[0]).min.y/.76-1.26)<.002,`${id}: cropped at 1.26`);
    disposeObject(outfit);
  }
  // The mountain, Mango, pink yoke and flannel shirts use other template options (longer hem, own rows, cuffs, yokes),
  // but no back pleat.
  for(const id of [DESIGUAL_MOUNTAIN_SHIRT_ID,MANGO_DOT_SHIRT_ID,PINK_YOKE_SHIRT_ID,LEVIS_PLAID_FLANNEL_ID]){const outfit=makeOutfit({topId:id,knit:false,shirt:false}),top=outfit.getObjectByName(id);
    for(const name of ['back-pleat'])assert.equal(named(top,name).length,0,`${id}: ${name}`);disposeObject(outfit);}
});
