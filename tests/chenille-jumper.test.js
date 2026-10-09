import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, PB_CHENILLE_ID, ADIDAS_CROPPED_HOODIE_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};

test('chenille jumper: boxy cropped chenille with a rib hem band, long ribbed cuffs and a high stand-up collar that shows under her chin',()=>{
  const g=GARMENTS[PB_CHENILLE_ID],spec=g.build;assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===PB_CHENILLE_ID),'a study preset wears it');
  const doll=makeDoll(),outfit=makeOutfit({topId:PB_CHENILLE_ID,knit:false,shirt:false}),top=outfit.getObjectByName(PB_CHENILLE_ID);
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['chenille-body',1],['ribbed-hem-band',1],['knit-jumper-sleeve',2],['ribbed-cuff',2],['stand-collar',1],['narrow-collar',1]])
    assert.equal(named(top,name).length,count,name);
  // Worn on its own, the high collar shows and the narrow one is put away.
  const wide=named(top,'stand-collar')[0],narrow=named(top,'narrow-collar')[0];assert.ok(visible(wide)&&!visible(narrow));
  // The collar rises well above the other tops' necklines (1.905) and stands clear of her head all the way round, so
  // it neither cuts into her face nor hides inside it. At its top it stands in front of her chin.
  const head=named(doll,'felt-head')[0],p=new T.Vector3(),q=new T.Vector3();let highest=-Infinity,front=-Infinity;
  for(const mesh of named(wide,'ribbed-stand-collar')){const pos=mesh.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld);highest=Math.max(highest,p.y/.76);
      q.copy(p);head.worldToLocal(q);assert.ok(q.length()>1.005,`collar inside her head at y ${(p.y/.76).toFixed(3)}`);
      if(p.y/.76>spec.collar.rows[0][0]-.01)front=Math.max(front,p.z);}}
  assert.ok(highest>1.935,`collar top at ${highest.toFixed(3)}`);
  // Her head, at the collar's top: the front of the collar is further forward than her chin there.
  let chin=-Infinity;const hp=head.geometry.attributes.position;
  for(let i=0;i<hp.count;i++){p.fromBufferAttribute(hp,i).applyMatrix4(head.matrixWorld);if(Math.abs(p.y/.76-spec.collar.rows[0][0])<.01)chin=Math.max(chin,p.z);}
  assert.ok(front>chin,`collar front ${front.toFixed(3)} against her chin ${chin.toFixed(3)}`);
  // Chenille: cool grey, drawn as rows of loops (a height map for the pile), on the body and sleeves.
  const body=named(top,'chenille-body')[0];assert.ok(body.material.bumpMap&&body.material.sheen>0);
  const {data,width,height}=body.material.map.image;let r=0,b=0;for(let i=0;i<width*height*4;i+=4){r+=data[i];b+=data[i+2];}assert.ok(b>r,'cool grey');
  // Cropped: the rib band ends at her waist, above the other jumpers' hems.
  const band=new T.Box3().setFromObject(named(top,'ribbed-hem-band')[0]);assert.ok(Math.abs(band.min.y/.76-spec.body.hem)<.005);
  [doll,outfit].forEach(disposeObject);
});

test('chenille jumper under every jacket wears its narrow collar, which stays inside the jacket; no other top swaps collars',()=>{
  for(const id of Object.keys(GARMENTS).filter(k=>GARMENTS[k].slot==='outerwear'))for(const open of [false,true]){
    const outfit=makeOutfit({topId:PB_CHENILLE_ID,knit:false,shirt:false,outerwearId:id,outerwearOpen:open}),top=outfit.getObjectByName(PB_CHENILLE_ID);
    assert.ok(!visible(named(top,'stand-collar')[0]),`${id}: the high collar is put away`);assert.ok(visible(named(top,'narrow-collar')[0]),`${id}: the narrow collar is worn`);
    // As narrow as the other tops' high necks (the half-zip dress's stand collar is .118 by .111).
    const box=new T.Box3();outfit.updateMatrixWorld(true);named(top,'narrow-collar')[0].traverse(o=>{if(o.isMesh)box.expandByObject(o);});
    assert.ok(box.max.x/1.06<.125&&box.max.z<.115,`${id}: narrow collar ${(box.max.x/1.06).toFixed(3)} by ${box.max.z.toFixed(3)}`);
    disposeObject(outfit);
  }
  // The cropped hoodie also swaps its hood for a narrow neckband under a jacket; its own test checks that.
  for(const topId of Object.keys(GARMENTS).filter(k=>GARMENTS[k].slot==='top'&&k!==PB_CHENILLE_ID&&k!==ADIDAS_CROPPED_HOODIE_ID)){
    const outfit=makeOutfit({topId});let swaps=0;outfit.traverse(o=>{if(typeof o.userData.underJacket==='boolean')swaps++;});assert.equal(swaps,0,topId);disposeObject(outfit);
  }
});
