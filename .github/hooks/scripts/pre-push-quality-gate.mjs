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

function findStringValue(possible) {
  for (const value of possible) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return '';
}

function findCommandString(payload) {
  return findStringValue([
    payload?.toolInput?.command,
    payload?.tool_input?.command,
    payload?.toolCall?.arguments?.command,
    payload?.tool_call?.arguments?.command,
    payload?.arguments?.command,
    payload?.command,
  ]);
}

function findToolName(payload) {
  return findStringValue([
    payload?.toolName,
    payload?.tool_name,
    payload?.toolCall?.name,
    payload?.tool_call?.name,
    payload?.name,
  ]);
}

function findHookEventName(payload) {
  return findStringValue([
    payload?.hookEventName,
    payload?.hook_event_name,
    payload?.hookEvent?.name,
    payload?.hook_event?.name,
    payload?.eventName,
    payload?.event_name,
  ]);
}

function isGitPush(command) {
  // Match standalone command starts and common shell separators.
  return /(^|[;&|])\s*git\s+push(\s|$)/i.test(command);
}

function runStep(stepCommand) {
  const isWindows = process.platform === 'win32';
  const shell = isWindows ? 'cmd.exe' : '/bin/sh';
  const shellArg = isWindows ? '/c' : '-c';

  const result = spawnSync(shell, [shellArg, stepCommand], {
    stdio: 'inherit',
    env: process.env,
  });

  return result.status === 0;
}

function deny(eventName, message) {
  if (eventName === 'PreToolUse') {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: message,
        },
        continue: false,
        stopReason: message,
      }),
    );

    return;
  }

  console.log(
    JSON.stringify({
      continue: false,
      stopReason: message,
      systemMessage: message,
    }),
  );
}

function allow(eventName) {
  if (eventName === 'PreToolUse') {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'allow',
        },
        continue: true,
      }),
    );

    return;
  }

  console.log(
    JSON.stringify({
      continue: true,
    }),
  );
}

function runQualityGate(hookEventName, blockReason) {
  const steps = ['pnpm format:write', 'pnpm lint', 'pnpm test'];

  for (const step of steps) {
    const ok = runStep(step);

    if (!ok) {
      deny(
        hookEventName,
        `Blocked ${blockReason}: quality gate failed while running "${step}".`,
      );
      process.exit(2);
    }
  }

  allow(hookEventName);
}

async function main() {
  const raw = await readStdin();
  const payload = parsePayload(raw);
  const hookEventName = findHookEventName(payload) || 'PreToolUse';

  if (hookEventName === 'Stop') {
    runQualityGate(hookEventName, 'session stop');
    return;
  }

  const toolName = findToolName(payload);

  if (toolName !== 'run_in_terminal') {
    allow(hookEventName);
    return;
  }

  const command = findCommandString(payload);

  if (!isGitPush(command)) {
    allow(hookEventName);
    return;
  }

  runQualityGate(hookEventName, 'git push');
}

main().catch((error) => {
  const message =
    error instanceof Error
      ? error.message
      : 'Blocked git push: hook execution failed unexpectedly.';

  deny('PreToolUse', message);
  process.exit(2);
});
