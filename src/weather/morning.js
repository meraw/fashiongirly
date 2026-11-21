// What the Android app runs each morning, with the app closed (android/.../HeadsUp.java). The app has no page open then,
// so it runs this file in a small JavaScript sandbox, built into one plain script by scripts/heads-up-bundle.mjs as
// heads-up.js next to index.html. It asks morningUrl() what to fetch, fetches it itself, and asks
// morningNotification() what to say. The rules stay here, in the web app, so they update with it, without a new APK.
import { forecastUrl, toConditions } from './open-meteo.js';
import { headsUp, notification } from './heads-up.js';

export function morningUrl(lat, lon, day) {
  return forecastUrl({ lat: Number(lat), lon: Number(lon) }, day);
}

// The notification for the day's forecast (Open-Meteo's answer, as text or parsed): { title, body }, or null when there
// is nothing to watch out for (on a test, a quiet day still says so).
export function morningNotification(forecast, day, place = null, test = false) {
  const json = typeof forecast === 'string' ? JSON.parse(forecast) : forecast;
  return notification(headsUp(toConditions(json, day, place || null)), { test: !!test, place: place || null });
}
