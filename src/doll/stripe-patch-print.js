// The Desigual Hawaii patch tee's print, drawn locally from the reference reading (not copied from the photos):
// - fine black stripes on cream jersey, a little uneven, as a slub yarn-dyed stripe is;
// - on the front, lines of “desigualite” in white blackletter, cracked and worn, repeated down the front;
// - over them on her left front, a sewn-on patch: a picture of a row of woody wagons under palms and a maroon
//   “DSG HAWAII” sign, framed by sequinned bands (fish-scale motifs on the left and top, black bands with red flowers
//   and red and gold diagonal stripes on the right and bottom), with an embroidered pink rose at its top corner;
// - on the sleeves, the stripes run round the arm; above the dropped shoulder seam they run down the arm, as the body's
//   stripes do where they fall over the shoulder.
// Textures are laid out as printed-long-tee.js expects: the body holds a front and a back panel side by side, each
// projected flat; row 0 is the hem (or the cuff), the last row the neck (or the shoulder).
// Lengths in the spec are in world units (1300 texture pixels each), measured across the fabric from the centre front
// (positive toward her left, the viewer's right) and down from the neck.
import { random } from './model.js';

const PX=1300,WIDE=1.06,TALL=.76;// texture pixels per world unit; the outfit's scale across and up
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
// Smooth value noise that repeats every `period` cells across (and `rows` down).
function valueNoise(seed,period,rows){const r=random(seed),g=new Float32Array(period*rows);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{let xi=Math.floor(x),yi=Math.floor(y);const fx=x-xi,fy=y-yi;xi%=period;if(xi<0)xi+=period;yi%=rows;if(yi<0)yi+=rows;
    const x1=xi+1===period?0:xi+1,r0=yi*period,r1=(yi+1===rows?0:yi+1)*period,a=g[r0+xi],b=g[r0+x1],c=g[r1+xi],d=g[r1+x1],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}

// The stripes: how dark a point is (0 cream, 1 black) at a distance `d` (pixels) along the stripes' period `p` (pixels),
// anti-aliased over a pixel, with each stripe's width varying a little.
function stripe(d,p,share,widths){const n=Math.floor(d/p),f=d-n*p,w=p*share*widths(n);return clamp(.5+Math.min(f,w-f)) ;}
const stripeWidths=seed=>{const r=random(seed),t=Array.from({length:97},()=>.88+.24*r());return n=>t[((n%97)+97)%97];};
// The jersey's colour for a darkness: cream to black, with a soft slub across.
function jersey(P,dark,slub){const c=mix(P.cream,P.black,dark),k=1+.06*(slub-.5);return c.map(v=>v*k);}

const SUB=[.25,.25,.75,.25,.25,.75,.75,.75];
// An overlay canvas in pixels, painted with anti-aliased shapes: each pixel is sampled at four points, and `fn(x, y)`
// gives the colour there (or null outside the shape).
function overlay(w,h){
  const rgb=new Float32Array(w*h*3),alpha=new Float32Array(w*h);
  const put=(x,y,col,a)=>{if(x<0||y<0||x>=w||y>=h||a<=0)return;const i=y*w+x,b=1-a;for(let c=0;c<3;c++)rgb[i*3+c]=rgb[i*3+c]*b+col[c]*a;alpha[i]=alpha[i]*b+a;};
  const fill=(x0,y0,x1,y1,fn,a=1)=>{const c=[0,0,0];
    for(let y=Math.max(0,Math.floor(y0));y<=Math.min(h-1,Math.ceil(y1));y++)for(let x=Math.max(0,Math.floor(x0));x<=Math.min(w-1,Math.ceil(x1));x++){
      let n=0;c[0]=c[1]=c[2]=0;for(let k=0;k<4;k++){const col=fn(x+SUB[k*2],y+SUB[k*2+1]);if(col){n++;c[0]+=col[0];c[1]+=col[1];c[2]+=col[2];}}
      if(n){c[0]/=n;c[1]/=n;c[2]/=n;put(x,y,c,a*n/4);}}};
  return {w,h,rgb,alpha,put,fill};
}
// Non-zero winding, so overlapping strokes stay filled.
const inPolygon=(pts,x,y)=>{let wind=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)wind+=yi>yj?1:-1;}return wind!==0;};
const bounds=pts=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};

