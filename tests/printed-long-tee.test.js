import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, MICKEY_LONG_TEE_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));

test('Mickey tee: fitted long-sleeve jersey with a drawn print, front and back panels upright, sleeves printed round the arm to the wrist',()=>{
  const g=GARMENTS[MICKEY_LONG_TEE_ID],spec=g.build;assert.equal(g.slot,'top');assert.ok(OUTFITS.some(look=>look.recipe.topId===MICKEY_LONG_TEE_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:MICKEY_LONG_TEE_ID}),top=outfit.getObjectByName(MICKEY_LONG_TEE_ID);
  for(const [name,count] of [['printed-tee-body',1],['crew-neckband',1],['turned-hem',1],['reference-fitted-sleeve',2],['turned-cuff',2]])
    assert.equal(named(top,name).length,count,name);
  // The body prints a front panel (left half of its texture) and a back panel (right half), each upright: higher on her
  // is higher in the texture.
  const body=named(top,'printed-tee-body')[0],p=body.geometry.attributes.position,uv=body.geometry.attributes.uv;
  for(let i=0;i<p.count;i++){const z=p.getZ(i),u=uv.getX(i);if(z>.03)assert.ok(u<=.5,'front panel');if(z<-.03)assert.ok(u>=.5,'back panel');}
  let lo=null,hi=null;for(let i=0;i<p.count;i++){if(lo===null||p.getY(i)<p.getY(lo))lo=i;if(hi===null||p.getY(i)>p.getY(hi))hi=i;}
  assert.ok(uv.getY(hi)>uv.getY(lo)+.9,'upright');
  // The print: mostly the dark ground, with every ink present.
  const {data,width,height}=body.material.map.image,inks=Object.values(spec.print.inks).map(hex),ground=hex(spec.print.ground);let dark=0;const found=inks.map(()=>0);
  for(let i=0;i<width*height*4;i+=4){const c=[data[i],data[i+1],data[i+2]];if(Math.max(...c.map((v,k)=>Math.abs(v-ground[k])))<16)dark++;
    inks.forEach((ink,k)=>{if(Math.max(...c.map((v,j)=>Math.abs(v-ink[j])))<20)found[k]++;});}
  assert.ok(dark>width*height*.55,`mostly ground (${(dark/width/height).toFixed(2)})`);found.forEach((n,k)=>assert.ok(n>500,`ink ${k} (${n})`));
  // Each sleeve's print repeats round the arm: its two edge columns match about as closely as neighbouring columns do.
  for(const sleeve of named(top,'reference-fitted-sleeve')){const m=sleeve.material.map,{data:d,width:w,height:h}=m.image;assert.equal(m.wrapS,T.RepeatWrapping);
    const diff=(a,b)=>{let s=0;for(let y=0;y<h;y++)for(let k=0;k<3;k++)s+=Math.abs(d[(y*w+a)*4+k]-d[(y*w+b)*4+k]);return s/h;};
    const seam=diff(w-1,0),inner=[1,w>>2,w>>1,(3*w)>>2].map(x=>diff(x-1,x)).reduce((a,b)=>a+b)/4;assert.ok(seam<inner*2+1,`seamless round the arm (${seam.toFixed(1)} against ${inner.toFixed(1)})`);
    // Long: the sleeve reaches her wrist.
    let min=Infinity;const q=sleeve.geometry.attributes.position;for(let i=0;i<q.count;i++)min=Math.min(min,q.getY(i));assert.ok(min<-.5,`long sleeve ends at ${min.toFixed(3)}`);}
  disposeObject(outfit);
});
