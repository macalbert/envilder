import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compareManifest, hashDocsPages, syncManifest } from './docs-dates.mjs';

const distDirectory = fileURLToPath(new URL('../dist', import.meta.url));
const manifestFile = fileURLToPath(
  new URL('../src/i18n/docs-dates.json', import.meta.url),
);

const manifest = JSON.parse(readFileSync(manifestFile, 'utf-8'));
const hashes = hashDocsPages(distDirectory);
const changes = compareManifest(manifest, hashes);

if (changes.length === 0) {
  console.log('docs-dates.json is up to date.');
} else {
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(
    manifestFile,
    `${JSON.stringify(syncManifest(manifest, hashes, today), null, 2)}\n`,
  );
  console.log(`Updated docs-dates.json (${today}):\n${changes.join('\n')}`);
  console.log('Rebuild the website to publish the new dates.');
}
