
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
- **Vault URL** configured via `$config.vaultUrl` in your map file or `--vault-url` CLI flag
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

Provide the vault URL via `$config.vaultUrl` in your map file:

```json
{
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "MY_SECRET": "my-secret-name"
}
```

Or use the `--vault-url` CLI flag:

```bash
envilder --provider=azure --vault-url=https://my-vault.vault.azure.net --map=param-map.json --envfile=.env
```

CLI flags override `$config` values in the map file.

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

Your Azure identity (user, service principal, or managed identity) needs the following Key Vault secret permissions:

| Operation | Required Permission |
| --------- | ------------------- |
| Pull       | **Get** (read secrets) |
| Push       | **Set** (write secrets) |

Azure Key Vault supports two access models. Check which one your vault uses:

```bash
az keyvault show --name <VAULT_NAME> --query properties.enableRbacAuthorization
```

- `true` → **Azure RBAC** (recommended)
- `false` / `null` → **Vault Access Policy** (classic)

#### Option A — Azure RBAC (recommended)

Assign the **Key Vault Secrets Officer** role to your identity:

```bash
az role assignment create \
  --role "Key Vault Secrets Officer" \
  --assignee <YOUR_OBJECT_ID> \
  --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP>/providers/Microsoft.KeyVault/vaults/<VAULT_NAME>
```

> Use `az ad signed-in-user show --query id -o tsv` to get your object ID.

If you only need read access (pull), **Key Vault Secrets User** is sufficient:

```bash
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee <YOUR_OBJECT_ID> \
  --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP>/providers/Microsoft.KeyVault/vaults/<VAULT_NAME>
```

#### Option B — Vault Access Policy (classic)

Grant secret permissions directly on the vault:

```bash
az keyvault set-policy \
  --name <VAULT_NAME> \
  --object-id <YOUR_OBJECT_ID> \
  --secret-permissions get set list
```

> For pull-only access, `get list` is enough. Add `set` when you also need push.

#### Troubleshooting

If you see an error like:

```txt
does not have secrets set permission on key vault '...'
```

Your identity is authenticated correctly but lacks the required permission.
Follow Option A or B above to grant access, then retry.

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

## Verifying Installation

### CLI

Check that Envilder is installed and available:

```bash
envilder --help
```

### .NET SDK

For the .NET SDK, install and verify via NuGet:

```bash
dotnet add package Envilder
```

Requirements:

- .NET Standard 2.0 compatible runtime (.NET 6+, .NET Framework 4.6.1+)
- **AWS provider**: AWS credentials configured via CLI, environment variables, or IAM role
- **Azure provider**: Azure credentials via `az login`, managed identity, or environment variables

📖 **[Full .NET SDK documentation](../src/sdks/dotnet/README.md)**

If you see the CLI help output, you're ready to use Envilder!
