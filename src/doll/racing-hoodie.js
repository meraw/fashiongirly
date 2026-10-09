// Colour-block racing hoodie: a boxy cropped fleece hoodie pieced in bands (a white yoke between raglan panels, then
// bands across the chest that run on round the sleeves), a ribbed hem band and long ribbed cuffs, a hood worn down,
// flat drawcords from metal eyelets, and appliqué letters, embroidery and patches. The letters, embroidery and patches
// are drawn here in code at her scale (a suggestion of the brand's marks, not a copy).
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Under a jacket the hood and cords would push through it, so the hoodie also carries a plain narrow neckband: a jacket
// wears that instead (userData.underJacket, read by makeOuterwear, as for the cropped hoodie).
import * as T from 'three';
import { random, oval, curve, shell, ringShell, ribbed, roundSleeveCap, surfaceProbe, easeOverHand } from './model.js';
import { grid } from './polo.js';
import { dataTexture, fleeceData, canvas, arc, bodyAt } from './hoodie.js';

const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const pixels=new Map(),cached=(key,draw)=>{if(!pixels.has(key))pixels.set(key,draw());return pixels.get(key);};
// The colour blocks, by height (and, above the bands, by the angle from the centre front or back: the white yoke between
// the raglan panels), as a texture over the body: u round from the centre front toward her left, v from the hem up.
// A slightly darker line marks each seam between two colours.
function blocksData(B,C){
  return cached('blocks'+JSON.stringify(B.blocks)+JSON.stringify(C),()=>{
    const w=1024,h=512,data=new Uint8Array(w*h*4),K=B.blocks,neck=B.rows[0][0],span=neck-B.hem,cols=Object.fromEntries(['fleece','red','black','blue'].map(k=>[k,hex(C[k])]));
    const at=(x,y)=>{const a=((x+.5)/w)*Math.PI*2,y0=B.hem+(y+.5)/h*span,f=Math.abs(Math.atan2(Math.sin(a),Math.cos(a))),fold=Math.min(f,Math.PI-f);
      if(y0>=K.red){const t=Math.max(0,Math.min(1,(neck-y0)/(neck-K.red)));return fold<K.yoke[0]+(K.yoke[1]-K.yoke[0])*t?'fleece':'red';}
      return y0>=K.black?'red':y0>=K.blue?'black':y0>=K.blueEnd?'blue':'fleece';};
    const names=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)names.push(at(x,y));
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=names[y*w+x],i=(y*w+x)*4,c=cols[n];
      const seam=(y>0&&names[(y-1)*w+x]!==n)||(y<h-1&&names[(y+1)*w+x]!==n)||names[y*w+(x+1)%w]!==n||names[y*w+(x+w-1)%w]!==n;
      for(let k=0;k<3;k++)data[i+k]=Math.round(c[k]*(seam?.82:1));data[i+3]=255;}
    return {data,w,h};});
}
// The sleeve's bands by height down the sleeve (v from the cuff up to the shoulder): red at the top (the raglan
// panel), then black, blue and white.
function sleeveData(S,C){
  return cached('sleeve'+JSON.stringify(S.bands)+JSON.stringify(C),()=>{
    const w=4,h=256,data=new Uint8Array(w*h*4),yt=S.rows[0][0],yb=S.rows.at(-1)[0],[r,k,b]=S.bands;
    for(let y=0;y<h;y++){const y0=yb+(y+.5)/h*(yt-yb),c=hex(y0>=r?C.red:y0>=k?C.black:y0>=b?C.blue:C.fleece),edge=[r,k,b].some(e=>Math.abs(y0-e)<(yt-yb)/h*1.2);
      for(let x=0;x<w;x++){const i=(y*w+x)*4;for(let q=0;q<3;q++)data[i+q]=Math.round(c[q]*(edge?.82:1));data[i+3]=255;}}
    return {data,w,h};});
}
// Letters as strokes in a unit box (y up), for the appliqué letters and the patches.
const GLYPHS={
  U:[[[0,1],[0,.32],...arc(.35,.32,.35,.32,Math.PI,Math.PI*2,14).slice(1),[.7,1]]],
  S:[[[.66,.86],[.55,.97],[.3,.98],[.08,.88],[.03,.72],[.12,.58],[.35,.5],[.58,.42],[.68,.28],[.64,.1],[.42,.01],[.18,.02],[.02,.14]]],
  R:[[[0,0],[0,1],[.45,1],[.62,.93],[.68,.78],[.62,.62],[.45,.55],[0,.55]],[[.32,.55],[.7,0]]],
  L:[[[0,1],[0,0],[.65,0]]],
  '1':[[[.1,.78],[.35,1],[.35,0]],[[.08,0],[.62,0]]],
  '6':[[[.55,.95],[.3,.9],[.1,.65],[.05,.35],[.15,.08],[.35,0],[.55,.1],[.6,.3],[.5,.48],[.3,.52],[.1,.4]]],
  '7':[[[0,1],[.6,1],[.2,0]]],
  '.':[[[.1,0],[.1,.03]]],
};
const ADVANCE={'.':.35,'1':.75};
function text(Cv,str,x,y,size,r,colour,slant=0){
  let pen=x;for(const ch of str){for(const line of GLYPHS[ch]??[])Cv.stroke(line.map(([gx,gy])=>[pen+gx*size+slant*gy*size,y+gy*size]),r,colour);pen+=(ADVANCE[ch]??.86)*size;}
}
// A joined handwriting: loops of varying height along a line, for embroidered script.
function script(Cv,x,y,len,h,count,r,colour,seed){
  const rand=random(seed),pts=[];let tall=0;
  for(let k=0;k<=count*8;k++){const t=k/(count*8),p=k%8;if(p===0)tall=rand()<.3?1.8:1;
    pts.push([x+len*t+Math.sin(t*count*Math.PI*2)*len/count*.18,y+h*tall*(.5-.5*Math.cos(t*count*Math.PI*2))]);}
  Cv.stroke(pts,r,colour);
}
const rect=(Cv,x0,y0,x1,y1,colour)=>Cv.fillShape((x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1,colour);
const border=(Cv,inset,r,colour)=>{const {w,h}=Cv;Cv.stroke([[inset,inset],[w-inset,inset],[w-inset,h-inset],[inset,h-inset],[inset,inset]],r,colour);};
// The big appliqué letters with a wing before them: cream felt letters, slanted, with a darker stitched edge.
function lettersData(C){
  return cached('letters'+C.felt,()=>{const Cv=canvas(512,128);
    // The wing: four feathers sweeping back from the "U", shorter toward the bottom.
    for(const [colour,r] of [[C.feltEdge,15],[C.felt,11]]){
      for(let k=0;k<4;k++){const y0=104-k*19,len=96-k*18;Cv.stroke(Array.from({length:9},(_,i)=>{const t=i/8;return [118-len*t,y0+10*t*t];}),Math.max(4,r-5-k),colour);}
      text(Cv,'USRL',122,16,96,r,colour,.25);}
    return Cv;});
}
// The embroidered signature: navy script with a small "-67-" below.
function signatureData(C){
  return cached('signature'+C.navy,()=>{const Cv=canvas(256,112);script(Cv,20,58,210,20,9,3,C.navy,3);
    Cv.stroke([[100,22],[112,22]],2,C.navy);text(Cv,'67',118,10,24,2,C.navy);Cv.stroke([[150,22],[162,22]],2,C.navy);return Cv;});
}
// The round badge: a navy disc ringed in yellow, a winged "1" in the middle.
function badgeData(C){
  return cached('badge'+C.navy+C.yellow,()=>{const Cv=canvas(128,128);Cv.fillShape((x,y)=>Math.hypot(x-64,y-64)<60,C.yellow);Cv.fillShape((x,y)=>Math.hypot(x-64,y-64)<54,C.navy);
    Cv.stroke(arc(64,64,40,40,0,Math.PI*2,48),2,C.yellow);text(Cv,'1',52,34,52,5,C.yellow);
    for(const s of [-1,1])for(let k=0;k<3;k++)Cv.stroke([[64+s*10,70-k*6],[64+s*(28-k*4),78-k*4],[64+s*(40-k*6),76-k*6]],2,C.yellow);
    return Cv;});
}
// The eagle patch: a cream label in a brown-red frame, a navy eagle with spread wings and a line of script below.
function eagleData(C){
  return cached('eagle'+C.navy,()=>{const Cv=canvas(256,128,C.label);border(Cv,6,4,C.frame);
    for(const s of [-1,1])for(let k=0;k<4;k++)Cv.stroke(arc(128+s*6,64,62-k*10,30-k*5,s>0?-.1:Math.PI+.1,s>0?Math.PI/2+.2:Math.PI/2-.2,16).map(([x,y])=>[x,y+20-k*2]),3,C.navy);
    Cv.fillShape((x,y)=>((x-128)/9)**2+((y-82)/16)**2<1,C.navy);script(Cv,58,26,140,10,9,2,C.frame,7);return Cv;});
}
// The flag patch: a cream label with "RL" in red and white stripes, a navy corner with white stars, and "67".
function flagData(C){
  return cached('flag'+C.red,()=>{const Cv=canvas(192,128,C.label);border(Cv,5,3,'#9a958a');
    const M=canvas(192,128);text(M,'RL',30,20,78,13,'#ffffff');const red=hex(C.red),navy=hex(C.navy),white=[245,243,236];
    for(let y=0;y<128;y++)for(let x=0;x<192;x++){const i=(y*192+x)*4;if(M.data[i+3]<128)continue;
      const c=x<92&&y>66?(((x>>3)+(y>>3))%3===0?white:navy):((y>>3)%2?red:white);for(let k=0;k<3;k++)Cv.data[i+k]=c[k];Cv.data[i+3]=255;}
    text(Cv,'67',130,82,26,3,C.navy);return Cv;});
}
// The sleeve patch: yellow in a red frame, "R.L." in black above a line of script.
function sleevePatchData(C){
  return cached('sleevepatch'+C.yellow,()=>{const Cv=canvas(160,96,C.yellow);border(Cv,6,5,C.red);text(Cv,'R.L.',28,40,36,5,'#1b1b1b');script(Cv,36,18,90,6,6,2,'#1b1b1b',11);return Cv;});
}
// The hood's patch: white in a red frame, "USRL" in red over two lines of small navy type.
function hoodPatchData(C){
  return cached('hoodpatch'+C.red,()=>{const Cv=canvas(192,96,'#f4f2ee');border(Cv,5,4,C.red);text(Cv,'USRL',30,38,40,6,C.red,.25);
    for(const y of [26,16])for(let k=0;k<11;k++)Cv.stroke([[34+k*12,y],[40+k*12,y]],1,C.navy);return Cv;});
}
export function makeRacingHoodie(id,spec){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,H=spec.hood,D=spec.cords,C=spec.colours,hem=B.hem,band=B.band,neck=B.rows[0][0];
  const fleece=(map,colour,u,v)=>new T.MeshPhysicalMaterial({map,color:colour,roughness:.93,sheen:.25,sheenColor:new T.Color(C.sheen),sheenRoughness:.8,bumpMap:dataTexture(fleeceData().data,64,64,false,[u,v]),bumpScale:.0025,side:T.DoubleSide});
  const plain=(u,v)=>fleece(null,C.fleece,u,v),rib=(u,v)=>{const m=fleece(null,C.rib,u,v);m.bumpScale=.004;return m;};
  // The body, its colour blocks mapped by angle and height.
  const blocks=blocksData(B,C),body=shell(top,B.rows,fleece(dataTexture(blocks.data,blocks.w,blocks.h),'#ffffff',40,30),'hoodie-body',128);
  body.material.map.wrapT=T.ClampToEdgeWrapping;
  const bp=body.geometry.attributes.position,buv=body.geometry.attributes.uv;
  for(let k=0;k<buv.count;k++)buv.setXY(k,(k%129)/128,Math.max(0,Math.min(1,(bp.getY(k)-B.hem)/(neck-B.hem))));
  buv.needsUpdate=true;
  // The rib band, a little narrower than the body, which blouses over it.
  const [brx,brz]=B.bandRadius;
  ribbed(shell(top,[[hem+band+.01,brx,brz],[hem+band/2,brx,brz],[hem,brx,brz]],rib(60,6),'ribbed-hem-band',B.ribs*8),B.ribs,.006);
  const yellowPatch=sleevePatchData(C);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    // Relaxed raglan sleeves, banded at the top, blousing over long ribbed cuffs.
    const yt=S.rows[0][0],yb=S.rows.at(-1)[0],sd=sleeveData(S,C),map=dataTexture(sd.data,sd.w,sd.h);map.wrapT=T.ClampToEdgeWrapping;
    const sleeve=shell(arm,S.rows,fleece(map,'#ffffff',14,20),'knit-jumper-sleeve',96),su=sleeve.geometry.attributes.uv,sp=sleeve.geometry.attributes.position;
    for(let k=0;k<su.count;k++)su.setXY(k,(k%97)/96,Math.max(0,Math.min(1,(sp.getY(k)-yb)/(yt-yb))));
    su.needsUpdate=true;roundSleeveCap(sleeve,side,yt);
    easeOverHand(ribbed(shell(arm,S.cuff,rib(14,4),'ribbed-cuff',S.cuffRibs*8),S.cuffRibs,.03),side);
    // The yellow patch on her left sleeve, on its outer side, laid on the sleeve (found by casting in toward its axis).
    if(side===S.patch.side){
      const ray=new T.Raycaster(),[pw,ph]=S.patch.size,pmap=dataTexture(yellowPatch.data,yellowPatch.w,yellowPatch.h);pmap.wrapS=pmap.wrapT=T.ClampToEdgeWrapping;
      arm.updateMatrixWorld(true);sleeve.updateMatrixWorld(true);
      grid(arm,10,8,(u,v)=>{const a=Math.PI/2*side+S.patch.turn*side+(u-.5)*pw/.12,y=S.patch.y+(v-.5)*ph/.76,o=new T.Vector3(Math.sin(a)*.4,y,Math.cos(a)*.4),dir=new T.Vector3(-Math.sin(a),0,-Math.cos(a));
        arm.localToWorld(o);dir.transformDirection(arm.matrixWorld);ray.set(o,dir);const hit=ray.intersectObject(sleeve)[0];
        const p=hit?hit.point:o;arm.worldToLocal(p);return p.add(new T.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(.004)).toArray();},
      new T.MeshStandardMaterial({map:pmap,roughness:.75,side:T.DoubleSide}),'sleeve-patch');
    }
    top.add(arm);
  }
  const at=bodyAt(B.rows),hoodFleece=plain(8,8);
  // The hood, worn down (userData.underJacket false: put away under a jacket): a rounded pouch over her upper back,
  // fuller toward the bottom, where the folded hood gathers, as on the cropped hoodie.
  const hood=new T.Group();hood.name='hood-down';hood.userData.underJacket=false;top.add(hood);
  const U=24,W=16,pouch=(u,v)=>{const yb=H.bottom+H.round*u*u,y=H.top-(H.top-yb)*v,half=H.halfWidth*(1-.25*v*v),[rx]=[at(Math.PI/2,y).x];
    const a=Math.PI+Math.asin(Math.max(-.98,Math.min(.98,u*half/rx)));
    return at(a,y,H.lift*Math.max(0,1-u*u)**.7*Math.sin(Math.PI*(.12+.88*v))**.8*(.8+.25*v)+.006);};
  const rings=[];for(let j=0;j<=W;j++){const ring=[];for(let i=0;i<=U;i++)ring.push(pouch(-1+2*i/U,j/W).toArray());rings.push(ring);}
  ringShell(hood,rings,hoodFleece,'hood');
  const rim=[];for(let j=0;j<=W;j++)rim.push(pouch(-1,j/W).toArray());for(let i=1;i<U;i++)rim.push(pouch(-1+2*i/U,1).toArray());for(let j=W;j>=0;j--)rim.push(pouch(1,j/W).toArray());
  curve(hood,rim,H.edge,hoodFleece,'hood-edge');
  curve(hood,Array.from({length:W+1},(_,j)=>pouch(0,j/W).toArray()).map(([x,y,z])=>[x,y,z-.002]),.0016,hoodFleece,'hood-seam');
  // Its opening round her neck, the hood's sides crossing at the centre front, with the white inside showing.
  const O=H.opening,opening=(out,lift,k)=>{const a=O.from+(Math.PI*2-2*O.from)*k;return at(a,neck+O.rise*(1-Math.cos(a))/2+lift-O.dip*Math.max(0,Math.cos(a))**4,out).toArray();};
  const ring=(out,lift)=>Array.from({length:49},(_,k)=>opening(out,lift,k/48));
  const inside=plain(6,2);inside.color.set(C.lining);
  ringShell(hood,[ring(O.out,O.band),ring(O.out-.004,0)],inside,'hood-lining');
  curve(hood,ring(O.out+.003,O.band),O.radius,hoodFleece,'hood-opening');
  // Flat white drawcords from metal eyelets either side of the centre, hanging down her chest to tipped ends.
  const cord=new T.MeshStandardMaterial({color:C.cord,roughness:.85}),metal=new T.MeshStandardMaterial({color:C.metal,metalness:.85,roughness:.3});
  const probe=(()=>{top.updateMatrixWorld(true);const p=surfaceProbe(top,['hoodie-body']);return (x,y)=>p(x,y,true);})();
  for(const s of [-1,1]){
    const path=[];for(let k=0;k<=10;k++){const t=k/10,y=D.top-(D.top-D.end)*t,x=s*(D.x+D.drift*t),hit=probe(x,y);if(hit)path.push(hit.point.clone().addScaledVector(hit.normal,D.radius+.004+.003*Math.sin(t*Math.PI)).toArray());}
    curve(hood,path,D.radius,cord,'drawcord');
    const start=new T.Vector3(...path[0]),eyelet=new T.Mesh(new T.TorusGeometry(D.radius*1.6,D.radius*.55,8,20),metal);eyelet.name='cord-eyelet';eyelet.position.copy(start).add(new T.Vector3(0,0,.002));hood.add(eyelet);
    const end=new T.Vector3(...path.at(-1));oval(hood,[end.x,end.y-D.radius*1.2,end.z],[D.radius*1.1,D.radius*2.4,D.radius*1.1],metal,'cord-tip',12);
  }
  // Under a jacket: a plain ribbed neckband the width of the other tops' necks (userData.underJacket true).
  const neckband=new T.Group();neckband.name='jacket-neckband';neckband.userData.underJacket=true;neckband.visible=false;top.add(neckband);
  ribbed(shell(neckband,[[neck+.035,.108,.1],[neck+.012,.111,.102],[neck-.005,.116,.106]],rib(30,2),'crew-neckband',256),32,.012);
  // The appliqué letters, the embroidery and the patches, laid on the fleece; the hood's patch on the hood, from behind.
  top.updateMatrixWorld(true);const onBody=surfaceProbe(top,['hoodie-body']),onHood=surfaceProbe(top,['hood']);
  const decal=(name,[cx,cy],[w,h],Cv,lift,alpha,front=true,probeOn=onBody,group=top)=>{const map=dataTexture(Cv.data,Cv.w,Cv.h);map.wrapS=map.wrapT=T.ClampToEdgeWrapping;
    return grid(group,20,10,(u,v)=>{const x=cx+(u-.5)*w/1.06*(front?1:-1),hit=probeOn(x,cy+(v-.5)*h/.76,front);return hit?hit.point.clone().addScaledVector(hit.normal,lift).toArray():[x,cy,front?.25:-.25];},
      new T.MeshStandardMaterial({map,transparent:alpha,alphaTest:alpha?.4:0,roughness:.75,side:T.DoubleSide}),name);};
  const P=spec.patches;
  decal('applique-letters',P.letters.at,P.letters.size,lettersData(C),.003,true);
  decal('embroidered-signature',P.signature.at,P.signature.size,signatureData(C),.0025,true);
  decal('round-badge',P.badge.at,P.badge.size,badgeData(C),.003,true);
  decal('eagle-patch',P.eagle.at,P.eagle.size,eagleData(C),.003,false);
  decal('flag-patch',P.flag.at,P.flag.size,flagData(C),.003,false);
  decal('hood-patch',P.hood.at,P.hood.size,hoodPatchData(C),.003,false,false,onHood,hood);
  return top;
}
