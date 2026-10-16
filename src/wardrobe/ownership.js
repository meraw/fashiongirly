// Device-local wardrobe changes. Keep authored assets intact so a removed piece can be restored.
import { GARMENTS } from './catalog.js';
import { cleanRecipe, DEFAULT } from '../doll/recipe.js';

export const REMOVED_KEY = 'fashiongirly.removed-pieces.v1';
const SLOTS = ['topId', 'underTopId', 'bottomId', 'dressId', 'outerwearId', 'shoesId'];

export function createWardrobe(storage) {
  let removed = new Set();
  try {
    const data = JSON.parse(storage?.getItem(REMOVED_KEY) || '[]');
    if (Array.isArray(data)) removed = new Set(data.filter(id => typeof id === 'string' && Object.hasOwn(GARMENTS, id)));
  } catch {}
  const has = id => !removed.has(id);
  function change(id, remove) {
    if (!Object.hasOwn(GARMENTS, id)) return false;
    if (remove) removed.add(id); else removed.delete(id);
    try {
      if (!storage) return false;
      storage.setItem(REMOVED_KEY, JSON.stringify([...removed]));
      return true;
    } catch { return false; }
  }
  return {
    has, removed: () => [...removed], remove: id => change(id, true), restore: id => change(id, false),
    accepts: recipe => !SLOTS.some(key => removed.has(recipe?.[key])),
    clean(value) {
      const recipe = cleanRecipe(value);
      for (const key of SLOTS) if (!has(recipe[key])) {
        recipe[key] = DEFAULT[key];
        if (key === 'topId') { recipe.knit = true; recipe.shirt = true; recipe.tucked = false; }
      }
      return cleanRecipe(recipe);
    },
  };
}
