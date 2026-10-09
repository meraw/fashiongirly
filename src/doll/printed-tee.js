// Printed raglan tee: a fitted, short-sleeved knit tee whose print comes from a texture atlas made from the product photos,
// pieced in panels with exposed overlocked seams and wavy lettuce-edge hems.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Atlas layout (shared with the script that made it, recorded in the garment record): the top three quarters hold the body
// unwrapped (u = i/segments, from centre front toward her left; v from the hem up to the neck), the bottom quarter her right
// sleeve (left half) and her left sleeve (right half), u round the sleeve from its front toward the outside, v from the hem
// up to the shoulder. The seams below follow the panel edges in that unwrap.
import * as T from 'three';
import { V, weave, solid, curve, shell, roundSleeveCap } from './model.js';

const SEG=128;
// Lettuce edge: the hem stretched into soft waves, rising and falling with the knit.
function lettuce(mesh,edgeY,band,depth,count,down=true){
  const p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i),t=1-Math.min(1,Math.abs(y-edgeY)/band);if(t<=0)continue;
    const a=Math.atan2(p.getX(i),p.getZ(i)),w=Math.sin(a*count);p.setY(i,y+(down?-1:1)*depth*t*t*w);
    const k=1+.012*t*t*Math.max(0,w);p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();
}
// A point on a shell() surface at parameter angle a (0 = centre front, toward her left) and height y, read from the mesh's
// own grid so lines laid on it sit just off it, with the surface normal there.
function onShell(mesh,seg){
  const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,rows=p.count/(seg+1);
  return (a,y,off=0)=>{
    const f=((a/(Math.PI*2))%1+1)%1*seg,i=Math.min(seg-1,Math.floor(f)),fi=f-i;
    let j=0;while(j<rows-2&&p.getY((j+1)*(seg+1)+i)>y)j++;
    const y0=p.getY(j*(seg+1)+i),y1=p.getY((j+1)*(seg+1)+i),fj=Math.max(0,Math.min(1,(y0-y)/((y0-y1)||1)));
    const pt=new T.Vector3(),nm=new T.Vector3(),q=new T.Vector3();
    for(const [dj,di,w] of [[0,0,(1-fj)*(1-fi)],[0,1,(1-fj)*fi],[1,0,fj*(1-fi)],[1,1,fj*fi]]){const k=(j+dj)*(seg+1)+i+di;
      pt.add(q.fromBufferAttribute(p,k).multiplyScalar(w));nm.add(q.fromBufferAttribute(n,k).multiplyScalar(w));}
    nm.normalize();if(nm.x*pt.x+nm.z*pt.z<0)nm.negate();return pt.addScaledVector(nm,off);};
}
function knit(map,colour,tone='#ffffff'){
  // Fine stretch rib: the printed atlas and a fine vertical rib in the bump.
  const rib=weave('knit');rib.repeat.set(90,3);
  // The atlas holds the photos' colours; the studio's lights and exposure lift them, so the print is toned down (`tone`),
  // calibrated by measuring renders against the photos.
  return new T.MeshPhysicalMaterial({map,color:map?tone:colour,roughness:.86,sheen:.08,sheenColor:new T.Color('#eef0ea'),sheenRoughness:.8,bumpMap:rib,bumpScale:.004,side:T.DoubleSide});
}
export function makePrintedTee(id,spec,atlas=null){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.seams,C=spec.colours;
  const map=atlas?(()=>{const m=atlas.clone();m.needsUpdate=true;m.anisotropy=4;return m;})():null;
  const body=shell(top,B.rows,knit(map,C.fallback,C.printTone),'printed-tee-body',SEG);
  const bp=body.geometry.attributes.position,uv=body.geometry.attributes.uv,span=B.neck-B.hem;
  for(let k=0;k<uv.count;k++)uv.setXY(k,(k%(SEG+1))/SEG,.25+.75*Math.max(0,Math.min(1,(bp.getY(k)-B.hem)/span)));
  uv.needsUpdate=true;
  lettuce(body,B.hem,.022,B.lettuce,B.waves);
  const at=onShell(body,SEG),yOf=v=>B.hem+v*span;
  // Exposed overlocked seams: a raised green line, gently wavy like the stitching, laid along each panel edge.
  const overlock=solid(C.overlock,.8);
  const seam=(pts,name)=>curve(top,pts.map(([a,y],k)=>at(a,y,.0028+.0008*Math.sin(k*2.3)).toArray()),.0032,overlock,name);
  const along=(a0,v0,a1,v1,n=18)=>Array.from({length:n+1},(_,k)=>[a0+(a1-a0)*k/n,yOf(v0+(v1-v0)*k/n)]);
  const U=u=>u*Math.PI*2;
  // Raglan seams from the neckline down to each underarm, front and back.
  for(const [n,a] of [[S.neckU,S.armU],[1-S.neckU,1-S.armU],[.5-S.neckU,.5-S.armU],[.5+S.neckU,.5+S.armU]])seam(along(U(n),.985,U(a),S.armV),'raglan-seam');
  // Centre front, the side seams, and the back band's seam across the back.
  seam(along(0,.985,0,.012),'centre-front-seam');
  for(const u of [.25,.75])seam(along(U(u),S.armV,U(u),.012),'side-seam');
  seam(along(U(.25),S.band,U(.75),S.band,40),'back-band-seam');
  // Lettuce edges: the hem and the neckline finished in the same green.
  const edge=(y,off,count,depth,name,down)=>curve(top,Array.from({length:161},(_,k)=>{const q=at(k/160*Math.PI*2,y,off);q.y+=(down?-1:1)*depth*Math.sin(Math.atan2(q.x,q.z)*count);return q.toArray();}),.0027,overlock,name);
  edge(B.hem+.001,.002,B.waves,B.lettuce,'lettuce-hem',true);
  edge(B.neck-.004,.004,B.neckWaves,.002,'lettuce-neckline',false);
  // Short raglan sleeves, close to the arm, ending above her elbow in a lettuce edge.
  const SL=spec.sleeve;
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,SL.rows,knit(map,C.fallback,C.printTone),'reference-fitted-sleeve',64);
    const sp=sleeve.geometry.attributes.position,su=sleeve.geometry.attributes.uv,yt=SL.rows[0][0],yb=SL.rows[SL.rows.length-1][0];
    for(let k=0;k<su.count;k++){const s=(k%65)/64;su.setXY(k,(side<0?0:.5)+.5*(side>0?s:1-s),.25*Math.max(0,Math.min(1,(sp.getY(k)-yb)/(yt-yb))));}
    su.needsUpdate=true;
    roundSleeveCap(sleeve,side,yt);
    lettuce(sleeve,yb,.02,SL.lettuce,SL.waves);
    curve(arm,Array.from({length:97},(_,k)=>{const a=k/96*Math.PI*2,[,rx,rz]=SL.rows[SL.rows.length-1],w=Math.sin(Math.atan2(Math.sin(a)*rx,Math.cos(a)*rz)*SL.waves);return [Math.sin(a)*(rx*(1+.012*Math.max(0,w))+.002),yb-SL.lettuce*w,Math.cos(a)*(rz*(1+.012*Math.max(0,w))+.002)];}),.0026,overlock,'lettuce-sleeve-hem');
    top.add(arm);
  }
  return top;
}
