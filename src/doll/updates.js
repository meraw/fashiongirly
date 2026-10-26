// Which version of the app this is, and whether a newer one is on its way (the user's request, 26 October 2026: they
// had merged new clothes and could not tell whether the phone had them). The page's own number comes from
// version.json, written by the build (the commit count, as for the APK). In the Android app the native shell checks
// for a newer build and downloads it (android/.../AppUpdates.java); it answers through window.FashiongirlyApp:
// status() is JSON {state, version, latest, ready, checkedAt}, check() looks now, showUpdate() switches to the newest
// download. It says something changed with an `app-update` event on the window. In a browser there is no shell: a
// reload always brings the newest build, so only the number is shown.
const STATES = {
  checking: () => 'Checking for new clothes…',
  downloading: s => `Version ${s.latest} found, downloading…`,
  current: () => 'Up to date.',
  failed: () => 'Could not check just now (no connection?).',
};

export function mountUpdates(doc, { fetch: fetchImpl = null, bridge = null, now = () => Date.now() } = {}) {
  const $ = id => doc.getElementById(id), win = doc.defaultView;
  let own = null, dismissed = 0, closed = false;
  const read = () => { try { return JSON.parse(bridge.status()); } catch { return null; } };
  const ago = time => { const minutes = Math.round((now() - time) / 60000); return minutes < 1 ? 'just now' : minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} h ago`; };
  function render() {
    if (closed) return;
    const s = bridge ? read() : null, version = own || s?.version || null;
    const parts = [version ? `Version ${version}.` : 'Version unknown.'];
    if (!bridge) parts.push('In a browser, reloading the page brings the newest clothes.');
    else if (s?.ready > 0) parts.push(`Version ${s.ready} has arrived: tap Show them at the top.`);
    else if (STATES[s?.state]) parts.push(STATES[s.state](s));
    if (bridge && s?.checkedAt > 0 && s.state !== 'checking' && s.state !== 'downloading') parts.push(`Last checked ${ago(s.checkedAt)}.`);
    $('version-status').textContent = parts.join(' ');
    $('version-check').hidden = !bridge;
    $('version-check').disabled = s?.state === 'checking' || s?.state === 'downloading';
    // The banner, on every page, for a version that has downloaded and is not shown yet.
    const ready = s?.ready > 0 && s.ready !== dismissed;
    $('update-banner').hidden = !ready;
    if (ready) $('update-text').textContent = `New clothes have arrived (version ${s.ready}).`;
  }
  const onUpdate = () => render();
  $('version-check').onclick = () => { try { bridge?.check(); } catch {} render(); };
  $('update-show').onclick = () => { try { bridge?.showUpdate(); } catch {} };
  $('update-later').onclick = () => { dismissed = read()?.ready ?? 0; render(); };
  win?.addEventListener('app-update', onUpdate);
  // Keep "Last checked" honest while the page stays open.
  const timer = bridge ? setInterval(render, 60000) : null;
  render();
  const ready = (fetchImpl ? Promise.resolve().then(() => fetchImpl('./version.json', { cache: 'no-store' })).then(r => r.ok ? r.json() : null) : Promise.resolve(null))
    .then(data => { if (Number.isInteger(data?.version) && data.version > 0) own = data.version; }, () => {})
    .then(render);
  return { ready, render, dispose() { closed = true; clearInterval(timer); win?.removeEventListener('app-update', onUpdate); } };
}
