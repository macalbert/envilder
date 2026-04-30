import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

export default defineConfig({
  root: repoRoot,
  test: {
    globals: false,
    environment: 'node',
    pool: 'forks',
    include: ['tests/sdks/nodejs/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'tests/sdks/nodejs/coverage',
      include: ['src/sdks/nodejs/src/**/*.ts'],
      exclude: ['**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@envilder/sdk': path.resolve(repoRoot, 'src/sdks/nodejs/src'),
    },
  },
});
