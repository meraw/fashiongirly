import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { levelCaster } from '../src/doll/level-caster.js';
// Shared by the outerwear coverage tests, which are split across files so they run in parallel.
export const outerwear=Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='outerwear');
export const tops=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='top')];
export const bottoms=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='bottom')];
// Every way each piece of outerwear is worn: closed, and open when it is designed to be, over the skirt or not.
export const wearings=outerwear.flatMap(id=>(GARMENTS[id].layering?.canOpen?[false,true]:[false]).flatMap(open=>[false,true].map(skirt=>({id,open,skirt}))));
const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
// Builds the outfit with the outerwear worn as given and asserts that every point of the chosen layers, from the
// jacket's hem to its collar, lies under it; returns how many points it checked. A point is covered when it lies inside
// the jacket's outermost surface along the ray from her centre line: the body, or a sleeve where a top wraps over her arm.
// A fitted jacket depends on what is under it, so each outfit's own jacket is indexed by height and angle around her
// centre line, and each ray only tests the triangles it can reach. Open, the front between its edges is meant to show
// what is underneath.
export const check=(id,open,skirt,recipe,layer)=>{
  const outfit=makeOutfit({...recipe,outerwearId:id,outerwearOpen:open,skirt});outfit.updateMatrixWorld(true);
  const jacket=outfit.getObjectByName('outerwear'),spec=GARMENTS[id].build.body,covering=[];jacket.traverse(o=>{if(o.userData.covering)covering.push(o);});
  assert.ok(covering.length>=5,`${id}: body, band, sleeves and cuffs cover`);
  const jacketSurface=levelCaster(covering,{axis:[0,0],faces:'both'}),origin=new T.Vector3(),dir=new T.Vector3(),axis=new T.Vector3(0,1,0),surface=new Map();
  const coverAt=(y,a)=>{const key=Math.round(y/.001)+':'+Math.round(a/(Math.PI/360));
    if(!surface.has(key))surface.set(key,jacketSurface(origin.set(0,y,0),dir.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5),true)?.distance||0);
    return surface.get(key);};
  const p=new T.Vector3();let checked=0;
  for(const child of outfit.children){if(!layer(child.name))continue;child.traverse(o=>{if(!o.geometry||!visible(o))return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(y<spec.hem+.004||y>spec.collarBase)continue;
      const radius=Math.hypot(p.x,p.z);if(radius<.01)continue;
      // Open, or (a coat with a V neckline) at the V above its top button, the front between its edges shows what is under it.
      if((open||jacket.userData.neckline)&&Math.abs(Math.atan2(p.x/1.06,p.z))<jacket.userData.opening(y)+.05)continue;
      assert.ok(coverAt(p.y,Math.atan2(p.x,p.z))>radius+.001,`${o.name} of ${JSON.stringify(recipe)} shows through ${id}${open?' (open)':''}${skirt?' over the skirt':''} at y ${y.toFixed(3)}`);checked++;}});}
  disposeObject(outfit);return checked;};
