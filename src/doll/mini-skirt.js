// Printed mini skirt: a fitted stretch jersey mini skirt, the first skirt in the bottom slot, worn with bare legs. Printed
// all over from a texture atlas made from the product photos (its printed belt included), with:
// - optional charms (`charms`): metal snap clips hanging from the belt, with flat felt charms on short chains;
// - optional lacing (`lacing`): real cords laced across the skirt near the hem, tied in a bow with long ends.
// Built in outfit units like the jeans (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Atlas layout (shared with the script that made it, recorded in the garment record): the skirt unwrapped, u from centre
// front toward her left and round the back, the top row at the skirt's top edge, the bottom row at the hem.
import * as T from 'three';
import { weave, curve, shell, put, solid } from './model.js';

const SEG=128;
function jersey(map,C){
  const knit=weave('knit');knit.repeat.set(110,30);
  return new T.MeshPhysicalMaterial({map,color:map?C.printTone:C.fallback,roughness:.8,sheen:.15,sheenColor:new T.Color(C.sheen),sheenRoughness:.6,bumpMap:knit,bumpScale:.0016,side:T.DoubleSide});
}
// The skirt's surface at angle a (0 = centre front, toward her left) and height y, read from the shell's own grid, lifted
// `off` along its normal; with that normal.
function onShell(mesh){
  const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,rows=p.count/(SEG+1),q=new T.Vector3();
  return (a,y,off=0)=>{
    const f=((a/(Math.PI*2))%1+1)%1*SEG,i=Math.min(SEG-1,Math.floor(f)),fi=f-i;
    let j=0;while(j<rows-2&&p.getY((j+1)*(SEG+1)+i)>y)j++;
    const y0=p.getY(j*(SEG+1)+i),y1=p.getY((j+1)*(SEG+1)+i),fj=Math.max(0,Math.min(1,(y0-y)/((y0-y1)||1))),pt=new T.Vector3(),nm=new T.Vector3();
    for(const [dj,di,w] of [[0,0,(1-fj)*(1-fi)],[0,1,(1-fj)*fi],[1,0,fj*(1-fi)],[1,1,fj*fi]]){const k=(j+dj)*(SEG+1)+i+di;
      pt.add(q.fromBufferAttribute(p,k).multiplyScalar(w));nm.add(q.fromBufferAttribute(n,k).multiplyScalar(w));}
    nm.normalize();if(nm.x*pt.x+nm.z*pt.z<0)nm.negate();return {point:pt.addScaledVector(nm,off),normal:nm};};
}
// A flat shape laid against the skirt, facing out along `normal`, centred at `centre`, turned `spin` about the normal.
function plate(group,outline,depth,material,name,centre,normal,spin=0){
  const shape=new T.Shape();outline.forEach(([x,y],k)=>k?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  const mesh=put(group,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:depth*.4,bevelSize:depth*.4,bevelSegments:2,curveSegments:6}),material,name);
  mesh.position.copy(centre);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);mesh.rotateZ(spin);
  // The outfit is scaled .76 high: stretch the plate back so its shape is true in the world.
  mesh.scale.set(1,1/.76,1);return mesh;
}
// Outlines of the two charms, in their own plane (x across, y up), about their middle.
const BOW=(s)=>{const pts=[];for(let k=0;k<=40;k++){const t=k/40*Math.PI*2,r=.5+.5*Math.abs(Math.cos(t))**.6;pts.push([Math.cos(t)*r*s,Math.sin(t)*r*s*.62*(.45+.55*Math.abs(Math.cos(t)))]);}return pts;};
const BADGE=(s)=>{const pts=[];for(let k=0;k<=40;k++){const t=k/40*Math.PI*2,y=Math.sin(t),x=Math.cos(t)*(y>0?1-.18*y*y:.92+.08*y);pts.push([x*s*.82,(y>0?y:y*1.15)*s]);}return pts;};

