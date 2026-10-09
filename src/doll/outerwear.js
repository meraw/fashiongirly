// Outerwear slot: coats and jackets worn over whatever top, bottoms and skirt are selected.
// Built in outfit units like the tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
import * as T from 'three';
import { V, random, weave, solid, put, oval, curve, shell, ringShell, ribbon, ribbed, roundSleeveCap } from './model.js';
import { GARMENTS } from '../wardrobe/catalog.js';
import { makeFurJacket } from './fur-jacket.js';
import { makeTailoredCoat } from './tailored-coat.js';

export function makeOuterwear(id, overSkirt=false, {under=null,open=false}={}){
  const spec=GARMENTS[id]?.slot==='outerwear'?GARMENTS[id].build:null;
  // A top may carry two collars (userData.underJacket): one standing out to show under her chin, and a narrow one that
  // fits inside a jacket's collar. Under a jacket, the narrow one is worn.
  if(spec&&under)under.traverse(o=>{if(typeof o.userData.underJacket==='boolean')o.visible=o.userData.underJacket;});
  if(spec?.template==='zip-windbreaker')return makeZipWindbreaker(id,spec,overSkirt,open&&!!GARMENTS[id].layering?.canOpen,under);
  if(spec?.template==='leather-zip-jacket')return makeLeatherJacket(id,spec,overSkirt,under,open&&!!GARMENTS[id].layering?.canOpen);
  if(spec?.template==='faux-fur-shirt-jacket')return makeFurJacket(id,spec,overSkirt,under);
  if(spec?.template==='tailored-coat')return makeTailoredCoat(id,spec,overSkirt,under,open&&!!GARMENTS[id].layering?.canOpen);
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
  const key=JSON.stringify([spec.colours,spec.yoke,spec.lines,spec.prints,...(spec.logo?[spec.logo]:[])]);if(shellCache[key])return shellCache[key];
  if(!spec.yoke)return plainBodyData(spec,key);
  const w=1024,h=512,data=new Uint8Array(w*h*4),C=spec.colours,Y=spec.yoke,blue=rgb(C.shell),ecru=rgb(C.yoke),rand=random(19);
  // Optional (`backCentre`): the yoke ends in a V across the back too, lower at the centre back than at the sides.
  const yAt=v=>1+v/h,yokeY=a=>{const s=Math.abs(Math.sin(a)),c=Math.cos(a),front=Y.frontCentre+(Y.frontSide-Y.frontCentre)*s,t=Math.min(1,Math.max(0,(-c+.05)/.35)),back=Y.backCentre==null?Y.back:Y.backCentre+(Y.back-Y.backCentre)*s;return front+(back-front)*t;};
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
  const thread=Y.script?rgb(C.embroidery):null,paint=(x,y,col,alpha)=>{if(y<0||y>=h)return;const k=(y*w+((x%w)+w)%w)*4;for(let n=0;n<3;n++)data[k+n]=data[k+n]+(col[n]-data[k+n])*alpha;};
  if(Y.script){const a0=Y.script.angle,u0=a0/(Math.PI*2)*w,yLine=yokeY(a0)+Y.script.above;
    stroke(paint,scriptPath(u0,(yLine-1)*h,Y.script.width*w,Y.script.height*h),.8,thread);}
  // Optional (`wordmark`): a small printed name on her left chest, in plain block capitals (not the brand's lettering),
  // centred at `angle` round her with its foot at height `y`; `width` and `height` are in outfit units.
  const M=Y.wordmark;
  if(M){const ink=rgb(M.colour),rx=rowRadius(spec.body.rows,M.y+M.height/2),wpx=M.width/(Math.PI*2*rx)*w,u0=M.angle/(Math.PI*2)*w-wpx/2;
    for(let j=Math.floor((M.y-1)*h)-1;j<=(M.y+M.height-1)*h+1;j++)for(let i=Math.floor(u0)-1;i<=u0+wpx+1;i++){
      let cover=0;for(let sy=0;sy<3;sy++)for(let sx=0;sx<3;sx++)cover+=letterInk((i+(sx+.5)/3-u0)/wpx,(1+(j+(sy+.5)/3)/h-M.y)/M.height,M.text);
      if(cover)paint(i,j,ink,cover/9);}}
  shellCache[key]={data,w,h};return shellCache[key];
}
// Optional, for a one-colour jacket (a spec without a yoke): the shell colour all over, with seams drawn as fine shaded
// lines (`spec.lines`) and reflective prints (`spec.prints`). Lines and prints are given as seen straight on from the
// front or the back, in outfit units (x across, y up), and mirrored to both sides when `mirror` is set.
const rowRadius=(rows,y)=>{for(let k=0;k<rows.length-1;k++)if(y<=rows[k][0]&&y>=rows[k+1][0]){const t=(rows[k][0]-y)/(rows[k][0]-rows[k+1][0]);return rows[k][1]+(rows[k+1][1]-rows[k][1])*t;}return y>rows[0][0]?rows[0][1]:rows.at(-1)[1];};
const segDist=(x,y,[ax,ay],[bx,by])=>{const vx=bx-ax,vy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy||1)));return Math.hypot(x-ax-vx*t,y-ay-vy*t);};
// Printed lettering at the doll's scale: plain block capitals on a 5 × 7 grid, one row per string, top row first.
// A generic font, not the brand's own typeface. Characters without a pattern are left as spaces.
const BLOCK_FONT={
  A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],
  C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'],G:['01111','10000','10000','10011','10001','10001','01111'],
  I:['01110','00100','00100','00100','00100','00100','01110'],L:['10000','10000','10000','10000','10000','10000','11111'],
  N:['10001','11001','11001','10101','10011','10011','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],
  R:['11110','10001','10001','11110','10100','10010','10001'],U:['10001','10001','10001','10001','10001','10001','01110'],
  S:['01111','10000','10000','01110','00001','00001','11110'],V:['10001','10001','10001','10001','10001','01010','00100'],
  "'":['00100','00100','01000','00000','00000','00000','00000'],
};
// Whether the point (u along the text, 0–1; v across it, 0 at the letters' foot and 1 at their top) is inked.
function letterInk(u,v,text){
  const g=Math.floor(u*text.length);if(g<0||g>=text.length)return 0;const rows=BLOCK_FONT[text[g].toUpperCase()];if(!rows)return 0;
  const f=(u*text.length-g-.12)/.76,t=1-v;if(f<0||f>=1||t<0||t>=1)return 0;
  return rows[Math.floor(t*7)][Math.floor(f*5)]==='1'?1:0;
}
function plainBodyData(spec,key){
  const w=1024,h=512,data=new Uint8Array(w*h*4),C=spec.colours,shellC=rgb(C.shell),ink=C.print?rgb(C.print):null,inkDark=C.printShade?rgb(C.printShade):ink,rand=random(19),rows=spec.body.rows;
  for(let j=0;j<h;j++){const y=1+j/h,rx=rowRadius(rows,y);for(let i=0;i<w;i++){const a=i/w*Math.PI*2,front=Math.cos(a)>=0,x=Math.sin(a)*rx*(front?1:-1),k=(j*w+i)*4;
    let c=shellC,shade=1;
    for(const L of spec.lines||[]){if(!!L.back===front)continue;for(const sx of L.mirror?[1,-1]:[1]){const pts=L.points.map(([px,py])=>[px*sx,py]);
      for(let n=0;n<pts.length-1;n++){const d=segDist(x,y,pts[n],pts[n+1]);if(d<L.width)shade=Math.min(shade,L.shade);
        // A flap's soft shadow just below its edge.
        else if(L.shadow&&d<L.shadow&&y<Math.min(pts[n][1],pts[n+1][1])+.0005)shade=Math.min(shade,1-(1-L.shade)*(1-d/L.shadow)*.6);}}}
    // Optional (`logo`): a small tonal trefoil, three leaves fanning up from a flat base and cut by two bars, embossed on
    // her left chest (+x) in a shade of the shell.
    const G=spec.logo;
    if(G&&front){const u=(x-G.x)/G.size,v=(y-G.y)/G.size;
      if(v>0&&v<1&&Math.abs(u)<.6){const leaf=(cx,cy,rx,ry,t)=>{const c=Math.cos(t),s2=Math.sin(t),dx=u-cx,dy=v-cy,px=dx*c+dy*s2,py=-dx*s2+dy*c;return (px/rx)**2+(py/ry)**2<1;};
        const inLeaf=leaf(0,.5,.16,.5,0)||leaf(-.3,.33,.14,.36,.7)||leaf(.3,.33,.14,.36,-.7),cut=Math.abs(v-.2)<.035||Math.abs(v-.36)<.03;
        if(inLeaf&&!cut)shade=Math.min(shade,G.shade??.92);}}
    for(const P of spec.prints||[]){if(!!P.back===front)continue;const lx=x-P.x,ly=y-P.y,inside=P.vertical?Math.abs(lx)<P.height/2&&ly<0&&ly>-P.length:Math.abs(lx)<P.length/2&&ly>0&&ly<P.height;
      if(!inside)continue;const u=P.vertical?-ly/P.length:(lx+P.length/2)/P.length,v=P.vertical?(lx+P.height/2)/P.height:ly/P.height;
      if(letterInk(u,v,P.text)){const t=P.vertical?v:1-v;c=ink.map((q,n)=>q+(inkDark[n]-q)*t*.8);shade=1;}}
    const grain=1+(rand()-.5)*.025;for(let n=0;n<3;n++)data[k+n]=Math.max(0,Math.min(255,c[n]*shade*grain));data[k+3]=255;}}
  shellCache[key]={data,w,h};return shellCache[key];
}
// The sleeves: the yoke colour runs over the shoulder onto the top of the sleeve and ends in a diagonal, higher on the
// outside of the arm than underneath. u runs round the sleeve from the front (drawn for her left arm; her right mirrors it),
// v is the height along the sleeve from -.6 to .1.
function windbreakerSleeveData(spec){
  const key='sleeve'+JSON.stringify([spec.colours,spec.yoke]);if(shellCache[key])return shellCache[key];
  // Without a yoke the sleeve is the shell colour all over.
  const w=512,h=512,data=new Uint8Array(w*h*4),C=spec.colours,Y=spec.yoke||{sleeveOuter:1,sleeveInner:1},blue=rgb(C.shell),ecru=rgb(C.yoke||C.shell),rand=random(23);
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
// Sherpa pile: a cream fleece of small tight curls, kept as a bump map of soft round tufts. Built once and shared.
function sherpaData(){
  if(shellCache.sherpa)return shellCache.sherpa;
  const S=128,rand=random(83),h=new Float32Array(S*S),data=new Uint8Array(S*S*4);
  for(let k=0;k<900;k++){const cx=rand()*S,cy=rand()*S,r=2+rand()*3;
    for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){const d=Math.hypot(dx,dy)/r;if(d<1){const x=(Math.floor(cx)+dx+S)%S,y=(Math.floor(cy)+dy+S)%S;h[y*S+x]=Math.max(h[y*S+x],Math.sqrt(1-d*d));}}}
  for(let i=0;i<S*S;i++){const v=Math.round(255*h[i]);data[i*4]=data[i*4+1]=data[i*4+2]=v;data[i*4+3]=255;}
  return shellCache.sherpa={data,S};
}
function sherpa(colour,repeat=[24,6]){
  const {data,S}=sherpaData(),bump=dataTexture(data,S,S,repeat[0],repeat[1]);bump.colorSpace=T.NoColorSpace;
  return new T.MeshPhysicalMaterial({color:colour,roughness:1,sheen:1,sheenColor:new T.Color(colour).lerp(new T.Color('#ffffff'),.3),sheenRoughness:.8,bumpMap:bump,bumpScale:.02,side:T.DoubleSide});
}
function fabric(map,colour,spec){
  const grain=weave('felt');grain.repeat.set(18,18);
  const m=new T.MeshPhysicalMaterial({map,color:map?'#ffffff':colour,roughness:spec.roughness,sheen:.35,sheenColor:new T.Color('#f2efe6'),sheenRoughness:.6,bumpMap:grain,bumpScale:.0025,side:T.DoubleSide});
  // Optional (`padding.crinkle`): a padded coat's matte, softly crinkled cotton, from the leather's crackle used gently,
  // with less sheen, so it reads as thick cloth rather than a thin, smooth shell.
  const K=spec.padding?.crinkle;
  if(K){const {normal,S}=crackleData(),n=dataTexture(normal,S,S,K.repeat[0],K.repeat[1]);n.colorSpace=T.NoColorSpace;
    Object.assign(m,{normalMap:n,normalScale:new T.Vector2(K.scale,K.scale),sheen:K.sheen??.12});}
  // Optional (`metallic`): a metallic coated nylon, crumpled all over: partly metal (the scene has no environment to
  // reflect, so a full metal reads black), fairly shiny, and crinkled all over (crinkleData), the tile repeated
  // `repeat` round and down.
  const M=spec.metallic;
  if(M){const {normal,S}=crinkleData(M.crinkle),n=dataTexture(normal,S,S,M.repeat[0],M.repeat[1]);n.colorSpace=T.NoColorSpace;
    Object.assign(m,{metalness:M.metalness,roughness:M.roughness,normalMap:n,normalScale:new T.Vector2(1,1),sheen:0,bumpMap:null});}
  return m;
}

