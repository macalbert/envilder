# Envilder

<p align="center">
  <img src="https://github.com/user-attachments/assets/96bf1efa-7d21-440a-a414-3a20e7f9a1f1" alt="Envilder">
</p>

<p align="center">
  <b>✨ A CLI that securely centralizes your environment variables from AWS SSM as a single source of truth ✨</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/envilder">
    <img src="https://img.shields.io/npm/v/envilder.svg" alt="npm version">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
  <a href="https://macalbert.github.io/envilder/">
    <img src="https://img.shields.io/badge/coverage-report-green.svg" alt="Coverage Report">
  </a>
</p>

---

## Video Demonstration 🎥

Check out this video to learn how to use Envilder:

<https://github.com/user-attachments/assets/3c4985e6-49e9-4f29-bf1c-130747df0ca6>

---

## Table of contents

- [Envilder](#envilder)
  - [Video Demonstration 🎥](#video-demonstration-)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
    - [Feature status](#feature-status)
  - [Quick start 🚀](#quick-start-)
  - [How it works 🛠️](#how-it-works-️)
  - [Installation 💾](#installation-)
  - [Usage](#usage)
    - [Push Mode (`--push`)](#push-mode---push)
      - [Options](#options)
      - [Examples](#examples)
    - [Pull Mode (`--map` and `--envfile`)](#pull-mode---map-and---envfile)
      - [Options](#options-1)
      - [Examples](#examples-1)
  - [Working with multiple AWS profiles](#working-with-multiple-aws-profiles)
    - [Pull Mode Example](#pull-mode-example)
    - [Push Mode Example](#push-mode-example)
  - [Sample output 📄](#sample-output-)
  - [Roadmap 🗺️](#roadmap-️)
  - [Contributing 🤝](#contributing-)
  - [License 📄](#license-)

---

## Features

- **🔒 Strict access control** — AWS IAM policies control who accesses which secrets (dev vs prod)
- **📊 Full audit trail** — All parameter access is logged in CloudTrail for compliance
- **🧩 Single source of truth** — No more copying .env files from Notion or emails
- **🔁 Idempotent operations** — Only variables in your mapping file are overwritten; others are preserved
- **🧱 No extra infrastructure** — Uses AWS SSM's reliability, no new services needed

### Feature status

| Feature                        | Status         | Notes |
|--------------------------------|---------------|-------|
| Mapping-based secret resolution| ✅ Implemented | |
| .env file generation           | ✅ Implemented | |
| AWS profile support            | ✅ Implemented | |
| Auto-discovery mode (`--auto`) | ❌ Not implemented | Planned |
| Check/sync mode (`--check`)    | ❌ Not implemented | Planned |
| Import/push mode (`--push`)  | ✅ Implemented | |
| Webhook/Slack notification     | ❌ Not implemented | Planned |
| Hierarchical mapping           | ❌ Not implemented | Only flat JSON mapping supported |
| Plugin system                  | ❌ Not implemented | Only AWS SSM supported |

---

## Quick start 🚀

```bash
npm install -g envilder

# Watch the video demonstration for detailed guidance
# https://github.com/user-attachments/assets/3c4985e6-49e9-4f29-bf1c-130747df0ca6

echo '{"DB_PASSWORD": "/my-app/db/password"}' > param-map.json

envilder --map=param-map.json --envfile=.env
```

---

## How it works 🛠️

```mermaid

graph LR
    A[Mapping File] --> B[Envilder]
    C[AWS Credentials] --> B
    B --> D[.env File]
    E[SSM Parameters] --> B

```

1. **Define your mapping** — Simple JSON mapping env vars to SSM paths
2. **Run Envilder** — One command with your mapping file
3. **Auto-fetch from AWS** — Retrieves values using your AWS credentials
4. **Get your .env file** — Ready to use in your project

---

## Installation 💾

**Requires:** Node.js >= 20.0.0, AWS CLI configured with SSM access

```bash
npm install -g envilder
```

---

## Usage

### Push Mode (`--push`)

Push local `.env` files or single variables back to AWS SSM Parameter Store. This is useful for syncing local environment variables with AWS.

#### Options

**General Options:**

| Option      | Description                                 |
|-------------|---------------------------------------------|
| `--map`     | Path to JSON mapping file (required)         |
| `--envfile` | Path to output .env file (required)          |
| `--profile` | AWS CLI profile to use (optional)            |

**Push-Specific Options:**

| Option      | Description                                 |
|-------------|---------------------------------------------|
| `--push`    | Enables push mode                           |
| `--key`     | Single environment variable name to push    |
| `--value`   | Value of the single environment variable    |
| `--ssm-path`| SSM path for the single environment variable|

#### Examples

1. **Push a local `.env` file to AWS SSM:**

    ```bash
    envilder --push --envfile=.env --map=param-map.json
    ```

2. **Push a single environment variable to AWS SSM:**

    ```bash
    envilder --push --key=API_KEY --value=secret123 --ssm-path=/my/path
    ```

3. **Push a single variable using a specific AWS profile:**

    ```bash
    envilder --push --key=API_KEY --value=secret123 --ssm-path=/my/path --profile=dev-account
    ```

---

### Pull Mode (`--map` and `--envfile`)

Generate a `.env` file by pulling environment variables from AWS SSM Parameter Store. This is useful for creating local environment files for development or CI/CD pipelines.

#### Options

| Option      | Description                                 |
|-------------|---------------------------------------------|
| `--map`     | Path to JSON mapping file (required)         |
| `--envfile` | Path to output .env file (required)          |
| `--profile` | AWS CLI profile to use (optional)            |

#### Examples

1. **Generate a `.env` file from AWS SSM:**

    ```bash
    envilder --map=param-map.json --envfile=.env
    ```

2. **Generate a `.env` file using a specific AWS profile:**

    ```bash
    envilder --map=param-map.json --envfile=.env --profile=dev-account
    ```

---

## Working with multiple AWS profiles

Configure different profiles in your AWS credentials file (usually at `~/.aws/credentials` or `%USERPROFILE%\.aws\credentials`):

```ini
[default]
aws_access_key_id=YOUR_DEFAULT_ACCESS_KEY
aws_secret_access_key=YOUR_DEFAULT_SECRET_KEY

[dev-account]
aws_access_key_id=YOUR_DEV_ACCESS_KEY
aws_secret_access_key=YOUR_DEV_SECRET_KEY

[prod-account]
aws_access_key_id=YOUR_PROD_ACCESS_KEY
aws_secret_access_key=YOUR_PROD_SECRET_KEY
```

Specify which profile to use:

### Pull Mode Example

Generate a `.env` file using a specific AWS profile:

```bash
# Development
envilder --map=param-map.json --envfile=.env.development --profile=dev-account

# Production
envilder --map=param-map.json --envfile=.env.production --profile=prod-account
```

### Push Mode Example

Push a single environment variable using a specific AWS profile:

```bash
# Development
envilder --push --key=API_KEY --value=secret123 --ssm-path=/my/path --profile=dev-account

# Production
envilder --push --key=API_KEY --value=secret123 --ssm-path=/my/path --profile=prod-account
```

---

## Sample output 📄

Example `.env` file generated:

```ini
SECRET_TOKEN=mockedEmail@example.com
SECRET_KEY=mockedPassword
```

---

## Roadmap 🗺️

See [ROADMAP.md](./ROADMAP.md) for planned features and ideas.

---

## Contributing 🤝

Contributions are welcome! Please see the [contributing guidelines](https://github.com/macalbert/envilder/blob/main/.github/pull_request_template.md).

Feel free to open issues or pull requests.

---

## License 📄

MIT © [Marçal Albert](https://github.com/macalbert).

See [LICENSE](./LICENSE) for details.

---
