import type { APIRoute } from 'astro';
import { publishedNotes } from '../lib/content';
import { absoluteUrl } from '../lib/paths';
import { standaloneTokenTipsVideos } from '../lib/token-tips';

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[character]!);
}

export const GET: APIRoute = async ({ site }) => {
  const notes = await publishedNotes();
  const origin = site!;
  const entries = [
    ...notes.map(({ data }) => ({
      ...data,
      path: `notes/${data.slug}/`,
      publishedAt: data.publishedAt!,
    })),
    ...standaloneTokenTipsVideos(notes).map((video) => ({
      ...video,
      path: `series/token-tips/#${video.id}`,
    })),
  ].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const items = entries.map((entry) => {
    const url = escapeXml(absoluteUrl(entry.path, origin));
    return `<item><title>${escapeXml(entry.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${escapeXml(entry.description)}</description><pubDate>${entry.publishedAt.toUTCString()}</pubDate></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Coby Blair - Notes</title><link>${escapeXml(absoluteUrl('', origin))}</link><description>Practical notes on AI and software.</description><language>en-us</language><atom:link href="${escapeXml(absoluteUrl('rss.xml', origin))}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
