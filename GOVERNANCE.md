# Governance

This document describes how Envilder is run: who makes decisions, how they
are made, and what each role is responsible for.

## Governance model

Envilder is a single-maintainer project with a "benevolent dictator" model.
The maintainer has the final say on what is merged and released, and aims
to make decisions in the open so that anyone can follow and challenge them.

## How decisions are made

| Kind of decision | Where it happens | How it is recorded |
|------------------|------------------|--------------------|
| Bug reports and feature requests | [GitHub Issues](https://github.com/macalbert/envilder/issues) | The issue thread |
| Code and documentation changes | Pull requests against `main` | The pull request review and the merged commit |
| Architecture and tooling choices | A pull request that adds an ADR | [`docs/adr/`](docs/adr/) |
| Scope and priorities | Issues and the roadmap | [`ROADMAP.md`](ROADMAP.md) |
| Security fixes | Private security advisories | [`docs/SECURITY.md`](docs/SECURITY.md) and the published advisory |

Any change to the architecture, the map-file format or a public interface
needs an ADR in `docs/adr/` before or together with the implementation.
Disagreements are discussed on the issue or pull request; if no consensus is
reached, the maintainer decides and explains why on the thread.

## Roles and responsibilities

| Role | Who | Responsibilities |
|------|-----|------------------|
| Maintainer | [@macalbert](https://github.com/macalbert) | Triage issues; review and merge pull requests; keep CI green; cut releases of the CLI, GitHub Action and SDKs; respond to vulnerability reports as described in [`docs/SECURITY.md`](docs/SECURITY.md); keep the roadmap and documentation current; enforce the [Code of Conduct](CODE_OF_CONDUCT.md) |
| Contributor | Anyone who opens an issue or pull request | Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md); add tests for new functionality and bug fixes; keep pull requests focused |
| Security reporter | Anyone who finds a vulnerability | Report it privately as described in [`docs/SECURITY.md`](docs/SECURITY.md) instead of opening a public issue |

The maintainer is also the default code owner for the whole repository
(see [`.github/CODEOWNERS`](.github/CODEOWNERS)).

## Becoming a maintainer

Contributors who have made sustained, high-quality contributions over time
may be invited to become maintainers. New maintainers are added to
`.github/CODEOWNERS` and to this document, and receive the repository and
package registry access needed to release.

## Continuity

The project aims to keep working if the maintainer becomes unavailable:
issues can be triaged, changes accepted and new versions released within a
week.

- **Repository**: the source lives at
  [github.com/macalbert/envilder](https://github.com/macalbert/envilder).
- **Releases**: npm (`envilder`, `@envilder/sdk`) and PyPI (`envilder`) are
  published from GitHub Actions through trusted publishing (OIDC), so anyone
  with admin access to the repository can publish a release without holding
  registry passwords. NuGet (`Envilder`) is also published from GitHub
  Actions through OIDC login.
- **Access**: the people other than the maintainer who hold admin access to
  the repository and owner access to the npm, PyPI and NuGet packages are
  listed in the roles table above once appointed.
