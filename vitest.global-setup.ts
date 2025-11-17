import { execSync } from 'node:child_process';

/**
 * Global setup for Vitest - runs once before all tests
 * Builds the GitHub Action bundle to ensure E2E tests use the latest code
 */
export async function setup() {
  console.log('🏗️ Building GitHub Action bundle...');
  try {
    execSync('pnpm build:gha', { stdio: 'inherit' });
    console.log('✅ GitHub Action bundle built successfully');
  } catch (error) {
    console.error('❌ Failed to build GitHub Action bundle:', error);
    throw error;
  }
}
