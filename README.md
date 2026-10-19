# Coby's personal site

A small, static Astro site. No database, accounts, tracking, external fonts, or client-side framework.

Website: https://coby-blair.github.io/

Source repository: https://github.com/coby-blair/coby-blair.github.io

`main` holds the source; `gh-pages` holds the generated site served by GitHub Pages.

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

`SITE_URL` overrides the canonical origin; `BASE_PATH` optionally sets a project-site prefix. Production defaults to `https://coby-blair.github.io/`. The development server still runs locally.

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

## Series roadmap

`src/lib/token-tips.ts` holds the public topic titles, summaries, chapter order, and stable checkpoint IDs. These are planned topics, not automatically published articles. Keep private planning material outside the repository.

An optional `lesson` adds a native expandable mini-lesson with paragraphs, optional key points/example, public references, and a practical `tryThis` action. Written lessons can be read before their videos are available; they do not publish a separate note or change its approval state.

An optional `video` attaches a released YouTube video directly to a checkpoint without requiring a separate article or an unverified transcript. It needs `youtubeId`, `title`, `status: published`, `approvedForPublication: true`, and a non-future `publishedAt`. The same publication gate applies as for notes. An optional `poster` names an image in `public/`; no remote thumbnail is requested. The privacy-aware player appears above the mini-lesson toggle, and the homepage and RSS feed include these videos alongside published series notes without duplicating matched episodes.

To attach an episode, use the checkpoint ID as the note's `slug`, or set the checkpoint's `noteSlug` to the note's existing slug. Episode 01 is mapped to `cheaper-tokens-wont-fix-a-vague-task`. Add the real YouTube ID, duration, transcript, and publication fields described above. Only approved, published notes produce links or players; unmatched published series notes remain listed below the roadmap. Do not add placeholder video IDs or commit recordings.

The homepage groups the series into one feed entry alongside standalone publications. Optional roadmap checkmarks are saved only in the reader's browser, use stable IDs rather than list positions, and never hide content. Without JavaScript or browser storage, the roadmap still works.

## GitHub Pages

This site uses the personally controlled `coby-blair` account and its root Pages repository. Pages serves the root of the `gh-pages` branch. `public/.nojekyll` preserves Astro's generated asset folders.

Source changes and website releases remain separate. Pushing `main` does not automatically publish a new version of the site.

For an approved update:

1. Review the exact public content and commit the source on `main`.
2. Run `npm run check`, `npm test`, and `npm run build`.
3. In a separate checkout of `gh-pages`, replace the generated site files with the contents of `dist/`, including `.nojekyll`. Preserve the checkout's `.git` directory and branch history.
4. Commit and push that branch using the personal account, without force-pushing.
5. Wait for GitHub's Pages deployment and check the live URL and nested routes.

`deployment/github-pages.yml` remains an optional, inactive template for a later move to artifact-based GitHub Actions deployment. Installing it requires appropriate workflow authorization; do not enable a second publishing method inadvertently.

For a custom domain, verify ownership and follow GitHub's current DNS/HTTPS guidance. Update `SITE_URL` and Pages configuration together before rebuilding. Do not add guessed DNS records or an unowned domain.

## Content and rights

Do not add customer information, corporate source links, internal decks, secrets, or unlicensed assets. There is deliberately no broad license grant until the owner chooses one.
