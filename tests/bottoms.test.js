import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe, editRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { levelCaster } from '../src/doll/level-caster.js';
// A trouser leg's own caster, around its centre line, where the leg checks start their rays.
const legCasters=new WeakMap(),castFrom=(leg,origin,dir)=>{
  if(!legCasters.has(leg))legCasters.set(leg,levelCaster([leg],{axis:[new T.Box3().setFromObject(leg).getCenter(new T.Vector3()).x,0]}));
  return legCasters.get(leg)(origin,dir);};
// Bottoms: the bottom slot, each pair of jeans or trousers, and every top that covers the waist worn over each of them.
test('bottom slot: barrel jeans replace the classic jeans and only accept bottoms',async()=>{
  const id='topshop-barrel-jeans-v1';
  assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  assert.equal(cleanRecipe({topId:id}).topId,'classic','a bottom cannot be worn as a top');
  assert.equal(cleanRecipe({bottomId:'mango-plaid-jumper-v1'}).bottomId,'classic','a top cannot be worn as a bottom');
  assert.equal(cleanRecipe(null).bottomId,'classic');
  assert.equal(editRecipe(cleanRecipe({bottomId:id}),'wider jeans').changes.length,0,'width edits apply only to the classic jeans');
  const outfit=makeOutfit({bottomId:id});
  for(const name of ['jeans-hips','jeans-waistband','shank-button','twisted-side-seam','knee-dart','back-patch-pocket','pocket-flap','suede-patch'])assert.ok(outfit.getObjectByName(name),name);
  let legs=0;outfit.traverse(o=>{if(o.name==='barrel-leg')legs++;if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));});assert.equal(legs,2);
  assert.equal(outfit.getObjectByName('jean-cuff'),undefined,'classic jeans are not also built');
  // With the bundled swatch loaded, every denim surface samples it rather than the fallback colour.
  const swatch=new T.DataTexture(new Uint8Array([46,58,66,255]),1,1),withSwatch=makeOutfit({bottomId:id},{[id]:swatch});
  withSwatch.traverse(o=>{if(['barrel-leg','jeans-hips','back-patch-pocket'].includes(o.name))assert.equal(o.material.map.source,swatch.source,o.name);});
  disposeObject(withSwatch);swatch.dispose();
  // Fit from the photos: wide and nearly straight (not ballooning), and long enough to reach the shoes.
  outfit.updateMatrixWorld(true);const leg=[];outfit.traverse(o=>{if(o.name==='barrel-leg')leg.push(o);});
  const width=(y0,y1)=>{const b=new T.Box3(),p=new T.Vector3(),pos=leg[0].geometry.attributes.position;for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);if(p.y>=y0&&p.y<=y1)b.expandByPoint(p);}return b.max.x-b.min.x;};
  assert.ok(width(.5,.6)/width(.25,.3)<1.08,'leg stays nearly straight from knee to hem');
  assert.ok(new T.Box3().setFromObject(leg[0]).min.y<.07,'hem reaches down to the shoes (world units, outfit scaled by .76)');
  disposeObject(outfit);
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;
  const app=await startStudio(d,async()=>({update(){},turn(){},dispose(){}}));
  const select=d.getElementById('bottom-select');select.value=id;select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(app.getRecipe().bottomId,id);assert.equal(d.getElementById('barrel').disabled,true);
  d.getElementById('save').click();assert.equal(JSON.parse(dom.window.localStorage.getItem('fashiongirly.plush-looks.v1'))[0].bottomId,id);
  app.dispose();dom.window.close();
});

