// Laced print top: a fitted long-sleeved stretch jersey top with a mock neck, printed all over from a texture atlas made
// from the product photos, with a raw cut hem, and real cords laced up the outside of each cuff, tied in a bow with long
// ends. The lacing above the cuff is printed (it is in the atlas).
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Atlas layout (shared with the script that made it, recorded in the garment record): the top `atlas.body` of its height
// holds the body unwrapped, mock neck included (u from centre front toward her left and round the back; the top row at
// the top of the neck, the bottom row at the hem), the rest the sleeves: her right sleeve in the left half, her left in
// the right half, each column round the sleeve from its front toward the outside, the back and the inside, the top row
// at the shoulder, the bottom row at her wrist.
import * as T from 'three';
import { weave, curve, shell, roundSleeveCap, easeOverHand } from './model.js';

const SEG=128,SLEEVE_SEG=64;
function jersey(map,C){
  // Smooth stretch jersey: matte with a soft sheen and a fine knit in the bump. The atlas holds the photos' colours; the
  // studio's lights lift them, so the print is toned (`printTone`), calibrated by measuring renders against the photos.
  const knit=weave('knit');knit.repeat.set(90,60);
  return new T.MeshPhysicalMaterial({map,color:map?C.printTone:C.fallback,roughness:.8,sheen:.15,sheenColor:new T.Color(C.sheen),sheenRoughness:.6,bumpMap:knit,bumpScale:.0016,side:T.DoubleSide});
}
// A point on a shell() surface at angle a (0 = front, toward +x) and height y, read from the mesh's own grid, lifted `off`
// off it along its normal; also returns that normal.
function onShell(mesh,seg){
  const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,rows=p.count/(seg+1),q=new T.Vector3();
  return (a,y,off=0)=>{
    const f=((a/(Math.PI*2))%1+1)%1*seg,i=Math.min(seg-1,Math.floor(f)),fi=f-i;
    let j=0;while(j<rows-2&&p.getY((j+1)*(seg+1)+i)>y)j++;
    const y0=p.getY(j*(seg+1)+i),y1=p.getY((j+1)*(seg+1)+i),fj=Math.max(0,Math.min(1,(y0-y)/((y0-y1)||1))),pt=new T.Vector3(),nm=new T.Vector3();
    for(const [dj,di,w] of [[0,0,(1-fj)*(1-fi)],[0,1,(1-fj)*fi],[1,0,fj*(1-fi)],[1,1,fj*fi]]){const k=(j+dj)*(seg+1)+i+di;
      pt.add(q.fromBufferAttribute(p,k).multiplyScalar(w));nm.add(q.fromBufferAttribute(n,k).multiplyScalar(w));}
    nm.normalize();if(nm.x*pt.x+nm.z*pt.z<0)nm.negate();return {point:pt.addScaledVector(nm,off),normal:nm};};
}
// Real cords laced across the outside of the cuff between two columns of eyelets, crossing `L.crosses` times from
// `L.top` down to `L.bottom`, then tied in a bow whose two ends hang down past her hand (`L.tails`).
function lacing(arm,sleeve,side,L,cord){
  const at=onShell(sleeve,SLEEVE_SEG),out=side*Math.PI/2,lift=.0035;
  const p=(a,y,off=lift)=>at(out+side*a,y,off).point;
  const step=(L.top-L.bottom)/L.crosses;
  for(const start of [-1,1]){
    // Each cord zigzags down, rising off the sleeve a little between eyelets.
    const pts=[];for(let k=0;k<=L.crosses;k++){const y=L.top-k*step,s=(k%2?-start:start)*L.half;pts.push(p(s,y).toArray());
      if(k<L.crosses){const m=at(out,y-step/2,lift+.002).point;pts.push(m.toArray());}}
    curve(arm,pts,L.radius,cord,'cuff-lacing');
  }
  // The bow: two loops either side of a knot at the bottom, and two long ends.
  const knot=at(out,L.bottom-.008,lift+.003),c=knot.point,nrm=knot.normal,up=new T.Vector3(0,1,0),across=new T.Vector3().crossVectors(up,nrm).normalize();
  const ellipse=(dir)=>{const pts=[];for(let k=0;k<=12;k++){const t=k/12*Math.PI*2,u=(1-Math.cos(t))/2*L.loop,v=Math.sin(t)*L.loop*.36;
    pts.push(c.clone().addScaledVector(across,dir*u).addScaledVector(up,v+u*.25).addScaledVector(nrm,.004*Math.sin(t/2)).toArray());}return pts;};
  for(const dir of [-1,1])curve(arm,ellipse(dir),L.radius,cord,'cuff-bow');
  put(arm,new T.SphereGeometry(L.radius*2.2,10,8),cord,'cuff-bow-knot').position.copy(c);
  // The ends hang straight down in the world (the arm is tilted out by `arm.rotation.z`), easing away from her hand.
  const tilt=arm.rotation.z,down=new T.Vector3(-Math.sin(tilt),-Math.cos(tilt),0);
  L.tails.forEach((len,k)=>{const pts=[];for(let s=0;s<=8;s++){const t=s/8;
    pts.push(c.clone().addScaledVector(down,len*t).addScaledVector(nrm,.006+L.clear*t*t).addScaledVector(across,(k?1:-1)*(.006+.008*t)+.004*Math.sin(t*6+k)).toArray());}
    curve(arm,pts,L.radius,cord,'cuff-tie-end');});
}
function put(group,geometry,material,name){const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}

export function makeLacedPrintTop(id,spec,atlas=null){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,C=spec.colours,BODY=spec.atlas.body,span=B.neckTop-B.hem;
  const map=atlas?(()=>{const m=atlas.clone();m.needsUpdate=true;m.anisotropy=4;return m;})():null;
  const fabric=jersey(map,C);
  // Body and mock neck in one, from the top of the neck to the raw cut hem.
  const body=shell(top,B.rows,fabric,'laced-top-body',SEG);
  const bp=body.geometry.attributes.position,uv=body.geometry.attributes.uv;
  for(let k=0;k<uv.count;k++)uv.setXY(k,(k%(SEG+1))/SEG,1-BODY*Math.max(0,Math.min(1,(B.neckTop-bp.getY(k))/span)));
  uv.needsUpdate=true;
  // Long fitted sleeves, set in at the shoulder, to her wrist, eased over her hands, with the laced cuffs.
  const cord=new T.MeshStandardMaterial({color:C.cord,roughness:.85});
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,fabric,'reference-fitted-sleeve',SLEEVE_SEG),yt=S.rows[0][0],yb=S.rows.at(-1)[0];
    const sp=sleeve.geometry.attributes.position,su=sleeve.geometry.attributes.uv;
    // Her right sleeve runs round the other way (+x is its inside), so its columns run backwards; kept just inside its
    // half of the atlas.
    for(let k=0;k<su.count;k++){const s=(k%(SLEEVE_SEG+1))/SLEEVE_SEG,f=Math.min(.999,side>0?s:1-s);
      su.setXY(k,(side<0?0:.5)+.5*f,(1-BODY)*Math.max(0,Math.min(1,(sp.getY(k)-yb)/(yt-yb))));}
    su.needsUpdate=true;
    roundSleeveCap(sleeve,side,yt);
    easeOverHand(sleeve,side);
    lacing(arm,sleeve,side,S.lacing,cord);
    top.add(arm);
  }
  return top;
}
