import { releaseMetadata } from './releaseMetadata';
import type { Translations } from './types';

export const en: Translations = {
  homeMeta: {
    title:
      'Envilder — One model to resolve secrets across every environment and runtime.',
    description:
      'A model-driven configuration resolution system. Define secret mappings once and resolve them consistently — CLI, CI/CD, or application runtime. Powered by AWS SSM, Azure Key Vault, and GCP Secret Manager.',
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
    openSource: 'Open Source · MIT',
    title1: 'One model.',
    title2: 'Your secrets.',
    titleAccent: 'Every runtime.',
    description:
      'Define secret mappings once and resolve them consistently from',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descGcp: 'GCP Secret Manager',
    descOr: 'or',
    descComma: ',',
    descSuffix:
      '— locally with the CLI, in CI/CD with the GitHub Action, or at app startup with runtime SDKs.',
    getStarted: '▶ Get Started',
    viewOnGithub: '★ View on GitHub',
    terminalComment1: '# 1. One mapping model for every environment',
    terminalComment2: '# 2. Resolve secrets with the CLI',
    terminalFetched1: ' Fetched DB_PASSWORD → ···pass',
    terminalFetched2: ' Fetched API_KEY     → ···key',
    terminalWritten: ' Environment file written to .env',
  },
  trust: {
    label: 'WORKS WITH',
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
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
    arrowText: '▼ envilder fixes this ▼',
    solutions: [
      {
        icon: '🛡️',
        title: 'One model, one source of truth',
        description:
          'A single mapping file defines what secrets your app needs. Git-versioned. PR-reviewable. The same contract across every environment.',
      },
      {
        icon: '⚡',
        title: 'Consistent resolution everywhere',
        description:
          'CLI for local dev, GitHub Action for CI/CD, runtime SDKs for app startup. Same mapping, same behavior, same result.',
      },
      {
        icon: '🤖',
        title: 'Your cloud, no middleman',
        description:
          'AWS SSM, Azure Key Vault, or GCP. No SaaS proxy. Secrets stay in your infrastructure. Native IAM/RBAC access control.',
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
          'Skip the .env file entirely. Load secrets directly into your application at startup with native SDKs — Python, .NET, TypeScript, and more.',
      },
      {
        title: 'Push from dev to the vault',
        description:
          'Need to add or rotate a secret? Push values from your local environment back to the cloud provider. No console needed.',
      },
      {
        title: 'Secrets stay in your vault',
        description:
          'No intermediaries. Your cloud manages the storage, rotation, and access control. Envilder resolves — it never stores.',
      },
    ],
    terminalFetched1: '✔ Fetched DB_PASSWORD  → ···word',
    terminalFetched2: '✔ Fetched API_KEY      → ···key',
    terminalFetched3: '✔ Fetched SECRET_TOKEN → ···oken',
    terminalWritten: '✔ Environment file written to .env',
    sdkTabPython: 'Python',
    sdkTabDotnet: '.NET',
    sdkTabTypescript: 'TypeScript',
    pushTerminalPushed1: '✔ Pushed DB_PASSWORD  → /my-app/prod/db-password',
    pushTerminalPushed2: '✔ Pushed API_KEY      → /my-app/prod/api-key',
    pushTerminalPushed3: '✔ Pushed SECRET_TOKEN → /my-app/prod/secret-token',
  },
  features: {
    title: 'Built for ',
    titleAccent: 'real teams',
    subtitle:
      'A configuration resolution system designed for security, consistency, and multi-runtime execution.',
    features: [
      {
        icon: '📋',
        title: 'Single Mapping Model',
        description:
          'One JSON contract defines all secrets. Git-versioned, PR-reviewable, diff-able across environments. The model is the product.',
      },
      {
        icon: '🔌',
        title: 'Runtime SDKs',
        description:
          'Load secrets directly into memory at app startup — Python, .NET, TypeScript, Go, Java. No .env files written to disk. No secrets left behind.',
      },
      {
        icon: '☁️',
        title: 'Multi-Provider',
        description:
          'AWS SSM, Azure Key Vault, and GCP Secret Manager (coming soon). Your cloud, your rules. No vendor lock-in.',
      },
      {
        icon: '⚙️',
        title: 'GitHub Action',
        description:
          'Pull secrets in CI/CD workflows. Same mapping, zero manual intervention. Drop-in integration.',
      },
      {
        icon: '🔄',
        title: 'Bidirectional Sync',
        description:
          'Pull secrets to .env files or push .env values back to your cloud provider. Full round-trip support via CLI.',
      },
      {
        icon: '🔒',
        title: 'IAM & RBAC Access',
        description:
          'Native cloud access control. AWS IAM policies or Azure RBAC define who reads what. No extra auth layer.',
      },
      {
        icon: '📊',
        title: 'Fully Auditable',
        description:
          'Every read and write is logged in AWS CloudTrail or Azure Monitor. Complete trace of who accessed what and when.',
      },
      {
        icon: '🧱',
        title: 'Zero Infrastructure',
        description:
          'No servers, no proxies, no SaaS. Built on native cloud services you already use and pay for.',
      },
      {
        icon: '👤',
        title: 'AWS Profile Support',
        description:
          'Multi-account setups? Use --profile to switch between AWS CLI profiles. Perfect for multi-stage environments.',
      },
    ],
  },
  demo: {
    title: 'See it in ',
    titleAccent: 'action',
    subtitle:
      'Watch how Envilder simplifies secret management in under 2 minutes.',
    cliDemo: 'CLI Demo — Pull Secrets',
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
      'Load secrets directly into your application at startup. No .env files, no intermediaries — just your cloud vault and your code.',
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
  changelog: {
    title: "What's ",
    titleAccent: 'new',
    subtitle: 'Latest release highlights. Documentation website is live.',
    releaseTitle: 'Documentation & Stability',
    releaseDate: new Date(
      `${releaseMetadata.releaseDate}T00:00:00Z`,
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    highlights: [
      {
        icon: '✨',
        text: 'Documentation website launched at envilder.com — full guides, changelog, and multi-language docs',
      },
      {
        icon: '✨',
        text: 'Fixed: @types/node moved to devDependencies — no runtime bloat in installs',
      },
      {
        icon: '✨',
        text: 'Fixed: e2e test flakiness — unique SSM paths per test run prevent race conditions',
      },
    ],
    fullChangelog: '📋 Full Changelog',
    viewReleases: 'View all releases on GitHub →',
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
          'Native runtime library — load secrets directly into process.env from a map-file. Published to npm',
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
        description: 'Third cloud provider — completes the multi-cloud trident',
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
          'Validate cloud secrets vs local .env — fail CI if out-of-sync',
      },
    ],
  },
  getStarted: {
    title: 'Get ',
    titleAccent: 'started',
    subtitle: 'Up and running in under a minute.',
    prerequisites: 'Prerequisites',
    prereqNode: 'Node.js v20+',
    prereqAws: 'AWS CLI configured',
    prereqAzure: 'Azure CLI configured',
    prereqIam: 'IAM permissions:',
    prereqAwsNote: 'for AWS SSM',
    prereqAzureNote: 'for Azure Key Vault',
    install: 'Install',
    quickStart: 'Quick start',
    step1: 'Create a param-map.json mapping env vars to secret paths',
    step2: 'Run envilder --map=param-map.json --envfile=.env',
    step3: 'Your .env file is ready ✔',
    terminalTitle: 'Quick start',
    commentInstall: '# Install globally',
    commentCreate: '# Create mapping file',
    commentPull: '# Pull secrets',
    commentPush: '# Push a secret',
    doneMessage: ' Done! .env file generated.',
    pushSuccess: ' Secret pushed successfully.',
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
    sidebarCredentials: 'Cloud credentials',
    sidebarPermissions: 'IAM permissions',
    sidebarCli: 'CLI',
    sidebarMappingFile: 'Mapping file',
    sidebarPullCommand: 'Pull command',
    sidebarPushCommand: 'Push command',
    sidebarPushSingle: 'Push single',
    sidebarGha: 'GitHub Action',
    sidebarGhaSetup: 'Setup',
    sidebarGhaBasic: 'Basic example',
    sidebarGhaMultiEnv: 'Multi-environment',
    sidebarGhaAzure: 'Azure example',
    sidebarGhaInputs: 'Inputs & outputs',
    sidebarReference: 'Reference',
    sidebarConfigPriority: 'Config priority',
    sidebarAzureSetup: 'Azure setup',
    overviewTitle: 'What is Envilder?',
    overviewDesc:
      'Envilder is a model-driven configuration resolution system. You define a JSON mapping between variable names and cloud secret paths, and Envilder resolves them consistently — via the CLI for local dev, the GitHub Action for CI/CD, or runtime SDKs for application startup. It works with AWS SSM Parameter Store and Azure Key Vault.',
    overviewProblem:
      'Without Envilder, teams fragment secret management across tools and stages. Local dev uses .env files, CI/CD reads from vault integrations, production has its own method. This leads to configuration drift, leaked credentials, and slow onboarding.',
    overviewSolution:
      'With Envilder, one mapping model is the single source of truth. Secrets are resolved from your cloud vault on demand — same contract, same behavior, whether you run the CLI locally, the GitHub Action in CI, or an SDK at app startup.',
    reqTitle: 'Requirements',
    reqNode: 'Node.js v20+',
    reqAws: 'AWS CLI',
    reqAzure: 'Azure CLI',
    reqAwsNote: 'for AWS SSM',
    reqAzureNote: 'for Azure Key Vault',
    reqDownload: 'Download',
    reqInstallGuide: 'Install guide',
    installTitle: 'Installation',
    credTitle: 'Cloud credentials',
    credAwsTitle: 'AWS (default)',
    credAwsDesc:
      'Envilder uses your AWS CLI credentials. Set up the default profile:',
    credAwsProfile: 'Or use a named profile:',
    credAzureTitle: 'Azure Key Vault',
    credAzureDesc: 'Envilder uses Azure Default Credentials. Log in with:',
    credAzureVault:
      'Provide the vault URL via $config in your map file or the --vault-url flag.',
    permTitle: 'IAM permissions',
    permAwsTitle: 'AWS',
    permAwsDesc: 'Your IAM user or role needs:',
    permOperation: 'Operation',
    permPermission: 'Permission',
    permPull: 'Pull',
    permPush: 'Push',
    permPolicyExample: 'Example IAM policy:',
    permAzureTitle: 'Azure',
    permAzureRbac: 'Recommended — assign Key Vault Secrets Officer via RBAC:',
    permAzurePullNote:
      'For pull-only access, Key Vault Secrets User is sufficient.',
    mapTitle: 'Mapping file',
    mapIntro:
      "The mapping file (param-map.json) is the core of Envilder. It's a JSON file that maps environment variable names (keys) to secret paths (values) in your cloud provider.",
    mapCalloutStructure: 'Structure:',
    mapCalloutKey: 'Each key becomes an env var name in your .env file.',
    mapCalloutValue:
      'Each value is the path where the secret lives in your cloud provider.',
    mapBasicTitle: 'Basic format (AWS SSM — default)',
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
      'Key Vault secret names only allow alphanumeric characters and hyphens. Envilder automatically normalizes names — slashes and underscores become hyphens (e.g., /myapp/db/password → myapp-db-password).',
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
      'The Envilder GitHub Action pulls secrets from AWS SSM or Azure Key Vault into .env files during your CI/CD workflow. No build step needed — the action is pre-built and ready to use from GitHub Marketplace.',
    ghaPrerequisites: 'Prerequisites',
    ghaPrereqAws:
      'AWS: Configure credentials with aws-actions/configure-aws-credentials',
    ghaPrereqAzure: 'Azure: Configure credentials with azure/login',
    ghaPrereqMap: 'A param-map.json committed to your repository',
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
    azureSetupTitle: 'Azure Key Vault setup',
    azureSetupCheck: 'Check which access model your vault uses:',
    azureRbacTrue: 'true → Azure RBAC (recommended)',
    azureRbacFalse: 'false / null → Vault Access Policy (classic)',
    azureOptionA: 'Option A — Azure RBAC (recommended)',
    azureOptionB: 'Option B — Vault Access Policy',
    azureAccessNote:
      'For pull-only access, get list is enough. Add set for push.',
    // SDKs
    sidebarSdks: 'SDKs',
    sidebarSdkDotnet: '.NET SDK',
    sidebarSdkPython: 'Python SDK',
    sidebarSdkNodejs: 'Node.js SDK',
    sdkDotnetTitle: '.NET SDK',
    sdkDotnetDesc:
      'Load secrets directly into your .NET application at startup. One-liner facade, fluent builder, IConfiguration integration, or full programmatic control.',
    sdkDotnetInstall: 'Install',
    sdkDotnetOneLiner: 'One-liner — resolve + inject',
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
    sdkDotnetQuickStartResolve: 'Advanced — full programmatic control',
    sdkDotnetQuickStartResolveDesc:
      'Parse the map file, resolve secrets, and inject them into environment variables:',
    sdkDotnetFullDocs: 'Full documentation →',
    sdkPythonTitle: 'Python SDK',
    sdkPythonDesc:
      'Load secrets directly into your Python application at startup. One-liner setup or fine-grained control with the fluent builder.',
    sdkPythonInstall: 'Install',
    sdkPythonQuickStart: 'Quick start — one-liner',
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
    sdkNodejsQuickStart: 'Quick start — one-liner',
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
