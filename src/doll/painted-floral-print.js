// The Desigual painted floral jumper's print, drawn locally from the reference reading (not copied from the photos):
// big soft flowers in pastel pink, cream, lilac white, mint and blues on black, knitted in as a jacquard, so every
// colour sits in whole stitches and the flowers' edges break up into scattered stitches and spray, with black stitches
// flecked into them.
// Textures are laid out as printed-long-tee.js expects: the body holds a front and a back panel side by side, each
// projected flat; row 0 is the hem (or the cuff), the last row the neck (or the shoulder).
// In the spec, a flower is { at: [x, y], r, ink, edge, shade, ring, lobes, spikes, squash, turn }:
// - on the body, x runs 0 to 1 across its panel (the front as seen from the front, the back as seen from behind) and y
//   0 to 1 from the neck to the hem; on a sleeve, x runs round the arm from the middle of its outside (-.5 to .5,
//   toward the front first) and y from the shoulder to the cuff;
// - `density` (0 to 1) thins it out to speckles;
// - r is the flower's radius in world units; `ink` its colour, fading to `edge` toward its rim, with patches of `shade`;
//   `ring` [from, to, start, end] a band of black stitches across it (fractions of the radius, and an arc in degrees,
//   clockwise from her left); `lobes` the petals' count and depth; `spikes` how ragged its rim; `squash` its height over
//   its width; `turn` (degrees) how its lobes are turned.
import { random } from './model.js';

