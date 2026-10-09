import test from 'node:test';
import assert from 'node:assert/strict';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { OUTFITS } from '../src/doll/recipe.js';
const ID='only-onlerin-dark-silver-jacket-v1';
const named=(root,name)=>{const found=[];root.traverse(o=>{if(o.name===name)found.push(o);});return found;};

test('ONLY Onlerin jacket: crumpled metallic silver shell, black-lined hood with black cords, zip, elastic hem and cuffs, no visible pockets',()=>{
  assert.equal(GARMENTS[ID].slot,'outerwear');assert.ok(OUTFITS.some(o=>o.recipe.outerwearId===ID),'has a study');
  const outfit=makeOutfit({outerwearId:ID}),jacket=outfit.getObjectByName('outerwear');
  for(const [name,count] of [['jacket-body',1],['hood',1],['coil-zip',1],['elastic-hem-band',1],['jacket-sleeve',2],['elastic-cuff',2],['drawcord',2]])assert.equal(named(jacket,name).length,count,name);
  for(const name of ['pocket-welt','pocket-flap','sleeve-badge','hood-label','back-label'])assert.equal(named(jacket,name).length,0,`no ${name}`);
  // The shell: partly metal and fairly shiny, crumpled by a normal map; the hood's lining stays plain black cloth.
  const shell=named(jacket,'jacket-body')[0].material;
  assert.ok(shell.metalness>.4&&shell.roughness<.45&&shell.normalMap,'metallic crumpled shell');
  const lining=named(jacket,'hood-lining-edge')[0].material;
  assert.ok(lining.metalness===0&&!lining.normalMap&&lining.color.getHex()<0x303030,'plain black lining');
  disposeObject(outfit);
  // Open, it shows a black lining inside.
  const open=makeOutfit({outerwearId:ID,outerwearOpen:true});assert.equal(open.getObjectByName('outerwear').userData.open,true);disposeObject(open);
});
