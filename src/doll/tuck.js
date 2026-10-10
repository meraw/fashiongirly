// Tucking a top in. Below the top of the waistband she wears (her trousers' or the skirt's), the top is drawn in just
// inside it (each height and angle measured on the waistband), and above it the fabric blouses over the waistband's
// edge and goes straight in at its top. Fabric far below the waistband's top is folded up out of the way, out of sight.
// Built in outfit units, before makeOutfit scales the outfit.
import * as T from 'three';
import { levelCaster } from './level-caster.js';

// Just above the waistband's top the fabric goes straight in: rows less than SNAP above it are drawn down to just inside
// its top (SNAP is about a top's row spacing, so the straight edge from the last row outside to the first row inside
// cannot cut through the waistband). Above that, over BLEND, the fabric eases in only as far as the waistband's outer
// edge, blousing over it: drawn in any further, it would leave a gap that shows the inside of the trousers.
const SNAP=.03,BLEND=.05,FOLD=.1;
// A bottom's waistband: its top (the highest point near her front and back) and the radius of its inner surface at an
// angle round her: the closest anywhere from just below its top down to where the tucked fabric is folded away, since
// at the very top a ray can miss the waistband or meet a patch or loop standing outside it, and below the waistband
// the trousers can be narrower than it (a top's rows are far enough apart to cut across that step).
// Null if she wears no bottom to tuck into.
function measureWaist(waist){
  waist.updateMatrixWorld(true);
  const meshes=[];waist.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)meshes.push(o);});if(!meshes.length)return null;
  const v=new T.Vector3();let top=-Infinity;
  for(const m of meshes){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(Math.abs(v.x)<.32)top=Math.max(top,v.y);}}
  if(!Number.isFinite(top))return null;
  const cast=levelCaster(meshes,{axis:[0,0],faces:'both'}),o=new T.Vector3(),d=new T.Vector3(),up=new T.Vector3(0,1,0),cache=new Map();
  const inner=(y,a)=>{const key=Math.round(y/.004)+':'+Math.round(a/(Math.PI/90));
    if(!cache.has(key)){const hit=cast(o.set(0,y,0),d.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(up,1e-5));cache.set(key,hit?hit.distance:null);}return cache.get(key);};
  const inside=a=>{let rin=null;for(let h=top-.004;h>top-FOLD-.04;h-=.006){const r=inner(h,a);if(r!=null)rin=rin==null?r:Math.min(rin,r);}return rin;};
  // Its outer edge at the top: the farthest surface just below the top, all round her.
  const edges=new Map(),outside=a=>{const key=Math.round(a/(Math.PI/90));
    if(!edges.has(key)){let r=null;for(let h=top-.004;h>top-.03;h-=.006){const hit=cast(o.set(0,h,0),d.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(up,1e-5),true);if(hit)r=Math.max(r??0,hit.distance);}edges.set(key,r);}return edges.get(key);};
  return {top,inside,outside};
}
// Where a point of the top goes when it is tucked into this waistband (into `out`); false if it stays where it is.
function tuckPoint(w,x,y,z,out){
  if(y>w.top+SNAP+BLEND)return false;
  const r=Math.hypot(x,z)||1,a=Math.atan2(x,z),rin=w.inside(a);if(rin==null)return false;
  if(y>w.top+SNAP){const s=(y-w.top-SNAP)/BLEND,edge=(w.outside(a)??rin)+.004,k=(r+(Math.min(r,edge)-r)*(1-s)**2)/r;out.set(x*k,y,z*k);return true;}
  const fy=Math.min(Math.max(y,w.top-FOLD),w.top-.004),k=Math.min(r,rin-.007)/r;out.set(x*k,fy,z*k);return true;
}
// One piece of a top, built in outfit units (a button-down's body): tucked in place. Returns the waistband's top.
export function tuckInto(mesh,waist){
  const w=measureWaist(waist);if(!w)return null;
  const p=mesh.geometry.attributes.position,q=new T.Vector3();
  for(let i=0;i<p.count;i++)if(tuckPoint(w,p.getX(i),p.getY(i),p.getZ(i),q))p.setXYZ(i,q.x,q.y,q.z);
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();return w.top;
}
// A whole top, however it was built: every piece below the waistband's top is tucked in, except the sleeves, which hang
// in arm groups tilted with her arms (as every top builds them). Small pieces (a button, a stitched logo) move whole, so
// they keep their shape, and those reaching below the waistband's top are hidden in it. Returns whether the top was tucked.
export function tuckTop(top,waist){
  const w=measureWaist(waist);if(!w)return false;
  top.updateMatrixWorld(true);
  const arms=[];top.traverse(o=>{if(o.isGroup&&o.rotation.z!==0&&o.children.some(c=>c.isMesh&&/sleeve/.test(c.name)))arms.push(o);});
  const inArm=o=>{for(let p=o;p&&p!==top;p=p.parent)if(arms.includes(p))return true;return false;};
  const meshes=[];top.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!inArm(o))meshes.push(o);});
  const v=new T.Vector3(),q=new T.Vector3(),inverse=new T.Matrix4();
  for(const mesh of meshes){
    const g=mesh.geometry;if(!g.boundingSphere)g.computeBoundingSphere();
    const centre=g.boundingSphere.center.clone().applyMatrix4(mesh.matrixWorld),radius=g.boundingSphere.radius*mesh.matrixWorld.getMaxScaleOnAxis();
    if(centre.y-radius>w.top+SNAP+BLEND)continue;
    if(radius<.03){
      if(centre.y-radius<w.top){mesh.visible=false;continue;}
      if(tuckPoint(w,centre.x,centre.y,centre.z,q)){inverse.copy(mesh.parent.matrixWorld).invert();mesh.position.add(q.applyMatrix4(inverse).sub(centre.applyMatrix4(inverse)));}
      continue;
    }
    // Pieces can share a geometry with other garments, so each tucked piece gets its own copy.
    mesh.geometry=g.clone();const p=mesh.geometry.attributes.position;inverse.copy(mesh.matrixWorld).invert();let moved=false;
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);if(!tuckPoint(w,v.x,v.y,v.z,q))continue;q.applyMatrix4(inverse);p.setXYZ(i,q.x,q.y,q.z);moved=true;}
    if(moved){p.needsUpdate=true;if(mesh.geometry.attributes.normal)mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();mesh.geometry.computeBoundingBox();}
  }
  top.userData.tucked=true;return true;
}
