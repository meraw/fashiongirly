import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import * as T from 'three';
import { HAIRSTYLES } from '../src/hair/catalog.js';
import { makeHair, createHairController, disposeHair } from '../src/hair/model.js';
import { makeDoll, disposeObject } from '../src/doll/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
test('hair recipes migrate old looks and validate the separate hair slot',()=>{
  assert.equal(cleanRecipe({}).hairId,'bob');assert.equal(cleanRecipe({hairId:'unknown'}).hairId,'bob');
  for(const h of HAIRSTYLES)assert.equal(cleanRecipe({hairId:h.id}).hairId,h.id);
});
test('all hairstyles have finite bounded geometry and the long cut has a V hem',()=>{
  for(const h of HAIRSTYLES){const g=makeHair(h.id);let triangles=0;g.traverse(o=>{if(!o.geometry)return;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});assert.ok(triangles<90000,h.id);
    if(h.id!=='bob'){const box=new T.Box3().setFromObject(g);assert.ok(box.min.y>-1.2&&box.max.y<.85,h.id);assert.ok(box.min.x>-.7&&box.max.x<.7,h.id);}
    if(h.id==='straight-v'||h.id==='wavy-v'){const p=g.getObjectByName('v-shaped-lengths').geometry.attributes.position;let mid=Infinity,left=Infinity,right=Infinity;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);if(Math.abs(x)<.04)mid=Math.min(mid,y);if(x<-.39)left=Math.min(left,y);if(x>.39)right=Math.min(right,y);}assert.ok(mid<left-.2&&mid<right-.2,'V cut has longer centre');}
    disposeHair(g);
  }
});
test('switching styles preserves face/body and restores the original bob',()=>{
  const doll=makeDoll(),head=doll.getObjectByName('doll-head'),face=head.getObjectByName('felt-head'),body=doll.getObjectByName('plush-body');
  const fringe=head.children.filter(o=>['swept-fringe','fringe-thread'].includes(o.name));assert.ok(fringe.length>0);
  const controller=createHairController(doll),faceGeometry=face.geometry,bodyMatrix=body.matrix.clone();
  for(const h of HAIRSTYLES){controller.update(h.id);for(const o of fringe)assert.equal(o.visible,h.id==='bob',`${h.id}: bob fringe visibility`);assert.equal(face.geometry,faceGeometry);assert.equal(face.visible,true);assert.ok(body.matrix.equals(bodyMatrix));assert.equal(head.children.filter(o=>o.name==='outfit-hair').length,h.id==='bob'?0:1);}
  const current=head.getObjectByName('outfit-hair');let disposed=false;current.children[0].geometry.addEventListener('dispose',()=>disposed=true);
  controller.update('bob');assert.equal(disposed,true);assert.equal(head.getObjectByName('bob-back').visible,true);assert.equal(head.getObjectByName('hair-crown').visible,true);
  for(const o of fringe)assert.equal(o.visible,true);controller.update('high-bun');controller.dispose();for(const o of fringe)assert.equal(o.visible,true);disposeObject(doll);
});
test('hair selector saves and restores with looks and survives clothing preset changes',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;
  d.getElementById('lookbook').showModal=function(){};d.getElementById('lookbook').close=function(){};
  const app=await startStudio(d,()=>({update(){},turn(){},dispose(){}}));
  const select=d.getElementById('hair-select');assert.equal(select.options.length,HAIRSTYLES.length);
  select.value='high-bun';select.dispatchEvent(new dom.window.Event('change'));d.querySelector('#outfit-ideas button').click();assert.equal(app.getRecipe().hairId,'high-bun');
  d.getElementById('save').click();select.value='wavy-v';select.dispatchEvent(new dom.window.Event('change'));d.getElementById('lookbook-open').click();d.querySelector('.saved-row button').click();assert.equal(app.getRecipe().hairId,'high-bun');assert.equal(select.value,'high-bun');
  app.dispose();assert.equal(d.getElementById('hair-select'),null);dom.window.close();
});

test('hairline roots follow the head rather than an offset cap',()=>{
  const hair=makeHair('straight-v'),p=hair.getObjectByName('styled-scalp').geometry.attributes.position;
  // Last ring is the complete hairline, including temples and nape.
  for(let i=p.count-65;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const radius=Math.sqrt((x/.5)**2+(y/.47)**2+(z/.405)**2);
    assert.ok(radius>1&&radius<1.005,`root clearance ${radius}`);
  }
  disposeHair(hair);
});
