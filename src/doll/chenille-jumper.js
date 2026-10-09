// Chenille high-neck jumper: a boxy, cropped jumper in soft grey chenille, with a ribbed stand-up (mock) collar, a deep
// ribbed hem band and long ribbed cuffs. The chenille is drawn here in code from the reference reading (not copied from
// the photo): rows of plump, velvety loops that catch the light unevenly, with darker gaps between the rows.
// Built in outfit units like the other tops (makeOutfit scales the whole outfit by 1.06 across and .76 high).
//
// Her big head sits low over her shoulders and hides a collar the width of her neck. This collar flares out from her
// shoulders and stands clear of her head, so it shows under her chin and at the sides, as a mock neck does on a person.
import * as T from 'three';
import { random, shell, ribbed, roundSleeveCap, easeOverHand } from './model.js';

const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const pixels=new Map();
// One tile of chenille: `rows` knitted rows of `loops` loops each. A loop is a soft horizontal bump whose brightness
// varies loop to loop, as the pile catches the light. Ribbed tiles (`rib`) instead run in vertical columns: a raised
// ridge of loops and a narrow dark groove.
function chenilleData(colour,rib){
  const key=colour+(rib?':rib':'');if(pixels.has(key))return pixels.get(key);
  const w=128,h=128,base=hex(colour),rand=random(rib?57:43),col=new Uint8Array(w*h*4),hgt=new Uint8Array(w*h*4);
  const loops=rib?4:6,rows=rib?16:10,lw=w/loops,lh=h/rows,shine=Array.from({length:loops*rows*2},()=>rand());
  // Loop edges along each row (in pixels, from a random start; the last edge closes the tile), and each loop's lift.
  const edges=Array.from({length:rows},()=>{const start=rand()*w,cuts=[0];for(let k=1;k<loops;k++)cuts.push((k+(rand()-.5)*.6)*lw);cuts.push(w);return cuts.map(c=>start+c);});
  const lift=Array.from({length:loops*rows},()=>(rand()-.5)*.3);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let v;
    if(rib){// columns: ridge across most of the width, groove between; loops stacked up each ridge
      const cx=(x%lw)/lw,ry=(y%lh)/lh,r=Math.floor(y/lh),c=Math.floor(x/lw),ridge=Math.max(0,Math.sin(Math.PI*Math.min(1,cx/.8)));
      v=ridge*(.55+.45*Math.sin(Math.PI*ry))*(.75+.5*shine[(r*loops+c)%shine.length]);
    }else{
      // Each row's loops vary in length and sit a little higher or lower, so the rows read as soft, uneven pile.
      const r=Math.floor(y/lh),ry=(y%lh)/lh,e=edges[r],xx=(x-e[0]+w)%w;let c=0;while(c<loops-1&&xx>=e[c+1]-e[0])c++;
      const cx=(xx-(e[c]-e[0]))/(e[c+1]-e[c]),dy=Math.min(1,Math.max(0,ry+lift[r*loops+c]));
      v=Math.sin(Math.PI*cx)**.4*Math.sin(Math.PI*dy)**.6*(.78+.44*shine[(r*loops+c)%shine.length]);
    }
    const i=(y*w+x)*4,fleck=1+(rand()-.5)*.12,shade=(.58+.55*Math.min(1.2,v))*fleck;
    for(let k=0;k<3;k++)col[i+k]=Math.max(0,Math.min(255,base[k]*shade));col[i+3]=255;
    hgt[i]=hgt[i+1]=hgt[i+2]=Math.round(Math.max(0,Math.min(1,v))*255);hgt[i+3]=255;
  }
  // Soft pile: blur both maps a little, wrapping round the tile.
  for(const m of [col,hgt]){const src=m.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let k=0;k<3;k++){let sum=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)sum+=src[(((y+dy+h)%h)*w+((x+dx+w)%w))*4+k];m[(y*w+x)*4+k]=sum/9;}}
  const out={col,hgt,w,h};pixels.set(key,out);return out;
}
function chenille(colour,sheen,repeatU,repeatV,rib=false){
  const {col,hgt,w,h}=chenilleData(colour,rib),[map,bump]=[col,hgt].map((data,n)=>{const t=new T.DataTexture(data,w,h,T.RGBAFormat);if(!n)t.colorSpace=T.SRGBColorSpace;
    t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeatU,repeatV);t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;});
  // Velvety pile: a soft sheen over a matte base.
  return new T.MeshPhysicalMaterial({map,bumpMap:bump,bumpScale:.03,roughness:.92,sheen:.7,sheenColor:new T.Color(sheen),sheenRoughness:.55,side:T.DoubleSide});
}
const byHeight=(mesh,low,high)=>{const uv=mesh.geometry.attributes.uv,p=mesh.geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setY(i,Math.max(0,Math.min(1,(p.getY(i)-low)/(high-low))));uv.needsUpdate=true;return mesh;};