test('Davinia jeans: cropped slim legs clear her legs and socks, with their details',()=>{
  const id='desigual-davinia-jeans-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  for(const name of ['frayed-waistband','scoop-pocket-stitch','coin-pocket-stitch','embroidered-heart','abrasion','leather-patch','frayed-hem','back-patch-pocket'])assert.ok(outfit.getObjectByName(name),name);
  assert.equal(outfit.getObjectByName('pocket-flap'),undefined,'plain back pockets');
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});assert.equal(legs.length,2);
  const hem=Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y));assert.ok(hem>.33*.76,'cropped above the ankle');
  // Every doll leg and sock vertex between the hem and the crotch lies inside its jeans leg.
  const p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
      const c=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      // Nudged off the leg's closing seam, where a ray along the shared edge can slip between its two triangles.
      const h=castFrom(leg,origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
      assert.ok(h&&h.distance>r+.001,`${o.name} vertex ${i} shows through the Davinia leg`);checked++;}});
  assert.ok(checked>200,`checked ${checked}`);disposeObject(doll);disposeObject(outfit);
});

test("Levi's '94 jeans: wide full-length legs resting on the shoes, with their back-pocket details",()=>{
  const id='levis-94-wide-leg-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  for(const name of ['arcuate-stitch','pocket-tab','frayed-pocket-edge','pocket-nick','printed-patch','patch-print','coin-pocket-stitch','back-patch-pocket'])assert.ok(outfit.getObjectByName(name),name);
  let tabs=0;outfit.traverse(o=>{if(o.name==='pocket-tab')tabs++;});assert.equal(tabs,1,'one tab, on the right back pocket');
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});assert.equal(legs.length,2);
  // Full length, as the user wears them: the hem comes down over the shoes to the floor around them.
  let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  const hem=Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y));
  assert.ok(hem<shoeTop*.6,'hem reaches down over the shoes');
  // Wide leg: the hem is wider than the knee, and the two legs never cross each other.
  const width=(leg,y0,y1)=>{const b=new T.Box3(),p=new T.Vector3(),pos=leg.geometry.attributes.position;for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);if(p.y>=y0&&p.y<=y1)b.expandByPoint(p);}return b;};
  assert.ok(width(legs[0],.32,.36).getSize(new T.Vector3()).x>width(legs[0],.55,.6).getSize(new T.Vector3()).x,'widens toward the hem');
  const [l,r]=legs.map(leg=>width(leg,.32,.4)).sort((a,b)=>a.min.x-b.min.x);assert.ok(l.max.x<=r.min.x+.012,'legs do not cross');
  disposeObject(doll);disposeObject(outfit);
});

test('Tommy mom jeans: ultra high rise, tapered to the ankle, with rivets, pocket bars and badges',()=>{
  const id='tommy-ultra-high-mom-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('rivet'),4);assert.equal(count('pocket-bar-stitch'),4,'two bars on each back pocket');assert.equal(count('pocket-badge'),1);
  for(const name of ['coin-badge','flag-patch','patch-block','scoop-pocket-stitch','coin-pocket-stitch'])assert.ok(outfit.getObjectByName(name),name);
  // Ultra high rise: the waistband sits higher than any other pair's.
  const top=new T.Box3().setFromObject(outfit.getObjectByName('jeans-waistband')).max.y/.76;assert.ok(top>1.35,`waistband top ${top}`);
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});
  const width=(leg,y0,y1)=>{const b=new T.Box3(),p=new T.Vector3(),pos=leg.geometry.attributes.position;for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);if(p.y>=y0&&p.y<=y1)b.expandByPoint(p);}return b.getSize(new T.Vector3()).x;};
  assert.ok(width(legs[0],.24,.27)<width(legs[0],.85,.9)*.87,'tapers to the ankle');
  let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  const hem=Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y));assert.ok(hem>shoeTop&&hem<.26*.76,'ends at the ankle, above the shoes');
  // The tapered legs still cover her legs and socks all the way down to the hem.
  const p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
      const c=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      const h=castFrom(leg,origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
      assert.ok(h&&h.distance>r+.001,`${o.name} vertex ${i} shows through the Tommy leg`);checked++;}});
  assert.ok(checked>200);disposeObject(doll);disposeObject(outfit);
});

