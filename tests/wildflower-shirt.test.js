import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { TOP_TEMPLATES } from '../src/doll/top-templates.js';
const ID='levis-wildflower-print-shirt-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test("Levi's wildflower shirt: a watercolour meadow print on peach cream, a long point collar, buttoned to the top, long cuffs, a curved hem",()=>{
  const G=GARMENTS[ID],B=G.build;
  assert.equal(G.slot,'top');assert.equal(G.status,'user-approved');assert.ok(TOP_TEMPLATES['wildflower-shirt'],'its template is registered');
  const recipe=cleanRecipe({topId:ID,knit:true,shirt:true});assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:ID}),top=outfit.getObjectByName(ID);outfit.updateMatrixWorld(true);
  assert.ok(top,'built by the wildflower-shirt template');
  for(const [name,count] of [['mesh-shirt-body',1],['mesh-shirt-sleeve',2],['shirt-cuff',2]])assert.equal(named(top,name).length,count,name);
  // Buttoned to the top, as the user wears their shirts: every button, the highest just under the collar.
  const buttons=named(top,'shirt-button');assert.equal(buttons.length,B.buttons.length);
  assert.ok(Math.max(...buttons.map(b=>b.getWorldPosition(new T.Vector3()).y/.76))>1.84,'the top button is done up');
  // The print: mostly the peach-cream ground, with plenty of orange, red, lilac and green among it.
  const {data,width:w,height:h}=named(top,'mesh-shirt-body')[0].material.map.image;let ground=0,warm=0,lilac=0,green=0,n=0;
  for(let i=0;i<w*h;i+=7){const r=data[i*4],g=data[i*4+1],b=data[i*4+2];n++;
    if(Math.abs(r-236)<14&&Math.abs(g-213)<14&&Math.abs(b-196)<14)ground++;else if(r>180&&g<175&&b<140)warm++;else if(b>g&&b>150)lilac++;else if(g>r&&g>b)green++;}
  assert.ok(ground/n>.3&&ground/n<.8,`peach-cream ground (${(ground/n).toFixed(2)})`);
  assert.ok(warm/n>.1,`orange and red flowers (${(warm/n).toFixed(2)})`);assert.ok(lilac/n>.02,`lilac leaves (${(lilac/n).toFixed(3)})`);assert.ok(green/n>.005,`green sprigs (${(green/n).toFixed(3)})`);
  // A curved shirt-tail hem: lower at the centre front than at the sides.
  const p=named(top,'mesh-shirt-body')[0].geometry.attributes.position;let front=Infinity,side=Infinity;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i);if(z>.15&&Math.abs(x)<.05)front=Math.min(front,y);if(Math.abs(z)<.05&&Math.abs(x)>.2)side=Math.min(side,y);}
  assert.ok(side-front>.04,`shirt tail: front ${front.toFixed(3)}, side ${side.toFixed(3)}`);
  disposeObject(outfit);
  // Over the skirt it is tucked in, so the bow shows.
  const skirt=makeOutfit({topId:ID,skirt:true});const low=new T.Box3().setFromObject(named(skirt.getObjectByName(ID),'mesh-shirt-body')[0]).min.y/.76;
  assert.ok(low>1.2,`tucked into the skirt (${low.toFixed(3)})`);disposeObject(skirt);
  assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'has a study');
});
