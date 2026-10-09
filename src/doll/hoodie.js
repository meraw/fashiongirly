// Cropped hoodie: a boxy, cropped sweatshirt with dropped shoulders, a ribbed hem band and long ribbed cuffs, both tipped
// in a contrast colour, a hood worn down with a striped lining, thick braided drawcords and an embroidered logo with a
// woven patch on her left chest. The logo and patch are drawn here in code at her scale (a suggestion of the brand's
// marks, not a copy).
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Under a jacket the hood and cords would push through it, so the hoodie also carries a plain narrow neckband: a jacket
// wears that instead (userData.underJacket, read by makeOuterwear, as for the chenille jumper's collars).
import * as T from 'three';
import { random, solid, oval, curve, shell, ringShell, ribbed, roundSleeveCap, surfaceProbe, easeOverHand } from './model.js';
import { grid } from './polo.js';

const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const pixels=new Map();
function dataTexture(data,w,h,srgb=true,repeat=[1,1]){
  const t=new T.DataTexture(data,w,h,T.RGBAFormat);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;
}
// Fleece (brushed French terry): a fine, soft knit face, as a height map with a little grain.
function fleeceData(){
  if(pixels.has('fleece'))return pixels.get('fleece');
  const w=64,h=64,rand=random(71),data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=150+40*Math.sin(x/w*Math.PI*16)*Math.cos(y/h*Math.PI*8)+(rand()-.5)*60,i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,v));data[i+3]=255;}
  const out={data,w,h};pixels.set('fleece',out);return out;
}
// A braided cord: chevrons running along it.
function braidData(){
  if(pixels.has('braid'))return pixels.get('braid');
  const w=32,h=16,data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=Math.round(128+110*Math.cos(((x/w*4+Math.abs(y/h-.5)*2)%1)*Math.PI*2)),i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
  const out={data,w,h};pixels.set('braid',out);return out;
}
// The hood's lining: pale mint with fine dark pinstripes in pairs.
function liningData(base,stripe){
  const key='lining'+base+stripe;if(pixels.has(key))return pixels.get(key);
  const w=64,h=8,b=hex(base),s=hex(stripe),data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=x%32,on=p===4||p===7,i=(y*w+x)*4;for(let k=0;k<3;k++)data[i+k]=on?Math.round(b[k]*.35+s[k]*.65):b[k];data[i+3]=255;}
  const out={data,w,h};pixels.set(key,out);return out;
}
// A small pixel canvas for the embroidery and the patch: discs stamped along strokes, and filled shapes.
function canvas(w,h,fill=null){
  const data=new Uint8Array(w*h*4);if(fill){const c=hex(fill);for(let i=0;i<w*h;i++){data[i*4]=c[0];data[i*4+1]=c[1];data[i*4+2]=c[2];data[i*4+3]=255;}}
  const paint=(x,y,c,a=1)=>{if(x<0||y<0||x>=w||y>=h)return;const i=(y*w+x)*4,o=data[i+3]/255,na=Math.max(o,a);for(let k=0;k<3;k++)data[i+k]=Math.round((data[i+k]*o*(1-a)+c[k]*a)/(na||1));data[i+3]=Math.round(na*255);};
  const stroke=(pts,r,colour)=>{const c=hex(colour);for(let k=0;k<pts.length-1;k++){const [x0,y0]=pts[k],[x1,y1]=pts[k+1],n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2));
    for(let s=0;s<=n;s++){const x=x0+(x1-x0)*s/n,y=y0+(y1-y0)*s/n;for(let dy=-r-1;dy<=r+1;dy++)for(let dx=-r-1;dx<=r+1;dx++){const d=Math.hypot(dx,dy);if(d<=r+.5)paint(Math.round(x+dx),Math.round(y+dy),c,Math.min(1,r+.5-d+.5));}}}};
  const fillShape=(inside,colour)=>{const c=hex(colour);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(inside(x+.5,y+.5))paint(x,y,c,1);};
  return {data,w,h,stroke,fillShape};
}
const arc=(cx,cy,rx,ry,a0,a1,n=24)=>Array.from({length:n+1},(_,k)=>{const a=a0+(a1-a0)*k/n;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)];});
// The embroidered mark: a trefoil of three leaves cut by three bars, above a lowercase word in a round, heavy letterform.
function trefoilData(colour){
  const key='trefoil'+colour;if(pixels.has(key))return pixels.get(key);
  const C=canvas(256,256);
  const leaf=(cx,cy,along,across,turn)=>(x,y)=>{const dx=x-cx,dy=y-cy,c=Math.cos(turn),s=Math.sin(turn),u=dx*c+dy*s,v=-dx*s+dy*c;return (u/along)**2+(v/across)**2<=1;};
  // Three separate leaves: the middle one upright, the side ones leaning out, each kept clear of the middle one by a
  // narrow gap; the bars are three horizontal gaps cut through the lower part.
  const mid=leaf(128,168,62,22,Math.PI/2),midGap=leaf(128,168,68,28,Math.PI/2),sides=[leaf(84,140,52,19,Math.PI/2+1.0),leaf(172,140,52,19,Math.PI/2-1.0)];
  C.fillShape((x,y)=>(mid(x,y)||(sides.some(f=>f(x,y))&&!midGap(x,y)))&&y>100&&![[112,121],[130,139],[148,157]].some(([a,b])=>y>a&&y<b),colour);
  // The word, letter by letter, as thick strokes on a baseline.
  const r=6,base=34,xh=30,asc=58;let x=36;
  const bowl=cx=>C.stroke(arc(cx,base+xh/2,13,xh/2-1,0,Math.PI*2,28),r,colour);
  const letters={a:()=>{bowl(x+13);C.stroke([[x+28,base+xh],[x+28,base]],r,colour);x+=40;},d:()=>{bowl(x+13);C.stroke([[x+28,base+asc],[x+28,base]],r,colour);x+=40;},
    i:()=>{C.stroke([[x+4,base+xh],[x+4,base]],r,colour);C.stroke([[x+4,base+xh+14],[x+4,base+xh+15]],r,colour);x+=18;},
    s:()=>{C.stroke([[x+24,base+xh-5],...arc(x+13,base+xh*.73,11,xh*.25,0,Math.PI,10).slice(1),...arc(x+13,base+xh*.27,11,xh*.25,Math.PI/2,-Math.PI/2,12),[x,base+5]].map(([px,py])=>[px,py]),r-1,colour);x+=34;}};
  for(const ch of 'adidas')letters[ch]();
  pixels.set(key,C);return C;
}
// The woven patch: a white label with a green script word swept by an underline, a line of small grey type and a small
// round mark at the right.
function patchData(ground,ink,grey){
  const key='patch'+ground+ink;if(pixels.has(key))return pixels.get(key);
  const C=canvas(256,128,ground);
  const script=[[34,70],[40,96],[48,70],[42,66],[54,64],[58,82],[64,70],[68,84],[74,70],[78,90],[78,68],[84,82],[90,70],[96,84],[102,70],[106,92],[108,68],[114,82],[118,70],[124,82],[128,70],[134,84],[140,70],[148,80],[144,66]];
  C.stroke(script,3,ink);
  C.stroke(arc(110,74,96,22,Math.PI*1.08,Math.PI*1.92,30),3,ink);
  for(let k=0;k<12;k++)C.stroke([[48+k*11,30],[54+k*11,30]],1,grey);
  C.stroke(arc(214,72,18,18,0,Math.PI*2,30),1,grey);C.stroke([[200,60],[228,84]],1,grey);C.stroke([[200,84],[228,60]],1,grey);
  pixels.set(key,C);return C;
}
// A point on the body (an elliptical tube from its rows) at angle a (0 = centre front, toward her left) and height y,
// lifted off it along its outward direction.
function bodyAt(rows){
  const radii=y=>{let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;const t=Math.max(0,Math.min(1,(rows[k][0]-y)/(rows[k][0]-rows[k+1][0])));return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];};
  return (a,y,lift=0)=>{const [rx,rz]=radii(y),x=Math.sin(a)*rx,z=Math.cos(a)*rz,n=new T.Vector2(x/(rx*rx),z/(rz*rz)).normalize();return new T.Vector3(x+n.x*lift,y,z+n.y*lift);};
}
export function makeHoodie(id,spec){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,H=spec.hood,D=spec.cords,C=spec.colours,hem=B.hem,band=B.band,neck=B.rows[0][0];
  const fleece=(u,v)=>new T.MeshPhysicalMaterial({color:C.fleece,roughness:.93,sheen:.25,sheenColor:new T.Color(C.sheen),sheenRoughness:.8,bumpMap:dataTexture(fleeceData().data,64,64,false,[u,v]),bumpScale:.0025,side:T.DoubleSide});
  const rib=(u,v)=>{const m=fleece(u,v);m.bumpScale=.004;return m;},tipping=solid(C.tipping,.8);
  const body=shell(top,B.rows,fleece(40,30),'hoodie-body',128);
  // The rib band, a little narrower than the body, which blouses over it; the contrast tipping along its lower edge.
  const [brx,brz]=B.bandRadius;
  ribbed(shell(top,[[hem+band+.01,brx,brz],[hem+band/2,brx,brz],[hem+B.tip,brx,brz]],rib(60,6),'ribbed-hem-band',B.ribs*8),B.ribs,.006);
  ribbed(shell(top,[[hem+B.tip+.001,brx+.0005,brz+.0005],[hem,brx+.0005,brz+.0005]],tipping,'hem-tipping',B.ribs*8),B.ribs,.006);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    // Relaxed sleeves from dropped shoulders, blousing over long ribbed cuffs tipped in the contrast colour at the wrist.
    const yt=S.rows[0][0],sleeve=shell(arm,S.rows,fleece(14,20),'knit-jumper-sleeve',96);roundSleeveCap(sleeve,side,yt);
    const cuffTop=S.cuff[0][0],cuffEnd=S.cuff.at(-1)[0],[,crx,crz]=S.cuff.at(-1);
    easeOverHand(ribbed(shell(arm,[...S.cuff.slice(0,-1),[cuffEnd+S.tip,crx,crz]],rib(14,4),'ribbed-cuff',S.cuffRibs*8),S.cuffRibs,.03),side);
    easeOverHand(ribbed(shell(arm,[[cuffEnd+S.tip+.001,crx+.001,crz+.001],[cuffEnd,crx+.001,crz+.001]],tipping,'cuff-tipping',S.cuffRibs*8),S.cuffRibs,.03),side,.008);
    top.add(arm);
  }
  const at=bodyAt(B.rows),black=fleece(8,8);
  // The hood, worn down (userData.underJacket false: put away under a jacket).
  const hood=new T.Group();hood.name='hood-down';hood.userData.underJacket=false;top.add(hood);
  // A rounded pouch lying over her upper back, fuller toward the bottom, where the folded hood gathers.
  const U=24,W=16,pouch=(u,v)=>{const yb=H.bottom+H.round*u*u,y=H.top-(H.top-yb)*v,half=H.halfWidth*(1-.25*v*v),[rx]=[at(Math.PI/2,y).x];
    const a=Math.PI+Math.asin(Math.max(-.98,Math.min(.98,u*half/rx)));
    return at(a,y,H.lift*Math.max(0,1-u*u)**.7*Math.sin(Math.PI*(.12+.88*v))**.8*(.8+.25*v)+.006);};
  const rings=[];for(let j=0;j<=W;j++){const ring=[];for(let i=0;i<=U;i++)ring.push(pouch(-1+2*i/U,j/W).toArray());rings.push(ring);}
  ringShell(hood,rings,black,'hood');
  const rim=[];for(let j=0;j<=W;j++)rim.push(pouch(-1,j/W).toArray());for(let i=1;i<U;i++)rim.push(pouch(-1+2*i/U,1).toArray());for(let j=W;j>=0;j--)rim.push(pouch(1,j/W).toArray());
  curve(hood,rim,H.edge,black,'hood-edge');
  curve(hood,Array.from({length:W+1},(_,j)=>pouch(0,j/W).toArray()).map(([x,y,z])=>[x,y,z-.002]),.0016,black,'hood-seam');
  // Its opening round her neck: the hood's sides cross at the centre front below her chin and rise round the back of
  // her neck, with the striped lining showing inside the rolled edge.
  const O=H.opening,opening=(out,lift,k)=>{const a=O.from+(Math.PI*2-2*O.from)*k;return at(a,neck+O.rise*(1-Math.cos(a))/2+lift-O.dip*Math.max(0,Math.cos(a))**4,out).toArray();};
  const ring=(out,lift)=>Array.from({length:49},(_,k)=>opening(out,lift,k/48));
  const lining=new T.MeshStandardMaterial({map:dataTexture(liningData(C.lining,C.stripe).data,64,8,true,[6,1]),roughness:.8,side:T.DoubleSide});
  ringShell(hood,[ring(O.out,O.band),ring(O.out-.004,0)],lining,'hood-lining');
  curve(hood,ring(O.out+.003,O.band),O.radius,black,'hood-opening');
  curve(hood,ring(O.out-.003,.002),O.radius*.7,lining,'hood-lining-edge');
  // Thick braided drawcords from the opening either side of the centre, hanging down her chest, each knotted near its
  // frayed end.
  const braid=new T.MeshStandardMaterial({color:C.cord,roughness:.85,bumpMap:dataTexture(braidData().data,32,16,false,[30,1]),bumpScale:.004});
  const probe=(()=>{top.updateMatrixWorld(true);const p=surfaceProbe(top,['hoodie-body']);return (x,y)=>p(x,y,true);})();
  for(const s of [-1,1]){
    const path=[];for(let k=0;k<=10;k++){const t=k/10,y=D.top-(D.top-D.knot)*t,x=s*(D.x+D.drift*t),hit=probe(x,y);if(hit)path.push(hit.point.clone().addScaledVector(hit.normal,D.radius+.004+.004*Math.sin(t*Math.PI)).toArray());}
    curve(hood,path,D.radius,braid,'drawcord');
    const end=new T.Vector3(...path.at(-1));oval(hood,end.toArray(),[D.radius*1.9,D.radius*1.5,D.radius*1.7],braid,'cord-knot',16);
    // The frayed ends: short strands spreading out below the knot.
    const rand=random(s>0?5:9);for(let k=0;k<7;k++){const dx=(rand()-.5)*D.radius*2.4,dz=(rand()-.5)*D.radius;
      curve(hood,[[end.x+dx*.3,end.y-D.radius,end.z+dz*.3],[end.x+dx,end.y-D.tassel*(.7+.3*rand()),end.z+dz]],.0016,braid,'cord-tassel');}
  }
  // Under a jacket: a plain ribbed neckband the width of the other tops' necks (userData.underJacket true).
  const neckband=new T.Group();neckband.name='jacket-neckband';neckband.userData.underJacket=true;neckband.visible=false;top.add(neckband);
  ribbed(shell(neckband,[[neck+.035,.108,.1],[neck+.012,.111,.102],[neck-.005,.116,.106]],rib(30,2),'crew-neckband',256),32,.012);
  // The embroidered mark and the woven patch on her left chest, laid on the knit.
  top.updateMatrixWorld(true);const onBody=surfaceProbe(top,['hoodie-body']);
  const decal=(name,cx,cy,w,h,map,lift)=>grid(top,16,12,(u,v)=>{const hit=onBody(cx+(u-.5)*w/1.06,cy+(v-.5)*h/.76,true);return hit?hit.point.clone().addScaledVector(hit.normal,lift).toArray():[cx,cy,.25];},
    new T.MeshStandardMaterial({map,transparent:!!map.userData.alpha,alphaTest:map.userData.alpha?.4:0,roughness:.7,side:T.DoubleSide}),name);
  const mark=trefoilData(C.embroidery),markMap=dataTexture(mark.data,mark.w,mark.h);markMap.userData.alpha=true;markMap.wrapS=markMap.wrapT=T.ClampToEdgeWrapping;
  decal('embroidered-logo',...spec.logo.at,spec.logo.size,spec.logo.size,markMap,.0025);
  const P=patchData(C.patch,C.patchInk,C.patchGrey),patchMap=dataTexture(P.data,P.w,P.h);patchMap.wrapS=patchMap.wrapT=T.ClampToEdgeWrapping;
  decal('woven-patch',...spec.patch.at,...spec.patch.size,patchMap,.003);
  return top;
}
