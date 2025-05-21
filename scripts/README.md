# Scripts

This directory contains utility scripts for the Envilder project.

## `pack-and-install.js`

This script is used to build the Envilder project, create a local tarball package (similar to `npm pack`),
and then install it globally from the local tarball. This allows for testing the `envilder` CLI as if it were
installed from npm, ensuring that packaging and global installation work correctly.

### Usage

You can run this script using the following yarn command defined in `package.json`:

```bash
yarn local:install
```

This command will first build the project (`yarn build`) and then execute `pack-and-install.js`.
