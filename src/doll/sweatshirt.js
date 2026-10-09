// Logo sweatshirt: a relaxed crew-neck sweatshirt in brushed cotton fleece, with dropped shoulders, full sleeves gathered
// into rib cuffs, a deep rib hem band the body blouses over, a chest logo and a small woven tab in the side seam.
// The logo is drawn here in code from the reference reading (not copied from the product photos): a batwing shape filled
// with flowers on a sky-blue ground, with lettering in a heavy sans built from simple shapes.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// The body takes a front panel and a back panel side by side in one texture, each projected flat from the front and
// back, as the printed long tee does, so the logo stays upright and flat on her chest.
import * as T from 'three';
import { random, weave, shell, ribbed, roundSleeveCap, easeOverHand } from './model.js';

const PX=1300;// texture pixels per world unit
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
// Smooth value noise that repeats every `period` cells across and `rows` down.
function valueNoise(seed,period,rows){const r=random(seed),g=new Float32Array(period*rows);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{let xi=Math.floor(x),yi=Math.floor(y);const fx=x-xi,fy=y-yi;xi%=period;if(xi<0)xi+=period;yi%=rows;if(yi<0)yi+=rows;
    const x1=xi+1===period?0:xi+1,r0=yi*period,r1=(yi+1===rows?0:yi+1)*period,a=g[r0+xi],b=g[r0+x1],c=g[r1+xi],d=g[r1+x1],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}

// Washed fleece: the ground colour, faintly mottled where the dye has faded, with a fine grain. Wraps across.
function fleecePixels(w,h,colour,seed){
  const data=new Uint8Array(w*h*4),bg=hex(colour),cells=Math.max(1,Math.round(w/140)),fade=valueNoise(seed,cells,Math.ceil(h/140)+1),grain=valueNoise(seed+1,Math.max(1,Math.round(w/4)),Math.ceil(h/4)+1);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,k=1+.16*(fade(x*cells/w,y/140)-.5)+.1*(grain(x*Math.round(w/4)/w,y/4)-.5);
    for(let c=0;c<3;c++)data[i+c]=clamp(bg[c]*k,0,255);data[i+3]=255;}
  return data;
}