// The body of a jacket: a shell() from the collar down to the hem band, its surface eased by `deform(a, y)` (a multiplier on
// the radius) below the collar. Returns tools for placing details on that surface: the point at angle a (0 = centre
// front, the shell's own parameter) and height y, its outward normal, a point lifted off it, and the angle at which a
// given x lies on the front (or the back).
// Options: `fit(y)` scales the whole row (a jacket easing over the layers under it); `open` is how far each front edge
// moves out sideways when the jacket hangs open (see openShift). Details placed by angle move with their panel.
function jacketBody(jacket,rows,mat,collarBase,deform=()=>1,seg=128,{fit=null,open=null}={}){
  const mesh=shell(jacket,rows.map(r=>r.slice()),mat,'jacket-body',seg);mesh.userData.covering=true;
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,n=p.count/(seg+1);
  // The smooth profile (before deforming): rx and rz by height.
  const prof=[];for(let j=0;j<n;j++)prof.push([p.getY(j*(seg+1)),p.getX(j*(seg+1)+seg/4),p.getZ(j*(seg+1))]);
  const radii=y=>{let j=0;while(j<prof.length-2&&prof[j+1][0]>y)j++;const [y0,x0,z0]=prof[j],[y1,x1,z1]=prof[j+1],t=Math.max(0,Math.min(1,(y0-y)/(y0-y1)));return [x0+(x1-x0)*t,z0+(z1-z0)*t];};
  const scale=y=>fit?fit(y):1;
  // `open` may also vary with height (a function of y), as for a coat whose fronts part only above its top button.
  const od=y=>typeof open==='function'?open(y):open;
  for(let j=0;j<n;j++)for(let i=0;i<=seg;i++){const k=j*(seg+1)+i,y=p.getY(k);
    if(!fit&&!open){const a=i/seg*Math.PI*2,g=y<collarBase?deform(a,y):1;p.setX(k,p.getX(k)*g);p.setZ(k,p.getZ(k)*g);}
    else{const [rx,rz]=prof[j].slice(1),a=i/seg*Math.PI*2,g=(y<collarBase?deform(a,y):1)*scale(y);p.setX(k,Math.sin(a)*rx*g+(open?openShift(a,od(y)):0));p.setZ(k,Math.cos(a)*rz*g);}
    uv.setXY(k,i/seg,y-1);}
  p.needsUpdate=true;uv.needsUpdate=true;mesh.geometry.computeVertexNormals();
  const surf=(a,y)=>{const [rx,rz]=radii(y),g=(y<collarBase?deform(a,y):1)*scale(y);return V(Math.sin(a)*rx*g+(open?openShift(a,od(y)):0),y,Math.cos(a)*rz*g);};
  const normal=(a,y)=>{const ta=surf(a+1e-3,y).sub(surf(a-1e-3,y)),ty=surf(a,y+1e-3).sub(surf(a,y-1e-3));return new T.Vector3().crossVectors(ta,ty).normalize();};
  const at=(a,y,off)=>surf(a,y).addScaledVector(normal(a,y),off);
  const angleFor=(x,y,back=false)=>{const a=Math.asin(Math.max(-1,Math.min(1,x/radii(y)[0])));return back?Math.PI-a:a;};
  return {mesh,surf,normal,at,angleFor,radii,scale};
}
// An open front: each front panel slides out sideways by d at its edge (angle 0 for her left front, 2pi for her right),
// less toward the side seam and not at all behind it. The fronts keep their depth, so they hang forward over what is under
// them instead of wrapping round her, and their seams and pockets stay straight.
function openShift(a,d){if(a<0)a+=Math.PI*2;const q=a<=Math.PI?a:Math.PI*2-a,side=a<Math.PI?1:-1;return side*d*Math.max(0,1-q/(Math.PI/2))**1.5;}
// How much a fitted jacket must ease out, by height, to clear the layers already worn under it (`under`: the outfit so
// far). Each visible vertex between `low` and `high` asks for the scale that puts the jacket's own row (`radii`) a `gap`
// outside it. Points the jacket's sleeves cover, and points in an open front, are skipped. The result is spread over
// nearby heights and smoothed, never below 1, so the jacket keeps its own shape where nothing needs room.
function easeOver(under,{low,high,gap,radii,sleeve,openAt=null}){
  const step=.01,bins=new Float32Array(Math.ceil((high-low)/step)+1),p=new T.Vector3(),c=Math.cos(.22),s=Math.sin(.22);
  // The sleeve's radius along the arm, below its rounded cap.
  const sleeveR=ly=>{const r=sleeve.rows;if(ly>r[0][0]-.19||ly<sleeve.cuff[1])return 0;for(let k=0;k<r.length-1;k++)if(ly<=r[k][0]&&ly>=r[k+1][0]){const t=(r[k][0]-ly)/(r[k][0]-r[k+1][0]);return Math.min(r[k][1]+(r[k+1][1]-r[k][1])*t,r[k][2]+(r[k+1][2]-r[k][2])*t);}return Math.min(...sleeve.cuffRadius);};
  under.updateMatrixWorld(true);
  const shown=o=>{for(let q=o;q&&q!==under;q=q.parent)if(!q.visible)return false;return true;};
  under.traverse(o=>{if(!o.isMesh||!shown(o))return;for(let q=o;q&&q!==under;q=q.parent)if(q.name==='shoes'||q.name==='outerwear')return;
    const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(p.y<low||p.y>high)continue;
      const r=Math.hypot(p.x,p.z);if(r<.01)continue;const phi=Math.atan2(p.x,p.z);
      if(openAt&&Math.abs(phi)<openAt(p.y)+.03)continue;
      const side=Math.sign(p.x)||1,dx=p.x-side*.242,dy=p.y-1.815,lx=dx*c+side*dy*s,ly=-side*dx*s+dy*c,sr=sleeveR(ly);if(sr&&Math.hypot(lx,p.z)<sr-.006)continue;
      const [rx,rz]=radii(p.y),R=1/Math.hypot(Math.sin(phi)/rx,Math.cos(phi)/rz),k=Math.floor((p.y-low)/step);
      bins[k]=Math.max(bins[k],(r+gap)/R);}});
  const spread=(src,w,fn)=>src.map((_,k)=>{let v=fn===Math.max?0:0,n=0;for(let d=-w;d<=w;d++){const q=src[Math.max(0,Math.min(src.length-1,k+d))];v=fn===Math.max?Math.max(v,q):v+q;n++;}return fn===Math.max?v:v/n;});
  const eased=spread(spread(bins,4,Math.max),2,null).map(v=>Math.max(1,v));
  return y=>{const t=Math.max(0,Math.min(eased.length-1.001,(y-low)/step)),k=Math.floor(t),f=t-k;return eased[k]*(1-f)+eased[k+1]*f;};
}
// Spreads an easing (see easeOver) over a wider band of heights, `w` either side, never below what it was: a loose body
// eases gradually over a collar or a jumper instead of in a sharp step.
function broaden(fit,low,high,w){
  const step=.005,n=Math.ceil((high-low)/step)+1,src=Array.from({length:n},(_,k)=>fit(low+k*step)),r=Math.round(w/step);
  const wide=src.map((_,k)=>{let v=1;for(let d=-r;d<=r;d++)v=Math.max(v,src[Math.max(0,Math.min(n-1,k+d))]);return v;});
  const soft=wide.map((_,k)=>{let v=0;for(let d=-r;d<=r;d++)v+=wide[Math.max(0,Math.min(n-1,k+d))];return v/(2*r+1);}).map((v,k)=>Math.max(v,src[k]));
  return y=>{const t=Math.max(0,Math.min(n-1.001,(y-low)/step)),k=Math.floor(t),f=t-k;return soft[k]*(1-f)+soft[k+1]*f;};
}
// A centre-front zip strip from y0 to y1, lying on the body, with its teeth drawn by zipData().
function centreZip(jacket,{at,normal},y0,y1,width,colour,name,span=y1-y0){
  const zy=[];for(let k=0;k<=60;k++)zy.push(y0+(y1-y0)*k/60);
  const zp=zy.map(y=>at(0,y,.003)),zn=zy.map(y=>normal(0,y));
  const zipMap=dataTexture(zipData().data,16,16,1,span/.014);zipMap.colorSpace=T.NoColorSpace;
  outward(ribbon(jacket,zp,zn,width,new T.MeshStandardMaterial({color:colour,map:zipMap,metalness:.55,roughness:.45,side:T.DoubleSide}),name),zn[0]);
  return zy;
}

