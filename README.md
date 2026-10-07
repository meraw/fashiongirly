# Fashiongirly

A fashion girl who lives in your phone: playful, experimental, and dressed in editable clothing made from geometry rather than garment photographs.

## First prototype

- A consistent adult fashion illustration with a fixed pose, face, hair, and accessories.
- Three starting looks: colour clash, sporty layering, and exaggerated proportions.
- Recipe-driven SVG garments with colour, hem, silhouette, sleeve volume, fabric treatment, pattern, and open/closed jackets and cardigans.
- A bounded description interpreter. Try **“burgundy, cropped, enormous sleeves”** on the cardigan. This is a local keyword parser, not an AI model. It reports exactly which supported changes were applied.
- Live controls, current-draft persistence, and a local lookbook (up to 30 looks).
- No garment photographs, raster images, external fonts, API keys, runtime dependencies, or network requests.

## Run

Node.js 22 or later. No installation step required.

```sh
npm run dev
```

Open http://localhost:5173. On a phone on the same network, use your computer's local IP with port 5173.

```sh
npm test
npm run build
```

Deploy `dist/` to any static host. Application URLs are relative, including under `/fashiongirly/`. For GitHub Pages, enable **Settings → Pages → Source → GitHub Actions**, then run the included **Deploy Pages** workflow. Committed code is not automatically a deployed app.

## Architecture

`src/recipes.js` defines garment data, outfits, validation, and description interpretation. `src/illustration.js` constructs vector garments and the character. Garments draw in recipe array order. `src/app.js` owns controls and persistence; `src/style.css` owns the responsive interface.

Keep recipes separate from rendering. A future AI adapter should return validated recipe patches, never arbitrary executable drawing code. Reference photos and product descriptions can later supply recipe data without becoming clothing textures.

## Scope

This is a fixed-pose vector illustration, not a rotatable 3D avatar, cloth simulation, or fitting prediction. Starting looks and styling notes are authored. Weather, AI styling, link/photo intake, arbitrary garment creation, animation, and cloud sync are not implemented.

Starting-look tabs load original recipes. Save a variation with the heart before switching. Data lives only in this browser; clearing browser data removes it.

Next: refine her visual identity; expand garment families and wearing options; add a validated AI recipe adapter; connect weather and daily styling.
