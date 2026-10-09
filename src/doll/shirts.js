// Button-down shirts: a body with a buttoned placket, a point collar on a stand, and set-in sleeves.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
// One template; each shirt's style (below) sets its print, fabric, stitching, buttons and whether the top button is open.
// Optional, for shirts that need them (a shirt without them is built as before): a print from a texture atlas made from
// the product photos (`atlas`), a longer hem (`hem`), gathers either side of the placket (`ruche`) and buttoned cuffs (`cuff`).
// Also optional: print repeats round a sleeve (`sleeveAround`), a chest pocket (`pocket`) and a back yoke seam (`backYoke`);
// a short contrast placket (`placket`), appliqué patches (`patches`), ribbed cuffs (`cuff.rib`) and a shirt tucked into
// whatever bottom she wears (`tuckIn`).
// Also a centre back pleat below the back yoke seam (`backPleat`).
import * as T from 'three';
import { random, solid, oval, curve, shell, roundSleeveCap, surfaceProbe, easeOverHand, trimToEdge } from './model.js';
import { levelCaster } from './level-caster.js';
import { grid } from './polo.js';
import { MOTEL_TIE_DYE_SHIRT_ID, DESIGUAL_SPRAY_FLORAL_SHIRT_ID, DESIGUAL_SPLIT_FLORAL_SHIRT_ID, DESIGUAL_MOUNTAIN_SHIRT_ID, MANGO_DOT_SHIRT_ID, PINK_YOKE_SHIRT_ID, LEVIS_PLAID_FLANNEL_ID, DESIGUAL_RUGBY_ID } from '../wardrobe/catalog.js';
import { ikatData } from './ikat-print.js';
import { splitBodyData, splitCollarData, leftSleeveData, rightSleeveData } from './split-floral-print.js';

// Warm grey-mauve tie-dye, measured in the shirt's own photos (hanger front and back): the darkest patches about
// (55, 43, 43), the middle (100, 88, 87), the palest (215, 205, 200). Darker than measured: exposure, tone mapping and
// the mesh's sheen lift these values.
const DYE={dark:[12,9,11],mid:[70,62,66],light:[172,165,166]};
const NECK=1.905,HEM=1.26;
// Slim and fitted, cropped at her waist. Below 1.5 it follows the polo, whose hem clears every waistband.
const BODY_ROWS=[[NECK,.112,.104],[1.875,.17,.124],[1.83,.228,.154],[1.775,.265,.177],[1.65,.278,.184],[1.5,.282,.19],[1.4,.288,.2],[1.335,.29,.205],[HEM,.29,.205]];
// Relaxed and hip-length (the Mango shirt): wider from the chest down, easing out over the hips like the lilac top, to a
// shirt-tail hem that dips at the centre front and back (shirttail in the style) and clears every pair of trousers.
const RELAXED_ROWS=[[NECK,.112,.104],[1.875,.172,.126],[1.83,.232,.157],[1.775,.272,.181],[1.65,.286,.19],[1.5,.29,.197],[1.4,.295,.205],[1.3,.302,.215],[1.2,.314,.228],[1.12,.322,.234],[1.03,.328,.24]];
// Over the skirt, the same shirt is tucked in: it narrows below 1.4 to end inside the skirt's waistband.
const TUCKED_ROWS=[...RELAXED_ROWS.slice(0,7),[1.33,.292,.205],[1.26,.29,.205]];
// Boxy and gathered below a yoke (the pink yoke shirt): as relaxed as the Mango shirt through the body and as long, to the
// top of her thigh, with a gentler shirt-tail curve (shirttail in its style); tucked into the skirt the same way.
const YOKE_ROWS=[...RELAXED_ROWS.slice(0,4),[1.65,.29,.193],[1.5,.294,.202],[1.4,.3,.21],[1.3,.307,.219],[1.2,.314,.229],[1.12,.322,.234],[1.02,.328,.24]];
const YOKE_TUCKED=[...YOKE_ROWS.slice(0,7),[1.33,.292,.205],[1.26,.29,.205]];
const PLACKET=.017;
// A longer shirt ends at the high hip, on the printed tees' lower rows, which clear every waistband. With gathers, the
// rows are doubled (midpoints added) so the gathers have rows enough to fold.
function bodyRows(style){
  const hem=style.hem??HEM;
  let rows=hem===HEM?BODY_ROWS:[...BODY_ROWS.slice(0,-1),[1.25,.291,.208],[hem,.292,.213]];
  if(style.ruche)rows=rows.flatMap((r,k)=>k?[r.map((v,i)=>(v+rows[k-1][i])/2),r]:[r]);
  return rows;
}

