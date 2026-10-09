import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, DESIGUAL_LIFE_AWESOME_ID } from '../src/wardrobe/catalog.js';
const all=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Shares of a texture's pixels in a box (in pixels) that are olive embroidery (yellow-green, darker than the lime neps'
// highlights), lime neps, dark green flecks, or the pale marl.
const shares=(image,x0,x1,y0,y1)=>{const {data,width:w}=image;let n=0,olive=0,lime=0,dark=0,pale=0;
  for(let y=Math.round(y0);y<y1;y+=2)for(let x=Math.round(x0);x<x1;x+=2){const k=(y*w+x)*4,r=data[k],g=data[k+1],b=data[k+2];n++;
    if(r>b+50&&g>b+50&&r>=g-8&&r<160)olive++;else if(g>b+45&&g>r)lime++;else if(Math.max(r,g,b)<75)dark++;else pale++;}
  return {olive:olive/n,lime:lime/n,dark:dark/n,pale:pale/n};};

test('Life is awesome jumper: chunky marled rib knit with lime and green flecks, embroidered lettering on the chest, no side tab',()=>{
  const spec=GARMENTS[DESIGUAL_LIFE_AWESOME_ID].build,recipe=cleanRecipe({topId:DESIGUAL_LIFE_AWESOME_ID,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit(recipe);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['sweatshirt-body',1],['ribbed-hem-band',1],['ribbed-crew-neck',1],['side-seam-tab',0],['knit-jumper-sleeve',2],['ribbed-cuff',2]])
    assert.equal(all(outfit,name).length,count,name);
  // The knit: matte, with the rib raised in the bump. The marl is mostly pale, flecked with lime and dark green.
  const body=all(outfit,'sweatshirt-body')[0],image=body.material.map.image,panel=image.width/2;
  assert.ok(body.material.roughness>.9&&body.material.bumpMap,'matte rib knit');
  const knit=shares(image,panel,image.width,0,image.height);
  assert.ok(knit.pale>.6&&knit.lime>.04&&knit.dark>.03&&knit.olive<.05,`back: ${JSON.stringify(knit)}`);
  // The lettering: across the front panel's chest, in olive, centred; the back carries none.
  const E=spec.embroidery,top=(spec.body.neck-E.top)*.76*1300,em=E.height*1300;
  const across=shares(image,panel*.15,panel*.85,top-em*.2,top+em*1.6);
  assert.ok(across.olive>.12,`lettering ${across.olive.toFixed(2)}`);
  const below=shares(image,panel*.15,panel*.85,top+em*3,top+em*6);assert.ok(below.olive<.02,'only one line of lettering');
  // It fits on the front, where she shows it: no lettering in the outer 6% of the front panel either side.
  for(const [a,b] of [[0,panel*.06],[panel*.94,panel]])assert.ok(shares(image,a,b,top-em,top+em*2).olive<.02,'the lettering stays on the front');
  // Long full sleeves to long rib cuffs at her wrist.
  for(const cuff of all(outfit,'ribbed-cuff')){const b=new T.Box3().setFromObject(cuff);assert.ok(b.min.y/.76<1.32,`cuff reaches her wrist (${(b.min.y/.76).toFixed(3)})`);}
  for(const s of all(outfit,'knit-jumper-sleeve')){const b=new T.Box3().setFromObject(s);assert.ok(b.max.x-b.min.x>.3,'full sleeves');}
  disposeObject(outfit);
  // The Levi's sweatshirt keeps its fleece, logo and tab.
  const levis=makeOutfit({topId:'levis-floral-batwing-sweatshirt-v1'});assert.equal(all(levis,'side-seam-tab').length,1);disposeObject(levis);
});
