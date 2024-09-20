const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['./src/envilder.ts'], // Point to your main TypeScript file
  bundle: true, // Bundle all dependencies
  platform: 'node', // Platform is Node.js
  target: ['node14'], // Set a target Node.js version
  outfile: './dist/envilder.js', // Output file
  external: ['aws-sdk'], // Exclude AWS SDK if you're assuming it's already installed in the environment
  tsconfig: 'tsconfig.json', // Use your existing tsconfig file
}).catch(() => process.exit(1));
