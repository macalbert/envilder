import { spawnSync } from 'node:child_process';

async function readStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function parsePayload(raw) {
  if (!raw || raw.trim().length === 0) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function findToolName(payload) {
  const possible = [
    payload?.toolName,
    payload?.tool_name,
    payload?.toolCall?.name,
    payload?.tool_call?.name,
    payload?.name,
  ];

  for (const value of possible) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return '';
}

function findCommandString(payload) {
  const possible = [
    payload?.toolInput?.command,
    payload?.tool_input?.command,
    payload?.toolCall?.arguments?.command,
    payload?.tool_call?.arguments?.command,
    payload?.arguments?.command,
    payload?.command,
  ];

  for (const value of possible) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return '';
}

function isGitPush(command) {
  return /(^|\s)git\s+push(\s|$)/i.test(command);
}

function emitAllow(message) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
    },
    continue: true,
  };

  if (message) {
    output.systemMessage = message;
  }

  console.log(JSON.stringify(output));
}

function emitDeny(message) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: message,
      },
      continue: false,
      stopReason: message,
      systemMessage: message,
    }),
  );
}

function run(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    env: process.env,
  });
}

function ghAvailable() {
  const result = run('gh', ['--version']);
  return result.status === 0;
}

function readCurrentPrReviewDecision() {
  const result = run('gh', [
    'pr',
    'view',
    '--json',
    'number,url,reviewDecision',
  ]);

  if (result.status !== 0 || !result.stdout) {
    return null;
  }

  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

async function main() {
  const raw = await readStdin();
  const payload = parsePayload(raw);

  if (findToolName(payload) !== 'run_in_terminal') {
    emitAllow();
    return;
  }

  const command = findCommandString(payload);

  if (!isGitPush(command)) {
    emitAllow();
    return;
  }

  if (!ghAvailable()) {
    emitAllow(
      'PR review check skipped: GitHub CLI not available in this environment.',
    );
    return;
  }

  const pr = readCurrentPrReviewDecision();

  if (!pr) {
    emitAllow('PR review check skipped: no current PR context found.');
    return;
  }

  if (pr.reviewDecision === 'CHANGES_REQUESTED') {
    const message = `Blocked git push: PR #${pr.number} has review status CHANGES_REQUESTED (${pr.url}).`;
    emitDeny(message);
    process.exit(2);
    return;
  }

  emitAllow();
}

main().catch((error) => {
  const message =
    error instanceof Error
      ? `PR review check failed unexpectedly: ${error.message}`
      : 'PR review check failed unexpectedly.';

  emitAllow(message);
});
