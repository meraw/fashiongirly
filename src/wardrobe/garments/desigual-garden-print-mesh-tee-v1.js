// Wardrobe item: Desigual garden print mesh tee. Record: docs/garments/desigual-garden-print-mesh-tee.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its print atlas.
export default {
    slot: 'top',
    id: 'desigual-garden-print-mesh-tee-v1', name: 'Desigual garden print mesh tee', family: 'printed-mesh-long-sleeve-tee', version: 1,
    status: 'reference-study-awaiting-visual-review', brandAsProvided: 'not stated; read as Desigual from the photos (its style and the product photography)',
    source: { note: 'user supplied five product photos without a description: the front on a model (hands on hips), seated, a close-up of the front, the back, and a close-up of the back yoke' },
    referenceViews: ['front on model', 'front, seated', 'front close-up', 'back on model', 'back yoke close-up'],
    details: ['fitted long-sleeved crew-neck tee in a fine printed stretch mesh', 'body printed as a Persian-miniature garden: a sky-blue yoke with blossoming trees over a dark hill and a white-turbaned figure, then a brown ground overlaid with a silvery flocked damask of leaves and flowers, with robed figures (green and orange at the front, a multicoloured patchwork robe at the back)', 'small printed speech-bubble patches with English text: “Only from the heart you can touch the sky”, “Do you have any plans for tonight?”, “Love dancing”, and on the back “My … you are the universe in motion”', 'a yoke seam across the chest and the upper back, an exposed pale grey-blue overlock, slightly wavy', 'dark charcoal crew neckband', 'long fitted sleeves in an open net printed as a knit: a dark teal and green zigzag knit at the shoulders, shading into yellow and lime green down the arm', 'olive-gold metallic lamé cuffs at the wrist', 'hem at the high hip, slightly ruched'],
    material: { construction: 'fine stretch mesh (tulle) for the body, an open net for the sleeves, metallic lamé cuffs', composition: 'not stated', finish: 'soft sheen; the flocked damask is velvety, the cuffs metallic' },
    fit: { silhouette: 'fitted, close to the body', sleeve: 'long fitted sleeves to the wrist', hem: 'high hip, at the waistband', neckline: 'crew', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the print is taken from the product photos, so it is softer than the real fabric and keeps a little of their shading and the mesh\'s folds', 'her torso is much wider for its height than the model\'s: the front is close to its true proportions, the back is squeezed in height by about a third', 'the sides of the body are hidden under the arms in the photos and are filled with the print beside them', 'her left sleeve\'s front is not shown clearly in any photo, so it repeats its back, mirrored', 'the mesh is opaque here; the real mesh is slightly sheer'],
    styling: { silhouette: 'fitted, high-hip length', palette: ['sky blue', 'taupe brown', 'silver grey', 'lime green', 'yellow', 'teal', 'olive gold'], pattern: 'photographic Persian-miniature garden print with flocked damask, and knit-print sleeves', coverage: { neck: 'crew', sleeves: 'long', midriff: 'covered' }, material: 'fine stretch mesh', warmth: 1, warmthBasis: 'inferred: a thin, slightly open mesh, though long-sleeved', weather: 'mild days, or as a layer under a jacket' },
    authoring: { template: 'makeMeshPrintTee() in src/doll/mesh-print-tee.js', texture: 'garden-mesh-tee-atlas.js: the body unwrapped and the sleeves, projected from the user\'s front, front close-up and back photos with studio shading partly divided out', runtimeGeneration: false, sourcePhotosBundled: false },
    atlas: ['../wardrobe/garden-mesh-tee-atlas.js', 'GARDEN_MESH_TEE_ATLAS'],
    study: { name: 'Garden mesh tee study', note: 'Reference study: a fitted Desigual mesh tee printed as a Persian-miniature garden, with a sky-blue yoke, flocked damask, knit-print sleeves in teal, yellow and lime, and gold lamé cuffs, worn with black wide-leg jeans. The print is taken from the product photos.', recipe: { bottomId: 'topshop-washed-black-wide-crop-v1' } },
    // Construction for makeMeshPrintTee(), in outfit units: the Mickey tee's fitted body and sleeve rows, which clear every
    // waistband and her hands.
    build: {
      template: 'mesh-print-tee',
      // The share of the atlas's height that holds the body (its top 640 rows of 1024).
      atlas: { body: .625 },
      colours: { printTone: '#aaabaf', fallback: '#8c8580', sheen: '#dfe6ea', neckband: '#4a484b', overlock: '#bcc4cb', cuff: '#9a9038' },
      body: { neck: 1.91, hem: 1.18,
        rows: [[1.91, .109, .099], [1.875, .17, .122], [1.83, .228, .152], [1.775, .265, .175], [1.65, .279, .183], [1.49, .277, .187], [1.34, .284, .196], [1.25, .29, .206], [1.18, .292, .213]],
        neckband: [[1.93, .109, .1], [1.9, .115, .106]],
        // The yoke seams' heights (front and back, where the atlas puts the photographed seams), how far round from the
        // centre they run, and their wave.
        yoke: { front: 1.727, back: 1.642, across: 1.15, wave: .0025, waves: 14 } },
      sleeve: { rows: [[.025, .098, .1], [-.04, .112, .108], [-.16, .107, .101], [-.28, .104, .099], [-.4, .096, .091], [-.49, .078, .08], [-.525, .077, .079]],
        cuff: [[-.474, .086, .087], [-.5, .085, .086], [-.532, .083, .084]] },
    },
};
