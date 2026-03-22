
# Envilder: Requirements & Installation

## 1. Prerequisites

Before you install Envilder, make sure you have:

- **Node.js v20+**
  - Download and install from [nodejs.org](https://nodejs.org/) (choose your OS and follow their instructions).

### For AWS SSM (default provider)

- **AWS CLI**
  - Install: [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
  - Configure: Run `aws configure` to set up your default credentials ([AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)).

### For Azure Key Vault

- **Azure CLI**
  - Install: [Azure CLI Installation Guide](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
  - Login: Run `az login` to authenticate.
- **`AZURE_KEY_VAULT_URL`** environment variable set to your vault URL (e.g. `https://my-vault.vault.azure.net`)
- Authentication uses [Azure Default Credentials](https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential)
(Azure CLI, managed identity, environment variables, etc.)

## 2. Install Envilder

Install Envilder globally using pnpm:

```bash
pnpm add -g envilder
```

## 3. Configure Cloud Provider Credentials

### AWS (default)

Envilder uses your AWS CLI credentials. By default, it uses the `[default]` profile. To set up or update credentials:

Set up the default profile:

```bash
aws configure
```

Add or update a named profile (e.g., `dev-account`):

```bash
aws configure --profile dev-account
```

You only need to use `--profile` in Envilder commands if you want to use a profile other than `default`.

### Azure Key Vault

Envilder uses Azure Default Credentials. Log in with the Azure CLI:

```bash
az login
```

Set the vault URL environment variable:

```bash
export AZURE_KEY_VAULT_URL=https://my-vault.vault.azure.net
```

Then use `--provider=azure` when running Envilder commands.

## 4. Set Up IAM Permissions

### AWS

Your IAM user or role must have these permissions:

- `ssm:GetParameter`
- `ssm:PutParameter`

Example IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:PutParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

Attach this policy to your IAM user or role using the AWS Console or CLI.

### Azure

Your Azure identity (user, service principal, or managed identity) needs the following Key Vault access:

- **Get** and **Set** secret permissions

You can assign these via Azure RBAC role `Key Vault Secrets Officer` or through Key Vault access policies.

## 5. Useful Links

### AWS Links

- [Node.js Downloads](https://nodejs.org/en/download/)
- [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
- [Creating IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html)
- [Attaching IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage-attach.html)
- [AWS SSM Parameter Store Permissions](https://docs.aws.amazon.com/systems-manager/latest/userguide/security-iam.html)

### Azure Links

- [Azure CLI Installation](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Key Vault Overview](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)
- [Key Vault RBAC Guide](https://learn.microsoft.com/en-us/azure/key-vault/general/rbac-guide)
- [Azure Default Credentials](https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential)

Otherwise, the default profile is used automatically.

This will automatically update your `~/.aws/credentials` and `~/.aws/config` files. Repeat for as many profiles as you need.

## Verifying Installation

Check that Envilder is installed and available:

```bash
envilder --help
```

If you see the CLI help output, you're ready to use Envilder!

## Useful Links

- [AWS SSM Parameter Store Overview](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [IAM permissions for SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html)
- [Azure Key Vault Overview](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)
- [Azure CLI Installation](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
