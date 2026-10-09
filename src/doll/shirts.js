// Button-down shirts: a body with a buttoned placket, a point collar on a stand, and set-in sleeves.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
// One template; each shirt's style (below) sets its print, fabric, stitching, buttons and whether the top button is open.
import * as T from 'three';
import { random, solid, oval, curve, shell, roundSleeveCap, surfaceProbe, easeOverHand, trimToEdge } from './model.js';
import { grid } from './polo.js';
import { MOTEL_TIE_DYE_SHIRT_ID, DESIGUAL_SPRAY_FLORAL_SHIRT_ID, DESIGUAL_SPLIT_FLORAL_SHIRT_ID, PAISLEY_SHIRT_ID } from '../wardrobe/catalog.js';
import { splitBodyData, splitCollarData, leftSleeveData, rightSleeveData } from './split-floral-print.js';

// Warm grey-mauve tie-dye, measured in the shirt's own photos (hanger front and back): the darkest patches about
// (55, 43, 43), the middle (100, 88, 87), the palest (215, 205, 200). Darker than measured: exposure, tone mapping and
// the mesh's sheen lift these values.
const DYE={dark:[12,9,11],mid:[70,62,66],light:[172,165,166]};
const NECK=1.905,HEM=1.26;
// Slim and fitted, cropped at her waist. Below 1.5 it follows the polo, whose hem clears every waistband.
const BODY_ROWS=[[NECK,.112,.104],[1.875,.17,.124],[1.83,.228,.154],[1.775,.265,.177],[1.65,.278,.184],[1.5,.282,.19],[1.4,.288,.2],[1.335,.29,.205],[HEM,.29,.205]];
const PLACKET=.017;

