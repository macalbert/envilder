#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

register('ts-node/esm', pathToFileURL('./scripts/pack-and-install.ts'));

async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.join(__dirname, '..');

  const packageFile = createPackage(rootDir);
  installPackageFile(rootDir, packageFile);
}

function createPackage(rootDir: string): string {
  console.log('📦 Creating package...');
  try {
    const output = execSync('npm pack', {
      cwd: rootDir,
      encoding: 'utf8',
    });

    const lines = output.trim().split(/\r?\n/);
    const packageFile = lines[lines.length - 1];

    if (!packageFile.endsWith('.tgz')) {
      throw new Error('Could not determine package file from npm pack output');
    }

    console.log(`✅ Package created as ${packageFile}`);
    return packageFile;
  } catch (_err) {
    const errorMessage = _err instanceof Error ? _err.message : String(_err);
    console.error(`❌ Failed to create package: ${errorMessage}`);
    process.exit(1);
  }
}

function installPackageFile(rootDir: string, packageFile: string): void {
  console.log('🔧 Installing package globally...');
  const packagePath = path.join(rootDir, packageFile);

  if (!existsSync(packagePath)) {
    console.error(`Error: Package file ${packagePath} does not exist!`);
    process.exit(1);
  }

  console.log(`Installing from package: ${packagePath}`);
  try {
    execSync(`npm install -g "${packagePath}"`, { stdio: 'inherit' });
    console.log('✅ Package installed globally');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed to install package globally: ${errorMessage}`);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error('🚨 Game over - installation failed! 🍄💥');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
