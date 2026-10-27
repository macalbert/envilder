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
          'Some tools and CI steps expect a .env file. pull writes one from the same map, and the GitHub Action does it in your workflows. Treat the generated file as a secret.',
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
        a: 'Yes. The GitHub Action pulls the mapped secrets into a .env file in your workflow, and the CLI (exec or pull) works in any CI runner that has cloud credentials.',
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
    inputEnvDesc: 'Path to .env file to generate',
    inputProviderDesc: 'Cloud provider: aws or azure (default: aws)',
    inputVaultDesc: 'Azure Key Vault URL',
    output: 'Output:',
    outputDesc: 'Path to the generated .env file',
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
        'Key Vault URL. Required for azure. Must use https:// and a Key Vault host (.vault.azure.net, .vault.azure.cn, .vault.usgovcloudapi.net or .vault.microsoftazure.de). Ignored by aws.',
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
      errVaultHttpsFix: 'Use the https:// URL shown in the vault overview.',
      errVaultHostFix:
        'Use the vault URI from Azure, for example https://my-vault.vault.azure.net, not a custom domain.',
      errProfileAzureFix:
        'A warning, not an error. Remove profile from $config, or drop --profile, when using azure.',
      errCaseFix:
        'Rename one of the keys; exec on Windows refuses names that differ only by case.',
      relatedTitle: 'Related guides',
      relatedStart: 'Get started: from a secret to a running app',
      relatedExec: 'envilder exec reference',
      relatedAzure: 'Azure Key Vault setup',
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
        title: 'Pull mode: generate a .env from AWS SSM or Azure Key Vault',
        description:
          'Reference for pull mode: generate a local .env from the secrets in your map file, with AWS profiles and AWS SSM or Azure Key Vault providers.',
        heading: 'CLI pull',
        intro:
          'Download secrets from your provider and write them to a local .env file.',
        breadcrumb: 'CLI pull',
        navLabel: 'CLI pull',
        cardTitle: 'CLI pull command',
        cardSummary:
          'Generate a .env file from secrets defined in your map file.',
      },
      'cli-push': {
        title: 'Push mode: upload .env values to AWS SSM or Azure Key Vault',
        description:
          'Reference for push mode (--push): upload a local .env or a single variable to Parameter Store or Key Vault, using the same JSON mapping.',
        heading: 'CLI push',
        intro:
          'Upload environment variables from a .env file or push one secret directly.',
        breadcrumb: 'CLI push',
        navLabel: 'CLI push',
        cardTitle: 'CLI push command',
        cardSummary:
          'Upload a mapped .env file or one secret to your provider.',
      },
      'cli-exec': {
        title:
          'Exec mode: run a command with AWS SSM or Azure Key Vault secrets',
        description:
          'Reference for envilder exec: resolve AWS SSM or Azure Key Vault secrets in memory and start your command with them, without writing a .env file.',
        heading: 'CLI exec',
        intro:
          'Run a command with your secrets in its environment, without writing a .env file.',
        breadcrumb: 'CLI exec',
        navLabel: 'CLI exec',
        cardTitle: 'CLI exec command',
        cardSummary:
          'Start a command with mapped secrets in memory, with no .env file.',
      },
      'github-action': {
        title: 'Load AWS SSM and Azure Key Vault secrets in GitHub Actions',
        description:
          'Load AWS SSM Parameter Store or Azure Key Vault secrets into a .env file in GitHub Actions with OIDC: minimal IAM and RBAC permissions, full workflows and credential errors.',
        heading: 'Load AWS SSM and Azure Key Vault secrets in GitHub Actions',
        intro:
          'How do you use secrets from AWS SSM Parameter Store or Azure Key Vault in a GitHub Actions job without copying them into GitHub Secrets? Sign the job in with OIDC, then let the Envilder Action read your versioned envilder.json and write a .env file for the steps that follow.',
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
    pullTitle: 'Pull command',
    pullDesc:
      'Download secrets from your cloud provider and generate a local .env file.',
    pullOptions: 'Options',
    pullExamples: 'Examples',
    pullOutput: 'Output',
    optionHeader: 'Option',
    pullOptMap: 'Path to JSON mapping file',
    pullOptEnv: 'Path to write .env',
    pullOptProvider: 'aws (default) or azure',
    pullOptVault: 'Azure Key Vault URL',
    pullOptProfile: 'AWS CLI profile to use',
    pullCommentDefault: '# Default (AWS SSM)',
    pullCommentProfile: '# With AWS profile',
    pullCommentAzureConfig: '# Azure via $config in map file',
    pullCommentAzureFlags: '# Azure via CLI flags',
    pullOutputTitle: 'Output',
    pullExecTitle: "Don't want a .env file?",
    pullExecDesc:
      'Use envilder exec: it resolves the same map file and starts your command with the secrets in its environment, without writing anything to disk.',
    pullExecGuideLink: 'Read the CLI exec guide',
    execTitle: 'Exec command',
    execDesc:
      'envilder exec resolves every secret in your map file and starts a command with those values in its environment. Nothing is written to disk: there is no .env file to gitignore, keep in sync or clean up. The map file and its $config work exactly as in pull mode.',
    execUsageTitle: 'Usage',
    execSeparatorTitle: 'Where your command starts: the -- rule',
    execSeparatorDesc:
      'Envilder options come first. Your command starts at the first argument that is not an Envilder option, or right after -- when present. Everything from there on is passed to your command verbatim, even if it looks like an Envilder option. The -- is optional; you only need it when the command itself starts with -.',
    execSepComment1: '# Everything belongs to npm',
    execSepComment2: "# --map is Envilder's, the rest is npm's",
    execSepComment3: '# --map=x belongs to npm: it comes after the command',
    execSepComment4: '# Same as above, with an explicit separator',
    execOptions: 'Options',
    execOptMap: 'Path to the map file (default: envilder.json)',
    execOptProfile: 'AWS CLI profile. Overrides $config.profile',
    execOptProvider: 'aws or azure. Overrides $config.provider',
    execOptVault: 'Azure Key Vault URL. Overrides $config.vaultUrl',
    execOptionsOrderDesc:
      'Envilder options go after exec, never before it. An option written before exec is rejected with exit code 125, and Envilder shows the corrected command:',
    execRejectedDesc:
      'Exec mode never reads or writes a .env file and never pushes secrets, so --envfile, --push, --key, --value and --secret-path are rejected with exit code 125 before any provider call. An unknown option before your command is also an error, so a typo such as --mapp never reaches your command by accident.',
    execExamples: 'Examples',
    execCommentNpx:
      '# Start your dev server with the secrets from envilder.json',
    execCommentMap: '# Use a specific map file',
    execCommentAzure: '# Azure Key Vault via CLI flags',
    execCommentDocker:
      '# Docker Compose can interpolate the secrets in compose.yaml',
    execPackageJsonDesc: 'Or wire it into your package.json scripts:',
    execOutputTitle: 'Output',
    execOutputDesc:
      "Your command owns stdout. All Envilder output goes to stderr, so envilder exec -- node print.js > out.json writes only your command's output to out.json. On success Envilder prints a single summary line that names your command by program name only, because arguments can carry secrets:",
    execUseCasesTitle: 'Common use cases',
    execUseCasesDesc:
      "In every case the values exist only in the environment of your command and the processes it starts, Envilder never creates a .env file, and your command's exit code becomes Envilder's exit code. What your command does with the values is up to it: Docker, for example, keeps a container's environment in its on-disk metadata (visible with docker inspect) until the container is removed.",
    execUcLocalstackTitle: 'Start LocalStack with its auth token',
    execUcLocalstackDesc:
      'When you need it: LocalStack needs LOCALSTACK_AUTH_TOKEN and you do not want the token in a .env file or in your shell history.',
    execUcLocalstackComposeDesc:
      'With Docker Compose, reference the variable in compose.yaml. Compose takes its value from the environment it runs in, so no .env file is needed:',
    execUcLocalstackDockerDesc:
      'With plain Docker, -e NAME without a value copies the variable from the environment of the docker client, so the token never appears on the command line:',
    execUcLocalstackExamplesDesc:
      'The same setup with Testcontainers (TypeScript, Python, .NET) and Aspire is in',
    execUcTestsTitle: 'Integration tests that start containers',
    execUcTestsDesc:
      'When you need it: your tests start containers (for example, with Testcontainers) and read a token or credentials from the environment (process.env, os.environ, Environment.GetEnvironmentVariable) to pass them in.',
    execUcTestsNote:
      'A failing test run keeps its exit code, so CI still fails. If a secret cannot be resolved, the tests do not start and the exit code is 125.',
    execUcMigrationsTitle: 'Database migrations and one-off scripts',
    execUcMigrationsDesc:
      'When you need it: a migration tool or a script needs DATABASE_URL once, and you do not want the connection string on disk. Use --map to run the same command against another environment.',
    execUcTerraformTitle: 'Terraform and other IaC tools',
    execUcTerraformDesc:
      'When you need it: a Terraform input variable holds a secret. Terraform reads TF_VAR_<name> environment variables as values for the input variable <name>.',
    execUcTerraformNote:
      'Declare the variable with sensitive = true so Terraform hides it in plan output. Terraform still stores values it writes into resources in its state, so protect the state as usual.',
    execUcDevTitle: 'Local dev server through package scripts',
    execUcDevDesc:
      'When you need it: everyone on the team should start the app with the same secrets by running npm run dev.',
    execUcDevNote:
      'Add envilder as a dev dependency (npm install --save-dev envilder) so the script finds it in node_modules/.bin.',
    execUcGhaTitle: 'A step in GitHub Actions',
    execUcGhaDesc:
      'When you need it: one step of a workflow needs the secrets, and only that step. Configure AWS credentials with OIDC, then run your command through npx envilder exec:',
    execUcGhaNote:
      'Resolved values are registered with GitHub log masking before your command starts, and the next steps do not see them.',
    execUcChainTitle: 'Several commands with the same secrets',
    execUcChainDesc:
      'When you need it: you want to chain commands or keep working in a shell that has the secrets.',
    execUcChainNote:
      'Quote the whole sh -c script in single quotes so your own shell does not run && outside envilder exec. The exec before the last command replaces the shell with it, so signals forwarded by Envilder reach npm start directly. In the interactive shell every command you run sees the secrets; type exit to leave it.',
    execBehaviorTitle: 'Behavior',
    execExitTitle: 'Exit codes',
    execExitDesc:
      "Exit codes follow GNU env and docker run, so you can tell an Envilder failure apart from your command's own exit code:",
    execThCode: 'Code',
    execThMeaning: 'Meaning',
    execThMessage: 'Message',
    execExitChild: 'Your command exited with code n',
    execExitSignal:
      'Your command was killed by signal n (for example, 137 for SIGKILL)',
    execExit125:
      'Envilder failed before starting the command: bad options, missing command, no map file, unresolved secrets or expired credentials',
    execExit126:
      'The command exists but the operating system refused to run it (for example, Permission denied)',
    execExit127: 'The command was not found',
    execExitNote: 'Pull and push modes keep exiting with 1 on failure.',
    execFailClosedTitle: 'Fail-closed',
    execFailClosedDesc:
      'Pull mode warns and skips a missing secret. Exec mode never starts your command with an incomplete set of secrets: if any secret is missing, empty or cannot be read (for example, access denied), the command is not started, Envilder lists the affected variables with their masked paths and exits with 125. Values are resolved once, when the command starts.',
    execEnvTitle: 'Environment',
    execEnvDesc:
      'Your command inherits the full environment of the shell that runs Envilder, plus every variable in the map file. The map file wins: when an inherited variable has the same name as a mapped one, your command sees the value from the provider, and Envilder prints the names (never the values) on stderr:',
    execNoShellDesc:
      "Envilder does not start an extra shell: arguments are passed to your command as a list. Your own shell still parses the command line first, so quote what it should not interpret: '$DB_URL' or '&&' in single quotes reach your command literally, while an unquoted $DB_URL expands to your shell's value (not the resolved secret) and an unquoted && runs a second command outside envilder exec. If you need shell features with the secrets, start a shell explicitly:",
    execGhaTitle: 'GitHub Actions masking',
    execGhaDesc:
      'When GITHUB_ACTIONS=true, Envilder registers every resolved value with GitHub log masking (::add-mask::), so values your command prints are masked in the job log. Every registration is written to stderr before your command starts; if one cannot be written, the command does not start (exit code 125). The Envilder GitHub Action does not offer exec mode: run the CLI from a run step.',
    execGhaNote:
      'Do not redirect the stderr of envilder exec away from the step log (for example, with 2> file or 2>/dev/null): that is where the runner reads the masks from. The runner reads stdout and stderr through separate pipes, so a value your command prints immediately can, in rare cases, reach the log before its mask is processed.',
    execSignalsTitle: 'Signals',
    execSignalsDesc:
      'stdin, stdout and stderr are inherited and the TTY is preserved, so REPLs, shells and prompts work as usual. Ctrl+C in a terminal reaches your command directly. SIGTERM and SIGHUP (for example, from docker stop or Kubernetes) are forwarded to your command, and Envilder waits for it to exit, with no timeout of its own, before returning its exit code. Signals go to the direct child only: a launcher such as npm is responsible for stopping its own children.',
    execSandboxTitle: 'Not a sandbox.',
    execSandboxDesc:
      'Exec mode never creates a .env file, and it leaves any existing one untouched: if you are moving from pull, delete your old .env yourself. It does not isolate the process. Your command and every process it starts can read the secrets in their environment, including any tool or AI coding agent that runs env or printenv through it. On Linux, other processes running as the same user can read /proc/<pid>/environ. Only run commands you trust with the secrets you map.',
    execGuideLink:
      'Full exec command guide on GitHub: Windows details, SSO recovery and every error message',
    examplesTitle: 'Runnable examples.',
    execExamplesDesc:
      'Start LocalStack with envilder exec docker run, with the auth token resolved from AWS SSM without a .env file (Docker keeps it in the container metadata until the container is removed), or walk through push, pull and exec with npx envilder:',
    pushTitle: 'Push command',
    pushDesc:
      'Upload environment variables from a local .env file to your cloud provider using a mapping file.',
    pushOptions: 'Options',
    pushExamples: 'Examples',
    pushOptPush: 'Enable push mode (required)',
    pushOptEnv: 'Path to your local .env file (default: .env)',
    pushOptMap: 'Path to parameter mapping JSON (default: envilder.json)',
    pushOptProvider: 'aws (default) or azure',
    pushOptVault: 'Azure Key Vault URL',
    pushOptProfile: 'AWS CLI profile (AWS only)',
    pushCommentAws: '# Push to AWS SSM (defaults to envilder.json and .env)',
    pushCommentProfile: '# With AWS profile',
    pushCommentAzureConfig: '# Azure via $config in map file',
    pushCommentAzureFlags: '# Azure via CLI flags',
    pushSingleTitle: 'Push single variable',
    pushSingleDesc:
      'Push a single environment variable directly to your cloud provider without using a .env file. Envilder also records the mapping in envilder.json (created if missing), so envilder exec can resolve it right away. The value is never written to the file.',
    pushSingleOptions: 'Options',
    pushSingleOptPush:
      'Optional: --key, --value and --secret-path already activate push mode',
    pushSingleOptKey: 'Environment variable name',
    pushSingleOptValue: 'Value to store',
    pushSingleOptPath: 'Full secret path in your cloud provider',
    pushSingleOptMap:
      'Optional: map file that is created or updated with the mapping and read for $config (default: envilder.json)',
    pushSingleOptNoMapUpdate:
      'Optional: push without reading, creating or updating any map file; provider and vault come only from flags',
    pushSingleOptProvider: 'aws (default) or azure',
    pushSingleOptVault: 'Azure Key Vault URL',
    pushSingleOptProfile: 'AWS CLI profile (AWS only)',
    ghaSetupTitle: 'How the action works',
    ghaSetupDesc:
      'The action is a composite step: it installs Node.js 22, reads the map file, fetches each secret with the cloud credentials the job already has, masks every value in the log and writes the .env file. It does not sign in to AWS or Azure itself, so an earlier step (aws-actions/configure-aws-credentials or azure/login) must do that. Use the published macalbert/envilder/github-action@v0 tag; no build step is needed.',
    ghaPrerequisites: 'Prerequisites',
    ghaPrereqAws:
      'AWS: an IAM role that GitHub can assume, used through aws-actions/configure-aws-credentials.',
    ghaPrereqAzure:
      'Azure: an app registration with a federated credential, used through azure/login.',
    ghaPrereqMap: 'An envilder.json committed to your repository',
    ghaPullOnly: 'The GitHub Action only supports pull mode (no push).',
    ghaBasicTitle: 'AWS SSM Parameter Store with OIDC',
    ghaMultiEnvTitle: 'Multi-environment workflow',
    ghaExecTitle: 'Run a command without writing a .env file',
    ghaExecDesc:
      'The action always writes a .env file. If you would rather keep secrets off the runner disk, skip the action and run envilder exec in a run step, after the same credentials step. Options for Envilder go before --, and your command goes after it. Envilder masks every resolved value in the job log, and the command does not start if any secret is missing.',
    ghaExecNote:
      'The CLI needs Node.js 22.12 or later, so set it up with actions/setup-node before the step. Do not redirect the stderr of envilder exec away from the step log: GitHub reads the masks from there.',
    ghaExecLink: 'Read the full exec guide →',
    ghaAzureTitle: 'Azure Key Vault with OIDC',
    ghaInputsTitle: 'Action inputs & outputs',
    ghaInputsSubtitle: 'Inputs',
    ghaOutputsSubtitle: 'Outputs',
    ghaInputRequired: 'Required',
    ghaInputDefault: 'Default',
    ghaInputDesc: 'Description',
    ghaOutputEnvPath: 'Path to the generated .env file',
    ghaThInput: 'Input',
    ghaThRequired: 'Required',
    ghaThOutput: 'Output',
    ghaYes: 'Yes',
    ghaNo: 'No',
    ghaInputMap: 'Path to JSON mapping file',
    ghaInputEnv: 'Path to the .env file to generate',
    ghaInputProvider: 'aws or azure',
    ghaInputVault: 'Azure Key Vault URL',
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
      'The step log shows the AWS identity in use, each resolved variable with its value masked, and a summary:',
    ghaOutputMaskNote:
      "Every value is also registered with GitHub's add-mask command, so a later step that prints it shows *** instead. The .env file stays on the runner; don't upload it as an artifact.",
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
      'This is a warning, not a failure: the step still succeeds, with fewer secrets in the summary than in the map. In a new .env file the variable is left out. If the file already existed (committed, cached or written by an earlier step), its old value is kept, so delete the file before the action when a stale value must not survive. Check the name, the region and, on Azure, the converted name. If a missing value must stop the deploy, check for it in a later step.',
    ghaErrVaultUrlTitle: 'Azure vault URL missing',
    ghaErrVaultUrlFix:
      'Set the vault-url input or $config.vaultUrl in the map file. It must be an https URL ending in .vault.azure.net, or the equivalent domain of a sovereign cloud.',
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
