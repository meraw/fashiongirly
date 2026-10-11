import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { TOP_TEMPLATES } from '../src/doll/top-templates.js';
const ID='black-yoke-henley-blouse-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const box=o=>new T.Box3().setFromObject(o);

test('black yoke blouse: collarless, gathered below a yoke, a short buttoned placket, puffed three-quarter sleeves into bands',()=>{
  const g=GARMENTS[ID],spec=g.build;assert.equal(g.slot,'top');assert.ok(TOP_TEMPLATES[spec.template]);assert.ok(g.layering.coversWaistband&&g.layering.tucksIntoSkirt);
  assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'a study preset wears it');
  const outfit=makeOutfit({topId:ID}),top=outfit.getObjectByName(ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['blouse-body',1],['yoke-seam',1],['bound-neckline',1],['blouse-placket',1],['blouse-button',7],['mesh-shirt-sleeve',2],['sleeve-band',2],['hem-stitch',1]])
    assert.equal(named(top,name).length,count,name);
  for(const name of ['shirt-collar-fall','shirt-collar-stand'])assert.equal(named(top,name).length,0,`no ${name}`);
  // Black.
  const c=named(top,'blouse-body')[0].material.color;assert.ok(c.r<.03&&c.g<.03&&c.b<.03,'black');
  // The placket runs from the neckline to below the yoke, its buttons down the centre front.
  const placket=box(named(top,'blouse-placket')[0]);assert.ok(placket.min.y/.76<spec.yoke.front-.1&&placket.max.y/.76>spec.yoke.front+.1&&placket.min.z>.1);
  for(const b of named(top,'blouse-button')){const p=b.getWorldPosition(new T.Vector3());assert.ok(Math.abs(p.x)<.005&&p.z>.1,'button on the centre front');}
  // Gathered below the yoke: just below the seam the body's surface ripples round her (its distance from her middle,
  // over the shell's own ellipse there, varies), above the seam it does not.
  const rows=spec.body.rows,radii=y=>{let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;const t=(rows[k][0]-y)/(rows[k][0]-rows[k+1][0]);return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];};
  const p=named(top,'blouse-body')[0].geometry.attributes.position,ripple=(lo,hi)=>{let min=Infinity,max=-Infinity;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<=lo||y>=hi||p.getZ(i)>0)continue;
    const [rx,rz]=radii(y),e=Math.hypot(p.getX(i)/rx,p.getZ(i)/rz);min=Math.min(min,e);max=Math.max(max,e);}return max-min;};
  const below=ripple(spec.yoke.back-.05,spec.yoke.back-.02),above=ripple(spec.yoke.back+.02,spec.yoke.back+.05);
  assert.ok(below>.03&&below>above*2,`gathers below the yoke (${below.toFixed(3)} against ${above.toFixed(3)} above)`);
  // The sleeves end in bands below her elbow, where her forearm turns bare (bareArmBelow).
  for(const band of named(top,'sleeve-band')){const q=band.geometry.attributes.position;let min=Infinity;for(let i=0;i<q.count;i++)min=Math.min(min,q.getY(i));
    assert.ok(Math.abs(min-g.layering.bareArmBelow)<.005,`band ends at ${min.toFixed(3)}`);}
  disposeObject(outfit);
  // Over the skirt it is tucked in: its hem is higher than over trousers.
  const loose=makeOutfit({topId:ID}),tucked=makeOutfit({topId:ID,skirt:true});
  assert.ok(box(named(tucked,'blouse-body')[0]).min.y>box(named(loose,'blouse-body')[0]).min.y+.05,'tucked into the skirt');
  [loose,tucked].forEach(disposeObject);
});
