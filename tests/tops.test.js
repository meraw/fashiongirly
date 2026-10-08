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
// Tops: each reference top and how tops layer over her, the bottoms and each other.
test('lilac shirt clears the trousers and seams around its lower hem',()=>{
  for(const barrel of [0,.5,1]){
    const outfit=makeOutfit({topId:'lilac-portrait-mockneck-v1',barrel});outfit.updateMatrixWorld(true);
    const shirt=outfit.getObjectByName('reference-top-body'),pants=outfit.getObjectByName('trousers');
    const around=levelCaster([shirt]),p=new T.Vector3(),origin=new T.Vector3();let checked=0;
    pants.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){
        p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);shirt.worldToLocal(p);
        if(p.y<1.106||p.y>1.30)continue;
        origin.set(0,p.y,0);shirt.localToWorld(origin);shirt.localToWorld(p);
        const radius=p.distanceTo(origin);if(radius<.01)continue;
        const hit=around(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-5));
        assert.ok(hit&&hit.distance>radius+.002,`${o.name} protrudes at vertex ${i}, barrel ${barrel}`);checked++;
      }
    });
    assert.ok(checked>100);disposeObject(outfit);
  }
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
    const around=levelCaster(jumper),p=new T.Vector3(),origin=new T.Vector3(),local=new T.Vector3();let checked=0;
    for(const layer of ['trousers','layered-skirt'].map(n=>outfit.getObjectByName(n)).filter(Boolean))layer.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i+=2){
        p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);local.copy(p);jumper[0].worldToLocal(local);
        if(local.y<1.145||local.y>1.32)continue;
        origin.set(0,local.y,0);jumper[0].localToWorld(origin);const radius=p.distanceTo(origin);if(radius<.01)continue;
        const hit=around(origin,p.clone().sub(origin).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-5));
        assert.ok(hit&&hit.distance>radius+.002,`${o.name} vertex ${i} shows through (skirt ${skirt}, barrel ${barrel})`);checked++;
      }});
    assert.ok(checked>100);disposeObject(outfit);
  }
  const cropped=makeOutfit({topId:'desigual-crochet-flowers-v1',skirt:true});assert.ok(cropped.getObjectByName('ribbon-knot'),'cropped top still shows the bow');disposeObject(cropped);
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
    const skin=dressed.getObjectByName('skin-under-openwork').children[0],pos=skin.geometry.attributes.position,around=levelCaster(hips,{axis:[0,0]}),p=new T.Vector3();let checked=0;
    for(let i=0;i<pos.count;i+=3){p.fromBufferAttribute(pos,i).applyMatrix4(skin.matrixWorld);if(p.y/.76>1.4)continue;const r=Math.hypot(p.x,p.z);if(r<.01)continue;
      const hit=around(new T.Vector3(0,p.y,0),new T.Vector3(p.x,0,p.z).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));if(!hit)continue;assert.ok(hit.distance>r,`skin shows over ${bottomId} at vertex ${i}`);checked++;}
    if(checked)overlaps++;disposeObject(dressed);
  }
  assert.ok(overlaps>=3,`skin checked against ${overlaps} bottoms`);
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
  const p=new T.Vector3(),axis=new T.Vector3(0,1,0);let checked=0;
  for(const bottomId of ['classic',...Object.keys(GARMENTS).filter(b=>GARMENTS[b].slot==='bottom')]){
    const dressed=makeOutfit({topId:id,bottomId,skirt:bottomId==='classic'});dressed.updateMatrixWorld(true);
    const cover=[dressed.getObjectByName('silver-cable-body'),dressed.getObjectByName('ribbed-hem-band')],band=levelCaster(cover,{axis:[0,0]}),seen=new Map();
    for(const layer of ['trousers','layered-skirt'].map(name=>dressed.getObjectByName(name)).filter(Boolean))layer.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(y<hem+.006||y>1.4)continue;
        const r=Math.hypot(p.x,p.z),a=Math.atan2(p.x,p.z),key=Math.round(y/.002)+':'+Math.round(a/(Math.PI/180));
        if(!seen.has(key))seen.set(key,band(new T.Vector3(0,p.y,0),new T.Vector3(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5))?.distance||0);
        assert.ok(seen.get(key)>r+.001,`${o.name} pokes through the band over ${bottomId} at vertex ${i}`);checked++;}});
    disposeObject(dressed);
  }
  assert.ok(checked>200,`checked ${checked}`);
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

