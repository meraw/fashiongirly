// Knit polo shirts: a fitted fine-gauge knit with a polo collar, a short button placket, short sleeves and rib bands.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
import * as T from 'three';
import { V, random, weave, solid, put, oval, curve, shell, ribbed, roundSleeveCap, surfaceProbe, trimToEdge } from './model.js';
import { TOMMY_STRIPE_POLO_ID } from '../wardrobe/catalog.js';

// Navy and off-white, measured in the flat lay and the model photos. Darker than the photographed yarn: exposure,
// tone mapping and sheen lift these values.
const POLO={navy:[17,21,36],white:[186,189,186],button:'#b9b6a8'};
// One stripe repeat: navy fills 60% of it, off-white 40% (measured in the flat lay and the front photo).
const PITCH=.052,NAVY_SHARE=.6;
const NECK=1.905,HEM=1.26,BAND=.075,BODY_HEM=HEM+BAND;
// The top button is left open: a narrow V down to the second button, edged by the placket.
const V_BOTTOM=1.835,V_HALF=.03,PLACKET=.022,PLACKET_END=1.665;
// The body, slim and fitted, ending at her waist. Below 1.5 it follows the silver cable jumper, which clears every waistband.
const BODY_ROWS=[[NECK,.112,.104],[1.875,.17,.124],[1.83,.228,.154],[1.775,.265,.177],[1.65,.278,.184],[1.5,.282,.19],[1.4,.288,.2],[BODY_HEM,.29,.205]];
const POLO_SLEEVE_END=-.215;

