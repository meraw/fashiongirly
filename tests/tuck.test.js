import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe, canTuck, tuckable, tuckedOverSkirt } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { levelCaster } from '../src/doll/level-caster.js';
import { GARMENTS, DESIGUAL_RUGBY_ID, TOMMY_CABLE_ID, MOTEL_TIE_DYE_SHIRT_ID, VANGOGH_TEE_ID, MANGO_DOT_SHIRT_ID, DESIGUAL_MOUNTAIN_SHIRT_ID, BARREL_JEANS_ID, ZIP_TRACK_DRESS_ID } from '../src/wardrobe/catalog.js';
// Tucking her top in: which tops can be, how the recipe keeps it, how the outfit draws it, and tapping her top.
const tops=Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='top');
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('shirts, tees and fitted tops that reach the waistband can be tucked; jumpers, sweatshirts, hoodies, cardigans and cropped tops cannot',()=>{
  for(const id of tops){const g=GARMENTS[id],L=g.layering||{},family=g.family;
    if(/sweatshirt|hoodie|jumper|sweater|cardigan|knit/.test(family))assert.equal(canTuck(id),false,`${id}: worn loose`);
    else if(!L.coversWaistband&&!L.tucksIn)assert.equal(canTuck(id),false,`${id}: ends above the waistband`);
    else assert.equal(canTuck(id),true,`${id}: can be tucked`);}
  assert.ok(tops.filter(canTuck).length>=15,'most shirts and tees can be tucked');
  assert.equal(canTuck('classic'),false);assert.equal(canTuck(BARREL_JEANS_ID),false);assert.equal(canTuck('no-such-top'),false);
});

test('the recipe keeps a tuck only where it makes sense, and a top starts as it is usually worn',()=>{
  assert.equal(cleanRecipe({topId:VANGOGH_TEE_ID}).tucked,false,'loose by default');
  assert.equal(cleanRecipe({topId:VANGOGH_TEE_ID,tucked:true}).tucked,true);
  assert.equal(cleanRecipe({topId:DESIGUAL_RUGBY_ID}).tucked,true,'the rugby shirt is worn tucked in');
  assert.equal(cleanRecipe({topId:DESIGUAL_RUGBY_ID,tucked:false}).tucked,false,'and can be worn loose');
  assert.equal(cleanRecipe({topId:TOMMY_CABLE_ID,tucked:true}).tucked,false,'a jumper is never tucked');
  assert.equal(cleanRecipe({topId:MOTEL_TIE_DYE_SHIRT_ID,tucked:true}).tucked,false,'a cropped shirt is never tucked');
  assert.equal(cleanRecipe({topId:VANGOGH_TEE_ID,dressId:ZIP_TRACK_DRESS_ID,tucked:true}).tucked,false,'no top under a dress');
  assert.equal(cleanRecipe({topId:VANGOGH_TEE_ID,tucked:'yes'}).tucked,false);
  // Over the skirt, a shirt the skirt always takes tucked stays tucked, and the toggle rests.
  const skirt=cleanRecipe({topId:MANGO_DOT_SHIRT_ID,skirt:true,tucked:false});assert.equal(skirt.tucked,true);assert.equal(tuckable(skirt),false);
  assert.equal(tuckable(cleanRecipe({topId:MANGO_DOT_SHIRT_ID})),true);assert.equal(tuckable(cleanRecipe({topId:DESIGUAL_MOUNTAIN_SHIRT_ID,skirt:true})),true);
  assert.equal(tuckable(cleanRecipe({topId:TOMMY_CABLE_ID})),false);
});

