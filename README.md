# 🌱 Envilder

[![Coverage Status](https://macalbert.github.io/envilder/badge.svg?branch=main)](https://macalbert.github.io/envilder/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

`Envilder` is a CLI tool to manage AWS SSM Parameter Store parameters and automatically generate the required `.env` file. This tool simplifies environment variable management for projects, avoiding manual updates and ensuring consistency across environments.

## ✨ Features

- 🔒 Fetch parameters securely from AWS SSM Parameter Store.
- ⚡ Automatically generates a `.env` file with specified parameters.
- 🛡️ Handles both encrypted and unencrypted SSM parameters.
- 🪶 Lightweight and simple to use.

## Prerequisites

Before using `Envilder`, ensure that you have the AWS CLI installed and properly configured on your local machine. This configuration is required for `Envilder` to access and manage parameters in AWS SSM.

### AWS CLI Installation & Configuration

1. Install the AWS CLI by following the instructions [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. After installation, configure the AWS CLI using the following command:

    ```bash
    aws configure
    ```

    You'll be prompted to provide:
    - AWS Access Key ID
    - AWS Secret Access Key
    - Default region name (e.g., `us-east-1`)
    - Default output format (e.g., `json`)

   Make sure that the AWS credentials you're using have the appropriate permissions to access the SSM Parameter Store in your AWS account.

## Installation

You can install `Envilder` globally using yarn. This will allow you to use the `envilder` command from any directory on your system.

```bash
yarn global add envilder
```

## 📦 Installation

You can install **envilder** globally or locally using npm:

```bash
npm install -g envilder
```

## 🚀 Usage

Envilder requires two arguments:

- `--map <path>`: Path to a JSON file mapping environment variable names to SSM parameters.
- `--envfile <path>`: Path where the generated .env file will be saved.

## 🔧 Example

1. Create a mapping file `param_map.json`:

    ```json
    {
      "NEXT_PUBLIC_CREDENTIAL_EMAIL": "/path/to/ssm/email",
      "NEXT_PUBLIC_CREDENTIAL_PASSWORD": "/path/to/ssm/password"
    }
    ```

2. Run envilder to generate your `.env` file:

    ```bash
    envilder --map=param_map.json --envfile=.env
    ```

3. The `.env` file will be generated in the specified location.

## 📂 Sample `.env` Output

```makefile
NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com
NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword
```

## 🧪 Running Tests

To run the tests with coverage:

```bash
yarn test
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙌 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.
