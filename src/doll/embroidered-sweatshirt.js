// Embroidered sweatshirt (template 'embroidered-sweatshirt'): a boxy, cropped crew-neck sweatshirt in cream cotton fleece,
// with a stitched V insert under the neckband, very full sleeves from dropped shoulders into long rib cuffs, a deep rib
// hem band that dips lower at the back, a spray of embroidered roses across the chest and a small embroidered script
// on her left sleeve above the cuff.
// The embroidery is drawn here in code from the reference reading (not copied from the product photos): satin-stitched
// roses in layered petals, serrated two-tone leaves with their veins, buds in green sepals and stems.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// The body takes a front panel and a back panel side by side in one texture, each projected flat from the front and
// back, as the logo sweatshirt does, so the embroidery stays upright and flat on her chest.
import * as T from 'three';
import { random, weave, shell, ringShell, curve, ribbed, roundSleeveCap, easeOverHand } from './model.js';

const PX=1300;// texture pixels per world unit
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
// Smooth value noise that repeats every `period` cells across and `rows` down.
function valueNoise(seed,period,rows){const r=random(seed),g=new Float32Array(period*rows);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{let xi=Math.floor(x),yi=Math.floor(y);const fx=x-xi,fy=y-yi;xi%=period;if(xi<0)xi+=period;yi%=rows;if(yi<0)yi+=rows;
    const x1=xi+1===period?0:xi+1,r0=yi*period,r1=(yi+1===rows?0:yi+1)*period,a=g[r0+xi],b=g[r0+x1],c=g[r1+xi],d=g[r1+x1],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}

// Cream fleece: the ground colour, very faintly mottled, with a fine grain. Wraps across.
function fleecePixels(w,h,colour,seed){
  const data=new Uint8Array(w*h*4),bg=hex(colour),cells=Math.max(1,Math.round(w/140)),fade=valueNoise(seed,cells,Math.ceil(h/140)+1),grain=valueNoise(seed+1,Math.max(1,Math.round(w/4)),Math.ceil(h/4)+1);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,k=1+.035*(fade(x*cells/w,y/140)-.5)+.05*(grain(x*Math.round(w/4)/w,y/4)-.5);
    for(let c=0;c<3;c++)data[i+c]=clamp(bg[c]*k,0,255);data[i+3]=255;}
  return data;
}

// ---- The embroidery, in units of its width (x across, y down from its top edge) -------------------------------------
// A float RGBA canvas drawn at a multiple of its final size and averaged down, for soft edges.
function painter(w,h,scale,margin){
  const rgb=new Float32Array(w*h*3),alpha=new Float32Array(w*h),toPx=v=>(v+margin)*scale;
  // Fill every pixel inside a shape: `inside(x, y)` returns a colour or null.
  const fill=(x0,y0,x1,y1,inside)=>{for(let py=Math.max(0,Math.floor(toPx(y0)));py<=Math.min(h-1,Math.ceil(toPx(y1)));py++)
    for(let px=Math.max(0,Math.floor(toPx(x0)));px<=Math.min(w-1,Math.ceil(toPx(x1)));px++){const col=inside(px/scale-margin,py/scale-margin);if(!col)continue;
      const i=py*w+px;for(let c=0;c<3;c++)rgb[i*3+c]=col[c];alpha[i]=1;}};
  return {rgb,alpha,fill};
}
// Satin stitches: a fine ripple of light and shade across the threads, `phase` running across them.
const satin=(col,phase,depth=.09)=>col.map(v=>v*(1+depth*Math.sin(phase)));
// Embroidery stands a little proud of the fleece: its edge is a shade darker, as a raised edge in shadow.
const edged=(col,e)=>e>.88?col.map(v=>v*.82):col;