// Blackletter (textura) lower case, as pen paths in x-heights (baseline 0, y up): each path is drawn with a broad nib
// held at an angle, so the strokes are heavy down and hairline across, with diamond ends, as written. Advances in ems.
const BLACKLETTER={
  d:{w:.74,paths:[[[.44,1.42],[.44,.1],[.56,-.02]],[[.44,.94],[.12,1.0],[0,.86],[0,.14],[.12,0],[.44,.1]]]},
  e:{w:.6,paths:[[[.4,.8],[.22,1.0],[0,.86],[0,.14],[.12,0],[.42,.12]],[[0,.5],[.4,.8]]]},
  s:{w:.58,paths:[[[.4,.9],[.24,1.0],[0,.86],[0,.66],[.38,.38],[.38,.14],[.18,0],[-.04,.08]]]},
  i:{w:.36,paths:[[[-.1,.86],[.02,1.0],[.02,.1],[.14,-.02]],[[0,1.22],[.06,1.3]]]},
  g:{w:.72,paths:[[[.44,1.0],[.44,-.24],[.26,-.44],[-.02,-.36]],[[.44,.94],[.12,1.0],[0,.86],[0,.28],[.12,.16],[.44,.24]]]},
  u:{w:.76,paths:[[[-.1,.86],[.02,1.0],[.02,.1],[.14,-.02],[.46,.12]],[[.46,1.0],[.46,.1],[.58,-.02]]]},
  a:{w:.74,paths:[[[0,.86],[.16,1.0],[.44,.9],[.44,.1],[.56,-.02]],[[.44,.56],[.1,.56],[0,.44],[0,.14],[.12,0],[.44,.12]]]},
  l:{w:.36,paths:[[[-.1,1.3],[.02,1.44],[.02,.1],[.14,-.02]]]},
  t:{w:.42,paths:[[[.02,1.26],[.02,.1],[.14,-.02],[.3,.06]],[[-.12,.96],[.3,.96]]]},
};
// One nib stroke along a path, as quadrilaterals swept between successive points (x, y in pixels, y down).
function nibQuads(path,nib){const [nx,ny]=nib,quads=[];for(let i=1;i<path.length;i++){const [ax,ay]=path[i-1],[bx,by]=path[i];
  quads.push([[ax+nx,ay+ny],[bx+nx,by+ny],[bx-nx,by-ny],[ax-nx,ay-ny]]);}return quads;}
// A line of text at a baseline, each glyph's quads gathered so a pixel is tested only against its own letter.
function textLine(word,x0,baseline,em,L){
  const ang=L.nibAngle*Math.PI/180,nib=[Math.cos(ang)*L.nib*em/2,-Math.sin(ang)*L.nib*em/2],glyphs=[];let x=x0;
  for(const ch of word){if(ch===' '){x+=L.space*em;continue;}const G=BLACKLETTER[ch];
    const quads=G.paths.flatMap(p=>nibQuads(p.map(([gx,gy])=>[x+gx*em,baseline-gy*em]),nib)).map(pts=>({pts,box:bounds(pts)}));
    glyphs.push({quads,box:bounds(quads.flatMap(q=>q.pts))});x+=(G.w+L.tracking)*em;}
  return {glyphs,end:x};
}

