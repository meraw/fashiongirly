// Outerwear slot: coats and jackets worn over whatever top, bottoms and skirt are selected.
// Built in outfit units like the tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
import * as T from 'three';
import { V, random, weave, solid, put, oval, curve, shell, ringShell, ribbon, ribbed, roundSleeveCap } from './model.js';
import { GARMENTS } from '../wardrobe/catalog.js';

export function makeOuterwear(id, overSkirt=false){
  const spec=GARMENTS[id]?.slot==='outerwear'?GARMENTS[id].build:null;
  if(spec?.template==='zip-windbreaker')return makeZipWindbreaker(id,spec,overSkirt);
  return null;
}

// Catalog colours are sRGB hex, as the textures store them.
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function dataTexture(data,w,h,repeatU=1,repeatV=1){
  const t=new T.DataTexture(data,w,h,T.RGBAFormat);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeatU,repeatV);
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;
}
// Pen strokes on a pixel canvas: a disc stamped along each segment of a path, so thin lines stay smooth.
function stroke(paint,points,width,colour){
  for(let k=0;k<points.length-1;k++){const [x0,y0]=points[k],[x1,y1]=points[k+1],n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2));
    for(let s=0;s<=n;s++){const x=x0+(x1-x0)*s/n,y=y0+(y1-y0)*s/n;for(let dy=-width;dy<=width;dy++)for(let dx=-width;dx<=width;dx++){const d=Math.hypot(dx,dy);if(d<=width)paint(Math.round(x+dx),Math.round(y+dy),colour,Math.min(1,width+.5-d));}}}
}
// The embroidered script: a capital M and a run of small joined loops, read as handwriting at the doll's scale. It is a
// suggestion of the lettering, not the brand's own script.
function scriptPath(x0,y0,w,h){
  const pts=[[0,0],[.06,1],[.12,.25],[.2,.95],[.26,0]];
  for(let t=0;t<=1.0001;t+=.01){const k=t*5.2*Math.PI*2;pts.push([.3+t*.66+.035*Math.sin(k),.3*(1-Math.cos(k))+.02]);}
  return pts.map(([x,y])=>[x0+x*w,y0+y*h]);
}