test('Stradivarius relaxed jeans: plain five-pocket, wide full-length legs resting on the shoes',()=>{
  const id='stradivarius-relaxed-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('rivet'),4);assert.equal(count('back-patch-pocket'),2);
  for(const name of ['scoop-pocket-stitch','coin-pocket-stitch','paper-patch'])assert.ok(outfit.getObjectByName(name),name);
  for(const name of ['pocket-flap','arcuate-stitch','pocket-tab','pocket-bar-stitch'])assert.equal(count(name),0,`plain back pockets: no ${name}`);
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});
  let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  assert.ok(Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y))<shoeTop*.6,'full length, down over the shoes');
  const [l,r]=legs.map(leg=>new T.Box3().setFromObject(leg)).sort((a,b)=>a.min.x-b.min.x);assert.ok(l.max.x<=r.min.x+.03,'legs stay apart');
  disposeObject(doll);disposeObject(outfit);
});

test('Mango washed black jeans: high rise, back darts instead of a yoke, ankle length',()=>{
  const id='mango-washed-black-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('back-dart'),2);assert.equal(count('back-yoke'),0,'darts instead of a yoke');
  assert.equal(count('rivet'),6);assert.ok(outfit.getObjectByName('leather-patch'));assert.equal(count('back-patch-pocket'),2);
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});
  let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  const hem=Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y));assert.ok(hem>shoeTop&&hem<.26*.76,'ankle length, above the shoes');
  // Her legs and socks stay covered down to the hem.
  const p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
      const c=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      const h=castFrom(leg,origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
      assert.ok(h&&h.distance>r+.001,`${o.name} vertex ${i} shows through the Mango leg`);checked++;}});
  assert.ok(checked>200);disposeObject(doll);disposeObject(outfit);
});

test('Bershka grey jeans: whiskers and pale thigh panels, wide full-length legs resting on the shoes',()=>{
  const id='bershka-grey-wide-leg-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('back-patch-pocket'),2);assert.equal(count('rivet'),4);
  for(const name of ['back-yoke','woven-label','scoop-pocket-stitch','coin-pocket-stitch'])assert.ok(outfit.getObjectByName(name),name);
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});assert.equal(legs.length,2);
  let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  assert.ok(Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y))<shoeTop*.6,'full length, down over the shoes');
  const [l,r]=legs.map(leg=>new T.Box3().setFromObject(leg)).sort((a,b)=>a.min.x-b.min.x);assert.ok(l.max.x<=r.min.x+.03,'legs stay apart');
  // The wash: the middle of each thigh, front and back, is paler than the side seams.
  for(const leg of legs){const pos=leg.geometry.attributes.position,col=leg.geometry.attributes.color,band=[];
    for(let i=0;i<pos.count;i++)if(pos.getY(i)>.6&&pos.getY(i)<.85)band.push(i);
    const cx=band.reduce((s,i)=>s+pos.getX(i),0)/band.length,mid=[],side=[];
    for(const i of band){const a=Math.atan2(pos.getX(i)-cx,Math.abs(pos.getZ(i)));(Math.abs(a)<.35?mid:Math.abs(a)>1.3?side:[]).push(col.getX(i));}
    const mean=v=>v.reduce((s,x)=>s+x,0)/v.length;assert.ok(mean(mid)>mean(side)*1.25,`pale thigh panel ${mean(mid)} vs ${mean(side)}`);}
  disposeObject(doll);disposeObject(outfit);
});