// ---- The logo, in units of its width (x across, y down from its top edge) -------------------------------------------
// The batwing: a straight top edge and sides; along the bottom two arches rise into it between three points, at its
// corners and in the middle.
const batwing=(L,x,y)=>{if(x<0||x>1||y<0)return false;const half=x<.5?x/.5:(x-.5)/.5;return y<L.height-L.arch*Math.sin(Math.PI*half)**.6;};
// Non-zero winding, so a stroke whose inner edge folds over itself on a tight curve stays filled.
const inPolygon=(pts,x,y)=>{let wind=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)wind+=yi>yj?1:-1;}return wind!==0;};
// A stroke along a path, as a polygon: thick (`wv`) where it runs up and down, thinner (`wh`) where it runs across, as a
// broad-nibbed letter is.
function stroke(path,wv,wh){
  const left=[],right=[];
  for(let i=0;i<path.length;i++){const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;
    const nx=-ty,ny=tx,t=Math.hypot(wv*nx,wh*ny)/2;left.push([path[i][0]+nx*t,path[i][1]+ny*t]);right.push([path[i][0]-nx*t,path[i][1]-ny*t]);}
  return left.concat(right.reverse());
}
// Points round an ellipse, from angle a0 to a1 (degrees, anticlockwise with y up).
const arc=(cx,cy,rx,ry,a0,a1,n=28)=>Array.from({length:n+1},(_,k)=>{const a=(a0+(a1-a0)*k/n)*Math.PI/180;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)];});
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
// The lettering, as polygons in ems (the capital's height), baseline at 0, y up. A heavy sans with a long-footed L, a
// round e open at the lower right, a v, an i with a square dot, an apostrophe and an s.
function lettering(){
  // Upright strokes are heavy (wv); the L's foot is a little lighter (wf) and the e's and s's curves thinner across (wh),
  // which keeps their counters open.
  const wv=.4,wf=.27,wh=.19,xh=.76,g=[];
  g.push(rect(0,0,wv,1),rect(0,0,.98,wf));// L
  const ec=[1.66,xh/2],erx=.55-wv/2,ery=xh/2-wh/2;// e: a ring from the crossbar's end round to its open lower right, and the crossbar
  g.push(stroke(arc(ec[0],ec[1],erx,ery,0,318),wv,wh),rect(ec[0]-erx,ec[1]-.035,ec[0]+.55,ec[1]+.045));
  g.push([[2.32,xh],[2.71,xh],[2.86,.25],[3.01,xh],[3.4,xh],[3.06,0],[2.66,0]]);// v
  g.push(rect(3.52,0,3.52+wv,xh),rect(3.52,.86,3.52+wv,1.1));// i
  g.push([[4.0,1.1],[4.27,1.1],[4.07,.7],[3.92,.7]]);// apostrophe
  // s: two loops meeting at the spine, in lighter strokes and overshooting the x-height a little, as round letters do.
  const sv=.34,sh=.16,sc=4.92,srx=.55-sv/2,top=xh+.02-sh/2,low=sh/2-.02,mid=xh/2,ru=(top-mid)/2,rl=(mid-low)/2;
  g.push(stroke([...arc(sc,mid+ru,srx,ru,18,270,24),...arc(sc,mid-rl,srx,rl,90,-162,24).slice(1)],sv,sh));
  return {glyphs:g,width:5.47};
}
// The registered mark: a thin ring with a small R in it.
function registered(cx,cy,r,w){
  const R=r*.48,x0=cx-R*.62,polys=[stroke(arc(cx,cy,r,r,0,360,48),w,w)];
  polys.push(stroke([[x0,cy+R],[x0,cy-R]],w,w),stroke([[x0,cy-R],...arc(x0+R*.45,cy-R*.45,R*.6,R*.55,-90,90,12),[x0,cy+.1*R]],w,w),stroke([[x0+R*.42,cy+.1*R],[x0+R*1.1,cy+R]],w,w));
  return polys;
}

