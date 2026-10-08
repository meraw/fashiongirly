// Authored wardrobe entries. These describe assets, not runtime AI requests.
export const BRONZE_TOP_ID = 'desigual-bronze-mesh-v1';
export const LILAC_TOP_ID = 'lilac-portrait-mockneck-v1';
export const GARMENTS = Object.freeze({
  [BRONZE_TOP_ID]: {
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
    uncertainties: ['exact sleeve characters are not transcribed', 'generated artwork is interpretive', 'same front-facing motif is reused on back', 'side seam alignment and physical transparency need visual review'],
    authoring: { texture: 'bronze-atlas.js', runtimeGeneration: false, sourcePhotosBundled: false },
  },
  [LILAC_TOP_ID]: {
    id: LILAC_TOP_ID, name: 'Lilac portrait mock neck', family: 'fitted-long-sleeve-top', version: 1,
    status: 'reference-study-awaiting-visual-review', brandAsProvided: null,
    referenceViews: ['front','back'],
    details: ['mauve portrait and flowers on front', 'plain pale silvery-lilac back', 'navy sleeves with alternating circle and dot bands', 'short raised ribbed neck', 'long sleeves with wrist gathering', 'longer close-fitting torso'],
    material: { construction: 'textured fabric; exact fibre unconfirmed', finish: 'subtle metallic back sheen' },
    fit: { silhouette: 'close to doll body', sleeve: 'tapered with cuff gathers', hem: 'lower hip', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['portrait and floral artwork are interpretive', 'physical material and brand are not established from pictures', 'exact seam placement and print scale need visual review'],
    authoring: { texture: 'lilac-atlas.js', runtimeGeneration: false, sourcePhotosBundled: false },
  },
});
