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
    const arm=arms[side],sleeve=sleeves[side],vertices=arm.geometry.attributes.position;
    for(let i=0;i<vertices.count;i+=2){
      point.fromBufferAttribute(vertices,i).applyMatrix4(arm.matrixWorld);sleeve.worldToLocal(point);
      if(point.y<-.44)continue;
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
  for(const topId of tops)for(const bottomId of ['classic','topshop-barrel-jeans-v1']){
    const outfit=makeOutfit({topId,bottomId});outfit.updateMatrixWorld(true);
    const covering=[];outfit.getObjectByName(topId).traverse(o=>{if(o.isMesh)covering.push(o);});
    const hem=Math.min(...covering.filter(o=>!o.parent||o.parent.name===topId).map(o=>new T.Box3().setFromObject(o).min.y))/.76;
    const ray=new T.Raycaster(),p=new T.Vector3(),origin=new T.Vector3();let checked=0;
    outfit.getObjectByName('trousers').traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i+=3){
        p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(y<hem+.012||y>1.3)continue;
        origin.set(0,p.y,0);const radius=p.distanceTo(origin);if(radius<.01)continue;
        ray.set(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-5));
        const hit=ray.intersectObjects(covering,false)[0];
        assert.ok(hit&&hit.distance>radius+.001,`${o.name} shows through ${topId} over ${bottomId} at vertex ${i}`);checked++;
      }});
    assert.ok(checked>50,`${topId}/${bottomId} checked ${checked}`);disposeObject(outfit);
  }
});
