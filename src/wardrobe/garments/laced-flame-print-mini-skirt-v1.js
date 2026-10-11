// Wardrobe item: laced flame print mini skirt, cut from a dress. Record: docs/garments/laced-flame-print-top-and-skirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its print atlas.
export default {
    slot: 'bottom',
    id: 'laced-flame-print-mini-skirt-v1', name: 'Laced flame print mini skirt', family: 'fitted-mini-skirt', version: 1,
    // Approved when the user merges its pull request (merging means approved: the user's rule).
    status: 'user-approved', brandAsProvided: 'not stated',
    source: { note: 'user supplied four product photos of a printed lace-up mini dress (front full length, front close, shoulder close-up, back full length) and said they will cut it into a top and a skirt a little above the printed belt; this is the skirt' },
    referenceViews: ['front full length on model', 'front close on model', 'back full length on model'],
    details: ['fitted mini skirt in a smooth stretch jersey, to the top of her thigh', 'raw cut top edge at the high hip, where the user cuts the dress just above its printed belt', 'a printed belt across the top: a band with pink laces crossing between grey eyelets all round and a big printed O-ring at her left front', 'three metal snap clips hanging from the belt on her right front, two carrying flat dark grey felt charms (a bow and a cherub badge) stitched in white', 'real pink cords laced up near the hem on her right front, tied in a bow with long ends', 'all-over print on washed black with a printed denim twill and bleached clouds: pink flame outlines and white line drawings of devils, bunnies, cherubs and a princess'],
    material: { construction: 'smooth stretch jersey', composition: 'not stated', finish: 'matte, with a printed denim look' },
    fit: { silhouette: 'fitted mini', rise: 'high hip, a raw cut edge', length: 'mini, at the top of her thigh', adjustment: 'fixed authored fit for review; the top edge is where the user plans to cut' },
    // Worn with bare legs; the built-in layered skirt is never worn over it.
    layering: { skirt: true },
    uncertainties: ['the print is taken from the product photos, so it is softer than the real fabric and keeps a little of their shading', 'the charms and a hand hide parts of the front in the photos: there the print repeats the back\'s from the opposite side', 'the charms and clips are simplified shapes; the charms\' printed drawings are not reproduced', 'the cut edge is a guess at where the user will cut, and a cut jersey edge has no waistband to hold it up'],
    styling: { silhouette: 'fitted mini skirt', palette: ['washed black', 'charcoal', 'pale pink', 'white'], pattern: 'all-over print: pink flame outlines and white cartoon line drawings on washed black with a printed denim look, with a printed lace-up belt', coverage: { legs: 'mini, bare legs', waist: 'high hip' }, material: 'stretch jersey', warmth: 1, warmthBasis: 'inferred: a short jersey skirt worn with bare legs', weather: 'warm or mild days; bare legs below it', layering: 'In the app it is worn with every top (tops that cover the waistband hang over it; tucked tops tuck into it) and under every jacket and coat; a dress replaces it. The layered skirt is never worn over it. Her legs are bare below its hem, with every pair of shoes.', unknown: ['the fibre content', 'how the cut top edge will be finished or held up (no waistband)'] },
    authoring: { template: 'makeMiniSkirt() in src/doll/mini-skirt.js (template mini-skirt, the first skirt in the bottom slot)', texture: 'laced-flame-skirt-atlas.js: the skirt unwrapped, projected from the user\'s front close and back photos with studio shading partly divided out', runtimeGeneration: false, sourcePhotosBundled: false },
    atlas: ['../wardrobe/laced-flame-skirt-atlas.js', 'LACED_FLAME_SKIRT_ATLAS'],
    study: { name: 'Laced flame skirt study', note: 'Reference study: a fitted mini skirt cut from a printed lace-up mini dress, with its printed lace-up belt, felt charms on metal clips and real pink lacing at the hem, worn with bare legs, the black Mickey tee and the pink Superstars. The print is taken from the product photos.', recipe: { topId: 'black-mickey-print-long-tee-v1', shoesId: 'adidas-superstar-pink-suede-v1' } },
    // Construction for makeMiniSkirt(), in outfit units.
    build: {
      template: 'mini-skirt',
      colours: { printTone: '#bccad4', fallback: '#2e2c33', sheen: '#55535e', metal: '#8f9298', charm: '#57565e', stitch: '#cfccd2', cord: '#eaa9c0' },
      // Fitted from the cut edge at the high hip (no wider than the jeans' hips under the tops), close over her hips, to a
      // hem at the top of her thigh.
      rows: [[1.225, .262, .172], [1.2, .268, .18], [1.15, .278, .19], [1.08, .287, .197], [1.0, .292, .198], [.94, .293, .195], [.88, .292, .19]],
      // Clips hang from the belt's lower edge (`y`) at these angles (0 = centre front, negative toward her right); the
      // charms hang below two of them.
      charms: { y: 1.148, clips: [-1.15, -.88, -.62],
        charms: [{ a: -1.12, y: 1.04, size: .046, shape: 'bow', spin: .15 }, { a: -.66, y: 1.025, size: .042, shape: 'badge', spin: -.1 }] },
      // The laced cords on her right front near the hem.
      lacing: { a: -1.0, half: .075, top: .955, bottom: .895, crosses: 3, radius: .0026, loop: .024, tails: [.1, .075] },
    },
};
