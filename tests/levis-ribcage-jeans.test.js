import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const ID='levis-ribcage-straight-ankle-jeans-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test("Levi's Ribcage jeans: ultra high rise, straight legs to the ankle, dark indigo denim from the flat lay, gold stitching, red tab and leather patch",async()=>{
  const G=GARMENTS[ID],B=G.build;
  assert.equal(G.slot,'bottom');assert.equal(G.status,'user-approved');assert.equal(cleanRecipe({bottomId:ID}).bottomId,ID);
  // Its denim swatch is a module the view loads, a small WebP taken from the flat lay.
  const [path,name]=G.atlas,swatch=(await import(new URL(path,new URL('../src/doll/view.js',import.meta.url))))[name];
  assert.ok(swatch.startsWith('data:image/webp;base64,')&&swatch.length<40000,'a small WebP swatch');
  const outfit=makeOutfit({bottomId:ID}),jeans=outfit.getObjectByName('trousers');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jeans-leg',2],['arcuate-stitch',4],['leather-patch',1]])assert.equal(named(jeans,name).length,count,name);
  // Ultra high rise: the waistband at her natural waist, as on the Tommy mom jeans.
  assert.ok(B.waistband.y>1.3,'ultra high rise');
  // Straight legs: the hem is nearly as wide as the knee, and ends at the ankle.
  const leg=named(jeans,'jeans-leg')[0],box=new T.Box3().setFromObject(leg);
  const width=y=>{const p=leg.geometry.attributes.position,v=new T.Vector3();let lo=Infinity,hi=-Infinity;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);if(Math.abs(v.y/.76-y)<.02){lo=Math.min(lo,v.x);hi=Math.max(hi,v.x);}}return hi-lo;};
  assert.ok(width(.3)>width(.6)*.9,`straight: hem ${width(.3).toFixed(3)} against knee ${width(.6).toFixed(3)}`);
  assert.ok(box.min.y/.76>.2&&box.min.y/.76<.3,`ankle length (${(box.min.y/.76).toFixed(3)})`);
  // Gold arcuate stitching, the red tab on her right back pocket, a tan leather patch on her right back waistband.
  for(const s of named(jeans,'arcuate-stitch'))assert.equal('#'+s.material.color.getHexString(),B.backPocket.arcuateColour);
  const patch=named(jeans,'leather-patch')[0];assert.ok(patch.position.x<0&&patch.position.z<0,'patch on her right back');
  disposeObject(outfit);
  assert.ok(OUTFITS.some(look=>look.recipe.bottomId===ID),'has a study');
});