function bodyRadii(y){
  const rows=BODY_ROWS;let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;
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
// Paisley print: big teardrop paisleys in concentric bands, feathery leaf sprays and curling tendrils, all outlined in
// near-black on a warm white ground, read from the shirt's photos (front, back and a close-up). Drawn here, not copied.
// Measured: the ground about (236, 237, 239) in the evenly lit back view; ochre-yellow the commonest ink, then peach,
// cornflower blue, lilac-pink, a little violet and sage, outlines near (54, 46, 39). The ground is drawn a little darker,
// since the studio's exposure lifts it.
const PAISLEY={ground:[230,231,232],ink:[36,29,24],yellow:[204,152,28],ochre:[170,112,30],peach:[214,128,78],blue:[52,96,172],sky:[104,146,200],pink:[198,104,138],lilac:[132,98,176],sage:[112,140,104]};
// One tile is half her girth (.83 wide) and .684 high, in world units, so motifs stay round. A large paisley is about
// a third of her front's width, as on the model. Paisleys: [x, y, size, turn, tail, curl, outer band, comb band, core,
// dotted ring]. Sprays: [x, y, arc radius, from, to, leaflets, colours]. Tendrils: [x, y, radius, turns, turn, colour].
const PAISLEY_W=.83,PAISLEY_H=.684;
const PAISLEYS=[
  [.16,.2,.085,2.3,1.25,2.2,'yellow','blue','pink','pink'],[.6,.46,.09,-.7,1.3,-2.2,'pink','yellow','blue','peach'],
  [.47,.13,.055,.9,1.2,2.4,'blue','peach','sage','yellow'],[.1,.55,.065,-2.4,1.2,2,'ochre','lilac','blue','pink'],
  [.77,.17,.05,3.5,1.2,-2.4,'sage','yellow','pink','yellow'],[.36,.38,.045,1.7,1.2,2.2,'lilac','yellow','sage','peach'],
  [.75,.63,.042,-1.2,1.2,2,'yellow','blue','peach','pink'],[.3,.62,.05,.3,1.2,-2,'peach','sky','yellow','pink'],
  [.58,.27,.032,2.8,1.1,2,'yellow','pink','blue','sage'],
];
const SPRAYS=[
  [.37,.56,.11,-.5,1.9,8,['blue','sage','sky']],[.72,.03,.1,1.9,3.9,8,['sage','blue','yellow']],[.02,.33,.09,.9,2.7,7,['yellow','ochre','peach']],
  [.26,.02,.08,-1.6,.2,7,['lilac','pink','sky']],[.5,.33,.07,3.6,5.4,6,['yellow','ochre','yellow']],[.86,.4,.08,1.2,3,7,['blue','sky','sage']],
  [.08,.44,.075,-.9,.9,6,['yellow','peach','ochre']],[.62,.02,.07,-2.6,-1,6,['blue','sky','lilac']],
];
const TENDRILS=[[.45,.27,.036,1.6,.4,'yellow'],[.26,.41,.03,1.4,2.6,'blue'],[.68,.32,.032,1.5,-1.1,'pink'],[.08,.1,.028,1.3,1.2,'yellow'],[.56,.6,.024,1.3,3.5,'blue'],[.82,.47,.028,1.5,.9,'yellow'],[.2,.47,.022,1.3,4,'pink']];
function paisleyData(){
  return cached('paisley',()=>{
  const w=640,h=Math.round(w*PAISLEY_H/PAISLEY_W),data=new Uint8Array(w*h*4),px=PAISLEY_W/w,rand=random(29),C=PAISLEY;
  const col=new Float32Array(w*h*3);for(let i=0;i<w*h;i++)col.set(C.ground,i*3);
  const set=(i,c,k=1)=>{for(let j=0;j<3;j++)col[i*3+j]+=(c[j]-col[i*3+j])*k;};
  const wrapX=d=>d-PAISLEY_W*Math.round(d/PAISLEY_W),wrapY=d=>d-PAISLEY_H*Math.round(d/PAISLEY_H);
  // Visit the pixels within `reach` of (x, y), across the tile's edges, with their offsets from it.
  const near=(x,y,reach,fn)=>{const x0=Math.floor((x-reach)/px),x1=Math.ceil((x+reach)/px),y0=Math.floor((y-reach)/px),y1=Math.ceil((y+reach)/px);
    for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){const ix=((xx%w)+w)%w,iy=((yy%h)+h)%h;fn(iy*w+ix,wrapX(ix*px-x),wrapY(iy*px-y));}};
  // A line of the given width along points, stamped as discs.
  const stroke=(pts,width,c)=>{for(let k=0;k<pts.length-1;k++){const [ax,ay]=pts[k],[bx,by]=pts[k+1],n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/(px*.7)));
    for(let t=0;t<=n;t++){const x=ax+(bx-ax)*t/n,y=ay+(by-ay)*t/n;near(x,y,width,(i,dx,dy)=>{if(dx*dx+dy*dy<=width*width)set(i,c);});}}};
  // Tendrils: spiralling lines, under everything else, with a dot at the tip.
  for(const [x,y,r,turns,turn,c] of TENDRILS){const pts=[];for(let k=0;k<=60;k++){const t=k/60,a=turn+t*turns*Math.PI*2,rr=r*(1-.85*t);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}
    stroke(pts,.0032,C[c]);stroke(pts,.0012,C.ink);const [ex,ey]=pts[0];near(ex,ey,.006,(i,dx,dy)=>{if(dx*dx+dy*dy<.005**2)set(i,C[c]);});}
  // Leaf sprays: a stem along an arc with leaflets leaning out from it, each filled, outlined and veined.
  for(const [x,y,R,a0,a1,n,cs] of SPRAYS){
    const stem=Array.from({length:25},(_,k)=>{const a=a0+(a1-a0)*k/24;return [x+Math.cos(a)*R,y+Math.sin(a)*R];});stroke(stem,.0018,C.ink);
    for(let k=0;k<n;k++){const a=a0+(a1-a0)*(k+.5)/n,bx=x+Math.cos(a)*R,by=y+Math.sin(a)*R,dir=a+(a1>a0?.45:-.45),L=R*.5*(.75+.5*Math.sin(Math.PI*(k+.5)/n)),W=L*.38;
      const cx=bx+Math.cos(dir)*L,cy=by+Math.sin(dir)*L,c=Math.cos(dir),sn=Math.sin(dir),fill=C[cs[k%cs.length]];
      near(cx,cy,L*1.05,(i,dx,dy)=>{const lx=dx*c+dy*sn,ly=-dx*sn+dy*c;if(Math.abs(lx)>=L)return;const half=W*Math.pow(1-(lx/L)**2,.8),m=half-Math.abs(ly);
        if(m<0)return;set(i,m<.0022||Math.abs(ly)<.001?C.ink:fill);});}
  }
  // Paisleys: a teardrop whose tail curls, filled in bands from the edge in: an ink outline, a band with fine ink dots,
  // an ink line, a combed band, an ink line and a solid core with a pale eye; ringed outside by coloured dots.
  for(const [x,y,size,turn,tail,bend,outer,comb,core,dots] of PAISLEYS){
    const s=size*1.12,curl=bend*.65,c=Math.cos(turn),sn=Math.sin(turn);
    near(x,y,s*(1+tail)*1.3,(i,dx,dy)=>{const lx=(dx*c+dy*sn)/s,ly=(-dx*sn+dy*c)/s,d=Math.hypot(lx,ly);
      let a=Math.atan2(ly,lx)+curl*Math.max(0,d-.7)*.6;a=((a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
      const f=d/(1+tail*Math.exp(-((a/.5)**2))),ang=Math.atan2(ly,lx);
      if(f>=1.08&&f<1.17){if(Math.sin(ang*30)>.55&&Math.abs(f-1.125)<.035)set(i,C[dots]);return;}
      if(f>=1.045)return;
      if(f>=1){set(i,C[dots]);return;}
      if(f>=.93){set(i,C.ink);return;}
      if(f>=.74){set(i,Math.sin(ang*40)>.88&&Math.abs(f-.835)<.025?C.ink:C[outer]);return;}
      if(f>=.7){set(i,C.ink);return;}
      if(f>=.46){set(i,Math.sin(ang*26)>.1?C[comb]:C.ground);return;}
      if(f>=.42){set(i,C.ink);return;}
      set(i,f<.14?C.ground:C[core]);});
  }
  // A fine scatter of ink dots in the ground, and a soft blur so lines read as printed, not stamped.
  for(let k=0;k<260;k++){const x=rand()*PAISLEY_W,y=rand()*PAISLEY_H;near(x,y,.0025,(i,dx,dy)=>{if(dx*dx+dy*dy<.0018**2)set(i,C.ink,.8);});}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let r=0,g=0,b=0;
    for(const [dx,dy,k] of [[0,0,.5],[1,0,.125],[-1,0,.125],[0,1,.125],[0,-1,.125]]){const j=((((y+dy)+h)%h)*w+(((x+dx)+w)%w))*3;r+=col[j]*k;g+=col[j+1]*k;b+=col[j+2]*k;}
    const n=1+(rand()-.5)*.03;data[i]=Math.min(255,r*n);data[i+1]=Math.min(255,g*n);data[i+2]=Math.min(255,b*n);data[i+3]=255;}
  return {data,w,h};
  });
}
function crepeData(){
  // Viscose crepe: a fine, even pebble, as a bump.
  return cached('crepe',()=>{
  const size=64,data=new Uint8Array(size*size*4),rand=random(71);
  for(let i=0;i<size*size;i++){const v=Math.round(150+80*(rand()-.5));data[i*4]=data[i*4+1]=data[i*4+2]=v;data[i*4+3]=255;}
  return {data,w:size,h:size};
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
  // A relaxed shirt in printed viscose crepe, worn loose with the top button open: a fuller body to a hem below the
  // waistband, fuller sleeves gathered into buttoned cuffs, a back yoke with a centre pleat, and white buttons. Options
  // beyond the fitted shirts' (body, sleeve, yoke) are this shirt's; the others keep the defaults.
  [PAISLEY_SHIRT_ID]:{print:paisleyData,around:2,high:.9,collarAround:2,bump:[crepeData,90,60,.0012],sheen:['#fffaf0',.25,.45],roughness:.7,
    stitch:'#d8d2c4',facing:null,button:['#f3f0ea',.25],buttons:[1.785,1.705,1.625,1.545,1.465,1.385,1.305,1.225],collarTopstitch:true,open:{bottom:1.8,half:.034},
    // Fuller than the fitted shirts below the chest, to a straight hem at her high hip, as wide there as the Tommy
    // sweater, which clears every jacket, bottom and the skirt.
    body:[[NECK,.112,.104],[1.875,.17,.124],[1.83,.228,.154],[1.775,.268,.18],[1.65,.296,.198],[1.5,.304,.207],[1.4,.308,.214],[1.3,.311,.222],[1.242,.314,.232],[1.19,.316,.236]],
    sleeve:{rows:[[.025,.104,.104],[-.05,.124,.119],[-.2,.127,.121],[-.33,.122,.116],[-.41,.112,.107],[-.44,.102,.098]],cuff:[[-.43,.095,.091],[-.5,.093,.089],[-.53,.092,.088]]},
    yoke:{y:1.79,pleat:1.55}},
};
function texture({data,w,h},srgb){
  const t=new T.DataTexture(data,w,h,T.RGBAFormat);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;
}
function printMaterial(style,print=style.print){
  const [bumpData,bu,bv,bumpScale]=style.bump,bump=texture(bumpData(),false);bump.repeat.set(bu,bv);
  const [sheenColor,sheen,sheenRoughness]=style.sheen;
  return new T.MeshPhysicalMaterial({map:texture(print(),true),roughness:style.roughness,sheen,sheenColor:new T.Color(sheenColor),sheenRoughness,bumpMap:bump,bumpScale,side:T.DoubleSide});
}
// Print coordinates: around the body and up it, in tiles sized to her, so the patches are the same size everywhere.
function mapPrint(mesh,around,high,toOutfit=v=>v){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,v=new T.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);toOutfit(v);uv.setXY(i,uv.getX(i)*around,v.y/high);}
  uv.needsUpdate=true;
}
function makeShirtCollar(top,mat,facing,stitch,style){
  // A point collar: the fall turns over a stand round her neck and lies on her shoulders, its front edges spreading to
  // points from the top button (or, worn open, from either side of the V). u runs from the right point round the back to
  // the left; v from fold to edge.
  const open=style.open,x0=open?open.half+.008:.012;
  const fold=a=>[.123*Math.sin(a),1.952-.03*(1+Math.cos(a))/2,.115*Math.cos(a)];
  const frontX=v=>x0+(.1-x0)*v**1.3;
  const outerY=(a,u)=>{const end=Math.max(0,1-Math.min(u,1-u)/.12);return 1.888-.04*(1+Math.cos(a))/2-.05*end*end;};
  const at=(u,v,inset=0)=>{
    const vv=v*(1-inset),y=outerY(0,0)+(fold(0)[1]-outerY(0,0))*(1-vv),[rx]=bodyRadii(y);
    const r=vv<1e-6?.123:.123+(rx+.01-.123)*vv,start=Math.asin(Math.min(.99,(frontX(vv)+inset*.6*(1-vv))/r));
    const uu=inset?.5+(u-.5)*(1-inset*.9):u,a=start+(Math.PI*2-2*start)*uu,f=fold(a),oy=outerY(a,uu),[ox,oz]=bodyRadii(oy);
    const out=[(ox+.01)*Math.sin(a),oy,(oz+.01)*Math.cos(a)],roll=.01*Math.sin(Math.PI*vv),s=Math.hypot(out[0],out[2])||1,lift=inset?.002:0;
    return [f[0]+(out[0]-f[0])*vv+(roll+lift)*out[0]/s,f[1]+(out[1]-f[1])*vv,f[2]+(out[2]-f[2])*vv+(roll+lift)*out[2]/s];
  };
  const fall=grid(top,96,8,(u,v)=>at(u,v),mat,'shirt-collar-fall');mapPrint(fall,style.collarAround,style.high);
  // The stand: faced in black inside on some shirts (it shows between the collar's front edges), otherwise in the print.
  const standStart=Math.asin(x0/.115);
  grid(top,64,2,(u,v)=>{const a=standStart+(Math.PI*2-2*standStart)*u,r=[.115-.006*v,.107-.006*v];return [r[0]*Math.sin(a),1.95-.05*v,r[1]*Math.cos(a)];},facing||mat,'shirt-collar-stand');
  curve(top,Array.from({length:97},(_,i)=>at(i/96,1)),.0035,mat,'shirt-collar-edge');
  // Topstitching just inside the collar's edges, where the shirt has it: along the outer edge and up both front edges.
  if(style.collarTopstitch)curve(top,Array.from({length:97},(_,i)=>at(i/96,1,.16)),.0016,stitch,'shirt-collar-topstitch');
  return fall;
}
function makeShirt(id,style){
  const top=new T.Group();top.name=id;
  const stitch=solid(style.stitch,.6),facing=style.facing&&solid(style.facing,.85);
  // A shirt's own body rows (an option) set its fit and hem; the fitted shirts are cropped at HEM.
  const body=shell(top,style.body||BODY_ROWS,printMaterial(style),'mesh-shirt-body',128),hemFront=style.body?style.body.at(-1)[0]:HEM;
  // Worn open at the top: a narrow V cut down to the second button.
  const open=style.open;
  if(open)trimToEdge(body,128,v=>v,(x,z)=>z<=0?NECK+1:Math.min(NECK+1,open.bottom+(NECK-open.bottom)*Math.abs(x)/open.half));
  mapPrint(body,style.around,style.high);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;arm.updateMatrix();
    if(style.sleeve){
      // Fuller sleeves (an option), blousing a little into a buttoned cuff at her wrist, stitched along its top.
      const S=style.sleeve,sleeve=shell(arm,S.rows,printMaterial(style),'mesh-shirt-sleeve',64);
      roundSleeveCap(sleeve,side,S.rows[0][0]);mapPrint(sleeve,1,style.high,v=>v.applyMatrix4(arm.matrix));easeOverHand(sleeve,side);
      const cuff=shell(arm,S.cuff,printMaterial(style),'shirt-cuff',64);mapPrint(cuff,1,style.high,v=>v.applyMatrix4(arm.matrix));easeOverHand(cuff,side,.01);
      for(const [k,y] of [[0,S.cuff[0][0]-.008],[1,S.cuff.at(-1)[0]+.006]]){const q=cuff.geometry.attributes.position,ring=[],row=k?q.count-65:0;
        for(let i=row;i<row+65;i++)ring.push([q.getX(i)*1.012,y,q.getZ(i)*1.012]);curve(arm,ring,.0012,stitch,'cuff-stitch');}
      const q=cuff.geometry.attributes.position,i=Math.round(64*(side>0?.25:.75)),mid=Math.floor(q.count/65/2)*65+i;
      // A button on the cuff's outer side, its face turned out from the arm.
      const b=oval(arm,[q.getX(mid)*1.06,q.getY(mid),q.getZ(mid)*1.06],[.008,.008,.003],solid(style.button[0],style.button[1]),'cuff-button',16);b.rotation.y=Math.atan2(q.getX(mid),q.getZ(mid));
    }else{
    // Long fitted sleeves to the wrist, as on the bronze mesh top, ending in a plain stitched hem that eases over her hand.
    // Optional (`sleevePrints`): each sleeve its own print, laid out [around, high].
    const SP=style.sleevePrints?.[side>0?'left':'right'];
    const sleeve=shell(arm,[[.025,.1,.102],[-.04,.113,.109],[-.16,.108,.102],[-.28,.105,.1],[-.40,.097,.092],[-.49,.08,.082],[-.53,.079,.081]],printMaterial(style,SP?.[0]),'mesh-shirt-sleeve',48);
    roundSleeveCap(sleeve,side,.025);mapPrint(sleeve,SP?SP[1]:1,SP?SP[2]:style.high,v=>v.applyMatrix4(arm.matrix));easeOverHand(sleeve,side);
    const p=sleeve.geometry.attributes.position,hem=[];for(let i=p.count-49;i<p.count;i++)hem.push([p.getX(i)*1.02,p.getY(i)+.008,p.getZ(i)*1.02]);
    curve(arm,hem,.0014,stitch,'sleeve-hem-stitch');
    }
    top.add(arm);
  }
  makeShirtCollar(top,printMaterial(style,style.collarPrint),facing,stitch,style);
  top.updateMatrixWorld(true);
  const probe=surfaceProbe(top,['mesh-shirt-body']),onSurface=(x,y)=>{const key=id+':'+x+':'+y;
    if(!surfaceCache.has(key)){const hit=probe(x,y,true);surfaceCache.set(key,hit&&{point:hit.point.clone(),normal:hit.normal.clone()});}
    const hit=surfaceCache.get(key);return hit&&{point:hit.point.clone(),normal:hit.normal.clone()};};
  const line=(pts,name,r=.0016,front=true)=>{const out=pts.map(([x,y])=>front?onSurface(x,y):probe(x,y,false)).filter(Boolean).map(h=>h.point.clone().addScaledVector(h.normal,.0025).toArray());if(out.length>1)curve(top,out,r,stitch,name);};
  // The placket: the same print, edged by stitching down both sides from the collar to the hem. Worn open, the stitching
  // follows each side of the V down to the second button, then runs down both edges of the closed placket.
  if(open){
    const edge=y=>open.half*(y-open.bottom)/(NECK-open.bottom);
    for(const side of [-1,1])line([...Array.from({length:6},(_,k)=>{const y=1.885-(1.885-open.bottom)*k/5;return [side*(edge(y)+PLACKET),y];}),
      ...Array.from({length:12},(_,k)=>[side*PLACKET,open.bottom-.012-(open.bottom-.012-hemFront-.012)*k/11])],'placket-stitch');
  }
  else for(const side of [-1,1])line(Array.from({length:14},(_,k)=>[side*PLACKET,1.885-(1.885-hemFront-.012)*k/13]),'placket-stitch');
  // Buttons, slightly domed.
  const [buttonColour,buttonRoughness]=style.button;
  for(const y of style.buttons){const hit=onSurface(0,y);if(!hit)continue;
    const b=oval(top,hit.point.clone().addScaledVector(hit.normal,.006).toArray(),[.0105/1.06,.0105/.76,.004],solid(buttonColour,buttonRoughness),'shirt-button',20);b.lookAt(b.position.clone().add(hit.normal));}
  // A stitched hem, all the way round just above the lower edge.
  if(style.body){const p=body.geometry.attributes.position;curve(top,Array.from({length:129},(_,k)=>{const i=p.count-129+k;return [p.getX(i)*1.004,p.getY(i)+.012,p.getZ(i)*1.004];}),.0016,stitch,'hem-stitch');}
  else curve(top,Array.from({length:129},(_,k)=>{const a=k/128*Math.PI*2;return [Math.sin(a)*.2915,HEM+.012,Math.cos(a)*.2065];}),.0016,stitch,'hem-stitch');
  // A back yoke (an option): a seam across her upper back, with a short box pleat at the centre below it.
  if(style.yoke){const Y=style.yoke;line(Array.from({length:17},(_,k)=>[-.26+.52*k/16,Y.y]),'yoke-seam',.0016,false);
    for(const x of [-.012,.012])line(Array.from({length:6},(_,k)=>[x,Y.y-.004-(Y.y-.004-Y.pleat)*k/5]),'back-pleat',.0014,false);}
  return top;
}
const surfaceCache=new Map();
export const SHIRT_IDS=Object.keys(STYLES);
// Cropped at the waist, so each shirt is the same with or without the skirt.
export function makeButtonShirt(id=MOTEL_TIE_DYE_SHIRT_ID){return makeShirt(id,STYLES[id]||STYLES[MOTEL_TIE_DYE_SHIRT_ID]);}