// Flowers, painted into a float RGBA canvas over the logo with soft edges from supersampling (the canvas is drawn at a
// multiple of its final size and averaged down).
function painter(w,h,scale,L){
  const rgb=new Float32Array(w*h*3),alpha=new Float32Array(w*h);
  const put=(px,py,col,a,clip)=>{if(px<0||py<0||px>=w||py>=h||a<=0)return;const x=px/scale-L.margin,y=py/scale-L.margin;
    if(clip&&!batwing(L,x,y))return;const i=py*w+px,b=1-a;for(let c=0;c<3;c++)rgb[i*3+c]=rgb[i*3+c]*b+col[c]*a;alpha[i]=alpha[i]*b+a;};
  const toPx=v=>(v+L.margin)*scale;
  // Fill every pixel inside a shape given in logo units: `inside(x, y)` returns a colour or null.
  const fill=(x0,y0,x1,y1,inside,a,clip)=>{for(let py=Math.max(0,Math.floor(toPx(y0)));py<=Math.min(h-1,Math.ceil(toPx(y1)));py++)
    for(let px=Math.max(0,Math.floor(toPx(x0)));px<=Math.min(w-1,Math.ceil(toPx(x1)));px++){const col=inside(px/scale-L.margin,py/scale-L.margin);if(col)put(px,py,col,a,clip);}};
  return {rgb,alpha,put,fill};
}
const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
// A lily: six pointed petals (the three behind a little darker) in white shading to lilac at the edges, blushed pink
// toward the throat, with long stamens. Sizes in logo units.
function lily(P,I,cx,cy,size,rot,a,clip,rand){
  const petals=Array.from({length:6},(_,k)=>({ang:rot+k*Math.PI/3+(rand()-.5)*.35,len:size*(.82+.25*rand()),back:k%2}));
  petals.sort((p,q)=>q.back-p.back);
  for(const p of petals){const ca=Math.cos(p.ang),sa=Math.sin(p.ang),L=p.len,W=.27*L;
    P.fill(cx-L,cy-L,cx+L,cy+L,(x,y)=>{const dx=x-cx,dy=y-cy,t=(dx*ca+dy*sa)/L,s=(-dx*sa+dy*ca);if(t<=0||t>=1)return null;
      const hw=W*Math.sin(Math.PI*t**.75)**.9;if(Math.abs(s)>hw)return null;const e=Math.abs(s)/hw;
      let col=mix(I.lily,I.shade,.55*e**1.6+.2*t*t);col=mix(col,I.blush,clamp(.75-1.6*t)*(1-.6*e));if(Math.abs(s)<.08*hw+.002&&t<.8)col=mix(col,I.blush,.35);
      return p.back?col.map(v=>v*.86):col;},a,clip);}
  // A few stamens, curving out of the throat a little past the petals, from one side of the flower.
  const fan=rand()*Math.PI*2;
  for(let k=0;k<4;k++){const t0=fan+(k-1.5)*.32,len=size*(.8+.3*rand()),bend=(rand()-.5)*.5;
    for(let s=0;s<=30;s++){const f=s/30,ang=t0+bend*f,x=cx+Math.cos(ang)*len*f,y=cy+Math.sin(ang)*len*f;
      P.fill(x-.003,y-.003,x+.003,y+.003,(px,py)=>Math.hypot(px-x,py-y)<.0022?I.stamen:null,a,clip);}
    const ang=t0+bend,x=cx+Math.cos(ang)*len,y=cy+Math.sin(ang)*len;
    P.fill(x-.012,y-.012,x+.012,y+.012,(px,py)=>{const dx=px-x,dy=py-y,u=dx*Math.cos(ang)+dy*Math.sin(ang),v=-dx*Math.sin(ang)+dy*Math.cos(ang);return (v/.009)**2+(u/.004)**2<1?I.anther:null;},a,clip);}
  P.fill(cx-.02,cy-.02,cx+.02,cy+.02,(x,y)=>Math.hypot(x-cx,y-cy)<.012?I.throat:null,a,clip);
}
// A bud: a long, closed oval, white with a pink tip.
function bud(P,I,cx,cy,size,rot,a,clip){const ca=Math.cos(rot),sa=Math.sin(rot);
  P.fill(cx-size,cy-size,cx+size,cy+size,(x,y)=>{const dx=x-cx,dy=y-cy,u=(dx*ca+dy*sa)/size,v=(-dx*sa+dy*ca)/(size*.32);if(u*u+v*v*(1+.6*u)>1)return null;
    return mix(mix(I.lily,I.shade,.5*Math.abs(v)**2),I.bud,clamp((u-.05)*1.4));},a,clip);}
// A leaf: a long pointed blade with a darker midrib.
function leaf(P,I,cx,cy,size,rot,a,clip){const ca=Math.cos(rot),sa=Math.sin(rot);
  P.fill(cx-size,cy-size,cx+size,cy+size,(x,y)=>{const dx=x-cx,dy=y-cy,t=(dx*ca+dy*sa)/size,s=(-dx*sa+dy*ca)/size;if(t<=0||t>=1)return null;const hw=.17*Math.sin(Math.PI*t)**.8;
    if(Math.abs(s)>hw)return null;return Math.abs(s)<.012?I.vein:mix(I.leaf,I.leafLight,.5*(1-Math.abs(s)/hw)*(.5+.5*t));},a,clip);}

