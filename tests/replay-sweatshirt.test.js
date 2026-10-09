import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS, cleanRecipe } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
const REPLAY_ROSE_SWEATSHIRT_ID='replay-cream-rose-embroidered-sweatshirt-v1';
const all=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Shares of a texture's pixels in a box (in pixels) that are rose red, and that are leaf green.
const shares=(image,x0,x1,y0,y1)=>{const {data,width:w}=image;let n=0,red=0,green=0;
  for(let y=Math.round(Math.max(0,y0));y<y1;y+=2)for(let x=Math.round(Math.max(0,x0));x<x1;x+=2){const k=(y*w+x)*4,r=data[k],g=data[k+1],b=data[k+2];n++;if(r>90&&g<60&&b<80)red++;if(g>r+12&&g>b+20)green++;}
  return {red:red/n,green:green/n};};

test('Replay rose sweatshirt: cream fleece, embroidered roses across the chest, V insert, dropped shoulders, long cuffs, a hem lower at the back, a script on her left sleeve',()=>{
  const spec=GARMENTS[REPLAY_ROSE_SWEATSHIRT_ID].build,recipe=cleanRecipe({topId:REPLAY_ROSE_SWEATSHIRT_ID,knit:true,shirt:true});
  assert.equal(recipe.knit,false);assert.equal(recipe.shirt,false);
  const outfit=makeOutfit(recipe);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['sweatshirt-body',1],['ribbed-hem-band',1],['ribbed-crew-neck',1],['knit-jumper-sleeve',2],['shoulder-seam',2],['ribbed-cuff',2],['embroidered-script',1],['side-seam-tab',0]])
    assert.equal(all(outfit,name).length,count,name);
  // The embroidery: on the front panel (the left half of the body's texture), roses and leaves across her chest; the back
  // panel is plain cream.
  const body=all(outfit,'sweatshirt-body')[0],image=body.material.map.image,E=spec.embroidery,panel=image.width/2,px=E.width*1300;
  const x0=panel/2-px/2,y0=(spec.body.neck-E.top)*.76*1300,art=shares(image,x0,x0+px,y0,y0+E.height*px);
  assert.ok(art.red>.06&&art.green>.08,`embroidery: red ${art.red.toFixed(2)}, green ${art.green.toFixed(2)}`);
  const big=E.roses[0],rose=shares(image,x0+(big[0]-big[2]*.5)*px,x0+(big[0]+big[2]*.5)*px,y0+(big[1]-big[2]*.4)*px,y0+(big[1]+big[2]*.4)*px);
  assert.ok(rose.red>.8,`the big rose is red (${rose.red.toFixed(2)})`);
  const back=shares(image,panel,image.width,0,image.height);assert.equal(back.red+back.green,0,'plain back');
  const [r,g,b]=[0,1,2].map(c=>image.data[(Math.round(image.height*.9)*image.width+Math.round(panel*.1))*4+c]);assert.ok(r>200&&r>b+20&&g>b+8,`cream fleece ${r},${g},${b}`);
  // The hem band dips lower at the back than at the front.
  const band=all(outfit,'ribbed-hem-band')[0],pos=band.geometry.attributes.position;let front=Infinity,rear=Infinity;
  for(let i=0;i<pos.count;i++){const z=pos.getZ(i),y=pos.getY(i);if(z>.2)front=Math.min(front,y);if(z<-.2)rear=Math.min(rear,y);}
  assert.ok(Math.abs(front-spec.body.hem)<.01&&front-rear>spec.body.backDrop*.8,`hem front ${front.toFixed(3)}, back ${rear.toFixed(3)}`);
  // Long sleeves to rib cuffs that reach past her wrist; the script on her left sleeve (+x), facing forward.
  for(const cuff of all(outfit,'ribbed-cuff')){const c=new T.Box3().setFromObject(cuff);assert.ok(c.min.y/.76<1.3,`cuff reaches past her wrist (${(c.min.y/.76).toFixed(3)})`);}
  const script=new T.Box3().setFromObject(all(outfit,'embroidered-script')[0]).getCenter(new T.Vector3());
  assert.ok(script.x>.25&&script.z>0,`script at x ${script.x.toFixed(3)}, z ${script.z.toFixed(3)}`);
  disposeObject(outfit);
  // The band hugs the jeans, or sits out over the skirt.
  const width=skirt=>{const o=makeOutfit({topId:REPLAY_ROSE_SWEATSHIRT_ID,skirt});const w=new T.Box3().setFromObject(o.getObjectByName('ribbed-hem-band')).getSize(new T.Vector3()).x;disposeObject(o);return w;};
  assert.ok(width(true)>width(false)+.03);
  const t0=performance.now();disposeObject(makeOutfit(recipe));assert.ok(performance.now()-t0<400,'the embroidery is drawn once and shared');
  assert.ok(OUTFITS.some(look=>look.recipe.topId===REPLAY_ROSE_SWEATSHIRT_ID),'has a study');
});
