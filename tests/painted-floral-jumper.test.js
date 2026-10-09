import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import JUMPER from '../src/wardrobe/garments/desigual-painted-floral-knit-jumper-v1.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
// Shares of a texture's pixels in a box (in pixels) that are the black ground, and near each ink (within the stitch
// shading).
const shares=({data,width:w},x0,x1,y0,y1,P)=>{const inks=Object.entries(P.inks).map(([k,v])=>[k,hex(v)]),ground=hex(P.ground),s={ground:0};let n=0;
  for(const [k] of inks)s[k]=0;
  for(let y=y0;y<y1;y+=2)for(let x=x0;x<x1;x+=2){const i=(y*w+x)*4,c=[data[i],data[i+1],data[i+2]];n++;const near=v=>Math.max(...c.map((q,j)=>Math.abs(q-v[j])))<22;
    if(near(ground))s.ground++;for(const [k,v] of inks)if(near(v))s[k]++;}
  for(const k in s)s[k]/=n;return s;};

test('Desigual painted floral jumper: fitted fine knit cropped at the waist, big knitted flowers on black front, back and sleeves, the print running into rib neck, hem and cuffs',()=>{
  const id=JUMPER.id,P=JUMPER.build.print;
  const outfit=makeOutfit({topId:id});outfit.updateMatrixWorld(true);const top=outfit.getObjectByName(id);
  for(const [name,count] of [['printed-tee-body',1],['crew-neckband',1],['rib-hem-band',1],['reference-fitted-sleeve',2],['rib-cuff',2],['turned-hem',0],['turned-cuff',0]])
    assert.equal(named(top,name).length,count,name);
  // The print: black ground with flowers in every ink, on the front and on the back.
  const body=named(top,'printed-tee-body')[0],image=body.material.map.image,panel=image.width/2;
  for(const [label,x0,x1] of [['front',0,panel],['back',panel,image.width]]){const s=shares(image,x0,x1,0,image.height,P);
    assert.ok(s.ground>.2&&s.ground<.75,`${label}: black ground ${s.ground.toFixed(2)}`);
    for(const ink of ['pink','cream','white','mint','royal'])if(label==='front'||ink!=='white')assert.ok(s[ink]>.003,`${label}: ${ink} ${s[ink].toFixed(4)}`);}
  // Knitted in: colour changes only between stitches, so neighbouring pixels inside a stitch match up to its shading.
  const cw=Math.round(P.stitch*1300);let jumps=0,checks=0;
  for(let y=0;y<image.height;y+=7)for(let x=1;x<panel;x++){const i=(y*image.width+x)*4,d=Math.abs(image.data[i]-image.data[i-4]);checks++;if(d>60)jumps++;}
  assert.ok(jumps/checks<1.6/cw,`colour changes at stitch edges only (${(jumps/checks).toFixed(3)} per pixel, stitches ${cw} pixels wide)`);
  // The rib neckband, hem band and cuffs carry the print (the body's or the sleeve's), ribbed round.
  for(const [name,map] of [['crew-neckband',body.material.map],['rib-hem-band',body.material.map]])assert.equal(named(top,name)[0].material.map,map,`${name} in the print`);
  for(const cuff of named(top,'rib-cuff')){const sleeve=cuff.parent.children.find(o=>o.name==='reference-fitted-sleeve');assert.equal(cuff.material.map,sleeve.material.map,'cuff in the sleeve print');
    const b=new T.Box3().setFromObject(cuff);assert.ok(b.min.y/.76<1.33,`cuff reaches her wrist (${(b.min.y/.76).toFixed(3)})`);}
  const band=named(top,'rib-hem-band')[0],q=band.geometry.attributes.position;let lo=Infinity,hi=0;
  for(let i=0;i<q.count;i++){const r=Math.hypot(q.getX(i)/.29,q.getZ(i)/.206);lo=Math.min(lo,r);hi=Math.max(hi,r);}
  assert.ok(hi-lo>.01,'the hem band is ribbed');
  // Cropped at her waist: the hem band ends at the top of her jeans, and over the skirt the bow shows.
  const hem=new T.Box3().setFromObject(band).min.y/.76;assert.ok(hem>1.22&&hem<1.25,`hem at ${hem.toFixed(3)}`);
  disposeObject(outfit);
  const skirted=makeOutfit({topId:id,skirt:true});assert.ok(skirted.getObjectByName('ribbon-knot'),'bow shows over the skirt');disposeObject(skirted);
  // The Mickey tee keeps its turned hem and cuffs.
  const mickey=makeOutfit({topId:'black-mickey-print-long-tee-v1'});assert.equal(named(mickey,'turned-hem').length,1);assert.equal(named(mickey,'turned-cuff').length,2);disposeObject(mickey);
});
