// Keeps src/wardrobe/garments/index.js: one line per garment file, each under the slot (one of 64) its id hashes to,
// sorted within the slot. Two chats adding garments then almost always edit lines far apart, so their pull requests do
// not conflict. Run `node scripts/garment-index.mjs` after adding or removing a garment file; it rewrites the index
// from the folder. tests/garment-files.test.js checks the result.
import { readdirSync, writeFileSync } from 'node:fs';

export const SLOTS = 64;
// FNV-1a over the id, so each garment's slot is fixed by its name alone.
export function slotOf(id) { let h = 0x811c9dc5; for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h % SLOTS; }
export const camel = file => file.replace(/\.js$/, '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
export const line = file => `export { default as ${camel(file)} } from './${file}';`;
export const HEADER = `// Wardrobe garments kept one per file, each the default export of \`<id>.js\` in this folder: a catalog entry as in
// ../catalog.js, which may also carry its outfit study (\`study\`) and the texture module its view loads (\`atlas\`).
// Each line sits under the slot its id hashes to (scripts/garment-index.mjs writes this file: run it after adding a
// garment), so two chats adding garments edit lines far apart and their pull requests do not conflict.`;

export function indexText(files) {
  const bySlot = Array.from({ length: SLOTS }, () => []);
  for (const f of files) bySlot[slotOf(f.replace(/\.js$/, ''))].push(f);
  return [HEADER, ...bySlot.flatMap((fs, k) => [`// slot ${String(k).padStart(2, '0')}`, ...fs.sort().map(line)])].join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = new URL('../src/wardrobe/garments/', import.meta.url);
  const files = readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'index.js');
  writeFileSync(new URL('index.js', dir), indexText(files));
  console.log(`Wrote src/wardrobe/garments/index.js with ${files.length} garments.`);
}
