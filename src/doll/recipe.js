import { DEFAULT_HAIR_ID, cleanHairId } from '../hair/catalog.js';
import { BRONZE_TOP_ID, LILAC_TOP_ID, CROCHET_TOP_ID, PLAID_JUMPER_ID, STRIPE_JUMPER_ID, POINTELLE_FLOWER_ID, SILVER_CABLE_ID, LACROIX_FLOWER_ID, TOMMY_CABLE_ID, PETIT_BATEAU_CARDIGAN_ID, TOMMY_STRIPE_POLO_ID, MOTEL_TIE_DYE_SHIRT_ID, DESIGUAL_SPRAY_FLORAL_SHIRT_ID, BARREL_JEANS_ID, DAVINIA_JEANS_ID, LEVIS_94_ID, TOMMY_MOM_ID, STRADIVARIUS_RELAXED_ID, MANGO_BLACK_JEANS_ID, BERSHKA_GREY_ID, TOMMY_CARPENTER_ID, ZARA_CARGO_ID, CRYSTAL_JEANS_ID, TOPSHOP_BLACK_CROP_ID, GARMENTS } from '../wardrobe/catalog.js';
import { BUFFALO_ASPHA_ID, DM_COW_SLIDE_ID, UGG_LOWMEL_ID } from '../wardrobe/catalog.js';
import { MARIKOO_WINDBREAKER_ID, DESIGUAL_LEATHER_JACKET_ID } from '../wardrobe/catalog.js';
export const DEFAULT = Object.freeze({ sweater: '#bf303e', trousers: '#283c59', sleeve: .74, hem: .3, barrel: .78, knit: true, shirt: true, skirt: false, skirtColour: '#bd9bc8', topId: 'classic', bottomId: 'classic', shoesId: 'classic', underTopId: 'none', outerwearId: 'none', outerwearOpen: false, hairId: DEFAULT_HAIR_ID });
export const SWATCHES = [['Tomato', '#bf303e'], ['Butter', '#ead391'], ['Lilac', '#bd9bc8'], ['Cobalt', '#315cb3'], ['Moss', '#74804b'], ['Cream', '#f0e3cb']];
export function cleanRecipe(value = {}) {
  const v = value && typeof value === 'object' ? value : {};
  const result = { ...DEFAULT, hairId: cleanHairId(v.hairId) };
  for (const key of ['sweater', 'trousers', 'skirtColour']) if (/^#[0-9a-f]{6}$/i.test(v[key] || '')) result[key] = v[key];
  for (const key of ['sleeve', 'hem', 'barrel']) if (Number.isFinite(v[key])) result[key] = Math.max(0, Math.min(1, v[key]));
  for (const key of ['knit', 'shirt', 'skirt']) if (typeof v[key] === 'boolean') result[key] = v[key];
  // Each catalog garment fills one slot; an ID from the wrong slot falls back to the built-in piece.
  if (GARMENTS[v.topId]?.slot==='top') result.topId=v.topId;
  if (GARMENTS[v.bottomId]?.slot==='bottom') result.bottomId=v.bottomId;
  if (GARMENTS[v.shoesId]?.slot==='shoes') result.shoesId=v.shoesId;
  if (GARMENTS[v.outerwearId]?.slot==='outerwear') result.outerwearId=v.outerwearId;
  // A top worn over another top (a cardigan, say) may have a slim top under it; anything else falls back to none.
  const under=GARMENTS[v.underTopId];
  if (GARMENTS[result.topId]?.layering?.overTop && under?.slot==='top' && under.layering?.underTop && v.underTopId!==result.topId) result.underTopId=v.underTopId;
  // Only outerwear that is designed to be worn open can be (the user wears coats closed otherwise).
  result.outerwearOpen=v.outerwearOpen===true&&!!GARMENTS[result.outerwearId]?.layering?.canOpen;
  if(result.topId!== 'classic'){result.knit=false;result.shirt=false;}
  return result;
}
export function editRecipe(current, sentence) {
  const next = cleanRecipe(current), changes = [], text = sentence.toLowerCase();
  if(next.topId==='classic'){
  for (const [name, colour] of SWATCHES) if (new RegExp(`\\b${name.toLowerCase()}\\b`).test(text)) { next.sweater = colour; changes.push(`${name.toLowerCase()} sweater`); }
  if (/\b(enormous|huge|balloon)\b/.test(text)) { next.sleeve = 1; changes.push('bigger sleeves'); }
  else if (/\b(slim|narrow) sleeves\b/.test(text)) { next.sleeve = .1; changes.push('slimmer sleeves'); }
  if (/\b(cropped|shorter)\b/.test(text)) { next.hem = .1; changes.push('cropped hem'); }
  else if (/\b(longer|hip length)\b/.test(text)) { next.hem = .9; changes.push('longer hem'); }
  }
  if(next.bottomId==='classic'){
  if (/\b(wider|barrel|bigger) (jeans|trousers)\b/.test(text)) { next.barrel = 1; changes.push('fuller jeans'); }
  else if (/\b(straight|slimmer) (jeans|trousers)\b/.test(text)) { next.barrel = .05; changes.push('straighter jeans'); }
  }
  if (/\b(no skirt|remove (the )?skirt)\b/.test(text)) { next.skirt=false; changes.push('skirt removed'); }
  else if (/\b(add (a |the )?skirt|skirt over jeans)\b/.test(text)) { next.skirt=true; changes.push('skirt over jeans'); }
  return { recipe: next, changes };
}

export const OUTFITS = [
  { name: 'Black wide crop study', note: 'Reference study: washed black wide-leg jeans flaring to a raw-cut hem almost at her ankle, with tan double stitching, copper rivets and a black leather back patch. The denim is taken from the product photo.', recipe: { ...DEFAULT, topId: TOMMY_STRIPE_POLO_ID, bottomId: TOPSHOP_BLACK_CROP_ID, knit: false, shirt: false } },
  { name: 'Crystal jeans study', note: 'Reference study: light vintage-wash straight jeans with tiny crystals set in a grid over the whole front. The denim is taken from the product photo; the crystals are modelled.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: CRYSTAL_JEANS_ID, knit: false, shirt: false } },
  { name: 'Zara cargo trousers study', note: 'Reference study: light black cargo trousers with a gathered elastic waist and drawstring, flap cargo pockets on both thighs and elastic ankle cuffs. The fabric is taken from the product photo.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: ZARA_CARGO_ID, knit: false, shirt: false } },
  { name: 'Tommy carpenter jeans study', note: 'Reference study: black carpenter jeans with white double stitching, front hip panels, utility pockets on both thighs, a hammer loop and a flag tape across one back pocket. The denim is taken from the product photo.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: TOMMY_CARPENTER_ID, knit: false, shirt: false } },
  { name: 'Bershka grey jeans study', note: 'Reference study: grey wide-leg jeans with bleached thigh panels, a darker hem and strong whiskers across the hips. The denim is taken from the product photo.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: BERSHKA_GREY_ID, knit: false, shirt: false } },
  { name: 'Mango black jeans study', note: 'Reference study: high-rise, relaxed straight washed-black jeans at ankle length, with copper rivets, back darts and a black leather patch. The denim is taken from the listing photo.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: MANGO_BLACK_JEANS_ID, knit: false, shirt: false } },
  { name: 'Stradivarius relaxed study', note: 'Reference study: light bleached relaxed wide jeans pooling over the shoes, with copper rivets and plain back pockets. The denim is taken from the product photo.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: STRADIVARIUS_RELAXED_ID, knit: false, shirt: false } },
  { name: 'Tommy mom jeans study', note: 'Reference study: ultra high rise mid-wash mom jeans tapering to the ankle, with copper rivets, stitched bars across the back pockets and a flag patch. The denim is taken from the product photo.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: TOMMY_MOM_ID, knit: false, shirt: false } },
  { name: "Levi's '94 study", note: "Reference study: washed-black baggy wide-leg jeans pooling over the shoes, with frayed pocket edges, double-arc back stitching and a red tab. The denim is taken from the product photo.", recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: LEVIS_94_ID, knit: false, shirt: false } },
  { name: 'Davinia jeans study', note: 'Reference study: high-rise, slim straight light acid-wash jeans cropped at the ankle, with a frayed waistband, a red heart on the coin pocket and copper stitching. The denim is taken from the product photo.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: DAVINIA_JEANS_ID, knit: false, shirt: false } },
  { name: 'Barrel jeans study', note: 'Reference study: low-rise acid-wash barrel jeans with knee darts, twisted side seams and flap back pockets, worn with the cropped crochet top. The wash is drawn, not copied.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: BARREL_JEANS_ID, knit: false, shirt: false } },
  { name: 'Striped cardigan study', note: 'Reference study: a cream fisherman rib cardigan buttoned over bare skin, with navy stripes on the lower body and forearms, a deep V and five cream buttons. The knit is drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: PETIT_BATEAU_CARDIGAN_ID, knit: false, shirt: false, bottomId: 'classic', trousers: '#71899b', barrel: .3 } },
  { name: 'Green cable study', note: 'Reference study: a forest green wool sweater with rope cables all over, raglan sleeves, deep ribbing and a little flag on the chest. The cables are drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: TOMMY_CABLE_ID, knit: false, shirt: false, bottomId: 'classic', trousers: '#d9cbb2', barrel: .4 } },
  { name: 'Lacroix flower study', note: 'Reference study: a fuzzy olive sweater painted with a giant violet flower front and back, a white peony and forearm flowers, by Christian Lacroix for Desigual. The flowers are painted from the photos, not copied.', recipe: { ...DEFAULT, topId: LACROIX_FLOWER_ID, knit: false, shirt: false, bottomId: MANGO_BLACK_JEANS_ID } },
  { name: 'Silver cable study', note: 'Reference study: a cropped cable knit coated in silver foil, black in every groove, with a diamond lattice down the front, big wavy sleeve cables and long ribbed cuffs. The knit is drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: SILVER_CABLE_ID, knit: false, shirt: false, bottomId: MANGO_BLACK_JEANS_ID } },
  { name: 'Pointelle flower study', note: 'Reference study: a boxy cream openwork jumper with raglan sleeves, a wide boat neck, scalloped edges and raised raspberry flowers on the front. The knit and flowers are drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: POINTELLE_FLOWER_ID, knit: false, shirt: false, bottomId: LEVIS_94_ID } },
  { name: 'Off-shoulder stripe study', note: 'Reference study: ecru slub knit with dark green stripes, slipping off her left shoulder, with a deep ribbed hem and cuffs. The stripes are drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: STRIPE_JUMPER_ID, knit: false, shirt: false, bottomId: DAVINIA_JEANS_ID } },
  { name: 'Stripe polo study', note: 'Reference study: a fitted navy and off-white striped knit polo with a navy collar, button placket, short sleeves with rib bands and a white monogram. The stripes are drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: TOMMY_STRIPE_POLO_ID, knit: false, shirt: false, bottomId: TOMMY_MOM_ID } },
  { name: 'Tie-dye mesh shirt study', note: 'Reference study: a fitted, cropped button-down in sheer grey-mauve tie-dye mesh, with a point collar, black topstitching and seven black buttons. The tie-dye is drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: MOTEL_TIE_DYE_SHIRT_ID, knit: false, shirt: false, bottomId: MANGO_BLACK_JEANS_ID } },
  { name: 'Spray floral shirt study', note: 'Reference study: a fitted, cropped mesh shirt printed with pink, coral and red spray-paint clouds and cream stencilled flowers, with a point collar, peach buttons and the top button open. The print is drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: DESIGUAL_SPRAY_FLORAL_SHIRT_ID, knit: false, shirt: false, bottomId: STRADIVARIUS_RELAXED_ID } },
  { name: 'Windowpane jumper study', note: 'Reference study: brushed oversized jumper with a knitted-in rust, taupe and pale-blue check and deep ribbing. The check is drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: PLAID_JUMPER_ID, knit: false, shirt: false, trousers: '#283c59', barrel: .35 } },
  { name: 'Crochet flower study', note: 'Reference study: joined crochet flowers, open lace, a filet neckband and scalloped edges. The motif repeat is drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, knit: false, shirt: false, trousers: '#d9cbb2', barrel: .3 } },
  { name: 'Lilac portrait study', note: 'Portrait and floral front, silvery back, navy patterned sleeves and a raised collar. Artwork is an interpretation of the references.', recipe: { ...DEFAULT, topId: LILAC_TOP_ID, knit: false, shirt: false, trousers: '#39363b', barrel: .12 } },
  { name: 'Bronze mesh study', note: 'Reference study: fitted mesh, bronze stripes and Buddha print. Sleeve artwork is approximate.', recipe: { ...DEFAULT, topId: BRONZE_TOP_ID, knit: false, shirt: false, trousers: '#39363b', barrel: .2 } },
  { name: 'Marikoo windbreaker study', note: 'Reference study: a slate-blue windbreaker zipped closed, with an ecru yoke ending in a V at the front, the hood down, drawcords, snap welt pockets and elastic hem and cuffs.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: TOMMY_MOM_ID, outerwearId: MARIKOO_WINDBREAKER_ID, knit: false, shirt: false } },
  { name: 'Leather jacket study', note: 'Reference study: a cropped black faux-leather jacket, worn open as the user wears it, with a point collar, zip pockets over flap pockets with silver snaps, a rib-knit hem band and ruched sleeves. The crinkled gloss is drawn procedurally.', recipe: { ...DEFAULT, topId: STRIPE_JUMPER_ID, bottomId: STRADIVARIUS_RELAXED_ID, outerwearId: DESIGUAL_LEATHER_JACKET_ID, outerwearOpen: true, knit: false, shirt: false } },
  { name: 'Buffalo boots study', note: 'Reference study: chunky olive platform boots with deep lugs, a quilted padded collar, Buffalo logo tape on the heel and tongue, and webbing details, worn with the cropped Davinia jeans so the whole boot shows. Colours measured from the product photos.', recipe: { ...DEFAULT, topId: PLAID_JUMPER_ID, bottomId: DAVINIA_JEANS_ID, shoesId: BUFFALO_ASPHA_ID, knit: false, shirt: false } },
  { name: 'Cow slides study', note: 'Reference study: Dr. Martens platform slides with crossed cow-print pony-hair straps, a buckled black instep strap, yellow welt stitching and a sculpted platform. The platform raises her a little; her bare feet show.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, bottomId: DAVINIA_JEANS_ID, shoesId: DM_COW_SLIDE_ID, knit: false, shirt: false } },
  { name: 'Cream sneakers study', note: 'Reference study: chunky cream UGG platform sneakers, suede over mesh, with big puffy patterned laces tied in a floppy bow and a heel pull loop. Low-cut, so her socks show.', recipe: { ...DEFAULT, topId: PLAID_JUMPER_ID, bottomId: DAVINIA_JEANS_ID, shoesId: UGG_LOWMEL_ID, knit: false, shirt: false } },
  { name: 'Tomato mischief', note: 'A cropped red knit, lilac pleats over indigo jeans. The unexpected layer does the talking.', recipe: { ...DEFAULT, hem: .12, sleeve: .9, skirt: true } },
  { name: 'Butter club', note: 'Butter yellow, washed denim and a peeking striped shirt. Big sleeves, a neat little crop.', recipe: { ...DEFAULT, sweater: '#ead391', trousers: '#71899b', sleeve: 1, hem: .08, barrel: .5 } },
  { name: 'Garden party crasher', note: 'Cobalt knit, moss skirt and ecru jeans. Two strong colours, grounded by a pale trouser.', recipe: { ...DEFAULT, sweater: '#315cb3', trousers: '#d9cbb2', skirtColour: '#74804b', skirt: true, shirt: false, hem: .18, barrel: .25 } },
];

