# Envilder skill: validation scenarios

Each scenario gives a prompt, the behaviour the skill must produce, and what is
checked automatically by [`EnvilderSkill.test.ts`](EnvilderSkill.test.ts). The
fixtures under [`scenarios/`](scenarios/) are run through the CLI's own map
file validator (`validateMapFile` with the providers the CLI wires) and env
file comparison (`compareEnvFileKeys`), so a scenario fails when the
implementation and the skill drift apart.

The behavioural part (what the agent does) is checked manually by running the
prompt with the skill installed in a sample project. It is not automated:
agent output is not deterministic.

## 1. .NET application using AWS SSM

**Prompt:** "Add Envilder to this ASP.NET API. It reads
`ConnectionStrings:Orders` and `Payments:ApiKey`; our parameters live in SSM
under `/orders-api/dev/`."

### Expected behaviour

- Inventories `IConfiguration` keys and `appsettings*.json` without reading
  secret values; maps only secrets.
- Writes `envilder.json` with `provider: aws` and the developer profile, using
  `ConnectionStrings__Orders` or `Payments/ApiKey` style keys so they bind to
  configuration sections.
- Runs `npx envilder validate --offline` and reports the result.
- Proposes `npx envilder exec -- dotnet run` for local development. Adds the
  `Envilder` NuGet package with `builder.Configuration.AddEnvilder(...)` only
  if there is no deployment step that can inject variables, and says why.

**Automated:** `dotnet-aws/envilder.json` passes the schema and CLI validation;
the C# calls in the skill exist in `src/sdks/dotnet`.

## 2. Node.js application with GitHub Actions

**Prompt:** "Our Next.js app's CI uses `secrets.DATABASE_URL` and
`secrets.SESSION_SECRET`. Move them to SSM with Envilder."

### Expected behaviour

- Writes a CI map file without `$config.profile`.
- Adds `aws-actions/configure-aws-credentials` with OIDC
  (`permissions: id-token: write, contents: read`) before
  `macalbert/envilder/github-action`, after checking the Action inputs at the
  pinned ref (`env-file` is required in `v0` today).
- Adds `npx envilder validate --offline` as an early step.
- Lists the IAM permissions scoped to the mapped paths and leaves removing the
  GitHub secrets to the user.
- Never echoes or uploads the generated `.env` file.

**Automated:** `nodejs-github-actions/envilder.json` is valid; every Action
input the skill uses exists in `github-action/action.yml`.

## 3. Python application with an existing Envilder configuration

**Prompt:** "This FastAPI service already has an `envilder.json` for Azure Key
Vault. Load it at runtime."

### Expected behaviour

- Reads the existing map file and runs `validate --offline` before changing
  anything.
- Prefers `envilder exec -- uv run ...` or the deployment platform; adds
  `envilder` from PyPI with `Envilder.load(...)` only when runtime loading is
  justified, at startup, without logging values.
- Notes that `/reports/dev/db-password` is read from Key Vault as
  `reports-dev-db-password`.

**Automated:** `python-existing-config/envilder.json` is valid; the Python calls
in the skill exist in `src/sdks/python`.

## 4. Application with existing environment variables (migration)

**Prompt:** "We have a `.env` with PORT, LOG_LEVEL, DB_PASSWORD and
SMTP_PASSWORD. Migrate it to Envilder."

### Expected behaviour

- Reads key names only (never `cat .env`).
- Maps `DB_PASSWORD` and `SMTP_PASSWORD`; leaves `PORT` and `LOG_LEVEL` as plain
  configuration and says so.
- Does not run the push. Gives the user
  `npx envilder --push --envfile=.env --map=envilder.json` to run themselves,
  then recommends switching to `exec` and deleting the `.env` file.

**Automated:** comparing `migration/.env.example` with `migration/envilder.json`
leaves only `PORT` and `LOG_LEVEL` undeclared and nothing missing.

## 5. Missing mappings, unsupported providers and invalid configurations

**Prompts:** "Why does Envilder reject this map file?" with each fixture under
`invalid/`, and "Check that every secret the app needs is mapped" with
`invalid/missing-mapping.*`.

### Expected behaviour

| Fixture | Expected diagnosis |
|---------|--------------------|
| `unsupported-provider.json` | `gcp` is in the schema but not runnable: use `aws` or `azure` |
| `azure-without-vault-url.json` | Add `$config.vaultUrl` |
| `azure-with-aws-profile.json` | Remove `profile`: AWS only |
| `non-string-and-bad-name.json` | Unknown `$config.region`, non-string `DB_PORT`, invalid name `DB URL` |
| `missing-mapping.*` | `STRIPE_API_KEY` is read by the app but not mapped; `PORT` is configuration |

The agent proposes a fix but never invents a secret path for
`STRIPE_API_KEY` as if it were confirmed.

**Automated:** each invalid fixture yields violations on exactly those keys;
the missing-mapping comparison reports `STRIPE_API_KEY` and `PORT` as
undeclared.

## Specification checks

Also automated: the frontmatter follows the Agent Skills specification (name
matches the directory, naming rules, description and compatibility lengths,
standard fields only), `SKILL.md` stays under 500 lines, every relative link
resolves, every JSON example is a valid map file, every CLI option and
subcommand exists in the CLI, and the providers the skill names are the ones
the CLI wires.
