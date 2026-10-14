# Envilder: Exec Command

## Overview

`envilder exec` resolves every secret declared in the map file and starts a
command with those values in its environment, **without writing anything to
disk**.

```bash
envilder exec -- npm run dev
envilder exec --map=config/envilder.json -- node server.js
envilder exec --provider=azure --vault-url=https://my-vault.vault.azure.net -- dotnet run
```

The map file stays in Git and the values stay in your cloud provider. The only
difference with pull mode is where the values end up:

```text
pull mode:  provider -> .env on disk -> process
exec mode:  provider -> memory -> child process environment
```

There is no `.env` file to gitignore, keep in sync or clean up, and nothing in
the working tree for editors, indexers, build tools or install scripts to read.

```mermaid
graph LR
    A[Mapping File] --> |Secret Paths| B[Envilder]:::core
    D[Cloud Credentials]:::cloud --> B
    B --> E[AWS SSM / Azure Key Vault]:::cloud
    B --> |Environment| F[Your command]

    classDef cloud fill:#ffcc66,color:#000000,stroke:#333,stroke-width:1.5px;
    classDef core fill:#1f3b57,color:#fff,stroke:#ccc,stroke-width:2px;
```

## Usage

```text
envilder exec [options] [--] <command> [args...]
```

| Option | Description |
| ------ | ----------- |
| `--map <path>` | Path to the map file. Defaults to `envilder.json` in the current directory. |
| `--profile <name>` | AWS CLI profile. Overrides `$config.profile`. |
| `--provider <name>` | `aws` or `azure`. Overrides `$config.provider`. |
| `--vault-url <url>` | Azure Key Vault URL. Overrides `$config.vaultUrl`. |

The map file and its `$config` section work exactly as in pull mode. See
[Mapping File Format](../README.md#️-mapping-file-format).

### Where the command starts: the `--` rule

Envilder options come first. The command starts at the **first argument that
is not an Envilder option**, or right after `--` when present. Everything from
there on is passed to the command verbatim, even if it looks like an Envilder
option.

```bash
envilder exec npm run dev                       # everything belongs to npm
envilder exec --map=cfg.json npm run dev        # --map is Envilder's, the rest is npm's
envilder exec npm run dev --map=x               # --map=x belongs to npm (it comes after the command)
envilder exec --map=cfg.json -- npm run dev     # same, with an explicit separator
envilder exec -- -weird-program-name            # use -- when the command itself starts with -
```

An unknown option before the command is an error (exit code `125`), so a typo
such as `--mapp` never reaches your command by accident.

Envilder options also go **after** `exec`, never before it. An option written
before `exec` is rejected with exit code `125` instead of being silently
ignored, and Envilder shows the corrected command:

```text
$ envilder --map=config/prod.json exec -- npm start
error: Put envilder options after "exec": envilder exec --map=config/prod.json -- npm …
```

The suggestion shows your command by program name only, followed by `…` when
it has arguments: arguments can carry secrets (for example an
`Authorization` header), so Envilder never prints them.

Only the options exec supports (`--map`, `--profile`, `--provider`,
`--vault-url`) are moved into the suggested command. Options exec does not
support (`--envfile`, `--push`, `--key`, `--value`, `--secret-path`,
`--ssm-path`) are named but **their values are never printed**, because a
value such as `--value` can be a secret:

```text
$ envilder --value=s3cret exec -- node app.js
error: Put envilder options after "exec".
--value cannot be used with exec.
```

### Options that are rejected

Exec mode never reads or writes a `.env` file and never pushes secrets. These
options are rejected before any provider call, with exit code `125`:

| Option | Message |
| ------ | ------- |
| `--envfile` | `--envfile cannot be used with exec: exec mode never reads or writes a .env file.` |
| `--push` | `--push cannot be used with exec.` |
| `--key`, `--value`, `--secret-path`, `--ssm-path` | `Single-secret push options cannot be used with exec.` |

### No shell

Arguments are passed to the command as an argument list, without a shell. The
command receives `$DB_URL`, `%PATH%` or `&&` literally. If you need shell
features, start a shell explicitly:

```bash
envilder exec -- sh -c 'echo $DB_URL'
```

On Windows, npm-style `.cmd`/`.bat` shims such as `npm` and `npx` work without
enabling shell interpretation of the arguments. To do this, Envilder (through
`cross-spawn`) runs shims, and commands it cannot resolve to an executable,
via `cmd.exe /d /s /c` with every argument escaped. Two visible consequences:

* When the command does not exist, `cmd.exe` prints its own "is not
  recognized as an internal or external command" line (in the system
  language) before Envilder's `Command not found: <command>`. The exit code is
  still `127`.
* `cmd.exe` builtins such as `echo` or `dir` resolve and run.

## Exit codes

Exit codes follow GNU `env` and `docker run`, so you can tell an Envilder
failure apart from your command's own exit code:

| Code | Meaning |
| ---- | ------- |
| `n` | Your command exited with code `n` |
| `128 + n` | Your command was killed by signal `n` (for example `137` for `SIGKILL`) |
| `125` | Envilder failed before starting the command: bad options, missing command, no map file, unresolved secrets, expired credentials |
| `126` | The command exists but cannot be executed (for example, a script without the executable bit) |
| `127` | The command was not found |

On Windows, a signal that Envilder forwards to the command is still reported
as a signal, so `128 + n` applies: `SIGTERM` gives `143`, `SIGINT` gives `130`,
and `SIGHUP` is reported as `SIGKILL`, giving `137`. A command terminated from
outside Envilder (for example by Task Manager or `taskkill /F`) typically exits
with code `1` instead.

