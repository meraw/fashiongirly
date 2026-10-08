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
    if(want){hits++;assert.equal(got.object.id,want.object.id,`${got.object.name} instead of ${want.object.name}`);assert.ok(Math.abs(got.distance-want.distance)<1e-9);assert.ok(got.point.distanceTo(want.point)<1e-9);}
  }
  assert.ok(hits>100&&hits<rays.length,`${hits} of ${rays.length} rays hit`);disposeObject(outfit);
});
