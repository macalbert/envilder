import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

/**
 * Global setup for Vitest - runs once before all tests
 * Ensures .env exists (generates it via envilder if missing), then loads it.
 * Builds the GitHub Action bundle afterwards.
 */
export async function setup() {
  const envFilePath = resolve(process.cwd(), '.env');

  if (!existsSync(envFilePath)) {
    console.log('⚙️  .env not found — fetching secrets via envilder...');
    execSync(
      `npx envilder --map=secrets-map.json --envfile=.env`,
      { cwd: process.cwd(), stdio: 'inherit' },
    );
  }

  config({ path: envFilePath });
  console.log('🏗️ Building GitHub Action bundle...');
  try {
    execSync('pnpm build:gha', { stdio: 'inherit' });
    console.log('✅ GitHub Action bundle built successfully');
  } catch (error) {
    console.error('❌ Failed to build GitHub Action bundle:', error);
    throw error;
  }
}
