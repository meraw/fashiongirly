import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, ADIDAS_CROPPED_WINDBREAKER_ID } from '../src/wardrobe/catalog.js';

const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('adidas cropped windbreaker: cropped at the waist on a shirred band, balloon sleeves into shirred cuffs, tonal zip and trefoil',()=>{
  assert.equal(GARMENTS[ADIDAS_CROPPED_WINDBREAKER_ID].slot,'outerwear');
  assert.equal(cleanRecipe({outerwearId:ADIDAS_CROPPED_WINDBREAKER_ID}).outerwearOpen,false,'starts zipped, as the user wears jackets');
  const outfit=makeOutfit({outerwearId:ADIDAS_CROPPED_WINDBREAKER_ID}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['elastic-hem-band',1],['elastic-cuff',2],['jacket-sleeve',2],['coil-zip',1],['zip-slider',1],
    ['hood',0],['drawcord',0],['pocket-welt',0],['pocket-flap',0],['sleeve-badge',0],['back-label',0],['zip-placket',0]])
    assert.equal(named(jacket,name).length,count,name);
  jacket.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.name);});
  // Cropped: the band sits at her waist, over the trousers' waistband, well above the hip-length windbreakers' hems.
  const band=new T.Box3().setFromObject(named(jacket,'elastic-hem-band')[0]);assert.ok(band.min.y/.76>1.18&&band.max.y/.76<1.3,`band ${(band.min.y/.76).toFixed(3)}–${(band.max.y/.76).toFixed(3)}`);
  // Shirred: the band's profile rises and falls in channels down its height.
  const p=named(jacket,'elastic-hem-band')[0].geometry.attributes.position,radii=[];for(let i=0;i<p.count;i+=129)radii.push(Math.hypot(p.getX(i),p.getZ(i)));
  let turns=0;for(let k=1;k<radii.length-1;k++)if((radii[k]-radii[k-1])*(radii[k+1]-radii[k])<0)turns++;assert.ok(turns>=6,`channels (${turns} turns)`);
  // Balloon sleeves: wider than the hip-length windbreakers' at the forearm.
  assert.ok(GARMENTS[ADIDAS_CROPPED_WINDBREAKER_ID].build.sleeve.rows.some(r=>r[1]>.19),'full sleeves');
  // A tonal trefoil on her left chest, and a tonal zip.
  const map=named(jacket,'jacket-body')[0].material.map,{data,width:w,height:h}=map.image,G=GARMENTS[ADIDAS_CROPPED_WINDBREAKER_ID].build.logo;
  const rx=.37,ai=Math.round(Math.asin(G.x/rx)/(Math.PI*2)*w),j0=Math.round((G.y-1)*h),j1=Math.round((G.y+G.size-1)*h);
  let darker=0,lighter=0;for(let j=j0;j<j1;j++)for(let i=ai-12;i<=ai+12;i++){const k=(j*w+i)*4;if(data[k]<data[(j*w+ai+40)*4]-8)darker++;else lighter++;}
  assert.ok(darker>10,'the trefoil shows as a tonal shade');
  assert.equal(named(jacket,'coil-zip')[0].material.color.getHexString(),new T.Color('#f0ece5').getHexString());
  disposeObject(outfit);
  assert.ok(OUTFITS.some(look=>look.recipe.outerwearId===ADIDAS_CROPPED_WINDBREAKER_ID),'has a study');
});
