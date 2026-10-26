// Top templates by name (a catalog entry's `build.template`): each builds the top from its id, its build spec and the
// outfit's options ({ skirt, atlas }). makeOutfit() looks a template up here, so a new template adds its module and one
// line in each list below, both kept in alphabetical order: two chats adding templates edit different lines.
import { makeCheckShirt } from './shirts.js';
import { makeDitsyPrintShirt } from './ditsy-print-shirt.js';
import { makeEmbroideredSweatshirt } from './embroidered-sweatshirt.js';
import { makeLacedPrintTop } from './laced-print-top.js';
import { makeLinenShirt } from './shirts.js';
import { makeMeshPrintTee } from './mesh-print-tee.js';
import { makeRacingHoodie } from './racing-hoodie.js';
import { makeSatinShirt } from './satin-shirt.js';
import { makeSnapCollarJumper } from './snap-collar-jumper.js';
import { makeVelourHoodie } from './velour-hoodie.js';
import { makeWildflowerShirt } from './wildflower-shirt.js';
import { makeYokeBlouse } from './yoke-blouse.js';

export const TOP_TEMPLATES = {
  'check-shirt': (id, build, { skirt }) => makeCheckShirt(id, build, skirt),
  'ditsy-print-shirt': (id, build, { skirt }) => makeDitsyPrintShirt(id, build, skirt),
  'embroidered-sweatshirt': (id, build, { skirt }) => makeEmbroideredSweatshirt(id, build, skirt),
  'laced-print-top': (id, build, { atlas }) => makeLacedPrintTop(id, build, atlas),
  'linen-shirt': (id, build, { skirt }) => makeLinenShirt(id, build, skirt),
  'mesh-print-tee': (id, build, { atlas }) => makeMeshPrintTee(id, build, atlas),
  'racing-hoodie': (id, build) => makeRacingHoodie(id, build),
  'satin-shirt': (id, build, { skirt }) => makeSatinShirt(id, build, skirt),
  'snap-collar-jumper': (id, build, { skirt }) => makeSnapCollarJumper(id, build, skirt),
  'velour-hoodie': (id, build, { skirt }) => makeVelourHoodie(id, build, skirt),
  'wildflower-shirt': (id, build, { skirt }) => makeWildflowerShirt(id, build, skirt),
  'yoke-blouse': (id, build, { skirt }) => makeYokeBlouse(id, build, skirt),
};
