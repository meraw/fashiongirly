import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, WHITE_LINEN_SHIRT_ID, LAPIS_LINEN_SHIRT_ID, LEVIS_PLAID_FLANNEL_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const wear=(topId,extra={})=>{const outfit=makeOutfit({topId,knit:false,shirt:false,...extra});outfit.updateMatrixWorld(true);return outfit;};
const median=(data,k)=>{const v=[];for(let i=k;i<data.length;i+=4)v.push(data[i]);v.sort((a,b)=>a-b);return v[v.length>>1];};

test('the linen shirts: buttoned to the top, with a chest pocket, a back yoke, buttoned cuffs and a topstitched collar',()=>{
  for(const id of [WHITE_LINEN_SHIRT_ID,LAPIS_LINEN_SHIRT_ID]){
    assert.equal(GARMENTS[id].slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===id),'a study preset wears it');
    const top=wear(id).getObjectByName(id);
    for(const [part,count] of [['shirt-button',8],['chest-pocket',1],['pocket-stitch',2],['yoke-seam',1],['shirt-cuff',2],['cuff-button',2],['shirt-collar-topstitch',1]])
      assert.equal(named(top,part).length,count,`${id}: ${part}`);
    // The pocket's faces look out from her, as the body's do, so it is lit as the body is.
    const pocket=named(top,'chest-pocket')[0],n=pocket.geometry.attributes.normal,p=pocket.geometry.attributes.position;let out=0;
    for(let i=0;i<n.count;i++)out+=n.getX(i)*p.getX(i)+n.getZ(i)*p.getZ(i);assert.ok(out>0,`${id}: pocket faces out`);
  }
});

test('the linen shirts: white and lapis blue linen, slubby, with the slubs raised in the bump',()=>{
  const body=id=>wear(id).getObjectByName('mesh-shirt-body').material;
  const white=body(WHITE_LINEN_SHIRT_ID),lapis=body(LAPIS_LINEN_SHIRT_ID);
  const [wr,wg,wb]=[0,1,2].map(k=>median(white.map.image.data,k)),[lr,lg,lb]=[0,1,2].map(k=>median(lapis.map.image.data,k));
  assert.ok(Math.min(wr,wg,wb)>210&&Math.max(wr,wg,wb)-Math.min(wr,wg,wb)<16,'white, barely warm');
  assert.ok(lb>lg+40&&lg>lr+20&&lb<160,'a deep lapis blue');
  for(const m of [white,lapis]){
    assert.equal(m.bumpMap.image.width,m.map.image.width,'the bump lies on the same tile as the colour');
    const d=m.bumpMap.image.data;let high=0;for(let i=0;i<d.length;i+=4)if(d[i]>170)high++;
    assert.ok(high>d.length/4*.01,'slubs stand proud in the bump');
  }
  assert.notDeepEqual(white.map.image.data.slice(0,4000),lapis.map.image.data.slice(0,4000),'each colour is woven on its own');
});

test('the linen shirts: soft creases below the shoulders, none at the collar or the hem',()=>{
  // The plaid flannel has the same rows and shirt tail without creases, so the difference is the creases alone.
  const at=id=>wear(id).getObjectByName('mesh-shirt-body').geometry.attributes.position;
  const plain=at(LEVIS_PLAID_FLANNEL_ID);
  for(const id of [WHITE_LINEN_SHIRT_ID,LAPIS_LINEN_SHIRT_ID]){const p=at(id);assert.equal(p.count,plain.count);
    let waist=0,collar=0,hem=0;
    for(let i=0;i<p.count;i++){const d=Math.hypot(p.getX(i)-plain.getX(i),p.getZ(i)-plain.getZ(i)),y=plain.getY(i);
      if(y>1.3&&y<1.5)waist=Math.max(waist,d);if(y>1.8)collar=Math.max(collar,d);if(y<1.14)hem=Math.max(hem,d);}
    assert.ok(waist>.002&&waist<.006,`${id}: creased at the waist (${waist})`);assert.ok(collar<1e-9&&hem<1e-9,`${id}: smooth at the collar and hem`);
  }
});

test('the linen shirts: over the skirt they are tucked in, with no button below the tucked hem',()=>{
  for(const id of [WHITE_LINEN_SHIRT_ID,LAPIS_LINEN_SHIRT_ID]){
    const outfit=wear(id,{skirt:true}),hem=new T.Box3().setFromObject(outfit.getObjectByName('mesh-shirt-body')).min.y;
    assert.ok(hem/.76>1.25,'tucked into the skirt');
    for(const b of named(outfit.getObjectByName(id),'shirt-button'))assert.ok(b.getWorldPosition(new T.Vector3()).y>hem,'no button below the tucked hem');
  }
});
