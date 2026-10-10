import { mountHairControls } from '../hair/controls.js';
import { hairName } from '../hair/catalog.js';
import { DEFAULT, SWATCHES, OUTFITS, cleanRecipe, editRecipe } from './recipe.js';
import { GARMENTS } from '../wardrobe/catalog.js';
import { mountToday } from '../today/today.js';
import { mountPages } from './pages.js';
import { mountWardrobe } from './wardrobe-page.js';
const KEY='fashiongirly.plush-draft.v1', BOOK='fashiongirly.plush-looks.v1';
export async function startStudio(doc=document, makeView, options={}) {
  const $=id=>doc.getElementById(id);let storage;
  try { storage=doc.defaultView.localStorage; } catch { storage=null; }
  let recipe=cleanRecipe(),looks=[],view=null,timer=null;
  // Garments kept in their own files (src/wardrobe/garments) bring their own options: any catalog garment its slot's
  // selector lacks is added at the end (a top that can be worn under another also joins the under-top selector).
  const SELECTS={top:'top-select',bottom:'bottom-select',shoes:'shoes-select',outerwear:'outerwear-select',dress:'dress-select'};
  for(const g of Object.values(GARMENTS)){const select=$(SELECTS[g.slot]);if(!select||[...select.options].some(o=>o.value===g.id))continue;
    for(const s of [select,...(g.slot==='top'&&g.layering?.underTop?[$('under-select')]:[])]){const o=doc.createElement('option');o.value=g.id;o.textContent=g.label??g.name;s.append(o);}}
  try {recipe=cleanRecipe(JSON.parse(storage?.getItem(KEY)||'null'));} catch {}
  try {const data=JSON.parse(storage?.getItem(BOOK)||'[]');if(Array.isArray(data))looks=data.slice(0,24).map(cleanRecipe);} catch {}
  function message(text){$('message').textContent=text;}
  function persist(){try {storage?.setItem(KEY,JSON.stringify(recipe));if(!storage)message('Changes last for this visit; browser storage is unavailable.');}catch{message('Changes last for this visit; browser storage is full or unavailable.');}}
  function apply(){recipe=cleanRecipe(recipe);view?.update(recipe);persist();}
  function schedule(){clearTimeout(timer);timer=setTimeout(apply,65);}
  function swatches(id,choices,key){$(id).replaceChildren(...choices.map(([name,color])=>{const b=doc.createElement('button');b.type='button';b.style.background=color;b.setAttribute('aria-label',name);b.dataset.color=color;b.onclick=()=>{recipe[key]=color;sync();apply();};return b;}));}
  swatches('sweater-colours',SWATCHES,'sweater');swatches('denim-colours',[['Indigo','#283c59'],['Washed blue','#71899b'],['Charcoal','#39363b'],['Ecru','#d9cbb2']],'trousers');
  const hairControls=mountHairControls(doc,id=>{recipe.hairId=id;sync();apply();message(`${hairName(id)} — saved with this outfit.`);});
  const pages=mountPages(doc),wardrobe=mountWardrobe(doc,{wear:(patch,g)=>{recipe=cleanRecipe({...recipe,...patch});sync();apply();message(`Wearing the ${g.name}.`);}});
  let today=null;
  $('outfit-ideas').replaceChildren(...OUTFITS.map(look=>{
    const button=doc.createElement('button');button.type='button';button.textContent=look.name;
    button.onclick=()=>{recipe=cleanRecipe({...look.recipe,hairId:recipe.hairId});sync();apply();message(look.note);};return button;
  }));
  function sync(){
    hairControls.sync(recipe.hairId);
    $('top-select').value=recipe.topId;$('bottom-select').value=recipe.bottomId;
    $('shoes-select').value=recipe.shoesId;
    $('outerwear-select').value=recipe.outerwearId;
    // A dress is worn instead of the top and the bottoms, so their layer controls rest while it is on.
    const dress=recipe.dressId!=='none';$('dress-select').value=recipe.dressId;
    // Only a top that can be worn over another (a cardigan) takes a top under it.
    $('under-select').value=recipe.underTopId;$('under-select').disabled=!GARMENTS[recipe.topId]?.layering?.overTop;
    $('outerwear-open').checked=recipe.outerwearOpen;$('outerwear-open').disabled=!GARMENTS[recipe.outerwearId]?.layering?.canOpen;
    // Outerwear with a detachable part (a zip-in hood and bib) can be worn with it or without; the label names the part.
    const detachable=GARMENTS[recipe.outerwearId]?.layering?.detachable;$('outerwear-insert').checked=recipe.outerwearInsert;$('outerwear-insert').disabled=!detachable;$('outerwear-insert-label').textContent=detachable?.label??'Wear its detachable part';
    for(const key of ['knit','shirt'])$(key).disabled=dress||recipe.topId!=='classic';$('skirt').disabled=dress;$('under-select').disabled||=dress;
    const selected=OUTFITS.find(look=>Object.keys(DEFAULT).filter(key=>key!=='hairId').every(key=>look.recipe[key]===recipe[key]));
    // One of today's looks, or Another idea, is named as such until she is dressed differently.
    const day=today?.getState(),look=day&&(day.choice==='idea'?day.idea:day.trio?.[day.choice]),same=look&&JSON.stringify(cleanRecipe(look.recipe))===JSON.stringify(cleanRecipe(recipe));
    $('outfit-title').textContent=selected?.name||(same?today.title():'Her own little experiment.');
    // Controls that do not apply to what she is wearing are put away rather than greyed out.
    $('under-field').hidden=$('under-select').disabled;
    $('outerwear-options').hidden=recipe.outerwearId==='none';$('outerwear-open-field').hidden=$('outerwear-open').disabled;$('outerwear-insert-field').hidden=$('outerwear-insert').disabled;
    $('classic-controls').hidden=dress||(recipe.topId!=='classic'&&recipe.bottomId!=='classic');
    wardrobe.sync(recipe);
    for(const button of $('outfit-ideas').children)button.setAttribute('aria-pressed',String(button.textContent===selected?.name));
    for(const key of ['sleeve','hem','barrel']){$(key).value=Math.round(recipe[key]*100);const value=recipe[key];$(`${key}-value`).textContent=key==='hem'?(value<.34?'Cropped':value>.66?'Longer':'At the waist'):value<.34?'A little':value>.66?'A lot':'In between';$(key).setAttribute('aria-valuetext',`${$(`${key}-value`).textContent}, ${Math.round(value*100)} percent`);}
    for(const key of ['knit','shirt','skirt'])$(key).checked=recipe[key];
    for(const [id,key] of [['sweater-colours','sweater'],['denim-colours','trousers']])for(const b of $(id).children)b.setAttribute('aria-pressed',String(b.dataset.color===recipe[key]));
    for(const id of ['sleeve','hem'])$(id).disabled=dress||!recipe.knit;
    // Catalog bottoms have an authored fit and wash; the colour and width controls belong to the classic jeans.
    $('barrel').disabled=dress||recipe.bottomId!=='classic';for(const b of $('denim-colours').children)b.disabled=dress||recipe.bottomId!=='classic';
    for(const b of $('sweater-colours').children)b.disabled=dress||!recipe.knit;
    $('count').textContent=looks.length;
  }
  for(const key of ['sleeve','hem','barrel'])$(key).oninput=()=>{recipe[key]=Number($(key).value)/100;sync();schedule();};
  for(const key of ['knit','shirt','skirt'])$(key).onchange=()=>{recipe[key]=$(key).checked;sync();apply();};
  $('top-select').onchange=()=>{recipe=cleanRecipe({...recipe,dressId:'none',topId:$('top-select').value,underTopId:recipe.underTopId,knit:$('top-select').value==='classic',shirt:$('top-select').value==='classic'});sync();apply();message(recipe.topId==='classic'?'Classic layers restored.':'Reference top selected. Its fit and print are fixed for this first review.');};
  $('under-select').onchange=()=>{recipe=cleanRecipe({...recipe,underTopId:$('under-select').value});sync();apply();message(recipe.underTopId==='none'?'Worn on its own, over her skin.':'A top underneath: it shows in the opening, and its sleeves stay inside.');};
  $('bottom-select').onchange=()=>{recipe=cleanRecipe({...recipe,dressId:'none',bottomId:$('bottom-select').value});sync();apply();message(recipe.bottomId==='classic'?'Classic jeans restored.':'Reference jeans selected. Their fit and wash are fixed for this first review.');};
  $('dress-select').onchange=()=>{recipe=cleanRecipe({...recipe,dressId:$('dress-select').value});sync();apply();message(recipe.dressId==='none'?'Dress off: her top and bottoms are back.':'Dress on, worn instead of the top and bottoms. Shoes and outerwear still go with it.');};
  $('shoes-select').onchange=()=>{recipe=cleanRecipe({...recipe,shoesId:$('shoes-select').value});sync();apply();message(recipe.shoesId==='classic'?'Classic loafers restored.':'Reference shoes selected. Their fit and colour are fixed for this first review.');};
  // Each piece of outerwear starts the way it is usually worn: open only if it is designed to be worn open.
  $('outerwear-select').onchange=()=>{const id=$('outerwear-select').value;recipe=cleanRecipe({...recipe,outerwearId:id,outerwearOpen:!!GARMENTS[id]?.layering?.openByDefault,outerwearInsert:true});sync();apply();message(recipe.outerwearId==='none'?'Outerwear taken off.':recipe.outerwearOpen?'Outerwear selected, worn open. Its fit is fixed for this first review.':'Outerwear selected. She wears it zipped closed; its fit is fixed for this first review.');};
  $('outerwear-insert').onchange=()=>{recipe=cleanRecipe({...recipe,outerwearInsert:$('outerwear-insert').checked});sync();apply();message(recipe.outerwearInsert?'Worn with its detachable part.':'Detachable part taken out.');};
  $('outerwear-open').onchange=()=>{recipe=cleanRecipe({...recipe,outerwearOpen:$('outerwear-open').checked});sync();apply();message(recipe.outerwearOpen?'Worn open.':'Zipped closed.');};
  $('edit-form').onsubmit=e=>{e.preventDefault();const result=editRecipe(recipe,$('request').value);recipe=result.recipe;sync();apply();message(result.changes.length?`Changed: ${result.changes.join(', ')}. Only these supported details were interpreted.`:(recipe.topId==='classic'?'I could not interpret that yet. Try “butter sweater, enormous sleeves, cropped”.':'This reference top has a fixed fit and print for now. Try “straight jeans” or “add a skirt”.'));};
  $('reset').onclick=()=>{recipe=cleanRecipe(DEFAULT);sync();apply();message('Back to the original outfit.');};
  function storeLooks(next){try{if(!storage)throw new Error();storage.setItem(BOOK,JSON.stringify(next));looks=next;sync();return true;}catch{message('This browser could not save your look.');return false;}}
  $('save').onclick=()=>{if(looks.length>=24){message('Your lookbook is full. Remove a look to make room.');return;}if(storeLooks([cleanRecipe(recipe),...looks]))message('Saved in My looks.');};
  function book(){
    const list=$('saved-list');list.replaceChildren();
    if(!looks.length){const p=doc.createElement('p');p.className='saved-empty';p.textContent='Save a little experiment with the heart. Your looks stay in this browser.';list.append(p);}
    looks.forEach((look,i)=>{const row=doc.createElement('div');row.className='saved-row';const colours=doc.createElement('span');colours.className='saved-colours';for(const color of [look.sweater,look.trousers]){const dot=doc.createElement('i');dot.style.background=color;colours.append(dot);}const title=doc.createElement('span');title.textContent=`Little experiment ${looks.length-i} · ${hairName(look.hairId)}`;const wear=doc.createElement('button');wear.textContent='Wear';wear.onclick=()=>{recipe=cleanRecipe(look);sync();apply();$('lookbook').close();};const remove=doc.createElement('button');remove.textContent='Remove';remove.onclick=()=>{if(storeLooks(looks.filter((_,j)=>j!==i)))book();};row.append(colours,title,wear,remove);list.append(row);});
  }
  $('lookbook-open').onclick=()=>{book();$('lookbook').showModal();};$('lookbook-close').onclick=()=>$('lookbook').close();
  // Each morning she checks the weather and dresses herself (src/today/today.js); her pick is worn like any other recipe.
  const win=doc.defaultView;today=mountToday(doc,{storage,getRecipe:()=>cleanRecipe(recipe),wear:next=>{recipe=cleanRecipe(next);sync();apply();message('');},
    fetch:'fetch' in options?options.fetch:win?.fetch?.bind(win),geolocation:'geolocation' in options?options.geolocation:win?.navigator?.geolocation,now:options.now});
  // If she cannot be shown, say why and offer to try again: reloading clears whatever failed to download.
  const showError=text=>{$('loading')?.remove();const box=$('view-error'),retry=doc.createElement('button');box.hidden=false;
    retry.type='button';retry.className='retry';retry.textContent='Try again';retry.onclick=()=>doc.defaultView.location.reload();box.replaceChildren(`${text} `,retry);};
  $('stage').addEventListener('view-error',e=>showError(e.detail));
  $('stage').addEventListener('view-restored',()=>{$('view-error').hidden=true;});
  // A garment whose print could not be downloaded is shown without it; it is tried again the next time she wears it.
  $('stage').addEventListener('texture-error',e=>message(`The print for the ${GARMENTS[e.detail.id]?.name??'garment'} did not load, so it is shown plain for now.`));sync();
  // If she dressed for the day while the view was loading, show that outfit once the view is ready.
  // The 3D view is loaded separately; a download that fails is tried once more at a fresh address.
  const loadView=async()=>{try{return (await import('./view.js')).createDollView;}catch{return (await import(`./view.js?retry=${Date.now()}`)).createDollView;}};
  try {const factory=makeView || await loadView(),first=recipe;view=await factory($('stage'),recipe);if(recipe!==first)view.update(recipe);view.turn(-25);$('loading')?.remove();}
  catch(error){showError(/fetch|import|load/i.test(error?.message||'')?'She could not be loaded: the connection dropped while the app was downloading.':error.message||'The 3D view could not load.');}
  return {getRecipe:()=>cleanRecipe(recipe),today,dispose(){clearTimeout(timer);persist();hairControls.dispose();today.dispose();pages.dispose();wardrobe.dispose();view?.dispose();}};
}

