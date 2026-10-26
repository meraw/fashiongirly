// Velour hoodie: a relaxed, hip-length hoodie in cotton velour, with dropped shoulders, full sleeves into long ribbed
// cuffs, a ribbed hem band the body blouses over, a hood worn down, round drawcords knotted at their ends, a small woven
// logo patch on one sleeve above the cuff and a tonal embroidered mark on her left chest.
// Its dye (`dye`) is a bound tie-dye drawn here in code, not copied: on a dark ground, bands of bright dye round the
// body and the sleeves, broken by the dark lines of the folds it was bound in, which run across the bands, with a
// faint mottle all over. The logo is drawn at her scale as a suggestion of the brand's mark, not a copy.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Under a jacket the hood and cords would push through it, so the hoodie also carries a plain narrow neckband: a jacket
// wears that instead (userData.underJacket, read by makeOuterwear, as for the other hoodies). Over the layered skirt
// its hem band widens to sit out over the skirt (`bandOverSkirt`).
import * as T from 'three';
import { random, oval, curve, shell, ringShell, ribbed, roundSleeveCap, surfaceProbe, easeOverHand } from './model.js';
import { grid } from './polo.js';
import { dataTexture, canvas, arc, bodyAt } from './hoodie.js';

const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const pixels=new Map(),cached=(key,draw)=>{if(!pixels.has(key))pixels.set(key,draw());return pixels.get(key);};
// Smooth value noise that repeats every `period` cells across (so it wraps round her) and `rows` down.
function valueNoise(seed,period,rows){const r=random(seed),g=new Float32Array(period*rows);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{let xi=Math.floor(x),yi=Math.floor(y);const fx=x-xi,fy=y-yi;xi=((xi%period)+period)%period;yi=((yi%rows)+rows)%rows;
    const x1=(xi+1)%period,y1=(yi+1)%rows,a=g[yi*period+xi],b=g[yi*period+x1],c=g[y1*period+xi],d=g[y1*period+x1],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}

// The tie-dye over a surface `w` pixels round and `h` pixels high (u wraps round it; v from its bottom up), `around`
// and `tall` its size in world units. `bands` are [centre, half-height, strength] in the surface's own heights, `span`
// its heights from bottom to top. Each band's edges wander; the folds are dark lines across the band, broken along their
// length, a fold every `D.fold` world units on average; a faint mottle lifts the ground.
function tieDyeData(key,w,h,[low,high],around,tall,bands,D,C){
  return cached(key,()=>{
    const data=new Uint8Array(w*h*4),ground=hex(C.ground),dye=hex(C.dye),bright=hex(C.bright),seed=D.seed+key.length;
    const cells=Math.max(2,Math.round(around/.05)),rows=Math.max(2,Math.round(tall/.05)),wander=valueNoise(seed,cells,rows+2),mottle=valueNoise(seed+1,cells*2,rows*2+2),fine=valueNoise(seed+2,cells*6,rows*6+2);
    // The folds: lines at irregular places round the surface, each with its own width, darkness and breaks.
    const count=Math.max(3,Math.round(around/D.fold)),rand=random(seed+3),folds=[];
    for(let k=0;k<count;k++)folds.push({u:(k+.25+rand()*.5)/count,width:(.35+rand()*.65)*D.foldWidth/around,dark:.55+.45*rand(),breaks:valueNoise(seed+10+k,1,Math.max(2,Math.round(tall/.07))+2),lean:(rand()-.5)*.02});
    for(let y=0;y<h;y++){const v=(y+.5)/h,yy=low+(high-low)*v;
      for(let x=0;x<w;x++){const u=(x+.5)/w,i=(y*w+x)*4;
        // How much dye reached here: each band, its edges pushed up and down by the wander.
        const shift=(wander(u*cells,v*rows)-.5)*D.wander;let d=0;
        for(const [c,half,strength] of bands)d=Math.max(d,strength*smooth(1-Math.abs(yy+shift-c)/half));
        // The folds keep the dye out along their lines, most at the middle of a band.
        let fold=0;for(const f of folds){let du=Math.abs(u-f.u-f.lean*(v-.5));du=Math.min(du,1-du);if(du>f.width*1.6)continue;
          const along=smooth((f.breaks(0,v*(tall/.07))-.15)*3);fold=Math.max(fold,f.dark*along*smooth(1-du/(f.width*1.6)));}
        d*=1-fold*smooth(d*2);
        // Mottle: the dye is patchy inside the bands, and a little reaches the ground between them.
        const m=mottle(u*cells*2,v*rows*2),g=fine(u*cells*6,v*rows*6);d=clamp(d*(.72+.5*m)+D.ground*smooth((m-.55)*2.5));
        const lift=1+.1*(g-.5);
        for(let k=0;k<3;k++){const c=d<.6?ground[k]+(dye[k]-ground[k])*smooth(d/.6):dye[k]+(bright[k]-dye[k])*smooth((d-.6)/.4);data[i+k]=clamp(Math.round(c*lift),0,255);}
        data[i+3]=255;}}
    return {data,w,h};});
}
// The fine pile of the velour, as a bump map: a soft, even grain.
function pileData(){
  return cached('pile',()=>{const w=64,h=64,rand=random(83),data=new Uint8Array(w*h*4);
    for(let i=0;i<w*h;i++){const v=128+(rand()-.5)*90;data[i*4]=data[i*4+1]=data[i*4+2]=v;data[i*4+3]=255;}return {data,w,h};});
}
// The woven logo patch: a white-edged letter C, its stroke blue, with a red half-disc inside it on the left.
function logoData(C){
  return cached('logo'+C.logoBlue+C.logoRed,()=>{const Cv=canvas(160,128),cx=74,cy=64,open=.62,inMouth=(x,y)=>Math.abs(Math.atan2(y-cy,x-cx))<open;
    Cv.fillShape((x,y)=>((x-cx)/66)**2+((y-cy)/56)**2<1&&!(inMouth(x,y)&&((x-cx)/30)**2+((y-cy)/22)**2>1),C.logoWhite);
    Cv.fillShape((x,y)=>{const r=((x-cx)/58)**2+((y-cy)/48)**2;return r<1&&r>.36&&!(Math.abs(Math.atan2(y-cy,x-cx))<open+.12);},C.logoBlue);
    Cv.fillShape((x,y)=>((x-cx)/26)**2+((y-cy)/24)**2<1&&x<cx+2,C.logoRed);
    return Cv;});
}
// The tonal chest mark: a small C stitched in a thread a little lighter than the ground, its inside echoed by a curve.
function chestMarkData(C){
  return cached('chest'+C.embroidery,()=>{const Cv=canvas(128,128);
    Cv.stroke(arc(64,64,44,40,.7,Math.PI*2-.7,40),7,C.embroidery);Cv.stroke(arc(64,64,18,18,Math.PI/2,Math.PI*1.5,16),5,C.embroidery);return Cv;});
}
export function makeVelourHoodie(id,spec,overSkirt=false){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,H=spec.hood,D=spec.cords,C=spec.colours,Y=spec.dye,hem=B.hem,band=B.band,neck=B.rows[0][0];
  const flare=overSkirt?B.bandOverSkirt:B.bandRadius,rows=[...B.rows,[hem+band+.012,...flare]];
  // Velour: a deep pile that turns light at glancing angles (a strong sheen), over a soft matte base.
  const velour=(map,u,v,colour='#ffffff')=>new T.MeshPhysicalMaterial({map,color:colour,roughness:.82,sheen:1,sheenColor:new T.Color(C.sheen),sheenRoughness:.42,
    bumpMap:dataTexture(pileData().data,64,64,false,[u,v]),bumpScale:.0012,side:T.DoubleSide});
  const rib=(u,v)=>{const m=velour(null,u,v,C.rib);m.bumpScale=.003;return m;};
  // The body, its dye mapped by angle and height.
  const around=2*Math.PI*.31*1.06,bodyDye=tieDyeData('body'+id,1024,512,[hem+band,neck],around,(neck-hem-band)*.76,Y.body,Y,C);
  const body=shell(top,rows,velour(dataTexture(bodyDye.data,bodyDye.w,bodyDye.h),30,22),'hoodie-body',128);
  body.material.map.wrapT=T.ClampToEdgeWrapping;
  const bp=body.geometry.attributes.position,buv=body.geometry.attributes.uv;
  for(let k=0;k<buv.count;k++)buv.setXY(k,(k%129)/128,clamp((bp.getY(k)-hem-band)/(neck-hem-band)));
  buv.needsUpdate=true;
  // The rib band, straight under the relaxed body, which blouses over it.
  const [brx,brz]=flare;
  ribbed(shell(top,[[hem+band+.012,brx-.004,brz-.003],[hem+band/2,brx-.002,brz-.001],[hem,brx-.004,brz-.002]],rib(60,6),'ribbed-hem-band',B.ribs*8),B.ribs,.006);
  const logo=logoData(C);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    // Full sleeves from dropped shoulders, dyed in bands of their own, blousing over long ribbed cuffs.
    const yt=S.rows[0][0],yb=S.rows.at(-1)[0],sd=tieDyeData('sleeve'+id+side,512,256,[yb,yt],2*Math.PI*.14,(yt-yb),Y.sleeve,{...Y,seed:Y.seed+(side>0?5:9)},C);
    const map=dataTexture(sd.data,sd.w,sd.h);map.wrapT=T.ClampToEdgeWrapping;
    const sleeve=shell(arm,S.rows,velour(map,14,20),'knit-jumper-sleeve',96),su=sleeve.geometry.attributes.uv,sp=sleeve.geometry.attributes.position;
    for(let k=0;k<su.count;k++)su.setXY(k,(k%97)/96,clamp((sp.getY(k)-yb)/(yt-yb)));
    su.needsUpdate=true;roundSleeveCap(sleeve,side,yt);
    easeOverHand(ribbed(shell(arm,S.cuff,rib(14,4),'ribbed-cuff',S.cuffRibs*8),S.cuffRibs,.03),side);
    // The logo patch on one sleeve, just above the cuff on its outer side, laid on the sleeve (found by casting in
    // toward its axis), keeping its shape in the world.
    if(side===spec.logo.side){
      const L=spec.logo,ray=new T.Raycaster(),[pw,ph]=L.size,pmap=dataTexture(logo.data,logo.w,logo.h);pmap.wrapS=pmap.wrapT=T.ClampToEdgeWrapping;
      arm.updateMatrixWorld(true);sleeve.updateMatrixWorld(true);
      grid(arm,10,8,(u,v)=>{const a=Math.PI/2*side+L.turn*side+(u-.5)*pw/.13*side,y=L.y+(v-.5)*ph/.76,o=new T.Vector3(Math.sin(a)*.4,y,Math.cos(a)*.4),dir=new T.Vector3(-Math.sin(a),0,-Math.cos(a));
        arm.localToWorld(o);dir.transformDirection(arm.matrixWorld);ray.set(o,dir);const hit=ray.intersectObject(sleeve)[0];
        const p=hit?hit.point:o;arm.worldToLocal(p);return p.add(new T.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(.003)).toArray();},
      new T.MeshStandardMaterial({map:pmap,transparent:true,alphaTest:.4,roughness:.7,side:T.DoubleSide}),'logo-patch');
    }
    top.add(arm);
  }
  const at=bodyAt(B.rows),hoodDye=tieDyeData('hood'+id,256,256,[0,1],.5,.3,Y.hood,{...Y,seed:Y.seed+13},C),hoodVelour=velour(dataTexture(hoodDye.data,hoodDye.w,hoodDye.h),8,8);
  // The hood, worn down (userData.underJacket false: put away under a jacket): a rounded pouch over her upper back,
  // fuller toward the bottom, where the folded hood gathers, as on the other hoodies.
  const hood=new T.Group();hood.name='hood-down';hood.userData.underJacket=false;top.add(hood);
  const U=24,W=16,pouch=(u,v)=>{const yb=H.bottom+H.round*u*u,y=H.top-(H.top-yb)*v,half=H.halfWidth*(1-.25*v*v),[rx]=[at(Math.PI/2,y).x];
    const a=Math.PI+Math.asin(Math.max(-.98,Math.min(.98,u*half/rx)));
    return at(a,y,H.lift*Math.max(0,1-u*u)**.7*Math.sin(Math.PI*(.12+.88*v))**.8*(.8+.25*v)+.006);};
  const rings=[];for(let j=0;j<=W;j++){const ring=[];for(let i=0;i<=U;i++)ring.push(pouch(-1+2*i/U,j/W).toArray());rings.push(ring);}
  ringShell(hood,rings,hoodVelour,'hood');
  const rim=[];for(let j=0;j<=W;j++)rim.push(pouch(-1,j/W).toArray());for(let i=1;i<U;i++)rim.push(pouch(-1+2*i/U,1).toArray());for(let j=W;j>=0;j--)rim.push(pouch(1,j/W).toArray());
  curve(hood,rim,H.edge,hoodVelour,'hood-edge');
  curve(hood,Array.from({length:W+1},(_,j)=>pouch(0,j/W).toArray()).map(([x,y,z])=>[x,y,z-.002]),.0016,hoodVelour,'hood-seam');
  // Its opening round her neck, the hood's sides crossing at the centre front, lined in the same velour.
  const O=H.opening,opening=(out,lift,k)=>{const a=O.from+(Math.PI*2-2*O.from)*k;return at(a,neck+O.rise*(1-Math.cos(a))/2+lift-O.dip*Math.max(0,Math.cos(a))**4,out).toArray();};
  const ring=(out,lift)=>Array.from({length:49},(_,k)=>opening(out,lift,k/48));
  ringShell(hood,[ring(O.out,O.band),ring(O.out-.004,0)],velour(null,6,2,C.lining),'hood-lining');
  curve(hood,ring(O.out+.003,O.band),O.radius,hoodVelour,'hood-opening');
  // Round cream drawcords from the opening either side of the centre, hanging down her chest, each tied in a knot near
  // its end, with a short tuft below it.
  const cord=new T.MeshStandardMaterial({color:C.cord,roughness:.85});
  const probe=(()=>{top.updateMatrixWorld(true);const p=surfaceProbe(top,['hoodie-body']);return (x,y)=>p(x,y,true);})();
  for(const s of [-1,1]){
    const path=[];for(let k=0;k<=10;k++){const t=k/10,y=D.top-(D.top-D.knot)*t,x=s*(D.x+D.drift*t),hit=probe(x,y);if(hit)path.push(hit.point.clone().addScaledVector(hit.normal,D.radius+.004+.003*Math.sin(t*Math.PI)).toArray());}
    curve(hood,path,D.radius,cord,'drawcord');
    const end=new T.Vector3(...path.at(-1));oval(hood,end.toArray(),[D.radius*2,D.radius*1.6,D.radius*1.8],cord,'cord-knot',16);
    const rand=random(s>0?3:7);for(let k=0;k<5;k++){const dx=(rand()-.5)*D.radius*1.6,dz=(rand()-.5)*D.radius*.8;
      curve(hood,[[end.x+dx*.3,end.y-D.radius,end.z+dz*.3],[end.x+dx,end.y-D.tassel*(.75+.25*rand()),end.z+dz]],.0018,cord,'cord-tassel');}
  }
  // Under a jacket: a plain ribbed neckband the width of the other tops' necks (userData.underJacket true).
  const neckband=new T.Group();neckband.name='jacket-neckband';neckband.userData.underJacket=true;neckband.visible=false;top.add(neckband);
  ribbed(shell(neckband,[[neck+.035,.108,.1],[neck+.012,.111,.102],[neck-.005,.116,.106]],rib(30,2),'crew-neckband',256),32,.012);
  // The tonal mark on her left chest, laid on the velour.
  top.updateMatrixWorld(true);const onBody=surfaceProbe(top,['hoodie-body']),[mx,my]=spec.chestMark.at,ms=spec.chestMark.size;
  const mark=chestMarkData(C),markMap=dataTexture(mark.data,mark.w,mark.h);markMap.wrapS=markMap.wrapT=T.ClampToEdgeWrapping;
  grid(top,12,12,(u,v)=>{const hit=onBody(mx+(u-.5)*ms/1.06,my+(v-.5)*ms/.76,true);return hit?hit.point.clone().addScaledVector(hit.normal,.002).toArray():[mx,my,.25];},
    new T.MeshPhysicalMaterial({map:markMap,transparent:true,alphaTest:.4,roughness:.6,sheen:.6,sheenColor:new T.Color(C.sheen),side:T.DoubleSide}),'embroidered-mark');
  return top;
}
