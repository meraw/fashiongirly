# Fashiongirly: product intentions

Last updated: 8 October 2026. This records decisions from the project conversation, not a claim that every feature exists.

## The experience

“A fashion girl who lives inside my phone.” She is a tiny, cute, living doll with playful, experimental taste. She puts together daring outfits that inspire the user to try something, rather than merely producing a practical matching outfit.

The original spark was a character that checked the weather and dressed herself each morning. That remains a possible future experience. The immediate goal is to establish a lovable character, convincing clothes, a reusable wardrobe, and enjoyable local dressing. Weather and automatic daily behaviour are not required for the first version.

The user has a separate project, [meraw/outfits](https://github.com/meraw/outfits), whose 2D approach remains useful in its own right. Fashiongirly is a distinct direction. Do not merge the products by assumption.

## Character and visual direction

The user rejected a human-like vector character as resembling a textbook illustration. Of four concept directions, they chose D: a tiny tactile doll, cute and intentionally unreal, with an oversized soft head, embroidered-looking eyes with star highlights, rosy cheeks, a fuzzy dark bob, a flower clip, tiny hands, and miniature expressive clothes. A subsequent set of outfit concept images received “Perfect!”

The procedural 3D implementation is an approximation of that direction. The user called the original body “wonky and offputting” but liked the face. A revision shortened the body, brought the arms closer, replaced separate fingers with mittens, and restrained the ballooning sleeves and legs. The user said that version was better. Treat the current face and compact proportions as the working base, not proof that visual development is finished.

Preserve her identity across outfit changes. Aim for softness, believable miniature construction and personality. Avoid realistic human anatomy, mannequin styling, disconnected inflated shapes, or a slideshow of unrelated generated outfit images. Three.js is the current implementation, not a requirement to retain poor geometry at the expense of the intended result.

The approved concept images were shown in the original conversation but are not checked into this repository. This text preserves their direction; it cannot substitute for exact visual comparison. Ask the user to attach them if exact reference matching is needed. Do not depend on another chat's temporary file paths.

## Clothes must be recognisable individual garments

Garments can be similar to clothes the user owns without being exact copies. A wardrobe consisting only of generic silhouettes with colour swaps is insufficient. Individual construction and fit matter as much as palette.

Preserve distinguishing features such as:

- Silhouette, length, shoulder placement, sleeve construction, volume and taper.
- Necklines, collars, plackets, buttons, fastenings, pockets and seams.
- Knit scale, ribbing, folds, pleats, hems, cuffs, patterns and trims.
- Material character: a chunky knit should read differently from a fine cardigan or a crisp shirt.

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
5. Expand the garment vocabulary and local styling experience after that quality is established.

Assess both recognition and wearability: can the user identify the reference garment, can it be changed without losing its construction, and does it sit convincingly on the doll? Technical tests alone cannot answer these questions. User visual feedback is a core acceptance step.

Not required now: full human realism, photo-based virtual try-on, exact ownership matching, automatic reconstruction of arbitrary garments, cloth physics, a shopping marketplace, social features, accounts, subscriptions, or an API-backed chat interface.
