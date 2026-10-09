import { HAIRSTYLES, cleanHairId } from './catalog.js';
export function mountHairControls(doc,onChange){
  const anchor=doc.getElementById('top-select'),root=doc.createElement('div');root.className='field hair-controls';
  const label=doc.createElement('label');label.htmlFor='hair-select';label.textContent='Style her hair';
  const select=doc.createElement('select');select.id='hair-select';
  for(const h of HAIRSTYLES){const option=doc.createElement('option');option.value=h.id;option.textContent=h.name;select.append(option);}
  const note=doc.createElement('p');note.id='hair-note';note.className='help';select.setAttribute('aria-describedby',note.id);root.append(label,select,note);
  // It goes first among the studio's pieces: before the top's field, or its label in an older layout.
  const before=anchor.closest('.field')||anchor.previousElementSibling;before.parentNode.insertBefore(root,before);
  select.onchange=()=>onChange(cleanHairId(select.value));
  return {sync(id){select.value=cleanHairId(id);note.textContent=HAIRSTYLES.find(h=>h.id===select.value).note;},dispose(){root.remove();}};
}
