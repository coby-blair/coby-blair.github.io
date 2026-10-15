# Coby's personal site

A small, static Astro site. No database, accounts, tracking, external fonts, or client-side framework.

Source repository: https://github.com/coby-blair/personal-site

This repository is published as source only. GitHub Pages is not enabled.

## Local development

Use Node.js 24 LTS, then:

```powershell
npm ci
npm run dev
```

The default address is `http://127.0.0.1:4327/`.

```powershell
npm run check
npm test
npm run build
npm run preview
```

`SITE_URL` sets the canonical origin; `BASE_PATH` optionally sets a project-site prefix. Without deployment configuration, the site uses a local URL, never an invented public domain.

## Publishing content

Add an authored Markdown file to `src/content/notes/`. The schema lives in `src/content.config.ts`. Keep private research, scripts, source decks, and recordings **outside this repository**; a draft in a public repository is still public.

Required frontmatter:

```yaml
---
title: "A useful, specific title"
description: "The practical takeaway."
slug: "a-useful-specific-title"
kind: "article"
status: "draft"
approvedForPublication: false
topics: []
publicSources: []
---
```

Use `kind: video` for an episode; add `series: token-tips`, `order`, a real `youtubeId`, and `durationSeconds`. A published video also requires a nonempty `transcript`. `scope` identifies the client/product where relevant. Optional `updatedAt` and `lastReviewedAt` are dates, not automatic build timestamps.

Publication requires `status: published`, `approvedForPublication: true`, and `publishedAt` as an ISO date/time with a timezone. Future dates are excluded until a subsequent build. One shared filter protects detail routes, listings, RSS, and the sitemap.

Episode pages support a summary/body, optional `tryThis`, optional `caveat`, public references, a transcript, and related series navigation. Video embeds load only after a user presses Play; a direct watch link always works. No remote poster image is loaded.

When advice ages, add a correction or superseding note while preserving the original URL.

## GitHub Pages

Use the personally controlled GitHub account selected by the owner, not an unrelated work account. For a root personal site, the repository name is `<username>.github.io`. A normal project repository also works; the workflow obtains the correct base path from Pages.

Publishing this source repository and deploying the website are separate actions. The prepared `deployment/github-pages.yml` is an inactive template outside GitHub's workflow directory. It does not run when this repository is uploaded. Even after installation, it is manual-only and its deployment input defaults to false. Keep Pages disabled until the owner separately approves making the website live.

After separate website-launch approval:

1. Install `deployment/github-pages.yml` as `.github/workflows/deploy.yml` and push the reviewed change using an account authorized to manage workflows.
2. Set repository Settings > Pages > Source to GitHub Actions.
3. Manually run the Pages workflow with `deploy_site` enabled.
4. Check the public URL and nested routes.

For a custom domain, verify ownership and follow GitHub's current DNS/HTTPS guidance. Configure it in Pages; the workflow reads the resulting origin and base path. Do not add guessed DNS records or an unowned domain.

## Content and rights

Do not add customer information, corporate source links, internal decks, secrets, or unlicensed assets. There is deliberately no broad license grant until the owner chooses one.