test('Tommy carpenter jeans: ankle length, front panels, side pockets over the seams, badge, hammer loop and back-pocket tape on the right sides',()=>{
  const id='tommy-remastered-carpenter-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  // The user wears them at the ankle, above the shoes, with her legs and socks covered down to the hem.
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});
  let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  const hem=Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y));assert.ok(hem>shoeTop&&hem<.26*.76,'ankle length, above the shoes');
  const p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x)),c=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());
      origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      const h=castFrom(leg,origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));assert.ok(h&&h.distance>r+.001,`${o.name} vertex ${i} shows through the carpenter leg`);checked++;}});
  assert.ok(checked>200);disposeObject(doll);
  const all=name=>{const found=[];outfit.traverse(o=>{if(o.name===name)found.push(o);});return found;},centre=o=>new T.Box3().setFromObject(o).getCenter(new T.Vector3());
  assert.equal(all('carpenter-panel').length,2);assert.equal(all('side-patch-pocket').length,2);assert.equal(all('back-patch-pocket').length,2);
  // The flag badge is on the wearer's left side pocket, the hammer loop on the right, the striped tape on the right back pocket.
  const [badge]=all('side-pocket-badge'),[loop]=all('hammer-loop');assert.ok(centre(badge).x>0,'badge on the left thigh');assert.ok(centre(loop).x<0,'hammer loop on the right thigh');
  const tape=all('pocket-tape');assert.equal(tape.length,3,'navy, white and red stripes');
  const pocket=all('back-patch-pocket').find(o=>centre(o).x<0),pb=new T.Box3().setFromObject(pocket);
  for(const t of tape){const b=new T.Box3().setFromObject(t),c=centre(t);assert.ok(c.x<0&&c.z<0,'tape on the right back pocket');
    assert.ok(b.min.x>=pb.min.x-.002&&b.max.x<=pb.max.x+.002&&b.min.y>=pb.min.y-.002&&b.max.y<=pb.max.y+.002,'tape trimmed to the pocket');}
  // Each side pocket sits outside the side seam's stitching it covers.
  for(const side of [-1,1]){const p=all('side-patch-pocket').find(o=>Math.sign(centre(o).x)===side),seams=all('side-seam').filter(o=>Math.sign(centre(o).x)===side),pb2=new T.Box3().setFromObject(p);
    let seamOut=0;for(const s of seams){const pos=s.geometry.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y>pb2.min.y+.02&&y<pb2.max.y-.02)seamOut=Math.max(seamOut,Math.abs(pos.getX(i)));}}
    assert.ok(seamOut>0,'seam passes under the pocket');assert.ok(Math.max(Math.abs(pb2.min.x),Math.abs(pb2.max.x))>seamOut+.002,'pocket covers the seam');}
  disposeObject(outfit);
});

test('Zara cargo trousers: gathered elastic waist with a drawstring, flap cargo pockets, cuffed ankles and no jeans hardware',()=>{
  const id='zara-cargo-joggers-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const all=name=>{const found=[];outfit.traverse(o=>{if(o.name===name)found.push(o);});return found;},centre=o=>new T.Box3().setFromObject(o).getCenter(new T.Vector3());
  for(const name of ['shank-button','belt-loop','fly-stitch','rivet','back-patch-pocket','coin-pocket-stitch'])assert.equal(all(name).length,0,`no ${name}`);
  assert.equal(all('cargo-flap').length,2);assert.equal(all('side-patch-pocket').length,2);assert.equal(all('slant-pocket-stitch').length,2);
  // The drawstring hangs at the front with a metal tip on each end.
  const cords=all('drawstring');assert.equal(cords.length,2);assert.equal(all('drawstring-tip').length,2);for(const c of cords)assert.ok(centre(c).z>0,'drawstring at the front');
  // The waistband is gathered: its radius ripples round the waist.
  const wb=outfit.getObjectByName('jeans-waistband').geometry.attributes.position;let lo=Infinity,hi=0;
  for(let i=0;i<wb.count;i++){const r=Math.hypot(wb.getX(i)/.254,wb.getZ(i)/.167);lo=Math.min(lo,r);hi=Math.max(hi,r);}assert.ok(hi-lo>.04,`gathers ${hi-lo}`);
  // Cuffed at the ankle, above the shoes, with her legs and socks covered down to the hem.
  const legs=all('jeans-leg');let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  const hem=Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y));assert.ok(hem>shoeTop&&hem<.26*.76,'ankle length, above the shoes');
  const p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(centre(l).x)===Math.sign(p.x)),c=centre(leg);origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      const h=castFrom(leg,origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
      assert.ok(h&&h.distance>r+.001,`${o.name} vertex ${i} shows through the cargo leg`);checked++;}});
  assert.ok(checked>200);disposeObject(doll);disposeObject(outfit);
});