test('green cable sweater: rope cables in relief, raglan seams, a flag on her left chest and deep ribbing',()=>{
  const id='tommy-green-cable-sweater-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:id});outfit.updateMatrixWorld(true);
  for(const name of ['cable-knit-body','ribbed-hem-band','ribbed-crew-neck','embroidered-flag'])assert.ok(outfit.getObjectByName(name),name);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('raglan-seam'),4);assert.equal(count('ribbed-cuff'),2);assert.equal(count('flag-stripe'),3);
  const flag=outfit.getObjectByName('embroidered-flag').getWorldPosition(new T.Vector3());assert.ok(flag.x>.03&&flag.z>.1,'flag on her left chest');
  // The cables are relief: the same tile drives the bump; sixteen columns round the body. As in the photos (and at the
  // user's request), the cables sit close together: the grooves between them are thin and shallow, never deep dark gaps.
  const body=outfit.getObjectByName('cable-knit-body'),bump=body.material.bumpMap;assert.ok(bump);assert.equal(body.material.map.repeat.x,16);
  let deep=0,groove=0,high=0;const hd=bump.image.data;for(let i=0;i<hd.length;i+=4){if(hd[i]<40)deep++;if(hd[i]<80)groove++;if(hd[i]>180)high++;}
  const n=hd.length/4;assert.equal(deep,0,'no deep gaps');assert.ok(groove/n>.03&&groove/n<.15,`thin grooves ${groove/n}`);assert.ok(high/n>.4,`raised twists ${high/n}`);
  disposeObject(outfit);
  const skirted=makeOutfit({topId:id,skirt:true}),plain=makeOutfit({topId:id});
  const width=o=>new T.Box3().setFromObject(o.getObjectByName('ribbed-hem-band')).getSize(new T.Vector3()).x;
  assert.ok(width(skirted)>width(plain));assert.equal(skirted.getObjectByName('ribbon-knot'),undefined);
  disposeObject(skirted);disposeObject(plain);
});

test('stripe knit polo: navy collar, open placket with three buttons, short sleeves, monogram and sleeve flag',()=>{
  const id='tommy-stripe-knit-polo-v1',recipe=cleanRecipe({topId:id,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:id});outfit.updateMatrixWorld(true);
  for(const name of ['polo-knit-body','polo-collar','polo-collar-stand','polo-collar-edge','ribbed-hem-band','embroidered-monogram','sleeve-flag'])assert.ok(outfit.getObjectByName(name),name);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};
  assert.equal(count('polo-button'),3);assert.equal(count('knit-polo-sleeve'),2);assert.equal(count('ribbed-cuff'),2);assert.equal(count('flag-stripe'),3);
  const at=name=>outfit.getObjectByName(name).getWorldPosition(new T.Vector3());
  const mono=new T.Box3().setFromObject(outfit.getObjectByName('embroidered-monogram')).getCenter(new T.Vector3());assert.ok(mono.x>.08&&mono.z>.1,'monogram on her left chest');
  assert.ok(at('sleeve-flag').x>.25,'flag on her left sleeve');
  // Navy takes 60% of each stripe repeat, as measured in the photos.
  const body=outfit.getObjectByName('polo-knit-body'),px=body.material.map.image.data;let navy=0;
  for(let i=0;i<px.length;i+=4)if(px[i]+px[i+1]+px[i+2]<200)navy++;assert.ok(Math.abs(navy/(px.length/4)-.6)<.02,`navy share ${navy/(px.length/4)}`);
  // The top button is open: the body is cut into a narrow V at the front, its edges covered by the placket.
  const p=body.geometry.attributes.position;
  let front=-Infinity;for(let i=0;i<p.count;i++)if(p.getZ(i)>.09&&Math.abs(p.getX(i))<.004)front=Math.max(front,p.getY(i));
  assert.ok(front<1.845&&front>1.82,`V bottom at ${front}`);
  // Short sleeves: each ends above her elbow, and her forearm stays bare.
  for(const sleeve of outfit.getObjectByName(id).children.filter(o=>o.isGroup&&o.children.some(c=>c.name==='knit-polo-sleeve'))){
    const box=new T.Box3().setFromObject(sleeve);assert.ok(box.min.y/.76>1.55,`sleeve ends at ${box.min.y/.76}`);}
  disposeObject(outfit);
  // Cropped at the waist: it ends above the skirt, whose bow stays visible.
  const skirted=makeOutfit({topId:id,skirt:true});skirted.updateMatrixWorld(true);assert.ok(skirted.getObjectByName('ribbon-knot'));
  const hem=new T.Box3().setFromObject(skirted.getObjectByName('ribbed-hem-band')).min.y/.76;assert.ok(hem>1.24&&hem<1.28,`hem at ${hem}`);
  disposeObject(skirted);
  // Every waistband that reaches above the hem passes inside the body and band.
  const q=new T.Vector3(),axis=new T.Vector3(0,1,0);let checked=0;
  for(const bottomId of ['classic',...Object.keys(GARMENTS).filter(b=>GARMENTS[b].slot==='bottom')]){
    const dressed=makeOutfit({topId:id,bottomId,skirt:bottomId==='classic'});dressed.updateMatrixWorld(true);
    const cover=[dressed.getObjectByName('polo-knit-body'),dressed.getObjectByName('ribbed-hem-band')],band=levelCaster(cover,{axis:[0,0]}),seen=new Map();
    for(const layer of ['trousers','layered-skirt'].map(name=>dressed.getObjectByName(name)).filter(Boolean))layer.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){q.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=q.y/.76;if(y<hem+.006||y>1.4)continue;
        const r=Math.hypot(q.x,q.z),a=Math.atan2(q.x,q.z),key=Math.round(y/.002)+':'+Math.round(a/(Math.PI/180));
        if(!seen.has(key))seen.set(key,band(new T.Vector3(0,q.y,0),new T.Vector3(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5))?.distance||0);
        assert.ok(seen.get(key)>r+.001,`${o.name} pokes through the polo over ${bottomId} at vertex ${i}`);checked++;}});
    disposeObject(dressed);
  }
  assert.ok(checked>200,`checked ${checked}`);
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

