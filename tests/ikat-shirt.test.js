import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { levelCaster } from '../src/doll/level-caster.js';
const PEPE_IKAT_SHIRT_ID='pepe-jeans-ikat-shirt-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('Pepe Jeans ikat shirt: full length and loose with a shirttail hem, chest pocket, buttoned cuffs, chambray stand and the ikat print',()=>{
  const g=GARMENTS[PEPE_IKAT_SHIRT_ID];assert.equal(g.slot,'top');assert.ok(g.layering.coversWaistband);
  assert.ok(OUTFITS.some(look=>look.recipe.topId===PEPE_IKAT_SHIRT_ID),'a study preset wears it');
  const outfit=makeOutfit({topId:PEPE_IKAT_SHIRT_ID});outfit.updateMatrixWorld(true);
  for(const [name,count] of [['mesh-shirt-body',1],['shirt-collar-fall',1],['shirt-collar-stand',1],['mesh-shirt-sleeve',2],['shirt-cuff',2],['cuff-button',2],['cuff-seam',2],['chest-pocket',1],['pocket-stitch',2],['shirt-button',8],['hem-stitch',1]])
    assert.equal(named(outfit,name).length,count,name);
  // The stand is lined in blue chambray.
  const stand=named(outfit,'shirt-collar-stand')[0].material.color;assert.ok(stand.b>stand.r*1.2,'chambray stand');
  // Full length with a shirttail: the hem is lowest at the centre front and back and rises toward the sides.
  const body=named(outfit,'mesh-shirt-body')[0],p=body.geometry.attributes.position,bottom=[];for(let i=p.count-129;i<p.count;i++)bottom.push([p.getX(i),p.getY(i),p.getZ(i)]);
  const front=Math.min(...bottom.filter(([x,,z])=>z>.2&&Math.abs(x)<.03).map(q=>q[1])),side=Math.max(...bottom.filter(([x])=>Math.abs(x)>.28).map(q=>q[1]));
  assert.ok(front<1.0,`front hem at ${front.toFixed(3)}`);assert.ok(side-front>.05,`shirttail rises ${(side-front).toFixed(3)} toward the sides`);
  // The pocket sits on her left chest, on the front.
  const pocket=new T.Box3().setFromObject(named(outfit,'chest-pocket')[0]).getCenter(new T.Vector3());assert.ok(pocket.x>.08&&pocket.z>.1&&pocket.y/.76>1.6,'pocket on her left chest');
  // The print: periwinkle and lavender streaks over white, with navy and coral diamonds.
  const {data}=body.material.map.image;let navy=0,coral=0,blue=0,white=0;const n=data.length/4;
  for(let i=0;i<data.length;i+=4){const [r,gr,b]=[data[i],data[i+1],data[i+2]];if(r<60&&gr<60&&b<80)navy++;else if(r>180&&gr<120&&b<120)coral++;else if(b>r+30)blue++;else if(r>215&&gr>215&&b>215)white++;}
  assert.ok(navy/n>.02&&coral/n>.01&&blue/n>.35&&white/n>.05,`navy ${(navy/n).toFixed(3)} coral ${(coral/n).toFixed(3)} blue ${(blue/n).toFixed(3)} white ${(white/n).toFixed(3)}`);
  disposeObject(outfit);
  // Worn over the skirt it hangs out over the skirt's flare: no part of the skirt pokes through it between its hem and
  // the waist.
  const skirted=makeOutfit({topId:PEPE_IKAT_SHIRT_ID,skirt:true});skirted.updateMatrixWorld(true);
  const shirt=named(skirted,'mesh-shirt-body')[0],skirt=skirted.getObjectByName('layered-skirt');assert.ok(skirt,'skirt');
  const cast=levelCaster([shirt],{axis:[0,0]}),hemTop=Math.max(...(()=>{const q=shirt.geometry.attributes.position,ys=[];for(let i=q.count-129;i<q.count;i++)ys.push(q.getY(i));return ys;})());
  const v=new T.Vector3(),up=new T.Vector3(0,1,0);let checked=0;
  skirt.traverse(o=>{if(!o.geometry)return;const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i+=3){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const y=v.y/.76;if(y<hemTop+.01||y>1.3)continue;
      const r=Math.hypot(v.x,v.z),a=Math.atan2(v.x,v.z),hit=cast(new T.Vector3(0,v.y,0),new T.Vector3(Math.sin(a),0,Math.cos(a)).applyAxisAngle(up,1e-5));
      assert.ok(hit&&hit.distance>r+.001,`skirt pokes through the shirt at ${y.toFixed(3)}`);checked++;}});
  assert.ok(checked>50,`checked ${checked}`);
  disposeObject(skirted);
});