test('crystal jeans: a grid of crystals over the front panels only, clear of the waistband, with plain back and full-length legs',()=>{
  const id='crystal-straight-jeans-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const outfit=makeOutfit({bottomId:id});outfit.updateMatrixWorld(true);
  const grid=outfit.getObjectByName('crystal-grid');assert.ok(grid?.isInstancedMesh);assert.ok(grid.count>5000,`${grid.count} crystals`);
  // Each crystal sits in its own dark setting, which keeps the grid readable at a distance.
  assert.equal(outfit.getObjectByName('crystal-settings')?.count,grid.count);
  const m=new T.Matrix4(),p=new T.Vector3(),wb=GARMENTS[id].build.waistband;let left=0,right=0,low=Infinity;
  for(let k=0;k<grid.count;k++){grid.getMatrixAt(k,m);p.setFromMatrixPosition(m);
    assert.ok(p.z>0,`crystal ${k} on the back`);assert.ok(p.y<wb.y-wb.h/2,`crystal ${k} on the waistband`);if(p.x<0)right++;else left++;low=Math.min(low,p.y);}
  // Both legs are covered evenly, down toward the hem.
  assert.ok(Math.abs(left-right)<grid.count*.05,`left ${left} right ${right}`);assert.ok(low<.2,`lowest crystal at ${low}`);
  for(const name of ['coin-pocket-stitch','leather-patch','back-patch-pocket','abrasion'])assert.ok(outfit.getObjectByName(name),name);
  let shoeTop=-Infinity;outfit.traverse(o=>{if(o.name==='loafer')shoeTop=Math.max(shoeTop,new T.Box3().setFromObject(o).max.y);});
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});
  assert.ok(Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y))<shoeTop*.6,'full length, down over the shoes');
  disposeObject(outfit);
});

test('Topshop black wide crop jeans: flared legs to a raw frayed hem just above her ankle, tan topstitching with tonal side seams',()=>{
  const id='topshop-washed-black-wide-crop-v1';
  assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const outfit=makeOutfit({bottomId:id});outfit.updateMatrixWorld(true);const jeans=outfit.getObjectByName('trousers');
  const all=name=>{const found=[];jeans.traverse(o=>{if(o.name===name)found.push(o);});return found;};
  for(const name of ['leather-patch','shank-button','back-yoke'])assert.ok(all(name).length,name);
  assert.ok(all('frayed-hem').length>80,'a frayed raw hem round both legs');assert.equal(all('hem-stitch').length,0,'no stitched hem');
  // Cropped almost to her ankle (the user's fit): the hem sits above the loafers but well below her knee.
  const legs=all('jeans-leg'),box=new T.Box3();legs.forEach(l=>box.expandByObject(l));const hem=box.min.y/.76;
  assert.ok(hem>.26&&hem<.34,`hem at ${hem}`);
  // Wide legs flaring to the hem: each leg's cross-section (width by depth) is much larger at the hem than at the thigh.
  const size=(leg,y)=>{const p=leg.geometry.attributes.position,b=[Infinity,-Infinity,Infinity,-Infinity];for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-y)<.02){b[0]=Math.min(b[0],p.getX(i));b[1]=Math.max(b[1],p.getX(i));b[2]=Math.min(b[2],p.getZ(i));b[3]=Math.max(b[3],p.getZ(i));}return (b[1]-b[0])*(b[3]-b[2]);};
  for(const leg of legs)assert.ok(size(leg,hem+.03)>size(leg,.9)*1.35,`flared ${size(leg,hem+.03)/size(leg,.9)}`);
  // Tan topstitching on the pockets and fly; tonal side seams and inseams.
  const tan=all('fly-stitch')[0].material.color,seam=all('side-seam')[0].material.color;
  assert.ok(tan.r>tan.b*1.5,'tan topstitching');assert.ok(Math.abs(seam.r-seam.b)<.05&&seam.r<.1,'tonal side seams');
  disposeObject(outfit);
  // Other pairs keep their side seams in their topstitching thread.
  const mango=makeOutfit({bottomId:'mango-washed-black-v1'});const m=mango.getObjectByName('trousers');
  let seamColour,thread;m.traverse(o=>{if(o.name==='side-seam')seamColour=o.material.color;if(o.name==='fly-stitch')thread=o.material.color;});
  assert.ok(seamColour.equals(thread),'Mango side seams unchanged');disposeObject(mango);
});

