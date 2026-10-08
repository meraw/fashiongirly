export const HAIR_COLOUR = '#362725';
export const DEFAULT_HAIR_ID = 'bob';
export const HAIRSTYLES = Object.freeze([
  {id:'bob',name:'Original bob',note:'The original little bob.'},
  {id:'straight-v',name:'Long · straight V',note:'Straight lengths, shorter at the sides and longest at mid-back.'},
  {id:'wavy-v',name:'Long · soft waves',note:'The same V-shaped lengths with a gentle wave.'},
  {id:'high-ponytail',name:'High ponytail',note:'Gathered high, with a long falling tail.'},
  {id:'high-bun',name:'High bun',note:'A rounded bun at the crown.'},
  {id:'low-ponytail',name:'Low ponytail',note:'A relaxed ponytail tied at the nape.'},
  {id:'low-bun',name:'Low bun',note:'A soft twisted bun at the nape.'},
  {id:'half-up',name:'Half-up twist',note:'Top sections tied back, with the long lengths left down.'},
  {id:'side-braid',name:'Side braid',note:'A loose braid brought over one shoulder.'},
]);
export function cleanHairId(id){return HAIRSTYLES.some(h=>h.id===id)?id:DEFAULT_HAIR_ID;}
export function hairName(id){return HAIRSTYLES.find(h=>h.id===cleanHairId(id)).name;}
