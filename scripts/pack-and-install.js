#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chmod } from 'node:fs/promises';


const env = await initializeEnvironment();  
const packageFile = createPackage(env);

installPackage(env, packageFile);


/**
 * Initialize script and set up OS-specific commands and configurations
 * @returns {Object} Object containing OS commands, paths, and configuration
 */
async function initializeEnvironment() {
  const isWindows = process.platform === 'win32';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.join(__dirname, '..');
    
  const commands = {
    listTgzFiles: isWindows 
      ? 'dir /b /o:-d *.tgz' 
      : 'ls -t *.tgz | head -n 1',
    
    verifyInstall: isWindows
      ? 'where envilder'
      : 'which envilder',
  };
  
  await makeExecutable(isWindows);

  return {
    isWindows,
    rootDir,
    commands
  };
}

/**
 * Create a package file using yarn pack
 * @param {Object} env Environment object with OS commands and paths
 * @returns {string} Path to the created package file
 */
function createPackage(env) {
  console.log('📦 Creating package...');
  
  try {
    execSync('yarn pack', { 
      cwd: env.rootDir, 
      stdio: 'inherit'
    });
    
    const packageFile = execSync(env.commands.listTgzFiles, {
      cwd: env.rootDir,
      encoding: 'utf8'
    }).trim().split('\r\n')[0]; // Split and take first line
    
    if (!packageFile) {
      throw new Error('No package file found after yarn pack');
    }
    
    console.log(`✅ Package created as ${packageFile}`);
    return packageFile;
    
  } catch (err) {
    console.error(`❌ Failed to create package: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Install the package globally using yarn
 * @param {Object} env Environment object with OS commands and paths
 * @param {string} packageFile Name of the package file to install
 */
function installPackage(env, packageFile) {
  console.log('🔧 Installing package globally...');

  try {
    const packagePath = path.join(env.rootDir, packageFile);
    console.log(`Installing from package: ${packageFile}`);
    
    if (!existsSync(packagePath)) {
      console.error(`Error: Package file ${packageFile} does not exist!`);
      process.exit(1);
    }
    
    execSync(`yarn global add "${packagePath}"`, { 
      stdio: 'inherit'
    });
    
    const envPath = execSync(env.commands.verifyInstall, { encoding: 'utf8' }).trim();
    console.log(`✅ Package installed globally at: ${envPath}`);
  } catch (err) {
    console.error(`❌ Failed to install package: ${err.message}`);
    process.exit(1);
  }
}

async function makeExecutable(isWindows) {
  if (isWindows === false) {
    try {
      const scriptPath = fileURLToPath(import.meta.url);
      await chmod(scriptPath, 0o755);
      console.log('✅ Made script executable');
    } catch (err) {
      console.warn('⚠️ Could not set executable permissions on script:', err.message);
    }
  }
}
