![Envilder](https://github.com/user-attachments/assets/f646a3e7-6ae2-4f3b-8f51-3807067fc99c)

Envilder is a CLI tool for managing AWS SSM Parameter Store parameters and automatically generating the required
`.env` file. This tool simplifies project environment variable management, avoiding manual updates and ensuring
consistency across environments.

# ✨ Features

- 🔒 Fetch parameters securely from AWS SSM Parameter Store.
- ⚡ Automatically generates a `.env` file with specified parameters.
- 🛡️ Handles encrypted SSM parameters.
- 🪶 Lightweight and simple to use.
- 🔄 Support for multiple AWS profiles.

# Prerequisites

Before using `Envilder`, ensure that you have the AWS CLI installed and properly configured on your local
machine. This configuration is required for `Envilder` to access and manage parameters in AWS SSM.

## AWS CLI Installation & Configuration

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

   Make sure that the AWS credentials you're using have the appropriate permissions to access the SSM Parameter
   Store in your AWS account.

# Installation

You can install `Envilder` globally using yarn. This will allow you to use the `envilder` command from any
directory on your system.

```bash
yarn global add envilder
```

# 📦 Installation

You can install **envilder** globally or locally using npm:

```bash
npm install -g envilder
```

# 🚀 Usage

Envilder requires two arguments:

- `--map <path>`: Path to a JSON file mapping environment variable names to SSM parameters.
- `--envfile <path>`: Path where the generated .env file will be saved.

Optional arguments:

- `--profile <name>`: AWS CLI profile to use for credentials (if not using the default profile).

# 🔧 Example

1. Create a mapping file `param_map.json`:

    ```json
    {
      "SECRET_TOKEN": "/path/to/ssm/token",
      "SECRET_KEY": "/path/to/ssm/password"
    }
    ```

2. Run envilder to generate your `.env` file:

    ```bash
    envilder --map=param_map.json --envfile=.env
    ```

3. To use a specific AWS profile:

    ```bash
    envilder --map=param_map.json --envfile=.env --profile=dev-account
    ```

4. The `.env` file will be generated in the specified location.

## 🌐 Working with Multiple AWS Profiles

If you work with multiple AWS accounts or environments, you can configure different profiles in your AWS credentials file:

1. Edit your AWS credentials file (usually at `~/.aws/credentials` on Linux/Mac or `%USERPROFILE%\.aws\credentials` on Windows):

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

2. When running Envilder, specify which profile to use with the `--profile` option:

    ```bash
    # For development environment
    envilder --map=param_map.json --envfile=.env.development --profile=dev-account

    # For production environment
    envilder --map=param_map.json --envfile=.env.production --profile=prod-account
    ```

# 📂 Sample `.env` Output

```makefile
SECRET_TOKEN=mockedEmail@example.com
SECRET_KEY=mockedPassword
```

# 🧪 Running Tests

To run the tests with coverage:

```bash
yarn test
```

Here you can see the current coverage report: <https://macalbert.github.io/envilder/>

# 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

# 🙌 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.
