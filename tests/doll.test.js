import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { DEFAULT, OUTFITS, cleanRecipe, editRecipe } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
test('lilac shirt clears the trousers and seams around its lower hem',()=>{
  for(const barrel of [0,.5,1]){
    const outfit=makeOutfit({topId:'lilac-portrait-mockneck-v1',barrel});outfit.updateMatrixWorld(true);
    const shirt=outfit.getObjectByName('reference-top-body'),pants=outfit.getObjectByName('trousers');
    const ray=new T.Raycaster(),p=new T.Vector3(),origin=new T.Vector3();let checked=0;
    pants.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){
        p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);shirt.worldToLocal(p);
        if(p.y<1.106||p.y>1.30)continue;
        origin.set(0,p.y,0);shirt.localToWorld(origin);shirt.localToWorld(p);
        const radius=p.distanceTo(origin);if(radius<.01)continue;
        ray.set(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-5));const hit=ray.intersectObject(shirt,false)[0];
        assert.ok(hit&&hit.distance>radius+.002,`${o.name} protrudes at vertex ${i}, barrel ${barrel}`);checked++;
      }
    });
    assert.ok(checked>100);disposeObject(outfit);
  }
});
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

test('reference garment keeps its identity, mapped details and layer exclusions',async()=>{
  const recipe=cleanRecipe({topId:'desigual-bronze-mesh-v1',knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  assert.equal(cleanRecipe({topId:'not-a-garment'}).topId,'classic');
  const atlas=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1);const outfit=makeOutfit(recipe,atlas);
  assert.ok(outfit.getObjectByName('desigual-bronze-mesh-v1'));assert.equal(outfit.getObjectByName('sweater'),undefined);
  let sleeves=0;outfit.traverse(o=>{if(o.name==='reference-fitted-sleeve')sleeves++;if(o.name==='reference-top-body'||o.name==='reference-fitted-sleeve'){assert.ok(o.material.map);assert.ok(o.material.alphaMap);for(const v of o.geometry.attributes.uv.array)assert.ok(v>=0&&v<=1);}});assert.equal(sleeves,2);
  assert.equal(editRecipe(recipe,'butter sweater').changes.length,0);
  disposeObject(outfit);atlas.dispose();
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;
  const app=await startStudio(d,async()=>({update(){},turn(){},dispose(){}}));
  const select=d.getElementById('top-select');select.value='desigual-bronze-mesh-v1';select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(app.getRecipe().topId,'desigual-bronze-mesh-v1');assert.equal(d.getElementById('shirt').disabled,true);
  d.getElementById('save').click();assert.equal(JSON.parse(dom.window.localStorage.getItem('fashiongirly.plush-looks.v1'))[0].topId,'desigual-bronze-mesh-v1');
  app.dispose();dom.window.close();
});
test('reference sleeves cover the upper arm with clearance and round over the shoulder',()=>{
  for(const topId of Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='top')){
  const doll=makeDoll(),outfit=makeOutfit({topId});
  doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const arms=[],sleeves=[];
  doll.traverse(o=>{if(o.name==='arm')arms.push(o);});
  outfit.traverse(o=>{if(['reference-fitted-sleeve','crochet-flared-sleeve','knit-jumper-sleeve'].includes(o.name))sleeves.push(o);});
  const ray=new T.Raycaster(),point=new T.Vector3(),origin=new T.Vector3();let checked=0;
  for(let side=0;side<2;side++){
    const arm=arms[side],sleeve=sleeves[side],vertices=arm.geometry.attributes.position,bare=GARMENTS[topId].layering?.bareShoulder;
    for(let i=0;i<vertices.count;i+=2){
      point.fromBufferAttribute(vertices,i).applyMatrix4(arm.matrixWorld);sleeve.worldToLocal(point);
      if(point.y<-.44)continue;
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

test('lilac top has distinct front/back materials and its own collar, without mesh cutouts',()=>{
  const atlas=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1);
  const id='lilac-portrait-mockneck-v1',recipe=cleanRecipe({topId:id}),outfit=makeOutfit(recipe,{[id]:atlas});
  assert.equal(recipe.topId,id);assert.equal(recipe.knit,false);assert.ok(outfit.getObjectByName('ribbed-mock-neck'));
  const body=outfit.getObjectByName('reference-top-body');assert.equal(body.material.length,2);assert.equal(body.geometry.groups.length,2);
  assert.ok(body.material[0].map.offset.x<body.material[1].map.offset.x);
  for(const mat of body.material){assert.equal(mat.alphaMap,null);assert.equal(mat.alphaTest,0);}
  const pos=body.geometry.attributes.position,index=body.geometry.index;
  for(const group of body.geometry.groups)for(let i=group.start;i<group.start+group.count;i+=3){
    const z=pos.getZ(index.getX(i))+pos.getZ(index.getX(i+1))+pos.getZ(index.getX(i+2));
    assert.ok(group.materialIndex===0?z>=0:z<0);
  }
  disposeObject(outfit);atlas.dispose();
});

test('crochet top keeps open motifs, scalloped edges and clears the skirt',()=>{
  const id='desigual-crochet-flowers-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true,skirt:true}),outfit=makeOutfit(recipe);
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  for(const name of ['crochet-body','filet-neckband','scalloped-hem-trim'])assert.ok(outfit.getObjectByName(name),name);
  let sleeves=0,cuffs=0;outfit.traverse(o=>{if(o.name==='crochet-flared-sleeve')sleeves++;if(o.name==='scalloped-cuff-trim')cuffs++;});assert.equal(sleeves,2);assert.equal(cuffs,2);
  const body=outfit.getObjectByName('crochet-body'),map=body.material.map,pixels=map.image.data;
  let open=0;for(let i=3;i<pixels.length;i+=4)if(!pixels[i])open++;
  const fraction=open/(map.image.width*map.image.height);assert.ok(fraction>.05&&fraction<.3,`openwork fraction ${fraction}`);assert.ok(body.material.alphaTest>0);
  for(const v of body.geometry.attributes.uv.array)assert.ok(v>=0&&v<=1);
  // Scallops: the hem edge rises and falls, and every hem vertex sits outside the skirt waistband.
  const p=body.geometry.attributes.position;let low=Infinity,high=-Infinity;
  for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>1.3)continue;low=Math.min(low,y);high=Math.max(high,y);
    assert.ok(y>1.258||(p.getX(i)/.294)**2+(p.getZ(i)/.221)**2>1,`hem vertex ${i} inside the skirt waistband`);}
  assert.ok(high-low>.02,'hem is scalloped');
  disposeObject(outfit);
});


test('windowpane jumper keeps its ribbing and covers trousers, skirt and the hidden bow',()=>{
  const id='mango-plaid-jumper-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  for(const skirt of [false,true])for(const barrel of [0,.5,1]){
    const outfit=makeOutfit({topId:id,skirt,barrel});outfit.updateMatrixWorld(true);
    for(const name of ['plaid-jumper-body','ribbed-hem-band','ribbed-crew-neck'])assert.ok(outfit.getObjectByName(name),name);
    let cuffs=0;outfit.traverse(o=>{if(o.name==='ribbed-cuff')cuffs++;});assert.equal(cuffs,2);
    assert.equal(outfit.getObjectByName('ribbon-knot'),undefined,'bow is hidden under the jumper');
    const jumper=[outfit.getObjectByName('plaid-jumper-body'),outfit.getObjectByName('ribbed-hem-band')];
    const ray=new T.Raycaster(),p=new T.Vector3(),origin=new T.Vector3(),local=new T.Vector3();let checked=0;
    for(const layer of ['trousers','layered-skirt'].map(n=>outfit.getObjectByName(n)).filter(Boolean))layer.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i+=2){
        p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);local.copy(p);jumper[0].worldToLocal(local);
        if(local.y<1.145||local.y>1.32)continue;
        origin.set(0,local.y,0);jumper[0].localToWorld(origin);const radius=p.distanceTo(origin);if(radius<.01)continue;
        ray.set(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-5));
        const hit=ray.intersectObjects(jumper,false)[0];
        assert.ok(hit&&hit.distance>radius+.002,`${o.name} vertex ${i} shows through (skirt ${skirt}, barrel ${barrel})`);checked++;
      }});
    assert.ok(checked>100);disposeObject(outfit);
  }
  const cropped=makeOutfit({topId:'desigual-crochet-flowers-v1',skirt:true});assert.ok(cropped.getObjectByName('ribbon-knot'),'cropped top still shows the bow');disposeObject(cropped);
});

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

