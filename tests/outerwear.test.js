import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS, MARIKOO_WINDBREAKER_ID, DESIGUAL_LEATHER_JACKET_ID } from '../src/wardrobe/catalog.js';
const outerwear=Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='outerwear');
const tops=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='top')];
const bottoms=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='bottom')];
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};

test('outerwear slot: none by default, and only outerwear fills it',()=>{
  assert.equal(cleanRecipe(null).outerwearId,'none');assert.equal(cleanRecipe({outerwearId:MARIKOO_WINDBREAKER_ID}).outerwearId,MARIKOO_WINDBREAKER_ID);
  assert.equal(cleanRecipe({outerwearId:'mango-plaid-jumper-v1'}).outerwearId,'none','a top cannot be worn as outerwear');
  assert.equal(cleanRecipe({topId:MARIKOO_WINDBREAKER_ID}).topId,'classic','outerwear cannot be worn as a top');
  const without=makeOutfit({});assert.equal(without.getObjectByName('outerwear'),undefined,'looks without outerwear are unchanged');disposeObject(without);
});

test('Marikoo windbreaker: zipped closed, with its yoke, hood, cords, snap pockets and elastic hem and cuffs',()=>{
  const outfit=makeOutfit({outerwearId:MARIKOO_WINDBREAKER_ID}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['elastic-hem-band',1],['collar-lining',1],['coil-zip',1],['zip-slider',1],['zip-stop',1],['pocket-welt',2],['pocket-opening',2],['snap-button',4],['drawcord',2],['cord-eyelet',2],['hood',1],['hood-edge',1],['hood-seam',1],['hood-opening',1],['hood-label',1],['back-label',1],['jacket-sleeve',2],['elastic-cuff',2],['sleeve-badge',1]])
    assert.equal(named(jacket,name).length,count,name);
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // Colour layout, read from the body texture at angle a (0 = centre front) and height y: ecru yoke over blue, the yoke's
  // lower edge a V at the front (lower at the zip than at the sides), straight across the back, and blue collar above.
  const map=named(jacket,'jacket-body')[0].material.map,{data,width:w,height:h}=map.image;
  const colour=(a,y)=>{const i=Math.round(a/(Math.PI*2)*w)%w,j=Math.round((y-1)*h),k=(j*w+i)*4;return data[k]>150?'ecru':'blue';};
  const edge=a=>{let y=1.2;while(y<1.85&&colour(a,y)==='blue')y+=.002;return y;};
  assert.equal(colour(0,1.6),'ecru');assert.equal(colour(0,1.3),'blue');assert.equal(colour(Math.PI,1.95),'blue');
  assert.ok(edge(Math.PI/2)-edge(.15)>.07,'front yoke ends in a V pointing down to the zip');
  assert.ok(Math.abs(edge(Math.PI*.85)-edge(Math.PI*1.15))<.005&&Math.abs(edge(Math.PI)-edge(Math.PI*.85))<.005,'back yoke ends straight across');
  // The script is embroidered on her left chest (+x), above the yoke's edge.
  let thread=0;for(let j=Math.round(.45*h);j<Math.round(.6*h);j++)for(let i=0;i<w/4;i++){const k=(j*w+i)*4;if(data[k+2]-data[k]>30&&data[k]>60)thread++;}
  assert.ok(thread>20,'embroidered script on the left chest');
  // The badge is on her left sleeve only.
  const badge=named(jacket,'sleeve-badge')[0];badge.updateWorldMatrix(true,false);assert.ok(badge.getWorldPosition(new T.Vector3()).x>.3);
  // Hip length: the hem band sits below every top's hem and over the top of the legs.
  const box=new T.Box3().setFromObject(named(jacket,'elastic-hem-band')[0]);assert.ok(box.min.y/.76>1.04&&box.min.y/.76<1.08,`hem at ${box.min.y/.76}`);
  disposeObject(outfit);
  // Building an outfit with the jacket stays quick (the app rebuilds the outfit on every change).
  const t0=performance.now();disposeObject(makeOutfit({outerwearId:MARIKOO_WINDBREAKER_ID}));assert.ok(performance.now()-t0<600,'outfit build time');
});

