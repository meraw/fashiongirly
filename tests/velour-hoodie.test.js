import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, canTuck } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { TOP_TEMPLATES } from '../src/doll/top-templates.js';
const ID='champion-purple-tie-dye-velour-hoodie-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
const box=o=>{const b=new T.Box3();o.traverse(m=>{if(m.isMesh)b.expandByObject(m);});return b;};

test('velour hoodie: tie-dyed velour to the hip, a rib band, long cuffs, the hood down, knotted cords, a sleeve logo and a chest mark',()=>{
  const g=GARMENTS[ID],spec=g.build;assert.equal(g.slot,'top');assert.ok(TOP_TEMPLATES[spec.template]);
  assert.ok(g.layering.coversWaistband);assert.equal(canTuck(ID),false,'worn loose');
  assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'a study preset wears it');
  const outfit=makeOutfit({topId:ID}),top=outfit.getObjectByName(ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['hoodie-body',1],['ribbed-hem-band',1],['knit-jumper-sleeve',2],['ribbed-cuff',2],['hood',1],['hood-lining',1],['drawcord',2],['cord-knot',2],['logo-patch',1],['embroidered-mark',1],['crew-neckband',1]])
    assert.equal(named(top,name).length,count,name);
  // To the hip: the rib band ends at 1.1, below every waistband.
  assert.ok(Math.abs(box(named(top,'ribbed-hem-band')[0]).min.y/.76-spec.body.hem)<.005,'hem at the hip');
  // The dye: the chest band is far brighter than the dark ground above it, and the folds break it with dark lines.
  const {data,width,height}=named(top,'hoodie-body')[0].material.map.image,low=spec.body.hem+spec.body.band,high=spec.body.rows[0][0];
  const row=y=>{const j=Math.round((y-low)/(high-low)*(height-1)),out=[];for(let x=0;x<width;x++){const i=(j*width+x)*4;out.push((data[i]+data[i+1]+data[i+2])/3);}return out;};
  const mean=a=>a.reduce((s,v)=>s+v,0)/a.length,band=row(spec.dye.body[1][0]),ground=row(1.72);
  assert.ok(mean(band)>mean(ground)*1.8,`band ${mean(band).toFixed(0)} over ground ${mean(ground).toFixed(0)}`);
  assert.ok(Math.min(...band)<mean(band)*.55,'dark fold lines across the band');
  // Violet, not grey: the band's red and blue both well above its green.
  const j=Math.round((spec.dye.body[1][0]-low)/(high-low)*(height-1));let r=0,gg=0,b=0;for(let x=0;x<width;x++){const i=(j*width+x)*4;r+=data[i];gg+=data[i+1];b+=data[i+2];}
  assert.ok(b>gg*1.6&&r>gg*1.2,'violet dye');
  // Worn on its own, the hood lies on her back and the plain neckband is put away; the cords hang down her chest.
  assert.ok(visible(named(top,'hood-down')[0])&&!visible(named(top,'jacket-neckband')[0]));
  assert.ok(box(named(top,'hood')[0]).max.z<0,'the hood on her back');
  for(const knot of named(top,'cord-knot')){const p=knot.getWorldPosition(new T.Vector3());assert.ok(p.z>.15&&Math.abs(p.x)<.06&&p.y/.76>1.66,'cord knot on her chest');}
  // The logo on her left sleeve (+x), just above the cuff; the tonal mark on her left chest.
  const logo=named(top,'logo-patch')[0];assert.ok(logo.parent.position.x>0,'on her left sleeve');
  const cuffTop=Math.max(...[...Array(named(top,'ribbed-cuff')[1].geometry.attributes.position.count).keys()].map(i=>named(top,'ribbed-cuff')[1].geometry.attributes.position.getY(i)));
  const lp=logo.geometry.attributes.position,ly=[...Array(lp.count).keys()].map(i=>lp.getY(i));
  assert.ok(Math.min(...ly)>cuffTop-.01&&Math.max(...ly)<cuffTop+.08,'just above the cuff');
  const mark=box(named(top,'embroidered-mark')[0]).getCenter(new T.Vector3());assert.ok(mark.x>0&&mark.z>.15,'on her left chest');
  disposeObject(outfit);
});

test('velour hoodie under every jacket puts its hood and cords away, and over the skirt its band sits out further',()=>{
  for(const id of Object.keys(GARMENTS).filter(k=>GARMENTS[k].slot==='outerwear')){
    const outfit=makeOutfit({topId:ID,outerwearId:id}),top=outfit.getObjectByName(ID);
    assert.ok(!visible(named(top,'hood-down')[0]),`${id}: the hood is put away`);assert.ok(visible(named(top,'jacket-neckband')[0]),`${id}: the neckband is worn`);
    disposeObject(outfit);
  }
  const width=skirt=>{const outfit=makeOutfit({topId:ID,skirt}),b=box(named(outfit.getObjectByName(ID),'ribbed-hem-band')[0]);disposeObject(outfit);return b.max.z;};
  assert.ok(width(true)>width(false)+.01,'wider over the skirt');
});
