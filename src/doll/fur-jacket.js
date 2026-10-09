// Faux-fur shirt jacket (template 'faux-fur-shirt-jacket'): a boxy cropped jacket in short, dense faux fur, closed by
// hidden snaps, with a big fur point collar, chest flap pockets, slanted side pockets and fur cuff bands. Fur pieces have
// thick, rolled edges. Built at its own size on her and eased out only where the layers under it need room. It is worn
// closed (the snaps make it a closed jacket), so it has no open state.
import * as T from 'three';
import { random, solid, put, oval, curve, shell, ringShell, roundSleeveCap } from './model.js';
import { jacketBody, easeOver, outward, dataTexture, rowRadii } from './outerwear.js';

const cache={};
// Short faux fur: thousands of fine hairs lying the same way, each darker at its root and lighter at its tip. Kept as a
// height field that drives a bump map, and as a soft colour variation (a multiplier, about .9 on average). Hairs run toward
// larger v; materials flip v where the fur must lie downward. Built once and shared.
function furData(){
  if(cache.fur)return cache.fur;
  const S=256,rand=random(97),h=new Float32Array(S*S);
  for(let k=0;k<6500;k++){const x0=rand()*S,y0=rand()*S,len=6+rand()*10,ang=Math.PI/2+(rand()-.5)*.7,dx=Math.cos(ang),dy=Math.sin(ang);
    for(let t=0;t<=len;t+=.5){const x=((Math.floor(x0+dx*t)%S)+S)%S,y=((Math.floor(y0+dy*t)%S)+S)%S,v=.3+.7*t/len;h[y*S+x]=Math.max(h[y*S+x],v);}}
  const colour=new Uint8Array(S*S*4),bump=new Uint8Array(S*S*4);
  for(let i=0;i<S*S;i++){const c=Math.round(255*(.8+.2*h[i])),b=Math.round(255*h[i]);colour[i*4]=colour[i*4+1]=colour[i*4+2]=c;colour[i*4+3]=255;bump[i*4]=bump[i*4+1]=bump[i*4+2]=b;bump[i*4+3]=255;}
  return cache.fur={colour,bump,S};
}
// Faux fur: a soft velvety sheen over the hair texture, repeated `repeat` times; `down` lays the hairs toward smaller v.
function furMaterial(colour,F,repeat,down){
  const {colour:cd,bump:bd,S}=furData(),r=[repeat[0],down?-repeat[1]:repeat[1]];
  const map=dataTexture(cd,S,S,...r),bump=dataTexture(bd,S,S,...r);bump.colorSpace=T.NoColorSpace;
  return new T.MeshPhysicalMaterial({color:colour,map,roughness:1,sheen:F.sheen,sheenColor:new T.Color(colour).lerp(new T.Color('#ffffff'),F.sheenLight),sheenRoughness:F.sheenRoughness,bumpMap:bump,bumpScale:F.bump,side:T.DoubleSide});
}

