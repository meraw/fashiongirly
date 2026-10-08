// Button-down shirts: a body with a buttoned placket, a point collar on a stand, and set-in sleeves.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
import * as T from 'three';
import { random, solid, oval, curve, shell, roundSleeveCap, surfaceProbe, easeOverHand } from './model.js';
import { grid } from './polo.js';
import { MOTEL_TIE_DYE_SHIRT_ID } from '../wardrobe/catalog.js';

// Warm grey-mauve tie-dye, measured in the shirt's own photos (hanger front and back): the darkest patches about
// (55, 43, 43), the middle (100, 88, 87), the palest (215, 205, 200). Darker than measured: exposure, tone mapping and
// the mesh's sheen lift these values.
const DYE={dark:[12,9,11],mid:[70,62,66],light:[172,165,166]};
const NECK=1.905,HEM=1.26;
// Slim and fitted, cropped at her waist. Below 1.5 it follows the polo, whose hem clears every waistband.
const BODY_ROWS=[[NECK,.112,.104],[1.875,.17,.124],[1.83,.228,.154],[1.775,.265,.177],[1.65,.278,.184],[1.5,.282,.19],[1.4,.288,.2],[1.335,.29,.205],[HEM,.29,.205]];
// Seven buttons from the collar to the hem, as on the hanger; the shirt is worn buttoned.
const BUTTONS=[1.862,1.78,1.698,1.616,1.534,1.452,1.37];
const PLACKET=.017;
// One tile of print is this wide and tall on her (in outfit units around and up), so the blobs stay round on her squat body.
const TILE_AROUND=3,TILE_HIGH=.71;

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
let dyePixels=null;
function tieDyeData(){
  if(dyePixels)return dyePixels;
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
  dyePixels={data,w:size,h:size};return dyePixels;
}
let meshPixels=null;
function meshNetData(){
  // Power-mesh netting: a fine lattice of tiny holes, used as a bump so the fabric reads as mesh up close.
  if(meshPixels)return meshPixels;
  const size=32,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x%8)-3.5,dy=((y+(Math.floor(x/8)%2)*4)%8)-3.5,hole=Math.hypot(dx,dy)<2;
    const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=hole?60:220;data[i+3]=255;}
  meshPixels={data,w:size,h:size};return meshPixels;
}
function texture({data,w,h},srgb){
  const t=new T.DataTexture(data,w,h,T.RGBAFormat);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;
}
function meshMaterial(){
  const net=texture(meshNetData(),false);net.repeat.set(160,90);
  const mat=new T.MeshPhysicalMaterial({map:texture(tieDyeData(),true),roughness:.62,sheen:.35,sheenColor:new T.Color('#d8cbc8'),sheenRoughness:.55,bumpMap:net,bumpScale:.0025,side:T.DoubleSide});
  return mat;
}
// Print coordinates: around the body and up it, in tiles sized to her, so the patches are the same size everywhere.
function mapPrint(mesh,around,toOutfit=v=>v){
  const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,v=new T.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);toOutfit(v);uv.setXY(i,uv.getX(i)*around,v.y/TILE_HIGH);}
  uv.needsUpdate=true;
}
function makeShirtCollar(top,mat,facing,stitch){
  // A point collar: the fall turns over a stand round her neck and lies on her shoulders, its front edges meeting at
  // the top button and spreading to points. u runs from the right point round the back to the left; v from fold to edge.
  const fold=a=>[.123*Math.sin(a),1.952-.03*(1+Math.cos(a))/2,.115*Math.cos(a)];
  const frontX=v=>.012+.088*v**1.3;
  const outerY=(a,u)=>{const end=Math.max(0,1-Math.min(u,1-u)/.12);return 1.888-.04*(1+Math.cos(a))/2-.05*end*end;};
  const at=(u,v,inset=0)=>{
    const vv=v*(1-inset),y=outerY(0,0)+(fold(0)[1]-outerY(0,0))*(1-vv),[rx]=bodyRadii(y);
    const r=vv<1e-6?.123:.123+(rx+.01-.123)*vv,start=Math.asin(Math.min(.99,(frontX(vv)+inset*.6*(1-vv))/r));
    const uu=inset?.5+(u-.5)*(1-inset*.9):u,a=start+(Math.PI*2-2*start)*uu,f=fold(a),oy=outerY(a,uu),[ox,oz]=bodyRadii(oy);
    const out=[(ox+.01)*Math.sin(a),oy,(oz+.01)*Math.cos(a)],roll=.01*Math.sin(Math.PI*vv),s=Math.hypot(out[0],out[2])||1,lift=inset?.002:0;
    return [f[0]+(out[0]-f[0])*vv+(roll+lift)*out[0]/s,f[1]+(out[1]-f[1])*vv,f[2]+(out[2]-f[2])*vv+(roll+lift)*out[2]/s];
  };
  const fall=grid(top,96,8,(u,v)=>at(u,v),mat,'shirt-collar-fall');mapPrint(fall,3);
  // The stand, faced in black inside: the black shows between the collar's front edges.
  const standStart=Math.asin(.012/.115);
  grid(top,64,2,(u,v)=>{const a=standStart+(Math.PI*2-2*standStart)*u,r=[.115-.006*v,.107-.006*v];return [r[0]*Math.sin(a),1.95-.05*v,r[1]*Math.cos(a)];},facing,'shirt-collar-stand');
  curve(top,Array.from({length:97},(_,i)=>at(i/96,1)),.0035,mat,'shirt-collar-edge');
  // Black topstitching just inside the collar's edges, as on the photos: along the outer edge and up both front edges.
  curve(top,Array.from({length:97},(_,i)=>at(i/96,1,.16)),.0016,stitch,'shirt-collar-topstitch');
  return fall;
}
function makeMeshShirt(id){
  const top=new T.Group();top.name=id;
  const mesh=meshMaterial(),stitch=solid('#16110f',.6),facing=solid('#141212',.85);
  const body=shell(top,BODY_ROWS,mesh,'mesh-shirt-body',128);mapPrint(body,TILE_AROUND);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;arm.updateMatrix();
    // Long fitted sleeves to the wrist, as on the bronze mesh top, ending in a plain stitched hem that eases over her hand.
    const sleeve=shell(arm,[[.025,.1,.102],[-.04,.113,.109],[-.16,.108,.102],[-.28,.105,.1],[-.40,.097,.092],[-.49,.08,.082],[-.53,.079,.081]],meshMaterial(),'mesh-shirt-sleeve',48);
    roundSleeveCap(sleeve,side,.025);mapPrint(sleeve,1,v=>v.applyMatrix4(arm.matrix));easeOverHand(sleeve,side);
    const p=sleeve.geometry.attributes.position,hem=[];for(let i=p.count-49;i<p.count;i++)hem.push([p.getX(i)*1.02,p.getY(i)+.008,p.getZ(i)*1.02]);
    curve(arm,hem,.0014,stitch,'sleeve-hem-stitch');
    top.add(arm);
  }
  makeShirtCollar(top,meshMaterial(),facing,stitch);
  top.updateMatrixWorld(true);
  const probe=surfaceProbe(top,['mesh-shirt-body']),onSurface=(x,y)=>{const key=x+':'+y;
    if(!surfaceCache.has(key)){const hit=probe(x,y,true);surfaceCache.set(key,hit&&{point:hit.point.clone(),normal:hit.normal.clone()});}
    const hit=surfaceCache.get(key);return hit&&{point:hit.point.clone(),normal:hit.normal.clone()};};
  const line=(pts,name,r=.0016)=>{const out=pts.map(([x,y])=>onSurface(x,y)).filter(Boolean).map(h=>h.point.addScaledVector(h.normal,.0025).toArray());if(out.length>1)curve(top,out,r,stitch,name);};
  // The placket: the same print, edged by black stitching down both sides, from the collar to the hem.
  for(const side of [-1,1])line(Array.from({length:14},(_,k)=>[side*PLACKET,1.885-(1.885-HEM-.012)*k/13]),'placket-stitch');
  // Glossy black buttons, slightly domed.
  for(const y of BUTTONS){const hit=onSurface(0,y);if(!hit)continue;
    const b=oval(top,hit.point.clone().addScaledVector(hit.normal,.006).toArray(),[.0105/1.06,.0105/.76,.004],solid('#0d0b0b',.18),'shirt-button',20);b.lookAt(b.position.clone().add(hit.normal));}
  // A black overlocked hem, stitched all the way round just above the lower edge.
  curve(top,Array.from({length:129},(_,k)=>{const a=k/128*Math.PI*2;return [Math.sin(a)*.2915,HEM+.012,Math.cos(a)*.2065];}),.0016,stitch,'hem-stitch');
  return top;
}
const surfaceCache=new Map();
// Cropped at the waist, so it is the same with or without the skirt.
export function makeButtonShirt(id=MOTEL_TIE_DYE_SHIRT_ID){return makeMeshShirt(id);}
