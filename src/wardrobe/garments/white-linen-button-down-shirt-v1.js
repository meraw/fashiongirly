// Wardrobe item: White linen button-down shirt. Record: docs/garments/linen-button-down-shirts.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'white-linen-button-down-shirt-v1', name: 'White linen button-down shirt', family: 'relaxed-button-down-shirt', version: 1, label: 'White linen button-down shirt · study',
    status: 'authored-awaiting-user-review', brandAsProvided: 'none given',
    source: { note: 'the user asked for two linen button-down shirts, one white and one lapis blue, without photos or further description; built as a classic relaxed linen shirt' },
    referenceViews: [],
    details: ['white linen in a slubby plain weave, softly creased', 'relaxed, hip length with a curved shirt tail', 'point collar on a stand, topstitched', 'eight pearly white buttons from the collar stand to the hem; worn buttoned to the top', 'patch chest pocket on her left', 'back yoke', 'long sleeves with buttoned cuffs', 'tonal stitching'],
    material: { construction: 'plain-weave linen', composition: 'linen, as the user described it', finish: 'matte, slubby, softly creased' },
    fit: { silhouette: 'relaxed', sleeve: 'long and relaxed, with buttoned cuffs at the wrist', hem: 'hip length, curved shirt tail', neckline: 'point collar, buttoned to the top', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Hangs over every waistband; over the skirt it is tucked in, so the skirt's bow shows.
    layering: { coversWaistband: true, tucksIntoSkirt: true },
    uncertainties: ['no photos: the cut, collar, pocket, buttons and exact shade are a classic linen shirt chosen for the description, not read from the user\'s shirt', 'the linen and its slubs are woven in code; the creases are a soft, fixed pattern'],
    styling: { silhouette: 'relaxed, hip length with a curved hem', palette: ['white'], pattern: 'plain, with linen slubs', coverage: { neck: 'point collar, buttoned to the top', sleeves: 'long, cuffed', midriff: 'covered' }, material: 'linen', warmth: 1, warmthBasis: 'inferred: a light, breathable linen shirt, long-sleeved', weather: 'warm to mild days' },
    authoring: { template: 'makeLinenShirt() in src/doll/shirts.js (the linen-shirt template, on the button-down shirt template)', texture: 'procedural linenWeave() in src/doll/shirts.js, woven locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
    // The linen's colour (calibrated to render a clean white, barely warm), its slubs a touch greyer (`lift`), the weave's seed,
    // the tonal stitching, pearly white buttons [colour, roughness] and the sheen.
    build: { template: 'linen-shirt', colour: '#e4e1da', lift: -.18, seed: 5, stitch: '#dcd8d0', button: ['#f4f1ea', .22], sheen: '#ffffff' },
    // The study preset: added to the outfit ideas with the other top studies; the shirt fills its own slot.
    study: { name: 'White linen shirt study', note: 'A relaxed white linen button-down made to the user\'s description (no photos): buttoned to the top, with a chest pocket, a back yoke, buttoned cuffs and a curved shirt tail. The slubby linen and its soft creases are drawn in code.', recipe: { bottomId: 'pleated-linen-wide-trousers-v1', shoesId: 'dr-martens-cow-slide-v1' } },
};
