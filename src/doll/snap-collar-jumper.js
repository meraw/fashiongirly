// Snap-collar jumper: a relaxed waffle-knit jumper in horizontal stripes, with raglan sleeves, a big ribbed fold-over
// collar, a half placket closed with metal snaps, a deep rib hem band and long rib cuffs. Worn with the top snaps open, so
// the placket opens into a V and the collar spreads over her shoulders.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
import * as T from 'three';
import { random, weave, put, oval, curve, shell, ribbed, roundSleeveCap, easeOverHand, surfaceProbe, trimToEdge, SHOULDER_ROWS, cloth } from './model.js';
import { grid } from './polo.js';

const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const pixels=new Map();
// One stripe repeat of the waffle knit, two cells across: each cell a soft raised pad sinking into the grooves round it. The
// stripe colour changes at a row of cells, as a knitted stripe does. Returns colour and height pixels.
function waffleData(K){
  const key=JSON.stringify(K);if(pixels.has(key))return pixels.get(key);
  const c=16,rows=K.cells,w=2*c,h=rows*c,col=new Uint8Array(w*h*4),hgt=new Uint8Array(w*h*4),rand=random(31),stripe=hex(K.stripe),ground=hex(K.ground);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const row=Math.floor(y/c),cx=(x%c+.5)/c-.5,cy=(y%c+.5)/c-.5,pad=Math.max(0,1-(Math.hypot(cx,cy)/.62)**3);
    const base=row<K.stripeRows?stripe:ground,shade=(.88+.14*pad)*(1+(rand()-.5)*.06),i=(y*w+x)*4;
    for(let k=0;k<3;k++)col[i+k]=Math.max(0,Math.min(255,base[k]*shade));col[i+3]=255;
    hgt[i]=hgt[i+1]=hgt[i+2]=Math.round(pad*255);hgt[i+3]=255;
  }
  const out={col,hgt,w,h};pixels.set(key,out);return out;
}
// The striped waffle knit for one piece, `around` cells round it (the stripes come from mapStripes).
function waffle(K,around){
  const {col,hgt,w,h}=waffleData(K),[map,bump]=[col,hgt].map((data,n)=>{const t=new T.DataTexture(data,w,h,T.RGBAFormat);if(!n)t.colorSpace=T.SRGBColorSpace;
    t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(around/2,1);t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;});
  return new T.MeshPhysicalMaterial({map,bumpMap:bump,bumpScale:.012,roughness:.95,sheen:.25,sheenColor:new T.Color('#d8d2c6'),sheenRoughness:.8,side:T.DoubleSide});
}
// Plain cream rib for the bands, collar and placket.
function rib(colour,repeat=[30,1]){
  const bump=weave('knit');bump.repeat.set(...repeat);
  return new T.MeshPhysicalMaterial({color:new T.Color().setRGB(...hex(colour).map(c=>c/255),T.SRGBColorSpace),roughness:.93,sheen:.25,sheenColor:new T.Color('#d8d2c6'),sheenRoughness:.8,bumpMap:bump,bumpScale:.008,side:T.DoubleSide});
}
// Stripes follow height in the outfit, so the body's and sleeves' stripes meet across the raglan seams; a cream stripe
// meets the hem band.
function mapStripes(mesh,hemTop,pitch,toOutfit=v=>v){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,v=new T.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);toOutfit(v);uv.setY(i,(hemTop-v.y)/pitch+40);}
  uv.needsUpdate=true;return mesh;
}
// A snap: a metal ring round a dark eyelet (the cap), or a small domed stud (the other half, seen when it is open).
function snap(group,hit,M,stud,name){
  const at=hit.point.clone().addScaledVector(hit.normal,.004),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),hit.normal);
  if(stud){const s=oval(group,at.toArray(),[M.stud/1.06,M.stud/.76,.003],M.studMat,name,16);s.quaternion.copy(q);s.scale.set(M.stud/1.06,M.stud/.76,.003);return;}
  const ring=put(group,new T.TorusGeometry(M.ring,M.ring*.32,8,24),M.metal,name);ring.position.copy(at);ring.quaternion.copy(q);ring.scale.set(1/1.06,1/.76,1);
  const eye=put(group,new T.CircleGeometry(M.ring*.85,20),M.eyelet,name+'-eyelet');eye.position.copy(at).addScaledVector(hit.normal,-.0008);eye.quaternion.copy(q);eye.scale.set(1/1.06,1/.76,1);
}

