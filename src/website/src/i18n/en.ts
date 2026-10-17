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
    tabPushDesc: 'uploads .env to the vault',
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
    setupComment1: '# 1. Map each variable to an SSM path',
    setupComment2: '# 2. Push the .env values to SSM Parameter Store',
    setupAzureComment1: '# 1. Map each variable to a Key Vault secret',
    setupAzureComment2: '# 2. Push the .env values to Azure Key Vault',
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
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
    awsCreditsAlt: 'AWS Open Source Credits Program',
    awsCreditsLabel: 'AWS Open Source Credits',
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
          'envilder.json lists env var names and their secret paths, never the values. Commit it and review changes in pull requests like any other code.',
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
      'AWS credentials with ssm:GetParameter; add ssm:PutParameter for --push',
    prereqAzureNote:
      'Azure credentials with secret Get access; add Set access for --push',
    install: 'Install',
    quickStart: 'Quick start',
    step1: 'Create an envilder.json mapping env vars to secret paths',
    step2: 'Run npx envilder exec -- followed by your usual start command',
    step3: 'Your app starts with its secrets ✔',
    terminalTitle: 'Quick start',
    commentCreate: '# Create mapping file',
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
    installNext: 'Next, choose how the secrets reach your app:',
    installNextPull: 'CLI pull: generate a .env file',
    installNextExec:
      'CLI exec: run your command with the secrets in memory, no .env file',
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
    sdkDotnetExamplesDesc:
      'xUnit test projects with Testcontainers and Aspire resolve a map file against AWS SSM and Azure Key Vault (emulated with LocalStack and Lowkey Vault) and pass the values to containers, with no .env file:',
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
