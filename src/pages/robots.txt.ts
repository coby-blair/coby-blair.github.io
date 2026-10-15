import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/paths';

export const GET: APIRoute = ({ site }) => {
  const local = site!.hostname === 'localhost' || site!.hostname === '127.0.0.1';
  return new Response(local
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl('sitemap.xml', site!)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
