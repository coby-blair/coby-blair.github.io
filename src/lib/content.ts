import { getCollection } from 'astro:content';
import { isPublished } from './publication';

export async function publishedNotes() {
  const entries = await getCollection('notes');
  const slugs = new Set<string>();
  const orders = new Set<number>();

  for (const entry of entries) {
    if (slugs.has(entry.data.slug)) {
      throw new Error(`Duplicate note slug: ${entry.data.slug}`);
    }
    slugs.add(entry.data.slug);
    if (entry.data.series && entry.data.order !== undefined) {
      if (orders.has(entry.data.order)) {
        throw new Error(`Duplicate token-tips order: ${entry.data.order}`);
      }
      orders.add(entry.data.order);
    }
  }

  const now = new Date();
  return entries
    .filter((entry) => isPublished(entry.data, now))
    .sort((a, b) => b.data.publishedAt!.getTime() - a.data.publishedAt!.getTime());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