test('striped cardigan: a top worn over skin, with a deep V, five buttons, navy stripes and a sleeve badge',()=>{
  const id='petit-bateau-striped-cardigan-v1',g=GARMENTS[id];
  // Sorted by how the user wears it: on its own over bare skin, so it is a top, not outerwear.
  assert.equal(g.slot,'top');assert.match(g.wear.userNote,/on its own/);
  const recipe=cleanRecipe({topId:id,knit:true,shirt:true});assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:id});outfit.updateMatrixWorld(true);
  for(const name of ['cardigan-body','neckline-button-band','front-button-band','ribbed-hem-band','bare-shoulder-skin','sleeve-badge'])assert.ok(outfit.getObjectByName(name),name);
  const count=name=>{let n=0;outfit.traverse(o=>{if(o.name===name)n++;});return n;};assert.equal(count('cardigan-button'),5);assert.equal(count('ribbed-cuff'),2);
  // The deep V: the body's neckline drops far lower at the centre front than at the back.
  const p=outfit.getObjectByName('cardigan-body').geometry.attributes.position;let front=Infinity,back=-Infinity;
  for(let i=0;i<=128;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(Math.abs(x)<.03&&z>0)front=Math.min(front,y);if(Math.abs(x)<.03&&z<0)back=Math.max(back,y);}
  assert.ok(back-front>.2,`V depth ${(back-front).toFixed(3)}`);
  // Three navy stripes on the body: the texture's navy rows form three bands.
  const img=outfit.getObjectByName('cardigan-body').material.map.image;let bands=0,prev=false;
  for(let y=0;y<img.height;y++){const i=y*img.width*4,navy=img.data[i+2]<80;if(navy&&!prev)bands++;prev=navy;}assert.equal(bands,3);
  // Over the skirt it hangs outside the pleats, from its hem up to the waistband.
  const skirted=makeOutfit({topId:id,skirt:true});skirted.updateMatrixWorld(true);
  const cover=levelCaster(['cardigan-body','ribbed-hem-band'].map(n=>skirted.getObjectByName(n)),{axis:[0,0]}),q=new T.Vector3();let under=0;
  skirted.getObjectByName('layered-skirt').traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i+=2){q.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(q.y/.76<.82)continue;const r=Math.hypot(q.x,q.z);
      const hit=cover(new T.Vector3(0,q.y,0),new T.Vector3(q.x,0,q.z).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
      assert.ok(hit&&hit.distance>r,`${o.name} pokes through the cardigan at vertex ${i}`);under++;}});
  assert.ok(under>100);assert.equal(skirted.getObjectByName('ribbon-knot'),undefined);disposeObject(skirted);
  // The badge is on her left upper sleeve, and hides with the sleeve.
  const badge=outfit.getObjectByName('sleeve-badge');assert.ok(badge.getWorldPosition(new T.Vector3()).x>.3);assert.ok(badge.parent.children.some(o=>o.name==='knit-jumper-sleeve'));
  disposeObject(outfit);
});

