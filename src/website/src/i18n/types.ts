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
  cream: string;
  ariaTheme: string;
}

export interface HeroTranslations {
  title1: string;
  title2: string;
  titleAccent: string;
  description: string;
  positioning: string;
  descAws: string;
  descAzure: string;
  descOr: string;
  descSuffix: string;
  getStarted: string;
  viewOnGithub: string;
  tabGroupCli: string;
  tabGroupSdk: string;
  tabPull: string;
  tabPullDesc: string;
  tabExec: string;
  tabExecDesc: string;
  tabPush: string;
  tabPushDesc: string;
  tabNode: string;
  tabNodeDesc: string;
  tabPython: string;
  tabPythonDesc: string;
  tabDotnet: string;
  tabDotnetDesc: string;
  terminalComment1: string;
  terminalComment2: string;
  execComment1: string;
  execComment2: string;
  setupComment1: string;
  setupComment2: string;
  setupAzureComment1: string;
  sdkCommentLoad: string;
  terminalSceneLabel: string;
  terminalPause: string;
  terminalPlay: string;
  execMapComment: string;
}

export interface TrustTranslations {
  label: string;
}

export interface ProofTranslations {
  ariaLabel: string;
  stars: string;
  npmMonthly: string;
  pypiMonthly: string;
  nugetTotal: string;
  openssfBadge: string;
  openssfLevel: string;
  openssfLabel: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqTranslations {
  title: string;
  titleAccent: string;
  items: FaqItem[];
}

export type PixelSpriteName =
  | 'skull'
  | 'lock'
  | 'snail'
  | 'brick'
  | 'clipboard'
  | 'refresh'
  | 'cloud'
  | 'gear'
  | 'plug'
  | 'chart'
  | 'person';

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
  sdkTabPython: string;
  sdkTabDotnet: string;
  sdkTabNodejs: string;
}

export interface FeatureItem {
  icon: PixelSpriteName;
  title: string;
  description: string;
  badge?: string;
}

export interface FeaturesTranslations {
  title: string;
  titleAccent: string;
  subtitle: string;
  highlights: FeatureItem[];
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
  configPriorityTitle: string;
  priorityHigh: string;
  priorityMid: string;
  priorityLow: string;
  roadmapNote: string;
  roadmapLink: string;
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
  nodejsTitle: string;
  nodejsDesc: string;
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
  prereqProviderChoice: string;
  prereqAwsNote: string;
  prereqAzureNote: string;
  install: string;
  quickStart: string;
  step1: string;
  step2: string;
  step3: string;
  terminalTitle: string;
  commentCreate: string;
  commentExec: string;
  commentPull: string;
  doneMessage: string;
  sdkComment3: string;
  sdkExampleLink: string;
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
  linkExecCommand: string;
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
  description: string;
  backToHome: string;
  fullChangelog: string;
  changelogAccent: string;
  intro: string;
  releaseNotesLanguage: string;
  githubReleases: string;
  versions: string;
  backToTop: string;
  categoryCli: string;
  categoryGha: string;
  categorySdks: string;
  categorySdkDotnet: string;
  categorySdkPython: string;
  categorySdkNodejs: string;
}

export interface DocsPageTranslations {
  title: string;
  description: string;
  heading: string;
  intro: string;
  breadcrumb: string;
  navLabel: string;
  cardTitle: string;
  cardSummary: string;
}

export interface GettingStartedGuideTranslations {
  tabAws: string;
  tabAzure: string;
  overviewTitle: string;
  overviewSteps: string[];
  prereqTitle: string;
  prereqNode: string;
  prereqAws: string;
  prereqAwsLink: string;
  prereqAzure: string;
  prereqAzureLink: string;
  prereqWrite: string;
  installTitle: string;
  installDesc: string;
  installVerify: string;
  secretTitle: string;
  secretDesc: string;
  secretAwsNote: string;
  secretAzureNote: string;
  mapTitle: string;
  mapDesc: string;
  mapNote: string;
  runTitle: string;
  runDesc: string;
  runOutput: string;
  runExplain: string;
  runScriptDesc: string;
  pullTitle: string;
  pullDesc: string;
  pullOutput: string;
  pullWarn: string;
  errorsTitle: string;
  errorsIntro: string;
  errNoMapTitle: string;
  errNoMapFix: string;
  errCredsTitle: string;
  errCredsFix: string;
  errDeniedTitle: string;
  errDeniedFix: string;
  errNotFoundTitle: string;
  errNotFoundFix: string;
  errVaultTitle: string;
  errVaultFix: string;
  errOrderTitle: string;
  errOrderFix: string;
  errEnvfileTitle: string;
  errEnvfileFix: string;
  nextTitle: string;
  nextMap: string;
  nextExec: string;
  nextPull: string;
}

