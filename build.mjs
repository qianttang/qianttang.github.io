import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
const content = JSON.parse(await readFile('content.json', 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ext = (label, url) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`;
const papers = content.papers.map(p => `<article class="paper" data-kind="${p.kind}" data-search="${escape([p.title,p.authors,p.year,p.status,p.topics].join(' ').toLowerCase())}">
  <div class="paper-year">${escape(p.year)}</div>
  <div class="paper-body"><span class="badge ${p.kind === 'manuscript' ? 'muted-badge' : ''}">${escape(p.status)}</span>
  <h3>${escape(p.title)}</h3><p class="authors">${escape(p.authors).replace('Qian Tang','<strong>Qian Tang</strong>')}</p>
  <p class="venue">${escape(p.venue)}</p><p class="paper-summary">${escape(p.summary)}</p>
  <div class="paper-links">${p.links.map(l=>ext(l.label,l.url)).join('')}${p.bibtex?`<button class="text-button citation-trigger" data-citation="${p.id}" aria-haspopup="dialog">BibTeX <span aria-hidden="true">＋</span></button>`:''}${p.note?`<span class="forthcoming">${escape(p.note)}</span>`:''}</div>
  </div></article>`).join('\n');
const software = content.software.map((p,i)=>`<article class="software-card"><div class="software-top"><span class="package-number">0${i+1}</span><span class="package-type">R PACKAGE</span></div><h3>${escape(p.name)}</h3><p>${escape(p.description)}</p><div class="package-links">${p.cran?ext('CRAN',p.cran):''}${p.source?ext('GitHub',p.source):''}</div>${p.cran?`<button class="install-command" data-copy='install.packages("${escape(p.name)}")' aria-label="Copy R installation command for ${escape(p.name)}"><code>install.packages("${escape(p.name)}")</code><span class="copy-label">Copy</span></button>`:`<p class="package-footnote">Installation instructions in the repository.</p>`}</article>`).join('\n');
const template = await readFile('template.html','utf8');
await mkdir('public/assets',{recursive:true});
await writeFile('public/index.html',template.replace('<!-- PAPERS -->',papers).replace('<!-- SOFTWARE -->',software).replaceAll('{{EMAIL}}',escape(content.email)).replaceAll('{{GITHUB}}',escape(content.github)).replaceAll('{{SCHOLAR}}',escape(content.scholar)).replaceAll('{{CV}}',escape(content.cv)));
await writeFile('public/citations.js','window.SITE_CITATIONS = '+JSON.stringify(Object.fromEntries(content.papers.filter(p=>p.bibtex).map(p=>[p.id,{title:p.title,text:p.bibtex}]))).replace(/</g,'\\u003c')+';\n');
for (const file of await readdir('public')) await cp('public/' + file, file, {recursive:true});
console.log('Built academic site: '+content.papers.length+' papers, '+content.software.length+' packages.');
