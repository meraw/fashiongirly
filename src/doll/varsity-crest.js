// Varsity crest: knitted-in college lettering arched over an oval crest, drawn here in code from the reference reading
// (not copied from the product photos). Off-white ink on a transparent ground, laid over a knit's own colour.
// Everything is laid out in logo widths (x across, y down from the top), drawn at three times the final size as an ink
// mask and averaged down for soft edges.
import { random } from './model.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
// A simple stroke font on a 4 by 6 grid (y up), capitals and the few figures the crest uses: each glyph is a list of
// polylines and an advance.
const FONT={
  A:[[[0,0],[2,6],[4,0]],[[.9,2.4],[3.1,2.4]]],
  C:[[[4,5],[3,6],[1,6],[0,5],[0,1],[1,0],[3,0],[4,1]]],
  E:[[[4,6],[0,6],[0,0],[4,0]],[[0,3],[3,3]]],
  H:[[[0,0],[0,6]],[[4,0],[4,6]],[[0,3],[4,3]]],
  I:[[[1,0],[1,6]]],
  J:[[[4,6],[4,1],[3,0],[1,0],[0,1]]],
  K:[[[0,0],[0,6]],[[4,6],[0,2.4]],[[1.4,3.5],[4,0]]],
  M:[[[0,0],[0,6],[2,2.4],[4,6],[4,0]]],
  N:[[[0,0],[0,6],[4,0],[4,6]]],
  O:[[[1,0],[0,1],[0,5],[1,6],[3,6],[4,5],[4,1],[3,0],[1,0]]],
  P:[[[0,0],[0,6],[3,6],[4,5],[4,4],[3,3],[0,3]]],
  R:[[[0,0],[0,6],[3,6],[4,5],[4,4],[3,3],[0,3]],[[2,3],[4,0]]],
  S:[[[4,5],[3,6],[1,6],[0,5],[0,4],[1,3],[3,3],[4,2],[4,1],[3,0],[1,0],[0,1]]],
  T:[[[0,6],[4,6]],[[2,6],[2,0]]],
  V:[[[0,6],[2,0],[4,6]]],
  W:[[[0,6],[1,0],[2,4],[3,0],[4,6]]],
  Y:[[[0,6],[2,3],[4,6]],[[2,3],[2,0]]],
  1:[[[1,5],[2,6],[2,0]],[[1,0],[3,0]]],
  5:[[[4,6],[0,6],[0,3.5],[3,3.5],[4,2.5],[4,1],[3,0],[0,0]]],
  8:[[[1,3],[0,4],[0,5],[1,6],[3,6],[4,5],[4,4],[3,3],[1,3],[0,2],[0,1],[1,0],[3,0],[4,1],[4,2],[3,3]]],
  9:[[[4,3],[1,3],[0,4],[0,5],[1,6],[3,6],[4,5],[4,1],[3,0],[1,0]]],
  '·':[[[1,2.8],[1,3.2]]],
};
const advance=ch=>ch===' '?2.4:ch==='I'||ch==='·'?2.4:5.2;

// An ink mask at `scale` pixels to a logo width, with a margin round the logo.
function canvas(L,ppu,S){
  const W=Math.ceil((1+2*L.margin)*ppu),H=Math.ceil((L.height+2*L.margin)*ppu),w=W*S,h=H*S,mask=new Float32Array(w*h),scale=ppu*S,m=L.margin;
  const toPx=(x,y)=>[(x+m)*scale,(y+m)*scale];
  // A round-ended stroke from a to b, r wide either side (logo units), setting the mask to `value`.
  const segment=(a,b,r,value=1)=>{const [ax,ay]=toPx(...a),[bx,by]=toPx(...b),R=r*scale,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1e-9;
    for(let y=Math.max(0,Math.floor(Math.min(ay,by)-R));y<=Math.min(h-1,Math.ceil(Math.max(ay,by)+R));y++)
      for(let x=Math.max(0,Math.floor(Math.min(ax,bx)-R));x<=Math.min(w-1,Math.ceil(Math.max(ax,bx)+R));x++){
        const t=clamp(((x-ax)*dx+(y-ay)*dy)/l2),ex=ax+t*dx-x,ey=ay+t*dy-y;if(ex*ex+ey*ey<=R*R)mask[y*w+x]=value;}};
  const polyline=(pts,r,value=1)=>{for(let k=1;k<pts.length;k++)segment(pts[k-1],pts[k],r,value);};
  // Fills a region given as a test on logo coordinates, within a box.
  const region=(x0,y0,x1,y1,inside,value=1)=>{const [px0,py0]=toPx(x0,y0),[px1,py1]=toPx(x1,y1);
    for(let y=Math.max(0,Math.floor(py0));y<=Math.min(h-1,Math.ceil(py1));y++)for(let x=Math.max(0,Math.floor(px0));x<=Math.min(w-1,Math.ceil(px1));x++)
      if(inside(x/scale-m,y/scale-m))mask[y*w+x]=value;};
  return {W,H,w,h,mask,scale,m,segment,polyline,region};
}
const inPolygon=(pts,x,y)=>{let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;};
// Text along a path: `place(s)` gives the point, the direction along the line and the glyph's up for s from 0 to 1 along
// it; glyphs are `size` tall (logo units), stroked `r` wide.
function textAlong(C,text,place,size,r){
  const total=[...text].reduce((a,ch)=>a+advance(ch),0)-1.2,unit=size/6;let at=0;
  for(const ch of text){const g=FONT[ch];if(g){const mid=(at+2)/total,[p,along,up]=place(Math.min(1,mid));
      for(const line of g)C.polyline(line.map(([gx,gy])=>{const u=(gx-2)*unit,v=(gy-3)*unit;return [p[0]+along[0]*u+up[0]*v,p[1]+along[1]*u+up[1]*v];}),r);}
    at+=advance(ch);}
}

