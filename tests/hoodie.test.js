import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, ADIDAS_CROPPED_HOODIE_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
const box=o=>{const b=new T.Box3();o.traverse(m=>{if(m.isMesh)b.expandByObject(m);});return b;};

test('cropped hoodie: black fleece, mint-tipped rib hem and cuffs, a hood worn down with a striped lining, braided drawcords, a logo and patch on her left chest',()=>{
  const g=GARMENTS[ADIDAS_CROPPED_HOODIE_ID],spec=g.build;assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===ADIDAS_CROPPED_HOODIE_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:ADIDAS_CROPPED_HOODIE_ID,knit:false,shirt:false}),top=outfit.getObjectByName(ADIDAS_CROPPED_HOODIE_ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['hoodie-body',1],['ribbed-hem-band',1],['hem-tipping',1],['knit-jumper-sleeve',2],['ribbed-cuff',2],['cuff-tipping',2],['hood',1],['hood-lining',1],['drawcord',2],['cord-knot',2],['embroidered-logo',1],['woven-patch',1],['crew-neckband',1]])
    assert.equal(named(top,name).length,count,name);
  // Black fleece; the tipping and the hood's lining in pale mint.
  const c=named(top,'hoodie-body')[0].material.color;assert.ok(c.r<.05&&c.g<.05&&c.b<.05,'black');
  for(const name of ['hem-tipping','cuff-tipping']){const t=named(top,name)[0].material.color;assert.ok(t.g>t.r&&t.g>.5,`${name} pale mint`);}
  // Cropped: the tipping is the lowest edge, at the hem; it lies below the rib band.
  const hem=box(named(top,'hem-tipping')[0]),band=box(named(top,'ribbed-hem-band')[0]);
  assert.ok(Math.abs(hem.min.y/.76-spec.body.hem)<.005&&band.min.y>hem.min.y-.001,'tipping at the hem');
  for(const tip of named(top,'cuff-tipping')){const cuff=named(tip.parent,'ribbed-cuff')[0];let lo=Infinity,clo=Infinity;
    for(const [m,set] of [[tip,v=>lo=Math.min(lo,v)],[cuff,v=>clo=Math.min(clo,v)]]){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)set(p.getY(i));}
    assert.ok(lo<clo,'the tipping finishes the cuff');}
  // Worn on its own, the hood lies on her back and the plain neckband is put away.
  const hood=named(top,'hood-down')[0];assert.ok(visible(hood)&&!visible(named(top,'jacket-neckband')[0]));
  assert.ok(box(named(hood,'hood')[0]).max.z<0,'the hood lies on her back');
  // The lining is striped: its texture has pale mint and dark stripes.
  const {data}=named(top,'hood-lining')[0].material.map.image;let dark=0,pale=0;for(let i=0;i<data.length;i+=4){const m=(data[i]+data[i+1]+data[i+2])/3;if(m<130)dark++;else if(data[i+1]>data[i])pale++;}
  assert.ok(dark>0&&pale>dark*5,'pale mint with fine stripes');
  // The cords hang from the neck down her chest, either side of the centre, ending in knots in front of her.
  for(const knot of named(top,'cord-knot')){const p=knot.getWorldPosition(new T.Vector3());assert.ok(Math.abs(p.y/.76-spec.cords.knot)<.02&&p.z>.15&&Math.abs(p.x)<.08,'knot on her chest');}
  // The logo and patch on her left chest (+x), the patch below the logo.
  const logo=box(named(top,'embroidered-logo')[0]),patch=box(named(top,'woven-patch')[0]);
  assert.ok(logo.min.x>0&&patch.min.x>0&&patch.max.y<logo.min.y+.005,'logo above the patch on her left chest');
  disposeObject(outfit);
});

test('cropped hoodie under every jacket puts its hood and cords away and wears a narrow neckband inside the jacket',()=>{
  for(const id of Object.keys(GARMENTS).filter(k=>GARMENTS[k].slot==='outerwear'))for(const open of [false,true]){
    const outfit=makeOutfit({topId:ADIDAS_CROPPED_HOODIE_ID,knit:false,shirt:false,outerwearId:id,outerwearOpen:open}),top=outfit.getObjectByName(ADIDAS_CROPPED_HOODIE_ID);outfit.updateMatrixWorld(true);
    assert.ok(!visible(named(top,'hood-down')[0]),`${id}: the hood is put away`);const neck=named(top,'jacket-neckband')[0];assert.ok(visible(neck),`${id}: the neckband is worn`);
    const b=box(neck);assert.ok(b.max.x/1.06<.125&&b.max.z<.115,`${id}: neckband ${(b.max.x/1.06).toFixed(3)} by ${b.max.z.toFixed(3)}`);
    disposeObject(outfit);
  }
});
