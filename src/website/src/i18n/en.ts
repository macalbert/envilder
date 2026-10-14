import type { Translations } from './types';

export const en: Translations = {
  homeMeta: {
    title:
      'Load AWS SSM and Azure Key Vault secrets into .env, CI and runtime | Envilder',
    description:
      'Open-source CLI, GitHub Action and SDKs that resolve secrets from AWS SSM Parameter Store or Azure Key Vault using one versioned JSON mapping.',
    ogImageAlt:
      'Envilder - open-source secret resolution for AWS SSM and Azure Key Vault',
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
    ariaTheme: 'Theme',
  },
  hero: {
    title1: 'Standardize how',
    title2: 'your apps consume',
    titleAccent: 'secrets.',
    description:
      'Stop reinventing secret loading in every project. Define one environment contract and resolve it everywhere.',
    positioning:
      'Open-source secret resolution for AWS SSM and Azure Key Vault, across local development, CI/CD and application runtime.',
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
        icon: 'skull',
        title: 'Fragmented across tools',
        description:
          'Local dev uses .env files. CI/CD reads from vault integrations. Production has its own method. Same app, different configuration workflows everywhere.',
      },
      {
        icon: 'lock',
        title: 'Secrets shared through unsafe channels',
        description:
          'API keys sent over Slack, .env files committed to repos, wiki pages with plain-text credentials. A security incident waiting to happen.',
      },
      {
        icon: 'snail',
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
        icon: 'brick',
        title: 'Zero Infrastructure',
        description:
          'No servers, no proxies, no SaaS middleman. Built on AWS SSM and Azure Key Vault, services you already use and pay for.',
      },
      {
        icon: 'clipboard',
        title: 'One File, All Secrets',
        description:
          'A single JSON contract defines every secret for every environment. Git-versioned, PR-reviewable, diff-able. Your team reviews secret changes in the same PR as the code.',
      },
      {
        icon: 'refresh',
        title: 'Safe Secret Rotation',
        description:
          'Rotate values in AWS SSM or Azure Key Vault without changing envilder.json. Existing generated .env files update only when you rerun Envilder; runtime consumers must restart or resolve again.',
      },
      {
        icon: 'cloud',
        title: 'Your Secret Store, One Map Contract',
        description:
          'Keep secrets in the AWS SSM or Azure Key Vault setup you already use. Envilder preserves the envilder.json mapping contract across tools; provider credentials and secret migration stay provider-specific.',
      },
    ],
    extrasTitle: 'Also included',
    extras: [
      {
        icon: 'gear',
        title: 'GitHub Action',
        description:
          'Pull secrets in CI/CD workflows. Same mapping, zero manual intervention.',
      },
      {
        icon: 'refresh',
        title: 'Bidirectional Sync',
        description:
          'Pull to .env or push .env values back to your cloud provider via CLI.',
      },
      {
        icon: 'plug',
        title: 'Secrets Never Touch Disk',
        description:
          'Runtime SDKs load secrets directly into memory at app startup. No .env files written to disk.',
      },
      {
        icon: 'lock',
        title: 'Native IAM & RBAC',
        description:
          'AWS IAM policies or Azure RBAC. No extra auth layer needed.',
      },
      {
        icon: 'chart',
        title: 'Provider-Native Access Logs',
        description:
          'CloudTrail or Azure Monitor can record provider access when configured. Envilder does not create an audit trail itself.',
      },
      {
        icon: 'person',
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
    transcript:
      'Demo command: envilder --map=envilder.json --envfile=.env. Envilder resolves mapped secrets from your configured cloud provider and writes the resulting variables to .env.',
    ghaWorkflow: 'GitHub Action Workflow',
    comingSoon: 'Coming soon',
  },
  providers: {
    title: 'Your cloud. ',
    titleAccent: 'Your choice.',
    subtitle:
      'Envilder works today with AWS SSM Parameter Store and Azure Key Vault. GCP Secret Manager is planned and not available yet. Configure shipped providers in envilder.json or with CLI flags.',
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
    gcpTitle: 'GCP Secret Manager',
    gcpBadge: 'Planned',
    gcpFeatures: [
      'Planned GCP Secret Manager integration',
      'Not available in the CLI, GitHub Action, or runtime SDKs',
    ],
    gcpRoadmapLink: 'View roadmap',
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
          'Planned mode; not available yet. It would inject secrets into a child process without writing to disk',
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
      'AWS credentials with ssm:GetParameter; add ssm:PutParameter for --push',
    prereqAzureNote:
      'Azure credentials with secret Get access; add Set access for --push',
    install: 'Install',
    quickStart: 'Quick start',
    step1: 'Create an envilder.json mapping env vars to secret paths',
    step2: 'Run npx envilder',
    step3: 'Your .env file is ready ✔',
    terminalTitle: 'Quick start',
    commentCreate: '# Create mapping file',
    commentPull: '# Pull secrets',
    commentPush: '# Push a secret',
    doneMessage: 'Done! .env file generated.',
    sdkComment3: '# Secrets are now in os.environ',
    sdkExampleLink: 'View more examples on GitHub',
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
          'Get started with Envilder: install and prerequisites for AWS SSM and Azure Key Vault',
        description:
          'Install the Envilder CLI, check the prerequisites for AWS SSM or Azure Key Vault, and learn how the JSON map links variables to secret paths.',
        heading: 'Get started',
        intro:
          'Install Envilder, configure a provider, and resolve secrets from a versioned map file.',
        breadcrumb: 'Get started',
        navLabel: 'Get started',
        cardTitle: 'Get started with Envilder',
        cardSummary:
          'Install the CLI, review prerequisites, and understand the mapping model.',
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
          'Full reference for the Envilder mapping file: $config, providers, profiles, vault URL, multi-environment layouts and config precedence.',
        heading: 'Map file',
        intro:
          'Define environment variable mappings and provider settings in envilder.json.',
        breadcrumb: 'Map file',
        navLabel: 'Map file',
        cardTitle: 'Map file reference',
        cardSummary:
          'Map variables to secret paths and configure the selected provider.',
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
          'Envilder .NET SDK: resolve secrets from AWS Parameter Store or Azure Key Vault at startup into IConfiguration, environment variables or a dictionary.',
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
      'Push a single environment variable directly to your cloud provider without using a .env file.',
    pushSingleOptions: 'Options',
    pushSingleOptPush:
      'Optional: --key, --value and --secret-path already activate push mode',
    pushSingleOptKey: 'Environment variable name',
    pushSingleOptValue: 'Value to store',
    pushSingleOptPath: 'Full secret path in your cloud provider',
    pushSingleOptMap:
      'Optional: map file to read $config from (default: envilder.json if present; never required for a single push)',
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
      "With $config in the map file, the workflow doesn't need the provider or vault-url inputs. Key Vault names only allow letters, digits and hyphens, so Envilder converts paths: /myapp/prod/stripe_key is read as myapp-prod-stripe-key (leading slash removed, slashes and underscores turned into hyphens, lowercased).",
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
