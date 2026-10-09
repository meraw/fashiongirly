import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, SAM_ZIP_BOOT_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('front-zip boots: smooth leather, zip placket instead of laces, toe cap and panel seams, pull tab, lug sole, her socks inside',()=>{
  const g=GARMENTS[SAM_ZIP_BOOT_ID];assert.equal(g.slot,'shoes');assert.ok(OUTFITS.some(look=>look.recipe.shoesId===SAM_ZIP_BOOT_ID),'a study preset wears them');
  const outfit=makeOutfit({shoesId:SAM_ZIP_BOOT_ID}),boots=outfit.getObjectByName('shoes');
  for(const [name,count] of [['boot-upper',2],['lug-sole',2],['zip-placket',2],['zip-teeth',2],['zip-slider',2],['zip-pull',2],['zip-pull-logo',2],['zip-stitch',8],['toe-cap-seam',4],['panel-seam',8],['pull-loop',2],['back-hardware',2]])
    assert.equal(named(boots,name).length,count,name);
  // A zip, not laces: no tongue, eyelets or laces.
  for(const name of ['tongue','eyelet','lace','lace-bow'])assert.equal(named(boots,name).length,0,name);
  // Smooth glossy leather rather than nubuck.
  const leather=named(boots,'boot-upper')[0].material;assert.ok(leather.clearcoat>0&&leather.map===null);
  // Built inside her normal foot height: she is not raised, and her socks stay on.
  assert.ok(!outfit.userData.lift);assert.ok(!boots.userData.ownSocks);
  // Her socks are inside the shaft: from the middle of each boot at a sock vertex's height, the upper lies beyond it.
  const doll=makeDoll();doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const uppers=named(boots,'boot-upper'),ray=new T.Raycaster(),p=new T.Vector3(),top=g.build.collar.side*.76;let checked=0;
  for(const sock of named(doll,'sock')){const pos=sock.geometry.attributes.position,side=Math.sign(sock.position.x);
    for(let i=0;i<pos.count;i+=3){p.fromBufferAttribute(pos,i).applyMatrix4(sock.matrixWorld);if(p.y<.1*.76||p.y>top-.01)continue;
      const o=new T.Vector3(side*g.build.cx*1.06,p.y,.02),d=p.clone().sub(o);if(d.length()<.01)continue;ray.set(o,d.normalize());
      const hit=ray.intersectObjects(uppers,false).find(h=>Math.sign(h.point.x)===side);assert.ok(hit&&hit.distance>p.distanceTo(o)+.002,`sock pokes through at vertex ${i}`);checked++;}}
  assert.ok(checked>100,`checked ${checked}`);
  [outfit,doll].forEach(disposeObject);
});