// The patch's picture: a row of woody wagons, side on and overlapping, under palms and a maroon “DSG HAWAII” sign, a
// surfboard on the middle car's roof. Local coordinates run 0 to 1 across and down; `asp` is the picture's width over
// its height in pixels. Returns a colour.
function picture(I,asp,noise){
  // Cars from the back (top right) to the front (bottom left): their box [left, top, right, bottom] and colour.
  const cars=[[.44,.36,1.06,.7,I.blue],[.2,.47,.84,.84,I.cream],[-.1,.6,.58,1.03,I.red]],signBox=[.38,.04,.98,.31];
  const sign=signPainter(I,(signBox[2]-signBox[0])*asp/(signBox[3]-signBox[1]));
  return (x,y)=>{
    for(let k=cars.length-1;k>=0;k--){const [l,t,r,b,col]=cars[k];if(x<l||x>r||y<t||y>b)continue;
      const c=woody(I,(x-l)/(r-l),(y-t)/(b-t),(r-l)*asp/(b-t),col,noise,k===1);if(c)return c;}
    if(x>signBox[0]&&x<signBox[2]&&y>signBox[1]&&y<signBox[3])return sign((x-signBox[0])/(signBox[2]-signBox[0]),(y-signBox[1])/(signBox[3]-signBox[1]));
    if(palm(x,y*1/asp,.11,.06/asp,.62/asp,asp)||palm(x,y/asp,.3,.17/asp,.5/asp,asp))return I.palm;
    return y>.62?I.sand:mix(I.sky,I.skyLight,clamp(y/.6));
  };
}
// A woody wagon side on, facing left, in its box (u across, v down, `asp` its width over height): rounded nose and
// bonnet in the car's colour, a cabin with three windows over wooden panelling in a pale frame, wings over two wheels.
function woody(I,u,v,asp,col,noise,board){
  const d=(cx,cy)=>Math.hypot((u-cx)*asp,v-cy);// distance in box heights
  for(const cx of [.2,.79]){const r=d(cx,.84);if(r<.16)return r<.07?I.chrome:I.tyre;if(r<.24&&v<.84)return col;}
  if(board&&v<.08){const e=((u-.6)/.42)**2+((v-.04)/.04)**2;if(e<1)return Math.abs(v-.04)<.008?I.orange:I.board;}
  if(v>.48&&v<.84&&u<.3){if(u<.05&&Math.hypot((u-.05)*asp,v-.6)>.12&&v<.6)return null;return u<.035&&v>.7?I.chrome:mix(col,[255,255,255],.18*(1-(v-.48)/.36));}// bonnet and nose
  if(u<.26||u>.99||v<.08||v>.84)return null;
  if(u<.32&&v<.5&&(u-.26)*asp<(.5-v)*.35)return null;// the sloping windscreen
  if(v<.14)return mix(col,[255,255,255],.25);// the roof catches the light
  if(v<.44){const pane=u>.32&&u<.97&&Math.abs(u-.55)>.015&&Math.abs(u-.77)>.015&&v>.17&&v<.42;return pane?mix(I.glass,I.glassLight,clamp((u*1.2-v)*1.4)**2):I.woodLight;}
  if(v>.78)return col;
  const frame=v<.49||v>.74||u<.3||u>.96||Math.abs(u-.55)<.015||Math.abs(u-.77)<.015;if(frame)return I.woodLight;
  const g=noise(u*14,v*70)*.7+.3*Math.sin(v*120+noise(u*40,v*6)*5);return mix(I.wood,I.woodDark,clamp(g));
}
// A palm in picture coordinates (y in widths): a thin leaning trunk up to a crown of drooping fronds.
function palm(x,y,cx,top,height){const t=(y-top)/height;if(t>0&&t<1&&Math.abs(x-(cx+.04*t*t))<.007)return true;
  const dx=x-cx,dy=y-top,r=Math.hypot(dx,dy);if(r>.12||r<.004)return false;const a=Math.atan2(dy,dx),k=Math.round(a/(Math.PI/4));
  return Math.abs(a-k*Math.PI/4)*r<.014*(1-r/.12)+.002&&dy<.03+.3*Math.abs(dx);}
// The sign: maroon with a cream border, “DSG” large over “HAWAII”, in strokes; `asp` is its width over its height.
function signPainter(I,asp){
  const P=[],add=(pts,x,y,w,h,width)=>P.push({pts:pts.map(([u,v])=>[x+u*w,y+v*h]),width});
  const D=[[0,0],[0,1],[.5,1],[.9,.78],[.9,.22],[.5,0],[0,0]],S=[[.92,.14],[.62,0],[.18,0],[0,.22],[.12,.44],[.85,.58],[.96,.8],[.8,1],[.3,1],[.04,.86]],G=[[.94,.16],[.62,0],[.26,0],[0,.26],[0,.74],[.26,1],[.7,1],[.94,.8],[.94,.56],[.52,.56]];
  [D,S,G].forEach((g,k)=>add(g,.25+k*.18,.12,.13,.42,.075));
  const H=[[[0,0],[0,1]],[[.9,0],[.9,1]],[[0,.5],[.9,.5]]],A=[[[0,1],[.45,0],[.9,1]],[[.2,.64],[.7,.64]]],W=[[[0,0],[.22,1],[.47,.4],[.72,1],[.94,0]]],Ii=[[[.5,0],[.5,1]]];
  let x=.26;for(const [glyph,w] of [[H,.065],[A,.07],[W,.09],[A,.07],[Ii,.02],[Ii,.02]]){for(const s of glyph)add(s,x,.64,w,.22,.045);x+=w+.03;}
  return (u,v)=>{if(u<.025||u>.975||v<.06||v>.94)return u<.012||u>.988||v<.03||v>.97?I.maroon:I.cream;if(u<.04||u>.96||v<.1||v>.9)return I.maroon;
    for(const {pts,width} of P)for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i],vx=bx-ax,vy=by-ay,t=clamp(((u-ax)*vx+(v-ay)*vy)/(vx*vx+vy*vy||1));
      if(Math.hypot((u-ax-vx*t)*asp,v-ay-vy*t)<width)return I.cream;}
    return I.maroon;};
}