// A rose, seen from the front: five rings of cupped petals, each petal deep red where the petals inside it rise over it,
// brighter toward its curled-back rim, with a crease between neighbours; the heart a tight, shadowed cup. Satin stitches
// run out from the centre.
function rose(P,I,cx,cy,R,rot,tilt=.88){
  const rings=[1,.82,.64,.46,.3],count=[5,5,5,4,3],stitch=2*Math.PI*R/I.stitch,phase=k=>rot+k*1.13;
  const edge=(k,a)=>R*rings[k]*(.84+.16*Math.abs(Math.cos(count[k]*(a-phase(k))/2))**.55)*(1+.06*Math.sin(3*a+2*k+rot)+.03*Math.sin(7*a-k));
  P.fill(cx-R,cy-R,cx+R,cy+R,(x,y)=>{const dx=x-cx,dy=(y-cy)/tilt,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    let k=-1;for(let l=0;l<rings.length;l++)if(r<edge(l,a))k=l;if(k<0)return null;
    const last=rings.length-1,outer=edge(k,a),inner=k<last?edge(k+1,a):0,s=(r-inner)/(outer-inner),wave=count[k]*(a-phase(k))/2,notch=Math.abs(Math.cos(wave));
    // Each petal a little lighter or darker than its neighbours.
    const petal=Math.floor(((wave/Math.PI+.5)%count[k]+count[k])%count[k]),tone=1+.12*Math.sin(petal*2.4+k*1.7);
    let col;
    if(k===last){const sw=((a/(2*Math.PI)+r/(R*.32))%1+1)%1;col=mix(I.roseDark,I.rose,smooth(r/(R*.3)));if(sw>.86)col=mix(col,I.roseBright,.8);}
    else{col=mix(I.roseDark,I.rose,smooth(s*2.2));col=mix(col,I.roseBright,smooth((s-.5)*2.5));
      if(s>.86)col=mix(col,I.roseLight,smooth((s-.86)*8)*.85);// the curled-back rim
      if(notch<.2)col=mix(col,I.roseDark,.75*(1-notch/.2));}// the crease between two petals
    return edged(satin(col.map(v=>v*tone),a*stitch),r/R);});
}
// A leaf: a pointed oval blade with a serrated edge, its halves in two greens (as satin stitch catches the light from
// one side), with a pale midrib and side veins. Stitches run slantwise from the midrib toward the tip.
function leaf(P,I,cx,cy,L,ang,flip=1){
  const ca=Math.cos(ang),sa=Math.sin(ang);
  P.fill(cx-L,cy-L,cx+L,cy+L,(x,y)=>{const dx=x-cx,dy=y-cy,u=(dx*ca+dy*sa)/L,v=flip*(-dx*sa+dy*ca)/L;if(u<=0||u>=1)return null;
    const tooth=(u*7)%1,w=.3*Math.sin(Math.PI*u**.85)**.9*(1-.1*tooth);if(Math.abs(v)>w)return null;
    const e=Math.abs(v)/w;let col=v>0?mix(I.leaf,I.leafLight,.6*(1-e)):mix(I.leafDark,I.leaf,.5*(1-e));
    if(Math.abs(v)<.018)col=I.vein;
    else{const vein=((u-Math.abs(v)*1.2)*5%1+1)%1;if(vein<.08&&u<.88)col=mix(col,I.vein,.55);}
    return edged(satin(col,(u*.8-Math.abs(v))*L*2*Math.PI/I.stitch),e);});
}
// A bud: a closed red teardrop, held in green sepals that reach up its sides.
function bud(P,I,cx,cy,L,ang){
  const ca=Math.cos(ang),sa=Math.sin(ang);
  P.fill(cx-L,cy-L,cx+L,cy+L,(x,y)=>{const dx=x-cx,dy=y-cy,u=(dx*ca+dy*sa)/L,v=(-dx*sa+dy*ca)/L;if(u<=0||u>=1)return null;
    const w=.32*Math.sin(Math.PI*u**.7)**.8;if(Math.abs(v)>w)return null;const e=Math.abs(v)/w;
    const sepal=u<.32||(e>.5&&u<.75-.35*(1-e))||(Math.abs(v)<.04&&u<.55);
    const col=sepal?mix(I.leafDark,I.leaf,.6*(1-e)):mix(I.rose,I.roseDark,.7*e);
    return edged(satin(col,v*L*2*Math.PI/I.stitch),e);});
}
// A stem: a green cord along a path, lighter along its crest.
function stem(P,I,pts,w){
  const path=new T.CatmullRomCurve3(pts.map(([x,y])=>new T.Vector3(x,y,0))),n=Math.ceil(path.getLength()/(w*.3)),q=new T.Vector3();
  for(let k=0;k<=n;k++){path.getPoint(k/n,q);const x=q.x,y=q.y;
    P.fill(x-w,y-w,x+w,y+w,(px,py)=>{const d=Math.hypot(px-x,py-y)/w;return d<1?(d<.4?I.leaf:I.leafDark):null;});}
}

