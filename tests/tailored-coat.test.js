import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, ONLY_TAUPE_COAT_ID } from '../src/wardrobe/catalog.js';

const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('ONLY taupe coat: notched lapels over a V, one button at the break, welt pockets, raw edges, above the knee',()=>{
  assert.equal(GARMENTS[ONLY_TAUPE_COAT_ID].slot,'outerwear');
  assert.equal(cleanRecipe({outerwearId:ONLY_TAUPE_COAT_ID}).outerwearOpen,false,'starts buttoned, as the user wears it');
  const outfit=makeOutfit({outerwearId:ONLY_TAUPE_COAT_ID}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['lapel',2],['lapel-edge',4],['coat-collar',1],['coat-button',1],['buttonhole',1],['pocket-welt',2],['back-seam',1],['jacket-sleeve',2],['sleeve-hem',2],
    ['coil-zip',0],['zip-placket',0],['hood',0],['elastic-hem-band',0]])
    assert.equal(named(jacket,name).length,count,name);
  assert.ok(named(jacket,'raw-edge').length>=5,'raw edges at the hem, both fronts and both sleeve ends');
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // One button, at the lapel break; the fronts meet below it and part above it in a V.
  const B=GARMENTS[ONLY_TAUPE_COAT_ID].build,button=named(jacket,'coat-button')[0].getWorldPosition(new T.Vector3());
  assert.ok(Math.abs(button.y/.76-B.lapel.break)<.02&&Math.abs(button.x)<.03,'the button sits at the break, at centre front');
  assert.equal(jacket.userData.opening(1.2),0,'closed below the button');assert.ok(jacket.userData.opening(1.8)>.15,'a V above it');
  const body=named(jacket,'jacket-body')[0].geometry.attributes.position,p=new T.Vector3();let inV=0,below=0;
  for(let i=0;i<body.count;i++){p.fromBufferAttribute(body,i);if(p.z>0&&Math.abs(p.x)<.03){if(p.y>1.7)inV++;else if(p.y<1.3&&p.y>.8)below++;}}
  assert.equal(inV,0,'nothing spans the V');assert.ok(below>0,'the fronts meet below the button');
  // Above the knee, below the skirt's and the dress's hems; a felted melange, matte.
  const hem=new T.Box3().setFromObject(named(jacket,'jacket-body')[0]).min.y/.76;assert.ok(hem>.7&&hem<.78,`hem at ${hem.toFixed(3)}`);
  const m=named(jacket,'jacket-body')[0].material;assert.ok(m.map&&m.bumpMap&&m.roughness>.9,'melange wool');
  disposeObject(outfit);
  assert.ok(OUTFITS.some(look=>look.recipe.outerwearId===ONLY_TAUPE_COAT_ID),'has a study');
});

test('ONLY taupe coat shown open: the fronts hang apart to the hem, the button on her left front',()=>{
  const outfit=makeOutfit({outerwearId:ONLY_TAUPE_COAT_ID,outerwearOpen:true}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  assert.equal(jacket.userData.open,true);assert.ok(jacket.userData.opening(1.2)>.2);
  const body=named(jacket,'jacket-body')[0].geometry.attributes.position,p=new T.Vector3();let inGap=0;
  for(let i=0;i<body.count;i++){p.fromBufferAttribute(body,i);if(p.z>0&&Math.abs(p.x)<.06)inGap++;}
  assert.equal(inGap,0,'nothing spans the open front');
  assert.ok(named(jacket,'coat-button')[0].getWorldPosition(new T.Vector3()).x>.05,'the button stays on her left front');
  disposeObject(outfit);
});
