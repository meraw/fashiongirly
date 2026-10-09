import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, EMERALD_PARKA_ID, ZIP_TRACK_DRESS_ID } from '../src/wardrobe/catalog.js';

const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const bottomOf=(root,name)=>new T.Box3().setFromObject(named(root,name)[0]).min.y/.76;

test('Emerald parka: knee length, snap placket, sherpa-lined hood down, red cords at the hood and hem, slanted flap pockets',()=>{
  assert.equal(GARMENTS[EMERALD_PARKA_ID].slot,'outerwear');
  assert.equal(cleanRecipe({outerwearId:EMERALD_PARKA_ID}).outerwearOpen,false,'starts zipped, as the user wears it');
  const outfit=makeOutfit({outerwearId:EMERALD_PARKA_ID}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['elastic-hem-band',1],['collar-lining',1],['zip-placket',1],['collar-snap',2],['toggle-cord',2],['cord-toggle',2],['drawcord',2],['cord-tip',4],
    ['pocket-welt',2],['snap-button',2],['hem-roll',1],['hem-lining',1],['placket-roll',2],['front-edge-roll',0],['hood',1],['hood-edge',1],['hood-opening',1],['hood-lining-edge',1],['jacket-sleeve',2],['elastic-cuff',2],
    ['coil-zip',0],['hood-label',0],['sleeve-badge',0],['back-label',0]])
    assert.equal(named(jacket,name).length,count,name);
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // Sherpa pile on the hood's edge and the collar lining; cream cord tips on red cords.
  for(const name of ['hood-lining-edge','collar-lining']){const m=named(jacket,name)[0].material;assert.ok(m.bumpMap,`${name} has a pile`);assert.equal(m.color.getHexString(),new T.Color('#e6dbc4').getHexString());}
  assert.equal(named(jacket,'cord-tip')[0].material.color.getHexString(),new T.Color('#ece7dc').getHexString());
  // Knee length: the hem ends at her knee, well below the skirt's and the dress's hems.
  const hem=bottomOf(jacket,'elastic-hem-band');assert.ok(hem>.62&&hem<.69,`hem at ${hem.toFixed(3)}`);
  const skirt=makeOutfit({skirt:true}),dress=makeOutfit({dressId:ZIP_TRACK_DRESS_ID});
  for(const [o,layer] of [[skirt,'layered-skirt'],[dress,'dress-body']]){const b=new T.Box3().setFromObject(o.getObjectByName(layer));assert.ok(b.min.y/.76>hem+.05,`covers the ${layer}`);}
  // Pockets slant outward toward their lower end.
  const welt=named(jacket,'pocket-welt').find(m=>new T.Box3().setFromObject(m).getCenter(new T.Vector3()).x>0),wp=welt.geometry.attributes.position;
  const pts=Array.from({length:wp.count},(_,i)=>new T.Vector3().fromBufferAttribute(wp,i)).sort((p,q)=>q.y-p.y),n=Math.floor(pts.length/4);
  const meanX=list=>list.reduce((v,p)=>v+p.x,0)/list.length;
  assert.ok(meanX(pts.slice(-n))-meanX(pts.slice(0,n))>.03,'the flap slants out toward the side');
  // Padded, not a thin shell: a matte crinkled cloth with little sheen, and a body that is not a smooth surface of revolution.
  const body=named(jacket,'jacket-body')[0];assert.ok(body.material.normalMap,'crinkled cloth');assert.ok(body.material.sheen<.2,'matte');
  const bp=body.geometry.attributes.position,ring=[];for(let i=0;i<bp.count;i++)if(Math.abs(bp.getY(i)-.8)<.01)ring.push(Math.hypot(bp.getX(i)/.45,bp.getZ(i)/.31));
  assert.ok(Math.max(...ring)-Math.min(...ring)>.02,'folds hang toward the hem');
  [outfit,skirt,dress].forEach(disposeObject);
  assert.ok(OUTFITS.some(look=>look.recipe.outerwearId===EMERALD_PARKA_ID),'has a study');
});

test('Emerald parka shown open: fronts apart to the hem, a sherpa lining inside, the placket on her left front',()=>{
  const outfit=makeOutfit({outerwearId:EMERALD_PARKA_ID,outerwearOpen:true}),jacket=outfit.getObjectByName('outerwear');
  assert.equal(jacket.userData.open,true);
  const lining=named(jacket,'jacket-lining');assert.equal(lining.length,1);assert.ok(lining[0].material.bumpMap,'sherpa lining');
  assert.equal(named(jacket,'zip-half').length,2);assert.equal(named(jacket,'front-edge-roll').length,2,'a padded roll edges each front');
  const p=new T.Vector3();let inGap=0;
  for(const name of ['jacket-body','elastic-hem-band'])for(const m of named(jacket,name)){const pos=m.geometry.attributes.position;for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);if(p.z>0&&Math.abs(p.x)<.06)inGap++;}}
  assert.equal(inGap,0,'nothing spans the open front, down to the hem');
  disposeObject(outfit);
});
