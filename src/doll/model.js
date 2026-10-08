import * as T from 'three';
import { cleanRecipe } from './recipe.js';
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
    const arm=oval(root,[side*.355,1.53,0],[.085,.29,.082],skin,'arm');arm.rotation.z=side*.36;
    const hand=oval(root,[side*.46,1.25,.015],[.076,.1,.055],skin,'tiny-hand');hand.rotation.z=-side*.28;
    for(let i=0;i<3;i++)oval(root,[side*(.435+i*.026),1.185-i*.002,.035],[.018,.045,.021],skin,'finger',16);
    oval(root,[side*.403,1.26,.06],[.026,.054,.027],skin,'thumb',16);
    const sock=cloth('#ecdcac','knit');oval(root,[side*.16,.25,.02],[.106,.14,.107],sock,'sock');
    const leather=solid('#64362e',.37), sole=solid('#312829',.85);
    oval(root,[side*.16,.105,.09],[.131,.089,.205],leather,'loafer');oval(root,[side*.16,.052,.09],[.136,.044,.21],sole,'shoe-sole');
    curve(root,[[side*.16-.093,.157,.135],[side*.16,.177,.16],[side*.16+.093,.157,.135]],.015,leather,'loafer-strap');
    curve(root,[[side*.16-.11,.11,.14],[side*.16-.06,.09,.267],[side*.16+.06,.09,.267],[side*.16+.11,.11,.14]],.003,solid('#c4a26e'),'shoe-stitch');
  }
  root.add(makeHead());return root;
}
function sleeve(group,side,volume,mat) {
  const sleeveGroup=new T.Group();sleeveGroup.position.set(side*.245,1.81,0);sleeveGroup.rotation.z=side*.35;
  const radius=.098+volume*.065;
  shell(sleeveGroup,[[.035,.087,.105],[0,radius*.95,radius],[-.08,radius*1.17,radius*1.12],[-.2,radius*1.3,radius*1.19],[-.33,radius*1.2,radius*1.12],[-.44,.086,.09],[-.48,.076,.083]],mat,'balloon-sleeve');
  ring(sleeveGroup,-.475,.077,.084,mat,'knit-cuff',.08);group.add(sleeveGroup);
}
export function makeOutfit(raw) {
  const state=cleanRecipe(raw),root=new T.Group();root.name='wardrobe';
  const shirt=cloth('#e6e6de'),stripe=solid('#829bb9'),denim=cloth(state.trousers,'denim'),knit=cloth(state.sweater,'knit'),stitch=solid('#ae8c62');
  const trousers=new T.Group();trousers.name='trousers';root.add(trousers);
  // One pelvis shell overlaps leg roots; both are separate from the doll.
  shell(trousers,[[1.23,.252,.177],[1.15,.272,.194],[1.05,.267,.19],[.96,.235,.176]],denim,'jeans-hips');
  ring(trousers,1.22,.254,.181,denim,'jeans-waistband',.065);
  for(const side of [-1,1]){
    const width=.108+state.barrel*.072;
    shell(trousers,[[1.04,.139,.18,side*.133],[.96,width*.99,.181,side*.148],[.82,width*1.17,.18,side*.181],[.62,width*1.1,.158,side*.183],[.43,width*.85,.13,side*.172],[.29,.111,.11,side*.16]],denim,'barrel-leg');
    ring(trousers,.3,.113,.113,denim,'jean-cuff',.065,side*.16);
    curve(trousers,[[side*.24,1.16,.135],[side*.3,.97,.105],[side*(.181+width*.95),.8,.07],[side*(.183+width*.92),.62,.064],[side*.27,.32,.06]],.0025,stitch,'jean-side-seam');
    curve(trousers,[[side*.075,1.18,.176],[side*.13,1.08,.17],[side*.23,1.06,.13]],.0025,stitch,'jean-pocket-seam');
  }
  oval(trousers,[0,1.205,.187],[.019,.019,.01],solid('#bca16a'),'waist-button');
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
  // Materials that were not used in the selected layers are not retained.
  const used=new Set();root.traverse(o=>{if(o.material)used.add(o.material);});
  for(const mat of [shirt,stripe,denim,knit,stitch])if(!used.has(mat)){mat.bumpMap?.dispose();mat.dispose();}
  return root;
}
export function disposeObject(root) { const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});for(const m of materials)for(const value of Object.values(m))if(value?.isTexture)textures.add(value);geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose()); }