// Colour layout of the body, by angle round the body (u: 0 and 1 at centre front, where the zip covers the seam) and
// height (v: y from 1 to 2 in outfit units).
const shellCache={};
function windbreakerBodyData(spec){
  const key=JSON.stringify([spec.colours,spec.yoke]);if(shellCache[key])return shellCache[key];
  const w=1024,h=512,data=new Uint8Array(w*h*4),C=spec.colours,Y=spec.yoke,blue=rgb(C.shell),ecru=rgb(C.yoke),rand=random(19);
  const yAt=v=>1+v/h,yokeY=a=>{const s=Math.abs(Math.sin(a)),c=Math.cos(a),front=Y.frontCentre+(Y.frontSide-Y.frontCentre)*s,t=Math.min(1,Math.max(0,(-c+.05)/.35));return front+(Y.back-front)*t;};
  const edges=Array.from({length:w},(_,i)=>yokeY(i/w*Math.PI*2)),backs=Array.from({length:w},(_,i)=>Math.cos(i/w*Math.PI*2)<-.35);
  for(let j=0;j<h;j++){const y=yAt(j);for(let i=0;i<w;i++){const edge=edges[i],k=(j*w+i)*4;
    let c=(y>edge&&y<Y.collar)?ecru:blue,shade=1;
    // A soft shadow just under the yoke's edge, where it overlaps the blue panel, and its topstitching just above.
    const d=y-edge;if(d<0&&d>-.006)shade=.9+.1*(-d/.006);
    if(y<Y.collar&&d>.009&&d<.012)shade=.9;
    // Across the back the yoke is a flap: a second stitched seam runs above its lower edge.
    if(backs[i]&&Math.abs(y-(Y.back+Y.backSeam))<.002)shade=.9;
    const grain=1+(rand()-.5)*.025;for(let n=0;n<3;n++)data[k+n]=Math.max(0,Math.min(255,c[n]*shade*grain));data[k+3]=255;}}
  // The script, embroidered just above the yoke's edge on her left chest.
  const thread=rgb(C.embroidery),paint=(x,y,col,alpha)=>{if(y<0||y>=h)return;const k=(y*w+((x%w)+w)%w)*4;for(let n=0;n<3;n++)data[k+n]=data[k+n]+(col[n]-data[k+n])*alpha;};
  const a0=Y.script.angle,u0=a0/(Math.PI*2)*w,yLine=yokeY(a0)+Y.script.above;
  stroke(paint,scriptPath(u0,(yLine-1)*h,Y.script.width*w,Y.script.height*h),.8,thread);
  shellCache[key]={data,w,h};return shellCache[key];
}
// The sleeves: the yoke colour runs over the shoulder onto the top of the sleeve and ends in a diagonal, higher on the
// outside of the arm than underneath. u runs round the sleeve from the front (drawn for her left arm; her right mirrors it),
// v is the height along the sleeve from -.6 to .1.
function windbreakerSleeveData(spec){
  const key='sleeve'+JSON.stringify([spec.colours,spec.yoke]);if(shellCache[key])return shellCache[key];
  const w=512,h=512,data=new Uint8Array(w*h*4),C=spec.colours,Y=spec.yoke,blue=rgb(C.shell),ecru=rgb(C.yoke),rand=random(23);
  for(let j=0;j<h;j++){const y=-.6+.7*j/h;for(let i=0;i<w;i++){const a=i/w*Math.PI*2,edge=(Y.sleeveOuter+Y.sleeveInner)/2+(Y.sleeveOuter-Y.sleeveInner)/2*Math.sin(a),k=(j*w+i)*4,d=y-edge;
    const c=d>0?ecru:blue,shade=(d<0&&d>-.006)?.9+.1*(-d/.006):(d>.009&&d<.0115)?.9:1,grain=1+(rand()-.5)*.025;
    for(let n=0;n<3;n++)data[k+n]=Math.max(0,Math.min(255,c[n]*shade*grain));data[k+3]=255;}}
  shellCache[key]={data,w,h};return shellCache[key];
}
// Coil zip: interlocking gunmetal teeth from either tape, down the centre of the strip.
function zipData(){
  if(shellCache.zip)return shellCache.zip;
  const w=16,h=16,data=new Uint8Array(w*h*4);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4,left=j%8<6&&i<11&&j<8,right=j%8<6&&i>4&&j>=8,tooth=left||right,edge=(j%8===0||j%8===5);
    const v=tooth?(edge?150:205):70;data[k]=data[k+1]=data[k+2]=v;data[k+3]=255;}
  shellCache.zip={data,w,h};return shellCache.zip;
}
// Turn a mesh's faces to point away from her (along `out` at its first vertex). Inward normals would push the shadow lookup
// into the body underneath and darken a piece lying close on it.
function outward(mesh,out){
  const g=mesh.geometry,n=g.attributes.normal;if(n.getX(0)*out.x+n.getY(0)*out.y+n.getZ(0)*out.z>=0)return mesh;
  const idx=g.index.array.slice();for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];g.setIndex(Array.from(idx));g.computeVertexNormals();return mesh;
}
function fabric(map,colour,spec){
  const grain=weave('felt');grain.repeat.set(18,18);
  return new T.MeshPhysicalMaterial({map,color:map?'#ffffff':colour,roughness:spec.roughness,sheen:.35,sheenColor:new T.Color('#f2efe6'),sheenRoughness:.6,bumpMap:grain,bumpScale:.0025,side:T.DoubleSide});
}

