// Printed long-sleeved tee: a fitted crew-neck jersey tee with long fitted sleeves, its all-over print drawn here in code
// from the reference reading (not copied from the product photos): scattered, distressed stamped motifs and paint
// splatter on a dark slub jersey.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// The body takes a front panel and a back panel side by side in one print texture, each projected flat from the front
// and back, so the print stays upright and the side seams fall at the panel edges. Each sleeve wraps round a print of its
// own that repeats seamlessly round the arm. Both textures keep the same scale, in pixels per world unit.
import * as T from 'three';
import { random, weave, shell, roundSleeveCap, easeOverHand } from './model.js';
import { stripePatchBody, stripeSleeve } from './stripe-patch-print.js';

const PX=1300;// texture pixels per world unit
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
// Smooth value noise that repeats every `period` cells across (and `rows` down).
function valueNoise(seed,period,rows){const r=random(seed),g=new Float32Array(period*rows);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{let xi=Math.floor(x),yi=Math.floor(y);const fx=x-xi,fy=y-yi;xi%=period;if(xi<0)xi+=period;yi%=rows;if(yi<0)yi+=rows;
    const x1=xi+1===period?0:xi+1,r0=yi*period,r1=(yi+1===rows?0:yi+1)*period,a=g[r0+xi],b=g[r0+x1],c=g[r1+xi],d=g[r1+x1],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
// Whether a point lies in any of a list of ellipses [x, y, rx, ry], each grown by j.
function inEllipses(list,lx,ly,j){for(let k=0;k<list.length;k++){const e=list[k],dx=(lx-e[0])/e[2],dy=(ly-e[1])/e[3];if(dx*dx+dy*dy<1+j)return true;}return false;}
// Motifs as unions of ellipses [x, y, rx, ry] in a unit frame (y down), with details stamped over them in another ink
// (`marks`, or `holes` left in the background colour).
const MOTIFS={
  // A cartoon mouse head: a round face and two round ears, with two oval eyes.
  head:{parts:[[0,0,1,1],[-.86,-.82,.56,.56],[.86,-.82,.56,.56]],holes:[[-.22,-.18,.12,.24],[.22,-.18,.12,.24]]},
  // Shorts with two big oval buttons.
  shorts:{parts:[[0,-.1,1,.66],[-.5,.42,.48,.48],[.5,.42,.48,.48]],holes:[[0,.82,.16,.36]],marks:[[-.36,-.18,.15,.23],[.36,-.18,.15,.23]]},
  // A four-fingered glove with a rolled cuff.
  glove:{parts:[[0,0,.62,.56],[-.48,-.66,.19,.4],[-.02,-.8,.19,.42],[.44,-.68,.19,.4],[-.8,.02,.36,.19],[0,.66,.56,.22]],holes:[[0,.44,.5,.035]]},
  // A big rounded shoe.
  shoe:{parts:[[.15,0,1.05,.6],[-.85,.12,.42,.4]],holes:[[-.55,-.42,.32,.08]]},
};
// The print: on dark slub jersey, motifs spread evenly at random angles (each the best of a few random spots, farthest
// from those already placed), each inked unevenly with scratchy crackle lines
// through it and ragged edges, then fine paint splatter. Wraps across (wrapX) so a sleeve's print meets itself.
const printCache=new Map();
function drawPrint(key,w,h,seed,wrapX,P){
  if(printCache.has(key))return printCache.get(key);
  const data=new Uint8Array(w*h*4),rand=random(seed),bg=hex(P.ground),ink=Object.fromEntries(Object.entries(P.inks).map(([k,v])=>[k,hex(v)]));
  // Noise fields sampled at pixels, with cells about cw by ch pixels; a whole number of cells fits across, so the noise
  // repeats exactly round a sleeve.
  const field=(sd,cw,ch)=>{const n=Math.max(1,Math.round(w/cw)),f=valueNoise(sd,n,Math.ceil(h/ch)+1),sx=n/w;return (x,y)=>f(x*sx,y/ch);};
  const slub=field(seed+1,90,3),grain=field(seed+2,6,6),ragged=field(seed+3,9,9),fleck=field(seed+4,3,3);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=slub(x,y),k=1+.5*Math.max(0,s-.7)+.08*(grain(x,y)-.5);
    for(let c=0;c<3;c++)data[i+c]=Math.min(255,bg[c]*k);data[i+3]=255;}
  const set=(x,y,col,a=1)=>{if(wrapX)x=((x%w)+w)%w;if(x<0||x>=w||y<0||y>=h)return;const i=(y*w+x)*4;for(let c=0;c<3;c++)data[i+c]=data[i+c]*(1-a)+col[c]*a;};
  // Ink coverage at a point of a stamp: patchy, crossed by scratches, and thinning out toward one side (`fade`, the
  // direction the stamp was pressed less hard), with ragged edges.
  const rg=P.ragged??1,scratch=P.scratchWidth??.04;
  const stamp=(lx,ly,px,py,lines,fade)=>{const n=ragged(px,py),f=fleck(px,py),thin=fade[2]*Math.max(0,lx*fade[0]+ly*fade[1]);if(n*.6+f*.4<P.dropout+thin)return 0;
    for(let k=0;k<lines.length;k++){const L=lines[k];if(Math.abs(Math.sin((lx*L[0]+ly*L[1])*L[2]+L[3]+5*n+2*f))>1-scratch)return 0;}return .85+.15*n;};
  const count=Math.round(w*h/P.spacing**2),kinds=Object.keys(P.mix),placed=[];
  for(let m=0;m<count;m++){
    let pick=rand()*Object.values(P.mix).reduce((a,b)=>a+b,0),kind=kinds[0];for(const k of kinds){pick-=P.mix[k];if(pick<=0){kind=k;break;}}
    const M=MOTIFS[kind],R=P.size*(.75+.5*rand()),ang=(rand()-.5)*Math.PI*1.4,ca=Math.cos(ang),sa=Math.sin(ang);
    let cx=0,cy=0,far=-1;for(let c=0;c<8;c++){const x=rand()*w,y=rand()*h;let d=Infinity;for(const [qx,qy] of placed){let ex=Math.abs(x-qx);if(wrapX)ex=Math.min(ex,w-ex);d=Math.min(d,ex*ex+(y-qy)**2);}if(d>far){far=d;cx=x;cy=y;}}
    placed.push([cx,cy]);
    const inks=P.inksFor[kind],col=ink[inks[Math.floor(rand()*inks.length)]],detail=col===ink.cream?ink.red:ink.cream;
    const lines=Array.from({length:P.scratches??2},()=>{const t=rand()*Math.PI;return [Math.cos(t),Math.sin(t),6+rand()*8,rand()*6];});
    const ft=rand()*Math.PI*2,fade=[Math.cos(ft),Math.sin(ft),(P.fade??0)*rand()],strength=1-(P.faint??0)*rand();
    // Every motif lies within 1.6 of its centre; the ragged edge grows it by at most .275 times `ragged` (points outside
    // it grown that far are skipped before the noise is sampled), which the extent allows for.
    const grow=.3*rg,ext=Math.ceil(R*(1.6+grow));
    for(let py=Math.floor(cy-ext);py<=cy+ext;py++)for(let px=Math.floor(cx-ext);px<=cx+ext;px++){
      const dx=(px-cx)/R,dy=(py-cy)/R,lx=dx*ca+dy*sa,ly=-dx*sa+dy*ca;if(!inEllipses(M.parts,lx,ly,grow))continue;
      const j=rg*(.3*(fleck(px+93,py+51)-.5)+.25*(ragged(px+45,py+27)-.5));
      if(!inEllipses(M.parts,lx,ly,j)||(M.holes&&inEllipses(M.holes,lx,ly,j*.5)))continue;
      const a=stamp(lx,ly,px,py,lines,fade);if(!a)continue;
      set(px,py,M.marks&&inEllipses(M.marks,lx,ly,j*.5)?detail:col,a*strength);}
    // A spray of fine dots in the stamp's ink around it, thinning outward.
    for(let d=0;d<(P.spray??0);d++){const r=R*(.9+1.6*Math.sqrt(rand())),t=rand()*Math.PI*2,x=cx+Math.cos(t)*r,y=cy+Math.sin(t)*r,s=.5+rand()*1.3;
      for(let py=Math.floor(y-s);py<=y+s;py++)for(let px=Math.floor(x-s);px<=x+s;px++){const q=Math.hypot(px-x,py-y)/s;if(q<1)set(px,py,col,.8*strength*Math.min(1,(1-q)*3));}}
  }
  // Paint splatter: fine dots, densest around a few bursts.
  const dots=Math.round(w*h/P.splatter);
  for(let d=0;d<dots;d++){const col=ink[['cream','cream','red','ochre'][Math.floor(rand()*4)]],r=.7+rand()*rand()*3.2,cx=rand()*w,cy=rand()*h;
    for(let py=Math.floor(cy-r);py<=cy+r;py++)for(let px=Math.floor(cx-r);px<=cx+r;px++){const q=Math.hypot(px-cx,py-cy)/r;if(q<1)set(px,py,col,.85*Math.min(1,(1-q)*3));}}
  const out={data,w,h};printCache.set(key,out);return out;
}
function printTexture({data,w,h},wrapX){const t=new T.DataTexture(data,w,h,T.RGBAFormat);t.colorSpace=T.SRGBColorSpace;t.wrapS=wrapX?T.RepeatWrapping:T.ClampToEdgeWrapping;
  t.wrapT=T.ClampToEdgeWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;}
function jersey(map,sheen='#57524d'){
  // Fine, soft stretch jersey: matte, with a faint sheen and a fine knit in the bump.
  const knit=weave('knit');knit.repeat.set(70,40);
  return new T.MeshPhysicalMaterial({map,roughness:.82,sheen:.35,sheenColor:new T.Color(sheen),sheenRoughness:.6,bumpMap:knit,bumpScale:.0025,side:T.DoubleSide});
}
// Optional (the Hawaii patch tee): `print.draw: 'stripe-patch'` draws its stripes, lettering and patch
// (stripe-patch-print.js) instead of the scattered stamps; `body.tucked` rows tuck it into the skirt; `sleeve.drop` sets
// the dropped shoulder seam's depth on the sleeve; `colours.neckband` and `colours.sheen` set those apart from the band.
export function makePrintedLongTee(id,spec,overSkirt=false){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,P=spec.print,C=spec.colours,stripes=P.draw==='stripe-patch';
  const rows=overSkirt&&B.tucked?B.tucked:B.rows,hem=B.hem;
  // Body: front and back panels side by side, each the width of the widest row (scaled across by the outfit).
  const half=Math.max(...B.rows.map(r=>r[1])),panelW=Math.ceil(half*2*1.06*PX),bodyH=Math.ceil((B.neck-B.hem)*.76*PX)+8;
  const bodyMap=printTexture(stripes?stripePatchBody(id+':body',panelW,bodyH,B,P,half):drawPrint(id+':body',panelW*2,bodyH,P.seed,false,P),false);
  const body=shell(top,rows,jersey(bodyMap,C.sheen),'printed-tee-body',96);
  const p=body.geometry.attributes.position,uv=body.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++){const x=p.getX(i),z=p.getZ(i),u=.5+(z>=0?x:-x)/(half*2);
    uv.setXY(i,(z>=0?0:.5)+.5*Math.max(.002,Math.min(.998,u)),1-Math.max(0,Math.min(1,(B.neck-p.getY(i))*.76*PX/bodyH)));}
  uv.needsUpdate=true;
  // Narrow ribbed crew neckband, and a fine turned hem.
  const band=new T.MeshPhysicalMaterial({color:C.band,roughness:.85,sheen:.3,sheenColor:new T.Color('#2c2928'),bumpMap:weave('knit'),bumpScale:.006,side:T.DoubleSide});
  band.bumpMap.repeat.set(60,1);
  let neckband=band;if(C.neckband){neckband=band.clone();neckband.color.set(C.neckband);}
  shell(top,B.neckband,neckband,'crew-neckband',96);
  // Tucked into the skirt, its hem is out of sight inside the waistband.
  if(rows===B.rows)shell(top,[[hem+.014,rows.at(-1)[1]+.002,rows.at(-1)[2]+.002],[hem-.001,rows.at(-1)[1]+.003,rows.at(-1)[2]+.003]],band,'turned-hem',96);
  // Long fitted sleeves, set in at the shoulder, ending at her wrist and easing over her hand.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const yt=S.rows[0][0],yb=S.rows.at(-1)[0],around=Math.ceil(2*Math.PI*Math.sqrt((S.rows[2][1]**2+S.rows[2][2]**2)/2)*PX),len=Math.ceil((yt-yb)*.76*PX)+8;
    const map=printTexture(stripes?stripeSleeve(id+':sleeve'+side,around,len,P,S,side>0?.25:.75):drawPrint(id+':sleeve'+side,around,len,P.seed+(side<0?11:23),true,P),true);
    const sleeve=shell(arm,S.rows,jersey(map,C.sheen),'reference-fitted-sleeve',64);
    const sp=sleeve.geometry.attributes.position,su=sleeve.geometry.attributes.uv;
    for(let k=0;k<su.count;k++)su.setXY(k,(k%65)/64,1-Math.max(0,Math.min(1,(yt-sp.getY(k))*.76*PX/len)));
    su.needsUpdate=true;
    roundSleeveCap(sleeve,side,yt);
    easeOverHand(sleeve,side);
    easeOverHand(shell(arm,[[yb+.012,S.rows.at(-1)[1]+.002,S.rows.at(-1)[2]+.002],[yb-.001,S.rows.at(-1)[1]+.003,S.rows.at(-1)[2]+.003]],band,'turned-cuff',48),side,.01);
    top.add(arm);
  }
  return top;
}