export function makeSnapCollarJumper(id,spec,overSkirt=false){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,K=spec.knit,P=spec.placket,L=spec.collar,C=spec.colours;
  const hem=B.hem,band=B.band,hemTop=hem+band,neck=B.rows[0][0],flare=overSkirt?B.bandOverSkirt:B.bandRadius;
  const cream=rib(C.rib),collarRib=rib(C.rib,[90,2]);
  // Her skin shows in the open V (her body under clothes is cream felt).
  shell(top,SHOULDER_ROWS,cloth(C.skin),'bare-shoulder-skin',48);
  // The body: relaxed and straight to the hip, blousing a little over the band; the neckline is round at the back and
  // opens at the front into a V down to the first closed snap.
  const rows=[...B.rows,[hemTop+.012,...(overSkirt?B.bandOverSkirt:B.blouse)],[hemTop,...flare]];
  const body=shell(top,rows,waffle(K,K.around),'waffle-knit-body',128);
  const vEdge=(x,z)=>z<=0?neck+1:Math.min(neck+1,P.vBottom+(neck-P.vBottom)*Math.abs(x)/P.vHalf);
  trimToEdge(body,128,v=>v,vEdge);mapStripes(body,hemTop,K.pitch);
  ribbed(shell(top,[[hemTop+.01,flare[0]-.008,flare[1]-.006],[hemTop-band/2,flare[0]-.004,flare[1]-.003],[hem,flare[0]-.006,flare[1]-.004]],cream,'ribbed-hem-band',768),96,.01);
  // Raglan sleeves, full and relaxed, gathered into long rib cuffs.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;arm.updateMatrix();
    const sleeve=shell(arm,S.rows,waffle(K,S.around),'knit-jumper-sleeve',96);
    roundSleeveCap(sleeve,side,S.rows[0][0]);mapStripes(sleeve,hemTop,K.pitch,v=>v.applyMatrix4(arm.matrix));
    easeOverHand(ribbed(shell(arm,S.cuff,cream,'ribbed-cuff',256),S.cuffRibs,.03),side);
    top.add(arm);
  }
  top.updateMatrixWorld(true);
  const probe=surfaceProbe(top,['waffle-knit-body','knit-jumper-sleeve']);
  // Raglan seams from the neckline down to each underarm, front and back, in the knit itself.
  for(const front of [true,false])for(const side of [-1,1]){
    const pts=[];for(let k=0;k<=14;k++){const t=k/14,hit=probe(side*(.13+.17*t),neck-.012-.25*t+.02*Math.sin(t*Math.PI),front);if(hit)pts.push(hit.point.clone().addScaledVector(hit.normal,.003).toArray());}
    if(pts.length>3)mapStripes(curve(top,pts,.0035,waffle(K,40),'raglan-seam'),hemTop,K.pitch);
  }
  // The placket: a cream strip edging each side of the V, and one strip below it over the closed snaps.
  const onKnit=(nu,nv,xy,lift,name)=>grid(top,nu,nv,(u,v)=>{const [x,y]=xy(u,v),hit=probe(x,y,true);if(!hit)return [x,y,.2];return hit.point.clone().addScaledVector(hit.normal,lift).toArray();},cream,name);
  const edgeX=y=>P.vHalf*(y-P.vBottom)/(neck-P.vBottom);
  onKnit(4,12,(u,v)=>[(u-.5)*2*P.width,P.vBottom+.004-(P.vBottom+.004-P.end)*v],.003,'snap-placket');
  for(const side of [-1,1])onKnit(3,10,(u,v)=>{const y=P.vBottom+(neck-.004-P.vBottom)*v;return [side*(edgeX(y)+.002+P.width*u),y];},.003,'snap-placket');
  // Snaps: the open ones show their caps on her right edge of the V and their studs on her left; the closed ones are
  // capped down the middle below it.
  const M={ring:P.snap,stud:P.snap*.75,metal:new T.MeshStandardMaterial({color:C.metal,metalness:.85,roughness:.35}),eyelet:new T.MeshStandardMaterial({color:C.eyelet,roughness:.6}),studMat:new T.MeshStandardMaterial({color:C.metal,metalness:.8,roughness:.4})};
  for(const y of P.open)for(const side of [-1,1]){const hit=probe(side*(edgeX(y)+.002+P.width/2),y,true);if(hit)snap(top,hit,M,side>0,side<0?'placket-snap':'placket-stud');}
  for(const y of P.closed){const hit=probe(0,y,true);if(hit)snap(top,hit,M,false,'placket-snap');}
  // The collar: a big rib collar folded over, from its fold round the top of the stand down over her shoulders, its
  // rounded front ends spread either side of the V. u runs from her right end round the back to her left end; v from the
  // fold to the outer edge.
  const radii=y=>{let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;const t=Math.max(0,Math.min(1,(rows[k][0]-y)/(rows[k][0]-rows[k+1][0])));return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];};
  const fold=a=>[L.fold[1]*Math.sin(a),L.fold[0]-L.frontDrop*(1+Math.cos(a))/2,L.fold[2]*Math.cos(a)];
  const frontX=v=>P.vHalf+P.width+.004+(L.spread-P.vHalf-P.width)*v**1.4;
  // The outer edge lies low on her chest at the front, where the open collar shows as two broad flaps either side of the
  // V, and higher round the back, where her head and the raglan sleeve caps cover it; its front corners are rounded.
  const outerY=(a,u)=>{const end=Math.max(0,1-Math.min(u,1-u)/L.corner);return L.outer-L.outerDrop*((1+Math.cos(a))/2)**2-L.cornerDrop*(1-Math.sqrt(1-end*end));};
  // A point of the collar at angle a (as the body's rows measure it) and v from the fold to the outer edge: it comes down
  // from the fold, then lies just off the body, rolling a little as it turns over.
  // Close round her neck, under her head and inside any jacket's collar, it lies almost flat on the body.
  const point=(a,u,v)=>{const f=fold(a),y=f[1]+(outerY(a,u)-f[1])*v,[bx,bz]=radii(y),t=Math.min(1,v/L.drape),s=t*t*(3-2*t),q=Math.max(0,Math.min(1,(L.flatAbove-y)/.03));
    const off=(L.lift*s+L.roll*Math.sin(Math.PI*v))*(.3+.7*q*q*(3-2*q)),rx=Math.max(L.fold[1]+(bx-L.fold[1])*s,bx)+off,rz=Math.max(L.fold[2]+(bz-L.fold[2])*s,bz)+off;
    return [rx*Math.sin(a),y,rz*Math.cos(a),rx];};
  const at=(u,v)=>{
    // The front ends sit `frontX` across from her centre: find the angle where the collar is that far across.
    let start=Math.asin(Math.min(.99,frontX(v)/L.fold[1]));for(let n=0;n<4;n++)start=Math.asin(Math.min(.99,frontX(v)/point(start,0,v)[3]));
    return point(start+(Math.PI*2-2*start)*u,u,v).slice(0,3);
  };
  grid(top,128,10,at,collarRib,'snap-collar');
  const standStart=Math.asin(Math.min(.99,(P.vHalf+P.width)/L.fold[2]));
  grid(top,64,2,(u,v)=>{const a=standStart+(Math.PI*2-2*standStart)*u;return [(L.fold[1]-.008-.004*v)*Math.sin(a),L.fold[0]-.004-L.stand*v-L.frontDrop*(1+Math.cos(a))/2*v,(L.fold[2]-.008-.004*v)*Math.cos(a)];},collarRib,'snap-collar-stand');
  curve(top,Array.from({length:129},(_,i)=>at(i/128,1)),.006,cream,'snap-collar-edge');
  // With the top snaps open, each side of the placket folds back from the bottom of the V as a small lapel that runs up
  // into the collar's front end, so the collar visibly joins the placket. Each lapel fills the space between its roll
  // line (along the placket's outer edge, from the V up to the collar's fold) and the collar's front edge, lying on her.
  for(const [side,u0] of [[1,0],[-1,1]]){
    const top0=at(u0,0),roll=p=>{const y=P.vBottom+(top0[1]-P.vBottom)*p,x=side*(edgeX(Math.min(y,neck))+P.width+.002);return [x+(top0[0]-x)*p**3,y];};
    const onBody=(q,p)=>{const [rx,ry]=roll(p),c=at(u0,1-p),hit=probe(rx+(c[0]-rx)*q,ry+(c[1]-ry)*q,true);return hit&&hit.point.clone().addScaledVector(hit.normal,L.lift);};
    // Its top meets the collar's fold, up under her chin, where it eases from the body to the fold.
    const lapel=(q,p)=>{if(p<=.9)return (onBody(q,p)??new T.Vector3(...at(u0,1-p))).toArray();
      const t=(p-.9)/.1,low=onBody(q,.9)??new T.Vector3(...at(u0,.1));return low.lerp(new T.Vector3(...at(u0,(1-p)*q)),t).toArray();};
    // Built so both lapels' faces point out from her (their sides mirror each other).
    grid(top,8,16,(q,p)=>lapel(q,side>0?1-p:p),collarRib,'collar-lapel');
    // The roll line shows below her chin; higher up it would stand proud of a jacket's collar.
    const rollTop=Math.min(.9,(L.rollTop-P.vBottom)/(top0[1]-P.vBottom));
    curve(top,Array.from({length:13},(_,i)=>lapel(0,rollTop*i/12)),.0045,cream,'lapel-roll');
    curve(top,Array.from({length:9},(_,i)=>lapel(i/8,0)),.005,cream,'lapel-edge');
  }
  // Two snaps on each front end of the collar.
  const normalAt=(u,v)=>{const p=new T.Vector3(...at(u,v)),du=new T.Vector3(...at(u+.002,v)).sub(p),dv=new T.Vector3(...at(u,Math.min(1,v+.01))).sub(p),n=du.cross(dv).normalize();if(n.dot(new T.Vector3(p.x,0,p.z))<0)n.negate();return {point:p,normal:n};};
  for(const u0 of [L.snapU,1-L.snapU])for(const v of L.snapV)snap(top,normalAt(u0,v),M,false,'collar-snap');
  return top;
}
