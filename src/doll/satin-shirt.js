// Satin shirt (template 'satin-shirt'): an oversized button-down in a fluid satin of one colour, built on the button-down
// shirt template (makeShirt in src/doll/shirts.js) from the catalog `build`:
//   colour: the satin's colour; lustre: how much a tile's warp floats vary its colour (a faint grain along her height);
//   sheen: the sheen's colour; roughness: how soft its highlights are (satin is smoother than the crepe shirts);
//   and the shirt's own style fields (stitch, button, buttons, open, collar, rows, tucked, shirttail, sleeve,
//   sleeveFolds, cuff, backYoke, creases; see shirts.js).
// The satin is drawn in code: a plain colour with fine warp floats running down her, in the colour and in the bump.
// Worn open (`open`), her chest shows in the V: her body under clothes is cream felt, so the skin piece the open cardigan
// and the V-neck tees use fills it.
import { random, shell, cloth, SHOULDER_ROWS } from './model.js';
import { makeShirt } from './shirts.js';

const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const cache=new Map();
// One tile of satin: long, fine warp floats down the cloth, each a touch lighter or darker than the next, for the colour
// (`colour`) and the bump (`height`).
function satinData(colour,lustre,seed){
  const key=colour+':'+lustre+':'+seed;if(cache.has(key))return cache.get(key);
  const w=64,h=64,rand=random(seed),base=hex(colour),floats=[...Array(w)].map(()=>rand()-.5),c=new Uint8Array(w*h*4),b=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,f=floats[x]+.35*Math.sin((y/h+floats[(x+7)%w])*Math.PI*2);
    for(let k=0;k<3;k++)c[i+k]=Math.max(0,Math.min(255,Math.round(base[k]*(1+lustre*f))));c[i+3]=255;
    b[i]=b[i+1]=b[i+2]=Math.round(128+60*f);b[i+3]=255;}
  const out={colour:{data:c,w,h},height:{data:b,w,h}};cache.set(key,out);return out;
}
const satinShirt=({template,colour,lustre=.12,seed=1,sheen,roughness=.42,...rest})=>{const satin=()=>satinData(colour,lustre,seed);return {
  print:()=>satin().colour,around:8,high:.4,collarAround:4,sleeveAround:3,bump:[()=>satin().height,1,1,.0004],sheen:[sheen,.55,.35],roughness,
  facing:null,collarTopstitch:false,depth:.7,...rest};};
export function makeSatinShirt(id,build,skirt=false){
  const top=makeShirt(id,satinShirt(build),null,skirt);
  if(build.open)shell(top,SHOULDER_ROWS,cloth('#dfb195'),'bare-shoulder-skin',48);
  return top;
}
