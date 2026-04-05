import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Global setup for Vitest - runs once before all tests (separate process).
 * - Local: generates .env via envilder if missing, then builds GHA bundle.
 * - CI: secrets come from GitHub Actions environment, skips envilder call.
 */
export async function setup() {
  const isCI = process.env.CI === 'true';

  if (!isCI) {
    const envFilePath = resolve(process.cwd(), '.env');
    if (!existsSync(envFilePath)) {
      console.log('⚙️  .env not found — fetching secrets via envilder...');
      execSync(`npx envilder --map=secrets-map.json --envfile=.env`, {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    }
  }

  console.log('🏗️ Building GitHub Action bundle...');
  try {
    execSync('pnpm build:gha', { stdio: 'inherit' });
    console.log('✅ GitHub Action bundle built successfully');
  } catch (error) {
    console.error('❌ Failed to build GitHub Action bundle:', error);
    throw error;
  }
}
