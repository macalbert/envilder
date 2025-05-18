import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**', 'tests/**', 'coverage/**', 'dist/**', 'scripts/**', '**/*.config.*', '**/*.d.ts'],
    },
  },
});
