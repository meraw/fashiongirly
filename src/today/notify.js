// The morning heads-up as a phone notification (the user's request, 20 November 2026), set on the Today page. Only the
// Android app can notify with the app closed: its shell checks the forecast each morning at the chosen time and, on a
// day the weather changes what to wear, says so (android/.../HeadsUp.java, which runs src/weather/morning.js). The page
// talks to it through window.FashiongirlyApp: headsUp() is JSON { supported, enabled, time, permission ('granted',
// 'denied' or 'ask'), place, last: { at, title } or null, busy }, setHeadsUp(on, 'HH:MM') turns it on or off (asking
// Android for permission first when needed), testHeadsUp() sends today's at once, notificationSettings() opens
// Android's settings for the app. A change is announced with a `heads-up-change` event on the window. In a browser,
// or in an APK from before this, there is no such shell and the settings stay hidden.
export const DEFAULT_TIME = '07:30';
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function mountNotify(doc, { bridge = null, now = () => Date.now() } = {}) {
  const $ = id => doc.getElementById(id), win = doc.defaultView, box = $('today-notify');
  const able = !!box && typeof bridge?.headsUp === 'function' && typeof bridge?.setHeadsUp === 'function';
  if (!able) { if (box) box.hidden = true; return { render() {}, dispose() {} }; }
  let closed = false;
  const read = () => { try { return JSON.parse(bridge.headsUp()) || {}; } catch { return {}; } };
  const call = (name, ...args) => { try { bridge[name]?.(...args); } catch {} };
  const when = at => { const d = new Date(at), today = new Date(now()); return `${d.toDateString() === today.toDateString() ? 'today' : d.toLocaleDateString('en-GB', { weekday: 'long' })} at ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`; };
  function render() {
    if (closed || !$('today-notify')) return;
    const s = read(), on = $('today-notify-on'), time = $('today-notify-time'), status = $('today-notify-status');
    box.hidden = false;
    on.checked = !!s.enabled && s.permission !== 'denied';
    on.disabled = s.supported === false;
    if (doc.activeElement !== time) time.value = TIME.test(s.time || '') ? s.time : DEFAULT_TIME;
    $('today-notify-test').hidden = s.supported === false;
    $('today-notify-test').disabled = !!s.busy;
    $('today-notify-settings').hidden = s.permission !== 'denied';
    const parts = [];
    if (s.supported === false) parts.push('This phone can’t check the weather with the app closed yet: update “Android System WebView” from the Play Store.');
    else if (s.permission === 'denied') parts.push('Notifications are turned off for Fashiongirly in Android’s settings.');
    else if (s.enabled) parts.push(`Every morning at ${time.value}, on the days the weather changes what to wear${s.place ? `, for ${s.place}` : ''}.`);
    else parts.push('A notification in the morning on the days the weather changes what to wear: rain, wind, cold, strong sun.');
    if (s.busy) parts.push('Checking the forecast…');
    else if (s.last?.title && Number.isFinite(s.last.at)) parts.push(`Last: “${s.last.title}”, ${when(s.last.at)}.`);
    status.textContent = parts.join(' ');
  }
  const set = () => { const t = $('today-notify-time').value; call('setHeadsUp', $('today-notify-on').checked, TIME.test(t) ? t : DEFAULT_TIME); render(); };
  $('today-notify-on').onchange = set;
  $('today-notify-time').onchange = () => { if ($('today-notify-on').checked) set(); else render(); };
  $('today-notify-test').onclick = () => { call('testHeadsUp'); render(); };
  $('today-notify-settings').onclick = () => call('notificationSettings');
  const onChange = () => render();
  win?.addEventListener('heads-up-change', onChange);
  render();
  return { render, dispose() { closed = true; win?.removeEventListener('heads-up-change', onChange); } };
}