function makeZipWindbreaker(id,spec,overSkirt){
  const jacket=new T.Group();jacket.name='outerwear';jacket.userData.garmentId=id;
  const C=spec.colours,B=spec.body,seg=128;
  const bodyMap=windbreakerBodyData(spec),body=fabric(dataTexture(bodyMap.data,bodyMap.w,bodyMap.h),null,spec),plain=fabric(null,C.shell,spec),ecruPlain=fabric(null,C.yoke,spec);
  const thread=solid(C.stitch,.85),white=solid(C.snap,.45),cord=solid(C.cord,.9);
  const metal=new T.MeshStandardMaterial({color:C.zip,metalness:.55,roughness:.42});
  // Boxy body from the stand collar to a gathered elastic hem. Over the skirt the lower body and band sit out over its fullness.
  const rows=(overSkirt?B.overSkirt:B.rows).map(r=>r.slice());
  const mesh=shell(jacket,rows,body,'jacket-body',seg);
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,n=p.count/(seg+1);
  // The smooth profile (before gathers), for placing details on the surface: rx and rz by height.
  const prof=[];for(let j=0;j<n;j++)prof.push([p.getY(j*(seg+1)),p.getX(j*(seg+1)+seg/4),p.getZ(j*(seg+1))]);
  const radii=y=>{let j=0;while(j<prof.length-2&&prof[j+1][0]>y)j++;const [y0,x0,z0]=prof[j],[y1,x1,z1]=prof[j+1],t=Math.max(0,Math.min(1,(y0-y)/(y0-y1)));return [x0+(x1-x0)*t,z0+(z1-z0)*t];};
  // Fabric: the body blouses into the elastic band in small gathers, and a few soft creases run across the sides.
  const bandTop=B.hem+B.band,gather=(a,y)=>{const t=Math.max(0,1-(y-bandTop)/B.gatherHeight);return 1+B.gatherDepth*t*t*Math.cos(a*B.gathers)+.004*Math.sin(3*a+17*y)*Math.sin(a)**2;};
  for(let j=0;j<n;j++)for(let i=0;i<=seg;i++){const k=j*(seg+1)+i,a=i/seg*Math.PI*2,y=p.getY(k),g=y<B.collarBase?gather(a,y):1;
    p.setX(k,p.getX(k)*g);p.setZ(k,p.getZ(k)*g);uv.setXY(k,i/seg,y-1);}
  p.needsUpdate=true;uv.needsUpdate=true;mesh.geometry.computeVertexNormals();
  const surf=(a,y,off=0)=>{const [rx,rz]=radii(y),g=y<B.collarBase?gather(a,y):1;return V(Math.sin(a)*rx*g,y,Math.cos(a)*rz*g);};
  const normal=(a,y)=>{const ta=surf(a+1e-3,y).sub(surf(a-1e-3,y)),ty=surf(a,y+1e-3).sub(surf(a,y-1e-3));return new T.Vector3().crossVectors(ta,ty).normalize();};
  const at=(a,y,off)=>surf(a,y).addScaledVector(normal(a,y),off);
  const angleFor=(x,y,back=false)=>{const a=Math.asin(Math.max(-1,Math.min(1,x/radii(y)[0])));return back?Math.PI-a:a;};
  // Elastic hem band, gathered narrower than the body, which tucks just inside it.
  const band=overSkirt?B.bandOverSkirt:B.bandRadius;
  ribbed(shell(jacket,[[bandTop+.004,band[0]-.004,band[1]-.004],[bandTop-.006,band[0],band[1]],[B.hem+.008,band[0],band[1]],[B.hem,band[0]-.006,band[1]-.006]],plain,'elastic-hem-band',seg),B.bandPuckers,.014);
  // Stand collar lined in the hood's ecru, seen from above.
  shell(jacket,[[B.collarTop-.002,B.collarRadius[0]-.004,B.collarRadius[1]-.004],[B.collarBase+.01,B.collarRadius[0]+.004,B.collarRadius[1]+.002]],ecruPlain,'collar-lining',64);
  // Centre-front coil zip from the hem to the top of the collar, a slider and pull at the top and a stop at the hem.
  const zy=[];for(let k=0;k<=60;k++)zy.push(B.hem+.004+(B.collarTop-.006-B.hem-.004)*k/60);
  const zp=zy.map(y=>at(0,y,.003)),zn=zy.map(y=>normal(0,y));
  const zipMap=dataTexture(zipData().data,16,16,1,(B.collarTop-B.hem)/.014);zipMap.colorSpace=T.NoColorSpace;
  outward(ribbon(jacket,zp,zn,spec.zip.width,new T.MeshStandardMaterial({color:C.zip,map:zipMap,metalness:.55,roughness:.45,side:T.DoubleSide}),'coil-zip'),zn[0]);
  for(const s of [-1,1])curve(jacket,zy.filter((_,k)=>k%3===0).map(y=>at(s*spec.zip.stitch/radii(y)[0],y,.0025).toArray()),.0014,thread,'zip-topstitch');
  const slider=put(jacket,new T.BoxGeometry(.022,.03,.01),metal,'zip-slider');slider.position.copy(at(0,B.collarTop-.03,.008));
  const pull=put(jacket,new T.BoxGeometry(.012,.034,.004),metal,'zip-pull');pull.position.copy(at(0,B.collarTop-.06,.014));
  curve(jacket,[at(-.01,B.collarTop-.075,.016),at(0,B.collarTop-.095,.018),at(.01,B.collarTop-.075,.016)].map(v=>v.toArray()),.004,cord,'zip-pull-cord');
  const stop=put(jacket,new T.BoxGeometry(.024,.016,.008),metal,'zip-stop');stop.position.copy(at(0,B.hem+.01,.006));
  // Welt pockets low on each front: a narrow raised welt edged in topstitching, its opening along the inner edge, closed
  // by two white snaps.
  const P=spec.pockets;
  for(const s of [-1,1]){
    const ys=[];for(let k=0;k<=12;k++)ys.push(P.top-(P.top-P.bottom)*k/12);
    const a=y=>angleFor(s*(P.x+P.slant*(P.top-y)),y);
    outward(ribbon(jacket,ys.map(y=>at(a(y),y,.0035)),ys.map(y=>normal(a(y),y)),P.width,plain,'pocket-welt'),normal(a(P.top),P.top));
    const da=y=>P.width/2/radii(y)[0];
    for(const k of [-1,1])curve(jacket,ys.map(y=>at(a(y)+k*da(y)*.78,y,.0045).toArray()),.0009,thread,'welt-topstitch');
    curve(jacket,ys.map(y=>at(a(y)-s*da(y)*1.02,y,.0015).toArray()),.0017,solid(C.opening,.95),'pocket-opening');
    for(const y of P.snaps){const q=at(a(y),y,.006),snap=oval(jacket,q.toArray(),[P.snap,P.snap,.005],white,'snap-button',20);snap.lookAt(q.clone().add(normal(a(y),y)));
      const rim=put(jacket,new T.TorusGeometry(P.snap*.62,.0018,6,20),white,'snap-rim');rim.position.copy(at(a(y),y,.0105));rim.lookAt(rim.position.clone().add(normal(a(y),y)));}
  }
  // Drawcords from small eyelets either side of the zip below the collar, hanging down the yoke: ecru cord ending in a blue
  // tip with a white band.
  const D=spec.cords;
  for(const s of [-1,1]){
    const a0=angleFor(s*D.x,D.top),eye=put(jacket,new T.TorusGeometry(.009,.003,6,16),metal,'cord-eyelet');eye.position.copy(at(a0,D.top,.003));eye.lookAt(eye.position.clone().add(normal(a0,D.top)));
    const path=[];for(let k=0;k<=8;k++){const y=D.top-(D.top-D.end)*k/8,x=s*(D.x+D.drift*k/8);path.push(at(angleFor(x,y),y,.009+.006*Math.sin(k/8*Math.PI)).toArray());}
    curve(jacket,path,D.radius,cord,'drawcord');
    const tip=(y0,y1,mat,name,r)=>{const x=s*(D.x+D.drift);curve(jacket,[at(angleFor(x,y0),y0,.012).toArray(),at(angleFor(x,y1),y1,.012).toArray()],r,mat,name);};
    tip(D.end+.002,D.end-.016,plain,'cord-tip',D.radius*1.45);tip(D.end-.016,D.end-.024,cord,'cord-tip-band',D.radius*1.5);tip(D.end-.024,D.end-.04,plain,'cord-tip',D.radius*1.45);
  }
  // Hood, worn down: a rounded pouch lying over the back yoke below her hair, with a centre seam and a small label. Its
  // rolled opening edge comes forward round her neck to the zip, beside the stand collar.
  const H=spec.hood,grid=[],U=24,W=16;
  const hoodPoint=(u,v)=>{const yb=H.bottom+H.round*u*u,y=H.top-(H.top-yb)*v,half=H.halfWidth*(1-.25*v*v),a=angleFor(u*half,y,true);
    // Fuller toward the bottom, where the folded hood gathers, with two soft folds running down it.
    const lift=H.lift*Math.max(0,1-u*u)**.7*Math.sin(Math.PI*(.12+.88*v))**.8*(.8+.25*v)*(1-.12*Math.cos(u*Math.PI*2.4)**2)+.005;return at(a,y,lift);};
  for(let j=0;j<=W;j++){const ring=[];for(let i=0;i<=U;i++)ring.push(hoodPoint(-1+2*i/U,j/W).toArray());grid.push(ring);}
  outward(ringShell(jacket,grid,plain,'hood'),normal(Math.PI,H.top));
  // Rolled edges round the hood's sides and bottom, and its centre seam with the label beside it.
  const rim=[];for(let j=0;j<=W;j++)rim.push(hoodPoint(-1,j/W).toArray());for(let i=1;i<U;i++)rim.push(hoodPoint(-1+2*i/U,1).toArray());for(let j=W;j>=0;j--)rim.push(hoodPoint(1,j/W).toArray());
  curve(jacket,rim,H.edge,plain,'hood-edge');
  curve(jacket,Array.from({length:W+1},(_,j)=>hoodPoint(0,j/W).clone().addScaledVector(normal(Math.PI,H.top-(H.top-H.bottom)*j/W),.002).toArray()),.0016,thread,'hood-seam');
  const lp=hoodPoint(.12,.45),label=put(jacket,new T.BoxGeometry(.012,.045,.003),ecruPlain,'hood-label');label.position.copy(lp).addScaledVector(normal(Math.PI,lp.y),.004);label.lookAt(label.position.clone().add(normal(Math.PI,lp.y)));
  // The hood's opening: blue outside with the ecru lining rolled over its inner edge, from the zip round the back of the neck.
  const opening=(off,lift)=>{const pts=[];for(let k=0;k<=24;k++){const a=H.opening.from+(Math.PI*2-2*H.opening.from)*k/24,[rx,rz]=B.collarRadius;
    pts.push([Math.sin(a)*(rx+off),B.collarBase+H.opening.rise*(1-Math.cos(a))/2+lift,Math.cos(a)*(rz+off)]);}return pts;};
  curve(jacket,opening(H.opening.out,0),H.opening.radius,plain,'hood-opening');
  curve(jacket,opening(H.opening.out-.01,H.opening.radius*.8),H.opening.radius*.55,ecruPlain,'hood-lining-edge');
  // Woven label low on the back, above the band on her right.
  const ly=B.hem+B.band+.035,la=angleFor(-spec.backLabel.x,ly,true),bl=put(jacket,new T.BoxGeometry(.06,.016,.003),ecruPlain,'back-label');bl.position.copy(at(la,ly,.004));bl.lookAt(bl.position.clone().add(normal(la,ly)));
  // Sleeves: dropped shoulders and long relaxed sleeves blousing into elastic cuffs.
  const S=spec.sleeve,sleeveMap=windbreakerSleeveData(spec);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.name='jacket-arm';arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,fabric(dataTexture(sleeveMap.data,sleeveMap.w,sleeveMap.h),null,spec),'jacket-sleeve',64);
    const sp=sleeve.geometry.attributes.position,su=sleeve.geometry.attributes.uv,cuffTop=S.cuff[0];
    for(let k=0;k<sp.count;k++){const i=k%65,a=i/64*Math.PI*2,y=sp.getY(k),t=Math.max(0,1-(y-cuffTop)/S.gatherHeight),g=1+S.gatherDepth*t*t*Math.cos(a*S.gathers);
      sp.setX(k,sp.getX(k)*g);sp.setZ(k,sp.getZ(k)*g);su.setXY(k,side>0?i/64:1-i/64,(y+.6)/.7);}
    sp.needsUpdate=true;su.needsUpdate=true;
    roundSleeveCap(sleeve,side,S.rows[0][0]);
    ribbed(shell(arm,[[S.cuff[0]+.006,S.cuffRadius[0]-.004,S.cuffRadius[1]-.004],[S.cuff[0]-.006,...S.cuffRadius],[S.cuff[1]+.006,...S.cuffRadius],[S.cuff[1],S.cuffRadius[0]-.006,S.cuffRadius[1]-.006]],plain,'elastic-cuff',64),S.cuffPuckers,.03);
    // Round rubber badge on the upper left sleeve, just below the yoke colour.
    if(side>0){const r=S.badge.radius,y=S.badge.y;let rx=0;for(let k=0;k<S.rows.length-1;k++)if(y<=S.rows[k][0]&&y>=S.rows[k+1][0]){const t=(S.rows[k][0]-y)/(S.rows[k][0]-S.rows[k+1][0]);rx=S.rows[k][1]+(S.rows[k+1][1]-S.rows[k][1])*t;}
      oval(arm,[rx+.004,y,0],[.004,r,r],white,'sleeve-badge',24);
      const ring=put(arm,new T.TorusGeometry(r*.72,.0022,6,24),white,'sleeve-badge-rim');ring.position.set(rx+.008,y,0);ring.rotation.y=Math.PI/2;}
    jacket.add(arm);
  }
  return jacket;
}
