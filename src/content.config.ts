import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const publicUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === 'https:' &&
    !/(^|\.)(sharepoint\.com|localhost|teams\.microsoft\.com|outlook\.office\.com)$/i.test(
      url.hostname,
    ) &&
    !/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) &&
    !url.hostname.includes(':') &&
    url.hostname.includes('.')
  );
}, 'Use a public HTTPS reference, not a private or local source.');

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    kind: z.enum(['video', 'article', 'note']),
    status: z.enum(['draft', 'review', 'published']).default('draft'),
    approvedForPublication: z.boolean().default(false),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    lastReviewedAt: z.coerce.date().optional(),
    series: z.literal('token-tips').optional(),
    order: z.number().int().positive().optional(),
    youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).optional(),
    durationSeconds: z.number().int().positive().optional(),
    scope: z.string().optional(),
    tryThis: z.string().optional(),
    caveat: z.string().optional(),
    transcript: z.string().min(1).optional(),
    topics: z.array(z.string()).default([]),
    publicSources: z.array(z.object({
      title: z.string().min(1),
      url: publicUrl,
    })).default([]),
  }).superRefine((data, context) => {
    if (data.status === 'published') {
      if (!data.approvedForPublication || !data.publishedAt) {
        context.addIssue({
          code: 'custom',
          message: 'Published content needs explicit approval and a publication date.',
        });
      }
      if (data.kind === 'video' && (!data.youtubeId || !data.durationSeconds || !data.transcript)) {
        context.addIssue({
          code: 'custom',
          message: 'Published videos need a real YouTube ID, duration, and transcript.',
        });
      }
    }
  }),
});

export const collections = { notes };
