import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, RED_BULL_WINDBREAKER_ID, MARIKOO_WINDBREAKER_ID } from '../src/wardrobe/catalog.js';

const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Red Bull windbreaker: stone shell, covered zip with collar snaps, hem and collar toggles, no hood or drawcords',()=>{
  assert.equal(GARMENTS[RED_BULL_WINDBREAKER_ID].slot,'outerwear');
  assert.equal(cleanRecipe({outerwearId:RED_BULL_WINDBREAKER_ID,outerwearOpen:true}).outerwearOpen,false,'worn zipped like the windbreaker template');
  const outfit=makeOutfit({outerwearId:RED_BULL_WINDBREAKER_ID}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['elastic-hem-band',1],['collar-lining',1],['zip-placket',1],['placket-topstitch',2],['collar-snap',2],['toggle-cord',2],['cord-toggle',2],['pocket-welt',2],['pocket-opening',2],['jacket-sleeve',2],['elastic-cuff',2],['sleeve-badge',1],
    ['coil-zip',0],['zip-slider',0],['snap-button',0],['drawcord',0],['hood',0],['back-label',0]])
    assert.equal(named(jacket,name).length,count,name);
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // The badge is a flat rectangle on her left sleeve.
  const badge=named(jacket,'sleeve-badge')[0];assert.equal(badge.geometry.type,'BoxGeometry');assert.ok(badge.getWorldPosition(new T.Vector3()).x>.3);
  // One plain shell colour (no yoke); light prints down the front beside the zip and across the back above the flap seam.
  const map=named(jacket,'jacket-body')[0].material.map,{data,width:w,height:h}=map.image;
  const light=(a0,a1,y0,y1)=>{let n=0;for(let j=Math.round((y0-1)*h);j<Math.round((y1-1)*h);j++)for(let i=Math.round(a0/(Math.PI*2)*w);i<Math.round(a1/(Math.PI*2)*w);i++){const k=(j*w+i)*4;if(data[k]>215&&data[k+1]>210)n++;}return n;};
  assert.ok(light(Math.PI*.8,Math.PI*1.2,1.42,1.52)>40,'back print');
  assert.ok(light(Math.PI*1.7,Math.PI*2,1.66,2)+light(0,Math.PI*.3,1.66,2)>20,'front print');
  assert.equal(light(Math.PI*.3,Math.PI*.7,1.1,1.9),0,'no print on the sides');
  disposeObject(outfit);
  const study=OUTFITS.find(look=>look.recipe.outerwearId===RED_BULL_WINDBREAKER_ID);assert.ok(study,'has a study');
});

test('Red Bull windbreaker options are additive: the Marikoo windbreaker keeps its own zip, hood and cords',()=>{
  const outfit=makeOutfit({outerwearId:MARIKOO_WINDBREAKER_ID}),jacket=outfit.getObjectByName('outerwear');
  for(const name of ['coil-zip','hood','drawcord','snap-button','back-label'])assert.ok(named(jacket,name).length>0,name);
  for(const name of ['zip-placket','collar-snap','cord-toggle','toggle-cord'])assert.equal(named(jacket,name).length,0,name);
  assert.notEqual(named(jacket,'sleeve-badge')[0].geometry.type,'BoxGeometry','its badge keeps its own shape');
  disposeObject(outfit);
});
