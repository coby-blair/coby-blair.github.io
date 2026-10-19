import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tokenTipsChapters, resolveTokenTipsRoadmap, standaloneTokenTipsVideos } from '../src/lib/token-tips.ts';
import { readProgress, writeProgress, roadmapStorageKey } from '../src/lib/roadmap-progress.ts';

const checkpoints = tokenTipsChapters.flatMap((chapter) => chapter.checkpoints);
const ids = checkpoints.map(({ id }) => id);
const now = new Date('2026-10-19T17:00:00Z');
const afterRelease = new Date('2026-10-19T19:00:00Z');

test('the full roadmap has 28 stable, unique checkpoints in five chapters', () => {
  assert.equal(tokenTipsChapters.length, 5);
  assert.equal(checkpoints.length, 28);
  assert.equal(new Set(ids).size, ids.length);
  for (const checkpoint of checkpoints) {
    assert.match(checkpoint.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(checkpoint.title.trim());
    assert.ok(checkpoint.summary.trim());
  }
  const resolved = resolveTokenTipsRoadmap([], now).flatMap(({ checkpoints }) => checkpoints);
  assert.deepEqual(resolved.map(({ number }) => number), Array.from({ length: 28 }, (_, index) => index + 1));
  assert.ok(resolved.every(({ note }) => note === undefined));
});

test('only the five foundation checkpoints have complete written mini-lessons', () => {
  const lessons = checkpoints.filter(({ lesson }) => lesson);
  assert.deepEqual(lessons.map(({ id }) => id), [
    'cheaper-tokens', 'clear-target', 'agent-context', 'token-types', 'context-quality',
  ]);
  for (const { lesson } of lessons) {
    assert.ok(lesson.paragraphs.length > 0);
    assert.ok(lesson.paragraphs.every((paragraph) => paragraph.trim().length > 0));
    assert.ok(lesson.tryThis.trim().length > 0);
    assert.ok(lesson.references.length > 0);
    for (const reference of lesson.references) {
      const url = new URL(reference.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(['code.visualstudio.com', 'docs.github.com'].includes(url.hostname));
      assert.ok(reference.title.trim());
    }
  }
});

function note(slug, overrides = {}) {
  return {
    data: {
      slug, series: 'token-tips', status: 'published', approvedForPublication: true,
      publishedAt: new Date('2026-10-01T00:00:00Z'),
      ...overrides,
    },
  };
}

test('roadmap links resolve by stable slug or explicit override, not episode order', () => {
  const first = note('cheaper-tokens-wont-fix-a-vague-task');
  const second = note('clear-target');
  const unrelated = note('agent-context', { series: undefined });
  const resolved = resolveTokenTipsRoadmap([second, unrelated, first], now)[0].checkpoints;
  assert.equal(resolved[0].note, first);
  assert.equal(resolved[1].note, second);
  assert.equal(resolved[2].note, undefined);
});

test('a matching slug never exposes a draft, review, future, or unapproved note', () => {
  for (const overrides of [
    { status: 'draft' },
    { status: 'review' },
    { approvedForPublication: false },
    { publishedAt: undefined },
    { publishedAt: new Date('2999-01-01T00:00:00Z') },
  ]) {
    const resolved = resolveTokenTipsRoadmap([note('clear-target', overrides)], now);
    assert.equal(resolved[0].checkpoints[1].note, undefined);
  }
});

test('the standalone episode is gated by its publication date and includes its local poster', () => {
  const before = resolveTokenTipsRoadmap([], now)[0].checkpoints[0];
  assert.equal(before.video, undefined);
  const after = resolveTokenTipsRoadmap([], afterRelease)[0].checkpoints[0];
  assert.equal(after.note, undefined);
  assert.equal(after.video.youtubeId, 'oVPT_51ld44');
  assert.equal(after.video.poster, 'token-tips-01-thumbnail.png');
});

test('a published video note replaces the standalone player rather than duplicating it', () => {
  const entry = note('cheaper-tokens-wont-fix-a-vague-task', {
    kind: 'video', youtubeId: 'zyxwvutsrqp', title: 'Replacement video',
  });
  const checkpoint = resolveTokenTipsRoadmap([entry], afterRelease)[0].checkpoints[0];
  assert.equal(checkpoint.note, entry);
  assert.equal(checkpoint.video.youtubeId, 'zyxwvutsrqp');
  assert.equal(checkpoint.video.title, 'Replacement video');
  assert.equal(checkpoint.video.poster, undefined);
  assert.deepEqual(standaloneTokenTipsVideos([entry], afterRelease), []);
});

test('standalone releases are shared by the homepage and feed only after publication', () => {
  assert.deepEqual(standaloneTokenTipsVideos([], now), []);
  const videos = standaloneTokenTipsVideos([], afterRelease);
  assert.equal(videos.length, 1);
  assert.equal(videos[0].id, 'cheaper-tokens');
  assert.equal(videos[0].publishedAt.toISOString(), '2026-10-19T18:42:50.000Z');
});

test('progress is versioned and round-trips stable checkpoint IDs', () => {
  assert.match(roadmapStorageKey, /:v1$/);
  const completed = new Set([ids[0], ids[5]]);
  assert.deepEqual(readProgress(writeProgress(completed), ids), { valid: true, completed });
  assert.deepEqual(readProgress(null, ids), { valid: true, completed: new Set() });
});

test('removed IDs and duplicate checkmarks do not distort progress', () => {
  const value = JSON.stringify({ version: 1, completed: [ids[0], 'removed-topic', ids[0]] });
  assert.deepEqual(readProgress(value, ids), { valid: true, completed: new Set([ids[0]]) });
  const reordered = [...ids].reverse();
  assert.deepEqual(readProgress(value, reordered), readProgress(value, ids));
});

test('invalid saved progress is explicitly reported rather than treated as valid', () => {
  for (const value of [
    '{', 'null', '[]', 'true',
    '{"version":2,"completed":[]}',
    '{"version":1,"completed":[1]}',
    '{"version":1}',
  ]) {
    assert.deepEqual(readProgress(value, ids), { valid: false, completed: new Set() });
  }
});
