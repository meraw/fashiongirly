// Wardrobe item: Desigual Hawaii patch striped tee. Record: docs/garments/desigual-hawaii-patch-stripe-tee.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'desigual-hawaii-patch-stripe-tee-v1', name: 'Desigual Hawaii patch striped tee', family: 'printed-long-sleeve-tee', version: 1,
    // Approved by merging (the user's rule: a merged pull request means approved), so its own pull request marks it approved.
    status: 'user-approved', brandAsProvided: 'Desigual (neck label and “DSG” on the patch)',
    source: { note: 'user supplied three product photos without a description: the front on a model with light blue ripped jeans, the back on a model, and the front laid flat' },
    referenceViews: ['front on model', 'back on model', 'front flat lay'],
    details: ['boxy long-sleeved tee in cream jersey with fine black horizontal stripes', 'lines of “desigualite” in white blackletter, cracked and worn, repeated down the front', 'a sewn-on patch on her left front: a photo print of woody wagons under palm trees with a maroon “DSG HAWAII” sign, framed by sequinned bands (orange and red fish scales on navy at the left and top, black bands with red embroidered flowers and red and gold diagonal stripes at the right and bottom)', 'an embroidered pink rose with red buds and green leaves over the patch\'s top corner', 'dropped shoulders: the stripes run down the arm above the seam and round it below', 'narrow self-striped crew neckband', 'long relaxed sleeves to the wrist, plain hemmed', 'straight hem at the hip, worn untucked; the back is plain stripes'],
    material: { construction: 'soft slub jersey, with a sequinned and embroidered patch', composition: 'not visible in the supplied photos', finish: 'matte; sequins on the patch' },
    fit: { silhouette: 'boxy, relaxed', sleeve: 'long, relaxed, from dropped shoulders', hem: 'hip, straight', neckline: 'crew', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true, tucksIntoSkirt: true },
    uncertainties: ['the lettering, the patch\'s picture, its bands and the rose are redrawn in code, simplified, not copied from the photos', 'the word is read as “desigualite”; an accent on its last letter is not drawn', 'her torso is wider and shorter than the models\', so the lettering is larger and repeats along each line, and the patch is wider than tall', 'over the skirt it is tucked in, as the relaxed shirts are'],
    styling: { silhouette: 'boxy, hip length', palette: ['cream', 'black', 'white', 'sky blue', 'maroon', 'wood brown', 'red', 'pink'], pattern: 'fine black stripes on cream, white blackletter lettering, a sequinned picture patch with an embroidered rose', coverage: { neck: 'crew', sleeves: 'long', midriff: 'covered, to the hip' }, material: 'slub jersey, composition not stated', warmth: 2, warmthBasis: 'inferred: a light jersey with long sleeves', weather: 'mild days, or a layer under a jacket' },
    authoring: { template: 'makePrintedLongTee() in src/doll/printed-long-tee.js', texture: 'procedural, in src/doll/stripe-patch-print.js: stripes, blackletter, patch and rose drawn in code; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makePrintedLongTee() (template printed-long-tee), in outfit units: a boxy body on the jumpers'
    // shoulders, as relaxed as the shirts below them, to the hip; tucked into the skirt; relaxed sleeves to the wrist.
    build: {
      template: 'printed-long-tee',
      colours: { band: '#0d0a09', neckband: '#aaa396', sheen: '#d9d4c8' },
      body: { neck: 1.885, hem: 1.11,
        rows: [[1.885, .114, .108], [1.85, .2, .15], [1.81, .266, .187], [1.76, .298, .206], [1.6, .304, .211], [1.4, .308, .217], [1.3, .312, .222], [1.2, .317, .229], [1.11, .322, .235]],
        tucked: [[1.885, .114, .108], [1.85, .2, .15], [1.81, .266, .187], [1.76, .298, .206], [1.6, .304, .211], [1.4, .3, .21], [1.33, .292, .205], [1.26, .29, .205]],
        neckband: [[1.905, .114, .108], [1.883, .118, .112]] },
      // `drop`: how far down the outside of the sleeve the dropped shoulder seam falls.
      sleeve: { drop: .11,
        rows: [[.03, .125, .12], [-.06, .134, .129], [-.2, .134, .129], [-.33, .127, .122], [-.45, .112, .108], [-.52, .1, .097], [-.545, .097, .094]] },
      // The print (stripe-patch-print.js), lengths in world units: the stripes' period and dark share; the lettering's
      // x-height, pen nib (in ems, and its angle), spacing (in ems) and lines (baseline down from the neck, start in ems);
      // the patch's edges (across from the centre front, toward her left, and down from the neck) and band width; the rose.
      print: { draw: 'stripe-patch', seed: 61, ground: '#aaa396', stripe: '#0d0a09', period: .0165, share: .38,
        letters: { word: 'desigualite', size: .056, nib: .27, nibAngle: 40, tracking: .06, space: .45, gap: .7, wear: .1, alpha: 1,
          lines: [[.085, -.4], [.18, -.1], [.275, -.6], [.37, -.2], [.465, -.5], [.56, -.15]] },
        patch: { left: -.1, right: .27, top: .1, bottom: .44, band: .03, sequins: 260 },
        rose: { x: .24, y: .1, size: .04 },
        inks: { letter: '#f6f5f1', sky: '#7fa5cc', skyLight: '#a9c3dc', maroon: '#6e1f26', cream: '#d9c9a8', wood: '#7a4524', woodDark: '#4e2a14', woodLight: '#b98450', sand: '#b9ab8c', tyre: '#141414',
          glass: '#1d2538', glassLight: '#5d7390', red: '#b8302c', blue: '#5b8fc0', chrome: '#9a9a9a', orange: '#c8682a', board: '#d6c08f', palm: '#1f4a2c',
          navy: '#1c2a44', black: '#1a1618', gold: '#b8913f', pink: '#d98aa0', pinkLight: '#eab4bf', pinkDeep: '#b8506e', redDeep: '#7c1420',
          leaf: '#3f7a3a', leafLight: '#7fae5a', leafDark: '#244d25', edging: '#c9879f', sparkle: '#f0e6e6' } },
    },
    // The study preset: added to the outfit ideas with the other top studies; the tee fills its own slot.
    study: { name: 'Hawaii patch tee study', note: 'Reference study: a boxy Desigual long-sleeved tee in cream jersey with fine black stripes, lines of “desigualite” in cracked white blackletter down the front and a sequinned patch of woody wagons under palms and a “DSG HAWAII” sign, with an embroidered pink rose, over light blue mom jeans with the Campus trainers. The print is drawn from the photos, not copied.', recipe: { bottomId: 'tommy-ultra-high-mom-v1', shoesId: 'adidas-campus-00s-grey-v1' } },
};
