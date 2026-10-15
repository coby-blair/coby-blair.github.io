export function pathTo(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function absoluteUrl(path: string, site: URL) {
  return new URL(pathTo(path), site).href;
}
