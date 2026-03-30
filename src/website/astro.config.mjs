import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const rootPkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
);

export default defineConfig({
  site: 'https://envilder.com',
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ca', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(rootPkg.version),
    },
  },
  build: {
    assets: '_assets',
  },
});
