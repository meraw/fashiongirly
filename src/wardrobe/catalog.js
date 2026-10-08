// Authored wardrobe entries. These describe assets, not runtime AI requests.
export const BRONZE_TOP_ID = 'desigual-bronze-mesh-v1';
export const GARMENTS = Object.freeze({
  [BRONZE_TOP_ID]: {
    id: BRONZE_TOP_ID,
    name: 'Bronze Buddha mesh',
    family: 'fitted-long-sleeve-top',
    version: 1,
    status: 'reference-study-awaiting-visual-review',
    brandAsProvided: 'Desigual',
    referenceViews: ['front', 'back'],
    details: ['bronze glitter and opaque black horizontal stripes', 'front-facing Buddha on both torso panels', 'neon green outlined sleeve graphics', 'soft white airbrushed patches', 'black bound crew neck', 'long fitted sleeves'],
    material: { construction: 'fine stretch mesh', finish: 'metallic flecks', opaqueBands: 'black' },
    fit: { silhouette: 'close to doll body', sleeve: 'tapered', hem: 'hip', adjustment: 'fixed authored fit for first review' },
    exclusions: ['striped-shirt', 'knit-sweater'],
    uncertainties: ['exact sleeve characters are not transcribed', 'generated artwork is interpretive', 'same front-facing motif is reused on back', 'side seam alignment and physical transparency need visual review'],
    authoring: { texture: 'bronze-atlas.js', runtimeGeneration: false, sourcePhotosBundled: false },
  },
});
