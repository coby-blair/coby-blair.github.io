// @ts-check
import { defineConfig } from 'astro/config';
import process from 'node:process';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4327',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  server: { host: '127.0.0.1', port: 4327 },
});
