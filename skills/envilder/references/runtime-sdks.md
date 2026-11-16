# Runtime SDKs

The SDKs read the same `envilder.json` as the CLI and the Action. They only
read secrets: they never push. They have no code dependency on the CLI.

## Decide first

Prefer deployment-time injection (`envilder exec`, the GitHub Action, or the
platform's own secret injection). The application then reads ordinary
environment variables and gains no dependency. Use an SDK when:

- the process starts where nothing can inject variables beforehand;
- the app already composes configuration from providers (ASP.NET
  `IConfiguration`) and the map file should be one more source;
- the app must check the contract at startup (`WithContractValidation`).

Do not add an SDK only to replace `dotenv` in local development: use
`envilder exec` for that.

| Runtime | Package | Install |
|---------|---------|---------|
| .NET | `Envilder` (NuGet) | `dotnet add package Envilder` |
| Python 3.11+ | `envilder` (PyPI) | `uv add envilder` or `pip install envilder` |
| Node.js 22.12+ | `@envilder/sdk` (npm) | `npm install @envilder/sdk` |

Map file location: resolve it relative to the deployed app (copy it to the
output or image), not to the developer's working directory.

## .NET

ASP.NET Core, as a configuration source (the app keeps reading
`IConfiguration`):

```csharp
using Envilder;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvilder("envilder.json");
```

Keys with `/` become sections (`Database/Password` is `Database:Password`).
Other entry points:

```csharp
using Envilder;

await Env.LoadAsync("envilder.json");                     // resolve + inject into Environment
var secrets = await Env.ResolveFileAsync("envilder.json"); // resolve only

await Env.FromMapFile("envilder.json")
    .WithContractValidation()   // fail at startup if the contract does not hold
    .InjectAsync();
```

`Env.LoadAsync(environment, mapping)` picks a map file per environment name
(a `null` entry loads nothing). `ValidateContractAsync()` returns a result
instead of throwing; `ValidateSecrets()` throws when a resolved value is empty.

## Python

```python
from envilder import Envilder

Envilder.load("envilder.json")              # resolve + inject into os.environ
secrets = Envilder.resolve_file("envilder.json")  # resolve only

Envilder.from_map_file("envilder.json").with_contract_validation().inject()
```

`Envilder.load(env, {"production": "envilder.prod.json", "test": None})` picks
a map file per environment. `validate_contract()` returns a
`ContractValidationResult`; `validate_secrets(secrets)` raises when a value is
empty.

## Node.js

```typescript
import { Envilder } from '@envilder/sdk';

await Envilder.load('envilder.json'); // resolve + inject into process.env
const secrets = await Envilder.resolveFile('envilder.json'); // resolve only

await Envilder.fromMapFile('envilder.json').withContractValidation().inject();
```

`Envilder.load(env, { production: 'envilder.prod.json', test: null })` picks a
map file per environment. `validateContract()` returns a result;
`validateSecrets(secrets)` throws when a value is empty.

## Rules for generated code

- Never log, print or return secret values (the SDK examples in the Envilder
  repository print them for demonstration only). Log the variable names or a
  boolean at most.
- Load once at startup, before configuration is bound, not per request.
- Overrides (`withProvider`, `withProfile`, `withVaultUrl` and their .NET and
  Python equivalents) are for exceptions. Keep provider settings in
  `$config` so the contract stays in the file.
- Tests must not call the provider. Inject variables directly in tests, use
  a `test: null` entry in environment routing, or pass an in-memory fake to
  `withSecretProvider` (`with_secret_provider`, `WithSecretProvider`). A fake
  that also implements `ISecretExistenceChecker` exercises contract
  validation; without it every key fails as `provider_error`.
