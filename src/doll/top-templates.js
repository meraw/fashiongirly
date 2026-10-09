// Top templates by name (a catalog entry's `build.template`): each builds the top from its id, its build spec and the
// outfit's options ({ skirt, atlas }). makeOutfit() looks a template up here, so a new template adds its module and one
// line in each list below, both kept in alphabetical order: two chats adding templates edit different lines.
import { makeSnapCollarJumper } from './snap-collar-jumper.js';

export const TOP_TEMPLATES = {
  'snap-collar-jumper': (id, build, { skirt }) => makeSnapCollarJumper(id, build, skirt),
};
