import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeDoll, makeOutfit, disposeObject, fitDoll } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS, BUFFALO_ASPHA_ID, DM_COW_SLIDE_ID } from '../src/wardrobe/catalog.js';
const shoes=Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='shoes');
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Ray from an axis at the point's height out through the point: the first hit on `targets`, and the point's distance.
function cast(targets,axisX,p){
  const origin=new T.Vector3(axisX,p.y,0),r=p.distanceTo(origin);if(r<.005)return null;
  const ray=new T.Raycaster(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
  return {hit:ray.intersectObjects(targets,false)[0],r};
}
function eachVertex(root,fn){const p=new T.Vector3();root.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;for(let i=0;i<pos.count;i++)fn(p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld),o,i);});}

test('shoe slot: loafers are worn from the outfit, and only shoes fill it',()=>{
  assert.equal(cleanRecipe(null).shoesId,'classic');assert.equal(cleanRecipe({shoesId:BUFFALO_ASPHA_ID}).shoesId,BUFFALO_ASPHA_ID);
  assert.equal(cleanRecipe({shoesId:'levis-94-wide-leg-v1'}).shoesId,'classic','jeans cannot be worn as shoes');
  assert.equal(cleanRecipe({bottomId:BUFFALO_ASPHA_ID}).bottomId,'classic','shoes cannot be worn as bottoms');
  const doll=makeDoll(),outfit=makeOutfit({});
  assert.equal(named(doll,'loafer').length,0,'the doll keeps her socks, not her shoes');assert.equal(named(doll,'sock').length,2);
  assert.equal(named(outfit,'loafer').length,2);assert.equal(typeof outfit.getObjectByName('shoes').userData.rest,'function');
  const boots=makeOutfit({shoesId:BUFFALO_ASPHA_ID});assert.equal(named(boots,'loafer').length,0,'boots replace the loafers');
  [doll,outfit,boots].forEach(disposeObject);
});

test('Buffalo boots: lug platform, padded collar, logo tabs and lacing, holding her socks without raising her',()=>{
  const spec=GARMENTS[BUFFALO_ASPHA_ID];assert.equal(spec.slot,'shoes');
  const doll=makeDoll(),outfit=makeOutfit({shoesId:BUFFALO_ASPHA_ID});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const boots=outfit.getObjectByName('shoes');
  for(const name of ['lug-sole','sole-rim','boot-upper','collar-roll','quilt-stitch','heel-tab','tongue','tongue-tab','tongue-tape','eyelet','webbing-loop','lace','lace-bow','side-piping','window-piping','side-strap'])assert.ok(boots.getObjectByName(name),name);
  assert.equal(named(boots,'heel-tab').length,2);assert.equal(named(boots,'eyelet').length,2*2*spec.build.eyelets.length);
  // Her body stays where it was: the platform is built inside her foot height, standing on the floor.
  const box=new T.Box3().setFromObject(boots);assert.ok(box.min.y>=0&&box.min.y<.002,'on the floor');
  assert.equal(new T.Box3().setFromObject(makeDoll()).min.y,new T.Box3().setFromObject(doll).min.y);
  // Chunky: the sole is a third of the boot's height at the heel, with deep lugs cut into it.
  const sole=new T.Box3().setFromObject(named(boots,'lug-sole')[0]);
  assert.ok(sole.max.y/(box.max.y-spec.build.heelTab.above*.76)>.3,'thick platform');
  const lugs=named(boots,'lug-sole')[0].geometry.attributes.position;let deep=0;for(let i=0;i<lugs.count;i++)if(lugs.getY(i)<.02)deep++;assert.ok(deep>500);
  // The feet stay apart.
  const [l,r]=[-1,1].map(s=>new T.Box3().setFromObject(named(boots,'lug-sole').find(o=>Math.sign(new T.Box3().setFromObject(o).getCenter(new T.Vector3()).x)===s)));assert.ok(l.max.x<r.min.x-.02);
  // Every sock and lower-leg vertex below the collar lies inside its boot.
  // The collar dips at the sides, so check up to its lowest point.
  const uppers=named(boots,'boot-upper'),top=Math.min(...Object.values(spec.build.collar));let checked=0;
  doll.traverse(o=>{if(o.name!=='sock'&&o.name!=='leg')return;eachVertex(o,p=>{const y=p.y/.76;if(y<spec.build.sole.top+.02||y>top-.01)return;
    const c=cast(uppers,Math.sign(p.x)*spec.build.cx*1.06,p);if(!c)return;assert.ok(c.hit&&c.hit.distance>c.r+.002,`${o.name} shows through the boot at y ${y.toFixed(3)}`);checked++;});});
  assert.ok(checked>200,`checked ${checked}`);disposeObject(doll);disposeObject(outfit);
});

