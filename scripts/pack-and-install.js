#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.join(__dirname, '..');
  
  const packageFile = createPackage(rootDir);  
  installPackageFile(rootDir, packageFile);
}

/**
 * Create a package file using npm pack
 * @param {Object} env Environment object with OS commands and paths
 * @returns {string} Path to the created package file
 */
function createPackage(rootDir) {
  console.log('📦 Creating package...');
  try {
    // Capture the output of npm pack to get the filename
    const output = execSync('npm pack', {
      cwd: rootDir,
      encoding: 'utf8',
    });

    // The last non-empty line is the filename
    const lines = output.trim().split(/\r?\n/);
    const packageFile = lines[lines.length - 1];
    if (!packageFile.endsWith('.tgz')) {
      throw new Error('Could not determine package file from npm pack output');
    }
    console.log(`✅ Package created as ${packageFile}`);

    return packageFile;

  } catch (err) {
    console.error(`❌ Failed to create package: ${err.message}`);
    process.exit(1);
  }
}

function installPackageFile(rootDir, packageFile) {
  console.log('🔧 Installing package globally...');
  const packagePath = path.join(rootDir, packageFile);
  
  if (!existsSync(packagePath)) {
    console.error(`Error: Package file ${packagePath} does not exist!`);
    process.exit(1);
  }
  
  console.log(`Installing from package: ${packagePath}`);
  execSync(`npm install -g "${packagePath}"`, { stdio: 'inherit' });
}

main().catch((error) => {
  console.error('🚨 Game over - installation failed! 🍄💥');
  console.error(error);
  process.exit(1);
});
