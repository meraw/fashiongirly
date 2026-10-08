import * as T from 'three';
import { cleanRecipe } from './recipe.js';
import { BRONZE_TOP_ID, LILAC_TOP_ID, CROCHET_TOP_ID, PLAID_JUMPER_ID, STRIPE_JUMPER_ID, GARMENTS } from '../wardrobe/catalog.js';
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
function ringShell(group,rings,mat,name){
  // Like shell(), but each ring is an explicit list of points (closed: last point repeats the first).
  const positions=[],uv=[],indices=[],n=rings[0].length;
  rings.forEach((r,j)=>r.forEach(([x,y,z],i)=>{positions.push(x,y,z);uv.push(i/(n-1),j/(rings.length-1));}));
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i,b=a+n;indices.push(a,b,a+1,a+1,b,b+1);}
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
  const body=shell(top,[[1.91,.109,.099],[1.875,.17,.122],[1.83,.228,.152],[1.775,.265,.175],[1.65,.279,.183],[1.49,.277,.187],...(lilac?[[1.34,.284,.197],[1.25,.302,.224],[1.16,.319,.237],[hem,.325,.241]]:[[1.34,.284,.196],[1.25,.29,.206],[hem,.292,.213]])],bodyMaterial,'reference-top-body',64);
  // The waist eases out a little (1.49 to 1.25) so the tops sit over high-rise waistbands as well as low ones.
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
// Asymmetric stripe jumper: ecru slub knit with dark green stripes, worn off her left shoulder.
// Darker than the photographed yarn: exposure, tone mapping and sheen lift these values.
const SLUB={ecru:[212,204,170],green:[28,37,22]};
const STRIPE_PITCH=.08;
let stripePixels=null;
function stripeKnitData(){
  if(stripePixels)return stripePixels;
  // Four stripe repeats across and one down. A green stripe fills a third of each repeat, as in the photos.
  const w=256,h=64,data=new Uint8Array(w*h*4),rand=random(64);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const colour=y<h/3?SLUB.green:SLUB.ecru,i=(y*w+x)*4;
    for(let k=0;k<3;k++)data[i+k]=colour[k];data[i+3]=255;
  }
  // Slubs: short thick lengths of yarn, a little lighter or darker than their row.
  for(let n=0;n<420;n++){
    const y=Math.floor(rand()*h),x0=Math.floor(rand()*w),len=4+Math.floor(rand()*14),lift=(rand()-.45)*.16;
    for(let d=0;d<len;d++){const i=(y*w+(x0+d)%w)*4;for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,data[i+k]*(1+lift)));}
  }
  for(let i=0;i<data.length;i+=4){const grain=(rand()-.5)*10;for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,data[i+k]+grain));}
  stripePixels={data,w,h};return stripePixels;
}
// The neckline in body coordinates: high at the base of her neck on her right, sloping across the chest and
// off her left shoulder onto the upper arm. The back edge runs a little higher than the front.
function stripeNeckline(x,z){const front=1.80-.4*x,back=1.85-.3*x,f=.5+.5*z/Math.max(1e-6,Math.hypot(x,z));return back+(front-back)*f;}
function trimToEdge(mesh,segments,toBody,edge){
  // Cut each column of a shell() grid where it crosses the edge, then spread the column's rows evenly below the cut,
  // so the cut is clean and nothing folds back inside.
  const p=mesh.geometry.attributes.position,rows=p.count/(segments+1),v=new T.Vector3();
  const height=i=>{v.fromBufferAttribute(p,i);toBody(v);return edge(v.x,v.z)-v.y;};
  for(let i=0;i<=segments;i++){
    const col=Array.from({length:rows},(_,j)=>(rows-1-j)*(segments+1)+i);
    let k=col.findIndex(index=>height(index)<0);if(k<0)continue;if(k===0)k=1;
    const pts=col.slice(0,k).map(index=>new T.Vector3().fromBufferAttribute(p,index)),a=height(col[k-1]),b=height(col[k]);
    pts.push(new T.Vector3().fromBufferAttribute(p,col[k-1]).lerp(new T.Vector3().fromBufferAttribute(p,col[k]),a/(a-b)));
    const lengths=[0];for(let n=1;n<pts.length;n++)lengths.push(lengths[n-1]+pts[n].distanceTo(pts[n-1]));
    const total=lengths.at(-1);
    col.forEach((index,j)=>{const target=total*j/(rows-1);let n=1;while(n<pts.length-1&&lengths[n]<target)n++;
      const t=(target-lengths[n-1])/Math.max(1e-9,lengths[n]-lengths[n-1]);v.copy(pts[n-1]).lerp(pts[n],Math.min(1,t));p.setXYZ(index,v.x,v.y,v.z);});
  }
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();
}
// Her left arm, from makeDoll(): an oval .09 wide and .25 tall centred at (.307, 1.51), tilted out by .22.
// Returns how far a horizontal ray from her centre line, at height y and angle a, travels before leaving the arm (0 if it misses).
function leftArmExit(y,a){
  const c=Math.cos(.22),s=Math.sin(.22),dx=Math.sin(a),dz=Math.cos(a),px=-.307,py=y-1.51;
  // Into the arm's own frame: x' = x cos + y sin, y' = -x sin + y cos.
  const ox=px*c+py*s,oy=-px*s+py*c,vx=dx*c,vy=-dx*s;
  const A=(vx/.09)**2+(vy/.25)**2+(dz/.09)**2,B=2*(ox*vx/.0081+oy*vy/.0625),C=(ox/.09)**2+(oy/.25)**2-1,D=B*B-4*A*C;
  return D<0?0:Math.max(0,(-B+Math.sqrt(D))/(2*A));
}
const SHOULDER_ROWS=[[1.885,.06,.05],[1.86,.13,.09],[1.82,.2,.122],[1.77,.24,.14],[1.70,.262,.152],[1.62,.27,.158]];
function shoulderRadius(y,a){
  // Radius of the skin piece (SHOULDER_ROWS) at height y in direction a.
  const rows=SHOULDER_ROWS;let k=0;while(k<rows.length-2&&rows[k+1][0]>y)k++;
  const t=Math.max(0,Math.min(1,(rows[k][0]-y)/(rows[k][0]-rows[k+1][0]))),rx=rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rz=rows[k][2]+(rows[k+1][2]-rows[k][2])*t;
  return 1/Math.hypot(Math.sin(a)/rx,Math.cos(a)/rz);
}
function makeStripeJumper(id=STRIPE_JUMPER_ID,overSkirt=false){
  const top=new T.Group();top.name=id;
  const rib=woolMaterial(null),hem=1.16,band=.12,flare=overSkirt?[.338,.252]:[.305,.226],skin=cloth('#dfb195');rib.color.set('#d4cbb6');
  // Her body under clothes is cream felt; this skin piece is what shows above the neckline.
  shell(top,SHOULDER_ROWS,skin,'bare-shoulder-skin',48);
  const knit=()=>{const m=woolMaterial(yarnTexture(stripeKnitData(),1,1));m.bumpMap.repeat.set(5,1.6);m.bumpScale=.012;return m;};
  const body=shell(top,[[1.89,.114,.108],[1.85,.2,.15],[1.81,.27,.19],[1.76,.3,.208],[1.6,.306,.214],[1.4,.31,.222],[hem+band+.012,overSkirt?.336:.312,overSkirt?.25:.228],[hem+band,flare[0],flare[1]]],knit(),'stripe-jumper-body',96);
  // One neckline, cut from the body alone. Near it the knit settles onto her shoulders, and on her left the body wraps over
  // the top of her arm (a dropped shoulder slipping down), so the edge simply runs lower on that side and the sleeve starts
  // below it.
  const bp=body.geometry.attributes.position;
  for(let n=0;n<bp.count;n++){
    const x=bp.getX(n),y=bp.getY(n),z=bp.getZ(n),r=Math.hypot(x,z);if(r<1e-6)continue;
    const a=Math.atan2(x,z),below=stripeNeckline(x,z)-y,under=Math.max(shoulderRadius(y,a),leftArmExit(y,a))+.014;
    const settle=Math.max(0,Math.min(1,(.16-below)/.08)),wrap=Math.max(0,Math.min(1,(.24-below)/.06));
    let target=r+(Math.min(r,under)-r)*settle;if(x>0)target=Math.max(target,r+(Math.max(r,leftArmExit(y,a)+.014)-r)*wrap);
    bp.setX(n,x*target/r);bp.setZ(n,z*target/r);
  }
  bp.needsUpdate=true;
  trimToEdge(body,96,v=>v,stripeNeckline);
  // Stripes follow the neckline's slant near the top and level out by mid-chest.
  const centre=stripeNeckline(0,1),uv=body.geometry.attributes.uv;
  for(let n=0;n<uv.count;n++){const x=bp.getX(n),y=bp.getY(n),z=bp.getZ(n),w=Math.max(0,Math.min(1,(y-1.42)/(centre-1.42)));
    uv.setXY(n,uv.getX(n)*5,(centre-y+w*(stripeNeckline(x,z)-centre))/STRIPE_PITCH+.5);}
  uv.needsUpdate=true;
  // A narrow plain edge finishes the neckline all the way round.
  curve(top,Array.from({length:97},(_,n)=>[bp.getX(n)*1.012,bp.getY(n)+.003,bp.getZ(n)*1.012]),.0075,rib,'neckline-edge');
  // The band tucks just inside the body's lower edge, so the body blouses over it.
  ribbed(shell(top,[[hem+band+.012,flare[0]-.008,flare[1]-.006],[hem+band/2,flare[0]-.004,flare[1]-.003],[hem,flare[0]-.006,flare[1]-.004]],rib,'ribbed-hem-band',128),72,.012);
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;arm.updateMatrix();
    // Long straight sleeves into deep ribbed cuffs.
    const sleeve=shell(arm,[[.03,.124,.12],[-.06,.132,.127],[-.2,.133,.128],[-.33,.13,.126],[-.42,.122,.118],[-.455,.108,.104]],knit(),'knit-jumper-sleeve',64);
    roundSleeveCap(sleeve,side,.03);
    if(side>0){
      // On her left the sleeve starts under the body's wrapped shoulder: it is cut below the neckline and its top is
      // gathered onto the arm, then it widens to the same straight sleeve as on her right.
      trimToEdge(sleeve,64,v=>v.applyMatrix4(arm.matrix),(x,z)=>stripeNeckline(x,z)-.07);
      const q=sleeve.geometry.attributes.position,armRadius=y=>.09*Math.sqrt(Math.max(0,1-((y+.314)/.25)**2));
      for(let j=0;j<12;j++)for(let i=0;i<=64;i++){const n=j*65+i,r=Math.hypot(q.getX(n),q.getZ(n)),t=j/12,k=1+(Math.min(1,Math.max(.05,armRadius(q.getY(n))+.006)/r)-1)*(1-t*t*(3-2*t));q.setX(n,q.getX(n)*k);q.setZ(n,q.getZ(n)*k);}
      q.needsUpdate=true;sleeve.geometry.computeVertexNormals();
    }
    const suv=sleeve.geometry.attributes.uv,sp=sleeve.geometry.attributes.position;
    for(let n=0;n<suv.count;n++)suv.setXY(n,suv.getX(n)*3,(centre-1.815-sp.getY(n))/STRIPE_PITCH+.5);
    suv.needsUpdate=true;
    ribbed(shell(arm,[[-.44,.1,.096],[-.5,.099,.096],[-.575,.099,.096]],rib,'ribbed-cuff',64),36,.03);
    top.add(arm);
  }
  return top;
}
// Acid-wash barrel jeans: construction is read from the product photos.
let washPixels=null;
function acidWashData(base=[48,61,70]){
  const key=base.join();if(washPixels?.[key])return washPixels[key];washPixels||={};
  // In the photos the wash reads as a nearly even slate grey-blue: only a very fine, faint grain and a twill line.
  // The base colour is calibrated so the rendered denim matches the photos' measured average.
  const S=256,data=new Uint8Array(S*S*4),rand=random(83);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    // Fine speckle like the yarn's own variation; no larger streaks or blotches.
    const grain=1+(rand()-.5)*.2,twill=((x+y)%4===0)?.94:1,i=(y*S+x)*4;
    for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,base[k]*grain*twill));data[i+3]=255;
  }
  washPixels[key]={data,w:S,h:S};return washPixels[key];
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
// One builder for every pair of catalog jeans. Each pair's catalog entry holds its `build` spec: cut (hip and leg rows),
// rise, hem, pockets, seams and details. Optional details are switched on by the presence of their spec field.
function makeJeans(id,spec,swatch=null){
  const jeans=new T.Group();jeans.name='trousers';jeans.userData.garmentId=id;
  // The denim is a swatch taken from the product photos (flat-lit, seamless). Repeats keep it at the photo's scale
  // relative to the leg. Without the swatch (tests, or a failed load) a flat calibrated colour stands in.
  // Only the hips and legs carry the per-vertex shading; small pieces (pockets, flaps, loops) use the plain denim.
  const wash=([u,v],faded=false)=>{let map;if(swatch){map=swatch.clone();map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(u,v);map.needsUpdate=true;}else map=yarnTexture(acidWashData(spec.fallback),u,v);
    const twill=weave('denim');twill.repeat.set(14,14);
    return new T.MeshPhysicalMaterial({map,roughness:.95,bumpMap:twill,bumpScale:.006,side:T.DoubleSide,vertexColors:faded});};
  const denim=wash(spec.tiles.small),legDenim=wash(spec.tiles.legs,true),hipDenim=wash(spec.tiles.hips,true),thread=solid(spec.thread,.85),fold=solid('#26303d',.9);
  const metal=new T.MeshStandardMaterial({color:spec.button.colour,metalness:.85,roughness:.3});
  const hips=spec.hips,legRows=s=>spec.legs.map(([y,rx,rz,cx])=>[y,rx,rz,s*cx]);
  const lerpRows=(rows,y)=>{for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1];if(y<=a[0]&&y>=b[0]){const t=(a[0]-y)/(a[0]-b[0]);return a.map((v,k)=>v+(b[k]-v)*t);}}return y>rows[0][0]?rows[0]:rows[rows.length-1];};
  let body;
  if(spec.crotch){
    // Built as the jeans are sewn: one hip surface whose outline changes from the rounded hips (above `top`) into the
    // outline of the two legs at the crotch, where each leg tube begins exactly on it. Nothing overlaps or crosses,
    // so there is no pouch, ledge or crease where hips meet legs.
    const {top,y:crotchY}=spec.crotch,N=129;
    const profile=new T.CatmullRomCurve3(hips.filter(r=>r[0]>crotchY).concat([[crotchY,...lerpRows(hips,crotchY).slice(1)]]).map(r=>V(r[1],r[0],r[2])),false,'centripetal');
    // Distance from the axis to the outer edge of the two legs along a direction (0 where the ray passes between them).
    const legReach=(y,dx,dz)=>Math.max(0,...[-1,1].map(side=>{const [,rx,rz,cx]=lerpRows(legRows(side),y),A=dx*dx/(rx*rx)+dz*dz/(rz*rz),B=-2*cx*dx/(rx*rx),C=cx*cx/(rx*rx)-1,disc=B*B-4*A*C;return disc<0?0:Math.max(0,(-B+Math.sqrt(disc))/(2*A));}));
    // Texture positions follow the hips' original rounded outline, so the denim folds in with the fabric at the
    // crotch instead of shearing where the outline pinches.
    const rings=[],restU=[];
    for(let j=0,count=40;j<=count;j++){const q=profile.getPoint(j/count),y=j===count?crotchY:q.y,t=Math.min(1,Math.max(0,(top-y)/(top-crotchY))),w=t*t*(3-2*t),ring=[];let d=0,prev=null;
      for(let i=0;i<N;i++){const a=Math.PI+i/(N-1)*Math.PI*2,dx=Math.sin(a),dz=Math.cos(a),hip=1/Math.sqrt(dx*dx/(q.x*q.x)+dz*dz/(q.z*q.z)),r=hip+(legReach(y,dx,dz)*.995-hip)*w;
        if(prev)d+=Math.hypot(dx*hip-prev[0],dz*hip-prev[1]);prev=[dx*hip,dz*hip];restU.push(d);ring.push([dx*r,y,dz*r]);}
      rings.push(ring);}
    body=[ringShell(jeans,rings,hipDenim,'jeans-hips')];body[0].userData.restU=restU;
  }else body=[shell(jeans,hips,hipDenim,'jeans-hips',64)];
  // Denim laid by real distance along each ring (u) and height (v), with one scale on hips and legs. On the hips, u
  // follows the original rounded outline so columns never slide sideways as the outline pinches into the crotch.
  const byDistance=mesh=>{const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,rings=p.count/(mesh.userData.ringSize);
    for(let j=0;j<rings;j++){let d=0;for(let i=0;i<mesh.userData.ringSize;i++){const k=j*mesh.userData.ringSize+i;if(i)d+=Math.hypot(p.getX(k)-p.getX(k-1),p.getZ(k)-p.getZ(k-1));uv.setXY(k,(mesh.userData.restU?.[k]??d)*spec.uvScale[0],p.getY(k)*spec.uvScale[1]);}}uv.needsUpdate=true;
    // On the hips, v runs by distance along the fabric up each column, starting from the legs' value at the crotch, so
    // the inward curve into the crotch is not stretched.
    if(mesh.userData.restU){const n=mesh.userData.ringSize;for(let i=0;i<n;i++){let v=p.getY((rings-1)*n+i)*spec.uvScale[1];uv.setY((rings-1)*n+i,v);
      for(let j=rings-2;j>=0;j--){const a=j*n+i,b=a+n;v+=Math.hypot(p.getX(a)-p.getX(b),p.getY(a)-p.getY(b),p.getZ(a)-p.getZ(b))*spec.uvScale[1];uv.setY(a,v);}}}
  };
  if(spec.crotch){body[0].userData.ringSize=129;byDistance(body[0]);}else mapByHeight(body[0],hips[hips.length-2][0],hips[0][0]);
  const wb=spec.waistband;
  ring(jeans,wb.y,wb.rx,wb.rz,denim,'jeans-waistband',wb.h);
  for(const y of [wb.y-wb.h*.46,wb.y+wb.h*.46]){const pts=[];for(let k=0;k<=64;k++){const a=k/64*Math.PI*2;pts.push([Math.sin(a)*(wb.rx+.002),y,Math.cos(a)*(wb.rz+.002)]);}curve(jeans,pts,.0017,thread,'waistband-stitch');}
  if(wb.frayed){
    // Raw top edge: short pale threads standing up from the waistband.
    const fray=solid(spec.frayColour||'#cdd7df',1),r=random(19);
    for(let k=0;k<70;k++){const a=k/70*Math.PI*2+r()*.05,h=.006+r()*.01,x=Math.sin(a)*(wb.rx+.001),z=Math.cos(a)*(wb.rz+.001);curve(jeans,[[x,wb.y+wb.h/2-.002,z],[x*1.004,wb.y+wb.h/2+h,z*1.004]],.0011,fray,'frayed-waistband');}
  }
  for(const a of spec.loops){
    const loop=put(jeans,new T.BoxGeometry(.016,.056,.007),denim,'belt-loop');loop.position.set(Math.sin(a)*(wb.rx+.004),wb.y,Math.cos(a)*(wb.rz+.005));loop.rotation.y=a;}
  oval(jeans,[0,wb.y,wb.rz+.003],[.015,.015,.005],metal,'shank-button',16);
  // Twisted legs (when the spec twists them): the outseam drifts toward the back on the way down, the inseam toward the front.
  const twist=y=>Math.min(1,Math.max(0,(.97-y)/.85))*(spec.twist||0),outAngle=(side,y)=>side*(Math.PI/2+twist(y)),inAngle=(side,y)=>-side*(Math.PI/2-twist(y));
  // Real denim reads through its shape: wear is paler on raised folds and darker in hollows, seams and the hem
  // are paler where the fabric rolls ("roping"), and faint whiskers fan out at the top of the thighs.
  const angleGap=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  const whiskers=(x,y,z)=>{if(z<=0||y<.82||y>1.06)return 0;let w=0;for(let k=0;k<4;k++){const line=1.0-.035*k-.3*Math.max(0,Math.abs(x)-.04),gap=Math.abs(y-line);if(gap<.007)w=Math.max(w,(1-gap/.007)*Math.max(0,1-Math.abs(x)/.27));}return w;};
  const hemY=spec.legs[spec.legs.length-1][0],[gLow,gRange]=spec.gradient;
  const shade=(mesh,wear,side=0)=>{const p=mesh.geometry.attributes.position,c=[];for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=mesh.userData.restY?.[i]??p.getY(i),z=p.getZ(i);let f=gLow+gRange*Math.min(1,Math.max(0,(y-.06)/1.14));
    f*=1+6*(wear?.[i]||0)+spec.whiskers*whiskers(x,y,z);
    if(spec.thighFade&&z>0)f*=1+spec.thighFade*Math.max(0,1-Math.abs(y-.78)/.3)*Math.min(1,z/.1);
    if(side){const cx=lerpRows(legRows(side),y)[3],a=Math.atan2(x-cx,z);f*=1+.13*Math.exp(-((angleGap(a,outAngle(side,y))/.1)**2))+.1*Math.exp(-((angleGap(a,inAngle(side,y))/.1)**2))+(y<hemY+.025?.1*(1-(y-hemY)/.025):0);}
    c.push(f,f,f);}mesh.geometry.setAttribute('color',new T.Float32BufferAttribute(c,3));return mesh;};
  shade(body[0]);
  const legs={},folds=spec.folds;
  for(const side of [-1,1]){
    let leg;
    if(spec.crotch){
      // Rings start on the inseam, so the texture's wrap falls on a real seam, and run the same way on both legs so
      // their surfaces face outward; rows smoothed as shell() does.
      const rows=[[spec.crotch.y,...lerpRows(legRows(side),spec.crotch.y).slice(1)],...legRows(side).filter(r=>r[0]<spec.crotch.y)];
      const prof=new T.CatmullRomCurve3(rows.map(r=>V(r[1],r[0],r[2])),false,'centripetal'),cen=new T.CatmullRomCurve3(rows.map(r=>V(r[3],r[0],0)),false,'centripetal'),count=(rows.length-1)*5,rings=[];
      for(let j=0;j<=count;j++){const q=prof.getPoint(j/count),c=cen.getPoint(j/count),ring=[];for(let i=0;i<=96;i++){const a=-side*Math.PI/2+i/96*Math.PI*2;ring.push([c.x+Math.sin(a)*q.x,q.y,Math.cos(a)*q.z]);}rings.push(ring);}
      leg=ringShell(jeans,rings,legDenim,spec.legName);
    }else leg=shell(jeans,legRows(side),legDenim,spec.legName,96);
    body.push(leg);legs[side]=leg;
    const p=leg.geometry.attributes.position,wear=new Float32Array(p.count),restY=new Float32Array(p.count),r2=random(side>0?7:11),ph=[r2()*6.28,r2()*6.28,r2()*6.28];
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i),cx=lerpRows(legRows(side),y)[3],dx=x-cx,r=Math.hypot(dx,z),a=Math.atan2(dx,z),low=Math.min(1,Math.max(0,(1-y)/.95));
      // Drape: soft vertical folds that drift around the leg with height (following the twist), deeper toward the hem.
      let d=(folds.base+folds.low*low*low)*(.6*Math.sin(5*a+ph[0]+side*2.2*y)+.4*Math.sin(9*a+ph[1]-side*1.4*y));
      // Stacking: rippled folds where a long hem rests on the shoe.
      if(folds.stack&&y<.32)d+=folds.stack*(1-y/.32)*Math.sin(y*70+2.5*Math.sin(2*a+ph[2]));
      // Where the legs join the hips the folds fade out, so each leg's top edge meets the hips exactly.
      if(spec.crotch){const f=Math.min(1,Math.max(0,(spec.crotch.y-y)/.08));d*=f*f*(3-2*f);}
      wear[i]=d;restY[i]=y;const k=(r+d)/r;p.setX(i,cx+dx*k);p.setZ(i,z*k);
    }
    // A floor-length hem rests on the loafer: over the shoe it rises to sit on the upper, elsewhere it reaches the floor.
    if(spec.hem==='rests-on-shoe')for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>.3)continue;
      const fx=(p.getX(i)-side*.16)/.15,fz=(p.getZ(i)-.09)/.225,inside=1-fx*fx-fz*fz;
      const floor=inside>0?.105+.098*Math.sqrt(inside)+.012:.06,t=Math.min(1,(.3-y)/(.3-.06));p.setY(i,Math.max(y,y+(floor-.06)*t));}
    p.needsUpdate=true;leg.geometry.computeVertexNormals();leg.userData.restY=restY;shade(leg,wear,side);
    if(spec.crotch){leg.userData.ringSize=97;byDistance(leg);}
  }
  if(spec.crotch){
    // Shade across the join: the hips' bottom edge takes the surface direction of the leg it meets, so the lighting
    // flows from hips into legs instead of breaking along a line.
    const hp=body[0].geometry.attributes.position,hn=body[0].geometry.attributes.normal,start=hp.count-129,v=new T.Vector3();
    for(let i=start;i<hp.count;i++){v.fromBufferAttribute(hp,i);let best=null,bd=Infinity;
      for(const side of [-1,1]){const lp=legs[side].geometry.attributes.position;for(let k=0;k<97;k++){const d=(lp.getX(k)-v.x)**2+(lp.getZ(k)-v.z)**2;if(d<bd){bd=d;best=[side,k];}}}
      const ln=legs[best[0]].geometry.attributes.normal;hn.setXYZ(i,ln.getX(best[1]),ln.getY(best[1]),ln.getZ(best[1]));}
    hn.needsUpdate=true;
  }
  // Depth of the actual jeans surface at (x, y), front or back: measured on the built shells, so details sit on it.
  const caster=new T.Raycaster(),hit=new T.Vector3();
  // Cached: patches repeat the same corners many times, and each measurement is a ray against the whole surface.
  const depthCache=new Map(),down=new T.Vector3(),
    depth=(x,y,back=false)=>{const key=Math.round(x*4000)+':'+Math.round(y*4000)+(back?'b':'f');let d=depthCache.get(key);
      if(d===undefined){caster.set(hit.set(x,y,back?-1:1),down.set(0,0,back?1:-1));const h=caster.intersectObjects(body,false)[0];d=h?Math.abs(h.point.z):0;depthCache.set(key,d);}return d;};
  const on=(pts,back=false,off=.004)=>pts.map(([x,y])=>[x,y,(back?-1:1)*(depth(x,y,back)+off)]);
  // A point on a leg's folded surface at height y and angle a around the leg, found by casting in from outside
  // against that leg only (an inner seam would otherwise land on the other leg).
  const legPoint=(side,y,a,off=.003)=>{const cx=lerpRows(legRows(side),y)[3],dir=new T.Vector3(Math.sin(a),0,Math.cos(a));caster.set(new T.Vector3(cx,y,0).addScaledVector(dir,.6),dir.clone().negate());const h=caster.intersectObjects(y>(spec.crotch?spec.crotch.y:.97)?[body[0],legs[side]]:[legs[side]],false)[0];return h?h.point.addScaledVector(dir,off).toArray():[cx+dir.x*.17,y,dir.z*.17];};
  // A flat outline projected onto the jeans surface, subdivided so it follows the curve.
  const patchOn=(outline,name,back,off,material=denim)=>{const shape=new T.Shape();outline.forEach(([x,y],k)=>k?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    // Pocket-sized patches need fine subdivision to follow the curve; small ones (heart, scuffs) need little.
    const xs=outline.map(q=>q[0]),ys=outline.map(q=>q[1]),size=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
    const mesh=put(jeans,subdivided(shape,size>.06?3:1,back),material,name),pp=mesh.geometry.attributes.position;
    for(let i=0;i<pp.count;i++)pp.setZ(i,(back?-1:1)*(depth(pp.getX(i),pp.getY(i),back)+off));pp.needsUpdate=true;mesh.geometry.computeVertexNormals();return mesh;};
  curve(jeans,on(spec.fly),.0017,thread,'fly-stitch');
  const seamNames=spec.twist?['twisted-side-seam','twisted-inseam']:['side-seam','inseam'];
  for(const side of [-1,1]){
    const fp=spec.frontPocket;
    if(fp.type==='slant')curve(jeans,on(fp.line.map(([x,y])=>[side*x,y])),.0017,thread,'slant-pocket-stitch');
    if(fp.fray){
      // Raw-edged pocket opening: short pale threads standing off the edge along its length.
      const fray=solid(spec.frayColour||'#cdd7df',1),r=random(side>0?29:31),line=new T.CatmullRomCurve3(on(fp.line.map(([x,y])=>[side*x,y]),false,.004).map(q=>V(...q)));
      for(let k=0;k<30;k++){const q=line.getPoint((k+r()*.6)/30),h=.002+r()*.004;curve(jeans,[q.toArray(),[q.x+side*(r()-.3)*.003,q.y+h,q.z+.001]],.0007,fray,'frayed-pocket-edge');}
    }
    // Scoop pocket: a curved opening from the waistband down to the side seam, with a second row of stitching.
    if(fp.type==='scoop')for(const inset of [0,.007])curve(jeans,on(fp.line.map(([x,y],k)=>[side*(x+inset*(k?1:.4)),y+inset*(k===fp.line.length-1?-1:0)])),.0017,thread,'scoop-pocket-stitch');
    // Side seam: starts at the outer hip and runs to the hem (twisting toward the back when the spec twists the legs).
    const hipPoint=(y,a,off=.003)=>{const dir=new T.Vector3(Math.sin(a),0,Math.cos(a));caster.set(new T.Vector3(0,y,0).addScaledVector(dir,.8),dir.clone().negate());const h=caster.intersectObject(body[0],false)[0];return h?h.point.addScaledVector(dir,off).toArray():[dir.x*.27,y,dir.z*.18];};
    const seam=spec.crotch?Array.from({length:7},(_,k)=>{const y=spec.waistband.y-spec.waistband.h/2-k*(spec.waistband.y-spec.waistband.h/2-.98)/6;return hipPoint(y,side*Math.PI/2);}):spec.sideSeamTop.map(([x,y])=>[side*x,y,0]);
    const legTop=spec.crotch?spec.crotch.y-.003:.97;
    for(let k=0;k<=20;k++){const y=legTop-k*(legTop-spec.seamEnd)/20;seam.push(legPoint(side,y,outAngle(side,y)));}
    curve(jeans,seam,.0018,thread,seamNames[0]);
    const inTop=spec.crotch?spec.crotch.y-.003:.95,inseam=[];for(let k=0;k<=20;k++){const y=inTop-k*(inTop-spec.seamEnd)/20;inseam.push(legPoint(side,y,inAngle(side,y)));}
    curve(jeans,inseam,.0018,thread,seamNames[1]);
    // Articulated knee: horizontal seams across the front and the back of each knee.
    if(spec.kneeSeams)for(const facing of [0,Math.PI]){
    const dart=[];for(let k=0;k<=8;k++)dart.push(legPoint(side,spec.kneeSeams+.006*Math.sin(Math.PI*k/8),facing-side*.55+side*.65*k/8,.002));
    curve(jeans,dart,.0042,fold,'knee-dart');curve(jeans,dart.map(([x,y,z],k)=>legPoint(side,y+.008,facing-side*.55+side*.65*k/8,.003)),.002,thread,'knee-dart-stitch');
    }
    // Back: yoke and patch pocket, with a pointed buttoned flap when the spec has one.
    if(spec.backYoke)curve(jeans,on(spec.backYoke.map(([x,y])=>[side*x,y]),true),.0018,thread,'back-yoke');
    // Short darts from the waistband toward each pocket, in place of (or as well as) a yoke.
    if(spec.backDarts)curve(jeans,on(spec.backDarts.map(([x,y])=>[side*x,y]),true,.003),.0022,fold,'back-dart');
    const bp=spec.backPocket,px=side*bp.x,pocket=bp.outline.map(([x,y])=>[px+x,y]);
    patchOn(pocket,'back-patch-pocket',true,.004);
    curve(jeans,on([...pocket.slice(1),pocket[0]].map(([x,y])=>[x-(x-px)*.08,y+(y<bp.stitchBelow?.006:0)]),true,.006),.0017,thread,'pocket-stitch');
    if(bp.arcuate){
      // Decorative double-needle stitching across the pocket: two wings dipping to a point at the centre.
      const [w,y0,dip]=bp.arcuate,wing=[[-w,y0],[-w*.72,y0+.012],[-w*.38,y0+.004],[-w*.12,y0-dip*.6],[0,y0-dip]],arc=[...wing,...wing.slice(0,-1).reverse().map(([x,y])=>[-x,y])];
      for(const off of [0,.0065])curve(jeans,on(arc.map(([x,y])=>[px+x,y-off]),true,.0055),.0026,solid(bp.arcuateColour||spec.thread,.9),'arcuate-stitch');
    }
    for(const y of bp.bars||[]){
      // Straight stitched bars across the pocket.
      const w=bp.outline[1][0]*.97;curve(jeans,on([[px-w,y],[px-w*.3,y-.002],[px+w*.3,y-.002],[px+w,y]],true,.0055),.0017,thread,'pocket-bar-stitch');
    }
    if(bp.badge&&side===bp.badge.side){
      // A tiny woven flag badge sewn onto the pocket: navy with a red and a white block (no lettering).
      const bx=px+side*bp.badge.out,by=bp.badge.y,z=-(depth(bx,by,true)+.0062);
      put(jeans,new T.BoxGeometry(.022,.011,.003),solid('#1c2747',.8),'pocket-badge').position.set(bx,by,z);
      for(const [dx,c] of [[-.0045,'#f2f2f0'],[.0045,'#c8202f']]){const b=put(jeans,new T.BoxGeometry(.008,.007,.002),solid(c,.8),'pocket-badge-block');b.position.set(bx+dx,by,z-.0018);}
    }
    if(bp.tab&&side===bp.tab.side){
      // Small woven tab sewn into the pocket's inner edge.
      const tx=px-side*bp.tab.inset,ty=bp.tab.y,tab=put(jeans,new T.BoxGeometry(.013,.024,.004),solid(bp.tab.colour,.75),'pocket-tab');tab.position.set(tx,ty,-(depth(tx,ty,true)+.006));
    }
    for(const dx of bp.nicks||[]){
      // Worn nicks along the pocket's top edge: a pale scuff with a few loose threads.
      const nx=px+dx,top=bp.outline[0][1],fray=solid(spec.frayColour||'#cdd7df',1),r=random(Math.round((nx+1)*1000));
      patchOn([[nx-.008,top-.004],[nx+.008,top-.004],[nx+.008,top+.001],[nx-.008,top+.001]],'pocket-nick',true,.0065,fray);
      for(let k=0;k<4;k++){const x=nx-.006+k*.004,z=-(depth(x,top,true)+.0068);curve(jeans,[[x,top,z],[x+(r()-.5)*.003,top-.004-r()*.004,z-.001]],.0009,fray,'pocket-nick-thread');}
    }
    if(bp.flap){
      patchOn(bp.flap.map(([x,y])=>[px+x,y]),'pocket-flap',true,.009);
      curve(jeans,on(bp.flapStitch.map(([x,y])=>[px+x,y]),true,.011),.0022,thread,'flap-stitch');
      oval(jeans,[px,bp.button,-(depth(px,bp.button,true)+.013)],[.011,.011,.004],metal,'flap-button',16);
    }
  }
  if(spec.coinPocket){
    // Coin pocket inside the wearer's right front pocket, with its embroidery when the spec has one.
    const cp=spec.coinPocket;curve(jeans,on(cp.outline),.0016,thread,'coin-pocket-stitch');
    if(cp.badge){const [bx,by]=cp.badge,z=depth(bx,by)+.005;put(jeans,new T.BoxGeometry(.02,.01,.003),solid('#1c2747',.8),'coin-badge').position.set(bx,by,z);
      for(const [dx,c] of [[-.004,'#f2f2f0'],[.004,'#c8202f']]){const b=put(jeans,new T.BoxGeometry(.007,.006,.002),solid(c,.8),'coin-badge-block');b.position.set(bx+dx,by,z+.0018);}}
    if(cp.heart){const [hx,hy]=cp.heart,hs=.011,pts=[];for(let k=0;k<=40;k++){const t=k/40*Math.PI*2,x=16*Math.sin(t)**3,y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);pts.push([hx+x/16*hs,hy+y/16*hs]);}
      // A filled embroidered heart, with a slightly darker outline for the satin-stitch edge.
      patchOn(pts,'embroidered-heart',false,.0035,solid('#c4262e',.7));curve(jeans,on(pts,false,.005),.0012,solid('#8f1820',.7),'embroidered-heart-edge');}
  }
  // Copper rivets at the front pocket corners (mirrored to both sides).
  if(spec.rivets){const copper=new T.MeshStandardMaterial({color:'#b06a3c',metalness:.8,roughness:.35});
    for(const side of [-1,1])for(const [x,y] of spec.rivets)oval(jeans,[side*x,y,depth(side*x,y)+.004],[.0065,.0065,.003],copper,'rivet',12);}
  // Light abrasions: small worn strips cut into the wash.
  for(const [x,y,w] of spec.abrasions||[])patchOn([[x-w/2,y-.004],[x+w/2,y-.004],[x+w/2,y+.004],[x-w/2,y+.004]],'abrasion',false,.0015,solid('#b9c8d6',1));
  curve(jeans,on(spec.centreBack,true),.0018,thread,'centre-back-seam');
  if(spec.welt)curve(jeans,on(spec.welt,true,.005),.0028,fold,'welt-pocket');
  const lp=spec.labelPatch,leather=put(jeans,new T.BoxGeometry(...lp.size),solid(lp.colour,.95),lp.name);leather.position.set(...lp.position);leather.rotation.y=lp.rotationY;
  for(const [x0,y0,x1,y1,c] of lp.blocks||[]){
    // Coloured blocks on the patch's outer face (no lettering).
    const b=put(leather,new T.BoxGeometry(x1-x0,y1-y0,.001),solid(c,.85),'patch-block');b.position.set((x0+x1)/2,(y0+y1)/2,lp.size[2]/2+.0006);
  }
  if(lp.printColour){
    // A printed border on the patch's outer face (no lettering or logo).
    const [w,h,d]=lp.size,ink=solid(lp.printColour,.9);
    for(const k of [.4,.33])curve(leather,[[-w*k,h*k,d/2+.0006],[w*k,h*k,d/2+.0006],[w*k,-h*k,d/2+.0006],[-w*k,-h*k,d/2+.0006],[-w*k,h*k,d/2+.0006]],.0011,ink,'patch-print');
  }
  if(spec.hem==='raw-crop'){
    // Cropped raw hem: a pale frayed edge around each ankle.
    const fray=solid(spec.frayColour||'#cdd7df',1),r=random(23);
    for(const side of [-1,1])for(let k=0;k<56;k++){const a=k/56*Math.PI*2+r()*.05,[x,y,z]=legPoint(side,hemY+.004,a,.001),h=.006+r()*.008;curve(jeans,[[x,y,z],[x,y-h,z]],.0011,fray,'frayed-hem');}
  }
  return jeans;
}
export function makeOutfit(raw, atlas=null) {
  const state=cleanRecipe(raw),root=new T.Group();root.name='wardrobe';
  const shirt=cloth('#e6e6de'),stripe=solid('#829bb9'),denim=cloth(state.trousers,'denim'),knit=cloth(state.sweater,'knit'),stitch=solid('#ae8c62');
  const bottom=GARMENTS[state.bottomId],trousers=bottom?.build?.template==='jeans'?makeJeans(state.bottomId,bottom.build,atlas?.isTexture?null:atlas?.[state.bottomId]):new T.Group();trousers.name='trousers';root.add(trousers);
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
  else if(state.topId===STRIPE_JUMPER_ID)root.add(makeStripeJumper(STRIPE_JUMPER_ID,state.skirt));
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

