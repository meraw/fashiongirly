// Teddy jacket with a detachable hood and bib (template 'teddy-hood-jacket'): a boxy cropped jacket in curly teddy
// (bouclé faux shearling) with a wide flat collar, dropped shoulders, wide sleeves and a silver two-way zip, all edges
// rolled. Zipped into it, and detachable as one piece, a quilted glossy nylon insert: a hood, worn down on her back with a
// puffy rim round her neck, joined to a bib with its own zip. Built at its own size on her and eased out only where the
// layers under it need room, like the fur jacket. Worn zipped closed (the bib's neck shows above the zip and the hood's
// rim rises behind the collar) or open (the fronts hang apart; with the insert the quilted bib shows between them, zipped,
// and without it whatever is underneath shows). `insert: false` leaves the hood and bib off.
import * as T from 'three';
import { random, solid, put, curve, shell, ringShell, ribbon, roundSleeveCap } from './model.js';
import { jacketBody, easeOver, outward, dataTexture, rowRadii } from './outerwear.js';

const cache={};
// Teddy: tight curls of looped yarn, each a short spiral arc standing out from the backing, the gaps between them in
// shadow. Kept as a height field that drives the bump map and a strong colour variation (a multiplier: dark in the gaps,
// lighter on the curls). Built once and shared.
function curlData(){
  if(cache.curl)return cache.curl;
  const S=256,rand=random(131),h=new Float32Array(S*S);
  for(let k=0;k<1250;k++){const cx=rand()*S,cy=rand()*S,r=3.5+rand()*4,start=rand()*Math.PI*2,sweep=Math.PI*(1.1+rand()*1.5),thick=2+rand()*1.3,top=.6+.4*rand(),turn=rand()<.5?1:-1;
    for(let t=0;t<=sweep;t+=.12){const rr=r*(1-.3*t/sweep),x=cx+Math.cos(start+turn*t)*rr,y=cy+Math.sin(start+turn*t)*rr;
      for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const d=Math.hypot(x-Math.round(x)-dx,y-Math.round(y)-dy);if(d>=thick)continue;
        const i=(((Math.round(y)+dy)%S+S)%S)*S+(((Math.round(x)+dx)%S+S)%S);h[i]=Math.max(h[i],top*Math.sqrt(1-d/thick));}}}
  const colour=new Uint8Array(S*S*4),bump=new Uint8Array(S*S*4);
  for(let i=0;i<S*S;i++){const c=Math.round(255*(.55+.45*h[i])),b=Math.round(255*h[i]);colour[i*4]=colour[i*4+1]=colour[i*4+2]=c;colour[i*4+3]=255;bump[i*4]=bump[i*4+1]=bump[i*4+2]=b;bump[i*4+3]=255;}
  return cache.curl={colour,bump,S};
}
function teddyMaterial(colour,F,repeat){
  const {colour:cd,bump:bd,S}=curlData(),map=dataTexture(cd,S,S,...repeat),bump=dataTexture(bd,S,S,...repeat);bump.colorSpace=T.NoColorSpace;
  return new T.MeshPhysicalMaterial({color:colour,map,roughness:1,sheen:F.sheen,sheenColor:new T.Color(colour).lerp(new T.Color('#ffffff'),F.sheenLight),sheenRoughness:.6,bumpMap:bump,bumpScale:F.bump,side:T.DoubleSide});
}
// Glossy quilted nylon: smooth and shiny, with a soft clear coat.
function nylonMaterial(colour,N){
  return new T.MeshPhysicalMaterial({color:colour,roughness:N.roughness,clearcoat:N.clearcoat,clearcoatRoughness:N.clearcoatRoughness,sheen:.3,sheenColor:new T.Color(colour).lerp(new T.Color('#ffffff'),.5),sheenRoughness:.4,side:T.DoubleSide});
}
// A zip's teeth: a coil drawn across a strip (a lighter rib every few pixels on a darker tape).
function coilData(){
  if(cache.coil)return cache.coil;
  const w=8,h=8,data=new Uint8Array(w*h*4);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4,v=(i>1&&i<6)?(j%4<2?215:120):80;data[k]=data[k+1]=data[k+2]=v;data[k+3]=255;}
  return cache.coil={data,w,h};
}
// Quilting: a padded channel between stitch lines rises in a soft dome and dips to the stitching at its edges.
const quilt=(t,lines)=>{let k=0;while(k<lines.length-2&&lines[k+1]<t)k++;const a=lines[k],b=lines[k+1],f=Math.max(0,Math.min(1,(t-a)/(b-a)));return Math.sin(Math.PI*f)**.55;};