// Below the top of the waistband she wears (the trousers', or the skirt's over them), all round her, every visible part
// of a tucked top other than its sleeves lies inside the waistband; loose, the same top hangs over it.
function waistCheck(outfit,topId,waistName){
  outfit.updateMatrixWorld(true);
  const waist=[];outfit.getObjectByName(waistName).traverse(m=>{if(m.isMesh&&!m.isInstancedMesh)waist.push(m);});
  const arm=o=>{for(let p=o;p;p=p.parent)if(p.isGroup&&p.rotation.z!==0&&p.children.some(c=>c.isMesh&&/sleeve/.test(c.name)))return true;return false;};
  const shown=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const cloth=[];outfit.getObjectByName(topId).traverse(m=>{if(m.isMesh&&!m.isInstancedMesh&&shown(m)&&!arm(m))cloth.push(m);});
  const p=new T.Vector3(),o=new T.Vector3(),d=new T.Vector3();let top=-Infinity;
  for(const m of waist){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);if(Math.abs(p.x)<.32*1.06)top=Math.max(top,p.y);}}
  const inW=levelCaster(waist,{axis:[0,0],faces:'both'}),inC=levelCaster(cloth,{axis:[0,0],faces:'both'});let inside=0,outside=0;
  for(const dy of [.01,.025,.045])for(let k=0;k<48;k++){const a=k/48*Math.PI*2;
    o.set(0,top-dy*.76,0);d.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(new T.Vector3(0,1,0),1e-5);
    const w=inW(o,d)?.distance,c=inC(o,d,true)?.distance;if(w==null||c==null)continue;if(c<w-.001)inside++;else outside++;}
  return {inside,outside};
}
test('a tucked top goes inside the waistband of every kind of bottom, all round her, and loose it hangs over it',()=>{
  for(const topId of tops.filter(canTuck))for(const [bottomId,skirt] of [['classic',false],[BARREL_JEANS_ID,false],[BARREL_JEANS_ID,true]]){
    const tucked=makeOutfit({topId,bottomId,skirt,tucked:true}),r=cleanRecipe({topId,bottomId,skirt,tucked:true});assert.equal(r.tucked,true);
    const {inside,outside}=waistCheck(tucked,topId,skirt?'layered-skirt':'trousers');
    assert.equal(outside,0,`${topId} tucked into ${skirt?'the skirt':bottomId}: shows through the waistband`);
    // A shirt the skirt always takes tucked is cut to end just inside the skirt's waistband (its own tests check it).
    if(!(skirt&&tuckedOverSkirt(topId)))assert.ok(inside>60,`${topId} tucked into ${skirt?'the skirt':bottomId}: checked ${inside}`);
    // A top that covers the waistband hides the skirt's bow; tucked in, the bow shows.
    if(skirt)assert.ok(named(tucked,'ribbon-loop').length>0,`${topId}: the bow shows over the tucked top`);
    disposeObject(tucked);
  }
  // Loose, a top that covers the waistband hangs over it.
  for(const topId of [VANGOGH_TEE_ID,MANGO_DOT_SHIRT_ID,DESIGUAL_MOUNTAIN_SHIRT_ID]){const loose=makeOutfit({topId,bottomId:BARREL_JEANS_ID,tucked:false});
    assert.ok(waistCheck(loose,topId,'trousers').outside>60,`${topId}: loose over the waistband`);disposeObject(loose);}
});

test('tucking changes only the top: sleeves, collar and the other garments stay as they are',()=>{
  const loose=makeOutfit({topId:VANGOGH_TEE_ID,bottomId:BARREL_JEANS_ID}),tucked=makeOutfit({topId:VANGOGH_TEE_ID,bottomId:BARREL_JEANS_ID,tucked:true});
  const box=(root,name)=>new T.Box3().setFromObject(root.getObjectByName(name));
  assert.deepEqual(box(tucked,'trousers'),box(loose,'trousers'));
  const sleeves=root=>{const out=[];root.getObjectByName(VANGOGH_TEE_ID).traverse(o=>{if(o.isGroup&&o.rotation.z!==0)out.push(new T.Box3().setFromObject(o));});return out;};
  assert.deepEqual(sleeves(tucked),sleeves(loose));
  assert.ok(box(tucked,VANGOGH_TEE_ID).max.y===box(loose,VANGOGH_TEE_ID).max.y,'the neckline stays');
  [loose,tucked].forEach(disposeObject);
});

test('tapping her top tucks it in and out; a top that cannot be tucked says why',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document,seen=[];
  const app=await startStudio(d,()=>({update(r){seen.push(r);},turn(){},dispose(){}}));
  const stage=d.getElementById('stage'),tap=id=>stage.dispatchEvent(new dom.window.CustomEvent('garment-tap',{detail:{id}}));
  const wear=(id,value)=>{const s=d.getElementById(id);s.value=value;s.dispatchEvent(new dom.window.Event('change'));};
  wear('dress-select','none');wear('top-select',VANGOGH_TEE_ID);
  assert.equal(app.getRecipe().tucked,false);assert.match(d.getElementById('drag-hint').textContent,/tap her top to tuck it in/);assert.equal(d.getElementById('tuck').hidden,false);
  tap(VANGOGH_TEE_ID);assert.equal(app.getRecipe().tucked,true);assert.equal(seen.at(-1).tucked,true,'the view is told');
  assert.match(d.getElementById('message').textContent,/tucked in/);assert.match(d.getElementById('drag-hint').textContent,/untuck it/);
  tap('trousers');assert.equal(app.getRecipe().tucked,true,'tapping another garment does nothing');
  d.getElementById('tuck').click();assert.equal(app.getRecipe().tucked,false,'the keyboard button does the same');assert.match(d.getElementById('message').textContent,/worn loose/);
  // Changing the top wears the new one as it is usually worn.
  tap(VANGOGH_TEE_ID);wear('top-select',DESIGUAL_RUGBY_ID);assert.equal(app.getRecipe().tucked,true);wear('top-select',MANGO_DOT_SHIRT_ID);assert.equal(app.getRecipe().tucked,false);
  wear('top-select',TOMMY_CABLE_ID);tap(TOMMY_CABLE_ID);assert.equal(app.getRecipe().tucked,false);assert.match(d.getElementById('message').textContent,/not one to tuck in/);
  assert.equal(d.getElementById('tuck').hidden,true);assert.equal(d.getElementById('drag-hint').textContent,'Drag to turn her');
  app.dispose();dom.window.close();
});