export interface MapFileReferenceTranslations {
  prereqTitle: string;
  prereqDesc: string;
  structureTitle: string;
  structureDesc: string;
  thKey: string;
  thMeaning: string;
  keySchema: string;
  keyConfig: string;
  keyOtherDollar: string;
  keyVariable: string;
  configTitle: string;
  configDesc: string;
  thField: string;
  thValues: string;
  thDefault: string;
  thBehaviour: string;
  fieldProvider: string;
  valueProfileName: string;
  defaultProfile: string;
  fieldProfile: string;
  fieldVaultUrl: string;
  configSdkNote: string;
  providersTitle: string;
  awsTitle: string;
  awsDesc: string;
  azureTitle: string;
  azureDesc: string;
  azureRules: string[];
  priorityTitle: string;
  priorityDesc: string;
  priority1: string;
  priority2: string;
  priority3: string;
  priorityExplain: string;
  priorityGhaNote: string;
  validationTitle: string;
  validationDesc: string;
  validationRules: string[];
  multiEnvTitle: string;
  multiEnvDesc: string;
  multiEnvRun: string;
  multiEnvGha: string;
  multiEnvNaming: string;
  errorsTitle: string;
  thMessage: string;
  thFix: string;
  errInvalidNameFix: string;
  errInvalidJsonFix: string;
  errProviderFix: string;
  errVaultMissingFix: string;
  errVaultHttpsFix: string;
  errVaultHostFix: string;
  errProfileAzureFix: string;
  errCaseFix: string;
  relatedTitle: string;
  relatedStart: string;
  relatedExec: string;
  relatedAzure: string;
}

