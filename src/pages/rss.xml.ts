import type { APIRoute } from 'astro';
import { publishedNotes } from '../lib/content';
import { absoluteUrl } from '../lib/paths';

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[character]!);
}

export const GET: APIRoute = async ({ site }) => {
  const notes = await publishedNotes();
  const origin = site!;
  const items = notes.map(({ data }) => {
    const url = escapeXml(absoluteUrl(`notes/${data.slug}/`, origin));
    return `<item><title>${escapeXml(data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${escapeXml(data.description)}</description><pubDate>${data.publishedAt!.toUTCString()}</pubDate></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Coby Blair - Notes</title><link>${escapeXml(absoluteUrl('', origin))}</link><description>Practical notes on AI and software.</description><language>en-us</language><atom:link href="${escapeXml(absoluteUrl('rss.xml', origin))}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
