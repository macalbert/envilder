import type { Translations } from './types';

export const ca: Translations = {
  homeMeta: {
    title:
      'Envilder: estandarditza com les teves aplicacions consumeixen secrets a cada entorn i runtime.',
    description:
      "Defineix el contracte d'entorn una vegada i resol-lo de forma consistent en desenvolupament local, CI/CD i runtime. Amb AWS SSM Parameter Store i Azure Key Vault.",
  },
  nav: {
    features: 'Funcionalitats',
    howItWorks: 'Com funciona',
    providers: 'Proveïdors',
    githubAction: 'GitHub Action',
    sdks: 'SDKs',
    changelog: 'Canvis',
    docs: 'Docs',
    docsGettingStarted: 'Primers passos',
    docsCli: 'CLI',
    docsGha: 'GitHub Action',
    docsSdks: 'SDKs',
    docsReference: 'Referència',
    getStarted: 'Comença',
    ariaGithub: 'GitHub',
    ariaSponsor: 'Patrocina',
    ariaToggleMenu: 'Obre el menú',
  },
  theme: {
    retro: 'Retro',
    light: 'Clar',
    ariaTheme: 'Tema',
  },
  hero: {
    title1: 'Estandarditza com',
    title2: 'les teves apps consumeixen',
    titleAccent: 'secrets.',
    description:
      "Deixa de reinventar la càrrega de secrets a cada projecte. Defineix un contracte d'entorn i resol-lo a tot arreu.",
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descOr: '·',
    descSuffix: ' · GitHub Action · SDKs de runtime',
    getStarted: '▶ Comença',
    viewOnGithub: '★ Veure a GitHub',
    tabCli: 'CLI',
    tabCliDesc: 'escriu .env',
    tabSetup: 'Setup',
    tabSetupDesc: 'crea secrets',
    tabNode: 'Node.js',
    tabNodeDesc: 'en runtime',
    tabPython: 'Python',
    tabPythonDesc: 'en runtime',
    tabDotnet: '.NET',
    tabDotnetDesc: 'en runtime',
    terminalComment1: '# 1. Mapeja variables a rutes SSM',
    terminalComment2: '# 2. Resol els secrets cap a .env',
    setupComment1: '# AWS CLI configurat amb permisos a SSM',
    setupComment2: '# Puja cada secret a SSM Parameter Store',
    sdkCommentLoad: '# Carrega el mateix contracte en runtime',
    terminalSceneLabel: 'Escena de demostració del terminal',
  },
  trust: {
    label: 'COMPATIBLE AMB',
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
    awsCreditsAlt: 'AWS Open Source Credits Program',
    awsCreditsLabel: 'AWS Open Source Credits',
  },
  problemSolution: {
    title: 'Per què la gestió de secrets ',
    titleAccent: 'està trencada',
    titleSuffix: '',
    subtitle:
      'Cada equip, cada etapa, cada runtime gestiona els secrets de forma diferent. Sense estàndard. Sense consistència. Sense confiança.',
    problems: [
      {
        icon: '💀',
        title: 'Fragmentada entre eines',
        description:
          "L'entorn local utilitza fitxers .env. CI/CD llegeix d'integracions amb vaults. Producció té el seu propi mètode. Mateixa app, diferents fluxos de configuració a tot arreu.",
      },
      {
        icon: '📨',
        title: 'Secrets compartits per canals insegurs',
        description:
          'Claus API enviades per Slack, fitxers .env als repositoris, pàgines wiki amb credencials en text pla. Un incident de seguretat esperant a passar.',
      },
      {
        icon: '🐌',
        title: 'El desfasament de configuració és inevitable',
        description:
          'Sense una font única de veritat sobre quins secrets necessita una app. Dev, staging i producció es desincronitzen. Els desplegaments fallen. Ningú sap quina config és la correcta.',
      },
    ],
  },
  howItWorks: {
    title: 'Com ',
    titleAccent: 'funciona',
    subtitle: 'Defineix. Resol. Desplega.',
    stepLabel: 'PAS',
    steps: [
      {
        title: 'Defineix el model de mapeig',
        description:
          "Un fitxer JSON que mapeja noms de variables d'entorn a rutes de secrets al núvol. Fes-ne commit. Revisa'l en PRs. Compara entre entorns. Un model per a cada etapa i runtime.",
      },
      {
        title: 'Resol amb la CLI',
        description:
          "Una comanda obté cada secret del teu vault al núvol i els escriu a .env. Utilitza'l localment o en scripts. Mateix mapeig, mateix comportament.",
      },
      {
        title: 'Carrega en runtime amb SDKs',
        description:
          "Salta't el fitxer .env completament. Carrega secrets directament a la teva aplicació a l'inici amb SDKs natius: Python, .NET, Node.js i més.",
      },
      {
        title: 'Push des de dev al vault',
        description:
          'Necessites afegir o rotar un secret? Puja valors des del teu entorn local al proveïdor al núvol. Sense necessitat de consola.',
      },
      {
        title: 'Els secrets es queden al teu vault',
        description:
          "Sense intermediaris. El teu núvol gestiona l'emmagatzematge, la rotació i el control d'accés. Envilder resol, mai emmagatzema.",
      },
    ],
    terminalFetched1: '✔ Obtingut DB_PASSWORD  → ···word',
    terminalFetched2: '✔ Obtingut API_KEY      → ···key',
    terminalFetched3: '✔ Obtingut SECRET_TOKEN → ···oken',
    terminalWritten: "✔ Fitxer d'entorn escrit a .env",
    sdkTabPython: 'Python',
    sdkTabDotnet: '.NET',
    sdkTabNodejs: 'Node.js',
    pushTerminalPushed1: '✔ Pujat DB_PASSWORD  → /my-app/prod/db-password',
    pushTerminalPushed2: '✔ Pujat API_KEY      → /my-app/prod/api-key',
    pushTerminalPushed3: '✔ Pujat SECRET_TOKEN → /my-app/prod/secret-token',
  },
  features: {
    title: 'Per què ',
    titleAccent: 'Envilder?',
    subtitle:
      'Envilder és una capa de resolució sobre el teu gestor de secrets existent. Els secrets es queden al teu núvol. El mapeig JSON és només el contracte que manté cada entorn consistent.',
    highlights: [
      {
        icon: '🧱',
        title: 'Zero infraestructura',
        description:
          'Sense servidors, sense proxies, sense SaaS intermediari. Construït sobre AWS SSM i Azure Key Vault, serveis que ja utilitzes i pagues.',
      },
      {
        icon: '📋',
        title: 'Un fitxer, tots els secrets',
        description:
          'Un sol contracte JSON defineix cada secret per a cada entorn. Versionat a Git, revisable en PRs, comparable. El teu equip revisa canvis de secrets al mateix PR que el codi.',
      },
      {
        icon: '🔄',
        title: 'Rotació de secrets segura',
        description:
          'Rota valors a AWS SSM o Azure Key Vault. Cada consumidor (local, CI/CD i runtime) resol el nou valor automàticament. Sense reescriure .env, sense canvis als pipelines.',
      },
      {
        icon: '☁️',
        title: 'Multi-Cloud, sense lock-in',
        description:
          "AWS SSM, Azure Key Vault, GCP Secret Manager (pròximament). Canvia de proveïdor sense modificar el codi de l'app. El teu núvol, les teves regles.",
      },
    ],
    extrasTitle: 'També inclou',
    extras: [
      {
        icon: '⚙️',
        title: 'GitHub Action',
        description:
          'Obté secrets en workflows CI/CD. Mateix mapeig, zero intervenció manual.',
      },
      {
        icon: '🔄',
        title: 'Sincronització bidireccional',
        description:
          'Obté a .env o puja valors .env al teu proveïdor al núvol via CLI.',
      },
      {
        icon: '🔌',
        title: 'Els secrets no toquen disc',
        description:
          "SDKs de runtime carreguen secrets directament a memòria a l'inici de l'app. Sense fitxers .env escrits a disc.",
      },
      {
        icon: '🔒',
        title: 'IAM i RBAC natiu',
        description:
          "Polítiques IAM d'AWS o RBAC d'Azure. Sense capa d'auth extra.",
      },
      {
        icon: '📊',
        title: 'Traçabilitat completa',
        description:
          'Cada accés registrat a CloudTrail o Azure Monitor automàticament.',
      },
      {
        icon: '👤',
        title: 'Suport de perfils AWS',
        description:
          'Canvia entre perfils AWS CLI per a configuracions multi-compte.',
      },
    ],
  },
  demo: {
    title: "Mira'l en ",
    titleAccent: 'acció',
    subtitle:
      'Mira com Envilder simplifica la gestió de secrets en menys de 2 minuts.',
    cliDemo: 'Demo CLI: Obtenir Secrets',
    ghaWorkflow: 'Workflow de GitHub Action',
    comingSoon: 'Properament',
  },
  providers: {
    title: 'El teu núvol. ',
    titleAccent: 'La teva elecció.',
    subtitle:
      'Envilder funciona amb AWS SSM Parameter Store, Azure Key Vault i GCP Secret Manager (pròximament). Configura en línia o amb flags CLI.',
    awsTitle: 'AWS SSM Parameter Store',
    awsDefault: 'Proveïdor per defecte',
    awsFeatures: [
      'Suport de GetParameter amb WithDecryption',
      'Suport de perfil AWS per a multi-compte',
      "Control d'accés basat en polítiques IAM",
      "Registre d'auditoria CloudTrail",
    ],
    azureTitle: 'Azure Key Vault',
    azureBadge: 'Nou a v0.8',
    azureFeatures: [
      'Auto-normalitza noms de secrets (barres → guions)',
      'Autenticació DefaultAzureCredential',
      "Control d'accés Azure RBAC",
      "Registre d'auditoria Azure Monitor",
    ],
    gcpTitle: 'GCP Secret Manager',
    gcpBadge: 'Pròximament',
    gcpFeatures: [
      'Integració amb Google Cloud Secret Manager',
      'Application Default Credentials (ADC)',
      "Control d'accés basat en IAM",
      'Cloud Audit Logs',
    ],
    configPriorityTitle: 'Prioritat de configuració',
    priorityHigh: 'Flags CLI / Inputs GHA',
    priorityMid: '$config al fitxer de mapeig',
    priorityLow: 'Per defecte (AWS)',
  },
  gha: {
    title: 'GitHub Action',
    subtitle:
      'Obté secrets en el moment del desplegament. Afegeix-lo a qualsevol workflow en minuts.',
    awsSsm: '☁️ AWS SSM',
    azureKeyVault: '🔑 Azure Key Vault',
    actionInputs: "Inputs de l'Action",
    thInput: 'Input',
    thRequired: 'Requerit',
    thDefault: 'Per defecte',
    thDescription: 'Descripció',
    inputMapDesc:
      "Ruta al fitxer JSON que mapeja variables d'entorn a rutes de secrets",
    inputEnvDesc: 'Ruta al fitxer .env a generar',
    inputProviderDesc: 'Proveïdor al núvol: aws o azure (per defecte: aws)',
    inputVaultDesc: "URL d'Azure Key Vault",
    output: 'Output:',
    outputDesc: 'Ruta al fitxer .env generat',
    yes: 'Sí',
    no: 'No',
  },
  sdks: {
    title: 'SDKs en temps d’execució',
    subtitle:
      'Carrega secrets directament a la teva aplicació a l’arrencada. Sense fitxers .env, sense intermediaris. Només el teu vault al núvol i el teu codi.',
    pythonTitle: 'Python',
    pythonDesc:
      'Carrega secrets amb una línia. Compatible amb AWS SSM i Azure Key Vault.',
    dotnetTitle: '.NET',
    dotnetDesc:
      'Integració nativa amb IConfiguration. Resol secrets a l’arrencada.',
    nodejsTitle: 'Node.js',
    nodejsDesc:
      'Carrega secrets directament a Node.js. Mateix map-file, zero dependències del CLI.',
    goTitle: 'Go',
    goDesc: 'Càrrega lleugera de secrets per a serveis Go.',
    javaTitle: 'Java',
    javaDesc: 'Suport per a Spring Boot i Java standalone.',
    install: 'Instal·lar',
    quickStart: 'Inici ràpid',
    available: 'Disponible',
    planned: 'Planificat',
    comingSoon: 'Properament',
    docsLink: 'Veure docs',
    packageLink: 'Paquet',
  },
  roadmap: {
    title: 'Què ve ',
    titleAccent: 'ara',
    subtitle: 'Envilder es desenvolupa activament. Aquí és cap on anem.',
    upNext: 'Pròximament',
    items: [
      {
        status: 'done',
        label: '✅',
        title: 'Descarregar secrets a .env',
        description:
          "Mapeja noms de variables d'entorn a rutes de secrets al núvol via JSON i genera fitxers .env automàticament",
      },
      {
        status: 'done',
        label: '✅',
        title: 'Mode push (--push)',
        description:
          'Puja valors .env o secrets individuals al proveïdor al núvol',
      },
      {
        status: 'done',
        label: '✅',
        title: 'GitHub Action',
        description: 'Utilitza Envilder en workflows CI/CD de forma nativa',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Multi-proveïdor (AWS + Azure)',
        description: "Suport d'AWS SSM Parameter Store i Azure Key Vault",
      },
      {
        status: 'done',
        label: '📖',
        title: 'Web de documentació',
        description:
          'Web de docs dedicada amb guies, exemples i referència API',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Python SDK (envilder)',
        description:
          'Biblioteca per a Django/FastAPI/pipelines de dades. Publicat a PyPI',
      },
      {
        status: 'done',
        label: '✅',
        title: '.NET SDK (Envilder)',
        description:
          'Biblioteca per a apps enterprise i Azure-native. Publicat a NuGet',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Node.js SDK (@envilder/sdk)',
        description:
          'Biblioteca nativa de runtime: carrega secrets directament a process.env des d’un map-file. Publicat a npm',
      },
      {
        status: 'next',
        label: '🐹',
        title: 'Go SDK (envilder)',
        description:
          'Biblioteca per a apps cloud-native i eines Kubernetes. Es publicarà com a mòdul Go',
      },
      {
        status: 'next',
        label: '☕',
        title: 'Java SDK (envilder)',
        description:
          'Biblioteca per a Spring Boot i backends Android. Es publicarà a Maven Central',
      },
      {
        status: 'planned',
        label: '☁️',
        title: 'GCP Secret Manager',
        description: 'Tercer proveïdor cloud. Completa el trident multi-núvol',
      },
      {
        status: 'planned',
        label: '⚡',
        title: 'Mode exec (--exec)',
        description: 'Injecta secrets en un procés fill sense escriure a disc',
      },
      {
        status: 'planned',
        label: '🔐',
        title: 'AWS Secrets Manager',
        description: 'Suport de secrets JSON junt amb SSM Parameter Store',
      },
      {
        status: 'planned',
        label: '✔️',
        title: 'Mode check/sync (--check)',
        description:
          'Valida secrets al núvol vs .env local. Falla CI si estan desincronitzats',
      },
    ],
  },
  getStarted: {
    title: 'Comença ',
    titleAccent: 'ara',
    subtitle: "En funcionament en menys d'un minut.",
    prerequisites: 'Prerequisits',
    prereqNode: 'Node.js v22.12+',
    prereqAws: 'AWS CLI configurat',
    prereqAzure: 'Azure CLI configurat',
    prereqIam: 'Permisos IAM:',
    prereqAwsNote: 'per AWS SSM',
    prereqAzureNote: 'per Azure Key Vault',
    install: 'Instal·lar',
    quickStart: 'Inici ràpid',
    step1:
      "Crea un envilder.json que mapegi variables d'entorn a rutes de secrets",
    step2: 'Executa envilder --map=envilder.json --envfile=.env',
    step3: 'El teu fitxer .env està llest ✔',
    terminalTitle: 'Inici ràpid',
    commentInstall: '# Instal·lar globalment',
    commentCreate: '# Crear fitxer de mapeig',
    commentPull: '# Obtenir secrets',
    commentPush: '# Pujar un secret',
    doneMessage: ' Fet! Fitxer .env generat.',
    pushSuccess: ' Secret pujat correctament.',
    sdkTerminalTitle: 'Runtime SDK (Python)',
    sdkComment1: "# Instal·lar l'SDK",
    sdkComment2: "# Carregar secrets a l'inici",
    sdkComment3: '# Els secrets ja són a os.environ',
  },
  footer: {
    tagline:
      'Un model de configuració per resoldre secrets de forma consistent a tots els entorns i runtimes. Basat en la teva infraestructura cloud existent.',
    project: 'Projecte',
    documentation: 'Documentació',
    community: 'Comunitat',
    linkGithub: 'GitHub',
    linkNpm: 'npm',
    linkChangelog: 'Canvis',
    linkRoadmap: 'Full de ruta',
    linkGettingStarted: 'Comença',
    linkPullCommand: 'Comanda Pull',
    linkPushCommand: 'Comanda Push',
    linkGithubAction: 'GitHub Action',
    linkIssues: 'Incidències',
    linkDiscussions: 'Discussions',
    linkSecurity: 'Seguretat',
    linkSponsor: 'Patrocina',
    license: 'Llicència MIT',
    copyright: 'Fet amb Astro. Codi obert a GitHub.',
    builtWith: 'Fet amb Astro. Codi obert a GitHub.',
  },
  changelogPage: {
    title: 'Changelog Envilder | Versions i actualitzacions',

    backToHome: "← Tornar a l'inici",
    fullChangelog: 'Historial de ',
    changelogAccent: 'canvis',
    intro: 'Historial complet de versions. Vegeu també',
    githubReleases: 'Versions a GitHub',
    versions: 'Versions',
    backToTop: 'Tornar a dalt',
    categoryCli: 'CLI',
    categoryGha: 'GitHub Action',
    categorySdks: 'SDKs',
    categorySdkDotnet: '.NET',
    categorySdkPython: 'Python',
    categorySdkNodejs: 'Node.js',
  },
  docs: {
    title: 'Docs Envilder | CLI, GitHub Action i AWS SSM',

    backToHome: "← Tornar a l'inici",
    pageTitle: 'Documentació',
    intro: 'Tot el que necessites per començar amb Envilder.',
    sidebarGettingStarted: 'Primers passos',
    sidebarRequirements: 'Requisits',
    sidebarInstallation: 'Instal·lació',
    sidebarAwsSetup: 'Configuració AWS',
    sidebarAzureSetup: 'Configuració Azure',
    sidebarCli: 'CLI',
    sidebarMappingFile: 'Fitxer de mapeig',
    sidebarPullCommand: 'Comanda pull',
    sidebarPushCommand: 'Comanda push',
    sidebarPushSingle: 'Push individual',
    sidebarConfigPriority: 'Prioritat de config',
    sidebarGha: 'GitHub Action',
    sidebarGhaSetup: 'Configuració',
    sidebarGhaBasic: 'Exemple AWS',
    sidebarGhaAzure: 'Exemple Azure',
    sidebarGhaMultiEnv: 'Multi-entorn',
    sidebarGhaInputs: 'Inputs i outputs',
    overviewTitle: 'Què és Envilder?',
    overviewDesc:
      "Envilder és un sistema de resolució de configuració basat en un model. Defineixes un mapeig JSON entre noms de variables i rutes de secrets al núvol, i Envilder els resol de forma consistent: via la CLI per a desenvolupament local, la GitHub Action per a CI/CD o els SDKs de runtime per a l'inici de l'aplicació. Funciona amb AWS SSM Parameter Store i Azure Key Vault.",
    overviewProblem:
      "Sense Envilder, els equips fragmenten la gestió de secrets entre eines i etapes. L'entorn local utilitza fitxers .env, CI/CD llegeix d'integracions amb vaults, producció té el seu propi mètode. Això provoca desfasament de configuració, credencials filtrades i incorporacions lentes.",
    overviewSolution:
      "Amb Envilder, un model de mapeig és la font única de veritat. Els secrets es resolen des del teu vault al núvol sota demanda: mateix contracte, mateix comportament, ja sigui executant la CLI localment, la GitHub Action en CI o un SDK a l'inici de l'app.",
    reqTitle: 'Requisits',
    reqNode: 'Node.js v22.12+',
    reqAws: 'AWS CLI',
    reqAzure: 'Azure CLI',
    reqAwsNote: 'per AWS SSM',
    reqAzureNote: 'per Azure Key Vault',
    reqDownload: 'Descarregar',
    reqInstallGuide: "Guia d'instal·lació",
    installTitle: 'Instal·lació',
    // AWS setup
    awsSetupTitle: 'Configuració AWS',
    awsSetupIntro:
      'Tot el que necessites per usar Envilder amb AWS SSM Parameter Store.',
    awsSetupCredTitle: '1. Configura les credencials',
    awsSetupCredDesc:
      'Envilder utilitza les teves credencials AWS CLI. Configura el perfil per defecte:',
    awsSetupCredProfile:
      'O utilitza un perfil amb nom per a configuracions multi-compte:',
    awsSetupPermTitle: '2. Atorga permisos IAM',
    awsSetupPermDesc:
      'El teu usuari o rol IAM necessita accés als paràmetres SSM:',
    awsSetupPermOperation: 'Operació',
    awsSetupPermPermission: 'Permís',
    awsSetupPermPull: 'Pull',
    awsSetupPermPush: 'Push',
    awsSetupPolicyExample:
      'Exemple de política IAM (limita al teu prefix de ruta):',
    awsSetupVerifyTitle: '3. Crea un paràmetre de prova i verifica',
    awsSetupVerifyDesc:
      'Crea un paràmetre a SSM i després fes pull amb Envilder per confirmar que tot funciona:',
    awsSetupVerifySuccess:
      'Si veus ✔ Fetched, la configuració AWS està completa.',
    awsSetupVerifySdk:
      'O carrega secrets directament des de la teva app amb el Python SDK:',
    // Azure setup
    azureSetupTitle: 'Configuració Azure',
    azureSetupIntro:
      'Tot el que necessites per usar Envilder amb Azure Key Vault.',
    azureSetupCredTitle: "1. Autentica't amb Azure",
    azureSetupCredDesc:
      'Envilder utilitza Azure Default Credentials. Inicia sessió amb:',
    azureSetupCredVault:
      "Proporciona l'URL del vault via $config al fitxer de mapeig o el flag --vault-url.",
    azureSetupAccessTitle: "2. Configura l'accés al vault",
    azureSetupCheck: "Comprova quin model d'accés utilitza el teu vault:",
    azureRbacTrue: 'true → Azure RBAC (recomanat)',
    azureRbacFalse: 'false / null → Vault Access Policy (clàssic)',
    azureOptionA: 'Opció A: Azure RBAC (recomanat)',
    azureOptionB: 'Opció B: Vault Access Policy',
    azureSetupPermTitle: '3. Permisos necessaris',
    azureSetupPermOperation: 'Operació',
    azureSetupPermPermission: 'Permís',
    azureSetupPermPull: 'Pull',
    azureSetupPermPush: 'Push',
    azureSetupPullNote:
      'Per accés només de lectura, el rol Key Vault Secrets User és suficient.',
    azureSetupVerifyTitle: '4. Crea un secret de prova i verifica',
    azureSetupVerifyDesc:
      'Crea un secret a Key Vault i després fes pull amb Envilder per confirmar que tot funciona:',
    azureSetupVerifySuccess:
      'Si veus ✔ Fetched, la configuració Azure està completa.',
    azureSetupVerifySdk:
      'O carrega secrets directament des de la teva app amb el Python SDK:',
    mapTitle: 'Fitxer de mapeig',
    mapIntro:
      "El fitxer de mapeig (envilder.json) és el nucli d'Envilder. És un fitxer JSON que mapeja noms de variables d'entorn (claus) a rutes de secrets (valors) al teu proveïdor al núvol.",
    mapCalloutStructure: 'Estructura:',
    mapCalloutKey:
      "Cada clau es converteix en un nom de variable d'entorn al teu fitxer .env.",
    mapCalloutValue:
      'Cada valor és la ruta on viu el secret al teu proveïdor al núvol.',
    mapBasicTitle: 'Format bàsic (AWS SSM, per defecte)',
    mapBasicDesc:
      'Quan no hi ha secció $config, Envilder utilitza AWS SSM Parameter Store per defecte. Els valors han de ser rutes de paràmetres SSM vàlides (normalment començant amb /):',
    mapBasicGenerates: 'Això genera:',
    mapConfigTitle: 'La secció $config',
    mapConfigDesc:
      'Afegeix una clau $config al teu fitxer de mapeig per declarar quin proveïdor al núvol utilitzar i la seva configuració. Envilder llegeix $config per la configuració i tracta totes les altres claus com a mapeigs de secrets.',
    mapConfigOptionsTitle: 'Opcions de $config',
    mapThKey: 'Clau',
    mapThType: 'Tipus',
    mapThDefault: 'Per defecte',
    mapThDescription: 'Descripció',
    mapProviderDesc: 'Proveïdor al núvol a utilitzar',
    mapVaultUrlDesc:
      'URL d\'Azure Key Vault (requerit quan el proveïdor és "azure")',
    mapProfileDesc:
      'Perfil AWS CLI per a configuracions multi-compte (només AWS)',
    mapAwsProfileTitle: 'AWS SSM amb perfil',
    mapAwsProfileDesc:
      'Per utilitzar un perfil AWS CLI específic (útil per a configuracions multi-compte), afegeix profile a $config:',
    mapAwsProfileExplain:
      'Això indica a Envilder que utilitzi el perfil prod-account del teu fitxer ~/.aws/credentials en lloc del perfil per defecte.',
    mapAzureTitle: 'Azure Key Vault',
    mapAzureDesc:
      'Per Azure Key Vault, estableix provider a "azure" i proporciona el vaultUrl:',
    mapAzureWarningTitle: 'Convenció de noms Azure:',
    mapAzureWarningDesc:
      'Els noms de secrets de Key Vault només permeten caràcters alfanumèrics i guions. Envilder normalitza automàticament els noms: barres i guions baixos es converteixen en guions (p. ex., /myapp/db/password → myapp-db-password).',
    mapDifferencesTitle: 'Diferències clau per proveïdor',
    mapThEmpty: '',
    mapThAwsSsm: 'AWS SSM',
    mapThAzureKv: 'Azure Key Vault',
    mapSecretPathFormat: 'Format de ruta de secret',
    mapAwsPathFormat: 'Rutes de paràmetres amb barres',
    mapAzurePathFormat: 'Noms amb guions',
    mapRequiredConfig: '$config requerit',
    mapAwsRequiredConfig: 'Cap (AWS és per defecte)',
    mapAzureRequiredConfig: 'provider + vaultUrl',
    mapOptionalConfig: '$config opcional',
    mapAuthentication: 'Autenticació',
    mapAwsAuth: 'Credencials AWS CLI',
    mapAzureAuth: 'Azure Default Credentials',
    mapMultiEnvTitle: 'Múltiples entorns',
    mapMultiEnvDesc:
      "Un patró comú és tenir un fitxer de mapeig per entorn. L'estructura és la mateixa, només canvien les rutes dels secrets:",
    mapMultiEnvThenPull: 'Després obté el correcte:',
    mapOverrideTitle: 'Sobreescriure $config amb flags CLI',
    mapOverrideDesc:
      "Els flags CLI sempre tenen prioritat sobre els valors de $config. Això et permet establir valors per defecte al fitxer i sobreescriure'ls per invocació:",
    mapOverrideComment1: '# Utilitza $config del fitxer de mapeig tal qual',
    mapOverrideComment2:
      '# Sobreescriu proveïdor i URL del vault, ignorant $config',
    mapOverrideComment3: '# Sobreescriu només el perfil AWS',
    mapPriorityNote:
      'Ordre de prioritat: flags CLI / inputs GHA → $config al fitxer de mapeig → per defecte (AWS).',
    pullTitle: 'Comanda pull',
    pullDesc:
      'Descarrega secrets del teu proveïdor al núvol i genera un fitxer .env local.',
    pullOptions: 'Opcions',
    pullExamples: 'Exemples',
    pullOutput: 'Sortida',
    optionHeader: 'Opció',
    pullOptMap: 'Ruta al fitxer JSON de mapeig',
    pullOptEnv: 'Ruta on escriure el .env',
    pullOptProvider: 'aws (per defecte) o azure',
    pullOptVault: "URL d'Azure Key Vault",
    pullOptProfile: 'Perfil AWS CLI a utilitzar',
    pullCommentDefault: '# Per defecte (AWS SSM)',
    pullCommentProfile: '# Amb perfil AWS',
    pullCommentAzureConfig: '# Azure via $config al fitxer de mapeig',
    pullCommentAzureFlags: '# Azure via flags CLI',
    pullOutputTitle: 'Sortida',
    pushTitle: 'Comanda push',
    pushDesc:
      "Puja variables d'entorn d'un fitxer .env local al teu proveïdor al núvol utilitzant un fitxer de mapeig.",
    pushOptions: 'Opcions',
    pushExamples: 'Exemples',
    pushOptPush: 'Activa el mode push (requerit)',
    pushOptEnv: 'Ruta al teu fitxer .env local',
    pushOptMap: 'Ruta al JSON de mapeig de paràmetres',
    pushOptProvider: 'aws (per defecte) o azure',
    pushOptVault: "URL d'Azure Key Vault",
    pushOptProfile: 'Perfil AWS CLI (només AWS)',
    pushCommentAws: '# Pujar a AWS SSM',
    pushCommentProfile: '# Amb perfil AWS',
    pushCommentAzureConfig: '# Azure via $config al fitxer de mapeig',
    pushCommentAzureFlags: '# Azure via flags CLI',
    pushSingleTitle: 'Pujar variable individual',
    pushSingleDesc:
      "Puja una variable d'entorn individual directament sense cap fitxer.",
    pushSingleOptions: 'Opcions',
    pushSingleOptPush: 'Activa el mode push (requerit)',
    pushSingleOptKey: "Nom de la variable d'entorn",
    pushSingleOptValue: 'Valor a emmagatzemar',
    pushSingleOptPath: 'Ruta completa del secret al teu proveïdor al núvol',
    pushSingleOptProvider: 'aws (per defecte) o azure',
    pushSingleOptVault: "URL d'Azure Key Vault",
    pushSingleOptProfile: 'Perfil AWS CLI (només AWS)',
    ghaSetupTitle: 'Configuració de GitHub Action',
    ghaSetupDesc:
      "La GitHub Action d'Envilder obté secrets d'AWS SSM o Azure Key Vault en fitxers .env durant el teu workflow CI/CD. No cal compilar. L'action està pre-construïda i llesta per utilitzar des de GitHub Marketplace.",
    ghaPrerequisites: 'Prerequisits',
    ghaPrereqAws:
      'AWS: Configura credencials amb aws-actions/configure-aws-credentials',
    ghaPrereqAzure: 'Azure: Configura credencials amb azure/login',
    ghaPrereqMap: 'Un envilder.json al teu repositori',
    ghaPullOnly: 'La GitHub Action només suporta el mode pull (sense push).',
    ghaBasicTitle: 'Exemple bàsic de workflow',
    ghaMultiEnvTitle: 'Workflow multi-entorn',
    ghaAzureTitle: "Workflow d'Azure Key Vault",
    ghaInputsTitle: "Inputs i outputs de l'Action",
    ghaInputsSubtitle: 'Inputs',
    ghaOutputsSubtitle: 'Outputs',
    ghaInputRequired: 'Requerit',
    ghaInputDefault: 'Per defecte',
    ghaInputDesc: 'Descripció',
    ghaOutputEnvPath: 'Ruta al fitxer .env generat',
    ghaThInput: 'Input',
    ghaThRequired: 'Requerit',
    ghaThOutput: 'Output',
    ghaYes: 'Sí',
    ghaNo: 'No',
    ghaInputMap: 'Ruta al fitxer JSON de mapeig',
    ghaInputEnv: 'Ruta al fitxer .env a generar',
    ghaInputProvider: 'aws o azure',
    ghaInputVault: "URL d'Azure Key Vault",
    configPriorityTitle: 'Prioritat de configuració',
    configPriorityDesc:
      'Quan hi ha múltiples fonts de configuració, Envilder les resol en aquest ordre (el més alt guanya):',
    configPriority1: 'Flags CLI / inputs GHA',
    configPriority2: '$config al fitxer de mapeig',
    configPriority3: 'Per defecte (AWS)',
    configPriorityExplain:
      'Això vol dir que --provider=azure a la CLI sobreescriurà "provider": "aws" a $config.',
    // SDKs
    sidebarSdks: 'SDKs',
    sidebarSdkDotnet: '.NET SDK',
    sidebarSdkPython: 'Python SDK',
    sidebarSdkNodejs: 'Node.js SDK',
    sdkDotnetTitle: '.NET SDK',
    sdkDotnetDesc:
      "Carrega secrets directament a la teva aplicació .NET a l'inici. Façana d'una línia, constructor fluent, integració amb IConfiguration o control programàtic total.",
    sdkDotnetInstall: 'Instal·lació',
    sdkDotnetOneLiner: 'Una línia: resoldre + injectar',
    sdkDotnetOneLinerDesc:
      "Resol secrets del fitxer de mapeig i injecta'ls a Environment en una sola crida:",
    sdkDotnetResolve: 'Resoldre sense injectar',
    sdkDotnetResolveDesc:
      "Obté secrets com un diccionari sense modificar l'entorn:",
    sdkDotnetFluent: 'Constructor fluent amb sobreescriptures',
    sdkDotnetFluentDesc:
      "Sobreescriu la configuració del proveïdor de manera programàtica amb l'API fluent:",
    sdkDotnetEnvLoading: 'Càrrega basada en entorn',
    sdkDotnetEnvLoadingDesc:
      'Encamina la càrrega de secrets segons el teu entorn actual. Cada entorn mapeja al seu fitxer de secrets:',
    sdkDotnetValidation: 'Validació de secrets',
    sdkDotnetValidationDesc:
      'Validació opcional que assegura que tots els secrets resolts tenen valors no buits:',
    sdkDotnetQuickStartConfig: 'Via IConfiguration (ASP.NET)',
    sdkDotnetQuickStartConfigDesc:
      'Afegeix Envilder com a font de configuració a la teva aplicació ASP.NET:',
    sdkDotnetQuickStartResolve: 'Avançat: control programàtic total',
    sdkDotnetQuickStartResolveDesc:
      "Analitza el fitxer de mapeig, resol secrets i injecta'ls a les variables d'entorn:",
    sdkDotnetFullDocs: 'Documentació completa →',
    sdkPythonTitle: 'Python SDK',
    sdkPythonDesc:
      "Carrega secrets directament a la teva aplicació Python a l'inici. Configuració en una línia o control detallat amb el constructor fluent.",
    sdkPythonInstall: 'Instal·lació',
    sdkPythonQuickStart: 'Inici ràpid: una línia',
    sdkPythonQuickStartDesc:
      "Carrega secrets des d'un fitxer de mapeig i injecta'ls a l'entorn:",
    sdkPythonEnvLoading: 'Càrrega basada en entorn',
    sdkPythonEnvLoadingDesc:
      'Recomanat per a aplicacions multi-entorn. Mapeja cada entorn al seu fitxer de secrets:',
    sdkPythonResolve: 'Resoldre sense injectar',
    sdkPythonResolveDesc:
      "Obté secrets com un diccionari sense modificar l'entorn:",
    sdkPythonFluent: 'Constructor fluent amb sobreescriptures',
    sdkPythonFluentDesc:
      "Sobreescriu la configuració del proveïdor de manera programàtica amb l'API fluent:",
    sdkPythonValidation: 'Validació de secrets',
    sdkPythonValidationDesc:
      'Validació opcional que assegura que tots els secrets resolts tenen valors no buits:',
    sdkPythonFullDocs: 'Documentació completa →',
    sdkNodejsTitle: 'Node.js SDK',
    sdkNodejsDesc:
      "Carrega secrets directament a la teva aplicació Node.js a l'inici. API asíncrona amb façana d'una línia o constructor fluent per a control total.",
    sdkNodejsInstall: 'Instal·lació',
    sdkNodejsQuickStart: 'Inici ràpid: una línia',
    sdkNodejsQuickStartDesc:
      "Carrega secrets des d'un fitxer de mapeig i injecta'ls a process.env:",
    sdkNodejsResolve: 'Resoldre sense injectar',
    sdkNodejsResolveDesc: "Obté secrets com un Map sense modificar l'entorn:",
    sdkNodejsFluent: 'Constructor fluent amb sobreescriptures',
    sdkNodejsFluentDesc:
      "Sobreescriu la configuració del proveïdor de manera programàtica amb l'API fluent:",
    sdkNodejsEnvLoading: 'Càrrega basada en entorn',
    sdkNodejsEnvLoadingDesc:
      'Recomanat per a aplicacions multi-entorn. Mapeja cada entorn al seu fitxer de secrets:',
    sdkNodejsValidation: 'Validació de secrets',
    sdkNodejsValidationDesc:
      'Validació opcional que assegura que tots els secrets resolts tenen valors no buits:',
    sdkNodejsFullDocs: 'Documentació completa →',
    pagerPrev: 'Anterior',
    pagerNext: 'Següent',
  },
};
