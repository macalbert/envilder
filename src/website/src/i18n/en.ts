import type { Translations } from './types';

export const en: Translations = {
  homeMeta: {
    title:
      'Envilder: standardize how your applications consume secrets across every environment and runtime.',
    description:
      'Define your environment contract once and resolve it consistently across local development, CI/CD, and runtime. Using AWS SSM Parameter Store and Azure Key Vault.',
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
    ariaTheme: 'Theme',
  },
  hero: {
    title1: 'Standardize how',
    title2: 'your apps consume',
    titleAccent: 'secrets.',
    description:
      'Stop reinventing secret loading in every project. Define one environment contract and resolve it everywhere.',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descOr: '·',
    descSuffix: ' · GitHub Action · Runtime SDKs',
    getStarted: '▶ Get started',
    viewOnGithub: '★ View on GitHub',
    tabCli: 'CLI',
    tabCliDesc: 'writes .env',
    tabSetup: 'Setup',
    tabSetupDesc: 'create secrets',
    tabNode: 'Node.js',
    tabNodeDesc: 'at runtime',
    tabPython: 'Python',
    tabPythonDesc: 'at runtime',
    tabDotnet: '.NET',
    tabDotnetDesc: 'at runtime',
    terminalComment1: '# 1. Map env vars to SSM paths',
    terminalComment2: '# 2. Resolve secrets into .env',
    setupComment1: '# AWS CLI configured with permissions to SSM',
    setupComment2: '# Push each secret to SSM Parameter Store',
    sdkCommentLoad: '# Load the same contract at runtime',
    terminalSceneLabel: 'Terminal demo scene',
  },
  trust: {
    label: 'WORKS WITH',
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
    awsCreditsAlt: 'AWS Open Source Credits Program',
    awsCreditsLabel: 'AWS Open Source Credits',
  },
  problemSolution: {
    title: 'Why secret management ',
    titleAccent: 'is broken',
    titleSuffix: '',
    subtitle:
      'Every team, every stage, every runtime handles secrets differently. No standard. No consistency. No confidence.',
    problems: [
      {
        icon: '💀',
        title: 'Fragmented across tools',
        description:
          'Local dev uses .env files. CI/CD reads from vault integrations. Production has its own method. Same app, different configuration workflows everywhere.',
      },
      {
        icon: '📨',
        title: 'Secrets shared through unsafe channels',
        description:
          'API keys sent over Slack, .env files committed to repos, wiki pages with plain-text credentials. A security incident waiting to happen.',
      },
      {
        icon: '🐌',
        title: 'Configuration drift is inevitable',
        description:
          'No single source of truth for what secrets an app needs. Dev, staging, and production desync. Deployments fail. Nobody knows which config is correct.',
      },
    ],
  },
  howItWorks: {
    title: 'How it ',
    titleAccent: 'works',
    subtitle: 'Define. Resolve. Ship.',
    stepLabel: 'STEP',
    steps: [
      {
        title: 'Define the mapping model',
        description:
          'A JSON file mapping env var names to cloud secret paths. Commit it. Review it in PRs. Diff it between environments. One model for every stage and runtime.',
      },
      {
        title: 'Resolve with the CLI',
        description:
          'One command fetches every secret from your cloud vault and writes them to .env. Use it locally or in scripts. Same mapping, same behavior.',
      },
      {
        title: 'Load at runtime with SDKs',
        description:
          'Skip the .env file entirely. Load secrets directly into your application at startup with native SDKs: Python, .NET, Node.js, and more.',
      },
      {
        title: 'Push from dev to the vault',
        description:
          'Need to add or rotate a secret? Push values from your local environment back to the cloud provider. No console needed.',
      },
      {
        title: 'Secrets stay in your vault',
        description:
          'No intermediaries. Your cloud manages the storage, rotation, and access control. Envilder resolves. It never stores.',
      },
    ],
    terminalFetched1: '✔ Fetched DB_PASSWORD  → ···word',
    terminalFetched2: '✔ Fetched API_KEY      → ···key',
    terminalFetched3: '✔ Fetched SECRET_TOKEN → ···oken',
    terminalWritten: '✔ Environment file written to .env',
    sdkTabPython: 'Python',
    sdkTabDotnet: '.NET',
    sdkTabNodejs: 'Node.js',
    pushTerminalPushed1: '✔ Pushed DB_PASSWORD  → /my-app/prod/db-password',
    pushTerminalPushed2: '✔ Pushed API_KEY      → /my-app/prod/api-key',
    pushTerminalPushed3: '✔ Pushed SECRET_TOKEN → /my-app/prod/secret-token',
  },
  features: {
    title: 'Why ',
    titleAccent: 'Envilder?',
    subtitle:
      'Envilder is a resolution layer over your existing secret manager. Secrets stay in your cloud. The JSON mapping is just the contract that keeps every environment consistent.',
    highlights: [
      {
        icon: '🧱',
        title: 'Zero Infrastructure',
        description:
          'No servers, no proxies, no SaaS middleman. Built on AWS SSM and Azure Key Vault, services you already use and pay for.',
      },
      {
        icon: '📋',
        title: 'One File, All Secrets',
        description:
          'A single JSON contract defines every secret for every environment. Git-versioned, PR-reviewable, diff-able. Your team reviews secret changes in the same PR as the code.',
      },
      {
        icon: '🔄',
        title: 'Safe Secret Rotation',
        description:
          'Rotate values in AWS SSM or Azure Key Vault. Every consumer (local, CI/CD, and runtime) resolves the new value automatically. No .env rewrites, no pipeline changes.',
      },
      {
        icon: '☁️',
        title: 'Multi-Cloud, No Lock-in',
        description:
          'AWS SSM, Azure Key Vault, GCP Secret Manager (coming soon). Switch providers without changing your app code. Your cloud, your rules.',
      },
    ],
    extrasTitle: 'Also included',
    extras: [
      {
        icon: '⚙️',
        title: 'GitHub Action',
        description:
          'Pull secrets in CI/CD workflows. Same mapping, zero manual intervention.',
      },
      {
        icon: '🔄',
        title: 'Bidirectional Sync',
        description:
          'Pull to .env or push .env values back to your cloud provider via CLI.',
      },
      {
        icon: '🔌',
        title: 'Secrets Never Touch Disk',
        description:
          'Runtime SDKs load secrets directly into memory at app startup. No .env files written to disk.',
      },
      {
        icon: '🔒',
        title: 'Native IAM & RBAC',
        description:
          'AWS IAM policies or Azure RBAC. No extra auth layer needed.',
      },
      {
        icon: '📊',
        title: 'Full Audit Trail',
        description:
          'Every access logged in CloudTrail or Azure Monitor automatically.',
      },
      {
        icon: '👤',
        title: 'AWS Profile Support',
        description:
          'Switch between AWS CLI profiles for multi-account setups.',
      },
    ],
  },
  demo: {
    title: 'See it in ',
    titleAccent: 'action',
    subtitle:
      'Watch how Envilder simplifies secret management in under 2 minutes.',
    cliDemo: 'CLI Demo: Pull Secrets',
    ghaWorkflow: 'GitHub Action Workflow',
    comingSoon: 'Coming soon',
  },
  providers: {
    title: 'Your cloud. ',
    titleAccent: 'Your choice.',
    subtitle:
      'Envilder works with AWS SSM Parameter Store, Azure Key Vault, and GCP Secret Manager (coming soon). Configure inline or via CLI flags.',
    awsTitle: 'AWS SSM Parameter Store',
    awsDefault: 'Default provider',
    awsFeatures: [
      'Supports GetParameter with WithDecryption',
      'AWS Profile support for multi-account',
      'IAM policy-based access control',
      'CloudTrail audit logging',
    ],
    azureTitle: 'Azure Key Vault',
    azureBadge: 'New in v0.8',
    azureFeatures: [
      'Auto-normalizes secret names (slashes → hyphens)',
      'DefaultAzureCredential authentication',
      'Azure RBAC access control',
      'Azure Monitor audit logging',
    ],
    gcpTitle: 'GCP Secret Manager',
    gcpBadge: 'Coming soon',
    gcpFeatures: [
      'Google Cloud Secret Manager integration',
      'Application Default Credentials (ADC)',
      'IAM-based access control',
      'Cloud Audit Logs',
    ],
    configPriorityTitle: 'Configuration priority',
    priorityHigh: 'CLI flags / GHA inputs',
    priorityMid: '$config in map file',
    priorityLow: 'Defaults (AWS)',
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
        label: '⚡',
        title: 'Exec mode (--exec)',
        description:
          'Inject secrets into child process without writing to disk',
      },
      {
        status: 'planned',
        label: '☁️',
        title: 'GCP Secret Manager',
        description: 'Third cloud provider. Completes the multi-cloud trident',
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

    prereqAws: 'AWS CLI configured',
    prereqAzure: 'Azure CLI configured',
    prereqIam: 'IAM permissions:',
    prereqAwsNote: 'for AWS SSM',
    prereqAzureNote: 'for Azure Key Vault',
    install: 'Install',
    quickStart: 'Quick start',
    step1: 'Create an envilder.json mapping env vars to secret paths',
    step2: 'Run envilder --map=envilder.json --envfile=.env',
    step3: 'Your .env file is ready ✔',
    terminalTitle: 'Quick start',
    commentInstall: '# Install globally',
    commentCreate: '# Create mapping file',
    commentPull: '# Pull secrets',
    commentPush: '# Push a secret',
    doneMessage: ' Done! .env file generated.',
    pushSuccess: ' Secret pushed successfully.',
    sdkTerminalTitle: 'Runtime SDK (Python)',
    sdkComment1: '# Install the SDK',
    sdkComment2: '# Load secrets at startup',
    sdkComment3: '# Secrets are now in os.environ',
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
    title: 'Envilder Changelog | Releases & Updates',

    backToHome: '← Back to home',
    fullChangelog: 'Full ',
    changelogAccent: 'Changelog',
    intro: 'Complete release history. See also',
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
    title: 'Envilder Docs | CLI, GitHub Action & AWS SSM',

    backToHome: '← Back to home',
    pageTitle: 'Documentation',
    intro: 'Everything you need to get started with Envilder.',
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
    overviewTitle: 'What is Envilder?',
    overviewDesc:
      'Envilder is a model-driven configuration resolution system. You define a JSON mapping between variable names and cloud secret paths, and Envilder resolves them consistently: via the CLI for local dev, the GitHub Action for CI/CD, or runtime SDKs for application startup. It works with AWS SSM Parameter Store and Azure Key Vault.',
    overviewProblem:
      'Without Envilder, teams fragment secret management across tools and stages. Local dev uses .env files, CI/CD reads from vault integrations, production has its own method. This leads to configuration drift, leaked credentials, and slow onboarding.',
    overviewSolution:
      'With Envilder, one mapping model is the single source of truth. Secrets are resolved from your cloud vault on demand: same contract, same behavior, whether you run the CLI locally, the GitHub Action in CI, or an SDK at app startup.',
    reqTitle: 'Requirements',
    reqNode: 'Node.js v22.12+',
    reqAws: 'AWS CLI',
    reqAzure: 'Azure CLI',
    reqAwsNote: 'for AWS SSM',
    reqAzureNote: 'for Azure Key Vault',
    reqDownload: 'Download',
    reqInstallGuide: 'Install guide',
    installTitle: 'Installation',
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
      'Create a parameter in SSM, then pull it with Envilder to confirm everything works:',
    awsSetupVerifySuccess: 'If you see ✔ Fetched, your AWS setup is complete.',
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
      'Create a secret in Key Vault, then pull it with Envilder to confirm everything works:',
    azureSetupVerifySuccess:
      'If you see ✔ Fetched, your Azure setup is complete.',
    azureSetupVerifySdk:
      'Or load secrets directly from your app with the Python SDK:',
    mapTitle: 'Mapping file',
    mapIntro:
      "The mapping file (envilder.json) is the core of Envilder. It's a JSON file that maps environment variable names (keys) to secret paths (values) in your cloud provider.",
    mapCalloutStructure: 'Structure:',
    mapCalloutKey: 'Each key becomes an env var name in your .env file.',
    mapCalloutValue:
      'Each value is the path where the secret lives in your cloud provider.',
    mapBasicTitle: 'Basic format (AWS SSM, default)',
    mapBasicDesc:
      'When no $config section is present, Envilder defaults to AWS SSM Parameter Store. Values must be valid SSM parameter paths (typically starting with /):',
    mapBasicGenerates: 'This generates:',
    mapConfigTitle: 'The $config section',
    mapConfigDesc:
      'Add a $config key to your mapping file to declare which cloud provider to use and its settings. Envilder reads $config for configuration, and treats all other keys as secret mappings.',
    mapConfigOptionsTitle: '$config options',
    mapThKey: 'Key',
    mapThType: 'Type',
    mapThDefault: 'Default',
    mapThDescription: 'Description',
    mapProviderDesc: 'Cloud provider to use',
    mapVaultUrlDesc: 'Azure Key Vault URL (required when provider is "azure")',
    mapProfileDesc: 'AWS CLI profile for multi-account setups (AWS only)',
    mapAwsProfileTitle: 'AWS SSM with profile',
    mapAwsProfileDesc:
      'To use a specific AWS CLI profile (useful for multi-account setups), add profile to $config:',
    mapAwsProfileExplain:
      'This tells Envilder to use the prod-account profile from your ~/.aws/credentials file instead of the default profile.',
    mapAzureTitle: 'Azure Key Vault',
    mapAzureDesc:
      'For Azure Key Vault, set provider to "azure" and provide the vaultUrl:',
    mapAzureWarningTitle: 'Azure naming convention:',
    mapAzureWarningDesc:
      'Key Vault secret names only allow alphanumeric characters and hyphens. Envilder automatically normalizes names: slashes and underscores become hyphens (e.g., /myapp/db/password → myapp-db-password).',
    mapDifferencesTitle: 'Key differences by provider',
    mapThEmpty: '',
    mapThAwsSsm: 'AWS SSM',
    mapThAzureKv: 'Azure Key Vault',
    mapSecretPathFormat: 'Secret path format',
    mapAwsPathFormat: 'Parameter paths with slashes',
    mapAzurePathFormat: 'Hyphenated names',
    mapRequiredConfig: 'Required $config',
    mapAwsRequiredConfig: 'None (AWS is the default)',
    mapAzureRequiredConfig: 'provider + vaultUrl',
    mapOptionalConfig: 'Optional $config',
    mapAuthentication: 'Authentication',
    mapAwsAuth: 'AWS CLI credentials',
    mapAzureAuth: 'Azure Default Credentials',
    mapMultiEnvTitle: 'Multiple environments',
    mapMultiEnvDesc:
      'A common pattern is having one mapping file per environment. The structure is the same, only the secret paths change:',
    mapMultiEnvThenPull: 'Then pull the right one:',
    mapOverrideTitle: 'Overriding $config with CLI flags',
    mapOverrideDesc:
      'CLI flags always take priority over $config values. This lets you set defaults in the file and override per invocation:',
    mapOverrideComment1: '# Uses $config from the map file as-is',
    mapOverrideComment2: '# Overrides provider and vault URL, ignoring $config',
    mapOverrideComment3: '# Overrides just the AWS profile',
    mapPriorityNote:
      'Priority order: CLI flags / GHA inputs → $config in map file → defaults (AWS).',
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
    pushTitle: 'Push command',
    pushDesc:
      'Upload environment variables from a local .env file to your cloud provider using a mapping file.',
    pushOptions: 'Options',
    pushExamples: 'Examples',
    pushOptPush: 'Enable push mode (required)',
    pushOptEnv: 'Path to your local .env file',
    pushOptMap: 'Path to parameter mapping JSON',
    pushOptProvider: 'aws (default) or azure',
    pushOptVault: 'Azure Key Vault URL',
    pushOptProfile: 'AWS CLI profile (AWS only)',
    pushCommentAws: '# Push to AWS SSM',
    pushCommentProfile: '# With AWS profile',
    pushCommentAzureConfig: '# Azure via $config in map file',
    pushCommentAzureFlags: '# Azure via CLI flags',
    pushSingleTitle: 'Push single variable',
    pushSingleDesc:
      'Push a single environment variable directly without any files.',
    pushSingleOptions: 'Options',
    pushSingleOptPush: 'Enable push mode (required)',
    pushSingleOptKey: 'Environment variable name',
    pushSingleOptValue: 'Value to store',
    pushSingleOptPath: 'Full secret path in your cloud provider',
    pushSingleOptProvider: 'aws (default) or azure',
    pushSingleOptVault: 'Azure Key Vault URL',
    pushSingleOptProfile: 'AWS CLI profile (AWS only)',
    ghaSetupTitle: 'GitHub Action setup',
    ghaSetupDesc:
      'The Envilder GitHub Action pulls secrets from AWS SSM or Azure Key Vault into .env files during your CI/CD workflow. No build step needed. The action is pre-built and ready to use from GitHub Marketplace.',
    ghaPrerequisites: 'Prerequisites',
    ghaPrereqAws:
      'AWS: Configure credentials with aws-actions/configure-aws-credentials',
    ghaPrereqAzure: 'Azure: Configure credentials with azure/login',
    ghaPrereqMap: 'An envilder.json committed to your repository',
    ghaPullOnly: 'The GitHub Action only supports pull mode (no push).',
    ghaBasicTitle: 'Basic workflow example',
    ghaMultiEnvTitle: 'Multi-environment workflow',
    ghaAzureTitle: 'Azure Key Vault workflow',
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
    configPriorityTitle: 'Configuration priority',
    configPriorityDesc:
      'When multiple configuration sources are present, Envilder resolves them in this order (highest wins):',
    configPriority1: 'CLI flags / GHA inputs',
    configPriority2: '$config in map file',
    configPriority3: 'Defaults (AWS)',
    configPriorityExplain:
      'This means --provider=azure on the CLI will override "provider": "aws" in $config.',
    // SDKs
    sidebarSdks: 'SDKs',
    sidebarSdkDotnet: '.NET SDK',
    sidebarSdkPython: 'Python SDK',
    sidebarSdkNodejs: 'Node.js SDK',
    sdkDotnetTitle: '.NET SDK',
    sdkDotnetDesc:
      'Load secrets directly into your .NET application at startup. One-liner facade, fluent builder, IConfiguration integration, or full programmatic control.',
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
    sdkDotnetQuickStartConfig: 'Via IConfiguration (ASP.NET)',
    sdkDotnetQuickStartConfigDesc:
      'Add Envilder as a configuration source in your ASP.NET application:',
    sdkDotnetQuickStartResolve: 'Advanced: full programmatic control',
    sdkDotnetQuickStartResolveDesc:
      'Parse the map file, resolve secrets, and inject them into environment variables:',
    sdkDotnetFullDocs: 'Full documentation →',
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
    pagerPrev: 'Previous',
    pagerNext: 'Next',
  },
};
