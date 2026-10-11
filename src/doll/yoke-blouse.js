// Yoke blouse: a boxy, collarless blouse in a soft, fluid fabric, gathered below a yoke front and back, with a round
// neckline, a short buttoned placket down the front, puffed shoulders and full three-quarter sleeves gathered into
// narrow bands.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
import * as T from 'three';
import { random, solid, oval, curve, shell, roundSleeveCap } from './model.js';

const SEG=128;
const pixels=new Map();
// Crepe: a fine, irregular pebbled crinkle, as a height map.
function crepe(repeat){
  if(!pixels.has('crepe')){const n=128,rand=random(83),data=new Uint8Array(n*n*4),g=Array.from({length:n*n},()=>rand());
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){let v=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)v+=g[((y+dy+n)%n)*n+(x+dx+n)%n];const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(v/9*255);data[i+3]=255;}
    pixels.set('crepe',{data,n});}
  const {data,n}=pixels.get('crepe'),t=new T.DataTexture(data,n,n,T.RGBAFormat);
  t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;
}
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// The body's radii at a height, from its rows.
function radii(rows,y){
  let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;
  const t=Math.max(0,Math.min(1,(rows[k][0]-y)/(rows[k][0]-rows[k+1][0])));
  return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];
}
// The yoke's seam height at an angle round her (0 = centre front), from its front and back heights.
const yokeAt=(Y,a)=>Y.back+(Y.front-Y.back)*(1+Math.cos(a))/2;
export function makeYokeBlouse(id,spec,overSkirt=false){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,Y=spec.yoke,P=spec.placket,C=spec.colours,rows=overSkirt&&B.tucked?B.tucked:B.rows,hem=rows.at(-1)[0];
  const fabric=repeat=>new T.MeshPhysicalMaterial({color:C.fabric,roughness:.72,sheen:.6,sheenColor:new T.Color(C.sheen),sheenRoughness:.45,bumpMap:crepe(repeat),bumpScale:.0012,side:T.DoubleSide});
  const stitch=solid(C.stitch,.8);
  // The body, gathered just below the yoke's seam all round: fine folds, deepest under the seam and fading toward the
  // hem, kept off the placket.
  const body=shell(top,rows,fabric([90,60]),'blouse-body',SEG),p=body.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(x,z),seam=yokeAt(Y,a);if(y>=seam)continue;
    const t=Math.min(1,(seam-y)/(seam-hem)),r=Math.hypot(x,z),off=Math.min(1,Math.abs(x)/(P.half*2.5))**2*(z>0?1:0)+(z>0?0:1);
    const k=1+Y.depth*(1-t)**1.2*smooth(0,.03,t)*off*Math.cos(a*Y.folds)/r;p.setX(i,x*k);p.setZ(i,z*k);}
  p.needsUpdate=true;body.geometry.computeVertexNormals();
  // The yoke's seam all round, just proud of the body, and the hem's stitching.
  const ring=(yOf,lift,name,r=.0015)=>curve(top,Array.from({length:SEG+1},(_,k)=>{const a=k/SEG*Math.PI*2,y=yOf(a),[rx,rz]=radii(rows,y);return [Math.sin(a)*(rx+lift),y,Math.cos(a)*(rz+lift)];}),r,stitch,name);
  ring(a=>yokeAt(Y,a),.004,'yoke-seam');
  ring(()=>hem+.012,.0045,'hem-stitch');
  // The round neckline, finished with a narrow bound edge.
  const neck=rows[0];curve(top,Array.from({length:97},(_,k)=>{const a=k/96*Math.PI*2;return [Math.sin(a)*(neck[1]+.002),neck[0]-.004,Math.cos(a)*(neck[2]+.002)];}),.0035,fabric([20,2]),'bound-neckline');
  // The placket: a narrow band down the centre front from the neckline, stitched down both sides and across its end,
  // with small round buttons.
  const onFront=(x,y,lift)=>{const [rx,rz]=radii(rows,y),a=Math.asin(Math.max(-1,Math.min(1,x/rx)));return [x,y,Math.cos(a)*rz+lift];};
  const band=[];for(let j=0;j<=12;j++){const y=P.top-(P.top-P.bottom)*j/12;band.push([[-P.half,y],[P.half,y]].map(([x,yy])=>onFront(x,yy,.0035)));}
  const geo=new T.BufferGeometry(),pos=[],idx=[];band.forEach(([l,r])=>pos.push(...l,...r));for(let j=0;j<12;j++){const a=j*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  const placket=new T.Mesh(geo,fabric([4,20]));placket.name='blouse-placket';top.add(placket);
  for(const s of [-1,1])curve(top,Array.from({length:13},(_,j)=>onFront(s*P.half*.8,P.top-(P.top-P.bottom)*j/12,.0045)),.0011,stitch,'placket-stitch');
  curve(top,[-1,0,1].map(s=>onFront(s*P.half*.8,P.bottom+.006,.0045)),.0011,stitch,'placket-stitch');
  const button=new T.MeshPhysicalMaterial({color:C.button,roughness:.35,clearcoat:.6,clearcoatRoughness:.3});
  for(const y of P.buttons){const [x,yy,z]=onFront(0,y,.006);oval(top,[x,yy,z],[P.button,P.button,P.button*.35],button,'blouse-button',16);}
  // Full three-quarter sleeves, puffed at the shoulder (fine gathers round the cap) and gathered again into a narrow band
  // below her elbow.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const yt=S.rows[0][0],yb=S.rows.at(-1)[0],sleeve=shell(arm,S.rows,fabric([30,30]),'mesh-shirt-sleeve',96),q=sleeve.geometry.attributes.position;
    for(let i=0;i<q.count;i++){const x=q.getX(i),y=q.getY(i),z=q.getZ(i),a=Math.atan2(x,z);
      const cap=smooth(yt-S.puff.reach,yt,y),cuff=smooth(yb+S.gather.reach,yb,y),k=1+Math.cos(a*S.puff.folds)*S.puff.depth*cap+Math.cos(a*S.gather.folds)*S.gather.depth*cuff;
      q.setX(i,x*k);q.setZ(i,z*k);}
    q.needsUpdate=true;sleeve.geometry.computeVertexNormals();
    roundSleeveCap(sleeve,side,yt);
    shell(arm,S.band,fabric([20,2]),'sleeve-band',64);
    const [by,brx,brz]=S.band[0];curve(arm,Array.from({length:65},(_,k)=>{const a=k/64*Math.PI*2;return [Math.sin(a)*(brx+.0015),by-.002,Math.cos(a)*(brz+.0015)];}),.0012,stitch,'band-stitch');
    top.add(arm);
  }
  return top;
}
