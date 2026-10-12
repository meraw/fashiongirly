import * as THREE from 'three';
import { HAIR_COLOUR, cleanHairId } from './catalog.js';
import { pileNormalTexture, triplanarPile } from '../doll/plush.js';
const point=p=>new THREE.Vector3(...p);
function mesh(group,geometry,material,name){const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function ball(group,position,scale,material,name){const m=mesh(group,new THREE.SphereGeometry(1,32,20),material,name);m.position.set(...position);m.scale.set(...scale);return m;}
function line(group,points,radius,material,name='hair-thread'){return mesh(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point)),40,radius,5,false),material,name);}
// She is a plush doll (the user's direction, 11 October 2026), and her hair is sewn from soft plush fabric: fully matte,
// no gloss or highlight band, with a short pile that catches the light softly at its edges (sheen). The pile is seen as
// a whole, not as strands: a soft unevenness a millimetre or so across at her size (pileNormalTexture in
// src/doll/plush.js), laid on by position so it is the same size on every piece of every style, filtered, so it reads
// as fabric close up and averages to a smooth surface at phone size. The bob in makeDoll uses it too.
export function hairMaterial(colour=HAIR_COLOUR){
  const normalMap=pileNormalTexture({blob:12,seed:11});
  return triplanarPile(new THREE.MeshPhysicalMaterial({color:colour,roughness:1,sheen:1,sheenColor:new THREE.Color(colour).lerp(new THREE.Color('#c9a596'),.78),sheenRoughness:.7,normalMap,normalScale:new THREE.Vector2(.07,.07),side:THREE.DoubleSide}));
}
const material=hairMaterial;
// The felt head's ellipsoid, and a point lifted off it along its normal.
const HEAD=[.5,.47,.405];
function offHead(x,y,z,lift){const n=new THREE.Vector3(x/(HEAD[0]*HEAD[0]),y/(HEAD[1]*HEAD[1]),z/(HEAD[2]*HEAD[2])).normalize();return [x+n.x*lift,y+n.y*lift,z+n.z*lift];}
function scalp(group,mat){
  const pos=[],index=[],cols=64,rows=24;
  // Follow the actual felt-head ellipsoid. The edge sits almost on the skin;
  // volume grows inward from the hairline instead of leaving a raised cap rim.
  // Sections of hair combed from the crown are sculpted into the surface: seven soft swells around the head, each
  // drifting a little as it comes down, fading out at the crown and at the hairline, so light and shadow pick them
  // out the way they do on a molded doll's hair, with nothing lying on top of it.
  const surface=(u,v)=>{
    const a=u*Math.PI*2,back=(1-Math.cos(a))/2;
    const edge=1.02+1.62*back+.025*Math.sin(a*5)*Math.sin(a)**2;
    const phi=v*edge,root=Math.min(1,(1-v)/.22);
    // Plush hair is sewn from panels: each one softly stuffed, with a sunken seam between it and the next.
    const phase=a*7+.9*v+.4*Math.sin(a*3),seam=Math.exp(-(1+Math.cos(phase))/.05);
    const swell=Math.sin(Math.PI*Math.min(1,v/.9))**1.2*(.006+.005*Math.sin(phase/2)**2-.016*seam);
    const lift=.0015+.022*root*root+swell;
    const x=.5*Math.sin(phi)*Math.sin(a),y=.47*Math.cos(phi),z=.405*Math.sin(phi)*Math.cos(a);
    return offHead(x,y,z,lift);
  };
  const uv=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){pos.push(...surface(i/cols,j/rows));uv.push(i/cols*2.9,j/rows*1.5);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;index.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();mesh(group,geo,mat,'styled-scalp');
}
function curtain(group,mat,wavy=false){
  const cols=48,rows=36,pos=[],index=[];
  // Sections sculpted into the lengths: six soft swells across the back, fading at the roots and the tips.
  const swellAt=(s,t)=>{const phase=s*Math.PI*5.5+1.4*t,seam=Math.exp(-(1+Math.cos(phase))/.05);return Math.sin(Math.PI*t)**.8*Math.max(0,1-s*s*s*s)*(.005+.003*Math.sin(phase/2)**2-.009*seam);};
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
      return [x,y,headZ*(1-ease)+back*ease+ripple-offset-swellAt(s,t)];
    }
    const drape=-.41+.025*s*s;
    return [x,y,rootZ*(1-smooth)+drape*smooth-offset-swellAt(s,t)];
  };
  const uv=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){pos.push(...surface(i/cols*2-1,j/rows));uv.push(i/cols*.92,j/rows*.9);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;index.push(a,b,a+1,a+1,b,b+1);}
  // Wound to face outwards, away from her, like the rest of her hair.
  for(let i=0;i<index.length;i+=3)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();mesh(group,geo,mat,'v-shaped-lengths');
  for(const side of [-1,1])lock(group,[[side*.47,.14,.10],[side*.49,-.18,.025],[side*.46,-.45,-.16],[side*.39,-.62,-.32]],.056,mat,'face-framing-lock',{ends:'soft'});
}
// A lock of hair along a path: fuller in the middle, and ending in a point (a lock that is combed to its tip), softly
// (a rounded tip) or round at both ends (a section lying on the hair). It is one stuffed plush piece.
function lock(group,points,radius,mat,name,{ends='point',flat=.75}={}){
  const path=new THREE.CatmullRomCurve3(points.map(point)),steps=48,sides=14,frames=path.computeFrenetFrames(steps,false),pos=[],indices=[];
  const size=t=>{const body=radius*(.72+.28*Math.sin(t*Math.PI));
    if(ends==='point')return body*(t>.75?Math.max(.04,(1-t)/.25):1);
    if(ends==='soft')return body*(t>.7?1-.55*(t-.7)/.3:1);
    return radius*(.55+.45*Math.sin(t*Math.PI));};
  const uv=[],length=path.getLength();
  for(let i=0;i<=steps;i++){const t=i/steps,c=path.getPointAt(t),r=size(t);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,p=c.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*flat);pos.push(...p.toArray());uv.push(j/sides*radius*Math.PI*2,t*length);}}
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  // Faces outwards, so the lock is lit from outside like the rest of her hair.
  const n0=new THREE.Vector3().fromBufferAttribute(geo.attributes.normal,4*(sides+1)),c0=path.getPointAt(4/steps);
  if(n0.dot(new THREE.Vector3().fromBufferAttribute(geo.attributes.position,4*(sides+1)).sub(c0))<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];geo.setIndex(indices);geo.computeVertexNormals();}
  mesh(group,geo,mat,name);
  if(ends!=='point')for(const t of ends==='soft'?[1]:[0,1]){const r=size(t);ball(group,path.getPointAt(t).toArray(),[r,r*.9,r*flat],mat,`${name}-tip`);}
  return path;
}
function tie(group,p,r){const mat=new THREE.MeshStandardMaterial({color:'#59413a',roughness:.8});const m=mesh(group,new THREE.TorusGeometry(r,.014,8,32),mat,'hair-tie');m.position.set(...p);m.rotation.x=Math.PI/2;}
function bun(group,p,scale,mat){ball(group,p,scale,mat,'coiled-bun');const path=[];for(let i=0;i<=150;i++){const t=i/150,a=t*Math.PI*9,r=Math.sin(t*Math.PI)*.88;path.push([p[0]+Math.cos(a)*scale[0]*r,p[1]+Math.sin(a)*scale[1]*r,p[2]-scale[2]*Math.sqrt(1-r*r)-.004]);}line(group,path,.018,mat,'bun-twist');}
// Where a ponytail is tied, the hair is drawn together from her head into the tie: a short gathered cone, wide where it
// leaves her head and pleated as it narrows into the tie, rather than a ball (which read as a bun).
function gathered(group,mat,at,tieRadius){
  const tie=new THREE.Vector3(...at),n=tie.clone().divide(new THREE.Vector3(HEAD[0]**2,HEAD[1]**2,HEAD[2]**2)).normalize();
  const a=new THREE.Vector3().crossVectors(n,new THREE.Vector3(0,1,0));if(a.lengthSq()<1e-4)a.set(1,0,0);a.normalize();const b=new THREE.Vector3().crossVectors(n,a);
  const toward=tie.clone().normalize(),rows=14,cols=48,pos=[],uv=[],idx=[],d=new THREE.Vector3();
  for(let j=0;j<=rows;j++){const t=j/rows,e=t*t*(3-2*t);
    for(let i=0;i<=cols;i++){const th=i/cols*Math.PI*2,c=Math.cos(th),s=Math.sin(th);
      // The base lies on her hair, about a fifth of her head across; pleats appear as it is drawn in.
      d.copy(toward).addScaledVector(a,c*.42).addScaledVector(b,s*.42).normalize();
      const base=new THREE.Vector3(...offHead(...onEllipsoid(d),.03));
      const ring=tie.clone().addScaledVector(a,c*tieRadius*.85).addScaledVector(b,s*tieRadius*.85);
      const p=base.lerp(ring,e),pleat=1+.12*Math.sin(th*7)*Math.sin(Math.PI*t);
      p.sub(tie).multiplyScalar(pleat).add(tie).addScaledVector(n,.025*Math.sin(Math.PI*t));
      pos.push(p.x,p.y,p.z);uv.push(i/cols*1.2,t*.5);}}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const p=j*(cols+1)+i,q=p+cols+1;idx.push(p,q,p+1,p+1,q,q+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  // Faces outwards, away from the middle of the gather.
  const row=7*(cols+1),mid=new THREE.Vector3();for(let i=0;i<cols;i++)mid.add(new THREE.Vector3().fromBufferAttribute(geo.attributes.position,row+i));mid.divideScalar(cols);
  if(new THREE.Vector3().fromBufferAttribute(geo.attributes.normal,row).dot(new THREE.Vector3().fromBufferAttribute(geo.attributes.position,row).sub(mid))<0){for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];geo.setIndex(idx);geo.computeVertexNormals();}
  mesh(group,geo,mat,'gathered-hair');
}
function onEllipsoid(d){const k=1/Math.sqrt((d.x/HEAD[0])**2+(d.y/HEAD[1])**2+(d.z/HEAD[2])**2);return [d.x*k,d.y*k,d.z*k];}
// A ponytail: the hair drawn from her head into the tie, the tie, then the tail falling with gravity in a soft S,
// with two thinner locks running alongside it and its end split into rounded tips of different lengths.
function ponytail(group,mat,{at,tieRadius,path,radius}){
  gathered(group,mat,at,tieRadius);
  tie(group,at,tieRadius);
  const curve=lock(group,path,radius,mat,'ponytail',{ends:'soft'});
  const across=new THREE.Vector3(1,0,0),out=new THREE.Vector3();
  for(const [side,along,thin] of [[-1,.55,.34],[1,.7,.3]]){
    const pts=[];for(let i=0;i<=6;i++){const t=.08+(along-.08)*i/6,c=curve.getPointAt(t),tangent=curve.getTangentAt(t);out.crossVectors(tangent,across).normalize();pts.push(c.clone().addScaledVector(across,side*radius*.5).addScaledVector(out,radius*.3*Math.sin(t*Math.PI)).toArray());}
    lock(group,pts,radius*thin,mat,'ponytail-section',{ends:'soft'});
  }
  for(const [dx,dz,drop] of [[-.06,.01,.03],[.0,.025,.1],[.065,-.01,.06]]){
    const pts=[];for(let i=0;i<=4;i++){const t=.72+.28*i/4,c=curve.getPointAt(t);pts.push([c.x+dx*i/4,c.y-drop*(i/4)**2,c.z+dz*i/4]);}
    lock(group,pts,radius*.4,mat,'ponytail-tip',{ends:'soft'});
  }
}
// A three-strand plait brought over her left shoulder. The hair is gathered at the back and swept round behind her ear
// to the plait's top. A plait shows as a chain of lobes, each strand crossing over the middle in turn: alternate lobes
// lie to either side of the plait's centre line and slant towards it going down, so together they make the plait's
// chevrons. A thin core fills the gaps between them; strand lines run along each lobe. It narrows a little to a hair
// tie and a short loose tail.
function sideBraid(group,mat){
  lock(group,[[.16,-.1,-.37],[.40,-.24,-.24],[.48,-.36,.02],[.42,-.46,.17]],.072,mat,'braid-gather');
  const path=new THREE.CatmullRomCurve3([[.42,-.44,.17],[.41,-.56,.235],[.37,-.72,.265],[.32,-.88,.275],[.29,-.98,.275]].map(point));
  line(group,Array.from({length:21},(_,i)=>path.getPointAt(i/20).toArray()),.026,mat,'braid-core');
  const count=12,lobe=new THREE.SphereGeometry(1,20,12),m=new THREE.Matrix4(),basis=new THREE.Matrix4(),q=new THREE.Vector3();
  for(let i=0;i<count;i++){
    const t=(i+.5)/count,c=path.getPointAt(t),along=path.getTangentAt(t).normalize();
    // Out from her (towards the viewer at her shoulder), square to the plait; across it, the side the lobes alternate.
    const out=new THREE.Vector3(c.x*.8,0,1).normalize(),across=new THREE.Vector3().crossVectors(along,out).normalize();out.crossVectors(across,along).normalize();
    const side=i%2?1:-1,width=.13*(1-.3*t),slant=side*.7;
    const axis=along.clone().multiplyScalar(Math.cos(slant)).addScaledVector(across,Math.sin(slant)),wide=new THREE.Vector3().crossVectors(out,axis).normalize();
    const centre=c.clone().addScaledVector(across,side*width*.26).addScaledVector(out,.016);
    const step=path.getLength()/count;
    basis.makeBasis(axis,wide,out);m.makeScale(step*1.35,width*.38,width*.36).premultiply(basis).setPosition(centre);
    const piece=mesh(group,lobe.clone().applyMatrix4(m),mat,'braid-lobe');piece.userData.side=side;
  }
  lobe.dispose();
  const end=path.getPointAt(1),down=path.getTangentAt(1);
  tie(group,end.toArray(),.03);
  lock(group,[end.toArray(),end.clone().addScaledVector(down,.06).add(new THREE.Vector3(.008,0,.01)).toArray(),end.clone().addScaledVector(down,.13).add(new THREE.Vector3(-.006,0,.015)).toArray()],.05,mat,'braid-tail');
}
export function makeHair(raw){
  const id=cleanHairId(raw),group=new THREE.Group();group.name='outfit-hair';group.userData.hairId=id;
  if(id==='bob')return group;
  const mat=material();scalp(group,mat);
  if(id==='straight-v'||id==='wavy-v'||id==='half-up')curtain(group,mat,id==='wavy-v');
  // Ponytails: the bunch sits over the crown or the nape where the hair is gathered, the tie just behind it, and the
  // tail falls from the tie, out a little and then down.
  if(id==='high-ponytail')ponytail(group,mat,{at:[.015,.35,-.48],tieRadius:.098,path:[[.01,.35,-.5],[.07,.26,-.64],[.12,0,-.67],[.1,-.32,-.6],[.07,-.6,-.52]],radius:.12});
  if(id==='high-bun')bun(group,[0,.53,-.26],[.215,.185,.19],mat);
  if(id==='low-ponytail')ponytail(group,mat,{at:[0,-.39,-.46],tieRadius:.082,path:[[0,-.4,-.48],[.03,-.55,-.56],[.05,-.75,-.58],[.04,-.92,-.56]],radius:.1});
  if(id==='low-bun')bun(group,[0,-.28,-.47],[.205,.16,.16],mat);
  if(id==='half-up'){bun(group,[0,-.04,-.49],[.115,.085,.075],mat);for(const side of [-1,1])line(group,[[side*.49,.06,-.08],[side*.35,.01,-.35],[0,-.035,-.51]],.025,mat,'half-up-twist');}
  if(id==='side-braid')sideBraid(group,mat);
  return group;
}
export function disposeHair(group){const mats=new Set();group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});for(const m of mats){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}}
// Her daisy is pinned into her hair at her left temple, whatever she wears: it sits on the outside of the hair there,
// facing out from it, rather than at a fixed point in front of her head (where it floated off the tied-back styles).
const FLOWER=new THREE.Vector3(.6,.5,.56).normalize(),HAIR_PART=/hair|bob|fringe|scalp|bun|twist|ponytail|braid|lengths|lock|crown/;
export function seatFlower(head){
  const flower=head.getObjectByName('hair-flower');if(!flower)return;
  const inFlower=o=>{for(let p=o;p;p=p.parent)if(p===flower)return true;return false;},shown=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const hair=[];head.traverse(o=>{if(o.isMesh&&HAIR_PART.test(o.name)&&!/tie/.test(o.name)&&shown(o)&&!inFlower(o))hair.push(o);});
  head.updateMatrixWorld(true);
  // Where a ray from outside her temple, aimed at her head's centre, meets her hair.
  const ray=new THREE.Raycaster(),hitAt=dir=>{const origin=head.localToWorld(dir.clone().multiplyScalar(1.5)),target=head.localToWorld(new THREE.Vector3());ray.set(origin,target.sub(origin).normalize());const hit=ray.intersectObjects(hair,false)[0];return hit?head.worldToLocal(hit.point.clone()):null;};
  const at=hitAt(FLOWER)??new THREE.Vector3(...offHead(...onEllipsoid(FLOWER),.03));
  // The hair's own surface there, from points round the seat (not the head's ellipsoid, nor one triangle's slope
  // across a seam), so the flower lies flat on it rather than tipping off one side.
  const across=new THREE.Vector3().crossVectors(FLOWER,new THREE.Vector3(0,1,0)).normalize(),up=new THREE.Vector3().crossVectors(across,FLOWER).normalize(),ring=[];
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,p=hitAt(FLOWER.clone().addScaledVector(across,Math.cos(a)*.075).addScaledVector(up,Math.sin(a)*.075).normalize());if(p)ring.push(p);}
  let normal;
  if(ring.length===8){normal=new THREE.Vector3();for(let k=0;k<8;k++)normal.add(new THREE.Vector3().crossVectors(ring[k].clone().sub(at),ring[(k+1)%8].clone().sub(at)));normal.normalize();}
  else normal=at.clone().divide(new THREE.Vector3(HEAD[0]**2,HEAD[1]**2,HEAD[2]**2)).normalize();
  if(normal.dot(at)<0)normal.negate();
  // Lifted just enough that no bump of the hair under it (a stuffed lock, a hem) stands over its cupped petals, then
  // pressed a little into the pile, as a pinned flower is.
  let lift=0;for(const p of ring){const r2=p.clone().sub(at).projectOnPlane(normal).lengthSq();lift=Math.max(lift,p.clone().sub(at).dot(normal)+r2/(2*.5));}
  flower.position.copy(at).addScaledVector(normal,lift-.0015);flower.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
}
// Adapter: leave makeDoll, its body, and all garment builders untouched.
export function createHairController(doll){
  const head=doll.getObjectByName('doll-head');if(!head)throw new Error('Hair requires the doll-head attachment point.');
  const names=new Set(['bob-back','hair-crown','side-bob','swept-fringe']);const originals=head.children.filter(o=>names.has(o.name)).map(o=>[o,o.visible]);
  let current=null,selected=null;
  return {update(raw){const id=cleanHairId(raw);if(id===selected)return;const next=id==='bob'?null:makeHair(id);if(current){head.remove(current);disposeHair(current);}current=next;selected=id;for(const [o,visible] of originals)o.visible=id==='bob'?visible:false;head.userData.hairShade?.(id==='bob');if(current)head.add(current);seatFlower(head);},dispose(){if(current){head.remove(current);disposeHair(current);current=null;}for(const [o,visible] of originals)o.visible=visible;head.userData.hairShade?.(true);selected=null;seatFlower(head);}};
}
