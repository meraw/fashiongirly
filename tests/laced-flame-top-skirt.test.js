import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { levelCaster } from '../src/doll/level-caster.js';
const TOP_ID='laced-flame-print-mockneck-top-v1',SKIRT_ID='laced-flame-print-mini-skirt-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const yRange=mesh=>{const b=new T.Box3().setFromObject(mesh);return [b.min.y/.76,b.max.y/.76];};

test('laced flame top: a fitted mock neck cut at the high hip, printed from its atlas, with laced cuffs tied in bows',()=>{
  const g=GARMENTS[TOP_ID];assert.equal(g.slot,'top');assert.equal(g.build.template,'laced-print-top');assert.ok(g.layering.coversWaistband);
  assert.ok(OUTFITS.some(look=>look.recipe.topId===TOP_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:TOP_ID});outfit.updateMatrixWorld(true);
  for(const [name,count] of [['laced-top-body',1],['reference-fitted-sleeve',2],['cuff-lacing',4],['cuff-bow',4],['cuff-bow-knot',2],['cuff-tie-end',4]])
    assert.equal(named(outfit,name).length,count,name);
  // A mock neck up to her chin, and a hem just above where the skirt's printed belt starts.
  const [low,high]=yRange(named(outfit,'laced-top-body')[0]);
  assert.ok(high>1.96&&Math.abs(low-1.19)<.01,`body from ${low.toFixed(3)} to ${high.toFixed(3)}`);
  // Every texture coordinate lands inside the atlas: the body above its sleeves, each sleeve in its own half, and no
  // sleeve wraps the atlas within one segment (which drew a dark streak down her right sleeve).
  const body=named(outfit,'laced-top-body')[0].geometry.attributes.uv,share=g.build.atlas.body;
  for(let i=0;i<body.count;i++)assert.ok(body.getY(i)>=1-share-1e-6&&body.getX(i)>=0&&body.getX(i)<=1,'body uv');
  for(const sleeve of named(outfit,'reference-fitted-sleeve')){const uv=sleeve.geometry.attributes.uv,n=65;let jump=0;
    for(let i=0;i<uv.count;i++){assert.ok(uv.getY(i)<=1-share+1e-6,'sleeve uv below the body');if(i%n)jump=Math.max(jump,Math.abs(uv.getX(i)-uv.getX(i-1)));}
    assert.ok(jump<.02,`sleeve columns step at most ${jump.toFixed(3)}`);}
  // The bow's ends hang down past the cuff, clear of nothing but the air.
  for(const end of named(outfit,'cuff-tie-end'))assert.ok(yRange(end)[0]<yRange(named(outfit,'cuff-bow-knot')[0])[0]-.08,'tie ends hang down');
  disposeObject(outfit);
});

test('laced flame skirt: a fitted mini with bare legs, charms on clips and a laced hem, never under the layered skirt',()=>{
  const g=GARMENTS[SKIRT_ID];assert.equal(g.slot,'bottom');assert.equal(g.build.template,'mini-skirt');assert.ok(g.layering.skirt);
  assert.ok(OUTFITS.some(look=>look.recipe.bottomId===SKIRT_ID),'a study preset wears it');
  // The built-in layered skirt never goes over it.
  assert.equal(cleanRecipe({bottomId:SKIRT_ID,skirt:true}).skirt,false);
  assert.equal(cleanRecipe({bottomId:'classic',skirt:true}).skirt,true);
  const doll=makeDoll(),outfit=makeOutfit({bottomId:SKIRT_ID});doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const trousers=outfit.getObjectByName('trousers');assert.equal(trousers.userData.garmentId,SKIRT_ID);
  for(const [name,count] of [['mini-skirt-body',1],['bare-leg-skin',2],['charm-clip',3],['charm-chain',2],['felt-charm',2],['charm-stitch',2],['skirt-lacing',2],['skirt-eyelet',8],['skirt-bow',2],['skirt-tie-end',2]])
    assert.equal(named(outfit,name).length,count,name);
  const skirt=named(outfit,'mini-skirt-body')[0],[hem,top]=yRange(skirt);
  assert.ok(Math.abs(top-1.225)<.005&&Math.abs(hem-.88)<.005,`skirt from ${hem.toFixed(3)} to ${top.toFixed(3)}`);
  // The charms hang on her right front, below the belt; the lacing sits on her right front near the hem.
  for(const charm of named(outfit,'felt-charm')){const c=new T.Box3().setFromObject(charm).getCenter(new T.Vector3());assert.ok(c.x<0&&c.z>0&&c.y/.76<1.12&&c.y/.76>.95,'charm on her right front');}
  for(const lace of named(outfit,'skirt-lacing')){const c=new T.Box3().setFromObject(lace).getCenter(new T.Vector3());assert.ok(c.x<0&&c.z>0&&c.y/.76<.97,'lacing on her right front near the hem');}
  // Her body never pokes through the skirt: every vertex of her body and legs at the skirt's height lies inside it (her
  // hands hang beside it).
  const cast=levelCaster([skirt],{axis:[0,0]}),p=new T.Vector3(),up=new T.Vector3(0,1,0);let checked=0;
  doll.traverse(o=>{if(!o.isMesh||!['cloth-body','leg'].includes(o.name))return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i+=2){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=p.y/.76;if(y<hem+.01||y>top-.01)continue;
      const r=Math.hypot(p.x,p.z);if(r<.01)continue;const hit=cast(new T.Vector3(0,p.y,0),new T.Vector3(p.x,0,p.z).normalize().applyAxisAngle(up,1e-5));
      assert.ok(hit&&hit.distance>r,`${o.name} vertex ${i} pokes through the skirt at ${y.toFixed(3)}`);checked++;}});
  assert.ok(checked>100,`checked ${checked}`);
  disposeObject(doll);disposeObject(outfit);
});
