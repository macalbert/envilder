import type { Translations } from './types';

export const en: Translations = {
  homeMeta: {
    title: 'Run apps with AWS SSM & Azure Key Vault secrets | Envilder',
    description:
      'Map env vars to AWS SSM or Azure Key Vault once, then run any command with the secrets in its environment. No .env on disk. Open-source CLI, Action and SDKs.',
    ogImageAlt:
      'Envilder - run apps with AWS SSM and Azure Key Vault secrets, no .env file',
  },
  notFound: {
    title: 'Page not found | Envilder',
    description: 'The requested Envilder page does not exist.',
    heading: 'This page was not found',
    body: 'The address may be incorrect, or the page may have moved.',
    home: 'Return home',
  },
  nav: {
    features: 'Features',
    howItWorks: 'How it works',
    providers: 'Providers',
    githubAction: 'GitHub Action',
    sdks: 'SDKs',
    changelog: 'Changelog',
    docs: 'Docs',
    docsGettingStarted: 'Getting Started',
    docsCli: 'CLI',
    docsGha: 'GitHub Action',
    docsSdks: 'SDKs',
    docsReference: 'Reference',
    getStarted: 'Get Started',
    ariaGithub: 'GitHub',
    ariaSponsor: 'Sponsor',
    ariaToggleMenu: 'Toggle menu',
  },
  theme: {
    retro: 'Retro',
    light: 'Light',
    cream: 'Cream',
    ariaTheme: 'Theme',
  },
  hero: {
    title1: 'Run your app with',
    title2: 'cloud secrets.',
    titleAccent: 'No .env file.',
    description:
      'Map each environment variable to an AWS SSM or Azure Key Vault path in envilder.json. One command resolves them and starts your app with the values in its environment.',
    positioning:
      'Open source, with no server or SaaS in between: secrets stay in your cloud account. Need a file for a tool or CI? pull writes .env. Prefer code? SDKs for Node.js, Python and .NET.',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descOr: '·',
    descSuffix: ' · GitHub Action · Runtime SDKs',
    getStarted: '▶ Get started',
    viewOnGithub: '★ View on GitHub',
    tabGroupCli: 'CLI',
    tabGroupSdk: 'SDK',
    tabPull: 'pull',
    tabPullDesc: 'writes .env',
    tabExec: 'exec',
    tabExecDesc: 'runs your app, no .env',
    tabPush: 'push',
    tabPushDesc: 'stores a secret and writes envilder.json',
    tabNode: 'Node.js',
    tabNodeDesc: 'at runtime',
    tabPython: 'Python',
    tabPythonDesc: 'at runtime',
    tabDotnet: '.NET',
    tabDotnetDesc: 'at runtime',
    terminalComment1: '# 1. Map env vars to SSM paths',
    terminalComment2: '# 2. Resolve secrets into .env',
    execComment1: '# Run your app with the secrets in its environment',
    execComment2: '# Nothing written to disk',
    setupComment1: '# Push a secret to SSM. Envilder writes the map file',
    setupComment2: '# The mapping is ready. The value never touches the file',
    setupAzureComment1:
      '# Push a secret to Azure Key Vault. Envilder writes the map file',
    sdkCommentLoad: '# Load the same contract at runtime',
    terminalSceneLabel: 'Terminal demo scene',
    terminalPause: 'Pause demo',
    terminalPlay: 'Resume demo',
    execMapComment: '# Map each variable to a secret path',
  },
  trust: {
    label: 'WORKS WITH',
  },
  proof: {
    ariaLabel: 'Adoption',
    stars: 'GitHub stars',
    npmMonthly: 'npm downloads last month',
    pypiMonthly: 'PyPI downloads last month',
    nugetTotal: 'NuGet downloads',
    openssfBadge: 'OpenSSF Best Practices badge',
    openssfLevel: 'passing',
    openssfLabel: 'OpenSSF Best Practices',
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
    awsCreditsAlt: 'AWS Open Source Credits Program',
    awsCreditsLabel: 'AWS Open Source Credits',
    snykAlt: 'Snyk Secure Developer Program',
  },
  howItWorks: {
    title: 'How it ',
    titleAccent: 'works',
    subtitle: 'Map once. Run it anywhere.',
    stepLabel: 'STEP',
    steps: [
      {
        title: 'Map each variable once',
        description:
          'envilder.json lists env var names and their secret paths, never the values. Pushing a secret adds its entry for you, or you can write the file by hand. Commit it and review changes in pull requests like any other code.',
      },
      {
        title: 'Run your app with exec',
        description:
          'envilder exec resolves every mapped secret and starts your command with them in its environment. No .env file on disk, nothing to clean up, and the command never starts if a secret is missing.',
      },
      {
        title: 'Or load them in code',
        description:
          'Runtime SDKs for Node.js, Python and .NET resolve the same map in-process at startup.',
      },
      {
        title: 'Need a file? Use pull',
        description:
          'Some tools expect a .env file, and pull writes one from the same map. Treat it as a secret. In GitHub Actions you usually need no file: the action exports the secrets to the later steps of the job.',
      },
    ],
    sdkTabPython: 'Python',
    sdkTabDotnet: '.NET',
    sdkTabNodejs: 'Node.js',
  },
  features: {
    title: 'Why ',
    titleAccent: 'Envilder?',
    subtitle:
      'Envilder is a resolution layer over the secret store you already run. It never stores secrets: the map file is the only thing it adds to your repo.',
    highlights: [
      {
        icon: 'plug',
        title: 'Secrets Stay Off Disk',
        description:
          'exec and the SDKs put values straight into the process environment. No plaintext .env left in the project folder, in backups or in a container image.',
      },
      {
        icon: 'brick',
        title: 'No Server, No SaaS',
        description:
          'Nothing to host or pay for. Envilder reads AWS SSM Parameter Store or Azure Key Vault directly with your own cloud credentials.',
      },
      {
        icon: 'clipboard',
        title: 'One Reviewed Map File',
        description:
          'envilder.json is the single list of what each app needs, the same for local development, CI and production. Changes go through pull requests.',
      },
      {
        icon: 'lock',
        title: 'Native IAM and RBAC',
        description:
          'Access is governed by AWS IAM or Azure RBAC, and CloudTrail or Azure Monitor can log it when configured. No extra auth layer.',
      },
    ],
  },
  providers: {
    title: 'Your cloud. ',
    titleAccent: 'Your choice.',
    subtitle:
      'Envilder works today with AWS SSM Parameter Store and Azure Key Vault. Choose the provider in envilder.json or with CLI flags.',
    awsTitle: 'AWS SSM Parameter Store',
    awsDefault: 'Default provider',
    awsFeatures: [
      'Supports GetParameter with WithDecryption',
      'AWS Profile support for multi-account',
      'IAM policy-based access control',
      'CloudTrail access logging when configured',
    ],
    azureTitle: 'Azure Key Vault',
    azureBadge: 'New in v0.8',
    azureFeatures: [
      'Auto-normalizes secret names (slashes → hyphens)',
      'DefaultAzureCredential authentication',
      'Azure RBAC access control',
      'Azure Monitor access logging when configured',
    ],
    configPriorityTitle: 'Configuration priority',
    priorityHigh: 'CLI flags / GHA inputs',
    priorityMid: '$config in map file',
    priorityLow: 'Defaults (AWS)',
    roadmapNote:
      'Need Google Cloud Secret Manager or AWS Secrets Manager? Both are on the roadmap, not available yet.',
    roadmapLink: 'View roadmap',
  },
  faq: {
    title: 'Frequently asked ',
    titleAccent: 'questions',
    items: [
      {
        q: 'What is Envilder?',
        a: 'Envilder is an open-source CLI, GitHub Action and set of runtime SDKs that resolves application secrets from AWS SSM Parameter Store or Azure Key Vault using one versioned JSON map file. It can run your command with those secrets in its environment, write a .env file when a tool needs one, or load them in-process.',
      },
      {
        q: 'Does Envilder store my secrets?',
        a: 'No. Values stay in AWS SSM Parameter Store or Azure Key Vault. envilder.json holds only variable names and secret paths, so it is safe to commit. There is no Envilder server or hosted service.',
      },
      {
        q: 'Does Envilder have an exec mode?',
        a: 'Yes. Since CLI v0.15.0, envilder exec -- <command> resolves the secrets in your map file and starts the command with them as environment variables, without writing a .env file. It works with AWS SSM Parameter Store and Azure Key Vault.',
      },
      {
        q: 'How is envilder exec different from a .env file?',
        a: 'exec resolves the secrets and passes them to your command as environment variables, so nothing is written to disk. It is fail-closed: if a secret is missing, empty or unreadable, the command does not start. The command and the processes it launches can still read the values; exec is not a sandbox.',
      },
      {
        q: 'Can I use it in CI/CD?',
        a: 'Yes. The GitHub Action exports the mapped secrets to the later steps of the job, runs one command with them, or writes a .env file when a tool needs one. The CLI (exec or pull) works in any CI runner that has cloud credentials.',
      },
      {
        q: 'Which secret stores are supported?',
        a: 'AWS SSM Parameter Store and Azure Key Vault. Google Cloud Secret Manager and AWS Secrets Manager are on the roadmap but not available yet.',
      },
      {
        q: 'How does it compare to dotenvx, Chamber or Doppler?',
        a: 'dotenvx encrypts .env files so they can be committed. Doppler is a hosted secrets platform. Chamber is a CLI for AWS secret stores. Envilder keeps values in the AWS SSM or Azure Key Vault you already use, adds one reviewed map file, and covers the CLI, CI and runtime SDKs with that same map.',
      },
      {
        q: 'Is it free?',
        a: "Yes. Envilder is MIT-licensed. You only pay your cloud provider's usual costs for SSM Parameter Store or Key Vault.",
      },
    ],
  },
  gha: {
    title: 'GitHub Action',
    subtitle:
      'Pull secrets at deploy time. Drop it into any workflow in minutes.',
    awsSsm: '☁️ AWS SSM',
    azureKeyVault: '🔑 Azure Key Vault',
    actionInputs: 'Action inputs',
    thInput: 'Input',
    thRequired: 'Required',
    thDefault: 'Default',
    thDescription: 'Description',
    inputMapDesc: 'Path to JSON file mapping env vars to secret paths',
    inputEnvDesc:
      'Optional. Path to a .env file to write, for tools that need a file',
    inputProviderDesc: 'Cloud provider: aws or azure (default: aws)',
    inputVaultDesc: 'Azure Key Vault URL',
    inputCommandDesc:
      'Optional. Command to run with the secrets only in its environment. Cannot be combined with env-file',
    modesTitle: 'Three ways to use the secrets',
    modeJobTitle: 'Job environment (default)',
    modeJobDesc:
      'With only map-file, every secret becomes an environment variable for every later step of the job. No .env file is written; the runner keeps the values in its GITHUB_ENV file, in its temporary directory, until the job ends.',
    modeCommandTitle: 'command',
    modeCommandDesc:
      'The action runs that one command with the secrets in its environment. Later steps never see them.',
    modeEnvFileTitle: 'env-file',
    modeEnvFileDesc:
      'Writes a .env file. Use it only when a tool can read the secrets from a file and nothing else.',
    output: 'Output:',
    outputDesc:
      'Path to the generated .env file (empty unless env-file is set)',
    yes: 'Yes',
    no: 'No',
  },
  sdks: {
    title: 'Runtime SDKs',
    subtitle:
      'Load secrets directly into your application at startup. No .env files, no intermediaries. Just your cloud vault and your code.',
    pythonTitle: 'Python',
    pythonDesc:
      'Load secrets with one line. Supports AWS SSM and Azure Key Vault.',
    dotnetTitle: '.NET',
    dotnetDesc:
      'Native IConfiguration integration. Resolve secrets at startup.',
    nodejsTitle: 'Node.js',
    nodejsDesc:
      'Load secrets directly in Node.js. Same map-file, zero dependencies on the CLI.',
    goTitle: 'Go',
    goDesc: 'Lightweight secret loading for Go services.',
    javaTitle: 'Java',
    javaDesc: 'Spring Boot and standalone Java support.',
    install: 'Install',
    quickStart: 'Quick start',
    available: 'Available',
    planned: 'Planned',
    comingSoon: 'Coming soon',
    docsLink: 'View docs',
    packageLink: 'Package',
  },
  roadmap: {
    title: "What's ",
    titleAccent: 'next',
    subtitle: "Envilder is actively developed. Here's where we're headed.",
    upNext: 'Up next',
    items: [
      {
        status: 'done',
        label: '✅',
        title: 'Pull secrets to .env',
        description:
          'Map env var names to cloud secret paths via JSON and generate .env files automatically',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Push mode (--push)',
        description: 'Upload .env values or single secrets to cloud provider',
      },
      {
        status: 'done',
        label: '✅',
        title: 'GitHub Action',
        description: 'Use Envilder in CI/CD workflows natively',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Multi-provider (AWS + Azure)',
        description: 'AWS SSM Parameter Store and Azure Key Vault support',
      },
      {
        status: 'done',
        label: '📖',
        title: 'Documentation website',
        description: 'Dedicated docs site with guides, examples, API reference',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Python SDK (envilder)',
        description:
          'Runtime library for Django/FastAPI/data pipelines. Published to PyPI',
      },
      {
        status: 'done',
        label: '✅',
        title: '.NET SDK (Envilder)',
        description:
          'Runtime library for enterprise apps and Azure-native shops. Published to NuGet',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Node.js SDK (@envilder/sdk)',
        description:
          'Native runtime library: load secrets directly into process.env from a map-file. Published to npm',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Exec mode (envilder exec)',
        description:
          'Run a command with your secrets in its environment, without writing a .env file: envilder exec [options] [--] <command> [args...]',
      },
      {
        status: 'next',
        label: '🐹',
        title: 'Go SDK (envilder)',
        description:
          'Runtime library for cloud-native apps and Kubernetes tooling. Published as Go module',
      },
      {
        status: 'next',
        label: '☕',
        title: 'Java SDK (envilder)',
        description:
          'Runtime library for Spring Boot and Android backends. Published to Maven Central',
      },
      {
        status: 'planned',
        label: '☁️',
        title: 'GCP Secret Manager',
        description: 'Planned third cloud provider; not available yet',
      },
      {
        status: 'planned',
        label: '🔐',
        title: 'AWS Secrets Manager',
        description:
          'Support JSON-structured secrets alongside SSM Parameter Store',
      },
      {
        status: 'planned',
        label: '✔️',
        title: 'Check/sync mode (--check)',
        description:
          'Validate cloud secrets vs local .env. Fail CI if out-of-sync',
      },
    ],
  },
  getStarted: {
    title: 'Get ',
    titleAccent: 'started',
    subtitle: 'Up and running in under a minute.',
    prerequisites: 'Prerequisites',
    prereqNode: 'Node.js v22.12+',
    prereqProviderChoice: 'Choose one cloud provider:',
    prereqAws: 'AWS SSM',
    prereqAzure: 'Azure Key Vault',
    prereqAwsNote:
      'AWS credentials with ssm:GetParameter; add ssm:PutParameter to push secrets',
    prereqAzureNote:
      'Azure credentials with secret Get access; add Set access to push secrets',
    install: 'Install',
    quickStart: 'Quick start',
    step1:
      'Push a secret with npx envilder --key --value --secret-path: Envilder writes envilder.json for you',
    step2: 'Run npx envilder exec -- followed by your usual start command',
    step3: 'Your app starts with its secrets ✔',
    terminalTitle: 'Quick start',
    commentCreate: '# Push a secret. Envilder writes envilder.json',
    commentPull: '# Or write a .env file',
    doneMessage: '.env file generated.',
    sdkComment3: '# Secrets are now in os.environ',
    sdkExampleLink: 'View runnable examples on GitHub',
    commentExec: '# Run your app with the secrets',
  },
  footer: {
    tagline:
      'One configuration model to resolve secrets consistently across environments and runtimes. Powered by your existing cloud infrastructure.',
    project: 'Project',
    documentation: 'Documentation',
    community: 'Community',
    linkGithub: 'GitHub',
    linkNpm: 'npm',
    linkChangelog: 'Changelog',
    linkRoadmap: 'Roadmap',
    linkGettingStarted: 'Getting Started',
    linkPullCommand: 'Pull Command',
    linkPushCommand: 'Push Command',
    linkExecCommand: 'Exec Command',
    linkGithubAction: 'GitHub Action',
    linkIssues: 'Issues',
    linkDiscussions: 'Discussions',
    linkSecurity: 'Security',
    linkSponsor: 'Sponsor',
    license: 'MIT License',
    copyright: 'Built with Astro. Open source on GitHub.',
    builtWith: 'Built with Astro. Open source on GitHub.',
  },
  changelogPage: {
    title: 'Envilder changelog: CLI, GitHub Action, and SDK releases',
    description:
      'Release history for the Envilder CLI, GitHub Action, and .NET, Python, and Node.js runtime SDKs.',

    backToHome: '← Back to home',
    fullChangelog: 'Full ',
    changelogAccent: 'Changelog',
    intro: 'Complete release history. See also',
    releaseNotesLanguage: 'Release notes are published in English.',
    githubReleases: 'GitHub Releases',
    versions: 'Versions',
    backToTop: 'Back to top',
    categoryCli: 'CLI',
    categoryGha: 'GitHub Action',
    categorySdks: 'SDKs',
    categorySdkDotnet: '.NET',
    categorySdkPython: 'Python',
    categorySdkNodejs: 'Node.js',
  },
  docs: {
    gettingStartedGuide: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      overviewTitle: 'What you will do',
      overviewSteps: [
        'Install the envilder CLI.',
        'Push one test secret to AWS SSM Parameter Store or Azure Key Vault with envilder, which also writes envilder.json.',
        'Check the envilder.json it created: it maps a variable name to the secret, never to the value.',
        'Start a small Node.js app with envilder exec and check that it receives the value.',
      ],
      prereqTitle: 'Prerequisites',
      prereqNode: 'Node.js 22.12 or later.',
      prereqAws:
        'the AWS CLI with working credentials (aws configure, or aws sso login for SSO profiles) and an identity allowed to call ssm:GetParameter on the parameters you map. If a SecureString parameter is encrypted with a customer-managed KMS key, the identity also needs kms:Decrypt on that key.',
      prereqAwsLink: 'AWS SSM setup',
      prereqAzure:
        'an existing Key Vault, the Azure CLI signed in with az login, and the Key Vault Secrets User role on the vault (or an access policy with Get on secrets). Envilder authenticates with DefaultAzureCredential, so a managed identity or environment credentials work too.',
      prereqAzureLink: 'Azure Key Vault setup',
      prereqWrite:
        'Step 2 creates a secret, which needs write access (ssm:PutParameter, or Key Vault Secrets Officer). If the secret already exists, skip it and write envilder.json by hand as shown in step 3.',
      installTitle: '1. Install the CLI',
      installDesc:
        'Install envilder globally. If you prefer not to install it, prefix every command in this guide with npx.',
      installVerify:
        'Check that the command is on your PATH. It prints the version:',
      secretTitle: '2. Push a test secret',
      secretDesc:
        'Choose your provider. One envilder command stores the secret in the vault and records the mapping in envilder.json, so this step needs neither the AWS CLI nor the Azure CLI. The guide uses a single secret: the database password of a development environment. The value stays in your shell history; for real secrets, push from a .env file with push mode instead.',
      secretAwsNote:
        'On AWS, --provider=aws and --profile are optional: aws is the default provider, and without --profile Envilder uses the AWS default credential chain. The profile is a local choice and is not written to envilder.json.',
      secretAzureNote:
        'Key Vault names only allow letters, digits and hyphens. Envilder turns slashes into hyphens and drops a leading slash before calling Azure, so "/my-app/dev/db-password" would resolve the same secret. Anything else is sent as written.',
      mapTitle: '3. Check envilder.json',
      mapDesc:
        'The push created envilder.json in the current directory, or added the entry if the file already existed. Each key is the variable name your app reads, and each value is the identifier of the secret in your vault. For Azure it also wrote $config with provider and vaultUrl; AWS needs no $config.',
      mapNote:
        'The file holds secret paths, never values, so commit it with your code. Editors validate envilder.json through SchemaStore without a $schema line. To push a secret without touching the map file, add --no-map-update.',
      runTitle: '4. Run your app with envilder exec',
      runDesc:
        'Create a small script that reads the variable, then start it through Envilder. Everything after -- is your command, passed as is, without a shell.',
      runOutput:
        'Expected output. The first line is Envilder on stderr; the second is your app on stdout:',
      runExplain:
        'Envilder resolves every mapped secret, then starts the command with those values added to its environment. Nothing is written to disk. If any secret is missing, empty or unreadable, the command does not start and envilder exits with code 125; otherwise it exits with the code of your command.',
      runScriptDesc:
        'To make this the normal way to start the project, put it in a package.json script and keep running npm run dev:',
      pullTitle: 'Alternative: write a .env file',
      pullDesc:
        'Some tools only read a file, such as a Docker Compose env_file or an IDE run configuration. For those, pull the secrets into a .env file instead. Without flags, envilder reads envilder.json and writes .env in the current directory:',
      pullOutput: 'Expected output with AWS, followed by the file it writes:',
      pullWarn:
        'The .env file contains the real secret values: add it to .gitignore and delete it when you no longer need it. Unlike exec, pull skips a secret that does not exist with a warning and still writes the others.',
      errorsTitle: 'Common first-run errors',
      errorsIntro:
        'Each block shows the text envilder prints. With exec, every one of these exits with code 125 and your command never starts.',
      errNoMapTitle: 'No map file found',
      errNoMapFix:
        'envilder looks for envilder.json in the current directory. Run it from the project root, or pass --map=path/to/envilder.json.',
      errCredsTitle: 'No AWS credentials',
      errCredsFix:
        'The AWS SDK found no credentials. Run aws configure, or aws sso login for an SSO profile. To use a named profile, pass --profile=name or set "profile" in $config.',
      errDeniedTitle: 'Access denied by AWS',
      errDeniedFix:
        'The credentials work but the identity cannot read that parameter. Allow ssm:GetParameter on the parameter ARN, plus kms:Decrypt when the parameter uses a customer-managed key.',
      errNotFoundTitle: 'Secret not found',
      errNotFoundFix:
        'The identifier or the region is wrong. For AWS, Envilder takes the region from AWS_REGION, then AWS_DEFAULT_REGION, then the profile, and falls back to us-east-1. Compare with aws ssm get-parameter --name /my-app/dev/db-password using the same profile. For Azure, check the secret name in the vault.',
      errVaultTitle: 'Azure without a vault URL',
      errVaultFix:
        'Add "vaultUrl": "https://<vault-name>.vault.azure.net" to $config, or pass --vault-url.',
      errOrderTitle: 'Options placed before exec',
      errOrderFix:
        'Options written before exec are rejected rather than ignored. Move them after exec, as the message shows.',
      errEnvfileTitle: '--envfile used with exec',
      errEnvfileFix:
        'exec never writes a file. Remove --envfile, or use pull (envilder --envfile=.env) when you need the file.',
      nextTitle: 'Next steps',
      nextMap:
        'Map file reference: $config, profiles, validation rules and multi-environment layouts',
      nextExec: 'envilder exec: exit codes, signals and CI usage',
      nextPull: 'Pull mode: all options for generating .env files',
    },
    mapFileReference: {
      prereqTitle: 'Prerequisites',
      prereqDesc:
        'This page describes the map file as read by the envilder CLI (0.16) and the GitHub Action. The runtime SDKs read the same file. If you have not resolved a secret yet, start with the getting started guide.',
      structureTitle: 'Structure',
      structureDesc:
        'A map file is one JSON object. Keys that start with $ are reserved; every other key declares an environment variable, and its value is the identifier of the secret that fills it.',
      thKey: 'Key',
      thMeaning: 'Meaning',
      keySchema:
        'Optional URL of the JSON Schema. Editors use it for autocompletion and validation; envilder ignores it.',
      keyConfig:
        'Optional object that selects the provider and its settings. See the fields below.',
      keyOtherDollar:
        'Any other key starting with $ is skipped by envilder. The schema rejects it, so do not use it for metadata.',
      keyVariable:
        'Variable name (key) and secret identifier (string value). The value is opaque: its format depends on the provider.',
      configTitle: '$config fields',
      configDesc:
        'Every field is optional. A file without $config uses AWS SSM with the default AWS credential chain.',
      thField: 'Field',
      thValues: 'Values',
      thDefault: 'Default',
      thBehaviour: 'Behaviour',
      fieldProvider:
        'Secret backend. Matched case-insensitively. Any value other than aws or azure stops the run.',
      valueProfileName: 'AWS CLI profile name',
      defaultProfile: 'AWS default chain',
      fieldProfile:
        'Named profile from ~/.aws/config or ~/.aws/credentials. AWS only: with azure it is ignored and a warning is printed.',
      fieldVaultUrl:
        'Key Vault URL, for example https://my-vault.vault.azure.net. Required for azure. Ignored by aws.',
      configSdkNote:
        'The runtime SDKs read the same fields but can reject combinations the CLI only warns about, such as profile with azure. Each SDK page lists its own errors.',
      providersTitle: 'Secret identifiers by provider',
      awsTitle: 'AWS SSM Parameter Store',
      awsDesc:
        'The value is the parameter name exactly as stored in SSM, usually a hierarchical path. Envilder calls GetParameter with decryption, so String and SecureString parameters both work. The region comes from AWS_REGION, then AWS_DEFAULT_REGION, then the profile, with us-east-1 as the last fallback.',
      azureTitle: 'Azure Key Vault',
      azureDesc:
        'The value is the secret name. Envilder turns slashes into hyphens before calling Key Vault, so the same path style can be shared with an AWS file:',
      azureRules: [
        'Leading slashes are removed and the other slashes become hyphens: "/my-app/prod/stripe-api-key" reads my-app-prod-stripe-api-key. The CLI, the GitHub Action and every SDK apply the same rule.',
        "Everything else is sent as written. A name Key Vault rejects (for example one with _ or .) fails with Key Vault's own error.",
        'In the CLI and the GitHub Action, two different values that resolve to the same name in one file are an error.',
        'Envilder always reads the latest version of the secret.',
      ],
      priorityTitle: 'Precedence between $config and flags',
      priorityDesc:
        'Each setting is resolved on its own, from the first source that defines it:',
      priority1:
        'CLI flags (--provider, --vault-url, --profile) or GitHub Action inputs',
      priority2: '$config in the map file',
      priority3: 'Defaults: provider aws, default AWS credential chain',
      priorityExplain:
        'A flag replaces only the field it names; the other $config fields still apply. The same rules hold for pull, push and exec. When --map is omitted, envilder uses envilder.json in the current directory; pull and push also default --envfile to .env.',
      priorityGhaNote:
        'The GitHub Action accepts provider and vault-url inputs but has no profile input: in CI, credentials come from the workflow (for example OIDC), not from a named profile.',
      validationTitle: 'Validation rules',
      validationDesc:
        'envilder checks the file before it contacts any provider, so an invalid file never resolves part of its secrets:',
      validationRules: [
        'The file must be valid JSON. Comments and trailing commas are not allowed.',
        'Variable names must match ^[A-Za-z0-9_./-]+$: letters, digits, underscore, dot, hyphen and slash. Spaces, =, #, accented letters and line breaks are rejected, because they would inject or lose a line in a .env file.',
        'A name with / (Database/Password) works everywhere: the SDKs and exec pass it as written, and the .NET SDK maps it to a configuration section. When writing a .env file the CLI keeps it and warns, because python-dotenv loads that line but dotenv for Node.js, Docker Compose and bash do not; use exec or a __ name (Database__Password) if your app reads the file with one of those.',
        'An empty name is rejected.',
        '__proto__ cannot be used as a variable name: the schema rejects it and envilder never resolves it, because .env parsers cannot read it back.',
        'The name rule applies to every key, even when the value is not a string. A key with a non-string value (number, object, null) is then skipped, not resolved.',
        'With exec on Windows, two names that differ only by case are rejected, because Windows treats them as one variable.',
        'The schema recommends POSIX names (^[a-zA-Z_][a-zA-Z0-9_]*$). Dotted and hyphenated names are accepted, but some shells and tools cannot read them as variables.',
      ],
      multiEnvTitle: 'Multi-environment example',
      multiEnvDesc:
        'Keep one file per environment with the same keys, so the application code never changes. Only the paths and the profile differ:',
      multiEnvRun:
        'Choose the file with --map. Locally, run the app with the development file; for a production artifact, write a .env from the production file:',
      multiEnvGha:
        'In a workflow, point the action at the file for that environment:',
      multiEnvNaming:
        'Names that match envilder.json or envilder.*.json are recognized by SchemaStore, so most editors validate them even without the $schema line.',
      errorsTitle: 'Common errors',
      thMessage: 'Message',
      thFix: 'Fix',
      errInvalidNameFix:
        'Rename the key so it only uses letters, digits, underscore, dot, hyphen and slash.',
      errInvalidJsonFix:
        'Fix the JSON syntax: a trailing comma, a comment or a missing quote is the usual cause.',
      errProviderFix: 'Use aws or azure in $config.provider or --provider.',
      errVaultMissingFix:
        'Set $config.vaultUrl, or pass --vault-url, when the provider is azure.',
      errProfileAzureFix:
        'A warning, not an error. Remove profile from $config, or drop --profile, when using azure.',
      errCaseFix:
        'Rename one of the keys; exec on Windows refuses names that differ only by case.',
      relatedTitle: 'Related guides',
      relatedStart: 'Get started: from a secret to a running app',
      relatedExec: 'envilder exec reference',
      relatedAzure: 'Azure Key Vault setup',
    },
    pullReference: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      prereqTitle: 'Prerequisites',
      prereqItems: [
        'The envilder CLI. This page describes version 0.17.',
        'A map file, envilder.json by default, that maps each variable to a secret identifier.',
        'Read access to every mapped secret: ssm:GetParameter on AWS (plus kms:Decrypt when a parameter uses a customer-managed key), or the Get secret permission on Azure Key Vault, for example through the Key Vault Secrets User role.',
        'Credentials the provider SDK can find: an AWS profile, SSO session or environment variables, or an Azure sign-in such as az login or a managed identity.',
      ],
      synopsisTitle: 'Synopsis',
      synopsisDesc:
        'Pull is the default mode: there is no pull subcommand. Run envilder with no options to read envilder.json and write .env in the current directory. Adding --push, or --key, --value and --secret-path, switches to push mode, and envilder exec is a separate subcommand.',
      optionsTitle: 'Options',
      thOption: 'Option',
      thDefault: 'Default',
      thDescription: 'Description',
      optMapDefault: 'envilder.json in the current directory',
      optMap:
        'Map file to read. The run stops if the file is missing or the value is empty.',
      optEnvfile:
        'File to write. Created when it does not exist, updated in place when it does. Its directory must already exist.',
      optProviderDefault: '$config.provider, then aws',
      optProvider:
        'aws or azure, in any case. Any other value stops the run before a secret is read.',
      optVault:
        'Key Vault URL, for example https://my-vault.vault.azure.net. Required with azure.',
      optProfileDefault:
        '$config.profile, then the default AWS credential chain',
      optProfile:
        'Named AWS profile. With azure it is ignored and a warning is printed.',
      optionsNote:
        "An option that takes a path or a name never accepts a value that starts with -. In envilder --map --envfile=.env, --map has no value, so the run stops with error: option '--map <path>' argument missing instead of reading --envfile=.env as a path. envilder --help lists every option.",
      configTitle: 'How $config and flags combine',
      configDesc:
        'Each setting comes from the first source that defines it: the flag, then $config in the map file, then the default. A flag replaces only the field it names, so the other $config fields still apply. Take this production map file:',
      configRun:
        'The first command uses the settings in the file. The second overrides one field and keeps the rest:',
      configAwsNote:
        'The second command reads the same parameters with the ci-readonly profile. The provider still comes from $config.',
      configAzureNote:
        'The second command reads the same secret names from another vault. The provider still comes from $config.',
      configLink: 'Full precedence rules in the map file reference',
      exampleTitle: 'Example: update an existing .env',
      exampleDesc:
        'The map file declares four variables. In the vault, SENTRY_DSN does not exist and FEATURE_FLAG is empty. The project already has a .env file:',
      exampleRun:
        'Run envilder from the project root. Expected output with AWS:',
      exampleOutputNote:
        'With Azure the AWS identity line is not printed; the rest is the same. Values are masked: one longer than 10 characters shows its last 3, a shorter one is hidden entirely, and paths show their last 3 characters. The skipped lines are warnings on stderr; the rest goes to stdout.',
      exampleResult: 'The .env file afterwards:',
      envTitle: 'How an existing .env is updated',
      envRules: [
        'A mapped variable that is already in the file is replaced in place: same line, same inline comment, and the same quotes when they still hold the new value.',
        'A line that already holds the right value is not rewritten, so a run with nothing new leaves the file byte for byte identical.',
        'Lines the map file does not declare (LOG_LEVEL above), comments, blank lines, order and line endings are kept.',
        'Variables that are not in the file yet are appended at the end. A new file ends with a line break.',
        'A skipped secret keeps the value the file already had (SENTRY_DSN above). Envilder never removes a line.',
        'Before writing, Envilder reads the result back the way dotenv does. If any value would be lost or changed, it writes nothing and stops with an error that names the variables, never their values.',
      ],
      envNote:
        'Quoting, multiline values and the one value a .env file cannot hold are covered in',
      envNoteLink: 'what a secret can contain',
      envWarn:
        'The .env file contains the real secret values. Add it to .gitignore and delete it when you no longer need it, or use envilder exec to avoid the file altogether.',
      missingTitle: 'Missing, empty and failing secrets',
      missingDesc:
        'A secret that does not exist (ParameterNotFound in AWS SSM, 404 in Key Vault) or whose value is empty is skipped with a warning. The other secrets are still written, the summary counts only the resolved ones (2/4 above) and the exit code is 0.',
      failDesc:
        'Any other failure, such as access denied, missing credentials or a network error, stops the run. Envilder lists each affected variable with its masked path and the reason, leaves the .env file untouched and exits with 1:',
      ssoDesc:
        "When an AWS SSO session has expired and both stdin and stdout are a terminal, Envilder asks Run 'aws sso login --profile dev' now? [y/N]. If you accept and the login succeeds, it retries once. In CI, or if you decline, it prints the command to run and exits with 1. If a missing secret must also stop the run, use envilder exec: it never starts a command with an incomplete set of secrets.",
      errorsTitle: 'Common errors',
      thMessage: 'Message',
      thFix: 'Fix',
      errNoMapFix:
        'Run envilder from the directory that holds envilder.json, or pass --map=path/to/file.json.',
      errReadMapFix:
        'The file given with --map does not exist or cannot be read. Relative paths start at the current directory.',
      errJsonFix:
        'Fix the JSON syntax of the map file. A trailing comma or a comment is the usual cause.',
      errCredsFix:
        'The AWS SDK found no credentials. Run aws configure or aws sso login, or pass --profile with a configured profile.',
      errDeniedFix:
        'The credentials work but cannot read that parameter. Allow ssm:GetParameter on its ARN, plus kms:Decrypt for a customer-managed key.',
      errVaultFix:
        'Add "vaultUrl": "https://<vault-name>.vault.azure.net" to $config, or pass --vault-url.',
      errSsoFix:
        'Run aws sso login --profile dev, then run envilder again. In a terminal Envilder offers to run the login for you.',
      errRepresentFix:
        'The value cannot be written to a .env file without changing it, and nothing was written. Read that secret with envilder exec or an SDK, or store it encoded (for example base64).',
      relatedTitle: 'Related pages',
      relatedMap:
        'Map file reference: $config fields, validation rules and flag precedence',
      relatedExec:
        'envilder exec: run a command with the same secrets and no .env file',
      relatedPush: 'Push mode: upload a .env file or a single secret',
    },
    pushReference: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      prereqTitle: 'Prerequisites',
      prereqItems: [
        'The envilder CLI. This page describes version 0.17; single-secret push records the mapping since 0.16.',
        'Write access to the target: ssm:PutParameter on AWS, or the Set secret permission on Azure Key Vault, for example through the Key Vault Secrets Officer role.',
        'For --push, a map file and a .env file with the values. A single-secret push needs neither: it creates the map file when it is missing.',
      ],
      synopsisTitle: 'Synopsis',
      synopsisDesc:
        'Push has two forms. --push uploads values from a .env file. --key, --value and --secret-path together upload one secret; --push is optional with them. There is no push subcommand. --ssm-path is a deprecated alias of --secret-path and prints a warning.',
      thOption: 'Option',
      thDefault: 'Default',
      thDescription: 'Description',
      envTitle: 'Push a .env file',
      envDesc:
        'For each variable the map file declares, Envilder reads its value from the .env file and writes it to the mapped path. Variables in the .env file that the map file does not declare are ignored.',
      optPush: 'Selects push mode. Required for this form.',
      optEnvfile: 'File to read the values from.',
      optMap: 'Map file that lists the variables to push and their paths.',
      optShared:
        'Same as in pull mode: each flag overrides one $config field, and the default provider is aws.',
      envExample:
        'With this map file and .env file, envilder --push writes two secrets and ignores LOG_LEVEL. Expected output with AWS (Azure prints the same lines without the identity line):',
      envRules: [
        'A mapped variable that is missing from the .env file is skipped with a warning. A missing .env file is not an error either: every variable is skipped and the run exits with 0.',
        'Several variables can map to the same path only when they hold the same value. Otherwise Envilder stops before writing anything.',
        'Secrets are written in parallel. Throttling errors are retried up to 5 times with backoff. Any other error stops the run with exit code 1, and secrets already written stay written.',
      ],
      singleTitle: 'Push a single secret',
      singleDesc:
        'Pass the variable name, the value and the secret path. Envilder writes the secret and records "NAME": "<path>" in the map file, so the next envilder or envilder exec resolves it. The value is never written to the map file.',
      optKey: 'Variable name, recorded as the key in the map file.',
      optValue: 'Value to store. It must not be empty.',
      optSecretPath:
        'Parameter name in AWS SSM, or the secret reference for Key Vault. Recorded as written.',
      optMapSingle:
        'Map file that records the mapping and provides $config. Created when missing; its directory must exist.',
      optNoMapUpdate:
        'Push without reading, creating or updating a map file. Provider and vault then come only from flags.',
      singleExample:
        'In a directory without a map file, push one secret. The command, its expected output and the map file it creates:',
      singleAwsNote:
        'aws is the default provider, so no $config is written. A --profile flag is never written either: the profile is a local credential choice.',
      singleAzureNote:
        'For Azure the new file records $config with provider and vaultUrl, so later runs need no flags. In the vault, the secret is named my-app-dev-api-key.',
      mapRulesTitle: 'How the map file is updated',
      mapRules: [
        'No file: Envilder creates it. A file named envilder.json or envilder.*.json gets no $schema line, because editors already recognise it through SchemaStore; any other name gets one.',
        'The variable is not in the file: the entry is appended, keeping the indentation and line endings of the file (✓ Added API_KEY to envilder.json).',
        'The variable already maps to the same path: the file is not touched (✓ API_KEY already mapped in envilder.json, no changes).',
        'The variable maps to another path: nothing is pushed and Envilder exits with 1.',
        'The file targets another provider or vault than the push: the secret is pushed, the file is left as it is and a warning names both targets.',
        'The map file is written before the secret. If the push fails, Envilder restores the previous file, or deletes the one it created, so the file never lists a secret that was not pushed.',
      ],
      historyTitle: '--value ends up in your shell history.',
      historyDesc:
        'It is a command-line argument: the shell saves it, and it is visible in the process list while the command runs. Use it for test values. For real secrets, push from a .env file with --push and delete the file afterwards.',
      storeTitle: 'How values are stored',
      storeAws:
        'Every value is written with PutParameter as a SecureString, with overwrite enabled: a new parameter is created and an existing one gets a new version. Envilder passes no KMS key, so SSM uses the default key of the account.',
      storeAzure:
        "Every value is written with Set Secret, which creates the secret or adds a new version. The secret name is the path with its leading slashes removed and the other slashes turned into hyphens: /my-app/dev/api-key becomes my-app-dev-api-key. Nothing else changes, so a name Key Vault does not accept, for example one with _ or ., fails with Key Vault's own error. Two references that resolve to the same name in one run are an error.",
      errorsTitle: 'Common errors',
      thMessage: 'Message',
      thFix: 'Fix',
      errPartialFix:
        'Pass all three options with a non-empty value, or use --push to upload a .env file.',
      errConflictFix:
        'Use the path the map file already records, edit the map file by hand, or add --no-map-update.',
      errTargetFix:
        'A warning: the secret was pushed but not recorded. Pass --map with a map file for that target, or align --provider and --vault-url with the file.',
      errValuesFix:
        'Give both variables the same value in the .env file, or map them to different paths. Nothing was pushed.',
      errMissingVarFix:
        'A warning: add the variable to the .env file, or pass --envfile with the right file.',
      errMapDirFix:
        'Create the directory, or pass a --map path inside an existing one. Nothing was pushed.',
      errCollisionFix:
        'Use one reference per Key Vault secret in the map file.',
      errDeniedFix:
        'The credentials work but cannot write that parameter. Allow ssm:PutParameter on its ARN.',
      errVaultFix:
        'With --no-map-update no map file is read: pass --provider=azure together with --vault-url.',
      relatedTitle: 'Related pages',
      relatedMap: 'Map file reference: $config fields and validation rules',
      relatedPull: 'Pull mode: write the pushed secrets to a .env file',
      relatedAzure:
        'Azure Key Vault setup: roles and access policies for reading and writing secrets',
    },
    execReference: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      prereqTitle: 'Prerequisites',
      prereqItems: [
        'The envilder CLI. This page describes version 0.17.',
        'A map file and read access to every mapped secret, exactly as for pull mode.',
        'The command to run, on your PATH or given with its path.',
      ],
      synopsisTitle: 'Synopsis',
      separatorTitle: 'Where your command starts: the -- rule',
      separatorDesc:
        'Envilder options come first. Your command starts at the first argument that is not an Envilder option, or right after --. Everything after that is passed to it verbatim, even if it looks like an Envilder option. You only need -- when the command itself starts with -.',
      sepComment1: '# Everything belongs to npm',
      sepComment2: "# --map is Envilder's, the rest is npm's",
      sepComment3: '# --map=x belongs to npm: it comes after the command',
      sepComment4: '# Same as above, with an explicit separator',
      optionsTitle: 'Options',
      thOption: 'Option',
      thDescription: 'Description',
      thMessage: 'Message',
      optMap: 'Path to the map file (default: envilder.json)',
      optProfile: 'AWS CLI profile. Overrides $config.profile',
      optProvider: 'aws or azure. Overrides $config.provider',
      optVault: 'Azure Key Vault URL. Overrides $config.vaultUrl',
      optionsOrderDesc:
        'Envilder options go after exec, never before it. An option written before exec is rejected with exit code 125, and Envilder shows the corrected command:',
      rejectedDesc:
        'Exec mode never reads or writes a .env file and never pushes, so these options are rejected with exit code 125 before any provider call. An unknown option before your command is also an error, so a typo such as --mapp never reaches your command.',
      exampleTitle: 'Example',
      exampleDesc:
        'The map file declares DB_PASSWORD and API_TOKEN, and the shell already exports a DB_PASSWORD of its own. Start the app through Envilder:',
      outputDesc:
        'All Envilder output goes to stderr, so stdout belongs to your command: envilder exec -- node print.js > out.json writes only its output. The summary names your command by program name only, because arguments can carry secrets. With a profile it reads (aws, profile=dev).',
      exitTitle: 'Exit codes',
      exitDesc:
        "Exit codes follow GNU env and docker run, so you can tell an Envilder failure apart from your command's own exit code:",
      thCode: 'Code',
      thMeaning: 'Meaning',
      exitChild: 'Your command exited with code n',
      exitSignal:
        'Your command was killed by signal n (for example, 137 for SIGKILL)',
      exit125:
        'Envilder failed before starting the command: bad options, missing command, no map file, unresolved secrets or expired credentials',
      exit126:
        'The command exists but the operating system refused to run it (for example, Permission denied)',
      exit127: 'The command was not found',
      exitNote: 'Pull and push modes exit with 1 on failure.',
      failTitle: 'Fail-closed resolution',
      failDesc:
        'If any secret is missing, empty or unreadable (for example, access denied), the command does not start: Envilder lists the affected variables with masked paths and exits with 125. Pull mode, by contrast, skips a missing secret. Output when one secret does not exist and another is empty:',
      failRules: [
        'A secret value that contains a NUL byte is rejected, because an environment variable cannot hold one.',
        'On Windows, a map file that declares two names differing only by case (API_KEY and api_key) is rejected before any provider call, because Windows treats them as one variable. On Linux and macOS both are kept.',
        'A map file with no variables is not an error: Envilder prints Map file declares no variables. and starts the command with the inherited environment.',
        'Values are resolved once, before the command starts. A later change in the vault does not reach a running command.',
      ],
      envTitle: 'Environment',
      envDesc:
        'Your command inherits the full environment of the shell that runs Envilder, plus every variable in the map file. The map file wins: when an inherited variable has the same name as a mapped one, your command sees the value from the provider, and Envilder prints the names (never the values) on stderr:',
      envWindows:
        'On Windows names are compared without case: an inherited Path and a mapped PATH are the same variable, the mapped value wins and the command gets a single entry. Values are passed byte for byte, with no quoting, escaping or expansion.',
      noShellDesc:
        "No shell is involved: arguments reach your command as a list. Your own shell still parses the line first, so an unquoted $DB_PASSWORD expands to your shell's value, not the secret, and an unquoted && runs outside envilder exec. For shell features, start a shell explicitly:",
      ssoTitle: 'Expired AWS SSO sessions',
      ssoDesc:
        'When the AWS SSO session has expired and stdin and stderr are a terminal, Envilder offers to run aws sso login, then retries only the secret resolution: your command starts at most once. If you decline, the login fails or there is no terminal (in CI, for example), the exit code is 125. An error after the command has started is never retried.',
      signalsTitle: 'Signals',
      signalsDesc:
        'stdin, stdout and stderr are inherited and the TTY is preserved, so REPLs and prompts work. Ctrl+C in a terminal reaches your command directly. SIGTERM and SIGHUP (from docker stop or Kubernetes, for example) are forwarded, and Envilder waits for the command to exit with no timeout of its own. Only the direct child receives them: a launcher such as npm must stop its own children.',
      ciTitle: 'CI and GitHub Actions',
      ciDesc:
        'In CI, give the job cloud credentials first (for example with OIDC), then run the CLI in a run step. Only that step sees the secrets. The Envilder GitHub Action offers the same behavior through its command input.',
      ghaDesc:
        'When GITHUB_ACTIONS=true, Envilder registers every resolved value with GitHub log masking (::add-mask::) on stderr before your command starts, so values it prints are masked in the job log.',
      ghaNote:
        'Do not redirect the stderr of envilder exec away from the step log (2>/dev/null, for example): the runner reads the masks from it.',
      scriptsTitle: 'package.json scripts',
      scriptsDesc:
        'Put exec in your scripts so everyone starts the project the same way with npm run dev. Add envilder as a dev dependency (npm install --save-dev envilder) so the script finds it in node_modules/.bin:',
      usesTitle: 'Other common uses',
      usesDesc:
        'Any tool that reads its configuration from the environment works the same way. Each line below runs with the secrets of envilder.json:',
      usesComment1:
        '# Containers: -e NAME without a value copies it from the environment',
      usesComment2: '# Integration tests that read tokens from the environment',
      usesComment3: '# Migrations and one-off scripts that need DATABASE_URL',
      usesComment4:
        '# Terraform reads TF_VAR_<name> as the input variable <name>',
      usesComment5: '# Several commands with the same secrets',
      usesNote:
        "Docker Compose reads variable references in compose.yaml from its environment, so no .env file is needed; Docker keeps a container's environment in its metadata until the container is removed. Mark Terraform variables that hold secrets as sensitive.",
      sandboxTitle: 'Not a sandbox.',
      sandboxDesc:
        'Exec mode leaves an existing .env file untouched: delete it yourself when you move from pull. Your command and every process it starts can read the secrets, including any tool or AI agent that runs env through it. Only run commands you trust.',
      examplesDesc:
        'Start LocalStack with its auth token resolved from AWS SSM, or walk through push, pull and exec with npx envilder:',
      errorsTitle: 'Common errors',
      thFix: 'Fix',
      errMissingFix: 'Add the command after exec, or after --.',
      errUnknownFix:
        'Fix the option name. Everything before your command must be an Envilder option; put your own flags after the command.',
      errNoMapFix:
        'Run envilder from the directory that holds envilder.json, or pass --map after exec.',
      errNotFoundFix:
        'Exit code 127. Check the program name and your PATH. On Windows, cmd.exe first prints its own "is not recognized" line.',
      errPermissionFix:
        'Exit code 126. Make the file executable (chmod +x run.sh) or run it through its interpreter (sh ./run.sh).',
      errCaseFix: 'Windows only. Rename one of the two variables.',
      errNulFix:
        'Remove the NUL byte from the secret, or read it in-process with an SDK.',
      relatedTitle: 'Related pages',
      relatedStart:
        'Getting started: push a secret and run an app with envilder exec',
      relatedMap: 'Map file reference: $config fields and validation rules',
      relatedPull:
        'Pull mode: write the same secrets to a .env file when a tool needs one',
      guideLink:
        'Full exec guide on GitHub: Windows details and every error message',
    },
    title: 'Envilder docs: AWS SSM and Azure Key Vault secrets',
    description:
      'Learn how to resolve environment variables from AWS SSM Parameter Store and Azure Key Vault with the Envilder CLI, GitHub Action, and runtime SDKs.',

    backToHome: '← Back to home',
    pageTitle: 'Envilder documentation for AWS SSM and Azure Key Vault',
    intro: 'Everything you need to get started with Envilder.',
    pages: {
      hub: {
        title: 'Envilder documentation',
        description:
          'Guides for using Envilder with AWS SSM Parameter Store, Azure Key Vault, the CLI, GitHub Action, and runtime SDKs.',
        heading: 'Envilder documentation',
        intro:
          'Choose a guide to configure Envilder, resolve secrets, or load them at runtime.',
        breadcrumb: 'Documentation',
        navLabel: 'Documentation',
        cardTitle: 'Envilder documentation',
        cardSummary:
          'Find setup, provider, CLI, GitHub Action, and SDK guides.',
      },
      'getting-started': {
        title:
          'Get started: AWS SSM or Azure Key Vault to a running app in 5 minutes',
        description:
          'Install the Envilder CLI, map secrets in envilder.json and run your app with envilder exec: values from AWS SSM or Azure Key Vault, no .env on disk.',
        heading: 'Get started in 5 minutes',
        intro:
          'How do you get a secret from AWS SSM Parameter Store or Azure Key Vault into a running app? Install the Envilder CLI, map the secret to a variable name in envilder.json, and start your app with envilder exec, which hands the value to the process without writing a .env file. The whole setup takes about five minutes once your cloud credentials work.',
        breadcrumb: 'Get started',
        navLabel: 'Get started',
        cardTitle: 'Get started with Envilder',
        cardSummary:
          'Install the CLI, map one secret and run your app with envilder exec, for AWS SSM or Azure Key Vault.',
      },
      'aws-ssm': {
        title: 'Use Envilder with AWS SSM Parameter Store',
        description:
          'Configure AWS credentials and IAM permissions for Envilder with AWS SSM Parameter Store.',
        heading: 'AWS SSM',
        intro:
          'Configure credentials, IAM permissions, and a test parameter for AWS SSM Parameter Store.',
        breadcrumb: 'AWS SSM',
        navLabel: 'AWS SSM',
        cardTitle: 'AWS SSM setup',
        cardSummary:
          'Configure AWS credentials and the permissions Envilder needs.',
      },
      'azure-key-vault': {
        title: 'Azure Key Vault provider: credentials, RBAC and vault access',
        description:
          'Configure Envilder for Azure Key Vault: Azure default credentials, the vault URL, the minimum RBAC role or access policy, and how to verify access.',
        heading: 'Azure Key Vault',
        intro:
          'Configure Azure authentication, vault access, and a test secret for Azure Key Vault.',
        breadcrumb: 'Azure Key Vault',
        navLabel: 'Azure Key Vault',
        cardTitle: 'Azure Key Vault setup',
        cardSummary:
          'Configure Azure authentication and Key Vault permissions.',
      },
      'map-file': {
        title:
          'envilder.json reference: map environment variables to cloud secrets',
        description:
          'Reference for envilder.json: $config, providers, profiles, vault URL, flag precedence, variable name validation rules and a multi-environment example.',
        heading: 'Map file reference',
        intro:
          'What can envilder.json contain, and how does Envilder read it? It is one JSON object that maps environment variable names to secret identifiers, with an optional $config block for the provider, profile and vault URL. CLI flags override $config field by field, and an invalid name or provider stops the run before any secret is read.',
        breadcrumb: 'Map file',
        navLabel: 'Map file',
        cardTitle: 'Map file reference',
        cardSummary:
          'Every map file field, provider rules, flag precedence and name validation.',
      },
      'cli-pull': {
        title:
          'Pull mode: write AWS SSM or Azure Key Vault secrets to a .env file',
        description:
          'Pull mode reference: flags and defaults, $config precedence, expected output, how missing secrets and an existing .env are handled, common errors.',
        heading: 'Pull mode reference',
        intro:
          'What does envilder do when you run it without --push or exec? It reads envilder.json, fetches every mapped secret from AWS SSM Parameter Store or Azure Key Vault and writes the values to .env. An existing file is updated in place, keys the map file does not declare stay as they are, and a secret that does not exist is skipped with a warning.',
        breadcrumb: 'CLI pull',
        navLabel: 'CLI pull',
        cardTitle: 'CLI pull command',
        cardSummary:
          'Generate a .env file from secrets defined in your map file.',
      },
      'cli-push': {
        title:
          'Push mode: upload .env values or one secret to AWS SSM or Key Vault',
        description:
          'Push mode reference: upload a .env file or one secret with --key, how envilder.json is updated, SecureString and Key Vault naming, common errors.',
        heading: 'Push mode reference',
        intro:
          'How do you store secrets in AWS SSM Parameter Store or Azure Key Vault with Envilder? envilder --push uploads the .env value of every variable your map file declares, and --key, --value and --secret-path upload one secret without a .env file. A single-secret push also records the mapping in envilder.json, so envilder and envilder exec can read it right away.',
        breadcrumb: 'CLI push',
        navLabel: 'CLI push',
        cardTitle: 'CLI push command',
        cardSummary:
          'Upload a mapped .env file or one secret to your provider.',
      },
      'cli-exec': {
        title:
          'envilder exec: run a command with AWS SSM or Azure Key Vault secrets',
        description:
          'envilder exec reference: the -- separator, rejected options, exit code 125, environment and Windows rules, SSO recovery, signals and CI usage.',
        heading: 'envilder exec reference',
        intro:
          "How do you run a command with secrets from AWS SSM or Azure Key Vault without writing a .env file? envilder exec resolves every secret in your map file and starts the command with those values added to its environment. If any secret cannot be resolved the command never starts and Envilder exits with 125; otherwise it exits with the command's own code.",
        breadcrumb: 'CLI exec',
        navLabel: 'CLI exec',
        cardTitle: 'CLI exec command',
        cardSummary:
          'Start a command with mapped secrets in memory, with no .env file.',
      },
      'github-action': {
        title: 'Load AWS SSM and Azure Key Vault secrets in GitHub Actions',
        description:
          'Load AWS SSM Parameter Store or Azure Key Vault secrets into GitHub Actions jobs with OIDC, without a .env file: minimal IAM and RBAC permissions, full workflows and credential errors.',
        heading: 'Load AWS SSM and Azure Key Vault secrets in GitHub Actions',
        intro:
          'How do you use secrets from AWS SSM Parameter Store or Azure Key Vault in a GitHub Actions job without copying them into GitHub Secrets? Sign the job in with OIDC, then let the Envilder Action read your versioned envilder.json and export the secrets to the steps that follow.',
        breadcrumb: 'GitHub Action',
        navLabel: 'GitHub Action',
        cardTitle: 'GitHub Action guide',
        cardSummary:
          'Configure the action for AWS, Azure, and multiple environments.',
      },
      'sdk-dotnet': {
        title:
          'Load AWS SSM and Azure Key Vault secrets into .NET IConfiguration',
        description:
          'Envilder .NET SDK: load AWS SSM or Azure Key Vault secrets into ASP.NET Core IConfiguration or DI, with minimal IAM and RBAC, appsettings precedence and fixes.',
        heading: '.NET SDK',
        intro: 'Load secrets directly into a .NET application at startup.',
        breadcrumb: '.NET SDK',
        navLabel: '.NET SDK',
        cardTitle: '.NET SDK guide',
        cardSummary: 'Install and use the .NET runtime SDK.',
      },
      'sdk-python': {
        title: 'Load AWS SSM and Azure Key Vault secrets in Python at startup',
        description:
          'Envilder Python SDK: resolve secrets from AWS SSM Parameter Store or Azure Key Vault into os.environ or a dict, with no .env file on disk.',
        heading: 'Python SDK',
        intro: 'Load secrets directly into a Python application at startup.',
        breadcrumb: 'Python SDK',
        navLabel: 'Python SDK',
        cardTitle: 'Python SDK guide',
        cardSummary: 'Install and use the Python runtime SDK.',
      },
      'sdk-nodejs': {
        title: 'Load AWS SSM and Azure Key Vault secrets in Node.js at startup',
        description:
          'Envilder Node.js SDK: resolve secrets from AWS SSM or Azure Key Vault into process.env or a Map from one JSON mapping.',
        heading: 'Node.js SDK',
        intro: 'Load secrets directly into a Node.js application at startup.',
        breadcrumb: 'Node.js SDK',
        navLabel: 'Node.js SDK',
        cardTitle: 'Node.js SDK guide',
        cardSummary: 'Install and use the Node.js runtime SDK.',
      },
    },
    breadcrumbLabel: 'Breadcrumb',
    breadcrumbHome: 'Home',
    breadcrumbDocs: 'Documentation',
    navigationLabel: 'Documentation navigation',
    mobileNavigation: 'Choose a documentation page',
    navGettingStarted: 'Getting started',
    navProviders: 'Providers',
    hubCardsLabel: 'Documentation guides',
    openPage: 'Open guide',
    pagerLabel: 'Documentation pages',
    sidebarGettingStarted: 'Getting started',
    sidebarRequirements: 'Requirements',
    sidebarInstallation: 'Installation',
    sidebarAwsSetup: 'AWS setup',
    sidebarAzureSetup: 'Azure setup',
    sidebarCli: 'CLI',
    sidebarMappingFile: 'Mapping file',
    sidebarPullCommand: 'Pull command',
    sidebarPushCommand: 'Push command',
    sidebarPushSingle: 'Push single',
    sidebarConfigPriority: 'Config priority',
    sidebarGha: 'GitHub Action',
    sidebarGhaSetup: 'Setup',
    sidebarGhaBasic: 'AWS example',
    sidebarGhaAzure: 'Azure example',
    sidebarGhaMultiEnv: 'Multi-environment',
    sidebarGhaInputs: 'Inputs & outputs',
    // AWS setup
    awsSetupTitle: 'AWS setup',
    awsSetupIntro:
      'Everything you need to use Envilder with AWS SSM Parameter Store.',
    awsSetupCredTitle: '1. Configure credentials',
    awsSetupCredDesc:
      'Envilder uses your AWS CLI credentials. Set up the default profile:',
    awsSetupCredProfile: 'Or use a named profile for multi-account setups:',
    awsSetupPermTitle: '2. Grant IAM permissions',
    awsSetupPermDesc: 'Your IAM user or role needs access to SSM parameters:',
    awsSetupPermOperation: 'Operation',
    awsSetupPermPermission: 'Permission',
    awsSetupPermPull: 'Pull',
    awsSetupPermPush: 'Push',
    awsSetupPolicyExample: 'Example IAM policy (scope to your path prefix):',
    awsSetupVerifyTitle: '3. Create a test parameter and verify',
    awsSetupVerifyDesc:
      'Push a test secret with Envilder, which also writes the map file, then pull it back to confirm everything works:',
    awsSetupVerifySuccess:
      'If you see ⭐ LEVEL CLEARED, your AWS setup is complete.',
    awsSetupVerifySdk:
      'Or load secrets directly from your app with the Python SDK:',
    // Azure setup
    azureSetupTitle: 'Azure setup',
    azureSetupIntro:
      'Everything you need to use Envilder with Azure Key Vault.',
    azureSetupCredTitle: '1. Authenticate with Azure',
    azureSetupCredDesc: 'Envilder uses Azure Default Credentials. Log in with:',
    azureSetupCredVault:
      'Provide the vault URL via $config in your map file or the --vault-url CLI flag.',
    azureSetupAccessTitle: '2. Configure vault access',
    azureSetupCheck: 'Check which access model your vault uses:',
    azureRbacTrue: 'true → Azure RBAC (recommended)',
    azureRbacFalse: 'false / null → Vault Access Policy (classic)',
    azureOptionA: 'Option A: Azure RBAC (recommended)',
    azureOptionB: 'Option B: Vault Access Policy',
    azureSetupPermTitle: '3. Required permissions',
    azureSetupPermOperation: 'Operation',
    azureSetupPermPermission: 'Permission',
    azureSetupPermPull: 'Pull',
    azureSetupPermPush: 'Push',
    azureSetupPullNote:
      'For pull-only access, Key Vault Secrets User role is sufficient.',
    azureSetupVerifyTitle: '4. Create a test secret and verify',
    azureSetupVerifyDesc:
      'Push a test secret with Envilder, which also writes the map file, then pull it back to confirm everything works:',
    azureSetupVerifySuccess:
      'If you see ⭐ LEVEL CLEARED, your Azure setup is complete.',
    azureSetupVerifySdk:
      'Or load secrets directly from your app with the Python SDK:',
    mapThDefault: 'Default',
    mapThDescription: 'Description',
    mapContentsTitle: 'Secret contents (the resolved values)',
    mapContentsIntro:
      'Envilder never rewrites a secret value: what the provider returns is what your application gets. The limits come from where the value is stored:',
    mapThStage: 'Stage',
    mapThLimit: 'Limit',
    mapContentsProvider: 'Provider',
    mapContentsProviderLimit:
      'AWS SSM: 4 KB (standard) or 8 KB (advanced tier). Azure Key Vault: 25 KB.',
    mapContentsEnvFile: '.env file (CLI, GitHub Action)',
    mapContentsEnvFileLimit:
      'Every value dotenv can represent. See the exception below.',
    mapContentsProcess: 'Process environment',
    mapContentsProcessLimit:
      'The operating system cannot store NUL (U+0000) in a variable, and Windows limits a variable to 32,767 characters.',
    mapContentsResolveOnly:
      "The SDKs' resolve-only APIs (resolve, ResolveFile, IConfiguration) keep values in memory and are subject to the provider limits only.",
    mapContentsWriterDesc:
      'The CLI writes each value so that dotenv reads back exactly the original string. The quoting is chosen automatically and checked by parsing the result before the file is written. The check uses dotenv’s grammar extended to keys with /, so for those keys it proves the value round-trips, not that Node.js dotenv loads them (it skips such lines):',
    mapContentsRoundTrip:
      '#, leading and trailing whitespace, quotes, backslashes, a literal \\n, real LF/CRLF line breaks and Unicode all round-trip. When the file already exists, each assignment is replaced in place (a multiline one entirely), and comments, ordering and line endings are preserved.',
    mapContentsUnrepresentableTitle: 'The one value a .env file cannot hold:',
    mapContentsUnrepresentableDesc:
      'a value containing all three quote characters (\', " and `) together with a line break, leading or trailing whitespace, or a #. The CLI stops with an error that names the variable and leaves the .env file unchanged. Store such a value encoded (for example base64) or read it with an SDK.',
    mapContentsExpansionTitle: 'Variable expansion:',
    mapContentsExpansionDesc:
      'Envilder writes references such as $HOME literally and dotenv does not expand them, but other loaders do. Docker Compose, for instance, expands an unquoted KEY=$HOME when it reads the file. Keep this in mind when a secret contains $.',
    examplesTitle: 'Runnable examples.',
    ghaSetupTitle: 'How the action works',
    ghaSetupDesc:
      'The action is a composite step: it installs Node.js 22, reads the map file, fetches each secret with the cloud credentials the job already has and masks every value in the log. By default it then exports the secrets to the environment of every later step of the job; with command or env-file it runs one command or writes a .env file instead. It does not sign in to AWS or Azure itself, so an earlier step (aws-actions/configure-aws-credentials or azure/login) must do that. Use the published macalbert/envilder/github-action@v0 tag; no build step is needed.',
    ghaPrerequisites: 'Prerequisites',
    ghaPrereqAws:
      'AWS: an IAM role that GitHub can assume, used through aws-actions/configure-aws-credentials.',
    ghaPrereqAzure:
      'Azure: an app registration with a federated credential, used through azure/login.',
    ghaPrereqMap: 'An envilder.json committed to your repository',
    ghaPullOnly: 'The GitHub Action only supports pull mode (no push).',
    ghaBasicTitle: 'AWS SSM Parameter Store with OIDC',
    ghaMultiEnvTitle: 'Multi-environment workflow',
    ghaExecTitle: 'Run one command with the secrets',
    ghaExecDesc:
      "With the command input, the action runs that command with bash, from the repository root, with the secrets in its environment, and ends the step with the command's exit code. The secrets are not exported, so later steps, including third-party actions, never see them. Use it when a single step needs the secrets and you want the smallest exposure.",
    ghaExecNote:
      'You can also run the CLI yourself with npx envilder exec --map=envilder.json -- <command> in a run step. It needs Node.js 22.12 or later (actions/setup-node), and its stderr must stay in the step log, because GitHub reads the masks from there.',
    ghaExecLink: 'Read the full exec guide →',
    ghaAzureTitle: 'Azure Key Vault with OIDC',
    ghaInputsTitle: 'Action inputs & outputs',
    ghaInputsSubtitle: 'Inputs',
    ghaOutputsSubtitle: 'Outputs',
    ghaInputRequired: 'Required',
    ghaInputDefault: 'Default',
    ghaInputDesc: 'Description',
    ghaOutputEnvPath:
      'Path to the generated .env file (empty unless env-file is set)',
    ghaThInput: 'Input',
    ghaThRequired: 'Required',
    ghaThOutput: 'Output',
    ghaYes: 'Yes',
    ghaNo: 'No',
    ghaInputMap: 'Path to JSON mapping file',
    ghaInputEnv:
      'Optional. Path to a .env file to write, for tools that need a file. Without env-file or command, the secrets go to the job environment',
    ghaInputProvider: 'aws or azure',
    ghaInputVault: 'Azure Key Vault URL',
    ghaInputCommand:
      'Optional. Command to run (with bash) with the secrets only in its environment. Cannot be combined with env-file',
    ghaModesTitle: 'Choosing a mode',
    ghaModesDesc:
      'The action has three modes, and the inputs you set pick one. The default needs nothing but map-file:',
    ghaModesThMode: 'Mode',
    ghaModesThSelect: 'How to select it',
    ghaModesThScope: 'Who can read the secrets',
    ghaModesThFile: 'Writes a file',
    ghaModeJob: 'Job environment (default)',
    ghaModeJobSelect: 'Only map-file',
    ghaModeJobScope: 'Every later step of the job',
    ghaModeCommand: 'Command',
    ghaModeCommandScope: 'Only that command and the processes it starts',
    ghaModeEnvFile: '.env file',
    ghaModeEnvFileScope: 'Any step or tool that reads the file',
    ghaModesJobNote:
      'In the default mode the action appends the secrets to the GITHUB_ENV file of the runner, and the runner sets them in the environment of every step that runs after it in the same job, including third-party actions, Docker container actions and steps that run in a job container. Steps read them like any other variable: process.env.DB_PASSWORD, os.environ["DB_PASSWORD"] or $DB_PASSWORD. Other jobs do not get them, so each job that needs secrets runs the action again. A container you start yourself with docker run does not inherit them: pass them explicitly, for example with docker run -e DB_PASSWORD.',
    ghaModesEnvFileNote:
      'Use env-file only when a tool can read the secrets from a file and nothing else, for example docker compose --env-file. Prefer a path under runner.temp to keep the file out of the repository workspace. env-file and command cannot be combined.',
    ghaModesSafetyNote:
      'Not writing a .env file removes the most common way secrets leak from CI: a file picked up by upload-artifact, a cache, COPY . . in a Dockerfile or git add -A. Later tools can still write the variables to files, so treat build and test outputs as you would without Envilder. It also does not protect against malicious code in the job, which can read environment variables as easily as a file. Every mode masks the values in the log. The job environment and command modes are fail-closed: if any secret is missing or empty, the step fails and nothing is exported or started.',
    ghaPrereqCheckout:
      'actions/checkout before the action, so the map file exists on the runner.',
    ghaPrereqPermissions:
      'The id-token: write permission, so the job can request an OIDC token, plus contents: read.',
    ghaAwsTrustTitle: '1. Let GitHub assume an IAM role',
    ghaAwsTrustDesc:
      'Add token.actions.githubusercontent.com as an OpenID Connect identity provider in IAM (audience sts.amazonaws.com, once per account), then create a role with this trust policy. The sub condition limits it to one repository and branch; use repo:my-org/my-repo:environment:production to limit it to a GitHub environment instead.',
    ghaOidcSubjectNote:
      'On github.com, repositories created, renamed or transferred on or after 15 July 2026, and those opted in to immutable subject claims, get a sub that also carries the owner and repository IDs: repo:my-org@OWNER_ID/my-repo@REPO_ID:ref:refs/heads/main. Other repositories keep the name-only format shown above. Check the OIDC settings of your repository for the exact prefix and use the same value in the AWS trust policy and the Azure federated credential.',
    ghaAwsPolicyTitle: '2. Minimum permissions',
    ghaAwsPolicyDesc:
      "The action calls ssm:GetParameter with decryption, once per entry in the map file. It never lists, writes or deletes parameters, so this is the only permission the role needs. Scope it to your application's path:",
    ghaAwsKmsNote:
      'SecureString parameters encrypted with the default aws/ssm key need nothing else. If they use a customer managed KMS key, also allow kms:Decrypt on that key. The account shown in the log comes from sts:GetCallerIdentity, which needs no permission.',
    ghaWorkflowTitle: '3. Map file and workflow',
    ghaAwsMapDesc:
      'The map file is the same one you use with the CLI: each environment variable points to a parameter name.',
    ghaOutputTitle: 'Expected output',
    ghaOutputDesc:
      'The step log shows the mode, the AWS identity in use, each resolved variable with its value masked, and a summary:',
    ghaOutputMaskNote:
      "Every value is also registered with GitHub's add-mask command, so a later step that prints it shows *** instead. If you use env-file, the .env file stays on the runner; don't upload it as an artifact.",
    ghaAzureFedTitle: '1. Create a federated credential',
    ghaAzureFedDesc:
      'Create an app registration and its service principal, then add a federated credential that trusts tokens from one repository and branch. No client secret is created. The subject uses the same format as the AWS sub, including the immutable variant when your repository emits it.',
    ghaAzureRoleTitle: '2. Minimum role',
    ghaAzureRoleDesc:
      'Key Vault Secrets User lets the identity read secret values and nothing more. Assign it on the vault, not on the resource group or subscription:',
    ghaAzurePolicyNote:
      'If the vault uses access policies instead of Azure RBAC, grant get on secrets: az keyvault set-policy --name {VAULT} --spn {APP_ID} --secret-permissions get.',
    ghaAzureMapDesc:
      "With $config in the map file, the workflow doesn't need the provider or vault-url inputs. Key Vault names only allow letters, digits and hyphens, so Envilder converts paths: /myapp/prod/stripe-key is read as myapp-prod-stripe-key (leading slash removed, slashes turned into hyphens).",
    ghaAzureInputsNote:
      'The client, tenant and subscription IDs identify the app; they are not credentials, so repository variables are enough. When set, the provider and vault-url inputs override $config in the map file.',
    ghaMultiEnvDesc:
      "Keep one map file per environment and pick it from the workflow input. A job that sets environment gets an OIDC token whose sub ends in :environment:<name> instead of :ref:refs/heads/main, so each environment's AWS trust policy (or Azure federated credential) must use that subject: repo:my-org/my-repo:environment:production, or repo:my-org@OWNER_ID/my-repo@REPO_ID:environment:production if your repository emits immutable subjects. Each GitHub environment can then hold its own role ARN and protection rules.",
    ghaWhyTitle: 'Why not copy the secrets into GitHub Secrets',
    ghaWhyDesc:
      'Copying values into repository secrets works until a value changes. From then on there are two copies:',
    ghaWhyRotationLabel: 'Rotation:',
    ghaWhyRotation:
      'when a secret is rotated in SSM or Key Vault, every repository with a copy keeps deploying the old value until someone updates it by hand.',
    ghaWhyAuditLabel: 'Drift and audit:',
    ghaWhyAudit:
      "GitHub Secrets can't be read back, so you can't check whether the copy still matches the source. Reading from the cloud is recorded with the role or app behind each request: in CloudTrail on AWS, and in the Key Vault audit logs on Azure once diagnostic settings are enabled for the vault.",
    ghaWhyKeysLabel: 'Long-lived keys:',
    ghaWhyKeys:
      'copying secrets usually comes with an AWS access key or Azure client secret stored in GitHub as well. With OIDC the job gets a short-lived token, and nothing stored in GitHub works outside the workflow.',
    ghaWhyListLabel: 'One list:',
    ghaWhyList:
      'the map file is versioned with the code, reviewed in pull requests, and is the same file developers use locally with the CLI.',
    ghaWhyWhenSecrets:
      'GitHub Secrets is still a good fit for values that only exist for the pipeline, such as a token for a third-party deploy service.',
    ghaErrorsTitle: 'Common errors',
    ghaErrorsDesc:
      'Messages as they appear in the step log, and how to fix them. Envilder masks the secret path it prints next to each variable, except for the last three characters. Messages that come from AWS or Azure are shown as they are and can include the full parameter or resource name.',
    ghaErrMapTitle: "The map file can't be read",
    ghaErrMapFix:
      'The checkout step is missing or runs after the action, or map-file points to the wrong place. Paths are relative to the repository root.',
    ghaErrAssumeTitle: "The role can't be assumed",
    ghaErrAssumeFix:
      'This comes from aws-actions/configure-aws-credentials, before Envilder runs. Check that the workflow has id-token: write and that the sub in the trust policy matches the repository, branch or environment exactly, in the subject format your repository uses (with or without immutable IDs). Tag, pull_request and environment jobs produce a different sub.',
    ghaErrNoCredsTitle: 'No AWS credentials',
    ghaErrNoCredsFix:
      "No step signed the job in to AWS before the action. Add aws-actions/configure-aws-credentials above it, in the same job: credentials don't carry over between jobs.",
    ghaErrDeniedTitle: 'Access denied to a parameter',
    ghaErrDeniedFix:
      "The role is valid but its policy doesn't cover that parameter. Check the path in Resource and the region in the ARN, which must match the aws-region of the credentials step.",
    ghaErrExpiredTitle: 'Expired credentials',
    ghaErrExpiredFix:
      "The role session ended before the step ran (one hour by default). Run Envilder right after the credentials step, or raise role-duration-seconds together with the role's maximum session duration.",
    ghaErrNotFoundTitle: 'Parameter or secret not found',
    ghaErrNotFoundFix:
      'Check the name, the region and, on Azure, the converted name. In the default mode and with command, a missing or empty secret fails the step: nothing is exported and the command does not start. With env-file it is a warning, not a failure: the step still succeeds, with fewer secrets in the summary than in the map. In a new .env file the variable is left out. If the file already existed (committed, cached or written by an earlier step), its old value is kept, so delete the file before the action when a stale value must not survive. If a missing value must stop the deploy, use the default mode or command instead of env-file.',
    ghaErrVaultUrlTitle: 'Azure vault URL missing',
    ghaErrVaultUrlFix:
      'Set the vault-url input or $config.vaultUrl in the map file. Use the vault URI shown in the Azure portal, for example https://my-vault.vault.azure.net.',
    ghaErrAzureDeniedTitle: 'Access denied on Azure Key Vault',
    ghaErrAzureDeniedFix:
      "azure/login worked but the identity has no data-plane role on the vault. Assign Key Vault Secrets User on the vault and wait a few minutes, since role assignments take time to propagate. Vaults that use access policies report instead that the identity doesn't have secrets get permission.",
    ghaErrProfileTitle: 'AWS profile in the map file',
    ghaErrProfileFix:
      'If envilder.json sets $config.profile for local use, the action passes that profile to the AWS SDK. GitHub runners have no AWS profiles, and with a profile set the SDK ignores the credentials from configure-aws-credentials. Remove the profile from the map used in CI, or keep a separate map for CI.',
    ghaRelatedTitle: 'Related pages',
    ghaRelatedAws:
      'AWS SSM Parameter Store setup: credentials, IAM permissions and a quick check',
    ghaRelatedAzure:
      'Azure Key Vault setup: RBAC or access policies and a quick check',
    ghaRelatedMap: 'Map file reference: $config, providers and secret paths',
    ghaRelatedRepo: 'Action source code and README on GitHub',
    // SDKs
    sidebarSdks: 'SDKs',
    sidebarSdkDotnet: '.NET SDK',
    sidebarSdkPython: 'Python SDK',
    sidebarSdkNodejs: 'Node.js SDK',
    sdkDotnetTitle: '.NET SDK',
    sdkDotnetDesc:
      'How do you load AWS SSM Parameter Store or Azure Key Vault secrets into a .NET application without a .env file? Add the Envilder NuGet package and call AddEnvilder on your configuration: the secrets listed in envilder.json are resolved at startup and read like any other configuration key.',
    sdkDotnetInstall: 'Install',
    sdkDotnetOneLiner: 'One-liner: resolve + inject',
    sdkDotnetOneLinerDesc:
      'Resolve secrets from the map file and inject into Environment in a single call:',
    sdkDotnetResolve: 'Resolve without injecting',
    sdkDotnetResolveDesc:
      'Get secrets as a dictionary without modifying the environment:',
    sdkDotnetFluent: 'Fluent builder with overrides',
    sdkDotnetFluentDesc:
      'Override provider settings programmatically using the fluent API:',
    sdkDotnetEnvLoading: 'Environment-based loading',
    sdkDotnetEnvLoadingDesc:
      'Route secret loading based on your current environment. Each environment maps to its own secrets file:',
    sdkDotnetValidation: 'Secret validation',
    sdkDotnetValidationDesc:
      'Opt-in validation ensures all resolved secrets have non-empty values:',
    sdkDotnetQuickStartResolve: 'Advanced: full programmatic control',
    sdkDotnetQuickStartResolveDesc:
      'Parse the map file, resolve secrets, and inject them into environment variables:',
    sdkDotnetFullDocs: 'Full documentation →',
    sdkDotnetExamplesDesc:
      'xUnit test projects with Testcontainers and Aspire resolve a map file against AWS SSM and Azure Key Vault (emulated with LocalStack and Lowkey Vault) and pass the values to containers, with no .env file:',
    sdkDotnetPrereqTitle: 'Prerequisites',
    sdkDotnetPrereqDesc:
      'The package targets .NET Standard 2.0, so it runs on any in-support .NET release (its tests run on .NET 10, the current LTS). Each provider uses its own default credential chain:',
    sdkDotnetPrereqAws:
      'AWS: the default AWS credential chain (environment variables, shared credentials file, SSO or an IAM role). Set "profile" in $config to use a named profile.',
    sdkDotnetPrereqAzure:
      'Azure: DefaultAzureCredential (az login, managed identity or environment variables).',
    sdkDotnetIamTitle: 'Minimum IAM policy for AWS SSM',
    sdkDotnetIamDesc:
      'The SDK only reads parameters, so ssm:GetParameter on your path prefix is enough. Replace the region, account ID and prefix:',
    sdkDotnetIamKms:
      'Values are read with decryption. SecureString parameters encrypted with the default aws/ssm key need nothing more; if they use a customer-managed KMS key, also allow kms:Decrypt on that key.',
    sdkDotnetRbacTitle: 'Minimum RBAC role for Azure Key Vault',
    sdkDotnetRbacDesc:
      'Reading secrets only needs the Key Vault Secrets User role. Scope it to the vault, not the subscription:',
    sdkDotnetRbacNote:
      'If the vault still uses access policies instead of RBAC, grant only the get secret permission:',
    sdkDotnetMapTitle: 'The map file',
    sdkDotnetMapDesc:
      'The same envilder.json drives the examples below. Keys become configuration keys or environment variable names; values are parameter paths in SSM:',
    sdkDotnetMapAzureDesc:
      'For Key Vault, set the provider and the vault URL in $config. Values are Key Vault secret names:',
    sdkDotnetMapAzureNote:
      'The .NET SDK sends names to Key Vault as written, except that slashes become hyphens, like the CLI: a path such as /myapp/prod/db-password is read as myapp-prod-db-password. Any other character Key Vault rejects (for example _ or .) fails with its own error.',
    sdkDotnetAspTitle: 'ASP.NET Core with IConfiguration',
    sdkDotnetAspDesc:
      'Call AddEnvilder right after CreateBuilder. Keys are read exactly as written in the map file, so use environment-variable-style names: the same file then also works with the CLI and the other SDKs.',
    sdkDotnetAspOutput: 'Calling the endpoint returns:',
    sdkDotnetAspNote:
      'Secrets are resolved once, while the configuration is built, with one request per entry in the map. Values do not refresh while the app runs: restart it to pick up a rotated secret. A secret that does not exist is skipped without an error, so check the keys your app cannot start without.',
    sdkDotnetDiTitle: 'Dependency injection',
    sdkDotnetDiDesc:
      'AddEnvilder on IServiceCollection registers an EnvilderClient and the parsed map file as singletons, for code that resolves secrets on demand:',
    sdkDotnetWorkerTitle: 'Worker or console app without DI',
    sdkDotnetWorkerDesc:
      'No host is needed. Resolve the map with Env, validate it and use the dictionary directly:',
    sdkDotnetWorkerOutput: 'Output when both secrets resolve:',
    sdkDotnetWorkerHost:
      'In a Worker Service, call Env.Load before creating the host. The values become process environment variables, which the host configuration already reads, so double underscores work as section separators (Payments__ApiKey is read as Payments:ApiKey).',
    sdkDotnetPrecTitle: 'Combining with appsettings.{Environment}.json',
    sdkDotnetPrecDesc:
      'ASP.NET Core applies configuration sources in order and the last one wins. The default host adds them from lowest to highest priority:',
    sdkDotnetPrec1: 'appsettings.json',
    sdkDotnetPrec2: 'appsettings.{Environment}.json',
    sdkDotnetPrec3: 'User secrets (Development only)',
    sdkDotnetPrec4: 'Environment variables',
    sdkDotnetPrec5: 'Command-line arguments',
    sdkDotnetPrec6:
      'Envilder, when added after CreateBuilder as in the example above',
    sdkDotnetPrecEnvilder:
      'Because AddEnvilder runs after CreateBuilder, its secrets override every default source, including the command line. Keep non-secret defaults in appsettings and let Envilder supply only secrets. A key skipped because its secret does not exist does not erase anything: the appsettings value stays in effect.',
    sdkDotnetPrecMissing:
      'To let environment variables win again in a given deployment, add that source after Envilder:',
    sdkDotnetPerEnvDesc:
      'To use a different map per environment, build the file name from the environment name:',
    sdkDotnetExecTitle: 'Without the SDK: envilder exec',
    sdkDotnetExecDesc:
      'If the app only needs the values as environment variables, skip the package and let the CLI start it. The secrets are passed to the process, no .env file is written, and the command does not start if a secret cannot be resolved:',
    sdkDotnetExecKeys:
      'The .NET environment variable provider turns double underscores into section separators, so a map key such as ConnectionStrings__Default is read as ConnectionStrings:Default with no extra code.',
    sdkDotnetExecLink: 'envilder exec reference →',
    sdkDotnetErrTitle: 'Common errors',
    sdkDotnetErrIntro:
      'Each message below is the exact text raised by the SDK or returned by the cloud provider.',
    sdkDotnetErrExpiredTitle: 'ExpiredCredentialsException',
    sdkDotnetErrExpiredFix:
      'The security token or SSO session has expired. Refresh the credentials (aws sso login for SSO) and run again. The original AWS exception is in InnerException.',
    sdkDotnetErrSsoTitle: 'SsoSessionExpiredException',
    sdkDotnetErrSsoFix:
      "Run the command in the message. Without a profile in $config the message reads: Your AWS SSO session has expired. Run 'aws sso login' and re-run this command. The ProfileName property holds the profile, or null.",
    sdkDotnetErrMissingTitle: 'Missing parameter or secret',
    sdkDotnetErrMissingFix:
      'A parameter or secret that does not exist is skipped without an error: the key is absent from the dictionary and from IConfiguration. ValidateSecrets throws only when nothing resolved or a value is empty, so also check the keys you depend on (for example with TryGetValue) and verify the path in the map.',
    sdkDotnetErrDeniedTitle: 'Access denied',
    sdkDotnetErrDeniedAwsFix:
      'The identity lacks ssm:GetParameter on that parameter. Compare the Resource ARN, including the region, with the policy above.',
    sdkDotnetErrDeniedAzureFix:
      'Assign Key Vault Secrets User on the vault. Role assignments can take a few minutes to propagate.',
    sdkDotnetErrAzureNameTitle: 'Secret not found on Azure',
    sdkDotnetErrAzureNameFix:
      'The SDK sends each value as written, except that slashes become hyphens: a path-style name such as /myapp/prod/db-password is read as myapp-prod-db-password, like the CLI does. If the secret is still not found, check that the vault holds a secret with that name; names that differ only in case are the same secret.',
    sdkDotnetErrConfigTitle: 'Configuration errors',
    sdkDotnetErrMessageHeader: 'Message',
    sdkDotnetErrFixHeader: 'Fix',
    sdkDotnetErrCfgFile:
      'The path is relative to the working directory, not the project folder. Copy the file to the output directory or pass an absolute path.',
    sdkDotnetErrCfgVault:
      'Add "vaultUrl" to $config, or pass it with EnvilderOptions.',
    sdkDotnetErrCfgProfileAzure:
      'Remove "profile" from $config: it only applies to AWS.',
    sdkDotnetErrCfgVaultAws: 'Remove "vaultUrl", or set "provider" to "azure".',
    sdkDotnetErrCfgProfileMissing:
      'Check the name in ~/.aws/credentials or ~/.aws/config, or remove "profile" to use the default credential chain.',
    sdkDotnetBeforeTitle: 'What this replaces',
    sdkDotnetBeforeDesc:
      'The usual alternatives are a .env file copied between machines, or a hand-written script that calls the AWS or Azure SDK. The first leaves plaintext secrets on disk; the second is code every service must maintain. Here the versioned envilder.json lists only paths, and the values stay in your vault.',
    sdkDotnetRelatedTitle: 'Related guides',
    sdkDotnetRelatedMap: 'Map file reference',
    sdkDotnetRelatedAws: 'AWS SSM setup',
    sdkDotnetRelatedAzure: 'Azure Key Vault setup',
    sdkDotnetRelatedExec: 'envilder exec reference',
    sdkPythonTitle: 'Python SDK',
    sdkPythonDesc:
      'Load secrets directly into your Python application at startup. One-liner setup or fine-grained control with the fluent builder.',
    sdkPythonInstall: 'Install',
    sdkPythonQuickStart: 'Quick start: one-liner',
    sdkPythonQuickStartDesc:
      'Load secrets from a map file and inject them into the environment:',
    sdkPythonEnvLoading: 'Environment-based loading',
    sdkPythonEnvLoadingDesc:
      'Recommended for multi-environment apps. Map each environment to its own secrets file:',
    sdkPythonResolve: 'Resolve without injecting',
    sdkPythonResolveDesc:
      'Get secrets as a dictionary without modifying the environment:',
    sdkPythonFluent: 'Fluent builder with overrides',
    sdkPythonFluentDesc:
      'Override provider settings programmatically using the fluent API:',
    sdkPythonValidation: 'Secret validation',
    sdkPythonValidationDesc:
      'Opt-in validation ensures all resolved secrets have non-empty values:',
    sdkPythonFullDocs: 'Full documentation →',
    sdkPythonExamplesDesc:
      'A pytest project with Testcontainers resolves a map file against AWS SSM and Azure Key Vault (emulated with LocalStack and Lowkey Vault) and passes the values to containers, with no .env file:',
    sdkNodejsTitle: 'Node.js SDK',
    sdkNodejsDesc:
      'Load secrets directly into your Node.js application at startup. Async-first API with one-liner facade or fluent builder for full control.',
    sdkNodejsInstall: 'Install',
    sdkNodejsQuickStart: 'Quick start: one-liner',
    sdkNodejsQuickStartDesc:
      'Load secrets from a map file and inject them into process.env:',
    sdkNodejsResolve: 'Resolve without injecting',
    sdkNodejsResolveDesc:
      'Get secrets as a Map without modifying the environment:',
    sdkNodejsFluent: 'Fluent builder with overrides',
    sdkNodejsFluentDesc:
      'Override provider settings programmatically using the fluent API:',
    sdkNodejsEnvLoading: 'Environment-based loading',
    sdkNodejsEnvLoadingDesc:
      'Recommended for multi-environment apps. Map each environment to its own secrets file:',
    sdkNodejsValidation: 'Secret validation',
    sdkNodejsValidationDesc:
      'Opt-in validation ensures all resolved secrets have non-empty values:',
    sdkNodejsFullDocs: 'Full documentation →',
    sdkNodejsExamplesDesc:
      'A Vitest project with Testcontainers and an Aspire TypeScript AppHost resolve a map file against AWS SSM and Azure Key Vault (emulated with LocalStack and Lowkey Vault) and pass the values to containers, with no .env file:',
    pagerPrev: 'Previous',
    pagerNext: 'Next',
  },
};
