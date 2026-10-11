import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe, OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const ID='bershka-low-rise-balloon-jeans-v1';

test('Bershka balloon jeans: low rise, balloon legs fullest at the knee, gathered at the ankle and tied in a bow outside each ankle, cream stitching',()=>{
  assert.equal(GARMENTS[ID].slot,'bottom');assert.equal(cleanRecipe({bottomId:ID}).bottomId,ID);
  assert.ok(OUTFITS.some(o=>o.recipe.bottomId===ID),'has a study');assert.ok(GARMENTS[ID].atlas,'its denim swatch');
  const outfit=makeOutfit({bottomId:ID});outfit.updateMatrixWorld(true);const jeans=outfit.getObjectByName('trousers');
  const all=name=>{const found=[];jeans.traverse(o=>{if(o.name===name)found.push(o);});return found;};
  for(const name of ['shank-button','coin-pocket-stitch','hem-stitch','rivet','back-yoke'])assert.ok(all(name).length,name);
  // A bow on each ankle: a knot, two loops and two hanging ends with their tips.
  for(const [name,count] of [['ankle-tie-knot',2],['ankle-tie-loop',4],['ankle-tie-end',4],['ankle-tie-tip',4]])assert.equal(all(name).length,count,name);
  // Low rise: the waistband sits on her hips, below the high-rise pairs'.
  const band=new T.Box3().setFromObject(all('jeans-waistband')[0]);assert.ok(band.max.y/.76<1.23,`waistband top ${(band.max.y/.76).toFixed(3)}`);
  // Balloon legs: each leg is far wider round the knee than at the gathered ankle, which ends at her ankle.
  const legs=all('balloon-leg'),box=new T.Box3();legs.forEach(l=>box.expandByObject(l));const hem=box.min.y/.76;
  assert.ok(hem>.18&&hem<.26,`hem at ${hem.toFixed(3)}`);
  const size=(leg,y)=>{const p=leg.geometry.attributes.position;let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
    for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-y)<.015){x0=Math.min(x0,p.getX(i));x1=Math.max(x1,p.getX(i));z0=Math.min(z0,p.getZ(i));z1=Math.max(z1,p.getZ(i));}return (x1-x0)*(z1-z0);};
  for(const leg of legs){const knee=size(leg,.55),ankle=size(leg,.23),thigh=size(leg,.95);
    assert.ok(ankle<knee*.55,`gathered at the ankle (${(ankle/knee).toFixed(2)} of the knee)`);assert.ok(knee>thigh,`fullest at the knee, not the thigh (${(knee/thigh).toFixed(2)})`);}
  // The bows sit at the gathered channel on the outside of each ankle.
  for(const knot of all('ankle-tie-knot')){const p=knot.position;assert.ok(p.y>hem&&p.y<hem+.05,`at the channel (${p.y.toFixed(3)})`);assert.ok(Math.abs(p.x)>.2,'on the outside of the ankle');}
  // Cream contrast topstitching on the dark rinse.
  const thread=all('fly-stitch')[0].material.color;assert.ok(thread.r>.6&&thread.g>.55,'cream topstitching');
  disposeObject(outfit);
});
