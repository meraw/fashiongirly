// Top templates by name (a catalog entry's `build.template`): each builds the top from its id, its build spec and the
// outfit's options ({ skirt, atlas }). makeOutfit() looks a template up here, so a new template adds its module and one
// line in each list below, both kept in alphabetical order: two chats adding templates edit different lines.
import { makeEmbroideredSweatshirt } from './embroidered-sweatshirt.js';
import { makeLinenShirt } from './shirts.js';
import { makeMeshPrintTee } from './mesh-print-tee.js';
import { makeSnapCollarJumper } from './snap-collar-jumper.js';

export const TOP_TEMPLATES = {
  'embroidered-sweatshirt': (id, build, { skirt }) => makeEmbroideredSweatshirt(id, build, skirt),
  'linen-shirt': (id, build, { skirt }) => makeLinenShirt(id, build, skirt),
  'mesh-print-tee': (id, build, { atlas }) => makeMeshPrintTee(id, build, atlas),
  'snap-collar-jumper': (id, build, { skirt }) => makeSnapCollarJumper(id, build, skirt),
};
