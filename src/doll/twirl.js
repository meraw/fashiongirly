// She twirls when she changes (the user's choice, 11 October 2026): one turn, slow at either end, and the new
// clothes and hair are swapped in halfway, while her back is to us, so the change is a reveal. A tuck, an open
// jacket or a slider is not a change of clothes, so it happens at once. With reduced motion she does not twirl.
export const TWIRL_MS = 950;
// What she wears and her hair: a change in any of these is a change of clothes.
const WORN = ['topId', 'underTopId', 'bottomId', 'dressId', 'shoesId', 'outerwearId', 'hairId'];
export function wantsTwirl(before, after) {
  if (!before || !after) return false;
  return WORN.some(key => (before[key] ?? 'none') !== (after[key] ?? 'none'));
}
// How far round she has turned at a moment of the twirl (0 to 1): eased in and out, half a turn at the halfway point.
export function spinAt(t) {
  const x = Math.max(0, Math.min(1, t)), e = x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  return e * Math.PI * 2;
}
