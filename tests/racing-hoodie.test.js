import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { TOP_TEMPLATES } from '../src/doll/top-templates.js';
const ID='polo-ralph-lauren-usrl-racing-hoodie-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
const box=o=>{const b=new T.Box3();o.traverse(m=>{if(m.isMesh)b.expandByObject(m);});return b;};

test('racing hoodie: colour-blocked fleece, raglan bands round the sleeves, a hood worn down, cords from eyelets, letters and patches',()=>{
  const g=GARMENTS[ID],spec=g.build;assert.equal(g.slot,'top');assert.ok(TOP_TEMPLATES[spec.template]);
  assert.ok(OUTFITS.some(look=>look.recipe.topId===ID),'a study preset wears it');
  const outfit=makeOutfit({topId:ID}),top=outfit.getObjectByName(ID);outfit.updateMatrixWorld(true);
  for(const [name,count] of [['hoodie-body',1],['ribbed-hem-band',1],['knit-jumper-sleeve',2],['ribbed-cuff',2],['hood',1],['hood-lining',1],['drawcord',2],['cord-eyelet',2],['cord-tip',2],
    ['applique-letters',1],['embroidered-signature',1],['round-badge',1],['eagle-patch',1],['flag-patch',1],['sleeve-patch',1],['hood-patch',1],['crew-neckband',1]])
    assert.equal(named(top,name).length,count,name);
  // The body's colour blocks, read down its texture at the centre front: white, red, black, blue, white.
  const {data,width,height}=named(top,'hoodie-body')[0].material.map.image,seq=[];
  const name=(r,g,b)=>r>150&&g>150?'white':r>80&&g<40?'red':b>80&&r<60?'blue':r<40&&g<40&&b<40?'black':null;
  for(let y=height-1;y>=0;y--){const i=(y*width+2)*4,n=name(data[i],data[i+1],data[i+2]);if(n&&seq.at(-1)!==n)seq.push(n);}
  assert.deepEqual(seq,['white','red','black','blue','white']);
  // Above the bands, the white yoke at the centre front gives way to the red raglan panels toward the sides.
  const row=Math.round(height*(spec.body.blocks.red+.04-spec.body.hem)/(spec.body.rows[0][0]-spec.body.hem)),px=x=>{const i=(row*width+x)*4;return name(data[i],data[i+1],data[i+2]);};
  assert.equal(px(2),'white');assert.equal(px(Math.round(width*.2)),'red');assert.equal(px(Math.round(width*.5)),'white','the back yoke');
  // The sleeves are banded too: red at the top, white toward the cuff.
  for(const sleeve of named(top,'knit-jumper-sleeve')){const m=sleeve.material.map.image,at=v=>{const i=(Math.round(v*(m.height-1))*m.width)*4;return name(m.data[i],m.data[i+1],m.data[i+2]);};
    assert.equal(at(1),'red');assert.equal(at(0),'white');}
  // Worn on its own, the hood lies on her back and the plain neckband is put away; the hood's patch faces back.
  const hood=named(top,'hood-down')[0];assert.ok(visible(hood)&&!visible(named(top,'jacket-neckband')[0]));
  assert.ok(box(named(hood,'hood')[0]).max.z<0&&box(named(top,'hood-patch')[0]).max.z<0,'the hood and its patch on her back');
  // The cords hang from eyelets down her chest, either side of the centre, ending above the red band.
  for(const tip of named(top,'cord-tip')){const p=tip.getWorldPosition(new T.Vector3());assert.ok(p.z>.15&&Math.abs(p.x)<.06&&p.y/.76>spec.body.blocks.red-.02,'cord end on her chest');}
  // The letters sit across the black band, centred; the badge and the eagle patch on her left (+x), the signature and
  // the flag patch on her right; the yellow patch on her left sleeve.
  const c=n=>box(named(top,n)[0]).getCenter(new T.Vector3()),L=c('applique-letters');
  assert.ok(Math.abs(L.x)<.05&&L.y/.76<spec.body.blocks.black&&L.y/.76>spec.body.blocks.blue,'letters on the black band');
  assert.ok(c('round-badge').x>0&&c('eagle-patch').x>0&&c('embroidered-signature').x<0&&c('flag-patch').x<0,'patches either side');
  assert.ok(named(top,'sleeve-patch')[0].parent.position.x>0,'the sleeve patch on her left sleeve');
  disposeObject(outfit);
});

test('racing hoodie under every jacket puts its hood and cords away and wears a narrow neckband inside the jacket',()=>{
  for(const id of Object.keys(GARMENTS).filter(k=>GARMENTS[k].slot==='outerwear'))for(const open of [false,true]){
    const outfit=makeOutfit({topId:ID,outerwearId:id,outerwearOpen:open}),top=outfit.getObjectByName(ID);
    assert.ok(!visible(named(top,'hood-down')[0]),`${id}: the hood is put away`);assert.ok(visible(named(top,'jacket-neckband')[0]),`${id}: the neckband is worn`);
    disposeObject(outfit);
  }
});
