import * as THREE from 'three';
import { HAIR_COLOUR, cleanHairId } from './catalog.js';
const point=p=>new THREE.Vector3(...p);
function mesh(group,geometry,material,name){const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function ball(group,position,scale,material,name){const m=mesh(group,new THREE.SphereGeometry(1,32,20),material,name);m.position.set(...position);m.scale.set(...scale);return m;}
function line(group,points,radius,material,name='hair-thread'){return mesh(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point)),40,radius,5,false),material,name);}
// Molded hair, one soft material for every style: a highlight band from the world's light, as on a collectible doll,
// rather than felt or threads. The bob in makeDoll uses it too.
export function hairMaterial(colour=HAIR_COLOUR){return new THREE.MeshPhysicalMaterial({color:colour,roughness:.6,sheen:.35,sheenColor:new THREE.Color('#8a6a5c'),sheenRoughness:.55,clearcoat:.3,clearcoatRoughness:.45,side:THREE.DoubleSide});}
const material=hairMaterial;
// The felt head's ellipsoid, and a point lifted off it along its normal.
const HEAD=[.5,.47,.405];
function offHead(x,y,z,lift){const n=new THREE.Vector3(x/(HEAD[0]*HEAD[0]),y/(HEAD[1]*HEAD[1]),z/(HEAD[2]*HEAD[2])).normalize();return [x+n.x*lift,y+n.y*lift,z+n.z*lift];}
function scalp(group,mat,thread){
  const pos=[],index=[],cols=64,rows=24;
  // Follow the actual felt-head ellipsoid. The edge sits almost on the skin;
  // volume grows inward from the hairline instead of leaving a raised cap rim.
  const surface=(u,v,extra=0)=>{
    const a=u*Math.PI*2,back=(1-Math.cos(a))/2;
    const edge=1.02+1.62*back+.025*Math.sin(a*5)*Math.sin(a)**2;
    const phi=v*edge,root=Math.min(1,(1-v)/.22),lift=.0015+.022*root*root+extra;
    const x=.5*Math.sin(phi)*Math.sin(a),y=.47*Math.cos(phi),z=.405*Math.sin(phi)*Math.cos(a);
    return offHead(x,y,z,lift);
  };
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)pos.push(...surface(i/cols,j/rows));
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;index.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(index);geo.computeVertexNormals();mesh(group,geo,mat,'styled-scalp');
  // Sculpted sections: nine wide, low locks combed from the crown towards the hairline, unevenly spaced, half sunk
  // into the hair and stopping short of her brow: sections of molded hair, not evenly spaced grooves.
  for(let i=0;i<9;i++){
    const u0=(i+.5)/9+(i%2?.018:-.012),front=Math.abs(((u0%1)+1)%1-.5)>.3,path=[];
    for(let j=1;j<=12;j++){const v=.08+(front?.68:.86)*j/12,u=((u0+.006*Math.sin(j*1.3+i))%1+1)%1;path.push(surface(u,v,.004));}
    lock(group,path,.02+.005*(i%3),mat,thread,'combed-lock',{strands:false,ends:'soft',flat:.5});
  }
}
function curtain(group,mat,thread,wavy=false){
  const cols=48,rows=36,pos=[],index=[];
  const surface=(s,t,offset=0)=>{
    const end=wavy?-.78+.30*(Math.sqrt(s*s+.016)-Math.sqrt(.016))/(Math.sqrt(1.016)-Math.sqrt(.016)):-.48-.30*(1-Math.abs(s));
    // A small mirrored S bend through the lengths; no sideways kick at the tips.
    const wave=wavy?.014*Math.sin(t*Math.PI*2)*Math.sin(t*Math.PI)*Math.sin(s*Math.PI/2):0;
    const x=s*(.46-.03*t)+wave,y=.16+(end-.16)*t;
    const rootZ=-.405*Math.sqrt(Math.max(0,1-(s*.46/.5)**2-(.16/.47)**2))-.013;
    const blend=Math.min(1,t/.30),smooth=blend*blend*(3-2*blend);
    if(wavy){
      // Wrap around the head instead of pulling the side roots abruptly into a
      // flat rear panel. Below the nape the lengths fall inward towards her back.
      const wrap=Math.min(1,t/.4),wrapEase=wrap*wrap*(3-2*wrap);
      const napeZ=-.36*Math.sqrt(1-(s*.85)**2)-.03;
      const headZ=rootZ*(1-wrapEase)+napeZ*wrapEase;
      const fall=Math.max(0,Math.min(1,(t-.26)/.74)),ease=fall*fall*(3-2*fall);
      const back=-.30+.065*s*s;
      const ripple=.007*Math.sin(t*Math.PI*2)*Math.sin(t*Math.PI)*(1-s*s);
      return [x,y,headZ*(1-ease)+back*ease+ripple-offset];
    }
    const drape=-.41+.025*s*s;
    return [x,y,rootZ*(1-smooth)+drape*smooth-offset];
  };
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)pos.push(...surface(i/cols*2-1,j/rows));
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;index.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(index);geo.computeVertexNormals();mesh(group,geo,mat,'v-shaped-lengths');
  // Seven sculpted lengths down the back, unevenly spaced, each a wide, low ridge of hair rather than a thread.
  for(let i=0;i<7;i++){
    const s0=-.86+i*.29+(i%2?.05:-.04),path=[];
    for(let j=0;j<=16;j++)path.push(surface(Math.max(-.98,Math.min(.98,s0+.008*Math.sin(j*.9+i))),.02+.96*j/16,.004));
    lock(group,path,.014+.004*(i%2),mat,thread,'length-lock',{strands:false,ends:'soft',flat:.5});
  }
  for(const side of [-1,1])lock(group,[[side*.47,.14,.10],[side*.49,-.18,.025],[side*.46,-.45,-.16],[side*.39,-.62,-.32]],.056,mat,thread,'face-framing-lock',{strands:false,ends:'soft'});
}
// A lock of hair along a path: fuller in the middle, and ending in a point (a lock that is combed to its tip), softly
// (a rounded tip) or round at both ends (a section lying on the hair). Strand lines around it are for the plait,
// whose texture they are; elsewhere the lock is one molded piece.
function lock(group,points,radius,mat,thread,name,{strands=false,ends='point',flat=.75}={}){
  const path=new THREE.CatmullRomCurve3(points.map(point)),steps=48,sides=14,frames=path.computeFrenetFrames(steps,false),pos=[],indices=[];
  const size=t=>{const body=radius*(.72+.28*Math.sin(t*Math.PI));
    if(ends==='point')return body*(t>.75?Math.max(.04,(1-t)/.25):1);
    if(ends==='soft')return body*(t>.7?1-.55*(t-.7)/.3:1);
    return radius*(.55+.45*Math.sin(t*Math.PI));};
  for(let i=0;i<=steps;i++){const t=i/steps,c=path.getPointAt(t),r=size(t);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,p=c.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*flat);pos.push(...p.toArray());}}
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(group,geo,mat,name);
  if(ends!=='point')for(const t of ends==='soft'?[1]:[0,1]){const r=size(t);ball(group,path.getPointAt(t).toArray(),[r,r*.9,r*flat],mat,`${name}-tip`);}
  if(strands)for(let k=0;k<8;k++){const pts=[];for(let i=0;i<=steps;i+=2){const t=i/steps,a=k/8*Math.PI*2,r=size(t)+.002;pts.push(path.getPointAt(t).addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*.75).toArray());}line(group,pts,.0025,thread);}
  return path;
}
function tie(group,p,r){const mat=new THREE.MeshStandardMaterial({color:'#59413a',roughness:.8});const m=mesh(group,new THREE.TorusGeometry(r,.014,8,32),mat,'hair-tie');m.position.set(...p);m.rotation.x=Math.PI/2;}
function bun(group,p,scale,mat,thread){ball(group,p,scale,mat,'coiled-bun');const path=[];for(let i=0;i<=150;i++){const t=i/150,a=t*Math.PI*9,r=Math.sin(t*Math.PI)*.88;path.push([p[0]+Math.cos(a)*scale[0]*r,p[1]+Math.sin(a)*scale[1]*r,p[2]-scale[2]*Math.sqrt(1-r*r)-.004]);}line(group,path,.018,mat,'bun-twist');}
// A ponytail: the hair gathered into a bunch above the tie, the tie, then the tail falling with gravity in a soft S,
// with two thinner locks running alongside it and its end split into rounded tips of different lengths.
function ponytail(group,mat,thread,{bunch,at,tieRadius,path,radius}){
  ball(group,bunch[0],bunch[1],mat,'ponytail-bunch');
  tie(group,at,tieRadius);
  const curve=lock(group,path,radius,mat,thread,'ponytail',{ends:'soft'});
  const across=new THREE.Vector3(1,0,0),out=new THREE.Vector3();
  for(const [side,along,thin] of [[-1,.55,.34],[1,.7,.3]]){
    const pts=[];for(let i=0;i<=6;i++){const t=.08+(along-.08)*i/6,c=curve.getPointAt(t),tangent=curve.getTangentAt(t);out.crossVectors(tangent,across).normalize();pts.push(c.clone().addScaledVector(across,side*radius*.5).addScaledVector(out,radius*.3*Math.sin(t*Math.PI)).toArray());}
    lock(group,pts,radius*thin,mat,thread,'ponytail-section',{ends:'soft'});
  }
  for(const [dx,dz,drop] of [[-.06,.01,.03],[.0,.025,.1],[.065,-.01,.06]]){
    const pts=[];for(let i=0;i<=4;i++){const t=.72+.28*i/4,c=curve.getPointAt(t);pts.push([c.x+dx*i/4,c.y-drop*(i/4)**2,c.z+dz*i/4]);}
    lock(group,pts,radius*.4,mat,thread,'ponytail-tip',{ends:'soft'});
  }
}
// A three-strand plait brought over her left shoulder. The hair is gathered at the back and swept round behind her ear
// to the plait's top. A plait shows as a chain of lobes, each strand crossing over the middle in turn: alternate lobes
// lie to either side of the plait's centre line and slant towards it going down, so together they make the plait's
// chevrons. A thin core fills the gaps between them; strand lines run along each lobe. It narrows a little to a hair
// tie and a short loose tail.
function sideBraid(group,mat,thread){
  lock(group,[[.16,-.1,-.37],[.40,-.24,-.24],[.48,-.36,.02],[.42,-.46,.17]],.072,mat,thread,'braid-gather',{strands:true});
  const path=new THREE.CatmullRomCurve3([[.42,-.44,.17],[.41,-.56,.235],[.37,-.72,.265],[.32,-.88,.275],[.29,-.98,.275]].map(point));
  line(group,Array.from({length:21},(_,i)=>path.getPointAt(i/20).toArray()),.03,mat,'braid-core');
  const count=12,lobe=new THREE.SphereGeometry(1,20,12),m=new THREE.Matrix4(),basis=new THREE.Matrix4(),q=new THREE.Vector3();
  for(let i=0;i<count;i++){
    const t=(i+.5)/count,c=path.getPointAt(t),along=path.getTangentAt(t).normalize();
    // Out from her (towards the viewer at her shoulder), square to the plait; across it, the side the lobes alternate.
    const out=new THREE.Vector3(c.x*.8,0,1).normalize(),across=new THREE.Vector3().crossVectors(along,out).normalize();out.crossVectors(across,along).normalize();
    const side=i%2?1:-1,width=.1*(1-.3*t),slant=side*.6;
    const axis=along.clone().multiplyScalar(Math.cos(slant)).addScaledVector(across,Math.sin(slant)),wide=new THREE.Vector3().crossVectors(out,axis).normalize();
    const centre=c.clone().addScaledVector(across,side*width*.24).addScaledVector(out,.012);
    const step=path.getLength()/count;
    basis.makeBasis(axis,wide,out);m.makeScale(step*.95,width*.36,width*.32).premultiply(basis).setPosition(centre);
    const piece=mesh(group,lobe.clone().applyMatrix4(m),mat,'braid-lobe');piece.userData.side=side;
    // Strand lines along the lobe, following its curve.
    for(const k of [-.45,0,.45]){const pts=[];for(let j=0;j<=8;j++){const u=j/8*2-1,bulge=Math.sqrt(Math.max(0,1-u*u-k*k*.6));
      q.set(u*.92,k,bulge*.98+.04).applyMatrix4(m);pts.push(q.toArray());}line(group,pts,.0022,thread,'braid-strand');}
  }
  lobe.dispose();
  const end=path.getPointAt(1),down=path.getTangentAt(1);
  tie(group,end.toArray(),.03);
  lock(group,[end.toArray(),end.clone().addScaledVector(down,.06).add(new THREE.Vector3(.008,0,.01)).toArray(),end.clone().addScaledVector(down,.13).add(new THREE.Vector3(-.006,0,.015)).toArray()],.05,mat,thread,'braid-tail',{strands:true});
}
export function makeHair(raw){
  const id=cleanHairId(raw),group=new THREE.Group();group.name='outfit-hair';group.userData.hairId=id;
  if(id==='bob')return group;
  const mat=material(),thread=new THREE.MeshStandardMaterial({color:'#58413b',roughness:1});scalp(group,mat,thread);
  if(id==='straight-v'||id==='wavy-v'||id==='half-up')curtain(group,mat,thread,id==='wavy-v');
  // Ponytails: the bunch sits over the crown or the nape where the hair is gathered, the tie just behind it, and the
  // tail falls from the tie, out a little and then down.
  if(id==='high-ponytail')ponytail(group,mat,thread,{bunch:[[0,.35,-.33],[.17,.11,.13]],at:[.015,.35,-.48],tieRadius:.098,path:[[.01,.35,-.5],[.07,.26,-.64],[.12,0,-.67],[.1,-.32,-.6],[.07,-.6,-.52]],radius:.12});
  if(id==='high-bun')bun(group,[0,.53,-.26],[.215,.185,.19],mat,thread);
  if(id==='low-ponytail')ponytail(group,mat,thread,{bunch:[[0,-.31,-.37],[.15,.09,.11]],at:[0,-.39,-.46],tieRadius:.082,path:[[0,-.4,-.48],[.03,-.55,-.56],[.05,-.75,-.58],[.04,-.92,-.56]],radius:.1});
  if(id==='low-bun')bun(group,[0,-.28,-.47],[.205,.16,.16],mat,thread);
  if(id==='half-up'){bun(group,[0,-.04,-.49],[.115,.085,.075],mat,thread);for(const side of [-1,1])line(group,[[side*.49,.06,-.08],[side*.35,.01,-.35],[0,-.035,-.51]],.025,mat,'half-up-twist');}
  if(id==='side-braid')sideBraid(group,mat,thread);
  return group;
}
export function disposeHair(group){const mats=new Set();group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});for(const m of mats)m.dispose();}
// Adapter: leave makeDoll, its body, and all garment builders untouched.
export function createHairController(doll){
  const head=doll.getObjectByName('doll-head');if(!head)throw new Error('Hair requires the doll-head attachment point.');
  const names=new Set(['bob-back','hair-crown','side-bob','hair-yarn','swept-fringe','fringe-thread']);const originals=head.children.filter(o=>names.has(o.name)).map(o=>[o,o.visible]);
  let current=null,selected=null;
  return {update(raw){const id=cleanHairId(raw);if(id===selected)return;const next=id==='bob'?null:makeHair(id);if(current){head.remove(current);disposeHair(current);}current=next;selected=id;for(const [o,visible] of originals)o.visible=id==='bob'?visible:false;if(current)head.add(current);},dispose(){if(current){head.remove(current);disposeHair(current);current=null;}for(const [o,visible] of originals)o.visible=visible;selected=null;}};
}