test('jeans drape over every shoe or sit on a boot collar, and the classic jeans tuck into boots',()=>{
  const bottoms=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='bottom')];
  for(const shoesId of shoes)for(const bottomId of bottoms){
    const outfit=makeOutfit({bottomId,shoesId});outfit.updateMatrixWorld(true);
    const build=GARMENTS[shoesId].build,boots=outfit.getObjectByName('shoes'),trousers=outfit.getObjectByName('trousers');let checked=0;
    const hem=GARMENTS[bottomId]?.build?.hem,boot=build.template==='lug-boot',low=boot?Math.min(...Object.values(build.collar)):0;
    if(!boot){
      // Open shoes: wherever the trousers come down over the shoe, no part of it (straps, buckle, her bare ankle) pokes
      // through them, and a full-length hem still reaches down to the footbed.
      const legs=named(trousers,GARMENTS[bottomId]?.build?.legName||'barrel-leg');
      eachVertex(boots,(p,o,i)=>{if(p.y/.76<.2)return;const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
        const c=cast([leg],new T.Box3().setFromObject(leg).getCenter(new T.Vector3()).x,p);if(!c)return;checked++;
        assert.ok(!c.hit||c.hit.distance>c.r+.002,`${o.name} vertex ${i} pokes through ${bottomId} over ${shoesId}`);});
      if(hem==='rests-on-shoe'){let floor=Infinity;for(const leg of legs)floor=Math.min(floor,new T.Box3().setFromObject(leg).min.y/.76);assert.ok(floor<build.sole.footbed+.01,`${bottomId} hem reaches the footbed`);}
    }else if(GARMENTS[bottomId]?.build?.template==='jeans'&&trousers.userData.hemOnCollar){
      // A shorter, slimmer leg whose hem would end inside the boot sits on top of its padded collar instead.
      const legs=named(trousers,GARMENTS[bottomId].build.legName);
      for(const leg of legs){const low=new T.Box3().setFromObject(leg).min.y/.76;assert.ok(low>Math.min(...Object.values(build.collar))+.017,`${bottomId} hem sits on the collar (${low.toFixed(3)})`);checked+=100;}
    }else if(GARMENTS[bottomId]?.build?.template==='jeans'){
      // Where the trousers come down over the shoe (full length, or a wider ankle-length leg over a boot shaft), no
      // part of it pokes through them.
      const legs=named(trousers,GARMENTS[bottomId].build.legName);
      eachVertex(boots,(p,o,i)=>{if(p.y/.76<.2)return;const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
        const c=cast([leg],new T.Box3().setFromObject(leg).getCenter(new T.Vector3()).x,p);if(!c)return;checked++;
        assert.ok(!c.hit||c.hit.distance>c.r+.002,`${o.name} vertex ${i} pokes through ${bottomId}`);});
      // Draping around the boots never pushes one trouser leg further into the other than over the loafers
      // (where their folds already brush between her feet).
      const overlap=o=>{const span=leg=>{const b=new T.Box3(),p=new T.Vector3(),pos=leg.geometry.attributes.position;for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);if(p.y<.5)b.expandByPoint(p);}return b;};
        const [l,r]=named(o,GARMENTS[bottomId].build.legName).map(span).sort((a,b)=>a.min.x-b.min.x);return l.max.x-r.min.x;};
      const loafers=makeOutfit({bottomId});assert.ok(overlap(outfit)<=overlap(loafers)+.003,`${bottomId} legs pushed together over ${shoesId}`);disposeObject(loafers);
      // A full-length hem still comes down onto the platform: some of it rests below the top of the toe.
      let low=Infinity;for(const leg of legs)low=Math.min(low,new T.Box3().setFromObject(leg).min.y/.76);
      if(hem==='rests-on-shoe')assert.ok(low<build.sole.heelTop+.03,`${bottomId} hem reaches the platform`);
    }else{
      // Narrower legs (the classic barrel jeans) tuck into the boot shaft.
      const uppers=named(boots,'boot-upper');
      eachVertex(trousers,(p,o,i)=>{const y=p.y/.76;if(y<build.sole.top+.02||y>low-.01)return;const c=cast(uppers,Math.sign(p.x)*build.cx*1.06,p);if(!c)return;checked++;
        assert.ok(c.hit&&c.hit.distance>c.r,`${o.name} vertex ${i} of ${bottomId} shows through the boot`);});
    }
    assert.ok(checked>50,`${shoesId}/${bottomId} checked ${checked}`);disposeObject(outfit);
  }
});

