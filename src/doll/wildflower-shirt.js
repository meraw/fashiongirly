// Wildflower shirt (template 'wildflower-shirt'): a button-down shirt in a soft crepe printed all over with a watercolour
// meadow: lilac leaves and lily heads washed in loosely, fine green stems and sprigs, clusters of orange dabs, red
// five-petal flowers and salmon blossoms, scattered speckles, on a peach-cream ground. The print is drawn here in code
// (not copied from the product photos), in translucent washes that darken a little at their edges, as watercolour dries.
// The shirt itself is the button-down shirt template (makeShirt in src/doll/shirts.js), styled from the catalog `build`.
import { random } from './model.js';
import { makeShirt, crepeData, RELAXED_ROWS, TUCKED_ROWS } from './shirts.js';

const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const smooth=(a,b,t)=>{const f=Math.max(0,Math.min(1,(t-a)/(b-a)));return f*f*(3-2*f);};
const cache=new Map();
// The print, one tile that repeats round her (wrapping at its edges). `P` holds the ground, the inks and the seed.
function wildflowerData(P){
  const key=JSON.stringify(P);if(cache.has(key))return cache.get(key);
  const size=512,rand=random(P.seed),I=Object.fromEntries(Object.entries(P.inks).map(([k,v])=>[k,hex(v)])),ground=hex(P.ground),px=new Float32Array(size*size*3);
  // The ground, washed unevenly: soft paler and warmer patches from a few wrapping waves.
  const waves=[...Array(6)].map(()=>[1+Math.floor(rand()*3),1+Math.floor(rand()*3),rand()*7,rand()*7]);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){let w=0;for(const [a,b,p,q] of waves)w+=Math.sin(2*Math.PI*a*x/size+p)*Math.sin(2*Math.PI*b*y/size+q);
    const i=(y*size+x)*3;for(let k=0;k<3;k++)px[i+k]=ground[k]*(1+.012*w);}
  // A translucent wash of `colour` over a shape: inside(dx, dy) is how far inside it a point is, in pixels. The pigment
  // gathers a little at the edge, which dries darker.
  const paint=(cx,cy,reach,colour,inside,amount=.8)=>{
    for(let y=Math.floor(cy-reach);y<=Math.ceil(cy+reach);y++)for(let x=Math.floor(cx-reach);x<=Math.ceil(cx+reach);x++){
      const d=inside(x+.5-cx,y+.5-cy);if(d<=-1)continue;const edge=d<1.6?.82:1,a=smooth(-1,1,d)*amount;if(a<=0)continue;
      const i=((((y%size)+size)%size)*size+(((x%size)+size)%size))*3;for(let k=0;k<3;k++)px[i+k]+=(colour[k]*edge-px[i+k])*a;}};
  const disc=r=>(dx,dy)=>r-Math.hypot(dx,dy);
  // A blob with a wobbly outline, as a loaded brush leaves.
  const dab=(r,seed)=>(dx,dy)=>{const a=Math.atan2(dy,dx);return r*(1+.18*Math.sin(3*a+seed)+.1*Math.sin(5*a+2*seed))-Math.hypot(dx,dy);};
  const flower=(r,n,turn)=>(dx,dy)=>{const d=Math.hypot(dx,dy),c=Math.abs(Math.cos(n*(Math.atan2(dy,dx)-turn)/2));return r*(.45+.55*c**.6)-d;};
  const leaf=(len,w,turn)=>(dx,dy)=>{const c=Math.cos(turn),s=Math.sin(turn),u=dx*c+dy*s,v=-dx*s+dy*c;if(u<0||u>len)return -Math.min(Math.abs(u),Math.abs(u-len));const t=u/len;return w*Math.sin(Math.PI*t**.8)-Math.abs(v);};
  // A stem: a fine curving stroke from (x, y) at angle `a`, bending by `bend`, `len` long.
  const stem=(x,y,a,len,bend,width,colour,amount)=>{const n=Math.ceil(len/1.5),pts=[];for(let k=0;k<=n;k++){const t=k/n,ang=a+bend*t;pts.push([x,y]);x+=Math.cos(ang)*len/n;y+=Math.sin(ang)*len/n;}
    for(const [qx,qy] of pts)paint(qx,qy,width+2,colour,disc(width),amount*.35);return pts;};
  // Large lilac leaves and lily heads first, loose and pale, behind everything else.
  for(let k=0;k<22;k++){const x=rand()*size,y=rand()*size,a=rand()*Math.PI*2,len=48+rand()*40,w=11+rand()*8;
    paint(x,y,len+4,rand()<.5?I.lilac:I.lilacPale,leaf(len,w,a),.7);
    if(rand()<.6)paint(x,y,len+4,I.lilac,leaf(len*.7,w*.35,a+.25),.45);}
  // Green stems with small leaves, in sprays.
  for(let k=0;k<55;k++){const x=rand()*size,y=rand()*size,a=-Math.PI/2+(rand()-.5)*2.4,len=30+rand()*45;
    const pts=stem(x,y,a,len,(rand()-.5)*1.2,1.2,I.green,.95);
    for(let j=0;j<4;j++){const [qx,qy]=pts[Math.floor(rand()*pts.length)],side=rand()<.5?1:-1;paint(qx,qy,18,rand()<.6?I.green:I.sage,leaf(9+rand()*8,3+rand()*2,a+side*(.6+rand()*.6)),.8);}}
  // Orange flowers: clusters of loose dabs in two oranges.
  for(let k=0;k<48;k++){const x=rand()*size,y=rand()*size,n=5+Math.floor(rand()*6);
    for(let j=0;j<n;j++){const r=5+rand()*6,dx=(rand()-.5)*34,dy=(rand()-.5)*34;paint(x+dx,y+dy,r*1.4+2,rand()<.55?I.orange:I.orangePale,dab(r,rand()*7),.88);}}
  // Red five-petal flowers with a darker heart, and small red buds.
  for(let k=0;k<50;k++){const x=rand()*size,y=rand()*size,r=9+rand()*7;paint(x,y,r+2,I.red,flower(r,5,rand()*7),.92);paint(x,y,r*.4,I.redDark,disc(r*.28),.75);}
  for(let k=0;k<70;k++){const x=rand()*size,y=rand()*size;paint(x,y,8,I.red,dab(3+rand()*3,rand()*7),.88);}
  // Salmon blossoms, a few in each spray.
  for(let k=0;k<36;k++){const x=rand()*size,y=rand()*size,r=6+rand()*6;paint(x,y,r+2,I.salmon,flower(r,5,rand()*7),.8);}
  // Speckles of yellow-orange pollen between them.
  for(let k=0;k<260;k++){const x=rand()*size,y=rand()*size;paint(x,y,4,rand()<.5?I.orangePale:I.orange,disc(1.2+rand()*1.6),.75);}
  const data=new Uint8Array(size*size*4);
  for(let i=0;i<size*size;i++){const n=1+(rand()-.5)*.02;for(let k=0;k<3;k++)data[i*4+k]=Math.max(0,Math.min(255,px[i*3+k]*n));data[i*4+3]=255;}
  const out={data,w:size,h:size};cache.set(key,out);return out;
}

// The shirt's style for makeShirt(), from its catalog `build`: the print and how many tiles go round her body, sleeve and
// collar (`around`, `sleeveAround`, `collarAround`) and how tall a tile is (`high`); the rest are shirt style settings
// (stitch, button, buttons, collar, cuff, sleeve, shirttail, backYoke and so on), on the relaxed hip-length shirt's rows.
const wildflowerShirt=({template,print,sheen,...rest})=>({bump:[crepeData,40,30,.0012],sheen:[sheen,.25,.55],roughness:.74,facing:null,collarTopstitch:false,open:null,
  rows:RELAXED_ROWS,tucked:TUCKED_ROWS,depth:.7,collarAround:1,...rest,print:()=>wildflowerData(print)});
export function makeWildflowerShirt(id,build,skirt=false){return makeShirt(id,wildflowerShirt(build),null,skirt);}