// The embroidery's pixels at their final size (`w` by `h`, `ppu` pixels to its width), transparent outside it.
const artCache=new Map();
function drawEmbroidery(E,ppu){
  const key=JSON.stringify(E)+ppu;if(artCache.has(key))return artCache.get(key);
  const S=3,scale=ppu*S,W=Math.ceil((1+2*E.margin)*ppu),H=Math.ceil((E.height+2*E.margin)*ppu),w=W*S,h=H*S;
  const I=Object.fromEntries(Object.entries(E.inks).map(([k,v])=>[k,hex(v)]));I.stitch=E.stitch;
  const P=painter(w,h,scale,E.margin);
  // Stems first, then leaves, buds and the roses over them.
  for(const s of E.stems)stem(P,I,s,E.stemWidth);
  for(const [x,y,L,ang,flip] of E.leaves)leaf(P,I,x,y,L,ang,flip);
  for(const [x,y,L,ang] of E.buds)bud(P,I,x,y,L,ang);
  for(const [x,y,R,rot] of E.roses)rose(P,I,x,y,R,rot);
  const data=new Uint8Array(W*H*4);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=[0,0,0];let a=0;
    for(let dy=0;dy<S;dy++)for(let dx=0;dx<S;dx++){const i=(y*S+dy)*w+x*S+dx;a+=P.alpha[i];for(let k=0;k<3;k++)c[k]+=P.rgb[i*3+k];}
    const o=(y*W+x)*4;for(let k=0;k<3;k++)data[o+k]=a?clamp(c[k]/a,0,255):0;data[o+3]=clamp(a/(S*S)*255,0,255);}
  const out={data,w:W,h:H};artCache.set(key,out);return out;
}

// The body's texture: fleece, the V insert under the neckband, and the embroidery on the front panel.
const bodyCache=new Map();
function bodyPixels(key,panelW,h,spec){
  if(bodyCache.has(key))return bodyCache.get(key);
  const B=spec.body,E=spec.embroidery,w=panelW*2,data=fleecePixels(w,h,spec.colours.fleece,B.seed??11),stitch=hex(spec.colours.stitch);
  // The V insert: a rib-knit triangle set in below the neckband, double-stitched along both sides.
  const V=B.vee,top=Math.round((B.neck-V.top)*.76*PX),depth=V.depth*.76*PX,half=V.width/2*PX,cx=panelW/2;
  for(let y=Math.max(0,top-4);y<top+depth+12&&y<h;y++)for(let x=Math.floor(cx-half-14);x<cx+half+14;x++){
    const t=(y-top)/depth,hw=half*(1-t),d=Math.abs(x-cx)-hw,i=(y*w+x)*4;
    if(t<1&&d<0){const k=.975+.03*Math.sin((x-cx)*Math.PI/2.2);for(let c=0;c<3;c++)data[i+c]=data[i+c]*k;}
    // Two rows of stitches outside each side and round the point, in short dashes.
    const along=y+Math.abs(x-cx)*.5,dash=Math.floor(along/5)%2===0;
    if(y>=top&&dash&&((d>3&&d<5)||(d>8.5&&d<10.5)))for(let c=0;c<3;c++)data[i+c]=stitch[c];}
  const art=drawEmbroidery(E,Math.round(E.width*PX)),x0=Math.round(panelW/2-(.5+E.margin)*E.width*PX+E.shift*PX),y0=Math.round((B.neck-E.top)*.76*PX-E.margin*E.width*PX);
  for(let y=0;y<art.h;y++)for(let x=0;x<art.w;x++){const s=(y*art.w+x)*4,a=art.data[s+3]/255;if(!a)continue;const tx=x0+x,ty=y0+y;if(tx<0||ty<0||tx>=panelW||ty>=h)continue;
    const d=(ty*w+tx)*4;for(let c=0;c<3;c++)data[d+c]=data[d+c]*(1-a)+art.data[s+c]*a;}
  const out={data,w,h};bodyCache.set(key,out);return out;
}
function texture(data,w,h,wrap){const t=new T.DataTexture(data,w,h,T.RGBAFormat);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=wrap?T.RepeatWrapping:T.ClampToEdgeWrapping;
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;}
const tiles=new Map();
function fleece(spec,map){
  // Brushed cotton fleece: matte, with a soft sheen and the fine knit of its face in the bump.
  const knit=weave('knit');knit.repeat.set(80,46);
  return new T.MeshPhysicalMaterial({map,roughness:.9,sheen:.3,sheenColor:new T.Color(spec.colours.sheen),sheenRoughness:.7,bumpMap:knit,bumpScale:.002,side:T.DoubleSide});
}
function plainFleece(spec,u,v){
  const c=spec.colours.fleece;if(!tiles.has(c))tiles.set(c,fleecePixels(256,256,c,9));
  const map=texture(tiles.get(c),256,256,true);map.repeat.set(u,v);return fleece(spec,map);
}
function rib(spec,u,v){
  const m=plainFleece(spec,u,v),bump=weave('knit');bump.repeat.set(u*6,1);m.bumpMap=bump;m.bumpScale=.006;m.roughness=.93;return m;
}