test('a top worn over another: the cardigan over a slim top, which shows in the V and stays inside it',async()=>{
  const id='petit-bateau-striped-cardigan-v1',under='lilac-portrait-mockneck-v1';
  // Only a top that can be worn over another takes one under it, and only a slim top goes under.
  assert.equal(cleanRecipe({topId:id,underTopId:under}).underTopId,under);
  assert.equal(cleanRecipe({topId:'tommy-green-cable-sweater-v1',underTopId:under}).underTopId,'none','a jumper takes nothing under it');
  assert.equal(cleanRecipe({topId:id,underTopId:'tommy-green-cable-sweater-v1'}).underTopId,'none','a bulky top cannot go under');
  assert.equal(cleanRecipe({topId:id,underTopId:'levis-94-wide-leg-v1'}).underTopId,'none','only tops');
  assert.equal(cleanRecipe(null).underTopId,'none');
  for(const underId of Object.keys(GARMENTS).filter(k=>GARMENTS[k].layering?.underTop)){
    const outfit=makeOutfit({topId:id,underTopId:underId,skirt:true});outfit.updateMatrixWorld(true);
    const layer=outfit.getObjectByName('under-top');assert.ok(layer);
    assert.equal(outfit.getObjectByName('bare-shoulder-skin').visible,false,'the under top replaces her skin in the V');
    // Its sleeves are hidden inside the cardigan's sleeves.
    layer.traverse(o=>{if(o.isMesh&&/sleeve/.test(o.name)){let v=true;for(let q=o;q;q=q.parent)if(!q.visible)v=false;assert.equal(v,false,`${underId} ${o.name} hidden`);}});
    // Every point of its body below its collar is either inside the cardigan or seen through the V (nothing of the cardigan
    // in front of it). Its collar shows above the cardigan's neckline, as a crew or mock neck does.
    const cover=levelCaster(['cardigan-body','ribbed-hem-band','neckline-button-band','front-button-band'].map(n=>outfit.getObjectByName(n)),{axis:[0,0]});
    const p=new T.Vector3();let inside=0,inV=0;
    for(const o of layer.children){if(!o.isMesh)continue;const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i+=2){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const r=Math.hypot(p.x,p.z);if(r<.01||p.y/.76>1.895)continue;
        const hit=cover(new T.Vector3(0,p.y,0),new T.Vector3(p.x,0,p.z).normalize().applyAxisAngle(new T.Vector3(0,1,0),1e-4));
        if(!hit){assert.ok(p.z>0&&p.y/.76>1.55,`${underId} ${o.name} shows outside the V at vertex ${i}`);inV++;}
        else{assert.ok(hit.distance>r,`${underId} ${o.name} pokes through the cardigan at vertex ${i}`);inside++;}}}
    assert.ok(inside>200&&inV>20,`${underId}: inside ${inside}, in the V ${inV}`);
    disposeObject(outfit);
  }
  // In the studio, the choice is offered only for such a top, and is saved with the look.
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;
  const app=await startStudio(d,async()=>({update(){},turn(){},dispose(){}}));
  const top=d.getElementById('top-select'),pick=d.getElementById('under-select');
  top.value='tommy-green-cable-sweater-v1';top.dispatchEvent(new dom.window.Event('change'));assert.equal(pick.disabled,true);
  top.value=id;top.dispatchEvent(new dom.window.Event('change'));assert.equal(pick.disabled,false);
  pick.value=under;pick.dispatchEvent(new dom.window.Event('change'));assert.equal(app.getRecipe().underTopId,under);
  d.getElementById('save').click();assert.equal(JSON.parse(dom.window.localStorage.getItem('fashiongirly.plush-looks.v1'))[0].underTopId,under);
  app.dispose();dom.window.close();
});