export function makeChenilleJumper(id,spec){
  const top=new T.Group();top.name=id;
  const B=spec.body,K=spec.collar,S=spec.sleeve,C=spec.colours,hem=B.hem,band=B.band,neck=B.rows[0][0];
  // Loops about the same size everywhere: the textures repeat by each piece's length and girth.
  const knit=(u,v)=>chenille(C.yarn,C.sheen,u,v),rib=(u,v)=>chenille(C.yarn,C.sheen,u,v,true);
  const body=shell(top,B.rows,knit(B.loops,(neck-hem-band)/B.rowPitch),'chenille-body',128);byHeight(body,hem+band,neck);
  // The deep rib band gathers a little narrower than the body, which blouses over it.
  ribbed(byHeight(shell(top,[[hem+band+.01,...B.bandRadius],[hem+band/2,...B.bandRadius],[hem,...B.bandRadius]],rib(B.ribs/4,band/.03),'ribbed-hem-band',B.ribs*8),hem,hem+band),B.ribs,.009);
  // The stand-up collar: a ribbed tube from the shoulders up round her neck, its top edge rolled. It stands out wide
  // enough to show under her chin. Under a jacket it would push through the jacket's collar, so the jumper also carries
  // a narrow collar, as wide as the other tops' necks: the jacket wears that one instead (userData.underJacket, read by
  // makeOuterwear).
  const collarRib=rib(K.ribs/4,(K.rows[0][0]-K.rows.at(-1)[0])/.03);
  for(const [rows,underJacket,ribs] of [[K.rows,false,K.ribs],[K.narrow,true,K.narrowRibs]]){
    const group=new T.Group();group.name=underJacket?'narrow-collar':'stand-collar';group.userData.underJacket=underJacket;group.visible=!underJacket;top.add(group);
    ribbed(byHeight(shell(group,rows,collarRib,'ribbed-stand-collar',ribs*8),rows.at(-1)[0],rows[0][0]),ribs,.014);
    const [ty,trx,trz]=rows[0];shell(group,[[ty+.005,trx-.001,trz-.001],[ty+.003,trx+.005,trz+.005],[ty-.008,trx+.006,trz+.006]],collarRib,'collar-roll',128);
  }
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.242,1.815,0);arm.rotation.z=side*.22;
    // Relaxed sleeves, blousing slightly over long ribbed cuffs that gather at her wrist.
    const yt=S.rows[0][0],yb=S.rows.at(-1)[0],sleeve=shell(arm,S.rows,knit(S.loops,(yt-yb)/B.rowPitch),'knit-jumper-sleeve',96);
    roundSleeveCap(sleeve,side,yt);byHeight(sleeve,yb,yt);
    const cy0=S.cuff[0][0],cy1=S.cuff.at(-1)[0];
    easeOverHand(ribbed(byHeight(shell(arm,S.cuff,rib(S.cuffRibs/4,(cy0-cy1)/.03),'ribbed-cuff',S.cuffRibs*8),cy1,cy0),S.cuffRibs,.03),side);
    top.add(arm);
  }
  return top;
}
