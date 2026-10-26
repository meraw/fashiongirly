// Wardrobe item: Champion purple tie-dye velour hoodie. Record: docs/garments/champion-purple-tie-dye-velour-hoodie.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'champion-purple-tie-dye-velour-hoodie-v1', name: 'Champion purple tie-dye velour hoodie', family: 'velour-hoodie', version: 1,
    status: 'user-approved', brandAsProvided: 'Champion (the listing, “챔피온 타이다이 트레이닝 세트”, and the logo on the sleeve)',
    source: { note: 'user supplied two photos without a description: a second-hand shop\'s listing (a mirror photo of the hoodie worn with its matching velour trousers, the hood up; size M, length 68 cm, chest 60 cm across, condition A, sold out) and a brand photo of the same hoodie on a model, the hood down; only the hoodie was asked for' },
    referenceViews: ['front on the wearer (mirror photo, hood up)', 'three-quarter front on a model, hood down'],
    details: ['soft cotton velour (a short, dense pile with a sheen)', 'bound tie-dye on a near-black violet ground: bright violet bands round the body and the sleeves, broken by dark lines where it was folded, with the ground faintly mottled between them; the brightest band across the chest', 'relaxed and hip length, with dropped shoulders', 'full long sleeves into long ribbed cuffs', 'a ribbed hem band, the body blousing over it', 'a hood, its sides crossing at the front of the neck', 'round cream drawcords knotted near their ends (on the brand photo)', 'a small woven C logo patch, blue and red edged in white, on her left sleeve just above the cuff', 'a small tonal embroidered mark on her left chest'],
    material: { construction: 'velour (cut pile knit), rib trims, woven logo patch', composition: 'not stated', finish: 'soft sheen (pile)' },
    fit: { silhouette: 'relaxed, hip length', sleeve: 'long and full, dropped shoulders, long ribbed cuffs', hem: 'at the hip, ribbed band', neckline: 'hood, worn down', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the tie-dye is redrawn in code from the photos\' layout, not copied: every piece of tie-dye is different, and the bands, folds and mottling are placed as a likeness', 'the logo patch and the chest mark are drawn as suggestions of the marks, not copies', 'the user\'s own hoodie is shown with the hood up and hair over its neck, so its cords cannot be seen; they are built as on the brand photo', 'the length on her is read from the listing (68 cm) and the mirror photo, where it reaches the hip', 'the user\'s photo is of a worn, second-hand piece: its ground reads a little bluer and its rib bands a little lighter than the brand photo\'s; the colours follow the user\'s photo', 'the matching velour trousers are not added'],
    styling: { silhouette: 'relaxed, hip length', palette: ['near-black violet', 'violet'], pattern: 'bound tie-dye bands with dark fold lines', coverage: { neck: 'hood, worn down', sleeves: 'long', midriff: 'covered, to the hip' }, material: 'cotton velour', warmth: 3, warmthBasis: 'inferred: a velour hoodie with long sleeves, long cuffs and a hood, to the hip', weather: 'cool, dry days; velour soaks up rain and shows it (inferred)', mood: 'casual, cosy', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband and hides the skirt\'s bow. Under a jacket its hood and cords are put away and it wears a narrow neckband inside the jacket.', unknown: ['fibre composition'] },
    authoring: { template: 'makeVelourHoodie() in src/doll/velour-hoodie.js', texture: 'procedural, in src/doll/velour-hoodie.js: the tie-dye bands, folds and mottle, the logo patch and the chest mark drawn in code; colours measured from the user\'s photo', runtimeGeneration: false, sourcePhotosBundled: false },
    study: { name: 'Tie-dye velour hoodie study', note: 'Reference study: a relaxed, hip-length Champion hoodie in near-black violet velour, tie-dyed in bright violet bands broken by dark fold lines, with long ribbed cuffs, a ribbed hem band, the hood worn down, cream cords and the C logo on her left sleeve, with black jeans. The tie-dye and the logo are drawn in code, not copied.', recipe: { bottomId: 'mango-washed-black-v1' } },
    // Construction for makeVelourHoodie(), in outfit units: a relaxed body from dropped shoulders to the hip, blousing
    // over a rib band that clears every bottom (and widens over the skirt); full sleeves into long ribbed cuffs.
    build: {
      template: 'velour-hoodie',
      colours: { ground: '#0f0f24', dye: '#4c2a6c', bright: '#6c3c8e', rib: '#383650', sheen: '#6a6890', lining: '#141429', cord: '#e6dccb', embroidery: '#322c48',
        logoWhite: '#f4f4f2', logoBlue: '#24409a', logoRed: '#c8202f' },
      body: { hem: 1.1, band: .085, ribs: 96, bandRadius: [.326, .24], bandOverSkirt: [.344, .256],
        rows: [[1.905, .112, .104], [1.875, .18, .13], [1.83, .25, .168], [1.785, .3, .2], [1.7, .318, .214], [1.55, .322, .222], [1.4, .322, .226], [1.3, .318, .226], [1.22, .324, .234]] },
      sleeve: { cuffRibs: 30,
        rows: [[.03, .13, .125], [-.06, .146, .14], [-.2, .148, .142], [-.33, .142, .136], [-.42, .13, .125], [-.46, .114, .11], [-.48, .106, .102]],
        cuff: [[-.47, .102, .098], [-.53, .097, .094], [-.585, .096, .093]] },
      // The tie-dye. Bands are [centre, half-height, strength]: the body's in outfit heights, read down the user's photo
      // from the neck to the hem band; the sleeves' along the sleeve (0 at the shoulder); the hood's from 0 to 1. `fold`
      // is how far apart the fold lines are and `foldWidth` how wide, both in world units; `wander` how far the bands'
      // edges stray up and down; `ground` how much dye reaches the ground between the bands.
      dye: { seed: 41, fold: .055, foldWidth: .015, wander: .06, ground: .16,
        body: [[1.83, .04, .15], [1.61, .1, 1], [1.33, .11, .55]],
        sleeve: [[-.14, .09, .85], [-.34, .08, .5]],
        hood: [[.45, .25, .18]] },
      hood: { top: 1.89, bottom: 1.6, round: .07, halfWidth: .2, lift: .08, edge: .011, opening: { from: 1.05, rise: .05, out: .03, radius: .014, band: .04, dip: 0 } },
      cords: { x: .032, drift: .006, top: 1.875, knot: 1.7, radius: .0065, tassel: .018 },
      // The logo patch: on her left sleeve (+1), at its height down the sleeve, its size in world units and how far it
      // turns from the outside toward the back.
      logo: { side: 1, y: -.44, size: [.046, .036], turn: 0 },
      chestMark: { at: [.1, 1.765], size: .04 },
    },
};
