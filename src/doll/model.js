import * as T from 'three';
import { cleanRecipe } from './recipe.js';
import { BRONZE_TOP_ID, LILAC_TOP_ID, CROCHET_TOP_ID, PLAID_JUMPER_ID, BARREL_JEANS_ID, GARMENTS } from '../wardrobe/catalog.js';
// Body and wardrobe share one toy proportion system; the face stays unscaled.
const BODY_HEIGHT = .76;
const BODY_WIDTH = 1.06;
const V = (x,y,z) => new T.Vector3(x,y,z);
function random(seed=13) { return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; }
function weave(kind) {
  const size = 128, data = new Uint8Array(size*size*4), rand=random(27);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const i=(y*size+x)*4;
    const stitch = kind === 'knit' ? Math.cos(x/size*Math.PI*8 + Math.abs((y%32)-16)*.17) : kind === 'denim' ? Math.sin((x+y)*1.3) : Math.sin(x*3.2)*Math.sin(y*3.7);
    const c = Math.round(153+stitch*39+(rand()-.5)*52);
    data[i]=data[i+1]=data[i+2]=c; data[i+3]=255;
  }
  const texture=new T.DataTexture(data,size,size,T.RGBAFormat); texture.wrapS=texture.wrapT=T.RepeatWrapping; texture.repeat.set(kind==='knit'?4:6,kind==='knit'?5:6);texture.needsUpdate=true;
  return texture;
}
function cloth(color, kind='felt') { return new T.MeshPhysicalMaterial({color, roughness:.97, sheen:1, sheenColor:new T.Color(color).lerp(new T.Color('#fff5e0'),.32), sheenRoughness:1, bumpMap:weave(kind), bumpScale:kind==='knit'?.025:.007, side:T.DoubleSide}); }
const solid=(color,roughness=.7)=>new T.MeshStandardMaterial({color,roughness});
function put(group,geometry,material,name) { const mesh=new T.Mesh(geometry,material);mesh.name=name||'';mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh; }
function oval(group,p,scale,mat,name,detail=32) {const mesh=put(group,new T.SphereGeometry(1,detail,24),mat,name);mesh.position.set(...p);mesh.scale.set(...scale);return mesh;}
function curve(group,points,radius,mat,name) {return put(group,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>V(...p))),Math.max(10,points.length*5),radius,5,false),mat,name);}
function shell(group,rows,mat,name,segments=40) {
  // Each ring: y, radius-x, radius-z, center-x. Elliptical continuous garment surface.
  if(rows.length>2){
    const profile=new T.CatmullRomCurve3(rows.map(r=>V(r[1],r[0],r[2])),false,'centripetal');
    const centres=new T.CatmullRomCurve3(rows.map(r=>V(r[3]||0,r[0],0)),false,'centripetal');
    const count=(rows.length-1)*5;
    rows=Array.from({length:count+1},(_,i)=>{const p=profile.getPoint(i/count),c=centres.getPoint(i/count);return [p.y,Math.max(.01,p.x),Math.max(.01,p.z),c.x];});
  }
  const positions=[],uv=[],indices=[];
  for(let j=0;j<rows.length;j++) {
    const [y,rx,rz,cx=0]=rows[j];
    for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;positions.push(cx+Math.sin(a)*rx,y,Math.cos(a)*rz);uv.push(i/segments,j/(rows.length-1));}
  }
  for(let j=0;j<rows.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return put(group,geo,mat,name);
}
function ring(group,y,rx,rz,mat,name,height=.05,cx=0) {return shell(group,[[y+height/2,rx,rz,cx],[y-height/2,rx,rz,cx]],mat,name);}
const faceZ=(x,y)=>.405*Math.sqrt(Math.max(.01,1-(x/.5)**2-(y/.47)**2));
function facePatch(group,x,y,rx,ry,offset,mat,name){
  const pos=[],uv=[],idx=[],segments=48,rings=5;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=j/rings,px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;pos.push(px,py,faceZ(px,py)+offset);uv.push(.5+Math.cos(a)*r*.5,.5+Math.sin(a)*r*.5);}
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;idx.push(a,b,b+1,a,b+1,a+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return put(group,geo,mat,name);
}
function faceCurve(group,points,radius,mat,name,offset=.009){return curve(group,points.map(([x,y])=>[x,y,faceZ(x,y)+offset]),radius,mat,name);}
function star(group,x,y,offset,r,mat) {
  const s=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,rr=i%2?r*.44:r;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?s.lineTo(px,py):s.moveTo(px,py);}s.closePath();const geo=new T.ShapeGeometry(s),p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,faceZ(p.getX(i),p.getY(i))+offset);geo.computeVertexNormals();return put(group,geo,mat,'embroidered-eye-star');
}
function makeHead() {
  const head=new T.Group();head.name='doll-head';head.position.set(0,2.34,0);head.rotation.z=-.105;
  const skin=cloth('#e2b698'), dark=cloth('#392625'), cream=solid('#fff2d7'), iris=cloth('#51372d'), blush=new T.MeshStandardMaterial({color:'#d7888a',transparent:true,opacity:.42,roughness:1});
  oval(head,[0,0,0],[.5,.47,.405],skin,'felt-head',48);
  for(const side of [-1,1]) {
    oval(head,[side*.473,-.04,0],[.08,.12,.075],skin,'ear');
    facePatch(head,side*.265,-.155,.092,.047,.005,blush,'cheek');
    facePatch(head,side*.183,.005,.126,.095,.007,cream,'eye-white');
    facePatch(head,side*.183+.017,.005,.077,.085,.011,iris,'embroidered-iris');
    facePatch(head,side*.183+.021,.006,.048,.064,.015,dark,'embroidered-pupil');
    star(head,side*.183+.003,.035,.02,.027,cream);star(head,side*.183+.047,-.014,.02,.013,cream);
    faceCurve(head,[[side*.183-.12,.025],[side*.183-.06,.09],[side*.183+.04,.104],[side*.183+.119,.045]],.008,dark,'stitched-eyelid');
    for(let i=0;i<3;i++) {const x=side*(.263+i*.014);faceCurve(head,[[x,.068-i*.016],[x+side*.035,.09-i*.012]],.005,dark,'eyelash');}
    faceCurve(head,[[side*.11,.172],[side*.19,.192],[side*.267,.17]],.01,dark,'eyebrow');
  }
  oval(head,[.01,-.087,.403],[.037,.028,.04],skin,'little-nose');
  faceCurve(head,[[-.055,-.205],[.003,-.223],[.064,-.194]],.007,cloth('#8b5150'),'stitched-smile');
  // Sculpted bob: full back volume, a crown, and overlapping swept locks.
  const hair=cloth('#362725'), shine=solid('#58413b',1);
  oval(head,[0,.035,-.16],[.555,.505,.34],hair,'bob-back',40);
  const cap=put(head,new T.SphereGeometry(1,48,30,0,Math.PI*2,0,1.12),hair,'hair-crown');cap.scale.set(.542,.506,.455);cap.position.y=.035;
  for(const side of [-1,1]) {
    const lock=oval(head,[side*.432,-.02,.072],[.122,.39,.245],hair,'side-bob');lock.rotation.z=side*.13;
    for(let j=0;j<6;j++){const x=side*(.36+j*.027);curve(head,[[x*.72,.405,.17],[x,.2,.24],[x*1.045,-.04,.22],[x*.99,-.32,.17]],.007,shine,'hair-yarn');}
  }
  for(let j=0;j<7;j++){
    const p=oval(head,[-.23+j*.066,.28+Math.sin(j*.45)*.075,.276],[.083,.23,.11],hair,'swept-fringe');p.rotation.z=-.7+j*.13;
  }
  for(let j=0;j<14;j++){const t=j/13;curve(head,[[-.4+t*.4,.29+t*.17,.26],[ -.29+t*.62,.39,.3],[-.08+t*.52,.25,.38]],.0045,shine,'fringe-thread');}
  const rand=random(42), points=[];
  for(let i=0;i<1000;i++){const a=rand()*Math.PI*2,z=rand()*2-1,r=Math.sqrt(1-z*z);const x=Math.cos(a)*r*.506,y=z*.476,depth=Math.sin(a)*r*.413;if(depth>.12&&y<.25)points.push(x,y,depth);}
  const fuzzGeo=new T.BufferGeometry();fuzzGeo.setAttribute('position',new T.Float32BufferAttribute(points,3));const fuzz=new T.Points(fuzzGeo,new T.PointsMaterial({color:'#eac8ad',size:.006,transparent:true,opacity:.36,depthWrite:false}));fuzz.name='felt-fibres';head.add(fuzz);
  const gold=solid('#d1ae61',.48);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;oval(head,[.365+Math.cos(a)*.042,.31+Math.sin(a)*.042,.365],[.025,.033,.01],gold,'flower-petal');}
  oval(head,[.365,.31,.381],[.018,.018,.009],solid('#f3d997'),'flower-centre');
  return head;
}
export function makeDoll() {
  const root=new T.Group();root.name='living-doll';
  const skin=cloth('#dfb195'), under=cloth('#f0e3d1');
  oval(root,[0,1.45,0],[.27,.43,.165],under,'cloth-body');
  oval(root,[0,1.9,0],[.1,.17,.09],skin,'neck');
  for(const side of [-1,1]){
    oval(root,[side*.16,.69,0],[.092,.49,.094],under,'leg');
    // The arm starts below the top of the body so the shoulder slopes into it.
    const arm=oval(root,[side*.307,1.51,0],[.09,.25,.09],skin,'arm');arm.rotation.z=side*.22;
    const hand=oval(root,[side*.37,1.245,.025],[.077,.093,.068],skin,'tiny-mitten');hand.rotation.z=side*.16;
    oval(root,[side*.322,1.265,.07],[.031,.042,.032],skin,'mitten-thumb',20);
    const sock=cloth('#ecdcac','knit');oval(root,[side*.16,.25,.02],[.106,.14,.107],sock,'sock');
    const leather=solid('#64362e',.37), sole=solid('#312829',.85);
    oval(root,[side*.16,.105,.09],[.131,.089,.205],leather,'loafer');oval(root,[side*.16,.052,.09],[.136,.044,.21],sole,'shoe-sole');
    curve(root,[[side*.16-.093,.157,.135],[side*.16,.177,.16],[side*.16+.093,.157,.135]],.015,leather,'loafer-strap');
    curve(root,[[side*.16-.11,.11,.14],[side*.16-.06,.09,.267],[side*.16+.06,.09,.267],[side*.16+.11,.11,.14]],.003,solid('#c4a26e'),'shoe-stitch');
  }
  root.name='plush-body';root.scale.set(BODY_WIDTH,BODY_HEIGHT,1);
  const doll=new T.Group();doll.name='living-doll';
  const head=makeHead();head.position.y-=1.94*(1-BODY_HEIGHT);
  doll.add(root,head);return doll;
}
function sleeve(group,side,volume,mat) {
  const sleeveGroup=new T.Group();sleeveGroup.position.set(side*.245,1.81,0);sleeveGroup.rotation.z=side*.22;
  const radius=.103+volume*.035;
  shell(sleeveGroup,[[.035,.087,.105],[0,radius*.95,radius],[-.08,radius*1.17,radius*1.12],[-.2,radius*1.13,radius*1.09],[-.33,radius*1.1,radius*1.06],[-.44,.086,.09],[-.48,.076,.083]],mat,'balloon-sleeve');
  ring(sleeveGroup,-.475,.077,.084,mat,'knit-cuff',.08);group.add(sleeveGroup);
}
function referenceMaterial(atlas, panel, lilac=false) {
  const map=atlas?.clone()||null;
  if(map){map.repeat.set(.496,.496);map.offset.set((panel==='right'||panel==='back')?.502:.002,(panel==='body'||panel==='back')?.502:.002);map.needsUpdate=true;}
  const detail=weave('denim');detail.repeat.set(9,9);
  const mat=new T.MeshPhysicalMaterial({color:map?'#ffffff':'#664732',map,roughness:.64,metalness:.26,sheen:.35,sheenColor:new T.Color('#a38150'),bumpMap:detail,bumpScale:.0018,side:T.DoubleSide});
  if(lilac){mat.metalness=panel==='back'?.32:.08;mat.roughness=panel==='back'?.5:.78;mat.sheenColor.set('#b4a0c2');return mat;}
  // Fine mesh pinholes; black bands remain opaque. Separate from painted colour.
  const size=256,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const bronze=Math.floor((1-y/size)*12)%2===0;
    const hole=bronze&&x%5===0&&y%5===0;
    const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=hole?0:255;data[i+3]=255;
  }
  const alpha=new T.DataTexture(data,size,size,T.RGBAFormat);alpha.needsUpdate=true;mat.alphaMap=alpha;mat.alphaTest=.4;
  return mat;
}
function roundSleeveCap(sleeve,side,top,depth=.19,drop=.085,pull=.2){
  // Ease the outer top of a sleeve down and in, so the shoulder curves into the arm instead of ending in a corner.
  const p=sleeve.geometry.attributes.position,c=Math.cos(sleeve.rotation.y),s=Math.sin(sleeve.rotation.y);
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z);if(y<top-depth||r<1e-6)continue;
    const outward=Math.max(0,side*(x*c+z*s)/r),d=outward*Math.min(1,(y-top+depth)/depth),k=1-pull*d*d;
    p.setXYZ(i,x*k,y-drop*d*d,z*k);
  }
  p.needsUpdate=true;sleeve.geometry.computeVertexNormals();
}
function makeReferenceTop(atlas, id=BRONZE_TOP_ID) {
  const lilac=id===LILAC_TOP_ID,hem=lilac?1.10:1.18;
  const top=new T.Group();top.name=id;
  const bodyMaterial=referenceMaterial(atlas,'body',lilac),binding=cloth(lilac?'#67516d':'#191817');
  const body=shell(top,[[1.91,.109,.099],[1.875,.17,.122],[1.83,.228,.152],[1.775,.265,.175],[1.65,.279,.183],[1.49,.272,.183],...(lilac?[[1.34,.275,.192],[1.25,.302,.224],[1.16,.319,.237],[hem,.325,.241]]:[[1.34,.268,.186],[1.25,.284,.204],[hem,.29,.212]])],bodyMaterial,'reference-top-body',64);
  // Project each half separately: one upright motif on front and one on back.
  const uv=body.geometry.attributes.uv,p=body.geometry.attributes.position;
  for(let i=0;i<uv.count;i++){
    const x=p.getX(i),z=p.getZ(i),y=p.getY(i);
    uv.setXY(i,Math.max(.003,Math.min(.997,.5+(z>=0?x:-x)/.56)),Math.max(0,Math.min(1,(y-hem)/(1.91-hem))));
  }
  uv.needsUpdate=true;
  if(lilac){
    const front=[],back=[],index=body.geometry.index;
    for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);(p.getZ(a)+p.getZ(b)+p.getZ(c)>=0?front:back).push(a,b,c);}
    body.geometry.setIndex([...front,...back]);body.geometry.clearGroups();body.geometry.addGroup(0,front.length,0);body.geometry.addGroup(front.length,back.length,1);
    body.material=[bodyMaterial,referenceMaterial(atlas,'back',true)];
    shell(top,[[1.968,.105,.10],[1.942,.107,.101],[1.90,.112,.104]],binding,'ribbed-mock-neck');
    for(let i=0;i<40;i++){const a=i/40*Math.PI*2;curve(top,[[Math.sin(a)*.108,1.91,Math.cos(a)*.104],[Math.sin(a)*.105,1.963,Math.cos(a)*.101]],.0018,binding,'collar-rib');}
  }
  ring(top,1.904,.112,.103,binding,'bound-crew-neck',.033);
  ring(top,hem+.008,lilac?.326:.292,lilac?.243:.214,binding,'fine-top-hem',.018);
  for(const side of [-1,1]){
    // Centre the fitted sleeve on the doll arm and retain elbow clearance.
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const mat=referenceMaterial(atlas,side<0?'left':'right',lilac);
    const sleeve=shell(arm,[[.025,.098,.10],[-.04,.112,.108],[-.16,.107,.101],[-.28,.104,.099],[-.40,.096,.091],[-.49,.078,.08],[-.525,.077,.079]],mat,'reference-fitted-sleeve',48);
    roundSleeveCap(sleeve,side,.025);
    const suv=sleeve.geometry.attributes.uv,sp=sleeve.geometry.attributes.position;
    for(let i=0;i<suv.count;i++)suv.setY(i,Math.max(0,Math.min(1,(sp.getY(i)+.525)/.55)));
    suv.needsUpdate=true;
    if(lilac){
      for(let i=0;i<sp.count;i++){const y=sp.getY(i);if(y<-.34&&y>-.51){const amount=1+.035*Math.sin((y+.51)/.17*Math.PI*6)*Math.sin((y+.51)/.17*Math.PI);sp.setX(i,sp.getX(i)*amount);sp.setZ(i,sp.getZ(i)*amount);}}
      sp.needsUpdate=true;sleeve.geometry.computeVertexNormals();
    }
    ring(arm,-.515,.079,.081,binding,'fine-sleeve-hem',.018);
    top.add(arm);
  }
  return top;
}
// Crochet flower sweater: motif artwork is drawn here from the reference reading, not copied from the product photos.
// Darker than the photographed yarn: the studio's exposure and tone mapping lift these values.
const YARN={cream:[214,200,170],navy:[18,26,82],wheel:[10,16,58],teal:[14,146,196],tealDark:[8,98,148],pale:[124,166,214]};
const MOTIFS=['ABCADBCAB','CACBCABDA','BDABCACBA','CBCADBCAB'];
let crochetPixels=null;
function crochetData(){
  if(crochetPixels)return crochetPixels;
  // Hexagonal lattice that repeats seamlessly: 9 motifs across, 4 offset rows.
  const cols=MOTIFS[0].length,step=128,rowStep=111,w=cols*step,h=4*rowStep,R=step/2,data=new Uint8Array(w*h*4),rand=random(91);
  const wrap=(d,size)=>d-size*Math.round(d/size);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let best=1e9,dx=0,dy=0,kind='C';
    for(let r=0;r<4;r++){const cy=r*rowStep+rowStep/2,off=(r%2)*step/2;
      for(let c=0;c<cols;c++){const ex=wrap(x-(c*step+step/2+off),w),ey=wrap(y-cy,h),d=ex*ex+ey*ey;if(d<best){best=d;dx=ex;dy=ey;kind=MOTIFS[r][c];}}}
    const n=Math.sqrt(best)/R,a=Math.atan2(dy,dx),petal=kind==='D'?.5:.64+.19*Math.sqrt(Math.abs(Math.cos(4*a)));
    const rounds=.5+.5*Math.cos(n*Math.PI*14),spokes=.5+.5*Math.cos(a*24);
    let colour=YARN.cream,open=false,shade=.86+.07*rounds+.07*spokes;
    if(n<petal){
      if(kind==='D')colour=Math.cos(a*12)>.8?YARN.wheel:YARN.navy;
      else if(kind==='A')colour=n<.4?(Math.cos(a*16)>.75?YARN.tealDark:YARN.teal):YARN.navy;
      else{colour=n<.15?YARN.navy:kind==='B'?YARN.pale:YARN.cream;open=n>.19&&n<.25&&Math.cos(8*a+Math.PI)>.6;
        // Cream petals read through their open outlines.
        if(kind==='C'){open||=n>petal-.045||(n>.3&&Math.abs(Math.cos(4*a))<.09);shade*=.97;}}
      shade*=.92+.08*Math.min(1,(petal-n)*12);
    }else if(n<.93)open=n>.8&&n<.9&&Math.cos(a*20)>.3;
    else open=n>1.0&&Math.sin(x*.42)*Math.sin(y*.42)>.25;
    const i=(y*w+x)*4,grain=(rand()-.5)*14;
    for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,colour[k]*shade+grain));
    data[i+3]=open?0:255;
  }
  crochetPixels={data,w,h};return crochetPixels;
}
function yarnTexture({data,w,h},repeatU,repeatV){
  const map=new T.DataTexture(data,w,h,T.RGBAFormat);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
  map.repeat.set(repeatU,repeatV);map.generateMipmaps=true;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.needsUpdate=true;return map;
}
function yarnMaterial(map){return new T.MeshPhysicalMaterial({map,roughness:.93,sheen:.25,sheenColor:new T.Color('#e8dcc0'),sheenRoughness:.9,alphaTest:.5,side:T.DoubleSide});}
function filetData(){
  // Ladder rows of the neckband: three rows of open squares between solid bars.
  const w=128,h=64,data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,row=(y>=8&&y<22)||(y>=28&&y<42)||(y>=48&&y<60),col=x%16;
    const shade=col<3||col>12?.88:1;for(let k=0;k<3;k++)data[i+k]=YARN.cream[k]*shade;data[i+3]=row&&col>=4&&col<=12?0:255;}
  return {data,w,h};
}
function scallop(mesh,bottom,band,depth,count){
  // Lower each scallop centre; the points between scallops stay at the hem line.
  const p=mesh.geometry.attributes.position,drop=a=>depth*Math.sin(Math.PI*(((a/(Math.PI*2)*count)%1+1)%1))**.7;
  for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>bottom+band)continue;p.setY(i,y-drop(Math.atan2(p.getX(i),p.getZ(i)))*(1-(y-bottom)/band));}
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();return drop;
}
function scallopTrim(group,y,rx,rz,drop,mat,name){
  const points=[];for(let k=0;k<=160;k++){const a=k/160*Math.PI*2;points.push([Math.sin(a)*rx,y-drop(a),Math.cos(a)*rz]);}
  return curve(group,points,.0055,mat,name);
}
function mapByHeight(mesh,low,high){const uv=mesh.geometry.attributes.uv,p=mesh.geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setY(i,Math.max(0,Math.min(1,(p.getY(i)-low)/(high-low))));uv.needsUpdate=true;}
function makeCrochetTop(id=CROCHET_TOP_ID){
  const top=new T.Group();top.name=id;
  // Cropped just above the skirt waistband so either bottom can be worn underneath.
  const pixels=crochetData(),edge=cloth('#d6c8a8'),hem=1.285,depth=.026;
  const body=shell(top,[[1.815,.235,.17],[1.775,.266,.183],[1.71,.284,.196],[1.55,.29,.205],[1.40,.29,.212],[1.32,.29,.22],[hem,.29,.226]],yarnMaterial(yarnTexture(pixels,1,.68)),'crochet-body',96);
  const drop=scallop(body,hem,.035,depth,12);mapByHeight(body,hem-depth,1.815);
  scallopTrim(top,hem,.291,.227,drop,edge,'scalloped-hem-trim');
  shell(top,[[1.878,.158,.134],[1.848,.198,.152],[1.815,.235,.17]],yarnMaterial(yarnTexture(filetData(),7,1)),'filet-neckband',96);
  ring(top,1.878,.159,.135,edge,'crochet-neck-edge',.008);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    // Five motifs around the sleeve; the repeat's seam is turned to the inner back of the arm.
    const sleeve=shell(arm,[[.03,.108,.108],[-.04,.122,.116],[-.16,.12,.114],[-.28,.122,.116],[-.40,.125,.119],[-.50,.131,.125],[-.60,.136,.13]],yarnMaterial(yarnTexture(pixels,5/9,.75)),'crochet-flared-sleeve',64);
    sleeve.rotation.y=-side*Math.PI*.6;
    roundSleeveCap(sleeve,side,.03);
    const cuff=scallop(sleeve,-.60,.03,.022,7);mapByHeight(sleeve,-.622,.03);
    scallopTrim(sleeve,-.60,.137,.131,cuff,edge,'scalloped-cuff-trim');
    top.add(arm);
  }
  return top;
}
// Brushed windowpane jumper: the knitted-in check is drawn here from the reference reading.
// Darker than the photographed wool: exposure, tone mapping and the brushed sheen lift these values.
const WOOL={cream:[214,202,180],haze:[198,190,176],blue:[168,182,192],brown:[100,62,44],salmon:[180,128,108],grey:[114,108,102]};
let plaidPixels=null;
function plaidData(){
  if(plaidPixels)return plaidPixels;
  // One repeat across (and down): hatched frame, cream square, pale-blue cross line, cream square,
  // hatched frame, then the pale-blue separator between neighbouring windows.
  const S=512,profile=[['hatch',.16],['cream',.3],['line',.035],['cream',.3],['hatch',.16],['gap',.045]];
  const kind=new Array(S);{let i=0;for(const [k,w] of profile){const end=Math.round((i/S+w)*S);for(;i<end&&i<S;i++)kind[i]=k;}for(;i<S;i++)kind[i]='gap';}
  const strokes=[WOOL.brown,WOOL.grey,WOOL.salmon,WOOL.brown,WOOL.grey],data=new Uint8Array(S*S*4),rand=random(57);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const kx=kind[x],ky=kind[y];let colour=WOOL.cream;
    // The pale-blue lines are broken where the knit carries the other yarn.
    const vLine=(kx==='line'||kx==='gap')&&y%12<10,hLine=(ky==='line'||ky==='gap')&&x%12<10;
    if(vLine||hLine)colour=WOOL.blue;
    else if(kx==='hatch'||ky==='hatch'){
      // Chunky jacquard stitches on a 9 x 7 px grid. Each diagonal stroke takes the next yarn in turn:
      // mostly brown and grey, with an occasional salmon stroke.
      const sx=Math.floor(x/9),sy=Math.floor(y/7),d=sx-sy+1024;
      colour=(d%4)<3?strokes[Math.floor(d/4)%5]:WOOL.haze;
    }
    const i=(y*S+x)*4,grain=(rand()-.5)*20;
    for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,colour[k]+grain));data[i+3]=255;
  }
  // Brushed halo: soften every stitch into its neighbours (3 x 3 box blur, wrapping at the edges).
  const src=data.slice();
  for(let y=0;y<S;y++)for(let x=0;x<S;x++)for(let k=0;k<3;k++){let sum=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)sum+=src[(((y+dy+S)%S)*S+((x+dx+S)%S))*4+k];data[(y*S+x)*4+k]=sum/9;}
  plaidPixels={data,w:S,h:S};return plaidPixels;
}
function woolMaterial(map){
  const stitch=weave('knit');stitch.repeat.set(26,18);
  return new T.MeshPhysicalMaterial({map,roughness:.97,sheen:.3,sheenColor:new T.Color('#c9b89c'),sheenRoughness:.95,bumpMap:stitch,bumpScale:.018,side:T.DoubleSide});
}
function ribbed(mesh,count,depth){
  const p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),k=1+depth*Math.cos(Math.atan2(x,z)*count);p.setX(i,x*k);p.setZ(i,z*k);}
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();return mesh;
}
function makePlaidJumper(id=PLAID_JUMPER_ID,overSkirt=false){
  const top=new T.Group();top.name=id;
  // Oversized means boxy here: the body falls straight from dropped shoulders to a ribbed hip band.
  // The band hugs the jeans, or sits out over the skirt's fullness when one is worn.
  const pixels=plaidData(),rib=woolMaterial(null),hem=1.14,band=.075,flare=overSkirt?[.338,.252]:[.312,.233];rib.color.set('#cbb894');
  const body=shell(top,[[1.885,.114,.108],[1.85,.2,.15],[1.81,.27,.19],[1.76,.305,.21],[1.6,.314,.217],[1.4,.316,.224],[hem+band+.012,overSkirt?.336:.318,overSkirt?.25:.232],[hem+band,flare[0],flare[1]]],woolMaterial(yarnTexture(pixels,6,2)),'plaid-jumper-body',96);
  // Her torso is much wider than tall, so three windows across the front (not the photo's two) keeps them square
  // and gives the photo's two rows. The middle window is centred on the front.
  body.material.map.offset.set(.5,0);mapByHeight(body,hem+band,1.885);
  ribbed(shell(top,[[hem+band+.01,flare[0],flare[1]],[hem+band/2,flare[0]-.002,flare[1]-.001],[hem,flare[0]-.004,flare[1]-.002]],rib,'ribbed-hem-band',128),64,.012);
  ribbed(shell(top,[[1.93,.112,.106],[1.905,.115,.108],[1.88,.121,.113]],rib,'ribbed-crew-neck',96),48,.02);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    // Straight, roomy sleeves that soften into the cuff instead of ballooning.
    const sleeve=shell(arm,[[.03,.125,.12],[-.06,.135,.13],[-.2,.137,.132],[-.33,.135,.13],[-.42,.128,.124],[-.47,.11,.106],[-.495,.098,.095]],woolMaterial(yarnTexture(pixels,2,1.8)),'knit-jumper-sleeve',64);
    roundSleeveCap(sleeve,side,.03);mapByHeight(sleeve,-.495,.03);
    ribbed(shell(arm,[[-.485,.096,.093],[-.52,.089,.087],[-.56,.088,.086]],rib,'ribbed-cuff',64),32,.03);
    top.add(arm);
  }
  return top;
}
// Acid-wash barrel jeans: the marbled wash is drawn here; construction is read from the product photos.
let washPixels=null;
function acidWashData(){
  if(washPixels)return washPixels;
  // Tileable value noise: a crinkled, marbled wash with light veins over mid-dark grey-blue denim.
  const S=256,data=new Uint8Array(S*S*4),rand=random(83);
  const lattice=n=>{const g=Array.from({length:n*n},()=>rand());return (x,y)=>{
    const fx=x/S*n,fy=y/S*n,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
    const at=(i,j)=>g[((j%n+n)%n)*n+((i%n+n)%n)];
    return (at(x0,y0)*(1-sx)+at(x0+1,y0)*sx)*(1-sy)+(at(x0,y0+1)*(1-sx)+at(x0+1,y0+1)*sx)*sy;};};
  const octaves=[[lattice(4),.5],[lattice(8),.3],[lattice(16),.2]],veins=[[lattice(16),.55],[lattice(32),.3],[lattice(64),.15]];
  const dark=[26,36,50],light=[100,116,128];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    let n=0,v=0;for(const [f,w] of octaves)n+=f(x,y)*w;for(const [f,w] of veins)v+=f(x,y)*w;
    // Thin light veins (ridges of the noise) crinkle over a mostly dark ground, with a soft mottled shift.
    const ridge=Math.pow(1-Math.abs(2*v-1),20),twill=((x+y)%4===0)?.92:1;
    const t=Math.min(1,.1+.18*n+.5*ridge),i=(y*S+x)*4;
    for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,(dark[k]+(light[k]-dark[k])*t)*twill));data[i+3]=255;
  }
  washPixels={data,w:S,h:S};return washPixels;
}
function subdivided(shape,levels=3,back=false){
  // Split each triangle of a flat shape into four, repeatedly, so a patch can follow a curved surface.
  let tri=[];const g=new T.ShapeGeometry(shape).toNonIndexed(),p=g.attributes.position;g.dispose();
  for(let i=0;i<p.count;i+=3)tri.push([[p.getX(i),p.getY(i)],[p.getX(i+1),p.getY(i+1)],[p.getX(i+2),p.getY(i+2)]]);
  const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  for(let l=0;l<levels;l++)tri=tri.flatMap(([a,b,c])=>{const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);return [[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]];});
  // A patch on the back faces away from the body: reverse the winding so its normals point outward.
  if(back)tri=tri.map(([a,b,c])=>[a,c,b]);
  const pts=tri.flat(),geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(pts.flatMap(([x,y])=>[x,y,0]),3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(pts.flatMap(([x,y])=>[x*1.6,y*1.6]),2));return geo;
}
function makeBarrelJeans(id=BARREL_JEANS_ID){
  const jeans=new T.Group();jeans.name='trousers';jeans.userData.garmentId=id;
  // The wash keeps one physical scale: the hips (short, wide) repeat it differently from the legs.
  const wash=(u=3,v=5)=>{const map=yarnTexture(acidWashData(),u,v),twill=weave('denim');twill.repeat.set(14,14);
    return new T.MeshPhysicalMaterial({map,roughness:.9,sheen:.15,sheenColor:new T.Color('#8fa0ad'),bumpMap:twill,bumpScale:.006,side:T.DoubleSide});};
  const denim=wash(),hipDenim=wash(5,1.4),thread=solid('#b88a55',.8),fold=solid('#26303d',.9),metal=new T.MeshStandardMaterial({color:'#c9ccd0',metalness:.85,roughness:.3});
  // Low rise: the waistband sits on the hips, lower than the built-in jeans.
  const hips=[[1.205,.256,.173],[1.12,.276,.193],[1.04,.284,.2],[.97,.262,.19]];
  // Barrel: the leg curves out to its widest at the knee, then tapers back toward the hem.
  const legRows=s=>[[1.03,.145,.19,s*.13],[.95,.148,.19,s*.152],[.8,.165,.198,s*.175],[.62,.178,.2,s*.19],[.44,.165,.188,s*.182],[.3,.142,.168,s*.168],[.2,.134,.16,s*.162]];
  const lerpRows=(rows,y)=>{for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1];if(y<=a[0]&&y>=b[0]){const t=(a[0]-y)/(a[0]-b[0]);return a.map((v,k)=>v+(b[k]-v)*t);}}return y>rows[0][0]?rows[0]:rows[rows.length-1];};
  const body=[shell(jeans,hips,hipDenim,'jeans-hips',64)];
  mapByHeight(body[0],.97,1.205);
  ring(jeans,1.18,.258,.175,denim,'jeans-waistband',.05);
  for(const y of [1.157,1.203]){const pts=[];for(let k=0;k<=64;k++){const a=k/64*Math.PI*2;pts.push([Math.sin(a)*.26,y,Math.cos(a)*.177]);}curve(jeans,pts,.0018,thread,'waistband-stitch');}
  for(const a of [-2.7,-1.45,-.55,.55,1.45,2.7,Math.PI]){
    const loop=put(jeans,new T.BoxGeometry(.016,.056,.007),denim,'belt-loop');loop.position.set(Math.sin(a)*.262,1.18,Math.cos(a)*.18);loop.rotation.y=a;}
  oval(jeans,[0,1.18,.178],[.015,.015,.005],metal,'shank-button',16);
  for(const side of [-1,1]){
    const leg=shell(jeans,legRows(side),denim,'barrel-leg',64);body.push(leg);
    // A forward break at the hem: slightly shorter in front, longer at the back, clear of the loafers.
    const p=leg.geometry.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>.26)continue;const t=Math.min(1,(.26-y)/.06),dz=p.getZ(i)/.17;p.setY(i,y+t*(dz>0?.01*dz:.035*dz));}
    p.needsUpdate=true;leg.geometry.computeVertexNormals();
  }
  // Depth of the actual jeans surface at (x, y), front or back: measured on the built shells, so details sit on it.
  const caster=new T.Raycaster(),hit=new T.Vector3();
  const depth=(x,y,back=false)=>{caster.set(hit.set(x,y,back?-1:1),new T.Vector3(0,0,back?1:-1));const h=caster.intersectObjects(body,false)[0];return h?Math.abs(h.point.z):0;};
  const on=(pts,back=false,off=.004)=>pts.map(([x,y])=>[x,y,(back?-1:1)*(depth(x,y,back)+off)]);
  curve(jeans,on([[.032,1.152],[.034,1.08],[.02,1.045],[0,1.035]]),.0018,thread,'fly-stitch');
  for(const side of [-1,1]){
    curve(jeans,on([[side*.165,1.152],[side*.215,1.1],[side*.262,1.06]]),.0018,thread,'slant-pocket-stitch');
    // Side seam: starts at the outer hip and twists toward the front on its way to the hem.
    const seam=[[side*.278,1.12,0],[side*.284,1.04,0]];
    for(let k=0;k<=8;k++){const y=.97-k*(.97-.22)/8,[,rx,rz,cx]=lerpRows(legRows(side),y),a=side*(Math.PI/2-(Math.PI/4)*(k/8));seam.push([cx+Math.sin(a)*rx*1.02,y,Math.cos(a)*rz*1.02]);}
    curve(jeans,seam,.0022,thread,'twisted-side-seam');
    // Horizontal knee darts across the front of each leg.
    const dart=[];for(let k=0;k<=6;k++){const a=-side*.55+side*.65*k/6,[,rx,rz,cx]=lerpRows(legRows(side),.64);dart.push([cx+Math.sin(a)*rx*1.012,.64+.006*Math.sin(Math.PI*k/6),Math.cos(a)*rz*1.012]);}
    curve(jeans,dart,.0026,fold,'knee-dart');
    // Back: yoke, patch pocket with a pointed buttoned flap.
    curve(jeans,on([[side*.275,1.13],[side*.14,1.1],[side*.005,1.075]],true),.0018,thread,'back-yoke');
    const px=side*.13,pocket=[[px-.067,1.06],[px+.067,1.06],[px+.064,.92],[px,.885],[px-.064,.92]];
    const shape=new T.Shape();pocket.forEach(([x,y],k)=>k?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    const patch=put(jeans,subdivided(shape,3,true),denim,'back-patch-pocket');const pp=patch.geometry.attributes.position;
    for(let i=0;i<pp.count;i++)pp.setZ(i,-(depth(pp.getX(i),pp.getY(i),true)+.004));pp.needsUpdate=true;patch.geometry.computeVertexNormals();
    curve(jeans,on([...pocket.slice(1),pocket[0]].map(([x,y])=>[x-(x-px)*.08,y+(y<1?.006:0)]),true,.006),.0016,thread,'pocket-stitch');
    const flap=[[px-.07,1.085],[px+.07,1.085],[px+.068,1.048],[px,1.03],[px-.068,1.048]];
    const fshape=new T.Shape();flap.forEach(([x,y],k)=>k?fshape.lineTo(x,y):fshape.moveTo(x,y));fshape.closePath();
    const flapMesh=put(jeans,subdivided(fshape,3,true),denim,'pocket-flap');const fp=flapMesh.geometry.attributes.position;
    for(let i=0;i<fp.count;i++)fp.setZ(i,-(depth(fp.getX(i),fp.getY(i),true)+.009));fp.needsUpdate=true;flapMesh.geometry.computeVertexNormals();
    curve(jeans,on([[px-.063,1.079],[px+.063,1.079],[px+.061,1.051],[px,1.037],[px-.061,1.051],[px-.063,1.079]],true,.011),.0014,thread,'flap-stitch');
    oval(jeans,[px,1.042,-(depth(px,1.042,true)+.012)],[.007,.007,.003],metal,'flap-button',12);
  }
  curve(jeans,on([[-.17,1.105],[-.08,1.105]],true,.005),.002,fold,'welt-pocket');
  const leather=put(jeans,new T.BoxGeometry(.06,.038,.004),solid('#9c6b42',.95),'suede-patch');leather.position.set(.07,1.18,-(.177+.004));
  return jeans;
}
export function makeOutfit(raw, atlas=null) {
  const state=cleanRecipe(raw),root=new T.Group();root.name='wardrobe';
  const shirt=cloth('#e6e6de'),stripe=solid('#829bb9'),denim=cloth(state.trousers,'denim'),knit=cloth(state.sweater,'knit'),stitch=solid('#ae8c62');
  const trousers=state.bottomId===BARREL_JEANS_ID?makeBarrelJeans():new T.Group();trousers.name='trousers';root.add(trousers);
  if(state.bottomId==='classic'){
  // One pelvis shell overlaps leg roots; both are separate from the doll.
  shell(trousers,[[1.23,.252,.177],[1.15,.272,.194],[1.05,.267,.19],[.96,.235,.176]],denim,'jeans-hips');
  ring(trousers,1.22,.254,.181,denim,'jeans-waistband',.065);
  for(const side of [-1,1]){
    const width=.112+state.barrel*.038;
    shell(trousers,[[1.04,.139,.18,side*.133],[.96,width*.99,.181,side*.148],[.82,width*1.08,.17,side*.162],[.62,width*1.06,.158,side*.165],[.43,width*.85,.13,side*.172],[.29,.111,.11,side*.16]],denim,'barrel-leg');
    ring(trousers,.3,.113,.113,denim,'jean-cuff',.065,side*.16);
    curve(trousers,[[side*.24,1.16,.135],[side*.3,.97,.105],[side*(.162+width*.95),.8,.07],[side*(.165+width*.92),.62,.064],[side*.27,.32,.06]],.0025,stitch,'jean-side-seam');
    curve(trousers,[[side*.075,1.18,.176],[side*.13,1.08,.17],[side*.23,1.06,.13]],.0025,stitch,'jean-pocket-seam');
  }
  oval(trousers,[0,1.205,.187],[.019,.019,.01],solid('#bca16a'),'waist-button');
  }
  if(state.topId===CROCHET_TOP_ID)root.add(makeCrochetTop());
  else if(state.topId===PLAID_JUMPER_ID)root.add(makePlaidJumper(PLAID_JUMPER_ID,state.skirt));
  else if(state.topId!== 'classic')root.add(makeReferenceTop(atlas?.isTexture?atlas:atlas?.[state.topId],state.topId));
  if(state.shirt){
    const layer=new T.Group();layer.name='shirt';root.add(layer);
    shell(layer,[[1.8,.22,.145],[1.69,.267,.174],[1.43,.284,.185],[1.19,.288,.198],[1.145,.265,.19]],shirt,'shirt-body');
    for(let i=-6;i<=6;i++) {const x=i*.037;if(Math.abs(x)>.26)continue;const z=.201*Math.sqrt(1-(x/.30)**2);curve(layer,[[x,1.17,z],[x,1.4,z-.01],[x*.89,1.68,z-.02]],.008,stripe,'shirt-stripe');}
    for(const side of [-1,1]){
      const shape=new T.Shape();shape.moveTo(side*.035,1.85);shape.lineTo(side*.13,1.91);shape.lineTo(side*.237,1.8);shape.lineTo(side*.136,1.69);shape.closePath();const collar=put(layer,new T.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.006,bevelThickness:.005}),shirt,'shirt-collar');collar.position.z=.16;
    }
    for(let y=1.19;y<(state.knit?1.38-state.hem*.19-.025:1.76);y+=.095)oval(layer,[.007,y,.207],[.011,.011,.006],solid('#e0d5bd'),'shirt-button',12);
  }
  if(state.knit){
    const sweater=new T.Group();sweater.name='sweater';root.add(sweater);
    const hem=1.38-state.hem*.19;
    shell(sweater,[[1.88,.108,.104],[1.83,.22,.158],[1.77,.288,.19],[1.62,.298,.205],[hem+.065,.301,.213],[hem,.284,.204]],knit,'knit-body');
    ring(sweater,1.875,.109,.105,knit,'knit-neck',.045);ring(sweater,hem+.022,.288,.209,knit,'ribbed-hem',.065);
    for(const side of [-1,1])sleeve(sweater,side,state.sleeve,knit);
    const ribs=new T.Group();ribs.name='hem-ribs';sweater.add(ribs);
    for(let i=0;i<52;i++){const a=i/52*Math.PI*2;curve(ribs,[[Math.sin(a)*.29,hem-.004,Math.cos(a)*.212],[Math.sin(a)*.291,hem+.051,Math.cos(a)*.213]],.0027,knit,'rib');}
  }
  if(state.skirt){
    const skirt=new T.Group();skirt.name='layered-skirt';root.add(skirt);
    const satin=cloth(state.skirtColour);satin.roughness=.7;satin.sheenRoughness=.6;
    const panel=shell(skirt,[[1.24,.292,.219],[1.17,.317,.23],[1.02,.356,.253],[.85,.39,.273],[.79,.395,.277]],satin,'pleated-skirt',96);
    const positions=panel.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
      const a=Math.atan2(x/.395,z/.277),fall=Math.max(0,Math.min(1,(1.24-y)/.45));
      const fold=1+Math.sin(a*14)*.028*fall;
      positions.setXYZ(i,x*fold,y+Math.sin(a*3)*.009*fall,z*fold);
    }
    positions.needsUpdate=true;panel.geometry.computeVertexNormals();
    ring(skirt,1.238,.294,.221,satin,'skirt-waistband',.04);
    // A top that covers the waistband hides the bow, which would otherwise poke through its hem.
    if(!GARMENTS[state.topId]?.layering?.coversWaistband){
    const ribbon=cloth(state.skirtColour);
    for(const side of [-1,1]){
      const loop=oval(skirt,[.22+side*.042,1.208,.193],[.052,.026,.019],ribbon,'ribbon-loop');loop.rotation.z=side*.35;
      curve(skirt,[[.22,1.20,.206],[.22+side*.029,1.14,.226],[.22+side*.045,1.095,.239]],.009,ribbon,'ribbon-tail');
    }
    oval(skirt,[.22,1.208,.219],[.019,.021,.013],ribbon,'ribbon-knot');
    }
  }
  // Materials that were not used in the selected layers are not retained.
  const used=new Set();root.traverse(o=>{if(o.material)used.add(o.material);});
  for(const mat of [shirt,stripe,denim,knit,stitch])if(!used.has(mat)){mat.bumpMap?.dispose();mat.dispose();}
  root.scale.set(BODY_WIDTH,BODY_HEIGHT,1);
  return root;
}
export function disposeObject(root) { const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});for(const m of materials)for(const value of Object.values(m))if(value?.isTexture)textures.add(value);geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose()); }

