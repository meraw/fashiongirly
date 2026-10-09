import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { OUTFITS } from '../src/doll/recipe.js';
import { startStudio } from '../src/doll/app.js';
import { TOP_TEMPLATES } from '../src/doll/top-templates.js';
import * as FILED from '../src/wardrobe/garments/index.js';
import { indexText } from '../scripts/garment-index.mjs';

// Garments kept one per file (src/wardrobe/garments), so that adding one touches no line another chat is editing.
const SLOTS={top:'top-select',bottom:'bottom-select',shoes:'shoes-select',outerwear:'outerwear-select',dress:'dress-select'};

test('garment files: each listed once under its slot in the index, named after its id, and joined to the catalog',()=>{
  const dir='src/wardrobe/garments',files=readdirSync(dir).filter(f=>f.endsWith('.js')&&f!=='index.js').sort();
  // The index is exactly what scripts/garment-index.mjs writes: one line per file, named after it, under its slot.
  assert.equal(readFileSync(dir+'/index.js','utf8'),indexText(files),'run node scripts/garment-index.mjs to rewrite src/wardrobe/garments/index.js');
  const builtIn=readFileSync('src/wardrobe/catalog.js','utf8');
  for(const g of Object.values(FILED)){
    assert.ok(files.includes(g.id+'.js'),`${g.id}: file named after its id`);
    assert.ok(SLOTS[g.slot],`${g.id}: a known slot`);assert.equal(GARMENTS[g.id],g,`${g.id}: in the catalog`);
    // Not also an entry in catalog.js (its id constant may still be exported there for older code).
    const names=[...builtIn.matchAll(new RegExp(`export const (\\w+) = '${g.id}'`,'g'))].map(m=>m[1]);
    assert.ok(!builtIn.includes(`'${g.id}': {`)&&names.every(n=>!builtIn.includes(`[${n}]: {`)),`${g.id}: not also a built-in entry`);
    if(g.study)assert.equal(OUTFITS.filter(o=>o.name===g.study.name).length,1,`${g.id}: one study preset`);
  }
  // Study names stay unique across all the presets.
  assert.equal(new Set(OUTFITS.map(o=>o.name)).size,OUTFITS.length);
  // The template registry's lines are in alphabetical order too.
  const reg=readFileSync('src/doll/top-templates.js','utf8').split('\n'),imports=reg.filter(l=>l.startsWith('import {')),entries=reg.filter(l=>/^  '[^']+':/.test(l));
  assert.deepEqual(imports,[...imports].sort());assert.deepEqual(entries,[...entries].sort());assert.equal(entries.length,Object.keys(TOP_TEMPLATES).length);
});

test('every catalog garment has an option in its selector, once, whether it is listed in index.html or added by the app',async()=>{
  const dom=new JSDOM(readFileSync('index.html','utf8'),{url:'https://example.com/'}),d=dom.window.document;
  const app=await startStudio(d,async()=>({update(){},turn(){},dispose(){}}));
  for(const g of Object.values(GARMENTS)){const values=[...d.getElementById(SLOTS[g.slot]).options].map(o=>o.value);
    assert.equal(values.filter(v=>v===g.id).length,1,`${g.id} in ${SLOTS[g.slot]}`);}
  const under=[...d.getElementById('under-select').options].map(o=>o.value);
  for(const g of Object.values(GARMENTS).filter(g=>g.layering?.underTop))assert.equal(under.filter(v=>v===g.id).length,1,`${g.id} under a top`);
  app.dispose();dom.window.close();
});
