import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { tokenTipsChapters } from '../src/lib/token-tips.ts';

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
      ['cheaper-tokens-wont-fix-a-vague-task', 'video', 'published', true, '2000-01-03T00:00:00Z',
        'series: token-tips\norder: 2\nyoutubeId: zyxwvutsrqp\ndurationSeconds: 123\ntranscript: Mapped video transcript.'],
      ['clear-target', 'video', 'draft', false, '2000-01-04T00:00:00Z',
        'series: token-tips\norder: 3\nyoutubeId: draftdraft1'],
      ['agent-context', 'article', 'published', true, '1999-12-31T00:00:00Z',
        'series: token-tips\norder: 4'],
      ['hidden-draft', 'article', 'draft', false, '2000-01-01T00:00:00Z', ''],
      ['hidden-review', 'article', 'review', false, '2000-01-01T00:00:00Z', ''],
      ['hidden-future', 'article', 'published', true, '2999-01-01T00:00:00Z', ''],
    ];
    for (const [slug, kind, status, approved, date, extra] of fixtures) {
      await writeFile(path.join(content, `${slug}.md`), `---
title: ${slug === 'clear-target' ? 'Private unreleased title' : slug}
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
    const roadmap = await readFile(path.join(dist, 'series', 'token-tips', 'index.html'), 'utf8');
    const routes = await readdir(path.join(dist, 'notes'));
    for (const hidden of ['hidden-draft', 'hidden-review', 'hidden-future']) {
      for (const output of [home, archive, feed, sitemap]) assert.ok(!output.includes(hidden));
      assert.ok(!routes.includes(hidden));
    }
    for (const visible of ['visible-article', 'visible-video']) {
      for (const output of [archive, feed, sitemap]) assert.ok(output.includes(visible));
      assert.ok(routes.includes(visible));
    }
    assert.ok(home.includes('visible-article'));
    assert.equal((home.match(/data-feed-series="token-tips"/g) ?? []).length, 1);
    assert.ok(home.includes('href="/personal-site/series/token-tips/"'));
    assert.ok(home.includes('Latest:'));
    assert.ok(home.includes('cheaper-tokens-wont-fix-a-vague-task'));
    assert.ok(!home.includes('visible-video'));
    assert.equal((roadmap.match(/data-checkpoint-id=/g) ?? []).length, 28);
    const lessonTags = roadmap.match(/<details\b[^>]*data-mini-lesson=[^>]*>/g) ?? [];
    assert.equal(lessonTags.length, 5);
    assert.ok(lessonTags.every((tag) => !/\sopen(?:\s|=|>)/.test(tag)));
    assert.equal((roadmap.match(/<strong[^>]*>Try it:<\/strong>/g) ?? []).length, 5);
    assert.equal((roadmap.match(/Video coming soon/g) ?? []).length, 27);
    const checkpointHeaders = [...roadmap.matchAll(/data-checkpoint-id="([^"]+)"[^>]*>([\s\S]*?)<h4\b/g)];
    assert.equal(checkpointHeaders.length, 28);
    for (const [, id, header] of checkpointHeaders) {
      if (id === 'cheaper-tokens') {
        assert.ok(!header.includes('checkpoint-meta'));
        assert.ok(!header.includes('Video coming soon'));
      } else {
        assert.match(header, /class="checkpoint-meta"[^>]*>\s*<span[^>]*>Video coming soon<\/span>\s*<\/div>/);
      }
      assert.ok(!/\bavailable\b/i.test(header));
    }
    assert.ok(!/>\s*Planned\s*</.test(roadmap));
    for (const chapter of tokenTipsChapters) {
      for (const checkpoint of chapter.checkpoints) {
        assert.ok(roadmap.includes(`id="${checkpoint.id}"`));
        assert.ok(roadmap.includes(checkpoint.summary));
        if (checkpoint.lesson) {
          assert.ok(roadmap.includes(`data-mini-lesson="${checkpoint.id}"`));
          for (const reference of checkpoint.lesson.references) {
            assert.ok(roadmap.includes(`href="${reference.url}"`));
          }
        } else {
          assert.ok(!roadmap.includes(`data-mini-lesson="${checkpoint.id}"`));
        }
      }
    }
    assert.ok(roadmap.includes('href="/personal-site/notes/cheaper-tokens-wont-fix-a-vague-task/"'));
    assert.ok(roadmap.includes('href="/personal-site/notes/agent-context/"'));
    assert.ok(roadmap.includes('data-video-id="zyxwvutsrqp"'));
    const firstCheckpoint = roadmap.slice(
      roadmap.indexOf('data-checkpoint-id="cheaper-tokens"'),
      roadmap.indexOf('data-checkpoint-id="clear-target"'),
    );
    assert.ok(firstCheckpoint.indexOf('data-video-id="zyxwvutsrqp"') < firstCheckpoint.indexOf('data-mini-lesson='));
    assert.equal((firstCheckpoint.match(/data-video-id=/g) ?? []).length, 1);
    assert.ok(roadmap.includes('href="/personal-site/notes/visible-video/"'));
    assert.ok(roadmap.includes('More from the series'));
    assert.ok(!roadmap.includes('Private unreleased title'));
    assert.ok(!roadmap.includes('draftdraft1'));
    assert.ok(!routes.includes('clear-target'));
    for (const output of [home, archive, feed, sitemap, roadmap]) {
      assert.ok(!output.includes('/notes/clear-target/'));
      for (const hidden of ['hidden-draft', 'hidden-review', 'hidden-future']) {
        assert.ok(!output.includes(hidden));
      }
    }
    assert.ok(!roadmap.includes('<iframe'));
    assert.ok(!roadmap.includes('<video'));
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
