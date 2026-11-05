## Published packages

- [CLI on npm](https://www.npmjs.com/package/envilder): Install the CLI package `envilder`.
- [.NET SDK on NuGet](https://www.nuget.org/packages/Envilder/): Install the .NET runtime SDK package `Envilder`.
- [Python SDK on PyPI](https://pypi.org/project/envilder/): Install the Python runtime SDK package `envilder`.
- [Node.js SDK on npm](https://www.npmjs.com/package/@envilder/sdk): Install the Node.js runtime SDK package `@envilder/sdk`.

## Examples

- [Examples README](https://raw.githubusercontent.com/macalbert/envilder-examples/main/README.md): Runnable .NET, Python, and TypeScript examples that resolve secrets from AWS SSM and Azure Key Vault (emulated with LocalStack and Lowkey Vault) using Testcontainers or Aspire, plus `envilder exec`; paths, not values, are committed.
- [Examples repository](https://github.com/macalbert/envilder-examples): Source for the supported example scope above.
- [.NET Testcontainers example](https://github.com/macalbert/envilder-examples/tree/main/dotnet-testcontainers): xUnit v3 and Testcontainers.
- [.NET Aspire example](https://github.com/macalbert/envilder-examples/tree/main/dotnet-aspire): Aspire AppHost tested with `Aspire.Hosting.Testing`.
- [Python Testcontainers example](https://github.com/macalbert/envilder-examples/tree/main/python-testcontainers): pytest and Testcontainers.
- [TypeScript Testcontainers example](https://github.com/macalbert/envilder-examples/tree/main/typescript-testcontainers): Vitest and Testcontainers.
- [TypeScript Aspire example](https://github.com/macalbert/envilder-examples/tree/main/typescript-aspire): Aspire TypeScript AppHost.
- [CLI example](https://github.com/macalbert/envilder-examples/tree/main/cli): Push, pull, and `envilder exec` with `npx envilder`.

## Project status and contribution

- [Roadmap](https://raw.githubusercontent.com/macalbert/envilder/main/ROADMAP.md): Planned and in-progress work; roadmap items are not release commitments.
- [Changelog](https://envilder.com/changelog/): Released changes.
- [MIT license](https://raw.githubusercontent.com/macalbert/envilder/main/LICENSE): Terms for using, modifying, and distributing Envilder.
- [Security policy](https://raw.githubusercontent.com/macalbert/envilder/main/docs/SECURITY.md): Vulnerability reporting guidance.
- [Contributing guide](https://raw.githubusercontent.com/macalbert/envilder/main/CONTRIBUTING.md): Contribution process and local development guidance.
- [Feature request or issue](https://github.com/macalbert/envilder/issues/new): Request an unsupported provider or integration, or report a problem.

## Optional

- [LocalStack auth token out of Git with Docker Compose](https://dev.to/macalbert/how-i-run-localstack-without-committing-localstackauthtoken-34gk): Maintainer-authored supplementary article on keeping `LOCALSTACK_AUTH_TOKEN` out of commits.
- [LocalStack auth token in Testcontainers without a .env file](https://dev.to/macalbert/localstack-integration-tests-without-env-files-b75): Maintainer-authored supplementary article on resolving `LOCALSTACK_AUTH_TOKEN` in-process for Testcontainers and Aspire.
- [One year of Envilder](https://dev.to/macalbert/one-year-of-envilder-from-a-cli-script-to-sdks-push-mode-and-a-website-h49): Maintainer-authored supplementary retrospective.
- [Original AWS SSM CLI workflow](https://dev.to/macalbert/stop-hardcoding-secrets-generate-env-files-from-aws-ssm-with-a-simple-cli-f77): Maintainer-authored supplementary historical context documenting the original AWS SSM CLI workflow.
