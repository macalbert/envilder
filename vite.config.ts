import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'e2e/**/*.test.ts'],
    exclude: ['node_modules/**', 'tests/sdks/**'],
    globalSetup: './vitest.global-setup.ts',
    setupFiles: ['./vitest.setup.ts'],
    env: {
      // picocolors reads FORCE_COLOR once at module load time, so tests
      // that assert on ANSI-colored output stay deterministic regardless
      // of whether the runner has a TTY (local dev vs CI).
      FORCE_COLOR: '1',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      include: ['src/envilder/**/*.ts'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'coverage/**',
        'dist/**',
        'scripts/**',
        'src/sdks/**',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
});