// The script on the sleeve: a joined handwriting stroke drawn into a small transparent texture. Letter shapes in ems
// (x-height .5, baseline 0, y up), joined as one pen line where the letters run on.
const SCRIPT=[
  [[.1,0],[.22,.55],[.28,1]],
  [[.28,1],[.7,.96],[.82,.78],[.62,.58],[.3,.52],[.5,.5],[.72,.08],[.95,.1],[1.2,.26],[1.3,.42],[1.2,.5],[1.05,.4],[1.06,.14],[1.26,0],[1.46,.1],[1.55,.46],[1.55,-.48]],
  [[1.55,.12],[1.66,.38],[1.82,.48],[1.96,.34],[1.9,.1],[1.68,.03],[1.98,.06],[2.24,.6],[2.34,1],[2.22,1.04],[2.14,.8],[2.2,.2],[2.36,0],[2.58,.12],[2.76,.46],[2.6,.48],[2.45,.3],[2.5,.05],[2.7,.15],[2.8,.46],[2.8,.1],[2.95,0],[3.12,.1],[3.16,.46],[3.16,.16],[3.3,.04],[3.46,.2],[3.52,.48],[3.46,-.2],[3.3,-.5],[3.14,-.4],[3.3,-.2],[3.72,.06]],
];
let scriptCache=null;
function scriptTexture(colour){
  if(scriptCache)return scriptCache;
  const W=384,H=160,em=W/4,base=H*.66,data=new Uint8Array(W*H*4),ink=hex(colour),cover=new Float32Array(W*H),pen=em*.075;
  for(const stroke of SCRIPT){const path=new T.CatmullRomCurve3(stroke.map(([x,y])=>new T.Vector3(x*em+em*.05,base-y*em,0))),n=Math.ceil(path.getLength()/.6),q=new T.Vector3();
    for(let k=0;k<=n;k++){path.getPoint(k/n,q);for(let y=Math.floor(q.y-pen-1);y<=q.y+pen+1;y++)for(let x=Math.floor(q.x-pen-1);x<=q.x+pen+1;x++){if(x<0||y<0||x>=W||y>=H)continue;
      const a=clamp(pen+.5-Math.hypot(x-q.x,y-q.y));if(a>cover[y*W+x])cover[y*W+x]=a;}}}
  for(let i=0;i<W*H;i++){for(let c=0;c<3;c++)data[i*4+c]=ink[c];data[i*4+3]=Math.round(cover[i]*255);}
  const t=texture(data,W,H,false);t.premultiplyAlpha=false;return scriptCache=t;
}
// Linear radii of a sleeve's rows at height y.
const rowAt=(rows,y)=>{for(let k=0;k<rows.length-1;k++)if(y<=rows[k][0]&&y>=rows[k+1][0]){const t=(rows[k][0]-y)/(rows[k][0]-rows[k+1][0]);return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];}return rows.at(-1).slice(1,3);};

