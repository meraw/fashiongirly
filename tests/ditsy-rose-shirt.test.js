import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const ID='cream-ditsy-rose-fitted-shirt-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Ditsy rose shirt: printed in small olive roses on cream, big open collar, white buttons, darts, long buttoned cuffs, shirt tail',()=>{
  const g=GARMENTS[ID];assert.equal(g.slot,'top');assert.equal(g.build.template,'ditsy-print-shirt');assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'a study preset wears it');
  const outfit=makeOutfit({topId:ID}),top=outfit.getObjectByName(ID);
  for(const [name,count] of [['mesh-shirt-body',1],['mesh-shirt-sleeve',2],['shirt-cuff',2],['cuff-button',2],['shirt-button',6],['front-dart',2],['back-dart',2],['shirt-collar-fall',1]])
    assert.equal(named(top,name).length,count,name);
  // The print: mostly cream ground, with olive roses and dark teal leaves.
  const img=named(top,'mesh-shirt-body')[0].material.map.image,d=img.data;let cream=0,rose=0,leaf=0;
  for(let i=0;i<d.length;i+=4){const [r,gr,b]=[d[i],d[i+1],d[i+2]];if(r>190&&b>170)cream++;else if(r-b>45&&gr>70)rose++;else if(r<70&&b>=r-5)leaf++;}
  const n=d.length/4;assert.ok(cream/n>.5&&rose/n>.12&&leaf/n>.01,`cream ${(cream/n).toFixed(2)}, roses ${(rose/n).toFixed(2)}, leaves ${(leaf/n).toFixed(3)}`);
  // Darts run down the front and the back either side of the centre, on the body.
  for(const [name,front] of [['front-dart',true],['back-dart',false]])for(const dart of named(top,name)){const p=dart.geometry.attributes.position;
    let lo=Infinity,hi=-Infinity;for(let i=0;i<p.count;i++){lo=Math.min(lo,p.getY(i));hi=Math.max(hi,p.getY(i));assert.ok(front?p.getZ(i)>0:p.getZ(i)<0,`${name} on its side`);}
    assert.ok(hi-lo>.3,`${name} runs ${lo.toFixed(2)}–${hi.toFixed(2)}`);}
  // A curved shirt tail: lower at the centre front than at the sides.
  const body=named(top,'mesh-shirt-body')[0].geometry.attributes.position,last=body.count-129;
  assert.ok(body.getY(last)<body.getY(last+32)-.03,'shirt tail');
  // Over the skirt it is tucked in, so the skirt's bow shows.
  const skirt=makeOutfit({topId:ID,skirt:true}),tucked=named(skirt.getObjectByName(ID),'mesh-shirt-body')[0].geometry.attributes.position;
  let low=Infinity;for(let i=0;i<tucked.count;i++)low=Math.min(low,tucked.getY(i));assert.ok(low>1.24,`tucked hem at ${low.toFixed(3)}`);
  [outfit,skirt].forEach(disposeObject);
});
