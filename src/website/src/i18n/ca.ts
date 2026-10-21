import type { Translations } from './types';

export const ca: Translations = {
  homeMeta: {
    title: 'Executa apps amb secrets d’AWS SSM i Azure Key Vault | Envilder',
    description:
      "Mapeja variables d'entorn a AWS SSM o Azure Key Vault un cop i executa qualsevol ordre amb els secrets al seu entorn. Sense .env al disc. CLI, Action i SDKs open source.",
    ogImageAlt:
      'Envilder - executa apps amb secrets d’AWS SSM i Azure Key Vault, sense fitxer .env',
  },
  notFound: {
    title: 'Pàgina no trobada | Envilder',
    description: "La pàgina d'Envilder sol·licitada no existeix.",
    heading: 'No hem trobat aquesta pàgina',
    body: "L'adreça pot ser incorrecta o la pàgina pot haver-se mogut.",
    home: 'Torna a l’inici',
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
    cream: 'Crema',
    ariaTheme: 'Tema',
  },
  hero: {
    title1: 'Executa la teva app',
    title2: 'amb secrets del núvol.',
    titleAccent: 'Sense fitxer .env.',
    description:
      "Mapeja cada variable d'entorn a una ruta d'AWS SSM o Azure Key Vault a envilder.json. Una sola ordre les resol i arrenca la teva app amb els valors al seu entorn.",
    positioning:
      'Open source, sense cap servidor ni SaaS pel mig: els secrets es queden al teu compte del núvol. Necessites un fitxer per a una eina o la CI? pull escriu el .env. Prefereixes codi? SDKs per a Node.js, Python i .NET.',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descOr: '·',
    descSuffix: ' · GitHub Action · SDKs de runtime',
    getStarted: '▶ Comença',
    viewOnGithub: '★ Veure a GitHub',
    tabGroupCli: 'CLI',
    tabGroupSdk: 'SDK',
    tabPull: 'pull',
    tabPullDesc: 'escriu .env',
    tabExec: 'exec',
    tabExecDesc: 'executa la teva app, sense .env',
    tabPush: 'push',
    tabPushDesc: 'puja el .env al vault',
    tabNode: 'Node.js',
    tabNodeDesc: 'en runtime',
    tabPython: 'Python',
    tabPythonDesc: 'en runtime',
    tabDotnet: '.NET',
    tabDotnetDesc: 'en runtime',
    terminalComment1: '# 1. Mapeja variables a rutes SSM',
    terminalComment2: '# 2. Resol els secrets cap a .env',
    execComment1: '# Executa la teva app amb els secrets al seu entorn',
    execComment2: '# Res escrit al disc',
    setupComment1: '# 1. Mapeja cada variable a una ruta de SSM',
    setupComment2: '# 2. Puja els valors del .env a SSM Parameter Store',
    setupAzureComment1: '# 1. Mapeja cada variable a un secret de Key Vault',
    setupAzureComment2: '# 2. Puja els valors del .env a Azure Key Vault',
    sdkCommentLoad: '# Carrega el mateix contracte en runtime',
    terminalSceneLabel: 'Escena de demostració del terminal',
    terminalPause: 'Pausa la demostració',
    terminalPlay: 'Reprèn la demostració',
    execMapComment: '# Mapeja cada variable a una ruta de secret',
  },
  trust: {
    label: 'COMPATIBLE AMB',
  },
  proof: {
    ariaLabel: 'Adopció',
    stars: 'estrelles a GitHub',
    npmMonthly: "descàrregues d'npm l'últim mes",
    pypiMonthly: "descàrregues de PyPI l'últim mes",
    nugetTotal: 'descàrregues de NuGet',
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
    awsCreditsAlt: 'AWS Open Source Credits Program',
    awsCreditsLabel: 'AWS Open Source Credits',
    snykAlt: 'Snyk Secure Developer Program',
  },
  howItWorks: {
    title: 'Com ',
    titleAccent: 'funciona',
    subtitle: 'Mapeja un cop. Executa-ho a tot arreu.',
    stepLabel: 'PAS',
    steps: [
      {
        title: 'Mapeja cada variable un cop',
        description:
          "envilder.json llista els noms de les variables d'entorn i les rutes dels secrets, mai els valors. Fes-ne commit i revisa'n els canvis en pull requests com qualsevol altre codi.",
      },
      {
        title: 'Executa la teva app amb exec',
        description:
          "envilder exec resol tots els secrets mapejats i arrenca la teva ordre amb ells al seu entorn. Cap fitxer .env al disc, res a netejar, i l'ordre no arrenca mai si falta un secret.",
      },
      {
        title: 'O carrega-ho des del codi',
        description:
          'Els SDKs de runtime per a Node.js, Python i .NET resolen el mateix mapeig dins del procés en arrencar.',
      },
      {
        title: 'Necessites un fitxer? Fes servir pull',
        description:
          "Algunes eines i passos de CI esperen un fitxer .env. pull n'escriu un a partir del mateix mapeig, i la GitHub Action ho fa als teus workflows. Tracta el fitxer generat com un secret.",
      },
    ],
    sdkTabPython: 'Python',
    sdkTabDotnet: '.NET',
    sdkTabNodejs: 'Node.js',
  },
  features: {
    title: 'Per què ',
    titleAccent: 'Envilder?',
    subtitle:
      "Envilder és una capa de resolució sobre el gestor de secrets que ja fas servir. No emmagatzema mai secrets: el fitxer de mapeig és l'única cosa que afegeix al teu repositori.",
    highlights: [
      {
        icon: 'plug',
        title: 'Secrets fora del disc',
        description:
          "exec i els SDKs posen els valors directament a l'entorn del procés. Cap .env en text pla a la carpeta del projecte, a les còpies de seguretat ni a una imatge de contenidor.",
      },
      {
        icon: 'brick',
        title: 'Sense servidor ni SaaS',
        description:
          'Res a allotjar ni a pagar. Envilder llegeix AWS SSM Parameter Store o Azure Key Vault directament amb les teves pròpies credencials del núvol.',
      },
      {
        icon: 'clipboard',
        title: 'Un sol fitxer revisat',
        description:
          'envilder.json és la llista única del que necessita cada app, igual per al desenvolupament local, la CI i producció. Els canvis passen per pull requests.',
      },
      {
        icon: 'lock',
        title: 'IAM i RBAC natius',
        description:
          "L'accés el governen AWS IAM o Azure RBAC, i CloudTrail o Azure Monitor el poden registrar si està configurat. Cap capa d'autenticació extra.",
      },
    ],
  },
  providers: {
    title: 'El teu núvol. ',
    titleAccent: 'La teva elecció.',
    subtitle:
      'Envilder funciona avui amb AWS SSM Parameter Store i Azure Key Vault. Tria el proveïdor a envilder.json o amb flags de la CLI.',
    awsTitle: 'AWS SSM Parameter Store',
    awsDefault: 'Proveïdor per defecte',
    awsFeatures: [
      'Suport de GetParameter amb WithDecryption',
      'Suport de perfil AWS per a multi-compte',
      "Control d'accés basat en polítiques IAM",
      "Registre d'accés de CloudTrail quan està configurat",
    ],
    azureTitle: 'Azure Key Vault',
    azureBadge: 'Nou a v0.8',
    azureFeatures: [
      'Auto-normalitza noms de secrets (barres → guions)',
      'Autenticació DefaultAzureCredential',
      "Control d'accés Azure RBAC",
      "Registre d'accés d'Azure Monitor quan està configurat",
    ],
    configPriorityTitle: 'Prioritat de configuració',
    priorityHigh: 'Flags CLI / Inputs GHA',
    priorityMid: '$config al fitxer de mapeig',
    priorityLow: 'Per defecte (AWS)',
    roadmapNote:
      'Necessites Google Cloud Secret Manager o AWS Secrets Manager? Tots dos són al roadmap, encara no disponibles.',
    roadmapLink: 'Veure el roadmap',
  },
  faq: {
    title: 'Preguntes ',
    titleAccent: 'freqüents',
    items: [
      {
        q: 'Què és Envilder?',
        a: "Envilder és una CLI, una GitHub Action i un conjunt de SDKs de runtime open source que resolen els secrets de l'aplicació des d'AWS SSM Parameter Store o Azure Key Vault amb un sol fitxer de mapeig JSON versionat. Pot executar la teva ordre amb aquests secrets al seu entorn, escriure un fitxer .env quan una eina el necessita, o carregar-los dins del procés.",
      },
      {
        q: 'Envilder emmagatzema els meus secrets?',
        a: "No. Els valors es queden a AWS SSM Parameter Store o Azure Key Vault. envilder.json només conté noms de variables i rutes de secrets, així que se'n pot fer commit sense risc. No hi ha cap servidor ni servei allotjat d'Envilder.",
      },
      {
        q: 'Envilder té un mode exec?',
        a: "Sí. Des de la CLI v0.15.0, envilder exec -- <ordre> resol els secrets del teu map file i arrenca l'ordre amb ells com a variables d'entorn, sense escriure cap fitxer .env. Funciona amb AWS SSM Parameter Store i Azure Key Vault.",
      },
      {
        q: 'En què es diferencia envilder exec d’un fitxer .env?',
        a: "exec resol els secrets i els passa a la teva ordre com a variables d'entorn, de manera que no s'escriu res al disc. Falla de manera tancada: si un secret falta, és buit o no es pot llegir, l'ordre no arrenca. L'ordre i els processos que llança poden llegir els valors; exec no és un sandbox.",
      },
      {
        q: 'Ho puc fer servir a CI/CD?',
        a: 'Sí. La GitHub Action obté els secrets mapejats en un fitxer .env dins del workflow, i la CLI (exec o pull) funciona a qualsevol runner de CI amb credencials del núvol.',
      },
      {
        q: 'Quins magatzems de secrets suporta?',
        a: 'AWS SSM Parameter Store i Azure Key Vault. Google Cloud Secret Manager i AWS Secrets Manager són al roadmap però encara no estan disponibles.',
      },
      {
        q: 'Com es compara amb dotenvx, Chamber o Doppler?',
        a: "dotenvx xifra fitxers .env perquè se'n pugui fer commit. Doppler és una plataforma de secrets allotjada. Chamber és una CLI per als magatzems de secrets d'AWS. Envilder manté els valors a l'AWS SSM o Azure Key Vault que ja fas servir, afegeix un sol fitxer de mapeig revisat i cobreix la CLI, la CI i els SDKs de runtime amb aquest mateix mapeig.",
      },
      {
        q: 'És gratuït?',
        a: 'Sí. Envilder té llicència MIT. Només pagues els costos habituals del teu proveïdor per a SSM Parameter Store o Key Vault.',
      },
    ],
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
        status: 'done',
        label: '✅',
        title: 'Mode exec (envilder exec)',
        description:
          'Executa una comanda amb els teus secrets al seu entorn, sense escriure cap fitxer .env: envilder exec [options] [--] <command> [args...]',
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
        description:
          'Tercer proveïdor cloud planificat; encara no està disponible',
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
    prereqProviderChoice: 'Tria un proveïdor al núvol:',
    prereqAws: 'AWS SSM',
    prereqAzure: 'Azure Key Vault',
    prereqAwsNote:
      'credencials AWS amb ssm:GetParameter; afegeix ssm:PutParameter per a --push',
    prereqAzureNote:
      'credencials Azure amb accés Get a secrets; afegeix accés Set per a --push',
    install: 'Instal·lar',
    quickStart: 'Inici ràpid',
    step1:
      "Crea un envilder.json que mapegi variables d'entorn a rutes de secrets",
    step2:
      "Executa npx envilder exec -- seguit de l'ordre habitual d'arrencada",
    step3: 'La teva app arrenca amb els seus secrets ✔',
    terminalTitle: 'Inici ràpid',
    commentCreate: '# Crear fitxer de mapeig',
    commentPull: '# O escriu un fitxer .env',
    doneMessage: 'Fitxer .env generat.',
    sdkComment3: '# Els secrets ja són a os.environ',
    sdkExampleLink: 'Veure exemples executables a GitHub',
    commentExec: '# Executa la teva app amb els secrets',
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
    linkExecCommand: 'Comanda Exec',
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
    title: 'Canvis d’Envilder: versions de la CLI, GitHub Action i SDKs',
    description:
      "Historial de versions de la CLI, GitHub Action i SDKs de runtime .NET, Python i Node.js d'Envilder.",

    backToHome: "← Tornar a l'inici",
    fullChangelog: 'Historial de ',
    changelogAccent: 'canvis',
    intro: 'Historial complet de versions. Vegeu també',
    releaseNotesLanguage: 'Les notes de versió es publiquen en anglès.',
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
    title: 'Docs Envilder: secrets amb AWS SSM i Azure Key Vault',
    description:
      "Aprèn a resoldre variables d'entorn des d'AWS SSM Parameter Store i Azure Key Vault amb la CLI, GitHub Action i SDKs de runtime d'Envilder.",

    backToHome: "← Tornar a l'inici",
    pageTitle: 'Documentació d’Envilder per a AWS SSM i Azure Key Vault',
    intro: 'Tot el que necessites per començar amb Envilder.',
    pages: {
      hub: {
        title: "Documentació d'Envilder",
        description:
          "Guies per utilitzar Envilder amb AWS SSM Parameter Store, Azure Key Vault, la CLI, GitHub Action i SDKs de temps d'execució.",
        heading: "Documentació d'Envilder",
        intro:
          "Tria una guia per configurar Envilder, resoldre secrets o carregar-los en temps d'execució.",
        breadcrumb: 'Documentació',
        navLabel: 'Documentació',
        cardTitle: "Documentació d'Envilder",
        cardSummary:
          'Troba guies de configuració, proveïdors, CLI, GitHub Action i SDKs.',
      },
      'getting-started': {
        title: 'Comença amb Envilder',
        description:
          'Instal·la Envilder i coneix els requisits per resoldre secrets des del teu proveïdor al núvol.',
        heading: 'Comença',
        intro:
          "Instal·la Envilder, configura un proveïdor i resol secrets des d'un fitxer de mapatge versionat.",
        breadcrumb: 'Comença',
        navLabel: 'Comença',
        cardTitle: 'Comença amb Envilder',
        cardSummary:
          'Instal·la la CLI, revisa els requisits i entén el model de mapatge.',
      },
      'aws-ssm': {
        title: 'Utilitza Envilder amb AWS SSM Parameter Store',
        description:
          'Configura les credencials AWS i els permisos IAM per a Envilder amb AWS SSM Parameter Store.',
        heading: 'AWS SSM',
        intro:
          'Configura credencials, permisos IAM i un paràmetre de prova per a AWS SSM Parameter Store.',
        breadcrumb: 'AWS SSM',
        navLabel: 'AWS SSM',
        cardTitle: "Configuració d'AWS SSM",
        cardSummary:
          'Configura les credencials AWS i els permisos que necessita Envilder.',
      },
      'azure-key-vault': {
        title: 'Utilitza Envilder amb Azure Key Vault',
        description:
          "Configura l'autenticació Azure i l'accés a Key Vault per a Envilder.",
        heading: 'Azure Key Vault',
        intro:
          "Configura l'autenticació Azure, l'accés al vault i un secret de prova per a Azure Key Vault.",
        breadcrumb: 'Azure Key Vault',
        navLabel: 'Azure Key Vault',
        cardTitle: "Configuració d'Azure Key Vault",
        cardSummary:
          "Configura l'autenticació Azure i els permisos de Key Vault.",
      },
      'map-file': {
        title: "Referència del fitxer de mapatge d'Envilder",
        description:
          "Defineix mapatges d'Envilder i la configuració del proveïdor a envilder.json.",
        heading: 'Fitxer de mapatge',
        intro:
          "Defineix els mapatges de variables d'entorn i la configuració del proveïdor a envilder.json.",
        breadcrumb: 'Fitxer de mapatge',
        navLabel: 'Fitxer de mapatge',
        cardTitle: 'Referència del fitxer de mapatge',
        cardSummary:
          'Mapeja variables a rutes de secrets i configura el proveïdor seleccionat.',
      },
      'cli-pull': {
        title: "Descarrega secrets amb la CLI d'Envilder",
        description:
          'Descarrega secrets al núvol i genera un fitxer .env local amb Envilder.',
        heading: 'CLI pull',
        intro:
          'Descarrega secrets del proveïdor i escriu-los a un fitxer .env local.',
        breadcrumb: 'CLI pull',
        navLabel: 'CLI pull',
        cardTitle: 'Comanda CLI pull',
        cardSummary:
          'Genera un fitxer .env a partir dels secrets definits al fitxer de mapatge.',
      },
      'cli-push': {
        title: "Puja secrets amb la CLI d'Envilder",
        description:
          "Puja variables d'entorn locals o un sol secret amb el mode push d'Envilder.",
        heading: 'CLI push',
        intro:
          "Puja variables d'entorn des d'un fitxer .env o envia un sol secret directament.",
        breadcrumb: 'CLI push',
        navLabel: 'CLI push',
        cardTitle: 'Comanda CLI push',
        cardSummary: 'Puja un fitxer .env mapat o un secret al proveïdor.',
      },
      'cli-exec': {
        title: "Executa una comanda amb secrets d'AWS SSM o Azure Key Vault",
        description:
          "Referència d'envilder exec: resol secrets d'AWS SSM o Azure Key Vault en memòria i inicia la teva comanda amb ells, sense escriure cap fitxer .env.",
        heading: 'CLI exec',
        intro:
          'Executa una comanda amb els secrets al seu entorn, sense escriure cap fitxer .env.',
        breadcrumb: 'CLI exec',
        navLabel: 'CLI exec',
        cardTitle: 'Comanda CLI exec',
        cardSummary:
          'Inicia una comanda amb els secrets mapats en memòria, sense fitxer .env.',
      },
      'github-action': {
        title: "Carrega secrets d'AWS SSM i Azure Key Vault a GitHub Actions",
        description:
          "Carrega secrets d'AWS SSM Parameter Store o Azure Key Vault a un fitxer .env a GitHub Actions amb OIDC: permisos IAM i RBAC mínims, workflows complets i errors de credencials.",
        heading: "Carrega secrets d'AWS SSM i Azure Key Vault a GitHub Actions",
        intro:
          "Com fas servir secrets d'AWS SSM Parameter Store o Azure Key Vault en un job de GitHub Actions sense copiar-los a GitHub Secrets? Autentica el job amb OIDC i deixa que l'Action d'Envilder llegeixi el teu envilder.json versionat i escrigui un fitxer .env per als passos següents.",
        breadcrumb: 'GitHub Action',
        navLabel: 'GitHub Action',
        cardTitle: 'Guia de GitHub Action',
        cardSummary: "Configura l'acció per a AWS, Azure i diversos entorns.",
      },
      'sdk-dotnet': {
        title: "SDK .NET d'Envilder",
        description:
          "Carrega secrets de fitxers de mapatge d'Envilder en aplicacions .NET.",
        heading: 'SDK .NET',
        intro:
          'Carrega secrets directament en una aplicació .NET en iniciar-se.',
        breadcrumb: 'SDK .NET',
        navLabel: 'SDK .NET',
        cardTitle: "Guia de l'SDK .NET",
        cardSummary: "Instal·la i utilitza l'SDK de temps d'execució .NET.",
      },
      'sdk-python': {
        title: "SDK Python d'Envilder",
        description:
          "Carrega secrets de fitxers de mapatge d'Envilder en aplicacions Python.",
        heading: 'SDK Python',
        intro:
          'Carrega secrets directament en una aplicació Python en iniciar-se.',
        breadcrumb: 'SDK Python',
        navLabel: 'SDK Python',
        cardTitle: "Guia de l'SDK Python",
        cardSummary: "Instal·la i utilitza l'SDK de temps d'execució Python.",
      },
      'sdk-nodejs': {
        title: "SDK Node.js d'Envilder",
        description:
          "Carrega secrets de fitxers de mapatge d'Envilder en aplicacions Node.js.",
        heading: 'SDK Node.js',
        intro:
          'Carrega secrets directament en una aplicació Node.js en iniciar-se.',
        breadcrumb: 'SDK Node.js',
        navLabel: 'SDK Node.js',
        cardTitle: "Guia de l'SDK Node.js",
        cardSummary: "Instal·la i utilitza l'SDK de temps d'execució Node.js.",
      },
    },
    breadcrumbLabel: "Fil d'Ariadna",
    breadcrumbHome: 'Inici',
    breadcrumbDocs: 'Documentació',
    navigationLabel: 'Navegació de documentació',
    mobileNavigation: 'Tria una pàgina de documentació',
    navGettingStarted: 'Comença',
    navProviders: 'Proveïdors',
    hubCardsLabel: 'Guies de documentació',
    openPage: 'Obre la guia',
    pagerLabel: 'Pàgines de documentació',
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
    installNext: 'I ara, tria com arriben els secrets a la teva aplicació:',
    installNextPull: 'CLI pull: genera un fitxer .env',
    installNextExec:
      'CLI exec: executa la teva comanda amb els secrets en memòria, sense .env',
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
    pullExecTitle: 'No vols cap fitxer .env?',
    pullExecDesc:
      'Fes servir envilder exec: resol el mateix map file i inicia la teva comanda amb els secrets al seu entorn, sense escriure res a disc.',
    pullExecGuideLink: 'Consulta la guia de CLI exec',
    execTitle: 'Comanda exec',
    execDesc:
      "envilder exec resol tots els secrets del map file i inicia una comanda amb aquests valors al seu entorn. No s'escriu res a disc: no hi ha cap fitxer .env per afegir al .gitignore, mantenir sincronitzat o esborrar. El map file i el seu $config funcionen exactament igual que en el mode pull.",
    execUsageTitle: 'Ús',
    execSeparatorTitle: 'On comença la teva comanda: la regla del --',
    execSeparatorDesc:
      "Primer van les opcions d'Envilder. La teva comanda comença al primer argument que no és una opció d'Envilder, o just després del -- si n'hi ha. Tot el que ve a continuació arriba tal qual a la teva comanda, encara que sembli una opció d'Envilder. El -- és opcional: només el necessites quan la comanda mateixa comença amb -.",
    execSepComment1: '# Tot és de npm',
    execSepComment2: "# --map és d'Envilder, la resta és de npm",
    execSepComment3: '# --map=x és de npm: va després de la comanda',
    execSepComment4: '# El mateix, amb un separador explícit',
    execOptions: 'Opcions',
    execOptMap: 'Ruta al map file (per defecte: envilder.json)',
    execOptProfile: 'Perfil AWS CLI. Té prioritat sobre $config.profile',
    execOptProvider: 'aws o azure. Té prioritat sobre $config.provider',
    execOptVault:
      "URL de l'Azure Key Vault. Té prioritat sobre $config.vaultUrl",
    execOptionsOrderDesc:
      "Les opcions d'Envilder van després d'exec, mai abans. Una opció escrita abans d'exec es rebutja amb el codi de sortida 125, i Envilder et mostra la comanda corregida:",
    execRejectedDesc:
      'El mode exec mai llegeix ni escriu cap fitxer .env i mai puja secrets, així que --envfile, --push, --key, --value i --secret-path es rebutgen amb el codi de sortida 125 abans de cap crida al proveïdor. Una opció desconeguda abans de la comanda també és un error: un error tipogràfic com --mapp mai arriba a la teva comanda per accident.',
    execExamples: 'Exemples',
    execCommentNpx:
      "# Arrenca el servidor de desenvolupament amb els secrets d'envilder.json",
    execCommentMap: '# Fes servir un map file concret',
    execCommentAzure: '# Azure Key Vault amb flags de la CLI',
    execCommentDocker:
      '# Docker Compose pot interpolar els secrets al compose.yaml',
    execPackageJsonDesc: 'O integra-ho als scripts del package.json:',
    execOutputTitle: 'Sortida',
    execOutputDesc:
      "L'stdout és de la teva comanda. Tota la sortida d'Envilder va a stderr, així que envilder exec -- node print.js > out.json només escriu a out.json la sortida de la teva comanda. Si tot va bé, Envilder mostra una sola línia de resum que només anomena el programa, perquè els arguments poden contenir secrets:",
    execUseCasesTitle: "Casos d'ús habituals",
    execUseCasesDesc:
      "En tots els casos els valors només existeixen a l'entorn de la teva comanda i dels processos que iniciï, Envilder no crea mai cap fitxer .env, i el codi de sortida de la teva comanda passa a ser el codi de sortida d'Envilder. El que la comanda faci després amb els valors depèn d'ella: Docker, per exemple, desa l'entorn d'un contenidor a les seves metadades al disc (visibles amb docker inspect) fins que s'elimina el contenidor.",
    execUcLocalstackTitle: "Arrenca LocalStack amb el seu token d'autenticació",
    execUcLocalstackDesc:
      "Quan et cal: LocalStack necessita LOCALSTACK_AUTH_TOKEN i no vols el token en un fitxer .env ni a l'historial de la shell.",
    execUcLocalstackComposeDesc:
      "Amb Docker Compose, fes referència a la variable al compose.yaml. Compose n'agafa el valor de l'entorn on s'executa, així que no cal cap fitxer .env:",
    execUcLocalstackDockerDesc:
      "Amb Docker sol, -e NOM sense valor copia la variable de l'entorn del client docker, així que el token no apareix mai a la línia d'ordres:",
    execUcLocalstackExamplesDesc:
      'Trobaràs la mateixa configuració amb Testcontainers (TypeScript, Python, .NET) i Aspire a',
    execUcTestsTitle: "Tests d'integració que arrenquen contenidors",
    execUcTestsDesc:
      "Quan et cal: els teus tests arrenquen contenidors (per exemple, amb Testcontainers) i llegeixen un token o unes credencials de l'entorn (process.env, os.environ, Environment.GetEnvironmentVariable) per passar-los-hi.",
    execUcTestsNote:
      "Si els tests fallen, se'n conserva el codi de sortida i la CI continua fallant. Si un secret no es pot resoldre, els tests no s'inicien i el codi de sortida és 125.",
    execUcMigrationsTitle: 'Migracions de base de dades i scripts puntuals',
    execUcMigrationsDesc:
      'Quan et cal: una eina de migracions o un script necessita DATABASE_URL una sola vegada, i no vols la cadena de connexió al disc. Fes servir --map per executar la mateixa comanda contra un altre entorn.',
    execUcTerraformTitle: 'Terraform i altres eines IaC',
    execUcTerraformDesc:
      "Quan et cal: una variable d'entrada de Terraform conté un secret. Terraform llegeix les variables d'entorn TF_VAR_<nom> com a valors de la variable d'entrada <nom>.",
    execUcTerraformNote:
      "Declara la variable amb sensitive = true perquè Terraform l'amagui a la sortida del plan. Terraform continua desant a l'estat els valors que escriu als recursos, així que protegeix l'estat com sempre.",
    execUcDevTitle:
      'Servidor de desenvolupament local amb scripts de package.json',
    execUcDevDesc:
      "Quan et cal: tothom a l'equip ha d'arrencar l'aplicació amb els mateixos secrets executant npm run dev.",
    execUcDevNote:
      "Afegeix envilder com a dependència de desenvolupament (npm install --save-dev envilder) perquè l'script el trobi a node_modules/.bin.",
    execUcGhaTitle: 'Un pas de GitHub Actions',
    execUcGhaDesc:
      "Quan et cal: un pas d'un workflow necessita els secrets, i només aquest pas. Configura les credencials d'AWS amb OIDC i executa la teva comanda amb npx envilder exec:",
    execUcGhaNote:
      "Els valors resolts es registren a l'emmascarament de logs de GitHub abans que s'iniciï la comanda, i els passos següents no els veuen.",
    execUcChainTitle: 'Diverses comandes amb els mateixos secrets',
    execUcChainDesc:
      'Quan et cal: vols encadenar comandes o continuar treballant en una shell que tingui els secrets.',
    execUcChainNote:
      "Posa tot l'script de sh -c entre cometes simples perquè la teva shell no executi el && fora d'envilder exec. L'exec davant de l'última comanda substitueix la shell per aquesta comanda, així que els senyals que reenvia Envilder arriben directament a npm start. A la shell interactiva, totes les comandes que executis veuen els secrets; escriu exit per sortir-ne.",
    execBehaviorTitle: 'Comportament',
    execExitTitle: 'Codis de sortida',
    execExitDesc:
      "Els codis de sortida segueixen els de GNU env i docker run, així pots distingir un error d'Envilder del codi de sortida de la teva comanda:",
    execThCode: 'Codi',
    execThMeaning: 'Significat',
    execThMessage: 'Missatge',
    execExitChild: 'La teva comanda ha acabat amb el codi n',
    execExitSignal:
      'La teva comanda ha estat aturada pel senyal n (per exemple, 137 per SIGKILL)',
    execExit125:
      "Envilder ha fallat abans d'iniciar la comanda: opcions incorrectes, comanda absent, cap map file, secrets no resolts o credencials caducades",
    execExit126:
      "La comanda existeix però el sistema operatiu n'ha impedit l'execució (per exemple, Permission denied)",
    execExit127: "No s'ha trobat la comanda",
    execExitNote: 'Els modes pull i push continuen sortint amb 1 quan fallen.',
    execFailClosedTitle: 'Fail-closed',
    execFailClosedDesc:
      "El mode pull avisa i se salta un secret que falta. El mode exec mai inicia la teva comanda amb un conjunt de secrets incomplet: si algun secret falta, és buit o no es pot llegir (per exemple, per accés denegat), la comanda no s'inicia, Envilder llista les variables afectades amb les rutes emmascarades i surt amb 125. Els valors es resolen una sola vegada, quan s'inicia la comanda.",
    execEnvTitle: 'Entorn',
    execEnvDesc:
      "La teva comanda hereta tot l'entorn de l'intèrpret que executa Envilder, més totes les variables del map file. Mana el map file: quan una variable heretada té el mateix nom que una de mapada, la comanda rep el valor del proveïdor, i Envilder mostra els noms (mai els valors) a stderr:",
    execNoShellDesc:
      "Envilder no inicia cap intèrpret d'ordres addicional: els arguments arriben a la teva comanda com una llista. Però la teva pròpia shell interpreta la línia abans, així que posa entre cometes el que no ha d'interpretar: '$DB_URL' o '&&' entre cometes simples arriben literalment a la comanda, mentre que un $DB_URL sense cometes s'expandeix amb el valor de la teva shell (no amb el secret resolt) i un && sense cometes executa una segona comanda fora d'envilder exec. Si necessites funcions de la shell amb els secrets, inicia'n una explícitament:",
    execGhaTitle: 'Emmascarament a GitHub Actions',
    execGhaDesc:
      "Quan GITHUB_ACTIONS=true, Envilder registra cada valor resolt a l'emmascarament de logs de GitHub (::add-mask::), de manera que els valors que imprimeixi la teva comanda surten emmascarats al log del job. Tots els registres s'escriuen a stderr abans que s'iniciï la comanda; si algun no es pot escriure, la comanda no s'inicia (codi de sortida 125). La GitHub Action d'Envilder no ofereix el mode exec: executa la CLI des d'un pas run.",
    execGhaNote:
      "No redirigeixis l'stderr d'envilder exec fora del log del pas (per exemple, amb 2> fitxer o 2>/dev/null): és d'allà d'on el runner llegeix les màscares. El runner llegeix stdout i stderr per canals separats, així que un valor que la teva comanda imprimeixi de seguida pot arribar al log, en casos rars, abans que se n'hagi processat la màscara.",
    execSignalsTitle: 'Senyals',
    execSignalsDesc:
      "stdin, stdout i stderr s'hereten i es conserva el TTY, així que els REPL, els intèrprets i les preguntes interactives funcionen com sempre. El Ctrl+C d'un terminal arriba directament a la teva comanda. SIGTERM i SIGHUP (per exemple, de docker stop o Kubernetes) es reenvien a la comanda, i Envilder espera que acabi, sense cap temps límit propi, abans de retornar-ne el codi de sortida. Els senyals només arriben al fill directe: un llançador com npm s'ha d'encarregar d'aturar els seus propis fills.",
    execSandboxTitle: 'No és un sandbox.',
    execSandboxDesc:
      "El mode exec no crea mai cap fitxer .env i no toca els que ja existeixen: si véns del mode pull, esborra tu mateix el teu .env antic. No aïlla el procés. La teva comanda i tots els processos que iniciï poden llegir els secrets del seu entorn, inclosa qualsevol eina o agent d'IA de programació que hi executi env o printenv. A Linux, altres processos del mateix usuari poden llegir /proc/<pid>/environ. Executa només comandes de confiança amb els secrets que mapes.",
    execGuideLink:
      "Guia completa de la comanda exec a GitHub: detalls de Windows, recuperació SSO i tots els missatges d'error",
    examplesTitle: 'Exemples executables.',
    execExamplesDesc:
      "Arrenca LocalStack amb envilder exec docker run, amb el token d'autenticació resolt des d'AWS SSM sense cap fitxer .env (Docker el desa a les metadades del contenidor fins que s'elimina), o segueix pas a pas push, pull i exec amb npx envilder:",
    pushTitle: 'Comanda push',
    pushDesc:
      "Puja variables d'entorn d'un fitxer .env local al teu proveïdor al núvol utilitzant un fitxer de mapeig.",
    pushOptions: 'Opcions',
    pushExamples: 'Exemples',
    pushOptPush: 'Activa el mode push (requerit)',
    pushOptEnv: 'Ruta al teu fitxer .env local (per defecte: .env)',
    pushOptMap:
      'Ruta al JSON de mapeig de paràmetres (per defecte: envilder.json)',
    pushOptProvider: 'aws (per defecte) o azure',
    pushOptVault: "URL d'Azure Key Vault",
    pushOptProfile: 'Perfil AWS CLI (només AWS)',
    pushCommentAws: '# Pujar a AWS SSM (per defecte envilder.json i .env)',
    pushCommentProfile: '# Amb perfil AWS',
    pushCommentAzureConfig: '# Azure via $config al fitxer de mapeig',
    pushCommentAzureFlags: '# Azure via flags CLI',
    pushSingleTitle: 'Pujar variable individual',
    pushSingleDesc:
      "Puja una variable d'entorn individual directament al teu proveïdor al núvol sense fer servir cap fitxer .env.",
    pushSingleOptions: 'Opcions',
    pushSingleOptPush:
      'Opcional: --key, --value i --secret-path ja activen el mode push',
    pushSingleOptKey: "Nom de la variable d'entorn",
    pushSingleOptValue: 'Valor a emmagatzemar',
    pushSingleOptPath: 'Ruta completa del secret al teu proveïdor al núvol',
    pushSingleOptMap:
      'Opcional: fitxer de mapeig del qual llegir $config (per defecte: envilder.json si existeix; mai requerit per a una pujada individual)',
    pushSingleOptProvider: 'aws (per defecte) o azure',
    pushSingleOptVault: "URL d'Azure Key Vault",
    pushSingleOptProfile: 'Perfil AWS CLI (només AWS)',
    ghaSetupTitle: "Com funciona l'Action",
    ghaSetupDesc:
      "L'Action és un pas compost: instal·la Node.js 22, llegeix el fitxer de mapeig, obté cada secret amb les credencials de núvol que ja té el job, emmascara cada valor al log i escriu el fitxer .env. No inicia sessió a AWS ni a Azure per si mateixa, així que ho ha de fer un pas anterior (aws-actions/configure-aws-credentials o azure/login). Utilitza l'etiqueta publicada macalbert/envilder/github-action@v0; no cal cap pas de compilació.",
    ghaPrerequisites: 'Prerequisits',
    ghaPrereqAws:
      "AWS: un rol IAM que GitHub pugui assumir, fet servir a través d'aws-actions/configure-aws-credentials.",
    ghaPrereqAzure:
      "Azure: un registre d'aplicació amb una credencial federada, fet servir a través d'azure/login.",
    ghaPrereqMap: 'Un envilder.json al teu repositori',
    ghaPullOnly: 'La GitHub Action només suporta el mode pull (sense push).',
    ghaBasicTitle: 'AWS SSM Parameter Store amb OIDC',
    ghaMultiEnvTitle: 'Workflow multi-entorn',
    ghaExecTitle: 'Executar una ordre sense escriure cap fitxer .env',
    ghaExecDesc:
      "L'acció sempre escriu un fitxer .env. Si prefereixes que els secrets no toquin el disc del runner, no facis servir l'acció i executa envilder exec en un pas run, després del mateix pas de credencials. Les opcions d'Envilder van abans de --, i la teva ordre, després. Envilder emmascara tots els valors resolts al log del job, i l'ordre no arrenca si falta algun secret.",
    ghaExecNote:
      "La CLI necessita Node.js 22.12 o posterior, així que configura'l amb actions/setup-node abans del pas. No redirigeixis l'stderr d'envilder exec fora del log del pas: és d'allà d'on GitHub llegeix les màscares.",
    ghaExecLink: "Llegeix la guia completa d'exec →",
    ghaAzureTitle: 'Azure Key Vault amb OIDC',
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
    ghaPrereqCheckout:
      "actions/checkout abans de l'Action, perquè el fitxer de mapeig existeixi al runner.",
    ghaPrereqPermissions:
      'El permís id-token: write, perquè el job pugui demanar un token OIDC, i contents: read.',
    ghaAwsTrustTitle: '1. Permet que GitHub assumeixi un rol IAM',
    ghaAwsTrustDesc:
      "Afegeix token.actions.githubusercontent.com com a proveïdor d'identitat OpenID Connect a IAM (audiència sts.amazonaws.com, un cop per compte) i crea un rol amb aquesta política de confiança. La condició sub el limita a un repositori i una branca; fes servir repo:my-org/my-repo:environment:production per limitar-lo a un entorn de GitHub.",
    ghaOidcSubjectNote:
      "A github.com, els repositoris creats, reanomenats o transferits a partir del 15 de juliol de 2026, i els que han activat els subjectes immutables, reben un sub que també inclou els ID del propietari i del repositori: repo:my-org@OWNER_ID/my-repo@REPO_ID:ref:refs/heads/main. La resta mantenen el format només amb noms que es mostra a dalt. Consulta la configuració OIDC del teu repositori per saber el prefix exacte i fes servir el mateix valor a la política de confiança d'AWS i a la credencial federada d'Azure.",
    ghaAwsPolicyTitle: '2. Permisos mínims',
    ghaAwsPolicyDesc:
      "L'Action crida ssm:GetParameter amb desxifratge, un cop per cada entrada del fitxer de mapeig. No llista, escriu ni esborra paràmetres, així que és l'únic permís que necessita el rol. Limita'l a la ruta de la teva aplicació:",
    ghaAwsKmsNote:
      'Els paràmetres SecureString xifrats amb la clau per defecte aws/ssm no necessiten res més. Si fan servir una clau KMS gestionada pel client, permet també kms:Decrypt sobre aquesta clau. El compte que surt al log ve de sts:GetCallerIdentity, que no necessita cap permís.',
    ghaWorkflowTitle: '3. Fitxer de mapeig i workflow',
    ghaAwsMapDesc:
      "El fitxer de mapeig és el mateix que fas servir amb la CLI: cada variable d'entorn apunta al nom d'un paràmetre.",
    ghaOutputTitle: 'Sortida esperada',
    ghaOutputDesc:
      "El log del pas mostra la identitat d'AWS que s'utilitza, cada variable resolta amb el valor emmascarat i un resum:",
    ghaOutputMaskNote:
      "Cada valor es registra també amb l'ordre add-mask de GitHub, de manera que un pas posterior que l'imprimeixi mostra ***. El fitxer .env es queda al runner; no el pugis com a artefacte.",
    ghaAzureFedTitle: '1. Crea una credencial federada',
    ghaAzureFedDesc:
      "Crea un registre d'aplicació i el seu service principal, i afegeix-hi una credencial federada que confiï en els tokens d'un repositori i una branca. No es crea cap secret de client. El subjecte fa servir el mateix format que el sub d'AWS, inclosa la variant immutable quan el teu repositori l'emet.",
    ghaAzureRoleTitle: '2. Rol mínim',
    ghaAzureRoleDesc:
      "Key Vault Secrets User permet llegir els valors dels secrets i res més. Assigna'l sobre el vault, no sobre el grup de recursos ni la subscripció:",
    ghaAzurePolicyNote:
      "Si el vault fa servir polítiques d'accés en lloc d'Azure RBAC, concedeix get sobre els secrets: az keyvault set-policy --name {VAULT} --spn {APP_ID} --secret-permissions get.",
    ghaAzureMapDesc:
      'Amb $config al fitxer de mapeig, el workflow no necessita els inputs provider ni vault-url. Els noms de Key Vault només admeten lletres, dígits i guions, així que Envilder converteix les rutes: /myapp/prod/stripe_key es llegeix com a myapp-prod-stripe-key (sense la barra inicial, barres i guions baixos convertits en guions, en minúscules).',
    ghaAzureInputsNote:
      "Els ID de client, tenant i subscripció identifiquen l'aplicació; no són credencials, així que n'hi ha prou amb variables del repositori. Si s'informen, els inputs provider i vault-url sobreescriuen el $config del fitxer de mapeig.",
    ghaMultiEnvDesc:
      "Tingues un fitxer de mapeig per entorn i tria'l des de l'input del workflow. Un job que defineix environment rep un token OIDC amb un sub acabat en :environment:<nom> en lloc de :ref:refs/heads/main, així que la política de confiança d'AWS (o la credencial federada d'Azure) de cada entorn ha de fer servir aquest subjecte: repo:my-org/my-repo:environment:production, o repo:my-org@OWNER_ID/my-repo@REPO_ID:environment:production si el teu repositori emet subjectes immutables. Després, cada entorn de GitHub pot tenir el seu ARN de rol i les seves regles de protecció.",
    ghaWhyTitle: 'Per què no copiar els secrets a GitHub Secrets',
    ghaWhyDesc:
      "Copiar els valors als secrets del repositori funciona fins que un valor canvia. A partir d'aquí n'hi ha dues còpies:",
    ghaWhyRotationLabel: 'Rotació:',
    ghaWhyRotation:
      "quan es rota un secret a SSM o Key Vault, cada repositori amb una còpia continua desplegant el valor antic fins que algú l'actualitza a mà.",
    ghaWhyAuditLabel: 'Divergència i auditoria:',
    ghaWhyAudit:
      "GitHub Secrets no es pot tornar a llegir, així que no pots comprovar si la còpia encara coincideix amb l'origen. Llegir del núvol queda registrat amb el rol o l'aplicació que ha fet cada petició: a CloudTrail a AWS, i als logs d'auditoria de Key Vault a Azure un cop activada la configuració de diagnòstic del vault.",
    ghaWhyKeysLabel: 'Claus de llarga durada:',
    ghaWhyKeys:
      "copiar secrets sol anar acompanyat d'una clau d'accés d'AWS o un secret de client d'Azure guardats també a GitHub. Amb OIDC el job rep un token de curta durada, i res del que hi ha guardat a GitHub funciona fora del workflow.",
    ghaWhyListLabel: 'Una sola llista:',
    ghaWhyList:
      'el fitxer de mapeig es versiona amb el codi, es revisa a les pull requests i és el mateix fitxer que fan servir els desenvolupadors en local amb la CLI.',
    ghaWhyWhenSecrets:
      "GitHub Secrets continua sent una bona opció per a valors que només existeixen per al pipeline, com un token d'un servei de desplegament extern.",
    ghaErrorsTitle: 'Errors habituals',
    ghaErrorsDesc:
      "Missatges tal com surten al log del pas i com resoldre'ls. Envilder emmascara la ruta del secret que mostra al costat de cada variable, excepte els tres últims caràcters. Els missatges que vénen d'AWS o d'Azure es mostren tal com arriben i poden incloure el nom complet del paràmetre o del recurs.",
    ghaErrMapTitle: 'No es pot llegir el fitxer de mapeig',
    ghaErrMapFix:
      "Falta el pas de checkout o s'executa després de l'Action, o map-file apunta a un lloc incorrecte. Les rutes són relatives a l'arrel del repositori.",
    ghaErrAssumeTitle: 'No es pot assumir el rol',
    ghaErrAssumeFix:
      "Aquest error ve d'aws-actions/configure-aws-credentials, abans que s'executi Envilder. Comprova que el workflow té id-token: write i que el sub de la política de confiança coincideix exactament amb el repositori, la branca o l'entorn, en el format de subjecte que fa servir el teu repositori (amb ID immutables o sense). Els jobs de tag, de pull_request i amb environment generen un sub diferent.",
    ghaErrNoCredsTitle: "Sense credencials d'AWS",
    ghaErrNoCredsFix:
      "Cap pas ha autenticat el job a AWS abans de l'Action. Afegeix aws-actions/configure-aws-credentials abans, al mateix job: les credencials no passen d'un job a un altre.",
    ghaErrDeniedTitle: 'Accés denegat a un paràmetre',
    ghaErrDeniedFix:
      "El rol és vàlid però la seva política no cobreix aquest paràmetre. Revisa la ruta de Resource i la regió de l'ARN, que ha de coincidir amb l'aws-region del pas de credencials.",
    ghaErrExpiredTitle: 'Credencials caducades',
    ghaErrExpiredFix:
      "La sessió del rol ha acabat abans que s'executés el pas (una hora per defecte). Executa Envilder just després del pas de credencials, o augmenta role-duration-seconds juntament amb la durada màxima de sessió del rol.",
    ghaErrNotFoundTitle: 'Paràmetre o secret inexistent',
    ghaErrNotFoundFix:
      "És un avís, no un error: el pas acaba bé, amb menys secrets al resum que al mapeig. En un fitxer .env nou la variable queda fora. Si el fitxer ja existia (al repositori, a la memòria cau o escrit per un pas anterior), es conserva el valor antic, així que esborra el fitxer abans de l'Action quan un valor obsolet no hagi de sobreviure. Revisa el nom, la regió i, a Azure, el nom convertit. Si un valor que falta ha d'aturar el desplegament, comprova'l en un pas posterior.",
    ghaErrVaultUrlTitle: "Falta l'URL del vault d'Azure",
    ghaErrVaultUrlFix:
      "Informa l'input vault-url o $config.vaultUrl al fitxer de mapeig. Ha de ser una URL https acabada en .vault.azure.net, o el domini equivalent d'un núvol sobirà.",
    ghaErrAzureDeniedTitle: 'Accés denegat a Azure Key Vault',
    ghaErrAzureDeniedFix:
      "azure/login ha funcionat però la identitat no té cap rol de pla de dades sobre el vault. Assigna Key Vault Secrets User sobre el vault i espera uns minuts, perquè les assignacions de rol triguen a propagar-se. Els vaults amb polítiques d'accés diuen en canvi que la identitat no té el permís get de secrets.",
    ghaErrProfileTitle: "Perfil d'AWS al fitxer de mapeig",
    ghaErrProfileFix:
      "Si envilder.json defineix $config.profile per a ús local, l'Action passa aquest perfil a l'SDK d'AWS. Els runners de GitHub no tenen perfils d'AWS, i amb un perfil definit l'SDK ignora les credencials de configure-aws-credentials. Treu el perfil del mapeig que fas servir a CI, o tingues un mapeig separat per a CI.",
    ghaRelatedTitle: 'Pàgines relacionades',
    ghaRelatedAws:
      "Configuració d'AWS SSM Parameter Store: credencials, permisos IAM i una comprovació ràpida",
    ghaRelatedAzure:
      "Configuració d'Azure Key Vault: RBAC o polítiques d'accés i una comprovació ràpida",
    ghaRelatedMap:
      'Referència del fitxer de mapeig: $config, proveïdors i rutes de secrets',
    ghaRelatedRepo: "Codi font i README de l'Action a GitHub",
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
    sdkDotnetExamplesDesc:
      'Projectes de proves xUnit amb Testcontainers i Aspire que resolen un fitxer de mapeig contra AWS SSM i Azure Key Vault (emulats amb LocalStack i Lowkey Vault) i passen els valors als contenidors, sense cap fitxer .env:',
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
    sdkPythonExamplesDesc:
      'Un projecte pytest amb Testcontainers que resol un fitxer de mapeig contra AWS SSM i Azure Key Vault (emulats amb LocalStack i Lowkey Vault) i passa els valors als contenidors, sense cap fitxer .env:',
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
    sdkNodejsExamplesDesc:
      "Un projecte Vitest amb Testcontainers i un AppHost d'Aspire en TypeScript que resolen un fitxer de mapeig contra AWS SSM i Azure Key Vault (emulats amb LocalStack i Lowkey Vault) i passen els valors als contenidors, sense cap fitxer .env:",
    pagerPrev: 'Anterior',
    pagerNext: 'Següent',
  },
};
