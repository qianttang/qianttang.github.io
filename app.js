document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu(returnFocus = false) { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); if (returnFocus) menuButton.focus(); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
const cards = [...document.querySelectorAll('.paper')];
const search = document.querySelector('#publication-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const resultCount = document.querySelector('.results-count');
let selected = 'all';
document.querySelector('.publication-tools').hidden = false;
resultCount.hidden = false;
filters.forEach(button => { const count = button.dataset.filter === 'all' ? cards.length : cards.filter(c => c.dataset.kind === button.dataset.filter).length; button.querySelector('span').textContent = count; });
function filterPapers() {
  const tokens = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let visible = 0;
  cards.forEach(card => { const match = (selected === 'all' || card.dataset.kind === selected) && tokens.every(word => card.dataset.search.includes(word)); card.hidden = !match; if (match) visible++; });
  resultCount.textContent = `Showing ${visible} of ${cards.length} works`;
  document.querySelector('.empty-state').hidden = visible > 0;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
}
filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; filterPapers(); }));
search.addEventListener('input', filterPapers);
document.querySelector('#reset-search').addEventListener('click', () => { search.value = ''; selected = 'all'; filterPapers(); search.focus(); });
document.querySelector('[data-show-bayes]').addEventListener('click', () => { search.value = 'Bayesian'; selected = 'manuscript'; filterPapers(); });
filterPapers();
let toastTimer;
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3000); }
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const el = document.createElement('textarea'); el.value = text; el.style.cssText = 'position:fixed;top:-1000px;'; document.body.append(el); el.select();
    let success = false; try { success = document.execCommand('copy'); } catch {} el.remove(); return success;
  }
}
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => { const ok = await copyText(button.dataset.copy); button.focus(); toast(ok ? (button.classList.contains('copy-email') ? 'Email address copied' : 'R installation command copied') : 'Copy unavailable. Select and copy the text directly.'); }));
const dialog = document.querySelector('#citation-dialog');
let currentCitation = '', citationUrl;
document.querySelectorAll('[data-citation]').forEach(button => button.addEventListener('click', () => {
  const item = window.SITE_CITATIONS[button.dataset.citation]; if (!item) return;
  currentCitation = item.text;
  document.querySelector('#citation-title').textContent = item.title;
  document.querySelector('#citation-text').textContent = item.text;
  document.querySelector('.dialog-status').textContent = '';
  if (citationUrl) URL.revokeObjectURL(citationUrl);
  citationUrl = URL.createObjectURL(new Blob([item.text + '\n'], { type: 'application/x-bibtex' }));
  const download = document.querySelector('#download-citation'); download.href = citationUrl; download.download = button.dataset.citation + '.bib';
  dialog.showModal(); document.body.classList.add('modal-open');
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (citationUrl) { URL.revokeObjectURL(citationUrl); citationUrl = null; } });
document.querySelector('#copy-citation').addEventListener('click', async () => { const ok = await copyText(currentCitation); document.querySelector('.dialog-status').textContent = ok ? 'BibTeX copied to clipboard.' : 'Copy unavailable. Select the citation above or download the .bib file.'; });
