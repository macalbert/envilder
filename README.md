# Envilder

**Envilder** is a CLI tool designed to generate `.env` files from AWS SSM parameters. This is useful for managing environment variables securely in your projects without exposing sensitive information in your codebase.

## Features

- Fetch parameters securely from AWS SSM Parameter Store.
- Automatically generates a `.env` file with specified parameters.
- Handles both encrypted and unencrypted SSM parameters.
- Lightweight and simple to use.

## Installation

You can install **envilder** globally or locally using npm:

```bash
npm install -g envilder
```

Or add it as a dependency in your project:

```bash
npm install envilder
```

## Usage

Envilder requires two arguments:

- `--map <path>`: Path to a JSON file mapping environment variable names to SSM parameters.
- `--envfile <path>`: Path where the generated .env file will be saved.

## Example

1. Create a mapping file `param_map.json`:

    ```json
    {
      "NEXT_PUBLIC_CREDENTIAL_EMAIL": "/path/to/ssm/email",
      "NEXT_PUBLIC_CREDENTIAL_PASSWORD": "/path/to/ssm/password"
    }
    ```

2. Run envilder to generate your `.env` file:

    ```bash
    envilder --map=path/to/param_map.json --envfile=.env
    ```

3. The `.env` file will be generated in the specified location.

## Sample `.env` Output:

```makefile
NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com
NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword
```

## Running Tests

To run the tests with coverage:

```bash
yarn test
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

Created by [Marçal Albert](https://github.com/macalbert).