export interface DocsTranslations {
  gettingStartedGuide: GettingStartedGuideTranslations;
  mapFileReference: MapFileReferenceTranslations;
  title: string;
  description: string;
  backToHome: string;
  pageTitle: string;
  intro: string;
  pages: Record<
    | 'hub'
    | 'getting-started'
    | 'aws-ssm'
    | 'azure-key-vault'
    | 'map-file'
    | 'cli-pull'
    | 'cli-push'
    | 'cli-exec'
    | 'github-action'
    | 'sdk-dotnet'
    | 'sdk-python'
    | 'sdk-nodejs',
    DocsPageTranslations
  >;
  breadcrumbLabel: string;
  breadcrumbHome: string;
  breadcrumbDocs: string;
  navigationLabel: string;
  mobileNavigation: string;
  navGettingStarted: string;
  navProviders: string;
  hubCardsLabel: string;
  openPage: string;
  pagerLabel: string;
  // Sidebar
  sidebarGettingStarted: string;
  sidebarRequirements: string;
  sidebarInstallation: string;
  sidebarAwsSetup: string;
  sidebarAzureSetup: string;
  sidebarCli: string;
  sidebarMappingFile: string;
  sidebarPullCommand: string;
  sidebarPushCommand: string;
  sidebarPushSingle: string;
  sidebarConfigPriority: string;
  sidebarGha: string;
  sidebarGhaSetup: string;
  sidebarGhaBasic: string;
  sidebarGhaMultiEnv: string;
  sidebarGhaAzure: string;
  sidebarGhaInputs: string;
  // Overview
  // Requirements
  // Installation
  // AWS setup
  awsSetupTitle: string;
  awsSetupIntro: string;
  awsSetupCredTitle: string;
  awsSetupCredDesc: string;
  awsSetupCredProfile: string;
  awsSetupPermTitle: string;
  awsSetupPermDesc: string;
  awsSetupPermOperation: string;
  awsSetupPermPermission: string;
  awsSetupPermPull: string;
  awsSetupPermPush: string;
  awsSetupPolicyExample: string;
  awsSetupVerifyTitle: string;
  awsSetupVerifyDesc: string;
  awsSetupVerifySuccess: string;
  awsSetupVerifySdk: string;
  // Azure setup
  azureSetupTitle: string;
  azureSetupIntro: string;
  azureSetupCredTitle: string;
  azureSetupCredDesc: string;
  azureSetupCredVault: string;
  azureSetupAccessTitle: string;
  azureSetupCheck: string;
  azureRbacTrue: string;
  azureRbacFalse: string;
  azureOptionA: string;
  azureOptionB: string;
  azureSetupPermTitle: string;
  azureSetupPermOperation: string;
  azureSetupPermPermission: string;
  azureSetupPermPull: string;
  azureSetupPermPush: string;
  azureSetupPullNote: string;
  azureSetupVerifyTitle: string;
  azureSetupVerifyDesc: string;
  azureSetupVerifySuccess: string;
  azureSetupVerifySdk: string;
  // Mapping file
  mapThDefault: string;
  mapThDescription: string;
  mapContentsTitle: string;
  mapContentsIntro: string;
  mapThStage: string;
  mapThLimit: string;
  mapContentsProvider: string;
  mapContentsProviderLimit: string;
  mapContentsEnvFile: string;
  mapContentsEnvFileLimit: string;
  mapContentsProcess: string;
  mapContentsProcessLimit: string;
  mapContentsResolveOnly: string;
  mapContentsWriterDesc: string;
  mapContentsRoundTrip: string;
  mapContentsUnrepresentableTitle: string;
  mapContentsUnrepresentableDesc: string;
  mapContentsExpansionTitle: string;
  mapContentsExpansionDesc: string;
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
  pullExecTitle: string;
  pullExecDesc: string;
  pullExecGuideLink: string;
  // Exec command
  execTitle: string;
  execDesc: string;
  execUsageTitle: string;
  execSeparatorTitle: string;
  execSeparatorDesc: string;
  execSepComment1: string;
  execSepComment2: string;
  execSepComment3: string;
  execSepComment4: string;
  execOptions: string;
  execOptMap: string;
  execOptProfile: string;
  execOptProvider: string;
  execOptVault: string;
  execOptionsOrderDesc: string;
  execRejectedDesc: string;
  execExamples: string;
  execCommentNpx: string;
  execCommentMap: string;
  execCommentAzure: string;
  execCommentDocker: string;
  execPackageJsonDesc: string;
  execOutputTitle: string;
  execOutputDesc: string;
  execUseCasesTitle: string;
  execUseCasesDesc: string;
  execUcLocalstackTitle: string;
  execUcLocalstackDesc: string;
  execUcLocalstackComposeDesc: string;
  execUcLocalstackDockerDesc: string;
  execUcLocalstackExamplesDesc: string;
  execUcTestsTitle: string;
  execUcTestsDesc: string;
  execUcTestsNote: string;
  execUcMigrationsTitle: string;
  execUcMigrationsDesc: string;
  execUcTerraformTitle: string;
  execUcTerraformDesc: string;
  execUcTerraformNote: string;
  execUcDevTitle: string;
  execUcDevDesc: string;
  execUcDevNote: string;
  execUcGhaTitle: string;
  execUcGhaDesc: string;
  execUcGhaNote: string;
  execUcChainTitle: string;
  execUcChainDesc: string;
  execUcChainNote: string;
  execBehaviorTitle: string;
  execExitTitle: string;
  execExitDesc: string;
  execThCode: string;
  execThMeaning: string;
  execThMessage: string;
  execExitChild: string;
  execExitSignal: string;
  execExit125: string;
  execExit126: string;
  execExit127: string;
  execExitNote: string;
  execFailClosedTitle: string;
  execFailClosedDesc: string;
  execEnvTitle: string;
  execEnvDesc: string;
  execNoShellDesc: string;
  execGhaTitle: string;
  execGhaDesc: string;
  execGhaNote: string;
  execSignalsTitle: string;
  execSignalsDesc: string;
  execSandboxTitle: string;
  execSandboxDesc: string;
  execGuideLink: string;
  examplesTitle: string;
  execExamplesDesc: string;
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
  pushSingleOptMap: string;
  pushSingleOptNoMapUpdate: string;
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
  ghaExecTitle: string;
  ghaExecDesc: string;
  ghaExecNote: string;
  ghaExecLink: string;
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
  ghaPrereqCheckout: string;
  ghaPrereqPermissions: string;
  ghaAwsTrustTitle: string;
  ghaAwsTrustDesc: string;
  ghaOidcSubjectNote: string;
  ghaAwsPolicyTitle: string;
  ghaAwsPolicyDesc: string;
  ghaAwsKmsNote: string;
  ghaWorkflowTitle: string;
  ghaAwsMapDesc: string;
  ghaOutputTitle: string;
  ghaOutputDesc: string;
  ghaOutputMaskNote: string;
  ghaAzureFedTitle: string;
  ghaAzureFedDesc: string;
  ghaAzureRoleTitle: string;
  ghaAzureRoleDesc: string;
  ghaAzurePolicyNote: string;
  ghaAzureMapDesc: string;
  ghaAzureInputsNote: string;
  ghaMultiEnvDesc: string;
  ghaWhyTitle: string;
  ghaWhyDesc: string;
  ghaWhyRotationLabel: string;
  ghaWhyRotation: string;
  ghaWhyAuditLabel: string;
  ghaWhyAudit: string;
  ghaWhyKeysLabel: string;
  ghaWhyKeys: string;
  ghaWhyListLabel: string;
  ghaWhyList: string;
  ghaWhyWhenSecrets: string;
  ghaErrorsTitle: string;
  ghaErrorsDesc: string;
  ghaErrMapTitle: string;
  ghaErrMapFix: string;
  ghaErrAssumeTitle: string;
  ghaErrAssumeFix: string;
  ghaErrNoCredsTitle: string;
  ghaErrNoCredsFix: string;
  ghaErrDeniedTitle: string;
  ghaErrDeniedFix: string;
  ghaErrExpiredTitle: string;
  ghaErrExpiredFix: string;
  ghaErrNotFoundTitle: string;
  ghaErrNotFoundFix: string;
  ghaErrVaultUrlTitle: string;
  ghaErrVaultUrlFix: string;
  ghaErrAzureDeniedTitle: string;
  ghaErrAzureDeniedFix: string;
  ghaErrProfileTitle: string;
  ghaErrProfileFix: string;
  ghaRelatedTitle: string;
  ghaRelatedAws: string;
  ghaRelatedAzure: string;
  ghaRelatedMap: string;
  ghaRelatedRepo: string;
  // Config priority
  // SDKs
  sidebarSdks: string;
  sidebarSdkDotnet: string;
  sidebarSdkPython: string;
  sidebarSdkNodejs: string;
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
  sdkDotnetQuickStartResolve: string;
  sdkDotnetQuickStartResolveDesc: string;
  sdkDotnetFullDocs: string;
  sdkDotnetExamplesDesc: string;
  sdkDotnetPrereqTitle: string;
  sdkDotnetPrereqDesc: string;
  sdkDotnetPrereqAws: string;
  sdkDotnetPrereqAzure: string;
  sdkDotnetIamTitle: string;
  sdkDotnetIamDesc: string;
  sdkDotnetIamKms: string;
  sdkDotnetRbacTitle: string;
  sdkDotnetRbacDesc: string;
  sdkDotnetRbacNote: string;
  sdkDotnetMapTitle: string;
  sdkDotnetMapDesc: string;
  sdkDotnetMapAzureDesc: string;
  sdkDotnetMapAzureNote: string;
  sdkDotnetAspTitle: string;
  sdkDotnetAspDesc: string;
  sdkDotnetAspOutput: string;
  sdkDotnetAspNote: string;
  sdkDotnetDiTitle: string;
  sdkDotnetDiDesc: string;
  sdkDotnetWorkerTitle: string;
  sdkDotnetWorkerDesc: string;
  sdkDotnetWorkerOutput: string;
  sdkDotnetWorkerHost: string;
  sdkDotnetPrecTitle: string;
  sdkDotnetPrecDesc: string;
  sdkDotnetPrec1: string;
  sdkDotnetPrec2: string;
  sdkDotnetPrec3: string;
  sdkDotnetPrec4: string;
  sdkDotnetPrec5: string;
  sdkDotnetPrec6: string;
  sdkDotnetPrecEnvilder: string;
  sdkDotnetPrecMissing: string;
  sdkDotnetPerEnvDesc: string;
  sdkDotnetExecTitle: string;
  sdkDotnetExecDesc: string;
  sdkDotnetExecKeys: string;
  sdkDotnetExecLink: string;
  sdkDotnetErrTitle: string;
  sdkDotnetErrIntro: string;
  sdkDotnetErrExpiredTitle: string;
  sdkDotnetErrExpiredFix: string;
  sdkDotnetErrSsoTitle: string;
  sdkDotnetErrSsoFix: string;
  sdkDotnetErrMissingTitle: string;
  sdkDotnetErrMissingFix: string;
  sdkDotnetErrDeniedTitle: string;
  sdkDotnetErrDeniedAwsFix: string;
  sdkDotnetErrDeniedAzureFix: string;
  sdkDotnetErrAzureNameTitle: string;
  sdkDotnetErrAzureNameFix: string;
  sdkDotnetErrConfigTitle: string;
  sdkDotnetErrMessageHeader: string;
  sdkDotnetErrFixHeader: string;
  sdkDotnetErrCfgFile: string;
  sdkDotnetErrCfgVault: string;
  sdkDotnetErrCfgProfileAzure: string;
  sdkDotnetErrCfgVaultAws: string;
  sdkDotnetErrCfgProfileMissing: string;
  sdkDotnetBeforeTitle: string;
  sdkDotnetBeforeDesc: string;
  sdkDotnetRelatedTitle: string;
  sdkDotnetRelatedMap: string;
  sdkDotnetRelatedAws: string;
  sdkDotnetRelatedAzure: string;
  sdkDotnetRelatedExec: string;
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
  sdkPythonExamplesDesc: string;
  sdkNodejsTitle: string;
  sdkNodejsDesc: string;
  sdkNodejsInstall: string;
  sdkNodejsQuickStart: string;
  sdkNodejsQuickStartDesc: string;
  sdkNodejsResolve: string;
  sdkNodejsResolveDesc: string;
  sdkNodejsFluent: string;
  sdkNodejsFluentDesc: string;
  sdkNodejsEnvLoading: string;
  sdkNodejsEnvLoadingDesc: string;
  sdkNodejsValidation: string;
  sdkNodejsValidationDesc: string;
  sdkNodejsFullDocs: string;
  sdkNodejsExamplesDesc: string;
  // Pager
  pagerPrev: string;
  pagerNext: string;
}

export interface HomeMetaTranslations {
  title: string;
  description: string;
  ogImageAlt: string;
}

export interface NotFoundTranslations {
  title: string;
  description: string;
  heading: string;
  body: string;
  home: string;
}

export interface SponsorsTranslations {
  title: string;
  localstackAlt: string;
  awsCreditsAlt: string;
  awsCreditsLabel: string;
  snykAlt: string;
}

export interface Translations {
  homeMeta: HomeMetaTranslations;
  notFound: NotFoundTranslations;
  nav: NavLinks;
  theme: ThemeTranslations;
  hero: HeroTranslations;
  trust: TrustTranslations;
  proof: ProofTranslations;
  sponsors: SponsorsTranslations;
  howItWorks: HowItWorksTranslations;
  features: FeaturesTranslations;
  providers: ProvidersTranslations;
  faq: FaqTranslations;
  gha: GhaTranslations;
  sdks: SdksTranslations;
  roadmap: RoadmapTranslations;
  getStarted: GetStartedTranslations;
  footer: FooterTranslations;
  changelogPage: ChangelogPageTranslations;
  docs: DocsTranslations;
}
