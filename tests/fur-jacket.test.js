import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, BOMBOOGIE_FUR_JACKET_ID, DESIGUAL_LEATHER_JACKET_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Bomboogie fur jacket: faux fur, big point collar, hidden snap front, chest flaps, side pockets and fur cuffs',()=>{
  const spec=GARMENTS[BOMBOOGIE_FUR_JACKET_ID],outfit=makeOutfit({outerwearId:BOMBOOGIE_FUR_JACKET_ID}),jacket=outfit.getObjectByName('outerwear');
  outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['hem-roll',1],['front-parting',1],['front-edge',2],['front-snap',spec.build.snaps.length],['chest-flap',2],['chest-flap-edge',2],['side-pocket-slit',2],['side-pocket-welt',2],['fur-collar',1],['collar-fold',1],['collar-edge',1],['neck-lining',1],['neck-label',1],['hanger-chain',1],['jacket-sleeve',2],['fur-cuff',2]])
    assert.equal(named(jacket,name).length,count,name);
  for(const name of ['coil-zip','metal-zip','rib-hem-band','elastic-hem-band','hood'])assert.equal(named(jacket,name).length,0,`no ${name}`);
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // Fur: a matte, velvety sheen over a hair texture, the hairs lying down the body and down the sleeves.
  const body=named(jacket,'jacket-body')[0].material,sleeve=named(jacket,'jacket-sleeve')[0].material;
  assert.ok(body.sheen>.8&&body.roughness===1&&body.bumpMap&&body.map,'fur');
  assert.ok(body.map.repeat.y<0&&sleeve.map.repeat.y>0,'hairs lie downward on the body (v up) and the sleeves (v down)');
  // Closed with its snaps: it has no open state.
  assert.equal(cleanRecipe({outerwearId:BOMBOOGIE_FUR_JACKET_ID,outerwearOpen:true}).outerwearOpen,false);assert.equal(jacket.userData.open,false);
  // Cropped at the high hip, and the collar's points come down onto her chest.
  const hem=new T.Box3().setFromObject(named(jacket,'hem-roll')[0]);assert.ok(hem.min.y/.76>1.09&&hem.min.y/.76<1.13,`hem at ${(hem.min.y/.76).toFixed(3)}`);
  const collar=new T.Box3().setFromObject(named(jacket,'fur-collar')[0]);assert.ok(collar.min.y/.76<1.75,`collar points reach ${(collar.min.y/.76).toFixed(3)}`);
  // The chest flaps lie on the outside of the body, one each side.
  for(const f of named(jacket,'chest-flap')){const b=new T.Box3().setFromObject(f),c=b.getCenter(new T.Vector3());assert.ok(c.z>.15&&Math.abs(c.x)>.1,'on the chest');}
  assert.ok(new T.Box3().setFromObject(named(jacket,'chest-flap')[0]).getCenter(new T.Vector3()).x*new T.Box3().setFromObject(named(jacket,'chest-flap')[1]).getCenter(new T.Vector3()).x<0);
  disposeObject(outfit);
  // Boxy at its own size, easing out over a chunky jumper; and it is looser than the fitted leather jacket.
  const width=(recipe,id=BOMBOOGIE_FUR_JACKET_ID)=>{const o=makeOutfit({...recipe,outerwearId:id});const b=new T.Box3().setFromObject(o.getObjectByName('outerwear').getObjectByName('jacket-body'));disposeObject(o);return b.max.x-b.min.x;};
  assert.ok(width({topId:'mango-plaid-jumper-v1'})>width({topId:'desigual-silver-cable-jumper-v1'}),'eases out over a chunky jumper');
  assert.ok(width({})>width({},DESIGUAL_LEATHER_JACKET_ID),'boxier than the leather jacket');
  const t0=performance.now();disposeObject(makeOutfit({outerwearId:BOMBOOGIE_FUR_JACKET_ID}));assert.ok(performance.now()-t0<600,'outfit build time');
});
