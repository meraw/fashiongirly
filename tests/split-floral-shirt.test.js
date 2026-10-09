import test from 'node:test';
import assert from 'node:assert/strict';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { DESIGUAL_SPLIT_FLORAL_SHIRT_ID, MOTEL_TIE_DYE_SHIRT_ID } from '../src/wardrobe/catalog.js';
const all=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Share of a texture's pixels in a box of u (0–1) and height (outfit units, v = y - 1) that are not the black ground.
const busy=(map,u0,u1,y0,y1)=>{const {data,width:w,height:h}=map.image;let n=0,ink=0;
  for(let j=Math.floor((y0-1)*h);j<(y1-1)*h;j+=2)for(let i=Math.floor(u0*w);i<u1*w;i+=2){const k=(j*w+i)*4;n++;if(Math.max(data[k],data[k+1],data[k+2])>70)ink++;}return ink/n;};

test('Desigual split floral shirt: small flowers on her right and the back, large flowers on black on her left',()=>{
  const recipe=cleanRecipe({topId:DESIGUAL_SPLIT_FLORAL_SHIRT_ID,knit:true,shirt:true});
  assert.equal(recipe.topId,DESIGUAL_SPLIT_FLORAL_SHIRT_ID);assert.equal(recipe.knit,false,'a shirt replaces the classic knit');
  const outfit=makeOutfit(recipe);
  for(const name of ['mesh-shirt-body','shirt-collar-fall','shirt-collar-stand','hem-stitch'])assert.ok(outfit.getObjectByName(name),name);
  assert.equal(all(outfit,'shirt-button').length,7);assert.equal(all(outfit,'mesh-shirt-sleeve').length,2);
  // The body's print, by angle round her (u: 0 at the centre front, toward her left) and height.
  const body=outfit.getObjectByName('mesh-shirt-body').material.map;
  const right=busy(body,.8,.97,1.3,1.85),left=busy(body,.03,.22,1.3,1.85),back=busy(body,.35,.65,1.3,1.75),yoke=busy(body,.4,.6,1.8,1.9);
  assert.ok(right>.2,`small flowers fill her right front (${right.toFixed(2)})`);
  assert.ok(left>.1&&left<.5,`large flowers on her left front, which stays mostly black (${left.toFixed(2)})`);
  assert.ok(back>.2,`small flowers on the back (${back.toFixed(2)})`);assert.ok(yoke<.08,`a plain black yoke (${yoke.toFixed(2)})`);
  // Each sleeve has its own print: her left (+x) black with a few large flowers, her right all small flowers.
  const sleeves=all(outfit,'mesh-shirt-sleeve').map(s=>({x:s.parent.position.x,map:s.material.map}));
  const L=sleeves.find(s=>s.x>0).map,R=sleeves.find(s=>s.x<0).map;assert.notEqual(L.image,R.image);
  assert.ok(busy(L,.6,.9,1.35,1.75)<.12,'her left sleeve is mostly plain black away from its flowers');assert.ok(busy(R,0,1,1.35,1.75)>.2,'her right sleeve is all small flowers');
  // The collar is split the same way: black on her left (u < .5) apart from a large flower, small flowers on her right.
  const collar=outfit.getObjectByName('shirt-collar-fall').material.map;assert.ok(busy(collar,.55,.95,1.85,1.95)>.2);
  disposeObject(outfit);
  // The other shirts still share one print over the body, sleeves and collar.
  const motel=makeOutfit({topId:MOTEL_TIE_DYE_SHIRT_ID,knit:false,shirt:false}),bm=motel.getObjectByName('mesh-shirt-body').material.map.image;
  for(const s of all(motel,'mesh-shirt-sleeve'))assert.equal(s.material.map.image.data,bm.data);
  assert.equal(motel.getObjectByName('shirt-collar-fall').material.map.image.data,bm.data);disposeObject(motel);
});