test('outerwear covers every top, every bottom and the skirt from its hem to its collar, apart from an open front',()=>{
  // A point is covered when it lies inside the jacket's outermost surface along the ray from her centre line: the body, or
  // a sleeve where a top wraps over her arm. A fitted jacket depends on what is under it, so each outfit's own jacket is
  // indexed by height band, and each ray only tests the triangles at its height. Open, the front between its edges is
  // meant to show what is underneath.
  const check=(id,open,skirt,recipe,layer)=>{
    const outfit=makeOutfit({...recipe,outerwearId:id,outerwearOpen:open,skirt});outfit.updateMatrixWorld(true);
    const jacket=outfit.getObjectByName('outerwear'),spec=GARMENTS[id].build.body,covering=[];jacket.traverse(o=>{if(o.userData.covering)covering.push(o);});
    assert.ok(covering.length>=5,`${id}: body, band, sleeves and cuffs cover`);
    const bands=new Map(),band=y=>Math.floor(y/.004);
    for(const m of covering){const g=m.geometry,pos=g.attributes.position,idx=g.index;
      for(let i=0;i<idx.count;i+=3){const tri=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(pos,idx.getX(i+k)).applyMatrix4(m.matrixWorld));
        for(let b=band(Math.min(...tri.map(v=>v.y)));b<=band(Math.max(...tri.map(v=>v.y)));b++){if(!bands.has(b))bands.set(b,[]);bands.get(b).push(tri);}}}
    const ray=new T.Ray(),hit=new T.Vector3(),axis=new T.Vector3(0,1,0),surface=new Map();
    const coverAt=(y,a)=>{const key=Math.round(y/.001)+':'+Math.round(a/(Math.PI/360));
      if(!surface.has(key)){ray.origin.set(0,y,0);ray.direction.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5);let best=0;
        for(const [p0,p1,p2] of bands.get(band(y))||[])if(ray.intersectTriangle(p0,p1,p2,false,hit))best=Math.max(best,hit.distanceTo(ray.origin));
        surface.set(key,best);}
      return surface.get(key);};
    const p=new T.Vector3();let checked=0;
    for(const child of outfit.children){if(!layer(child.name))continue;child.traverse(o=>{if(!o.geometry||!visible(o))return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(y<spec.hem+.004||y>spec.collarBase)continue;
        const radius=Math.hypot(p.x,p.z);if(radius<.01)continue;
        if(open&&Math.abs(Math.atan2(p.x/1.06,p.z))<jacket.userData.opening(y)+.05)continue;
        assert.ok(coverAt(p.y,Math.atan2(p.x,p.z))>radius+.001,`${o.name} of ${JSON.stringify(recipe)} shows through ${id}${open?' (open)':''}${skirt?' over the skirt':''} at y ${y.toFixed(3)}`);checked++;}});}
    disposeObject(outfit);return checked;};
  for(const id of outerwear)for(const open of GARMENTS[id].layering?.canOpen?[false,true]:[false])for(const skirt of [false,true]){
    for(const topId of tops)assert.ok(check(id,open,skirt,{topId,knit:topId==='classic',shirt:topId==='classic'},n=>!['trousers','shoes','layered-skirt','outerwear'].includes(n))>100,topId);
    for(const bottomId of bottoms)assert.ok(check(id,open,skirt,{bottomId,topId:'desigual-silver-cable-jumper-v1'},n=>n==='trousers')>20,bottomId);
    if(skirt)assert.ok(check(id,open,skirt,{},n=>n==='layered-skirt')>50,'skirt');
  }
});