// Optional: a zip covered by a storm placket. A raised strip of the shell from the hem band to the top of the collar,
// edged with topstitching, lying slightly to her left of centre as it overlaps the zip; the collar's front edges carry
// metal snaps.
function coveredZip(jacket,{at,normal,radii},P,B,mat,thread,metal){
  const ys=[];for(let k=0;k<=60;k++)ys.push(B.hem+B.band-.004+(B.collarTop-.004-(B.hem+B.band-.004))*k/60);
  const a=y=>P.offset/radii(y)[0],pts=ys.map(y=>at(a(y),y,.005)),ns=ys.map(y=>normal(a(y),y));
  outward(ribbon(jacket,pts,ns,P.width,mat,'zip-placket'),ns[0]).userData.covering=true;
  for(const s of [-1,1])curve(jacket,ys.filter((_,k)=>k%3===0).map(y=>at(a(y)+s*(P.width/2-.005)/radii(y)[0],y,.0075).toArray()),.0012,thread,'placket-topstitch');
  // Optional (`placket.studs`): metal snaps down the middle of the storm flap.
  for(const y of P.studs||[]){const n=normal(a(y),y),stud=put(jacket,new T.CylinderGeometry(.009,.009,.005,16),metal,'placket-snap');stud.position.copy(at(a(y),y,.008));stud.quaternion.setFromUnitVectors(V(0,1,0),n);}
  // Optional (`placket.roll`): a padded placket, its edges rounded over the padding.
  if(P.roll)for(const s of [-1,1])curve(jacket,ys.filter((_,k)=>k%2===0).map(y=>at(a(y)+s*(P.width/2)/radii(y)[0],y,.005).toArray()),P.roll,mat,'placket-roll');
  for(const [x,y] of P.snaps||[])for(const s of [-1,1]){const q=at(s*x/radii(y)[0],y,.006),n=normal(s*x/radii(y)[0],y);
    const stud=put(jacket,new T.CylinderGeometry(.008,.008,.004,16),metal,'collar-snap');stud.position.copy(q);stud.quaternion.setFromUnitVectors(V(0,1,0),n);}
}
// An open zip: a half along each front edge (angle 0 for her left front, 2pi for her right), moving with its panel.
function zipHalves(jacket,{at,normal},y0,y1,width,colour,name){
  const zipMap=dataTexture(zipData().data,16,16,.5,(y1-y0)/.014);zipMap.colorSpace=T.NoColorSpace;
  const mat=new T.MeshStandardMaterial({color:colour,map:zipMap,metalness:.55,roughness:.45,side:T.DoubleSide}),ys=Array.from({length:41},(_,k)=>y0+(y1-y0)*k/40);
  for(const [edge,inward] of [[1e-4,.02],[Math.PI*2-1e-4,-.02]])outward(ribbon(jacket,ys.map(y=>at(edge+inward*.25,y,.003)),ys.map(y=>normal(edge,y)),width*.6,mat,name),normal(edge,y0));
}
// Parts a ring-shaped shell (the hem band, the collar) at the front with the body's open fronts.
function partRing(mesh,seg,d){const p=mesh.geometry.attributes.position;for(let k=0;k<p.count;k++)p.setX(k,p.getX(k)+openShift((k%(seg+1))/seg*Math.PI*2,d));p.needsUpdate=true;mesh.geometry.computeVertexNormals();return mesh;}
function cordToggle(jacket,{at,normal,angleFor},{x,y,drop=.03},dark,cordMat){
  const a=angleFor(x,y),q=at(a,y,.008),n=normal(a,y);
  curve(jacket,[q.toArray(),at(a,y-drop*.5,.014).toArray(),at(a,y-drop,.012).toArray()],.0028,cordMat,'toggle-cord');
  const t=put(jacket,new T.CylinderGeometry(.007,.006,.02,12),dark,'cord-toggle');t.position.copy(at(a,y-drop,.013));t.lookAt(t.position.clone().add(n));t.rotateX(Math.PI/2);
}
// A printed tape: the name repeated along it in block capitals, reading down the tape, `ink` on `colour`. The texture
// runs across the tape (u) and along it (v); `length` sets how many repeats fit.
const tapeCache={};
function tapeMaterial(K,length){
  const key=JSON.stringify(K);let t=tapeCache[key];
  if(!t){const W=32,H=32*K.text.length+48,data=new Uint8Array(W*H*4),bg=rgb(K.colour),ink=rgb(K.ink);
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){let c=0;for(let s=0;s<4;s++){const u=(j+(s>>1)/2+.25)/(H-48),v=1-((i+(s&1)/2+.25)-6)/(W-12);c+=letterInk(u,v,K.text);}
      const k=(j*W+i)*4;for(let n=0;n<3;n++)data[k+n]=bg[n]+(ink[n]-bg[n])*c/4;data[k+3]=255;}
    t=tapeCache[key]={data,W,H};}
  const map=dataTexture(t.data,t.W,t.H,1,length/(K.width*t.H/t.W));map.colorSpace=T.SRGBColorSpace;
  return new T.MeshStandardMaterial({map,roughness:.8,side:T.DoubleSide});
}
// Optional: worn open (`open`, for jackets whose layering allows it). The fronts slide apart by `spec.open.shift` at their
// edges, the zip parts into two halves, and a lining shows inside. Open, the layers under it are no longer hidden at the
// neck (the shirt's collar points), so the body eases out where they need room, like the leather jacket. Zipped closed,
// nothing here changes.
function makeZipWindbreaker(id,spec,overSkirt,open=false,under=null){
  const jacket=new T.Group();jacket.name='outerwear';jacket.userData.garmentId=id;jacket.userData.open=open;
  const C=spec.colours,B=spec.body,seg=128;
  const bodyMap=windbreakerBodyData(spec),body=fabric(dataTexture(bodyMap.data,bodyMap.w,bodyMap.h),null,spec),plain=fabric(null,C.shell,spec),ecruPlain=fabric(null,C.yoke||C.shell,C.yoke&&spec.metallic?{...spec,metallic:null}:spec);// (a metallic shell's own lining, `colours.yoke`, is plain)
  const thread=solid(C.stitch,.85),white=solid(C.snap,.45),cord=solid(C.cord,.9);
  // Optional: a sherpa-lined hood and collar (`colours.sherpa`) in place of the plain lining colour.
  const pile=C.sherpa?sherpa(C.sherpa):null;
  // Optional (`colours.rib`): a rib-knit hem band and cuffs, as on a bomber, in place of gathered shell fabric.
  const rib=C.rib?new T.MeshStandardMaterial({color:C.rib,roughness:.95,bumpMap:Object.assign(weave('knit'),{}),bumpScale:.012,side:T.DoubleSide}):plain;
  if(C.rib)rib.bumpMap.repeat.set(48,2);
  const metal=new T.MeshStandardMaterial({color:C.zip,metalness:.55,roughness:.42});
  // Boxy body from the stand collar to a gathered elastic hem. Over the skirt the lower body and band sit out over its fullness.
  // Fabric: the body blouses into the elastic band in small gathers, and a few soft creases run across the sides.
  const bandTop=B.hem+B.band,gather0=(a,y)=>{const t=Math.max(0,1-(y-bandTop)/B.gatherHeight);return 1+B.gatherDepth*t*t*Math.cos(a*B.gathers)+.004*Math.sin(3*a+17*y)*Math.sin(a)**2;};
  // Optional (`padding`): a padded body. Soft, uneven puffiness all over, and a few broad folds hanging from the hips to
  // the hem, deeper toward the hem, as a thick coat falls.
  const Pd=spec.padding,drapeTop=Pd?.drapeTop??1.2;
  const gather=Pd?(a,y)=>{const t=Math.max(0,Math.min(1,(drapeTop-y)/(drapeTop-B.hem)));
    return gather0(a,y)*(1+Pd.puff*(Math.sin(5*a+9*y)*Math.sin(3*a-6*y+1.3)+.5*Math.sin(11*a+23*y))+Pd.drape*t*t*Math.sin(Pd.folds*a+.8+2*y));}:gather0;
  // Optional (`zip.bottom`): a half zip, as on a pullover anorak, from the collar down to `bottom`. Shown open, it is
  // unzipped: the fronts part only above the zip's end, widening to the collar.
  const half=spec.zip?.bottom,shift=spec.open?.shift??.09;
  const OD=open?(half?y=>{const t=Math.max(0,Math.min(1,(y-half)/(B.collarBase-half)));return shift*t*t*(3-2*t);}:shift):null,odAt=y=>typeof OD==='function'?OD(y):OD;
  const rows=overSkirt?B.overSkirt:B.rows,own=rowRadii(rows);
  const fit=open&&under?broaden(easeOver(under,{low:B.hem-.01,high:B.collarTop,gap:spec.open?.gap??.012,radii:own,sleeve:spec.sleeve,openAt:y=>Math.atan2(odAt(y),own(y)[1])}),B.hem-.01,B.collarTop,spec.open?.ease??.06):null;
  const {mesh:bodyMesh,surf,normal,at,angleFor,radii}=jacketBody(jacket,rows,body,B.collarBase,gather,seg,{open:OD,fit});
  // Open: the edge on each side, seen from her centre line (for what shows between the fronts), and the lining inside.
  jacket.userData.opening=open?y=>Math.atan2(odAt(y),radii(y)[1]*(fit?fit(y):1)):()=>0;
  if(open){const g=bodyMesh.geometry.clone(),p=g.attributes.position;for(let k=0;k<p.count;k++){p.setX(k,p.getX(k)*.992);p.setZ(k,p.getZ(k)*.992);}
    put(jacket,g,spec.liningFinish==='nylon'?new T.MeshStandardMaterial({color:C.lining,roughness:.45,side:T.BackSide}):C.sherpa?Object.assign(sherpa(C.lining||C.sherpa),{side:T.BackSide}):new T.MeshStandardMaterial({color:C.lining||C.shell,roughness:.95,side:T.BackSide}),'jacket-lining');}
  // (Optional `liningFinish: 'nylon'`: a smooth, slightly shiny lining, such as quilted nylon, even when the hood is fur-lined.)
  // Elastic hem band, gathered narrower than the body, which tucks just inside it.
  const band=overSkirt?B.bandOverSkirt:B.bandRadius;
  // Optional (`bandChannels`): a shirred band, its elastic in several stitched channels, each puffing between the seams.
  const shirred=(top,bottom,r,n)=>[[top+.004,r[0]-.004,r[1]-.004],...Array.from({length:2*n+1},(_,k)=>{const y=top-(top-bottom)*k/(2*n),d=k%2?.005:-.002;return [y,r[0]+d,r[1]+d];}),[bottom,r[0]-.006,r[1]-.006]];
  const bandMesh=shell(jacket,B.bandChannels?shirred(bandTop,B.hem,band,B.bandChannels):[[bandTop+.004,band[0]-.004,band[1]-.004],[bandTop-.006,band[0],band[1]],[B.hem+.008,band[0],band[1]],[B.hem,band[0]-.006,band[1]-.006]],rib,'elastic-hem-band',seg);
  if(open&&!half)partRing(bandMesh,seg,OD);
  ribbed(bandMesh,B.bandPuckers,.014).userData.covering=true;
  // Optional (`padding.hemRoll`): the thick hem shows as a soft roll, with the cream lining just showing inside it. Open,
  // the roll and the lining run round from one front edge to the other, and a roll edges each front.
  if(Pd?.hemRoll){const r=Pd.hemRoll,ring=(y,k,off)=>Array.from({length:97},(_,i)=>{const a=i/96*Math.PI*2;return [Math.sin(a)*(band[0]*k+off)+(open?openShift(a,odAt(B.hem)):0),y,Math.cos(a)*(band[1]*k+off)];});
    curve(jacket,ring(B.hem+r*.6,1,r*.15),r,plain,'hem-roll').userData.covering=true;
    curve(jacket,ring(B.hem-r*.15,1,-r*.6),r*.65,pile||ecruPlain,'hem-lining');
    if(open&&Pd.edgeRoll)for(const edge of [1e-3,Math.PI*2-1e-3])curve(jacket,Array.from({length:41},(_,k)=>{const y=B.hem+r+(B.collarTop-B.hem-r-.01)*k/40;return at(edge,y,-Pd.edgeRoll*.4).toArray();}),Pd.edgeRoll,plain,'front-edge-roll');}
  // Stand collar lined in the hood's ecru, seen from above.
  const collarLining=shell(jacket,[[B.collarTop-.002,B.collarRadius[0]-.004,B.collarRadius[1]-.004],[B.collarBase+.01,B.collarRadius[0]+.004,B.collarRadius[1]+.002]],pile||ecruPlain,'collar-lining',64);
  if(open)partRing(collarLining,64,odAt(B.collarBase));
  // Centre-front coil zip from the hem to the top of the collar, a slider and pull at the top and a stop at the hem.
  // Open: the placket stays on her left front, along its edge, with the zip's halves on the two edges.
  if(spec.placket){coveredZip(jacket,{at,normal,radii},open?{...spec.placket,offset:spec.placket.width/2+.004}:spec.placket,B,plain,thread,metal);
    if(open)zipHalves(jacket,{at,normal},B.hem+.004,B.collarTop-.006,.014,C.zip,'zip-half');}
  else if(open){
    const z0=half??B.hem+.004;
    zipHalves(jacket,{at,normal},z0,B.collarTop-.006,spec.zip.width,C.zip,'coil-zip-half');
    const zy=Array.from({length:61},(_,k)=>z0+(B.collarTop-.006-z0)*k/60);
    for(const s of [-1,1])curve(jacket,zy.filter((_,k)=>k%3===0).map(y=>at(s*spec.zip.stitch/radii(y)[0],y,.0025).toArray()),.0014,thread,'zip-topstitch');
    // The slider is left at the hem, on her right.
    // (A half zip's slider is left at the zip's end, at centre front, where the fronts still meet.)
    const ha=half?0:Math.PI*2-.03,sy=half?half+.012:B.hem+.02,slider=put(jacket,new T.BoxGeometry(.02,.026,.009),metal,'zip-slider');slider.position.copy(at(ha,sy,.008));slider.lookAt(slider.position.clone().add(normal(ha,sy)));
  }
  else{
  const zy=centreZip(jacket,{at,normal},half??B.hem+.004,B.collarTop-.006,spec.zip.width,C.zip,'coil-zip',B.collarTop-(half??B.hem));
  for(const s of [-1,1])curve(jacket,zy.filter((_,k)=>k%3===0).map(y=>at(s*spec.zip.stitch/radii(y)[0],y,.0025).toArray()),.0014,thread,'zip-topstitch');
  const slider=put(jacket,new T.BoxGeometry(.022,.03,.01),metal,'zip-slider');slider.position.copy(at(0,B.collarTop-.03,.008));
  const pull=put(jacket,new T.BoxGeometry(.012,.034,.004),metal,'zip-pull');pull.position.copy(at(0,B.collarTop-.06,.014));
  curve(jacket,[at(-.01,B.collarTop-.075,.016),at(0,B.collarTop-.095,.018),at(.01,B.collarTop-.075,.016)].map(v=>v.toArray()),.004,cord,'zip-pull-cord');
  const stop=put(jacket,new T.BoxGeometry(.024,.016,.008),metal,'zip-stop');stop.position.copy(at(0,half?half+.004:B.hem+.01,.006));
  }
  // Optional cord stoppers: a dark barrel toggle on a short cord loop, at the hem band and at the top of the collar.
  for(const T0 of spec.toggles||[])cordToggle(jacket,{at,normal,angleFor},T0,solid(C.toggle||'#2b2b2d',.6),cord);
  // Welt pockets low on each front: a narrow raised welt edged in topstitching, its opening along the inner edge, closed
  // by two white snaps.
  const P=spec.pockets;
  // Optional (`pockets.style: 'flap'`): a wide flap across each lower front, from x0 to x1 at height `top`, with its
  // lower edge stitched and a metal snap in the middle.
  // (Pockets are optional: a jacket with its pockets hidden in its seams has none here.)
  if(P?.style==='flap')for(const s of [-1,1]){
    const U=16,W=6,rows=[],y1=u=>P.top-P.height-P.point*Math.sin(Math.PI*u);
    const lift=P.lift??.009;
    for(let j=0;j<=W;j++){const r=[];for(let i=0;i<=U;i++){const u=i/U,y=P.top+(y1(u)-P.top)*j/W,x=s*(P.x0+(P.x1-P.x0)*u);r.push(at(angleFor(x,y),y,lift*(.5+.5*j/W)).toArray());}rows.push(r);}
    outward(ringShell(jacket,rows,plain,'pocket-flap'),normal(angleFor(s*(P.x0+P.x1)/2,P.top),P.top));
    curve(jacket,rows[W],.004,plain,'pocket-flap-edge');
    // The flap's shadow on the front just under its edge.
    curve(jacket,Array.from({length:U+1},(_,i)=>{const u=i/U,y=y1(u)-.005;return at(angleFor(s*(P.x0+(P.x1-P.x0)*u),y),y,.002).toArray();}),.0035,solid(C.opening,.95),'pocket-flap-shadow');
    curve(jacket,Array.from({length:U+1},(_,i)=>{const u=i/U,y=y1(u)+.008;return at(angleFor(s*(P.x0+(P.x1-P.x0)*u),y),y,.0105).toArray();}),.0009,thread,'flap-topstitch');
    const my=y1(.5)+.014,ma=angleFor(s*(P.x0+P.x1)/2,my),stud=put(jacket,new T.CylinderGeometry(.008,.008,.004,16),metal,'pocket-snap');stud.position.copy(at(ma,my,.013));stud.quaternion.setFromUnitVectors(V(0,1,0),normal(ma,my));
  }
  else if(P)for(const s of [-1,1]){
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
  if(D)for(const s of [-1,1]){
    const a0=angleFor(s*D.x,D.top),eye=put(jacket,new T.TorusGeometry(.009,.003,6,16),metal,'cord-eyelet');eye.position.copy(at(a0,D.top,.003));eye.lookAt(eye.position.clone().add(normal(a0,D.top)));
    const path=[];for(let k=0;k<=8;k++){const y=D.top-(D.top-D.end)*k/8,x=s*(D.x+D.drift*k/8);path.push(at(angleFor(x,y),y,.009+.006*Math.sin(k/8*Math.PI)).toArray());}
    // Optional (`tape`): a flat woven tape printed with a repeating name along it, in place of a round cord, its ends
    // simply cut.
    if(D.tape){const pts=path.map(p=>V(...p)),ns=pts.map(p=>normal(angleFor(p.x,p.y),p.y));
      outward(ribbon(jacket,pts,ns,D.tape.width,tapeMaterial(D.tape,pts[0].distanceTo(pts.at(-1))),'drawcord-tape',.001),ns[0]);continue;}
    curve(jacket,path,D.radius,cord,'drawcord');
    const tip=(y0,y1,mat,name,r)=>{const x=s*(D.x+D.drift);curve(jacket,[at(angleFor(x,y0),y0,.012).toArray(),at(angleFor(x,y1),y1,.012).toArray()],r,mat,name);};
    // Optional `colours.cordTip`: tips in their own colour instead of the shell's.
    const tipMat=C.cordTip?solid(C.cordTip,.5):plain;
    tip(D.end+.002,D.end-.016,tipMat,'cord-tip',D.radius*1.45);tip(D.end-.016,D.end-.024,cord,'cord-tip-band',D.radius*1.5);tip(D.end-.024,D.end-.04,tipMat,'cord-tip',D.radius*1.45);
  }
  // Hood, worn down: a rounded pouch lying over the back yoke below her hair, with a centre seam and a small label. Its
  // rolled opening edge comes forward round her neck to the zip, beside the stand collar.
  // Optional: a jacket whose hood is stowed in its collar has no hood here.
  const H=spec.hood,grid=[],U=24,W=16;
  // Optional (`colours.hood`): a hood in its own colour (the yoke's, on a colour-blocked anorak) instead of the shell's.
  const hoodCloth=C.hood?fabric(null,C.hood,spec):plain;
  if(H){
  const hoodPoint=(u,v)=>{const yb=H.bottom+H.round*u*u,y=H.top-(H.top-yb)*v,half=H.halfWidth*(1-.25*v*v),a=angleFor(u*half,y,true);
    // Fuller toward the bottom, where the folded hood gathers, with two soft folds running down it.
    const lift=H.lift*Math.max(0,1-u*u)**.7*Math.sin(Math.PI*(.12+.88*v))**.8*(.8+.25*v)*(1-.12*Math.cos(u*Math.PI*2.4)**2)+.005;return at(a,y,lift);};
  for(let j=0;j<=W;j++){const ring=[];for(let i=0;i<=U;i++)ring.push(hoodPoint(-1+2*i/U,j/W).toArray());grid.push(ring);}
  outward(ringShell(jacket,grid,hoodCloth,'hood'),normal(Math.PI,H.top));
  // Rolled edges round the hood's sides and bottom, and its centre seam with the label beside it.
  const rim=[];for(let j=0;j<=W;j++)rim.push(hoodPoint(-1,j/W).toArray());for(let i=1;i<U;i++)rim.push(hoodPoint(-1+2*i/U,1).toArray());for(let j=W;j>=0;j--)rim.push(hoodPoint(1,j/W).toArray());
  curve(jacket,rim,H.edge,hoodCloth,'hood-edge');
  curve(jacket,Array.from({length:W+1},(_,j)=>hoodPoint(0,j/W).clone().addScaledVector(normal(Math.PI,H.top-(H.top-H.bottom)*j/W),.002).toArray()),.0016,thread,'hood-seam');
  // Optional: `hood.label: false` leaves the label off.
  if(H.label!==false){const lp=hoodPoint(.12,.45),label=put(jacket,new T.BoxGeometry(.012,.045,.003),ecruPlain,'hood-label');label.position.copy(lp).addScaledVector(normal(Math.PI,lp.y),.004);label.lookAt(label.position.clone().add(normal(Math.PI,lp.y)));}
  // The hood's opening: blue outside with the ecru lining rolled over its inner edge, from the zip round the back of the neck.
  const opening=(off,lift)=>{const pts=[],g=fit?fit(B.collarBase):1;for(let k=0;k<=24;k++){const a=H.opening.from+(Math.PI*2-2*H.opening.from)*k/24,[rx,rz]=B.collarRadius.map(r=>r*g);
    pts.push([Math.sin(a)*(rx+off)+(open?openShift(a,odAt(B.collarBase)):0),B.collarBase+H.opening.rise*(1-Math.cos(a))/2+lift,Math.cos(a)*(rz+off)]);}return pts;};
  curve(jacket,opening(H.opening.out,0),H.opening.radius,hoodCloth,'hood-opening');
  // Optional `opening.lining`: a thicker lining roll (a sherpa hood shows a deep pile edge round her neck).
  const L=H.opening.lining;
  curve(jacket,opening(H.opening.out-(L?.inset??.01),H.opening.radius*.8),L?.radius??H.opening.radius*.55,pile||ecruPlain,'hood-lining-edge');
  // Optional (`hood.ruff`): a faux-fur ruff round the hood's opening, lying round her neck with the hood down: a deep
  // pile with darker tips standing out from it.
  // With `along: 'rim'`, the ruff runs round the edge of the lowered hood on her back instead: on the doll her large head
  // covers her neck, so a ruff there would never show.
  const R=H.ruff;
  if(R){const lift=(pts,off)=>pts.map(p=>{const q=V(...p);return q.addScaledVector(normal(angleFor(q.x,q.y,true),q.y),off).toArray();});
    const path=R.along==='rim'?lift(rim,R.radius*.5):opening(H.opening.out+R.radius*.3,R.radius*.4),tips=R.along==='rim'?lift(rim,R.radius*1.1):opening(H.opening.out+R.radius*.85,R.radius*.9);
    curve(jacket,path,R.radius,sherpa(R.colour,[30,3]),'hood-ruff');
    if(R.tufts){
      // Long pile: tufts standing out from the ruff at random tilts, most in the pile colour and some dark-tipped, so it
      // reads as fur rather than a smooth roll.
      const rand=random(97),pts=path.map(p=>V(...p)),tuft=new T.SphereGeometry(1,8,6),m=new T.Matrix4(),q=new T.Quaternion(),up=V(0,1,0);
      const groups=[[R.colour,Math.round(R.tufts*.7),.75,'hood-ruff-tufts'],[R.tip,R.tufts-Math.round(R.tufts*.7),1.05,'hood-ruff-tips']];
      for(const [colour,n,reach,name] of groups){const mesh=new T.InstancedMesh(tuft,new T.MeshStandardMaterial({color:colour,roughness:1}),n);mesh.name=name;
        for(let k=0;k<n;k++){const f=rand()*(pts.length-1),i=Math.floor(f),p=pts[i].clone().lerp(pts[Math.min(i+1,pts.length-1)],f-i),out=normal(angleFor(p.x,p.y,true),p.y);
          const dir=out.clone().add(V(rand()-.5,rand()-.3,rand()-.5).multiplyScalar(.9)).normalize();q.setFromUnitVectors(up,dir);
          const len=R.radius*(1.1+.7*rand());m.compose(p.clone().addScaledVector(dir,R.radius*reach),q,V(R.radius*.2,len,R.radius*.2));mesh.setMatrixAt(k,m);}
        jacket.add(mesh);}
    }else curve(jacket,tips,R.radius*.45,sherpa(R.tip,[40,3]),'hood-ruff-tips');}
  }
  // Woven label low on the back, above the band on her right.
  if(spec.backLabel){const ly=B.hem+B.band+.035,la=angleFor(-spec.backLabel.x,ly,true),bl=put(jacket,new T.BoxGeometry(.06,.016,.003),ecruPlain,'back-label');bl.position.copy(at(la,ly,.004));bl.lookAt(bl.position.clone().add(normal(la,ly)));}
  // Sleeves: dropped shoulders and long relaxed sleeves blousing into elastic cuffs.
  const S=spec.sleeve,sleeveMap=windbreakerSleeveData(spec);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.name='jacket-arm';arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,fabric(dataTexture(sleeveMap.data,sleeveMap.w,sleeveMap.h),null,spec),'jacket-sleeve',64);sleeve.userData.covering=true;
    const sp=sleeve.geometry.attributes.position,su=sleeve.geometry.attributes.uv,cuffTop=S.cuff[0];
    // Optional (`padding.sleeveFolds`): soft folds round a padded sleeve, where it bends and bunches above the cuff.
    const sf=Pd?.sleeveFolds||0;
    for(let k=0;k<sp.count;k++){const i=k%65,a=i/64*Math.PI*2,y=sp.getY(k),t=Math.max(0,1-(y-cuffTop)/S.gatherHeight),g=(1+S.gatherDepth*t*t*Math.cos(a*S.gathers))*(1+sf*Math.sin(y*38+1.6*Math.sin(a)+side)*Math.min(1,Math.max(0,(.02-y)/.1)));
      sp.setX(k,sp.getX(k)*g);sp.setZ(k,sp.getZ(k)*g);su.setXY(k,side>0?i/64:1-i/64,(y+.6)/.7);}
    sp.needsUpdate=true;su.needsUpdate=true;if(sf)sleeve.geometry.computeVertexNormals();
    roundSleeveCap(sleeve,side,S.rows[0][0]);
    const cuff=ribbed(shell(arm,S.cuffChannels?shirred(S.cuff[0],S.cuff[1],S.cuffRadius,S.cuffChannels):[[S.cuff[0]+.006,S.cuffRadius[0]-.004,S.cuffRadius[1]-.004],[S.cuff[0]-.006,...S.cuffRadius],[S.cuff[1]+.006,...S.cuffRadius],[S.cuff[1],S.cuffRadius[0]-.006,S.cuffRadius[1]-.006]],rib,'elastic-cuff',64),S.cuffPuckers,.03);
    cuff.userData.covering=cuff.userData.cuff=true;
    // Round rubber badge on the upper left sleeve, just below the yoke colour.
    if(side>0&&S.badge){const r=S.badge.radius,y=S.badge.y;let rx=0;for(let k=0;k<S.rows.length-1;k++)if(y<=S.rows[k][0]&&y>=S.rows[k+1][0]){const t=(S.rows[k][0]-y)/(S.rows[k][0]-S.rows[k+1][0]);rx=S.rows[k][1]+(S.rows[k+1][1]-S.rows[k][1])*t;}
      // A round badge with a rim, or (optional `shape: 'rect'`) a small rectangular rubber patch in the badge colour.
      if(S.badge.shape==='rect'){const b=put(arm,new T.BoxGeometry(.005,S.badge.h,S.badge.w),solid(C.badge||C.snap,.55),'sleeve-badge');b.position.set(rx+.003,y,0);}
      else{oval(arm,[rx+.004,y,0],[.004,r,r],white,'sleeve-badge',24);
      const ring=put(arm,new T.TorusGeometry(r*.72,.0022,6,24),white,'sleeve-badge-rim');ring.position.set(rx+.008,y,0);ring.rotation.y=Math.PI/2;}}
    // Optional (`sleeve.zipPocket`): a utility pocket on her left upper sleeve, a flat patch with a zip down its front edge.
    const Z=S.zipPocket;
    if(side>0&&Z){let rx=0;for(let k=0;k<S.rows.length-1;k++)if(Z.y<=S.rows[k][0]&&Z.y>=S.rows[k+1][0]){const t=(S.rows[k][0]-Z.y)/(S.rows[k][0]-S.rows[k+1][0]);rx=S.rows[k][1]+(S.rows[k+1][1]-S.rows[k][1])*t;}
      const bag=put(arm,new T.BoxGeometry(.008,Z.h,Z.w),plain,'sleeve-pocket');bag.position.set(rx+.003,Z.y,-.006);
      const zip=put(arm,new T.BoxGeometry(.006,Z.h*1.05,.008),metal,'sleeve-pocket-zip');zip.position.set(rx+.006,Z.y,Z.w/2-.002);
      const pull=put(arm,new T.BoxGeometry(.006,.026,.01),metal,'sleeve-pocket-pull');pull.position.set(rx+.01,Z.y-Z.h/2-.006,Z.w/2);}
    jacket.add(arm);
  }
  return jacket;
}

