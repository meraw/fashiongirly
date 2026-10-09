// Tailored coat (template 'tailored-coat'): a single-breasted coat in felted double-face wool, with a notched lapel
// collar, a V that opens above the top button, slanted welt pockets, plain sleeves and a plain hem. Double-face wool is
// left with clean raw edges, so every edge (fronts, lapels, collar, pockets, hem, sleeve ends) shows as a fine lighter line.
// Buttoned, the fronts meet below the button; shown open (for jackets the user allows it on), they hang apart.
import * as T from 'three';
import { V, random, weave, solid, put, curve, shell, ringShell, ribbon, roundSleeveCap } from './model.js';
import { jacketBody, easeOver, outward, dataTexture, rowRadii, openShift } from './outerwear.js';

const cache={};
// Felted wool melange: a soft mottle of lighter and darker fibres, kept as a grey multiplier on the coat's colour, with a
// matching fine bump. Built once and shared.
function melangeData(){
  if(cache.melange)return cache.melange;
  const S=256,rand=random(131),h=new Float32Array(S*S);
  for(let i=0;i<S*S;i++)h[i]=rand();
  // Blur twice for the soft mottle, then add short fibre flecks.
  const blur=src=>src.map((_,i)=>{const x=i%S,y=Math.floor(i/S);let v=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)v+=src[((y+dy+S)%S)*S+((x+dx+S)%S)];return v/25;});
  const soft=blur(blur(h)),data=new Uint8Array(S*S*4);
  for(let k=0;k<2600;k++){const x0=rand()*S,y0=rand()*S,ang=rand()*Math.PI,len=2+rand()*4,v=rand()<.5?.12:-.12;
    for(let t=0;t<len;t+=.5){const x=Math.floor(x0+Math.cos(ang)*t+S)%S,y=Math.floor(y0+Math.sin(ang)*t+S)%S;soft[y*S+x]+=v;}}
  for(let i=0;i<S*S;i++){const v=Math.max(0,Math.min(255,Math.round(255*(.86+.5*(soft[i]-.5)))));data[i*4]=data[i*4+1]=data[i*4+2]=v;data[i*4+3]=255;}
  return cache.melange={data,S};
}
function wool(colour,repeat,roughness){
  const {data,S}=melangeData(),map=dataTexture(data,S,S,repeat[0],repeat[1]),bump=dataTexture(data,S,S,repeat[0],repeat[1]);bump.colorSpace=T.NoColorSpace;
  return new T.MeshStandardMaterial({color:colour,map,roughness,bumpMap:bump,bumpScale:.004,side:T.DoubleSide});
}

