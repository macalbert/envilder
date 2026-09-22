import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

await build({
  entryPoints: ['lib/envilder/apps/gha/entry/Index.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  minify: true,
  outfile: 'github-action/dist/index.js',
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
});

const subdirectoryManifest = await readFile(
  'github-action/action.yml',
  'utf-8',
);
const githubActionPath = '$' + '{{ github.action_path }}';
const marketplaceManifest = subdirectoryManifest.replace(
  `${githubActionPath}/dist/index.js`,
  `${githubActionPath}/github-action/dist/index.js`,
);

await writeFile('action.yml', marketplaceManifest);
