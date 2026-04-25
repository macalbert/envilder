import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['../../src/sdks/typescript/src/**/*.ts'],
      exclude: ['**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@envilder/sdk': path.resolve(__dirname, '../../src/sdks/typescript/src'),
    },
  },
});
