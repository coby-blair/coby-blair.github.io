import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPublished } from '../src/lib/publication.ts';

const now = new Date('2026-10-15T21:00:00Z');
const published = {
  status: 'published',
  approvedForPublication: true,
  publishedAt: new Date('2026-10-14T12:00:00Z'),
};

test('an approved, dated publication is visible', () => {
  assert.equal(isPublished(published, now), true);
});

test('drafts and review entries never appear', () => {
  for (const status of ['draft', 'review']) {
    assert.equal(isPublished({ ...published, status }, now), false);
  }
});

test('publication without approval is hidden', () => {
  assert.equal(isPublished({ ...published, approvedForPublication: false }, now), false);
});

test('missing, invalid, or future dates are hidden', () => {
  for (const publishedAt of [undefined, new Date('invalid'), new Date('2030-01-01T00:00:00Z')]) {
    assert.equal(isPublished({ ...published, publishedAt }, now), false);
  }
});

test('a publication becomes visible at its scheduled instant', () => {
  assert.equal(isPublished({ ...published, publishedAt: now }, now), true);
});
