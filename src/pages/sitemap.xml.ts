import type { APIRoute } from 'astro';
import { publishedNotes } from '../lib/content';
import { absoluteUrl } from '../lib/paths';

export const GET: APIRoute = async ({ site }) => {
  const notes = await publishedNotes();
  const paths = ['', 'notes/', 'about/', 'series/token-tips/', ...notes.map(({ data }) => `notes/${data.slug}/`)];
  const urls = paths.map((path) => `<url><loc>${absoluteUrl(path, site!)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
