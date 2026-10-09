// The Desigual split floral shirt's print, drawn locally: black cotton with, on one half, a dense scatter of small
// flowers (red daisies, cream and yellow blossoms, blue buds, green sprigs) and, on the other, plain black with large
// painted flowers (a red lily, cream blooms, a blue flower, green leaves), every motif edged in a light-blue outline as on
// the photos. Each piece of the shirt has its own canvas, laid out by where it falls on her rather than tiled:
// - the body: u once round her (0 at the centre front, toward her left), v = height in outfit units (1 to 2). Her right
//   front and the back below the yoke carry the small flowers; her left front and the back yoke are black with large ones;
// - each sleeve: u round the sleeve, v = height; her right sleeve small flowers, her left black with large ones;
// - the collar: u from her left point round the back to her right point; her left half black, her right half small flowers.
import { random } from './model.js';

// Colours measured on the flat lay (black about 23, 22, 26; red 198, 36, 45; blue 67, 129, 174; green 75, 153, 118;
// yellow 218, 167, 62; outlines 161, 192, 191).
const INK={black:[20,19,23],red:[200,34,44],redDeep:[140,16,28],cream:[242,226,198],peach:[240,190,150],yellow:[224,170,58],orange:[226,118,40],
  blue:[56,96,190],blueLight:[118,170,220],purple:[104,82,170],green:[58,150,96],greenLight:[140,206,150],outline:[160,204,222]};
