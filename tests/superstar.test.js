import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeDoll, makeOutfit, disposeObject, fitDoll } from '../src/doll/model.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { GARMENTS, ADIDAS_SUPERSTAR_PINK_ID } from '../src/wardrobe/catalog.js';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};
const points=mesh=>{const pos=mesh.geometry.attributes.position,out=[];for(let i=0;i<pos.count;i++)out.push(new T.Vector3().fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld));return out;};

test('pink Superstars: shell toe with ridges, three slanted stitched stripes with holes, punched eyelets, cupsole lines, her own ankle socks',()=>{
  const g=GARMENTS[ADIDAS_SUPERSTAR_PINK_ID],spec=g.build;assert.equal(g.slot,'shoes');assert.ok(OUTFITS.some(look=>look.recipe.shoesId===ADIDAS_SUPERSTAR_PINK_ID),'a study preset wears them');
  const outfit=makeOutfit({shoesId:ADIDAS_SUPERSTAR_PINK_ID}),doll=makeDoll();fitDoll(doll,outfit);doll.updateMatrixWorld(true);outfit.updateMatrixWorld(true);
  const shoes=outfit.getObjectByName('shoes'),per=2*2;// both sides of both shoes
  for(const [name,count] of [['boot-upper',2],['lug-sole',2],['shell-toe',2],['shell-toe-edge',2],['stripe',per*3],['stripe-stitch',per*3*2],['stripe-hole',per*3*spec.stripes.holes.length],['sole-line',2*spec.soleLines.length],['panel-seam',per*spec.seams.length],['eyelet',per*spec.eyelets.length],['tongue',2],['tongue-label',2],['ankle-sock',2]])
    assert.equal(named(shoes,name).length,count,name);
  for(const name of ['quilt-stitch','heel-tab','webbing-loop','zip-placket','pull-loop'])assert.equal(named(shoes,name).length,0,name);
  // Punched eyelets in the suede, not metal rings.
  assert.ok(!named(shoes,'eyelet')[0].material.metalness);
  // Not raised; her round doll socks give way to the shoe's slim ankle socks.
  assert.ok(!outfit.userData.lift);assert.equal(doll.position.y,0);doll.traverse(o=>{if(o.name==='sock')assert.equal(o.visible,false);});
  const uppers=named(shoes,'boot-upper'),ray=new T.Raycaster(),centre=(p,s)=>new T.Vector3(s*spec.cx*1.06,p.y,.06);
  // Distance from the shoe's middle at a point's height to the upper, along the ray through the point.
  const upperAt=p=>{const s=Math.sign(p.x),o=centre(p,s),d=p.clone().sub(o);ray.set(o,d.clone().normalize());const hit=ray.intersectObjects(uppers,false).find(h=>Math.sign(h.point.x)===s);return hit&&{gap:d.length()-hit.distance};};
  // Each stripe lies just on the upper and leans toward the toe: its top is further forward than its bottom.
  for(const stripe of named(shoes,'stripe')){const pts=points(stripe);let checked=0;
    for(const p of pts.filter((_,i)=>i%5===0)){const u=upperAt(p);if(!u)continue;assert.ok(u.gap>0&&u.gap<.008,`stripe sits on the upper (${u.gap.toFixed(4)})`);checked++;}
    assert.ok(checked>10);
    const low=pts.reduce((a,b)=>b.y<a.y?b:a),high=pts.reduce((a,b)=>b.y>a.y?b:a);assert.ok(high.z>low.z+.025,'leans toward the toe');}
  // The shell toe covers the toe, from the sole to a back edge across the top, never sinks into the upper, and stands
  // off it by varying amounts (raised ribs between grooves).
  const front=Math.max(...uppers.flatMap(points).map(p=>p.z));
  for(const shell of named(shoes,'shell-toe')){const pts=points(shell),gaps=[],nrm=shell.geometry.attributes.normal,n=new T.Vector3();
    assert.ok(Math.max(...pts.map(p=>p.z))>front,'over the toe tip');assert.ok(Math.min(...pts.map(p=>p.z))>spec.shellToe.edge[0][1]-.05,'only the toe');
    assert.ok(Math.min(...pts.map(p=>p.y))<(spec.sole.rand+.002)*.76,'down to the sole');
    pts.forEach((p,i)=>{if(p.y<(spec.sole.rand+.02)*.76)return;const u=upperAt(p);if(u)assert.ok(u.gap>-.001,`shell toe sinks into the upper (${u.gap.toFixed(4)})`);
      // Its distance from the upper along its own normal.
      n.fromBufferAttribute(nrm,i).transformDirection(shell.matrixWorld);let best=Infinity;
      for(const d of [n,n.clone().negate()]){ray.set(p,d);const hit=ray.intersectObjects(uppers,false)[0];if(hit&&hit.distance<.02)best=Math.min(best,hit.distance);}
      // The ribs: across the front of the toe, a band of height away from the sole and the top.
      if(best<Infinity&&Math.abs(p.y/.76-(spec.sole.rand+spec.shellToe.top)/2)<.012)gaps.push(best);});
    assert.ok(gaps.length>30&&Math.max(...gaps)<.008&&Math.max(...gaps)-Math.min(...gaps)>.002,`ridged, on the toe (${Math.min(...gaps).toFixed(4)}..${Math.max(...gaps).toFixed(4)})`);}
  // Her ankle socks sit inside the shoe below its collar.
  let inside=0;for(const sock of named(shoes,'ankle-sock'))for(const p of points(sock)){const y=p.y/.76;if(y<spec.sole.top+.03||y>spec.collar.side-.02)continue;const u=upperAt(p);if(!u)continue;assert.ok(u.gap<0,'sock shows through the shoe');inside++;}
  assert.ok(inside>20,`checked ${inside}`);
  [outfit,doll].forEach(disposeObject);
});
