import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { DEFAULT, OUTFITS, cleanRecipe, editRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
test('doll and garment geometry stays finite for extreme supported silhouettes',()=>{
  for(const state of [...OUTFITS.map(look=>look.recipe),DEFAULT,{sleeve:0,hem:0,barrel:0},{sleeve:1,hem:1,barrel:1},{knit:false,shirt:false}]){
    const model=new T.Group();model.add(makeDoll(),makeOutfit(state));let triangles=0;
    model.traverse(o=>{if(!o.geometry)return;const p=o.geometry.attributes.position;for(const n of p.array)assert.ok(Number.isFinite(n));triangles+=(o.geometry.index?.count||p.count)/3;});
    assert.ok(triangles>10000&&triangles<350000,`triangle budget: ${triangles}`);
    const box=new T.Box3().setFromObject(model);assert.ok(box.max.y>2.25&&box.max.y<2.55);assert.ok(box.min.y>-.01);disposeObject(model);
  }
});
test('wardrobe layers toggle independently and shape settings affect bounds',()=>{
  const narrow=makeOutfit({sleeve:0,barrel:0}),wide=makeOutfit({sleeve:1,barrel:1});
  assert.ok(new T.Box3().setFromObject(wide).getSize(new T.Vector3()).x>new T.Box3().setFromObject(narrow).getSize(new T.Vector3()).x);
  const none=makeOutfit({knit:false,shirt:false});assert.equal(none.getObjectByName('sweater'),undefined);assert.equal(none.getObjectByName('shirt'),undefined);assert.ok(none.getObjectByName('trousers'));
  [narrow,wide,none].forEach(disposeObject);
});
test('recipe changes are bounded and do not mutate the source',()=>{
  const r=editRecipe(DEFAULT,'Butter sweater, enormous sleeves, cropped, wider jeans');assert.equal(r.recipe.sweater,'#ead391');assert.equal(r.recipe.sleeve,1);assert.equal(r.recipe.barrel,1);assert.equal(DEFAULT.sleeve,.74);
  assert.deepEqual(cleanRecipe(null),DEFAULT);assert.equal(cleanRecipe({sleeve:Infinity}).sleeve,DEFAULT.sleeve);assert.equal(cleanRecipe({barrel:5}).barrel,1);
});
test('UI applies a description, toggles clothing, saves and restores a look',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;let updates=0;
  d.getElementById('lookbook').showModal=function(){this.open=true;};d.getElementById('lookbook').close=function(){this.open=false;};
  const app=await startStudio(d,()=>({update(){updates++;},turn(){},dispose(){}}));
  d.getElementById('request').value='Butter sweater, enormous sleeves';d.getElementById('edit-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));assert.equal(app.getRecipe().sleeve,1);assert.equal(updates,1);
  d.getElementById('save').click();assert.equal(d.getElementById('count').textContent,'1');
  d.getElementById('reset').click();assert.equal(app.getRecipe().sleeve,.74);
  d.getElementById('lookbook-open').click();d.querySelector('.saved-row button').click();assert.equal(app.getRecipe().sleeve,1);
  const shirt=d.getElementById('shirt');shirt.checked=false;shirt.dispatchEvent(new dom.window.Event('change'));assert.equal(app.getRecipe().shirt,false);
  app.dispose();dom.window.close();
});
test('3D startup failure leaves an actionable error',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'});const app=await startStudio(dom.window.document,()=>{throw new Error('WebGL unavailable');});
  assert.equal(dom.window.document.getElementById('view-error').hidden,false);assert.match(dom.window.document.getElementById('view-error').textContent,/WebGL/);app.dispose();dom.window.close();
});

test('curated outfits preserve editable layers through saving and restoring',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;
  d.getElementById('lookbook').showModal=function(){this.open=true;};d.getElementById('lookbook').close=function(){this.open=false;};
  const app=await startStudio(d,()=>({update(){},turn(){},dispose(){}}));
  d.querySelector('#outfit-ideas button').click();
  assert.equal(app.getRecipe().skirt,true);assert.equal(d.getElementById('skirt').checked,true);
  const outfit=makeOutfit(app.getRecipe());assert.ok(outfit.getObjectByName('pleated-skirt'));disposeObject(outfit);
  d.getElementById('save').click();d.getElementById('reset').click();assert.equal(app.getRecipe().skirt,false);
  d.getElementById('lookbook-open').click();d.querySelector('.saved-row button').click();assert.equal(app.getRecipe().skirt,true);
  assert.equal(editRecipe(app.getRecipe(),'remove the skirt').recipe.skirt,false);
  app.dispose();dom.window.close();
});
