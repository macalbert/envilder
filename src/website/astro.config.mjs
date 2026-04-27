import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const rootPkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
);

const sdkNodePkg = JSON.parse(
  readFileSync(
    new URL('../sdks/nodejs/package.json', import.meta.url),
    'utf-8',
  ),
);

function extractCsprojVersion(relativePath) {
  try {
    const xml = readFileSync(new URL(relativePath, import.meta.url), 'utf-8');
    const match = xml.match(/<Version>(.*?)<\/Version>/);
    return match ? match[1] : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function extractPyprojectVersion(relativePath) {
  try {
    const toml = readFileSync(new URL(relativePath, import.meta.url), 'utf-8');
    const match = toml.match(/^version\s*=\s*"(.*?)"/m);
    return match ? match[1] : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const sdkDotnetVersion = extractCsprojVersion('../sdks/dotnet/Envilder.csproj');
const sdkPythonVersion = extractPyprojectVersion(
  '../sdks/python/pyproject.toml',
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

function readChangelog(relativePath) {
  try {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf-8');
  } catch {
    return '';
  }
}

const changelogCli = readChangelog('../../docs/changelogs/cli.md');
const changelogGha = readChangelog('../../docs/changelogs/gha.md');
const changelogSdkDotnet = readChangelog('../../docs/changelogs/sdk-dotnet.md');
const changelogSdkPython = readChangelog('../../docs/changelogs/sdk-python.md');
const changelogSdkNodejs = readChangelog(
  '../../docs/changelogs/sdk-nodejs.md',
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
      __CHANGELOG_CONTENT__: JSON.stringify(changelogContent),
      __CHANGELOG_CLI__: JSON.stringify(changelogCli),
      __CHANGELOG_GHA__: JSON.stringify(changelogGha),
      __CHANGELOG_SDK_DOTNET__: JSON.stringify(changelogSdkDotnet),
      __CHANGELOG_SDK_PYTHON__: JSON.stringify(changelogSdkPython),
      __CHANGELOG_SDK_NODEJS__: JSON.stringify(changelogSdkNodejs),
      __SDK_DOTNET_VERSION__: JSON.stringify(sdkDotnetVersion),
      __SDK_PYTHON_VERSION__: JSON.stringify(sdkPythonVersion),
      __SDK_NODEJS_VERSION__: JSON.stringify(sdkNodePkg.version),
    },
  },
  build: {
    assets: '_assets',
  },
});
