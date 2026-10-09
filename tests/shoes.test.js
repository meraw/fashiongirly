import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeDoll, makeOutfit, disposeObject, fitDoll } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS, BUFFALO_ASPHA_ID, DM_COW_SLIDE_ID, UGG_LOWMEL_ID, DM_BLAIRE_CHAIN_ID, CONVERSE_LIFT_HI_ID, NB_550_ID } from '../src/wardrobe/catalog.js';
import { levelCaster } from '../src/doll/level-caster.js';
const shoes=Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='shoes');
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Casters for rays from vertical lines (at x, z = 0) through the meshes: one per line, made when first used.
const around=meshes=>{const lines=new Map();return x=>{if(!lines.has(x))lines.set(x,levelCaster(meshes,{axis:[x,0]}));return lines.get(x);};};
// Ray from an axis at the point's height out through the point: the first hit on `targets` (from around()), and the point's distance.
function cast(targets,axisX,p){
  const origin=new T.Vector3(axisX,p.y,0),r=p.distanceTo(origin);if(r<.005)return null;
  return {hit:targets(axisX)(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4)),r};
}
// Each trouser leg with its centre x and its own caster, made once: `side(x)` gives the leg on that side of her body.
function legSides(legs){const sides=legs.map(mesh=>({x:new T.Box3().setFromObject(mesh).getCenter(new T.Vector3()).x,hit:around([mesh])}));return x=>sides.find(l=>Math.sign(l.x)===Math.sign(x));}
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
  const uppers=around(named(boots,'boot-upper')),top=Math.min(...Object.values(spec.build.collar));let checked=0;
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
      const side=legSides(legs);
      eachVertex(boots,(p,o,i)=>{if(p.y/.76<.2)return;const leg=side(p.x);
        const c=cast(leg.hit,leg.x,p);if(!c)return;checked++;
        assert.ok(!c.hit||c.hit.distance>c.r+.002,`${o.name} vertex ${i} pokes through ${bottomId} over ${shoesId}`);});
      if(hem==='rests-on-shoe'){let floor=Infinity;for(const leg of legs)floor=Math.min(floor,new T.Box3().setFromObject(leg).min.y/.76);assert.ok(floor<(build.sole.footbed??build.sole.top+.06)+.01,`${bottomId} hem comes down onto the shoe`);}
    }else if(GARMENTS[bottomId]?.build?.template==='jeans'&&trousers.userData.hemOnCollar){
      // A shorter, slimmer leg whose hem would end inside the boot sits on top of its padded collar instead.
      const legs=named(trousers,GARMENTS[bottomId].build.legName);
      for(const leg of legs){const low=new T.Box3().setFromObject(leg).min.y/.76;assert.ok(low>Math.min(...Object.values(build.collar))+.017,`${bottomId} hem sits on the collar (${low.toFixed(3)})`);checked+=100;}
    }else if(GARMENTS[bottomId]?.build?.template==='jeans'){
      // Where the trousers come down over the shoe (full length, or a wider ankle-length leg over a boot shaft), no
      // part of it pokes through them.
      const legs=named(trousers,GARMENTS[bottomId].build.legName);
      const side=legSides(legs);
      eachVertex(boots,(p,o,i)=>{if(p.y/.76<.2)return;const leg=side(p.x);
        const c=cast(leg.hit,leg.x,p);if(!c)return;checked++;
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
      const uppers=around(named(boots,'boot-upper'));
      eachVertex(trousers,(p,o,i)=>{const y=p.y/.76;if(y<build.sole.top+.02||y>low-.01)return;const c=cast(uppers,Math.sign(p.x)*build.cx*1.06,p);if(!c)return;checked++;
        assert.ok(c.hit&&c.hit.distance>c.r,`${o.name} vertex ${i} of ${bottomId} shows through the boot`);});
    }
    assert.ok(checked>50,`${shoesId}/${bottomId} checked ${checked}`);disposeObject(outfit);
  }
});

