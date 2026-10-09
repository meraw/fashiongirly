// Fabric swatches: a small piece of cloth in a garment's own colours, with a hint of its pattern (a scattered print,
// stripes, a check, a sparkle for embroidery or crystals), drawn in CSS from its styling facts. Used for the day's
// looks, her pieces on the Today page and the Wardrobe page.
import { GARMENTS } from '../wardrobe/catalog.js';
import { stylingFacts } from '../style/facts.js';

const hsl = (c, alpha = 1, dl = 0) => `hsl(${Math.round(c.h)} ${Math.round(c.s * 100)}% ${Math.round(Math.max(0, Math.min(1, c.l + dl)) * 100)}% / ${alpha})`;
const SHEEN = 'linear-gradient(155deg, rgb(255 255 255 / .28), rgb(255 255 255 / 0) 42%, rgb(0 0 0 / .14))';
const WEAVE = 'repeating-linear-gradient(45deg, rgb(255 255 255 / .07) 0 1px, rgb(255 255 255 / 0) 1px 4px)';

export function swatchBackground(id) {
  const f = stylingFacts(id);
  if (!f) return null;
  const cols = (f.main.length ? f.main : f.colours).filter(Boolean);
  if (!cols.length) return null;
  const [a, b = a, c = b] = cols;
  const st = GARMENTS[id]?.styling || {};
  const text = String(st.pattern ?? st.observed?.pattern ?? '').toLowerCase();
  // A print: blooms of its other colours on uneven repeats (23, 31 and 17 pixels), so they scatter like a print.
  if (f.kind === 'print') {
    return [SHEEN,
      `radial-gradient(ellipse 5px 4px at 30% 35%, ${hsl(b)} 96%, transparent) 0 0 / 23px 19px`,
      `radial-gradient(ellipse 4px 3px at 70% 70%, ${hsl(c)} 96%, transparent) 7px 4px / 31px 23px`,
      `radial-gradient(ellipse 3px 2px at 55% 20%, ${hsl(b, 1, .12)} 96%, transparent) 3px 9px / 17px 13px`,
      `radial-gradient(ellipse 2px 2px at 15% 80%, ${hsl(c, 1, -.08)} 96%, transparent) 12px 2px / 29px 17px`, hsl(a)].join(', ');
  }
  // Contrast tipping or piping: plain cloth with a fine edge in the other colour.
  if (/tipping|piping/.test(text)) {
    return [SHEEN, WEAVE, `linear-gradient(0deg, ${hsl(a)} 0 5px, ${hsl(b)} 5px 8px, transparent 8px)`, `linear-gradient(180deg, ${hsl(a, 1, .04)}, ${hsl(a, 1, -.04)})`].join(', ');
  }
  if (/check|plaid|gingham|windowpane/.test(text)) {
    return [SHEEN, WEAVE, `repeating-linear-gradient(90deg, ${hsl(b, .55)} 0 4px, transparent 4px 13px)`, `repeating-linear-gradient(0deg, ${hsl(b, .55)} 0 4px, transparent 4px 13px)`, hsl(a)].join(', ');
  }
  if (/colour-block|colour block|yoke/.test(text) && f.kind === 'geometric') {
    return [SHEEN, WEAVE, `linear-gradient(170deg, ${hsl(b)} 0 42%, ${hsl(a)} 42%)`].join(', ');
  }
  if (f.kind === 'geometric') {
    return [SHEEN, WEAVE, `repeating-linear-gradient(0deg, ${hsl(a)} 0 6px, ${hsl(b)} 6px 10px)`].join(', ');
  }
  if (f.kind === 'detail') {
    return [SHEEN, `radial-gradient(circle, ${hsl(b, .9, .2)} 0 1.2px, transparent 1.8px) 0 0 / 9px 9px`, WEAVE, hsl(a)].join(', ');
  }
  return [SHEEN, WEAVE, `linear-gradient(180deg, ${hsl(a, 1, .05)}, ${hsl(a, 1, -.04)})`].join(', ');
}

// A swatch element for one garment.
export function swatch(doc, id, className = 'swatch') {
  const s = doc.createElement('span');
  s.className = className; s.setAttribute('aria-hidden', 'true');
  const bg = swatchBackground(id);
  if (bg) s.style.background = bg;
  return s;
}

// A look as a strip of its pieces' cloth, wider for the pieces that show more of her.
const SHARE = { outerwear: 3, dress: 4, top: 3, bottom: 2.4, shoes: 1.2 };
export function outfitSwatch(doc, pieces) {
  const strip = doc.createElement('span');
  strip.className = 'outfit-swatch'; strip.setAttribute('aria-hidden', 'true');
  for (const p of pieces || []) {
    if (!SHARE[p.slot]) continue;
    const s = swatch(doc, p.id, 'outfit-swatch-piece');
    s.style.flexGrow = String(SHARE[p.slot]);
    strip.append(s);
  }
  return strip;
}
