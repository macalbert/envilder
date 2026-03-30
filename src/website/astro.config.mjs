import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const rootPkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
);

let changelogContent = '';
try {
  changelogContent = readFileSync(
    new URL('../../docs/CHANGELOG.md', import.meta.url),
    'utf-8',
  );
} catch {
  // fallback: changelog not found at build time
}

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
      __CHANGELOG_CONTENT__: JSON.stringify(changelogContent),
    },
  },
  build: {
    assets: '_assets',
  },
});
