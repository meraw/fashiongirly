import { createHairController } from '../hair/model.js';
import * as T from 'three';
import { BRONZE_TOP_ID, LILAC_TOP_ID, VANGOGH_TEE_ID, DESIGUAL_FRESCO_TEE_ID, DESIGUAL_MOUNTAIN_SHIRT_ID, BARREL_JEANS_ID, DAVINIA_JEANS_ID, LEVIS_94_ID, TOMMY_MOM_ID, STRADIVARIUS_RELAXED_ID, MANGO_BLACK_JEANS_ID, BERSHKA_GREY_ID, TOMMY_CARPENTER_ID, ZARA_CARGO_ID, CRYSTAL_JEANS_ID, NIKE_TRACK_ID, TOPSHOP_BLACK_CROP_ID, PLEATED_LINEN_ID, BUFFALO_ASPHA_ID, GARMENTS } from '../wardrobe/catalog.js';
import { makeDoll, makeOutfit, disposeObject, fitDoll, setExpression } from './model.js';
import { expressionFor } from './face.js';
import { canTuck, cleanRecipe } from './recipe.js';
import { lightScene } from './light.js';
import { pose, attitudeOf, headPose } from './pose.js';
import { wantsTwirl, spinAt, TWIRL_MS } from './twirl.js';
import { createWind } from '../hair/wind.js';
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
  // She stands in an attitude (pose.js): the resting pose for her pick, a bolder stance for the bolder look, an easy
  // one for the easier look. Her body, her hair and every outfit after it is fitted are posed by the same field, so
  // clothes and hair stay with the body, and her head turns as a whole. All of it is posed in the model group's space,
  // her world's units (the wardrobe's own group is scaled to her toy proportions, so its local space would stretch the
  // field), less the lift her shoes give her. Each part keeps its unposed shape, so she can change attitude.
  const doc=host.ownerDocument;
  const model=new T.Group();scene.add(model);const doll=makeDoll();model.add(doll);const hair=createHairController(doll),head=doll.getObjectByName('doll-head');
  let attitude=attitudeOf(doc.documentElement.dataset.attitude),attitudeNext=attitude,wind=createWind(null);
  // Pose her body and hair in the attitude, her head turned for it; the wind takes the hair as posed.
  const settle=()=>{wind.calm();const r=headPose(attitude);head.rotation.set(r.x,r.y,r.z);pose(doll,model,doll.position.y,attitude);wind=createWind(doll.getObjectByName('outfit-hair'));};
  // A new outfit, posed for the shoes it brings and the attitude it will be worn in, hidden until it is put on.
  let outfit=null;
  const prepare=(next,a)=>{const worn=makeOutfit(next,atlas);worn.visible=false;model.add(worn);fitDoll(doll,worn);pose(worn,model,doll.position.y,a);if(outfit)fitDoll(doll,outfit);return worn;};
  hair.update(recipe.hairId);outfit=prepare(recipe,attitude);outfit.visible=true;fitDoll(doll,outfit);settle();let current=cleanRecipe(recipe);
  const clothingKey=state=>JSON.stringify({...state,hairId:undefined});let lastClothing=clothingKey(recipe);
  let angle=-.12,target=angle,frame=null,drag=null,pending=0,spin=0;
  // On a windy day her loose hair moves (src/hair/wind.js) with the wind across the page, whichever way she faces.
  let windy=false,windStrength=1,windFrame=null,windLast=0;const windStart=performance.now(),windDir=new T.Vector3(),headTurn=new T.Quaternion();
  const still=()=>!!doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const draw=()=>{frame=null;if(closed)return;model.rotation.y=angle+spin;
    if(windy&&wind.active&&!still()){model.updateMatrixWorld(true);head.getWorldQuaternion(headTurn).invert();windDir.set(1,0,0).applyQuaternion(headTurn);windDir.y=0;windDir.normalize();wind.update((performance.now()-windStart)/1000,windDir,windStrength);}
    renderer.render(scene,camera);};
  const render=()=>{if(!closed&&frame==null)frame=requestAnimationFrame(draw);};
  // While it is windy she is drawn about thirty times a second; otherwise only when something changes.
  const blow=now=>{windFrame=null;if(closed||!windy||still())return;if(now-windLast>=32){windLast=now;render();}windFrame=requestAnimationFrame(blow);};
  const setWind=(on,kmh)=>{windStrength=Math.max(.55,Math.min(1,((kmh||30)-15)/35));if(on===windy)return;windy=on;if(windy){if(windFrame==null)windFrame=requestAnimationFrame(blow);}else{wind.calm();render();}};
  // She twirls when she changes (twirl.js): the change is put on halfway round, with her back to us.
  let twirl=null,twirlFrame=null;
  const spinAround=(change)=>{
    if(twirl){if(!twirl.swapped){twirl.change.drop?.();twirl.change=change;}else change.apply();return;}
    twirl={start:performance.now(),change,swapped:false};
    const tick=now=>{twirlFrame=null;if(closed)return;const t=(now-twirl.start)/TWIRL_MS;spin=spinAt(t);
      if(!twirl.swapped&&t>=.5){twirl.swapped=true;twirl.change.apply();}
      if(t>=1){spin=0;twirl=null;if(!inFlight&&attitudeNext!==attitude)swap(null);}render();if(twirl)twirlFrame=requestAnimationFrame(tick);};
    twirlFrame=requestAnimationFrame(tick);};
  // Put on a change: a new outfit (posed in `posedIn`) or none, for a change of hair or attitude alone, her hair, and
  // the latest attitude (it may have changed again while the outfit was on its way).
  let inFlight=false;
  const swap=(worn,hairId,posedIn)=>{inFlight=false;
    if(worn){model.remove(outfit);disposeObject(outfit);outfit=worn;outfit.visible=true;fitDoll(doll,outfit);}else posedIn=attitude;
    attitude=attitudeNext;if(hairId!==undefined)hair.update(hairId);settle();
    if(posedIn!==attitude)pose(outfit,model,doll.position.y,attitude);render();};
  // The canvas covers the page; she is framed within #frame, the part of the page that is hers (the layout moves it:
  // above the sheet on a phone, left of the panel on a wider screen). The rest of the canvas shows what lies beyond
  // the frame, as a window would. Where her feet and the ground behind her land on the page is told to the stylesheet
  // (--feet-y, --horizon-y, --doll-x), so the painted meadow and mountains sit exactly where she stands.
  const stageFrame=doc.getElementById('frame'),point=new T.Vector3();
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
  // Her face and her hair follow the weather too (face.js, wind.js). Her world and its hour come from src/today/world.js.
  const onWeather=e=>{const lit=light.setWeather(e.detail?.kind),face=setExpression(doll,expressionFor(e.detail||{}));setWind(!!e.detail?.windy,e.detail?.wind);if(lit||face)render();};doc.addEventListener('weather-change',onWeather);
  // Her attitude for the look she wears (src/doll/app.js says which). It changes with the look: when new clothes come
  // with it, halfway through her twirl; on its own, at once.
  const onAttitude=e=>{attitudeNext=attitudeOf(e.detail?.attitude);queueMicrotask(()=>{if(!closed&&!inFlight&&!twirl&&attitudeNext!==attitude)swap(null);});};doc.addEventListener('attitude-change',onAttitude);
  // Her felt's fibres are drawn unlit, so they are dimmed with the light, or they would speckle her face at night.
  const fibres=[];doll.traverse(o=>{if(o.name==='felt-fibres')fibres.push([o.material,o.material.opacity]);});
  const dimFibres=w=>{for(const [m,o] of fibres)m.opacity=o*(1-.8*(w?.night??0));};
  const onWorld=e=>{dimFibres(e.detail?.weights);if(light.setWorld(e.detail?.world,e.detail?.weights))render();};doc.addEventListener('world-change',onWorld);
  const root=doc.documentElement,shown=root.dataset.weights?.split(',').map(Number);
  if(root.dataset.world&&shown?.length===3){const w={golden:shown[0],day:shown[1],night:shown[2],dawn:root.dataset.dawn==='true'};light.setWorld(root.dataset.world,w);dimFibres(w);}
  // The weather may have been painted before she was: take it, and her face, from the sky.
  const sky=doc.getElementById('sky');light.setWeather(sky?.dataset.kind||'none');setWind(sky?.dataset.windy==='true',Number(sky?.dataset.wind)||0);
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
    // A new outfit is built once its textures have arrived (usually at once); only the latest request is built. A change
    // of clothes or hair is put on with a twirl; a tuck, an open jacket or a slider at once.
    update(next){
      const before=current;current=cleanRecipe(next);const key=clothingKey(next),turning=wantsTwirl(before,current)&&!still();
      if(key!==lastClothing){lastClothing=key;inFlight=true;const ticket=++pending,a=attitudeNext;
        texturesFor(next).then(()=>{if(closed||ticket!==pending)return;const worn=prepare(next,a);
          const change={apply:()=>swap(worn,current.hairId,a),drop:()=>{model.remove(worn);disposeObject(worn);}};
          if(turning)spinAround(change);else change.apply();});}
      else if(before.hairId!==current.hairId){const change={apply:()=>swap(null,current.hairId)};if(turning)spinAround(change);else change.apply();}
      render();},
    turn(degrees){target=degrees*Math.PI/180;angle=target;render();},
    dispose(){if(closed)return;closed=true;cancelAnimationFrame(frame);cancelAnimationFrame(hover);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);doc.removeEventListener('weather-change',onWeather);doc.removeEventListener('world-change',onWorld);doc.removeEventListener('attitude-change',onAttitude);cancelAnimationFrame(twirlFrame);cancelAnimationFrame(windFrame);hair.dispose();disposeObject(model);Object.values(atlas).forEach(t=>t.dispose());light.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}

