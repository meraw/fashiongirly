// The studio's pages: Today, Dress her and Wardrobe share the doll and switch by the address's #hash, so the browser's
// back button and a bookmark both work. The page in view is marked in the tabs.
const PAGES = ['today', 'dress', 'wardrobe'];
export function mountPages(doc) {
  const win = doc.defaultView;
  const show = () => {
    const name = PAGES.includes(win.location.hash.slice(1)) ? win.location.hash.slice(1) : 'today';
    for (const page of doc.querySelectorAll('.page')) page.hidden = page.dataset.page !== name;
    for (const tab of doc.querySelectorAll('.tabs [data-page]')) {
      if (tab.dataset.page === name) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
    }
    doc.body.dataset.page = name;
  };
  win.addEventListener('hashchange', show);
  show();
  return { dispose() { win.removeEventListener('hashchange', show); } };
}