const cache={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// A canvas laid out in base pixels (bw x bh) and drawn at k times that resolution, so edges stay smooth close up.
function canvas(bw,bh,k=2,wrapY=false){const w=bw*k,h=bh*k,data=new Uint8Array(w*h*4);for(let i=0;i<w*h;i++){data.set(INK.black,i*4);data[i*4+3]=255;}return {data,w,h,bw,bh,k,wrapY};}
// Paints a shape given by `inside(dx, dy)` (signed distance in pixels, positive inside) around (cx, cy) within radius r,
// anti-aliased, wrapping round in u (and in v on a tile), and only where `mask(x, y)` allows.
function shape(c,cx,cy,r,inside,col,alpha=1,mask=null){const s=c.k;
  for(let y=Math.floor((cy-r)*s);y<=Math.ceil((cy+r)*s);y++){let yy=y;if(c.wrapY)yy=((y%c.h)+c.h)%c.h;else if(y<0||y>=c.h)continue;
    for(let x=Math.floor((cx-r)*s);x<=Math.ceil((cx+r)*s);x++){const d=inside(x/s-cx,y/s-cy)*s;if(d<=-1)continue;const xx=((x%c.w)+c.w)%c.w;if(mask&&!mask(xx/s,yy/s))continue;
      const a=alpha*clamp(d+.5,0,1),k=(yy*c.w+xx)*4;for(let n=0;n<3;n++)c.data[k+n]=c.data[k+n]+(col[n]-c.data[k+n])*a;}}
}
// Local coordinates turned by `turn`, with vertical pixels squeezed by `sy` so motifs stay round on her.
const ellipse=(rx,ry,turn=0,sy=1)=>{const c=Math.cos(turn),s=Math.sin(turn),m=Math.min(rx,ry);return (dx,dy)=>{const yy=dy/sy,x=dx*c+yy*s,y=-dx*s+yy*c;return (1-Math.hypot(x/rx,y/ry))*m;};};
// A petal from the centre out to `len` along `turn`, widest in its middle.
const profiles=new Map(),profile=tip=>{if(!profiles.has(tip))profiles.set(tip,Float32Array.from({length:65},(_,k)=>Math.sin(Math.PI*k/64)**tip));return profiles.get(tip);};
const petal=(len,w,turn,sy=1,tip=.7)=>{const c=Math.cos(turn),s=Math.sin(turn),P=profile(tip);return (dx,dy)=>{const yy=dy/sy,x=dx*c+yy*s;if(x<-1||x>len+1)return -2;const y=Math.abs(-dx*s+yy*c);if(y>w+1)return -2;
  const wd=w*P[Math.round(clamp(x/len,0,1)*64)];return Math.min(wd-y,x+.5,len-x+.5);};};
// Paints one petal, scanning only the box round it rather than the whole flower.
function petalShape(c,x,y,len,w,turn,sy,tip,col,mask){const mx=Math.cos(turn)*len/2,my=Math.sin(turn)*len/2*sy,inside=petal(len,w,turn,sy,tip);
  shape(c,x+mx,y+my,len/2*sy+w+2,(dx,dy)=>inside(dx+mx,dy+my),col,1,mask);}
const segment=(x0,y0,x1,y1,width)=>(dx,dy)=>{const vx=x1-x0,vy=y1-y0,t=clamp(((dx-x0)*vx+(dy-y0)*vy)/(vx*vx+vy*vy||1),0,1);return width-Math.hypot(dx-x0-vx*t,dy-y0-vy*t);};
// A flower: petals round a centre, each drawn first a little larger in the outline colour, then in its own colour.
// Optional: `uneven` varies the petals' lengths, as painted; `veins` draws a darker line down each petal.
function flower(c,x,y,{petals,len,w,col,turn=0,sy=1.09,tip=.7,outline=1.6,mask=null,uneven=0,veins=null}){
  const L=p=>len*(1+uneven*Math.sin(p*2.3+turn*3));
  for(const [pad,colour] of [[outline,INK.outline],[0,col]])for(let p=0;p<petals;p++){if(colour===INK.outline&&!pad)continue;const a=turn+p/petals*Math.PI*2;petalShape(c,x,y,L(p)+pad,w+pad,a,sy,tip,colour,mask);}
  if(veins)for(let p=0;p<petals;p++){const a=turn+p/petals*Math.PI*2;shape(c,x,y,L(p),segment(Math.cos(a)*L(p)*.2,Math.sin(a)*L(p)*.2*sy,Math.cos(a)*L(p)*.8,Math.sin(a)*L(p)*.8*sy,.55),veins,.85,mask);}
}
// Small flowers ------------------------------------------------------------------------------------------------------
function ditsy(c,x,y,kind,s,turn,mask){
  if(kind==='daisy'){flower(c,x,y,{petals:11,len:s,w:s*.2,col:INK.red,turn,mask,outline:1.2});shape(c,x,y,s*.5,ellipse(s*.38,s*.38,0,1.09),INK.redDeep,1,mask);shape(c,x,y,s*.3,ellipse(s*.2,s*.2,0,1.09),INK.cream,1,mask);}
  else if(kind==='blossom'||kind==='yellow'){const col=kind==='yellow'?INK.yellow:INK.cream;flower(c,x,y,{petals:5,len:s*.85,w:s*.42,col,turn,mask,outline:1.2,tip:.5});shape(c,x,y,s*.3,ellipse(s*.2,s*.2,0,1.09),kind==='yellow'?INK.orange:INK.red,1,mask);}
  else if(kind==='buds'){for(let k=0;k<3;k++){const a=turn+k*2.1,bx=x+Math.cos(a)*s*.45,by=y+Math.sin(a)*s*.45*1.09;flower(c,bx,by,{petals:5,len:s*.36,w:s*.2,col:k===1?INK.purple:INK.blue,turn:a,mask,outline:1});}
    shape(c,x,y,s,segment(0,s*.3,s*.2,s*1.1,1.1),INK.green,1,mask);}
  else{// a sprig: a curved green stem with small leaves, and a tiny blossom at its tip
    const pts=Array.from({length:6},(_,k)=>{const t=k/5;return [Math.cos(turn)*s*1.4*t-Math.sin(turn)*s*.35*Math.sin(Math.PI*t),(Math.sin(turn)*s*1.4*t+Math.cos(turn)*s*.35*Math.sin(Math.PI*t))*1.09];});
    for(let k=0;k<5;k++){const [x0,y0]=pts[k],[x1,y1]=pts[k+1];shape(c,x,y,s*1.6,segment(x0,y0,x1,y1,1.6),INK.outline,1,mask);shape(c,x,y,s*1.6,segment(x0,y0,x1,y1,.9),INK.green,1,mask);}
    for(let k=1;k<5;k++){const [px,py]=pts[k],a=turn+(k%2?1.1:-1.1);shape(c,x+px,y+py,s*.6,petal(s*.45,s*.18,a,1.09),INK.outline,1,mask);shape(c,x+px,y+py,s*.6,petal(s*.38,s*.13,a,1.09),k%2?INK.greenLight:INK.green,1,mask);}
    const [tx,ty]=pts[5];flower(c,x+tx,y+ty,{petals:5,len:s*.35,w:s*.2,col:INK.peach,turn,mask,outline:1});}
}
// Scatters small flowers over the canvas on a jittered grid, `spacing` pixels apart, where `mask` allows.
function scatter(c,spacing,size,seed,mask){
  const rand=random(seed),kinds=['daisy','daisy','daisy','blossom','blossom','yellow','sprig','sprig','buds'];
  for(let gy=0;gy<c.bh/spacing;gy++)for(let gx=0;gx<c.bw/spacing;gx++){const x=(gx+.5+(gy%2)*.5+(rand()-.5)*.6)*spacing,y=(gy+.5+(rand()-.5)*.6)*spacing*1.09;
    ditsy(c,x,y,kinds[Math.floor(rand()*kinds.length)],size*(.8+rand()*.4),rand()*Math.PI*2,mask);}
}
// The small flowers are painted once on a seamless tile (it wraps both ways), then copied wherever a piece carries them.
function ditsyTile(){return cache.tile||(cache.tile=(()=>{const c=canvas(270,261,2,true);scatter(c,27,8.5,71,null);return c;})());}
function fillTile(c,mask){const t=ditsyTile();
  for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++){if(mask&&!mask(x/c.k,y/c.k))continue;const i=(y*c.w+x)*4,j=((y%t.h)*t.w+(x%t.w))*4;c.data[i]=t.data[j];c.data[i+1]=t.data[j+1];c.data[i+2]=t.data[j+2];}}