function bodyRadii(y,rows=BODY_ROWS){
  let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;
  const t=Math.max(0,Math.min(1,(rows[k][0]-y)/(rows[k][0]-rows[k+1][0])));
  return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];
}
// Seamless value noise on a lattice that wraps every `period` cells, summed over octaves.
function periodicNoise(seed,period){
  const rand=random(seed),cells=Array.from({length:period*period},()=>rand());
  const at=(x,y)=>cells[((y%period+period)%period)*period+((x%period+period)%period)];
  const s=t=>t*t*(3-2*t);
  return (x,y)=>{const x0=Math.floor(x),y0=Math.floor(y),fx=s(x-x0),fy=s(y-y0);
    const a=at(x0,y0)+(at(x0+1,y0)-at(x0,y0))*fx,b=at(x0,y0+1)+(at(x0+1,y0+1)-at(x0,y0+1))*fx;return a+(b-a)*fy;};
}
const pixelCache={};
function cached(name,make){return pixelCache[name]||(pixelCache[name]=make());}
function tieDyeData(){
  return cached('tie-dye',()=>{
  // Soft cloudy patches, bled at their edges into speckles, as dye spreads through mesh. The field is warped by a second
  // noise so the patches curl rather than sit on a grid; every octave wraps, so the tile repeats without a seam.
  const size=256,data=new Uint8Array(size*size*4),rand=random(83);
  const octaves=[3,6,12,24,48].map((p,i)=>[periodicNoise(11+i,p),p]),warp=[periodicNoise(41,4),periodicNoise(42,4)];
  const fbm=(u,v)=>{let sum=0,amp=1,norm=0;for(const [n,p] of octaves){sum+=amp*n(u*p,v*p);norm+=amp;amp*=.55;}return sum/norm;};
  const ramp=t=>{const c=t<.5?DYE.dark.map((d,k)=>d+(DYE.mid[k]-d)*t*2):DYE.mid.map((m,k)=>m+(DYE.light[k]-m)*(t-.5)*2);return c;};
  const field=new Float32Array(size*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size,v=y/size,wu=u+.12*(warp[0](u*4,v*4)-.5),wv=v+.12*(warp[1](u*4,v*4)-.5);
    let t=fbm(wu,wv);
    // Near the edges of a patch the dye breaks into speckles.
    const edge=Math.max(0,1-Math.abs(t-.5)*6),speck=fbm(wu*3.7+.31,wv*3.7+.77);
    field[y*size+x]=t+(speck-.5)*.25*edge;
  }
  // Spread the values evenly from darkest to palest, as measured in the photos (each tenth of the shirt is a step lighter
  // than the last), then colour them along the measured ramp.
  const order=Array.from(field.keys()).sort((a,b)=>field[a]-field[b]);
  order.forEach((index,rank)=>{const c=ramp(rank/(order.length-1)),i=index*4,grain=1+(rand()-.5)*.05;
    for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,c[k]*grain));data[i+3]=255;});
  return {data,w:size,h:size};
  });
}
// Spray-paint flowers: blurred pink, coral and red clouds, with cream stencilled flowers, leaves and petals sprayed over
// them, read from the Desigual photos. Background shares measured on the flat lay: pale pink about 30%, pink 22%, coral 19%,
// red-pink 15% and red 10%; the back carries more orange. Much deeper than measured: the studio's exposure and tone
// mapping lift these bright colours strongly and warm them towards salmon, so the pinks lean magenta here, and the
// deepest reds keep their red channel lower so tone mapping does not wash them out (calibrated in renders).
const SPRAY={pale:[222,102,118],pink:[202,60,86],coral:[182,36,60],redPink:[160,14,32],red:[140,2,6],orange:[186,40,16],cream:[236,194,186],speck:[150,10,28]};
// Stencils on one tile (x, y in the tile; size; turn; kind; strength). The tile repeats twice round her and covers a
// little more than her body's height, so a flower is about a quarter of her front's width, as on the model.
const STENCILS=[
  [.2,.3,.13,.3,'flower',1],[.72,.76,.11,1.1,'flower',.95],[.56,.18,.08,.6,'flower',.55],
  [.45,.56,.15,.8,'leaf',.9],[.92,.38,.11,-.5,'leaf',1],[.14,.8,.12,2.2,'leaf',.8],[.34,.95,.09,-1.2,'leaf',.6],
  [.33,.06,.07,0,'petal',.9],[.82,.12,.065,.7,'petal',.85],[.63,.45,.05,1.8,'petal',.7],[.05,.55,.028,0,'dot',.9],[.97,.86,.022,0,'dot',.8],[.6,.62,.02,0,'dot',.7],
];
function stencilInside(kind,x,y,s){
  // How far inside the shape a point is (positive inside), in tile units; x, y are relative to the stencil's centre and turn.
  if(kind==='dot')return s-Math.hypot(x,y);
  if(kind==='petal'){const k=Math.hypot(x/s,y/(s*.7));return (1-k)*s*.7;}
  if(kind==='leaf'){const a=s,b=s*.36;if(Math.abs(x)>=a)return -(Math.abs(x)-a);const w=b*Math.pow(1-(x/a)**2,.8);return w-Math.abs(y);}
  // A five-petal flower with an open centre.
  const r=Math.hypot(x,y),ang=Math.atan2(y,x);let best=-1;
  for(let p=0;p<5;p++){const pa=p/5*Math.PI*2,cx=Math.cos(pa)*s*.55,cy=Math.sin(pa)*s*.55,dx=x-cx,dy=y-cy,c=Math.cos(-pa),sn=Math.sin(-pa);
    const lx=dx*c-dy*sn,ly=dx*sn+dy*c;best=Math.max(best,(1-Math.hypot(lx/(s*.46),ly/(s*.32)))*s*.32);}
  return Math.min(best,r-s*.12);
}
function sprayFloralData(){
  return cached('spray-floral',()=>{
  const size=384,data=new Uint8Array(size*size*4),rand=random(97);
  const cloud=[[periodicNoise(61,4),4],[periodicNoise(62,8),8],[periodicNoise(63,16),16]],warp=[periodicNoise(64,4),periodicNoise(65,4)],warm=periodicNoise(66,4),grain=periodicNoise(67,96);
  const fbm=(u,v)=>{let sum=0,amp=1,norm=0;for(const [n,p] of cloud){sum+=amp*n(u*p,v*p);norm+=amp;amp*=.5;}return sum/norm;};
  // Background clouds, three or four across her front as on the model, spread to the measured shares along the ramp
  // from pale pink to red.
  const field=new Float32Array(size*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size;field[y*size+x]=fbm(u+.1*(warp[0](u*4,v*4)-.5),v+.1*(warp[1](u*4,v*4)-.5));}
  const order=Array.from(field.keys()).sort((a,b)=>field[a]-field[b]),rank=new Float32Array(size*size);order.forEach((index,r)=>{rank[index]=r/(order.length-1);});
  const stops=[[0,SPRAY.pale],[.3,SPRAY.pale],[.52,SPRAY.pink],[.71,SPRAY.coral],[.86,SPRAY.redPink],[1,SPRAY.red]];
  const ramp=t=>{let k=0;while(k<stops.length-2&&stops[k+1][0]<t)k++;const [t0,c0]=stops[k],[t1,c1]=stops[k+1],f=Math.max(0,Math.min(1,(t-t0)/(t1-t0)));return c0.map((c,i)=>c+(c1[i]-c)*f);};
  const smooth=(a,b,t)=>{const f=Math.max(0,Math.min(1,(t-a)/(b-a)));return f*f*(3-2*f);};
  const shapes=STENCILS.map(([sx,sy,s,turn,kind,strength])=>({sx,sy,s,c:Math.cos(turn),sn:Math.sin(turn),kind,strength}));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size,v=y/size,t=rank[y*size+x];
    let c=ramp(t);
    // Some clouds are sprayed orange rather than pink.
    const w=smooth(.55,.8,warm(u*4,v*4))*.75*smooth(.35,.7,t);c=c.map((ch,i)=>ch+(SPRAY.orange[i]-ch)*w);
    // Overspray: fine red speckles over the paler clouds.
    if(t<.6&&rand()<.035*(1-t))c=c.map((ch,i)=>ch+(SPRAY.speck[i]-ch)*.5);
    // Cream stencils, sprayed: soft at the edge, speckled where the spray thins out, with a scatter of cream dots beyond.
    let a=0;
    for(const sh of shapes){let dx=u-sh.sx,dy=v-sh.sy;dx-=Math.round(dx);dy-=Math.round(dy);if(Math.abs(dx)>sh.s*1.4||Math.abs(dy)>sh.s*1.4)continue;
      const lx=dx*sh.c+dy*sh.sn,ly=-dx*sh.sn+dy*sh.c,d=stencilInside(sh.kind,lx,ly,sh.s),g=grain(u*96,v*96);
      let k=smooth(-.006,.008,d+(g-.5)*.012);if(d<0&&d>-.03&&rand()<.08*(1+d/.03))k=Math.max(k,.7);a=Math.max(a,k*sh.strength);}
    c=c.map((ch,i)=>ch+(SPRAY.cream[i]-ch)*a);
    const i=(y*size+x)*4,n=1+(rand()-.5)*.04;for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,c[k]*n));data[i+3]=255;
  }
  return {data,w:size,h:size};
  });
}
// Mango halftone patchwork, read from the Mango photos: cream crepe printed with a square lattice of pink dots in blocks of
// two kinds, set in an uneven checker. In a pink block the dots are big pink circles that touch, leaving small cream
// four-point stars between them; a cream block is the other way round, touching cream circles with small pink stars.
// Calibrated in studio renders: the shirt's average matches the flat lay's (232, 209, 200), with the pink and cream as
// far apart as in the collar close-up allows. Rendered: pink (220, 185, 170), cream (240, 231, 223). Much deeper than
// that here, as the studio's exposure and tone mapping lift these soft colours strongly.
const DOTS={pink:[168,127,118],cream:[240,208,189]};
// The blocks on one tile, row by row: the row's height in dots, how far along its first block starts, and its blocks'
// widths in dots. Kinds alternate along each row, and each row starts with the other kind from the row above.
const DOT_BLOCKS=[[4,0,[4,5,3,4]],[4,1,[3,4,5,4]],[4,3,[5,3,4,4]],[4,2,[4,4,3,5]]];
function dotPatchData(){
  return cached('dot-patch',()=>{
  const dots=16,px=32,size=dots*px,data=new Uint8Array(size*size*4),rand=random(53),pink=new Uint8Array(dots*dots);
  let y0=0;
  DOT_BLOCKS.forEach(([h,shift,widths],row)=>{let x=shift,k=row%2?0:1;
    for(const w of widths){for(let dx=0;dx<w;dx++)for(let dy=0;dy<h;dy++)pink[(y0+dy)*dots+(x+dx)%dots]=k;x+=w;k^=1;}y0+=h;});
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const cx=Math.floor(x/px),cy=Math.floor(y/px),d=Math.hypot((x+.5)/px-cx-.5,(y+.5)/px-cy-.5);
    // Each dot fills its cell to the edges (radius half a dot), so the gaps between four dots are four-point stars.
    const inside=Math.max(0,Math.min(1,(.5-d)*px/1.2+.5)),t=pink[cy*dots+cx]?inside:1-inside,n=1+(rand()-.5)*.03;
    const i=(y*size+x)*4;for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,(DOTS.cream[k]+(DOTS.pink[k]-DOTS.cream[k])*t)*n));data[i+3]=255;
  }
  return {data,w:size,h:size};
  });
}
// Ditsy florals on pink, read from the pink yoke shirt's photos: cream five-petal daisies with rust centres, smaller
// rust flowers with cream centres, rust leaves on fine stems and tiny cream sprigs, scattered densely. Measured in the
// close-up: pink about (219, 184, 174), cream (220, 210, 193), solid rust (160, 87, 55); about 60% pink, 20% cream, 20% rust.
// Calibrated in studio renders, which lift these colours strongly: rendered pink (219, 184, 173), cream (223, 211, 197),
// solid rust (162, 88, 59), and an average of (210, 174, 159) against the photos' (207, 173, 158).
const DITSY={pink:[168,126,122],cream:[172,158,140],rust:[100,52,30]};
function ditsyFloralData(){
  return cached('ditsy-floral',()=>{
  const size=512,rand=random(131),px=new Float32Array(size*size*3);
  for(let i=0;i<size*size;i++)for(let k=0;k<3;k++)px[i*3+k]=DITSY.pink[k];
  const smooth=(a,b,t)=>{const f=Math.max(0,Math.min(1,(t-a)/(b-a)));return f*f*(3-2*f);};
  // Paints a shape over the tile, wrapping at its edges: inside(dx, dy) is how far inside the shape a point is, in pixels.
  const paint=(cx,cy,reach,colour,inside,amount=1)=>{
    for(let y=Math.floor(cy-reach);y<=Math.ceil(cy+reach);y++)for(let x=Math.floor(cx-reach);x<=Math.ceil(cx+reach);x++){
      const d=inside(x+.5-cx,y+.5-cy);if(d<=-1)continue;const a=smooth(-1,1,d)*amount;if(a<=0)continue;
      const i=(((y%size)+size)%size)*size+(((x%size)+size)%size);for(let k=0;k<3;k++)px[i*3+k]+=(colour[k]-px[i*3+k])*a;}};
  // A flower of n petals: rounded petals (shape below 1) or pointed ones (above 1), turned by `turn`.
  const flower=(r,n,turn,shape)=>(dx,dy)=>{const d=Math.hypot(dx,dy),c=Math.abs(Math.cos(n*(Math.atan2(dy,dx)-turn)/2));return r*(.5+.5*c**shape)-d;};
  const disc=r=>(dx,dy)=>r-Math.hypot(dx,dy);
  const leaf=(len,w,turn)=>(dx,dy)=>{const c=Math.cos(turn),s=Math.sin(turn),u=dx*c+dy*s,v=-dx*s+dy*c;if(Math.abs(u)>=len)return -(Math.abs(u)-len);return w*Math.sqrt(1-(u/len)**2)-Math.abs(v);};
  const stem=(len,turn)=>(dx,dy)=>{const c=Math.cos(turn),s=Math.sin(turn),u=dx*c+dy*s,v=-dx*s+dy*c;return u<0||u>len?-2:1-Math.abs(v);};
  // Scattered without crowding: each new flower keeps a little clear of those already placed (wrapping round the tile).
  const placed=[],place=(r,gap,tries=60)=>{for(let t=0;t<tries;t++){const x=rand()*size,y=rand()*size;
    if(placed.every(([px2,py2,pr])=>{let dx=Math.abs(x-px2),dy=Math.abs(y-py2);dx=Math.min(dx,size-dx);dy=Math.min(dy,size-dy);return Math.hypot(dx,dy)>(r+pr)*gap;})){placed.push([x,y,r]);return [x,y];}}return null;};
  // Large and middle cream daisies, then rust flowers with leaves on fine stems, then tiny cream sprigs in the gaps.
  const daisies=[...Array(66)].map(()=>13+rand()*15).sort((a,b)=>b-a),rusts=[...Array(80)].map(()=>10+rand()*9).sort((a,b)=>b-a);
  // Both kinds are placed together, largest first, so the rust flowers spread evenly among the daisies.
  const blooms=[...daisies.map(r=>[r,'cream']),...rusts.map(r=>[r,'rust'])].sort((a,b)=>b[0]-a[0]);
  for(const [r,kind] of blooms){const at=place(r,kind==='cream'?.82:.62);if(!at)continue;const [x,y]=at;
    if(kind==='cream'){paint(x,y,r+2,DITSY.cream,flower(r,5,rand()*7,.55));paint(x,y,r*.3,DITSY.rust,disc(r*.17+1));continue;}
    for(let k=0;k<2;k++){const a=rand()*Math.PI*2,len=r*(1.3+rand()*.7);paint(x,y,len+2,DITSY.rust,stem(len,a));
      paint(x+Math.cos(a)*len,y+Math.sin(a)*len,r*.7,DITSY.rust,leaf(r*.55,r*.22,a+(rand()-.5)));}
    paint(x,y,r+2,DITSY.rust,flower(r,5,rand()*7,.9));paint(x,y,r*.35,DITSY.cream,disc(r*.2+.5));}
  for(let k=0;k<160;k++){const r=4+rand()*4,at=place(r,.5,20);if(!at)continue;const [x,y]=at;paint(x,y,r+2,DITSY.cream,flower(r,7,rand()*7,2.5),.9);}
  const data=new Uint8Array(size*size*4);
  for(let i=0;i<size*size;i++){const n=1+(rand()-.5)*.03;for(let k=0;k<3;k++)data[i*4+k]=Math.max(0,Math.min(255,px[i*3+k]*n));data[i*4+3]=255;}
  return {data,w:size,h:size};
  });
}
function crepeData(){
  // Crepe: a fine, irregular pebbled crinkle, as on the close-up of the collar.
  return cached('crepe',()=>{
  const size=64,data=new Uint8Array(size*size*4),fine=periodicNoise(71,16),finer=periodicNoise(72,32);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size,t=.55*fine(u*16,v*16)+.45*finer(u*32,v*32);
    const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,Math.round(128+300*(t-.5))));data[i+3]=255;}
  return {data,w:size,h:size};
  });
}
// Plaid flannel, woven: warp stripes running down and weft stripes running across, interlaced in a 2/2 twill, so where a
// stripe crosses the ground the two colours hatch together as on the cloth. Stripe widths are in a repeat of 180 units,
// read from the Levi's flat lay (the warp and weft setts differ). Colours measured on the flat lay: ground (20, 19, 26),
// grey (96, 97, 103), light grey (146, 139, 144), white (226, 216, 218), coral red (about 175, 70, 68). Deeper here, as
// the studio's exposure and tone mapping lift them.
const PLAID={ground:[3,5,13],grey:[64,68,80],light:[118,116,128],white:[222,214,220],red:[176,48,46]};
const PLAID_WARP=[['ground',60],['grey',4],['light',8],['grey',3],['ground',13],['white',6],['ground',6],['red',4],['ground',3],['grey',6],['ground',5],['light',6],['ground',56]];
const PLAID_WEFT=[['ground',60],['grey',10],['ground',3],['light',4],['white',8],['red',5],['ground',4],['grey',10],['ground',76]];
function plaidData(){
  return cached('plaid',()=>{
  const size=360,data=new Uint8Array(size*size*4),rand=random(61);
  const sett=list=>{const out=[];for(const [c,w] of list)for(let k=0;k<w*2;k++)out.push(PLAID[c]);return out;};
  const warp=sett(PLAID_WARP),weft=sett(PLAID_WEFT);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    // 2/2 twill: the warp shows on two of every four threads, stepping along one each row.
    const up=((x+y)%4)<2,c=up?warp[x]:weft[size-1-y],n=1+(rand()-.5)*.1,i=(y*size+x)*4;
    for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,c[k]*n));data[i+3]=255;
  }
  return {data,w:size,h:size};
  });
}
function flannelData(){
  // Brushed flannel: a soft twill, faint diagonal ridges under a fuzzy nap.
  return cached('flannel',()=>{
  const size=64,data=new Uint8Array(size*size*4),nap=periodicNoise(91,16);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const t=.5+.25*Math.sin((x+y)/size*Math.PI*2*16)+.5*(nap(x/size*16,y/size*16)-.5);
    const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,Math.round(255*t)));data[i+3]=255;}
  return {data,w:size,h:size};
  });
}
function jerseyData(colour){
  // Smooth jersey in one colour, with a faint grain.
  return cached('jersey'+colour,()=>{
  const size=16,c=[1,3,5].map(i=>parseInt(colour.slice(i,i+2),16)),data=new Uint8Array(size*size*4),rand=random(77);
  for(let i=0;i<size*size;i++){const n=1+(rand()-.5)*.04;for(let k=0;k<3;k++)data[i*4+k]=Math.max(0,Math.min(255,c[k]*n));data[i*4+3]=255;}
  return {data,w:size,h:size};
  });
}
// An appliqué tiger: a leaping cat in felt, its outline bumpy, with white embroidered stripes, a white edge and an eye. Drawn
// here at her scale as a suggestion of the patches, not a copy. Pixels with alpha; y runs up the patch.
function tigerPatchData(colour,seed){
  return cached('tiger'+colour+seed,()=>{
  const w=192,h=120,data=new Uint8Array(w*h*4),c=[1,3,5].map(i=>parseInt(colour.slice(i,i+2),16)),rand=random(seed*31+7);
  const blobs=[[96,62,58,26,0],[150,72,26,22,0],[166,92,8,10,0],[140,92,8,10,0],[150,40,12,24,-.6],[124,36,10,22,-.3],[58,42,10,24,.5],[36,48,10,22,.9],[32,78,20,8,.7],[18,92,10,7,.2]];
  const inside=(x,y,grow=0)=>blobs.some(([cx,cy,rx,ry,t])=>{const dx=x-cx,dy=y-cy,cs=Math.cos(t),sn=Math.sin(t),u=dx*cs+dy*sn,v=-dx*sn+dy*cs;return (u/(rx+grow))**2+(v/(ry+grow))**2<=1;});
  const wobble=Array.from({length:64},()=>rand()*2.5);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=Math.atan2(y-h/2,x-w/2),bump=wobble[Math.floor((a+Math.PI)/(Math.PI*2)*64)%64];
    if(!inside(x,y,bump+2))continue;
    const edge=!inside(x,y,bump-2),stripe=inside(x,y,-4)&&Math.abs(Math.sin((x*.11+Math.sin(y*.09)*1.6)))<.16&&x<150,eye=Math.hypot(x-160,y-80)<3.5;
    const col=edge||stripe?[248,246,240]:eye?[30,30,40]:c.map(v=>Math.round(v*(.92+.1*rand())));
    for(let k=0;k<3;k++)data[i+k]=col[k];data[i+3]=255;}
  return {data,w,h};
  });
}
// Tucked into the trousers she wears: below the top of their waistband the body is drawn in just inside the waistband (each
// height and angle measured on the trousers), and just above it the fabric narrows into the waistband, as a tucked shirt
// blouses over it. Fabric far below the waistband's top is folded up out of the way.
function tuckInto(mesh,trousers){
  trousers.updateMatrixWorld(true);
  const meshes=[];trousers.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)meshes.push(o);});if(!meshes.length)return null;
  const v=new T.Vector3();let top=-Infinity;
  for(const m of meshes){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(Math.abs(v.x)<.32)top=Math.max(top,v.y);}}
  const cast=levelCaster(meshes,{axis:[0,0],faces:'both'}),o=new T.Vector3(),d=new T.Vector3(),cache=new Map();
  const inner=(y,a)=>{const key=Math.round(y/.004)+':'+Math.round(a/(Math.PI/90));
    if(!cache.has(key)){const hit=cast(o.set(0,y,0),d.set(Math.sin(a),0,Math.cos(a)).applyAxisAngle(new T.Vector3(0,1,0),1e-5));cache.set(key,hit?hit.distance:null);}return cache.get(key);};
  const p=mesh.geometry.attributes.position,blend=.05,fold=.1;
  for(let i=0;i<p.count;i++){let y=p.getY(i);if(y>top+blend)continue;const x=p.getX(i),z=p.getZ(i),r=Math.hypot(x,z)||1,a=Math.atan2(x,z);
    if(y<top-fold)y=top-fold;
    // The waistband's inner surface: the closest over this height and a little below it, since at the very top a ray can
    // miss the waistband or meet a patch or loop standing outside it.
    let rin=null;for(let h=Math.min(y,top-.004),n=0;h>top-fold-.04&&n<4;h-=.006){const d=inner(h,a);if(d!=null){rin=rin==null?d:Math.min(rin,d);n++;}}
    if(rin==null)continue;const inside=Math.min(r,rin-.007);
    const s=y>top?(y-top)/blend:0,target=r+(inside-r)*(1-s)**2,k=target/r;p.setXYZ(i,x*k,y,z*k);}
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();return top;
}
function meshNetData(){
  // Power-mesh netting: a fine lattice of tiny holes, used as a bump so the fabric reads as mesh up close.
  return cached('mesh-net',()=>{
  const size=32,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x%8)-3.5,dy=((y+(Math.floor(x/8)%2)*4)%8)-3.5,hole=Math.hypot(dx,dy)<2;
    const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=hole?60:220;data[i+3]=255;}
  return {data,w:size,h:size};
  });
}
function fineRibData(){
  // A fine rib: narrow raised columns running down the fabric.
  return cached('fine-rib',()=>{
  const w=16,h=4,data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=Math.round(140+90*Math.cos(x/w*Math.PI*4)),i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
  return {data,w,h};
  });
}
// Each shirt's style. Heights are in outfit units; tile sizes say how many print tiles go round her and how tall one is.
const STYLES={
  // Worn buttoned to the top, as on the hanger: black topstitching, a black-faced stand and glossy black buttons.
  [MOTEL_TIE_DYE_SHIRT_ID]:{print:tieDyeData,around:3,high:.71,collarAround:3,bump:[meshNetData,160,90,.0025],sheen:['#d8cbc8',.35,.55],roughness:.62,
    stitch:'#16110f',facing:'#141212',button:['#0d0b0b',.18],buttons:[1.862,1.78,1.698,1.616,1.534,1.452,1.37],collarTopstitch:true,open:null},
  // Worn with the top button open, as on the model: tonal stitching, the stand in the print, and pale peach buttons.
  [DESIGUAL_SPRAY_FLORAL_SHIRT_ID]:{print:sprayFloralData,around:2,high:1.04,collarAround:2,bump:[fineRibData,220,1,.003],sheen:['#ff9c9c',.12,.5],roughness:.72,
    stitch:'#d9817f',facing:null,button:['#f4c0b2',.3],buttons:[1.785,1.707,1.63,1.552,1.475,1.397,1.32],collarTopstitch:false,open:{bottom:1.8,half:.034}},
  // A split print laid out once over each piece (src/doll/split-floral-print.js): small flowers on her right, large painted
  // flowers on black on her left. Optional `collarPrint` and `sleevePrints` ({left, right}: [print, around, high]) give the
  // collar and each sleeve their own canvas. Matte cotton poplin, tonal black stitching and buttons, worn with the top
  // button open as on the model.
  [DESIGUAL_SPLIT_FLORAL_SHIRT_ID]:{print:splitBodyData,around:1,high:1,collarPrint:splitCollarData,collarAround:1,sleevePrints:{left:[leftSleeveData,1,1],right:[rightSleeveData,1,1]},
    bump:[fineRibData,300,1,.001],sheen:['#55525e',.15,.6],roughness:.8,stitch:'#1c1b1f',facing:null,button:['#0f0e11',.25],buttons:[1.785,1.707,1.63,1.552,1.475,1.397,1.32],collarTopstitch:false,open:{bottom:1.8,half:.034}},
  // Printed from an atlas of the product photos (a mountain landscape at sunset), worn buttoned to the top as in the flat
  // lay (the user's way), at the high hip, gathered either side of the placket and with buttoned cuffs. Glossy black buttons.
  [DESIGUAL_MOUNTAIN_SHIRT_ID]:{atlas:{tone:'#b5ada4',fallback:'#bb7a5b'},hem:1.19,bump:[meshNetData,160,90,.0022],sheen:['#f0c0a8',.18,.55],roughness:.68,
    stitch:'#b9876a',facing:null,button:['#0b0909',.16],buttons:[1.862,1.773,1.684,1.595,1.506,1.417,1.328,1.239],collarTopstitch:false,open:null,
    ruche:{from:1.42,to:1.64,reach:.15,depth:.0065,folds:9},cuff:{from:-.455,to:-.535,button:true}},
  // Relaxed, hip-length and worn open at the top, as on the models: a concealed placket (no buttons show), tonal
  // stitching, the collar and stand in the print, and long relaxed sleeves gathered into buttoned cuffs. Optional settings:
  // rows (the body's shape) with tucked (its shape over the skirt), shirttail (the hem's height at the centre and at the
  // sides), concealed (a fly-front placket) and sleeve (the sleeve's rows), with the mountain shirt's buttoned cuffs.
  [MANGO_DOT_SHIRT_ID]:{print:dotPatchData,around:2,high:1.1,collarAround:1,bump:[crepeData,40,30,.0018],sheen:['#f8dcd2',.2,.6],roughness:.82,
    stitch:'#e4b9ac',facing:null,button:['#f2d9cf',.3],buttons:[],collarTopstitch:false,open:{bottom:1.8,half:.034},
    rows:RELAXED_ROWS,tucked:TUCKED_ROWS,depth:.7,shirttail:{from:1.24,centre:1.03,side:1.1},concealed:true,
    sleeve:[[.025,.11,.112],[-.04,.124,.122],[-.16,.126,.12],[-.28,.122,.116],[-.38,.113,.108],[-.45,.098,.096],[-.49,.088,.088],[-.53,.084,.085]],cuff:{from:-.455,to:-.535,button:true}},
  // Boxy, to the top of her thigh with a gently curved hem, gathered below a yoke front and back, with a big 1970s point collar, cream buttons (worn with the top
  // one open), and full sleeves gathered into buttoned cuffs. Optional settings: yoke (the seam's height at the front and
  // back, and its gathers), collar (a bigger collar) and sleeveFolds (gathers into the cuff).
  [PINK_YOKE_SHIRT_ID]:{print:ditsyFloralData,around:2,high:1.05,collarAround:1,depth:.7,bump:[crepeData,40,30,.0012],sheen:['#f6d0c8',.25,.55],roughness:.72,
    stitch:'#e2b3a8',facing:null,button:['#f4ece0',.25],buttons:[1.785,1.67,1.555,1.44,1.325,1.21,1.095],collarTopstitch:false,open:{bottom:1.8,half:.034},
    rows:YOKE_ROWS,tucked:YOKE_TUCKED,shirttail:{from:1.24,centre:1.02,side:1.08},yoke:{front:1.72,back:1.7,folds:44,depth:.011},collar:{spread:.135,drop:.09,deeper:.012},
    sleeve:[[.025,.11,.112],[-.04,.13,.128],[-.18,.146,.142],[-.32,.144,.14],[-.42,.125,.122],[-.49,.095,.094],[-.53,.086,.087]],sleeveFolds:{count:14,depth:.006,from:-.3},cuff:{from:-.455,to:-.535,button:true}},
  // An oversized plaid flannel, woven in code (plaidData): relaxed and hip-length with a shirt-tail hem (tucked into the
  // skirt), buttoned to the top as on the model, with pale grey buttons, a chest pocket on her left, a back yoke and
  // buttoned cuffs. Optional settings: `sleeveAround` (print repeats round a sleeve and cuff), `pocket` and `backYoke`.
  [LEVIS_PLAID_FLANNEL_ID]:{print:plaidData,around:6,high:.26,collarAround:3,sleeveAround:3,bump:[flannelData,60,40,.0025],sheen:['#8a8a96',.25,.8],roughness:.9,
    stitch:'#1d1c22',facing:null,button:['#cfd0d6',.3],buttons:[1.862,1.775,1.669,1.564,1.458,1.352,1.246,1.14],collarTopstitch:false,open:null,
    rows:RELAXED_ROWS,tucked:TUCKED_ROWS,depth:.7,shirttail:{from:1.24,centre:1.03,side:1.1},
    sleeve:[[.025,.11,.112],[-.04,.124,.122],[-.16,.126,.12],[-.28,.122,.116],[-.38,.113,.108],[-.45,.098,.096],[-.49,.088,.088],[-.53,.084,.085]],cuff:{from:-.44,to:-.535,button:true},
    pocket:{x:[.07,.2],y:[1.47,1.63]},backYoke:1.79},
  // A navy rugby shirt (sold as a dress, worn by the user tucked in, buttons closed): oversized, with a cream collar and a
  // short cream placket with white buttons, three appliqué tigers on her left chest and long sleeves into ribbed cuffs.
  // Tucked into her trousers (`tuckIn`), or into the skirt.
  [DESIGUAL_RUGBY_ID]:{print:()=>jerseyData('#090c1b'),around:1,high:1,collarPrint:()=>jerseyData('#e9e4d6'),collarAround:1,bump:[crepeData,30,20,.0008],sheen:['#3a4260',.3,.7],roughness:.82,
    stitch:'#090c1b',facing:null,button:['#f4f2ec',.3],buttons:[1.85,1.78,1.71],collarTopstitch:false,open:null,
    rows:RELAXED_ROWS,tucked:TUCKED_ROWS,depth:.7,tuckIn:true,
    sleeve:[[.025,.11,.112],[-.04,.124,.122],[-.16,.126,.12],[-.28,.122,.116],[-.38,.113,.108],[-.45,.098,.096],[-.49,.088,.088],[-.53,.084,.085]],cuff:{from:-.42,to:-.535,button:false,rib:40},
    placket:{bottom:1.67,half:.02,colour:'#e9e4d6',stitch:'#d8d2c2'},
    patches:[{at:[.17,1.665],size:[.075,.047],colour:'#3f64ba',seed:1},{at:[.16,1.607],size:[.075,.047],colour:'#d9637f',seed:2},{at:[.15,1.549],size:[.075,.047],colour:'#d8d860',seed:3}]},
  // A relaxed shirt in printed viscose crepe, worn loose with the top button open, printed from an atlas of the product
  // photos (a fine-line paisley): its own fuller body (rows) to a hem at the high hip, as wide there as the Tommy
  // sweater, which clears every jacket, bottom and the skirt; fuller sleeves into buttoned cuffs; a back yoke
  // (backYoke) with a centre pleat (backPleat); white buttons.
  'paisley-print-relaxed-shirt-v1':{atlas:{tone:'#bdbab5',fallback:'#d9cba8'},bump:[crepeData,90,60,.0012],sheen:['#fffaf0',.25,.45],roughness:.7,
    stitch:'#d8d2c4',facing:null,button:['#f3f0ea',.25],buttons:[1.785,1.705,1.625,1.545,1.465,1.385,1.305,1.225],collarTopstitch:true,open:{bottom:1.8,half:.034},
    rows:[[NECK,.112,.104],[1.875,.17,.124],[1.83,.228,.154],[1.775,.268,.18],[1.65,.296,.198],[1.5,.304,.207],[1.4,.308,.214],[1.3,.311,.222],[1.242,.314,.232],[1.19,.316,.236]],
    sleeve:[[.025,.104,.104],[-.05,.124,.119],[-.2,.127,.121],[-.33,.122,.116],[-.42,.108,.104],[-.47,.094,.091],[-.53,.09,.087]],
    cuff:{from:-.455,to:-.535,button:true},backYoke:1.79,backPleat:1.55},
  // Full length and worn loose over the waistband (the Pepe Jeans ikat shirt): a shirt-tail hem past the hips, a chest
  // pocket on her left, buttoned cuffs and a chambray collar stand; worn with the top button open, as in the flat lay.
  // Below 1.4 it eases out past her hips like the striped cardigan, whose rows clear every bottom, slimmer at the hem so
  // the raised sides stay under a jacket's hem; over the skirt it hangs loose over the skirt's flare (its `tucked` shape),
  // with a level hem. Light, slightly slubbed voile.
  'pepe-jeans-ikat-shirt-v1':{print:ikatData,around:3,high:1.05,collarAround:3,bump:[fineRibData,300,1,.0012],sheen:['#ffffff',0,.6],roughness:.85,
    stitch:'#e4e3ec',facing:'#7d93bd',button:['#efede6',.22],buttons:[1.785,1.68,1.575,1.47,1.365,1.26,1.155,1.05],collarTopstitch:false,open:{bottom:1.8,half:.034},
    rows:[...BODY_ROWS.slice(0,7),[1.2,.312,.236],[1.1,.318,.236],[1.03,.322,.24],[.97,.324,.242]],
    tucked:[...BODY_ROWS.slice(0,7),[1.3,.314,.234],[1.2,.334,.248],[1.1,.35,.257],[1.0,.376,.272],[.97,.383,.275]],
    shirttail:{from:1.12,centre:.97,side:1.045},pocket:{x:[.084,.172],y:[1.6,1.7]},cuff:{from:-.48,to:-.535,button:true}},
};
function texture({data,w,h},srgb){
  const t=new T.DataTexture(data,w,h,T.RGBAFormat);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;
}
function printMaterial(style,print=style.print,atlas=null){
  const [bumpData,bu,bv,bumpScale]=style.bump,bump=texture(bumpData(),false);bump.repeat.set(bu,bv);
  const [sheenColor,sheen,sheenRoughness]=style.sheen;
  // An atlas holds the photos' colours; the studio's lights lift them, so the print is toned down (`atlas.tone`). Without
  // the atlas (a failed load) the shirt is a flat colour.
  const map=style.atlas?(atlas?(()=>{const m=atlas.clone();m.needsUpdate=true;m.anisotropy=4;return m;})():null):texture(print(),true);
  const color=style.atlas?(map?style.atlas.tone:style.atlas.fallback):'#ffffff';
  return new T.MeshPhysicalMaterial({map,color,roughness:style.roughness,sheen,sheenColor:new T.Color(sheenColor),sheenRoughness,bumpMap:bump,bumpScale,side:T.DoubleSide});
}
// Atlas coordinates, laid out as for the printed tees: the top three quarters hold the body unwrapped (u round her from
// centre front toward her left, v from the hem up to the neck), the bottom quarter her right sleeve (left half) and her
// left sleeve (right half), u round the sleeve from its front toward the outside, v from the cuff up to the shoulder.
const angleU=(x,z)=>((Math.atan2(x,z)/(Math.PI*2))%1+1)%1;
function atlasBody(mesh,segments,hem){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
  for(let k=0;k<uv.count;k++)uv.setXY(k,(k%(segments+1))/segments,.25+.75*Math.max(0,Math.min(1,(p.getY(k)-hem)/(NECK-hem))));
  uv.needsUpdate=true;
}
function atlasSleeve(mesh,segments,side,top,bottom){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
  for(let k=0;k<uv.count;k++){const s=(k%(segments+1))/segments;uv.setXY(k,(side<0?0:.5)+.5*(side>0?s:1-s),.25*Math.max(0,Math.min(1,(p.getY(k)-bottom)/(top-bottom))));}
  uv.needsUpdate=true;
}
// The collar and cuffs take the print by their angle round her (or round the arm): the collar from a row just below the
// neck, the cuffs from the bottom of the sleeves (`v` may be a function of height).
function atlasByAngle(mesh,v,side=0){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
  for(let k=0;k<uv.count;k++){const a=angleU(p.getX(k),p.getZ(k));uv.setXY(k,side?(side<0?0:.5)+.5*(side>0?a:1-a):a,typeof v==='function'?v(p.getY(k)):v);}
  uv.needsUpdate=true;
}
// Gathers either side of the placket: folds fanning out from it, deepest at the placket and fading toward her sides and
// at the top and bottom of the gathered band.
// A yoke (optional `yoke`): the body is gathered just below a seam across the front (at `front`) and the back (`back`):
// fine folds all round, deepest under the seam and fading out toward the hem, and kept off the placket.
const yokeAt=(Y,a)=>Y.back+(Y.front-Y.back)*(1+Math.cos(a))/2;
function yokeGathers(mesh,Y,hem){
  const p=mesh.geometry.attributes.position,smooth=(a,b,t)=>{const f=Math.max(0,Math.min(1,(t-a)/(b-a)));return f*f*(3-2*f);};
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(x,z),top=yokeAt(Y,a);if(y>=top)continue;
    const t=Math.min(1,(top-y)/(top-hem)),placket=z>0?smooth(PLACKET,PLACKET*3,Math.abs(x)):1,r=Math.hypot(x,z);
    const k=1+Y.depth*(1-t)**1.3*smooth(0,.03,t)*placket*Math.cos(a*Y.folds)/r;p.setX(i,x*k);p.setZ(i,z*k);}
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();
}
function gather(mesh,{from,to,reach,depth,folds}){
  const p=mesh.geometry.attributes.position,mid=(from+to)/2,half=(to-from)/2;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(z<=0||y<from||y>to)continue;
    const ax=Math.abs(x);if(ax>reach)continue;
    const across=Math.pow(1-ax/reach,1.4),along=Math.cos((y-mid)/half*Math.PI/2)**2,fan=Math.sin(Math.atan2(y-mid,Math.max(ax,PLACKET))*folds*2);
    const k=1+depth*across*along*(.35+.65*Math.abs(fan))/Math.hypot(x,z);p.setX(i,x*k);p.setZ(i,z*k);}
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();
}
// Print coordinates: around the body and up it, in tiles sized to her, so the patches are the same size everywhere.
// With `depth` (her body's depth over its width), the print is spaced by distance round the body rather than by angle,
// so a regular print (round dots) is not stretched across her front, where an oval body is widest.
function mapPrint(mesh,around,high,toOutfit=v=>v,depth=null){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,v=new T.Vector3();
  let arc=u=>u;
  if(depth){const steps=256,length=[0];for(let k=1;k<=steps;k++){const t=(k-.5)/steps*Math.PI*2;length.push(length[k-1]+Math.hypot(Math.cos(t),depth*Math.sin(t)));}
    arc=u=>{const f=Math.max(0,Math.min(1,u))*steps,k=Math.min(steps-1,Math.floor(f));return (length[k]+(length[k+1]-length[k])*(f-k))/length[steps];};}
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);toOutfit(v);uv.setXY(i,arc(uv.getX(i))*around,v.y/high);}
  uv.needsUpdate=true;
}
function makeShirtCollar(top,mat,facing,stitch,style){
  // A point collar: the fall turns over a stand round her neck and lies on her shoulders, its front edges spreading to
  // points from the top button (or, worn open, from either side of the V). u runs from the right point round the back to
  // the left; v from fold to edge.
  const open=style.open,x0=open?open.half+.008:.012;
  const fold=a=>[.123*Math.sin(a),1.952-.03*(1+Math.cos(a))/2,.115*Math.cos(a)];
  // A bigger collar (optional `collar`): its points spread wider (`spread`) and hang lower (`drop`), and it lies deeper on
  // her shoulders (`deeper`).
  const C=style.collar||{},spread=C.spread??.1,drop=C.drop??.05,deeper=C.deeper??0;
  const frontX=v=>x0+(spread-x0)*v**1.3;
  const outerY=(a,u)=>{const end=Math.max(0,1-Math.min(u,1-u)/.12);return 1.888-deeper-.04*(1+Math.cos(a))/2-drop*end*end;};
  const at=(u,v,inset=0)=>{
    const vv=v*(1-inset),y=outerY(0,0)+(fold(0)[1]-outerY(0,0))*(1-vv),[rx]=bodyRadii(y,style.rows);
    const r=vv<1e-6?.123:.123+(rx+.01-.123)*vv,start=Math.asin(Math.min(.99,(frontX(vv)+inset*.6*(1-vv))/r));
    const uu=inset?.5+(u-.5)*(1-inset*.9):u,a=start+(Math.PI*2-2*start)*uu,f=fold(a),oy=outerY(a,uu),[ox,oz]=bodyRadii(oy,style.rows);
    const out=[(ox+.01)*Math.sin(a),oy,(oz+.01)*Math.cos(a)],roll=.01*Math.sin(Math.PI*vv),s=Math.hypot(out[0],out[2])||1,lift=inset?.002:0;
    return [f[0]+(out[0]-f[0])*vv+(roll+lift)*out[0]/s,f[1]+(out[1]-f[1])*vv,f[2]+(out[2]-f[2])*vv+(roll+lift)*out[2]/s];
  };
  const fall=grid(top,96,8,(u,v)=>at(u,v),mat,'shirt-collar-fall');if(style.atlas)atlasByAngle(fall,.25+.75*.93);else mapPrint(fall,style.collarAround,style.high);
  // The stand: faced in black inside on some shirts (it shows between the collar's front edges), otherwise in the print.
  const standStart=Math.asin(x0/.115);
  const stand=grid(top,64,2,(u,v)=>{const a=standStart+(Math.PI*2-2*standStart)*u,r=[.115-.006*v,.107-.006*v];return [r[0]*Math.sin(a),1.95-.05*v,r[1]*Math.cos(a)];},facing||mat,'shirt-collar-stand');
  const edge=curve(top,Array.from({length:97},(_,i)=>at(i/96,1)),.0035,mat,'shirt-collar-edge');
  if(style.atlas)for(const m of [stand,edge])atlasByAngle(m,.25+.75*.93);
  // Topstitching just inside the collar's edges, where the shirt has it: along the outer edge and up both front edges.
  if(style.collarTopstitch)curve(top,Array.from({length:97},(_,i)=>at(i/96,1,.16)),.0016,stitch,'shirt-collar-topstitch');
  return fall;
}
function makeShirt(id,style,atlas=null,skirt=false,trousers=null){
  const top=new T.Group();top.name=id;
  const stitch=solid(style.stitch,.6),facing=style.facing&&solid(style.facing,.85);
  // The body's rows: the style's own (rows, or tucked over the skirt), else the cropped or longer standard rows.
  const rows=(skirt&&style.tucked)||style.rows||bodyRows(style),tail=!(skirt&&style.tucked)&&style.shirttail,segments=128;
  const hem=tail?tail.centre:rows.at(-1)[0];
  const body=shell(top,rows,printMaterial(style,style.print,atlas),'mesh-shirt-body',segments);
  // A shirt-tail hem: below `from`, each column's rows are spread down to the hem's height at its angle, lowest at the
  // centre front and back and highest at the side seams.
  const hemAt=a=>tail.centre+(tail.side-tail.centre)*Math.abs(Math.sin(a))**1.5;
  if(tail){const p=body.geometry.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>=tail.from)continue;const a=Math.atan2(p.getX(i),p.getZ(i));
      p.setY(i,tail.from-(tail.from-y)*(tail.from-hemAt(a))/(tail.from-tail.centre));}
    p.needsUpdate=true;body.geometry.computeVertexNormals();}
  // Worn open at the top: a narrow V cut down to the second button.
  const open=style.open;
  if(open)trimToEdge(body,128,v=>v,(x,z)=>z<=0?NECK+1:Math.min(NECK+1,open.bottom+(NECK-open.bottom)*Math.abs(x)/open.half));
  if(style.ruche)gather(body,style.ruche);
  if(style.yoke)yokeGathers(body,style.yoke,hem);
  // Optional (`tuckIn`): tucked into her trousers (over the skirt, the tucked rows tuck it into the skirt instead).
  const tuckedIn=style.tuckIn&&!skirt&&trousers?tuckInto(body,trousers):null;
  if(style.atlas)atlasBody(body,128,hem);else mapPrint(body,style.around,style.high,undefined,style.depth);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;arm.updateMatrix();
    // Long fitted sleeves to the wrist, as on the bronze mesh top, ending in a plain stitched hem that eases over her hand.
    // Optional (`sleevePrints`): each sleeve its own print, laid out [around, high].
    const SP=style.sleevePrints?.[side>0?'left':'right'];
    const sleeve=shell(arm,style.sleeve||[[.025,.1,.102],[-.04,.113,.109],[-.16,.108,.102],[-.28,.105,.1],[-.40,.097,.092],[-.49,.08,.082],[-.53,.079,.081]],printMaterial(style,SP?.[0],atlas),'mesh-shirt-sleeve',48);
    // Full sleeves gathered into the cuff (optional `sleeveFolds`): fine folds round the arm, growing toward the cuff.
    if(style.sleeveFolds){const F=style.sleeveFolds,q=sleeve.geometry.attributes.position;
      for(let i=0;i<q.count;i++){const x=q.getX(i),y=q.getY(i),z=q.getZ(i);if(y>F.from)continue;const r=Math.hypot(x,z),t=Math.min(1,(F.from-y)/(F.from+.53)),k=1+F.depth*t*Math.cos(Math.atan2(x,z)*F.count)/r;q.setX(i,x*k);q.setZ(i,z*k);}
      q.needsUpdate=true;sleeve.geometry.computeVertexNormals();}
    roundSleeveCap(sleeve,side,.025);if(style.atlas)atlasSleeve(sleeve,48,side,.025,-.53);else mapPrint(sleeve,SP?SP[1]:style.sleeveAround??1,SP?SP[2]:style.high,v=>v.applyMatrix4(arm.matrix));easeOverHand(sleeve,side);
    const p=sleeve.geometry.attributes.position,hem=[];for(let i=p.count-49;i<p.count;i++)hem.push([p.getX(i)*1.02,p.getY(i)+.008,p.getZ(i)*1.02]);
    curve(arm,hem,.0014,stitch,'sleeve-hem-stitch');
    // A buttoned cuff: a band in the print over the sleeve's end, seamed at its top, with a button on the outer side.
    if(style.cuff){const C=style.cuff,band=(y,grow)=>{let q=p.count-49;while(q>0&&p.getY(q-49)<y)q-=49;return [y,Math.abs(p.getX(q+12))*grow+.004,Math.abs(p.getZ(q))*grow+.004];};
      const cuff=shell(arm,[band(C.from,1),band((C.from+C.to)/2,1),band(C.to,1)],printMaterial(style,style.print,atlas),'shirt-cuff',48);easeOverHand(cuff,side,.009);
      if(style.atlas)atlasByAngle(cuff,y=>.25*(.01+.07*(y-C.to)/(C.from-C.to)),side);else mapPrint(cuff,style.sleeveAround??1,style.high,v=>v.applyMatrix4(arm.matrix));
      // Optional (`rib`): a knitted rib cuff, its ribs running down it.
      if(C.rib){const rib=texture(fineRibData(),false);rib.repeat.set(C.rib/2,1);cuff.material.bumpMap=rib;cuff.material.bumpScale=.006;cuff.geometry.attributes.uv.array.forEach((_,k,a)=>{if(!(k%2))a[k]=(k/2%49)/48;});cuff.geometry.attributes.uv.needsUpdate=true;}
      const cp=cuff.geometry.attributes.position;curve(arm,Array.from({length:49},(_,i)=>[cp.getX(i)*1.015,cp.getY(i)-.004,cp.getZ(i)*1.015]),.0013,stitch,'cuff-seam');
      // The button sits on the outer side, halfway down the cuff, facing out (y is scaled up against the outfit's squash).
      if(C.button){const mid=Math.floor(cp.count/49/2)*49+(side>0?12:36),q=new T.Vector3().fromBufferAttribute(cp,mid),n=new T.Vector3(q.x,0,q.z).normalize();
        const [buttonColour,buttonRoughness]=style.button,b=oval(arm,q.clone().addScaledVector(n,.005).toArray(),[.0095,.0095/.76,.0035],solid(buttonColour,buttonRoughness),'cuff-button',16);b.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);}}
    top.add(arm);
  }
  makeShirtCollar(top,printMaterial(style,style.collarPrint,atlas),facing,stitch,style);
  top.updateMatrixWorld(true);
  // Cached per shirt, and per tucked or untucked body: a point below a tucked hem has no surface (and no button) there.
  // A shirt tucked into trousers takes its shape from them, so its surface is not cached.
  const probe=surfaceProbe(top,['mesh-shirt-body']),shape=id+(skirt&&style.tucked?':tucked':''),onSurface=(x,y)=>{const key=shape+':'+x+':'+y;
    if(tuckedIn!=null){const hit=probe(x,y,true);return hit&&{point:hit.point.clone(),normal:hit.normal.clone()};}
    if(!surfaceCache.has(key)){const hit=probe(x,y,true);surfaceCache.set(key,hit&&{point:hit.point.clone(),normal:hit.normal.clone()});}
    const hit=surfaceCache.get(key);return hit&&{point:hit.point.clone(),normal:hit.normal.clone()};};
  const line=(pts,name,r=.0016)=>{const out=pts.map(([x,y])=>onSurface(x,y)).filter(Boolean).map(h=>h.point.addScaledVector(h.normal,.0025).toArray());if(out.length>1)curve(top,out,r,stitch,name);};
  // The placket: the same print, edged by stitching down both sides from the collar to the hem. Worn open, the stitching
  // follows each side of the V down to the second button, then runs down both edges of the closed placket.
  if(style.placket){
    // Optional (`placket`): a short placket in a contrast colour from the collar down to `bottom`, edged by stitching,
    // with the buttons on it; below it the front is plain.
    const P=style.placket,mat=solid(P.colour,.8),edgeStitch=solid(P.stitch,.7);mat.side=T.DoubleSide;
    grid(top,4,16,(u,v)=>{const hit=onSurface(-P.half+2*P.half*u,P.bottom+(1.9-P.bottom)*v);return hit?hit.point.addScaledVector(hit.normal,.003).toArray():[0,P.bottom,.3];},mat,'contrast-placket');
    const along=k=>Array.from({length:k+1},(_,i)=>i/k),out=pts=>{const o=pts.map(([x,y])=>onSurface(x,y)).filter(Boolean).map(h=>h.point.addScaledVector(h.normal,.0042).toArray());if(o.length>1)curve(top,o,.0012,edgeStitch,'placket-stitch');};
    for(const s of [-1,1])out(along(8).map(t=>[s*(P.half-.004),1.89-(1.89-P.bottom-.004)*t]));
    out(along(4).map(t=>[-P.half+.004+(2*P.half-.008)*t,P.bottom+.004]));
  }
  else if(open&&style.concealed){
    // A concealed placket: the stitching follows each side of the V, then a single line runs down the wearer's left of the
    // closed fly front to the hem, beside the fold of its edge.
    const edge=y=>open.half*(y-open.bottom)/(NECK-open.bottom);
    for(const side of [-1,1])line(Array.from({length:6},(_,k)=>{const y=1.885-(1.885-open.bottom)*k/5;return [side*(edge(y)+PLACKET),y];}),'placket-stitch');
    line(Array.from({length:14},(_,k)=>[PLACKET*1.5,open.bottom-.012-(open.bottom-.012-hem-.014)*k/13]),'placket-stitch');
    line(Array.from({length:14},(_,k)=>[0,open.bottom-(open.bottom-hem-.004)*k/13]),'placket-edge',.0011);
  }
  else if(open){
    const edge=y=>open.half*(y-open.bottom)/(NECK-open.bottom);
    for(const side of [-1,1])line([...Array.from({length:6},(_,k)=>{const y=1.885-(1.885-open.bottom)*k/5;return [side*(edge(y)+PLACKET),y];}),
      ...Array.from({length:12},(_,k)=>[side*PLACKET,open.bottom-.012-(open.bottom-.012-hem-.012)*k/11])],'placket-stitch');
  }
  else for(const side of [-1,1])line(Array.from({length:14},(_,k)=>[side*PLACKET,1.885-(1.885-hem-.012)*k/13]),'placket-stitch');
  // The yoke's seam, all the way round just proud of the body, with the gathers starting below it.
  if(style.yoke)curve(top,Array.from({length:129},(_,k)=>{const a=k/128*Math.PI*2,y=yokeAt(style.yoke,a),[rx,rz]=bodyRadii(y,rows);return [Math.sin(a)*(rx+.005),y,Math.cos(a)*(rz+.005)];}),.0016,stitch,'yoke-seam');
  // Optional (`pocket`): a patch pocket on her left chest, in the print laid as on the body under it, with its top edge
  // hemmed and stitched round its sides and bottom.
  if(style.pocket){const [x0,x1]=style.pocket.x,[y0,y1]=style.pocket.y;
    const pocket=grid(top,12,12,(u,v)=>{const hit=onSurface(x0+(x1-x0)*u,y0+(y1-y0)*v);return hit?hit.point.addScaledVector(hit.normal,.0035).toArray():[0,y0,.3];},printMaterial(style,style.print,atlas),'chest-pocket');
    const pp=pocket.geometry.attributes.position,puv=pocket.geometry.attributes.uv;
    for(let i=0;i<pp.count;i++){const [rx,rz]=bodyRadii(pp.getY(i),rows);puv.setX(i,((Math.atan2(pp.getX(i)/rx,pp.getZ(i)/rz)/(Math.PI*2))%1+1)%1);}
    mapPrint(pocket,style.around,style.high,undefined,style.depth);
    const edge=pts=>{const out=pts.map(([x,y])=>onSurface(x,y)).filter(Boolean).map(h=>h.point.addScaledVector(h.normal,.0052).toArray());if(out.length>1)curve(top,out,.0013,stitch,'pocket-stitch');};
    const inset=.006,steps=k=>Array.from({length:k+1},(_,i)=>i/k);
    edge([...steps(6).map(t=>[x0+inset,y1-inset-(y1-y0-2*inset)*t]),...steps(8).map(t=>[x0+inset+(x1-x0-2*inset)*t,y0+inset]),...steps(6).map(t=>[x1-inset,y0+inset+(y1-y0-2*inset)*t])]);
    edge(steps(8).map(t=>[x0+inset+(x1-x0-2*inset)*t,y1-.016]));}
  // Optional (`backYoke`): a back yoke only, its seam across her back below the collar (`yoke` is a yoke front and back).
  if(style.backYoke){const back=surfaceProbe(top,['mesh-shirt-body']),pts=[];
    for(let k=0;k<=24;k++){const hit=back(-.26+.52*k/24,style.backYoke,false);if(hit)pts.push(hit.point.clone().addScaledVector(hit.normal,.0025).toArray());}
    if(pts.length>1)curve(top,pts,.0015,stitch,'yoke-seam');}
  // Optional (`patches`): appliqué patches laid on the front, each a small felt shape drawn in code.
  for(const P of style.patches||[]){const [cx,cy]=P.at,[pw,ph]=P.size,pix=tigerPatchData(P.colour,P.seed),map=texture(pix,true);map.wrapS=map.wrapT=T.ClampToEdgeWrapping;
    grid(top,12,8,(u,v)=>{const hit=onSurface(cx+(u-.5)*pw/1.06,cy+(v-.5)*ph/.76);return hit?hit.point.addScaledVector(hit.normal,.0035).toArray():[cx,cy,.3];},
      new T.MeshStandardMaterial({map,alphaTest:.5,roughness:.85,side:T.DoubleSide}),'applique-patch');}
  // Optional (`backPleat`): a short box pleat at the centre back, its two folds from the back yoke's seam down to this
  // height.
  if(style.backYoke&&style.backPleat){const back=surfaceProbe(top,['mesh-shirt-body']);
    for(const x of [-.012,.012]){const pts=[];for(let k=0;k<=5;k++){const hit=back(x,style.backYoke-.004-(style.backYoke-.004-style.backPleat)*k/5,false);if(hit)pts.push(hit.point.clone().addScaledVector(hit.normal,.0025).toArray());}
      if(pts.length>1)curve(top,pts,.0014,stitch,'back-pleat');}}
  // Buttons, slightly domed.
  const [buttonColour,buttonRoughness]=style.button;
  for(const y of style.buttons){const hit=onSurface(0,y);if(!hit)continue;
    const b=oval(top,hit.point.clone().addScaledVector(hit.normal,.006).toArray(),[.0105/1.06,.0105/.76,.004],solid(buttonColour,buttonRoughness),'shirt-button',20);b.lookAt(b.position.clone().add(hit.normal));}
  // A stitched hem, all the way round just above the lower edge (following the shirt-tail curve, where it has one).
  if(style.rows){const p=body.geometry.attributes.position;
    curve(top,Array.from({length:segments+1},(_,k)=>{const i=p.count-segments-1+k;return [p.getX(i)*1.005,p.getY(i)+.012,p.getZ(i)*1.005];}),.0016,stitch,'hem-stitch');}
  else{const [,hx,hz]=rows.at(-1);
    curve(top,Array.from({length:129},(_,k)=>{const a=k/128*Math.PI*2;return [Math.sin(a)*(hx+.0015),hem+.012,Math.cos(a)*(hz+.0015)];}),.0016,stitch,'hem-stitch');}
  return top;
}
const surfaceCache=new Map();
export const SHIRT_IDS=Object.keys(STYLES);
// The cropped shirts end above the skirt's waistband and the longer one covers it, so they are the same with or without
// the skirt; a hip-length shirt with tucked rows is tucked into the skirt when she wears one.
export function makeButtonShirt(id=MOTEL_TIE_DYE_SHIRT_ID,atlas=null,skirt=false,trousers=null){return makeShirt(id,STYLES[id]||STYLES[MOTEL_TIE_DYE_SHIRT_ID],atlas,skirt,trousers);}
