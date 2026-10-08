import { HAIRSTYLES, cleanHairId } from './catalog.js';
export function mountHairControls(doc,onChange){
  const anchor=doc.getElementById('top-select'),root=doc.createElement('div');root.className='hair-controls';
  const label=doc.createElement('label');label.htmlFor='hair-select';label.textContent='Style her hair';
  const select=doc.createElement('select');select.id='hair-select';select.style.cssText='display:block;width:100%;min-height:44px;margin:8px 0;padding:10px;border:1px solid #d8c6b8;border-radius:6px;background:#fffbf5;color:#433634;font:inherit;font-size:14px';
  for(const h of HAIRSTYLES){const option=doc.createElement('option');option.value=h.id;option.textContent=h.name;select.append(option);}
  const note=doc.createElement('p');note.id='hair-note';note.className='help';select.setAttribute('aria-describedby',note.id);root.style.marginBottom='20px';root.append(label,select,note);
  anchor.parentNode.insertBefore(root,anchor.previousElementSibling);
  select.onchange=()=>onChange(cleanHairId(select.value));
  return {sync(id){select.value=cleanHairId(id);note.textContent=HAIRSTYLES.find(h=>h.id===select.value).note;},dispose(){root.remove();}};
}