test('every waist-covering top hides every bottom between its hem and the waist',()=>{
  const tops=Object.keys(GARMENTS).filter(id=>GARMENTS[id].layering?.coversWaistband);
  const bottoms=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='bottom')];
  for(const topId of tops){
    // The top's body (not its sleeves): her arms hang against her hips, so a high waistband passes inside the sleeves, hidden.
    // The top is the same whatever is worn under it, so it is built and measured once for all bottoms.
    const topOutfit=makeOutfit({topId});topOutfit.updateMatrixWorld(true);
    const covering=topOutfit.getObjectByName(topId).children.filter(o=>o.isMesh);
    const hem=Math.min(...covering.map(o=>new T.Box3().setFromObject(o).min.y))/.76;
    // The top's triangles in world space, indexed by height band, so each ray only tests the triangles at its height.
    const bands=new Map(),band=y=>Math.floor(y/.004);
    for(const m of covering){const g=m.geometry,pos=g.attributes.position,idx=g.index,n=idx?idx.count:pos.count;
      for(let i=0;i<n;i+=3){const tri=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld));
        for(let b=band(Math.min(...tri.map(v=>v.y)));b<=band(Math.max(...tri.map(v=>v.y)));b++){if(!bands.has(b))bands.set(b,[]);bands.get(b).push(tri);}}}
    const ray=new T.Ray(),hit=new T.Vector3(),axis=new T.Vector3(0,1,0);
    // The top's surface distance is cached per small cell (0.001 high, 0.5 degrees around): nearby trouser vertices
    // (stitch threads, fray) share one ray, which keeps this test quick without skipping any vertex.
    const surface=new Map(),coverAt=(y,a)=>{const key=Math.round(y/.001)+':'+Math.round(a/(Math.PI/360));
      if(!surface.has(key)){ray.origin.set(0,y,0);ray.direction.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5);let best=0;
        for(const [p0,p1,p2] of bands.get(band(y))||[])if(ray.intersectTriangle(p0,p1,p2,false,hit)){const d=hit.distanceTo(ray.origin);if(!best||d<best)best=d;}
        surface.set(key,best);}
      return surface.get(key);};
    for(const bottomId of bottoms){
    const outfit=makeOutfit({topId,bottomId});outfit.updateMatrixWorld(true);const p=new T.Vector3();let checked=0;
    outfit.getObjectByName('trousers').traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){
        // Up to the top of the highest waistband (ultra high rise jeans reach her natural waist).
        p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(y<hem+.012||y>1.4)continue;
        const radius=Math.hypot(p.x,p.z);if(radius<.01)continue;
        assert.ok(coverAt(p.y,Math.atan2(p.x,p.z))>radius+.001,`${o.name} shows through ${topId} over ${bottomId} at vertex ${i}`);checked++;
      }});
    assert.ok(checked>50,`${topId}/${bottomId} checked ${checked}`);disposeObject(outfit);
    }
    disposeObject(topOutfit);
  }
});

