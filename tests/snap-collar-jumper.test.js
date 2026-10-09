import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, STRIPE_SNAP_JUMPER_ID } from '../src/wardrobe/catalog.js';
const all=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const box=o=>new T.Box3().setFromObject(o);

test('striped snap-collar jumper: waffle-knit stripes, raglan seams, a big collar and a snap placket worn open, rib hem and long cuffs',()=>{
  const spec=GARMENTS[STRIPE_SNAP_JUMPER_ID].build,P=spec.placket,recipe=cleanRecipe({topId:STRIPE_SNAP_JUMPER_ID,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit(recipe);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['waffle-knit-body',1],['ribbed-hem-band',1],['knit-jumper-sleeve',2],['ribbed-cuff',2],['raglan-seam',4],['snap-collar',1],['snap-collar-stand',1],['bare-shoulder-skin',1],
    ['placket-snap',P.open.length+P.closed.length],['placket-stud',P.open.length],['collar-snap',2*spec.collar.snapV.length],['collar-lapel',2],['lapel-roll',2]])
    assert.equal(all(outfit,name).length,count,name);
  // Stripes: the knit's texture has the grey rows and the cream rows of one repeat, and the body and sleeves map them by
  // height, so a grey stripe is at the same height on the body and on a sleeve.
  const body=all(outfit,'waffle-knit-body')[0],{data,width,height}=body.material.map.image;let grey=0;
  for(let y=0;y<height;y++){const k=(y*width+8)*4;if(data[k]<120)grey++;}
  assert.ok(Math.abs(grey/height-spec.knit.stripeRows/spec.knit.cells)<.05,`grey share ${(grey/height).toFixed(2)}`);
  const sleeve=all(outfit,'knit-jumper-sleeve')[0],stripeAt=(mesh,y)=>{const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,v=new T.Vector3();let best=null;
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);mesh.localToWorld(v);const d=Math.abs(v.y/.76-y);if(!best||d<best[0])best=[d,uv.getY(i)];}return best[1];};
  for(const y of [1.5,1.6])assert.ok(Math.abs(stripeAt(body,y)-stripeAt(sleeve,y))<.08,`stripes meet at ${y}`);
  // Worn open: the body's neckline dips into a V at the front, down to the first closed snap, with her skin in it.
  const p=body.geometry.attributes.position;let frontTop=-Infinity,backTop=-Infinity;
  for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i))<.003){if(p.getZ(i)>0)frontTop=Math.max(frontTop,p.getY(i));else backTop=Math.max(backTop,p.getY(i));}
  assert.ok(Math.abs(frontTop-P.vBottom)<.01,`V bottom ${frontTop.toFixed(3)}`);assert.ok(backTop>spec.body.rows[0][0]-.005,'round at the back');
  // The collar's front ends lie on her chest either side of the V, in front of the body, and it closes round the back.
  const collar=box(all(outfit,'snap-collar')[0]);
  assert.ok(collar.min.y/.76<P.vBottom&&collar.max.z>.15&&collar.min.z<-.12,`collar reaches ${(collar.min.y/.76).toFixed(3)}`);
  // Open, each side of the placket folds back as a lapel from the bottom of the V up into the collar's front end, so the
  // collar joins the placket (the user found the first collar's flaps unconnected).
  for(const lapel of all(outfit,'collar-lapel')){const b=box(lapel);assert.ok(b.min.y/.76<P.vBottom+.02&&b.max.y/.76>1.85&&b.max.z>.15,`lapel from ${(b.min.y/.76).toFixed(3)} to ${(b.max.y/.76).toFixed(3)}`);}
  // Long sleeves to rib cuffs at her wrists; the band hugs the jeans, or sits out over the skirt.
  for(const cuff of all(outfit,'ribbed-cuff'))assert.ok(box(cuff).min.y/.76<1.32,'cuff at her wrist');
  disposeObject(outfit);
  const bandWidth=skirt=>{const o=makeOutfit({topId:STRIPE_SNAP_JUMPER_ID,skirt});const w=box(o.getObjectByName('ribbed-hem-band')).getSize(new T.Vector3()).x;disposeObject(o);return w;};
  assert.ok(bandWidth(true)>bandWidth(false)+.03);
  const t0=performance.now();disposeObject(makeOutfit(recipe));assert.ok(performance.now()-t0<400,'build time');
});