export function makeEmbroideredSweatshirt(id,spec,overSkirt=false){
  const top=new T.Group();top.name=id;
  const B=spec.body,S=spec.sleeve,C=spec.colours,hem=B.hem,band=B.band,flare=overSkirt?B.bandOverSkirt:B.bandRadius,rows=[...B.rows,[hem+band+.012,...flare]];
  // The hem dips lower at the back: the band, and the body just above it, are drawn down further round the back.
  const dip=(x,z)=>B.backDrop*((1-z/Math.hypot(x,z||1e-9))/2)**1.5;
  // Body: front and back panels side by side, each the width of the widest row (scaled across by the outfit).
  const half=Math.max(...rows.map(r=>r[1])),panelW=Math.ceil(half*2*1.06*PX),bodyH=Math.ceil((B.neck-hem-band)*.76*PX)+8;
  const px=bodyPixels(id+':body',panelW,bodyH,spec),body=shell(top,rows,fleece(spec,texture(px.data,px.w,px.h,false)),'sweatshirt-body',128);
  const p=body.geometry.attributes.position,uv=body.geometry.attributes.uv,low=hem+band+.012;
  for(let i=0;i<uv.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),u=.5+(z>=0?x:-x)/(half*2);
    uv.setXY(i,(z>=0?0:.5)+.5*clamp(u,.002,.998),clamp((B.neck-y)*.76*PX/bodyH));
    const w=clamp((B.dipFrom-y)/(B.dipFrom-low));if(w>0)p.setY(i,y-dip(x,z)*w);}
  uv.needsUpdate=p.needsUpdate=true;body.geometry.computeVertexNormals();
  // The deep rib band, straight under the boxy body; it sits out over the skirt.
  const hemBand=ribbed(shell(top,[[low+.008,flare[0]-.006,flare[1]-.004],[low-.004,...flare],[hem+band/2,flare[0]-.002,flare[1]-.001],[hem,flare[0]-.004,flare[1]-.002]],rib(spec,12,1),'ribbed-hem-band',512),B.ribs,.008);
  const q=hemBand.geometry.attributes.position;for(let i=0;i<q.count;i++)q.setY(i,q.getY(i)-dip(q.getX(i),q.getZ(i)));
  q.needsUpdate=true;hemBand.geometry.computeVertexNormals();
  ribbed(shell(top,B.neckband,rib(spec,10,1),'ribbed-crew-neck',384),B.neckRibs,.016);
  // Full sleeves from dropped shoulders, with the shoulder seam low on her upper arm, into long rib cuffs.
  const seam=new T.MeshStandardMaterial({color:C.stitch,roughness:.9});
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const yt=S.rows[0][0],sleeve=shell(arm,S.rows,plainFleece(spec,3,4),'knit-jumper-sleeve',64);
    roundSleeveCap(sleeve,side,yt);
    const [sx,sz]=rowAt(S.rows,S.seam);curve(arm,Array.from({length:49},(_,k)=>{const a=k/48*Math.PI*2;return [Math.sin(a)*(sx+.003),S.seam,Math.cos(a)*(sz+.003)];}),.0025,seam,'shoulder-seam');
    easeOverHand(ribbed(shell(arm,S.cuff,rib(spec,6,1),'ribbed-cuff',256),S.cuffRibs,.025),side);
    // The script on her left sleeve, above the cuff on the front of her forearm.
    if(side===spec.script.side){const L=spec.script,[rx,rz]=rowAt(S.rows,L.y),r=(rx+rz)/2,span=L.width/r,grid=[];
      for(let j=0;j<=4;j++){const y=L.y+L.height/2-L.height*j/4,[ax,az]=rowAt(S.rows,y),ring=[];
        for(let i=0;i<=16;i++){const a=L.angle-span/2+span*i/16;ring.push([Math.sin(a)*(ax+.003),y,Math.cos(a)*(az+.003)]);}grid.push(ring);}
      const m=new T.MeshStandardMaterial({map:scriptTexture(C.script),transparent:true,alphaTest:.35,roughness:.6,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});
      ringShell(arm,grid,m,'embroidered-script').castShadow=false;}
    top.add(arm);
  }
  return top;
}