// The sequinned bands: fish scales (rings of orange, cream and red on navy) for the left and top, and black bands of
// red embroidered flowers between boxes of red and gold diagonal stripes for the right and bottom. (u, v) run along and
// across the band in pixels; `bw` is its width.
function scales(I,u,v,bw){const r=bw*.24,row=Math.floor(v/(r*1.5)),cx=(Math.round((u-(row%2)*r)/(r*2)))*r*2+(row%2)*r,cy=(row+.9)*r*1.5,d=Math.hypot(u-cx,v-cy)/r;
  if(v<cy+.05*r&&d<1)return d<.4?I.red:d<.62?I.cream:d<.85?I.orange:I.red;
  const up=Math.hypot(u-cx-r,v-cy+r*1.5)/r,ul=Math.hypot(u-cx+r,v-cy+r*1.5)/r;if(Math.min(up,ul)<1&&v<cy-r*.4)return null;return I.navy;}
function flowerBand(I,u,v,bw){const cell=bw*1.15,k=Math.floor(u/cell),cu=(k+.5)*cell,cv=bw/2,du=u-cu,dv=v-cv;
  if(k%2){// red and gold sequins in diagonal stripes, in a box
    if(Math.abs(du)>cell*.42||Math.abs(dv)>bw*.36)return I.black;const s=Math.floor((du+dv)/(bw*.11));return s%2?I.gold:I.red;}
  const r=Math.hypot(du,dv)/(bw*.36),a=Math.atan2(dv,du);if(r<.22)return I.cream;
  if(r<.55+.4*Math.abs(Math.cos(a*2.5)))return r<.5?I.pink:I.red;
  if(Math.abs(Math.abs(du)-bw*.42)<bw*.04&&Math.abs(dv)<bw*.25)return I.leaf;return I.black;}

// The embroidered rose cluster: a big pink rose in rings of petals, two red buds on stems, and leaves. (x, y) in
// pixels from the rose's centre, `r` its radius. Satin stitches show as fine lines across each petal.
function rose(I,x,y,r){
  const buds=[[-.9,-1.55,.32],[.15,-1.75,.3]],leaves=[[-.35,-1.1,.5,-2.4],[.95,.55,.55,.6],[-.2,1.15,.5,1.7],[1.15,-.6,.45,-.5]];
  for(const [bx,by,br] of buds){const dx=x/r-bx,dy=y/r-by;if(Math.hypot(dx,dy*.8)<br)return Math.sin((dx+dy)*40)>.6?I.redDeep:I.red;
    if(Math.hypot(dx,dy-br*.9)<br*.55&&dy>0)return I.leaf;}
  const R=Math.hypot(x,y)/r,a=Math.atan2(y,x);
  if(R<1){const ring=R<.3?2:R<.62?1:0,edge=1+.08*Math.cos(a*5+ring*2);if(R<edge){const shade=[I.pinkLight,I.pink,I.pinkDeep][ring],l=Math.sin(a*14+R*30)>.7;return l?mix(shade,[255,255,255],.25):shade;}}
  for(const [lx,ly,len,ang] of leaves){const dx=x/r-lx,dy=y/r-ly,c=Math.cos(ang),s=Math.sin(ang),t=(dx*c+dy*s)/len,w=(-dx*s+dy*c)/len;
    if(t>-1&&t<1&&Math.abs(w)<.45*Math.sqrt(1-t*t))return Math.abs(w)<.05?I.leafLight:w>0?I.leaf:I.leafDark;}
  // Stems from the buds down to the rose.
  for(const [bx,by] of buds){const t=clamp((y/r-by)/(-.6-by));if(t>0&&t<1&&Math.abs(x/r-(bx+(0-bx)*t*t))<.06)return I.leafDark;}
  return null;
}

