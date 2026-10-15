import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

test('built routes, feeds, and metadata share the publication gate and base path', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'coby-site-build-'));
  try {
    await cp(path.join(root, 'src'), path.join(directory, 'src'), { recursive: true });
    for (const filename of ['astro.config.mjs', 'tsconfig.json', 'package.json']) {
      await cp(path.join(root, filename), path.join(directory, filename));
    }
    await symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'junction');
    const content = path.join(directory, 'src', 'content', 'notes');
    const fixtures = [
      ['visible-article', 'article', 'published', true, '2000-01-01T00:00:00Z', ''],
      ['visible-video', 'video', 'published', true, '2000-01-02T00:00:00Z',
        'series: token-tips\norder: 1\nyoutubeId: abcdefghijk\ndurationSeconds: 120\ntranscript: Test transcript.'],
      ['hidden-draft', 'article', 'draft', false, '2000-01-01T00:00:00Z', ''],
      ['hidden-review', 'article', 'review', false, '2000-01-01T00:00:00Z', ''],
      ['hidden-future', 'article', 'published', true, '2999-01-01T00:00:00Z', ''],
    ];
    for (const [slug, kind, status, approved, date, extra] of fixtures) {
      await writeFile(path.join(content, `${slug}.md`), `---
title: ${slug}
description: A synthetic build fixture.
slug: ${slug}
kind: ${kind}
status: ${status}
approvedForPublication: ${approved}
publishedAt: ${date}
${extra}
---
This is synthetic fixture content, not a real publication.
`);
    }
    const result = spawnSync(process.execPath, [
      path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build',
    ], {
      cwd: directory,
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: '1',
        SITE_URL: 'https://example.test',
        BASE_PATH: '/personal-site',
      },
      encoding: 'utf8',
      timeout: 60000,
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const dist = path.join(directory, 'dist');
    const home = await readFile(path.join(dist, 'index.html'), 'utf8');
    const archive = await readFile(path.join(dist, 'notes', 'index.html'), 'utf8');
    const feed = await readFile(path.join(dist, 'rss.xml'), 'utf8');
    const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
    const routes = await readdir(path.join(dist, 'notes'));
    for (const hidden of ['hidden-draft', 'hidden-review', 'hidden-future']) {
      for (const output of [home, archive, feed, sitemap]) assert.ok(!output.includes(hidden));
      assert.ok(!routes.includes(hidden));
    }
    for (const visible of ['visible-article', 'visible-video']) {
      for (const output of [home, archive, feed, sitemap]) assert.ok(output.includes(visible));
      assert.ok(routes.includes(visible));
    }
    assert.ok(home.includes('href="/personal-site/about/"'));
    assert.ok(home.includes('https://example.test/personal-site/'));
    assert.ok(feed.includes('https://example.test/personal-site/notes/visible-article/'));
    const video = await readFile(path.join(dist, 'notes', 'visible-video', 'index.html'), 'utf8');
    assert.ok(video.includes('Test transcript.'));
    assert.ok(video.includes('data-video-id="abcdefghijk"'));
    assert.ok(!video.includes('<iframe'));
    assert.ok(!video.includes('noindex'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