test('Dr. Martens slides: platform raises her, bare feet with the straps clear of them, and her socks hidden',()=>{
  const spec=GARMENTS[DM_COW_SLIDE_ID].build,outfit=makeOutfit({shoesId:DM_COW_SLIDE_ID,bottomId:'desigual-davinia-jeans-v1'}),doll=makeDoll();fitDoll(doll,outfit);
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);const shoesGroup=outfit.getObjectByName('shoes');
  for(const name of ['slide-outsole','slide-welt','welt-stitch','slide-platform','footbed','cow-strap','strap-piping','strap-cord','instep-strap','buckle','bare-foot'])assert.ok(shoesGroup.getObjectByName(name),name);
  // Anchored to the floor: the sole stands on it, and she and her clothes rise by the footbed's height above her normal foot.
  const lift=spec.sole.footbed-spec.baseFoot;assert.ok(lift>.02);assert.ok(Math.abs(outfit.userData.lift-lift)<1e-9);
  assert.ok(Math.abs(new T.Box3().setFromObject(shoesGroup).min.y)<.002,'sole on the floor');
  assert.ok(Math.abs(doll.position.y-lift*.76)<1e-9,'doll raised');assert.ok(Math.abs(outfit.getObjectByName('trousers').position.y-lift)<1e-9,'clothes raised');
  let socks=0;doll.traverse(o=>{if(o.name==='sock'){socks++;assert.equal(o.visible,false);}});assert.equal(socks,2);
  // Her raised legs end inside her bare ankles, and the feet stand on the footbed.
  const feet=named(shoesGroup,'bare-foot');assert.equal(feet.length,2,'one smooth foot each');let legBottom=Infinity;doll.traverse(o=>{if(o.name==='leg')legBottom=Math.min(legBottom,new T.Box3().setFromObject(o).min.y);});
  for(const f of feet){const b=new T.Box3().setFromObject(f);assert.ok(b.min.y<legBottom&&b.max.y>legBottom+.04,'ankle reaches up into the leg');}
  for(const f of named(shoesGroup,'bare-foot'))assert.ok(Math.abs(new T.Box3().setFromObject(f).min.y/.76-spec.sole.footbed)<.03,'foot on the footbed');
  // The straps clear her foot: no foot vertex lies above a strap at the same place.
  const straps=[...named(shoesGroup,'cow-strap'),...named(shoesGroup,'instep-strap')],ray=new T.Raycaster();let checked=0;
  for(const f of named(shoesGroup,'bare-foot'))eachVertex(f,p=>{ray.set(p.clone().setY(2),new T.Vector3(0,-1,0));const h=ray.intersectObjects(straps,false)[0];if(!h)return;checked++;assert.ok(h.point.y>p.y+.003,`foot pokes through a strap at ${p.x.toFixed(3)}, ${p.z.toFixed(3)}`);});
  assert.ok(checked>50,`checked ${checked}`);
  // With the loafers she stands where she always has, with her socks on.
  const plain=makeOutfit({}),d2=makeDoll();fitDoll(d2,plain);assert.equal(d2.position.y,0);d2.traverse(o=>{if(o.name==='sock')assert.equal(o.visible,true);});
  [outfit,doll,plain,d2].forEach(disposeObject);
});

