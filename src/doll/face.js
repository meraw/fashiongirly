// Her face follows the weather (the user's request, 11 October 2026): a wide smile in warm sun, rosy cheeks in the
// cold, a softer smile with her brows lifted a little in the rain, a small dreamy smile in fog, and her usual smile
// otherwise. Only the stitched smile, the blush and the brows change; her eyes, nose and flower stay as they are.
// makeHead builds the usual face; setExpression (src/doll/model.js) changes it.

// The stitched smile, as points across her face (head space: x across, y up).
export const SMILES = {
  usual: [[-.055, -.205], [.003, -.223], [.064, -.194]],
  wide: [[-.078, -.197], [-.035, -.226], [.004, -.233], [.044, -.225], [.084, -.19]],
  soft: [[-.042, -.211], [.004, -.219], [.05, -.206]],
};
// Each expression: which smile, the blush (opacity, colour, size against the usual) and whether her brows lift.
export const EXPRESSIONS = {
  smile: { smile: 'usual', blush: [.42, '#d7888a', 1], lift: false },
  beam: { smile: 'wide', blush: [.5, '#d98088', 1.06], lift: false },
  rosy: { smile: 'usual', blush: [.74, '#e2737f', 1.2], lift: false },
  wistful: { smile: 'soft', blush: [.4, '#d7888a', 1], lift: true },
  dreamy: { smile: 'soft', blush: [.48, '#d98a92', 1.05], lift: false },
};

// The expression for the day's weather: a kind from src/today/sky.js and how warm it feels.
export function expressionFor({ kind = 'none', feels = null } = {}) {
  const cold = Number.isFinite(feels) && feels <= 4;
  if (kind === 'snow' || cold) return 'rosy';
  if (kind === 'rain' || kind === 'heavy-rain') return 'wistful';
  if (kind === 'fog') return 'dreamy';
  if ((kind === 'sun' || kind === 'partly') && Number.isFinite(feels) && feels >= 18) return 'beam';
  return 'smile';
}
