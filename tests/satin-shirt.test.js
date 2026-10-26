import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { TOP_TEMPLATES } from '../src/doll/top-templates.js';
import { needsFor, composeOutfit, suitedToday } from '../src/style/stylist.js';
const ID='black-satin-oversized-shirt-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('oversized black satin shirt: black satin with a lustre, open in a deep V over her skin, boxy to the top of her thigh, buttoned cuffs',()=>{
  const G=GARMENTS[ID],B=G.build;
  assert.equal(G.slot,'top');assert.equal(G.status,'user-approved');assert.ok(TOP_TEMPLATES['satin-shirt'],'its template is registered');
  const recipe=cleanRecipe({topId:ID,knit:true,shirt:true});assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit({topId:ID}),top=outfit.getObjectByName(ID);outfit.updateMatrixWorld(true);
  assert.ok(top,'built by the satin-shirt template');
  for(const [name,count] of [['mesh-shirt-body',1],['mesh-shirt-sleeve',2],['shirt-cuff',2],['bare-shoulder-skin',1]])assert.equal(named(top,name).length,count,name);
  // Satin: near black, smoother than the matte crepe and linen shirts, with a sheen.
  const body=named(top,'mesh-shirt-body')[0],mat=body.material,{data,width,height}=mat.map.image;let sum=0;
  for(let i=0;i<width*height;i++)sum+=(data[i*4]+data[i*4+1]+data[i*4+2])/3;
  assert.ok(sum/(width*height)<45,`black (${(sum/(width*height)).toFixed(1)})`);
  assert.ok(mat.roughness<.6&&mat.sheen>.4,`satin (roughness ${mat.roughness}, sheen ${mat.sheen})`);
  const linen=makeOutfit({topId:'white-linen-button-down-shirt-v1'});
  assert.ok(mat.roughness<named(linen,'mesh-shirt-body')[0].material.roughness,'smoother than the linen');disposeObject(linen);
  // An ample neckline: the front is cut away down to the V's point, far below the one-button-open shirts' (1.8).
  const p=body.geometry.attributes.position;let lowest=Infinity;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(z>.05&&Math.abs(x)<.012&&y>1.4)lowest=Math.min(lowest,y);}
  assert.ok(lowest<1.7,`the V reaches down to ${lowest.toFixed(3)}`);
  // Every button sits below the V, the highest just under its point.
  const buttons=named(top,'shirt-button').map(b=>b.getWorldPosition(new T.Vector3()).y/.76);
  assert.equal(buttons.length,B.buttons.length);assert.ok(Math.max(...buttons)<B.open.bottom,'no button in the V');
  // Her chest fills the V: the skin piece reaches the V's point.
  const skin=new T.Box3().setFromObject(named(top,'bare-shoulder-skin')[0]);assert.ok(skin.min.y/.76<=B.open.bottom,'skin down to the V');
  // Oversized: boxy, wider at the hem and longer than the relaxed gingham shirt, with a shirt-tail hem.
  const box=new T.Box3().setFromObject(body),gingham=makeOutfit({topId:'levis-lilac-gingham-shirt-v1'}),gbox=new T.Box3().setFromObject(named(gingham,'mesh-shirt-body')[0]);
  assert.ok(box.min.y<=gbox.min.y+1e-6,`as long as the gingham shirt or longer (${(box.min.y/.76).toFixed(3)})`);
  assert.ok(box.max.x-box.min.x>=gbox.max.x-gbox.min.x-1e-6,'as wide as the gingham shirt or wider');disposeObject(gingham);
  disposeObject(outfit);
  // Over the skirt it is tucked in, so the bow shows.
  const skirt=makeOutfit({topId:ID,skirt:true});const low=new T.Box3().setFromObject(named(skirt.getObjectByName(ID),'mesh-shirt-body')[0]).min.y/.76;
  assert.ok(low>1.2,`tucked into the skirt (${low.toFixed(3)})`);disposeObject(skirt);
  assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'has a study');
});

// A warm day of showers (the shirt's own day out: satin on a mild day). No pair suits it in every way: the boots are
// too warm and the other closed shoes are not made for rain. She lets go of those rules before the one that keeps open
// shoes out of the rain, so the slides and sandals stay home (before, she fell back to every pair).
test('dressed around the satin shirt on a warm day of showers, she wears closed shoes',()=>{
  const showers={feels:24,feelsMin:24,feelsMax:24,rainChance:20,rainMm:.6,windKmh:10,code:61,wetHours:3};
  assert.ok(needsFor(showers).rainy,'a rainy day');
  const open=id=>/open/.test(GARMENTS[id]?.styling?.coverage?.foot??'');
  const shoes=[...suitedToday(showers)].filter(id=>GARMENTS[id]?.slot==='shoes');
  assert.ok(shoes.length,'some shoes suit the day');assert.deepEqual(shoes.filter(open),[],'no open shoes in the rain');
  const r=composeOutfit(showers,{keep:{top:ID}});assert.ok(r,'she can still dress around it');assert.ok(!open(r.recipe.shoesId),`closed shoes (${r.recipe.shoesId})`);
});