// The logo's pixels at their final size (`w` by `h`, `ppu` pixels to a logo width), with transparency outside it.
const logoCache=new Map();
function drawLogo(L,ppu){
  const key=JSON.stringify(L)+ppu;if(logoCache.has(key))return logoCache.get(key);
  const S=3,scale=ppu*S,W=Math.ceil((1+2*L.margin)*ppu),H=Math.ceil((L.height+2*L.margin)*ppu),w=W*S,h=H*S,I=Object.fromEntries(Object.entries(L.inks).map(([k,v])=>[k,hex(v)]));
  const P=painter(w,h,scale,L),rand=random(L.seed);
  // The sky-blue ground, a little lighter in soft patches, then pale flowers and leaves behind, all inside the batwing.
  const cloud=valueNoise(L.seed,6,4);
  P.fill(0,0,1,L.height,(x,y)=>mix(I.sky,I.skyLight,clamp((cloud(x*6,y*8)-.4)*1.6)),1,true);
  for(let k=0;k<L.leaves;k++)leaf(P,I,rand(),rand()*L.height,.08+.08*rand(),rand()*Math.PI*2,.85,true);
  for(let k=0;k<L.buds;k++)bud(P,I,rand(),rand()*L.height,.035+.025*rand(),rand()*Math.PI*2,.9,true);
  for(let k=0;k<L.faint;k++)lily(P,I,rand(),rand()*L.height,.06+.04*rand(),rand()*Math.PI,.45,true,rand);
  // The big lilies, placed as on the photos; those flagged `out` spill over the logo's edge.
  for(const [x,y,size,rot,out] of L.lilies)lily(P,I,x,y,size,rot,1,!out,rand);
  for(const [x,y,size,rot,out] of L.budsAt)bud(P,I,x,y,size,rot,1,!out);
  // The lettering over the flowers, and the registered mark.
  const {glyphs,width}=lettering(),em=L.text.width/width,polys=glyphs.map(g=>g.map(([gx,gy])=>[L.text.x+gx*em,L.text.baseline-gy*em]));
  polys.push(...registered(L.mark[0],L.mark[1],L.mark[2],L.mark[3]));
  for(const poly of polys){const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);
    P.fill(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),(x,y)=>inPolygon(poly,x,y)?I.ink:null,1,false);}
  // Average down to the final size.
  const data=new Uint8Array(W*H*4);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=[0,0,0];let a=0;
    for(let dy=0;dy<S;dy++)for(let dx=0;dx<S;dx++){const i=(y*S+dy)*w+x*S+dx;a+=P.alpha[i];for(let k=0;k<3;k++)c[k]+=P.rgb[i*3+k];}
    const o=(y*W+x)*4;for(let k=0;k<3;k++)data[o+k]=a?clamp(c[k]/a,0,255):0;data[o+3]=clamp(a/(S*S)*255,0,255);}
  const out={data,w:W,h:H};logoCache.set(key,out);return out;
}

// The body's texture: fleece with the logo printed on the front panel.
const bodyCache=new Map();
function bodyPixels(key,panelW,h,spec){
  if(bodyCache.has(key))return bodyCache.get(key);
  const B=spec.body,L=spec.logo,w=panelW*2,data=fleecePixels(w,h,spec.colours.fleece,B.seed??5);
  const logo=drawLogo(L,Math.round(L.width*PX)),x0=Math.round(panelW/2-(.5+L.margin)*L.width*PX),y0=Math.round((B.neck-L.top)*.76*PX-L.margin*L.width*PX);
  for(let y=0;y<logo.h;y++)for(let x=0;x<logo.w;x++){const s=(y*logo.w+x)*4,a=logo.data[s+3]/255;if(!a)continue;const tx=x0+x,ty=y0+y;if(tx<0||ty<0||tx>=panelW||ty>=h)continue;
    const d=(ty*w+tx)*4;for(let c=0;c<3;c++)data[d+c]=data[d+c]*(1-a)+logo.data[s+c]*a;}
  const out={data,w,h};bodyCache.set(key,out);return out;
}
function texture(data,w,h,wrap){const t=new T.DataTexture(data,w,h,T.RGBAFormat);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=wrap?T.RepeatWrapping:T.ClampToEdgeWrapping;
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;}
const tiles=new Map();
function fleece(spec,map){
  // Brushed cotton fleece: matte, with a soft sheen and the fine knit of its face in the bump.
  const knit=weave('knit');knit.repeat.set(80,46);
  return new T.MeshPhysicalMaterial({map,roughness:.9,sheen:.35,sheenColor:new T.Color(spec.colours.sheen),sheenRoughness:.7,bumpMap:knit,bumpScale:.002,side:T.DoubleSide});
}
function plainFleece(spec,u,v){
  const c=spec.colours.fleece;if(!tiles.has(c))tiles.set(c,fleecePixels(256,256,c,9));
  const map=texture(tiles.get(c),256,256,true);map.repeat.set(u,v);return fleece(spec,map);
}
function rib(spec,u,v){
  const m=plainFleece(spec,u,v),bump=weave('knit');bump.repeat.set(u*6,1);m.bumpMap=bump;m.bumpScale=.006;m.roughness=.93;return m;
}

