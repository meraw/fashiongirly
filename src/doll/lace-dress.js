// Lace shift dress (template 'lace-shift-dress'): a straight mini in opaque floral lace crossed by bands of frilled trim,
// with a high ruffled lace collar, sheer lace sleeves crossed by lace insertion bands and ending in frilled cuffs, and a
// keyhole with two small buttons at the back of the neck. Worn with bare legs, like the half-zip dress.
import * as T from 'three';
import { random, cloth, put, oval, shell, ribbed, roundSleeveCap, easeOverHand } from './model.js';

const cache={};
// Floral lace, drawn as a needle lace would be worked: sprays of layered roses, veined leaves and small daisies joined
// by corded stems, on a fine tulle net. Each motif is outlined by a raised cord; its petals alternate between dense
// cloth stitch and an open half stitch, so a rose reads in rings and a leaf in halves. Kept as three maps: a shade
// (cord and cloth bright, half stitch and net darker, the net's holes darkest), a height for the relief, and an alpha
// (motifs solid, the net see-through), used only where the lace is sheer.
const HOLE=0,NET=1,HALF=2,CLOTH=3,CORD=4;
function laceData(){
  if(cache.lace)return cache.lace;
  const S=512,rand=random(151),kind=new Uint8Array(S*S),cord=new Float32Array(S*S).fill(9),eye=new Uint8Array(S*S);
  // The tulle: round holes on a triangular lattice, with threads between them.
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const sp=6,r=Math.round(y/(sp*.866)),cx=x-(r%2?sp/2:0),c=Math.round(cx/sp),d=Math.hypot(cx-c*sp,y-r*sp*.866);
    kind[y*S+x]=d<sp*.3?HOLE:NET;}
  const wrap=v=>((Math.round(v)%S)+S)%S;
  // Run f over a square round (cx, cy); f returns [fill kind or 0, distance to the nearest cord, eyelet].
  const stamp=(cx,cy,R,f)=>{for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const [k,c,e]=f(dx,dy);const i=wrap(cy+dy)*S+wrap(cx+dx);
    if(k)kind[i]=Math.max(kind[i]===NET||kind[i]===HOLE?0:kind[i],k);if(c<cord[i])cord[i]=c;if(e)eye[i]=1;}};
  const rose=(cx,cy,R,rot)=>{const r=[.36,.68,1].map(t=>t*R),n=[5,6,8];
    stamp(cx,cy,Math.ceil(R)+2,(dx,dy)=>{const d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);let k=0,c=9;
      for(let l=0;l<3;l++){const ph=n[l]*(a+rot+l*.7)/2,edge=r[l]*(.78+.22*Math.abs(Math.cos(ph)));c=Math.min(c,Math.abs(d-edge));
        if(!k&&d<edge){k=l%2?HALF:CLOTH;
          // Petal divisions: a cord between neighbouring petals, from the ring inside out to this edge.
          if(l>0&&d>r[l-1]*.8){const m=((ph%Math.PI)+Math.PI)%Math.PI;c=Math.min(c,Math.abs(m-Math.PI/2)*d*2/n[l]);}}}
      c=Math.min(c,Math.abs(d-R*.16));return [k,c,d<R*.1];});};
  const leaf=(cx,cy,L,W,ang)=>{const co=Math.cos(ang),si=Math.sin(ang);
    stamp(cx,cy,Math.ceil(L)+2,(dx,dy)=>{const u=dx*co+dy*si,v=-dx*si+dy*co,t=u/L;if(Math.abs(t)>1.15)return [0,9];
      const w=W*Math.sqrt(Math.max(0,1-t*t))*(1-.3*t),inside=Math.abs(v)<w&&Math.abs(t)<1;
      let c=Math.abs(Math.abs(v)-w);if(Math.abs(t)>=.98)c=Math.min(c,Math.hypot(u-Math.sign(u)*L,v));
      if(inside){c=Math.min(c,Math.abs(v)+.2);const sv=((u+Math.abs(v)*1.1)/(L*.42))%1;if(t<.85)c=Math.min(c,Math.abs(sv-.5)*L*.42*.6+.1);}
      return [inside?(v>0?CLOTH:HALF):0,c];});};
  const daisy=(cx,cy,R,rot)=>stamp(cx,cy,Math.ceil(R)+2,(dx,dy)=>{const d=Math.hypot(dx,dy),a=Math.atan2(dy,dx),edge=R*(.35+.65*Math.abs(Math.cos(2.5*(a+rot)))**.7);
    return [d<edge?CLOTH:0,Math.min(Math.abs(d-edge),Math.abs(d-R*.3)),d<R*.18];});
  const stem=(pts)=>{for(let k=0;k<pts.length-1;k++){const [x0,y0]=pts[k],[x1,y1]=pts[k+1],n=Math.ceil(Math.hypot(x1-x0,y1-y0));
    for(let s=0;s<=n;s++){const x=x0+(x1-x0)*s/n,y=y0+(y1-y0)*s/n;stamp(x,y,3,(dx,dy)=>[0,Math.max(0,Math.hypot(dx,dy)-.6)]);}}};
  // Roses spaced apart (the tile wraps), each with two or three sprays curving out: leaves along the stem, a daisy or
  // a bud at its end.
  const roses=[];for(let k=0;k<400&&roses.length<26;k++){const x=rand()*S,y=rand()*S;
    if(roses.every(([px,py])=>Math.hypot(Math.min(Math.abs(px-x),S-Math.abs(px-x)),Math.min(Math.abs(py-y),S-Math.abs(py-y)))>92))roses.push([x,y]);}
  for(const [x,y] of roses){
    const R=24+rand()*8,sprays=2+Math.floor(rand()*2),a0=rand()*6.3;
    for(let s=0;s<sprays;s++){const a=a0+s*6.28/sprays+(rand()-.5)*.8,len=38+rand()*22,bend=(rand()-.5)*1.2,pts=[];
      for(let t=0;t<=8;t++){const q=t/8,ang=a+bend*q,rr=R*.95+len*q;pts.push([x+Math.cos(ang)*rr,y+Math.sin(ang)*rr]);}
      stem(pts);
      for(const q of [.35,.7]){const [px,py]=pts[Math.round(q*8)],ang=a+bend*q,side=rand()<.5?1:-1;
        leaf(px+Math.cos(ang+side*1.4)*9,py+Math.sin(ang+side*1.4)*9,10+rand()*4,4.5+rand()*1.5,ang+side*.9);}
      const [ex,ey]=pts[8];rand()<.6?daisy(ex,ey,8+rand()*3,rand()*6):leaf(ex,ey,8,4,a+bend);}
    rose(x,y,R,rand()*6.3);}
  const shade=new Uint8Array(S*S*4),height=new Uint8Array(S*S*4),alpha=new Uint8Array(S*S*4);
  const look={[HOLE]:[.74,0,.22],[NET]:[.88,.3,.85],[HALF]:[.9,.5,.9],[CLOTH]:[.97,.62,1]};
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=y*S+x,k=kind[i],c=cord[i];let [v,h,a]=look[k];
    // Stitch texture: fine rows in cloth stitch, an open diagonal lattice in half stitch.
    if(k===CLOTH&&y%3===0){v-=.03;h-=.08;}
    if(k===HALF&&(x+y)%4!==0&&(x-y+400)%4!==0){v-=.07;h-=.2;a=.75;}
    if(eye[i]){[v,h,a]=look[HOLE];}
    // The raised cord: bright on its crest, shadowed at its edges.
    if(c<1.6){const t=c/1.6;v=t<.55?1:.8;h=1-t*.4;a=1;}
    shade[i*4]=shade[i*4+1]=shade[i*4+2]=Math.round(255*v);height[i*4]=height[i*4+1]=height[i*4+2]=Math.round(255*h);alpha[i*4]=alpha[i*4+1]=alpha[i*4+2]=Math.round(255*a);
    shade[i*4+3]=height[i*4+3]=alpha[i*4+3]=255;}
  return cache.lace={shade,height,alpha,S};
}
function laceTexture(data,S,repeat,colour){
  const t=new T.DataTexture(data,S,S,T.RGBAFormat);t.colorSpace=colour?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);
  t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=8;t.needsUpdate=true;return t;
}
// Opaque lace (the body, over its lining) or sheer lace (the sleeves and collar, showing her skin through the net).
function lace(colour,repeat,sheer=false){
  const {shade,height,alpha,S}=laceData();
  const m=new T.MeshStandardMaterial({color:colour,map:laceTexture(shade,S,repeat,true),bumpMap:laceTexture(height,S,repeat,false),bumpScale:.012,roughness:.85,side:T.DoubleSide});
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