// The front's print over the stripes, in a flat canvas `w` pixels across (centred on the centre front) and `h` down.
function frontPrint(w,h,P,seed){
  const O=overlay(w,h),I=Object.fromEntries(Object.entries(P.inks).map(([k,v])=>[k,hex(v)])),cx=w/2,L=P.letters,em=L.size*PX;
  // The lettering: white, cracked and worn through to the stripes in places.
  const crack=valueNoise(seed+5,64,64),crack2=valueNoise(seed+6,64,64),wear=valueNoise(seed+7,64,64);
  const ink=(x,y)=>{const a=crack(x/14,y/14),b=crack2(x/9,y/9);if(Math.abs(a-.5)<.025||Math.abs(b-.5)<.015||wear(x/40,y/40)<L.wear)return null;return I.letter;};
  L.lines.forEach(([baseline,shift])=>{let x=cx-w/2+shift*em;
    while(x<w){const {glyphs,end}=textLine(L.word,x,baseline*PX,em,L);
      for(const g of glyphs){const [x0,y0,x1,y1]=g.box;O.fill(x0,y0,x1,y1,(px,py)=>g.quads.some(({pts,box:[a,b,c,d]})=>px>=a&&px<=c&&py>=b&&py<=d&&inPolygon(pts,px,py))?ink(px,py):null,L.alpha);}
      x=end+L.gap*em;}});
  // The patch: the picture inside sequinned bands, then the rose over its top corner.
  const Pt=P.patch,x0=cx+Pt.left*PX,x1=cx+Pt.right*PX,y0=Pt.top*PX,y1=Pt.bottom*PX,bw=Pt.band*PX,sparkle=random(seed+9);
  const pic=picture(I,(x1-x0-bw*2)/(y1-y0-bw*2),valueNoise(seed+8,32,32));
  O.fill(x0,y0,x1,y1,(x,y)=>{
    if(x<x0||x>x1||y<y0||y>y1)return null;
    const edge=Math.min(x-x0,x1-x,y-y0,y1-y);if(edge<bw*.12)return I.edging;// a pink sequin edging all round
    if(x<x0+bw)return scales(I,y-y0,x-x0,bw)??I.navy;if(y<y0+bw)return scales(I,x-x0,y-y0,bw)??I.navy;
    if(x>x1-bw)return flowerBand(I,y-y0,x-(x1-bw),bw);if(y>y1-bw)return flowerBand(I,x-x0,y-(y1-bw),bw);
    return pic((x-x0-bw)/(x1-x0-bw*2),(y-y0-bw)/(y1-y0-bw*2));});
  // Sequins catch the light: bright points scattered over the bands.
  for(let k=0;k<Pt.sequins;k++){const side=Math.floor(sparkle()*4),t=sparkle(),d=sparkle()*bw;
    const [x,y]=[[x0+d,y0+t*(y1-y0)],[x0+t*(x1-x0),y0+d],[x1-d,y0+t*(y1-y0)],[x0+t*(x1-x0),y1-d]][side];
    O.fill(x-1.5,y-1.5,x+1.5,y+1.5,(px,py)=>Math.hypot(px-x,py-y)<1.4?(side<2?I.sparkle:I.gold):null,.85);}
  const R=P.rose,rx=cx+R.x*PX,ry=R.y*PX,rr=R.size*PX;
  O.fill(rx-rr*2,ry-rr*2.2,rx+rr*2,ry+rr*1.8,(x,y)=>rose(I,x-rx,y-ry,rr));
  return O;
}

// Interpolated half-widths (across and front to back) of the body's rows at height y, in outfit units.
function radiiAt(rows,y){if(y>=rows[0][0])return rows[0].slice(1,3);for(let i=1;i<rows.length;i++)if(y>=rows[i][0]){const [ya,xa,za]=rows[i-1],[yb,xb,zb]=rows[i],t=(ya-y)/(ya-yb);return [xa+(xb-xa)*t,za+(zb-za)*t];}return rows.at(-1).slice(1,3);}
// Distance across the fabric from the centre front, in world units, to each angle round an ellipse (rx, rz in outfit
// units), as a table of `n` steps from the centre front to the side.
function arcTable(rx,rz,n=64){const t=new Float32Array(n+1),step=Math.PI/2/n;for(let k=1;k<=n;k++){const p=(k-.5)*step;t[k]=t[k-1]+Math.hypot(rx*WIDE*Math.cos(p),rz*Math.sin(p))*step;}return t;}
function arcAt(table,rx,x){const th=Math.asin(clamp(Math.abs(x)/rx)),n=table.length-1,f=th/(Math.PI/2)*n,k=Math.min(n-1,Math.floor(f)),s=table[k]+(table[k+1]-table[k])*(f-k);return x<0?-s:s;}

