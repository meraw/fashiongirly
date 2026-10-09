import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS, LEVIS_FLORAL_LOGO_SWEATSHIRT_ID } from '../src/wardrobe/catalog.js';
const all=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Shares of a texture's pixels in a box (in pixels) that are sky blue, and that are near-black ink.
const shares=(image,x0,x1,y0,y1)=>{const {data,width:w}=image;let n=0,sky=0,ink=0;
  for(let y=Math.round(y0);y<y1;y+=2)for(let x=Math.round(x0);x<x1;x+=2){const k=(y*w+x)*4,r=data[k],g=data[k+1],b=data[k+2];n++;if(b>r+35&&b>110)sky++;if(Math.max(r,g,b)<35)ink++;}
  return {sky:sky/n,ink:ink/n};};

test("Levi's sweatshirt: fleece with a floral batwing logo on the chest, rib neck, hem and cuffs, and a red side tab",()=>{
  const spec=GARMENTS[LEVIS_FLORAL_LOGO_SWEATSHIRT_ID].build,recipe=cleanRecipe({topId:LEVIS_FLORAL_LOGO_SWEATSHIRT_ID,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit(recipe);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['sweatshirt-body',1],['ribbed-hem-band',1],['ribbed-crew-neck',1],['side-seam-tab',1],['knit-jumper-sleeve',2],['ribbed-cuff',2]])
    assert.equal(all(outfit,name).length,count,name);
  // The logo: on the front panel (the left half of the body's texture), centred and high on her chest. It is mostly sky
  // blue and flowers, with the dark lettering across it; the back panel is plain fleece.
  const body=all(outfit,'sweatshirt-body')[0],image=body.material.map.image,L=spec.logo,panel=image.width/2,px=L.width*1300;
  const x0=panel/2-px/2,y0=(spec.body.neck-L.top)*.76*1300,logo=shares(image,x0,x0+px,y0,y0+L.height*px*.8);
  assert.ok(logo.sky>.2&&logo.ink>.05&&logo.ink<.4,`logo: sky ${logo.sky.toFixed(2)}, ink ${logo.ink.toFixed(2)}`);
  const lettering=shares(image,x0+L.text.x*px,x0+(L.text.x+L.text.width)*px,y0+(L.text.baseline-.08)*px,y0+(L.text.baseline-.02)*px);
  assert.ok(lettering.ink>.4,`lettering ${lettering.ink.toFixed(2)}`);
  const back=shares(image,panel+x0-px/2,panel+x0+px*1.5,0,image.height),beside=shares(image,0,x0-px*.15,0,image.height);
  assert.equal(back.sky,0,'plain back');assert.equal(beside.sky,0,'plain front beside the logo');
  // Upright: the logo's top edge (flat) is above its arched bottom edge, so the texture row at the logo's top maps high.
  const uv=body.geometry.attributes.uv,pos=body.geometry.attributes.position;let topV=Infinity,lowV=-Infinity;
  for(let i=0;i<uv.count;i++){if(pos.getY(i)>1.88)topV=Math.min(topV,uv.getY(i));if(pos.getY(i)<1.25)lowV=Math.max(lowV,uv.getY(i));}
  assert.ok(topV<.05&&lowV>.9,'texture rows run from the neckline down');
  // The red tab is on her left side (+x), just above the hem band, close against the side.
  const tab=all(outfit,'side-seam-tab')[0],box=new T.Box3().setFromObject(tab),y=(box.min.y+box.max.y)/2/.76;
  assert.ok(box.min.x>.25&&y>spec.body.hem+spec.body.band&&y<spec.body.hem+spec.body.band+.06,`tab at x ${box.min.x.toFixed(3)}, y ${y.toFixed(3)}`);
  assert.ok(tab.material.color.r>.4&&tab.material.color.g<.1,'red');
  // Long sleeves to rib cuffs at her wrist.
  for(const cuff of all(outfit,'ribbed-cuff')){const b=new T.Box3().setFromObject(cuff);assert.ok(b.min.y/.76<1.32,`cuff reaches her wrist (${(b.min.y/.76).toFixed(3)})`);}
  disposeObject(outfit);
  // The band hugs the jeans, or sits out over the skirt.
  const width=skirt=>{const o=makeOutfit({topId:LEVIS_FLORAL_LOGO_SWEATSHIRT_ID,skirt});const w=new T.Box3().setFromObject(o.getObjectByName('ribbed-hem-band')).getSize(new T.Vector3()).x;disposeObject(o);return w;};
  assert.ok(width(true)>width(false)+.03);
  const t0=performance.now();disposeObject(makeOutfit(recipe));assert.ok(performance.now()-t0<400,'the logo is drawn once and shared');
});
