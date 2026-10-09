import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const ID='levis-colourblock-half-zip-anorak-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const isRed=([r,g,b])=>r>110&&g<70&&b<80,isPink=([r,g,b])=>r>200&&g>170&&r-g>10&&b>g;

test("Levi's anorak: a pink pullover with a red yoke ending in a V front and back, a half zip, a chest print and printed tape cords",()=>{
  const B=GARMENTS[ID].build;
  assert.equal(GARMENTS[ID].slot,'outerwear');assert.equal(GARMENTS[ID].status,'user-approved');
  assert.equal(cleanRecipe({outerwearId:ID}).outerwearOpen,false,'starts zipped, as the user wears outerwear');
  const outfit=makeOutfit({outerwearId:ID}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  for(const [name,count] of [['jacket-body',1],['elastic-hem-band',1],['coil-zip',1],['zip-slider',1],['zip-stop',1],['hood',1],['drawcord-tape',2],['cord-eyelet',2],['pocket-welt',2],
    ['drawcord',0],['cord-tip',0],['snap-button',0],['hood-label',0],['sleeve-badge',0],['back-label',0]])
    assert.equal(named(jacket,name).length,count,name);
  // The half zip runs from the collar down to the V, not to the hem; the stop is at its end.
  const zip=new T.Box3().setFromObject(named(jacket,'coil-zip')[0]);
  assert.ok(Math.abs(zip.min.y/.76-B.zip.bottom)<.01&&zip.max.y/.76>B.body.collarTop-.02,`zip from ${(zip.min.y/.76).toFixed(3)} to ${(zip.max.y/.76).toFixed(3)}`);
  assert.ok(Math.abs(named(jacket,'zip-stop')[0].position.y-B.zip.bottom)<.01,'the stop at the zip\'s end');
  // The colour block, read from the body's texture (u round her from the centre front, v up from y = 1): red above the V,
  // pink below it, at the centre front and the centre back alike; red over the collar.
  const tex=named(jacket,'jacket-body')[0].material.map.image,px=(a,y)=>{const i=Math.round(a/(Math.PI*2)*tex.width)%tex.width,j=Math.round((y-1)*tex.height),k=(j*tex.width+i)*4;return [tex.data[k],tex.data[k+1],tex.data[k+2]];};
  const Y=B.yoke;
  for(const [a,centre] of [[.01,Y.frontCentre],[Math.PI,Y.backCentre]]){assert.ok(isRed(px(a,centre+.03)),`red above the V at ${a.toFixed(2)}`);assert.ok(isPink(px(a,centre-.03)),`pink below the V at ${a.toFixed(2)}`);}
  assert.ok(isRed(px(Math.PI/2,Y.frontSide+.01))&&isPink(px(Math.PI/2,Y.frontCentre)),'the V rises to the sides');
  assert.ok(isRed(px(.05,1.95)),'red over the collar');
  // The print: white lettering on the red yoke on her left chest only.
  // The letters are only a few pixels across, so most of their ink blends with the red: count pixels well lighter than
  // the red, across the front of her chest on each side (where the yoke is red all the way up these rows).
  const light=([r,g,b])=>g>100&&b>100;let left=0,right=0;
  for(let j=Math.round((Y.wordmark.y-1)*tex.height);j<(Y.wordmark.y+Y.wordmark.height-1)*tex.height;j++)for(let i=0;i<tex.width;i++){const a=i/tex.width*Math.PI*2;if(a>1&&a<Math.PI*2-1)continue;
    const k=(j*tex.width+i)*4;if(light([tex.data[k],tex.data[k+1],tex.data[k+2]]))a<1?left++:right++;}
  assert.ok(left>40&&right===0,`print on her left chest (${left} light pixels; ${right} on her right)`);
  // The tapes: flat, white with dark lettering, hanging from the collar most of the way down the front.
  for(const tape of named(jacket,'drawcord-tape')){const b=new T.Box3().setFromObject(tape);assert.ok(b.max.y/.76>1.85&&b.min.y/.76<1.5,'long tapes');
    const d=tape.material.map.image.data;let dark=0,light=0;for(let k=0;k<d.length;k+=4)(d[k]<80?dark++:light++);assert.ok(dark>light*.05&&light>dark,'printed lettering on white tape');}
  // The hood is red, like the yoke.
  assert.equal('#'+named(jacket,'hood')[0].material.color.getHexString(),B.colours.hood);
  disposeObject(outfit);
  assert.ok(OUTFITS.some(look=>look.recipe.outerwearId===ID),'has a study');
});

test("Levi's anorak shown open: only the half zip opens, the fronts parting above its end",()=>{
  const B=GARMENTS[ID].build,outfit=makeOutfit({outerwearId:ID,outerwearOpen:true}),jacket=outfit.getObjectByName('outerwear');outfit.updateMatrixWorld(true);
  assert.equal(jacket.userData.open,true);
  assert.equal(jacket.userData.opening(B.zip.bottom-.05),0,'closed below the zip');assert.ok(jacket.userData.opening(B.body.collarBase-.01)>.15,'open at the neck');
  const body=named(jacket,'jacket-body')[0].geometry.attributes.position,p=new T.Vector3();let low=0,high=0;
  for(let i=0;i<body.count;i++){p.fromBufferAttribute(body,i);if(p.z>0&&Math.abs(p.x)<.02){if(p.y<B.zip.bottom-.05&&p.y>B.body.hem+.1)low++;else if(p.y>B.body.collarBase-.05&&p.y<B.body.collarBase)high++;}}
  assert.ok(low>0,'the front is whole below the zip');assert.equal(high,0,'nothing spans the open neck');
  assert.equal(named(jacket,'coil-zip-half').length,2);assert.equal(named(jacket,'coil-zip').length,0);
  disposeObject(outfit);
});
