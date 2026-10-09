// Wardrobe item: Levi's red and pink colour-block half-zip anorak. Record: docs/garments/levis-colourblock-anorak.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'outerwear',
    id: 'levis-colourblock-half-zip-anorak-v1', name: "Levi's colour-block half-zip anorak", family: 'half-zip-hooded-anorak', version: 1,
    // Merging this garment's pull request is the user's approval (their rule, 9 October 2026).
    status: 'user-approved', brandAsProvided: "Levi's (the chest print and the printed drawcords)",
    source: { note: 'user supplied three product photos with no text: the front on a model (cords hanging), the back on a model with the hood down, and the front on a model over denim shorts' },
    referenceViews: ['front on model', 'back on model', 'front on model'],
    details: ['light woven windbreaker shell, pulled on over the head', 'colour-blocked: a red yoke over the shoulders, upper sleeves, collar and hood, ending in a V at the centre front and the centre back; pale pink below', 'a red half zip from the stand collar to the V', 'a small white Levi\'s print on her left chest', 'flat white drawcord tapes printed LEVI\'S in black, hanging from the hood opening', 'hood, worn down', 'dropped shoulders and full sleeves into elastic cuffs', 'an elastic drawcord hem, blousing at the waistband', 'slanted side pockets'],
    material: { construction: 'woven windbreaker shell', composition: 'not stated', finish: 'matte with a soft sheen' },
    fit: { silhouette: 'boxy and relaxed, dropped shoulders', length: 'hip, just below the waistband', sleeve: 'long and full, gathered into elastic cuffs', wear: 'a pullover: the half zip is closed in real life (the user wears outerwear closed); shown open on the doll, it is unzipped at the neck', adjustment: 'fixed authored fit for review' },
    // A closed jacket covers the top's sleeves and the skirt's bow. Shown open, only the half zip opens.
    layering: { closed: true, coversTopSleeves: true, coversWaistband: true, canOpen: true },
    styling: {
      observed: { palette: ['red', 'pale pink', 'white'], pattern: 'colour-blocked: a red yoke ending in a V at the front and back', silhouette: 'boxy hip-length pullover anorak, dropped shoulders', coverage: 'torso and arms to the wrist; neck when zipped; hood (modelled down)', material: 'light woven windbreaker shell' },
      user: { wear: 'zipped closed in real life (their rule for outerwear); shown unzipped on the doll only to see how it looks' },
      inferred: { warmth: 'light layer: an unpadded shell', weather: 'mild, breezy days; the hood suits a light shower', unknown: ['lining', 'waterproofing', 'fibre composition'] },
    },
    uncertainties: ['the chest print and the cord tapes are in plain block capitals, not the brand\'s lettering', 'the hood lies down on her back; her large head and hair hide its upper part and the collar', 'the hem drawcord\'s toggle at the back is not modelled', 'a pocket is seen on her right front only; one is built on each side'],
    authoring: { template: 'makeZipWindbreaker() in src/doll/outerwear.js (the zip-windbreaker template)', texture: 'procedural colour layout, print and tape lettering in src/doll/outerwear.js; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeZipWindbreaker() in src/doll/outerwear.js, in outfit units. The body and sleeves are the Marikoo
    // windbreaker's, which clear every top, bottom and the skirt.
    build: {
      template: 'zip-windbreaker', roughness: .78,
      colours: { shell: '#efcad7', yoke: '#951024', hood: '#951024', stitch: '#b85a66', snap: '#f4f2ee', cord: '#f4f2ee', zip: '#8e1222', opening: '#7a3a42', lining: '#efe4e5' },
      // Shown open, the half zip is undone: the fronts part above the zip's end, by `shift` at the collar.
      open: { shift: .06 },
      body: {
        rows: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .362, .28], [1.22, .362, .282], [1.16, .356, .277], [1.135, .346, .266], [1.118, .338, .258]],
        overSkirt: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .365, .282], [1.22, .374, .288], [1.16, .376, .288], [1.135, .374, .282], [1.118, .37, .276]],
        hem: 1.06, band: .06, bandRadius: [.336, .255], bandOverSkirt: [.372, .274], bandPuckers: 72,
        gathers: 34, gatherDepth: .012, gatherHeight: .09,
        collarBase: 1.89, collarTop: 1.975, collarRadius: [.13, .124],
      },
      // The colour block, placed on her short torso: the V's point at the centre front and back, its height at the sides,
      // the red carried up over the collar, and its diagonal edge on the sleeves. The print on her left chest.
      yoke: { frontCentre: 1.57, frontSide: 1.75, backCentre: 1.55, back: 1.74, collar: 2.1, sleeveOuter: -.17, sleeveInner: -.06,
        wordmark: { text: "LEVI'S", angle: .52, y: 1.735, width: .068, height: .02, colour: '#f7f5f3' } },
      sleeve: {
        rows: [[.05, .135, .126], [0, .152, .143], [-.1, .158, .15], [-.25, .156, .148], [-.38, .152, .145], [-.47, .146, .14], [-.51, .132, .127], [-.53, .121, .116]],
        cuff: [-.522, -.575], cuffRadius: [.12, .118], cuffPuckers: 36, gathers: 14, gatherDepth: .02, gatherHeight: .08,
      },
      // The half zip, from the collar down to the V.
      zip: { width: .014, stitch: .018, bottom: 1.6 },
      // Slanted pockets low on each front, without snaps.
      pockets: { x: .215, slant: .22, top: 1.4, bottom: 1.25, width: .02, snaps: [], snap: .01 },
      // Flat white tapes printed LEVI'S, hanging long from the hood opening either side of the collar.
      cords: { x: .085, top: 1.875, end: 1.46, drift: .012, radius: .005, tape: { width: .016, text: "LEVI'S", colour: '#f4f2ee', ink: '#1c1b1f' } },
      hood: { top: 1.88, bottom: 1.58, round: .07, halfWidth: .21, lift: .09, edge: .011, label: false, opening: { from: .25, rise: .05, out: .03, radius: .016 } },
    },
    // The study preset: added to the outfit ideas with the other outerwear studies.
    study: { name: "Levi's anorak study", note: "Reference study: a pale pink Levi's pullover anorak with a red yoke ending in a V at the front and back, a red half zip, a small white chest print, white drawcord tapes printed LEVI'S, the hood down, and elastic cuffs and hem, worn over the crochet top with the Tommy mom jeans. The prints are in plain block capitals, not the brand's lettering.", recipe: { topId: 'desigual-crochet-flowers-v1', bottomId: 'tommy-ultra-high-mom-v1', knit: false, shirt: false } },
};