test('UGG sneakers: low cream sneaker with puffy laces and her own ankle socks, not raised',()=>{
  const spec=GARMENTS[UGG_LOWMEL_ID].build,outfit=makeOutfit({shoesId:UGG_LOWMEL_ID}),doll=makeDoll();fitDoll(doll,outfit);
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);const shoesGroup=outfit.getObjectByName('shoes');
  for(const name of ['lug-sole','boot-upper','collar-roll','tongue','tongue-label','eyelet','lace','lace-bow','lace-end','pull-loop','suede-band','heel-counter','side-quarter','eyestay','ankle-sock'])assert.ok(shoesGroup.getObjectByName(name),name);
  for(const name of ['quilt-stitch','heel-tab','webbing-loop','side-piping'])assert.equal(shoesGroup.getObjectByName(name),undefined,`no boot ${name}`);
  assert.equal(named(shoesGroup,'eyelet').length,2*2*spec.eyelets.length);
  // Low: the collar sits well below her sock tops, and she is not raised.
  assert.ok(Math.max(...Object.values(spec.collar))<spec.sock.rows.at(-1)[0]-.08);assert.equal(outfit.userData.lift,0);assert.equal(doll.position.y,0);
  // Her round doll socks are replaced by the shoe's slim ankle socks, which hold the bottom of her legs.
  doll.traverse(o=>{if(o.name==='sock')assert.equal(o.visible,false);});
  const socks=around(named(shoesGroup,'ankle-sock')),top=spec.sock.rows.at(-1)[0];let checked=0;
  doll.traverse(o=>{if(o.name!=='leg')return;eachVertex(o,p=>{const y=p.y/.76;if(y>top-.008)return;const c=cast(socks,Math.sign(p.x)*(spec.sock.cx??spec.cx)*1.06,p.clone().setZ(p.z-spec.sock.z));if(!c)return;
    assert.ok(c.hit&&c.hit.distance>c.r,`leg shows through the ankle sock at y ${y.toFixed(3)}`);checked++;});});
  assert.ok(checked>20,`checked ${checked}`);
  // The ankle socks sit inside the shoe below its collar.
  const uppers=around(named(shoesGroup,'boot-upper'));let inside=0;
  for(const sk of named(shoesGroup,'ankle-sock'))eachVertex(sk,p=>{const y=p.y/.76;if(y<spec.sole.top+.03||y>spec.collar.side-.02)return;const c=cast(uppers,Math.sign(p.x)*spec.cx*1.06,p);if(!c)return;assert.ok(c.hit&&c.hit.distance>c.r,'sock shows through the shoe');inside++;});
  assert.ok(inside>20);
  [outfit,doll].forEach(disposeObject);
});

test('Blaire chain sandals: Quad platform raises her, patent straps with chains and buckles, an ankle strap, bare feet',()=>{
  const spec=GARMENTS[DM_BLAIRE_CHAIN_ID].build,outfit=makeOutfit({shoesId:DM_BLAIRE_CHAIN_ID}),doll=makeDoll();fitDoll(doll,outfit);
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);const g=outfit.getObjectByName('shoes');
  for(const name of ['slide-outsole','slide-welt','welt-stitch','slide-platform','footbed','bare-foot','patent-strap','chain-link','stud','buckle','buckle-tab','ankle-strap','upright-strap','pull-loop'])assert.ok(g.getObjectByName(name),name);
  for(const name of ['cow-strap','strap-cord','instep-strap'])assert.equal(g.getObjectByName(name),undefined,`no slide ${name}`);
  assert.equal(named(g,'patent-strap').length,2*spec.bands.length);assert.equal(named(g,'ankle-strap').length,2);
  // Every strap carries a chain: plenty of links, and buckles on all four straps of each foot.
  assert.ok(named(g,'chain-link').length>2*4*6);assert.equal(named(g,'buckle').length,2*(spec.bands.length+1));
  // Raised by the platform above her normal foot, sole on the floor, socks hidden.
  assert.ok(Math.abs(outfit.userData.lift-(spec.sole.footbed-spec.baseFoot))<1e-9);assert.ok(Math.abs(new T.Box3().setFromObject(g).min.y)<.002);
  doll.traverse(o=>{if(o.name==='sock')assert.equal(o.visible,false);});
  // The Quad sole: straight ribbed walls (many rings) with a sawtooth tread.
  const sole=named(g,'slide-outsole')[0].geometry.attributes.position;assert.ok(sole.count/481>20,'ribbed');
  // Straps clear her foot, and the ankle strap clears her ankle.
  const straps=[...named(g,'patent-strap'),...named(g,'ankle-strap')],ray=new T.Raycaster();let checked=0;
  for(const f of named(g,'bare-foot'))eachVertex(f,p=>{ray.set(p.clone().setY(2),new T.Vector3(0,-1,0));const h=ray.intersectObjects(named(g,'patent-strap'),false)[0];if(!h)return;checked++;assert.ok(h.point.y>p.y+.003,'foot pokes through a strap');});
  assert.ok(checked>50,`checked ${checked}`);
  const ankle=around(named(g,'ankle-strap'));let ringed=0;
  for(const f of named(g,'bare-foot'))eachVertex(f,p=>{const y=p.y/.76;if(Math.abs(y-spec.ankle.y)>.012)return;const c=cast(ankle,Math.sign(p.x)*spec.cx*1.06,p);if(!c||!c.hit)return;ringed++;assert.ok(c.hit.distance>c.r,'ankle pokes through the ankle strap');});
  assert.ok(ringed>10,`ringed ${ringed}`);void straps;
  [outfit,doll].forEach(disposeObject);
});

