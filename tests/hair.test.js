import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import * as T from 'three';
import { HAIRSTYLES } from '../src/hair/catalog.js';
import { makeHair, createHairController, disposeHair, followHead } from '../src/hair/model.js';
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
test('the side braid is only as long as her own hair could plait: plaited from behind her ear, ending above her long hair',()=>{
  // The user, 12 October 2026: the old braid was far too long for her hair and began as a long smooth ponytail.
  const lowest=id=>{const g=makeHair(id),y=new T.Box3().setFromObject(g).min.y;disposeHair(g);return y;};
  assert.ok(lowest('side-braid')>lowest('straight-v')+.05,'it ends above where her long hair ends');
  const braid=makeHair('side-braid');
  assert.equal(braid.getObjectByName('braid-gather'),undefined,'no long gathered lock before the plait');
  const top=new T.Box3().setFromObject(braid.getObjectByName('braid-core')).max.y;
  assert.ok(top>-.3,'the plait starts up behind her ear');
  disposeHair(braid);
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

// How far a point lies out from her felt head as makeHead shapes it (the ellipsoid, swollen round her jaw): 1 on it.
const outFromHead=([x,y,z])=>{const u=x/.5,v=y/.47,w=z/.405,k=Math.hypot(u,v,w),surface=followHead([x/k,y/k,z/k]);return Math.hypot(x,y,z)/Math.hypot(...surface);};
test('hairline roots follow the head rather than an offset cap',()=>{
  const hair=makeHair('straight-v'),p=hair.getObjectByName('styled-scalp').geometry.attributes.position;
  // Last ring is the complete hairline, including temples and nape: just outside her head as it is made, swollen round
  // her jaw (31 October 2026: following the plain ellipsoid, her head showed through in a jagged line above her ears).
  for(let i=p.count-65;i<p.count;i++){
    const radius=outFromHead([p.getX(i),p.getY(i),p.getZ(i)]);
    assert.ok(radius>1&&radius<1.005,`root clearance ${radius}`);
  }
  disposeHair(hair);
});
test('her felt head never shows through the hair laid over it',()=>{
  // Her head's own surface, sampled as makeHead builds it, against the scalp of a long style: every vertex of her head
  // under the hairline lies inside the scalp.
  const doll=makeDoll(),face=doll.getObjectByName('felt-head'),head=face.geometry.attributes.position,hair=makeHair('straight-v');
  const scalp=hair.getObjectByName('styled-scalp').geometry.attributes.position;
  const [sx,sy,sz]=face.scale.toArray();
  for(let i=0;i<head.count;i+=7){const p=[head.getX(i)*sx,head.getY(i)*sy,head.getZ(i)*sz],surface=followHead(p.map((v,k)=>v/Math.hypot(head.getX(i),head.getY(i),head.getZ(i))));
    assert.ok(Math.abs(Math.hypot(...p)-Math.hypot(...surface))<.002,'followHead is her head as makeHead shapes it');}
  let lowest=Infinity;for(let i=0;i<scalp.count;i++)lowest=Math.min(lowest,outFromHead([scalp.getX(i),scalp.getY(i),scalp.getZ(i)]));
  assert.ok(lowest>1,`the scalp lies on her head everywhere (${lowest})`);
  disposeHair(hair);disposeObject(doll);
});
test('the long lengths are a stuffed panel, closed down its sides and along its hem',()=>{
  for(const id of ['straight-v','wavy-v','half-up']){
    const hair=makeHair(id),g=hair.getObjectByName('v-shaped-lengths').geometry,p=g.attributes.position,half=p.count/2,cols=49;
    let thickest=0;
    for(let i=0;i<half;i++){const d=Math.hypot(p.getX(i+half)-p.getX(i),p.getY(i+half)-p.getY(i),p.getZ(i+half)-p.getZ(i));thickest=Math.max(thickest,d);
      const col=i%cols,row=Math.floor(i/cols),edge=col===0||col===cols-1||row===half/cols-1;if(edge)assert.ok(d<1e-6,`${id}: the faces meet at the edge (${d})`);}
    assert.ok(thickest>.03&&thickest<.06,`${id}: stuffed, not a sheet (${thickest})`);
    disposeHair(hair);
  }
});
