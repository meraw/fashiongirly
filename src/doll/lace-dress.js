// Lace shift dress (template 'lace-shift-dress'): a straight mini in opaque floral lace crossed by bands of frilled trim,
// with a high ruffled lace collar, sheer lace sleeves crossed by lace insertion bands and ending in frilled cuffs, and a
// keyhole with two small buttons at the back of the neck. Worn with bare legs, like the half-zip dress.
import * as T from 'three';
import { random, cloth, put, oval, shell, ribbed, roundSleeveCap, easeOverHand } from './model.js';

const cache={};
// Floral lace: scattered roses (rings of petals round a small centre) and leaves on a fine hexagonal net. Kept as two
// maps: a shade (motifs light, their outlines darker, the net between) and an alpha (motifs solid, the net see-through),
// used only where the lace is sheer.
function laceData(){
  if(cache.lace)return cache.lace;
  const S=256,rand=random(151),motif=new Float32Array(S*S),outline=new Float32Array(S*S);
  const stamp=(cx,cy,f)=>{for(let dy=-16;dy<=16;dy++)for(let dx=-16;dx<=16;dx++){const v=f(dx,dy);if(v<=0)continue;const x=((Math.round(cx)+dx)%S+S)%S,y=((Math.round(cy)+dy)%S+S)%S,i=y*S+x;
    if(v>=1)motif[i]=1;else outline[i]=Math.max(outline[i],v);}};
  for(let k=0;k<22;k++){const cx=rand()*S,cy=rand()*S,r=7+rand()*6,petals=5+Math.floor(rand()*3),rot=rand()*6;
    stamp(cx,cy,(dx,dy)=>{const d=Math.hypot(dx,dy),a=Math.atan2(dy,dx),edge=r*(.8+.2*Math.cos(petals*(a+rot)));
      if(d<edge-1.2)return (Math.abs(d-r*.45)<.8||Math.abs(Math.sin(petals*(a+rot)/2))<.08)?.6:1;return d<edge?.6:0;});}
  for(let k=0;k<30;k++){const cx=rand()*S,cy=rand()*S,len=6+rand()*5,ang=rand()*Math.PI,c=Math.cos(ang),s=Math.sin(ang);
    stamp(cx,cy,(dx,dy)=>{const u=dx*c+dy*s,v=-dx*s+dy*c,w=2.4*Math.sqrt(Math.max(0,1-(u/len)**2));return Math.abs(v)<w-.8?1:Math.abs(v)<w?.6:0;});}
  const shade=new Uint8Array(S*S*4),alpha=new Uint8Array(S*S*4);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=y*S+x,hx=x%6,hy=y%5,net=hx===0||hy===0||(hx+hy)%7===0;
    const solid=motif[i]>0,line=outline[i]>0&&!solid;
    const v=solid?1:line?.8:net?.9:.84,a=solid?1:line?1:net?.8:.42;
    shade[i*4]=shade[i*4+1]=shade[i*4+2]=Math.round(255*v);shade[i*4+3]=255;alpha[i*4]=alpha[i*4+1]=alpha[i*4+2]=Math.round(255*a);alpha[i*4+3]=255;}
  return cache.lace={shade,alpha,S};
}
function laceTexture(data,S,repeat,colour){
  const t=new T.DataTexture(data,S,S,T.RGBAFormat);t.colorSpace=colour?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;
}
// Opaque lace (the body, over its lining) or sheer lace (the sleeves and collar, showing her skin through the net).
function lace(colour,repeat,sheer=false){
  const {shade,alpha,S}=laceData();
  const m=new T.MeshStandardMaterial({color:colour,map:laceTexture(shade,S,repeat,true),bumpMap:laceTexture(shade,S,repeat,false),bumpScale:.005,roughness:.85,side:T.DoubleSide});
  if(sheer)Object.assign(m,{alphaMap:laceTexture(alpha,S,repeat,false),transparent:true,depthWrite:false});
  return m;
}
// Her legs, as makeDoll() builds them: ovals .092 by .094 across, .49 tall, centred .16 either side at height .69.
const legRadius=y=>Math.sqrt(Math.max(0,1-((y-.69)/.49)**2));
const rowAt=(rows,y)=>{for(let k=0;k<rows.length-1;k++)if(y<=rows[k][0]&&y>=rows[k+1][0]){const t=(rows[k][0]-y)/(rows[k][0]-rows[k+1][0]);return [rows[k][1]+(rows[k+1][1]-rows[k][1])*t,rows[k][2]+(rows[k+1][2]-rows[k][2])*t];}return rows.at(-1).slice(1,3);};
// A gathered frill round a ring of radii r at height y: a narrow band standing a little off the surface. Its stitched top
// lies close; its lower edge flares and ripples in soft gathers, so it reads as lace frilling, not a hoop. Six segments
// per ripple keep the gathers round rather than blocky.
function frill(group,y,[rx,rz],{depth=.006,height=.016,ripples=28,amp=.05},mat,name){
  const m=shell(group,[[y+height*.4,rx+.001,rz+.001],[y,rx+depth*.5,rz+depth*.5],[y-height*.6,rx+depth,rz+depth]],mat,name,ripples*6);
  const p=m.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const t=Math.max(0,Math.min(1,(y+height*.4-p.getY(i))/height)),a=Math.atan2(p.getX(i),p.getZ(i)),k=1+amp*t*t*Math.cos(a*ripples)*(depth/.03+.15);
    p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}
  p.needsUpdate=true;m.geometry.computeVertexNormals();return m;
}

