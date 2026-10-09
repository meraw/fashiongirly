import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, PAISLEY_SHIRT_ID, MOTEL_TIE_DYE_SHIRT_ID, DESIGUAL_SPRAY_FLORAL_SHIRT_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const box=o=>new T.Box3().setFromObject(o);

test('paisley shirt: relaxed and longer than the fitted shirts, cuffed sleeves, a back yoke with a pleat, and a drawn paisley print',()=>{
  const g=GARMENTS[PAISLEY_SHIRT_ID];assert.equal(g.slot,'top');assert.ok(g.layering?.coversWaistband);assert.ok(OUTFITS.some(look=>look.recipe.topId===PAISLEY_SHIRT_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:PAISLEY_SHIRT_ID,knit:false,shirt:false}),top=outfit.getObjectByName(PAISLEY_SHIRT_ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['mesh-shirt-body',1],['mesh-shirt-sleeve',2],['shirt-cuff',2],['cuff-button',2],['cuff-stitch',4],['shirt-collar-fall',1],['shirt-button',8],['yoke-seam',1],['back-pleat',2],['hem-stitch',1]])
    assert.equal(named(top,name).length,count,name);
  // Relaxed: wider than the fitted shirts at her waist, and longer, to a hem below the waistband.
  const fitted=makeOutfit({topId:MOTEL_TIE_DYE_SHIRT_ID,knit:false,shirt:false});fitted.updateMatrixWorld(true);
  const ours=box(named(top,'mesh-shirt-body')[0]),theirs=box(named(fitted,'mesh-shirt-body')[0]);
  assert.ok(ours.max.x>theirs.max.x+.01,`wider (${ours.max.x.toFixed(3)} against ${theirs.max.x.toFixed(3)})`);
  assert.ok(ours.min.y/.76<theirs.min.y/.76-.05,`longer (hem ${(ours.min.y/.76).toFixed(3)} against ${(theirs.min.y/.76).toFixed(3)})`);
  // The yoke seam and pleat are on her back.
  for(const name of ['yoke-seam','back-pleat'])for(const o of named(top,name))assert.ok(box(o).max.z<0,`${name} on the back`);
  // The print: about half warm white ground, with every ink in it, and the tile repeats without a seam both ways.
  const body=named(top,'mesh-shirt-body')[0],{data,width:w,height:h}=body.material.map.image;let ground=0;
  for(let i=0;i<w*h*4;i+=4){const [r,gr,b]=[data[i],data[i+1],data[i+2]];if(r>205&&gr>205&&b>205&&Math.max(r,gr,b)-Math.min(r,gr,b)<16)ground++;}
  assert.ok(ground>w*h*.3&&ground<w*h*.75,`ground share ${(ground/w/h).toFixed(2)}`);
  const hue=(r,gr,b)=>{const mx=Math.max(r,gr,b),mn=Math.min(r,gr,b);if(mx-mn<30)return null;const d=mx-mn;let hh=mx===r?((gr-b)/d)%6:mx===gr?(b-r)/d+2:(r-gr)/d+4;return (hh*60+360)%360;};
  const families={yellow:[35,60],blue:[200,240],pink:[320,350],green:[70,140]},found=Object.fromEntries(Object.keys(families).map(k=>[k,0]));
  for(let i=0;i<w*h*4;i+=4){const hh=hue(data[i],data[i+1],data[i+2]);if(hh===null)continue;for(const [k,[a,b]] of Object.entries(families))if(hh>=a&&hh<b)found[k]++;}
  for(const [k,n] of Object.entries(found))assert.ok(n>w*h*.01,`${k} ink (${n})`);
  const diff=(a,b,col)=>{let s=0;const n=col?h:w;for(let t=0;t<n;t++)for(let k=0;k<3;k++){const ia=col?(t*w+a)*4:(a*w+t)*4,ib=col?(t*w+b)*4:(b*w+t)*4;s+=Math.abs(data[ia+k]-data[ib+k]);}return s/n;};
  const seamX=diff(w-1,0,true),innerX=diff(w>>1,(w>>1)+1,true),seamY=diff(h-1,0,false),innerY=diff(h>>1,(h>>1)+1,false);
  assert.ok(seamX<innerX*2+2&&seamY<innerY*2+2,`seamless (${seamX.toFixed(1)}/${innerX.toFixed(1)}, ${seamY.toFixed(1)}/${innerY.toFixed(1)})`);
  [outfit,fitted].forEach(disposeObject);
});

test('the fitted shirts keep their own construction: no cuffs, yoke or relaxed body',()=>{
  for(const id of [MOTEL_TIE_DYE_SHIRT_ID,DESIGUAL_SPRAY_FLORAL_SHIRT_ID]){
    const outfit=makeOutfit({topId:id,knit:false,shirt:false}),top=outfit.getObjectByName(id);outfit.updateMatrixWorld(true);
    for(const name of ['shirt-cuff','cuff-button','cuff-stitch','yoke-seam','back-pleat'])assert.equal(named(top,name).length,0,`${id}: ${name}`);
    assert.equal(named(top,'sleeve-hem-stitch').length,2);assert.ok(Math.abs(box(named(top,'mesh-shirt-body')[0]).min.y/.76-1.26)<.002,`${id}: cropped at 1.26`);
    disposeObject(outfit);
  }
});