export function makeSweatshirt(id,spec,overSkirt=false){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,C=spec.colours,hem=B.hem,band=B.band,flare=overSkirt?B.bandOverSkirt:B.bandRadius,rows=[...B.rows,[hem+band+.012,...(overSkirt?B.bandOverSkirt:B.blouse)],[hem+band,...flare]];
  // Body: front and back panels side by side, each the width of the widest row (scaled across by the outfit).
  const half=Math.max(...rows.map(r=>r[1])),panelW=Math.ceil(half*2*1.06*PX),bodyH=Math.ceil((B.neck-hem-band)*.76*PX)+8;
  const px=bodyPixels(id+':body',panelW,bodyH,spec),body=shell(top,rows,fleece(spec,texture(px.data,px.w,px.h,false)),'sweatshirt-body',128);
  const p=body.geometry.attributes.position,uv=body.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++){const x=p.getX(i),z=p.getZ(i),u=.5+(z>=0?x:-x)/(half*2);
    uv.setXY(i,(z>=0?0:.5)+.5*clamp(u,.002,.998),clamp((B.neck-p.getY(i))*.76*PX/bodyH));}
  uv.needsUpdate=true;
  // The deep rib band, which the body blouses over; it hugs the jeans or sits out over the skirt.
  ribbed(shell(top,[[hem+band+.01,...flare],[hem+band/2,flare[0]-.002,flare[1]-.001],[hem,flare[0]-.004,flare[1]-.002]],rib(spec,12,1),'ribbed-hem-band',512),B.ribs,.01);
  ribbed(shell(top,B.neckband,rib(spec,10,1),'ribbed-crew-neck',384),B.neckRibs,.016);
  // The woven tab sewn into the left side seam just above the band, folded flat against the side and pointing forward.
  const tab=spec.tab,ty=hem+band+tab.above;let sx=0;
  for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-ty)<.02&&Math.abs(p.getZ(i))<.03)sx=Math.max(sx,p.getX(i));
  const tabMesh=new T.Mesh(new T.BoxGeometry(.004,tab.height,tab.out),new T.MeshStandardMaterial({color:C.tab,roughness:.75}));
  tabMesh.name='side-seam-tab';tabMesh.position.set(sx+.002,ty,tab.out/2);tabMesh.castShadow=true;top.add(tabMesh);
  // Full sleeves from dropped shoulders, blousing over rib cuffs that gather at her wrist.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const yt=S.rows[0][0],sleeve=shell(arm,S.rows,plainFleece(spec,3,4),'knit-jumper-sleeve',64);
    roundSleeveCap(sleeve,side,yt);
    easeOverHand(ribbed(shell(arm,S.cuff,rib(spec,6,1),'ribbed-cuff',256),S.cuffRibs,.03),side);
    top.add(arm);
  }
  return top;
}