const cache=new Map();
export function drawVarsityCrest(L,ppu){
  const key=JSON.stringify(L)+ppu;if(cache.has(key))return cache.get(key);
  const S=3,C=canvas(L,ppu,S),A=L.arch,K=L.crest,rand=random(L.seed);
  // The arched lettering: a straight top and a bottom that rises toward the middle, so the letters are tallest at the
  // ends and wrap over the crest; heavy strokes with slab serifs.
  const word=A.text,slots=[...word].reduce((a,ch)=>a+advance(ch),0)-1.2,cw=(A.right-A.left)/slots;
  const top=x=>A.top+A.topArch*(1-((x-.5)/.5)**2),bottom=x=>A.bottom-A.lift*(1-((x-.5)/.5)**2);
  const warp=(x0,gx,gy)=>{const x=x0+gx*cw;return [x,top(x)+(6-gy)/6*(bottom(x)-top(x))];};
  let at=0;
  for(const ch of word){const g=FONT[ch];
    if(g)for(const line of g){C.polyline(line.map(([gx,gy])=>warp(A.left+at*cw,gx,gy)),A.stroke);
      // Slab serifs at the ends of upright strokes, at the top and bottom of the letter.
      for(let k=1;k<line.length;k++){const [a,b]=[line[k-1],line[k]];if(Math.abs(a[0]-b[0])>.6)continue;
        for(const e of [a,b])if(e[1]===0||e[1]===6)C.segment(warp(A.left+at*cw,e[0]-1.1,e[1]),warp(A.left+at*cw,e[0]+1.1,e[1]),A.stroke*.55);}}
    at+=advance(ch);}
  // Worn ink: thin broken red streaks run down through the letters, as on a knitted-in print.
  const streak=random(L.seed+1),cols=Array.from({length:Math.ceil(C.w/S/ppu*A.streaks)+2},()=>[streak(),streak(),streak()]);
  C.region(A.left-.02,A.top-.01,A.right+.02,A.bottom+.02,(x,y)=>{const c=cols[Math.floor((x+C.m)*A.streaks)];return c[0]<A.streakShare&&((y*A.streakRuns+c[1]*7)%1)<.8;},0);
  // The crest: an oval ring of two lines with lettering between them round the top and sides.
  const [cx,cy]=K.centre,[rx,ry]=K.radii,band=K.band,mid=[rx-band/2,ry-band/2];
  const oval=(a,b,n=96)=>Array.from({length:n+1},(_,k)=>{const t=k/n*Math.PI*2;return [cx+a*Math.sin(t),cy-b*Math.cos(t)];});
  C.polyline(oval(rx,ry),K.line);C.polyline(oval(rx-band,ry-band),K.line*.8);
  // Angles measured clockwise from the top; text reads clockwise with its tops outward.
  const onRing=t=>{const p=[cx+mid[0]*Math.sin(t),cy-mid[1]*Math.cos(t)],along=[mid[0]*Math.cos(t),mid[1]*Math.sin(t)],l=Math.hypot(...along),dir=[along[0]/l,along[1]/l];return [p,dir,[dir[1],-dir[0]]];};
  for(const [text,a0,a1] of K.ringText)textAlong(C,text,s=>onRing((a0+(a1-a0)*s)*Math.PI/180),K.textSize,K.textStroke);
  // A shield, solid, with a big red T in it outlined in white, and a crown over it.
  const [sx,sy]=K.shield.centre,[sw,sh]=K.shield.size,shield=[];
  for(let k=0;k<=24;k++){const t=k/24;shield.push([sx+sw/2,sy-sh/2+t*sh*.55]);}
  for(let k=0;k<=24;k++){const t=k/24,a=t*Math.PI/2;shield.push([sx+sw/2*Math.cos(a),sy+sh*.05+sh*.45*Math.sin(a)]);}
  const half=shield.slice();for(let k=half.length-1;k>=0;k--)shield.push([2*sx-half[k][0],half[k][1]]);
  const xs=shield.map(p=>p[0]),ys=shield.map(p=>p[1]);
  C.region(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),(x,y)=>inPolygon(shield,x,y));
  const T=K.shield.t,tw=sw*T[0],th=sh*T[1],tt=sh*T[2],tTop=sy-sh*.3;
  const tShape=(x,y,g=0)=>(y>tTop-g&&y<tTop+tt+g&&Math.abs(x-sx)<tw/2+g)||(y>tTop-g&&y<tTop+th+g&&Math.abs(x-sx)<tt*.6+g);
  C.region(sx-tw,tTop-.01,sx+tw,tTop+th+.01,(x,y)=>tShape(x,y,K.line*.9),0);C.region(sx-tw,tTop-.01,sx+tw,tTop+th+.01,(x,y)=>tShape(x,y,K.line*.2)&&!tShape(x,y,-K.line*.6));
  const cr=K.crown,base=sy-sh/2-cr[1]*.15;
  C.region(sx-cr[0]/2,base-cr[1]*.35,sx+cr[0]/2,base,()=>true);
  for(const dx of [-1,0,1]){const tip=[sx+dx*cr[0]*.42,base-cr[1]*(dx?.85:1)];C.segment([sx+dx*cr[0]*.3,base-cr[1]*.3],tip,K.line*.9);C.segment(tip,tip,K.line*1.4);}
  // Two small curved banners under the shield, and the year below them in a little box.
  for(const [text,x0,x1] of K.scrolls)textAlong(C,text,s=>{const x=x0+(x1-x0)*s,y=K.scrollY+K.scrollDip*(1-((x-sx)/(K.radii[0]*.7))**2);
    const slope=-2*K.scrollDip*(x-sx)/(K.radii[0]*.7)**2,l=Math.hypot(1,slope),dir=[1/l,slope/l];return [[x,y],dir,[dir[1],-dir[0]]];},K.smallSize,K.textStroke*.85);
  const [yx,yy]=K.year.at;textAlong(C,K.year.text,s=>[[yx-K.year.width/2+K.year.width*s,yy],[1,0],[0,-1]],K.smallSize,K.textStroke*.85);
  C.polyline([[yx-K.year.width*.65,yy-K.smallSize*.9],[yx+K.year.width*.65,yy-K.smallSize*.9],[yx+K.year.width*.65,yy+K.smallSize*.9],[yx-K.year.width*.65,yy+K.smallSize*.9],[yx-K.year.width*.65,yy-K.smallSize*.9]],K.line*.6);
  // The ribbon across the bottom of the ring: it clears the ring behind it, has an edge top and bottom and the
  // lettering between, and forked tails folding back at each end.
  const R=K.ribbon,rmid=x=>R.y+R.sag*(1-((x-.5)/R.half)**2),rhalf=R.height/2;
  C.region(.5-R.half,R.y-R.height,.5+R.half,R.y+R.sag+R.height,(x,y)=>Math.abs(y-rmid(x))<rhalf+K.line,0);
  const edge=d=>Array.from({length:41},(_,k)=>{const x=.5-R.half+2*R.half*k/40;return [x,rmid(x)+d];});
  C.polyline(edge(-rhalf),K.line*.8);C.polyline(edge(rhalf),K.line*.8);
  textAlong(C,R.text,s=>{const x=.5-R.half*.9+1.8*R.half*s,slope=-2*R.sag*(x-.5)/R.half**2,l=Math.hypot(1,slope),dir=[1/l,slope/l];return [[x,rmid(x)],dir,[dir[1],-dir[0]]];},R.textSize,K.textStroke);
  for(const side of [-1,1]){const x0=.5+side*R.half,y0=rmid(x0),x1=x0+side*R.tail,y1=y0+R.tailDrop;
    C.polyline([[x0,y0-rhalf],[x1,y1-rhalf],[x1-side*R.tail*.35,y1],[x1,y1+rhalf],[x0,y0+rhalf]],K.line*.8);
    C.polyline([[x0,y0-rhalf],[x0-side*R.tail*.25,y0+rhalf+R.tailDrop*.3]],K.line*.6);}
  // Average down to the final size; a few red flecks of the knit show through the ink.
  const out=new Uint8Array(C.W*C.H*4),ink=hex(L.ink);
  for(let y=0;y<C.H;y++)for(let x=0;x<C.W;x++){let a=0;for(let dy=0;dy<S;dy++)for(let dx=0;dx<S;dx++)a+=C.mask[(y*S+dy)*C.w+x*S+dx];
    a/=S*S;if(a>0&&rand()<L.inkFlecks)a*=.35;const o=(y*C.W+x)*4;for(let k=0;k<3;k++)out[o+k]=ink[k];out[o+3]=Math.round(a*255);}
  const result={data:out,w:C.W,h:C.H};cache.set(key,result);return result;
}
