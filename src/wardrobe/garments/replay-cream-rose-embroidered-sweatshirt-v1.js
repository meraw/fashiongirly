// Wardrobe item: Replay cream rose embroidered sweatshirt. Record: docs/garments/replay-rose-sweatshirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'replay-cream-rose-embroidered-sweatshirt-v1', name: 'Replay cream rose embroidered sweatshirt', family: 'crew-neck-sweatshirt', version: 1,
    status: 'user-approved', brandAsProvided: 'Replay (the script on the sleeve)',
    source: { note: 'user supplied three photos: the front on a model (cropped, with black jeans), the front on another model (with light jeans), and a crumpled photo of the front on a hanger, sent to show the details in front' },
    referenceViews: ['front on model, cropped', 'front on model', 'front on a hanger, crumpled'],
    details: ['cream cotton fleece, boxy and cropped', 'a spray of embroidered red roses across the chest: a large rose in the middle, a smaller one to her right lower down and one to her left higher up, with buds, stems and many green leaves', 'ribbed crew neckband with a stitched V insert below it', 'dropped shoulders, the seam low on her upper arm', 'very full long sleeves into long rib cuffs', 'a deep rib hem band, dipping lower at the back', 'a small navy embroidered script on her left sleeve above the cuff'],
    material: { construction: 'cotton fleece (sweatshirt jersey), rib trims, satin-stitch embroidery', composition: 'not stated', finish: 'matte' },
    fit: { silhouette: 'boxy and cropped', sleeve: 'long, very full, dropped shoulders, long rib cuffs', hem: 'at the waistband, deep rib band, lower at the back', neckline: 'crew with a V insert', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the embroidery is redrawn in code: the roses, leaves and buds are placed as in the photos but simplified, and squeezed a little in height to fit her shorter torso', 'the script is a generic joined hand, not the brand\'s lettering', 'how long it is on the user (the two models show different lengths); built cropped, as on the first photo and the hanger'],
    styling: { silhouette: 'boxy, cropped at the waistband', palette: ['cream', 'red', 'green'], pattern: 'plain, with an embroidered rose spray across the chest', coverage: { neck: 'crew', sleeves: 'long', midriff: 'covered' }, material: 'cotton fleece', warmth: 3, warmthBasis: 'inferred: a fleece sweatshirt with long sleeves and deep rib cuffs and hem', weather: 'cool days; on its own or under a light jacket', mood: 'casual, romantic', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband and hides the skirt\'s bow.', unknown: ['fibre composition'] },
    authoring: { template: 'makeEmbroideredSweatshirt() in src/doll/embroidered-sweatshirt.js', texture: 'procedural, in src/doll/embroidered-sweatshirt.js: cream fleece, the V insert and the rose embroidery drawn in code; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeEmbroideredSweatshirt(), in outfit units. A boxy body from dropped shoulders, straight into a
    // deep rib band that clears every bottom and sits out over the skirt.
    build: {
      template: 'embroidered-sweatshirt',
      colours: { fleece: '#e9d7b8', sheen: '#f3e6cc', stitch: '#d6cdbd', script: '#2a3256' },
      body: { neck: 1.885, hem: 1.15, band: .085, backDrop: .045, dipFrom: 1.45, ribs: 72, neckRibs: 52, seed: 11,
        rows: [[1.885, .114, .108], [1.85, .205, .152], [1.81, .278, .192], [1.76, .315, .214], [1.6, .322, .22], [1.4, .318, .224]],
        bandRadius: [.316, .232], bandOverSkirt: [.342, .254],
        neckband: [[1.93, .112, .106], [1.905, .115, .108], [1.88, .121, .113]],
        // The V insert under the neckband: where it starts, how deep it reaches and how wide it is at the top.
        vee: { top: 1.878, depth: .075, width: .085 } },
      sleeve: { cuffRibs: 36, seam: -.07,
        rows: [[.03, .13, .125], [-.06, .148, .142], [-.2, .152, .146], [-.33, .148, .142], [-.43, .136, .131], [-.48, .116, .112], [-.5, .106, .102]],
        cuff: [[-.49, .104, .1], [-.53, .099, .096], [-.585, .098, .095]] },
      // The script: which sleeve (her left, +1), its height on the sleeve, the angle round it (from the front, toward the
      // outside) and its size.
      script: { side: 1, y: -.44, angle: .55, width: .06, height: .025 },
      // The embroidery. Its width is in world units and its top in outfit units; everything else is in embroidery widths
      // (x across as seen from the front, y down from its top). Roses are [x, y, radius, turn]; buds and leaves
      // [x, y of the base, length, direction, side]; stems are paths.
      embroidery: { width: .46, top: 1.785, height: .7, margin: .03, shift: .005, stitch: .0042, stemWidth: .008,
        roses: [[.55, .37, .2, .3], [.12, .48, .125, 1.2], [.87, .17, .115, 2.1]],
        buds: [[.76, .1, .08, -1.75], [.93, .07, .075, -1.45], [.04, .31, .075, -1.9], [.2, .29, .07, -1.3], [.8, .43, .06, -.6]],
        leaves: [[.53, .19, .17, -1.65, 1], [.43, .27, .16, -2.5, -1], [.65, .23, .15, -.7, 1], [.72, .38, .16, .15, 1], [.66, .5, .17, .9, -1], [.55, .54, .17, 1.55, 1], [.43, .5, .17, 2.3, -1],
          [.38, .57, .15, 2, 1], [.36, .37, .14, 3, 1], [.21, .55, .13, .9, -1], [.11, .6, .13, 2, 1], [.81, .28, .12, 2.4, 1], [.94, .3, .12, 1, -1], [.49, .62, .14, 1.9, -1],
          [.6, .16, .13, -1.2, -1], [.29, .42, .13, 2.6, 1], [.76, .33, .12, -.3, -1], [.24, .6, .12, 1.3, 1]],
        stems: [[[.55, .45], [.52, .57], [.47, .68]], [[.48, .43], [.33, .46], [.18, .48]], [[.16, .43], [.09, .36], [.05, .31]], [[.16, .42], [.2, .34], [.2, .29]],
          [[.62, .3], [.73, .24], [.84, .2]], [[.85, .12], [.8, .1], [.76, .1]], [[.88, .11], [.91, .08], [.93, .07]], [[.68, .43], [.75, .44], [.8, .43]]],
        inks: { rose: '#8c0420', roseDark: '#4e020c', roseBright: '#a90c28', roseLight: '#cd3c46', leaf: '#2e4c08', leafDark: '#1a3006', leafLight: '#4f7016', vein: '#7e9a3c' } },
    },
    // The study preset: added to the outfit ideas with the other top studies; the sweatshirt fills its own slot.
    study: { name: 'Rose sweatshirt study', note: 'Reference study: a boxy, cropped cream Replay sweatshirt with a spray of embroidered red roses, buds and leaves across the chest, a V insert under the rib neckband, full sleeves from dropped shoulders into long rib cuffs, a deep rib hem lower at the back and a small script on the left sleeve, worn with black jeans. The embroidery is drawn in code, not copied.', recipe: { bottomId: 'mango-washed-black-v1' } },
};
