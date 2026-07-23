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
