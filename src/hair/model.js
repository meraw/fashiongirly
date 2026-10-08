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
  if(id==='side-braid'){
    lock(group,[[.2,-.18,-.34],[.43,-.32,-.24],[.48,-.43,.04],[.40,-.55,.25]],.083,mat,thread,'braid-gather');
    for(let strand=0;strand<3;strand++){const points=[];for(let i=0;i<=30;i++){const t=i/30,a=t*Math.PI*8+strand*Math.PI*2/3,r=.043*(1-t*.4);points.push([.40-.13*t+Math.sin(a)*r,-.48-.37*t,.24+Math.cos(a)*r]);}lock(group,points,.041,mat,thread,'braid-strand');}tie(group,[.275,-.85,.24],.035);
  }
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