test('every waist-covering top hides every bottom between its hem and the waist',()=>{
  const tops=Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='top'&&GARMENTS[id].layering?.coversWaistband);
  const bottoms=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='bottom')];
  for(const topId of tops){
    // The top's body (not its sleeves): her arms hang against her hips, so a high waistband passes inside the sleeves, hidden.
    // The top is the same whatever is worn under it, so it is built and measured once for all bottoms.
    const topOutfit=makeOutfit({topId});topOutfit.updateMatrixWorld(true);
    const covering=topOutfit.getObjectByName(topId).children.filter(o=>o.isMesh);
    const hem=Math.min(...covering.map(o=>new T.Box3().setFromObject(o).min.y))/.76;
    // The top's triangles, from both sides, indexed by height and angle around her centre line, so each ray only tests
    // the triangles it can reach.
    const top=levelCaster(covering,{axis:[0,0],faces:'both'}),origin=new T.Vector3(),dir=new T.Vector3(),axis=new T.Vector3(0,1,0);
    // The top's surface distance is cached per small cell (0.001 high, 0.5 degrees around): nearby trouser vertices
    // (stitch threads, fray) share one ray, which keeps this test quick without skipping any vertex.
    const surface=new Map(),coverAt=(y,a)=>{const key=Math.round(y/.001)+':'+Math.round(a/(Math.PI/360));
      if(!surface.has(key))surface.set(key,top(origin.set(0,y,0),dir.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5))?.distance||0);
      return surface.get(key);};
    for(const bottomId of bottoms){
    const outfit=makeOutfit({topId,bottomId});outfit.updateMatrixWorld(true);const p=new T.Vector3();let checked=0;
    // Instanced pieces (the crystal grid) are checked at every copy.
    const im=new T.Matrix4(),each=new T.Matrix4();
    outfit.getObjectByName('trousers').traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let k=0;k<(o.isInstancedMesh?o.count:1);k++){if(o.isInstancedMesh){o.getMatrixAt(k,im);each.multiplyMatrices(o.matrixWorld,im);}else each.copy(o.matrixWorld);
      for(let i=0;i<pos.count;i++){
        // Up to the top of the highest waistband (ultra high rise jeans reach her natural waist).
        p.fromBufferAttribute(pos,i).applyMatrix4(each);const y=p.y/.76;if(y<hem+.012||y>1.4)continue;
        const radius=Math.hypot(p.x,p.z);if(radius<.01)continue;
        assert.ok(coverAt(p.y,Math.atan2(p.x,p.z))>radius+.001,`${o.name} shows through ${topId} over ${bottomId} at vertex ${i}`);checked++;
      }}});
    assert.ok(checked>50,`${topId}/${bottomId} checked ${checked}`);disposeObject(outfit);
    }
    disposeObject(topOutfit);
  }
});
