import { createHairController } from '../hair/model.js';
import * as T from 'three';
import { BRONZE_TOP_ID, LILAC_TOP_ID, VANGOGH_TEE_ID, DESIGUAL_FRESCO_TEE_ID, DESIGUAL_MOUNTAIN_SHIRT_ID, BARREL_JEANS_ID, DAVINIA_JEANS_ID, LEVIS_94_ID, TOMMY_MOM_ID, STRADIVARIUS_RELAXED_ID, MANGO_BLACK_JEANS_ID, BERSHKA_GREY_ID, TOMMY_CARPENTER_ID, ZARA_CARGO_ID, CRYSTAL_JEANS_ID, NIKE_TRACK_ID, TOPSHOP_BLACK_CROP_ID, PLEATED_LINEN_ID, BUFFALO_ASPHA_ID, GARMENTS } from '../wardrobe/catalog.js';
import { makeDoll, makeOutfit, disposeObject, fitDoll, setExpression } from './model.js';
import { expressionFor } from './face.js';
import { canTuck, cleanRecipe } from './recipe.js';
import { lightScene } from './light.js';
import { pose } from './pose.js';
// Each garment's texture module, by garment. Only the textures of what she wears are downloaded, when she wears it,
// so the doll appears after a small download, and one texture that fails to arrive cannot stop her appearing.
// Garments kept in their own files (src/wardrobe/garments) name theirs: `atlas: [path from this file, export name]`.
const TEXTURES = {
  [BRONZE_TOP_ID]: ['../wardrobe/bronze-atlas.js', 'BRONZE_ATLAS'],
  [LILAC_TOP_ID]: ['../wardrobe/lilac-atlas.js', 'LILAC_ATLAS'],
  [VANGOGH_TEE_ID]: ['../wardrobe/vangogh-tee-atlas.js', 'VANGOGH_TEE_ATLAS'],
  [DESIGUAL_FRESCO_TEE_ID]: ['../wardrobe/fresco-tee-atlas.js', 'FRESCO_TEE_ATLAS'],
  [DESIGUAL_MOUNTAIN_SHIRT_ID]: ['../wardrobe/mountain-shirt-atlas.js', 'MOUNTAIN_SHIRT_ATLAS'],
  [BARREL_JEANS_ID]: ['../wardrobe/topshop-denim.js', 'TOPSHOP_DENIM'],
  [DAVINIA_JEANS_ID]: ['../wardrobe/desigual-davinia-denim.js', 'DAVINIA_DENIM'],
  [LEVIS_94_ID]: ['../wardrobe/levis-94-denim.js', 'LEVIS_94_DENIM'],
  [TOMMY_MOM_ID]: ['../wardrobe/tommy-mom-denim.js', 'TOMMY_MOM_DENIM'],
  [STRADIVARIUS_RELAXED_ID]: ['../wardrobe/stradivarius-denim.js', 'STRADIVARIUS_DENIM'],
  [MANGO_BLACK_JEANS_ID]: ['../wardrobe/mango-denim.js', 'MANGO_DENIM'],
  [BERSHKA_GREY_ID]: ['../wardrobe/bershka-grey-denim.js', 'BERSHKA_GREY_DENIM'],
  [TOMMY_CARPENTER_ID]: ['../wardrobe/tommy-carpenter-denim.js', 'TOMMY_CARPENTER_DENIM'],
  [ZARA_CARGO_ID]: ['../wardrobe/zara-cargo-fabric.js', 'ZARA_CARGO_FABRIC'],
  [CRYSTAL_JEANS_ID]: ['../wardrobe/crystal-jeans-denim.js', 'CRYSTAL_JEANS_DENIM'],
  [NIKE_TRACK_ID]: ['../wardrobe/nike-track-fabric.js', 'NIKE_TRACK_FABRIC'],
  [TOPSHOP_BLACK_CROP_ID]: ['../wardrobe/topshop-black-crop-denim.js', 'TOPSHOP_BLACK_CROP_DENIM'],
  [PLEATED_LINEN_ID]: ['../wardrobe/pleated-linen-fabric.js', 'PLEATED_LINEN_FABRIC'],
  [BUFFALO_ASPHA_ID]: ['../wardrobe/buffalo-tape.js', 'BUFFALO_TAPE'],
};
const textureModule = id => TEXTURES[id] || GARMENTS[id]?.atlas || null;
// A module that failed to download stays failed for the life of the page, so the retry asks for it at a new address.
async function importWithRetry(path) {
  try { return await import(path); }
  catch { return import(`${path}?retry=${Date.now()}`); }
}
const worn = r => [r.topId, r.underTopId, r.bottomId, r.dressId, r.shoesId, r.outerwearId].filter(id => id && id !== 'none' && id !== 'classic');
export async function createDollView(host, recipe) {
  const atlas={},loading=new Map();let closed=false;
  // Load one garment's texture once; if it cannot be had, the garment is drawn without it and tried again next time.
  const loadTexture=id=>{
    const mod=textureModule(id);if(!mod||atlas[id])return null;
    if(!loading.has(id))loading.set(id,(async()=>{
      try{const data=(await importWithRetry(mod[0]))[mod[1]];const texture=await new T.TextureLoader().loadAsync(data);texture.colorSpace=T.SRGBColorSpace;if(closed)texture.dispose();else atlas[id]=texture;}
      catch(error){host.dispatchEvent(new CustomEvent('texture-error',{detail:{id,message:error?.message||String(error)}}));}
      finally{loading.delete(id);}
    })());
    return loading.get(id);
  };
  const texturesFor=r=>Promise.all(worn(r).map(loadTexture));
  await texturesFor(recipe);
  let renderer;
  try { renderer=new T.WebGLRenderer({antialias:true,alpha:true}); }
  catch { Object.values(atlas).forEach(t=>t.dispose());throw new Error('This device could not start the 3D view. Try a browser with WebGL 2 enabled.'); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label','Dressable 3D doll. Drag to turn her, or use the view buttons.');renderer.domElement.setAttribute('role','img');
  renderer.domElement.style.touchAction='pan-y';host.append(renderer.domElement);
  // The camera stands at her chest with a longer lens, a little below her middle, so she has air around her and her
  // proportions are not stretched: the way a collectible doll is photographed. Her world's light is in light.js.
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(24,1,.1,40);camera.position.set(0,1.05,7.5);camera.lookAt(0,1.25,0);
  const light=lightScene(scene,renderer);
  // She stands in a resting pose (pose.js): her body is posed once, each hairstyle when it is put on, and every
  // outfit after it is fitted, all by the same field, so clothes and hair stay with the body.
  // All of it is posed in the model group's space, her world's units (the wardrobe's own group is scaled to her toy
  // proportions, so its local space would stretch the field), less the lift her shoes give her.
  const model=new T.Group();scene.add(model);const doll=makeDoll();model.add(doll);pose(doll,model);const hair=createHairController(doll);
  const poseHair=()=>{const h=doll.getObjectByName('outfit-hair');if(h&&!h.userData.posed){h.userData.posed=true;pose(h,model,doll.position.y);}};
  const dress=next=>{const worn=makeOutfit(next,atlas);model.add(worn);fitDoll(doll,worn);pose(worn,model,doll.position.y);return worn;};
  hair.update(recipe.hairId);poseHair();let outfit=dress(recipe),current=cleanRecipe(recipe);
  const clothingKey=state=>JSON.stringify({...state,hairId:undefined});let lastClothing=clothingKey(recipe);
  let angle=-.12,target=angle,frame=null,drag=null,pending=0;
  const draw=()=>{frame=null;if(closed)return;model.rotation.y=angle;renderer.render(scene,camera);};
  const render=()=>{if(!closed&&frame==null)frame=requestAnimationFrame(draw);};
  // The canvas covers the page; she is framed within #frame, the part of the page that is hers (the layout moves it:
  // above the sheet on a phone, left of the panel on a wider screen). The rest of the canvas shows what lies beyond
  // the frame, as a window would. Where her feet and the ground behind her land on the page is told to the stylesheet
  // (--feet-y, --horizon-y, --doll-x), so the painted meadow and mountains sit exactly where she stands.
  const doc=host.ownerDocument,stageFrame=doc.getElementById('frame'),point=new T.Vector3();
  const place=(width,height)=>{camera.updateMatrixWorld();const at=(x,y,z)=>{point.set(x,y,z).project(camera);return [(point.x+1)/2*width,(1-point.y)/2*height];};
    const [dollX,feet]=at(0,0,0),[,horizon]=at(0,0,-2.4),style=doc.documentElement.style;
    style.setProperty('--feet-y',`${feet.toFixed(1)}px`);style.setProperty('--horizon-y',`${horizon.toFixed(1)}px`);style.setProperty('--doll-x',`${dollX.toFixed(1)}px`);
    // The foreground in front of her is sized to her part of the page.
    style.setProperty('--frame-w',`${(stageFrame?stageFrame.getBoundingClientRect().width:width).toFixed(1)}px`);};
  const resize=()=>{const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height);
    const h=host.getBoundingClientRect(),f=stageFrame?stageFrame.getBoundingClientRect():h,fw=Math.max(1,f.width),fh=Math.max(1,f.height);
    camera.aspect=fw/fh;camera.position.z=camera.aspect<.65?8.8:7.5;camera.setViewOffset(fw,fh,h.left-f.left,h.top-f.top,width,height);camera.updateProjectionMatrix();place(width,height);render();};
  const observer=new ResizeObserver(resize);observer.observe(host);if(stageFrame)observer.observe(stageFrame);resize();
  // The lights follow the weather the scene shows (src/today/sky.js says when it changes).
  // Her face follows the weather too (face.js). Her world and its hour come from src/today/world.js.
  const onWeather=e=>{const lit=light.setWeather(e.detail?.kind),face=setExpression(doll,expressionFor(e.detail||{}));if(lit||face)render();};doc.addEventListener('weather-change',onWeather);
  // Her felt's fibres are drawn unlit, so they are dimmed with the light, or they would speckle her face at night.
  const fibres=[];doll.traverse(o=>{if(o.name==='felt-fibres')fibres.push([o.material,o.material.opacity]);});
  const dimFibres=w=>{for(const [m,o] of fibres)m.opacity=o*(1-.8*(w?.night??0));};
  const onWorld=e=>{dimFibres(e.detail?.weights);if(light.setWorld(e.detail?.world,e.detail?.weights))render();};doc.addEventListener('world-change',onWorld);
  const root=doc.documentElement,shown=root.dataset.weights?.split(',').map(Number);
  if(root.dataset.world&&shown?.length===3){const w={golden:shown[0],day:shown[1],night:shown[2],dawn:root.dataset.dawn==='true'};light.setWorld(root.dataset.world,w);dimFibres(w);}
  // The weather may have been painted before she was: take it, and her face, from the sky.
  const sky=doc.getElementById('sky');light.setWeather(sky?.dataset.kind||'none');
  setExpression(doll,expressionFor({kind:sky?.dataset.kind,feels:sky?.dataset.feels?Number(sky.dataset.feels):null}));
  // A tap (a press that barely moves) on what she wears tells the page which garment it was (its id: a layer's
  // `userData.garmentId`, else its name): the first thing the tap
  // meets, her body and hair included, so a closed coat over her top is the coat. Tapping her top tucks it in or out;
  // tapping her jacket opens or closes it.
  const ray=new T.Raycaster(),pointer=new T.Vector2();
  const garmentAt=e=>{const box=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);
    model.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);
    // Only solid surfaces count: her felt's fibres and other lines and points would catch every tap near them.
    const shown=o=>{if(!o.isMesh)return false;for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
    const hit=ray.intersectObject(model,true).find(h=>shown(h.object));if(!hit)return null;
    let o=hit.object;while(o.parent&&o.parent!==outfit)o=o.parent;return o.parent===outfit?o.userData.garmentId??o.name:null;};
  // What a tap can change: her top (tucked in or out) and her jacket (open or closed).
  let hover=null;const tappable=id=>id&&(id===current.topId&&current.dressId==='none'&&canTuck(id)||id===current.outerwearId&&!!GARMENTS[id]?.layering?.canOpen);
  const down=e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,angle,time:performance.now()};renderer.domElement.setPointerCapture(e.pointerId);};
  const move=e=>{
    // Over a top that can be tucked or a jacket that can open, the pointer shows it can be tapped.
    if(!drag&&e.pointerType==='mouse'&&(tappable(current.topId)||tappable(current.outerwearId))&&hover==null)hover=requestAnimationFrame(()=>{hover=null;renderer.domElement.style.cursor=tappable(garmentAt(e))?'pointer':'';});
    if(!drag)return;if(Math.abs(e.clientY-drag.y)>Math.abs(e.clientX-drag.x)+15)return;angle=drag.angle+(e.clientX-drag.x)*.012;target=angle;render();};
  const up=e=>{const start=drag;drag=null;
    if(e?.type==='pointerup'&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<8&&performance.now()-start.time<600){const id=garmentAt(e);if(id)host.dispatchEvent(new CustomEvent('garment-tap',{detail:{id}}));}};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
  const lost=e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('view-error',{detail:'The 3D view was interrupted. Reload the page to restore it.'}));};renderer.domElement.addEventListener('webglcontextlost',lost);
  // Phones can take the 3D context away while the app is in the background; when it comes back, draw her again.
  const restored=()=>{host.dispatchEvent(new CustomEvent('view-restored'));render();};renderer.domElement.addEventListener('webglcontextrestored',restored);
  return {
    // A new outfit is built once its textures have arrived (usually at once); only the latest request is built.
    update(next){hair.update(next.hairId);poseHair();current=cleanRecipe(next);const key=clothingKey(next);if(key!==lastClothing){lastClothing=key;const ticket=++pending;texturesFor(next).then(()=>{if(closed||ticket!==pending)return;const replacement=dress(next);model.remove(outfit);disposeObject(outfit);outfit=replacement;render();});}render();},
    turn(degrees){target=degrees*Math.PI/180;angle=target;render();},
    dispose(){if(closed)return;closed=true;cancelAnimationFrame(frame);cancelAnimationFrame(hover);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);doc.removeEventListener('weather-change',onWeather);doc.removeEventListener('world-change',onWorld);hair.dispose();disposeObject(model);Object.values(atlas).forEach(t=>t.dispose());light.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}

