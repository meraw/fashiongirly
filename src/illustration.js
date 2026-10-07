import { normalizeGarment } from './recipes.js';
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, opacity = .2) => path(d, 'none', `stroke="#352a36" stroke-width="1.4" opacity="${opacity}" stroke-linecap="round"`);
const skin = '#c58e76';
function surface(g, key) {
  const stripes = g.pattern === 'stripe' ? `<pattern id="${key}-stripe" width="13" height="13" patternUnits="userSpaceOnUse"><rect width="13" height="13" fill="${g.color}"/><path d="M3 0V13 M6 0V13" stroke="#fff9ea" stroke-opacity=".63" stroke-width="1.5"/></pattern>` : '';
  const knit = g.material === 'knit' ? `<pattern id="${key}-knit" width="9" height="11" patternUnits="userSpaceOnUse"><path d="M1 1L4.5 5L8 1M1 6L4.5 10L8 6" fill="none" stroke="#332a32" stroke-width=".6" opacity=".12"/></pattern>` : '';
  const gradient = `<linearGradient id="${key}-shade" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#fff" stop-opacity=".13"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".83" stop-color="#21182c" stop-opacity="${g.material === 'satin' ? '.23' : '.13'}"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>`;
  return { defs: stripes + knit + gradient, fill: g.pattern === 'stripe' ? `url(#${key}-stripe)` : g.color,
    shape: d => path(d, g.pattern === 'stripe' ? `url(#${key}-stripe)` : g.color) + path(d, `url(#${key}-shade)`) + (knit ? path(d, `url(#${key}-knit)`) : '') };
}
function renderTop(g, s) {
  const hem = 302 + g.length * 88, w = 47 + g.volume * 22, sleeve = 13 + g.sleeves * 26;
  const short = g.family === 'tee';
  const sleeveBottom = short ? 275 : 387;
  const arms = [-1, 1].map(side => `<g transform="translate(230 0) scale(${side} 1)">` +
    s.shape(`M40 211 Q${68 + sleeve} 209 ${75 + sleeve} 255 L${87 + sleeve * .5} ${sleeveBottom - 18} Q${92 + sleeve * .4} ${sleeveBottom + 1} 88 ${sleeveBottom + 5} L68 ${sleeveBottom + 4} Q${56 - sleeve * .15} ${sleeveBottom - 13} 57 282 L39 244Z`) +
    (short ? '' : s.shape('M67 377 Q80 381 94 376 L94 395 Q80 400 68 394Z') + line('M71 383L71 393M76 384L76 394M81 384L81 394M86 383L86 393', .22)) +
    line(`M66 257Q${61 + sleeve} 293 ${69 + sleeve * .5} ${sleeveBottom - 28}M${66 + sleeve} 283q-8 12 -4 24`) + '</g>').join('');
  const body = `M190 211 Q210 200 230 205 Q250 200 270 211 L${230 + w} ${hem - 15} Q${230 + w + 4} ${hem + 6} 230 ${hem + 4} Q${230 - w - 4} ${hem + 6} ${230 - w} ${hem - 15}Z`;
  let detail = '';
  if (g.open && ['cardigan', 'jacket'].includes(g.family)) {
    // Two separate front panels reveal the garment underneath, not a painted inset.
    const left = `M190 211L216 205Q209 235 212 270L217 ${hem + 3}Q184 ${hem + 5} ${230 - w} ${hem - 3}Z`;
    const right = `M244 205L270 211L${230 + w} ${hem - 3}Q276 ${hem + 5} 243 ${hem + 3}L248 270Q251 235 244 205Z`;
    detail = s.shape(left) + s.shape(right) + line(`M216 211Q208 250 217 ${hem}M244 211Q252 250 243 ${hem}`, .35);
  } else {
    detail = s.shape(body) + path('M210 205Q230 232 250 205', skin) + line(`M${234 - w} ${hem - 5}Q230 ${hem} ${226 + w} ${hem - 5}`);
    if (['cardigan', 'shirt'].includes(g.family)) {
      detail += line(`M230 228V${hem}`, .4);
      for (let y = 245; y < hem - 8; y += 23) detail += `<circle cx="233" cy="${y}" r="3.3" fill="#694937"/><circle cx="234" cy="${y - 1}" r=".8" fill="#e2c9a1"/>`;
    }
    if (g.family === 'knit') detail += line(`M${232 - w} ${hem - 15}Q230 ${hem - 10} ${228 + w} ${hem - 15}`, .3);
  }
  if (g.family === 'shirt') detail += s.shape('M209 201L230 216L217 241L197 217Z') + s.shape('M251 201L230 216L243 241L263 217Z') + line('M209 201L217 241L230 216L243 241L251 201', .4);
  if (g.family === 'jacket') detail += path('M181 223L191 221L175 298L163 367L155 365L167 294Z', '#efe8d3') + path('M269 221L279 223L293 294L305 365L297 367L285 298Z', '#efe8d3') + line(`M201 214L205 ${hem - 4}M259 214L255 ${hem - 4}`, .4);
  return arms + detail;
}
function renderGarment(g, s) {
  if (['tee', 'cardigan', 'knit', 'shirt', 'jacket'].includes(g.family)) return renderTop(g, s);
  if (g.family === 'tights') {
    const start = g.length < .2 ? 623 : 372;
    return (g.length < .2 ? s.shape(`M188 ${start}L221 ${start}L218 679L188 679Z`) + s.shape(`M239 ${start}L273 ${start}L274 679L240 679Z`) : s.shape('M182 370L278 370L275 421L271 679L240 679L230 433L217 679L189 679L183 421Z')) + line('M195 644L218 644M244 644L269 644', .18);
  }
  if (g.family === 'skirt') {
    const hem = 431 + g.length * 203, flare = 57 + g.volume * 44;
    let result = s.shape(`M185 330Q230 340 275 330L${230 + flare} ${hem}Q230 ${hem + 24} ${230 - flare} ${hem}Z`);
    for (let i = -4; i <= 4; i++) {
      const x = 230 + i * 9;
      result += path(`M${x} 342L${230 + i * flare / 4.6} ${hem + 8}L${233 + i * flare / 4.6} ${hem + 8}L${x + 3} 342Z`, '#251627', 'opacity=".13"');
    }
    return result + line(`M${230 - flare + 2} ${hem - 5}Q230 ${hem + 18} ${230 + flare - 2} ${hem - 5}`);
  }
  if (g.family === 'dress') {
    const hem = 425 + g.length * 220, flare = 47 + g.volume * 52;
    return path('M200 212L202 248M258 212L256 248', 'none', `stroke="${g.color}" stroke-width="7"`) + s.shape(`M200 240Q230 263 260 240L274 364Q${284 + g.volume * 10} 475 ${230 + flare} ${hem}Q230 ${hem + 21} ${230 - flare} ${hem}Q${176 - g.volume * 10} 475 186 364Z`) + line(`M202 255Q215 270 243 258M190 375Q208 431 ${203 - g.volume * 8} ${hem - 10}M267 377Q250 475 ${258 + g.volume * 8} ${hem - 8}`, .16);
  }
  if (g.family === 'trousers') {
    const hem = 635 + g.length * 44, puff = 13 + g.volume * 35;
    return s.shape(`M183 335Q230 343 277 335Q${281 + puff} 392 ${278 + puff} 465Q${280 + puff} 567 277 ${hem}L240 ${hem}L230 423L221 ${hem}L180 ${hem}Q${180 - puff} 567 ${182 - puff} 465Q${179 - puff} 392 183 335Z`) +
      line(`M184 345Q230 352 276 345M230 348L229 409M185 359Q185 390 169 397M275 359Q275 390 291 397M188 418Q175 510 189 ${hem - 9}M273 418Q285 510 265 ${hem - 9}`, .36) + `<circle cx="232" cy="353" r="3" fill="#c6ae83"/>`;
  }
  if (g.family === 'shoes') {
    const sole = 7 + g.volume * 10;
    return [-1, 1].map(side => `<g transform="translate(230 0) scale(${side} 1)">` +
      s.shape('M13 665Q26 672 40 661L48 678Q67 680 72 693Q72 704 45 704L12 701Q6 686 13 665Z') +
      path(`M10 693Q34 700 71 693L71 ${693 + sole}Q41 ${704 + sole} 11 ${699 + sole}Z`, '#302a30') +
      path('M16 666Q27 679 42 665L46 677Q29 688 13 677Z', '#b77f6c') +
      path('M14 669Q29 679 43 670L44 676Q26 686 12 677Z', g.color) + `<rect x="14" y="673" width="7" height="6" rx="1" fill="none" stroke="#d5b570" stroke-width="2"/>` + line('M48 688Q56 685 64 691', .4) + '</g>').join('');
  }
  return '';
}
export function renderCharacter(rawGarments, { id = 'girl', title = 'Fashion girl wearing a layered outfit' } = {}) {
  const prefix = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
  let defs = '', clothes = '';
  rawGarments.forEach((raw, i) => { const g = normalizeGarment(raw); const s = surface(g, `${prefix}-${i}`); defs += s.defs; clothes += `<g data-garment="${esc(g.id)}">${renderGarment(g, s)}</g>`; });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 760" role="img" aria-labelledby="${prefix}-title"><title id="${prefix}-title">${esc(title)}</title><defs>${defs}<linearGradient id="${prefix}-skin" x2="1" y2=".4"><stop stop-color="#d9aa8c"/><stop offset=".55" stop-color="#c58e76"/><stop offset="1" stop-color="#b87b68"/></linearGradient></defs>
    <ellipse cx="233" cy="725" rx="109" ry="11" fill="#44364a" opacity=".08"/>
    <g stroke-linejoin="round">
    ${path('M180 101Q178 60 217 56Q260 43 280 82Q296 124 274 187L184 185Q170 143 180 101Z', '#302a30')}
    ${path('M212 168L209 200Q181 209 183 239L185 327Q174 366 185 421L190 674L216 674L230 433L241 674L270 674L274 421Q284 366 274 327L277 239Q280 209 251 200L248 167Z', `url(#${prefix}-skin)`)}
    ${path('M211 173Q228 188 249 169L250 194Q233 204 211 188Z', '#a4695b', 'opacity=".45"')}
    ${path('M189 215Q167 216 160 256L143 385Q135 397 136 414L140 427Q144 431 147 423L148 410L151 424Q154 428 157 423L156 403L170 350L188 271Z', `url(#${prefix}-skin)`)}
    ${path('M272 215Q294 216 300 256L318 385Q326 397 325 414L321 427Q317 431 314 423L313 410L310 424Q307 428 304 423L305 403L291 350L273 271Z', `url(#${prefix}-skin)`)}
    ${clothes}
    ${path('M195 106Q191 144 206 167Q226 192 245 173Q265 161 270 126L264 91L218 78Z', `url(#${prefix}-skin)`)}
    ${path('M197 129Q182 118 185 138Q188 152 197 148M268 123Q281 115 279 133Q277 147 269 145', skin)}
    ${path('M183 115Q173 71 212 59Q252 48 277 79Q286 107 273 146L262 129L260 94Q230 115 203 108L197 153Q181 137 183 115Z', '#302a30')}
    ${path('M199 92Q224 73 258 79M190 106Q189 73 218 67M266 86Q282 112 270 139', 'none', 'stroke="#5e4140" stroke-width="3" stroke-linecap="round" opacity=".6"')}
    ${line('M206 126Q214 121 222 126M242 123Q250 119 257 122', .85)}
    ${path('M205 135Q214 130 222 135Q213 141 205 135M240 133Q249 127 257 132Q249 138 240 133', '#f7e7d7')}
    <ellipse cx="215" cy="135" rx="3" ry="3.5" fill="#342d31"/><ellipse cx="249" cy="132" rx="3" ry="3.5" fill="#342d31"/>
    ${line('M203 133L207 135Q215 130 222 135M240 133Q249 127 257 132L260 129', .9)}
    ${path('M230 134L226 151Q230 154 235 150', 'none', 'stroke="#9b6258" stroke-width="1.6" stroke-linecap="round"')}
    <ellipse cx="208" cy="148" rx="9" ry="4" fill="#be6971" opacity=".27"/><ellipse cx="253" cy="145" rx="8" ry="4" fill="#be6971" opacity=".27"/>
    ${path('M220 160Q226 156 231 158Q237 155 243 157Q230 171 220 160Z', '#924756')}${line('M224 160Q232 161 240 158', .4)}
    <ellipse cx="190" cy="151" rx="7" ry="12" fill="none" stroke="#cba659" stroke-width="3"/><ellipse cx="275" cy="147" rx="6" ry="11" fill="none" stroke="#cba659" stroke-width="3"/>
    ${path('M213 192Q230 207 248 192', 'none', 'stroke="#d5b978" stroke-width="2"')}<circle cx="232" cy="200" r="3" fill="#d5b978"/>
    <g transform="translate(258 83) rotate(-13)"><rect width="20" height="5" rx="2" fill="#d2e675"/><path d="M3 2.5H17" stroke="#728341" stroke-width=".7"/></g>
    </g></svg>`;
}
