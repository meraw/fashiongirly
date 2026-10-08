import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { levelCaster } from '../src/doll/level-caster.js';

test('levelCaster finds the same nearest hit as three.js for level rays, and falls back for any other ray',()=>{
  const outfit=makeOutfit({bottomId:'levis-94-wide-leg-v1',shoesId:'buffalo-aspha-mid-olive-v1'});outfit.updateMatrixWorld(true);
  const meshes=[];outfit.getObjectByName('trousers').traverse(o=>{if(o.isMesh)meshes.push(o);});
  meshes.push(new T.Mesh(new T.BoxGeometry(.1,.1,.1),new T.MeshBasicMaterial({side:T.FrontSide})));
  meshes.push(new T.Mesh(new T.SphereGeometry(.05),new T.MeshBasicMaterial({side:T.BackSide})));
  meshes.at(-2).position.set(.3,.5,0);meshes.at(-1).position.set(-.3,.6,0);meshes.slice(-2).forEach(m=>m.updateMatrixWorld(true));
  const fast=levelCaster(meshes),axis=new T.Vector3(0,1,0);let hits=0;
  // Rays out from around her centre line, level and tilted, and level rays through the box and the sphere from outside
  // and from inside (one culls its back faces, the other its front faces).
  const rays=[];
  for(let y=-.05;y<1.6;y+=.041)for(let a=0;a<Math.PI*2;a+=.83)for(const tilt of [0,.2])
    rays.push([new T.Vector3(Math.sin(a*3)*.05,y,Math.cos(a*5)*.05),new T.Vector3(Math.sin(a),tilt,Math.cos(a)).normalize().applyAxisAngle(axis,1e-4)]);
  for(const m of meshes.slice(-2))for(let dy=-.045;dy<.05;dy+=.01)for(const dir of [new T.Vector3(1,0,.01),new T.Vector3(-1,0,-.01)])
    for(const back of [.5,0])rays.push([m.position.clone().add(new T.Vector3(0,dy,.005)).addScaledVector(dir,-back),dir.clone().normalize()]);
  for(const [origin,dir] of rays){
    const want=new T.Raycaster(origin,dir).intersectObjects(meshes,false)[0],got=fast(origin,dir);
    assert.equal(!!got,!!want,`hit from ${origin.toArray().map(v=>v.toFixed(3))}`);
    if(want){hits++;assert.equal(got.object.id,want.object.id,`${got.object.name} instead of ${want.object.name}`);assert.ok(Math.abs(got.distance-want.distance)<1e-9);assert.ok(got.point.distanceTo(want.point)<1e-9);
      // The same face: its corners and its normal in the mesh's own space.
      assert.deepEqual([got.face.a,got.face.b,got.face.c],[want.face.a,want.face.b,want.face.c]);assert.ok(got.face.normal.distanceTo(want.face.normal)<1e-12);}
  }
  assert.ok(hits>100&&hits<rays.length,`${hits} of ${rays.length} rays hit`);disposeObject(outfit);
});

test('levelCaster around an axis: same first and last hits from the axis, and with faces "both" every triangle counts',()=>{
  const outfit=makeOutfit({topId:'tommy-stripe-knit-polo-v1',bottomId:'levis-94-wide-leg-v1',outerwearId:'desigual-black-faux-leather-jacket-v1'});outfit.updateMatrixWorld(true);
  const meshes=[];for(const name of ['outerwear','tommy-stripe-knit-polo-v1'])outfit.getObjectByName(name).traverse(o=>{if(o.isMesh&&!Array.isArray(o.material))meshes.push(o);});
  // A front-culled box and a back-culled sphere on her centre line, which the axis passes through.
  meshes.push(new T.Mesh(new T.BoxGeometry(.1,.1,.1),new T.MeshBasicMaterial({side:T.FrontSide})));
  meshes.push(new T.Mesh(new T.SphereGeometry(.05),new T.MeshBasicMaterial({side:T.BackSide})));
  meshes.at(-2).position.set(.01,1.1,0);meshes.at(-1).position.set(0,1.0,.02);meshes.slice(-2).forEach(m=>m.updateMatrixWorld(true));
  const fast=levelCaster(meshes,{axis:[0,0]}),raw=levelCaster(meshes,{axis:[0,0],faces:'both'}),axis=new T.Vector3(0,1,0);
  // Every triangle from both sides, as the coverage tests measured their surfaces.
  const tris=[];for(const m of meshes){const pos=m.geometry.attributes.position,idx=m.geometry.index,n=idx?idx.count:pos.count;
    for(let i=0;i+2<n;i+=3)tris.push([0,1,2].map(k=>new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld)));}
  const ray=new T.Ray(),hit=new T.Vector3();let hits=0,rays=0;
  for(let y=.93;y<1.5;y+=.047)for(let a=-Math.PI;a<Math.PI;a+=.53){
    const origin=new T.Vector3(0,y,0),dir=new T.Vector3(Math.sin(a),0,Math.cos(a)).applyAxisAngle(axis,1e-5);rays++;
    const all=new T.Raycaster(origin,dir).intersectObjects(meshes,false);
    for(const [got,want] of [[fast(origin,dir),all[0]],[fast(origin,dir,true),all.at(-1)]]){
      assert.equal(!!got,!!want,`hit at y ${y.toFixed(3)}, angle ${a.toFixed(2)}`);
      if(want){hits++;assert.equal(got.object.id,want.object.id,`${got.object.name} instead of ${want.object.name}`);assert.ok(Math.abs(got.distance-want.distance)<1e-9);}
    }
    ray.set(origin,dir);let near=0,far=0;for(const [p0,p1,p2] of tris)if(ray.intersectTriangle(p0,p1,p2,false,hit)){const d=hit.distanceTo(origin);if(!near||d<near)near=d;far=Math.max(far,d);}
    assert.ok(Math.abs((raw(origin,dir)?.distance||0)-near)<1e-9,`nearest, faces both, at y ${y.toFixed(3)}`);
    assert.ok(Math.abs((raw(origin,dir,true)?.distance||0)-far)<1e-9,`farthest, faces both, at y ${y.toFixed(3)}`);
  }
  assert.ok(hits>rays,`${hits} hits from ${rays} rays`);disposeObject(outfit);
  // A single tilted triangle that surrounds the axis (seen from above) can be hit from it at any angle.
  const tilted=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([-.1,1.25,-.06,.1,1.3,-.06,0,1.35,.12],3));
  const tri=[new T.Mesh(tilted,new T.MeshBasicMaterial({side:T.DoubleSide}))],around=levelCaster(tri,{axis:[0,0]});let reached=0;
  for(let y=1.252;y<1.35;y+=.007)for(let a=-Math.PI;a<Math.PI;a+=.13){
    const origin=new T.Vector3(0,y,0),dir=new T.Vector3(Math.sin(a),0,Math.cos(a)),want=new T.Raycaster(origin,dir).intersectObjects(tri,false)[0];
    assert.equal(!!around(origin,dir),!!want,`tilted triangle at y ${y.toFixed(3)}, angle ${a.toFixed(2)}`);if(want)reached++;}
  assert.ok(reached>50,`reached ${reached}`);
});