test('Dr. Martens slides: platform raises her, bare feet with the straps clear of them, and her socks hidden',()=>{
  const spec=GARMENTS[DM_COW_SLIDE_ID].build,outfit=makeOutfit({shoesId:DM_COW_SLIDE_ID,bottomId:'desigual-davinia-jeans-v1'}),doll=makeDoll();fitDoll(doll,outfit);
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);const shoesGroup=outfit.getObjectByName('shoes');
  for(const name of ['slide-outsole','slide-welt','welt-stitch','slide-platform','footbed','cow-strap','strap-piping','strap-cord','instep-strap','buckle','bare-foot','bare-ankle'])assert.ok(shoesGroup.getObjectByName(name),name);
  // Anchored to the floor: the sole stands on it, and she and her clothes rise by the footbed's height above her normal foot.
  const lift=spec.sole.footbed-spec.baseFoot;assert.ok(lift>.02);assert.ok(Math.abs(outfit.userData.lift-lift)<1e-9);
  assert.ok(Math.abs(new T.Box3().setFromObject(shoesGroup).min.y)<.002,'sole on the floor');
  assert.ok(Math.abs(doll.position.y-lift*.76)<1e-9,'doll raised');assert.ok(Math.abs(outfit.getObjectByName('trousers').position.y-lift)<1e-9,'clothes raised');
  let socks=0;doll.traverse(o=>{if(o.name==='sock'){socks++;assert.equal(o.visible,false);}});assert.equal(socks,2);
  // Her raised legs end inside her bare ankles, and the feet stand on the footbed.
  const ankles=named(shoesGroup,'bare-ankle');let legBottom=Infinity;doll.traverse(o=>{if(o.name==='leg')legBottom=Math.min(legBottom,new T.Box3().setFromObject(o).min.y);});
  for(const a of ankles){const b=new T.Box3().setFromObject(a);assert.ok(b.min.y<legBottom&&b.max.y>legBottom+.04,'ankle reaches up into the leg');}
  for(const f of named(shoesGroup,'bare-foot'))assert.ok(Math.abs(new T.Box3().setFromObject(f).min.y/.76-spec.sole.footbed)<.03,'foot on the footbed');
  // The straps clear her foot: no foot vertex lies above a strap at the same place.
  const straps=[...named(shoesGroup,'cow-strap'),...named(shoesGroup,'instep-strap')],ray=new T.Raycaster();let checked=0;
  for(const f of named(shoesGroup,'bare-foot'))eachVertex(f,p=>{ray.set(p.clone().setY(2),new T.Vector3(0,-1,0));const h=ray.intersectObjects(straps,false)[0];if(!h)return;checked++;assert.ok(h.point.y>p.y+.003,`foot pokes through a strap at ${p.x.toFixed(3)}, ${p.z.toFixed(3)}`);});
  assert.ok(checked>50,`checked ${checked}`);
  // With the loafers she stands where she always has, with her socks on.
  const plain=makeOutfit({}),d2=makeDoll();fitDoll(d2,plain);assert.equal(d2.position.y,0);d2.traverse(o=>{if(o.name==='sock')assert.equal(o.visible,true);});
  [outfit,doll,plain,d2].forEach(disposeObject);
});

test('UI: choosing shoes is saved with the look, and the boots study wears them',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;let last=null;
  const app=await startStudio(d,()=>({update(r){last=r;},turn(){},dispose(){}}));
  const select=d.getElementById('shoes-select');assert.deepEqual([...select.options].map(o=>o.value),['classic',...shoes]);
  select.value=BUFFALO_ASPHA_ID;select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(app.getRecipe().shoesId,BUFFALO_ASPHA_ID);assert.equal(last.shoesId,BUFFALO_ASPHA_ID);
  d.getElementById('save').click();assert.equal(JSON.parse(dom.window.localStorage.getItem('fashiongirly.plush-looks.v1'))[0].shoesId,BUFFALO_ASPHA_ID);
  d.getElementById('reset').click();assert.equal(app.getRecipe().shoesId,'classic');assert.equal(select.value,'classic');
  const study=OUTFITS.find(look=>look.recipe.shoesId===BUFFALO_ASPHA_ID);assert.ok(study,'a study preset wears the boots');
  [...d.getElementById('outfit-ideas').children].find(b=>b.textContent===study.name).click();assert.equal(select.value,BUFFALO_ASPHA_ID);
  app.dispose();dom.window.close();
});
