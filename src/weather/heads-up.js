// The day's heads-up: what the weather means for getting dressed, said plainly, on the days it matters. The user asked
// for it on 20 November 2026: the weather already shaped her looks (her hair tied back in the wind), but nothing told
// them, and on a very windy day they wore their hair down with lip gloss. "It's not about the weather in general, it's
// about what the weather says regarding how you should dress": hair up in the wind, waterproof in the rain.
// headsUp(conditions) lists what to watch out for, most important first; an ordinary day has nothing. notification()
// turns the list into the morning notification's title and text, which the Android app shows (src/weather/morning.js).
// Written rules on the forecast, like her styling, not AI. The thresholds are a first guess, to tune with the user.
import { isRainy, isWindy, WINDY_KMH, WINDY_GUST_KMH } from './conditions.js';

const at = hour => `${hour}:00`, round = Math.round;
// Heavy rain, heavy snow and thunderstorms (WMO codes, as Open-Meteo reports them).
const HEAVY = new Set([65, 67, 75, 82, 86, 95, 96, 99]);
// A very windy day: a steady 45 km/h or gusts of 65 km/h (Beaufort 6 to 8: umbrellas turn inside out, walking is hard).
export const VERY_WINDY_KMH = 45, VERY_WINDY_GUST_KMH = 65;
// Strong sun from UV 6 ("high" on the WHO scale); a hot day from 28° as it feels; a cold one at 3° and under.
export const STRONG_UV = 6, HOT = 28, COLD = 3;

// When it rains in her day (8:00 to 20:00), from the first and last wet hours: "Rain from 14:00", "Rain all day".
function rainWhen(c) {
  const from = c.wetFrom, until = c.wetUntil;
  if (from == null || until == null) return 'Rain today';
  if (from <= 9 && until >= 18) return 'Rain all day';
  if (from <= 9) return `Rain until about ${at(until + 1)}`;
  if (until >= 18) return `Rain from ${at(from)}`;
  return `Rain from ${at(from)} to about ${at(until + 1)}`;
}

/**
 * What to watch out for today, most important first: [{ id, level, title, detail, tips, nudge }]. `level` is 'warn'
 * for weather that changes what to wear and 'note' for a small thing (rain only after her day, a chance of a shower).
 * `tips` are the card's lines; `nudge` is the notification's short sentence, or null to leave it out of the notification
 * (wet ground from rain that stopped before she is out: worth a line on the card, not a buzz). An ordinary day gives [].
 */
