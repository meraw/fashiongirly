import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { DEFAULT, OUTFITS, cleanRecipe, editRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
// The doll, the studio and checks across every garment. Tops, bottoms, shoes and outerwear have their own test files.
test('doll and garment geometry stays finite for extreme supported silhouettes',()=>{
  for(const state of [...OUTFITS.map(look=>look.recipe),DEFAULT,{sleeve:0,hem:0,barrel:0},{sleeve:1,hem:1,barrel:1},{knit:false,shirt:false}]){
    const model=new T.Group();model.add(makeDoll(),makeOutfit(state));let triangles=0;
    model.traverse(o=>{if(!o.geometry)return;const p=o.geometry.attributes.position;for(const n of p.array)assert.ok(Number.isFinite(n));triangles+=(o.geometry.index?.count||p.count)/3;});
    assert.ok(triangles>10000&&triangles<350000,`triangle budget: ${triangles}`);
    const box=new T.Box3().setFromObject(model);assert.ok(box.max.y>2.25&&box.max.y<2.55);assert.ok(box.min.y>-.01);disposeObject(model);
  }
});
test('wardrobe layers toggle independently and shape settings affect bounds',()=>{
  const narrow=makeOutfit({sleeve:0,barrel:0}),wide=makeOutfit({sleeve:1,barrel:1});
  assert.ok(new T.Box3().setFromObject(wide).getSize(new T.Vector3()).x>new T.Box3().setFromObject(narrow).getSize(new T.Vector3()).x);
  const none=makeOutfit({knit:false,shirt:false});assert.equal(none.getObjectByName('sweater'),undefined);assert.equal(none.getObjectByName('shirt'),undefined);assert.ok(none.getObjectByName('trousers'));
  [narrow,wide,none].forEach(disposeObject);
});
test('recipe changes are bounded and do not mutate the source',()=>{
  const r=editRecipe(DEFAULT,'Butter sweater, enormous sleeves, cropped, wider jeans');assert.equal(r.recipe.sweater,'#ead391');assert.equal(r.recipe.sleeve,1);assert.equal(r.recipe.barrel,1);assert.equal(DEFAULT.sleeve,.74);
  assert.deepEqual(cleanRecipe(null),DEFAULT);assert.equal(cleanRecipe({sleeve:Infinity}).sleeve,DEFAULT.sleeve);assert.equal(cleanRecipe({barrel:5}).barrel,1);
});
test('UI applies a description, toggles clothing, saves and restores a look',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;let updates=0;
  d.getElementById('lookbook').showModal=function(){this.open=true;};d.getElementById('lookbook').close=function(){this.open=false;};
  const app=await startStudio(d,()=>({update(){updates++;},turn(){},dispose(){}}));
  d.getElementById('request').value='Butter sweater, enormous sleeves';d.getElementById('edit-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));assert.equal(app.getRecipe().sleeve,1);assert.equal(updates,1);
  d.getElementById('save').click();assert.equal(d.getElementById('count').textContent,'1');
  d.getElementById('reset').click();assert.equal(app.getRecipe().sleeve,.74);
  d.getElementById('lookbook-open').click();d.querySelector('.saved-row button').click();assert.equal(app.getRecipe().sleeve,1);
  const shirt=d.getElementById('shirt');shirt.checked=false;shirt.dispatchEvent(new dom.window.Event('change'));assert.equal(app.getRecipe().shirt,false);
  app.dispose();dom.window.close();
});
test('3D startup failure leaves an actionable error',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'});const app=await startStudio(dom.window.document,()=>{throw new Error('WebGL unavailable');});
  assert.equal(dom.window.document.getElementById('view-error').hidden,false);assert.match(dom.window.document.getElementById('view-error').textContent,/WebGL/);app.dispose();dom.window.close();
});

test('curated outfits preserve editable layers through saving and restoring',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;
  d.getElementById('lookbook').showModal=function(){this.open=true;};d.getElementById('lookbook').close=function(){this.open=false;};
  const app=await startStudio(d,()=>({update(){},turn(){},dispose(){}}));
  [...d.querySelectorAll('#outfit-ideas button')].find(b=>b.textContent==='Tomato mischief').click();
  assert.equal(app.getRecipe().skirt,true);assert.equal(d.getElementById('skirt').checked,true);
  const outfit=makeOutfit(app.getRecipe());assert.ok(outfit.getObjectByName('pleated-skirt'));disposeObject(outfit);
  d.getElementById('save').click();d.getElementById('reset').click();assert.equal(app.getRecipe().skirt,false);
  d.getElementById('lookbook-open').click();d.querySelector('.saved-row button').click();assert.equal(app.getRecipe().skirt,true);
  assert.equal(editRecipe(app.getRecipe(),'remove the skirt').recipe.skirt,false);
  app.dispose();dom.window.close();
});

