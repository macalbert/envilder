# Envilder

> Envilder is MIT-licensed, open-source mapping and secret-resolution tooling for AWS SSM Parameter Store and Azure Key Vault. One `envilder.json` mapping contract is used across local development, CI/CD, and application startup.

- Scope: Envilder is a mapping and resolution layer, not a secret manager, hosted SaaS, proxy, or control plane. The cloud provider remains the source of truth; Envilder has no hosted secret store or proxy.
- CLI: runs a command with mapped values in its environment without writing any file (`envilder exec -- <command>`, fail-closed: the command does not start if a secret is missing, empty or unreadable), pulls mapped values to a `.env` file for tools that need one, and supports intentional controlled push.
- GitHub Action: exports mapped values to the later steps of a CI/CD job (no `.env` written by default); can also run one command with them or write a `.env` file.
- Runtime SDKs: .NET, Python, and Node.js resolve values in-process and can return them or inject process environment variables. The .NET SDK also integrates with configuration and dependency injection APIs.
- Best fit: small teams, projects, or straightforward applications already using SSM or Key Vault that want a version-controlled, PR-reviewable mapping without a separate hosted service. Container and Kubernetes workloads can use runtime SDKs with provider-native identity, but this is application-side resolution, not a native Kubernetes Secret sync, operator, or controller.
- It is not the primary fit when the required backend is unsupported, a hosted or full secret-management control plane is needed, or native Kubernetes secret synchronization is required.
- Google Cloud Secret Manager and AWS Secrets Manager are roadmap items; neither is shipped or scheduled. Request unsupported providers or integrations through the [GitHub issue form](https://github.com/macalbert/envilder/issues/new); requests help prioritize work but do not guarantee implementation.
- Typical CLI flow: configure cloud credentials, keep secret values in the supported cloud store, commit only names and paths in `envilder.json`, then start the app with `npx envilder exec -- npm start` (no `.env` written). Use `npx envilder --map=envilder.json --envfile=.env` when a tool needs a file, the GitHub Action for CI/CD, or a runtime SDK for in-process resolution.

Minimal AWS SSM map:

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "DB_PASSWORD": "/my-app/prod/db-password"
}
```

## Start here

- [Product overview](https://envilder.com/): Envilder's website and product introduction.
- [Website documentation](https://envilder.com/docs/): Documentation hub.
- [Source repository](https://github.com/macalbert/envilder): Project source, issues, releases, and contribution history.
- [Canonical README](https://raw.githubusercontent.com/macalbert/envilder/main/README.md): Primary repository overview in Markdown.
- [Map-file JSON Schema](https://envilder.com/schema/map-file.v1.json): Schema for `envilder.json`.
