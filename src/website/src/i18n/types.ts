export interface NavLinks {
  features: string;
  howItWorks: string;
  providers: string;
  githubAction: string;
  sdks: string;
  changelog: string;
  docs: string;
  docsGettingStarted: string;
  docsCli: string;
  docsGha: string;
  docsSdks: string;
  docsReference: string;
  getStarted: string;
  ariaGithub: string;
  ariaSponsor: string;
  ariaToggleMenu: string;
}

export interface ThemeTranslations {
  retro: string;
  light: string;
  ariaTheme: string;
}

export interface HeroTranslations {
  openSource: string;
  title1: string;
  title2: string;
  titleAccent: string;
  description: string;
  descAws: string;
  descAzure: string;
  descGcp: string;
  descOr: string;
  descComma: string;
  descSuffix: string;
  getStarted: string;
  viewOnGithub: string;
  terminalComment1: string;
  terminalComment2: string;
  terminalFetched1: string;
  terminalFetched2: string;
  terminalWritten: string;
}

export interface TrustTranslations {
  label: string;
}

export interface ProblemItem {
  icon: string;
  title: string;
  description: string;
}

export interface ProblemSolutionTranslations {
  title: string;
  titleAccent: string;
  titleSuffix: string;
  subtitle: string;
  problems: ProblemItem[];
  arrowText: string;
  solutions: ProblemItem[];
}

export interface StepItem {
  title: string;
  description: string;
}

export interface HowItWorksTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  stepLabel: string;
  steps: StepItem[];
  terminalFetched1: string;
  terminalFetched2: string;
  terminalFetched3: string;
  terminalWritten: string;
  sdkTabPython: string;
  sdkTabDotnet: string;
  sdkTabTypescript: string;
  pushTerminalPushed1: string;
  pushTerminalPushed2: string;
  pushTerminalPushed3: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export interface FeaturesTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  features: FeatureItem[];
}

export interface DemoTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  cliDemo: string;
  ghaWorkflow: string;
  comingSoon: string;
}

export interface ProvidersTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  awsTitle: string;
  awsDefault: string;
  awsFeatures: string[];
  azureTitle: string;
  azureBadge: string;
  azureFeatures: string[];
  gcpTitle: string;
  gcpBadge: string;
  gcpFeatures: string[];
  configPriorityTitle: string;
  priorityHigh: string;
  priorityMid: string;
  priorityLow: string;
}

export interface GhaTranslations {
  title: string;
  subtitle: string;
  awsSsm: string;
  azureKeyVault: string;
  actionInputs: string;
  thInput: string;
  thRequired: string;
  thDefault: string;
  thDescription: string;
  inputMapDesc: string;
  inputEnvDesc: string;
  inputProviderDesc: string;
  inputVaultDesc: string;
  output: string;
  outputDesc: string;
  yes: string;
  no: string;
}

export interface SdksTranslations {
  title: string;
  subtitle: string;
  pythonTitle: string;
  pythonDesc: string;
  dotnetTitle: string;
  dotnetDesc: string;
  typescriptTitle: string;
  typescriptDesc: string;
  goTitle: string;
  goDesc: string;
  javaTitle: string;
  javaDesc: string;
  install: string;
  quickStart: string;
  available: string;
  planned: string;
  comingSoon: string;
  docsLink: string;
  packageLink: string;
}

export interface ChangelogHighlight {
  icon: string;
  text: string;
}

export interface ChangelogTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  releaseTitle: string;
  releaseDate: string;
  highlights: ChangelogHighlight[];
  fullChangelog: string;
  viewReleases: string;
}

export interface RoadmapItem {
  status: string;
  label: string;
  title: string;
  description: string;
}

export interface RoadmapTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  upNext: string;
  items: RoadmapItem[];
}

export interface GetStartedTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  prerequisites: string;
  prereqNode: string;
  prereqAws: string;
  prereqAzure: string;
  prereqIam: string;
  prereqAwsNote: string;
  prereqAzureNote: string;
  install: string;
  quickStart: string;
  step1: string;
  step2: string;
  step3: string;
  terminalTitle: string;
  commentInstall: string;
  commentCreate: string;
  commentPull: string;
  commentPush: string;
  doneMessage: string;
  pushSuccess: string;
}

export interface FooterTranslations {
  tagline: string;
  project: string;
  documentation: string;
  community: string;
  linkGithub: string;
  linkNpm: string;
  linkChangelog: string;
  linkRoadmap: string;
  linkGettingStarted: string;
  linkPullCommand: string;
  linkPushCommand: string;
  linkGithubAction: string;
  linkIssues: string;
  linkDiscussions: string;
  linkSecurity: string;
  linkSponsor: string;
  license: string;
  copyright: string;
  builtWith: string;
}