test('reference sleeves cover the upper arm with clearance and round over the shoulder',()=>{
  for(const topId of Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='top')){
  const doll=makeDoll(),outfit=makeOutfit({topId});
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const arms=[],sleeves=[];
  doll.traverse(o=>{if(o.name==='arm')arms.push(o);});
  outfit.traverse(o=>{if(['reference-fitted-sleeve','crochet-flared-sleeve','knit-jumper-sleeve','knit-polo-sleeve'].includes(o.name))sleeves.push(o);});
  const ray=new T.Raycaster(),point=new T.Vector3(),origin=new T.Vector3();let checked=0;
  for(let side=0;side<2;side++){
    const arm=arms[side],sleeve=sleeves[side],vertices=arm.geometry.attributes.position,bare=GARMENTS[topId].layering?.bareShoulder;
    for(let i=0;i<vertices.count;i+=2){
      point.fromBufferAttribute(vertices,i).applyMatrix4(arm.matrixWorld);sleeve.worldToLocal(point);
      // Long sleeves cover her arm down to the forearm; a short sleeve leaves it bare below its band (catalog bareArmBelow).
      if(point.y<(GARMENTS[topId].layering?.bareArmBelow??-.44))continue;
      // An off-the-shoulder top leaves the top of that arm bare or covered by its body; its own test checks that arm.
      if(bare?.side===(side?1:-1)&&point.y>bare.above)continue;
      // Above the sleeve's top ring, aim from the axis at the top so the rounded cap is checked too.
      origin.set(0,Math.min(point.y,0),0);sleeve.localToWorld(origin);sleeve.localToWorld(point);
      const radius=point.distanceTo(origin);if(radius<.01)continue;
      ray.set(origin,point.clone().sub(origin).normalize());
      const hit=ray.intersectObject(sleeve,false)[0];
      assert.ok(hit&&hit.distance>radius+.002,`${topId}: arm ${side} protrudes at vertex ${i}`);checked++;
    }
    // The outer top of the sleeve sits well below the inner top: no square shoulder corner.
    const p=sleeve.geometry.attributes.position,c=Math.cos(sleeve.rotation.y),sn=Math.sin(sleeve.rotation.y),sign=side?1:-1;let outer=-Infinity,inner=-Infinity;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=Math.hypot(x,z),o=sign*(x*c+z*sn)/r;if(o>.95)outer=Math.max(outer,p.getY(i));if(o<-.95)inner=Math.max(inner,p.getY(i));}
    assert.ok(inner-outer>.06,`${topId}: sleeve ${side} shoulder is not rounded (${(inner-outer).toFixed(3)})`);
  }
  assert.ok(checked>100);disposeObject(doll);disposeObject(outfit);
  }
});

test('cuffs and sleeve ends never cut through her mittens or thumbs',()=>{
  const doll=makeDoll();doll.updateMatrixWorld(true);const hands=[];doll.traverse(o=>{if(['tiny-mitten','mitten-thumb'].includes(o.name))hands.push(o);});
  const ray=new T.Raycaster(),p=new T.Vector3(),local=new T.Vector3(),origin=new T.Vector3();
  for(const topId of Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='top')){
    const outfit=makeOutfit({topId});outfit.updateMatrixWorld(true);const ends=[];
    outfit.traverse(o=>{if(o.isMesh&&/cuff|sleeve/.test(o.name)){o.geometry.computeBoundingBox();ends.push(o);}});
    for(const hand of hands){const pos=hand.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(hand.matrixWorld);
        for(const end of ends){const arm=end.parent;if(Math.sign(arm.getWorldPosition(origin).x)!==Math.sign(p.x))continue;
          arm.worldToLocal(local.copy(p));const box=end.geometry.boundingBox;if(local.y>box.max.y-.002||local.y<box.min.y+.006)continue;
          // Within the cuff's height, the hand must lie inside it: a ray from the arm's axis reaches the hand before the cuff.
          origin.set(0,local.y,0);arm.localToWorld(origin);const d=p.distanceTo(origin);if(d<1e-4)continue;
          ray.set(origin,p.clone().sub(origin).normalize());const hit=ray.intersectObject(end,false)[0];
          assert.ok(!hit||hit.distance>=d,`${hand.name} cuts through ${end.name} of ${topId} at vertex ${i}`);}
      }}
    disposeObject(outfit);
  }
  disposeObject(doll);
});

