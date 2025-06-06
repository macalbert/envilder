# Scripts

This directory contains utility scripts for the Envilder project.

## `pack-and-install.ts`

This script is used to build the Envilder project, create a local tarball package (similar to `npm pack`),
and then install it globally from the local tarball. This allows for testing the `envilder` CLI as if it were
installed from npm, ensuring that packaging and global installation work correctly.

### Usage

You can run this script using the following npm command defined in `package.json`:

```bash
npm run local:install
```

This command will first build the project (`npm run build`) and then execute `pack-and-install.ts`. Behind the scene it runs:

```bash
npm run build 
node --loader ts-node/esm scripts/pack-and-install.ts
```

You can also run this command directly if you prefer.
