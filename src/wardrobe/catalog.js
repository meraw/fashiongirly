// Authored wardrobe entries. These describe assets, not runtime AI requests.
// Outerwear: none by default ('none'); catalog coats and jackets fill the 'outerwear' slot.
export const MARIKOO_WINDBREAKER_ID = 'marikoo-two-tone-windbreaker-v1';
export const DESIGUAL_LEATHER_JACKET_ID = 'desigual-black-faux-leather-jacket-v1';
export const RED_BULL_WINDBREAKER_ID = 'red-bull-racing-stone-windbreaker-v1';
export const EMERALD_PARKA_ID = 'emerald-dyed-sherpa-hood-parka-v1';
export const BOMBOOGIE_FUR_JACKET_ID = 'bomboogie-pink-faux-fur-jacket-v1';
// Dresses: none by default ('none'); a catalog dress fills the 'dress' slot and is worn instead of the top and bottoms.
export const ZIP_TRACK_DRESS_ID = 'navy-half-zip-track-dress-v1';
// Shoes: built-in loafers are 'classic'; catalog shoes fill the 'shoes' slot.
export const BUFFALO_ASPHA_ID = 'buffalo-aspha-mid-olive-v1';
export const DM_COW_SLIDE_ID = 'dr-martens-cow-slide-v1';
export const UGG_LOWMEL_ID = 'ugg-lowmel-cream-v1';
export const SAM_ZIP_BOOT_ID = 'sam-edelman-front-zip-lug-boot-v1';
export const DM_BLAIRE_CHAIN_ID = 'dr-martens-blaire-quad-chain-v1';
export const ADIDAS_SUPERSTAR_PINK_ID = 'adidas-superstar-pink-suede-v1';
export const CONVERSE_LIFT_HI_ID = 'converse-modern-lift-hi-egret-v1';
export const NB_550_ID = 'new-balance-550-cream-v1';
export const GAZELLE_BOLD_ID = 'adidas-gazelle-bold-cream-green-v1';
export const ADIDAS_CAMPUS_ID = 'adidas-campus-00s-grey-v1';
export const BRONZE_TOP_ID = 'desigual-bronze-mesh-v1';
export const LILAC_TOP_ID = 'lilac-portrait-mockneck-v1';
export const CROCHET_TOP_ID = 'desigual-crochet-flowers-v1';
export const PLAID_JUMPER_ID = 'mango-plaid-jumper-v1';
export const STRIPE_JUMPER_ID = 'bershka-asymmetric-stripe-jumper-v1';
export const POINTELLE_FLOWER_ID = 'cream-pointelle-flower-jumper-v1';
export const SILVER_CABLE_ID = 'desigual-silver-cable-jumper-v1';
export const LACROIX_FLOWER_ID = 'desigual-lacroix-flower-sweater-v1';
export const TOMMY_CABLE_ID = 'tommy-green-cable-sweater-v1';
export const PETIT_BATEAU_CARDIGAN_ID = 'petit-bateau-striped-cardigan-v1';
export const TOMMY_STRIPE_POLO_ID = 'tommy-stripe-knit-polo-v1';
export const MOTEL_TIE_DYE_SHIRT_ID = 'motel-tie-dye-mesh-shirt-v1';
export const DESIGUAL_SPRAY_FLORAL_SHIRT_ID = 'desigual-spray-floral-mesh-shirt-v1';
export const VANGOGH_TEE_ID = 'van-gogh-patchwork-tee-v1';
export const DESIGUAL_FRESCO_TEE_ID = 'desigual-fresco-rib-vneck-tee-v1';
export const MICKEY_LONG_TEE_ID = 'black-mickey-print-long-tee-v1';
export const BARREL_JEANS_ID = 'topshop-barrel-jeans-v1';
export const DAVINIA_JEANS_ID = 'desigual-davinia-jeans-v1';
export const LEVIS_94_ID = 'levis-94-wide-leg-v1';
export const TOMMY_MOM_ID = 'tommy-ultra-high-mom-v1';
export const STRADIVARIUS_RELAXED_ID = 'stradivarius-relaxed-v1';
export const MANGO_BLACK_JEANS_ID = 'mango-washed-black-v1';
export const BERSHKA_GREY_ID = 'bershka-grey-wide-leg-v1';
export const TOMMY_CARPENTER_ID = 'tommy-remastered-carpenter-v1';
export const ZARA_CARGO_ID = 'zara-cargo-joggers-v1';
export const CRYSTAL_JEANS_ID = 'crystal-straight-jeans-v1';
export const NIKE_TRACK_ID = 'nike-piped-track-pants-v1';
export const TOPSHOP_BLACK_CROP_ID = 'topshop-washed-black-wide-crop-v1';
export const PLEATED_LINEN_ID = 'pleated-linen-wide-trousers-v1';
export const GARMENTS = Object.freeze({
  [BRONZE_TOP_ID]: {
    slot: 'top',
    id: BRONZE_TOP_ID,
    name: 'Bronze Buddha mesh',
    family: 'fitted-long-sleeve-top',
    version: 1,
    status: 'user-liked-after-elbow-correction',
    brandAsProvided: 'Desigual',
    referenceViews: ['front', 'back'],
    details: ['bronze glitter and opaque black horizontal stripes', 'front-facing Buddha on both torso panels', 'neon green outlined sleeve graphics', 'soft white airbrushed patches', 'black bound crew neck', 'long fitted sleeves'],
    material: { construction: 'fine stretch mesh', finish: 'metallic flecks', opaqueBands: 'black' },
    fit: { silhouette: 'close to doll body', sleeve: 'tapered', hem: 'hip', adjustment: 'fixed authored fit for first review' },
    exclusions: ['striped-shirt', 'knit-sweater'],
    // underTop: fitted enough to wear under a top worn over another (a cardigan).
    layering: { coversWaistband: true, underTop: true },
    uncertainties: ['exact sleeve characters are not transcribed', 'generated artwork is interpretive', 'same front-facing motif is reused on back', 'side seam alignment and physical transparency need visual review'],
    styling: { silhouette: 'fitted, hip length', palette: ['bronze', 'black', 'neon green', 'white'], pattern: 'horizontal metallic stripes with a large graphic print', coverage: { neck: 'crew', sleeves: 'long', midriff: 'covered' }, material: 'fine stretch mesh with opaque bands', warmth: 1, warmthBasis: 'inferred: fine mesh, partly see-through', weather: 'a light layer; sheer in the mesh stripes' },
    authoring: { texture: 'bronze-atlas.js', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [LILAC_TOP_ID]: {
    slot: 'top',
    id: LILAC_TOP_ID, name: 'Lilac portrait mock neck', family: 'fitted-long-sleeve-top', version: 1,
    status: 'user-approved', brandAsProvided: null,
    referenceViews: ['front','back'],
    details: ['mauve portrait and flowers on front', 'plain pale silvery-lilac back', 'navy sleeves with alternating circle and dot bands', 'short raised ribbed neck', 'long sleeves with wrist gathering', 'longer close-fitting torso'],
    material: { construction: 'textured fabric; exact fibre unconfirmed', finish: 'subtle metallic back sheen' },
    fit: { silhouette: 'close to doll body', sleeve: 'tapered with cuff gathers', hem: 'lower hip', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // underTop: fitted enough to wear under a top worn over another (a cardigan).
    layering: { coversWaistband: true, underTop: true },
    uncertainties: ['portrait and floral artwork are interpretive', 'physical material and brand are not established from pictures', 'exact seam placement and print scale need visual review'],
    styling: { silhouette: 'fitted, lower hip length', palette: ['lilac', 'mauve', 'navy', 'silver'], pattern: 'portrait and flowers on the front, patterned navy sleeves', coverage: { neck: 'raised mock neck', sleeves: 'long', midriff: 'covered' }, material: 'textured fabric, fibre unknown', warmth: 2, warmthBasis: 'inferred: long sleeves and a mock neck; fabric weight unknown', weather: 'unknown beyond coverage' },
    authoring: { texture: 'lilac-atlas.js', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [CROCHET_TOP_ID]: {
    slot: 'top',
    id: CROCHET_TOP_ID, name: 'Blue crochet flowers', family: 'cropped-crochet-sweater', version: 1,
    status: 'user-approved', brandAsProvided: 'Desigual',
    source: { page: 'https://www.desigual.com/it_IT/26SWJFXG.html', sku: '26SWJFXG5050', fetchedForAuthoring: '2026-10-08' },
    referenceViews: ['front on model', 'back three-quarter on model', 'front flat lay', 'street action'],
    details: ['joined hexagonal flower motifs: navy petals with spoked turquoise centres, pale-blue petals, cream petals with navy centres, small navy wheels', 'open cream lace between motifs', 'wide filet-crochet neckband on a broad scoop neck', 'cropped boxy body', 'long slightly flared sleeves reaching the knuckles', 'scalloped hem and cuffs'],
    material: { construction: 'joined crochet motifs with openwork filler', composition: '60% cotton, 40% acrylic per composition section; the same page also says 100% cotton', finish: 'matte yarn' },
    fit: { silhouette: 'boxy, cropped at the waist', sleeve: 'slightly flared, covers half the mitten', hem: 'scalloped at waist', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['motif layout is a procedural repeat, not a stitch-for-stitch copy', 'upper back and back neckline are hidden by hair in the back photo', 'dropped shoulders and the ladder seams at shoulder and sleeve are not modelled', 'scallops do not follow individual motif edges'],
    styling: { silhouette: 'boxy, cropped at the waist', palette: ['navy', 'turquoise', 'pale blue', 'cream'], pattern: 'joined crochet flowers with open lace', coverage: { neck: 'wide scoop', sleeves: 'long, flared', midriff: 'cropped' }, material: 'cotton-rich crochet (per the product page)', warmth: 1, warmthBasis: 'inferred: open crochet lets air through', weather: 'airy; shows what is worn under it' },
    authoring: { texture: 'procedural crochetData() in src/doll/model.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [PLAID_JUMPER_ID]: {
    slot: 'top',
    id: PLAID_JUMPER_ID, name: 'Brushed windowpane jumper', family: 'oversized-knit-jumper', version: 1,
    status: 'user-approved', brandAsProvided: 'Mango',
    source: { page: 'https://www.zalando.ie/mango-jumper-light-blue-zir03dt4f-001.html', note: 'page blocked automated fetching; user supplied phone screenshots of 7 product photos' },
    referenceViews: ['front on model', 'front full length', 'knit close-up', 'back on model', 'sleeve and hem close-up', 'front flat lay', 'crouching side'],
    details: ['large windowpane check knitted in (jacquard), not printed', 'wide bands of diagonal hatching in rust-brown and grey-taupe', 'thin pale-blue lines through bands and cream windows', 'brushed fuzzy cream ground', 'ribbed crew neck', 'deep ribbed hem band', 'ribbed cuffs gathering full sleeves', 'oversized boxy body with dropped shoulders'],
    material: { construction: 'heavy brushed jacquard knit', composition: 'not visible in the supplied screenshots', finish: 'soft halo' },
    fit: { silhouette: 'oversized, boxy', sleeve: 'full, gathered into ribbed cuffs', hem: 'hip, deep rib band', adjustment: 'fixed authored fit for review' },
    wear: { userNote: 'rarely worn: oversized and very warm for the local climate' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['check scale and band order are an interpretation of the photos', 'fibre composition is unknown', 'the shirt collar and cuffs in the photos are styling, not part of the jumper'],
    styling: { silhouette: 'oversized, boxy, mid-thigh length', palette: ['cream', 'rust brown', 'grey-taupe', 'pale blue'], pattern: 'large windowpane check', coverage: { neck: 'crew', sleeves: 'long, full', midriff: 'covered' }, material: 'heavy brushed jacquard knit', warmth: 4, warmthBasis: 'user: very warm for the local climate', weather: 'cold days only (user note)' },
    authoring: { texture: 'procedural plaidData() in src/doll/model.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [STRIPE_JUMPER_ID]: {
    slot: 'top',
    id: STRIPE_JUMPER_ID, name: 'Asymmetric rustic stripe jumper', family: 'off-shoulder-knit-jumper', version: 1,
    status: 'user-approved', brandAsProvided: 'Bershka',
    source: { note: 'user supplied two phone screenshots of a Myntra listing (Bershka Asymmetric Rustic Stripe Jumper): front on model and a flat lay; no other views were available' },
    referenceViews: ['front on model', 'front flat lay'],
    details: ['wide asymmetric neckline worn off one shoulder: high at the base of the neck on her right, slipping below the shoulder onto the upper arm on her left', 'ecru slub ("rustic") knit with even dark green horizontal stripes', 'stripes near the neckline follow its slant and level out lower down', 'deep plain ecru ribbed hem band', 'long straight sleeves with deep plain ribbed cuffs', 'boxy body with dropped shoulders, ending at the high hip', 'narrow plain edge around the neckline'],
    material: { construction: 'medium-weight slub knit', composition: 'not visible in the supplied screenshots', finish: 'matte, flecked yarn' },
    fit: { silhouette: 'relaxed, boxy', sleeve: 'long and straight into deep ribbed cuffs', hem: 'high hip, deep rib band', neckline: 'off her left shoulder', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // The bare shoulder is deliberate: her left arm shows above the neckline, and the body (not the sleeve) covers it just
    // below. Sleeve-local height above which the sleeve alone does not cover that arm.
    layering: { coversWaistband: true, bareShoulder: { side: 1, above: -.23 } },
    uncertainties: ['the back was not shown; its neckline and stripes are inferred', 'the flat lay and the worn photo disagree on which side sits lower; the worn photo is followed', 'stripe count is adapted to her short torso', 'the bare shoulder is a skin-coloured piece inside the jumper, because her body under clothes is cream felt'],
    styling: { silhouette: 'relaxed, boxy, high hip', palette: ['ecru', 'dark green'], pattern: 'even horizontal stripes', coverage: { neck: 'off one shoulder', sleeves: 'long', midriff: 'covered' }, material: 'medium-weight slub knit', warmth: 2, warmthBasis: 'inferred: medium knit, one shoulder bare', weather: 'mild; the bare shoulder is exposed' },
    authoring: { texture: 'procedural stripeKnitData() in src/doll/model.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [POINTELLE_FLOWER_ID]: {
    slot: 'top',
    id: POINTELLE_FLOWER_ID, name: 'Cream pointelle flower jumper', family: 'boxy-openwork-knit-jumper', version: 1,
    status: 'user-approved', brandAsProvided: null,
    source: { note: "the user's own jumper, photographed flat on the floor from the front and the back; the user could not find the product online" },
    referenceViews: ['front flat on the floor', 'back flat on the floor'],
    details: ['cream openwork knit: bands of two staggered eyelet rows between raised horizontal ridges', 'eight raised embroidered flowers scattered over the front only: six raspberry petals with a darker centre, two dark green leaves above each, so the flowers hang', 'wide boat neckline', 'raglan seams from the neckline to the underarms', 'boxy body about as long as it is wide, ending at the hip', 'long wide straight sleeves', 'narrow plain bands with small scallops at the neckline, hem and sleeve ends'],
    material: { construction: 'fine openwork (pointelle) knit', composition: 'not known', finish: 'matte cotton-like yarn' },
    fit: { silhouette: 'boxy, relaxed', sleeve: 'long, wide and straight', hem: 'hip, narrow scalloped band', neckline: 'wide boat neck', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['eyelet spacing is coarser than the real knit so it reads at the doll\'s size', 'flower placement is measured from the front photo and adapted to her short torso', 'the front photo has a cool colour cast; colours aim between the two photos', 'her body under clothes is cream felt, so skin is drawn inside the jumper to show through the eyelets'],
    styling: { silhouette: 'boxy, hip length', palette: ['cream', 'raspberry', 'dark green'], pattern: 'eyelet bands with scattered raised flowers on the front', coverage: { neck: 'wide boat neck', sleeves: 'long, wide', midriff: 'covered' }, material: 'fine openwork knit', warmth: 1, warmthBasis: 'inferred: openwork knit', weather: 'airy; shows what is worn under it' },
    authoring: { texture: 'procedural pointelleData() in src/doll/model.js; flowers are small raised shapes', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [SILVER_CABLE_ID]: {
    slot: 'top',
    id: SILVER_CABLE_ID, name: 'Silver foil cable jumper', family: 'cropped-cable-knit-jumper', version: 1,
    status: 'user-approved', brandAsProvided: 'Desigual',
    source: { note: 'user supplied five phone screenshots of a Modivo listing (Desigual knit jumper): front and back on a model, a front close-up, a neckline close-up and a flat lay' },
    referenceViews: ['front on model', 'back on model', 'front close-up', 'neckline close-up', 'front flat lay'],
    details: ['black yarn coated with silver foil: raised stitches shine silver, grooves and gaps stay black', 'centre panel of fine twisted-stitch cables forming a diamond lattice, front and back', 'columns of twisted ribs and small rope cables either side of the panel', 'a large wavy cable down each sleeve, with black slits where its strands part', 'deep ribbed hem band, long ribbed cuffs and a ribbed crew neck, black in every groove', 'slim fit, cropped at the waist, set-in sleeves'],
    material: { construction: 'cable knit', composition: 'not visible in the supplied screenshots', finish: 'metallic silver foil over black' },
    fit: { silhouette: 'slim', sleeve: 'long and fitted, gathered into long ribbed cuffs', hem: 'cropped at the waist, deep rib band', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['the lattice and cables are drawn procedurally, not stitch for stitch', 'the exact order of the narrow columns beside the panel is simplified', 'silver is shaded with the studio lights only; there is no reflected environment'],
    styling: { silhouette: 'slim, cropped at the waist', palette: ['silver', 'black'], pattern: 'metallic cable knit: diamond lattice, rope cables and ribs', coverage: { neck: 'crew', sleeves: 'long', midriff: 'cropped' }, material: 'cable knit coated with silver foil', warmth: 2, warmthBasis: 'inferred: cable knit, but cropped', weather: 'unknown how the foil coating handles rain' },
    authoring: { texture: 'procedural silverKnitData() in src/doll/model.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [LACROIX_FLOWER_ID]: {
    slot: 'top',
    id: LACROIX_FLOWER_ID, name: 'Lacroix giant flower sweater', family: 'printed-knit-sweater', version: 1,
    status: 'user-approved', brandAsProvided: 'Desigual, designed by Christian Lacroix',
    source: { note: 'user supplied five phone screenshots of the desigual.com (NZ) listing "Sweater designed by Mr. Christian Lacroix": flat lay, front and back on a model, a neckline close-up and a front close-up' },
    referenceViews: ['front flat lay', 'front on model', 'back on model', 'neckline close-up', 'front close-up'],
    details: ['fuzzy olive-green knit', 'one giant painterly violet flower across the front: five streaked petals fading to lilac and white, a mint throat, black stamens and a thick black stem from her right shoulder', 'a second violet flower low on her right with a diagonal black stem, and a white and mint peony sketched in black low on her left', 'a giant violet flower across the upper back', 'flowers on both forearms: violet on her right, the peony and violet on her left', 'olive ribbed cuffs, a lilac ribbed crew neck, and a hem rib that carries the print', 'regular fit to the high hip'],
    material: { construction: 'brushed (fuzzy) knit with a knitted-in print', composition: 'not visible in the supplied screenshots', finish: 'soft halo' },
    fit: { silhouette: 'regular, close but not tight', sleeve: 'long, slightly loose, ribbed cuffs', hem: 'high hip', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the flowers are painted procedurally from the photos, not copied; their shapes and streaks are an interpretation', 'flower sizes are adapted to her short, wide torso', 'the back is read from one model photo partly hidden by hair'],
    styling: { silhouette: 'regular, high hip', palette: ['olive', 'violet', 'lilac', 'white', 'mint', 'black'], pattern: 'giant painterly flowers front, back and on the forearms', coverage: { neck: 'crew', sleeves: 'long', midriff: 'covered' }, material: 'brushed knit, composition unknown', warmth: 3, warmthBasis: 'inferred: brushed knit', weather: 'cool days' },
    authoring: { texture: 'procedural lacroixData() in src/doll/model.js, painted locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [TOMMY_CABLE_ID]: {
    slot: 'top',
    id: TOMMY_CABLE_ID, name: 'Green cable knit wool sweater', family: 'cable-knit-sweater', version: 1,
    status: 'user-approved', brandAsProvided: 'Tommy Hilfiger',
    source: { note: 'user supplied five phone screenshots of a Rinascente listing (Tommy Hilfiger cable knit wool sweater): front and full length on a model, a close-up, the back and a flat lay' },
    referenceViews: ['front on model', 'full length on model', 'front close-up', 'back on model', 'front flat lay'],
    details: ['forest green wool', 'rope cables all over: about eight columns across the front and the back, continuing down the sleeves', 'raglan sleeves with seams from the neck to each underarm', 'narrow ribbed crew neck', 'deep ribbed hem band and long ribbed cuffs', 'small embroidered flag on her left chest', 'relaxed fit to the hip'],
    material: { construction: 'cable knit', composition: 'wool (from the listing title); exact blend not visible', finish: 'soft, slightly heathered' },
    fit: { silhouette: 'relaxed, straight', sleeve: 'long raglan sleeves into ribbed cuffs', hem: 'hip, deep rib band', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the cables are a regular procedural repeat; their twist is taller than wide in the photos, slightly squatter here to suit her short torso', 'the flag is a simple three-colour tab, not the exact logo'],
    styling: { silhouette: 'relaxed, straight, hip length', palette: ['forest green'], pattern: 'tonal rope cables all over', coverage: { neck: 'crew', sleeves: 'long', midriff: 'covered' }, material: 'wool cable knit (listing title)', warmth: 3, warmthBasis: 'inferred: wool cable knit', weather: 'cool to cold days' },
    authoring: { texture: 'procedural cableKnitData() in src/doll/model.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [PETIT_BATEAU_CARDIGAN_ID]: {
    slot: 'top',
    id: PETIT_BATEAU_CARDIGAN_ID, name: 'Striped fisherman rib cardigan', family: 'button-front-cardigan', version: 1,
    status: 'user-approved', brandAsProvided: 'Petit Bateau',
    source: { note: 'user supplied four phone screenshots of a petit-bateau.it listing: flat lay buttoned, on a model, flat lay with the front opened, and the back' },
    referenceViews: ['front flat lay, buttoned', 'front on model', 'front flat lay, opened', 'back flat lay'],
    details: ['cream fisherman rib knit', 'three wide navy stripes round the lower body, front and back, above a cream ribbed hem', 'three navy stripes on each forearm, above long cream ribbed cuffs', 'deep V-neck with ribbed button bands meeting at the first button', 'five cream buttons down the front', 'a small navy badge on her left upper sleeve', 'oversized and boxy with dropped shoulders; on the user it hangs well below the crotch, to mid-thigh, and the sleeves cover most of the hands'],
    material: { construction: 'chunky fisherman rib knit', composition: 'not visible in the supplied screenshots', finish: 'matte cotton-like yarn' },
    fit: { silhouette: 'oversized, boxy', sleeve: 'long, falling over most of the hands (the user)', hem: 'mid-thigh, well below the crotch (the user)', neckline: 'deep V', adjustment: 'fixed authored fit for review' },
    // A top, not outerwear: the user wears cardigans on their own, buttoned over bare skin, or over a blue sleeveless top.
    wear: { userNote: 'worn buttoned on its own with skin showing in the V, or over a blue sleeveless top' },
    exclusions: ['striped-shirt','knit-sweater'],
    // overTop: worn on its own or over a slim top (the user wears it over a blue sleeveless top).
    layering: { coversWaistband: true, overTop: true },
    styling: { silhouette: 'oversized, boxy, mid-thigh length', palette: ['cream', 'navy'], pattern: 'wide navy stripes on the lower body and forearms', coverage: { neck: 'deep V, skin showing', sleeves: 'long', midriff: 'covered' }, material: 'chunky fisherman rib knit', warmth: 3, warmthBasis: 'inferred: chunky knit, open V-neck', weather: 'cool days; the V leaves the chest open' },
    uncertainties: ['buttons are plain cream discs', 'the badge is a plain navy oval', 'the rib is drawn as texture and bump, not separate ridges', 'worn over the blue sleeveless top needs a rule for layering two tops, not yet built'],
    authoring: { texture: 'procedural fishermanRibData() in src/doll/model.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [TOMMY_STRIPE_POLO_ID]: {
    slot: 'top',
    id: TOMMY_STRIPE_POLO_ID, name: 'Navy stripe knit polo', family: 'short-sleeve-knit-polo', version: 1,
    status: 'user-approved', brandAsProvided: 'Tommy Hilfiger',
    source: { note: 'user supplied four phone screenshots of a product gallery: front on a model, back on a model, a close-up of the neckline and a flat lay' },
    referenceViews: ['front on model', 'back on model', 'neckline close-up', 'front flat lay'],
    details: ['fine-gauge knit in navy and off-white horizontal stripes, navy about 60% of each repeat', 'navy knit polo collar with spread points', 'short navy placket with four off-white buttons; worn with the top one open', 'white script monogram on her left chest, level with the bottom button', 'short set-in sleeves ending above the elbow in narrow navy rib bands', 'small metal flag tab on the left sleeve band', 'navy ribbed hem band', 'slim fit, ending at the waist over high-rise jeans'],
    material: { construction: 'fine-gauge knit', composition: 'not visible in the supplied screenshots', finish: 'smooth, matte' },
    fit: { silhouette: 'slim, fitted', sleeve: 'short, close to the arm, rib band above the elbow', hem: 'waist, narrow rib band', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Where the sleeve fabric ends (sleeve-local height, used by the shared sleeve test): below it the rib band, then her bare arm.
    layering: { bareArmBelow: -.18 },
    uncertainties: ['about eleven stripe repeats from hem band to neck on her short torso, where the photos show about ten to thirteen', 'the monogram is a drawn suggestion of the script, not the brand\'s lettering', 'the sleeve flag is a simple three-colour tab', 'worn with the top button open, as on the model; the flat lay is fully buttoned'],
    styling: { silhouette: 'slim, waist length', palette: ['navy', 'off-white'], pattern: 'even horizontal Breton-style stripes with a navy collar, placket and bands', coverage: { neck: 'polo collar, top button open', sleeves: 'short', midriff: 'covered to the waist' }, material: 'fine-gauge knit, composition unknown', warmth: 1, warmthBasis: 'inferred: fine knit with short sleeves', weather: 'mild to warm days; layers under a jacket' },
    authoring: { texture: 'procedural stripeData() in src/doll/polo.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [MOTEL_TIE_DYE_SHIRT_ID]: {
    slot: 'top',
    id: MOTEL_TIE_DYE_SHIRT_ID, name: 'Tie-dye mesh button-down shirt', family: 'fitted-mesh-button-down-shirt', version: 1,
    status: 'user-approved', brandAsProvided: 'Motel',
    source: { note: 'user supplied six photos: front and back on a model (shop photos), the shirt laid flat on a rug with a close-up of the collar, and the front and back on a hanger' },
    referenceViews: ['front on model', 'back on model', 'flat lay', 'collar close-up', 'front on hanger', 'back on hanger'],
    details: ['sheer stretch mesh printed with a warm grey-mauve tie-dye: dark brown-grey clouds bleeding into pale pinkish beige', 'point collar on a stand, with black topstitching inside its edges', 'black facing inside the back neck, showing between the collar points', 'front placket edged with black stitching, seven glossy black buttons from the collar to the hem', 'long fitted set-in sleeves to the wrist, plain stitched hems', 'black overlocked hem', 'slim, cropped at the waist'],
    material: { construction: 'stretch mesh', composition: 'not visible in the supplied photos', finish: 'slight sheen; sheer, most visibly on the sleeves' },
    fit: { silhouette: 'slim, fitted', sleeve: 'long and fitted, to the wrist', hem: 'cropped at the waist, straight', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['the tie-dye is drawn procedurally to match the photos\' colours and patch size, not copied', 'worn buttoned to the top, as on the hanger; the model wears it open at the neck', 'only the sleeves are drawn sheer; over her body (cream felt, not skin) sheer mesh would show the felt', 'button count read as seven from the hanger photo'],
    styling: { silhouette: 'slim, cropped at the waist', palette: ['grey-brown', 'mauve', 'pale pinkish beige', 'black'], pattern: 'cloudy tie-dye all over, with black buttons and topstitching', coverage: { neck: 'point collar, buttoned', sleeves: 'long, sheer', midriff: 'cropped at the waist' }, material: 'sheer stretch mesh, composition unknown', warmth: 1, warmthBasis: 'inferred: thin sheer mesh, though long-sleeved', weather: 'mild days, or as a layer; sheer' },
    authoring: { texture: 'procedural tieDyeData() and meshNetData() in src/doll/shirts.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [DESIGUAL_SPRAY_FLORAL_SHIRT_ID]: {
    slot: 'top',
    id: DESIGUAL_SPRAY_FLORAL_SHIRT_ID, name: 'Spray-paint floral mesh shirt', family: 'fitted-mesh-button-down-shirt', version: 1,
    status: 'user-approved', brandAsProvided: 'Desigual',
    source: { note: 'user supplied four product photos: two fronts on a model, a front flat lay and the back on a model' },
    referenceViews: ['front on model (arms crossed)', 'front on model', 'front flat lay', 'back on model'],
    details: ['fine-rib stretch mesh printed with blurred pink, coral, red and orange spray-paint clouds', 'cream stencilled flowers, leaves and petals sprayed over the clouds, with speckled overspray', 'point collar in the print', 'eight pale peach buttons from the collar to the hem; worn with the top button open', 'tonal stitching on the placket and hems', 'long fitted sleeves to the wrist', 'slim, cropped at the waist'],
    material: { construction: 'fine-rib stretch mesh', composition: 'not visible in the supplied photos', finish: 'slight sheen' },
    fit: { silhouette: 'slim, fitted', sleeve: 'long and fitted, to the wrist', hem: 'cropped at the waist', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['the clouds and stencils are drawn procedurally to match the photos\' colours, shares and motif sizes, not copied', 'worn with the top button open, as on the model; the flat lay is fully buttoned', 'the hem is drawn straight; on the model it dips slightly at the centre front', 'not see-through, as for the tie-dye mesh shirt'],
    styling: { silhouette: 'slim, cropped at the waist', palette: ['pink', 'coral', 'red', 'orange', 'cream'], pattern: 'blurred spray-paint clouds with large cream stencilled flowers and leaves', coverage: { neck: 'point collar, top button open', sleeves: 'long, sheer', midriff: 'cropped at the waist' }, material: 'fine-rib stretch mesh, composition unknown', warmth: 1, warmthBasis: 'inferred: thin, sheer mesh, though long-sleeved', weather: 'mild to warm days, or as a layer; sheer' },
    authoring: { template: 'makeButtonShirt() in src/doll/shirts.js', texture: 'procedural sprayFloralData() and fineRibData() in src/doll/shirts.js, drawn locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [VANGOGH_TEE_ID]: {
    slot: 'top',
    id: VANGOGH_TEE_ID, name: 'Van Gogh patchwork print tee', family: 'printed-raglan-tee', version: 1,
    status: 'user-approved', brandAsProvided: 'not stated',
    source: { note: 'user supplied six product photos without a written description: front (on a model, and closer), back (two), and close-ups of the back band and the front side' },
    referenceViews: ['front on model', 'front, closer', 'back on model', 'back, closer', 'back band close-up', 'front side close-up'],
    details: ['fitted short-sleeved raglan tee in a fine stretch rib knit', 'pieced from panels printed with sections of Van Gogh paintings: a swirling blue sky with white clouds, and white roses with dark leaves on pale green (his Roses, 1890)', 'front: sky panel on her right, roses panel on her left, joined by a centre seam', 'back: a large white cloud on a blue and teal sky, above a band of roses across the lower back', 'raglan sleeves: her right sleeve roses and leaves, her left sleeve sky', 'every seam exposed and overlocked in sage green, slightly wavy', 'lettuce-edge hem, sleeve hems and crew neckline in the same green'],
    material: { construction: 'fine stretch rib jersey (read from the close-ups)', composition: 'not stated', finish: 'matte print' },
    fit: { silhouette: 'fitted, close to the body', sleeve: 'short raglan sleeves ending above the elbow', hem: 'high hip, at the waistband of high-rise jeans', neckline: 'crew', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Covers the waistband; the short sleeve's fabric ends at -.17 (sleeve-local), below which her arm is bare.
    layering: { coversWaistband: true, bareArmBelow: -.17 },
    uncertainties: ['the print is taken from the product photos, so it is softer than the real fabric and some photographed folds and shading remain', 'the doll\'s torso is wider and shorter than the model\'s, so each panel shows a shorter vertical slice of its painting', 'the sleeves are made from small crops and are blurrier than the body', 'the side seams and panel edges are placed to match the doll, from the photos'],
    styling: { silhouette: 'fitted, high-hip length', palette: ['sky blue', 'white', 'sage green', 'teal'], pattern: 'patchwork of painting prints: a swirling sky with clouds and white roses on green, with green overlocked seams', coverage: { neck: 'crew', sleeves: 'short', midriff: 'covered' }, material: 'fine stretch rib jersey', warmth: 1, warmthBasis: 'inferred: thin fitted knit with short sleeves', weather: 'warm days, or a base layer under a jacket' },
    authoring: { texture: 'vangogh-tee-atlas.js: the body unwrapped and the sleeves, projected from the user\'s front and back photos with studio shading partly divided out; the paintings are long out of copyright', runtimeGeneration: false, sourcePhotosBundled: 'processed crops only, as the texture atlas' },
    // Construction for makePrintedTee() in src/doll/printed-tee.js, in outfit units. The seams sit on the panel edges of the
    // atlas: raglan lines from the neckline (u .055 round from centre front) to the underarm (u .235, v .66), side seams at
    // u .25 and .75, and the back band's seam at v .27 (v from hem to neck).
    build: {
      template: 'printed-raglan-tee',
      colours: { overlock: '#3f564c', fallback: '#a9c0cf', printTone: '#bebebe' },
      body: { neck: 1.91, hem: 1.19, lettuce: .0035, waves: 44, neckWaves: 30,
        rows: [[1.91, .109, .099], [1.875, .17, .122], [1.83, .228, .152], [1.775, .265, .175], [1.65, .279, .183], [1.49, .277, .187], [1.34, .284, .196], [1.25, .29, .206], [1.19, .292, .213]] },
      seams: { neckU: .055, armU: .235, armV: .66, band: .27 },
      sleeve: { rows: [[.03, .108, .106], [-.04, .12, .117], [-.12, .119, .116], [-.17, .122, .119]], lettuce: .003, waves: 18 },
    },
  },
  [DESIGUAL_FRESCO_TEE_ID]: {
    slot: 'top',
    id: DESIGUAL_FRESCO_TEE_ID, name: 'Desigual fresco print V-neck tee', family: 'printed-raglan-tee', version: 1,
    status: 'authored-awaiting-user-review', brandAsProvided: 'Desigual (label in the flat lay)',
    source: { note: 'user supplied four product photos without a written description: a front flat lay, the front on a model (full length and closer) and the back on a model' },
    referenceViews: ['front flat lay', 'front on model, full length', 'front on model, closer', 'back on model'],
    details: ['fitted short-sleeved tee in a fine stretch rib knit', 'printed all over with a pale baroque ceiling fresco: cherubs, clouds, a seated figure in white robes, dark rocks with a touch of teal, and an eagle with spread wings on the back', 'cream, beige, ochre and sage, with hints of teal, blue and pink', 'deep, wide V-neck with a narrow bound edge, its sides curving into the point', 'exposed cream overlocked seam down the centre front, from the point of the V to the hem', 'exposed overlocked seams from the neckline down to each underarm, front and back', 'lettuce-edge hem and sleeve hems in cream', 'elbow-length sleeves, slightly flared'],
    material: { construction: 'fine stretch rib jersey (read from the photos)', composition: 'not stated', finish: 'matte print' },
    fit: { silhouette: 'fitted, close to the body', sleeve: 'short sleeves ending just above the elbow, slightly flared', hem: 'at the waistband of high-rise trousers', neckline: 'deep V', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Covers the waistband; the short sleeve's fabric ends at -.205 (sleeve-local), below which her arm is bare.
    layering: { coversWaistband: true, bareArmBelow: -.205 },
    uncertainties: ['the print is taken from the product photos, so it is softer than the real fabric and some photographed shading remains', 'the doll\'s torso is wider and shorter than the model\'s, so the front shows a shorter vertical slice of the print and the shapes are a little squatter', 'the sleeves are made from small crops and are blurrier than the body', 'the painting appears to be an 18th-century Venetian ceiling fresco; it is not identified'],
    styling: { silhouette: 'fitted, high-hip length', palette: ['cream', 'beige', 'ochre', 'sage', 'teal'], pattern: 'all-over baroque fresco print of cherubs and clouds, with cream overlocked seams', coverage: { neck: 'deep V', sleeves: 'short, to the elbow', midriff: 'covered' }, material: 'fine stretch rib jersey', warmth: 1, warmthBasis: 'inferred: thin fitted knit with short sleeves and an open neckline', weather: 'warm days, or a base layer under a jacket' },
    authoring: { template: 'makePrintedTee() in src/doll/printed-tee.js', texture: 'fresco-tee-atlas.js: the body unwrapped and the sleeves, projected from the user\'s flat lay (front) and back photo, with the back photo\'s side shading partly divided out; the painting is long out of copyright', runtimeGeneration: false, sourcePhotosBundled: 'processed crops only, as the texture atlas' },
    // Construction for makePrintedTee() in src/doll/printed-tee.js, in outfit units. The V is laid on the flat lay's V in
    // the atlas: it meets the neckline .173 of the way round from centre front and ends at 1.68.
    build: {
      template: 'printed-raglan-tee',
      colours: { overlock: '#e2cfae', binding: '#c9ad85', fallback: '#dcc6a4', printTone: '#bdb8b3' },
      body: { neck: 1.91, hem: 1.19, lettuce: .0035, waves: 44, neckWaves: 30,
        rows: [[1.91, .109, .099], [1.875, .17, .122], [1.83, .228, .152], [1.775, .265, .175], [1.65, .279, .183], [1.49, .277, .187], [1.34, .284, .196], [1.25, .29, .206], [1.19, .292, .213]] },
      vneck: { bottom: 1.68, half: .173, round: 1.7, binding: .012 },
      seams: { neckU: .19, armTop: .95, armU: .235, armV: .66, centreTop: .68, sides: [] },
      sleeve: { rows: [[.03, .108, .106], [-.04, .12, .117], [-.13, .122, .119], [-.205, .127, .124]], lettuce: .003, waves: 20 },
    },
  },
  [MICKEY_LONG_TEE_ID]: {
    slot: 'top',
    id: MICKEY_LONG_TEE_ID, name: 'Black Mickey Mouse print long-sleeve tee', family: 'printed-long-sleeve-tee', version: 1,
    status: 'user-approved', brandAsProvided: 'not stated (a licensed Disney Mickey Mouse print)',
    source: { note: 'user supplied four shop screenshots without a description: front on a model, a closer front on another model, a close-up of the front and shoulder, and the back' },
    referenceViews: ['front on model', 'front, closer (second model)', 'front and shoulder close-up', 'back on model'],
    details: ['fitted long-sleeved crew-neck tee in black jersey with a faint slub', 'all-over scattered print of distressed Mickey Mouse stamps: cream heads and gloves, red shorts with cream buttons, ochre shoes, some whole figures', 'the stamps are inked unevenly, crossed by scratchy crackle lines, with paint splatter between them', 'narrow black ribbed crew neckband', 'long fitted set-in sleeves to the wrist, printed all over', 'plain turned hem at the waistband of high-rise jeans'],
    material: { construction: 'fine stretch jersey (read from the close-up: soft, drapey, slubbed)', composition: 'not stated', finish: 'matte, with a faint sheen' },
    fit: { silhouette: 'fitted, close to the body', sleeve: 'long fitted sleeves to the wrist', hem: 'high hip, at the waistband of high-rise jeans', neckline: 'crew', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the print is redrawn in code as simplified stamps (heads, shorts, gloves, shoes), not copied from the photos; the whole figures and faces are not drawn', 'the photos differ in ink colour (ochre in two, mustard yellow in one); the ochre is used', 'the layout of the motifs is random, not the real repeat'],
    styling: { silhouette: 'fitted, high-hip length', palette: ['black', 'red', 'ochre', 'cream'], pattern: 'scattered distressed cartoon print (Mickey Mouse) with paint splatter', coverage: { neck: 'crew', sleeves: 'long', midriff: 'covered' }, material: 'fine stretch jersey', warmth: 2, warmthBasis: 'inferred: thin fitted jersey with long sleeves', weather: 'mild or cool days, or a base layer under a jacket' },
    authoring: { texture: 'procedural, in src/doll/printed-long-tee.js: stamps drawn from ellipses, with crackle, ragged edges and splatter; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makePrintedLongTee() in src/doll/printed-long-tee.js, in outfit units: the bronze top's fitted
    // body and sleeve rows, which clear every waistband and her hands.
    build: {
      template: 'printed-long-tee',
      colours: { band: '#121010' },
      body: { neck: 1.91, hem: 1.18,
        rows: [[1.91, .109, .099], [1.875, .17, .122], [1.83, .228, .152], [1.775, .265, .175], [1.65, .279, .183], [1.49, .277, .187], [1.34, .284, .196], [1.25, .29, .206], [1.18, .292, .213]],
        neckband: [[1.924, .109, .1], [1.9, .114, .105]] },
      sleeve: { rows: [[.025, .098, .1], [-.04, .112, .108], [-.16, .107, .101], [-.28, .104, .099], [-.4, .096, .091], [-.49, .078, .08], [-.525, .077, .079]] },
      // The print, in texture pixels (1300 to a world unit): stamp size, average spacing, splatter (pixels per dot). Messy:
      // patchy ink (dropout), three sets of scratches, very ragged edges, each stamp fading out to one side and some
      // printed faint, with a spray of dots round each.
      print: { seed: 41, ground: '#121010', inks: { cream: '#d6cfc2', red: '#a8232e', ochre: '#c47f35' }, size: 36, spacing: 122, splatter: 1000, dropout: .23, scratches: 3, scratchWidth: .05, ragged: 1.3, fade: .75, faint: .25, spray: 14,
        mix: { head: .3, shorts: .22, glove: .26, shoe: .22 },
        inksFor: { head: ['cream', 'cream', 'cream', 'ochre', 'red'], shorts: ['red', 'red', 'red', 'ochre'], glove: ['cream', 'cream', 'ochre'], shoe: ['ochre', 'ochre', 'ochre', 'red', 'cream'] } },
    },
  },
  [BARREL_JEANS_ID]: {
    slot: 'bottom',
    id: BARREL_JEANS_ID, name: 'Acid-wash barrel jeans', family: 'barrel-leg-jeans', version: 1,
    status: 'user-approved-after-revisions', brandAsProvided: 'Topshop',
    source: { note: 'user supplied four phone screenshots of the product gallery (front on model, back detail, back full length, flat lay)' },
    referenceViews: ['front on model', 'back pocket close-up', 'back full length', 'front flat lay'],
    details: ['low rise', 'very wide barrel (horseshoe) legs, widest around the knee, full length resting on the shoes', 'side seams twisting forward toward the hem', 'horizontal darts across each knee', 'slanted front pockets', 'belt loops, silver shank button and zip fly', 'tan contrast topstitching', 'back yoke and patch pockets with pointed buttoned flaps', 'welt slit above the right back pocket', 'brown suede waistband patch', 'mid-dark blue marbled acid wash with a grey cast'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'marbled acid wash' },
    fit: { silhouette: 'barrel', rise: 'low', length: 'full, resting on the shoes', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'exact pocket and dart placement adapted to the doll', 'brand text on the patch is not reproduced'],
    authoring: { texture: 'topshop-denim.js: flat-lit seamless swatch processed from the product flat lay (at the user\'s request)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    // Construction for makeJeans() in src/doll/model.js. Rows are [y, rx, rz] (hips) and [y, rx, rz, cx] (legs).
    build: {
      template: 'jeans', legName: 'barrel-leg',
      // Hips flow into the legs at the crotch; hips and legs are mapped by distance along the fabric at the same denim
      // scale as before (about 3.7 repeats per unit around, 1.03 per unit down), so their tiles are 1.
      crotch: { top: 1.2, y: .95 }, uvScale: [3.7, 1.03],
      tiles: { small: [2.45, .66], legs: [1, 1], hips: [1, 1] },
      hips: [[1.22, .255, .172], [1.13, .276, .193], [1.04, .292, .198], [.97, .3, .186], [.935, .25, .11]],
      legs: [[1.03, .145, .185, .13], [.95, .158, .185, .158], [.75, .168, .188, .172], [.55, .172, .188, .176], [.35, .17, .186, .174], [.18, .167, .184, .17], [.06, .166, .183, .168]],
      hem: 'rests-on-shoe', folds: { base: .005, low: .011, stack: .011 }, twist: Math.PI / 4, kneeSeams: .64,
      gradient: [.86, .22], whiskers: .12,
      waistband: { y: 1.195, rx: .258, rz: .175, h: .05 },
      loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
      button: { colour: '#c9ccd0' }, thread: '#8f744f',
      fly: [[.034, 1.168], [.036, 1.08], [.02, 1.045], [0, 1.035]],
      frontPocket: { type: 'slant', line: [[.165, 1.168], [.218, 1.11], [.265, 1.065]] },
      sideSeamTop: [[.278, 1.12], [.29, 1.04]], seamEnd: .1,
      backYoke: [[.272, 1.165], [.14, 1.148], [.004, 1.13]],
      backPocket: { x: .122, outline: [[-.076, 1.11], [.076, 1.11], [.073, .99], [0, .958], [-.073, .99]], stitchBelow: 1.05,
        flap: [[-.082, 1.128], [.082, 1.128], [.08, 1.084], [0, 1.062], [-.08, 1.084]],
        flapStitch: [[-.074, 1.12], [.074, 1.12], [.072, 1.088], [0, 1.07], [-.072, 1.088], [-.074, 1.12]], button: 1.076 },
      centreBack: [[.004, 1.13], [.004, 1.05], [0, .99]],
      welt: [[-.19, 1.14], [-.07, 1.137]],
      labelPatch: { name: 'suede-patch', size: [.088, .05, .005], colour: '#a87348', position: [.07, 1.2, -(.177 + .004)], rotationY: Math.PI - .27 },
    },
  },
  [DAVINIA_JEANS_ID]: {
    slot: 'bottom',
    id: DAVINIA_JEANS_ID, name: 'Davinia heart jeans', family: 'high-rise-straight-cropped-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'Desigual',
    source: { note: 'user supplied four phone screenshots of a Ceneo listing (Desigual Jeansy Davinia 22SWDD01): front on model, waist close-up, flat lay, back on model' },
    referenceViews: ['front on model', 'waist and pocket close-up', 'front flat lay', 'back on model'],
    details: ['high rise', 'slim straight legs cropped at the ankle with a raw frayed hem', 'light blue acid wash, paler on the thighs', 'raw frayed top edge on the waistband', 'copper shank button and orange contrast stitching', 'scoop front pockets', 'coin pocket with a small red embroidered heart', 'small light abrasions near the pocket and on the thigh', 'plain back patch pockets, V yoke and a brown leather patch'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'acid wash' },
    fit: { silhouette: 'straight, slim', rise: 'high', length: 'cropped at the ankle', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'pocket and abrasion placement adapted to the doll', 'leather patch lettering is not reproduced'],
    authoring: { texture: 'desigual-davinia-denim.js: flat-lit seamless swatch processed from the product flat lay', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [110, 123, 146], frayColour: '#d8dfe6',
      // Hips and legs are mapped by distance along the fabric (uvScale, repeats per unit), so their tiles are 1.
      tiles: { small: [2.8, .38], legs: [1, 1], hips: [1, 1] },
      // Slim straight legs, taken in as far as the doll's legs allow; the hips blend into them at the crotch.
      hips: [[1.3, .262, .168], [1.2, .27, .184], [1.1, .28, .19], [1.02, .276, .178], [.97, .262, .162], [.935, .2, .085]],
      legs: [[1.12, .13, .165, .128], [1.03, .132, .162, .128], [.95, .128, .155, .136], [.8, .118, .14, .148], [.6, .106, .124, .155], [.45, .101, .116, .157], [.34, .1, .112, .158]],
      crotch: { top: 1.1, y: .95 }, uvScale: [4, .66],
      hem: 'raw-crop', folds: { base: .002, low: .003 }, gradient: [.92, .12], whiskers: .1, thighFade: .1,
      waistband: { y: 1.275, rx: .264, rz: .17, h: .05, frayed: true },
      loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
      button: { colour: '#a8743a' }, thread: '#b5783f',
      fly: [[.036, 1.25], [.038, 1.13], [.022, 1.085], [0, 1.075]],
      frontPocket: { type: 'scoop', line: [[.15, 1.25], [.165, 1.2], [.2, 1.172], [.258, 1.16]] },
      coinPocket: { outline: [[-.235, 1.245], [-.185, 1.245], [-.19, 1.19], [-.232, 1.19], [-.235, 1.245]], heart: [-.21, 1.218] },
      abrasions: [[-.19, 1.13, .026], [-.205, 1.112, .018], [.13, .99, .022], [-.11, .87, .016]],
      sideSeamTop: [[.266, 1.25], [.282, 1.12], [.284, 1.04]], seamEnd: .345,
      backYoke: [[.268, 1.21], [.14, 1.19], [.004, 1.165]],
      backPocket: { x: .12, outline: [[-.072, 1.15], [.072, 1.15], [.07, 1.03], [0, 1.0], [-.07, 1.03]], stitchBelow: 1.1 },
      centreBack: [[.004, 1.165], [.004, 1.07], [0, 1.0]],
      labelPatch: { name: 'leather-patch', size: [.07, .04, .005], colour: '#9b6a42', position: [-.07, 1.275, -(.17 + .004)], rotationY: Math.PI + .27 },
    },
  },
  [LEVIS_94_ID]: {
    slot: 'bottom',
    id: LEVIS_94_ID, name: "Levi's '94 baggy wide leg", family: 'wide-leg-jeans', version: 1,
    status: 'user-approved', brandAsProvided: "Levi's",
    source: { note: "user supplied six product images (\"Levi's 94 Wide Leg\"; label reads The Baggy Wide Leg): back pocket close-up, front flat lay, front, back and side on model, full-length front" },
    referenceViews: ['back pocket close-up', 'front flat lay', 'front on model', 'back on model', 'side on model', 'full-length front'],
    details: ['low-to-mid rise', 'wide legs falling straight and widening slightly to the hem, full length pooling over the shoes', 'washed black faded to charcoal, faint whiskers across the upper thighs, visible twill', 'raw frayed edges on the front pocket openings', 'coin pocket, belt loops, dark metal button', 'back yoke, five-pocket back pockets with tonal double-arc stitching and frayed nicks on their tops', 'red tab on the wearer\'s right back pocket', 'tan printed patch on the back waistband'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied images', finish: 'washed black' },
    fit: { silhouette: 'wide leg', rise: 'low to mid', length: 'full, resting on the shoes (confirmed by the user)', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'photos disagree on brightness (studio lighting); colour aims between the flat lay and the model shots', 'patch and tab carry no lettering or logo'],
    authoring: { texture: 'levis-94-denim.js: flat-lit seamless swatch processed from the product flat lay', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [36, 36, 41], frayColour: '#5d595c',
      crotch: { top: 1.18, y: .95 }, uvScale: [3.7, 1.03],
      tiles: { small: [2.45, .66], legs: [1, 1], hips: [1, 1] },
      hips: [[1.235, .256, .172], [1.14, .276, .193], [1.04, .294, .198], [.97, .306, .19], [.935, .25, .11]],
      // Wide legs: straight from the hip and widening gently to the hem, full length, resting on the shoes (the user
      // confirmed this length is right on them).
      legs: [[1.03, .148, .18, .13], [.95, .155, .18, .152], [.75, .163, .183, .168], [.55, .171, .186, .176], [.35, .179, .19, .184], [.18, .186, .194, .19], [.06, .19, .197, .194]],
      hem: 'rests-on-shoe', folds: { base: .005, low: .011, stack: .008 },
      gradient: [.86, .22], whiskers: .15, thighFade: .1,
      waistband: { y: 1.21, rx: .258, rz: .175, h: .05 },
      loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
      button: { colour: '#4c4b4e' }, thread: '#4a4648',
      fly: [[.034, 1.183], [.036, 1.09], [.02, 1.05], [0, 1.04]],
      frontPocket: { type: 'slant', line: [[.15, 1.184], [.205, 1.178], [.245, 1.158], [.27, 1.115]], fray: true },
      coinPocket: { outline: [[-.225, 1.183], [-.18, 1.181], [-.184, 1.135], [-.222, 1.137], [-.225, 1.183]] },
      seamEnd: .1,
      backYoke: [[.268, 1.182], [.14, 1.162], [.004, 1.142]],
      backPocket: { x: .12, outline: [[-.07, 1.128], [.07, 1.128], [.066, 1.005], [0, .978], [-.066, 1.005]], stitchBelow: 1.07,
        arcuate: [.052, 1.085, .03], arcuateColour: '#161416', nicks: [-.035, .02],
        tab: { side: -1, inset: .066, y: 1.09, colour: '#c3262f' } },
      centreBack: [[.004, 1.142], [.004, 1.05], [0, .985]],
      labelPatch: { name: 'printed-patch', size: [.085, .052, .005], colour: '#c49a6c', printColour: '#9c4a3c', position: [-.07, 1.21, -(.175 + .004)], rotationY: Math.PI + .27 },
    },
  },
  [TOMMY_MOM_ID]: {
    slot: 'bottom',
    id: TOMMY_MOM_ID, name: 'Tommy ultra high rise mom jeans', family: 'mom-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'Tommy Jeans',
    source: { note: 'user supplied four phone screenshots of an ASOS listing (Tommy Jeans ultra high rise mom jean in mid wash): front and back on model, back pocket close-up, front waist close-up' },
    referenceViews: ['front on model', 'back on model', 'back pocket close-up', 'front waist close-up'],
    details: ['ultra high rise at the natural waist', 'mom fit: roomy hips and thighs tapering to a narrow ankle-length hem', 'even mid indigo wash, slightly paler on the thighs', 'tan-orange topstitching, scoop front pockets with copper rivets, silver button', 'coin pocket with a tiny flag badge', 'back yoke, patch pockets crossed by a double stitched bar, a small flag badge on the wearer\'s right pocket', 'red, white and navy flag patch on the back waistband'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'mid wash' },
    fit: { silhouette: 'mom, tapered', rise: 'ultra high', length: 'ankle', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'badges and patch are colour blocks without lettering'],
    authoring: { texture: 'tommy-mom-denim.js: flat-lit seamless swatch processed from the front close-up', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [30, 46, 76],
      // The swatch comes from a zoomed close-up, so it repeats more often than the other pairs' to keep the grain fine.
      crotch: { top: 1.12, y: .95 }, uvScale: [6, 3],
      tiles: { small: [5.5, 2.8], legs: [1, 1], hips: [1, 1] },
      // Ultra high rise: the waistband sits at her natural waist.
      hips: [[1.36, .268, .168], [1.27, .274, .18], [1.15, .288, .196], [1.05, .296, .2], [.97, .292, .19], [.935, .24, .1]],
      // Mom fit: roomy through the thigh, tapering to a narrow hem at the ankle, above her shoes.
      legs: [[1.03, .152, .18, .14], [.95, .154, .178, .152], [.8, .152, .172, .158], [.6, .138, .158, .16], [.42, .127, .148, .16], [.24, .125, .145, .16]],
      hem: 'ankle', folds: { base: .004, low: .007 }, gradient: [.88, .18], whiskers: .14, thighFade: .1,
      waistband: { y: 1.335, rx: .267, rz: .169, h: .05 },
      loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
      button: { colour: '#c9ccd0' }, thread: '#c27a3a',
      fly: [[.036, 1.31], [.038, 1.16], [.022, 1.1], [0, 1.09]],
      frontPocket: { type: 'scoop', line: [[.15, 1.31], [.165, 1.255], [.2, 1.225], [.262, 1.21]] },
      coinPocket: { outline: [[-.236, 1.305], [-.19, 1.305], [-.194, 1.25], [-.233, 1.25], [-.236, 1.305]], badge: [-.214, 1.27] },
      rivets: [[.152, 1.305], [.262, 1.215]],
      seamEnd: .245,
      backYoke: [[.27, 1.27], [.14, 1.235], [.004, 1.205]],
      backPocket: { x: .122, outline: [[-.08, 1.2], [.08, 1.2], [.076, 1.055], [0, 1.025], [-.076, 1.055]], stitchBelow: 1.15,
        bars: [1.132, 1.117], badge: { side: -1, out: .032, y: 1.1245 } },
      centreBack: [[.004, 1.205], [.004, 1.1], [0, 1.0]],
      labelPatch: { name: 'flag-patch', size: [.08, .05, .005], colour: '#1c2747', position: [-.08, 1.338, -(.169 + .004)], rotationY: Math.PI + .3,
        blocks: [[-.038, .002, 0, .023, '#f2f2f0'], [0, .002, .038, .023, '#c8202f']] },
    },
  },
  [STRADIVARIUS_RELAXED_ID]: {
    slot: 'bottom',
    id: STRADIVARIUS_RELAXED_ID, name: 'Stradivarius relaxed jeans', family: 'relaxed-wide-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'Stradivarius',
    source: { note: 'user supplied four phone screenshots of a Zalando listing (Stradivarius, Relaxed, Petite): front close-up, front and back on model, side close-up' },
    referenceViews: ['front close-up', 'front on model', 'back on model', 'side close-up'],
    details: ['low to mid rise', 'relaxed wide straight legs, full length, pooling on the floor', 'very light bleached blue wash with soft whiskers at the hips', 'classic five-pocket front: scoop pockets, coin pocket, copper rivets and button', 'pale tonal stitching', 'plain back patch pockets', 'small beige patch on the back waistband'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'bleached light wash' },
    fit: { silhouette: 'relaxed wide', rise: 'low to mid', length: 'full, pooling over the shoes', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'patch lettering not reproduced'],
    authoring: { texture: 'stradivarius-denim.js: flat-lit seamless swatch processed from the front close-up', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [154, 171, 192],
      crotch: { top: 1.18, y: .95 }, uvScale: [3.7, 1.03],
      tiles: { small: [2.45, .66], legs: [1, 1], hips: [1, 1] },
      hips: [[1.235, .256, .172], [1.14, .276, .193], [1.04, .294, .198], [.97, .306, .19], [.935, .25, .11]],
      // Relaxed wide straight legs, full length: the hem rests on the shoes and stacks a little.
      legs: [[1.03, .148, .18, .13], [.95, .155, .18, .152], [.75, .162, .183, .166], [.55, .168, .186, .172], [.35, .174, .189, .178], [.18, .18, .193, .184], [.06, .184, .196, .188]],
      hem: 'rests-on-shoe', folds: { base: .005, low: .012, stack: .01 },
      gradient: [.9, .14], whiskers: .12, thighFade: .06,
      waistband: { y: 1.21, rx: .258, rz: .175, h: .05 },
      loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
      button: { colour: '#b57a55' }, thread: '#9eaab6',
      fly: [[.034, 1.183], [.036, 1.09], [.02, 1.05], [0, 1.04]],
      frontPocket: { type: 'scoop', line: [[.15, 1.184], [.165, 1.14], [.2, 1.112], [.262, 1.1]] },
      coinPocket: { outline: [[-.236, 1.18], [-.19, 1.18], [-.194, 1.128], [-.233, 1.128], [-.236, 1.18]] },
      rivets: [[.152, 1.18], [.262, 1.105]],
      seamEnd: .1,
      backYoke: [[.268, 1.182], [.14, 1.162], [.004, 1.142]],
      backPocket: { x: .122, outline: [[-.074, 1.128], [.074, 1.128], [.07, 1.0], [0, .972], [-.07, 1.0]], stitchBelow: 1.07 },
      centreBack: [[.004, 1.142], [.004, 1.05], [0, .985]],
      labelPatch: { name: 'paper-patch', size: [.06, .032, .004], colour: '#d9c8a6', position: [-.065, 1.21, -(.175 + .004)], rotationY: Math.PI + .25 },
    },
  },
  [MANGO_BLACK_JEANS_ID]: {
    slot: 'bottom',
    id: MANGO_BLACK_JEANS_ID, name: 'Mango washed black jeans', family: 'relaxed-straight-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'Mango (MNG Denim)',
    source: { note: 'user supplied five eBay listing photos (the pair is old): back flat lay on a wooden floor (twice), front waist close-ups and a front flat lay on grey carpet' },
    referenceViews: ['back flat lay', 'front waist close-up', 'front pocket close-up', 'front flat lay'],
    details: ['high rise', 'relaxed straight legs tapering slightly to an ankle-length hem', 'charcoal washed black with a mottled stone-wash, paler on thighs and seams', 'five-pocket front with copper rivets and a silver button', 'plain back patch pockets with a short dart above each instead of a yoke', 'black leather patch on the back waistband', 'light grey double topstitching on the seams, pockets, fly, waistband and hem, with paler bleached seams'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied photos', finish: 'stone-washed black' },
    fit: { silhouette: 'relaxed straight, slight taper', rise: 'high', length: 'ankle', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'photos are flash-lit or warm-lit listing photos; colour aims between them', 'patch carries no lettering'],
    authoring: { texture: 'mango-denim.js: flat-lit seamless swatch processed from the front flat lay', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [53, 56, 58],
      // The stone-wash speckle is fine in the photos: the swatch repeats about seven times around the leg.
      crotch: { top: 1.12, y: .95 }, uvScale: [7, 6.4],
      tiles: { small: [6, 2.8], legs: [1, 1], hips: [1, 1] },
      hips: [[1.31, .264, .168], [1.2, .274, .186], [1.1, .288, .196], [1.02, .296, .198], [.97, .298, .19], [.935, .24, .1]],
      // Relaxed and straight, tapering slightly to an ankle-length hem above the shoes.
      legs: [[1.03, .15, .18, .135], [.95, .155, .178, .15], [.8, .153, .173, .158], [.6, .146, .166, .162], [.42, .141, .159, .162], [.24, .137, .155, .162]],
      hem: 'ankle', folds: { base: .004, low: .008 }, gradient: [.9, .14], whiskers: .1, thighFade: .08,
      waistband: { y: 1.285, rx: .266, rz: .17, h: .05 },
      loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
      // The pair's recognisable light grey double topstitching, with paler bleached seams (roping) and a stitched hem.
      button: { colour: '#c9ccd0' }, thread: '#787676', stitchScale: 1.3, doubleSeams: true, roping: 2.6, hemStitch: .014, dartsStitched: true,
      fly: [[.036, 1.26], [.038, 1.13], [.022, 1.085], [0, 1.075]],
      frontPocket: { type: 'scoop', line: [[.15, 1.26], [.165, 1.21], [.2, 1.18], [.262, 1.165]] },
      coinPocket: { outline: [[-.236, 1.255], [-.19, 1.255], [-.194, 1.2], [-.233, 1.2], [-.236, 1.255]] },
      rivets: [[.152, 1.255], [.262, 1.17], [-.19, 1.252]],
      seamEnd: .245,
      // Pockets sit high, as in the back photo, with a short dart running down to each.
      backDarts: [[.11, 1.259], [.115, 1.228]],
      backPocket: { x: .12, outline: [[-.068, 1.222], [.068, 1.222], [.064, 1.11], [0, 1.085], [-.064, 1.11]], stitchBelow: 1.2 },
      centreBack: [[.004, 1.26], [.004, 1.1], [0, 1.0]],
      labelPatch: { name: 'leather-patch', size: [.072, .04, .005], colour: '#1c1b1c', position: [-.08, 1.288, -(.17 + .004)], rotationY: Math.PI + .3 },
    },
  },
  [BERSHKA_GREY_ID]: {
    slot: 'bottom',
    id: BERSHKA_GREY_ID, name: 'Bershka grey wide-leg jeans', family: 'wide-leg-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'Bershka',
    source: { note: 'user supplied five phone screenshots of the product gallery: front close-up and full front on model, back on model, waist close-up, front flat lay' },
    referenceViews: ['front on model (close)', 'front on model', 'back on model', 'waist close-up', 'front flat lay'],
    details: ['low to mid rise', 'wide straight legs, full length, resting on the shoes', 'mid grey wash with a fine crinkled texture', 'bleached paler panels down the middle of each thigh and knee, darker sides and hem', 'strong pale whiskers across the hips and upper thighs, front and back', 'silver button and rivets, tonal grey stitching', 'plain back patch pockets'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'grey wash with whiskers and fade' },
    fit: { silhouette: 'wide leg', rise: 'low to mid', length: 'full, resting on the shoes', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'whisker and fade placement is an interpretation of the photos', 'label lettering not reproduced'],
    authoring: { texture: 'bershka-grey-denim.js: flat-lit seamless swatch processed from the flat lay; fade and whiskers are shaded on the geometry', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [61, 64, 65],
      crotch: { top: 1.18, y: .95 }, uvScale: [5, 2.7],
      tiles: { small: [4, 1.8], legs: [1, 1], hips: [1, 1] },
      hips: [[1.235, .256, .172], [1.14, .276, .193], [1.04, .294, .198], [.97, .306, .19], [.935, .25, .11]],
      legs: [[1.03, .15, .18, .13], [.95, .158, .181, .154], [.75, .166, .184, .168], [.55, .172, .187, .174], [.35, .178, .19, .18], [.18, .183, .193, .185], [.06, .186, .196, .188]],
      hem: 'rests-on-shoe', folds: { base: .005, low: .011, stack: .01 },
      // The wash: darker toward the hem, bleached panels down each thigh and knee, and strong whiskers across the hips.
      gradient: [.6, .5], whiskers: 1.3,
      whiskerLines: { top: 1.16, count: 6, spacing: .034, width: .012, lo: .93, hi: 1.2, back: true },
      centreFade: { strength: 1.5, width: 2.4, peak: .72, reach: .5 },
      waistband: { y: 1.21, rx: .258, rz: .175, h: .05 },
      loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
      button: { colour: '#c9ccd0' }, thread: '#8b8986',
      fly: [[.034, 1.183], [.036, 1.09], [.02, 1.05], [0, 1.04]],
      frontPocket: { type: 'scoop', line: [[.15, 1.184], [.165, 1.14], [.2, 1.112], [.262, 1.1]] },
      coinPocket: { outline: [[-.236, 1.18], [-.19, 1.18], [-.194, 1.128], [-.233, 1.128], [-.236, 1.18]] },
      rivets: [[.152, 1.18], [.262, 1.105]],
      seamEnd: .1,
      backYoke: [[.268, 1.182], [.14, 1.162], [.004, 1.142]],
      backPocket: { x: .122, outline: [[-.074, 1.128], [.074, 1.128], [.07, 1.0], [0, .972], [-.07, 1.0]], stitchBelow: 1.07 },
      centreBack: [[.004, 1.142], [.004, 1.05], [0, .985]],
      labelPatch: { name: 'woven-label', size: [.032, .02, .003], colour: '#d8d6d0', position: [-.06, 1.21, -(.175 + .004)], rotationY: Math.PI + .25 },
    },
  },
  [TOMMY_CARPENTER_ID]: {
    slot: 'bottom',
    id: TOMMY_CARPENTER_ID, name: 'Tommy Jeans Remastered carpenter jeans', family: 'carpenter-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'Tommy Jeans',
    source: { note: 'user supplied five phone screenshots of an ASOS listing (Tommy Jeans Remastered carpenter jeans in black wash): front on model twice, side close-up, waist close-up, back' },
    referenceViews: ['front on model', 'side close-up', 'front on model (full)', 'front waist close-up', 'back on model'],
    details: ['mid rise', 'relaxed wide straight legs, full length on the model (the user wears them narrower, at the ankle)', 'even black wash', 'white double contrast topstitching throughout', 'large carpenter patch panels over the front hips, from the waistband to the crotch, under the scoop pockets', 'big utility patch pockets on both outer thighs, a red, white and navy flag badge on the wearer\'s left one', 'hammer loop on the wearer\'s right thigh', 'silver button and rivets', 'back yoke, patch pockets, a red, white and navy tape across the wearer\'s right back pocket', 'tonal grey flag patch on the back waistband'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'black wash' },
    fit: { silhouette: 'relaxed straight, carpenter', rise: 'mid', length: 'ankle', adjustment: 'narrower and ankle length, as the user wears them (the photos show wide, full-length legs)' },
    uncertainties: ['folds are procedural', 'badges and patches are colour blocks without lettering', 'no coin pocket was visible in the screenshots', 'the fly bar tacks are not modelled'],
    authoring: { texture: 'tommy-carpenter-denim.js: flat-lit seamless swatch processed from the waist close-up, keeping its brightness detail only (the dark photo carries compression colour blotches)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [11, 10, 14],
      // The swatch comes from a zoomed close-up, so it repeats often to keep the twill at the photo's scale.
      crotch: { top: 1.19, y: .95 }, uvScale: [12, 4.1],
      tiles: { small: [7.5, 2.6], legs: [1, 1], hips: [1, 1] },
      hips: [[1.26, .26, .171], [1.16, .278, .19], [1.05, .294, .198], [.97, .304, .19], [.935, .25, .11]],
      // Relaxed straight legs, narrower than the photos' wide look, ending at her ankle above the shoes (as the user wears them).
      legs: [[1.03, .15, .178, .13], [.95, .154, .176, .152], [.75, .155, .172, .16], [.55, .152, .167, .162], [.38, .148, .162, .163], [.24, .145, .159, .163]],
      hem: 'ankle', folds: { base: .004, low: .009 }, gradient: [.9, .15], whiskers: 0,
      waistband: { y: 1.235, rx: .262, rz: .173, h: .05 },
      loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
      button: { colour: '#c9ccd0' }, thread: '#b4b2b8', rivetColour: '#c9ccd0',
      // White double topstitching, as on the Mango pair.
      doubleSeams: true, hemStitch: .022,
      fly: [[.034, 1.208], [.036, 1.115], [.02, 1.075], [0, 1.065]],
      frontPocket: { type: 'scoop', line: [[.13, 1.209], [.15, 1.17], [.195, 1.14], [.262, 1.125]] },
      // Carpenter panels over the front hips, from the waistband to the crotch, stitched along their inner and lower edges.
      frontPanel: { outline: [[.112, 1.21], [.255, 1.21], [.258, 1.06], [.255, .985], [.15, .952]],
        stitch: [[[.118, 1.21], [.137, 1.08], [.155, .958], [.2, .974], [.255, .991]], [[.125, 1.21], [.144, 1.08], [.16, .965], [.2, .981], [.255, .998]]] },
      // Utility pockets on both outer thighs, wrapping from behind the side seam toward the front.
      sidePocket: { top: .9, bottom: .6, span: [-.4, .5], badge: { side: 1, y: .8, t: .22 }, hammerLoop: { side: -1, t: 0, above: .045, below: .02 } },
      rivets: [[.135, 1.205], [.262, 1.13]],
      seamEnd: .245,
      backYoke: [[.268, 1.207], [.14, 1.187], [.004, 1.167]],
      backPocket: { x: .122, outline: [[-.074, 1.153], [.074, 1.153], [.07, 1.025], [0, .997], [-.07, 1.025]], stitchBelow: 1.095,
        // Diagonal tape across the wearer's right pocket: navy, white and red stripes, from its lower outer edge upward.
        tape: { side: -1, line: [[.09, 1.1], [.01, .95]], stripes: [['#1c2747', .013], ['#f2f2f0', .013], ['#c8202f', .013]] } },
      centreBack: [[.004, 1.167], [.004, 1.07], [0, .985]],
      labelPatch: { name: 'flag-patch', size: [.075, .045, .005], colour: '#2b2b30', position: [-.08, 1.238, -(.173 + .004)], rotationY: Math.PI + .3,
        blocks: [[-.034, .0, 0, .02, '#6b6b72'], [0, .0, .034, .02, '#45454c']] },
    },
  },
  [ZARA_CARGO_ID]: {
    slot: 'bottom',
    id: ZARA_CARGO_ID, name: 'Zara elastic-waist cargo trousers', family: 'cargo-joggers', version: 1,
    status: 'user-approved', brandAsProvided: 'Zara',
    source: { note: 'user supplied three phone screenshots of a resale listing on zara.com (“Pantaloni cargo con vita elasticizzata”, black, size M): front flat lay, back flat lay, front close-up; the listing text says light, cool trousers with an adjustable elastic drawstring waist' },
    referenceViews: ['front flat lay', 'back flat lay', 'front close-up'],
    details: ['gathered elastic waistband with a black drawstring and metal tips', 'black, light, slightly crinkled fabric with a soft sheen', 'relaxed legs tapering to gathered elastic cuffs at the ankle, the fabric blousing above them', 'slanted side pockets', 'cargo patch pockets with plain flaps on both outer thighs', 'plain back with a centre seam, no back pockets', 'tonal stitching'],
    material: { construction: 'light woven (satin-like crinkle)', composition: 'not visible in the supplied screenshots', finish: 'black' },
    fit: { silhouette: 'relaxed jogger, cuffed', rise: 'high, elastic at the waist', length: 'ankle, gathered into the cuffs', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds and crinkle are procedural or from a small swatch', 'the cargo pockets\' exact size and placement are read from flat lays', 'how the user wears the waist and cuffs is not yet known'],
    authoring: { texture: 'zara-cargo-fabric.js: flat-lit seamless swatch from the close-up, keeping only fine crinkle detail at reduced contrast', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [26, 29, 37],
      // Not denim: a light, smooth woven with a soft sheen and no twill.
      surface: { roughness: .7, twill: 0, sheen: .3 },
      crotch: { top: 1.14, y: .95 }, uvScale: [16, 8],
      tiles: { small: [10, 5], legs: [1, 1], hips: [1, 1] },
      hips: [[1.32, .256, .168], [1.24, .272, .184], [1.14, .29, .197], [1.04, .3, .2], [.97, .302, .19], [.935, .245, .105]],
      // Relaxed legs tapering to the ankle, blousing over the elastic cuffs.
      legs: [[1.03, .152, .182, .135], [.95, .16, .182, .152], [.75, .16, .176, .16], [.55, .153, .168, .162], [.4, .149, .162, .163], [.335, .155, .167, .163], [.295, .138, .15, .163], [.28, .133, .146, .163], [.24, .133, .146, .163]],
      hem: 'ankle', folds: { base: .006, low: .012, stack: .005 }, gradient: [.92, .12], whiskers: 0,
      cuff: { top: .285, count: 18, depth: .005 }, hemStitch: .045,
      // Gathered elastic waistband with a drawstring.
      waistband: { y: 1.285, rx: .254, rz: .167, h: .07, gathers: { count: 48, depth: .035 } },
      drawstring: { colour: '#1c1d22', tip: '#c9ccd0', x: .016, length: .2 },
      thread: '#3a3c44',
      centreFront: [[0, 1.25], [0, 1.1], [0, .975]],
      frontPocket: { type: 'slant', line: [[.175, 1.25], [.215, 1.185], [.258, 1.12]] },
      // Cargo pockets with plain flaps on both outer thighs.
      sidePocket: { top: .93, bottom: .63, span: [-.38, .58], flap: .055 },
      seamEnd: .245,
      centreBack: [[0, 1.25], [0, 1.1], [0, .985]],
    },
  },
  [CRYSTAL_JEANS_ID]: {
    slot: 'bottom',
    id: CRYSTAL_JEANS_ID, name: 'Crystal-embellished straight jeans', family: 'straight-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'not visible in the screenshots',
    source: { note: 'user supplied five phone screenshots of a product gallery (front on model, back on model, styled front, front flat lay, waist close-up) and asked to notice the embellishments' },
    referenceViews: ['front on model', 'back on model', 'styled front', 'front flat lay', 'front waist close-up'],
    details: ['high rise', 'straight legs, full length, resting on the shoes', 'light vintage blue wash, darker round the fly, slightly paler on the thighs', 'tiny crystals set in a square grid over the whole front of both legs and hips; the waistband and the back are plain', 'tan topstitching, silver button and rivets', 'coin pocket with a small worn patch on the wearer\'s right', 'back yoke, plain patch pockets and a tan leather patch on the wearer\'s right'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'light vintage wash with crystal embellishment' },
    fit: { silhouette: 'straight', rise: 'high', length: 'full, resting on the shoes', adjustment: 'fixed authored fit for review' },
    uncertainties: ['the crystals are larger and wider-spaced than the real ones (about 2.5 times), so they stay visible at the app\'s size', 'folds are procedural', 'the leather patch carries no lettering'],
    authoring: { texture: 'crystal-jeans-denim.js: flat-lit seamless swatch from the plain back of the legs; the crystals are modelled, not painted', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [104, 121, 137],
      crotch: { top: 1.12, y: .95 }, uvScale: [5, 2],
      tiles: { small: [4, 1.4], legs: [1, 1], hips: [1, 1] },
      hips: [[1.31, .264, .168], [1.2, .274, .186], [1.1, .288, .196], [1.02, .296, .198], [.97, .298, .19], [.935, .24, .1]],
      // Straight legs to the floor, resting on the shoes.
      legs: [[1.03, .15, .18, .135], [.95, .156, .178, .152], [.75, .158, .176, .16], [.55, .158, .175, .163], [.35, .159, .176, .165], [.18, .16, .177, .166], [.06, .161, .178, .167]],
      hem: 'rests-on-shoe', folds: { base: .004, low: .009, stack: .008 }, gradient: [.82, .26], whiskers: .35, thighFade: .12,
      waistband: { y: 1.285, rx: .266, rz: .17, h: .05 },
      loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
      button: { colour: '#c9ccd0' }, thread: '#b8935e', rivetColour: '#c9ccd0',
      fly: [[.036, 1.26], [.038, 1.13], [.022, 1.085], [0, 1.075]],
      frontPocket: { type: 'scoop', line: [[.15, 1.26], [.165, 1.21], [.2, 1.18], [.262, 1.165]] },
      coinPocket: { outline: [[-.236, 1.255], [-.19, 1.255], [-.194, 1.2], [-.233, 1.2], [-.236, 1.255]] },
      abrasions: [[-.222, 1.215, .026], [-.208, 1.198, .018]],
      rivets: [[.152, 1.255], [.262, 1.17]],
      // The embellishment: crystals in a square grid over the front panels, clear of the seams.
      crystals: { spacing: .012, size: .0042, lift: .0008, margin: .12, above: .03, colour: '#f2f6fc', glow: '#4c5866', setting: '#465a76' },
      seamEnd: .1,
      backYoke: [[.27, 1.235], [.14, 1.205], [.004, 1.185]],
      backPocket: { x: .12, outline: [[-.07, 1.175], [.07, 1.175], [.066, 1.05], [0, 1.025], [-.066, 1.05]], stitchBelow: 1.12 },
      centreBack: [[.004, 1.185], [.004, 1.08], [0, .99]],
      labelPatch: { name: 'leather-patch', size: [.072, .04, .005], colour: '#b08a5e', position: [-.08, 1.288, -(.17 + .004)], rotationY: Math.PI + .3 },
    },
  },
  [NIKE_TRACK_ID]: {
    slot: 'bottom',
    id: NIKE_TRACK_ID, name: 'Nike woven track pants with piping', family: 'track-pants', version: 1,
    status: 'user-approved', brandAsProvided: 'Nike (from the embroidered swoosh)',
    source: { note: 'user supplied six phone screenshots of a product gallery: front on model full length and closer, side, pocket close-up, styled top half, back' },
    referenceViews: ['front on model', 'front on model (closer)', 'side on model', 'pocket close-up', 'styled front (top half)', 'back on model'],
    details: ['elastic gathered waistband with a tonal drawstring tied at the front', 'raspberry pink lightweight woven nylon with a fine crinkle and a soft sheen', 'wide straight legs, full length, pooling over the shoes', 'two white piping lines down each leg, one either side of the side seam, sweeping toward the front lower down', 'side seam pockets', 'small white embroidered swoosh on the wearer\'s left thigh', 'a small welt pocket on the back right'],
    material: { construction: 'lightweight woven nylon', composition: 'not visible in the supplied screenshots', finish: 'raspberry pink with white piping' },
    fit: { silhouette: 'wide straight track pant', rise: 'mid, elastic', length: 'full, pooling over the shoes', adjustment: 'fixed authored fit for review' },
    styling: { silhouette: 'wide straight, full length, pooling over the shoes', palette: ['raspberry pink', 'white'], pattern: 'plain, with white piping curving down each leg and a small white swoosh', coverage: { waist: 'mid rise, elastic', legs: 'full length' }, material: 'lightweight woven nylon (from the photos), composition unknown', warmth: 1, warmthBasis: 'inferred: thin unlined woven shell', weather: 'mild days; light and breezy, not for the cold on its own; water resistance unknown' },
    uncertainties: ['the piping paths are read from photos at different angles', 'the swoosh is a simple embroidered tick mark', 'folds and crinkle are procedural or from a small swatch'],
    authoring: { texture: 'nike-track-fabric.js: flat-lit seamless swatch from the pocket close-up', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [135, 42, 70],
      // Light woven nylon: smooth, with a soft sheen and no twill.
      surface: { roughness: .72, twill: 0, sheen: .2 },
      crotch: { top: 1.18, y: .95 }, uvScale: [15, 7.5],
      tiles: { small: [9, 4.5], legs: [1, 1], hips: [1, 1] },
      hips: [[1.26, .257, .171], [1.16, .278, .191], [1.05, .295, .199], [.97, .306, .19], [.935, .25, .11]],
      // Wide straight legs pooling over the shoes.
      legs: [[1.03, .152, .182, .13], [.95, .16, .183, .153], [.75, .168, .186, .168], [.55, .174, .19, .175], [.35, .18, .193, .18], [.18, .185, .196, .185], [.06, .188, .199, .188]],
      hem: 'rests-on-shoe', folds: { base: .006, low: .013, stack: .012 }, gradient: [.92, .12], whiskers: 0,
      waistband: { y: 1.235, rx: .252, rz: .166, h: .055, gathers: { count: 60, depth: .025 } },
      drawstring: { colour: '#c24a74', tip: '#c24a74', metal: false, knot: true, x: .012, length: .24 },
      thread: '#b03c66',
      centreFront: [[0, 1.207], [0, 1.1], [0, .975]],
      // Side seam pockets, just in front of the side seam, edged by the front piping.
      frontPocket: { type: 'slant', line: [[.228, 1.205], [.25, 1.13], [.262, 1.06]] },
      // Two white piping lines on each leg, [height, angle from the side seam toward the front].
      piping: { colour: '#f2eee8', radius: .0028, lines: [
        [[1.205, .4], [1.05, .42], [.85, .55], [.65, .85], [.45, 1.1], [.25, 1.15], [.08, 1.1]],
        [[1.205, -.3], [1.0, -.45], [.75, -.7], [.5, -.95], [.25, -1.08], [.08, -1.1]],
      ] },
      tick: { side: 1, x: .245, y: .9, size: .07, colour: '#f4f1ec' },
      seamEnd: .1,
      centreBack: [[0, 1.207], [0, 1.1], [0, .985]],
      welt: [[-.19, 1.17], [-.15, 1.168], [-.11, 1.17]], weltColour: '#8e2a50',
    },
  },
  [TOPSHOP_BLACK_CROP_ID]: {
    slot: 'bottom',
    id: TOPSHOP_BLACK_CROP_ID, name: 'Topshop washed black wide crop jeans', family: 'wide-leg-cropped-jeans', version: 1,
    status: 'user-approved', brandAsProvided: 'Topshop',
    source: { note: 'user supplied five product photos: back and front on a model, a back-pocket close-up, a front waist close-up and the side on a model; the user said they are short, so on them the jeans fall longer, almost to the ankle' },
    referenceViews: ['back on model', 'front on model', 'back pocket close-up', 'front waist close-up', 'side on model'],
    details: ['mid rise', 'wide legs flaring from the knee to a broad raw-cut hem', 'cropped, almost to her ankle (the user\'s fit; mid-calf on the taller model)', 'raw frayed hem with loose threads', 'washed black twill fading to charcoal', 'five-pocket front with copper rivets and a silver shank button', 'back yoke and pointed patch pockets', 'black leather patch embossed TOPSHOP on the back waistband', 'tan double topstitching'],
    material: { construction: 'rigid cotton twill denim', composition: 'not visible in the supplied photos', finish: 'washed black' },
    fit: { silhouette: 'wide, flared from the knee', rise: 'mid', length: 'almost ankle (the user)', adjustment: 'fixed authored fit for review' },
    uncertainties: ['folds are procedural', 'the patch carries no lettering', 'the flare is fitted to her short legs; the photos show a taller wearer'],
    styling: { silhouette: 'wide cropped culotte-style legs, mid rise', palette: ['washed black', 'tan stitching'], pattern: 'plain twill, faded slightly at the thighs', coverage: { legs: 'to just above the ankle' }, material: 'rigid cotton denim', warmth: 2, warmthBasis: 'inferred: denim, wide open cropped legs', weather: 'mild days; the open hem lets the cold in' },
    authoring: { texture: 'topshop-black-crop-denim.js: flat-lit seamless swatch from the back-pocket close-up (brightness variation only, coloured to the measured charcoal)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [35, 37, 43], frayColour: '#56565c',
      // One repeat of the swatch covers about 5 cm of the close-up, so about ten go round her leg.
      crotch: { top: 1.17, y: .95 }, uvScale: [10, 7.6],
      tiles: { small: [7.5, 3.5], legs: [1, 1], hips: [1, 1] },
      hips: [[1.265, .258, .17], [1.16, .276, .192], [1.05, .294, .198], [.97, .306, .19], [.935, .25, .11]],
      // Wide legs, close at the hip and flaring below the thigh to a broad hem, cropped almost to her ankle (the user is short, so they fall longer
      // on them than on the model). The hem is centred over her foot and deep enough front to back to hold a boot shaft
      // without being pushed into the other leg; the hems just meet between her feet, as in the front photo.
      legs: [[1.03, .15, .18, .13], [.95, .156, .18, .152], [.75, .163, .183, .164], [.58, .175, .19, .182], [.42, .185, .205, .193], [.3, .19, .232, .19]],
      hem: 'raw-crop', folds: { base: .005, low: .011 }, gradient: [.94, .1], whiskers: .2, thighFade: .1,
      waistband: { y: 1.24, rx: .262, rz: .172, h: .05 },
      loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
      // Tan topstitching on the pockets, fly, yoke and waistband; the side seams and inseams are tonal, as in the side photo.
      button: { colour: '#c9ccd0' }, thread: '#b0763a', seamThread: '#38383d', doubleSeams: true, rivetColour: '#8e4630',
      fly: [[.036, 1.215], [.038, 1.1], [.022, 1.06], [0, 1.05]],
      frontPocket: { type: 'scoop', line: [[.15, 1.215], [.165, 1.17], [.2, 1.142], [.262, 1.13]] },
      coinPocket: { outline: [[-.236, 1.21], [-.19, 1.21], [-.194, 1.158], [-.233, 1.158], [-.236, 1.21]] },
      rivets: [[.152, 1.21], [.262, 1.135]],
      seamEnd: .3,
      backYoke: [[.268, 1.212], [.14, 1.192], [.004, 1.172]],
      backPocket: { x: .122, outline: [[-.074, 1.158], [.074, 1.158], [.07, 1.03], [0, 1.0], [-.07, 1.03]], stitchBelow: 1.1 },
      centreBack: [[.004, 1.172], [.004, 1.08], [0, 1.0]],
      labelPatch: { name: 'leather-patch', size: [.08, .042, .005], colour: '#151415', position: [-.075, 1.24, -(.172 + .004)], rotationY: Math.PI + .28 },
    },
  },
  [PLEATED_LINEN_ID]: {
    slot: 'bottom',
    id: PLEATED_LINEN_ID, name: 'Urban Classics pleated linen-blend wide trousers', family: 'pleated-wide-trousers', version: 1,
    status: 'user-approved', brandAsProvided: 'Urban Classics (named by the user; not visible in the screenshots)',
    source: { note: 'user supplied seven phone screenshots of a product gallery (images 2, 4, 7 and 11 to 14 of 16), with no text: front, three-quarter and back on a model, front and back flat lays, and close-ups of a front pocket and a back pocket' },
    referenceViews: ['front on model', 'three-quarter on model', 'back on model', 'front flat lay', 'back flat lay', 'front pocket close-up', 'back pocket close-up'],
    details: ['high rise at the natural waist', 'one deep front pleat on each side, folded toward the fly and releasing at the hip', 'wide legs falling straight from the hip and widening slightly to the hem, full length, resting on the shoes', 'pale stone (sand) plain weave with visible linen slubs', 'slanted front pockets', 'zip fly with a curved stitched edge and one tonal four-hole button', 'six belt loops, none at the centre back', 'jetted (welt) back pockets with stitched outlines, and short darts above them', 'centre-back seam', 'tonal stitching and a plain hem'],
    material: { construction: 'plain-weave linen-look woven', composition: 'not visible in the supplied screenshots; the slubs read as a linen blend', finish: 'matte pale stone' },
    fit: { silhouette: 'pleated wide leg', rise: 'high, at the natural waist', length: 'full, resting on the shoes', adjustment: 'fixed authored fit for review; how the user wears them is not yet known' },
    // For later outfit selection. Warmth runs from 1 (light) to 4 (very warm), with what it is based on.
    styling: {
      silhouette: 'high-waisted pleated wide leg, full length', palette: ['pale stone', 'sand'], pattern: 'plain, with a subtle slub texture',
      coverage: { legs: 'full length to the shoes', waist: 'high, at the natural waist' }, material: 'linen-look plain weave',
      warmth: 1, warmthBasis: 'inferred from the light, open linen-look weave in the photos',
      weather: 'suits warm, dry days (inferred from the fabric); wind and rain performance unknown; the pale colour will show rain spots and dirt at the hem',
    },
    uncertainties: ['the composition is not visible in the screenshots', 'the pleats\' depth and where they release are read from on-model photos', 'drape and wrinkles are procedural, from a small swatch', 'how the user wears them (rise, length) is not yet known'],
    authoring: { texture: 'pleated-linen-fabric.js: flat-lit seamless swatch from the plain fabric below the back pocket in the close-up', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [206, 199, 182],
      // Not denim: a matte plain weave with no twill and only a faint sheen.
      surface: { roughness: .93, twill: 0, sheen: .12 },
      crotch: { top: 1.14, y: .95 }, uvScale: [6, 6],
      tiles: { small: [4, 2], legs: [1, 1], hips: [1, 1] },
      hips: [[1.31, .264, .17], [1.2, .278, .19], [1.1, .294, .2], [1.02, .302, .201], [.97, .304, .19], [.935, .244, .1]],
      // Wide legs from the hip (meeting it at the crotch without a ledge), widening slightly to the hem, full length,
      // resting on the shoes.
      legs: [[1.03, .152, .184, .135], [.95, .154, .184, .152], [.75, .164, .19, .164], [.55, .171, .194, .171], [.35, .177, .198, .177], [.18, .182, .201, .181], [.06, .186, .204, .184]],
      hem: 'rests-on-shoe', folds: { base: .005, low: .012, stack: .007 }, gradient: [.95, .07], whiskers: 0,
      waistband: { y: 1.29, rx: .264, rz: .171, h: .055 },
      loops: [-2.55, -1.55, -.6, .6, 1.55, 2.55],
      button: { colour: '#c8bc9f', matte: true, holes: '#8f846b' }, thread: '#b9ad92', dartsStitched: true,
      fly: [[.034, 1.262], [.036, 1.15], [.02, 1.1], [0, 1.09]],
      frontPocket: { type: 'slant', line: [[.168, 1.262], [.212, 1.19], [.262, 1.112]] },
      // One deep pleat on each front hip (x of its folded edge, which drifts toward the fly as it falls).
      pleats: { x: .092, slant: .012, bottom: .99, depth: .014, width: .06, edge: .004, line: .9, shadow: '#8e8571' },
      seamEnd: .1,
      backDarts: [[.11, 1.262], [.112, 1.215]],
      backWelt: { x: .11, y: 1.19, width: .11, height: .016, shadow: '#5f574a' },
      centreBack: [[.004, 1.262], [.004, 1.1], [0, .99]],
    },
  },
  // Shoes.
  [BUFFALO_ASPHA_ID]: {
    slot: 'shoes',
    id: BUFFALO_ASPHA_ID, name: 'Buffalo Aspha olive platform boots', family: 'lug-sole-platform-ankle-boot', version: 1,
    status: 'user-approved', brandAsProvided: 'Buffalo',
    source: { note: 'user supplied five phone screenshots of an Amazon listing ("Buffalo Aspha NC Mid Vegan Nu", colour Verde, size 36 EU): front three-quarter, outer side, back three-quarter, inner side, inner three-quarter' },
    referenceViews: ['front three-quarter', 'outer side', 'back three-quarter', 'inner side', 'inner three-quarter'],
    details: ['chunky tonal platform sole with deep trapezoid lugs, a ledge above the lugs and a raised heel cup', 'toe of the sole lifted (rocker)', 'mid-cut olive vegan nubuck upper, all one colour with the sole', 'padded collar quilted in two horizontal rows', 'tall heel pull tab of jacquard logo tape: grey band reading BUFFALO // between black and taupe woven edges', 'logo tape down the tongue and a tongue pull tab', 'metal eyelets with two taupe webbing lace loops per side', 'flat olive laces', 'curved side overlay edged in dark piping, over a window with two diagonal taupe webbing straps', 'tan double topstitching'],
    material: { construction: 'vegan nubuck upper on a moulded rubber platform', composition: 'not visible in the supplied screenshots', finish: 'matte, softly mottled' },
    fit: { silhouette: 'chunky lug-sole ankle boot', height: 'mid, just above the ankle bone', platform: 'built inside her existing foot height; her body is not raised', adjustment: 'fixed authored fit for review' },
    uncertainties: ['lug count and side-panel curves adapted to her short toy foot', 'the tongue badge, side label and embossed Buffalo script on the heel of the sole carry no lettering', 'tape lettering is redrawn, not copied'],
    authoring: { texture: 'buffalo-tape.js: logo tape drawn locally from the product photos; nubuck and sole colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLugBoot() in src/doll/model.js, in outfit units (x is widened by 1.06 and y squashed by .76 on screen).
    // Upper rows are [y, front, back, halfWidth]: horizontal slices whose front recedes up the lacing.
    build: {
      template: 'lug-boot', cx: .168,
      colours: { upper: '#514e3f', sole: '#44463e', thread: '#7a6b52', piping: '#2a271f', webbing: '#6e604d', lace: '#47422f', eyelet: '#3b3a37', lining: '#2f2c24' },
      sole: { top: .112, heelTop: .15, heelFrom: -.03, rand: .15, lugTop: .05, groove: .074, flare: .02, toeLift: .03, lugs: 24, lugDepth: .026 },
      // A long, low toe; the lacing climbs diagonally to an ankle shaft. Measured as proportions of the side photos.
      upper: [[.112, .44, -.16, .13], [.13, .445, -.162, .131], [.15, .43, -.165, .13], [.165, .4, -.165, .13], [.18, .355, -.164, .129], [.2, .31, -.162, .13], [.225, .265, -.158, .128], [.25, .228, -.155, .127], [.28, .198, -.15, .126], [.31, .175, -.145, .126], [.335, .155, -.138, .124], [.36, .14, -.132, .108], [.385, .132, -.13, .104]],
      collar: { front: .365, side: .345, back: .385 },
      nFront: 2.3, nBack: 2, heelNarrow: .12, toeNarrow: .22, restCap: .22, collarRoll: .017, quilt: [.035, .07],
      eyelets: [.195, .215, .235, .33, .35], loops: [.265, .297], laceHalfWidth: .044,
      heelTab: { width: .056, from: .18, above: .08 }, tongueTab: { width: .046, above: .045 },
      // Side overlay, window, straps and vamp seam as [z, y] paths along each side.
      sides: {
        arch: [[-.115, .165], [-.01, .2], [.09, .243], [.15, .27], [.19, .29]],
        window: [[0, .15], [.02, .18], [.12, .186], [.2, .15], [.225, .122]],
        straps: [[[.025, .128], [.07, .178]], [[.105, .125], [.15, .176]]],
        vamp: [[.265, .2], [.285, .16], [.3, .122]],
      },
    },
  },
  [DM_COW_SLIDE_ID]: {
    slot: 'shoes',
    id: DM_COW_SLIDE_ID, name: 'Dr. Martens cow print platform slides', family: 'platform-slide-sandal', version: 1,
    status: 'user-approved', brandAsProvided: 'Dr. Martens',
    source: { note: 'user supplied five phone screenshots of a shop gallery (images 1, 3, 4, 5 and 7 of 7): side, front three-quarter pair, back pair, top pair, toe close-up; no model name visible' },
    referenceViews: ['inner side', 'front three-quarter', 'back', 'top', 'toe close-up'],
    details: ['open-toe, open-back slide', 'two wide crossed straps of black-and-white cow print pony hair, edged in black leather piping', 'thin black leather cords crossing over them in an X', 'black leather instep strap with a large silver buckle on the outer side', 'black suede footbed with the AirWair logo', 'black leather welt band with fine grooves and yellow welt stitching', 'chunky sculpted outsole in smoky translucent black: toe and heel blocks, a ribbed block and mountain peaks along the side, the tread lifting under the arch'],
    material: { construction: 'pony-hair print leather and smooth leather straps on a moulded platform', composition: 'not visible in the supplied screenshots', finish: 'cow print pony hair, matte leather, slightly glossy translucent outsole' },
    fit: { silhouette: 'chunky platform slide', platform: 'footbed about a fifth of the sole length high; raises her by the part above her normal foot level', adjustment: 'fixed authored fit for review' },
    uncertainties: ['cow-print patches are procedural, not traced from the photos', 'footbed logo and buckle lettering are not reproduced', 'her bare feet are soft felt ovals like her mittens, with no toes', 'outsole sculpting simplified to blocks, a ribbed block and a row of peaks'],
    authoring: { texture: 'procedural cowPrint() in src/doll/model.js', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makePlatformSlide() in src/doll/model.js, in outfit units (x is widened by 1.06 and y squashed by .76).
    build: {
      template: 'platform-slide', cx: .16, baseFoot: .11, restCap: .26,
      colours: { outsole: '#2d2c2f', leather: '#1d1c1e', footbed: '#2c2829', stitch: '#d9a21e', skin: '#dfb195', buckle: '#c7cacd' },
      plan: { front: .35, back: -.15, halfWidth: .12, nFront: 3.4, nBack: 2.8, heelNarrow: .12, toeNarrow: .15 },
      // Heights from the side photo: outsole, welt band (grooves, stitching) and leather top layer up to the footbed.
      sole: { outsole: .081, welt: { grooves: [.088, .095], stitch: .103, top: .111 }, footbed: .138, top: .138, heelTop: .138, lugs: 26, archGap: .02 },
      // Her bare foot as one smooth shape: slices [y, front, back, halfWidth] from just under the footbed up into her leg,
      // with a soft rounded toe and heel (nFront, nBack); instepTop is the highest point straps drape over.
      foot: { nFront: 2.5, nBack: 2.2, instepTop: .275, rows: [[.13, .29, -.115, .082], [.148, .312, -.128, .093], [.168, .31, -.132, .095], [.188, .282, -.13, .091], [.208, .22, -.122, .084], [.23, .14, -.108, .075], [.255, .085, -.092, .066], [.285, .055, -.072, .055], [.33, .045, -.06, .05], [.44, .045, -.06, .05]] },
      // Straps as [z at the inner edge, z at the outer edge, width, gap above her foot]; cords as [z inner, z outer, gap].
      cowBands: [[.27, .15, .11, .008], [.13, .25, .11, .016]],
      cords: [[.29, .1, .024], [.1, .29, .024]],
      instep: { z: [.1, .085], width: .068, gap: .01, buckleAt: .8 },
    },
  },
  [UGG_LOWMEL_ID]: {
    slot: 'shoes',
    id: UGG_LOWMEL_ID, name: 'UGG cream platform sneakers', family: 'platform-sneaker', version: 1,
    status: 'user-approved', brandAsProvided: 'UGG',
    source: { note: 'user supplied five phone screenshots of a shop gallery (images 1, 2, 3, 4 and 6 of 6): outer side, front three-quarter pair, back pair, top pair, toe close-up; the insole and tongue read UGG; the style resembles the UGG Lowmel' },
    referenceViews: ['outer side', 'front three-quarter', 'back', 'top', 'toe close-up'],
    details: ['low-cut chunky skate-style sneaker, all cream', 'cream mesh base showing at the toe box and as a band round the heel collar', 'cream suede overlays: a band all round above the sole, the side quarters, the heel counter and the eyestays, with tonal stitching', 'big round eyelets, four a side', 'very wide, puffy flat laces in cream with a beige-brown diamond zigzag, tied in a large floppy bow with long tails', 'thick padded tongue with a debossed UGG label', 'padded collar and a cream webbing pull loop at the heel', 'smooth cream platform sole with a rounded top edge and small lugs round the bottom'],
    material: { construction: 'suede and mesh upper on a moulded platform sole', composition: 'not visible in the supplied screenshots', finish: 'matte suede, open mesh' },
    fit: { silhouette: 'low chunky platform sneaker', height: 'low, below the ankle bone, so her socks show', platform: 'sole within her normal foot height; she is not raised', adjustment: 'fixed authored fit for review' },
    uncertainties: ['panel outlines simplified (the curved suede piece beside the toe mesh is not modelled)', 'lace pattern is redrawn', 'UGG logos on the tongue label, side and insole carry no lettering'],
    authoring: { texture: 'procedural meshKnit() and laceTexture() in src/doll/model.js', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLugBoot() (template 'sneaker') in src/doll/model.js, in outfit units. Upper rows are
    // [y, front, back, halfWidth]; proportions measured from the side photo (length about 3.5 times the heel height).
    build: {
      template: 'sneaker', cx: .168, mesh: true,
      colours: { upper: '#e2d7b7', mesh: '#d0cab1', sole: '#cab792', thread: '#b3a27c', piping: '#b9a782', lace: '#d9cfb6', laceLine: '#ad9b80', collar: '#cbc0a3', eyelet: '#cfc9b9', lining: '#bfb196', webbing: '#d4c9ae', sock: '#ecdcac' },
      sole: { top: .069, heelTop: .069, heelFrom: -.03, rand: .069, lugTop: .016, groove: null, bulge: .004, flare: .014, toeLift: .02, lugs: 56, lugDepth: .006 },
      upper: [[.069, .41, -.155, .134], [.09, .425, -.158, .137], [.11, .425, -.16, .138], [.13, .415, -.16, .137], [.15, .39, -.158, .136], [.17, .345, -.155, .132], [.19, .28, -.15, .122], [.21, .215, -.138, .106], [.23, .17, -.122, .094], [.25, .15, -.112, .09]],
      collar: { front: .25, side: .205, back: .225 },
      nFront: 2.8, nBack: 2.1, heelNarrow: .1, toeNarrow: .2, restCap: .2, collarRoll: .006, drapeClear: .066, collarRest: .035,
      eyelets: [.163, .19, .217, .244], laceHalfWidth: .044, eyeletSize: [.012, .0045],
      puffyLace: { width: .046, thick: .019, loop: .09, tailTo: .1 },
      // Her own ankle socks for a low shoe: a knit tube [y, rx, rz] centred at z, from inside the shoe up into her leg.
      // Centred on her leg (cx .16), which sits slightly inside the shoe's centre line.
      sock: { cx: .16, z: .0, rows: [[.1, .074, .08], [.2, .075, .08], [.3, .074, .078], [.37, .074, .077], [.38, .079, .082], [.405, .079, .082], [.41, .074, .077]] },
      pullLoop: { height: .06, width: .036 }, tongueLabel: .2,
      // Suede overlays: a band above the sole (taller round the toe), the heel counter, and the side quarters up to the
      // eyestays; mesh shows at the toe box and as a band round the heel collar.
      panels: [
        { name: 'suede-band', band: .03, toe: .02, colour: '#ddcea9' },
        { name: 'heel-counter', z: [-.17, .0], top: [[-.17, .17], [-.1, .155], [-.04, .128], [.0, .112]] },
        { name: 'side-quarter', z: [-.03, .3], top: [[-.03, .122], [.05, .162], [.11, .19], [.18, .192], [.24, .165], [.3, .118]] },
      ],
    },
  },
  [DM_BLAIRE_CHAIN_ID]: {
    slot: 'shoes',
    id: DM_BLAIRE_CHAIN_ID, name: 'Dr. Martens Blaire Quad chain sandals', family: 'platform-strap-sandal', version: 1,
    status: 'user-approved', brandAsProvided: 'Dr. Martens',
    source: { note: 'user supplied seven product images: front three-quarter pair, back three-quarter close-up, top, buckle close-up, back, inner side, outer side; the back label reads BLAIRE II QUAD CHAIN' },
    referenceViews: ['front three-quarter', 'back three-quarter', 'top', 'buckle close-up', 'back', 'inner side', 'outer side'],
    details: ['open-toe platform strap sandal in glossy black patent leather', 'three straps straight across the foot and an ankle strap round the back of the ankle, joined to the sole by an upright strap on each side', 'chunky silver curb chain along the top of every strap, fixed with studs at each end', 'large silver buckles engraved Dr. Martens on the outer side, with pointed stitched tabs', 'tonal stitching along the strap edges', 'black heel pull loop lined in yellow, printed With Bouncing Soles', 'black footbed', 'tall Quad platform with fine horizontal ribbing, a grooved welt with yellow stitching and a sawtooth tread'],
    material: { construction: 'patent leather straps with metal chains on a moulded platform', composition: 'not visible in the supplied images', finish: 'high-gloss patent, satin silver hardware, matte ribbed sole' },
    fit: { silhouette: 'chunky platform strap sandal', platform: 'tall; raises her by the part above her normal foot level', adjustment: 'fixed authored fit for review' },
    styling: { coverage: 'open toe and heel; bare feet', warmth: 'summer; not for rain or cold (open, patent)', palette: 'black with silver hardware and yellow stitching', mood: 'edgy, hardware-heavy' },
    uncertainties: ['chains are drawn as alternating curb links, simplified', 'the Dr. Martens lettering on buckles, footbed and pull loop is not reproduced', 'her bare feet are toeless felt shapes', 'the ankle strap is modelled as one band with a front buckle'],
    authoring: { texture: 'none; patent, metal and ribbed sole are materials and geometry in src/doll/model.js', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makePlatformSlide() (template 'platform-sandal') in src/doll/model.js, in outfit units. Heights
    // and strap positions are proportions of the side photos (sole length .5).
    build: {
      template: 'platform-sandal', cx: .16, baseFoot: .11, restCap: .27,
      colours: { outsole: '#2a292c', leather: '#1c1b1e', footbed: '#1e1d20', stitch: '#e0a91f', skin: '#dfb195', buckle: '#c9ccd0', patent: '#151518', strapStitch: '#3c3c41', pullLoop: '#141416' },
      plan: { front: .35, back: -.15, halfWidth: .12, nFront: 3.2, nBack: 2.8, heelNarrow: .1, toeNarrow: .15 },
      // Quad sole: ribbed outsole with a sawtooth tread, a welt with yellow stitching, a ribbed top layer, the footbed.
      sole: { style: 'quad', outsole: .1, rib: .0065, ribDepth: .0045, toothTop: .022, toothDepth: .018, welt: { grooves: [.106], stitch: .113, top: .121 }, footbed: .142, top: .142, heelTop: .142, lugs: 36, archGap: 0 },
      foot: { nFront: 2.5, nBack: 2.2, instepTop: .275, rows: [[.13, .29, -.115, .082], [.148, .312, -.128, .093], [.168, .31, -.132, .095], [.188, .282, -.13, .091], [.208, .22, -.122, .084], [.23, .14, -.108, .075], [.255, .085, -.092, .066], [.285, .055, -.072, .055], [.33, .045, -.06, .05], [.44, .045, -.06, .05]] },
      // Straps straight across: [z inner, z outer, width, gap above her foot].
      bands: [[.24, .23, .046, .01], [.17, .16, .046, .012], [.098, .09, .046, .012]],
      chain: { from: .2, to: .76, size: .0115 }, buckleAt: .9,
      // Ankle strap: height, gap round the ankle, width, slope (higher at the back), closed all the way round her ankle
      // (from/to in radians from the front), the chain's and buckle's angles on the outer side, and where the side uprights
      // join it.
      ankle: { y: .3, gap: .01, width: .04, tilt: -.006, closed: true, from: 0, to: 6.2832, chain: [1.25, 2.5], buckle: .95, upright: 1.45 },
      pullLoop: { height: .065, width: .036 },
    },
  },
  [SAM_ZIP_BOOT_ID]: {
    slot: 'shoes',
    id: SAM_ZIP_BOOT_ID, name: 'Black front-zip lug-sole ankle boots', family: 'front-zip-lug-sole-ankle-boot', version: 1,
    status: 'user-approved', brandAsProvided: 'not stated (the double-E logo on the zip pull and the back hardware suggests Sam Edelman)',
    source: { note: 'user supplied three product photos without a description: the pair from the front three-quarter, a close-up of the zip and the back, and the outer side' },
    referenceViews: ['front three-quarter pair', 'zip and back close-up', 'outer side'],
    details: ['smooth black leather ankle boot with a round toe', 'centre-front zip in a raised leather placket, double-stitched either side, from the toe cap to the collar; the pull is leather with a small metal double-E logo', 'toe cap seam across the toe', 'a diagonal panel seam across each side and a curved heel counter seam', 'leather pull tab at the back of the collar, with a small metal logo bar beside it', 'thin stitched leather welt on a chunky black rubber lug sole with deep wedge lugs and a slightly raised heel'],
    material: { construction: 'leather upper on a moulded rubber lug sole', composition: 'not visible in the supplied photos', finish: 'smooth, softly glossy' },
    fit: { silhouette: 'chunky lug-sole ankle boot', height: 'above the ankle bone, a little higher than the Buffalo boots', platform: 'built inside her normal foot height; she is not raised', adjustment: 'fixed authored fit for review' },
    styling: { silhouette: 'chunky, rounded ankle boot', palette: ['black', 'gunmetal hardware'], pattern: 'plain, with tonal seams and a front zip', coverage: { ankle: 'covered above the ankle bone' }, material: 'smooth leather, rubber lug sole', warmth: 3, warmthBasis: 'inferred: closed leather ankle boot; lining unknown', weather: 'cool or wet days; the lug sole grips; waterproofing unknown' },
    uncertainties: ['the shaft is roomier than the photos so it clears her thick doll socks', 'the logo hardware carries no lettering', 'the inner side is not shown in the photos; it is built like the outer side'],
    authoring: { texture: 'none: smooth leather and rubber materials, colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLugBoot() in src/doll/model.js, in outfit units, using the template's optional finish, zip,
    // toeCap, seams, pullLoop and backHardware. Upper rows are [y, front, back, halfWidth]: a long low toe whose top rises
    // in a smooth curve to a straight shaft, as in the side photo.
    build: {
      template: 'lug-boot', cx: .168, finish: 'leather',
      colours: { upper: '#1c1a19', sole: '#212121', thread: '#2b2927', piping: '#111010', webbing: '#1c1a19', lace: '#1c1a19', eyelet: '#5d5d62', lining: '#141313' },
      sole: { top: .082, heelTop: .1, heelFrom: -.03, rand: .082, lugTop: .045, groove: null, bulge: 0, flare: .016, toeLift: .018, lugs: 22, lugDepth: .028 },
      upper: [[.082, .44, -.158, .13], [.1, .44, -.16, .131], [.12, .42, -.162, .13], [.14, .38, -.163, .13], [.165, .32, -.162, .129], [.2, .26, -.16, .128], [.25, .2, -.155, .127], [.3, .165, -.148, .124], [.36, .15, -.14, .125], [.435, .145, -.135, .124]],
      collar: { front: .425, side: .42, back: .435 },
      nFront: 2.3, nBack: 2, heelNarrow: .12, toeNarrow: .22, restCap: .22, collarRoll: .006,
      zip: { from: .145, placket: .034, teeth: .008, stitch: [.012, .016] },
      toeCap: { y: .143, side: [[.27, .09], [.29, .112]] },
      // The diagonal side panel seam running back to the heel, and the curved heel counter seam, as [z, y] paths.
      seams: [[[.185, .27], [.12, .235], [.05, .2], [-.02, .172], [-.09, .166], [-.15, .162]], [[-.16, .31], [-.13, .24], [-.1, .17], [-.085, .1]]],
      pullLoop: { height: .045, width: .03 },
      backHardware: { y: .4, angle: .42 },
    },
  },
  [ADIDAS_SUPERSTAR_PINK_ID]: {
    slot: 'shoes',
    id: ADIDAS_SUPERSTAR_PINK_ID, name: 'adidas Superstar pink suede sneakers', family: 'shell-toe-sneaker', version: 1,
    status: 'user-approved', brandAsProvided: 'adidas (the insole reads adidas; the shell toe and three stripes are the Superstar)',
    source: { note: 'user supplied four product photos without a description: front three-quarter, outer side, back three-quarter and top' },
    referenceViews: ['front three-quarter', 'outer side', 'back three-quarter', 'top'],
    details: ['low-top adidas Superstar, all one pink', 'pink suede upper', 'ridged rubber shell toe in the same pink, with a soft sheen', 'three slanted suede stripes on each side, edged with stitching and pierced with small holes', 'stitched eyestays, a heel counter overlay and a panel seam on each side', 'wide flat pink laces through punched eyelets', 'padded collar lined in a deeper, smooth pink; the suede tongue stands above the lacing', 'pink rubber cupsole with a pebbled sidewall and moulded lines, higher at the heel'],
    material: { construction: 'suede upper with a rubber shell toe on a rubber cupsole', composition: 'not visible in the supplied photos', finish: 'matte suede, a satiny rubber toe' },
    fit: { silhouette: 'low-top shell-toe sneaker', height: 'low, below the ankle bone, so her socks show', platform: 'sole within her normal foot height; she is not raised', adjustment: 'fixed authored fit for review' },
    styling: { silhouette: 'low, slim classic sneaker', palette: ['pink'], pattern: 'plain, monochrome: tonal three stripes and shell toe', coverage: { ankle: 'bare above a low collar; she wears ankle socks' }, material: 'suede, rubber shell toe and cupsole', warmth: 2, warmthBasis: 'inferred: a closed low-top suede sneaker', weather: 'dry days; suede marks in rain and puddles' },
    uncertainties: ['wider than the real shoe, as her legs are thick', 'the collar is a little lower and the lacing shorter (five eyelet rows, not seven) than in the photos, so the built-in trousers clear them', 'the logo on the tongue, the insole and the heel carries no lettering', 'the inner side is not shown in the photos; it is built like the outer side', 'the laces are tied in a bow; the product photos show them without one'],
    authoring: { texture: 'none: suede and rubber materials, colours measured from the outer side photo', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLugBoot() (template 'sneaker') in src/doll/model.js, in outfit units, using the template's
    // optional shellToe, stripes, soleLines, seams, punched eyelets and tongueAbove. Upper rows are [y, front, back,
    // halfWidth], measured from the side photo: a long, low toe with a flat top, the lacing sloping up to a collar that
    // dips over the ankle bones (the collar a little lower than the photo's).
    // The lace colours are written pre-encoded: the template's lace texture reads its colours as linear values.
    build: {
      template: 'sneaker', cx: .168, punched: true, tongueAbove: .012,
      colours: { upper: '#d08294', sole: '#c97c8e', shell: '#e39fb0', thread: '#94556a', piping: '#d08294', lace: '#ebc2cd', laceLine: '#e2bac5', collar: '#e3909e', eyelet: '#8f4e60', lining: '#d98b99', webbing: '#d08294', sock: '#ecdcac', hole: '#5e2a38', soleLine: '#b87383' },
      sole: { top: .068, heelTop: .093, heelFrom: .25, heelRamp: .4, rand: .05, lugTop: .006, groove: null, bulge: .002, flare: .01, toeLift: .012, lugs: 120, lugDepth: .002 },
      upper: [[.05, .44, -.137, .116], [.07, .442, -.145, .118], [.09, .44, -.149, .119], [.11, .435, -.15, .119], [.13, .425, -.151, .118], [.15, .402, -.151, .116], [.158, .38, -.15, .115], [.166, .345, -.149, .113], [.19, .305, -.144, .11], [.215, .265, -.138, .107], [.24, .224, -.13, .105], [.26, .195, -.121, .103], [.28, .165, -.108, .101]],
      collar: { front: .275, side: .235, back: .28 },
      nFront: 2.4, nBack: 2.1, heelNarrow: .1, toeNarrow: .26, restCap: .2, collarRoll: .008, drapeClear: .06, collarRest: .035,
      eyelets: [.183, .2, .217, .234, .251], laceHalfWidth: .046, eyeletSize: [.006, .002],
      puffyLace: { width: .028, thick: .009, loop: .055, tailTo: .19 },
      // Her own ankle socks for a low shoe, as for the UGG sneakers.
      sock: { cx: .16, z: .0, rows: [[.1, .074, .08], [.2, .075, .08], [.3, .074, .078], [.37, .074, .077], [.38, .079, .082], [.405, .079, .082], [.41, .074, .077]] },
      tongueLabel: .268,
      // The shell toe's back edge crosses the top of the toe and runs forward down each side ([y, z] from the top).
      shellToe: { top: .166, edge: [[.166, .348], [.11, .364], [.05, .382]], pivot: .2, ridges: 10 },
      // Three stripes leaning toward the toe: the first's back edge `from` along the shoe, width and gap measured along the
      // shoe, slant in length per height.
      stripes: { count: 3, from: .047, width: .03, gap: .021, slant: .426, inset: .012, endGap: .03, holes: [.4, .55, .7] },
      soleLines: [{ down: .022 }, { at: .016 }],
      // The heel counter's top edge, and the panel seam from the sole up to the eyestay, as [z, y] paths.
      seams: [[[-.155, .195], [-.129, .21], [-.103, .205], [-.078, .19], [-.055, .184], [-.045, .1935], [-.025, .215], [-.007, .231]], [[.015, .087], [.0025, .128], [-.006, .158], [.019, .176], [.044, .1935], [.075, .217], [.1, .237]]],
    },
  },
  [CONVERSE_LIFT_HI_ID]: {
    slot: 'shoes',
    id: CONVERSE_LIFT_HI_ID, name: 'Converse Chuck Taylor Modern Lift high-top', family: 'canvas-platform-high-top-sneaker', version: 1,
    status: 'user-approved', brandAsProvided: 'Converse',
    source: { note: 'user supplied five phone screenshots of a decathlon.it product gallery: outer side, inner side, a pair seen from the front, and a top view (twice)' },
    referenceViews: ['outer side', 'inner side', 'front pair', 'top view'],
    details: ['monochrome cream (egret) canvas high-top', 'stacked platform sole in cream with grooves between its layers and tonal stitch lines', 'seven silver eyelets a side up the lacing, cream flat laces', 'rubber toe cap in the sole\'s cream wrapping the front of the toe', 'round tonal ankle patch with an embossed star on the inner side', 'two small vent eyelets low on the inner side', 'rounded toe, padded collar'],
    material: { construction: 'cotton canvas upper on a rubber platform', composition: 'not visible in the supplied screenshots', finish: 'matte canvas' },
    fit: { silhouette: 'high-top platform sneaker', height: 'over the ankle', adjustment: 'fixed authored fit for review' },
    uncertainties: ['the patch carries no lettering', 'the heel label and insole logo are not modelled', 'the platform stays within her foot height, so she is not raised; the real platform may be a little taller'],
    styling: { silhouette: 'chunky high-top on a stacked platform', palette: ['cream'], pattern: 'plain, tonal', coverage: { feet: 'closed, over the ankle' }, material: 'canvas on rubber', warmth: 2, warmthBasis: 'inferred: closed canvas high-top', weather: 'dry mild days; canvas is not waterproof' },
    authoring: { texture: 'procedural materials from the shoe template; colours measured in the screenshots', runtimeGeneration: false, sourcePhotosBundled: false },
    build: {
      template: 'sneaker', cx: .168,
      colours: { upper: '#e4dfcf', sole: '#ddd5bb', thread: '#cbc1a5', piping: '#d6cfb9', lace: '#ece7da', eyelet: '#c6c8cb', lining: '#e2dbc7', webbing: '#ddd6c2', patch: '#e9e5d8' },
      // A flat stacked platform about a quarter of the shoe's height, in three layers with grooves between them and
      // stitch lines round it; the toe bumper rises a little higher. It stays within her foot height (she is not raised).
      sole: { top: .105, heelTop: .105, heelFrom: -.03, rand: .118, lugTop: .012, groove: null, bulge: .003, flare: .012, toeLift: .015, lugs: 60, lugDepth: 0, ribs: [.04, .072], stitches: [.056, .088] },
      // Side photo proportions: a rounded toe, the lacing rising diagonally to a straight ankle shaft about two thirds of
      // the shoe's length high. The shaft narrows to hug her leg above the ankle, as a laced high-top does, so her leg
      // does not come out of a loose opening; from .265 up it stays inside the classic jeans' cuff, which falls over it. It
      // covers her socks completely, so they are hidden (coversSocks).
      upper: [[.105, .42, -.158, .13], [.125, .425, -.16, .132], [.145, .415, -.162, .132], [.16, .385, -.162, .13], [.175, .34, -.16, .128], [.195, .29, -.158, .126], [.22, .22, -.15, .12], [.245, .125, -.124, .106], [.265, .085, -.104, .097], [.29, .08, -.1, .095], [.32, .08, -.099, .094], [.35, .08, -.097, .092], [.38, .079, -.095, .089], [.42, .078, -.094, .087]],
      collar: { front: .38, side: .395, back: .41 },
      nFront: 2.1, nBack: 2, heelNarrow: .12, toeNarrow: .25, restCap: .18, collarRoll: .009, drapeClear: .05,
      eyelets: [.175, .2, .225, .25, .275, .3, .325], laceHalfWidth: .03, eyeletSize: [.0095, .0032],
      // The rubber toe cap in the sole's colour, wrapping the front of the toe from the sole up to about half the toe
      // box's height, as on every Chuck Taylor.
      panels: [{ name: 'toe-cap', rubber: true, z: [.26, .44], top: [[.26, .107], [.3, .13], [.34, .152], [.38, .166], [.44, .174]] }],
      coversSocks: true, anklePatch: { at: [-.042, .236], r: .034 }, vents: [[.096, .125], [.042, .125]],
    },
  },
  [NB_550_ID]: {
    slot: 'shoes',
    id: NB_550_ID, name: 'New Balance 550 cream leather sneakers', family: 'retro-basketball-sneaker', version: 1,
    status: 'user-approved', brandAsProvided: 'New Balance',
    source: { note: 'user supplied six product images: front three-quarter, back three-quarter pair, outer side, sole, inner side, toe three-quarter; the midsole reads new balance and the vamp is embossed 550' },
    referenceViews: ['front three-quarter', 'back three-quarter pair', 'outer side', 'sole', 'inner side', 'toe three-quarter'],
    details: ['low retro basketball sneaker, all cream and off-white', 'smooth cream leather upper with a slightly darker heel counter and a pale leather toe cap', 'perforated leather quarter below the lacing', 'beige mesh window under the collar', 'big slanted N on each side in pale pinkish suede, edged in white leather', 'white leather piping sweeping from the heel down and forward, then up to the lacing', 'white leather edges along the eyestays, punched eyelets, white flat laces in a bow', 'very puffy padded collar with a peach-yellow lining, and a tall puffy nylon tongue with a label', 'chunky cupsole: an aged cream midsole with horizontal grooves over a grey rubber outsole with block lugs, rising higher round the heel and toe', '550 embossed on the vamp and new balance on the midsole'],
    material: { construction: 'leather, suede and mesh upper on a rubber cupsole', composition: 'not visible in the supplied images', finish: 'smooth leather, matte suede and mesh, matte rubber' },
    fit: { silhouette: 'low chunky retro basketball sneaker', height: 'low, below the ankle bone, so her socks show', platform: 'sole within her normal foot height; she is not raised', adjustment: 'fixed authored fit for review' },
    styling: { coverage: 'closed low sneaker; her ankle socks show', warmth: 'all seasons except deep cold; leather sheds light rain, the perforations and mesh breathe', palette: 'cream and off-white with a grey outsole; goes with almost anything', mood: 'retro sporty, clean, everyday' },
    uncertainties: ['the 550 and new balance lettering, the heel NB and the tongue label carry no lettering', 'the suede toe overlay is not modelled; the toe top is smooth leather', 'the midsole’s stepped heel is simplified to straight grooves', 'the composition is not stated in the images'],
    authoring: { texture: 'none; leather, suede, perforations, mesh and rubber are procedural materials and geometry in src/doll/model.js', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLugBoot() (template 'sneaker') in src/doll/model.js, in outfit units. Proportions from the
    // outer side photo: the shoe is about 2.2 times as long as the heel collar is high, and the sole is a fifth of its length. Heights are
    // outfit units, which stand at .76 of their length on her; the collar and tongue stay below where the classic trousers
    // end (.29), so the shoe is a little shorter than the photo's proportions to keep it from looking long and low.
    build: {
      template: 'sneaker', cx: .168, leather: true, punched: true,
      colours: { upper: '#b6ad9d', sole: '#bbaf99', outsole: '#959698', thread: '#cbc2b3', piping: '#f2f0eb', trim: '#f4f2ee', welt: '#bdb3a2', lace: '#f3f1ed', laceLine: '#f3f1ed', collar: '#bdb5a7', eyelet: '#b3ab9e', lining: '#c8ab7d', webbing: '#e2ddd4', sock: '#ecdcac', tongue: '#b8afa0' },
      // Cupsole: a grey outsole, higher round the heel and toe, with block lugs, under a cream midsole with two grooves.
      sole: { top: .105, heelTop: .105, heelFrom: -.043, rand: .085, randFrom: .126, lugTop: .016, groove: null, bulge: 0, flare: .012, toeLift: .014, lugs: 64, lugDepth: .005,
        cup: { outsole: .016, heel: .048, heelFrom: -.016, toe: .04, toeFrom: .18, slot: .036, gap: .17, grooves: [.06, .08] } },
      upper: [[.08, .349, -.156, .128], [.099, .355, -.158, .131], [.123, .349, -.16, .132], [.147, .322, -.16, .132], [.171, .277, -.158, .13], [.195, .225, -.156, .125], [.213, .185, -.153, .116], [.23, .152, -.148, .104], [.246, .127, -.144, .095], [.262, .11, -.138, .09], [.28, .1, -.132, .088]],
      collar: { front: .268, side: .222, back: .27 },
      nFront: 2.8, nBack: 2.1, heelNarrow: .1, toeNarrow: .2, restCap: .24, collarRoll: .006, collarPad: { radius: .014, from: .75 }, drapeClear: .066, collarRest: .035,
      eyelets: [.183, .198, .213, .228, .243, .257], laceHalfWidth: .036, eyeletSize: [.006, .0022],
      puffyLace: { width: .028, thick: .01, loop: .065, tailTo: .18, lift: .6, knot: [.015, .012, .01] },
      tongueAbove: .002, tonguePad: [.085, .022], tongueLabel: .265,
      sock: { cx: .16, z: .0, rows: [[.1, .074, .08], [.2, .075, .08], [.3, .074, .078], [.37, .074, .077], [.38, .079, .082], [.405, .079, .082], [.41, .074, .077]] },
      // Overlays, as [z, y] edges on both sides: the heel counter, a mesh window under the collar, the perforated quarter
      // below the lacing and the toe cap.
      panels: [
        { name: 'heel-counter', leather: true, colour: '#afa595', z: [-.196, .04], top: [[-.196, .219], [-.165, .219], [-.113, .195], [-.07, .165], [-.044, .144], [.002, .12], [.04, .111]] },
        { name: 'side-window', bump: 'mesh', colour: '#a99e8c', z: [-.093, .016], bottom: [[-.093, .166], [.016, .178]], top: [[-.093, .198], [.016, .207]] },
        { name: 'perforated-quarter', leather: true, bump: 'perforated', colour: '#b2a899', stitch: false, z: [.011, .227], top: [[.011, .116], [.04, .109], [.079, .116], [.119, .145], [.155, .181], [.177, .201], [.205, .183], [.227, .147]] },
        { name: 'toe-cap', leather: true, colour: '#aca394', off: .0045, z: [.182, .434], top: [[.182, .126], [.254, .135], [.344, .14], [.434, .14]] },
      ],
      // White leather piping: the sweep from the heel down and forward, then up to the lacing.
      trims: [[[-.165, .219], [-.113, .195], [-.07, .165], [-.044, .144], [.002, .12], [.04, .111], [.079, .118], [.119, .147], [.155, .183], [.177, .207]]],
      logo: { z: .067, y: .17, w: .07, h: .092, slant: .24, colour: '#a29487' },
    },
  },
  [GAZELLE_BOLD_ID]: {
    slot: 'shoes',
    id: GAZELLE_BOLD_ID, name: 'adidas Gazelle Bold cream and green platform sneakers', family: 'platform-sneaker', version: 1,
    status: 'user-approved', brandAsProvided: 'adidas (the GAZELLE lettering and the sole branding)',
    source: { note: 'user supplied five product photos without a description: outer side, front three-quarter, top, sole and back three-quarter' },
    referenceViews: ['outer side', 'front three-quarter', 'top', 'sole', 'back three-quarter'],
    details: ['low suede sneaker, cream (off-white) suede upper', 'three green leather stripes on each side, slanting forward, with serrated gold-stitched edges', 'green leather heel tab with a gold-stitched edge', 'shaggy (hairy) beige suede toe cap and tongue', 'gold foil GAZELLE lettering on the outer side, parallel to the stripes', 'cream eyestays with punched eyelets and beige flat laces', 'cream leather collar lining; a green insole and a yellow tongue label under the laces', 'tall three-tier gum platform: two honey tiers over a darker brown one, each rounded, with grooves between them'],
    material: { construction: 'suede and leather upper on a stacked rubber platform', composition: 'not stated in the photos', finish: 'matte suede, smooth leather stripes and tab, shaggy suede toe and tongue' },
    fit: { silhouette: 'low platform sneaker', height: 'low, below the ankle bone, so her socks show', platform: 'tall, but its top is at her normal foot height, so she is not raised', adjustment: 'fixed authored fit for review; how the user wears them is not yet known' },
    // For later outfit selection. Warmth runs from 1 (light) to 4 (very warm), with what it is based on.
    styling: { silhouette: 'low sneaker on a tall stacked platform', palette: ['cream', 'forest green', 'gold', 'gum'], pattern: 'three green stripes with gold edges', coverage: { ankle: 'below the ankle bone' }, material: 'suede and leather, gum rubber platform', warmth: 2, warmthBasis: 'inferred from a closed suede sneaker', weather: 'dry days; suede and the pale upper will mark in rain or mud (inferred)' },
    uncertainties: ['the GAZELLE lettering is drawn as gold foil marks without letters', 'the sole branding and tread pattern are not modelled', 'the shaggy suede is suggested by its colour and a deeper nap, without loose fibres'],
    authoring: { texture: 'none: colours measured from the photos; procedural suede, leather and rubber materials', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLugBoot() (template 'sneaker') in src/doll/model.js, in outfit units, with the template's
    // stacked sole (sole.tiers), edgedStripes, lettering and leather and shaggy panels. Upper rows are [y, front, back,
    // halfWidth]; proportions measured from the side photo (the platform is about a sixth of the shoe's length).
    build: {
      template: 'sneaker', cx: .168,
      colours: { upper: '#efe9d9', sole: '#c39a60', thread: '#d6ccb4', piping: '#d6ccb4', lace: '#cdb48e', collar: '#efece0', eyelet: '#8a7f6a', lining: '#efece0', webbing: '#cdb48e', sock: '#ecdcac', shaggyTongue: '#c9a77a', label: '#d9b43c' },
      sole: { top: .101, heelTop: .101, heelFrom: -.03, rand: .101, lugTop: .006, groove: null, bulge: .003, flare: .012, toeLift: .02, lugs: 60, lugDepth: .003,
        // Three tiers: a darker brown gum at the bottom under two honey tiers.
        tiers: [{ to: .049, colour: '#8f6a50' }, { to: .076, colour: '#b8915c' }, { to: .101, colour: '#c39a60' }] },
      upper: [[.101, .425, -.168, .13], [.115, .425, -.17, .133], [.13, .39, -.17, .134], [.145, .34, -.168, .133], [.16, .29, -.165, .13], [.18, .235, -.16, .125], [.2, .19, -.15, .115], [.22, .165, -.135, .1], [.24, .15, -.12, .092], [.26, .145, -.11, .09]],
      collar: { front: .235, side: .19, back: .255 },
      nFront: 2.6, nBack: 2.1, heelNarrow: .1, toeNarrow: .3, restCap: .2, collarRoll: .006, drapeClear: .066, collarRest: .035,
      eyelets: [.15, .165, .18, .195, .21, .222], laceHalfWidth: .038, eyeletSize: [.006, .0018],
      // Her own ankle socks for a low shoe, as with the UGG sneakers, starting just above the platform.
      sock: { cx: .16, z: .0, rows: [[.12, .074, .08], [.16, .075, .08], [.23, .075, .08], [.33, .074, .078], [.4, .074, .077], [.41, .079, .082], [.435, .079, .082], [.44, .074, .077]] },
      tongueLabel: .215,
      // The green leather heel tab with a gold-stitched lower edge, and the shaggy suede toe cap ([z, y] edges).
      panels: [
        { name: 'leather-heel-tab', z: [-.172, -.057], bottom: [[-.172, .16], [-.1, .16], [-.07, .166], [-.057, .18]], top: [[-.172, .25], [-.13, .235], [-.09, .21], [-.057, .186]], colour: '#25503f', leather: true, stitch: 'bottom', thread: '#c9a24a' },
        { name: 'shaggy-toe-cap', z: [.33, .425], top: [[.33, .147], [.36, .138], [.39, .129], [.42, .116], [.425, .112]], colour: '#c9a77a', fuzz: .014, stitch: false, wrap: .005 },
      ],
      // Three stripes slanting forward from the sole to the eyestays, each a [z, y] centre line.
      edgedStripes: { colour: '#25503f', edge: '#c9a24a', width: .028, lines: [[[.03, .104], [.11, .19]], [[.11, .104], [.185, .184]], [[.19, .104], [.258, .172]]] },
      // GAZELLE in gold foil on the outer side, parallel to the stripes.
      lettering: { line: [[-.015, .112], [.02, .152]], count: 7, height: .0065, colour: '#d4b35c' },
    },
  },
  [ADIDAS_CAMPUS_ID]: {
    slot: 'shoes',
    id: ADIDAS_CAMPUS_ID, name: 'adidas Campus 00s grey suede trainers', family: 'skate-sneaker', version: 1,
    status: 'user-approved-after-revisions', brandAsProvided: 'adidas (insole, trefoil and “CAMPUS” on the side)',
    source: { note: 'user supplied four product images: front three-quarter pair, back pair, outer side, top pair; the user said their pair has black laces rather than the white ones shown' },
    referenceViews: ['front three-quarter', 'back', 'outer side', 'top'],
    details: ['chunky low skate-style trainer in pale grey suede', 'three black serrated leather stripes on each side, leaning forward toward the lacing', 'black leather heel tab with a white trefoil', 'thick padded suede tongue with a round white trefoil badge in a black ring', 'very wide, puffy flat laces, laced to the top: black on the user\'s pair (white in the photos)', 'padded collar with a white terry lining', 'cream cupsole with a gum rubber strip round the bottom', 'gold “CAMPUS” lettering on the outer side'],
    material: { construction: 'suede upper with leather stripes and heel tab on a rubber cupsole', composition: 'not visible in the supplied images', finish: 'matte suede' },
    fit: { silhouette: 'low chunky trainer', height: 'low, below the ankle bone, so her socks show', platform: 'sole within her normal foot height; she is not raised', adjustment: 'fixed authored fit for review' },
    wear: { userNote: 'the user\'s pair has black laces rather than the white ones in the photos' },
    styling: { silhouette: 'low, chunky, rounded', palette: ['pale grey', 'black', 'cream', 'gum brown'], pattern: 'three black side stripes and a black heel tab', coverage: { foot: 'closed, low cut below the ankle' }, material: 'suede and leather on a rubber cupsole', warmth: 2, warmthBasis: 'inferred: closed suede upper, low cut', weather: 'dry days; suede does not suit rain' },
    uncertainties: ['the stripes\' serrated edges are drawn straight', 'the trefoil on the heel tab and the “CAMPUS” lettering are not reproduced; the tongue badge is a plain disc in a ring', 'the toe and quarter seams are not modelled'],
    authoring: { texture: 'procedural mottle(), laceTexture() and colours in src/doll/model.js; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLugBoot() (template 'sneaker'), in outfit units: the UGG pair's length and heel height (about
    // 2.3 to 1, as in the side photo), but a low, flat toe for the front third, so the laces sit on the instep behind a plain toe.
    build: {
      template: 'sneaker', cx: .168,
      colours: { upper: '#aca6a0', sole: '#d3ccb4', thread: '#b8b1a9', piping: '#b6aea6', lace: '#202022', laceLine: '#38383c', collar: '#e6e4e0', eyelet: '#c8c1ba', lining: '#e8e6e2', webbing: '#d6cfc8', sock: '#ebe9e3' },
      sole: { top: .066, heelTop: .066, heelFrom: -.03, rand: .066, lugTop: .012, groove: null, bulge: .003, flare: .012, toeLift: .018, lugs: 56, lugDepth: 0, gum: { height: .012, colour: '#a96a40' } },
      upper: [[.066, .41, -.155, .134], [.09, .425, -.158, .137], [.105, .42, -.16, .138], [.12, .395, -.16, .137], [.14, .34, -.158, .136], [.16, .275, -.155, .132], [.18, .22, -.15, .122], [.2, .18, -.138, .106], [.22, .155, -.122, .094], [.25, .14, -.112, .09]],
      collar: { front: .25, side: .205, back: .225 },
      nFront: 2.8, nBack: 2.1, heelNarrow: .1, toeNarrow: .2, restCap: .2, collarRoll: .007, drapeClear: .066, collarRest: .035,
      eyelets: [.16, .179, .198, .217, .236], laceHalfWidth: .068, eyeletSize: [.008, .003],
      puffyLace: { width: .036, thick: .009, lift: .5, loop: .09, tailTo: .1, bow: false, matte: true },
      sock: { cx: .16, z: .0, rows: [[.1, .074, .08], [.2, .075, .08], [.3, .074, .078], [.37, .074, .077], [.38, .079, .082], [.405, .079, .082], [.41, .074, .077]] },
      // Three wide black stripes on each side, matte, from the sole ([z along the shoe, y]) up to just below the lacing.
      leatherStripes: { colour: '#1e1e20', width: .034, roughness: .95, gap: .026, paths: [[[.048, .068], [.12, 'lace']], [[.116, .068], [.188, 'lace']], [[.184, .068], [.256, 'lace']]] },
      tongueBadge: { y: .257, r: .019, colour: '#f2f1ee', ring: '#1e1e20' },
      // The black leather heel tab over the back of the collar.
      panels: [{ name: 'heel-overlay', colour: '#1f1f21', matte: true, z: [-.168, -.056], bottom: [[-.168, .147], [-.11, .152], [-.056, .162]], top: [[-.168, .224], [-.11, .219], [-.056, .206]] }],
    },
  },
  // Outerwear.
  [MARIKOO_WINDBREAKER_ID]: {
    slot: 'outerwear',
    id: MARIKOO_WINDBREAKER_ID, name: 'Marikoo two-tone hooded windbreaker', family: 'zip-hooded-windbreaker', version: 1,
    status: 'user-approved', brandAsProvided: 'Marikoo',
    source: { note: 'user supplied seven phone screenshots of a product gallery: front, back and side on a model, front and back flat lays (zipped), a zipped flat lay with the hood up, and the open jacket showing its lining' },
    referenceViews: ['front on model', 'back on model', 'side on model, open', 'front flat lay', 'back flat lay', 'front flat lay, collar close', 'inside'],
    details: ['slate-blue shell with an ecru yoke over the shoulders and upper sleeves', 'front yoke ends in a shallow V pointing down to the zip; across the back it ends straight, as a stitched flap', 'yoke colour ends diagonally on the sleeves, higher outside than underneath', 'gunmetal coil zip from hem to the top of the stand collar', 'hood worn down, blue outside with ecru lining, ecru drawcords with blue-and-white tips', 'vertical welt pockets low on each front, each closed by two white snaps', 'elastic gathered hem band and cuffs; the body and sleeves blouse into them', 'embroidered blue script on the yoke at her left chest', 'round white rubber badge on the upper left sleeve', 'small woven labels on the hood and low on the back'],
    material: { construction: 'woven windbreaker shell, jersey-lined body', composition: 'not visible in the supplied screenshots', finish: 'matte with a soft sheen' },
    fit: { silhouette: 'boxy and relaxed, dropped shoulders', length: 'hip, just below the waistband', sleeve: 'long and relaxed, gathered at the wrist', wear: 'zipped closed in real life (the user wears outerwear closed unless it is designed to be worn open); on the doll it can also be shown open, to see how it looks (user, 9 October 2026)', adjustment: 'fixed authored fit for review' },
    // A closed jacket covers the top's sleeves and the skirt's bow.
    layering: { closed: true, coversTopSleeves: true, coversWaistband: true, canOpen: true },
    // For choosing outfits later. Observed: seen in the photos; user: the user's own words; inferred: read from the
    // construction, not stated anywhere.
    styling: {
      observed: { palette: ['slate blue', 'ecru'], pattern: 'colour-blocked: ecru yoke ending in a V at the front', silhouette: 'boxy hip-length blouson, dropped shoulders', coverage: 'torso and arms to the wrist; neck when zipped; hood (modelled down)', material: 'woven windbreaker shell with a grey jersey lining in the body' },
      user: { wear: 'zipped closed, or not worn, in real life; shown open on the doll only to see how it looks' },
      inferred: { warmth: 'light layer: unpadded shell and a thin lining', weather: 'mild, breezy or cool days; the hood suits light showers', unknown: ['waterproofing', 'fibre composition'] },
    },
    uncertainties: ['the embroidered script is suggested by small joined loops, not the brand lettering', 'the hood lies down on her back; her large head and hair hide its upper part and the collar', 'badge and labels carry no lettering', 'lining is not modelled beyond the collar and the hood edge'],
    authoring: { texture: 'procedural colour layout and zip teeth drawn locally in src/doll/outerwear.js; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeZipWindbreaker() in src/doll/outerwear.js, in outfit units. Body rows are [y, rx, rz] from the
    // collar down; sleeve rows are along the arm from the shoulder.
    build: {
      template: 'zip-windbreaker', roughness: .78,
      colours: { shell: '#31425a', yoke: '#c3c5b9', embroidery: '#5f82b4', stitch: '#3b4b61', snap: '#ecebe6', cord: '#e2e0d8', zip: '#5b5850', opening: '#222a35', lining: '#a09f9b' },
      // Shown open: how far each front edge slides out. The lining colour is the grey jersey in the inside view, estimated.
      open: { shift: .09 },
      body: {
        rows: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .362, .28], [1.22, .362, .282], [1.16, .356, .277], [1.135, .346, .266], [1.118, .338, .258]],
        overSkirt: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .365, .282], [1.22, .374, .288], [1.16, .376, .288], [1.135, .374, .282], [1.118, .37, .276]],
        hem: 1.06, band: .06, bandRadius: [.336, .255], bandOverSkirt: [.372, .274], bandPuckers: 72,
        gathers: 34, gatherDepth: .012, gatherHeight: .09,
        collarBase: 1.89, collarTop: 1.975, collarRadius: [.13, .124],
      },
      // Colour layout, measured as fractions of the flat lays and placed on her short torso.
      yoke: { frontCentre: 1.43, frontSide: 1.53, back: 1.55, backSeam: .035, collar: 1.89, sleeveOuter: -.11, sleeveInner: -.29,
        script: { angle: .6, above: .012, width: .04, height: .022 } },
      sleeve: {
        rows: [[.05, .135, .126], [0, .152, .143], [-.1, .158, .15], [-.25, .156, .148], [-.38, .152, .145], [-.47, .146, .14], [-.51, .132, .127], [-.53, .121, .116]],
        cuff: [-.522, -.575], cuffRadius: [.12, .118], cuffPuckers: 36, gathers: 14, gatherDepth: .02, gatherHeight: .08,
        badge: { y: -.17, radius: .026 },
      },
      zip: { width: .016, stitch: .02 },
      pockets: { x: .235, slant: 0, top: 1.36, bottom: 1.2, width: .04, snaps: [1.33, 1.235], snap: .0125 },
      cords: { x: .05, top: 1.87, end: 1.7, drift: .01, radius: .0055 },
      hood: { top: 1.88, bottom: 1.58, round: .07, halfWidth: .21, lift: .09, edge: .011, opening: { from: .25, rise: .05, out: .03, radius: .016 } },
      backLabel: { x: .2 },
    },
  },
  [DESIGUAL_LEATHER_JACKET_ID]: {
    slot: 'outerwear',
    id: DESIGUAL_LEATHER_JACKET_ID, name: 'Desigual black faux-leather jacket', family: 'cropped-zip-leather-jacket', version: 1,
    status: 'user-approved', brandAsProvided: 'Desigual',
    source: { note: 'user supplied five phone screenshots of an Amazon listing: front on a model, arms crossed, front flat lay, back on a model and full length' },
    referenceViews: ['front on model', 'front on model, arms crossed', 'front flat lay', 'back on model', 'full length'],
    details: ['glossy black faux leather with a fine crinkle', 'pointed shirt collar on a stand', 'silver metal centre zip to the collar', 'front yoke seam across the chest with a panel seam down from it to each pocket', 'a horizontal zip pocket on each side above a flap pocket with a box pleat and a silver snap', 'wide black rib-knit hem band', 'set-in sleeves, ruched above leather cuffs with a buttoned tab', 'centre back seam and two long curved back panel seams', 'printed logo lining (seen at the collar)'],
    material: { construction: 'faux leather (coated fabric) with a rib-knit hem band', composition: 'not visible in the supplied screenshots', finish: 'glossy, crinkled' },
    fit: { silhouette: 'cropped, fairly fitted', length: 'waist, ending in the rib band', sleeve: 'long, set-in, ruched above the cuff', wear: 'the user often wears it open; it can also be zipped closed', adjustment: 'fitted on her, easing out only where the layers under it need room' },
    // Worn open by default (the user's habit), or zipped closed. Closed, it covers the shirt collar like the windbreaker.
    layering: { closed: true, canOpen: true, openByDefault: true, coversTopSleeves: true, coversWaistband: true },
    styling: {
      observed: { palette: ['black', 'silver hardware'], pattern: 'plain; texture from the crinkled gloss and the seams', silhouette: 'cropped waist-length jacket with a point collar', coverage: 'torso to the waist and arms to the wrist; longer tops show below it', material: 'glossy faux leather, rib-knit band' },
      user: { wear: 'often worn open; sometimes zipped closed', fit: 'a great, fitted cut on the user' },
      inferred: { warmth: 'light to medium layer: a coated shell, lining unknown beyond the collar', weather: 'cool, dry or breezy days', unknown: ['waterproofing', 'lining and padding', 'fibre composition'] },
    },
    uncertainties: ['the side panels under the arms in the flat lay may be a different (matte) material; built all in leather', 'the logo lining is not modelled', 'the crinkle is drawn procedurally, not copied', 'the cuff tab position is read from one photo'],
    authoring: { texture: 'procedural crinkle (normal map) in src/doll/outerwear.js; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeLeatherJacket() in src/doll/outerwear.js, in outfit units.
    build: {
      template: 'leather-zip-jacket',
      colours: { leather: '#19191e', rib: '#0e0e10', stitch: '#1f1f22', metal: '#77777c' },
      leather: { roughness: .5, clearcoat: .7, clearcoatRoughness: .25, crinkle: .45, tiles: { body: [18, 7], sleeve: [7, 5], trim: [3, 3] } },
      // Its own fitted size on her (over her body and slim tops). It eases out by at least `gap` over anything worn under it.
      fit: { gap: .009 },
      body: {
        rows: [[1.955, .135, .128], [1.93, .136, .129], [1.9, .143, .133], [1.875, .2, .158], [1.84, .262, .195], [1.8, .302, .216], [1.75, .318, .224], [1.65, .318, .226], [1.5, .314, .226], [1.4, .312, .226], [1.3, .31, .226], [1.24, .306, .224], [1.215, .301, .22], [1.2, .296, .216]],
        hem: 1.13, band: .07, bandRadius: [.294, .212], ribs: 110,
        gathers: 18, gatherDepth: .006, gatherHeight: .06, crease: .005,
        collarBase: 1.875, collarTop: 1.955,
      },
      // Worn open, each front edge hangs this far out from the centre, in front of her chest.
      open: { shift: .11 },
      collar: { gap: .1, gapOpen: .02, spread: .3, foldFront: 1.93, foldBack: 1.97, dropFront: .18, dropBack: .1, lift: .014 },
      front: { yoke: 1.73, yokeTo: .3, panelX: .17 },
      pockets: { x0: .09, x1: .3, zip: { y: 1.53, height: .03 }, flap: { top: 1.485, height: .042, point: .008 }, bottom: 1.27, pleat: .018 },
      back: { panel: [[.13, 1.87], [.18, 1.65], [.2, 1.45], [.18, 1.22]] },
      zip: { width: .009 },
      sleeve: {
        rows: [[.045, .114, .108], [0, .126, .12], [-.1, .128, .122], [-.25, .125, .12], [-.38, .122, .118], [-.46, .121, .117], [-.505, .12, .117]],
        cuff: [-.5, -.568], cuffRadius: [.121, .118], ruche: [-.28, -.49], rucheDepth: .02, rucheFreq: 70,
      },
    },
  },
  [RED_BULL_WINDBREAKER_ID]: {
    slot: 'outerwear',
    id: RED_BULL_WINDBREAKER_ID, name: 'Red Bull Racing stone windbreaker', family: 'zip-windbreaker', version: 1,
    status: 'user-approved', brandAsProvided: 'Red Bull Racing (printed on the jacket)',
    source: { note: 'user supplied five phone screenshots of a product gallery (images 1, 3, 4, 5 and 6 of 6): front on a model worn open, back on a model, a collar close-up, and front and back flat lays, zipped' },
    referenceViews: ['front on model, open', 'back on model', 'collar close-up', 'front flat lay', 'back flat lay'],
    details: ['one-colour stone (light greige) woven shell', 'tall stand collar with the hood stowed inside it, a zip seam across its back, metal snaps and a small cord toggle', 'zip covered by a storm placket from the hem to the top of the collar', 'raglan sleeves', 'curved front panel seams sweeping from the sides down to pocket openings low on each front', 'a horizontal flap seam across the middle of the back', 'reflective prints: RED BULL RACING running down beside the placket, Red Bull across the back above the flap', 'elastic gathered hem band with a cord toggle, elastic cuffs', 'small rectangular rubber patch on the upper left sleeve', 'boxy, hip length'],
    material: { construction: 'woven windbreaker shell', composition: 'not visible in the supplied screenshots', finish: 'matte, slightly technical; reflective prints' },
    fit: { silhouette: 'boxy and relaxed, raglan shoulders', length: 'hip', sleeve: 'long and relaxed, gathered at the wrist', wear: 'zipped closed in real life (the user wears outerwear closed unless it is designed to be worn open; the model wears it open); on the doll it can also be shown open, to see how it looks (user, 9 October 2026)', adjustment: 'fixed authored fit for review' },
    layering: { closed: true, coversTopSleeves: true, coversWaistband: true, canOpen: true },
    styling: {
      observed: { palette: ['stone', 'silver-white reflective print'], pattern: 'plain, with tonal reflective lettering', silhouette: 'boxy hip-length blouson, raglan sleeves', coverage: 'torso and arms to the wrist; neck when zipped (tall collar)', material: 'woven windbreaker shell' },
      user: { wear: 'zipped closed, or not worn, in real life; shown open on the doll only to see how it looks' },
      inferred: { warmth: 'light layer: unpadded shell', weather: 'mild, breezy or cool days; the stowed hood suits light showers', unknown: ['waterproofing', 'lining', 'fibre composition'] },
    },
    uncertainties: ['the reflective prints are spelled in a plain block font, not the brand typeface or logo', 'the hood stays stowed in the collar and is not modelled', 'the sleeve patch carries no lettering', 'pocket openings are drawn as narrow welts along the curved seams'],
    authoring: { texture: 'procedural colour, seams and prints drawn locally in src/doll/outerwear.js (plainBodyData); colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // On the zip-windbreaker template (same body and sleeve rows as the Marikoo jacket), with the template's optional
    // one-colour layout: no yoke, hood or drawcords; a covered zip, drawn seams, prints, toggles and a rectangular patch.
    build: {
      template: 'zip-windbreaker', roughness: .8,
      colours: { shell: '#97938a', stitch: '#817d74', snap: '#c9c5bc', cord: '#a9a59c', zip: '#8d8a86', opening: '#6c6861', print: '#f4f1eb', printShade: '#8c8880', badge: '#a29d94', toggle: '#2b2b2d' },
      // Shown open: how far each front edge slides out. The lining is not visible in the photos, so it stays the shell colour.
      open: { shift: .09 },
      body: {
        rows: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .362, .28], [1.22, .362, .282], [1.16, .356, .277], [1.135, .346, .266], [1.118, .338, .258]],
        overSkirt: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .365, .282], [1.22, .374, .288], [1.16, .376, .288], [1.135, .374, .282], [1.118, .37, .276]],
        hem: 1.06, band: .06, bandRadius: [.336, .255], bandOverSkirt: [.372, .274], bandPuckers: 72,
        gathers: 34, gatherDepth: .012, gatherHeight: .09,
        collarBase: 1.89, collarTop: 1.975, collarRadius: [.13, .124],
      },
      // Seams and prints, as seen straight on from the front or the back.
      lines: [
        { points: [[.125, 1.885], [.2, 1.77], [.335, 1.62]], mirror: true, width: .0022, shade: .86 },
        { points: [[.125, 1.885], [.2, 1.77], [.335, 1.62]], mirror: true, back: true, width: .0022, shade: .86 },
        { points: [[.36, 1.48], [.3, 1.4], [.235, 1.345], [.21, 1.33]], mirror: true, width: .0022, shade: .86 },
        { points: [[-.34, 1.425], [.34, 1.425]], back: true, width: .0025, shade: .8, shadow: .03 },
        { points: [[-.34, 1.434], [.34, 1.434]], back: true, width: .0012, shade: .88 },
      ],
      prints: [
        { x: -.064, y: 1.835, vertical: true, length: .32, height: .028, text: 'RED BULL RACING' },
        { x: 0, y: 1.445, back: true, length: .5, height: .07, text: 'RED BULL' },
      ],
      sleeve: {
        rows: [[.05, .135, .126], [0, .152, .143], [-.1, .158, .15], [-.25, .156, .148], [-.38, .152, .145], [-.47, .146, .14], [-.51, .132, .127], [-.53, .121, .116]],
        cuff: [-.522, -.575], cuffRadius: [.12, .118], cuffPuckers: 36, gathers: 14, gatherDepth: .02, gatherHeight: .08,
        badge: { y: -.12, radius: .02, shape: 'rect', w: .046, h: .026 },
      },
      zip: { width: .016, stitch: .02 },
      placket: { offset: .012, width: .05, snaps: [[.075, 1.952]] },
      toggles: [{ x: .055, y: 1.075, drop: .035 }, { x: .1, y: 1.962, drop: .016 }],
      pockets: { x: .208, slant: .08, top: 1.33, bottom: 1.16, width: .02, snaps: [], snap: .0125 },
    },
  },
  [EMERALD_PARKA_ID]: {
    slot: 'outerwear',
    id: EMERALD_PARKA_ID, name: 'Emerald hooded parka', family: 'zip-windbreaker', version: 1,
    status: 'user-approved', brandAsProvided: 'not given',
    source: { note: 'user supplied five product photos of the coat in its original navy (front, side, back, worn open, close-up); the user\'s own coat was originally a lighter blue, was damaged with bleach and dyed emerald green (Coloreria Italiana); the colour could not be photographed, so the user asked for a slightly muted emerald' },
    referenceViews: ['front on model, zipped, hood up', 'side on model', 'back on model', 'front on model, open', 'close-up, hood up'],
    details: ['oversized hooded parka, knee length on the model', 'hood lined in cream sherpa, with red and white drawcords at the neck', 'zip under a snap placket from the hem to the top of the collar', 'large slanted flap pockets at the hip, each with a snap', 'dropped shoulders and long, full sleeves gathered into elastic cuffs', 'drawcord hem with red and white cord ends at the front edges', 'body lined in cream sherpa (inside view)', 'plain back'],
    material: { construction: 'woven cotton-look shell, padded or sherpa-lined', composition: 'not visible in the supplied photos', finish: 'matte, slightly crinkled; over-dyed by the user' },
    fit: { silhouette: 'oversized, straight to a slight A-line, dropped shoulders', length: 'knee on the model; assumed at least knee length on the user, who is short', sleeve: 'long and full, gathered at the wrist', wear: 'zipped closed in real life (the user wears outerwear closed unless it is designed to be worn open), hood down; it can also be shown open on the doll', adjustment: 'fixed authored fit for review' },
    layering: { closed: true, coversTopSleeves: true, coversWaistband: true, canOpen: true },
    styling: {
      observed: { palette: ['muted blue-green emerald (dyed over powder blue)', 'cream sherpa', 'red and white cords'], pattern: 'plain', silhouette: 'oversized knee-length parka with dropped shoulders', coverage: 'torso, hips and thighs to the knee; arms to the wrist; neck when zipped; hood', material: 'woven shell with a sherpa-lined hood and body' },
      user: { colour: 'a muted, less saturated emerald: the user dyed it emerald over its original carta zucchero (dusty powder blue) after a bleach accident; the two blended, more green than blue; the colour does not photograph well', wear: 'zipped closed, or not worn, in real life; shown open on the doll only to see how it looks' },
      inferred: { warmth: 'warm: a sherpa-lined parka for cold days', weather: 'cold, windy days; the hood suits rain or wind; long enough to cover a skirt or dress', unknown: ['waterproofing', 'fibre composition', 'whether the sherpa, stitching and cords took the dye (assumed not: they look as in the photos)', 'any marks left by the bleach under the dye', 'the exact length on the user'] },
    },
    uncertainties: ['the colour is the user\'s description, not a measurement', 'sherpa, stitching and cords are assumed to have kept their original colours', 'length assumed at the knee', 'the hood is worn down; its pile edge shows round her neck', 'pocket flaps are drawn as slanted raised flaps with one snap each'],
    authoring: { texture: 'procedural colour and sherpa pile drawn locally in src/doll/outerwear.js; no source photos bundled', runtimeGeneration: false, sourcePhotosBundled: false },
    // On the zip-windbreaker template, with a long A-line body to the knee, a drawcord channel at the hem in place of the
    // elastic band, a sherpa-lined collar and hood edge, red hood and hem cords, and no sleeve badge.
    build: {
      template: 'zip-windbreaker', roughness: .82,
      colours: { shell: '#2f5249', stitch: '#27453d', snap: '#c8c9c4', cord: '#c4504c', cordTip: '#ece7dc', zip: '#4a4a46', opening: '#0f2a24', toggle: '#ece7dc', sherpa: '#e6dbc4', lining: '#e2d6bd' },
      open: { shift: .1 },
      // Padded and warm, not a thin shell: soft puffiness and folds, a matte crinkled cotton, rolled edges and the lining at the hem.
      padding: { puff: .01, drape: .026, folds: 7, drapeTop: 1.2, sleeveFolds: .03, hemRoll: .018, edgeRoll: .014, crinkle: { repeat: [9, 6], scale: .22, sheen: .1 } },
      body: {
        rows: [[1.975, .132, .126], [1.935, .134, .128], [1.9, .146, .135], [1.875, .215, .172], [1.84, .293, .224], [1.8, .345, .259], [1.75, .372, .276], [1.65, .382, .288], [1.5, .387, .295], [1.35, .391, .3], [1.2, .397, .304], [1.05, .41, .309], [.9, .428, .316], [.78, .443, .32], [.7, .451, .321], [.682, .449, .318]],
        overSkirt: [[1.975, .132, .126], [1.935, .134, .128], [1.9, .146, .135], [1.875, .215, .172], [1.84, .293, .224], [1.8, .345, .259], [1.75, .372, .276], [1.65, .382, .288], [1.5, .387, .295], [1.35, .393, .301], [1.2, .408, .313], [1.05, .439, .329], [.9, .47, .345], [.78, .486, .353], [.7, .491, .353], [.682, .489, .35]],
        hem: .655, band: .028, bandRadius: [.443, .313], bandOverSkirt: [.483, .345], bandPuckers: 64,
        gathers: 40, gatherDepth: .006, gatherHeight: .06,
        collarBase: 1.89, collarTop: 1.975, collarRadius: [.132, .126],
      },
      sleeve: {
        rows: [[.05, .15, .14], [0, .172, .162], [-.1, .181, .171], [-.25, .181, .171], [-.38, .177, .168], [-.47, .169, .161], [-.51, .149, .143], [-.53, .13, .125]],
        cuff: [-.522, -.575], cuffRadius: [.12, .118], cuffPuckers: 36, gathers: 16, gatherDepth: .024, gatherHeight: .09,
      },
      zip: { width: .016, stitch: .02 },
      placket: { offset: .014, width: .06, snaps: [[.08, 1.95]], roll: .009 },
      toggles: [{ x: .06, y: .668, drop: .06 }, { x: -.06, y: .668, drop: .06 }],
      pockets: { x: .17, slant: .3, top: 1.22, bottom: 1.04, width: .042, snaps: [1.18], snap: .011 },
      cords: { x: .055, top: 1.885, end: 1.8, drift: .006, radius: .005 },
      hood: { top: 1.88, bottom: 1.55, round: .07, halfWidth: .23, lift: .085, edge: .012, label: false,
        opening: { from: .3, rise: .05, out: .035, radius: .018, lining: { radius: .028, inset: .022 } } },
    },
  },
  [BOMBOOGIE_FUR_JACKET_ID]: {
    slot: 'outerwear',
    id: BOMBOOGIE_FUR_JACKET_ID, name: 'Bomboogie pink faux-fur jacket', family: 'faux-fur-shirt-jacket', version: 1,
    status: 'reference-study-awaiting-visual-review', brandAsProvided: 'Bomboogie (the neck label)',
    source: { note: 'user supplied four product images on white: front flat, closed; a flat lay open showing the lining; back flat; side three-quarter' },
    referenceViews: ['front, closed', 'open flat lay', 'back', 'side three-quarter'],
    details: ['short, dense faux fur (mink-like) in dusty rose pink', 'big fur point collar', 'closed by hidden snaps under the fur at the centre front; one snap shows at the top', 'a fur flap on each side of the chest', 'slanted side pockets', 'boxy, cropped body with a straight hem', 'dropped shoulders and full sleeves gathered into fur cuff bands', 'pink satin lining with a black Bomboogie label on a chain hanger at the back of the neck'],
    material: { construction: 'faux fur shell with a satin lining', composition: 'not stated in the supplied images', finish: 'soft, short, dense pile with a velvety sheen' },
    fit: { silhouette: 'boxy and cropped, dropped shoulders', length: 'high hip', sleeve: 'long and full, gathered into cuff bands', wear: 'closed with its snaps: the user wears outerwear closed unless it is designed to be worn open', adjustment: 'its own boxy size on her, easing out only where the layers under it need room' },
    layering: { closed: true, coversTopSleeves: true, coversWaistband: true },
    styling: {
      observed: { palette: ['dusty rose pink', 'pink satin lining'], pattern: 'plain; texture from the fur pile', silhouette: 'boxy cropped shirt jacket with a big point collar', coverage: 'torso to the high hip and arms to the wrist; longer tops show below it', material: 'faux fur, satin lining' },
      inferred: { warmth: 'warm: a dense pile over a lining, for cold days', weather: 'cold, dry days; faux fur does not suit heavy rain', mood: 'soft, cosy and playful', unknown: ['fibre composition', 'padding', 'water resistance'] },
    },
    uncertainties: ['the fur is a procedural texture, not copied; its length is read from the photos', 'the side pockets are read from the open flat lay and are drawn as slits with a welt', 'the label lettering is not reproduced', 'only one snap shows; the others are hidden'],
    authoring: { texture: 'procedural fur (bump and colour) in src/doll/fur-jacket.js; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeFurJacket() in src/doll/fur-jacket.js, in outfit units. The body is boxy and straight; its own
    // size eases out by at least `fit.gap` over anything worn under it.
    build: {
      template: 'faux-fur-shirt-jacket',
      colours: { fur: '#a06368', lining: '#bf8790', parting: '#653540', metal: '#6e6c70', label: '#141416' },
      fur: { sheen: 1, sheenLight: .35, sheenRoughness: .45, bump: .012, tiles: { body: [10, 3], sleeve: [5, 3], trim: [4, 2] } },
      fit: { gap: .012 },
      body: {
        rows: [[1.955, .14, .133], [1.93, .141, .134], [1.9, .148, .138], [1.875, .205, .163], [1.84, .272, .204], [1.8, .314, .226], [1.75, .332, .236], [1.65, .334, .238], [1.5, .334, .24], [1.4, .334, .24], [1.3, .334, .24], [1.2, .332, .238], [1.14, .33, .236], [1.12, .327, .233]],
        hem: 1.12, roll: .011, edge: .008, ripple: .006,
        collarBase: 1.875, collarTop: 1.955,
      },
      // One snap shows at the top of the front, on her right.
      snaps: [[-.03, 1.83]],
      collar: { gap: .09, spread: .3, foldFront: 1.93, foldBack: 1.975, dropFront: .145, dropBack: .11, lift: .02, roll: .014 },
      pockets: { flap: { x0: .07, x1: .24, top: 1.77, height: .075, puff: .017, lift: .012, round: 4, lip: .008 }, side: { x: .245, slant: .2, top: 1.44, bottom: 1.25 } },
      sleeve: {
        rows: [[.045, .124, .118], [0, .138, .132], [-.1, .142, .136], [-.25, .14, .135], [-.38, .136, .132], [-.45, .132, .128], [-.495, .124, .12]],
        cuff: [-.495, -.568], cuffRadius: [.128, .124], gathers: 9, gatherDepth: .035, gatherHeight: .08, cuffRoll: .009,
      },
    },
  },
  // Dresses: one piece worn instead of the top and the bottoms, with bare legs; shoes and outerwear go with it.
  [ZIP_TRACK_DRESS_ID]: {
    slot: 'dress',
    id: ZIP_TRACK_DRESS_ID, name: 'Navy half-zip track mini dress', family: 'long-sleeve-mini-dress', version: 1,
    status: 'user-approved', brandAsProvided: null,
    source: { note: 'user supplied five phone screenshots of a listing (images 2, 3, 5, 7 and 9 of 9): arms crossed, full length front, back, a collar close-up and a hem close-up' },
    referenceViews: ['front, arms crossed', 'full length front', 'back', 'collar and zip close-up', 'hem and cuff close-up'],
    details: ['navy textured jersey with fine vertical cable ribs', 'tall stand-up funnel collar that can fold down like a polo', 'quarter zip from the collar to mid-chest: silver teeth and slider with a navy tab', 'raglan sleeves: navy, with a wide cream textured panel down the outside of each sleeve from the neckline to the wrist, split by a narrow navy stripe', 'navy fine-ribbed cuffs', 'short A-line skirt to the upper thigh', 'worn with bare legs, white socks and white sneakers in the photos'],
    material: { construction: 'textured cable-rib jersey', composition: 'not visible in the supplied screenshots', finish: 'matte' },
    fit: { silhouette: 'close at the chest, gently A-line', sleeve: 'long raglan, ribbed cuffs', hem: 'upper thigh', neckline: 'stand collar with quarter zip, worn zipped up', adjustment: 'fixed authored fit for review' },
    layering: { replacesTop: true, replacesBottom: true, bareLegs: true },
    styling: { silhouette: 'A-line mini, upper thigh', palette: ['navy', 'cream'], pattern: 'sporty colour-blocked raglan sleeves', coverage: { neck: 'high stand collar', sleeves: 'long', midriff: 'covered', legs: 'bare from the upper thigh' }, material: 'textured cable-rib jersey', warmth: 2, warmthBasis: 'inferred: long-sleeved jersey, but bare legs', weather: 'mild days; bare legs below the hem' },
    uncertainties: ['the brand is not shown on the dress in the screenshots (only the sneakers carry a logo)', 'the rib texture is drawn, not copied', 'the sleeve panel layout is read from the front and back photos; the underarm is not shown', 'the collar is modelled standing, as in three of the photos'],
    authoring: { texture: 'procedural zipDressData() in src/doll/model.js', runtimeGeneration: false, sourcePhotosBundled: false },
  },
});
