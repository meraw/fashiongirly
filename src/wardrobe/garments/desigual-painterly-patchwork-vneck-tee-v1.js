// Wardrobe item: Desigual painterly patchwork V-neck tee. Record: docs/garments/desigual-painterly-patchwork-vneck-tee.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its print atlas. Built by makePrintedTee() in src/doll/printed-tee.js (the printed raglan tee template).
export default {
  slot: 'top',
  id: 'desigual-painterly-patchwork-vneck-tee-v1', name: 'Desigual painterly patchwork V-neck tee', family: 'printed-raglan-tee', version: 1,
  // Merging the pull request is the user's approval (their rule), so the garment's own pull request marks it approved.
  status: 'user-approved', brandAsProvided: 'Desigual (label in the flat lay)',
  source: { note: 'user supplied four phone screenshots without a description: the front on a model, a three-quarter view on a model and a front flat lay from a shop gallery (images 1, 3 and 4 of 4), and the back on a model from a Japanese shop' },
  referenceViews: ['front on model', 'three-quarter on model', 'front flat lay', 'back on model'],
  details: ['fitted short-sleeved tee in a fine stretch rib knit', 'pieced from panels printed with sections of impressionist paintings: pale clouds in cream, grey and sky blue, and big orange-red and yellow flowers with green leaves', 'front: clouds on her right, yellow and orange flowers on her left, joined by a centre seam from the point of the V', 'back: clouds above a band of red and yellow flowers across the lower back', 'raglan sleeves: her right sleeve red flowers, her left sleeve clouds', 'deep V-neck with a printed binding', 'every seam exposed and overlocked in rust orange, slightly wavy', 'short, slightly flared sleeves and the hem finished in rust-orange lettuce edges'],
  material: { construction: 'fine stretch rib jersey (read from the photos)', composition: 'not stated', finish: 'matte print' },
  fit: { silhouette: 'fitted, close to the body', sleeve: 'short raglan sleeves, slightly flared, ending high on the upper arm', hem: 'at the waistband of high-rise bottoms', neckline: 'deep V', adjustment: 'fixed authored fit for review' },
  exclusions: ['striped-shirt', 'knit-sweater'],
  // Covers the waistband; the short sleeve's fabric ends at -.155 (sleeve-local), below which her arm is bare.
  layering: { coversWaistband: true, bareArmBelow: -.155 },
  uncertainties: ['the print is taken from the product photos, so it is softer than the real fabric and some photographed shading remains', 'her hair hides the middle of the upper back in the back photo, so the upper back is filled from the clouds just below her hair', 'the doll\'s torso is wider and shorter than the model\'s, so each panel shows a shorter vertical slice of its painting and the flowers are squatter', 'the sleeves are made from small crops and are blurrier than the body', 'the paintings look impressionist (clouds, and chrysanthemums or dahlias); they are not identified'],
  styling: { silhouette: 'fitted, high-hip length', palette: ['cream', 'rust orange', 'yellow', 'sky blue', 'grey', 'green'], pattern: 'patchwork of painting prints: clouds and big orange and yellow flowers, with rust-orange overlocked seams', coverage: { neck: 'deep V', sleeves: 'short', midriff: 'covered' }, material: 'fine stretch rib jersey', warmth: 1, warmthBasis: 'inferred: thin fitted knit with short sleeves and an open neckline', weather: 'warm days, or a base layer under a jacket' },
  authoring: { template: 'makePrintedTee() in src/doll/printed-tee.js, with its V-neck', texture: 'painterly-tee-atlas.js: the body unwrapped and the sleeves, projected from the user\'s flat lay (front, front of the sleeves) and back photo (back, back of the sleeves); the upper back filled from the clouds below her hair', runtimeGeneration: false, sourcePhotosBundled: 'processed crops only, as the texture atlas' },
  // The print atlas the 3D view loads for it, made from the product photos.
  atlas: ['../wardrobe/painterly-tee-atlas.js', 'DESIGUAL_PAINTERLY_TEE_ATLAS'],
  // Construction for makePrintedTee() in src/doll/printed-tee.js, in outfit units. The V is laid on the flat lay's V in the
  // atlas: it meets the neckline .16 of the way round from centre front and ends at 1.67, its sides curving as in the photo.
  // The seams sit on the atlas's panel edges: raglan lines from just outside the V's corners to the underarms, the centre
  // front from the V's point, the side seams, and the back band's seam a third of the way up the back.
  build: {
    template: 'printed-raglan-tee',
    colours: { overlock: '#a85a38', binding: '#b66a46', fallback: '#e2c9a6', printTone: '#b39a83' },
    body: { neck: 1.91, hem: 1.19, lettuce: .0035, waves: 44, neckWaves: 30,
      rows: [[1.91, .109, .099], [1.875, .17, .122], [1.83, .228, .152], [1.775, .265, .175], [1.65, .279, .183], [1.49, .277, .187], [1.34, .284, .196], [1.25, .29, .206], [1.19, .292, .213]] },
    vneck: { bottom: 1.67, half: .16, round: 1.3, binding: .012 },
    seams: { neckU: .18, armTop: .95, armU: .24, armV: .66, centreTop: .667, band: .32 },
    // Short and slightly flared, ending high on her upper arm.
    sleeve: { rows: [[.03, .108, .106], [-.04, .12, .117], [-.1, .121, .118], [-.155, .125, .122]], lettuce: .003, waves: 18 },
  },
  // The study preset: added to the outfit ideas with the other top studies; the tee fills its own slot.
  study: { name: 'Painterly patchwork tee study', note: 'Reference study: a fitted Desigual tee pieced from painting prints, pale clouds and big orange and yellow flowers, with a deep V-neck, short raglan sleeves and rust-orange overlocked seams and lettuce edges, with the Mango Claudia washed black jeans and the cream 550s. The print is processed from the product photos.', recipe: { bottomId: 'mango-claudia-slim-crop-jeans-v1', shoesId: 'new-balance-550-cream-v1' } },
};