test('Davinia jeans: cropped slim legs clear her legs and socks, with their details',()=>{
  const id='desigual-davinia-jeans-v1';assert.equal(cleanRecipe({bottomId:id}).bottomId,id);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  for(const name of ['frayed-waistband','scoop-pocket-stitch','coin-pocket-stitch','embroidered-heart','abrasion','leather-patch','frayed-hem','back-patch-pocket'])assert.ok(outfit.getObjectByName(name),name);
  assert.equal(outfit.getObjectByName('pocket-flap'),undefined,'plain back pockets');
  const legs=[];outfit.traverse(o=>{if(o.name==='jeans-leg')legs.push(o);});assert.equal(legs.length,2);
  const hem=Math.min(...legs.map(l=>new T.Box3().setFromObject(l).min.y));assert.ok(hem>.33*.76,'cropped above the ankle');
  // Every doll leg and sock vertex between the hem and the crotch lies inside its jeans leg.
  const ray=new T.Raycaster(),p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
      const c=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      // Nudged off the leg's closing seam, where a ray along the shared edge can slip between its two triangles.
      ray.set(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));const h=ray.intersectObject(leg,false)[0];
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

test('off-shoulder stripe jumper bares only her left shoulder and keeps its stripes, ribbing and edge',()=>{
  const id='bershka-asymmetric-stripe-jumper-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const doll=makeDoll(),outfit=makeOutfit({topId:id});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  for(const name of ['stripe-jumper-body','ribbed-hem-band','neckline-edge','bare-shoulder-skin'])assert.ok(outfit.getObjectByName(name),name);
  let cuffs=0;outfit.traverse(o=>{if(o.name==='ribbed-cuff')cuffs++;});assert.equal(cuffs,2);
  // Stripes: about seven repeats from the neckline to the hem band, slanting with the neckline at the top only.
  const body=outfit.getObjectByName('stripe-jumper-body'),uv=body.geometry.attributes.uv,p=body.geometry.attributes.position;
  let vMin=Infinity,vMax=-Infinity;for(let i=0;i<uv.count;i++){vMin=Math.min(vMin,uv.getY(i));vMax=Math.max(vMax,uv.getY(i));}
  assert.ok(vMax-vMin>6&&vMax-vMin<8.5,`stripe repeats ${(vMax-vMin).toFixed(2)}`);
  const bottomRow=p.count-97;for(let i=0;i<97;i++)assert.ok(Math.abs(uv.getY(bottomRow+i)-uv.getY(bottomRow))<1e-6,'stripes are level at the hem');
  // Neckline: high on her right, off the shoulder on her left. The top row is the neckline.
  let right=-Infinity,left=Infinity;for(let i=0;i<=96;i++){const x=p.getX(i),y=p.getY(i);if(x<-.1)right=Math.max(right,y);if(x>.1&&p.getZ(i)>0)left=Math.min(left,y);}
  assert.ok(right-left>.12,`neckline slant ${(right-left).toFixed(3)}`);
  // Her left arm shows above the sleeve; her right arm is covered right up to the shoulder.
  // The body wraps over the top of her left arm and the sleeve starts below it; together they cover all but the very top.
  const ray=new T.Raycaster(),point=new T.Vector3(),origin=new T.Vector3(),arms=[],sleeves=[];
  doll.traverse(o=>{if(o.name==='arm')arms.push(o);});outfit.traverse(o=>{if(o.name==='knit-jumper-sleeve')sleeves.push(o);});
  const bare=[0,0];
  for(let side=0;side<2;side++){const arm=arms[side],sleeve=sleeves[side],v=arm.geometry.attributes.position;
    for(let i=0;i<v.count;i+=2){point.fromBufferAttribute(v,i).applyMatrix4(arm.matrixWorld);sleeve.worldToLocal(point);if(point.y<-.44)continue;const y=point.y;
      origin.set(0,Math.min(point.y,0),0);sleeve.localToWorld(origin);sleeve.localToWorld(point);const r=point.distanceTo(origin);if(r<.01)continue;
      ray.set(origin,point.clone().sub(origin).normalize());const covered=ray.intersectObjects([sleeve,body],false).some(h=>h.distance>r+.002);
      if(!covered){bare[side]++;assert.ok(y>-.13,`arm ${side} uncovered below the neckline at ${y.toFixed(3)}`);}}}
  assert.equal(bare[0],0,'right shoulder covered');assert.ok(bare[1]>10,'left shoulder bare');
  disposeObject(doll);disposeObject(outfit);
  // The band hugs the jeans, or sits out over the skirt; the bow stays hidden either way.
  const skirted=makeOutfit({topId:id,skirt:true});assert.equal(skirted.getObjectByName('ribbon-knot'),undefined);
  const band=o=>new T.Box3().setFromObject(o.getObjectByName('ribbed-hem-band')).getSize(new T.Vector3()).x,plain=makeOutfit({topId:id});
  assert.ok(band(skirted)>band(plain));disposeObject(skirted);disposeObject(plain);
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
  const ray=new T.Raycaster(),p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
      const c=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      ray.set(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));const h=ray.intersectObject(leg,false)[0];
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

test('pointelle flower jumper: openwork, scalloped edges, raglan seams and eight flowers on the front only',()=>{
  const id='cream-pointelle-flower-jumper-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:id});outfit.updateMatrixWorld(true);
  for(const name of ['pointelle-body','scalloped-neckband','scalloped-hem-band','skin-under-openwork'])assert.ok(outfit.getObjectByName(name),name);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('scalloped-cuff'),2);assert.equal(count('raglan-seam'),4);assert.equal(count('embroidered-flower'),8);
  // Flowers sit on the front of the body, spread across it.
  const xs=[];outfit.traverse(o=>{if(o.name!=='embroidered-flower')return;const p=o.getWorldPosition(new T.Vector3());assert.ok(p.z>.1,'flower on the front');xs.push(p.x);});
  assert.ok(Math.min(...xs)<-.1&&Math.max(...xs)>.1,'flowers on both sides of the front');
  // Eyelets: a real share of the knit is open, and the edges are solid.
  const body=outfit.getObjectByName('pointelle-body'),pixels=body.material.map.image.data;let open=0;
  for(let i=3;i<pixels.length;i+=4)if(!pixels[i])open++;const fraction=open/(pixels.length/4);
  assert.ok(fraction>.06&&fraction<.3,`openwork fraction ${fraction}`);assert.ok(body.material.alphaTest>0);
  assert.equal(outfit.getObjectByName('scalloped-hem-band').material.map,null);
  // Scallops: the hem's lower edge rises and falls.
  const hp=outfit.getObjectByName('scalloped-hem-band').geometry.attributes.position;let low=Infinity,high=-Infinity;
  for(let i=0;i<hp.count;i++){const y=hp.getY(i);if(y<1.16){low=Math.min(low,y);high=Math.max(high,y);}}
  assert.ok(high-low>.005,'hem is scalloped');
  disposeObject(outfit);
  // The skin seen through the eyelets stays inside every pair of jeans, so it never shows over them. (Low-rise pairs end
  // below it, so not every pair overlaps it.)
  let overlaps=0;
  for(const bottomId of ['classic',...Object.keys(GARMENTS).filter(b=>GARMENTS[b].slot==='bottom')]){
    const dressed=makeOutfit({topId:id,bottomId});dressed.updateMatrixWorld(true);
    const hips=[];dressed.getObjectByName('trousers').traverse(o=>{if(['jeans-hips','jeans-waistband','frayed-waistband'].includes(o.name))hips.push(o);});
    const skin=dressed.getObjectByName('skin-under-openwork').children[0],pos=skin.geometry.attributes.position,ray=new T.Raycaster(),p=new T.Vector3();let checked=0;
    for(let i=0;i<pos.count;i+=3){p.fromBufferAttribute(pos,i).applyMatrix4(skin.matrixWorld);if(p.y/.76>1.4)continue;const r=Math.hypot(p.x,p.z);if(r<.01)continue;
      ray.set(new T.Vector3(0,p.y,0),new T.Vector3(p.x,0,p.z).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
      const hit=ray.intersectObjects(hips,false)[0];if(!hit)continue;assert.ok(hit.distance>r,`skin shows over ${bottomId} at vertex ${i}`);checked++;}
    if(checked)overlaps++;disposeObject(dressed);
  }
  assert.ok(overlaps>=3,`skin checked against ${overlaps} bottoms`);
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
  const ray=new T.Raycaster(),p=new T.Vector3(),origin=new T.Vector3();let checked=0;
  doll.traverse(o=>{if(o.name!=='leg'&&o.name!=='sock')return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<hem+.004||p.y>.95*.76)continue;
      const leg=legs.find(l=>Math.sign(new T.Box3().setFromObject(l).getCenter(new T.Vector3()).x)===Math.sign(p.x));
      const c=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());origin.set(c.x,p.y,0);const r=p.distanceTo(origin);if(r<.005)continue;
      ray.set(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));const h=ray.intersectObject(leg,false)[0];
      assert.ok(h&&h.distance>r+.001,`${o.name} vertex ${i} shows through the Mango leg`);checked++;}});
  assert.ok(checked>200);disposeObject(doll);disposeObject(outfit);
});