export interface ChangelogPageTranslations {
  title: string;
  backToHome: string;
  fullChangelog: string;
  changelogAccent: string;
  intro: string;
  githubReleases: string;
  versions: string;
  backToTop: string;
  categoryCli: string;
  categoryGha: string;
  categorySdks: string;
  categorySdkDotnet: string;
  categorySdkPython: string;
}

export interface DocsTranslations {
  title: string;
  backToHome: string;
  pageTitle: string;
  intro: string;
  // Sidebar
  sidebarGettingStarted: string;
  sidebarRequirements: string;
  sidebarInstallation: string;
  sidebarCredentials: string;
  sidebarPermissions: string;
  sidebarCli: string;
  sidebarMappingFile: string;
  sidebarPullCommand: string;
  sidebarPushCommand: string;
  sidebarPushSingle: string;
  sidebarGha: string;
  sidebarGhaSetup: string;
  sidebarGhaBasic: string;
  sidebarGhaMultiEnv: string;
  sidebarGhaAzure: string;
  sidebarGhaInputs: string;
  sidebarReference: string;
  sidebarConfigPriority: string;
  sidebarAzureSetup: string;
  // Overview
  overviewTitle: string;
  overviewDesc: string;
  overviewProblem: string;
  overviewSolution: string;
  // Requirements
  reqTitle: string;
  reqNode: string;
  reqAws: string;
  reqAzure: string;
  reqAwsNote: string;
  reqAzureNote: string;
  reqDownload: string;
  reqInstallGuide: string;
  // Installation
  installTitle: string;
  // Credentials
  credTitle: string;
  credAwsTitle: string;
  credAwsDesc: string;
  credAwsProfile: string;
  credAzureTitle: string;
  credAzureDesc: string;
  credAzureVault: string;
  // Permissions
  permTitle: string;
  permAwsTitle: string;
  permAwsDesc: string;
  permOperation: string;
  permPermission: string;
  permPull: string;
  permPush: string;
  permPolicyExample: string;
  permAzureTitle: string;
  permAzureRbac: string;
  permAzurePullNote: string;
  // Mapping file
  mapTitle: string;
  mapIntro: string;
  mapCalloutStructure: string;
  mapCalloutKey: string;
  mapCalloutValue: string;
  mapBasicTitle: string;
  mapBasicDesc: string;
  mapBasicGenerates: string;
  mapConfigTitle: string;
  mapConfigDesc: string;
  mapConfigOptionsTitle: string;
  mapThKey: string;
  mapThType: string;
  mapThDefault: string;
  mapThDescription: string;
  mapProviderDesc: string;
  mapVaultUrlDesc: string;
  mapProfileDesc: string;
  mapAwsProfileTitle: string;
  mapAwsProfileDesc: string;
  mapAwsProfileExplain: string;
  mapAzureTitle: string;
  mapAzureDesc: string;
  mapAzureWarningTitle: string;
  mapAzureWarningDesc: string;
  mapDifferencesTitle: string;
  mapThEmpty: string;
  mapThAwsSsm: string;
  mapThAzureKv: string;
  mapSecretPathFormat: string;
  mapAwsPathFormat: string;
  mapAzurePathFormat: string;
  mapRequiredConfig: string;
  mapAwsRequiredConfig: string;
  mapAzureRequiredConfig: string;
  mapOptionalConfig: string;
  mapAuthentication: string;
  mapAwsAuth: string;
  mapAzureAuth: string;
  mapMultiEnvTitle: string;
  mapMultiEnvDesc: string;
  mapMultiEnvThenPull: string;
  mapOverrideTitle: string;
  mapOverrideDesc: string;
  mapOverrideComment1: string;
  mapOverrideComment2: string;
  mapOverrideComment3: string;
  mapPriorityNote: string;
  // Pull command
  pullTitle: string;
  pullDesc: string;
  pullOptions: string;
  pullExamples: string;
  pullOutput: string;
  optionHeader: string;
  pullOptMap: string;
  pullOptEnv: string;
  pullOptProvider: string;
  pullOptVault: string;
  pullOptProfile: string;
  pullCommentDefault: string;
  pullCommentProfile: string;
  pullCommentAzureConfig: string;
  pullCommentAzureFlags: string;
  pullOutputTitle: string;
  // Push command
  pushTitle: string;
  pushDesc: string;
  pushOptions: string;
  pushExamples: string;
  pushOptPush: string;
  pushOptEnv: string;
  pushOptMap: string;
  pushOptProvider: string;
  pushOptVault: string;
  pushOptProfile: string;
  pushCommentAws: string;
  pushCommentProfile: string;
  pushCommentAzureConfig: string;
  pushCommentAzureFlags: string;
  // Push single
  pushSingleTitle: string;
  pushSingleDesc: string;
  pushSingleOptions: string;
  pushSingleOptPush: string;
  pushSingleOptKey: string;
  pushSingleOptValue: string;
  pushSingleOptPath: string;
  pushSingleOptProvider: string;
  pushSingleOptVault: string;
  pushSingleOptProfile: string;
  // GHA
  ghaSetupTitle: string;
  ghaSetupDesc: string;
  ghaPrerequisites: string;
  ghaPrereqAws: string;
  ghaPrereqAzure: string;
  ghaPrereqMap: string;
  ghaPullOnly: string;
  ghaBasicTitle: string;
  ghaMultiEnvTitle: string;
  ghaAzureTitle: string;
  ghaInputsTitle: string;
  ghaInputsSubtitle: string;
  ghaOutputsSubtitle: string;
  ghaInputRequired: string;
  ghaInputDefault: string;
  ghaInputDesc: string;
  ghaThInput: string;
  ghaThRequired: string;
  ghaThOutput: string;
  ghaYes: string;
  ghaNo: string;
  ghaInputMap: string;
  ghaInputEnv: string;
  ghaInputProvider: string;
  ghaInputVault: string;
  ghaOutputEnvPath: string;
  // Reference
  configPriorityTitle: string;
  configPriorityDesc: string;
  configPriority1: string;
  configPriority2: string;
  configPriority3: string;
  configPriorityExplain: string;
  azureSetupTitle: string;
  azureSetupCheck: string;
  azureRbacTrue: string;
  azureRbacFalse: string;
  azureOptionA: string;
  azureOptionB: string;
  azureAccessNote: string;
  // SDKs
  sidebarSdks: string;
  sidebarSdkDotnet: string;
  sidebarSdkPython: string;
  sdkDotnetTitle: string;
  sdkDotnetDesc: string;
  sdkDotnetInstall: string;
  sdkDotnetOneLiner: string;
  sdkDotnetOneLinerDesc: string;
  sdkDotnetResolve: string;
  sdkDotnetResolveDesc: string;
  sdkDotnetFluent: string;
  sdkDotnetFluentDesc: string;
  sdkDotnetEnvLoading: string;
  sdkDotnetEnvLoadingDesc: string;
  sdkDotnetValidation: string;
  sdkDotnetValidationDesc: string;
  sdkDotnetQuickStartConfig: string;
  sdkDotnetQuickStartConfigDesc: string;
  sdkDotnetQuickStartResolve: string;
  sdkDotnetQuickStartResolveDesc: string;
  sdkDotnetFullDocs: string;
  sdkPythonTitle: string;
  sdkPythonDesc: string;
  sdkPythonInstall: string;
  sdkPythonQuickStart: string;
  sdkPythonQuickStartDesc: string;
  sdkPythonEnvLoading: string;
  sdkPythonEnvLoadingDesc: string;
  sdkPythonResolve: string;
  sdkPythonResolveDesc: string;
  sdkPythonFluent: string;
  sdkPythonFluentDesc: string;
  sdkPythonValidation: string;
  sdkPythonValidationDesc: string;
  sdkPythonFullDocs: string;
  // Pager
  pagerPrev: string;
  pagerNext: string;
}

export interface HomeMetaTranslations {
  title: string;
  description: string;
}

export interface SponsorsTranslations {
  title: string;
  localstackAlt: string;
}

export interface Translations {
  homeMeta: HomeMetaTranslations;
  nav: NavLinks;
  theme: ThemeTranslations;
  hero: HeroTranslations;
  trust: TrustTranslations;
  sponsors: SponsorsTranslations;
  problemSolution: ProblemSolutionTranslations;
  howItWorks: HowItWorksTranslations;
  features: FeaturesTranslations;
  demo: DemoTranslations;
  providers: ProvidersTranslations;
  gha: GhaTranslations;
  sdks: SdksTranslations;
  changelog: ChangelogTranslations;
  roadmap: RoadmapTranslations;
  getStarted: GetStartedTranslations;
  footer: FooterTranslations;
  changelogPage: ChangelogPageTranslations;
  docs: DocsTranslations;
}
