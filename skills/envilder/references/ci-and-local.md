# Local development and GitHub Actions

## Local development

### Run with the secrets in memory (preferred)

```bash
npx envilder exec --map=envilder.json -- npm run dev
npx envilder exec --map=config/dev/envilder.json --profile=my-app-dev -- dotnet run
npx envilder exec --provider=azure --vault-url=https://my-app-dev.vault.azure.net -- uv run app.py
```

- Envilder options come first; the command starts at the first argument that
  is not an Envilder option, or after `--`. Always write `--` for clarity.
- Fail-closed: the command does not start if any secret is missing or empty.
- Nothing is written to disk. It is not a sandbox: the command and its children
  can read the values.
- Wire it into the existing task runner. Example for an npm project that keeps
  `dev` unchanged:

  ```text
  "dev:secrets": "envilder exec --map=envilder.json -- npm run dev"
  ```

  Add `envilder` as a dev dependency (`npm install --save-dev envilder`) or use
  `npx envilder` so the version is explicit. Follow the project's package
  manager.

### Pull to a `.env` file (only when a tool needs a file)

```bash
npx envilder --map=envilder.json --envfile=.env
```

Check that `.env` is ignored by Git before suggesting this. Existing
assignments are replaced in place and other lines are kept. Remind the user
that the file now holds secrets.

### Credentials

- AWS: the default credential chain, `$config.profile` or `--profile`. An
  expired SSO session is reported and, on an interactive terminal, the CLI
  offers `aws sso login`. Region comes from `AWS_REGION` or the profile.
- Azure: `DefaultAzureCredential` (typically `az login` locally), plus
  `vaultUrl`.

## GitHub Actions

The Action lives at `macalbert/envilder/github-action`. Check its inputs at the
ref you pin before writing a workflow:

| Input | Notes |
|-------|-------|
| `map-file` | Required. Path from the repository root |
| `env-file` | Writes a `.env` file. **Required in the `v0` tag at the time of writing**; newer refs make it optional |
| `command` | Newer refs only: runs one bash command with the secrets in its environment only. Cannot be combined with `env-file` |
| `provider` | `aws` or `azure`; overrides `$config.provider` |
| `vault-url` | Overrides `$config.vaultUrl` |

When neither `env-file` nor `command` is set (newer refs), the secrets are
exported to the environment of every later step of the job. Prefer, from the
smallest exposure: `command`, then job environment, then `env-file`.

The Action registers every resolved value with GitHub's log masking. Never
`echo`, `cat` or upload the generated `.env` file, and never pass it to
`actions/upload-artifact`, caches or a Docker build context.

### AWS with OIDC (no long-lived keys)

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: eu-west-1

      - name: Check the map file
        run: npx envilder validate --offline --map=config/ci/envilder.json

      - name: Load secrets
        uses: macalbert/envilder/github-action@v0
        with:
          map-file: config/ci/envilder.json
          env-file: .env

      # Keep the project's own test command. It must load .env itself
      # (see the note below).
      - run: npm test
```

- With `env-file`, the Action only writes the file: the secrets reach a later
  step only if that step loads `.env`. Keep the project's existing test or
  build command, and check that its setup already loads `.env` (for example
  `dotenv` in the test setup file). If it does not, tell the user instead of
  replacing the command with another runner.
- The file is written for `dotenv`'s grammar and checked against it. Other
  loaders can read some values differently: Node's `--env-file` keeps a
  carriage return escaped in a quoted value as a literal `\r`, Docker Compose
  expands `$`, and Node `dotenv`, Compose and `source .env` skip or reject keys
  with `/`. If the project's loader is affected by its keys or values, say so
  and prefer the job environment or `command`, which pass values as they are.
- On a ref without the `env-file` requirement, drop `env-file` to export the
  secrets to later steps, or use `command` to scope them to one command.
- Do not set `$config.profile` in a map file used in CI: named profiles do not
  exist on the runner. Keep a separate CI map file when local files use one.
- IAM: allow `ssm:GetParameter` on the mapped paths only
  (`arn:aws:ssm:<region>:<account>:parameter/my-app/ci/*`), plus `kms:Decrypt`
  on the key of `SecureString` parameters encrypted with a customer managed
  key. `envilder validate` without `--offline` also needs
  `ssm:GetParameters`, scoped the same way.
- Restrict the role's trust policy to the repository and, when possible, the
  branch or GitHub environment (`token.actions.githubusercontent.com:sub`).
- Pin third-party actions the way the project already does (tag or SHA).

### Azure with OIDC

```yaml
      - uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}

      - uses: macalbert/envilder/github-action@v0
        with:
          map-file: config/ci/envilder.json
          env-file: .env
```

- Use a federated credential on the app registration or managed identity, not
  a client secret.
- Grant **Key Vault Secrets User** (RBAC) on that vault only, or the `Get`
  secret permission with access policies. `envilder validate` without
  `--offline` also needs list (metadata) access.

### Replacing existing `secrets.*` references

When the workflow already passes secrets with `env: X: ${{ secrets.X }}`,
map `X` in the CI map file, load it with the Action, and remove the old
`env:` entry only after the user confirms the secret exists in the provider.
Leave deleting the GitHub secret to the user.