export function headsUp(c) {
  if (!c) return [];
  const out = [], rainy = isRainy(c), windy = isWindy(c), wind = round(c.windKmh ?? 0), gust = round(c.gustKmh ?? 0);
  const add = (id, level, title, detail, tips, nudge) => out.push({ id, level, title, detail, tips: tips.filter(Boolean), nudge });

  if (c.snow) add('snow', 'warn', 'Snow today', null, ['Boots with a good grip, and warm socks', 'A hood or a hat', 'Leave suede and canvas at home'], 'Boots with grip, and a hat');
  else if (rainy) {
    const heavy = (c.rainMm ?? 0) >= 8 || HEAVY.has(c.code), when = c.rainingNow ? 'Raining now' : rainWhen(c);
    add('rain', 'warn', heavy ? when.replace(/^Rain/, 'Heavy rain') : when, c.rainChance >= 50 && !c.rainingNow ? `${round(c.rainChance)}% chance` : null, [
      'Waterproof shoes: no suede, canvas or open shoes',
      windy ? null : 'An umbrella, or a jacket with a hood',
      heavy ? 'Skip long, wide hems: they soak up the puddles' : null,
      windy ? null : 'Hair up or plaited holds better in the wet',
    ], windy ? 'Waterproof shoes and a hood' : 'Waterproof shoes and an umbrella');
  }

  if (windy) {
    const very = wind >= VERY_WINDY_KMH || gust >= VERY_WINDY_GUST_KMH;
    const strength = gust >= wind + 5 ? `gusts up to ${gust} km/h` : `${wind} km/h`;
    add('wind', 'warn', very ? 'Very windy' : 'Windy', `${strength}${c.windiestAt != null ? `, strongest around ${at(c.windiestAt)}` : ''}`, [
      'Wear your hair up: a ponytail, bun or plait',
      'Skip the lip gloss, or loose strands will stick to it',
      'Short or floaty skirts will fly: trousers, or shorts underneath',
      rainy || c.snow ? 'Too windy for an umbrella: wear a hood' : very ? 'Hats blow off: a hood stays on' : null,
    ], 'Hair up, and skip the lip gloss');
  }

  if (Number.isFinite(c.tempMin) && c.tempMin <= 1 && (rainy || c.snow || c.wetFrom != null)) {
    add('ice', 'warn', 'Could be icy', `down to ${round(c.tempMin)}°`, ['Shoes with a good grip; leave smooth soles at home'], 'Shoes with grip');
  }
  const coldest = Math.min(c.feels, c.feelsMin ?? c.feels);
  if (c.feels <= COLD || coldest <= 0) {
    add('cold', 'warn', c.feels <= -2 ? 'Freezing' : 'Very cold', `feels like ${round(coldest)}°`, ['A hat, a scarf and gloves', 'Warm socks, and boots if you can'], 'Hat, scarf and gloves');
  } else if (c.feels >= HOT) {
    add('heat', 'warn', 'Hot', `feels like ${round(c.feels)}°`, ['Loose, light fabrics: linen or cotton', 'Water with you, and shade at midday'], 'Light, loose clothes');
  }
  // A day that starts or ends much cooler than its warm part, when it is not cold all day.
  if (c.feels > COLD + 5 && Number.isFinite(c.feelsMin) && Number.isFinite(c.feelsMax) && c.feelsMax - c.feelsMin >= 8 && c.feelsMin < 15) {
    const morning = c.hours?.[0], coolStart = morning && morning.hour <= 10 && morning.feels <= c.feels - 4;
    add('layers', 'warn', coolStart ? 'Cool morning, warm afternoon' : 'Cooler later', `${round(c.feelsMin)}° to ${round(c.feelsMax)}°`, ['Layers you can take off: a light jacket or a cardigan'], 'A layer you can take off');
  }
  if (!rainy && !c.snow && Number.isFinite(c.uvMax) && c.uvMax >= STRONG_UV) {
    add('sun', 'warn', 'Strong sun', `UV ${round(c.uvMax)}`, ['Sunscreen, even if it feels cool', 'Sunglasses, and a cap or hat'], 'Sunscreen and sunglasses');
  }

  // Rain that does not make a rainy day: after the hours she is out, only early, a passing shower, or only a chance.
  if (!rainy && !c.snow) {
    if (c.wetFrom != null && c.wetFrom >= 18) add('rain-later', 'note', `Rain later, from ${at(c.wetFrom)}`, null, ['An umbrella in your bag for the way home'], 'An umbrella for later');
    else if (c.wetUntil != null && c.wetUntil <= 10) add('rain-early', 'note', `Wet this morning, dry by ${at(c.wetUntil + 1)}`, null, ['Puddles about: skip suede and white trainers'], null);
    else if (c.wetFrom != null) add('shower', 'note', `A shower around ${at(c.wetFrom)}`, null, ['A small umbrella in your bag, just in case'], 'A small umbrella, just in case');
    else if ((c.rainChance ?? 0) >= 30) add('rain-maybe', 'note', `Maybe rain (${round(c.rainChance)}%)`, null, ['A small umbrella in your bag, just in case'], 'A small umbrella, just in case');
  }
  return out;
}

const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
const list = items => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/**
 * The morning notification for a heads-up list: { title, body }, or null on a day with nothing to watch out for.
 * With `test` (the "Send one now" button), a quiet day still says so, so the user sees that notifications work.
 */
export function notification(all, { test = false, place = null } = {}) {
  const items = (all || []).filter(a => a.nudge);
  if (!items.length) return test ? { title: 'Nothing to watch out for today', body: `No rain, strong wind, cold or strong sun to dress for${place ? ` in ${place}` : ''}.` } : null;
  const top = items.slice(0, 3), titles = top.map((a, i) => i ? lower(a.title) : a.title);
  const title = top.length === 1 && top[0].detail ? `${top[0].title} · ${top[0].detail}` : list(titles);
  return { title, body: [...new Set(items.map(a => a.nudge))].slice(0, 3).map(n => `${n}.`).join(' ') };
}

// For the tests and the docs: the thresholds in one place.
export const THRESHOLDS = { WINDY_KMH, WINDY_GUST_KMH, VERY_WINDY_KMH, VERY_WINDY_GUST_KMH, STRONG_UV, HOT, COLD };