let stripePixels=null;
const surfaceCache=new Map();
function stripeData(){
  if(stripePixels)return stripePixels;
  // One stripe repeat down the tile (navy first, as v increases downwards). The stripes are knitted in: each edge steps over
  // one row, and the yarn has a faint, fine heather.
  const w=32,h=128,data=new Uint8Array(w*h*4),rand=random(52);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const t=(y+.5)/h,colour=t<NAVY_SHARE?POLO.navy:POLO.white,i=(y*w+x)*4,grain=1+(rand()-.5)*.06;
    for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,colour[k]*grain));data[i+3]=255;
  }
  stripePixels={data,w,h};return stripePixels;
}
function knitMaterial(colour=null){
  // Fine-gauge knit: the stripes (or one plain colour) and a fine stitch bump.
  let map=null;
  if(!colour){const {data,w,h}=stripeData();map=new T.DataTexture(data,w,h,T.RGBAFormat);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
    // No mipmaps: blended mip levels narrow the navy stripes (measured in a render); the stripes are horizontal, so they do not shimmer.
    map.generateMipmaps=false;map.minFilter=T.LinearFilter;map.magFilter=T.LinearFilter;map.needsUpdate=true;}
  const stitch=weave('knit');stitch.repeat.set(40,.7);
  return new T.MeshPhysicalMaterial({map,color:colour?new T.Color().setRGB(...colour.map(c=>c/255),T.SRGBColorSpace):'#ffffff',roughness:.92,sheen:.12,sheenColor:new T.Color('#c8cbd6'),sheenRoughness:.9,bumpMap:stitch,bumpScale:.006,side:T.DoubleSide});
}
// Stripes follow height in the outfit, so the body's and sleeves' stripes meet at the armholes. A white stripe ends at the
// top of the hem band, as in the flat lay.
function mapStripes(mesh,toOutfit=v=>v){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,v=new T.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);toOutfit(v);uv.setY(i,(BODY_HEM-v.y)/PITCH+40);}
  uv.needsUpdate=true;
}
// A surface built from a function over a (u, v) grid.
function grid(group,nu,nv,at,mat,name){
  const pos=[],uv=[],idx=[];
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){pos.push(...at(i/nu,j/nv));uv.push(i/nu,j/nv);}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  return put(group,geo,mat,name);
}
// The body's radii at a height, from its rows (linear between rows is close enough for the collar to lie on it).
function bodyRadii(y){
  const rows=BODY_ROWS;let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;
  const t=Math.max(0,Math.min(1,(rows[k][0]-y)/(rows[k][0]-rows[k+1][0])));
  return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];
}
// The neckline: round at the back and sides, and at the front a narrow V cut down to the second button.
function poloNeckline(x,z){
  if(z<=0)return NECK+1;
  return Math.min(NECK+1,V_BOTTOM+(NECK-V_BOTTOM)*Math.abs(x)/V_HALF);
}
function makeCollar(top,navy){
  // The collar's fall: from its fold (round the top of the stand) down over her shoulders, ending in spread points either
  // side of the placket. u runs from the right point round the back to the left point; v from the fold to the outer edge.
  const fold=(a)=>[.126*Math.sin(a),1.95-.035*(1+Math.cos(a))/2,.118*Math.cos(a)];
  // The front edge runs from the placket's outer edge at the fold down and out to the point.
  // It stays close to the placket at first, so below her chin the collar frames the open placket, then spreads out.
  const frontX=v=>V_HALF+PLACKET+.004+(.125-V_HALF-PLACKET)*v**1.6;
  // The outer edge lies over her shoulders, a little lower at the front, and drops steeply into a point at each end.
  const outerY=(a,u)=>{const end=Math.max(0,1-Math.min(u,1-u)/.13);return 1.885-.05*(1+Math.cos(a))/2-.06*end*end;};
  const at=(u,v)=>{
    // The collar's angle round her neck at this point; at its ends it follows the front edge.
    const y=outerY(0,0)+(fold(0)[1]-outerY(0,0))*(1-v),[rx]=bodyRadii(y);
    const r=v<1e-6?.126:.126+(rx+.012-.126)*v,start=Math.asin(Math.min(.99,frontX(v)/r));
    const a=start+(Math.PI*2-2*start)*u,f=fold(a),oy=outerY(a,u),[ox,oz]=bodyRadii(oy),out=[(ox+.012)*Math.sin(a),oy,(oz+.012)*Math.cos(a)];
    // A slight roll: the fall stands off a little in the middle as it turns over the stand.
    const roll=.012*Math.sin(Math.PI*v),s=Math.hypot(out[0],out[2])||1;
    return [f[0]+(out[0]-f[0])*v+roll*out[0]/s,f[1]+(out[1]-f[1])*v,f[2]+(out[2]-f[2])*v+roll*out[2]/s];
  };
  const fall=grid(top,96,8,at,navy,'polo-collar');
  // The stand rises round the neck inside the fall, open at the front over the placket.
  const standStart=Math.asin((V_HALF+PLACKET)/.118);
  grid(top,64,2,(u,v)=>{const a=standStart+(Math.PI*2-2*standStart)*u,r=[.118-.006*v,.11-.006*v];return [r[0]*Math.sin(a),1.948-.05*v,r[1]*Math.cos(a)];},navy,'polo-collar-stand');
  // A rolled edge gives the fall its thickness.
  curve(top,Array.from({length:97},(_,i)=>at(i/96,1)),.0045,navy,'polo-collar-edge');
  return fall;
}
// A flat strip lying on the knit: a function from (u across, v along) to a point in front of her, lifted off the surface.
function onKnit(top,onSurface,nu,nv,xy,lift,mat,name){
  return grid(top,nu,nv,(u,v)=>{const [x,y]=xy(u,v),hit=onSurface(x,y,true);if(!hit)return [x,y,.2];return hit.point.clone().addScaledVector(hit.normal,lift).toArray();},mat,name);
}
// A monogram: a script T crossing an H, embroidered in white. A suggestion of the brand's script at her scale, not a copy.
const MONOGRAM=[
  [[-.55,.62],[-.2,.82],[.2,.78],[.6,.9]],
  [[.05,.8],[0,.4],[-.1,-.1],[-.35,-.55],[-.6,-.45]],
  [[.45,.75],[.38,.2],[.3,-.3],[.42,-.62],[.65,-.45]],
  [[-.35,.12],[0,.2],[.4,.16],[.7,.3]],
];
function makePolo(id){
  const top=new T.Group();top.name=id;
  const knit=knitMaterial(),navy=knitMaterial(POLO.navy),rib=knitMaterial(POLO.navy);
  const body=shell(top,BODY_ROWS,knit,'polo-knit-body',128);
  trimToEdge(body,128,v=>v,poloNeckline);
  mapStripes(body);
  // The hem band tucks just inside the body's lower edge; fine ribs, as in the photos.
  ribbed(shell(top,[[BODY_HEM+.008,.281,.197],[HEM+BAND/2,.288,.203],[HEM,.287,.202]],rib,'ribbed-hem-band',640),80,.006);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;arm.updateMatrix();
    // Short set-in sleeves, close to the arm, ending above the elbow in a narrow rib band.
    const sleeve=shell(arm,[[.03,.108,.106],[-.04,.12,.117],[-.12,.118,.115],[-.18,.114,.111]],knitMaterial(),'knit-polo-sleeve',64);
    roundSleeveCap(sleeve,side,.03);mapStripes(sleeve,v=>v.applyMatrix4(arm.matrix));
    const cuff=ribbed(shell(arm,[[-.17,.112,.109],[-.195,.11,.107],[POLO_SLEEVE_END,.109,.106]],rib,'ribbed-cuff',256),32,.012);
    if(side>0){
      // The little metal flag tab on her left sleeve, on the outside just above the band's edge.
      const flag=new T.Group();flag.name='sleeve-flag';flag.position.set(.115,-.192,.025);flag.rotation.y=Math.PI/2-.2;
      [['#1d2a5a',-.006],['#f2f0ea',0],['#c0262f',.006]].forEach(([c,x])=>{const m=put(flag,new T.BoxGeometry(.006,.009,.002),solid(c,.45),'flag-stripe');m.position.x=x;});
      put(flag,new T.BoxGeometry(.021,.012,.0012),solid('#b8b8bc',.35),'flag-frame').position.z=-.0008;
      arm.add(flag);
    }
    cuff.name='ribbed-cuff';top.add(arm);
  }
  makeCollar(top,navy);
  top.updateMatrixWorld(true);
  // The placket: a navy strip down the front, edging the V, with its buttons.
  // The body never changes, so points found on it are kept for later builds (the app rebuilds the outfit on every edit).
  const probe=surfaceProbe(top,['polo-knit-body']),onSurface=(x,y,front)=>{const key=x+':'+y+':'+front;
    if(!surfaceCache.has(key)){const hit=probe(x,y,front);surfaceCache.set(key,hit&&{point:hit.point.clone(),normal:hit.normal.clone()});}
    const hit=surfaceCache.get(key);return hit&&{point:hit.point.clone(),normal:hit.normal.clone()};};
  const edgeX=y=>V_HALF*(y-V_BOTTOM)/(NECK-V_BOTTOM);
  onKnit(top,onSurface,4,12,(u,v)=>[(u-.5)*2*PLACKET,V_BOTTOM-(V_BOTTOM-PLACKET_END)*v],.003,navy,'polo-placket');
  for(const side of [-1,1])onKnit(top,onSurface,3,8,(u,v)=>{const y=V_BOTTOM+(NECK-.004-V_BOTTOM)*v;return [side*(edgeX(y)+.002+PLACKET*u),y];},.003,navy,'polo-placket');
  // Four buttons in the flat lay; the top one sits open under the collar and the other three show.
  for(const y of [1.812,1.75,1.69]){const hit=onSurface(0,y,true);if(!hit)continue;
    const b=oval(top,hit.point.clone().addScaledVector(hit.normal,.007).toArray(),[.0115/1.06,.0115/.76,.0045],solid(POLO.button,.35),'polo-button',20);b.lookAt(b.position.clone().add(hit.normal));}
  // The monogram on her left chest, level with the bottom button.
  const mono=new T.Group();mono.name='embroidered-monogram';top.add(mono);const white=solid('#f1efe8',.6);
  for(const stroke of MONOGRAM){const pts=[];for(const [sx,sy] of stroke){const hit=onSurface(.135+sx*.024/1.06,1.705+sy*.03/.76,true);if(hit)pts.push(hit.point.clone().addScaledVector(hit.normal,.004).toArray());}
    if(pts.length>1)curve(mono,pts,.0022,white,'monogram-stroke');}
  return top;
}
// It ends above the skirt's waistband, so it is the same with or without the skirt.
export function makeKnitPolo(id=TOMMY_STRIPE_POLO_ID){return makePolo(id);}