test('under closed outerwear the top sleeves are hidden, and her arms and hands stay inside its sleeves and cuffs',()=>{
  for(const id of outerwear)for(const topId of tops){
    const outfit=makeOutfit({topId,knit:topId==='classic',outerwearId:id,skirt:true});
    let sleeves=0;for(const layer of outfit.children)if(layer.name!=='outerwear')layer.traverse(o=>{if(o.isMesh&&/sleeve/.test(o.name)){sleeves++;assert.ok(!visible(o),`${topId}: ${o.name} is hidden`);}});
    assert.ok(sleeves>=2,`${topId} has sleeves to hide`);
    // Only the sleeves: the rest of the top is still worn under the jacket.
    let body=0;for(const layer of outfit.children)if(!['outerwear','trousers','shoes','layered-skirt'].includes(layer.name))layer.traverse(o=>{if(o.isMesh&&/body/.test(o.name)&&visible(o))body++;});
    assert.ok(body>=1,`${topId}: its body stays on under the jacket`);
    assert.equal(named(outfit,'ribbon-loop').length,0,'the skirt bow is under the jacket');
    disposeObject(outfit);
  }
  for(const id of outerwear){
    const doll=makeDoll(),outfit=makeOutfit({outerwearId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
    const sleeves=named(outfit,'jacket-sleeve'),cuffs=[];outfit.traverse(o=>{if(o.userData.cuff)cuffs.push(o);});const S=GARMENTS[id].build.sleeve,ray=new T.Raycaster(),p=new T.Vector3(),origin=new T.Vector3();let checked=0;
    // Every point of her arms, hands and thumbs down to the cuff's lower edge is inside the sleeve, with clearance.
    const parts=['arm','tiny-mitten','mitten-thumb'].flatMap(n=>named(doll,n));
    for(let side=0;side<2;side++){const sleeve=sleeves[side],cuff=cuffs[side],sign=side?1:-1;
      for(const part of parts){if(Math.sign(part.position.x)!==sign)continue;const pos=part.geometry.attributes.position;
        for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(part.matrixWorld);sleeve.worldToLocal(p);if(p.y<S.cuff[1]+.004)continue;
          origin.set(0,Math.min(p.y,0),0);const r=p.distanceTo(origin);if(r<.01)continue;sleeve.localToWorld(origin);sleeve.localToWorld(p);
          ray.set(origin,p.clone().sub(origin).normalize());const hit=ray.intersectObjects([sleeve,cuff],false)[0];
          assert.ok(hit&&hit.distance>p.distanceTo(origin)+.002,`${id}: ${part.name} ${side} pokes through the sleeve at vertex ${i}`);checked++;}}}
    assert.ok(checked>300,`checked ${checked}`);disposeObject(doll);disposeObject(outfit);
  }
});

test('Desigual leather jacket: crinkled gloss, point collar, zip and flap pockets, rib band and tabbed cuffs',()=>{
  const outfit=makeOutfit({outerwearId:DESIGUAL_LEATHER_JACKET_ID}),jacket=outfit.getObjectByName('outerwear');
  outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['rib-hem-band',1],['metal-zip',1],['zip-slider',1],['point-collar',1],['collar-fold',1],['yoke-seam',2],['panel-seam',2],['zip-pocket-welt',2],['pocket-zip',2],['pocket-zip-pull',2],['flap-pocket',2],['pocket-flap',2],['pocket-snap',2],['centre-back-seam',1],['back-panel-seam',2],['jacket-sleeve',2],['leather-cuff',2],['cuff-tab',2],['cuff-stud',2]])
    assert.equal(named(jacket,name).length,count,name);
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // Glossy crinkled leather: a coat over the leather, both with the crinkle's normal map; a matte rib band.
  const leather=named(jacket,'jacket-body')[0].material;
  assert.ok(leather.clearcoat>.4&&leather.normalMap&&leather.clearcoatNormalMap===leather.normalMap,'crinkled gloss');
  assert.ok(named(jacket,'rib-hem-band')[0].material.roughness>.9,'matte rib');
  // The collar's points lie on her chest either side of the zip, below the fold.
  const box=new T.Box3().setFromObject(named(jacket,'point-collar')[0]);assert.ok(box.min.y/.76<1.8,`collar points reach ${(box.min.y/.76).toFixed(3)}`);
  // Cropped at the waist: the band ends above the windbreaker's hip-length hem.
  const band=new T.Box3().setFromObject(named(jacket,'rib-hem-band')[0]);assert.ok(band.min.y/.76>1.11&&band.min.y/.76<1.16,`hem at ${band.min.y/.76}`);
  disposeObject(outfit);
  const t0=performance.now();disposeObject(makeOutfit({outerwearId:DESIGUAL_LEATHER_JACKET_ID}));assert.ok(performance.now()-t0<600,'outfit build time');
});

