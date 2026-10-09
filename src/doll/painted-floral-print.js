// The Desigual painted floral jumper's print, drawn locally from the reference reading (not copied from the photos):
// big flowers in pastel pink, cream, lilac white, mint and blues on black, knitted in as a jacquard, so every colour sits
// in whole stitches. Each flower is built of petals in rings, each shaded from a deep base to a light tip and parted from
// the next by a dark crease, round a centre; the knit only roughens their rims by a stitch or two.
// Textures are laid out as printed-long-tee.js expects: the body holds a front and a back panel side by side, each
// projected flat; row 0 is the hem (or the cuff), the last row the neck (or the shoulder).
// In the spec, a flower is { at: [x, y], r, ink, deep, tip, petals, rings, ruffle, centre, centreSize, squash, turn }:
// - on the body, x runs 0 to 1 across its panel (the front as seen from the front, the back as seen from behind) and y
//   0 to 1 from the neck to the hem; on a sleeve, x runs round the arm from the middle of its outside (-.5 to .5,
//   toward the front first) and y from the shoulder to the cuff;
// - r is the flower's radius in world units; its petals are `ink`, deepening to `deep` at their base and lightening to
//   `tip`; `petals` is the outer ring's count and `rings` how many rings lie over each other, each smaller and with one
//   petal fewer; `ruffle` waves the petals' tips (a rose's); `centre` is an ink, or 'dark' for black stamens, filling
//   `centreSize` of the radius; `squash` is its height over its width; `turn` (degrees) turns its petals.
// A flower with `speckle` (0 to 1) is instead a loose scatter of single stitches, as the ochre flecks are.
import { random } from './model.js';

const PX=1300;// texture pixels per world unit
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
// A stable pseudo-random number for a stitch.
const hash=(x,y,s)=>{let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};

// The stitches' colours: `cols` across (wrapping round when `wrap`) by `rows` down, each `cw` by `ch` pixels, painted
// with the flowers in order over the black ground. `place(f)` gives a flower's centre in pixels.
function stitches(cols,rows,cw,ch,flowers,P,wrap,seed,place){
  const ground=hex(P.ground),inks=Object.fromEntries(Object.entries(P.inks).map(([k,v])=>[k,hex(v)])),cells=new Float32Array(cols*rows*3);
  for(let i=0;i<cols*rows;i++)cells.set(ground,i*3);
  const white=[255,255,255];
  flowers.forEach((f,n)=>{
    const [fx,fy]=place(f),R=f.r*PX,sq=f.squash??1,rand=random(seed+n*13+1),reach=R*1.15;
    const c0=Math.floor((fx-reach)/cw),c1=Math.ceil((fx+reach)/cw),r0=Math.max(0,Math.floor((fy-reach*sq)/ch)),r1=Math.min(rows-1,Math.ceil((fy+reach*sq)/ch));
    const each=paint=>{for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){let cc=c;if(wrap)cc=((c%cols)+cols)%cols;else if(c<0||c>=cols)continue;
      const dx=(c+.5)*cw-fx,dy=((r+.5)*ch-fy)/sq,col=paint(Math.hypot(dx,dy),Math.atan2(dy,dx),hash(cc,r,seed+n*7));if(col)cells.set(col,(r*cols+cc)*3);}};
    const ink=inks[f.ink];
    if(f.speckle){each((d,a,h)=>d<R&&h<f.speckle*(1-d/R)?ink:null);return;}
    const deep=inks[f.deep]??mix(ink,ground,.45),tip=inks[f.tip]??mix(ink,white,.3),crease=mix(deep,ground,.65);
    // The petals, outer ring first: each a broad fan from the centre with a rounded tip, about as wide as its share of the ring and a
    // little more, so they overlap.
    const petals=[],count=f.petals??6,turn=(f.turn??0)*Math.PI/180;
    for(let j=0;j<(f.rings??2);j++){const m=Math.max(3,count-j),rot=turn+j*Math.PI/m+rand()*.4;
      for(let k=0;k<m;k++)petals.push({a:rot+k*2*Math.PI/m+(rand()-.5)*.3,L:R*(1-j*.3)*(.86+.18*rand()),hw:Math.PI/m*(1.2+.25*rand()),phase:rand()*6.3,ring:j});}
    const rc=R*(f.centreSize??.16),centre=f.centre==='dark'?null:inks[f.centre]??mix(deep,ground,.3),pollen=inks.ochre??tip,ruffle=f.ruffle??.05;
    each((d,a,h)=>{
      if(d<rc)return centre??(h<.55?ground:h<.8?pollen:deep);
      let col=null;
      for(const p of petals){let D=a-p.a;D-=Math.round(D/(2*Math.PI))*2*Math.PI;const x=D/p.hw;if(x<=-1||x>=1)continue;
        const env=p.L*(1-x*x)**.35*(1+ruffle*Math.sin(D*14+p.phase))*(1+.06*(h-.5));if(d>=env)continue;
        const t=d/env;let c=mix(deep,ink,clamp((t-.05)/.5));c=mix(c,tip,clamp((t-.7)/.3)*.65);
        // A fine vein or two along the petal, and a dark crease round its edge where it lies over the next.
        if(Math.abs(Math.sin(x*3+p.phase))<.08&&t>.3)c=mix(c,deep,.35);
        const edge=Math.min(env-d,(1-Math.abs(x))*d*p.hw);if(edge<cw*1.3&&(p.ring>0||Math.abs(x)>.55)&&h<.85)c=crease;
        col=c;}
      // A stitch or two of spray past the rim.
      if(!col&&d<R*1.06&&h>.97)col=tip;
      return col;});
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
