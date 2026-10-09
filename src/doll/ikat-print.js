// Ikat print for the Pepe Jeans shirt, drawn here from the reference reading (not copied from the photos): on white,
// soft vertical streaks of lavender and periwinkle, with tall diamonds on a half-drop grid: navy clusters of four split
// by a white cross, single and paired navy diamonds, coral diamonds and large faint periwinkle ones. Every edge is
// feathered up and down, as the dyed threads of an ikat slip against each other.
// The tile repeats seamlessly both ways.
import { random } from './model.js';

// Colours measured on the studio photo (the user's own flat lay has a blue cast): navy about (43, 42, 60), coral
// (216, 115, 118) where it blurs and stronger at its centre, periwinkle (149, 151, 183) to (164, 167, 198), white
// (226, 224, 233). The blues are much deeper than measured: the studio's exposure and tone mapping wash pale blues out
// toward white (calibrated in renders).
const INK={white:[232,231,240],lavender:[160,166,214],periwinkle:[104,116,186],grey:[140,146,178],navy:[26,26,48],coral:[226,74,70]};
const W=512,H=768,COLS=4,ROWS=4;
// Wrapping value noise with its own cell size across and down.
function wrapNoise(seed,cols,rows){const r=random(seed),g=new Float32Array(cols*rows);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{let xi=Math.floor(x),yi=Math.floor(y);const fx=x-xi,fy=y-yi;xi=((xi%cols)+cols)%cols;yi=((yi%rows)+rows)%rows;
    const x1=(xi+1)%cols,r0=yi*cols,r1=((yi+1)%rows)*cols,a=g[r0+xi],b=g[r0+x1],c=g[r1+xi],d=g[r1+x1],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
// Motifs as tall diamonds [x, y, half-width, half-height] about a grid point, in pixels.
const MOTIFS={
  // Four diamonds in a diamond, parted by a white cross.
  navyCluster:{ink:'navy',parts:[[0,-41,14,34],[0,41,14,34],[-20,0,14,34],[20,0,14,34]]},
  navySingle:{ink:'navy',parts:[[0,0,15,42]]},
  navyPair:{ink:'navy',parts:[[0,-36,14,35],[0,36,14,35]]},
  coralSingle:{ink:'coral',parts:[[0,0,15,44]]},
  coralCluster:{ink:'coral',parts:[[-15,-24,14,34],[15,-24,14,34],[0,36,14,34]]},
  ghost:{ink:'periwinkle',parts:[[0,0,40,100]],soft:true},
};
const PLAN=['navyCluster','ghost','coralSingle','navySingle','coralCluster','ghost','navyPair','coralSingle','ghost','navyCluster','coralSingle','navySingle'];
let pixels=null;
export function ikatData(){
  if(pixels)return pixels;
  const data=new Uint8Array(W*H*4),rand=random(57);
  // Streaks: noise drawn out up the cloth (fine across, long down), in bands of lavender, grey and periwinkle over white.
  const streak=wrapNoise(3,48,6),broad=wrapNoise(4,6,3),fringe=wrapNoise(5,256,96),slip=wrapNoise(6,1,H/3);
  const mix=(a,b,t)=>a.map((c,k)=>c+(b[k]-c)*t);
  const smooth=(e0,e1,x)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);};
  const ink=new Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const s=.62*streak(x/W*48,y/H*6)+.38*broad(x/W*6,y/H*3);
    let c=INK.white;c=mix(c,INK.lavender,smooth(.3,.42,s));c=mix(c,INK.grey,smooth(.44,.54,s)*.6);c=mix(c,INK.periwinkle,smooth(.53,.66,s));
    ink[y*W+x]=c;}
  // Motifs on a half-drop grid; each row of threads slips a little sideways, and the tips fray up and down.
  const cw=W/COLS,rh=H/ROWS;let n=0;
  for(let col=0;col<COLS;col++)for(let row=0;row<ROWS;row++){
    const M=MOTIFS[PLAN[(n++*7+col*3)%PLAN.length]],cx=col*cw+cw/2+(rand()-.5)*10,cy=row*rh+(col%2)*rh/2+rh/2+(rand()-.5)*14,colour=INK[M.ink];
    for(const [px,py,a,b] of M.parts){const ext=Math.ceil(b*1.5);
      for(let dy=-ext;dy<=ext;dy++)for(let dx=-Math.ceil(a*1.6);dx<=Math.ceil(a*1.6);dx++){
        const X=((Math.round(cx+px+dx)%W)+W)%W,Y=((Math.round(cy+py+dy)%H)+H)%H;
        // The slip: a sideways shift that changes every few rows.
        const sx=dx+6*(slip(0,Y/3)-.5),f=fringe(X/W*256,Y/H*96);
        const d=Math.abs(sx)/a+Math.abs(dy)/b-1-.35*(f-.5)*(Math.abs(dy)/b);
        if(d>.12)continue;
        const t=M.soft?.55*smooth(.12,-.25,d):smooth(.12,-.06,d)*(.9+.1*f);
        ink[Y*W+X]=mix(ink[Y*W+X],colour,t);}}
  }
  for(let i=0;i<W*H;i++){const c=ink[i],g=1+(rand()-.5)*.03;for(let k=0;k<3;k++)data[i*4+k]=Math.max(0,Math.min(255,c[k]*g));data[i*4+3]=255;}
  pixels={data,w:W,h:H};return pixels;
}
