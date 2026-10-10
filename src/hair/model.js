import * as THREE from 'three';
import { HAIR_COLOUR, cleanHairId } from './catalog.js';
const point=p=>new THREE.Vector3(...p);
function mesh(group,geometry,material,name){const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function ball(group,position,scale,material,name){const m=mesh(group,new THREE.SphereGeometry(1,32,20),material,name);m.position.set(...position);m.scale.set(...scale);return m;}
function line(group,points,radius,material,name='hair-thread'){return mesh(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point)),40,radius,5,false),material,name);}
function material(){return new THREE.MeshPhysicalMaterial({color:HAIR_COLOUR,roughness:.88,sheen:.45,sheenColor:new THREE.Color('#6a5047'),sheenRoughness:.9,side:THREE.DoubleSide});}
function scalp(group,mat,thread){
  const pos=[],index=[],cols=64,rows=24;
  // Follow the actual felt-head ellipsoid. The edge sits almost on the skin;
  // volume grows inward from the hairline instead of leaving a raised cap rim.
  const surface=(u,v)=>{
    const a=u*Math.PI*2,back=(1-Math.cos(a))/2;
    const edge=1.02+1.62*back+.025*Math.sin(a*5)*Math.sin(a)**2;
    const phi=v*edge,root=Math.min(1,(1-v)/.22),lift=.0015+.022*root*root;
    const x=.5*Math.sin(phi)*Math.sin(a),y=.47*Math.cos(phi),z=.405*Math.sin(phi)*Math.cos(a);
    const n=new THREE.Vector3(x/.25,y/(.47*.47),z/(.405*.405)).normalize();
    return [x+n.x*lift,y+n.y*lift,z+n.z*lift];
  };
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)pos.push(...surface(i/cols,j/rows));
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;index.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(index);geo.computeVertexNormals();mesh(group,geo,mat,'styled-scalp');
  for(let i=0;i<34;i++){const path=[];for(let j=2;j<=24;j++){const p=surface(i/34,j/24);path.push(p);}line(group,path,.0012,thread,'combed-strand');}
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
  for(let i=0;i<=28;i++){const s=i/28*2-1,path=[];for(let j=0;j<=24;j++)path.push(surface(s,j/24,.004));line(group,path,i%3===0?.006:.0024,i%3===0?mat:thread,'long-hair-strand');}
  for(const side of [-1,1])lock(group,[[side*.47,.14,.10],[side*.49,-.18,.025],[side*.46,-.45,-.16],[side*.39,-.62,-.32]],.056,mat,thread,'face-framing-lock');
}
function lock(group,points,radius,mat,thread,name){
  const path=new THREE.CatmullRomCurve3(points.map(point)),steps=48,sides=14,frames=path.computeFrenetFrames(steps,false),pos=[],indices=[];
  const size=t=>radius*(.72+.28*Math.sin(t*Math.PI))*(t>.75?Math.max(.04,(1-t)/.25):1);
  for(let i=0;i<=steps;i++){const t=i/steps,c=path.getPointAt(t),r=size(t);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,p=c.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*.75);pos.push(...p.toArray());}}
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(group,geo,mat,name);
  for(let k=0;k<8;k++){const points=[];for(let i=0;i<=steps;i+=2){const t=i/steps,a=k/8*Math.PI*2,r=size(t)+.002;points.push(path.getPointAt(t).addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*.75).toArray());}line(group,points,.0025,thread);}
}
function tie(group,p,r){const mat=new THREE.MeshStandardMaterial({color:'#59413a',roughness:.8});const m=mesh(group,new THREE.TorusGeometry(r,.014,8,32),mat,'hair-tie');m.position.set(...p);m.rotation.x=Math.PI/2;}
function bun(group,p,scale,mat,thread){ball(group,p,scale,mat,'coiled-bun');const path=[];for(let i=0;i<=150;i++){const t=i/150,a=t*Math.PI*9,r=Math.sin(t*Math.PI)*.88;path.push([p[0]+Math.cos(a)*scale[0]*r,p[1]+Math.sin(a)*scale[1]*r,p[2]-scale[2]*Math.sqrt(1-r*r)-.004]);}line(group,path,.011,thread,'bun-twist');}
// A three-strand plait brought over her left shoulder. The hair is gathered at the back and swept round behind her ear
// to the plait's top. A plait shows as a chain of lobes, each strand crossing over the middle in turn: alternate lobes
// lie to either side of the plait's centre line and slant towards it going down, so together they make the plait's
// chevrons. A thin core fills the gaps between them; strand lines run along each lobe. It narrows a little to a hair
// tie and a short loose tail.
function sideBraid(group,mat,thread){
  lock(group,[[.16,-.1,-.37],[.40,-.24,-.24],[.48,-.36,.02],[.42,-.46,.17]],.072,mat,thread,'braid-gather');
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
  lock(group,[end.toArray(),end.clone().addScaledVector(down,.06).add(new THREE.Vector3(.008,0,.01)).toArray(),end.clone().addScaledVector(down,.13).add(new THREE.Vector3(-.006,0,.015)).toArray()],.05,mat,thread,'braid-tail');
}
export function makeHair(raw){
  const id=cleanHairId(raw),group=new THREE.Group();group.name='outfit-hair';group.userData.hairId=id;
  if(id==='bob')return group;
  const mat=material(),thread=new THREE.MeshStandardMaterial({color:'#58413b',roughness:1});scalp(group,mat,thread);
  if(id==='straight-v'||id==='wavy-v'||id==='half-up')curtain(group,mat,thread,id==='wavy-v');
  if(id==='high-ponytail'){lock(group,[[0,.39,-.35],[.06,.35,-.62],[.13,-.05,-.65],[.10,-.70,-.49]],.16,mat,thread,'high-ponytail');tie(group,[.015,.35,-.48],.098);}
  if(id==='low-ponytail'){lock(group,[[0,-.29,-.37],[.025,-.40,-.50],[.06,-.69,-.48],[.03,-.81,-.40]],.125,mat,thread,'low-ponytail');tie(group,[0,-.39,-.46],.082);}
  if(id==='high-bun')bun(group,[0,.53,-.26],[.215,.185,.19],mat,thread);
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
