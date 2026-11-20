// Builds heads-up.js: src/weather/morning.js and the modules it imports as one plain script, for the Android app's
// JavaScript sandbox (android/.../HeadsUp.java), which runs a bare script without modules, fetch or URL helpers. Each
// module becomes a function scope that returns the names other modules import from it; the script sets
// globalThis.FashiongirlyHeadsUp to morning.js's exports. Imports must be relative and named (`import { a, b as c }
// from './x.js'`); tests/heads-up.test.js runs the result in an empty context and checks it says what the modules say.
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const IMPORT = /^import\s*\{([^}]*)\}\s*from\s*['"](\.{1,2}\/[^'"]+)['"];?[ \t]*$/gm;
const ENTRY = 'src/weather/morning.js', ENTRY_EXPORTS = ['morningUrl', 'morningNotification'];

// URLSearchParams as browsers write it (application/x-www-form-urlencoded), for a sandbox without one.
const PRELUDE = `const URLSearchParams = globalThis.URLSearchParams || class {
  constructor(init = {}) { this.pairs = Object.entries(init).map(([k, v]) => [String(k), String(v)]); }
  toString() {
    const enc = s => encodeURIComponent(s).replace(/[!'()~]/g, ch => '%' + ch.charCodeAt(0).toString(16).toUpperCase()).replace(/%20/g, '+');
    return this.pairs.map(([k, v]) => enc(k) + '=' + enc(v)).join('&');
  }
};`;

export function bundleHeadsUp(root = '.') {
  const modules = new Map(), order = [];
  const visit = file => {
    if (modules.has(file)) return;
    const source = readFileSync(join(root, file), 'utf8'), imports = [];
    modules.set(file, null);
    for (const [, names, spec] of source.matchAll(IMPORT)) {
      const dep = join(dirname(file), spec);
      imports.push({ dep, names: names.split(',').map(s => s.trim()).filter(Boolean).map(s => { const [from, as = from] = s.split(/\s+as\s+/); return { from, as }; }) });
      visit(dep);
    }
    if (/^\s*import\s/m.test(source.replace(IMPORT, ''))) throw new Error(`${file}: only named relative imports can be bundled`);
    modules.set(file, { source, imports });
    order.push(file);
  };
  visit(ENTRY);
  // The names each module must hand on: what other modules import from it, and the entry's own exports.
  const wanted = new Map(order.map(f => [f, new Set(f === ENTRY ? ENTRY_EXPORTS : [])]));
  for (const f of order) for (const { dep, names } of modules.get(f).imports) for (const { from } of names) wanted.get(dep).add(from);
  const id = f => '$' + relative('src', f).replace(/[^A-Za-z0-9]/g, '_');
  const parts = order.map(f => {
    const { source, imports } = modules.get(f);
    const head = imports.map(({ dep, names }) => `const { ${names.map(n => n.from === n.as ? n.from : `${n.from}: ${n.as}`).join(', ')} } = ${id(dep)};`).join('\n');
    const body = source.replace(IMPORT, '').replace(/^export\s+(?=(async\s+)?(const|let|function|class)\b)/gm, '');
    return `// ${f}\nconst ${id(f)} = (() => {\n${head}\n${body}\nreturn { ${[...wanted.get(f)].join(', ')} };\n})();`;
  });
  return `// Built by scripts/heads-up-bundle.mjs from ${ENTRY}: the morning heads-up for the Android app. Do not edit.\n(() => {\n${PRELUDE}\n${parts.join('\n')}\nglobalThis.FashiongirlyHeadsUp = ${id(ENTRY)};\n})();\n`;
}
