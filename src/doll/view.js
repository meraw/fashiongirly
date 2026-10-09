import { createHairController } from '../hair/model.js';
import * as T from 'three';
import { LILAC_ATLAS } from '../wardrobe/lilac-atlas.js';
import { BRONZE_TOP_ID, LILAC_TOP_ID, BARREL_JEANS_ID, DAVINIA_JEANS_ID, LEVIS_94_ID, TOMMY_MOM_ID, STRADIVARIUS_RELAXED_ID, MANGO_BLACK_JEANS_ID, BERSHKA_GREY_ID, TOMMY_CARPENTER_ID, ZARA_CARGO_ID, CRYSTAL_JEANS_ID, PLEATED_LINEN_ID } from '../wardrobe/catalog.js';
import { BERSHKA_GREY_DENIM } from '../wardrobe/bershka-grey-denim.js';
import { TOMMY_CARPENTER_DENIM } from '../wardrobe/tommy-carpenter-denim.js';
import { ZARA_CARGO_FABRIC } from '../wardrobe/zara-cargo-fabric.js';
import { CRYSTAL_JEANS_DENIM } from '../wardrobe/crystal-jeans-denim.js';
import { PLEATED_LINEN_FABRIC } from '../wardrobe/pleated-linen-fabric.js';
import { MANGO_DENIM } from '../wardrobe/mango-denim.js';
import { STRADIVARIUS_DENIM } from '../wardrobe/stradivarius-denim.js';
import { TOMMY_MOM_DENIM } from '../wardrobe/tommy-mom-denim.js';
import { LEVIS_94_DENIM } from '../wardrobe/levis-94-denim.js';
import { DAVINIA_DENIM } from '../wardrobe/desigual-davinia-denim.js';
import { TOPSHOP_DENIM } from '../wardrobe/topshop-denim.js';
import { BRONZE_ATLAS } from '../wardrobe/bronze-atlas.js';
import { BUFFALO_ASPHA_ID } from '../wardrobe/catalog.js';
import { BUFFALO_TAPE } from '../wardrobe/buffalo-tape.js';
import { makeDoll, makeOutfit, disposeObject, fitDoll } from './model.js';
export async function createDollView(host, recipe) {
  const atlas={};
  try { for(const [id,data] of [[BRONZE_TOP_ID,BRONZE_ATLAS],[LILAC_TOP_ID,LILAC_ATLAS],[BARREL_JEANS_ID,TOPSHOP_DENIM],[DAVINIA_JEANS_ID,DAVINIA_DENIM],[LEVIS_94_ID,LEVIS_94_DENIM],[TOMMY_MOM_ID,TOMMY_MOM_DENIM],[STRADIVARIUS_RELAXED_ID,STRADIVARIUS_DENIM],[MANGO_BLACK_JEANS_ID,MANGO_DENIM],[BERSHKA_GREY_ID,BERSHKA_GREY_DENIM],[TOMMY_CARPENTER_ID,TOMMY_CARPENTER_DENIM],[ZARA_CARGO_ID,ZARA_CARGO_FABRIC],[CRYSTAL_JEANS_ID,CRYSTAL_JEANS_DENIM],[PLEATED_LINEN_ID,PLEATED_LINEN_FABRIC]]){atlas[id]=await new T.TextureLoader().loadAsync(data);atlas[id].colorSpace=T.SRGBColorSpace;} }
  catch(error){Object.values(atlas).forEach(t=>t.dispose());throw error;}
  // Shoe textures.
  try { for(const [id,data] of [[BUFFALO_ASPHA_ID,BUFFALO_TAPE]]){atlas[id]=await new T.TextureLoader().loadAsync(data);atlas[id].colorSpace=T.SRGBColorSpace;} }
  catch(error){Object.values(atlas).forEach(t=>t.dispose());throw error;}
  let renderer;
  try { renderer=new T.WebGLRenderer({antialias:true,alpha:true}); }
  catch { Object.values(atlas).forEach(t=>t.dispose());throw new Error('This device could not start the 3D view. Try a browser with WebGL 2 enabled.'); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label','Dressable 3D doll. Drag to turn her, or use the view buttons.');renderer.domElement.setAttribute('role','img');
  renderer.domElement.style.touchAction='pan-y';host.append(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(31,1,.1,30);camera.position.set(0,1.35,5.3);camera.lookAt(0,1.2,0);
  scene.add(new T.HemisphereLight('#fff7e7','#b5a8aa',2.8));
  const key=new T.DirectionalLight('#fff3de',3.5);key.position.set(-2,4,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-2,right:2,top:3,bottom:-1,near:.1,far:10});key.shadow.normalBias=.022;key.shadow.bias=-.0002;scene.add(key);
  const fill=new T.DirectionalLight('#e9e7ff',1.4);fill.position.set(3,2,2);scene.add(fill);
  const rim=new T.DirectionalLight('#fff4df',2);rim.position.set(-1,3,-2);scene.add(rim);
  const floor=new T.Mesh(new T.PlaneGeometry(20,20),new T.ShadowMaterial({opacity:.13}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=.004;scene.add(floor);
  const model=new T.Group();scene.add(model);const doll=makeDoll();model.add(doll);const hair=createHairController(doll);hair.update(recipe.hairId);let outfit=makeOutfit(recipe,atlas);model.add(outfit);fitDoll(doll,outfit);
  const clothingKey=state=>JSON.stringify({...state,hairId:undefined});let lastClothing=clothingKey(recipe);
  let angle=-.12,target=angle,frame=null,closed=false,drag=null;
  const draw=()=>{frame=null;if(closed)return;model.rotation.y=angle;renderer.render(scene,camera);};
  const render=()=>{if(!closed&&frame==null)frame=requestAnimationFrame(draw);};
  const resize=()=>{const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=camera.aspect<.65?6.2:5.3;camera.updateProjectionMatrix();render();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const down=e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,angle};renderer.domElement.setPointerCapture(e.pointerId);};
  const move=e=>{if(!drag)return;if(Math.abs(e.clientY-drag.y)>Math.abs(e.clientX-drag.x)+15)return;angle=drag.angle+(e.clientX-drag.x)*.012;target=angle;render();};
  const up=()=>{drag=null;};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
  const lost=e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('view-error',{detail:'The 3D view was interrupted. Reload the page to restore it.'}));};renderer.domElement.addEventListener('webglcontextlost',lost);
  return {
    update(next){hair.update(next.hairId);const key=clothingKey(next);if(key!==lastClothing){const replacement=makeOutfit(next,atlas);model.remove(outfit);disposeObject(outfit);outfit=replacement;model.add(outfit);fitDoll(doll,outfit);lastClothing=key;}render();},
    turn(degrees){target=degrees*Math.PI/180;angle=target;render();},
    dispose(){if(closed)return;closed=true;cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);renderer.domElement.removeEventListener('webglcontextlost',lost);hair.dispose();disposeObject(model);Object.values(atlas).forEach(t=>t.dispose());disposeObject(floor);key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}