// Crinkled metallic nylon, as a seamless normal map (`K`), built as a height field in three layers:
// - folds: long soft ridges running down the garment (`folds` across the tile, `fold` high), so the light runs in
//   bright and dark streaks, as on nylon that hangs;
// - crumples: small planes (`facets` of them), each tilted its own way (up to `tilt`), their edges rounded off
//   (`soften` pixels), so the surface is crumpled all over like paper smoothed out again;
// - wrinkles: many short, fine creases over the top, mostly running down (`wrinkles` of them, up to `length` pixels long,
//   about `width` wide, `wrinkle` deep).
function crinkleData(K){
  const key='crinkle:'+JSON.stringify(K);if(shellCache[key])return shellCache[key];
  const S=512,rand=random(83),h=new Float32Array(S*S),c=new Float32Array(S*S),wrap=v=>((v%S)+S)%S,sm=t=>t*t*(3-2*t);
  // Folds: two octaves of smooth noise, stretched down the tile; a soft ridge where each crosses its middle.
  const octave=(gx,gy)=>{const g=Array.from({length:gx*gy},()=>rand());return (x,y)=>{const u=x/S*gx,v=y/S*gy,i0=Math.floor(u),j0=Math.floor(v),fu=sm(u-i0),fv=sm(v-j0),G=(i,j)=>g[(j%gy)*gx+(i%gx)];
    return (G(i0,j0)*(1-fu)+G(i0+1,j0)*fu)*(1-fv)+(G(i0,j0+1)*(1-fu)+G(i0+1,j0+1)*fu)*fv;};};
  const f1=octave(K.folds,Math.max(1,Math.round(K.folds/3))),f2=octave(K.folds*2,Math.max(1,Math.round(K.folds/2)));
  const ridge=n=>1-Math.sqrt((2*n-1)**2+.01);
  const cells=Array.from({length:K.facets},()=>{const a=rand()*Math.PI*2,t=K.tilt*(.3+.7*rand());return [rand()*S,rand()*S,Math.cos(a)*t,Math.sin(a)*t];});
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    let best=1e9,q=null,ddx=0,ddy=0;for(const p of cells){let dx=x-p[0],dy=y-p[1];dx-=S*Math.round(dx/S);dy-=S*Math.round(dy/S);const d=dx*dx+dy*dy;if(d<best){best=d;q=p;ddx=dx;ddy=dy;}}
    h[y*S+x]=K.fold*(ridge(f1(x,y))+.45*ridge(f2(x,y)));c[y*S+x]=q[2]*ddx+q[3]*ddy;}
  // A few passes of a box blur, round and down: rounds off the crumples' edges and smooths the wrinkles.
  const t=new Float32Array(S*S),blur=(a,r,passes)=>{for(let pass=0;pass<passes;pass++){
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){let v=0;for(let o=-r;o<=r;o++)v+=a[y*S+wrap(x+o)];t[y*S+x]=v/(2*r+1);}
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){let v=0;for(let o=-r;o<=r;o++)v+=t[wrap(y+o)*S+x];a[y*S+x]=v/(2*r+1);}}};
  blur(c,K.soften,3);for(let i=0;i<S*S;i++){h[i]+=c[i];c[i]=0;}
  for(let n=0;n<K.wrinkles;n++){const cx=rand()*S,cy=rand()*S,a=Math.PI/2+(rand()-.5)*2.2,len=K.length*(.4+.6*rand()),w=K.width*(.7+.6*rand()),bend=(rand()-.5)*.8,amp=K.wrinkle*(rand()<.5?-1:1)*(.5+.5*rand());
    const steps=Math.ceil(len);
    for(let k=0;k<=steps;k++){const t=k/steps-.5,ang=a+bend*t,px=cx+Math.cos(a)*t*len-Math.sin(a)*bend*t*t*len,py=cy+Math.sin(a)*t*len+Math.cos(a)*bend*t*t*len,fade=Math.cos(Math.PI*t);
      for(let o=-Math.ceil(w*1.5);o<=Math.ceil(w*1.5);o++){const qx=Math.round(px-Math.sin(ang)*o),qy=Math.round(py+Math.cos(ang)*o);c[wrap(qy)*S+wrap(qx)]+=amp*fade*Math.exp(-2.5*(o/w)**2)/w;}}}
  blur(c,1,2);for(let i=0;i<S*S;i++)h[i]+=c[i];
  const normal=new Uint8Array(S*S*4),H=(x,y)=>h[wrap(y)*S+wrap(x)];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const nx=(H(x-1,y)-H(x+1,y))/2,ny=(H(x,y-1)-H(x,y+1))/2,l=Math.hypot(nx,ny,1),k=(y*S+x)*4;
    normal[k]=Math.round((nx/l*.5+.5)*255);normal[k+1]=Math.round((ny/l*.5+.5)*255);normal[k+2]=Math.round((1/l*.5+.5)*255);normal[k+3]=255;}
  shellCache[key]={normal,S};return shellCache[key];
}
// Crinkled faux leather: a tileable crackle of small domed cells split by fine creases, kept as a height field. It drives a
// normal map (for both the leather and its glossy coat, so highlights break up along the creases) and a faint colour
// variation. Built once and shared.
function crackleData(){
  if(shellCache.crackle)return shellCache.crackle;
  const S=256,rand=random(61),cells=[],height=new Float32Array(S*S);
  for(let k=0;k<220;k++)cells.push([rand()*S,rand()*S]);
  // Creases are soft valleys between gently rounded cells, not cut grooves.
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){let f1=1e9,f2=1e9;
    for(const [cx,cy] of cells){let dx=Math.abs(x-cx),dy=Math.abs(y-cy);dx=Math.min(dx,S-dx);dy=Math.min(dy,S-dy);const d=dx*dx+dy*dy;if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
    const t=Math.min(1,(Math.sqrt(f2)-Math.sqrt(f1))/5);height[y*S+x]=t*t*(3-2*t);}
  const normal=new Uint8Array(S*S*4),shade=new Uint8Array(S*S*4),h=(x,y)=>height[((y+S)%S)*S+((x+S)%S)];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=(h(x+1,y)-h(x-1,y)),dy=(h(x,y+1)-h(x,y-1)),l=Math.hypot(dx,dy,1),k=(y*S+x)*4;
    normal[k]=Math.round((-dx/l*.5+.5)*255);normal[k+1]=Math.round((-dy/l*.5+.5)*255);normal[k+2]=Math.round((1/l*.5+.5)*255);normal[k+3]=255;
    const v=Math.round(255*(.9+.1*h(x,y)));shade[k]=shade[k+1]=shade[k+2]=v;shade[k+3]=255;}
  shellCache.crackle={normal,shade,S};return shellCache.crackle;
}
function leather(colour,L,repeat){
  const {normal,shade,S}=crackleData(),tex=(data,srgb)=>{const t=dataTexture(data,S,S,repeat[0],repeat[1]);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;return t;};
  const n=tex(normal,false),scale=new T.Vector2(L.crinkle,L.crinkle);
  return new T.MeshPhysicalMaterial({color:colour,map:tex(shade,true),roughness:L.roughness,clearcoat:L.clearcoat,clearcoatRoughness:L.clearcoatRoughness,normalMap:n,normalScale:scale,clearcoatNormalMap:n,clearcoatNormalScale:scale,side:T.DoubleSide});
}

