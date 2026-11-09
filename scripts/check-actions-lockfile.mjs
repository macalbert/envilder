// Pre-commit check that .github/workflows/actions.lock covers every action
// the workflows use. `gh actions-lock --verify-local` reads the working
// tree, so it only describes the commit when every file it reads is staged:
// refuse unstaged or untracked workflows, lockfile and followed local
// action.yml files first. Skipped when gh or the extension is missing.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';

const WORKFLOWS_DIR = '.github/workflows';
const LOCKFILE = `${WORKFLOWS_DIR}/actions.lock`;
const SAME_REPO_USES = /^\s*-?\s*uses:\s*['"]?\$\/([^\s'"@#]+)/gm;

function hasActionsLock() {
  const result = spawnSync('gh', ['actions-lock', '--version'], {
    stdio: 'ignore',
  });
  return !result.error && result.status === 0;
}

function workflowFiles() {
  return readdirSync(WORKFLOWS_DIR)
    .filter((name) => /\.ya?ml$/.test(name))
    .map((name) => `${WORKFLOWS_DIR}/${name}`);
}

function actionFile(dir) {
  return ['action.yml', 'action.yaml']
    .map((name) => posix.join(dir, name))
    .find((file) => existsSync(file));
}

// Local actions reached through `uses: $/…`, from the workflows and,
// recursively, from the actions they use.
function followedActionFiles(workflows) {
  const found = new Set();
  const pending = [...workflows];
  while (pending.length > 0) {
    const text = readFileSync(pending.pop(), 'utf8');
    for (const [, dir] of text.matchAll(SAME_REPO_USES)) {
      const file = actionFile(dir.replace(/\/+$/, ''));
      if (file && !found.has(file)) {
        found.add(file);
        pending.push(file);
      }
    }
  }
  return [...found];
}

function notStaged(paths) {
  const status = execFileSync(
    'git',
    ['status', '--porcelain=v1', '--untracked-files=all', '--', ...paths],
    { encoding: 'utf8' },
  );
  // Second column is the working tree: anything but a space is unstaged
  // ("??" is untracked).
  return status
    .split('\n')
    .filter((line) => line.length > 3 && line[1] !== ' ');
}

if (!hasActionsLock()) {
  console.log(
    'Skipping actions.lock check: install gh and the gh-actions-lock extension (see CONTRIBUTING.md).',
  );
  process.exit(0);
}

const pathspecs = [
  `:(glob)${WORKFLOWS_DIR}/*.yml`,
  `:(glob)${WORKFLOWS_DIR}/*.yaml`,
  LOCKFILE,
  ...followedActionFiles(workflowFiles()),
];
const pending = notStaged(pathspecs);
if (pending.length > 0) {
  console.error(
    'Stage or stash these files before committing, so the lockfile check sees what you commit:',
  );
  for (const line of pending) console.error(`  ${line}`);
  process.exit(1);
}

const verify = spawnSync('gh', ['actions-lock', '--verify-local'], {
  stdio: 'inherit',
});
if (verify.status !== 0) {
  console.error(
    `${LOCKFILE} does not cover every action. Run gh actions-lock and stage the result.`,
  );
}
process.exit(verify.status ?? 1);
