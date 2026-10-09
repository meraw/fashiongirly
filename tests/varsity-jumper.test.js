import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, TOMMY_VARSITY_JUMPER_ID, LEVIS_FLORAL_LOGO_SWEATSHIRT_ID } from '../src/wardrobe/catalog.js';
const all=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Share of pixels in a box of a texture that are off-white ink, and that are lighter flecks in the red.
const shares=(image,x0,x1,y0,y1)=>{const {data,width:w}=image;let n=0,ink=0,fleck=0;
  for(let y=Math.round(y0);y<y1;y+=2)for(let x=Math.round(x0);x<x1;x+=2){const k=(y*w+x)*4,r=data[k],g=data[k+1];n++;if(g>170)ink++;else if(g>45)fleck++;}
  return {ink:ink/n,fleck:fleck/n};};

test('Tommy Jeans varsity jumper: heathered red knit, arched lettering over a crest, mock neck, cropped on a deep rib band',()=>{
  const spec=GARMENTS[TOMMY_VARSITY_JUMPER_ID].build,L=spec.logo,recipe=cleanRecipe({topId:TOMMY_VARSITY_JUMPER_ID,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit(recipe);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['sweatshirt-body',1],['ribbed-hem-band',1],['ribbed-mock-neck',1],['neck-roll',1],['knit-jumper-sleeve',2],['ribbed-cuff',2],['side-seam-tab',0],['ribbed-crew-neck',0]])
    assert.equal(all(outfit,name).length,count,name);
  // The print on the front panel: the lettering across the top, the crest below it; the back is plain heathered red.
  const image=all(outfit,'sweatshirt-body')[0].material.map.image,panel=image.width/2,px=L.width*1300,x0=panel/2-px/2,y0=(spec.body.neck-L.top)*.76*1300;
  const lettering=shares(image,x0,x0+px,y0,y0+.2*px),crest=shares(image,x0+.3*px,x0+.7*px,y0+.3*px,y0+.7*px),back=shares(image,panel+20,image.width-20,0,image.height);
  assert.ok(lettering.ink>.25&&lettering.ink<.7,`lettering ink ${lettering.ink.toFixed(2)}`);
  assert.ok(crest.ink>.15&&crest.ink<.6,`crest ink ${crest.ink.toFixed(2)}`);
  assert.equal(back.ink,0,'plain back');assert.ok(back.fleck>.01&&back.fleck<.08,`heather flecks ${back.fleck.toFixed(3)}`);
  // Cropped at the waist: the band ends above the jeans' waistband, so the skirt's bow shows when she wears one.
  const band=new T.Box3().setFromObject(all(outfit,'ribbed-hem-band')[0]);assert.ok(band.min.y/.76>1.25,`hem at ${(band.min.y/.76).toFixed(3)}`);
  assert.ok(!GARMENTS[TOMMY_VARSITY_JUMPER_ID].layering?.coversWaistband);
  disposeObject(outfit);
  const skirted=makeOutfit({topId:TOMMY_VARSITY_JUMPER_ID,skirt:true});assert.ok(skirted.getObjectByName('ribbon-knot'),'the bow shows');disposeObject(skirted);
  // The template's new options are optional: the Levi's sweatshirt keeps its crew neck and tab and has no flecks.
  const levis=makeOutfit({topId:LEVIS_FLORAL_LOGO_SWEATSHIRT_ID});
  for(const [name,count] of [['ribbed-crew-neck',1],['side-seam-tab',1],['neck-roll',0]])assert.equal(all(levis,name).length,count,`sweatshirt ${name}`);
  disposeObject(levis);
  const t0=performance.now();disposeObject(makeOutfit(recipe));assert.ok(performance.now()-t0<400,'the print is drawn once and shared');
});