const cache=new Map();
// The body's texture: `panelW` pixels for each of the front and back panels, `h` rows; `half` is the panels' half-width
// in outfit units (the widest row).
export function stripePatchBody(key,panelW,h,B,P,half){
  if(cache.has(key))return cache.get(key);
  const w=panelW*2,data=new Uint8Array(w*h*4),C={cream:hex(P.ground),black:hex(P.stripe)},p=P.period*PX,widths=stripeWidths(P.seed);
  const slub=valueNoise(P.seed+1,40,200),wave=valueNoise(P.seed+2,24,60);
  // The front's print lies on a flat canvas as wide as the fabric round the widest row.
  const Q=Math.max(...B.rows.map(r=>arcTable(r[1],r[2]).at(-1))),fw=Math.ceil(2*Q*PX),O=frontPrint(fw,h,P,P.seed);
  const arc=new Float32Array(panelW);
  for(let r=0;r<h;r++){const y=B.neck-r/(TALL*PX),[rx,rz]=radiiAt(B.rows,y),row=h-1-r,table=arcTable(rx,rz);
    // Across the fabric, from the centre front, for each column of a panel (both panels are mirror images).
    for(let c=0;c<=panelW>>1;c++){const s=arcAt(table,rx,((c+.5)/panelW*2-1)*half)*PX;arc[c]=s;arc[panelW-1-c]=-s;}
    for(let c=0;c<w;c++){const sp=arc[c%panelW];
      // Stripes wave a little across, as knitted stripes do; the slub shades the yarn a little lighter and darker.
      const dark=stripe(r+1.5*(wave(sp/60,r/40)-.5),p,P.share,widths),k=1+.06*(slub(sp/30,r/4)-.5),o=(row*w+c)*4;
      let R=(C.cream[0]+(C.black[0]-C.cream[0])*dark)*k,G=(C.cream[1]+(C.black[1]-C.cream[1])*dark)*k,Bl=(C.cream[2]+(C.black[2]-C.cream[2])*dark)*k;
      if(c<panelW){const fx=Math.round(sp+fw/2),i=r*fw+fx,al=fx>=0&&fx<fw?O.alpha[i]:0;
        if(al>0){const a=Math.min(1,al),m=a/al;R=R*(1-a)+O.rgb[i*3]*m;G=G*(1-a)+O.rgb[i*3+1]*m;Bl=Bl*(1-a)+O.rgb[i*3+2]*m;}}
      data[o]=clamp(Math.round(R),0,255);data[o+1]=clamp(Math.round(G),0,255);data[o+2]=clamp(Math.round(Bl),0,255);data[o+3]=255;}}
  const out={data,w,h};cache.set(key,out);return out;
}
// A sleeve's texture, `around` pixels round the arm and `len` down it; `outer` is where (0 to 1 round) the outside of
// the arm falls. Stripes run round the arm, and down it above the dropped shoulder seam.
export function stripeSleeve(key,around,len,P,S,outer){
  if(cache.has(key))return cache.get(key);
  const data=new Uint8Array(around*len*4),C={cream:hex(P.ground),black:hex(P.stripe)},p=P.period*PX,widths=stripeWidths(P.seed+3);
  // A whole number of stripes, and of slub cells, fits round the arm, so the print meets itself.
  const n=Math.max(1,Math.round(around/p)),pu=around/n,round=k=>widths(((k%n)+n)%n),cells=Math.max(1,Math.round(around/30)),slub=valueNoise(P.seed+4,cells,200),drop=S.drop*TALL*PX;
  for(let r=0;r<len;r++)for(let c=0;c<around;c++){const u=c/around,o=Math.max(0,(Math.cos((u-outer)*Math.PI*2)-.1)/.9),seam=drop*o**.7;// none on the inside of the arm
    let dark;if(r<seam-1.5)dark=stripe(c+pu*.3,pu,P.share,round);else if(r<seam+1.5)dark=.25;else dark=stripe(r,p,P.share,widths);
    const col=jersey(C,dark,slub(u*cells,r/4)),i=((len-1-r)*around+c)*4;for(let k=0;k<3;k++)data[i+k]=clamp(Math.round(col[k]),0,255);data[i+3]=255;}
  const out={data,w:around,h:len};cache.set(key,out);return out;
}
