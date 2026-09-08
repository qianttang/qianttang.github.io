# Qian Tang — Academic Website

Target website: https://qianttang.github.io/

This repository is prepared for GitHub Pages. The site presents research, publications and manuscripts, R packages, the original CV, and academic contact details.

## Pages

- `/`: Home, preserving the original full overview.
- `/Research/`: research interests and current work.
- `/Publications/`: publications and manuscripts with search, type filters, and BibTeX downloads.
- `/Software/`: R packages and installation commands.
- `/Contact/`: contact details, academic background, and CV download.

The navigation links to separate HTML pages. GitHub Pages redirects `/Research` to `/Research/` (and likewise for the other directories); direct visits and refreshes work without JavaScript. The CV navigation item opens `/assets/Qian-Tang-CV.pdf`. A focused publication view can be shared as `/Publications/?q=Bayesian&type=manuscript`.

## Hosting

Repository: https://github.com/qianttang/qianttang.github.io (public, main branch).

This is the personal GitHub Pages site for the qianttang account. The repository name exactly matches qianttang.github.io, so the site is served at the domain root.

In **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/(root)**, and click **Save**. The site is ready to publish from the committed root directory; GitHub does not need to install dependencies or run a custom build.

## Editing

- `content.json`: publication metadata, BibTeX, software, email and profile links.
- `template.html`: shared page shell, header, footer and citation dialog.
- `partials/*.html`: biography, research descriptions, publications, software, education and contact layout. Home and the category pages reuse these sections.
- `build.mjs`: static page routes, navigation, page metadata and sitemap generation.
- `public/styles.css`: styles and responsive layouts.
- `public/app.js`: publication search/filtering, citations, copy buttons and mobile menu.
- `public/assets/Qian-Tang-CV.pdf`: the supplied three-page CV.

After editing source, run:

```sh
npm run build
```

Commit the changed source files and regenerated root HTML, JavaScript, and assets. GitHub Pages then deploys the updated site. To preview locally, run `npm start` and open http://localhost:3000. No dependency installation is required; the scripts use Node.js built-ins.

## Content notes

ATLAS appears in both the supplied CV's publication and in-preparation lists. It is shown once, with its status marked for confirmation. Missing manuscript links are clearly labeled forthcoming. fastkqr uses the final 2026 volume/issue citation and notes its online publication in 2025. The original PDF remains unchanged.

Public release of the website and downloadable CV was explicitly approved by the owner in this conversation. The existing privately hosted Sites copy is separate. This export contains no Sites configuration, credentials, private repository data, or private repository history.