// Radii of a jacket's own rows ([y, rx, rz], top down) at height y, straight between rows.
const rowRadii=rows=>y=>{let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;const a=rows[k],b=rows[k+1],t=Math.max(0,Math.min(1,(a[0]-y)/(a[0]-b[0])));return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];};
const along=(points,y)=>{let k=0;while(k<points.length-2&&points[k+1][0]>y)k++;const a=points[k],b=points[k+1],t=Math.max(0,Math.min(1,(a[0]-y)/(a[0]-b[0])));return a[1]+(b[1]-a[1])*t;};

// Faux-leather zip jacket: point collar on a stand, centre zip, front yoke and panel seams, zip pockets over flap pockets,
// a rib-knit hem band and leather cuffs. Built at its own fitted size on her and eased out only where the layers under it
// need room (`build.fit`), so it stays slim over slim tops. Worn open (fronts hanging apart, the zip in two halves) or
// zipped closed.
function makeLeatherJacket(id,spec,overSkirt,under=null,open=false){
  const jacket=new T.Group();jacket.name='outerwear';jacket.userData.garmentId=id;jacket.userData.open=open;
  const C=spec.colours,B=spec.body,L=spec.leather,S=spec.sleeve,bandTop=B.hem+B.band;
  // Repeats keep the crinkle about the same size on the body, the sleeves and the small pieces.
  const skin=leather(C.leather,L,L.tiles.body),sleeveSkin=leather(C.leather,L,L.tiles.sleeve),trim=leather(C.leather,L,L.tiles.trim),thread=solid(C.stitch,.6);
  const metal=new T.MeshStandardMaterial({color:C.metal,metalness:.85,roughness:.28});
  const knitBump=weave('knit');knitBump.repeat.set(40,2);
  const rib=new T.MeshStandardMaterial({color:C.rib,roughness:.95,bumpMap:knitBump,bumpScale:.01,side:T.DoubleSide});
  // Open, each front edge hangs at x = spec.open.edge(y); the angle it makes depends on how far the jacket has eased out.
  // Open, each front edge hangs out at x = ±D, at the front of her chest. `polar` is that edge seen from her centre line, for
  // what shows between the fronts.
  const own=rowRadii(B.rows),D=spec.open.shift;
  const polar=open?(y,k=1)=>Math.atan2(D,own(y)[1]*k):null;
  const fit=under?easeOver(under,{low:B.hem-.01,high:B.collarTop,gap:spec.fit.gap,radii:own,sleeve:S,openAt:polar}):null;
  // The band's ribs dip about 1% inside its radius, so it keeps a little more room.
  const bandFit=under?easeOver(under,{low:B.hem-.005,high:bandTop+.01,gap:spec.fit.gap+.004,radii:()=>B.bandRadius,sleeve:S,openAt:polar}):null;
  const kb=bandFit?Math.max(...Array.from({length:9},(_,k)=>bandFit(B.hem+(B.band+.005)*k/8))):1;
  jacket.userData.opening=open?y=>polar(y,fit?fit(y):1):()=>0;
  // Leather keeps soft, broad creases rather than gathers; it eases into the rib band above the hem.
  const deform=(a,y)=>{const t=Math.max(0,1-(y-bandTop)/B.gatherHeight);
    return 1+B.gatherDepth*t*t*Math.cos(a*B.gathers)+B.crease*Math.sin(4*a+23*y)*Math.sin(2.6*a-9*y+1);};
  const tools=jacketBody(jacket,B.rows,skin,B.collarBase,deform,128,{fit,open:open?D:null}),{surf,normal,at,angleFor,turn}=tools;
  // Rib-knit hem band, narrower than the body, which eases into it. Open, it parts with the fronts.
  const band=B.bandRadius.map(r=>r*kb),seg=192;
  const bandMesh=shell(jacket,[[bandTop+.004,band[0],band[1]],[bandTop-.006,band[0],band[1]],[B.hem+.006,band[0],band[1]],[B.hem,band[0]-.005,band[1]-.005]],rib,'rib-hem-band',seg);
  // Open, it parts with the fronts: the same sideways shift, so its ends line up with their edges.
  if(open){const bp=bandMesh.geometry.attributes.position;for(let k=0;k<bp.count;k++)bp.setX(k,bp.getX(k)+openShift((k%(seg+1))/seg*Math.PI*2,D));bp.needsUpdate=true;}
  ribbed(bandMesh,B.ribs,.008).userData.covering=true;
  // Lines that follow the surface: seams are a slight ridge with a row of topstitching beside them.
  const line=(pts,off,r,mat,name)=>curve(jacket,pts.map(([a,y])=>at(a,y,off).toArray()),r,mat,name);
  const seam=(pts,name,side=1)=>{line(pts,.002,.0028,trim,name);line(pts.map(([a,y])=>[a,y-.007*side]),.0022,.0011,thread,'topstitch');};
  const across=(x0,x1,y,n=16)=>Array.from({length:n+1},(_,k)=>[x0+(x1-x0)*k/n,y]);
  // A patch lying on the body (pocket, flap or welt) between x0 and x1 on side s, from its top y0 down to y1(u).
  const patch=(s,x0,x1,y0,y1,off,mat,name)=>{const U=14,W=8,rows=[];
    for(let j=0;j<=W;j++){const r=[];for(let i=0;i<=U;i++){const u=i/U,yb=y1(u),y=y0+(yb-y0)*j/W,x=s*(x0+(x1-x0)*u);r.push(at(angleFor(x,y),y,off).toArray());}rows.push(r);}
    const m=outward(ringShell(jacket,rows,mat,name),normal(angleFor(s*(x0+x1)/2,y0),y0));
    const edge=[];for(let i=0;i<=U;i++)edge.push(rows[0][i]);for(let j=1;j<=W;j++)edge.push(rows[j][U]);for(let i=U-1;i>=0;i--)edge.push(rows[W][i]);for(let j=W-1;j>=0;j--)edge.push(rows[j][0]);
    curve(jacket,edge,.0024,mat,name+'-edge');return m;};
  // Front: a yoke seam across the chest and a panel seam down from it to each zip pocket.
  const P=spec.pockets,F=spec.front;
  for(const s of [-1,1]){
    seam(across(.025,F.yokeTo,F.yoke).map(([x,y])=>[angleFor(s*x,y),y]),'yoke-seam');
    seam(Array.from({length:9},(_,k)=>{const y=F.yoke-(F.yoke-P.zip.y-P.zip.height/2)*k/8;return [angleFor(s*F.panelX,y),y];}),'panel-seam');
    // Zip pocket: a leather welt with a short zip across it, its pull at the inner end.
    const zy=P.zip.y,zh=P.zip.height;
    patch(s,P.x0,P.x1,zy+zh/2,()=>zy-zh/2,.004,trim,'zip-pocket-welt');
    const teeth=across(P.x0+.012,P.x1-.012,zy,20).map(([x,y])=>[angleFor(s*x,y),y]);
    const zipMap=dataTexture(zipData().data,16,16,1,(P.x1-P.x0)/.012);zipMap.colorSpace=T.NoColorSpace;
    outward(ribbon(jacket,teeth.map(([a,y])=>at(a,y,.0068)),teeth.map(([a,y])=>normal(a,y)),.009,new T.MeshStandardMaterial({color:C.metal,map:zipMap,metalness:.8,roughness:.32,side:T.DoubleSide}),'pocket-zip'),normal(teeth[0][0],zy));
    const pa=angleFor(s*(P.x0+.014),zy),slider=put(jacket,new T.BoxGeometry(.014,.012,.006),metal,'pocket-zip-slider');slider.position.copy(at(pa,zy,.009));slider.lookAt(slider.position.clone().add(normal(pa,zy)));
    const pull=put(jacket,new T.BoxGeometry(.008,.026,.003),metal,'pocket-zip-pull');pull.position.copy(at(pa,zy-.018,.011));pull.lookAt(pull.position.clone().add(normal(pa,zy-.018)));
    // Flap pocket below: a pocket bag with a box pleat, under a flap with a slightly pointed edge and a silver snap.
    const fl=P.flap;
    patch(s,P.x0,P.x1,fl.top-fl.height+.012,()=>P.bottom,.005,skin,'flap-pocket');
    const mid=(P.x0+P.x1)/2;
    for(const d of [-P.pleat,P.pleat])line(Array.from({length:7},(_,k)=>{const y=fl.top-fl.height-.004-(fl.top-fl.height-.004-P.bottom-.01)*k/6;return [angleFor(s*(mid+d),y),y];}),.0078,.0011,thread,'pleat-stitch');
    patch(s,P.x0-.004,P.x1+.004,fl.top,u=>fl.top-fl.height-fl.point*(1-Math.abs(2*u-1)),.011,trim,'pocket-flap');
    line(across(P.x0+.006,P.x1-.006,fl.top-.008,12).map(([x,y])=>[angleFor(s*x,y),y]),.0145,.0011,thread,'topstitch');
    const sy=fl.top-fl.height-fl.point+.016,sa=angleFor(s*mid,sy),snap=oval(jacket,at(sa,sy,.016).toArray(),[.012,.012,.005],metal,'pocket-snap',20);snap.lookAt(snap.position.clone().add(normal(sa,sy)));
  }
  // Back: a centre seam and two long curved panel seams from the shoulders to the band.
  const K=spec.back;
  seam(Array.from({length:13},(_,k)=>{const y=B.collarBase-.012-(B.collarBase-.012-bandTop-.004)*k/12;return [Math.PI,y];}),'centre-back-seam');
  for(const s of [-1,1]){const c=new T.CatmullRomCurve3(K.panel.map(([x,y])=>V(x,y,0)));seam(c.getPoints(16).map(q=>[angleFor(-s*q.x,q.y,true),q.y]),'back-panel-seam');}
  // Zip. Closed: one centre zip from the band to the top of the stand, its slider and pull just under the collar points.
  // Open: a half on each front edge, with a turned leather facing, and the slider left at the hem on her right.
  const Z=spec.zip,zy0=B.hem+.004,zy1=B.collarTop-.004;
  if(!open){
    centreZip(jacket,tools,zy0,zy1,Z.width,C.metal,'metal-zip');
    const slider=put(jacket,new T.BoxGeometry(.018,.026,.009),metal,'zip-slider');slider.position.copy(at(0,B.collarTop-.03,.008));
    const pull=put(jacket,new T.BoxGeometry(.012,.036,.004),metal,'zip-pull');pull.position.copy(at(0,B.collarTop-.062,.013));
  }else{
    const zipMap=dataTexture(zipData().data,16,16,.5,(zy1-zy0)/.014);zipMap.colorSpace=T.NoColorSpace;
    const zipMat=new T.MeshStandardMaterial({color:C.metal,map:zipMap,metalness:.8,roughness:.32,side:T.DoubleSide});
    const zys=Array.from({length:41},(_,k)=>zy0+(zy1-zy0)*k/40);
    for(const [edge,inward] of [[1e-4,.02],[Math.PI*2-1e-4,-.02]]){
      outward(ribbon(jacket,zys.map(y=>at(edge+inward*.25,y,.003)),zys.map(y=>normal(edge,y)),Z.width*.6,zipMat,'metal-zip-half'),normal(edge,zy0));
      curve(jacket,zys.filter((_,k)=>k%2===0).map(y=>at(edge,y,0).toArray()),.0055,trim,'front-facing');
    }
    const ha=Math.PI*2-.03,slider=put(jacket,new T.BoxGeometry(.018,.024,.009),metal,'zip-slider');slider.position.copy(at(ha,zy0+.016,.008));slider.lookAt(slider.position.clone().add(normal(ha,zy0+.016)));
    const pull=put(jacket,new T.BoxGeometry(.012,.034,.004),metal,'zip-pull');pull.position.copy(at(ha,zy0-.006,.012));pull.lookAt(pull.position.clone().add(normal(ha,zy0)));
  }
  // Point collar: a leaf folded over the stand that lies on her shoulders, its front ends cut to points. It is laid on the
  // body's surface, a little off it, so it opens with the fronts.
  const K2=spec.collar,U=48,W=8,a0=open?K2.gapOpen:K2.gap,foldY=a=>K2.foldFront+(K2.foldBack-K2.foldFront)*(1-Math.cos(a))/2;
  const leaf=(u,v)=>{const af=a0+u*(Math.PI*2-2*a0),ae=a0+K2.spread+u*(Math.PI*2-2*a0-2*K2.spread),a=af+(ae-af)*v,front=Math.max(0,Math.cos(af))**3;
    const drop=K2.dropBack+(K2.dropFront-K2.dropBack)*front,y=foldY(af)-drop*v;return at(a,y,K2.lift*(1-.5*v)+.006);};
  const grid=[];for(let j=0;j<=W;j++){const r=[];for(let i=0;i<=U;i++)r.push(leaf(i/U,j/W).toArray());grid.push(r);}
  outward(ringShell(jacket,grid,trim,'point-collar'),normal(Math.PI,foldY(Math.PI)-.03));
  curve(jacket,Array.from({length:U+1},(_,i)=>leaf(i/U,0).toArray()),.0065,trim,'collar-fold');
  const outline=[...Array.from({length:W+1},(_,j)=>leaf(0,j/W)),...Array.from({length:U-1},(_,i)=>leaf((i+1)/U,1)),...Array.from({length:W+1},(_,j)=>leaf(1,(W-j)/W))];
  curve(jacket,outline.map(q=>q.toArray()),.0035,trim,'collar-edge');
  curve(jacket,Array.from({length:U-3},(_,i)=>leaf((i+2)/U,.82).toArray()),.0011,thread,'collar-topstitch');
  // Set-in sleeves, fitted to her arm (the top's sleeves are hidden inside), softly ruched above leather cuffs that close
  // with a tab.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.name='jacket-arm';arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,sleeveSkin,'jacket-sleeve',64);sleeve.userData.covering=true;
    const sp=sleeve.geometry.attributes.position;
    for(let k=0;k<sp.count;k++){const a=(k%65)/64*Math.PI*2,y=sp.getY(k),t=Math.max(0,Math.min(1,(S.ruche[0]-y)/(S.ruche[0]-S.ruche[1]))),g=1+S.rucheDepth*Math.sin(t*Math.PI)*Math.sin(y*S.rucheFreq+Math.sin(a)*1.4)**2;
      sp.setX(k,sp.getX(k)*g);sp.setZ(k,sp.getZ(k)*g);}
    sp.needsUpdate=true;sleeve.geometry.computeVertexNormals();
    roundSleeveCap(sleeve,side,S.rows[0][0]);
    const [c0,c1]=S.cuff,[cx,cz]=S.cuffRadius;
    const cuff=shell(arm,[[c0+.004,cx-.006,cz-.006],[c0-.004,cx,cz],[c1+.004,cx,cz],[c1,cx-.005,cz-.005]],trim,'leather-cuff',64);cuff.userData.covering=cuff.userData.cuff=true;
    for(const y of [c0-.01,c1+.008])curve(arm,Array.from({length:33},(_,k)=>{const a=k/32*Math.PI*2;return [Math.sin(a)*(cx+.0015),y,Math.cos(a)*(cz+.0015)];}),.001,thread,'cuff-topstitch');
    // The cuff's tab on the back of the wrist, buttoned with a silver press stud.
    const ta=Math.PI*.78,tab=put(arm,new T.BoxGeometry(.05,.03,.006),trim,'cuff-tab');tab.position.set(side*Math.sin(ta)*(cx+.004),(c0+c1)/2,Math.cos(ta)*(cz+.004));tab.rotation.y=side*ta;
    const stud=oval(arm,[side*Math.sin(ta)*(cx+.009),(c0+c1)/2,Math.cos(ta)*(cz+.009)],[.007,.007,.004],metal,'cuff-stud',16);stud.rotation.y=side*ta;
    jacket.add(arm);
  }
  return jacket;
}
// Shared with the outerwear templates in their own files.
export { jacketBody, easeOver, outward, dataTexture, rowRadii, openShift };
