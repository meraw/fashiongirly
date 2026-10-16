// Mood changes ranking, never weather suitability or garment compatibility.
// `soft` in facts.js is a romantic aesthetic; it is deliberately not used for physical comfort.
export const MOODS = [
  { id: 'coccole', label: 'Ho bisogno di coccole', daring: .35, description: 'Tessuti descritti come soffici e forme rilassate. I colori possono restare vivaci; il comfort personale non si deduce da una foto.' },
  { id: 'energie', label: 'Ho poche energie', daring: .3, description: 'Meno strati da abbinare, meno abbottonature e costruzioni semplici dove sono documentate. Anche un look colorato può essere facile.' },
  { id: 'tranquilla', label: 'Mi sento tranquilla', daring: .5, description: 'Un equilibrio tra colori, proporzioni e stampe, seguendo il gusto abituale della bambola.' },
  { id: 'notare', label: 'Voglio farmi notare', daring: .9, description: 'Più colore, stampe e contrasti tra i capi visibili, mantenendo un insieme coerente.' },
  { id: 'invisibile', label: 'Voglio essere invisibile', daring: .03, description: 'Colori vicini, poco contrasto e pochi dettagli vistosi: stampe, scritte, cristalli e superfici riflettenti contano.' },
  { id: 'sorpresa', label: 'Sorprendimi', daring: .55, description: 'Spazio ai capi e agli accostamenti meno scelti di recente. Una sorpresa può essere anche discreta.' },
];
export const moodFor = id => MOODS.find(m => m.id === id) ?? null;
const words = (...parts) => parts.filter(Boolean).map(p => typeof p === 'object' ? JSON.stringify(p) : String(p)).join(' ').toLowerCase();

// These describe evidence in the catalog, not the user's tactile experience. Unknown stays null.
export function experienceFacts(g) {
  const st = g.styling || {}, personal = st.experience?.source === 'user' ? st.experience : {};
  const material = words(g.material?.construction, g.material?.finish, st.material, st.observed?.material);
  const fit = words(g.fit?.silhouette, st.silhouette, st.observed?.silhouette);
  const construction = words(g.fit, g.details, g.family, st.observed?.silhouette);
  const surface = words(st.pattern, st.observed?.pattern, g.material?.finish, g.details);
  return {
    comfortable: typeof personal.comfortable === 'boolean' ? personal.comfortable : null,
    easy: typeof personal.easy === 'boolean' ? personal.easy : null,
    softMaterial: /chenille|brushed (french terry|fleece)|sherpa|velvety pile|soft fleece|faux fur|teddy faux shearling/.test(material) ? true : null,
    relaxed: /relaxed|boxy|loose|oversized|wide leg/.test(fit) ? true : null,
    simpleEntry: /slip-on|pull-on|pullover/.test(construction) || (g.slot === 'bottom' && /elastic(?:ated)? (?:gathered )?waist|elastic at the waist/.test(construction)) ? true : null,
    frontButtons: /buttoned placket|button[- ](?:down|through|front)|buttoned front|button placket/.test(construction) ? true : null,
    conspicuous: /crystal|sequin|metallic|reflective|patent|large (logo|letter)|big (logo|letter)/.test(surface),
  };
}
const worn = o => [o.dress, o.top, o.under, o.bottom, o.shoes, o.outer].filter(Boolean);
const shorten = p => p.name;
export function scoreMood(o, mood, recent = []) {
  if (!moodFor(mood)) return { total: 0, reasons: [] };
  const pieces = worn(o), reasons = [];
  let total = 0;
  if (mood === 'coccole' || mood === 'energie') {
    const field = mood === 'coccole' ? 'comfortable' : 'easy';
    for (const p of pieces) {
      const evidence = p.experience || {}, answer = evidence[field];
      if (answer === true) {
        total += 2.5;
        reasons.push(`hai indicato ${shorten(p)} come ${field === 'comfortable' ? 'comodo' : 'facile da indossare'}`);
      } else if (answer === false) total -= 6;
      else if (mood === 'coccole' && p.slot !== 'shoes') {
        if (evidence.softMaterial) { total += 2.2; reasons.push(`il materiale descritto di ${shorten(p)} suggerisce morbidezza; il comfort su di te è ancora da confermare`); }
        if (evidence.relaxed) { total += .8; if (!evidence.softMaterial) reasons.push(`la vestibilità descritta di ${shorten(p)} è rilassata; il comfort personale non è confermato`); }
      } else if (mood === 'energie' && evidence.simpleEntry) {
        total += 1; reasons.push(`la costruzione descritta di ${shorten(p)} suggerisce un indosso semplice, ancora da confermare da te`);
      }
      if (mood === 'energie' && answer == null && evidence.frontButtons) total -= .8;
    }
    if (mood === 'energie') {
      total -= (o.under ? 1.8 : 0) + (o.outer ? .25 : 0);
      if (!o.under) reasons.push('nessun secondo top da abbinare o sistemare');
    }
    const missing = pieces.filter(p => typeof p.experience?.[field] !== 'boolean');
    if (missing.length && !reasons.some(r => /confermare/.test(r))) reasons.push(field === 'comfortable' ? 'comfort personale non confermato: mi baso sulle descrizioni dei capi' : 'facilità di indosso non confermata: ho privilegiato la semplicità della combinazione');
  }
  if (mood === 'invisibile') {
    // Judge only what is visible; a closed coat can hide the top's pattern.
    const outerHides = o.outer && !o.open && !o.carried && !['waist', 'cropped'].includes(o.outer.shape.length);
    const visible = pieces.filter(p => !(outerHides && [o.top, o.under].includes(p)));
    total -= visible.reduce((n, p) => n + p.boldness * 1.2 + (p.experience?.conspicuous ? 2.5 : 0), 0);
    const colours = visible.flatMap(p => p.main || []);
    const lights = colours.map(c => c.l);
    if (lights.length) total -= 2 * (Math.max(...lights) - Math.min(...lights));
    reasons.push('ho privilegiato poco contrasto e meno dettagli vistosi tra le combinazioni adatte al meteo');
  }
  if (mood === 'notare') reasons.push('ho cercato colore, stampe e contrasti tra i capi visibili');
  if (mood === 'tranquilla') reasons.push('un equilibrio di colori e proporzioni, senza spingere verso audacia o discrezione');
  if (mood === 'sorpresa') {
    for (const p of pieces) for (const r of recent) if (Object.values(r).includes(p.id)) total -= 1;
    reasons.push(recent.length ? 'ho dato più spazio ai capi meno scelti negli ultimi giorni' : 'una combinazione da esplorare; inizierò a variare anche in base ai look dei prossimi giorni');
  }
  return { total, reasons: [...new Set(reasons)].slice(0, 3) };
}
