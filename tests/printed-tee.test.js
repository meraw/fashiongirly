import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, VANGOGH_TEE_ID } from '../src/wardrobe/catalog.js';
import { VANGOGH_TEE_ATLAS } from '../src/wardrobe/vangogh-tee-atlas.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Van Gogh tee: printed panels from its atlas, raglan and panel seams overlocked in green, lettuce edges, short sleeves',()=>{
  const g=GARMENTS[VANGOGH_TEE_ID];assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===VANGOGH_TEE_ID),'a study preset wears it');
  assert.match(VANGOGH_TEE_ATLAS,/^data:image\/webp;base64,/);
  const atlas=new T.DataTexture(new Uint8Array([120,150,170,255]),1,1),outfit=makeOutfit({topId:VANGOGH_TEE_ID},{[VANGOGH_TEE_ID]:atlas}),top=outfit.getObjectByName(VANGOGH_TEE_ID);
  for(const [name,count] of [['printed-tee-body',1],['reference-fitted-sleeve',2],['raglan-seam',4],['centre-front-seam',1],['side-seam',2],['back-band-seam',1],['lettuce-hem',1],['lettuce-neckline',1],['lettuce-sleeve-hem',2]])
    assert.equal(named(top,name).length,count,name);
  // Body and sleeves print from the atlas: the body from its top three quarters, each sleeve from its own half of the bottom
  // quarter (her right sleeve on the left half).
  const body=named(top,'printed-tee-body')[0];assert.equal(body.material.map.source,atlas.source);
  const vs=[...body.geometry.attributes.uv.array].filter((_,k)=>k%2);assert.ok(Math.min(...vs)>=.249&&Math.max(...vs)<=1.0001);
  for(const sleeve of named(top,'reference-fitted-sleeve')){const uv=sleeve.geometry.attributes.uv.array,us=[...uv].filter((_,k)=>!(k%2)),v=[...uv].filter((_,k)=>k%2);
    assert.ok(Math.max(...v)<=.2501,'sleeve rows');const right=sleeve.parent.position.x<0;assert.ok(right?Math.max(...us)<=.5:Math.min(...us)>=.5,'each sleeve its own half');}
  // Short sleeves end above her elbow; the hem waves (lettuce edge) rather than ending level.
  const p=body.geometry.attributes.position;let lo=Infinity,hi=-Infinity;for(let i=0;i<=128;i++){const y=p.getY(p.count-1-i);lo=Math.min(lo,y);hi=Math.max(hi,y);}
  assert.ok(hi-lo>.004,`wavy hem (${(hi-lo).toFixed(4)})`);
  for(const sleeve of named(top,'reference-fitted-sleeve')){let min=Infinity;const q=sleeve.geometry.attributes.position;for(let i=0;i<q.count;i++)min=Math.min(min,q.getY(i));assert.ok(min>-.19,`short sleeve ends at ${min.toFixed(3)}`);}
  // The overlocked seams lie on the knit: every seam point is within a few thousandths of the body's surface along its ray.
  outfit.updateMatrixWorld(true);const ray=new T.Raycaster(),q=new T.Vector3();let checked=0;
  for(const name of ['raglan-seam','centre-front-seam','side-seam','back-band-seam'])for(const s of named(top,name)){const pos=s.geometry.attributes.position;
    for(let i=0;i<pos.count;i+=7){q.fromBufferAttribute(pos,i).applyMatrix4(s.matrixWorld);const o=new T.Vector3(0,q.y,0);ray.set(o,q.clone().sub(o).normalize());
      const hit=ray.intersectObject(body,false).at(-1);assert.ok(hit&&Math.abs(hit.distance-q.distanceTo(o))<.012,`${name} lies on the knit`);checked++;}}
  assert.ok(checked>50);
  // Without the atlas (a failed load) it still dresses her, in a flat sky colour.
  const plain=makeOutfit({topId:VANGOGH_TEE_ID});assert.equal(named(plain,'printed-tee-body')[0].material.map,null);
  [outfit,plain].forEach(disposeObject);atlas.dispose();
});