test('silver cable jumper: foil over black, cropped at the waist, clear of every waistband',()=>{
  const id='desigual-silver-cable-jumper-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:id});outfit.updateMatrixWorld(true);
  for(const name of ['silver-cable-body','ribbed-hem-band','ribbed-crew-neck'])assert.ok(outfit.getObjectByName(name),name);
  let cuffs=0;outfit.traverse(o=>{if(o.name==='ribbed-cuff')cuffs++;});assert.equal(cuffs,2);
  // Mostly silver, dark only in grooves and gaps (as in the photo, the body's grooves are dark grey and its gaps black);
  // metallic, with the same knit driving the bump.
  const body=outfit.getObjectByName('silver-cable-body'),px=body.material.map.image.data;let dark=0,bright=0,black=0;
  for(let i=0;i<px.length;i+=4){const l=(px[i]+px[i+1]+px[i+2])/3;if(l<90)dark++;if(l<30)black++;if(l>120)bright++;}
  const n=px.length/4;assert.ok(bright/n>.6&&dark/n>.03&&dark/n<.25&&black>0,`silver ${bright/n}, dark ${dark/n}, black ${black}`);
  assert.ok(body.material.metalness>.3);assert.ok(body.material.bumpMap);
  disposeObject(outfit);
  // Cropped: it ends above the skirt, whose bow stays visible.
  const skirted=makeOutfit({topId:id,skirt:true});skirted.updateMatrixWorld(true);assert.ok(skirted.getObjectByName('ribbon-knot'));
  const hem=new T.Box3().setFromObject(skirted.getObjectByName('ribbed-hem-band')).min.y/.76;assert.ok(hem>1.24&&hem<1.3,`hem at ${hem}`);
  disposeObject(skirted);
  // Every waistband that reaches above the hem passes inside the band.
  const ray=new T.Raycaster(),p=new T.Vector3(),axis=new T.Vector3(0,1,0);let checked=0;
  for(const bottomId of ['classic',...Object.keys(GARMENTS).filter(b=>GARMENTS[b].slot==='bottom')]){
    const dressed=makeOutfit({topId:id,bottomId,skirt:bottomId==='classic'});dressed.updateMatrixWorld(true);
    const cover=[dressed.getObjectByName('silver-cable-body'),dressed.getObjectByName('ribbed-hem-band')],seen=new Map();
    for(const layer of ['trousers','layered-skirt'].map(name=>dressed.getObjectByName(name)).filter(Boolean))layer.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(y<hem+.006||y>1.4)continue;
        const r=Math.hypot(p.x,p.z),a=Math.atan2(p.x,p.z),key=Math.round(y/.002)+':'+Math.round(a/(Math.PI/180));
        if(!seen.has(key)){ray.set(new T.Vector3(0,p.y,0),new T.Vector3(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5));seen.set(key,ray.intersectObjects(cover,false)[0]?.distance||0);}
        assert.ok(seen.get(key)>r+.001,`${o.name} pokes through the band over ${bottomId} at vertex ${i}`);checked++;}});
    disposeObject(dressed);
  }
  assert.ok(checked>200,`checked ${checked}`);
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