export function makeLaceDress(id,spec){
  const top=new T.Group();top.name=id;
  const C=spec.colours,B=spec.body,S=spec.sleeve;
  // Bare legs below the hem, and skin under the sheer sleeves and collar.
  const skin=cloth(C.skin);
  for(const side of [-1,1])shell(top,[1.0,.94,.86,.78,.69,.6,.5,.4,.3,.24].map(y=>[y,.092*legRadius(y)+.005,.094*legRadius(y)+.005,side*.16]),skin,'bare-leg-skin',32);
  // A straight shift from the neck to mid-thigh, in opaque lace.
  const body=shell(top,B.rows,lace(C.lace,spec.tiles.body),'dress-body',96);
  const p=body.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i),fall=Math.max(0,Math.min(1,(1.1-y)/.25)),k=1+.01*fall*Math.sin(Math.atan2(p.getX(i),p.getZ(i))*7);p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}
  p.needsUpdate=true;body.geometry.computeVertexNormals();
  // Bands of frilled trim across the body, closer together toward the hem, and a trim along the hem.
  const trim=lace(C.trim,spec.tiles.trim);
  for(const y of B.frills)frill(top,y,rowAt(B.rows,y),{},trim,'lace-frill');
  frill(top,B.rows.at(-1)[0]+.006,rowAt(B.rows,B.rows.at(-1)[0]+.006),{depth:.006,height:.01},trim,'hem-trim');
  // The high collar in sheer lace over skin, its top edge a ruffle. Her big head hides most of it from the front.
  const K=spec.collar;
  shell(top,[[K.top-.006,K.radius[0]-.006,K.radius[1]-.006],[B.rows[0][0]+.004,K.radius[0]-.008,K.radius[1]-.008]],skin,'neck-skin',64);
  shell(top,[[K.top,...K.radius],[B.rows[0][0]-.004,K.radius[0]+.004,K.radius[1]+.004]],lace(C.lace,spec.tiles.collar,true),'lace-collar',96);
  frill(top,K.top,K.radius,{depth:.014,height:.016,ripples:28,amp:.4},trim,'collar-ruffle');
  // The keyhole at the back of the neck, closed by two small gold buttons.
  const kz=-rowAt(B.rows,K.keyhole.y)[1];
  oval(top,[0,K.keyhole.y,kz-.003],[.011,K.keyhole.h/2,.003],skin,'keyhole',16);
  const gold=new T.MeshStandardMaterial({color:C.button,metalness:.8,roughness:.3});
  for(const y of K.buttons)oval(top,[0,y,-rowAt(B.rows,y)[1]-.006],[.006,.006,.004],gold,'back-button',12);
  // Sleeves: sheer lace over her skin, a little full, crossed by lace insertion bands, gathered into frilled cuffs.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    shell(arm,S.rows.map(([y,rx,rz])=>[y,rx*.9,rz*.9]),skin,'arm-skin',48);
    const sleeve=shell(arm,S.rows,lace(C.lace,spec.tiles.sleeve,true),'lace-sleeve',96);
    roundSleeveCap(sleeve,side,S.rows[0][0]);
    for(const y of S.bands)frill(arm,y,rowAt(S.rows,y),{depth:.004,height:.012,ripples:18,amp:.1},trim,'sleeve-trim');
    const [c0,c1,c2]=S.cuff;
    easeOverHand(ribbed(shell(arm,[[c0,S.cuffRadius[0],S.cuffRadius[0]*.96],[c1,S.cuffRadius[1],S.cuffRadius[1]*.96]],trim,'ruffle-cuff',96),40,.03),side);
    // The frill flares over her hand in several rows, so easing it round her thumb bends it rather than cutting a corner.
    const flare=[0,.25,.5,.75,1].map(t=>{const r=S.cuffRadius[1]+(S.frillRadius-S.cuffRadius[1])*t;return [c1+.004+(c2-c1-.004)*t,r,r*.96];});
    easeOverHand(ribbed(shell(arm,flare,lace(C.lace,spec.tiles.cuff,true),'cuff-frill',144),18,.06),side);
    top.add(arm);
  }
  return top;
}