export function makeTailoredCoat(id,spec,overSkirt,under=null,open=false){
  const jacket=new T.Group();jacket.name='outerwear';jacket.userData.garmentId=id;jacket.userData.open=open;
  const C=spec.colours,B=spec.body,S=spec.sleeve,L=spec.lapel,rows=overSkirt?B.overSkirt:B.rows,own=rowRadii(rows);
  const cloth=wool(C.shell,spec.tiles.body,spec.roughness),sleeveCloth=wool(C.shell,spec.tiles.sleeve,spec.roughness),edge=solid(C.edge,.95),thread=solid(C.stitch,.9);
  // The fronts part above the top button in a V up to the neck. Shown open, they also hang apart below it.
  const vee=y=>{const t=Math.max(0,Math.min(1,(y-L.break)/(B.collarBase-L.break)));return L.neck*t*t*(3-2*t);};
  const gap=open?y=>spec.open.shift+vee(y):vee;
  const polar=y=>Math.atan2(gap(y),own(y)[1]);
  // Shown open, the coat eases out where the layers under it need room, like the other jackets.
  const fit=open&&under?easeOver(under,{low:B.hem-.01,high:B.collarBase,gap:spec.open.gap??.012,radii:own,sleeve:S,openAt:polar}):null;
  // Soft vertical folds from the hips to the hem, as a heavy coat hangs.
  const drape=(a,y)=>{const t=Math.max(0,Math.min(1,(B.drapeTop-y)/(B.drapeTop-B.hem)));return 1+B.drape*t*t*Math.sin(B.folds*a+.6+2*y);};
  const tools=jacketBody(jacket,rows,cloth,B.collarBase,drape,128,{fit,open:gap}),{normal,at,angleFor,radii}=tools;
  // Its fronts part at the V even buttoned, so tops show at the neck: the coverage tests skip what lies between the fronts.
  jacket.userData.neckline=true;jacket.userData.opening=y=>Math.atan2(gap(y),radii(y)[1]*(fit?fit(y):1));
  const ring=(y,off,n=40)=>Array.from({length:n+1},(_,i)=>at(i/n*Math.PI*2*(1-1e-4)+1e-4*Math.PI,y,off).toArray());
  // Raw edges: the hem, and each front edge from the hem to the neck.
  curve(jacket,ring(B.hem+.003,.001),.0028,edge,'raw-edge');
  for(const a0 of [1e-4,Math.PI*2-1e-4])curve(jacket,Array.from({length:17},(_,k)=>{const y=B.hem+.004+(B.collarBase-B.hem-.01)*k/16;return at(a0,y,.001).toArray();}),.0024,edge,'raw-edge');
  // Lapels: each folds back from the V's edge and lies on the front, widening from the break to the notch, then narrowing
  // to where the collar takes over. Its outer edge and top are raw.
  const lapelPt=(s,u,v)=>{const y=L.break+(L.top-L.break)*u,w=u<L.notchAt?L.width*u/L.notchAt:L.width*(1-L.narrow*(u-L.notchAt)/(1-L.notchAt)),a0=s>0?1e-3:Math.PI*2-1e-3;
    return at(a0+s*v*w/radii(y)[0],y,.005+L.lift*v*(1-.4*u));};
  for(const s of [1,-1]){
    const U=24,W=8,grid=[];for(let j=0;j<=U;j++){const r=[];for(let i=0;i<=W;i++)r.push(lapelPt(s,j/U,i/W).toArray());grid.push(r);}
    outward(ringShell(jacket,grid,cloth,'lapel'),normal(s*.2,(L.break+L.top)/2));
    curve(jacket,Array.from({length:U/2+1},(_,j)=>lapelPt(s,2*j/U,1).toArray()),.0026,edge,'lapel-edge');
    curve(jacket,Array.from({length:W+1},(_,i)=>lapelPt(s,1,i/W).toArray()),.0026,edge,'lapel-edge');
    curve(jacket,Array.from({length:U/2+1},(_,j)=>lapelPt(s,2*j/U,0).toArray()),.0035,cloth,'lapel-roll');
  }
  // The collar: a band folded over round the back of her neck from one notch to the other, its lower edge raw.
  const K=spec.collar,collarPt=(u,v)=>{const a=K.from+(Math.PI*2-2*K.from)*u,y=B.collarBase+.012-K.depth*v;return at(a,y,.006+K.lift*v);};
  const cg=[];for(let j=0;j<=4;j++){const r=[];for(let i=0;i<=48;i++)r.push(collarPt(i/48,j/4).toArray());cg.push(r);}
  outward(ringShell(jacket,cg,cloth,'coat-collar'),normal(Math.PI,B.collarBase-.03));
  curve(jacket,Array.from({length:25},(_,i)=>collarPt(i/24,1).toArray()),.0024,edge,'collar-edge');
  // Buttons: horn buttons with a lighter grain, on her left front; a buttonhole for each in her right front.
  const btn=new T.MeshStandardMaterial({color:C.button,roughness:.35,metalness:.05});
  for(const y of spec.buttons){
    const a=open?.05:.02,q=at(a,y,.009),b=put(jacket,new T.CylinderGeometry(.017,.017,.006,24),btn,'coat-button');b.position.copy(q);b.quaternion.setFromUnitVectors(V(0,1,0),normal(a,y));
    const ha=open?Math.PI*2-.05:-.02;curve(jacket,[at(ha-.03,y,.003).toArray(),at(ha+.02,y,.003).toArray()],.0022,thread,'buttonhole');
  }
  // Slanted welt pockets low on each front: a narrow welt with a raw edge and the opening's shadow beside it.
  const P=spec.pockets;
  for(const s of [-1,1]){
    const ys=[];for(let k=0;k<=6;k++)ys.push(P.top-(P.top-P.bottom)*k/6);
    const a=y=>angleFor(s*(P.x+P.slant*(P.top-y)),y);
    outward(ribbon(jacket,ys.map(y=>at(a(y),y,.003)),ys.map(y=>normal(a(y),y)),P.width,cloth,'pocket-welt'),normal(a(P.top),P.top));
    curve(jacket,ys.map(y=>at(a(y)+s*P.width/2/radii(y)[0],y,.004).toArray()),.0018,edge,'welt-edge');
    curve(jacket,ys.map(y=>at(a(y)-s*P.width*.6/radii(y)[0],y,.0015).toArray()),.002,solid(C.shadow,.95),'pocket-opening');
  }
  // Centre-back seam: a flat ridge from the collar to the hem.
  curve(jacket,Array.from({length:13},(_,k)=>{const y=B.collarBase-.04-(B.collarBase-.04-B.hem-.01)*k/12;return at(Math.PI,y,.002).toArray();}),.0025,cloth,'back-seam');
  // Sleeves: long and plain, falling straight to a raw-edged hem at her wrist.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.name='jacket-arm';arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,sleeveCloth,'jacket-sleeve',64);sleeve.userData.covering=true;
    roundSleeveCap(sleeve,side,S.rows[0][0]);
    const [c0,c1]=S.cuff,[cx,cz]=S.cuffRadius;
    // The hem is turned inside, so the sleeve end has a little thickness.
    const hem=shell(arm,[[c0,cx,cz],[c1+.004,cx,cz],[c1,cx-.004,cz-.004]],sleeveCloth,'sleeve-hem',64);hem.userData.covering=hem.userData.cuff=true;
    curve(arm,Array.from({length:25},(_,k)=>{const a=k/24*Math.PI*2;return [Math.sin(a)*(cx+.001),c1+.002,Math.cos(a)*(cz+.001)];}),.0024,edge,'raw-edge');
    jacket.add(arm);
  }
  return jacket;
}
