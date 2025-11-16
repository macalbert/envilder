
# Envilder: Requirements & Installation

## 1. Prerequisites

Before you install Envilder, make sure you have:

- **Node.js v20+**
  - Download and install from [nodejs.org](https://nodejs.org/) (choose your OS and follow their instructions).
- **AWS CLI**
  - Install: [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
  - Configure: Run `aws configure` to set up your default credentials ([AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)).

## 2. Install Envilder

Install Envilder globally using pnpm:

```bash
pnpm add -g envilder
```

## 3. Configure AWS Credentials

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

## 4. Set Up IAM Permissions

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

## 5. Useful Links

- [Node.js Downloads](https://nodejs.org/en/download/)
- [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
- [Creating IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html)
- [Attaching IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage-attach.html)
- [AWS SSM Parameter Store Permissions](https://docs.aws.amazon.com/systems-manager/latest/userguide/security-iam.html)
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
