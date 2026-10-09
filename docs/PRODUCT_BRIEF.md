# Fashiongirly: product intentions

Last updated: 8 October 2026. This records decisions from the project conversation, not a claim that every feature exists.

## The experience

“A fashion girl who lives inside my phone.” She is a tiny, cute, living doll with playful, experimental taste. She puts together daring outfits that inspire the user to try something, rather than merely producing a practical matching outfit.

Core destination, clarified by the user on 8 October 2026: she checks the weather and dresses herself each morning in a playful, daring outfit drawn from the imported wardrobe. Weather-aware daily self-dressing is important to the intended product, not an optional stretch idea. Wardrobe import is the current phase; build the daily styling experience after the user finishes importing their wardrobe. Manual dressing and garment studies are foundations for that experience, not the final product.

She should share the user's wardrobe while developing an adventurous styling identity. Resemblance to the user need not be eliminated; choices should help the user expand their horizons. Hair is part of an outfit and should eventually be chosen with the clothing, rather than fixed independently of styling.

The user has a separate project, [meraw/outfits](https://github.com/meraw/outfits), whose 2D approach remains useful in its own right. Fashiongirly is a distinct direction. Do not merge the products by assumption.

## Character and visual direction

The user rejected a human-like vector character as resembling a textbook illustration. Of four concept directions, they chose D: a tiny tactile doll, cute and intentionally unreal, with an oversized soft head, embroidered-looking eyes with star highlights, rosy cheeks, a fuzzy dark bob, a flower clip, tiny hands, and miniature expressive clothes. A subsequent set of outfit concept images received “Perfect!”

The procedural 3D implementation is an approximation of that direction. The user called the original body “wonky and offputting” but liked the face. A revision shortened the body, brought the arms closer, replaced separate fingers with mittens, and restrained the ballooning sleeves and legs. The user said that version was better. Treat the current face and compact proportions as the working base, not proof that visual development is finished. Later the user found her shoulders far too square in the fitted tops and asked for lightly rounded shoulders: each arm now starts a little below the top of the body, and fitted sleeves curve over the shoulder instead of ending in a corner.

In shoes she stays anchored to the floor: heels and thick platforms make her taller by raising her whole body, never by shrinking her or keeping her head fixed (the user's preference, 8 October 2026). Preserve her identity across outfit changes. Aim for softness, believable miniature construction and personality. Avoid realistic human anatomy, mannequin styling, disconnected inflated shapes, or a slideshow of unrelated generated outfit images. Three.js is the current implementation, not a requirement to retain poor geometry at the expense of the intended result.

The approved concept images were shown in the original conversation but are not checked into this repository. This text preserves their direction; it cannot substitute for exact visual comparison. Ask the user to attach them if exact reference matching is needed. Do not depend on another chat's temporary file paths.

## Clothes must be recognisable individual garments

Garments can be similar to clothes the user owns without being exact copies. A wardrobe consisting only of generic silhouettes with colour swaps is insufficient. Individual construction and fit matter as much as palette.

Preserve distinguishing features such as:

- Silhouette, length, shoulder placement, sleeve construction, volume and taper.
- Necklines, collars, plackets, buttons, fastenings, pockets and seams.
- Knit scale, ribbing, folds, pleats, hems, cuffs, patterns and trims.
- Material character: a chunky knit should read differently from a fine cardigan or a crisp shirt.

Outerwear is worn intentionally (the user's decision, 8 October 2026): zipped or buttoned closed, or put away. A coat or jacket is shown open only when it looks good open or is designed to be worn open. That is how she wears them in real life. On the doll, every jacket can also be shown open, to see how it looks (the user's decision, 9 October 2026). Each starts zipped unless she usually wears it open.

Two cardigans should remain distinguishable even in the same colour if their construction differs. Fit controls must respect each garment's intended shape; increasing volume should not simply inflate every part. Evaluate clothes from the front, side and back, and together with supported layers. The first quality milestone is one reference garment fitted convincingly to this particular doll.

Full cloth simulation is not a confirmed requirement. Carefully authored geometry, controlled deformations, sculpted folds and explicit layering rules may be sufficient. The result matters more than the technique. Do not promise automatic sewing-pattern reconstruction or production-quality fit from a single picture.

## Reference pictures are an authoring input

The user must be able to supply product pictures, internet images, screenshots, links, or written descriptions to create wardrobe pieces. They do not need to be photos of the user's own clothes. This workflow does not have to be inside the app; garment creation can happen during development or in a separate authoring process.

Intended workflow:

1. Inspect the reference and identify the garment's recognisable construction and material details.
2. Adapt it to the doll's proportions, using a suitable template or a custom model where needed.
3. Review the garment on the doll, including its fit and supported layering combinations.
4. Store the reusable garment asset and structured metadata in the wardrobe catalog.
5. Let the app load and dress her in that garment without generating it again.

Reference images inform the asset. The intended display is a dressable garment, not a product-photo cutout pasted onto the character. Texture maps or procedural materials may still be legitimate parts of a garment asset. Unseen construction details need another view or an explicitly acknowledged interpretation.

The user believes reference-based reconstruction is practical from previous game-building experience and expects us to test it concretely. Do not dismiss the workflow; also do not claim fidelity before showing the result. The first actual reference is now the Desigual bronze mesh top, supplied in front and back views. After an elbow-clearance correction the user said “This is really nice” and requested a second garment; see [the garment record](garments/bronze-mesh.md). A product page link can replace attached pictures when the shop's page can be fetched; this worked for Desigual and failed for ASOS (see the handoff).

## Local first; no runtime AI API requirement

The user explicitly wants the initial app built without API calls. Do not add an AI provider, required account, API key, backend inference dependency, live weather request or cloud service by default. The built app currently bundles its rendering dependencies and uses browser storage.

Development-time assistance to author a garment is separate from the app's runtime. Finished assets should remain usable without requesting an AI service. A local JSON catalog and bundled model/material assets can serve as the initial “database”; the user has not required a database server or chosen a storage technology.

The app should eventually support local outfit creation through authored styling rules and combinations of garment attributes, alongside direct controls, saved looks and preferences. Suggestions can use colour relationships, contrasting proportions and unusual layering. The user should be able to keep a liked piece while experimenting with others. These capabilities are planned; the current curated presets are not an autonomous stylist.

If AI is added later, it should translate requests into the same validated wardrobe operations and styling choices that the local app already understands. It should be optional and should not require rebuilding the garment system.

## Building towards daily self-dressing

Agreed sequence:
1. Finish importing and visually reviewing the user's wardrobe, including supported layers and hairstyles.
2. Build a local outfit-selection system that assembles new combinations from available pieces. Account for weather suitability, compatible layers, and playful contrast; do not limit this to cycling through pre-authored presets.
3. Connect weather input and the daily dressing experience. She should present a complete outfit on the same doll, with the user able to keep liked pieces, request variations, and save looks.

The destination is agreed; the exact interaction, weather source, location handling, refresh timing and closed-app/background behaviour remain design decisions. Do not promise background operation or silently introduce location access, a weather provider, credentials, or a runtime service. The initial no-API constraint still applies to the current phase. Keep weather input separate from local styling so it can be tested using supplied conditions before a live source is selected. Optional AI later should improve the same wardrobe operations, not become a prerequisite for outfit creation.

All garment work should support this goal now:
- Keep pieces independently selectable by stable IDs, with reusable assets and explicit slot/layer compatibility; avoid baking a complete outfit into a garment or the doll.
- Record useful styling facts as pieces are imported: silhouette/proportion, palette/pattern, material, coverage, relative warmth and known weather limitations, plus layering constraints. Extend existing garment records/metadata where suitable; a new central schema is not required in each lane.
- Distinguish observed or user-provided facts from inferences and unknowns. Do not infer waterproofing or exact thermal performance from a photo, or block import because information is missing.
- Preserve known fit and clearance constraints for valid combinations, and make those constraints available beyond the visual builder.
- Keep garment identity independent of styling decisions, so future selection can change the outfit while preserving a liked piece and choose hair alongside clothes.

Importing more clothes alone does not complete the product. The later acceptance question is whether she can dress herself in a weather-appropriate, recognisably adventurous outfit that inspires the user, with a way for the user to refine it. Weather should constrain comfort and practicality without reducing her taste to safe matching.

## Text editing must be honest

The existing “Tell her what to change” input is a small keyword parser. It recognises specific colours and phrases, not arbitrary natural language or reference images. It does not call a model.

Agreed direction: label it “Quick edits” with visible examples and explicit feedback about recognised changes. The input has now been relabelled. Keep direct controls available. Do not imply that unsupported requests were understood.

Possible future AI requests include “make the sweater slouchier,” “let the shirt peek out,” “this feels too safe,” and “keep the jeans, change everything else.” These are intended experiences, not current functionality. Structured edits should be validated and reversible; undo is still future work.

## Wardrobe data direction

This is a proposed design, not the existing schema. Keep garment identity separate from outfit selection and the doll itself. A useful catalog entry would include a stable ID, name, garment family, template or custom asset reference, defining construction details, materials, allowed fit settings, doll compatibility and layering constraints. Reference provenance and notes about inferred details can support later revisions.

An outfit should reference garment IDs and per-piece settings. Support adjustable templates for common constructions and custom assets for pieces whose identity cannot be represented by an existing template. Validate loading and edits. Retain compatibility with saved looks when evolving the catalog.

The user may make the repository private later. Do not change its visibility as part of implementing the wardrobe; no visibility change has been requested.

## Priorities and acceptance

1. Preserve the cute face and compact doll proportions as the baseline.
2. Build one actual reference garment, with recognisable details and convincing fit.
3. Verify its silhouette, seams, cuffs and layer clearance across supported adjustments and viewing angles.
4. Store it as a reusable wardrobe entry, rather than baking an entire look into the character.
5. Finish the user's wardrobe import with reusable styling and layering information.
6. Build weather-aware daily self-dressing and outfit refinement on that wardrobe; this is the core product milestone after import.

Assess both recognition and wearability: can the user identify the reference garment, can it be changed without losing its construction, and does it sit convincingly on the doll? Technical tests alone cannot answer these questions. User visual feedback is a core acceptance step.

Not required now: full human realism, photo-based virtual try-on, exact ownership matching, automatic reconstruction of arbitrary garments, cloth physics, a shopping marketplace, social features, accounts, subscriptions, or an API-backed chat interface.