export function makeTeddyJacket(id,spec,overSkirt,under=null,open=false,insert=true){
  const jacket=new T.Group();jacket.name='outerwear';jacket.userData.garmentId=id;jacket.userData.open=open;jacket.userData.insert=insert;
  const C=spec.colours,B=spec.body,S=spec.sleeve,F=spec.teddy,K=spec.collar,I=spec.insert;
  const teddy=teddyMaterial(C.teddy,F,F.tiles.body),sleeveTeddy=teddyMaterial(C.teddy,F,F.tiles.sleeve),trim=teddyMaterial(C.teddy,F,F.tiles.trim);
  const nylon=nylonMaterial(C.nylon,spec.nylon),lining=nylonMaterial(C.lining,spec.nylon),stitch=solid(C.quiltStitch,.7);
  const metal=new T.MeshStandardMaterial({color:C.metal,metalness:.85,roughness:.28});
  // Open, each front edge hangs out at x = ±D. With the insert worn, its bib closes the front, so the jacket eases out over
  // everything under it as if closed; without it, what shows between the fronts needs no room.
  const own=rowRadii(B.rows),D=spec.open.shift,polar=(y,k=1)=>Math.atan2(D,own(y)[1]*k);
  const fit=under?easeOver(under,{low:B.hem-.01,high:B.collarTop,gap:spec.fit.gap,radii:own,sleeve:S,openAt:open&&!insert?polar:null}):null;
  jacket.userData.opening=open?y=>polar(y,fit?fit(y):1):()=>0;
  // The curly pile makes the surface lumpy rather than smooth.
  const deform=(a,y)=>1+B.lump*(Math.sin(7*a+19*y)*Math.sin(5*a-13*y+.7)+.5*Math.sin(13*a+31*y+2));
  const tools=jacketBody(jacket,B.rows,teddy,B.collarBase,deform,128,{fit,open:open?D:null}),{at,normal,angleFor,radii}=tools;
  const line=(pts,off,r,mat,name,parent=jacket)=>curve(parent,pts.map(([a,y])=>at(a,y,off).toArray()),r,mat,name);
  // Rolled teddy edges: round the hem (stopping at the front edges, so it parts with them when open) and down both fronts.
  line(Array.from({length:97},(_,i)=>[.004+(Math.PI*2-.008)*i/96,B.hem+B.roll*.5]),-B.roll*.15,B.roll,trim,'hem-roll');
  const fy=Array.from({length:41},(_,k)=>B.hem+B.roll+(B.collarBase-.004-B.hem-B.roll)*k/40);
  for(const s of [-1,1])line(fy.map(y=>[open?(s>0?1e-3:Math.PI*2-1e-3):s*(spec.zip.width*.5+B.edge*.6)/radii(y)[0],y]),-B.edge*.3,B.edge,trim,'front-edge');
  // The silver two-way zip. Closed: up the centre from the hem to the collar, one slider at the top with its long pull and
  // the other at the hem. Open: a half on each front edge, both sliders left at the hem on her right.
  const Z=spec.zip,zy0=B.hem+.004,zy1=B.collarBase-.006,zipMap=dataTexture(coilData().data,8,8,1,(zy1-zy0)/.01);zipMap.colorSpace=T.NoColorSpace;
  const zipMat=new T.MeshStandardMaterial({color:C.metal,map:zipMap,metalness:.8,roughness:.3,side:T.DoubleSide}),zys=Array.from({length:41},(_,k)=>zy0+(zy1-zy0)*k/40);
  const slider=(a,y,name)=>{const n=normal(a,y),b=put(jacket,new T.BoxGeometry(.016,.022,.008),metal,name);b.position.copy(at(a,y,.007));b.lookAt(b.position.clone().add(n));
    const pull=put(jacket,new T.BoxGeometry(.009,.04,.003),metal,'zip-pull');pull.position.copy(at(a,y-.03,.011));pull.lookAt(pull.position.clone().add(normal(a,y-.03)));};
  if(!open){outward(ribbon(jacket,zys.map(y=>at(0,y,.003)),zys.map(y=>normal(0,y)),Z.width,zipMat,'metal-zip'),normal(0,zy0));slider(0,Z.slider,'zip-slider');slider(0,zy0+.012,'zip-slider');}
  else{for(const [edge,inward] of [[1e-4,.02],[Math.PI*2-1e-4,-.02]])outward(ribbon(jacket,zys.map(y=>at(edge+inward*.25,y,.003)),zys.map(y=>normal(edge,y)),Z.width*.6,zipMat,'metal-zip-half'),normal(edge,zy0));
    slider(Math.PI*2-.03,zy0+.014,'zip-slider');}
  // The wide flat collar: a teddy leaf folded over the stand, lying on her shoulders, its front ends square with rounded
  // corners, with a thick rolled edge. Laid on the body's surface a little off it, so it opens with the fronts.
  const U=48,W=8,a0=open?K.gapOpen:K.gap,foldY=a=>K.foldFront+(K.foldBack-K.foldFront)*(1-Math.cos(a))/2;
  const leaf=(u,v)=>{const af=a0+u*(Math.PI*2-2*a0),ae=a0+K.spread+u*(Math.PI*2-2*a0-2*K.spread),a=af+(ae-af)*v,front=Math.max(0,Math.cos(af))**3;
    const drop=K.dropBack+(K.dropFront-K.dropBack)*front,y=foldY(af)-drop*v;return at(a,y,K.lift*(1-.4*v)+.008);};
  const grid=[];for(let j=0;j<=W;j++){const r=[];for(let i=0;i<=U;i++)r.push(leaf(i/U,j/W).toArray());grid.push(r);}
  outward(ringShell(jacket,grid,trim,'teddy-collar'),normal(Math.PI,foldY(Math.PI)-.03));
  curve(jacket,Array.from({length:U+1},(_,i)=>leaf(i/U,0).toArray()),K.roll,trim,'collar-fold');
  const outline=[...Array.from({length:W+1},(_,j)=>leaf(0,j/W)),...Array.from({length:U-1},(_,i)=>leaf((i+1)/U,1)),...Array.from({length:W+1},(_,j)=>leaf(1,(W-j)/W))];
  curve(jacket,outline.map(q=>q.toArray()),K.roll,trim,'collar-edge');
  // Inside the neck: the olive nylon lining.
  const g=fit?fit(B.collarBase):1,[nx,nz]=own(B.collarTop-.01).map(r=>r*g);
  shell(jacket,[[B.collarTop-.004,nx-.004,nz-.004],[B.collarBase-.03,nx+.004,nz+.002]],lining,'neck-lining',64);
  // Dropped-shoulder sleeves, wide and straight, ending in a rolled teddy edge at the wrist.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.name='jacket-arm';arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,sleeveTeddy,'jacket-sleeve',64);sleeve.userData.covering=true;
    const sp=sleeve.geometry.attributes.position;
    for(let k=0;k<sp.count;k++){const a=(k%65)/64*Math.PI*2,y=sp.getY(k),gg=1+B.lump*Math.sin(5*a+17*y)*Math.sin(3*a-11*y+1.3);sp.setX(k,sp.getX(k)*gg);sp.setZ(k,sp.getZ(k)*gg);}
    sp.needsUpdate=true;sleeve.geometry.computeVertexNormals();
    roundSleeveCap(sleeve,side,S.rows[0][0]);
    const [c0,c1]=S.cuff,[cx,cz]=S.cuffRadius,R=S.cuffRoll;
    const cuff=shell(arm,[[c0+.006,cx-R,cz-R],[c0-.004,cx+R*.2,cz+R*.2],[(c0+c1)/2,cx+R*.5,cz+R*.5],[c1+.008,cx+R*.3,cz+R*.3],[c1,cx-R*1.2,cz-R*1.2]],trim,'teddy-cuff',64);
    cuff.userData.covering=cuff.userData.cuff=true;
    jacket.add(arm);
  }
  if(!insert)return jacket;
  // The detachable insert, in its own group: the bib's neck (and, open, the quilted bib), and the hood worn down.
  const part=new T.Group();part.name='detachable-insert';jacket.add(part);
  const Bib=I.bib,H=I.hood;
  // The bib's neck: a quilted nylon stand inside the jacket's neck, rising above the teddy collar at the front.
  const [sx,sz]=own(B.collarTop-.02).map(r=>r*g);
  shell(part,[[B.collarTop+Bib.neckRise,sx+.004,sz+.003],[B.collarTop,sx+.008,sz+.006],[B.collarBase-.01,sx+.006,sz+.005]],nylon,'bib-neck',64);
  curve(part,Array.from({length:65},(_,k)=>{const a=k/64*Math.PI*2;return [Math.sin(a)*(sx+.007),B.collarTop+Bib.neckRise-.004,Math.cos(a)*(sz+.005)];}),.006,nylon,'bib-neck-edge');
  // The bib's own zip up the centre of its neck, in the nylon's colour.
  const coil=dataTexture(coilData().data,8,8,1,1),coilMat=new T.MeshStandardMaterial({color:C.insertZip,map:coil,roughness:.5,side:T.DoubleSide});coil.colorSpace=T.NoColorSpace;
  if(open){
    // Open: the quilted bib between the fronts, a little inside them, from the neck down to just above the hem, puffed in
    // horizontal channels, with stitch lines between them and its zip up the middle.
    const X=Bib.half,y0=Bib.bottom,y1=B.collarBase,UB=24,WB=90,lines=Bib.lines;
    const bibAt=(x,y,off=0)=>{const [rx,rz]=own(y).map(r=>r*(fit?fit(y):1)),a=Math.asin(Math.max(-1,Math.min(1,x/rx))),k=1-(Bib.inset-off)/rz;return new T.Vector3(Math.sin(a)*rx*k,y,Math.cos(a)*rz*k);};
    const rows=[];for(let j=0;j<=WB;j++){const y=y0+(y1-y0)*j/WB,r=[];for(let i=0;i<=UB;i++){const x=-X+2*X*i/UB,edge=Math.min(1,(X-Math.abs(x))/.02);r.push(bibAt(x,y,Bib.puff*quilt(y,lines)*edge).toArray());}rows.push(r);}
    outward(ringShell(part,rows,nylon,'quilted-bib'),new T.Vector3(0,0,1));
    for(const y of lines.slice(1,-1))curve(part,Array.from({length:17},(_,i)=>bibAt(-X+.004+(2*X-.008)*i/16,y,.0006).toArray()),.0009,stitch,'quilt-stitch');
    curve(part,Array.from({length:UB+1},(_,i)=>bibAt(-X+2*X*i/UB,y0,.002).toArray()),.006,nylon,'bib-hem');
    const bys=Array.from({length:41},(_,k)=>y0+.01+(y1-y0-.01)*k/40);coil.repeat.set(1,(y1-y0)/.008);
    outward(ribbon(part,bys.map(y=>bibAt(0,y,Bib.puff*.7)),bys.map(()=>new T.Vector3(0,0,1)),Bib.zipWidth,coilMat,'bib-zip'),new T.Vector3(0,0,1));
    const top=bibAt(0,y1-.02,Bib.puff+.004),bs=put(part,new T.BoxGeometry(.012,.018,.006),solid(C.insertZip,.4),'bib-zip-slider');bs.position.copy(top);
  }else{
    // Closed: only the top of its zip shows, up the front of the bib's neck.
    coil.repeat.set(1,(Bib.neckRise+.06)/.008);
    const ys=Array.from({length:9},(_,k)=>B.collarBase+(B.collarTop+Bib.neckRise-.006-B.collarBase)*k/8);
    outward(ribbon(part,ys.map(y=>new T.Vector3(0,y,(y>B.collarTop?sz+.009:sz+.008))),ys.map(()=>new T.Vector3(0,0,1)),Bib.zipWidth,coilMat,'bib-zip'),new T.Vector3(0,0,1));
  }
  // The hood, worn down: a quilted pouch lying on her back below her hair, in horizontal channels, with rolled edges and
  // a centre seam; its puffy rim comes round her neck from either side of the bib's zip, rising behind the teddy collar.
  // (Its cord toggles sit under her chin, which her head covers, so they are left off.)
  const UH=24,WH=24,hood=[];
  const hoodPoint=(u,v)=>{const yb=H.bottom+H.round*u*u,y=H.top-(H.top-yb)*v,half=H.halfWidth*(1-.25*v*v),a=angleFor(u*half,y,true);
    const lift=H.lift*Math.max(0,1-u*u)**.7*Math.sin(Math.PI*(.12+.88*v))**.8*(.8+.25*v)*(1-H.quilt*(1-quilt(v,H.lines)))+K.lift+.012;return at(a,y,lift);};
  for(let j=0;j<=WH;j++){const r=[];for(let i=0;i<=UH;i++)r.push(hoodPoint(-1+2*i/UH,j/WH).toArray());hood.push(r);}
  outward(ringShell(part,hood,nylon,'quilted-hood'),normal(Math.PI,H.top));
  const rim=[];for(let j=0;j<=WH;j++)rim.push(hoodPoint(-1,j/WH).toArray());for(let i=1;i<UH;i++)rim.push(hoodPoint(-1+2*i/UH,1).toArray());for(let j=WH;j>=0;j--)rim.push(hoodPoint(1,j/WH).toArray());
  curve(part,rim,H.edge,nylon,'hood-edge');
  for(const v of H.lines.slice(1,-1))curve(part,Array.from({length:17},(_,i)=>hoodPoint(-.9+1.8*i/16,v).clone().addScaledVector(normal(Math.PI,H.top),.001).toArray()),.0012,stitch,'quilt-stitch');
  curve(part,Array.from({length:WH+1},(_,j)=>hoodPoint(0,j/WH).clone().addScaledVector(normal(Math.PI,H.top-(H.top-H.bottom)*j/WH),.002).toArray()),.0016,stitch,'hood-seam');
  // The hood hangs from the bib, which stays zipped when the jacket is open, so its rim does not part with the fronts.
  const O=H.rim,ring=(off,lift)=>{const pts=[];for(let k=0;k<=32;k++){const a=O.from+(Math.PI*2-2*O.from)*k/32;
    pts.push([Math.sin(a)*(sx+off),B.collarTop+O.rise*(1-Math.cos(a))/2+lift,Math.cos(a)*(sz+off)]);}return pts;};
  curve(part,ring(O.out,0),O.radius,nylon,'hood-rim');
  curve(part,ring(O.out-O.radius*.5,O.radius*.7),O.radius*.7,nylon,'hood-rim-inner');
  return jacket;
}
