import path from 'node:path';
import { defineConfig } from 'vitest/config';

const repoRoot = path.resolve(__dirname, '../../..');

export default defineConfig({
  root: repoRoot,
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/sdks/typescript/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/sdks/typescript/src/**/*.ts'],
      exclude: ['**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@envilder/sdk': path.resolve(repoRoot, 'src/sdks/typescript/src'),
    },
  },
});
