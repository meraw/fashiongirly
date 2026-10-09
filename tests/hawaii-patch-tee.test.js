import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import TEE from '../src/wardrobe/garments/desigual-hawaii-patch-stripe-tee-v1.js';
const DESIGUAL_HAWAII_TEE_ID=TEE.id;
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
// Shares of a texture's pixels in a box (in pixels; row 0 is the hem) that are black stripe, white lettering, sky blue,
// the sign's maroon, or the cars' red.
const shares=({data,width:w},x0,x1,y0,y1)=>{let n=0;const s={dark:0,white:0,sky:0,maroon:0,red:0,colour:0};
  for(let y=y0;y<y1;y+=2)for(let x=x0;x<x1;x+=2){const k=(y*w+x)*4,r=data[k],g=data[k+1],b=data[k+2];n++;
    if(Math.max(r,g,b)<70)s.dark++;if(Math.min(r,g,b)>225)s.white++;if(b>150&&b>r+30)s.sky++;if(r>80&&r<140&&r>2*g&&b<70)s.maroon++;if(r>150&&g<80)s.red++;if(Math.max(r,g,b)-Math.min(r,g,b)>60)s.colour++;}
  for(const k in s)s[k]/=n;return s;};

test('Desigual Hawaii patch tee: boxy striped jersey, blackletter lettering and a picture patch on the front, plain stripes behind, dropped shoulders, tucked into the skirt',()=>{
  const g=GARMENTS[DESIGUAL_HAWAII_TEE_ID],spec=g.build;assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===DESIGUAL_HAWAII_TEE_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:DESIGUAL_HAWAII_TEE_ID});outfit.updateMatrixWorld(true);const top=outfit.getObjectByName(DESIGUAL_HAWAII_TEE_ID);
  for(const [name,count] of [['printed-tee-body',1],['crew-neckband',1],['turned-hem',1],['reference-fitted-sleeve',2],['turned-cuff',2]])
    assert.equal(named(top,name).length,count,name);
  const image=named(top,'printed-tee-body')[0].material.map.image,panel=image.width/2,h=image.height;
  // The back: plain stripes, about a third black, with no lettering or patch.
  const back=shares(image,panel,image.width,0,h);
  assert.ok(back.dark>.25&&back.dark<.5&&back.white<.005&&back.colour<.005,`back ${JSON.stringify(back)}`);
  // Fine stripes: about one to every period down the back.
  let runs=0;for(let y=1;y<h;y++){const k=(y*image.width+Math.round(panel*1.5))*4,j=k-image.width*4;if(image.data[k]<70&&image.data[j]>=70)runs++;}
  const expected=(spec.body.neck-spec.body.hem)*.76/spec.print.period;assert.ok(Math.abs(runs-expected)<expected*.15,`${runs} stripes down the back, against ${expected.toFixed(0)}`);
  // The front: white lettering, and the patch's sky, sign and red car, on her left (the viewer's right of the panel).
  const front=shares(image,0,panel,0,h);assert.ok(front.white>.06,`lettering ${front.white.toFixed(3)}`);
  const left=shares(image,0,Math.round(panel*.3),0,h),right=shares(image,Math.round(panel*.5),panel,0,h);
  for(const ink of ['sky','maroon','red'])assert.ok(right[ink]>.002,`${ink} on the patch (${right[ink].toFixed(4)})`);
  assert.ok(left.sky<.001&&left.white>.08,'her right front carries only the lettering');
  // Long relaxed sleeves to her wrist, their stripes running round the arm and meeting themselves; above the dropped
  // shoulder seam, on the outside of the arm, they run down it instead.
  for(const [i,sleeve] of named(top,'reference-fitted-sleeve').entries()){const m=sleeve.material.map,{data:d,width:w,height:sh}=m.image;assert.equal(m.wrapS,T.RepeatWrapping);
    const diff=(a,b)=>{let s=0;for(let y=0;y<sh;y++)for(let k=0;k<3;k++)s+=Math.abs(d[(y*w+a)*4+k]-d[(y*w+b)*4+k]);return s/sh;};
    const seam=diff(w-1,0),inner=[1,w>>2,w>>1,(3*w)>>2].map(x=>diff(x-1,x)).reduce((a,b)=>a+b)/4;assert.ok(seam<inner*2+1,`seamless round the arm (${seam.toFixed(1)} against ${inner.toFixed(1)})`);
    const b=new T.Box3().setFromObject(sleeve);assert.ok(b.min.y/.76<1.33,`sleeve reaches her wrist (${(b.min.y/.76).toFixed(3)})`);
    const outer=sleeve.parent.position.x>0?.25:.75,changes=row=>{let n=0;for(let x=Math.round((outer-.08)*w);x<(outer+.08)*w;x++){const a=d[(row*w+x)*4]<70,c=d[(row*w+x+1)*4]<70;if(a!==c)n++;}return n;};
    assert.ok(changes(sh-6)>=4,`stripes run down the arm above the seam (${changes(sh-6)})`);assert.ok(changes(sh>>1)<=1,`and round it below (${changes(sh>>1)})`);}
  // Boxy: wider than the fitted Mickey tee at the waist, and to the hip, over the waistband.
  const body=new T.Box3().setFromObject(named(top,'printed-tee-body')[0]);assert.ok(body.min.y/.76<1.12,'to the hip');
  disposeObject(outfit);
  // Over the skirt it is tucked in: it ends inside the skirt's waistband, with no hem showing, and the skirt's bow shows.
  const skirted=makeOutfit({topId:DESIGUAL_HAWAII_TEE_ID,skirt:true});skirted.updateMatrixWorld(true);assert.ok(skirted.getObjectByName('ribbon-knot'),'bow shows');
  const tee=skirted.getObjectByName(DESIGUAL_HAWAII_TEE_ID),hem=new T.Box3().setFromObject(named(tee,'printed-tee-body')[0]).min.y/.76;
  assert.ok(hem>1.24&&hem<1.28,`tucked hem at ${hem}`);assert.equal(named(tee,'turned-hem').length,0);
  disposeObject(skirted);
  // The Mickey tee keeps its turned hem over the skirt.
  const mickey=makeOutfit({topId:'black-mickey-print-long-tee-v1',skirt:true});assert.equal(named(mickey,'turned-hem').length,1);disposeObject(mickey);
});
