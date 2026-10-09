import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, WOOLRICH_BOMBER_ID } from '../src/wardrobe/catalog.js';

const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Woolrich bomber: snap storm flap, flap pockets, rib knit hem and cuffs, sleeve zip pocket and label, fur ruff on the hood',()=>{
  assert.equal(GARMENTS[WOOLRICH_BOMBER_ID].slot,'outerwear');
  assert.equal(cleanRecipe({outerwearId:WOOLRICH_BOMBER_ID}).outerwearOpen,false,'starts zipped, as the user wears jackets');
  const outfit=makeOutfit({outerwearId:WOOLRICH_BOMBER_ID}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['elastic-hem-band',1],['elastic-cuff',2],['zip-placket',1],['placket-snap',5],['collar-snap',2],
    ['pocket-flap',2],['pocket-flap-edge',2],['pocket-snap',2],['sleeve-badge',1],['sleeve-pocket',1],['sleeve-pocket-zip',1],
    ['hood',1],['hood-ruff',1],['hood-ruff-tufts',1],['hood-ruff-tips',1],['hood-lining-edge',1],
    ['coil-zip',0],['pocket-welt',0],['drawcord',0],['hood-label',0],['back-label',0]])
    assert.equal(named(jacket,name).length,count,name);
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // Rib knit at the hem and cuffs, in its own cream; the ruff is long pile in grey-beige with darker tips.
  for(const name of ['elastic-hem-band','elastic-cuff']){const m=named(jacket,name)[0].material;assert.ok(m.bumpMap,`${name} is knitted`);assert.equal(m.color.getHexString(),new T.Color('#aba294').getHexString());}
  const tufts=named(jacket,'hood-ruff-tufts')[0],tips=named(jacket,'hood-ruff-tips')[0];
  assert.ok(tufts.isInstancedMesh&&tufts.count+tips.count>1000,'a dense pile');
  // The ruff lies round the lowered hood on her back, so it shows below her head.
  const ruff=new T.Box3().setFromObject(named(jacket,'hood-ruff')[0]);assert.ok(ruff.min.z<0&&ruff.min.y/.76<1.7,'round the hood on her back');
  // The sleeve pocket and label are on her left arm.
  for(const name of ['sleeve-pocket','sleeve-badge'])assert.ok(named(jacket,name)[0].getWorldPosition(new T.Vector3()).x>.3,name);
  disposeObject(outfit);
  assert.ok(OUTFITS.some(look=>look.recipe.outerwearId===WOOLRICH_BOMBER_ID),'has a study');
});

test('Woolrich bomber shown open: the navy lining, a zip half on each edge, the storm flap on her left front',()=>{
  const outfit=makeOutfit({outerwearId:WOOLRICH_BOMBER_ID,outerwearOpen:true}),jacket=outfit.getObjectByName('outerwear');
  const lining=named(jacket,'jacket-lining');assert.equal(lining.length,1);assert.equal(lining[0].material.color.getHexString(),new T.Color('#1c2233').getHexString());assert.ok(!lining[0].material.bumpMap,'smooth nylon, not pile');
  assert.equal(named(jacket,'zip-half').length,2);assert.equal(named(jacket,'zip-placket').length,1);
  disposeObject(outfit);
});
