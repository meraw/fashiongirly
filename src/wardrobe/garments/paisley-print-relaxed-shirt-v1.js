// Wardrobe item: paisley print relaxed shirt. Record: docs/garments/paisley-relaxed-shirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its print atlas. Its construction is a style in src/doll/shirts.js (the button-down shirt template).
export default {
    slot: 'top',
    id: 'paisley-print-relaxed-shirt-v1', name: 'Paisley print relaxed shirt', family: 'relaxed-printed-button-down-shirt', version: 1,
    status: 'user-approved', brandAsProvided: 'not stated',
    source: { note: 'user supplied four product photos without a description: front on a model (half-length), full length, back on a model and a front close-up' },
    referenceViews: ['front on model', 'full length on model', 'back on model', 'front close-up'],
    details: ['relaxed long-sleeved button-down in a soft, fluid fabric with a slight sheen', 'warm white ground printed all over with large paisleys in concentric bands (ochre-yellow, peach, cornflower blue, lilac-pink, sage), outlined in near-black and ringed with coloured dots', 'feathery leaf sprays in blue and sage, and curling tendrils between the paisleys', 'point collar on a stand, worn with the top button open', 'white buttons down the front', 'fuller sleeves gathered into buttoned cuffs', 'back yoke with a centre pleat', 'curved shirttail hem'],
    material: { construction: 'woven, fluid (read from the drape and close-up: like a viscose crepe)', composition: 'not stated', finish: 'soft, with a slight sheen' },
    fit: { silhouette: 'relaxed, straight', sleeve: 'long, a little full, into buttoned cuffs', hem: 'straight, at the high hip, below the waistband', neckline: 'point collar, top button open', adjustment: 'worn untucked; the model wears the front tucked into high-rise jeans, which the doll cannot do' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the print is taken from the product photos: the front from the front photo, compressed a little lengthwise to fit her short torso, the back from the back photo, the sleeves from patches of the back; it shows some of the photos\' drape shading and the photographed placket', 'the fabric composition is not stated', 'worn untucked; the photos show the front tucked into jeans', 'the hem is straight; the real one is a curved shirttail (a hem that rises at the sides would leave her waistband showing there)'],
    styling: { silhouette: 'relaxed shirt, high-hip length', palette: ['white', 'ochre yellow', 'cornflower blue', 'lilac pink', 'peach', 'sage'], pattern: 'large all-over paisley print', coverage: { neck: 'point collar, top button open', sleeves: 'long', midriff: 'covered' }, material: 'fluid woven, like viscose crepe (inferred)', warmth: 1, warmthBasis: 'inferred: a light, fluid woven shirt', weather: 'mild or warm days, or under a jacket; a light fabric that shows rain marks (inferred)', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband and hides the skirt\'s bow. Worn untucked: the model in the photos tucks the front into high-rise jeans, which the doll cannot do.', unknown: ['fibre composition'] },
    authoring: { template: 'makeButtonShirt() in src/doll/shirts.js, with its own body and sleeve rows (`rows`, `sleeve`), buttoned cuffs and a back yoke (`backYoke`) with a centre pleat (`backPleat`)', texture: 'print atlas processed from the user\'s front and back product photos (src/wardrobe/paisley-shirt-atlas.js, 1536 x 768 WebP), with the template\'s crepe bump; toned to the photos\' colours', runtimeGeneration: false, sourcePhotosBundled: false },
    // The print atlas the 3D view loads for it, made from the product photos.
    atlas: ['../wardrobe/paisley-shirt-atlas.js', 'PAISLEY_SHIRT_ATLAS'],
    // The study preset: added to the outfit ideas with the other top studies; the shirt fills its own slot.
    study: { name: 'Paisley shirt study', note: 'Reference study: a relaxed white shirt in a fine-line paisley (ochre, cornflower blue, sage and lilac), printed from the product photos, worn loose with the top button open over the Tommy mom jeans.', recipe: { bottomId: 'tommy-ultra-high-mom-v1' } },
};
