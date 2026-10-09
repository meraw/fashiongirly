import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe, DEFAULT } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS, DESIGUAL_LEATHER_JACKET_ID } from '../src/wardrobe/catalog.js';
import { check } from './outerwear-coverage.js';
const GREEN='bomboogie-green-teddy-hood-jacket-v1',BLUE='bomboogie-blue-teddy-hood-jacket-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const wear=(id,extra={})=>{const outfit=makeOutfit({topId:'white-linen-button-down-shirt-v1',outerwearId:id,...extra});outfit.updateMatrixWorld(true);return outfit;};

test('Bomboogie teddy jackets: green and blue, each with a study, worn closed with the hood and bib zipped in',()=>{
  for(const id of [GREEN,BLUE]){const g=GARMENTS[id];
    assert.equal(g.slot,'outerwear');assert.ok(g.layering.canOpen&&g.layering.closed&&g.layering.detachable?.label,'can be worn open; its hood and bib come out');
    assert.ok(OUTFITS.some(look=>look.recipe.outerwearId===id),'a study wears it');
    const outfit=wear(id),jacket=outfit.getObjectByName('outerwear');
    for(const part of ['jacket-body','teddy-collar','metal-zip','hem-roll','neck-lining','detachable-insert','quilted-hood','hood-rim','bib-neck','bib-zip'])assert.equal(named(jacket,part).length,1,`${id}: ${part}`);
    assert.equal(named(jacket,'zip-slider').length,2,'a two-way zip');assert.equal(named(jacket,'teddy-cuff').length,2);
    // The teddy is curly and matte, the insert glossy nylon.
    const teddy=named(jacket,'jacket-body')[0].material,nylon=named(jacket,'quilted-hood')[0].material;
    assert.ok(teddy.bumpMap&&teddy.roughness===1,'curly matte teddy');assert.ok(nylon.roughness<.5&&nylon.clearcoat>0,'glossy nylon');
    // The hood lies on her back, below her hair.
    const hood=new T.Box3().setFromObject(named(jacket,'quilted-hood')[0]);assert.ok(hood.getCenter(new T.Vector3()).z<-.1&&hood.min.y/.76>1.55,'the hood is down on her back');
    disposeObject(outfit);
  }
  const green=wear(GREEN),blue=wear(BLUE),colour=o=>named(o,'jacket-body')[0].material.color;
  assert.ok(colour(green).g>colour(green).b&&colour(blue).b>colour(blue).g,'one green, one blue');disposeObject(green);disposeObject(blue);
});

test('Bomboogie teddy jackets: without the hood and bib, none of the insert is worn',()=>{
  for(const open of [false,true]){const outfit=wear(GREEN,{outerwearInsert:false,outerwearOpen:open}),jacket=outfit.getObjectByName('outerwear');
    assert.equal(jacket.userData.insert,false);assert.equal(named(jacket,'detachable-insert').length,0);
    for(const part of ['quilted-hood','hood-rim','bib-neck','quilted-bib','bib-zip'])assert.equal(named(jacket,part).length,0,part);
    assert.equal(named(jacket,'teddy-collar').length,1,'the teddy collar stays');disposeObject(outfit);}
});

test('Bomboogie teddy jackets: open, the zip parts; with the insert its quilted bib closes the front over the top',()=>{
  const outfit=wear(GREEN,{outerwearOpen:true}),jacket=outfit.getObjectByName('outerwear');
  assert.equal(named(jacket,'metal-zip').length,0);assert.equal(named(jacket,'metal-zip-half').length,2);
  assert.ok(named(jacket,'quilt-stitch').length>=8,'quilted in channels');
  const bib=named(jacket,'quilted-bib')[0],box=new T.Box3().setFromObject(bib);assert.ok(box.min.x<-.05*1.06&&box.max.x>.05*1.06,'across the front');
  // In front of every point of the top between the fronts, from the bib's foot to the collar.
  const bins=new Map(),p=new T.Vector3(),key=v=>Math.round(v.y/.76/.02)+':'+Math.round(v.x/.02);
  const bp=bib.geometry.attributes.position;for(let i=0;i<bp.count;i++){p.fromBufferAttribute(bp,i).applyMatrix4(bib.matrixWorld);const k=key(p);bins.set(k,Math.min(bins.get(k)??Infinity,p.z));}
  let checked=0;outfit.getObjectByName('white-linen-button-down-shirt-v1').traverse(o=>{if(!o.isMesh)return;const q=o.geometry.attributes.position;
    for(let i=0;i<q.count;i++){p.fromBufferAttribute(q,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(Math.abs(p.x)>.06||p.z<0||y<1.22||y>1.85)continue;
      const z=bins.get(key(p));if(z===undefined)continue;assert.ok(p.z<z,`the top shows through the bib at y ${y.toFixed(3)}`);checked++;}});
  assert.ok(checked>50,`checked ${checked} points`);disposeObject(outfit);
  const bare=wear(GREEN,{outerwearOpen:true,outerwearInsert:false});assert.equal(named(bare,'quilted-bib').length,0,'without it the top shows');disposeObject(bare);
});

test('Bomboogie teddy jackets: without the insert they still cover the top and the skirt from hem to collar',()=>{
  for(const [open,skirt] of [[false,false],[true,true]])assert.ok(check(GREEN,open,skirt,{topId:'pull-bear-grey-chenille-high-neck-v1',outerwearInsert:false},n=>!['trousers','shoes','outerwear'].includes(n))>500);
});

test('the detachable-part option: kept only for outerwear that has one, and offered in the app',async()=>{
  assert.equal(DEFAULT.outerwearInsert,true);
  assert.equal(cleanRecipe({outerwearId:GREEN,outerwearInsert:false}).outerwearInsert,false);
  assert.equal(cleanRecipe({outerwearId:DESIGUAL_LEATHER_JACKET_ID,outerwearInsert:false}).outerwearInsert,true,'other outerwear has nothing to take out');
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;let last=null;
  const app=await startStudio(d,()=>({update(r){last=r;},turn(){},dispose(){}}));
  const select=d.getElementById('outerwear-select'),box=d.getElementById('outerwear-insert'),label=d.getElementById('outerwear-insert-label');
  assert.equal(box.disabled,true,'nothing to take out without outerwear');
  select.value=GREEN;select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(box.disabled,false);assert.equal(box.checked,true,'worn with its hood and bib');assert.equal(label.textContent,GARMENTS[GREEN].layering.detachable.label);
  box.checked=false;box.dispatchEvent(new dom.window.Event('change'));assert.equal(app.getRecipe().outerwearInsert,false);assert.equal(last.outerwearInsert,false);
  select.value=DESIGUAL_LEATHER_JACKET_ID;select.dispatchEvent(new dom.window.Event('change'));assert.equal(box.disabled,true);assert.equal(app.getRecipe().outerwearInsert,true);
  app.dispose();dom.window.close();
});