export function makeMiniSkirt(id,spec,atlas=null){
  const skirt=new T.Group();skirt.name='trousers';skirt.userData.garmentId=id;
  const C=spec.colours,rows=spec.rows,top=rows[0][0],hem=rows.at(-1)[0];
  const map=atlas?(()=>{const m=atlas.clone();m.needsUpdate=true;m.anisotropy=4;return m;})():null;
  const body=shell(skirt,rows,jersey(map,C),'mini-skirt-body',SEG);
  const bp=body.geometry.attributes.position,uv=body.geometry.attributes.uv;
  for(let k=0;k<uv.count;k++)uv.setXY(k,(k%(SEG+1))/SEG,1-Math.max(0,Math.min(1,(top-bp.getY(k))/(top-hem))));
  uv.needsUpdate=true;
  // Her bare legs below the hem, as under the dresses.
  const skin=solid('#dfb195',.62),legRadius=y=>Math.sqrt(Math.max(0,1-((y-.69)/.49)**2));
  for(const side of [-1,1])shell(skirt,[1.0,.94,.86,.78,.69,.6,.5,.4,.3,.24].map(y=>[y,.092*legRadius(y)+.005,.094*legRadius(y)+.005,side*.16]),skin,'bare-leg-skin',32);
  const at=onShell(body);
  if(spec.charms){
    // Snap clips hang from the belt's lower edge; two of them carry flat felt charms on short chains.
    const ch=spec.charms,metal=new T.MeshStandardMaterial({color:C.metal,metalness:.85,roughness:.35}),felt=solid(C.charm,.92),stitch=solid(C.stitch,.8);
    for(const a of ch.clips){
      const {point:p,normal:n}=at(a,ch.y,.006),down=new T.Vector3(0,-1,0);
      // A clip: a slim loop with a gate, about .045 long.
      const pts=[];for(let k=0;k<=16;k++){const t=k/16*Math.PI*2;pts.push(p.clone().addScaledVector(down,.022-.022*Math.cos(t)).addScaledVector(new T.Vector3().crossVectors(down,n).normalize(),.007*Math.sin(t)).toArray());}
      curve(skirt,pts,.0022,metal,'charm-clip');
    }
    for(const c of ch.charms){
      const {point:hook}=at(c.a,ch.y-.045,.008),{point:p,normal:n}=at(c.a,c.y,.01);
      curve(skirt,[hook.toArray(),hook.clone().lerp(p,.5).addScaledVector(n,.002).toArray(),p.clone().setY(c.y+c.size*.85/.76).toArray()],.0018,metal,'charm-chain');
      const outline=(c.shape==='bow'?BOW:BADGE)(c.size);
      plate(skirt,outline,.004,felt,'felt-charm',p,n,c.spin||0);
      // Stitched outline, just inside the edge, standing on the charm's face.
      const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),n).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),c.spin||0));
      curve(skirt,outline.map(([x,y])=>new T.Vector3(x*.84,y*.84/.76,.0068).applyQuaternion(q).add(p).toArray()),.0011,stitch,'charm-stitch');
    }
  }
  if(spec.lacing){
    // Cords laced across the skirt toward the hem, crossing between two columns of eyelets, tied in a bow at the hem with
    // long ends.
    const L=spec.lacing,cord=new T.MeshStandardMaterial({color:C.cord,roughness:.85}),eyelet=new T.MeshStandardMaterial({color:C.metal,metalness:.8,roughness:.35});
    const step=(L.top-L.bottom)/L.crosses,lift=.004;
    for(let k=0;k<=L.crosses;k++)for(const s of [-1,1]){const {point,normal}=at(L.a+s*L.half,L.top-k*step,.002);
      const e=put(skirt,new T.TorusGeometry(.0055,.0018,6,14),eyelet,'skirt-eyelet');e.position.copy(point);e.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);}
    for(const start of [-1,1]){const pts=[];
      for(let k=0;k<=L.crosses;k++){const y=L.top-k*step;pts.push(at(L.a+(k%2?-start:start)*L.half,y,lift).point.toArray());
        if(k<L.crosses)pts.push(at(L.a,y-step/2,lift+.003).point.toArray());}
      curve(skirt,pts,L.radius,cord,'skirt-lacing');}
    const {point:c,normal:n}=at(L.a,L.bottom-.006,lift+.003),up=new T.Vector3(0,1,0),across=new T.Vector3().crossVectors(up,n).normalize();
    for(const dir of [-1,1]){const pts=[];for(let k=0;k<=12;k++){const t=k/12*Math.PI*2,u=(1-Math.cos(t))/2*L.loop,v=Math.sin(t)*L.loop*.36;
      pts.push(c.clone().addScaledVector(across,dir*u).addScaledVector(up,v+u*.2).addScaledVector(n,.004*Math.sin(t/2)).toArray());}
      curve(skirt,pts,L.radius,cord,'skirt-bow');}
    put(skirt,new T.SphereGeometry(L.radius*2.2,10,8),cord,'skirt-bow-knot').position.copy(c);
    L.tails.forEach((len,k)=>{const pts=[];for(let s=0;s<=8;s++){const t=s/8;
      pts.push(c.clone().add(new T.Vector3(0,-len*t,0)).addScaledVector(n,.005+.006*t).addScaledVector(across,(k?1:-1)*(.005+.01*t)+.003*Math.sin(t*5+k)).toArray());}
      curve(skirt,pts,L.radius,cord,'skirt-tie-end');});
  }
  return skirt;
}
