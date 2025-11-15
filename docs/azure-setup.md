# Azure Key Vault Setup Guide for Envilder

> ✅ **Updated for 2025** - This guide uses the latest Azure CLI commands and best practices

## Overview

Unlike AWS SSM Parameter Store (which is available by default), **Azure Key Vault requires you to create
an instance** before you can store secrets. This guide walks you through the complete setup process.

## Table of Contents

- [Azure Key Vault Setup Guide for Envilder](#azure-key-vault-setup-guide-for-envilder)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Quick Setup (5 minutes)](#quick-setup-5-minutes)
  - [Detailed Setup Steps](#detailed-setup-steps)
    - [1. Install Azure CLI](#1-install-azure-cli)
    - [2. Login to Azure](#2-login-to-azure)
    - [3. Create a Resource Group](#3-create-a-resource-group)
    - [4. Create a Key Vault](#4-create-a-key-vault)
    - [5. Configure Permissions](#5-configure-permissions)
    - [6. Set Environment Variable](#6-set-environment-variable)
  - [Authentication Methods](#authentication-methods)
    - [1. **Environment Variables** (for CI/CD)](#1-environment-variables-for-cicd)
    - [2. **Managed Identity** (when running in Azure)](#2-managed-identity-when-running-in-azure)
    - [3. **Azure CLI** (for local development - easiest)](#3-azure-cli-for-local-development---easiest)
    - [4. **Service Principal** (for automation)](#4-service-principal-for-automation)
  - [Using Envilder with Azure](#using-envilder-with-azure)
    - [Pull secrets to .env file](#pull-secrets-to-env-file)
    - [Push .env file to Azure Key Vault](#push-env-file-to-azure-key-vault)
    - [Push a single secret](#push-a-single-secret)
  - [CI/CD Setup](#cicd-setup)
    - [GitHub Actions](#github-actions)
    - [Azure DevOps](#azure-devops)
  - [Troubleshooting](#troubleshooting)
    - ["AZURE\_KEY\_VAULT\_URL environment variable is required"](#azure_key_vault_url-environment-variable-is-required)
    - ["Forbidden" or "Access Denied" errors](#forbidden-or-access-denied-errors)
    - ["The vault name is already in use"](#the-vault-name-is-already-in-use)
    - [Authentication fails in CI/CD](#authentication-fails-in-cicd)
    - ["DefaultAzureCredential failed to retrieve a token"](#defaultazurecredential-failed-to-retrieve-a-token)
  - [Cost Information](#cost-information)
  - [Comparison: AWS SSM vs Azure Key Vault](#comparison-aws-ssm-vs-azure-key-vault)
  - [Next Steps](#next-steps)

---

## Prerequisites

- **Node.js v20+** installed
- **Envilder** installed globally (`npm install -g envilder`)
- An **Azure subscription** ([create free account](https://azure.microsoft.com/free/))
- **PowerShell** or **Bash** terminal

**Official Documentation:**

- [Azure Key Vault Documentation](https://learn.microsoft.com/en-us/azure/key-vault/)
- [Azure CLI Documentation](https://learn.microsoft.com/en-us/cli/azure/)
- [DefaultAzureCredential Reference](https://learn.microsoft.com/en-us/dotnet/api/azure.identity.defaultazurecredential)

---

## Quick Setup (5 minutes)

```powershell
# 1. Install Azure CLI
winget install Microsoft.AzureCLI

# 2. Login
az login

# 3. Set your subscription (if you have multiple)
az account set --subscription "your-subscription-name-or-id"

# 4. Create a resource group
az group create --name envilder-rg --location westeurope

# 5. Create a Key Vault (name must be globally unique)
az keyvault create `
  --name envilder-vault-YOUR-UNIQUE-ID `
  --resource-group envilder-rg `
  --location westeurope

# 6. Get your user Object ID
$objectId = az ad signed-in-user show --query id -o tsv

# 7. Assign permissions
az keyvault set-policy `
  --name envilder-vault-YOUR-UNIQUE-ID `
  --object-id $objectId `
  --secret-permissions get list set delete

# 8. Set environment variable
$env:AZURE_KEY_VAULT_URL = "https://envilder-vault-YOUR-UNIQUE-ID.vault.azure.net/"

# 9. Test with Envilder
envilder --provider azure --key TEST_KEY --value "test-value" --ssm-path "/test/path"
```

**Done!** 🎉 You can now use Envilder with Azure Key Vault.

---

## Detailed Setup Steps

### 1. Install Azure CLI

📚 [Official Installation Guide](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)

**Windows (PowerShell):**

```powershell
winget install Microsoft.AzureCLI
```

**macOS:**

```bash
brew install azure-cli
```

**Linux:**

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

Verify installation:

```powershell
az --version
```

### 2. Login to Azure

📚 [Azure CLI Authentication](https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli)

```powershell
az login
```

This will open your browser for authentication. If you're on a server without a browser:

```powershell
az login --use-device-code
```

**List your subscriptions:**

```powershell
az account list --output table
```

**Set the subscription you want to use:**

```powershell
az account set --subscription "your-subscription-name-or-id"
```

### 3. Create a Resource Group

📚 [Resource Groups Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal)

Resource groups organize your Azure resources. Create one for Envilder:

```powershell
az group create `
  --name envilder-rg `
  --location westeurope
```

**Available regions:** `westeurope`, `eastus`, `westus2`, `northeurope`, etc.

To list all regions:

```powershell
az account list-locations --output table
```

### 4. Create a Key Vault

📚 [Azure Key Vault Quickstart](https://learn.microsoft.com/en-us/azure/key-vault/general/quick-create-cli)

**Important:** Key Vault names must be:

- Globally unique across all of Azure
- 3-24 characters long
- Contain only alphanumeric characters and hyphens
- Start with a letter

```powershell
# Replace YOUR-UNIQUE-ID with something unique (e.g., your initials + random number)
az keyvault create `
  --name envilder-vault-ma-2025 `
  --resource-group envilder-rg `
  --location westeurope
```

**Get your vault URL:**

```powershell
az keyvault show --name envilder-vault-ma-2025 --query properties.vaultUri -o tsv
```

Output example: `https://envilder-vault-ma-2025.vault.azure.net/`

### 5. Configure Permissions

📚 [Key Vault Access Policies](https://learn.microsoft.com/en-us/azure/key-vault/general/assign-access-policy)

Azure Key Vault uses **Azure RBAC** or **Access Policies** for permissions.
We'll use Access Policies (simpler for getting started).

**Get your user Object ID:**

```powershell
$objectId = az ad signed-in-user show --query id -o tsv
echo $objectId
```

**Assign permissions:**

```powershell
az keyvault set-policy `
  --name envilder-vault-ma-2025 `
  --object-id $objectId `
  --secret-permissions get list set delete
```

**Permissions explained:**

- `get` - Read secrets
- `list` - List all secrets
- `set` - Create/update secrets
- `delete` - Delete secrets

### 6. Set Environment Variable

Envilder needs to know your Key Vault URL via the `AZURE_KEY_VAULT_URL` environment variable.

**PowerShell (current session only):**

```powershell
$env:AZURE_KEY_VAULT_URL = "https://envilder-vault-ma-2025.vault.azure.net/"
```

**PowerShell (persistent - recommended):**

```powershell
[System.Environment]::SetEnvironmentVariable(
  'AZURE_KEY_VAULT_URL',
  'https://envilder-vault-ma-2025.vault.azure.net/',
  'User'
)
```

**Bash:**

```bash
export AZURE_KEY_VAULT_URL="https://envilder-vault-ma-2025.vault.azure.net/"

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export AZURE_KEY_VAULT_URL="https://envilder-vault-ma-2025.vault.azure.net/"' >> ~/.bashrc
```

**Verify:**

```powershell
echo $env:AZURE_KEY_VAULT_URL
```

---

## Authentication Methods

📚 [Azure Identity Client Library](https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme)

Envilder uses `DefaultAzureCredential` which tries these methods in order:

### 1. **Environment Variables** (for CI/CD)

📚 [Service Principal Authentication](https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/local-development-environment-service-principal)

```powershell
$env:AZURE_CLIENT_ID = "your-client-id"
$env:AZURE_CLIENT_SECRET = "your-client-secret"
$env:AZURE_TENANT_ID = "your-tenant-id"
```

### 2. **Managed Identity** (when running in Azure)

📚 [Managed Identities Documentation](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)

Automatically works on:

- Azure VMs
- Azure App Service
- Azure Functions
- Azure Container Instances

No configuration needed!

### 3. **Azure CLI** (for local development - easiest)

Just run `az login` and you're authenticated. This is the **recommended method for local development**.

### 4. **Service Principal** (for automation)

📚 [Create Service Principal](https://learn.microsoft.com/en-us/cli/azure/azure-cli-sp-tutorial-1)

Create a service principal:

```powershell
az ad sp create-for-rbac --name "envilder-sp" --role contributor --scopes /subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/envilder-rg
```

Output:

```json
{
  "appId": "xxx",
  "displayName": "envilder-sp",
  "password": "xxx",
  "tenant": "xxx"
}
```

Assign Key Vault permissions:

```powershell
az keyvault set-policy `
  --name envilder-vault-ma-2025 `
  --spn "appId-from-above" `
  --secret-permissions get list set delete
```

---

## Using Envilder with Azure

Once setup is complete, use Envilder with the `--provider azure` flag:

### Pull secrets to .env file

```powershell
envilder --provider azure --map param-map.json --envfile .env
```

### Push .env file to Azure Key Vault

```powershell
envilder --provider azure --push --envfile .env --map param-map.json
```

### Push a single secret

```powershell
envilder --provider azure --key DB_PASSWORD --value "supersecret123" --ssm-path "/prod/db/password"
```

**Note:** The `--ssm-path` parameter is kept for consistency with AWS, but it works with Azure Key Vault too.
Secret names are automatically normalized to meet Azure's requirements (alphanumeric and hyphens only).

---

## CI/CD Setup

### GitHub Actions

📚 [Azure Login Action](https://github.com/Azure/login)

```yaml
name: Deploy with Envilder

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Envilder
        run: npm install -g envilder
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Pull secrets
        env:
          AZURE_KEY_VAULT_URL: ${{ secrets.AZURE_KEY_VAULT_URL }}
        run: envilder --provider azure --map param-map.json --envfile .env
      
      - name: Deploy application
        run: # your deployment commands
```

**Setup secrets in GitHub:**

1. Go to repository Settings → Secrets and variables → Actions
2. Add `AZURE_KEY_VAULT_URL`: `https://your-vault.vault.azure.net/`
3. Add `AZURE_CREDENTIALS`: Create a service principal and paste the JSON output

Create `AZURE_CREDENTIALS`:

```powershell
az ad sp create-for-rbac `
  --name "github-actions-envilder" `
  --role contributor `
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/envilder-rg `
  --sdk-auth
```

### Azure DevOps

📚 [Azure DevOps Azure CLI Task](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/azure-cli-v2)

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm install -g envilder
    displayName: 'Install Envilder'

  - task: AzureCLI@2
    inputs:
      azureSubscription: 'your-service-connection'
      scriptType: 'bash'
      scriptLocation: 'inlineScript'
      inlineScript: |
        export AZURE_KEY_VAULT_URL="https://your-vault.vault.azure.net/"
        envilder --provider azure --map param-map.json --envfile .env
    displayName: 'Pull secrets with Envilder'
```

---

## Troubleshooting

### "AZURE_KEY_VAULT_URL environment variable is required"

Make sure you've set the environment variable:

```powershell
$env:AZURE_KEY_VAULT_URL = "https://your-vault.vault.azure.net/"
```

### "Forbidden" or "Access Denied" errors

Check your permissions:

```powershell
# Verify your user has permissions
az keyvault show --name your-vault-name --query properties.accessPolicies

# Re-assign permissions if needed
$objectId = az ad signed-in-user show --query id -o tsv
az keyvault set-policy `
  --name your-vault-name `
  --object-id $objectId `
  --secret-permissions get list set delete
```

### "The vault name is already in use"

Key Vault names must be globally unique. Try adding your initials or a random number:

```powershell
az keyvault create --name envilder-vault-ma-9876 ...
```

### Authentication fails in CI/CD

Make sure your service principal has:

1. Contributor role on the resource group
2. Access policy permissions on the Key Vault

```powershell
# Check service principal
az ad sp list --display-name "your-sp-name"

# Assign permissions
az keyvault set-policy `
  --name your-vault-name `
  --spn "app-id-of-service-principal" `
  --secret-permissions get list set delete
```

### "DefaultAzureCredential failed to retrieve a token"

Try these in order:

1. **Re-login to Azure CLI:**

   ```powershell
   az logout
   az login
   ```

2. **Check your subscription:**

   ```powershell
   az account show
   ```

3. **Verify environment variables:**

   ```powershell
   echo $env:AZURE_KEY_VAULT_URL
   ```

---

## Cost Information

📚 [Official Azure Key Vault Pricing](https://azure.microsoft.com/en-us/pricing/details/key-vault/)

Azure Key Vault pricing (as of 2025):

- **Standard tier:**
  - €0.03 per 10,000 operations
  - Most small-medium projects stay under €1/month

- **Premium tier:**
  - €1.00 per 10,000 operations
  - HSM-backed keys for high security requirements

**Typical usage:**

- Development: ~1,000 operations/month = **~€0.003/month**
- Production: ~10,000 operations/month = **~€0.03/month**

**No additional costs for:**

- Storage of secrets
- Number of secrets (unlimited)
- Data transfer

👉 [Official Azure Key Vault Pricing](https://azure.microsoft.com/en-us/pricing/details/key-vault/)

---

## Comparison: AWS SSM vs Azure Key Vault

| Feature | AWS SSM Parameter Store | Azure Key Vault |
|---------|------------------------|-----------------|
| **Setup Required** | ❌ None (auto-available) | ✅ Create instance |
| **Free Tier** | 10,000 params (standard) | Pay per operation |
| **Cost (10k ops)** | Free | ~€0.03 |
| **Authentication** | AWS credentials | Azure credentials |
| **HSM Support** | Advanced tier only | Premium tier |
| **Onboarding Time** | < 1 minute | ~5 minutes |

**Bottom line:** AWS SSM is easier to get started with, but Azure Key Vault offers better enterprise
features and integration with Azure services.

**Official Comparisons:**

- [Azure for AWS Professionals](https://learn.microsoft.com/en-us/azure/architecture/aws-professional/)
- [AWS to Azure Services Comparison](https://learn.microsoft.com/en-us/azure/architecture/aws-professional/services)

---

## Next Steps

✅ **Setup complete!** You can now:

1. [Read the Pull Command Guide](./pull-command.md) to sync secrets to your `.env`
2. [Read the Push Command Guide](./push-command.md) to upload secrets to Azure Key Vault
3. Start using Envilder in your projects and CI/CD pipelines

**Need help?** Open an issue on [GitHub](https://github.com/macalbert/envilder/issues)

---

**Last updated:** November 2025  
**Azure CLI version:** 2.65+  
**Tested on:** Windows 11, macOS 14, Ubuntu 22.04
