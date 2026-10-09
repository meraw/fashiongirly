import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe, OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const ID='mango-claudia-slim-crop-jeans-v1';

test('Mango Claudia jeans: high rise, slim legs tapering to an ankle crop, tonal stitching, no rivets, back yoke',()=>{
  assert.equal(GARMENTS[ID].slot,'bottom');assert.equal(cleanRecipe({bottomId:ID}).bottomId,ID);
  assert.ok(OUTFITS.some(o=>o.recipe.bottomId===ID),'has a study');
  const outfit=makeOutfit({bottomId:ID});outfit.updateMatrixWorld(true);const jeans=outfit.getObjectByName('trousers');
  const all=name=>{const found=[];jeans.traverse(o=>{if(o.name===name)found.push(o);});return found;};
  for(const name of ['shank-button','back-yoke','coin-pocket-stitch','hem-stitch'])assert.ok(all(name).length,name);
  for(const name of ['rivet','leather-patch','frayed-hem'])assert.equal(all(name).length,0,`no ${name}`);
  // Cropped at her ankle: the hem sits above the loafers, well below her knee.
  const legs=all('jeans-leg'),box=new T.Box3();legs.forEach(l=>box.expandByObject(l));const hem=box.min.y/.76;
  assert.ok(hem>.22&&hem<.32,`hem at ${hem}`);
  // Slim and tapered: each leg's cross-section (width by depth) is much smaller at the hem than at the thigh.
  const size=(leg,y)=>{const p=leg.geometry.attributes.position,b=[Infinity,-Infinity,Infinity,-Infinity];for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-y)<.02){b[0]=Math.min(b[0],p.getX(i));b[1]=Math.max(b[1],p.getX(i));b[2]=Math.min(b[2],p.getZ(i));b[3]=Math.max(b[3],p.getZ(i));}return (b[1]-b[0])*(b[3]-b[2]);};
  for(const leg of legs)assert.ok(size(leg,hem+.03)<size(leg,.9)*.75,`tapered ${size(leg,hem+.03)/size(leg,.9)}`);
  // Tonal stitching: a dark, neutral grey, not the light grey of the older Mango pair.
  const thread=all('fly-stitch')[0].material.color;assert.ok(thread.r<.1&&Math.abs(thread.r-thread.b)<.03,'tonal topstitching');
  disposeObject(outfit);
});
