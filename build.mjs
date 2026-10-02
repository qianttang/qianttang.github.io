import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const content = JSON.parse(await readFile('content.json', 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ext = (label, url) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`;
const renderPapers = items => items.map(p => `<article class="paper" data-paper-id="${escape(p.id)}" data-kind="${p.kind}" data-search="${escape([p.title,p.authors,p.year,p.status,p.topics].join(' ').toLowerCase())}">
  <div class="paper-year">${escape(p.year)}</div>
  <div class="paper-body"><span class="badge ${p.kind === 'manuscript' ? 'muted-badge' : ''}">${escape(p.status)}</span>
  <h3>${escape(p.title)}</h3><p class="authors">${escape(p.authors).replace('Qian Tang','<strong>Qian Tang</strong>')}</p>
  <p class="venue">${escape(p.venue)}</p><p class="paper-summary">${escape(p.summary)}</p>
  <div class="paper-links">${p.links.map(l=>ext(l.label,l.url)).join('')}${p.bibtex?`<button class="text-button citation-trigger" data-citation="${p.id}" aria-haspopup="dialog">BibTeX <span aria-hidden="true">＋</span></button>`:''}${p.note?`<span class="forthcoming">${escape(p.note)}</span>`:''}</div>
  </div></article>`).join('\n');
const software = content.software.map((p,i)=>`<article class="software-card"><div class="software-top"><span class="package-number">0${i+1}</span><span class="package-type">R PACKAGE</span></div><h3>${escape(p.name)}</h3><p>${escape(p.description)}</p><div class="package-links">${p.cran?ext('CRAN',p.cran):''}</div>${p.cran?`<button class="install-command" data-copy='install.packages("${escape(p.name)}")' aria-label="Copy R installation command for ${escape(p.name)}"><code>install.packages("${escape(p.name)}")</code><span class="copy-label">Copy</span></button>`:''}</article>`).join('\n');
const orderedSoftware = content.softwarePageOrder.map(name => {
  const item = content.software.find(p => p.name === name);
  if (!item) throw new Error(`Unknown software package: ${name}`);
  return item;
});
const softwareList = orderedSoftware.map(p => `<article class="software-entry" aria-labelledby="package-${escape(p.name)}">
  <div class="software-entry-heading"><h2 id="package-${escape(p.name)}">${escape(p.name)}</h2><a class="download-badge" href="https://cranlogs.r-pkg.org/badges/grand-total/${encodeURIComponent(p.name)}" target="_blank" rel="noopener noreferrer" aria-label="View total CRAN mirror downloads for ${escape(p.name)} (opens in a new tab)"><img src="https://cranlogs.r-pkg.org/badges/grand-total/${encodeURIComponent(p.name)}" alt="Total CRAN mirror downloads for ${escape(p.name)}" height="20" decoding="async"></a></div>
  <p>${escape(p.description)}</p>
  <div class="software-entry-actions"><div class="package-links">${ext('CRAN', p.cran)}</div><button class="install-command" data-copy='install.packages("${escape(p.name)}")' aria-label="Copy R installation command for ${escape(p.name)}"><code>install.packages("${escape(p.name)}")</code><span class="copy-label">Copy</span></button></div>
</article>`).join('\n');
const template = await readFile('template.html','utf8');
const [intro, publications, softwareSection, contact, selectedSection, newsSection, teachingSection] = await Promise.all(['intro', 'publications', 'software', 'contact', 'selected-publications', 'news', 'teaching'].map(name => readFile(`partials/${name}.html`, 'utf8')));
const selectedPapers = content.homePublications.map(id => {
  const paper = content.papers.find(p => p.id === id);
  if (!paper || paper.kind !== 'publication') throw new Error(`Invalid selected publication: ${id}`);
  return paper;
});
const news = content.news.map(item => `<li><time datetime="${escape(item.datetime)}">${escape(item.date)}</time><p>${escape(item.text)}${item.link ? ` <a href="${escape(item.link.url)}">${escape(item.link.label)} <span aria-hidden="true">↗</span></a>` : ''}</p></li>`).join('\n');
const teaching = content.teaching.map((group, i) => `<section class="teaching-group" aria-labelledby="teaching-group-${i}"><div class="teaching-group-heading"><h2 id="teaching-group-${i}">${escape(group.role)}</h2><p>${escape(group.institution)}</p></div><div class="course-list">${group.courses.map(course => `<article class="course"><p class="course-code">${escape(course.code)}</p><h3>${escape(course.title)}</h3><p class="course-terms"><span class="sr-only">Semesters: </span>${course.terms.map(term => `<span>${escape(term)}</span>`).join(' ')}</p></article>`).join('\n')}</div></section>`).join('\n');
const origin = 'https://qianttang.github.io';
const homeDescription = 'Qian Tang, IRSA Faragher Distinguished Postdoctoral Fellow at the University of Minnesota. Research in statistical learning, quantile regression, optimization, and high-dimensional data.';
const pages = [
  { name: 'Home', path: '/', title: 'Qian Tang | Statistical Learning & Computation', description: homeDescription, main: intro + newsSection + selectedSection + softwareSection.replace('<!-- CONTACT -->', contact) },
  { name: 'Publications', path: '/Publications/', description: 'Qian Tang’s publications, manuscripts, and ongoing projects, with search, type filters, and BibTeX citations.', main: publications.replace('<h2 id="publications-title">', '<h1 class="page-title" id="publications-title">').replace('Publications &amp; manuscripts</h2>', 'Publications &amp; manuscripts</h1>').replace('01 / RESEARCH OUTPUT', 'RESEARCH OUTPUT').replace('Selected work in statistical learning, computation, and applications.', 'Publications and ongoing work in statistical learning, computation, and applications.') },
  { name: 'Teaching', path: '/Teaching/', description: 'Qian Tang’s teaching experience as an instructor at the University of Minnesota and a teaching assistant at the University of Iowa.', main: teachingSection },
  { name: 'Software', path: '/Software/', description: 'Open-source R packages by Qian Tang for statistical learning and computation, with CRAN download counts and installation commands.', main: softwareSection.replace('<!-- CONTACT -->', '').replace('<h2 id="software-title">Methods you can use.</h2>', '<h1 class="page-title" id="software-title">Software</h1>').replace('03 / OPEN-SOURCE SOFTWARE', 'OPEN-SOURCE SOFTWARE').replace('R packages that bring', 'Methods you can use. R packages that bring').replace('class="software-grid"', 'class="software-list"').replace('<!-- SOFTWARE -->', softwareList).replace('</section>', '<p class="download-note">Download badges show cumulative downloads from the RStudio CRAN mirror, via <a href="https://cranlogs.r-pkg.org/" target="_blank" rel="noopener noreferrer">CRAN logs<span class="sr-only"> (opens in a new tab)</span></a>.</p></section>') },
  { name: 'Contact', path: '/Contact/', description: 'Contact Qian Tang at the University of Minnesota and download the academic CV.', main: `<section class="contact-section" aria-labelledby="contact-title"><div class="section-heading"><div><p class="eyebrow">GET IN TOUCH</p><h1 class="page-title" id="contact-title">Contact</h1></div></div>${contact}</section>` }
];
const version = async file => createHash('sha256').update(await readFile('public/' + file)).digest('hex').slice(0, 10);
const stylesVersion = await version('styles.css');
const scriptVersion = await version('app.js');
await mkdir('public/assets',{recursive:true});
for (const page of pages) {
  const nav = pages.map(item => {
    const cv = item.name === 'Contact' ? `<a href="{{CV}}" target="_blank" rel="noopener">CV <span aria-hidden="true">↗</span><span class="sr-only"> (PDF, opens in a new tab)</span></a>` : '';
    return cv + `<a href="${item.path}"${item.name === page.name ? ' aria-current="page"' : ''}>${item.name}</a>`;
  }).join('');
  const html = template.replace('<!-- MAIN -->', page.main)
    .replace('{{NAV}}', nav).replace('{{PAGE_CLASS}}', page.name === 'Home' ? '' : 'subpage')
    .replace('{{TITLE}}', escape(page.title || `${page.name} | Qian Tang`))
    .replace('{{DESCRIPTION}}', escape(page.description)).replace('{{CANONICAL}}', origin + page.path)
    .replace('{{STYLES_VERSION}}', stylesVersion).replace('{{SCRIPT_VERSION}}', scriptVersion)
    .replace('<!-- PAPERS -->', renderPapers(content.papers)).replace('<!-- SELECTED PAPERS -->', renderPapers(selectedPapers))
    .replaceAll('{{ALL_WORK_COUNT}}', content.papers.length)
    .replaceAll('{{PUBLICATION_COUNT}}', content.papers.filter(p => p.kind === 'publication').length)
    .replaceAll('{{MANUSCRIPT_COUNT}}', content.papers.filter(p => p.kind === 'manuscript').length)
    .replace('<!-- NEWS -->', news).replace('<!-- TEACHING -->', teaching).replace('<!-- SOFTWARE -->', software)
    .replaceAll('{{EMAIL}}', escape(content.email)).replaceAll('{{GITHUB}}', escape(content.github))
    .replaceAll('{{SCHOLAR}}', escape(content.scholar)).replaceAll('{{LINKEDIN}}', escape(content.linkedin))
    .replaceAll('{{CV}}', escape('/' + content.cv.replace(/^\/+/, '')));
  const directory = 'public' + page.path;
  await mkdir(directory, { recursive: true });
  await writeFile(directory + 'index.html', html);
}
// Preserve existing bookmarks when merging Research into Publications.
await mkdir('public/Research', { recursive: true });
await writeFile('public/Research/index.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Research | Qian Tang</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${origin}/Publications/"><meta http-equiv="refresh" content="0;url=/Publications/"><link rel="stylesheet" href="/styles.css?v=${stylesVersion}"></head><body><main class="page-shell"><h1 class="page-title">Research</h1><p>Research is now part of <a class="text-link" href="/Publications/">Publications &amp; manuscripts ↗</a>.</p></main></body></html>\n`);
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('public/citations.js','window.SITE_CITATIONS = '+JSON.stringify(Object.fromEntries(content.papers.filter(p=>p.bibtex).map(p=>[p.id,{title:p.title,text:p.bibtex}]))).replace(/</g,'\\u003c')+';\n');
for (const file of await readdir('public')) await cp('public/' + file, file, {recursive:true});
console.log(`Built ${pages.length} static pages: ${content.papers.length} papers, ${content.software.length} packages.`);
