export interface Publication {
  status: 'draft' | 'review' | 'published';
  approvedForPublication: boolean;
  publishedAt?: Date;
}

export function isPublished(entry: Publication, now = new Date()): boolean {
  return (
    entry.status === 'published' &&
    entry.approvedForPublication === true &&
    entry.publishedAt instanceof Date &&
    Number.isFinite(entry.publishedAt.getTime()) &&
    entry.publishedAt.getTime() <= now.getTime()
  );
}