test('Lacroix flower sweater: giant violet flowers front and back, a peony, forearm flowers and olive ribbing',()=>{
  const id='desigual-lacroix-flower-sweater-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:id});
  for(const name of ['lacroix-body','printed-hem-rib','lilac-crew-neck'])assert.ok(outfit.getObjectByName(name),name);
  let cuffs=0;outfit.traverse(o=>{if(o.name==='ribbed-cuff')cuffs++;});assert.equal(cuffs,2);
  // The body's painting: front (middle half of the texture) and back (outer quarters) are each mostly flower.
  const body=outfit.getObjectByName('lacroix-body'),{data,width:w,height:h}=body.material.map.image;
  const share=(test,front)=>{let n=0,all=0;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const f=x>w/4&&x<w*3/4;if(f!==front)continue;const i=(y*w+x)*4;all++;if(test(data[i],data[i+1],data[i+2]))n++;}return n/all;};
  const violet=(r,g,b)=>b>g+40&&r>g,white=(r,g,b)=>r>185&&g>185&&b>185,black=(r,g,b)=>r+g+b<120,olive=(r,g,b)=>g>b+30&&r>b+20&&b<60;
  for(const front of [true,false]){assert.ok(share(violet,front)>.3,`violet ${front?'front':'back'}`);assert.ok(share(olive,front)>.1,`olive ${front?'front':'back'}`);assert.ok(share(black,front)>.003,'black stems');}
  assert.ok(share(white,true)>.03&&share(white,true)>share(white,false)*2,'the white peony is on the front');
  // The hem rib carries the same print; the forearm prints differ: the peony is on her left sleeve.
  assert.equal(outfit.getObjectByName('printed-hem-rib').material.map.image.data,body.material.map.image.data);
  const sleeves=[];outfit.traverse(o=>{if(o.name==='knit-jumper-sleeve')sleeves.push(o);});assert.equal(sleeves.length,2);
  const whiteIn=img=>{let n=0;for(let i=0;i<img.data.length;i+=16)if(white(img.data[i],img.data[i+1],img.data[i+2]))n++;return n;};
  assert.ok(whiteIn(sleeves[1].material.map.image)>whiteIn(sleeves[0].material.map.image)*3,'peony on her left forearm');
  disposeObject(outfit);
  // The hem hugs the jeans, or sits out over the skirt; the bow stays hidden.
  const skirted=makeOutfit({topId:id,skirt:true}),plain=makeOutfit({topId:id});
  const width=o=>new T.Box3().setFromObject(o.getObjectByName('printed-hem-rib')).getSize(new T.Vector3()).x;
  assert.ok(width(skirted)>width(plain));assert.equal(skirted.getObjectByName('ribbon-knot'),undefined);
  disposeObject(skirted);disposeObject(plain);
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

test('green cable sweater: rope cables in relief, raglan seams, a flag on her left chest and deep ribbing',()=>{
  const id='tommy-green-cable-sweater-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:id});outfit.updateMatrixWorld(true);
  for(const name of ['cable-knit-body','ribbed-hem-band','ribbed-crew-neck','embroidered-flag'])assert.ok(outfit.getObjectByName(name),name);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('raglan-seam'),4);assert.equal(count('ribbed-cuff'),2);assert.equal(count('flag-stripe'),3);
  const flag=outfit.getObjectByName('embroidered-flag').getWorldPosition(new T.Vector3());assert.ok(flag.x>.03&&flag.z>.1,'flag on her left chest');
  // The cables are relief: the same tile drives the bump, with deep troughs and high ridges; sixteen columns round the body.
  const body=outfit.getObjectByName('cable-knit-body'),bump=body.material.bumpMap;assert.ok(bump);assert.equal(body.material.map.repeat.x,16);
  let low=0,high=0;const hd=bump.image.data;for(let i=0;i<hd.length;i+=4){if(hd[i]<40)low++;if(hd[i]>180)high++;}
  const n=hd.length/4;assert.ok(low/n>.08&&high/n>.15,`troughs ${low/n}, ridges ${high/n}`);
  disposeObject(outfit);
  const skirted=makeOutfit({topId:id,skirt:true}),plain=makeOutfit({topId:id});
  const width=o=>new T.Box3().setFromObject(o.getObjectByName('ribbed-hem-band')).getSize(new T.Vector3()).x;
  assert.ok(width(skirted)>width(plain));assert.equal(skirted.getObjectByName('ribbon-knot'),undefined);
  disposeObject(skirted);disposeObject(plain);
});

test('every top records styling facts for later outfit selection',()=>{
  // Relative warmth (1 light to 4 very warm) with what it is based on; silhouette, palette, pattern, coverage and material.
  for(const [id,g] of Object.entries(GARMENTS).filter(([,g])=>g.slot==='top')){
    const st=g.styling;assert.ok(st,`${id} has styling facts`);
    assert.ok([1,2,3,4].includes(st.warmth)&&/^(user|inferred)/.test(st.warmthBasis),`${id} warmth and its basis`);
    for(const key of ['silhouette','pattern','material','weather'])assert.equal(typeof st[key],'string',`${id} ${key}`);
    assert.ok(Array.isArray(st.palette)&&st.palette.length);assert.ok(st.coverage?.neck&&st.coverage?.sleeves&&st.coverage?.midriff,`${id} coverage`);
  }
});