// Large painted flowers ----------------------------------------------------------------------------------------------
function big(c,x,y,kind,s,turn,mask){
  if(kind==='daisy'){// a big red daisy: narrow red petals round cream inner petals, veined, with an orange centre
    flower(c,x,y,{petals:15,len:s,w:s*.16,col:INK.red,turn,mask,outline:3,tip:.8,uneven:.12,veins:INK.redDeep});
    flower(c,x,y,{petals:11,len:s*.58,w:s*.14,col:INK.cream,turn:turn+.2,mask,outline:0,tip:.8,uneven:.1,veins:INK.peach});
    shape(c,x,y,s*.3,ellipse(s*.2,s*.2,0,1.09),INK.orange,1,mask);shape(c,x,y,s*.16,ellipse(s*.09,s*.09,0,1.09),INK.yellow,1,mask);}
  else if(kind==='lily'){// a red lily: long pointed petals with pale streaks and yellow stamens
    flower(c,x,y,{petals:6,len:s,w:s*.28,col:INK.red,turn,mask,outline:3,tip:.9,uneven:.15,veins:INK.redDeep});
    for(let p=0;p<6;p++){const a=turn+p/6*Math.PI*2+.08;shape(c,x,y,s,segment(0,0,Math.cos(a)*s*.7,Math.sin(a)*s*.7*1.09,1.2),INK.peach,.8,mask);}
    for(let p=0;p<7;p++){const a=turn+.3+p*.9,ex=Math.cos(a)*s*.55,ey=Math.sin(a)*s*.55*1.09;shape(c,x,y,s,segment(0,0,ex,ey,1.1),INK.yellow,1,mask);shape(c,x+ex,y+ey,4,ellipse(2.4,2.4),INK.orange,1,mask);}}
  else if(kind==='bloom'){// a cream bloom with an orange centre dotted red
    flower(c,x,y,{petals:7,len:s,w:s*.5,col:INK.cream,turn,mask,outline:3,tip:.45,uneven:.15,veins:INK.peach});
    shape(c,x,y,s*.45,ellipse(s*.34,s*.34,0,1.09),INK.orange,1,mask);
    for(let p=0;p<8;p++){const a=p/8*Math.PI*2;shape(c,x+Math.cos(a)*s*.2,y+Math.sin(a)*s*.2*1.09,4,ellipse(2.5,2.5),INK.red,1,mask);}}
  else if(kind==='blue'){// a blue flower with paler inner petals and a cream centre
    flower(c,x,y,{petals:6,len:s,w:s*.36,col:INK.blue,turn,mask,outline:3,tip:.8,uneven:.18,veins:INK.purple});
    flower(c,x,y,{petals:5,len:s*.55,w:s*.25,col:INK.blueLight,turn:turn+.6,mask,outline:0,tip:.5});
    shape(c,x,y,s*.3,ellipse(s*.18,s*.18,0,1.09),INK.cream,1,mask);}
  else if(kind==='orange'){flower(c,x,y,{petals:5,len:s,w:s*.45,col:INK.yellow,turn,mask,outline:3,tip:.5,uneven:.15,veins:INK.orange});shape(c,x,y,s*.35,ellipse(s*.22,s*.22,0,1.09),INK.orange,1,mask);}
  else{// leaves: two broad green leaves on a stem, lighter down their middle
    for(const [a,l] of [[turn,s],[turn+1.3,s*.8],[turn-1.1,s*.7]]){shape(c,x,y,s+4,petal(l+3,l*.3+3,a,1.09,.8),INK.outline,1,mask);shape(c,x,y,s+4,petal(l,l*.3,a,1.09,.8),INK.green,1,mask);shape(c,x,y,s,petal(l*.8,l*.08,a,1.09,.8),INK.greenLight,1,mask);}}
}
// Canvases -----------------------------------------------------------------------------------------------------------
const W=1024,H=512,TAU=Math.PI*2;
// The body. Which half carries the small flowers: her right front, and the back below the yoke.
const YOKE=1.79,small=(x,y)=>{const a=x/W*TAU;if(a>TAU*.75)return true;if(a>TAU*.25)return 1+y/H<YOKE;return false;};
export function splitBodyData(){
  return cache.body||(cache.body=(()=>{const c=canvas(W,H);
    fillTile(c,small);
    const black=(x,y)=>!small(x,y);
    // Large flowers on her left front and side, and one across the back yoke near her left shoulder (u, height, size, turn).
    for(const [kind,u,h,s,turn] of [['leaves',.05,1.86,50,-.5],['lily',.16,1.67,56,.4],['daisy',.11,1.4,54,.2],['blue',.03,1.29,32,.9],['bloom',.24,1.76,46,1.2],['orange',.25,1.36,30,.2],['leaves',.33,1.86,56,1.9]])
      big(c,u*W,(h-1)*H,kind,s,turn,black);
    return c;})());
}
// Her left sleeve: black with large flowers down its outer side (u .25 is the outside of her left arm).
export function leftSleeveData(){
  return cache.left||(cache.left=(()=>{const c=canvas(512,H);
    for(const [kind,u,h,s,turn] of [['bloom',.3,1.76,50,.5],['lily',.2,1.56,62,1.6],['leaves',.38,1.46,46,.3],['orange',.26,1.36,36,1.1],['blue',.62,1.68,36,.4]])big(c,u*512,(h-1)*H,kind,s,turn,null);
    return c;})());
}
// Her right sleeve: small flowers all round.
export function rightSleeveData(){return cache.right||(cache.right=(()=>{const c=canvas(420,H);fillTile(c,null);return c;})());}
// The collar: her left half black with part of a large flower, her right half small flowers.
export function splitCollarData(){
  return cache.collar||(cache.collar=(()=>{const c=canvas(512,H);const right=(x)=>x>=256;
    fillTile(c,right);big(c,.12*512,(1.9-1)*H,'bloom',50,.8,x=>!right(x));big(c,.3*512,(1.88-1)*H,'leaves',42,2.2,x=>!right(x));
    return c;})());
}