const PX=1300,TALL=.76;// texture pixels per world unit; the outfit's scale up
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
// Smooth value noise that repeats every `period` cells across (and `rows` down).
function valueNoise(seed,period,rows){const r=random(seed),g=new Float32Array(period*rows);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{let xi=Math.floor(x),yi=Math.floor(y);const fx=x-xi,fy=y-yi;xi%=period;if(xi<0)xi+=period;yi%=rows;if(yi<0)yi+=rows;
    const x1=xi+1===period?0:xi+1,r0=yi*period,r1=(yi+1===rows?0:yi+1)*period,a=g[r0+xi],b=g[r0+x1],c=g[r1+xi],d=g[r1+x1],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
// A stable pseudo-random number for a stitch.
const hash=(x,y,s)=>{let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};

// The stitches' colours: `cols` across (wrapping round when `wrap`) by `rows` down, each `cw` by `ch` pixels, painted
// with the flowers in order over the black ground. `place(f)` gives a flower's centre in pixels.
function stitches(cols,rows,cw,ch,flowers,P,wrap,seed,place){
  const ground=hex(P.ground),inks=Object.fromEntries(Object.entries(P.inks).map(([k,v])=>[k,hex(v)])),cells=new Float32Array(cols*rows*3);
  for(let i=0;i<cols*rows;i++)cells.set(ground,i*3);
  const W=cols*cw,warp=valueNoise(seed+1,Math.max(1,Math.round(W/70)),Math.max(1,Math.round(rows*ch/70))),patch=valueNoise(seed+2,Math.max(1,Math.round(W/45)),Math.max(1,Math.round(rows*ch/45)));
  flowers.forEach((f,n)=>{
    const [fx,fy]=place(f),R=f.r*PX,ink=inks[f.ink],edge=inks[f.edge??f.ink],shade=f.shade&&inks[f.shade],sq=f.squash??1;
    const [lobes,depth]=f.lobes??[5,.12],spikes=f.spikes??.22,turn=(f.turn??0)*Math.PI/180,rim=valueNoise(seed+10+n,48,1),soft=f.soft??.1;
    const reach=R*1.55,c0=Math.floor((fx-reach)/cw),c1=Math.ceil((fx+reach)/cw),r0=Math.max(0,Math.floor((fy-reach*sq)/ch)),r1=Math.min(rows-1,Math.ceil((fy+reach*sq)/ch));
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
      let cc=c;if(wrap)cc=((c%cols)+cols)%cols;else if(c<0||c>=cols)continue;
      const x=(c+.5)*cw,y=(r+.5)*ch,dx=x-fx,dy=(y-fy)/sq,a=Math.atan2(dy,dx);
      // The rim: lobed petals, ragged into fine spikes, the whole flower pushed about by a soft warp.
      const edgeR=R*(1+depth*Math.cos(lobes*a+turn)+spikes*(rim((a/Math.PI/2+.5)*48,0)-.5));
      const d=Math.hypot(dx,dy)*(1+.35*(warp(x/70,y/70)-.5)),t=(edgeR-d)/(R*soft),h=hash(cc,r,seed+n*7);
      let paint=h<clamp(.5+t*.5)*(f.density??1);
      // Spray: single stitches scattered beyond the rim, thinning out.
      if(!paint&&d<edgeR*1.5&&h>1-(f.spray??.08)*(1-(d-edgeR)/(edgeR*.5)))paint=true;
      if(!paint)continue;
      const q=clamp(d/edgeR);let col=mix(ink,edge,clamp((q-.45)/.55)**1.3);
      if(shade&&patch(x/45,y/45)>.56)col=mix(col,shade,clamp((patch(x/45,y/45)-.56)*5));
      // A band of black stitches across the flower, as the dark fringe through the cream flower.
      if(f.ring){const [from,to,s,e]=f.ring,deg=((a*180/Math.PI)+360)%360;if(q>from&&q<to&&(s===undefined||(e>s?deg>=s&&deg<=e:deg>=s||deg<=e))&&hash(cc,r,seed+n*7+3)<.75)col=ground;}
      // Black stitches flecked in toward the rim.
      if(q>.7&&hash(cc,r,seed+n*7+5)<(q-.7)*.6)col=ground;
      cells.set(col,(r*cols+cc)*3);
    }
  });
  // The rows at the neck and the hem run on down the ribs, so they hold the colours round them, not single stitches.
  const edge=r=>{const out=new Float32Array(cols*3);for(let c=0;c<cols;c++)for(let n=0;n<3;n++){let sum=0,k=0;
    for(let dr=0;dr<8;dr++)for(let dc=-2;dc<=2;dc++){let cc=c+dc;if(wrap)cc=((cc%cols)+cols)%cols;else if(cc<0||cc>=cols)continue;const rr=Math.abs(r-dr);sum+=cells[(rr*cols+cc)*3+n];k++;}
    out[c*3+n]=sum/k;}return out;};
  const top=edge(0),bottom=edge(rows-1);cells.set(top,0);cells.set(bottom,(rows-1)*cols*3);
  return {cells,inks,ground};
}
// The texture's pixels: each stitch a flat colour, shaded a little darker at its sides as a knit stitch is, with a
// fine fibre noise; rows stored hem (or cuff) first.
function knitPixels(w,h,cols,rows,cw,ch,cells,seed){
  const data=new Uint8Array(w*h*4),rand=random(seed);
  for(let y=0;y<h;y++){const r=Math.min(rows-1,Math.floor(y/ch)),o=((h-1-y)*w)*4;
    for(let x=0;x<w;x++){const c=Math.min(cols-1,Math.floor(x/cw)),f=(x/cw-c-.5)*2,k=(1-.12*f*f)*(.96+.08*rand()),i=(r*cols+c)*3;
      for(let n=0;n<3;n++)data[o+x*4+n]=clamp(Math.round(cells[i+n]*k),0,255);data[o+x*4+3]=255;}}
  return data;
}

const cache=new Map();
// The body's texture: `panelW` pixels for each of the front and back panels, `h` rows.
export function paintedFloralBody(key,panelW,h,P){
  if(cache.has(key))return cache.get(key);
  const cw=P.stitch*PX,ch=P.stitch*PX*.85,cols=Math.round(panelW/cw),rows=Math.ceil(h/ch),w=panelW*2,data=new Uint8Array(w*h*4);
  for(const [side,flowers] of [[0,P.front],[1,P.back]]){
    const {cells}=stitches(cols,rows,panelW/cols,ch,flowers,P,false,P.seed+side*31,f=>[f.at[0]*panelW,f.at[1]*h]);
    const part=knitPixels(panelW,h,cols,rows,panelW/cols,ch,cells,P.seed+side);
    for(let y=0;y<h;y++)data.set(part.subarray(y*panelW*4,(y+1)*panelW*4),(y*w+side*panelW)*4);
  }
  const out={data,w,h};cache.set(key,out);return out;
}
// A sleeve's texture, `around` pixels round the arm and `len` down it; `outer` is where (0 to 1 round) the middle of the
// arm's outside falls, and `toFront` (1 or -1) which way round from there the front lies.
export function paintedFloralSleeve(key,around,len,P,flowers,outer,toFront,seed){
  if(cache.has(key))return cache.get(key);
  const cols=Math.max(1,Math.round(around/(P.stitch*PX))),cw=around/cols,ch=P.stitch*PX*.85,rows=Math.ceil(len/ch);
  const {cells}=stitches(cols,rows,cw,ch,flowers,P,true,seed,f=>[(((outer+toFront*f.at[0])%1)+1)%1*around,f.at[1]*len]);
  const out={data:knitPixels(around,len,cols,rows,cw,ch,cells,seed),w:around,h:len};cache.set(key,out);return out;
}