test('worn open: only outerwear designed for it opens; the leather jacket hangs open with a zip half on each front and fits what is under it',()=>{
  assert.equal(cleanRecipe({outerwearId:MARIKOO_WINDBREAKER_ID,outerwearOpen:true}).outerwearOpen,false,'the windbreaker is only worn closed');
  assert.equal(cleanRecipe({outerwearId:DESIGUAL_LEATHER_JACKET_ID,outerwearOpen:true}).outerwearOpen,true);
  assert.equal(cleanRecipe({outerwearId:DESIGUAL_LEATHER_JACKET_ID,outerwearOpen:'yes'}).outerwearOpen,false);
  const open=makeOutfit({outerwearId:DESIGUAL_LEATHER_JACKET_ID,outerwearOpen:true}),jacket=open.getObjectByName('outerwear');
  assert.equal(named(jacket,'metal-zip').length,0);assert.equal(named(jacket,'metal-zip-half').length,2);assert.equal(named(jacket,'front-facing').length,2);
  // Open, the classic shirt's collar shows; zipped, the jacket closes over it.
  assert.ok(visible(named(open,'shirt-collar')[0]));
  const closed=makeOutfit({outerwearId:DESIGUAL_LEATHER_JACKET_ID});assert.ok(!visible(named(closed,'shirt-collar')[0]));
  // The front edges hang apart at the chest, and the fronts still meet nothing in between: no jacket vertex lies there.
  const p=new T.Vector3();let inGap=0;jacket.updateMatrixWorld(true);
  for(const name of ['jacket-body','rib-hem-band'])for(const m of named(jacket,name)){const pos=m.geometry.attributes.position;for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);if(p.z>0&&Math.abs(p.x)<.07&&p.y<1.8)inGap++;}}
  assert.equal(inGap,0,'nothing spans the open front');
  // Fitted: slim over a slim top, easing out over a chunky jumper, 
  const width=recipe=>{const o=makeOutfit({...recipe,outerwearId:DESIGUAL_LEATHER_JACKET_ID});const b=new T.Box3().setFromObject(o.getObjectByName('outerwear').getObjectByName('jacket-body'));disposeObject(o);return b.max.z-b.min.z;};
  const slim=width({topId:'desigual-silver-cable-jumper-v1'}),chunky=width({topId:'mango-plaid-jumper-v1'});
  assert.ok(chunky>slim+.02,`eases out over a chunky jumper (${slim.toFixed(3)} → ${chunky.toFixed(3)})`);
  [open,closed].forEach(disposeObject);
});

test('UI: choosing outerwear is saved with the look, and its study wears it',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;let last=null;
  const app=await startStudio(d,()=>({update(r){last=r;},turn(){},dispose(){}}));
  const select=d.getElementById('outerwear-select');assert.deepEqual([...select.options].map(o=>o.value),['none',...outerwear]);
  select.value=MARIKOO_WINDBREAKER_ID;select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(app.getRecipe().outerwearId,MARIKOO_WINDBREAKER_ID);assert.equal(last.outerwearId,MARIKOO_WINDBREAKER_ID);
  d.getElementById('save').click();assert.equal(JSON.parse(dom.window.localStorage.getItem('fashiongirly.plush-looks.v1'))[0].outerwearId,MARIKOO_WINDBREAKER_ID);
  const openBox=d.getElementById('outerwear-open');assert.equal(openBox.disabled,true,'the windbreaker is worn closed');assert.equal(openBox.checked,false);
  // The leather jacket starts open, as the user wears it, and can be zipped.
  select.value=DESIGUAL_LEATHER_JACKET_ID;select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(app.getRecipe().outerwearOpen,true);assert.equal(openBox.disabled,false);assert.equal(openBox.checked,true);
  openBox.checked=false;openBox.dispatchEvent(new dom.window.Event('change'));assert.equal(app.getRecipe().outerwearOpen,false);assert.equal(last.outerwearOpen,false);
  d.getElementById('reset').click();assert.equal(app.getRecipe().outerwearId,'none');assert.equal(select.value,'none');
  for(const id of outerwear)assert.ok(OUTFITS.some(look=>look.recipe.outerwearId===id),`a study preset wears ${id}`);
  const study=OUTFITS.find(look=>look.recipe.outerwearId===MARIKOO_WINDBREAKER_ID);
  [...d.getElementById('outfit-ideas').children].find(b=>b.textContent===study.name).click();assert.equal(select.value,MARIKOO_WINDBREAKER_ID);
  app.dispose();dom.window.close();
});
