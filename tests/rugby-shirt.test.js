import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, DESIGUAL_RUGBY_ID } from '../src/wardrobe/catalog.js';
import { levelCaster } from '../src/doll/level-caster.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const recipe=extra=>({topId:DESIGUAL_RUGBY_ID,knit:false,shirt:false,...extra});

test('rugby shirt: navy jersey, cream collar and short placket with white buttons, three tiger patches on her left chest, ribbed cuffs',()=>{
  const g=GARMENTS[DESIGUAL_RUGBY_ID];assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===DESIGUAL_RUGBY_ID),'a study preset wears it');
  const outfit=makeOutfit(recipe()),top=outfit.getObjectByName(DESIGUAL_RUGBY_ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['mesh-shirt-body',1],['mesh-shirt-sleeve',2],['shirt-cuff',2],['cuff-button',0],['contrast-placket',1],['applique-patch',3],['shirt-button',3],['shirt-collar-fall',1]])
    assert.equal(named(top,name).length,count,name);
  // Navy body, cream collar and placket, white buttons, all buttoned: the lowest button sits on the short placket.
  const px=named(top,'mesh-shirt-body')[0].material.map.image.data;assert.ok(px[2]>px[0]&&px[0]<40,'navy');
  const collar=named(top,'shirt-collar-fall')[0].material.map.image.data;assert.ok(collar[0]>200&&collar[1]>200,'cream collar');
  const placket=named(top,'contrast-placket')[0],pb=new T.Box3().setFromObject(placket);assert.ok(placket.material.color.r>.7,'cream placket');
  for(const b of named(top,'shirt-button')){const y=b.getWorldPosition(new T.Vector3()).y;assert.ok(b.material.color.r>.85,'white');assert.ok(y>pb.min.y&&y<pb.max.y+.02,'on the placket');}
  // Three patches in blue, pink and yellow, stacked down her left chest.
  const patches=named(top,'applique-patch').map(p=>({p,c:new T.Box3().setFromObject(p).getCenter(new T.Vector3())})).sort((a,b)=>b.c.y-a.c.y);
  for(const {c} of patches)assert.ok(c.x>.1&&c.z>0,'left chest');
  // Ribbed cuffs (a rib in the bump), without buttons.
  for(const cuff of named(top,'shirt-cuff'))assert.ok(cuff.material.bumpMap&&cuff.material.bumpScale>=.005,'ribbed cuff');
  disposeObject(outfit);
});

test('rugby shirt tucks into every pair of trousers, inside the waistband, and into the skirt',()=>{
  const bottoms=['classic',...Object.keys(GARMENTS).filter(id=>GARMENTS[id].slot==='bottom')],o=new T.Vector3(),d=new T.Vector3(),p=new T.Vector3();
  for(const bottomId of bottoms){
    const outfit=makeOutfit(recipe({bottomId}));outfit.updateMatrixWorld(true);
    const trousers=[];outfit.getObjectByName('trousers').traverse(m=>{if(m.isMesh&&!m.isInstancedMesh)trousers.push(m);});
    const body=outfit.getObjectByName(DESIGUAL_RUGBY_ID).getObjectByName('mesh-shirt-body');
    let top=-Infinity;for(const m of trousers){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);if(Math.abs(p.x)<.32*1.06)top=Math.max(top,p.y);}}
    // Below the top of the waistband, all round her, the shirt lies inside the trousers.
    const inT=levelCaster(trousers,{axis:[0,0],faces:'both'}),inS=levelCaster([body],{axis:[0,0],faces:'both'});let checked=0;
    for(const dy of [.01,.025,.045])for(let k=0;k<48;k++){const a=k/48*Math.PI*2,y=top-dy*.76;
      o.set(0,y,0);d.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(new T.Vector3(0,1,0),1e-5);
      const t=inT(o,d)?.distance,s=inS(o,d)?.distance;if(t==null||s==null)continue;
      assert.ok(s<t-.001,`${bottomId}: the shirt shows through the waistband ${dy} below its top`);checked++;}
    assert.ok(checked>80,`${bottomId}: checked ${checked}`);
    // Above the waistband the shirt reaches down into it, with no gap: its lowest point is below the waistband's top.
    assert.ok(new T.Box3().setFromObject(body).min.y<top-.02,`${bottomId}: tucked in`);
    disposeObject(outfit);
  }
  // Over the skirt it is tucked into the skirt, whose bow shows.
  const skirt=makeOutfit(recipe({skirt:true}));assert.ok(named(skirt,'ribbon-loop').length>0,'the bow shows');
  const b=new T.Box3().setFromObject(skirt.getObjectByName(DESIGUAL_RUGBY_ID).getObjectByName('mesh-shirt-body'));skirt.updateMatrixWorld(true);
  assert.ok(new T.Box3().setFromObject(skirt.getObjectByName(DESIGUAL_RUGBY_ID).getObjectByName('mesh-shirt-body')).min.y/.76>1.25,'tucked into the skirt');
  disposeObject(skirt);
});
