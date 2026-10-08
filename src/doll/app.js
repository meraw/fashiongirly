import { mountHairControls } from '../hair/controls.js';
import { hairName } from '../hair/catalog.js';
import { DEFAULT, SWATCHES, OUTFITS, cleanRecipe, editRecipe } from './recipe.js';
import { GARMENTS } from '../wardrobe/catalog.js';
const KEY='fashiongirly.plush-draft.v1', BOOK='fashiongirly.plush-looks.v1';
export async function startStudio(doc=document, makeView) {
  const $=id=>doc.getElementById(id);let storage;
  try { storage=doc.defaultView.localStorage; } catch { storage=null; }
  let recipe=cleanRecipe(),looks=[],view=null,timer=null;
  try {recipe=cleanRecipe(JSON.parse(storage?.getItem(KEY)||'null'));} catch {}
  try {const data=JSON.parse(storage?.getItem(BOOK)||'[]');if(Array.isArray(data))looks=data.slice(0,24).map(cleanRecipe);} catch {}
  function message(text){$('message').textContent=text;}
  function persist(){try {storage?.setItem(KEY,JSON.stringify(recipe));if(!storage)message('Changes last for this visit; browser storage is unavailable.');}catch{message('Changes last for this visit; browser storage is full or unavailable.');}}
  function apply(){recipe=cleanRecipe(recipe);view?.update(recipe);persist();}
  function schedule(){clearTimeout(timer);timer=setTimeout(apply,65);}
  function swatches(id,choices,key){$(id).replaceChildren(...choices.map(([name,color])=>{const b=doc.createElement('button');b.type='button';b.style.background=color;b.setAttribute('aria-label',name);b.dataset.color=color;b.onclick=()=>{recipe[key]=color;sync();apply();};return b;}));}
  swatches('sweater-colours',SWATCHES,'sweater');swatches('denim-colours',[['Indigo','#283c59'],['Washed blue','#71899b'],['Charcoal','#39363b'],['Ecru','#d9cbb2']],'trousers');
  const hairControls=mountHairControls(doc,id=>{recipe.hairId=id;sync();apply();message(`${hairName(id)} — saved with this outfit.`);});
  $('outfit-ideas').replaceChildren(...OUTFITS.map(look=>{
    const button=doc.createElement('button');button.type='button';button.textContent=look.name;
    button.onclick=()=>{recipe=cleanRecipe({...look.recipe,hairId:recipe.hairId});sync();apply();message(look.note);};return button;
  }));
  function sync(){
    hairControls.sync(recipe.hairId);
    $('top-select').value=recipe.topId;$('bottom-select').value=recipe.bottomId;
    $('shoes-select').value=recipe.shoesId;
    $('outerwear-select').value=recipe.outerwearId;
    $('outerwear-open').checked=recipe.outerwearOpen;$('outerwear-open').disabled=!GARMENTS[recipe.outerwearId]?.layering?.canOpen;
    for(const key of ['knit','shirt'])$(key).disabled=recipe.topId!=='classic';
    const selected=OUTFITS.find(look=>Object.keys(DEFAULT).filter(key=>key!=='hairId').every(key=>look.recipe[key]===recipe[key]));
    $('outfit-title').textContent=selected?.name||'Her own little experiment.';
    for(const button of $('outfit-ideas').children)button.setAttribute('aria-pressed',String(button.textContent===selected?.name));
    for(const key of ['sleeve','hem','barrel']){$(key).value=Math.round(recipe[key]*100);const value=recipe[key];$(`${key}-value`).textContent=key==='hem'?(value<.34?'Cropped':value>.66?'Longer':'At the waist'):value<.34?'A little':value>.66?'A lot':'In between';$(key).setAttribute('aria-valuetext',`${$(`${key}-value`).textContent}, ${Math.round(value*100)} percent`);}
    for(const key of ['knit','shirt','skirt'])$(key).checked=recipe[key];
    for(const [id,key] of [['sweater-colours','sweater'],['denim-colours','trousers']])for(const b of $(id).children)b.setAttribute('aria-pressed',String(b.dataset.color===recipe[key]));
    for(const id of ['sleeve','hem'])$(id).disabled=!recipe.knit;
    // Catalog bottoms have an authored fit and wash; the colour and width controls belong to the classic jeans.
    $('barrel').disabled=recipe.bottomId!=='classic';for(const b of $('denim-colours').children)b.disabled=recipe.bottomId!=='classic';
    for(const b of $('sweater-colours').children)b.disabled=!recipe.knit;
    $('count').textContent=looks.length;
  }
  for(const key of ['sleeve','hem','barrel'])$(key).oninput=()=>{recipe[key]=Number($(key).value)/100;sync();schedule();};
  for(const key of ['knit','shirt','skirt'])$(key).onchange=()=>{recipe[key]=$(key).checked;sync();apply();};
  $('top-select').onchange=()=>{recipe=cleanRecipe({...recipe,topId:$('top-select').value,knit:$('top-select').value==='classic',shirt:$('top-select').value==='classic'});sync();apply();message(recipe.topId==='classic'?'Classic layers restored.':'Reference top selected. Its fit and print are fixed for this first review.');};
  $('bottom-select').onchange=()=>{recipe=cleanRecipe({...recipe,bottomId:$('bottom-select').value});sync();apply();message(recipe.bottomId==='classic'?'Classic jeans restored.':'Reference jeans selected. Their fit and wash are fixed for this first review.');};
  $('shoes-select').onchange=()=>{recipe=cleanRecipe({...recipe,shoesId:$('shoes-select').value});sync();apply();message(recipe.shoesId==='classic'?'Classic loafers restored.':'Reference shoes selected. Their fit and colour are fixed for this first review.');};
  // Each piece of outerwear starts the way it is usually worn: open only if it is designed to be worn open.
  $('outerwear-select').onchange=()=>{const id=$('outerwear-select').value;recipe=cleanRecipe({...recipe,outerwearId:id,outerwearOpen:!!GARMENTS[id]?.layering?.openByDefault});sync();apply();message(recipe.outerwearId==='none'?'Outerwear taken off.':recipe.outerwearOpen?'Outerwear selected, worn open. Its fit is fixed for this first review.':'Outerwear selected. She wears it zipped closed; its fit is fixed for this first review.');};
  $('outerwear-open').onchange=()=>{recipe=cleanRecipe({...recipe,outerwearOpen:$('outerwear-open').checked});sync();apply();message(recipe.outerwearOpen?'Worn open.':'Zipped closed.');};
  $('edit-form').onsubmit=e=>{e.preventDefault();const result=editRecipe(recipe,$('request').value);recipe=result.recipe;sync();apply();message(result.changes.length?`Changed: ${result.changes.join(', ')}. Only these supported details were interpreted.`:(recipe.topId==='classic'?'I could not interpret that yet. Try “butter sweater, enormous sleeves, cropped”.':'This reference top has a fixed fit and print for now. Try “straight jeans” or “add a skirt”.'));};
  $('reset').onclick=()=>{recipe=cleanRecipe(DEFAULT);sync();apply();message('Back to the original outfit.');};
  for(const b of doc.querySelectorAll('[data-angle]'))b.onclick=()=>{view?.turn(Number(b.dataset.angle));for(const other of doc.querySelectorAll('[data-angle]'))other.setAttribute('aria-pressed',String(other===b));};
  function storeLooks(next){try{if(!storage)throw new Error();storage.setItem(BOOK,JSON.stringify(next));looks=next;sync();return true;}catch{message('This browser could not save your look.');return false;}}
  $('save').onclick=()=>{if(looks.length>=24){message('Your lookbook is full. Remove a look to make room.');return;}if(storeLooks([cleanRecipe(recipe),...looks]))message('Saved in My looks.');};
  function book(){
    const list=$('saved-list');list.replaceChildren();
    if(!looks.length){const p=doc.createElement('p');p.className='saved-empty';p.textContent='Save a little experiment with the heart. Your looks stay in this browser.';list.append(p);}
    looks.forEach((look,i)=>{const row=doc.createElement('div');row.className='saved-row';const colours=doc.createElement('span');colours.className='saved-colours';for(const color of [look.sweater,look.trousers]){const dot=doc.createElement('i');dot.style.background=color;colours.append(dot);}const title=doc.createElement('span');title.textContent=`Little experiment ${looks.length-i} · ${hairName(look.hairId)}`;const wear=doc.createElement('button');wear.textContent='Wear';wear.onclick=()=>{recipe=cleanRecipe(look);sync();apply();$('lookbook').close();};const remove=doc.createElement('button');remove.textContent='Remove';remove.onclick=()=>{if(storeLooks(looks.filter((_,j)=>j!==i)))book();};row.append(colours,title,wear,remove);list.append(row);});
  }
  $('lookbook-open').onclick=()=>{book();$('lookbook').showModal();};$('lookbook-close').onclick=()=>$('lookbook').close();
  const showError=text=>{$('loading')?.remove();$('view-error').hidden=false;$('view-error').textContent=text;};
  $('stage').addEventListener('view-error',e=>showError(e.detail));sync();
  try {const factory=makeView || (await import('./view.js')).createDollView;view=await factory($('stage'),recipe);view.turn(-25);$('loading')?.remove();}
  catch(error){showError(error.message||'The 3D view could not load. Please reload and try again.');}
  return {getRecipe:()=>cleanRecipe(recipe),dispose(){clearTimeout(timer);persist();hairControls.dispose();view?.dispose();}};
}