test('New Balance 550: leather sneaker on a two-tone cupsole, a big N each side, her own ankle socks, not raised',()=>{
  const spec=GARMENTS[NB_550_ID].build,outfit=makeOutfit({shoesId:NB_550_ID}),doll=makeDoll();fitDoll(doll,outfit);
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);const g=outfit.getObjectByName('shoes');
  for(const name of ['outsole','lug-sole','boot-upper','collar-pad','tongue','tongue-pad','tongue-label','eyelet','lace','lace-bow','heel-counter','side-window','perforated-quarter','toe-cap','eyestay','trim-piping','logo','logo-edge','ankle-sock'])assert.ok(g.getObjectByName(name),name);
  for(const name of ['quilt-stitch','heel-tab','webbing-loop','side-piping','pull-loop'])assert.equal(g.getObjectByName(name),undefined,`no ${name}`);
  assert.equal(named(g,'eyelet').length,2*2*spec.eyelets.length);assert.equal(named(g,'logo').length,4,'an N on both sides of each shoe');
  // Not raised, sole on the floor, her round socks replaced by the shoe's ankle socks.
  assert.equal(outfit.userData.lift,0);assert.equal(doll.position.y,0);assert.ok(Math.abs(new T.Box3().setFromObject(g).min.y)<.002);
  doll.traverse(o=>{if(o.name==='sock')assert.equal(o.visible,false);});
  // The cupsole: a grey outsole under a cream midsole, rising higher at the heel than under the arch.
  const out=named(g,'outsole')[0],mid=named(g,'lug-sole')[0];assert.notEqual(out.material.color.getHexString(),mid.material.color.getHexString());
  assert.ok(new T.Box3().setFromObject(out).max.y<new T.Box3().setFromObject(mid).max.y);
  let heel=0,arch=0;const pos=out.geometry.attributes.position,q=new T.Vector3();
  for(let i=0;i<pos.count;i++){q.fromBufferAttribute(pos,i).applyMatrix4(out.matrixWorld);if(q.z<-.15)heel=Math.max(heel,q.y);else if(Math.abs(q.z-.08)<.02)arch=Math.max(arch,q.y);}
  assert.ok(heel>arch+.02*.76,'outsole rises round the heel');
  // The N lies on the outside of the upper, below its collar.
  const uppers=around(named(g,'boot-upper'));let onTop=0;
  for(const logo of named(g,'logo'))eachVertex(logo,p=>{const c=cast(uppers,Math.sign(p.x)*spec.cx,p);if(!c||!c.hit)return;onTop++;assert.ok(c.hit.distance<c.r,'the N sinks into the upper');});
  assert.ok(onTop>100,`checked ${onTop}`);
  // The ankle socks stay inside the shoe below its collar, and her legs inside the ankle socks.
  let inside=0;for(const sk of named(g,'ankle-sock'))eachVertex(sk,p=>{const y=p.y/.76;if(y<spec.sole.top+.03||y>spec.collar.side-.02)return;const c=cast(uppers,Math.sign(p.x)*spec.cx*1.06,p);if(!c)return;assert.ok(c.hit&&c.hit.distance>c.r,'sock shows through the shoe');inside++;});
  assert.ok(inside>20);
  const socks=around(named(g,'ankle-sock')),top=spec.sock.rows.at(-1)[0];let checked=0;
  doll.traverse(o=>{if(o.name!=='leg')return;eachVertex(o,p=>{const y=p.y/.76;if(y>top-.008)return;const c=cast(socks,Math.sign(p.x)*spec.sock.cx*1.06,p.clone().setZ(p.z-spec.sock.z));if(!c)return;assert.ok(c.hit&&c.hit.distance>c.r,'leg shows through the ankle sock');checked++;});});
  assert.ok(checked>20,`checked ${checked}`);
  [outfit,doll].forEach(disposeObject);
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

test('Converse Modern Lift high-tops: stacked platform, seven eyelets, inner ankle patch and vents, a shaft that hugs her leg over hidden socks',()=>{
  const spec=GARMENTS[CONVERSE_LIFT_HI_ID].build,outfit=makeOutfit({shoesId:CONVERSE_LIFT_HI_ID,dressId:'navy-half-zip-track-dress-v1'}),doll=makeDoll();fitDoll(doll,outfit);
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);const shoes=outfit.getObjectByName('shoes');
  for(const name of ['lug-sole','sole-stitch','boot-upper','tongue','eyelet','lace','lace-bow','ankle-patch','vent-eyelet'])assert.ok(shoes.getObjectByName(name),name);
  // The rubber toe cap: the sole's material, over the front of each toe.
  const caps=named(shoes,'toe-cap');assert.equal(caps.length,4,'a cap half on each side of each toe');assert.equal(caps[0].material,named(shoes,'lug-sole')[0].material,'rubber, like the sole');
  // Every half faces out of the shoe (one half once came out inside-out and was lit like the inside, so the cap
  // looked like half a cap).
  for(const c of caps){const b=new T.Box3().setFromObject(c);assert.ok(b.max.z>.4&&b.max.y/.76>.16,'over the front of the toe, up the toe box');
    const n=c.geometry.attributes.normal;let nz=0;for(let i=0;i<n.count;i++)nz+=n.getZ(i);assert.ok(nz/n.count>.2,`cap faces out (${(nz/n.count).toFixed(2)})`);}
  assert.equal(named(shoes,'eyelet').length,2*2*7);assert.equal(named(shoes,'vent-eyelet').length,4);assert.equal(named(shoes,'ankle-patch').length,2);
  assert.equal(named(shoes,'sole-stitch').length,4,'two stitch lines round each sole');
  // Not raised: the platform stays within her foot height.
  assert.ok(!outfit.userData.lift);
  // The ankle patch and vents are on the inner side of each foot.
  for(const name of ['ankle-patch','vent-eyelet'])for(const o of named(shoes,name)){const x=o.getWorldPosition(new T.Vector3()).x/1.06;assert.ok(Math.abs(x)<spec.cx,`${name} on the inner side (${x.toFixed(3)})`);}
  // The stacked platform: grooves cut into the sidewall at each layer.
  const sole=named(shoes,'lug-sole')[0].geometry.attributes.position;let grooves=0;for(let i=0;i<sole.count;i++){const y=sole.getY(i);if(spec.sole.ribs.some(r=>Math.abs(y-r)<.003))grooves++;}assert.ok(grooves>500,'grooves between the layers');
  // Her socks are covered, so hidden; her leg stays inside the shaft up to the collar.
  doll.traverse(o=>{if(o.name==='sock')assert.equal(o.visible,false,'socks hidden');});
  const uppers=around(named(shoes,'boot-upper')),top=Math.min(...Object.values(spec.collar));let checked=0;
  doll.traverse(o=>{if(o.name!=='leg')return;eachVertex(o,p=>{const y=p.y/.76;if(y<spec.sole.top+.03||y>top-.01)return;
    const c=cast(uppers,Math.sign(p.x)*spec.cx*1.06,p);if(!c)return;assert.ok(c.hit&&c.hit.distance>c.r+.002,`leg shows through the shaft at y ${y.toFixed(3)}`);checked++;});});
  assert.ok(checked>30,`checked ${checked}`);
  // The shaft hugs her leg: just below the collar it is barely wider than her leg.
  const shaft=new T.Box3();for(const u of named(shoes,'boot-upper')){const pos=u.geometry.attributes.position,v=new T.Vector3();for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(u.matrixWorld);if(v.x>0&&Math.abs(v.y/.76-(top-.03))<.01)shaft.expandByPoint(v);}}
  assert.ok(shaft.max.z-shaft.min.z<.2,`shaft depth ${(shaft.max.z-shaft.min.z).toFixed(3)}`);
  [doll,outfit].forEach(disposeObject);
  // The existing laced shoes do not carry the new parts.
  for(const id of [BUFFALO_ASPHA_ID,UGG_LOWMEL_ID]){const o=makeOutfit({shoesId:id});for(const name of ['sole-stitch','ankle-patch','vent-eyelet'])assert.equal(named(o,name).length,0,`${id} has no ${name}`);disposeObject(o);}
});
