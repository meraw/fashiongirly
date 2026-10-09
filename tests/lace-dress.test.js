import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, LACE_SHIFT_DRESS_ID } from '../src/wardrobe/catalog.js';

const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Ivory lace shift dress: opaque lace body with frilled bands, a high ruffled collar, sheer sleeves into frilled cuffs, a back keyhole',()=>{
  const G=GARMENTS[LACE_SHIFT_DRESS_ID],B=G.build;
  assert.equal(G.slot,'dress');assert.equal(cleanRecipe({dressId:LACE_SHIFT_DRESS_ID}).dressId,LACE_SHIFT_DRESS_ID);
  const outfit=makeOutfit({dressId:LACE_SHIFT_DRESS_ID}),dress=outfit.getObjectByName(LACE_SHIFT_DRESS_ID);outfit.updateMatrixWorld(true);
  assert.ok(dress,'built by the lace template');
  for(const [name,count] of [['dress-body',1],['lace-frill',B.body.frills.length],['hem-trim',1],['lace-collar',1],['collar-ruffle',1],['keyhole',1],['back-button',2],
    ['lace-sleeve',2],['sleeve-trim',2*B.sleeve.bands.length],['ruffle-cuff',2],['cuff-frill',2],['bare-leg-skin',2],['zip-teeth',0]])
    assert.equal(named(dress,name).length,count,name);
  // A dress replaces the top and the bottoms.
  for(const gone of ['sweater','shirt'])assert.ok(!outfit.getObjectByName(gone),gone);
  let trouserMeshes=0;outfit.getObjectByName('trousers').traverse(o=>{if(o.isMesh)trouserMeshes++;});assert.equal(trouserMeshes,0,'no bottoms under a dress');
  dress.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // The body is opaque lace; the sleeves and collar are sheer lace over her skin.
  const body=named(dress,'dress-body')[0].material,sleeve=named(dress,'lace-sleeve')[0].material;
  assert.ok(body.map&&body.bumpMap&&!body.transparent,'opaque lace body');
  assert.ok(sleeve.alphaMap&&sleeve.transparent,'sheer sleeves');assert.ok(named(dress,'arm-skin').length===2,'skin under the sheer sleeves');
  // Mid-thigh hem; the frills sit on the body, closer together toward the hem.
  const hem=new T.Box3().setFromObject(named(dress,'dress-body')[0]).min.y/.76;assert.ok(hem>.82&&hem<.87,`hem at ${hem.toFixed(3)}`);
  const gaps=B.body.frills.slice(1).map((y,k)=>B.body.frills[k]-y);assert.ok(gaps.at(-1)<gaps[0],'frills closer together lower down');
  // The keyhole and its two gold buttons are at the back of the neck.
  for(const b of named(dress,'back-button'))assert.ok(b.getWorldPosition(new T.Vector3()).z<0,'buttons at the back');
  assert.ok(named(dress,'keyhole')[0].getWorldPosition(new T.Vector3()).z<0,'keyhole at the back');
  // The collar stands above the body's neckline.
  assert.ok(new T.Box3().setFromObject(named(dress,'collar-ruffle')[0]).max.y/.76>B.body.rows[0][0]+.05,'a high collar');
  disposeObject(outfit);
  assert.ok(OUTFITS.some(look=>look.recipe.dressId===LACE_SHIFT_DRESS_ID),'has a study');
});
