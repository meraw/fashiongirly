// Ditsy print shirt: the button-down shirt (makeShirt() in src/doll/shirts.js) in a small all-over print of flower sprays,
// drawn in code from the catalog `build`. Each spray is a few round roses on fine stems with small pointed leaves.
//   print: { ground, rose, shade, leaf, sprays, size, seed }: the colours (as [r, g, b]), how many sprays on a tile, the
//     roses' radius in tile pixels and the layout's seed;
//   around, high, sleeveAround, collarAround: how many tiles go round her, a sleeve and the collar, and a tile's height;
//   sheen, roughness and the shirt's own style fields (stitch, button, buttons, open, collar, rows, tucked, shirttail,
//     sleeve, cuff; see shirts.js);
//   darts (optional): [{ x, top, bottom, back }]: shaping darts stitched down the front (or the back) at x, from top to
//     bottom, mirrored either side of the centre.
import { random, solid, curve, surfaceProbe } from './model.js';
import { makeShirt } from './shirts.js';

const tiles={};
function ditsyRoseData(P){
  const key=JSON.stringify(P);if(tiles[key])return tiles[key];
  const size=512,rand=random(P.seed),px=new Float32Array(size*size*3);
  for(let i=0;i<size*size;i++)for(let k=0;k<3;k++)px[i*3+k]=P.ground[k];
  const smooth=t=>{const f=Math.max(0,Math.min(1,(t+1)/2));return f*f*(3-2*f);};
  // Paints a shape over the tile, wrapping at its edges: inside(dx, dy) is how far inside the shape a point is, in pixels,
  // and colour(dx, dy) its colour there.
  const paint=(cx,cy,reach,inside,colour)=>{
    for(let y=Math.floor(cy-reach);y<=Math.ceil(cy+reach);y++)for(let x=Math.floor(cx-reach);x<=Math.ceil(cx+reach);x++){
      const dx=x+.5-cx,dy=y+.5-cy,a=smooth(inside(dx,dy));if(a<=0)continue;const c=typeof colour==='function'?colour(dx,dy):colour;
      const i=(((y%size)+size)%size)*size+(((x%size)+size)%size);for(let k=0;k<3;k++)px[i*3+k]+=(c[k]-px[i*3+k])*a;}};
  const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
  // A rose: a round bloom shaded darker in a spiral of petals, toward one side.
  const rose=(x,y,r)=>{const turn=rand()*Math.PI*2,lean=rand()*Math.PI*2;
    paint(x,y,r+2,(dx,dy)=>r-Math.hypot(dx,dy),(dx,dy)=>{const d=Math.hypot(dx,dy)/r,a=Math.atan2(dy,dx);
      const petals=Math.max(0,Math.sin(a*2+turn+d*7))**3*(.35+.65*d),side=.5+.5*Math.cos(a-lean);
      return mix(P.rose,P.shade,Math.min(1,.65*petals+.35*side*d));});};
  // A small pointed leaf along `turn`, from its base at (x, y).
  const leaf=(x,y,len,w,turn)=>{const c=Math.cos(turn),s=Math.sin(turn);
    paint(x+c*len/2,y+s*len/2,len,(dx,dy)=>{const u=dx*c+dy*s,v=-dx*s+dy*c;if(Math.abs(u)>=len/2)return -2;return w*(1-(2*u/len)**2)-Math.abs(v)+.3;},P.leaf);};
  const stem=(x0,y0,x1,y1)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0));for(let k=0;k<=n;k++){const t=k/n;paint(x0+(x1-x0)*t,y0+(y1-y0)*t,1.5,(dx,dy)=>.55-Math.hypot(dx,dy),P.leaf);}};
  // Sprays scattered without crowding, each keeping clear of those already placed (wrapping round the tile).
  const placed=[];
  for(let n=0,tries=0;n<P.sprays&&tries<P.sprays*80;tries++){const x=rand()*size,y=rand()*size,reach=P.size*2.2;
    if(!placed.every(([px2,py2])=>{let dx=Math.abs(x-px2),dy=Math.abs(y-py2);dx=Math.min(dx,size-dx);dy=Math.min(dy,size-dy);return Math.hypot(dx,dy)>reach;}))continue;
    placed.push([x,y]);n++;
    // Two to five roses round the spray's centre, joined to it by stems, with leaves on the stems and round the edge.
    const count=2+Math.floor(rand()*4),blooms=[];
    for(let k=0;k<count;k++){const a=k/count*Math.PI*2+rand()*.9,d=P.size*(.7+rand()*1.1);blooms.push([x+Math.cos(a)*d,y+Math.sin(a)*d,P.size*(.7+rand()*.45),a]);}
    for(const [bx,by] of blooms)stem(x,y,bx,by);
    for(let k=0;k<2+Math.floor(rand()*4);k++){const a=rand()*Math.PI*2,d=P.size*(1.6+rand()*1.1);
      stem(x,y,x+Math.cos(a)*d*.7,y+Math.sin(a)*d*.7);leaf(x+Math.cos(a)*d*.7,y+Math.sin(a)*d*.7,P.size*(.9+rand()*.5),P.size*.32,a+(rand()-.5)*.8);}
    for(const [bx,by,r,a] of blooms){leaf(bx,by,r*1.2,r*.38,a+(rand()<.5?-1:1)*(.6+rand()*.6));rose(bx,by,r);}}
  const data=new Uint8Array(size*size*4);
  for(let i=0;i<size*size;i++){for(let k=0;k<3;k++)data[i*4+k]=Math.max(0,Math.min(255,Math.round(px[i*3+k])));data[i*4+3]=255;}
  return tiles[key]={data,w:size,h:size};
}
// A fine, even satin crepe in the bump: smooth noise on a small tile.
function satinData(){
  if(tiles.satin)return tiles.satin;
  const size=64,rand=random(907),cells=Array.from({length:16*16},()=>rand()),data=new Uint8Array(size*size*4);
  const at=(x,y)=>cells[((y%16+16)%16)*16+((x%16+16)%16)],s=t=>t*t*(3-2*t);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/4,v=y/4,x0=Math.floor(u),y0=Math.floor(v),fx=s(u-x0),fy=s(v-y0);
    const a=at(x0,y0)+(at(x0+1,y0)-at(x0,y0))*fx,b=at(x0,y0+1)+(at(x0+1,y0+1)-at(x0,y0+1))*fx,i=(y*size+x)*4;
    data[i]=data[i+1]=data[i+2]=Math.round(64+128*(a+(b-a)*fy));data[i+3]=255;}
  return tiles.satin={data,w:size,h:size};
}
export function makeDitsyPrintShirt(id,build,skirt=false){
  const {template,print,sheen,darts,...rest}=build;
  const style={bump:[satinData,60,40,.0006],roughness:.6,facing:null,collarTopstitch:false,depth:.7,...rest,
    print:()=>ditsyRoseData(print),sheen:[sheen,.3,.45]};
  const top=makeShirt(id,style,null,skirt);
  // Shaping darts, stitched down the body where it has fabric (a tucked hem cuts them short).
  if(darts){top.updateMatrixWorld(true);const probe=surfaceProbe(top,['mesh-shirt-body']),thread=solid(style.stitch,.6);
    for(const D of darts)for(const side of [-1,1]){const pts=[];
      for(let k=0;k<=16;k++){const hit=probe(side*D.x,D.top-(D.top-D.bottom)*k/16,!D.back);if(hit)pts.push(hit.point.clone().addScaledVector(hit.normal,.0022).toArray());}
      if(pts.length>1)curve(top,pts,.0011,thread,D.back?'back-dart':'front-dart');}}
  return top;
}
