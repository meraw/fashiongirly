import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const ID='levis-lilac-gingham-shirt-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const wear=(extra={})=>{const outfit=makeOutfit({topId:ID,...extra});outfit.updateMatrixWorld(true);return outfit;};

test("Levi's lilac gingham shirt: buttoned to the top, a back yoke with a box pleat, a tonal batwing, buttoned cuffs and a shirt tail",()=>{
  assert.equal(GARMENTS[ID].slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'a study preset wears it');
  const outfit=wear(),top=outfit.getObjectByName(ID);
  for(const [part,count] of [['shirt-button',8],['yoke-seam',1],['back-pleat',2],['embroidered-logo',1],['shirt-cuff',2],['cuff-button',2],['shirt-collar-topstitch',1]])assert.equal(named(top,part).length,count,part);
  assert.equal(named(top,'chest-pocket').length,0,'no pocket');
  // The batwing on her left chest, facing out from her.
  const logo=named(top,'embroidered-logo')[0],c=new T.Box3().setFromObject(logo).getCenter(new T.Vector3()),n=logo.geometry.attributes.normal;
  assert.ok(c.x>.08&&c.z>0&&c.y/.76>1.68,'on her left chest');assert.ok(n.getZ(n.count>>1)>0,'facing out');
  // The pleat lies at the centre back, below the yoke seam.
  for(const p of named(top,'back-pleat')){const b=new T.Box3().setFromObject(p);assert.ok(b.max.z<0&&Math.abs(b.min.x)<.03&&b.min.y/.76>1.54,'centre back');}
  disposeObject(outfit);
});

test("Levi's lilac gingham shirt: a woven gingham, white squares crossed by purple bars with pink edges",()=>{
  const outfit=wear(),{data,width,height}=named(outfit,'mesh-shirt-body')[0].material.map.image;
  let white=0,purple=0,pink=0;for(let i=0;i<width*height;i++){const [r,g,b]=[data[i*4],data[i*4+1],data[i*4+2]];
    if(r>200&&g>200&&b>200)white++;else if(b>r&&r>g+30&&g<120)purple++;else if(r>180&&g<170)pink++;}
  const n=width*height;assert.ok(white/n>.3&&white/n<.6,`white squares (${(white/n).toFixed(2)})`);assert.ok(purple/n>.1,'purple bars');assert.ok(pink/n>.03,'pink edges');
  disposeObject(outfit);
});

test("Levi's lilac gingham shirt: over the skirt it is tucked in, with no button below the tucked hem",()=>{
  const outfit=wear({skirt:true}),hem=new T.Box3().setFromObject(outfit.getObjectByName('mesh-shirt-body')).min.y;
  assert.ok(hem/.76>1.25,'tucked into the skirt');
  for(const b of named(outfit.getObjectByName(ID),'shirt-button'))assert.ok(b.getWorldPosition(new T.Vector3()).y>hem);
  disposeObject(outfit);
});
