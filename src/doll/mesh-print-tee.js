// Printed mesh tee: a fitted long-sleeved crew-neck tee in a fine stretch mesh, printed all over from a texture atlas made
// from the product photos, with a crew neckband, a yoke seam across the front and the back (an exposed, wavy overlock),
// and metallic cuffs at her wrists.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Atlas layout (shared with the script that made it, recorded in the garment record): the top `atlas.body` of its height
// holds the body unwrapped (u from centre front toward her left, round the back; the top row at the neck, the bottom row
// at the hem), the rest the sleeves: her right sleeve on the left half, her left on the right half, each column round the
// sleeve from its front toward the outside, the back and the inside, the top row at the shoulder, the bottom row at her
// wrist.
import * as T from 'three';
import { random, curve, shell, roundSleeveCap, easeOverHand } from './model.js';

const SEG=128;
const pixels=new Map();
// A fine net: diagonal threads crossing, with diamond holes between. A height map for the bump.
function net(){
  if(!pixels.has('net')){const n=64,data=new Uint8Array(n*n*4);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const d=(t)=>{const m=((t%16)+16)%16;return Math.min(m,16-m);};
      const v=Math.max(Math.exp(-(d(x+y)**2)/5),Math.exp(-(d(x-y)**2)/5)),i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(60+180*v);data[i+3]=255;}
    pixels.set('net',{data,n});}
  const {data,n}=pixels.get('net'),t=new T.DataTexture(data,n,n,T.RGBAFormat);
  t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;
}
// Crinkled lamé: soft random folds running round the cuff, as a height map.
function crinkle(){
  if(!pixels.has('crinkle')){const n=64,data=new Uint8Array(n*n*4),rand=random(71),waves=Array.from({length:6},()=>[1+Math.floor(rand()*3),2+Math.floor(rand()*5),rand()*6.3]);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){let v=0;for(const [a,b,p] of waves)v+=Math.sin((x*a+y*b)/n*Math.PI*2+p);const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(128+18*v);data[i+3]=255;}
    pixels.set('crinkle',{data,n});}
  const {data,n}=pixels.get('crinkle'),t=new T.DataTexture(data,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.needsUpdate=true;return t;
}
function mesh(map,C,repeat){
  // The atlas holds the photos' colours; the studio's lights lift them, so the print is toned (`printTone`), calibrated by
  // measuring renders against the photos. Without the atlas (a failed load) it is a flat colour.
  const bump=net();bump.repeat.set(...repeat);
  return new T.MeshPhysicalMaterial({map,color:map?C.printTone:C.fallback,roughness:.78,sheen:.35,sheenColor:new T.Color(C.sheen),sheenRoughness:.55,bumpMap:bump,bumpScale:.0018,side:T.DoubleSide});
}
// A point on a shell() surface at angle a (0 = centre front, toward her left) and height y, read from the mesh's own grid,
// lifted `off` off it along its normal.
function onShell(body){
  const p=body.geometry.attributes.position,n=body.geometry.attributes.normal,rows=p.count/(SEG+1),q=new T.Vector3();
  return (a,y,off)=>{
    const f=((a/(Math.PI*2))%1+1)%1*SEG,i=Math.min(SEG-1,Math.floor(f)),fi=f-i;
    let j=0;while(j<rows-2&&p.getY((j+1)*(SEG+1)+i)>y)j++;
    const y0=p.getY(j*(SEG+1)+i),y1=p.getY((j+1)*(SEG+1)+i),fj=Math.max(0,Math.min(1,(y0-y)/((y0-y1)||1))),pt=new T.Vector3(),nm=new T.Vector3();
    for(const [dj,di,w] of [[0,0,(1-fj)*(1-fi)],[0,1,(1-fj)*fi],[1,0,fj*(1-fi)],[1,1,fj*fi]]){const k=(j+dj)*(SEG+1)+i+di;
      pt.add(q.fromBufferAttribute(p,k).multiplyScalar(w));nm.add(q.fromBufferAttribute(n,k).multiplyScalar(w));}
    nm.normalize();if(nm.x*pt.x+nm.z*pt.z<0)nm.negate();return pt.addScaledVector(nm,off);};
}
export function makeMeshPrintTee(id,spec,atlas=null){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,C=spec.colours,BODY=spec.atlas.body,span=B.neck-B.hem;
  const map=atlas?(()=>{const m=atlas.clone();m.needsUpdate=true;m.anisotropy=4;return m;})():null;
  // Body: fitted, from the neck to a hem below the waistband.
  const body=shell(top,B.rows,mesh(map,C,[220,70]),'mesh-tee-body',SEG);
  const bp=body.geometry.attributes.position,uv=body.geometry.attributes.uv;
  for(let k=0;k<uv.count;k++)uv.setXY(k,(k%(SEG+1))/SEG,1-BODY+BODY*Math.max(0,Math.min(1,(bp.getY(k)-B.hem)/span)));
  uv.needsUpdate=true;
  // Crew neckband.
  shell(top,B.neckband,new T.MeshPhysicalMaterial({color:C.neckband,roughness:.85,sheen:.3,sheenColor:new T.Color('#6b6a6e'),side:T.DoubleSide}),'crew-neckband',96);
  // The yoke seams: an exposed overlock across the front and the back, gently wavy, where the print's yoke seam is. Each
  // runs across between her sleeves (`across`, an angle either side of the centre).
  const at=onShell(body),overlock=new T.MeshStandardMaterial({color:C.overlock,roughness:.8});
  for(const [name,Y,centre] of [['front-yoke-seam',B.yoke.front,0],['back-yoke-seam',B.yoke.back,Math.PI]]){
    const n=90,pts=Array.from({length:n+1},(_,k)=>{const a=centre-B.yoke.across+2*B.yoke.across*k/n;return at(a,Y+B.yoke.wave*Math.sin(k*B.yoke.waves*Math.PI*2/n),.0026).toArray();});
    curve(top,pts,.0028,overlock,name);
  }
  // Long fitted sleeves, set in at the shoulder, to her wrist, finished with metallic cuffs eased over her hands.
  const lame=new T.MeshPhysicalMaterial({color:C.cuff,metalness:.75,roughness:.38,bumpMap:crinkle(),bumpScale:.004,side:T.DoubleSide});
  lame.bumpMap.repeat.set(3,1);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,mesh(map,C,[60,60]),'reference-fitted-sleeve',64),yt=S.rows[0][0],yb=S.rows.at(-1)[0];
    const sp=sleeve.geometry.attributes.position,su=sleeve.geometry.attributes.uv;
    for(let k=0;k<su.count;k++){const s=(k%65)/64;su.setXY(k,(side<0?0:.5)+.5*(side>0?s:1-s),(1-BODY)*Math.max(0,Math.min(1,(sp.getY(k)-yb)/(yt-yb))));}
    su.needsUpdate=true;
    roundSleeveCap(sleeve,side,yt);
    easeOverHand(sleeve,side);
    easeOverHand(shell(arm,S.cuff,lame,'lame-cuff',64),side,.01);
    top.add(arm);
  }
  return top;
}