Options written before `exec` are also an Envilder error (`125`); see
[Where the command starts](#where-the-command-starts-the----rule).

Other modes (pull and push) keep exiting with `1` on failure.

## Fail-closed resolution

Pull mode warns and skips a secret that is missing or empty. **Exec mode never
starts the command with an incomplete set of secrets**: if any secret is
missing, empty or cannot be read (for example, access denied), the command is
not started, Envilder lists the affected variables with their masked paths and
exits with `125`.

Other conditions that stop the command from starting:

* A secret value contains a NUL byte, which cannot be passed in an environment
  variable.
* The AWS credentials or SSO session expired. In an interactive terminal
  Envilder offers to run `aws sso login` and then retries **only the secret
  resolution**: your command is started at most once. If you decline or the
  login fails, the exit code is `125`. The prompt and the login output go to
  stderr, so the prompt also works when stdout is redirected
  (`envilder exec -- node print.js > out.json`); it needs stdin and stderr to
  be a terminal.
* On Windows, the map file declares names that differ only by case (for
  example `Path` and `PATH`). Windows treats them as the same variable, so
  Envilder exits with `125` before any provider call instead of silently
  dropping one. On Linux and macOS both names are kept.

A map file that declares no variables (only `$config`) is not an error: the
command starts with the inherited environment and Envilder prints
`Map file declares no variables.`

## Environment composition

The command inherits the full environment of the shell that runs Envilder,
plus every variable declared in the map file.

**The map file wins.** When an inherited variable has the same name as a mapped
one, the command sees the value from the provider, and Envilder prints the
names (never the values) on stderr:

```text
Overriding inherited variables: API_KEY
```

On Windows, names are compared case-insensitively: an inherited `Path` and a
mapped `PATH` are the same variable, the mapped value wins, and the command
gets exactly one entry. Within the map file itself, names that differ only by
case are rejected on Windows (see
[Fail-closed resolution](#fail-closed-resolution)).

Values reach the command byte for byte: multi-line values (such as PEM keys),
`=`, quotes, `#`, `$` and non-ASCII characters are not escaped, quoted or
expanded.

## Output

Your command owns stdout. All Envilder output goes to **stderr**, so
`envilder exec -- node print.js > out.json` writes only your command's output
to `out.json`.

On success Envilder prints a single summary line, for example:

```text
envilder: 2 secrets resolved (aws, profile=dev) → npm …
```

The summary names your command by program name only, followed by `…` when it
has arguments (a command without arguments shows as `→ node`). Arguments are
never printed by Envilder because they can carry secrets; your command still
receives them unchanged.

The per-secret block is shown only when something fails. Secret values are
never printed; resolved values appear masked. The ASCII banner only appears in
`envilder --help`.

### GitHub Actions masking

When `GITHUB_ACTIONS=true`, Envilder registers every resolved value with
GitHub's log masking (`::add-mask::`) **before** the command starts, so values
your command prints are masked in the job log. Envilder waits until every mask
registration has been written to stdout before it starts the command, so the
command's output can never reach the log ahead of them; if a registration
cannot be written, the command is not started (exit code `125`). GitHub reads
these commands from stdout, so they are the one documented exception to the
stdout rule above. Outside GitHub Actions nothing is emitted.

```yaml
- run: npx envilder exec -- npm test
```

## Signals

* **Ctrl+C** in an interactive terminal: the terminal already sends `SIGINT` to
  your command, so Envilder does not forward it a second time. Envilder stays
  alive until your command exits and returns its exit code. A `SIGINT` sent to
  Envilder when it is not attached to a terminal is forwarded.
  Envilder decides this by checking whether its **stdin** is a terminal. With
  piped stdin (`producer | envilder exec -- app`) a Ctrl+C in the terminal can
  therefore reach your command twice: once from the terminal and once
  forwarded by Envilder. On Windows a forwarded `SIGINT` terminates the
  command instead of interrupting it.
* **`SIGTERM` and `SIGHUP`** (for example from `docker stop`, Kubernetes or a
  process manager): Envilder forwards the signal to your command and **waits
  for it to exit, with no timeout of its own**. Escalating to `SIGKILL` after a
  grace period is left to the process manager.
* **What is guaranteed**: like `chamber exec` and `op run`, Envilder forwards
  signals to its **direct child only**; it does not signal the child's process
  group. Envilder never exits before its direct child. Stopping the processes that child started is the child's
  responsibility: a launcher (`npm`, a shell script) that exits on `SIGTERM`
  without stopping its own children can leave them running, on any operating
  system. On Windows the same applies to `.cmd`/`.bat` shims such as `npm`: a
  forwarded signal terminates the `cmd.exe` shim and the shim's own child may
  keep running. Console Ctrl+C and closing the console reach the whole console
  group.
* stdin, stdout and stderr are inherited and the TTY is preserved, so
  interactive commands (REPLs, shells, prompts) work as usual.

## Not a sandbox

Exec mode removes the `.env` file from disk. **It does not isolate the
process.**

* Your command and **every process it starts** have the secrets in their
  environment and can read them. That includes any tool or AI coding agent that
  runs `env`, `printenv` or similar through it.
* On Linux, other processes running as the same user can read
  `/proc/<pid>/environ`.
* Exec mode does not restrict network access, file access or what your command
  does with the values.

Only run commands you trust with the secrets you map.

## What exec mode does not do

* **No live refresh.** Values are resolved once, when the command starts.
* **No `.env` fallback or merge.** Exec mode never reads a `.env` file, even if
  one exists in the current directory, and never creates one.
* **No temporary files.** Nothing is written to the working directory, the OS
  temp directory or any Envilder configuration directory.
* The GitHub Action and the runtime SDKs do not offer exec mode. The SDKs
  already resolve secrets in-process.