export function makeFurJacket(id,spec,overSkirt,under=null){
  const jacket=new T.Group();jacket.name='outerwear';jacket.userData.garmentId=id;jacket.userData.open=false;jacket.userData.opening=()=>0;
  const C=spec.colours,B=spec.body,S=spec.sleeve,F=spec.fur;
  const fur=furMaterial(C.fur,F,F.tiles.body,true),sleeveFur=furMaterial(C.fur,F,F.tiles.sleeve,false),trim=furMaterial(C.fur,F,F.tiles.trim,true);
  const satin=new T.MeshPhysicalMaterial({color:C.lining,roughness:.42,sheen:.6,sheenColor:new T.Color(C.lining).lerp(new T.Color('#ffffff'),.4),sheenRoughness:.4,side:T.DoubleSide});
  const metal=new T.MeshStandardMaterial({color:C.metal,metalness:.8,roughness:.32}),parting=solid(C.parting,1);
  // Its own boxy size, eased out over anything under it (and over the skirt) by at least the gap.
  const own=rowRadii(B.rows),fit=under?easeOver(under,{low:B.hem-.01,high:B.collarTop,gap:spec.fit.gap,radii:own,sleeve:S}):null;
  // The pile lies in soft, uneven waves rather than folds.
  const deform=(a,y)=>1+B.ripple*Math.sin(5*a+13*y)*Math.sin(3*a-7*y+1.1);
  const tools=jacketBody(jacket,B.rows,fur,B.collarBase,deform,128,{fit}),{at,normal,angleFor,radii}=tools;
  const line=(pts,off,r,mat,name)=>curve(jacket,pts.map(([a,y])=>at(a,y,off).toArray()),r,mat,name);
  // A thick rolled edge at the hem.
  line(Array.from({length:97},(_,i)=>[i/96*Math.PI*2,B.hem+B.roll*.5]),-B.roll*.15,B.roll,trim,'hem-roll');
  // Hidden snap front: the two fur edges meet at the centre in a soft parting, each rolled; one snap shows at the top.
  const fy=Array.from({length:41},(_,k)=>B.hem+B.roll+(B.collarBase-.01-B.hem-B.roll)*k/40);
  line(fy.map(y=>[0,y]),-.001,.0035,parting,'front-parting');
  for(const s of [-1,1])line(fy.map(y=>[s*B.edge/radii(y)[0],y]),-B.edge*.35,B.edge*.9,fur,'front-edge');
  for(const [x,y] of spec.snaps){const a=angleFor(x,y),q=at(a,y,.006),snap=oval(jacket,q.toArray(),[.008,.008,.003],metal,'front-snap',16);snap.lookAt(q.clone().add(normal(a,y)));}
  // A puffy fur flap on the chest: a rounded-rectangle pad, domed (fuller toward its hanging lower edge) and sinking into
  // the body all round its edge, its lower edge standing a little off the body as a thick lip. Its hairs lie downward like the body's.
  const flap=(s,F)=>{const U=28,W=12,hw=(F.x1-F.x0)/2,hh=F.height/2,cx=s*(F.x0+F.x1)/2,cy=F.top-hh,n=F.round,rows=[],uv=[];
    // Laid out on an even grid over the flap's rectangle; the rounded-rectangle shape comes from how far each point lies
    // inside it (f < 1), so the dome has no creases. Outside it the grid lies just on the body, hidden in the fur.
    for(let j=0;j<=W;j++){const v=1-2*j/W,r=[];for(let i=0;i<=U;i++){const u=-1+2*i/U,x=cx+hw*u,y=cy+hh*v,f=Math.abs(u)**n+Math.abs(v)**n;
      const off=f<1?.003+F.puff*Math.sqrt(1-f**3)*(.8-.2*v)+F.lift*Math.max(0,-v)**1.5*f**2:.0015;r.push(at(angleFor(x,y),y,off).toArray());uv.push(x*4,y*4);}rows.push(r);}
    const m=ringShell(jacket,rows,trim,'chest-flap');m.geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));outward(m,normal(angleFor(cx,cy),cy));
    // Its thick lower edge, along the bottom of the rounded rectangle.
    const edge=t=>{const c=Math.cos(t),si=Math.sin(t);return [cx+hw*Math.sign(c)*Math.abs(c)**(2/n),cy+hh*Math.sign(si)*Math.abs(si)**(2/n),.003+F.lift*Math.max(0,-si)**1.5];};
    curve(jacket,Array.from({length:25},(_,k)=>{const [x,y,off]=edge(Math.PI+Math.PI*k/24);return at(angleFor(x,y),y,off-F.lip*.4).toArray();}),F.lip,trim,'chest-flap-edge');
    return m;};
  const P=spec.pockets;
  for(const s of [-1,1]){
    flap(s,P.flap);
    // Slanted side pocket: a dark slit with a fur welt beside it.
    const sl=P.side,slit=Array.from({length:11},(_,k)=>{const y=sl.top-(sl.top-sl.bottom)*k/10,x=s*(sl.x+sl.slant*(sl.top-y));return [angleFor(x,y),y];});
    line(slit,.001,.0028,parting,'side-pocket-slit');
    line(slit.map(([a,y])=>[a+s*.012,y]),.004,.0055,trim,'side-pocket-welt');
  }
  // Point collar: a big fur leaf folded over the stand, lying on her shoulders, its front ends cut to rounded points, with a
  // thick rolled edge. Laid on the body's surface a little off it.
  const K=spec.collar,U=48,W=8,foldY=a=>K.foldFront+(K.foldBack-K.foldFront)*(1-Math.cos(a))/2;
  const leaf=(u,v)=>{const af=K.gap+u*(Math.PI*2-2*K.gap),ae=K.gap+K.spread+u*(Math.PI*2-2*K.gap-2*K.spread),a=af+(ae-af)*v,front=Math.max(0,Math.cos(af))**3;
    const drop=K.dropBack+(K.dropFront-K.dropBack)*front,y=foldY(af)-drop*v;return at(a,y,K.lift*(1-.4*v)+.008);};
  const grid=[];for(let j=0;j<=W;j++){const r=[];for(let i=0;i<=U;i++)r.push(leaf(i/U,j/W).toArray());grid.push(r);}
  outward(ringShell(jacket,grid,trim,'fur-collar'),normal(K.gap,foldY(K.gap)));
  curve(jacket,Array.from({length:U+1},(_,i)=>leaf(i/U,0).toArray()),K.roll,trim,'collar-fold');
  const outline=[...Array.from({length:W+1},(_,j)=>leaf(0,j/W)),...Array.from({length:U-1},(_,i)=>leaf((i+1)/U,1)),...Array.from({length:W+1},(_,j)=>leaf(1,(W-j)/W))];
  curve(jacket,outline.map(q=>q.toArray()),K.roll,trim,'collar-edge');
  // Inside the neck: the pink satin lining, with the black label and its chain hanger at the back.
  const g=fit?fit(B.collarBase):1,[nx,nz]=own(B.collarTop-.01).map(r=>r*g);
  shell(jacket,[[B.collarTop-.004,nx-.004,nz-.004],[B.collarBase-.03,nx+.004,nz+.002]],satin,'neck-lining',64);
  const ly=B.collarBase-.006,label=put(jacket,new T.BoxGeometry(.03,.05,.002),solid(C.label,.7),'neck-label');label.position.set(0,ly,-(nz-.008));
  curve(jacket,[[-.022,ly+.034,-(nz-.009)],[0,ly+.024,-(nz-.011)],[.022,ly+.034,-(nz-.009)]],.0018,metal,'hanger-chain');
  // Dropped-shoulder sleeves, a little full, gathered into fur cuff bands with rolled edges.
  for(const side of [-1,1]){
    const arm=new T.Group();arm.name='jacket-arm';arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    const sleeve=shell(arm,S.rows,sleeveFur,'jacket-sleeve',64);sleeve.userData.covering=true;
    const sp=sleeve.geometry.attributes.position;
    for(let k=0;k<sp.count;k++){const a=(k%65)/64*Math.PI*2,y=sp.getY(k),t=Math.max(0,1-(y-S.cuff[0])/S.gatherHeight),gg=1+S.gatherDepth*t*t*Math.cos(a*S.gathers)+B.ripple*Math.sin(4*a+11*y);sp.setX(k,sp.getX(k)*gg);sp.setZ(k,sp.getZ(k)*gg);}
    sp.needsUpdate=true;sleeve.geometry.computeVertexNormals();
    roundSleeveCap(sleeve,side,S.rows[0][0]);
    const [c0,c1]=S.cuff,[cx,cz]=S.cuffRadius;
    // A plump band: rounded in from the sleeve at its top, fullest in the middle, and rolled under at the wrist.
    const R=S.cuffRoll,cuff=shell(arm,[[c0+.006,cx-R,cz-R],[c0-.004,cx+R*.2,cz+R*.2],[(c0+c1)/2,cx+R*.6,cz+R*.6],[c1+.008,cx+R*.2,cz+R*.2],[c1,cx-R*1.3,cz-R*1.3]],trim,'fur-cuff',64);
    cuff.userData.covering=cuff.userData.cuff=true;
    jacket.add(arm);
  }
  return jacket;
}
