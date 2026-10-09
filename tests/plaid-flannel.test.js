import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, LEVIS_PLAID_FLANNEL_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const box=o=>new T.Box3().setFromObject(o);

test("Levi's plaid flannel: a woven plaid, buttoned to the top with eight pale buttons, a chest pocket, a back yoke, buttoned cuffs and a shirt tail",()=>{
  const g=GARMENTS[LEVIS_PLAID_FLANNEL_ID];assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===LEVIS_PLAID_FLANNEL_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:LEVIS_PLAID_FLANNEL_ID,knit:false,shirt:false}),top=outfit.getObjectByName(LEVIS_PLAID_FLANNEL_ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['mesh-shirt-body',1],['mesh-shirt-sleeve',2],['shirt-cuff',2],['cuff-button',2],['chest-pocket',1],['pocket-stitch',2],['yoke-seam',1],['shirt-button',8],['shirt-collar-fall',1]])
    assert.equal(named(top,name).length,count,name);
  // Pale grey buttons from just under the collar to near the hem: buttoned to the top.
  const buttons=named(top,'shirt-button'),ys=buttons.map(b=>b.getWorldPosition(new T.Vector3()).y/.76),c=buttons[0].material.color;
  assert.ok(c.r>.5&&Math.abs(c.r-c.b)<.1,'pale grey buttons');assert.ok(Math.max(...ys)>1.85&&Math.min(...ys)<1.2,'buttoned from the collar to the hem');
  // The plaid: mostly the dark ground, with grey, white and coral red stripes woven across it. Counted thread by thread,
  // where a stripe crosses the ground half its threads are ground, so the ground's share is higher than seen (about 0.55
  // in renders and in the flat lay).
  const body=named(top,'mesh-shirt-body')[0],{data}=body.material.map.image;let ground=0,white=0,red=0;
  for(let i=0;i<data.length;i+=4){const [r,gg,b]=[data[i],data[i+1],data[i+2]];if(r<30&&gg<30&&b<40)ground++;else if(r>180&&gg>180)white++;else if(r>140&&gg<80)red++;}
  const n=data.length/4;assert.ok(ground/n>.65&&ground/n<.9,`ground ${(ground/n).toFixed(2)}`);assert.ok(white/n>.02,'white stripes');assert.ok(red/n>.01,'red stripes');
  // The pocket sits on her left chest, lying on the body, in the same print.
  const pocket=named(top,'chest-pocket')[0],pb=box(pocket);
  assert.ok(pb.min.x>0&&pb.min.y/.76>1.45&&pb.max.y/.76<1.65,'left chest');assert.equal(pocket.material.map.image.data,body.material.map.image.data,'the same print');
  // The yoke seam runs across her back.
  assert.ok(box(named(top,'yoke-seam')[0]).max.z<0,'on the back');
  // A shirt tail: the hem is lowest at the centre front and back and higher at the sides; over the skirt it is tucked in.
  const p=body.geometry.attributes.position;let front=Infinity,side=Infinity;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i);if(Math.abs(x)<.02&&z>0)front=Math.min(front,y);if(Math.abs(z)<.03)side=Math.min(side,y);}
  assert.ok(front<side-.03,`shirt tail (${front.toFixed(3)} at the front, ${side.toFixed(3)} at the side)`);
  const tucked=makeOutfit({topId:LEVIS_PLAID_FLANNEL_ID,knit:false,shirt:false,skirt:true});tucked.updateMatrixWorld(true);const tb=box(tucked.getObjectByName('mesh-shirt-body'));assert.ok(tb.min.y/.76>1.25,'tucked into the skirt');
  // Tucked in, the buttons below its hem are inside the skirt, not floating on it.
  for(const b of named(tucked.getObjectByName(LEVIS_PLAID_FLANNEL_ID),'shirt-button'))assert.ok(b.getWorldPosition(new T.Vector3()).y/.76>tb.min.y/.76,'no button below the tucked hem');
  // The other shirts gain no pocket or yoke.
  for(const other of ['motel-tie-dye-mesh-shirt-v1','mango-halftone-dot-shirt-v1']){const o=makeOutfit({topId:other});
    for(const name of ['chest-pocket','yoke-seam'])assert.equal(o.getObjectByName(name),undefined,`${other}: ${name}`);disposeObject(o);}
  [outfit,tucked].forEach(disposeObject);
});
