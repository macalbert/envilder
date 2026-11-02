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
    tabPushDesc: 'desa un secret i escriu envilder.json',
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
    setupComment1:
      '# Puja un secret a SSM. Envilder escriu el fitxer de mapeig',
    setupComment2: '# El mapeig ja està llest. El valor mai toca el fitxer',
    setupAzureComment1:
      '# Puja un secret a Azure Key Vault. Envilder escriu el fitxer de mapeig',
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
    openssfBadge: 'Insígnia d’OpenSSF Best Practices',
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
    title: 'Com ',
    titleAccent: 'funciona',
    subtitle: 'Mapeja un cop. Executa-ho a tot arreu.',
    stepLabel: 'PAS',
    steps: [
      {
        title: 'Mapeja cada variable un cop',
        description:
          "envilder.json llista els noms de les variables d'entorn i les rutes dels secrets, mai els valors. Quan puges un secret, Envilder hi afegeix l'entrada per tu, o el pots escriure a mà. Fes-ne commit i revisa'n els canvis en pull requests com qualsevol altre codi.",
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
          "Algunes eines esperen un fitxer .env, i pull n'escriu un a partir del mateix mapeig. Tracta'l com un secret. A GitHub Actions normalment no cal cap fitxer: l'Action exporta els secrets als passos posteriors del job.",
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
        a: 'Sí. La GitHub Action exporta els secrets mapejats als passos posteriors del job, executa una ordre amb ells o escriu un fitxer .env quan una eina el necessita. La CLI (exec o pull) funciona a qualsevol runner de CI amb credencials del núvol.',
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
    inputEnvDesc:
      'Opcional. Ruta a un fitxer .env per escriure, per a eines que necessiten un fitxer',
    inputProviderDesc: 'Proveïdor al núvol: aws o azure (per defecte: aws)',
    inputVaultDesc: "URL d'Azure Key Vault",
    inputCommandDesc:
      "Opcional. Ordre que s'executa amb els secrets només al seu entorn. No es pot combinar amb env-file",
    modesTitle: 'Tres maneres de fer servir els secrets',
    modeJobTitle: 'Entorn del job (per defecte)',
    modeJobDesc:
      "Només amb map-file, cada secret es converteix en una variable d'entorn per a tots els passos posteriors del job. No s'escriu cap fitxer .env; el runner guarda els valors al seu fitxer GITHUB_ENV, al seu directori temporal, fins que acaba el job.",
    modeCommandTitle: 'command',
    modeCommandDesc:
      "L'Action executa aquesta única ordre amb els secrets al seu entorn. Els passos posteriors no els veuen mai.",
    modeEnvFileTitle: 'env-file',
    modeEnvFileDesc:
      "Escriu un fitxer .env. Fes-lo servir només quan una eina no pot llegir els secrets de cap altra manera que d'un fitxer.",
    output: 'Output:',
    outputDesc:
      'Ruta al fitxer .env generat (buida si no es defineix env-file)',
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
      'credencials AWS amb ssm:GetParameter; afegeix ssm:PutParameter per pujar secrets',
    prereqAzureNote:
      'credencials Azure amb accés Get a secrets; afegeix accés Set per pujar secrets',
    install: 'Instal·lar',
    quickStart: 'Inici ràpid',
    step1:
      'Puja un secret amb npx envilder --key --value --secret-path: Envilder escriu envilder.json per tu',
    step2:
      "Executa npx envilder exec -- seguit de l'ordre habitual d'arrencada",
    step3: 'La teva app arrenca amb els seus secrets ✔',
    terminalTitle: 'Inici ràpid',
    commentCreate: '# Puja un secret. Envilder escriu envilder.json',
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
    gettingStartedGuide: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      overviewTitle: 'Què faràs',
      overviewSteps: [
        "Instal·lar la CLI d'envilder.",
        "Pujar un secret de prova a AWS SSM Parameter Store o a Azure Key Vault amb envilder, que també escriu l'envilder.json.",
        "Revisar l'envilder.json que ha creat: associa un nom de variable al secret, mai al valor.",
        'Arrencar una petita app de Node.js amb envilder exec i comprovar que rep el valor.',
      ],
      prereqTitle: 'Requisits previs',
      prereqNode: 'Node.js 22.12 o posterior.',
      prereqAws:
        "l'AWS CLI amb credencials que funcionin (aws configure, o aws sso login per a perfils SSO) i una identitat amb permís per cridar ssm:GetParameter sobre els paràmetres que mapegis. Si un paràmetre SecureString està xifrat amb una clau KMS gestionada pel client, la identitat també necessita kms:Decrypt sobre aquesta clau.",
      prereqAwsLink: "Configuració d'AWS SSM",
      prereqAzure:
        "un Key Vault existent, l'Azure CLI amb la sessió iniciada amb az login i el rol Key Vault Secrets User sobre el vault (o una política d'accés amb Get sobre secrets). Envilder s'autentica amb DefaultAzureCredential, de manera que una identitat administrada o credencials en variables d'entorn també funcionen.",
      prereqAzureLink: "Configuració d'Azure Key Vault",
      prereqWrite:
        "El pas 2 crea un secret, cosa que requereix permís d'escriptura (ssm:PutParameter, o Key Vault Secrets Officer). Si el secret ja existeix, salta'l i escriu l'envilder.json a mà tal com es mostra al pas 3.",
      installTitle: '1. Instal·la la CLI',
      installDesc:
        "Instal·la envilder de manera global. Si prefereixes no instal·lar-lo, posa npx davant de cada ordre d'aquesta guia.",
      installVerify: "Comprova que l'ordre és al PATH. Mostra la versió:",
      secretTitle: '2. Puja un secret de prova',
      secretDesc:
        "Tria el teu proveïdor. Una sola ordre d'envilder desa el secret al vault i registra l'associació a l'envilder.json, així que aquest pas no necessita ni l'AWS CLI ni l'Azure CLI. La guia fa servir un sol secret: la contrasenya de la base de dades d'un entorn de desenvolupament. El valor queda a l'historial de la terminal; per a secrets reals, fes el push des d'un fitxer .env amb el mode push.",
      secretAwsNote:
        "A AWS, --provider=aws i --profile són opcionals: aws és el proveïdor per defecte i, sense --profile, Envilder fa servir la cadena de credencials per defecte d'AWS. El perfil és una elecció local i no s'escriu a l'envilder.json.",
      secretAzureNote:
        'Els noms de Key Vault només admeten lletres, dígits i guions. Envilder converteix les barres en guions i elimina la barra inicial abans de cridar Azure, així que "/my-app/dev/db-password" resoldria el mateix secret. Tota la resta s\'envia tal com està escrit.',
      mapTitle: "3. Revisa l'envilder.json",
      mapDesc:
        "El push ha creat l'envilder.json al directori actual, o hi ha afegit l'entrada si el fitxer ja existia. Cada clau és el nom de variable que llegeix la teva app i cada valor és l'identificador del secret al teu vault. Per a Azure també hi ha escrit $config amb provider i vaultUrl; AWS no necessita $config.",
      mapNote:
        "El fitxer conté camins de secrets, mai valors, així que desa'l al repositori amb el codi. Els editors validen l'envilder.json a través de SchemaStore sense línia $schema. Per pujar un secret sense tocar el fitxer de mapatge, afegeix --no-map-update.",
      runTitle: '4. Executa la teva app amb envilder exec',
      runDesc:
        "Crea un petit script que llegeixi la variable i arrenca'l a través d'Envilder. Tot el que va després de -- és la teva ordre, que es passa tal qual, sense shell.",
      runOutput:
        'Sortida esperada. La primera línia és Envilder a stderr; la segona, la teva app a stdout:',
      runExplain:
        "Envilder resol tots els secrets mapejats i després arrenca l'ordre amb aquests valors afegits al seu entorn. No escriu res al disc. Si algun secret falta, és buit o no es pot llegir, l'ordre no arrenca i envilder acaba amb el codi 125; si no, acaba amb el codi de la teva ordre.",
      runScriptDesc:
        "Perquè aquesta sigui la manera habitual d'arrencar el projecte, posa-ho en un script del package.json i continua fent servir npm run dev:",
      pullTitle: 'Alternativa: escriure un fitxer .env',
      pullDesc:
        "Algunes eines només llegeixen un fitxer, com l'env_file de Docker Compose o una configuració d'execució de l'IDE. En aquests casos, baixa els secrets a un fitxer .env. Sense opcions, envilder llegeix l'envilder.json i escriu .env al directori actual:",
      pullOutput: 'Sortida esperada amb AWS, seguida del fitxer que escriu:',
      pullWarn:
        "El fitxer .env conté els valors reals dels secrets: afegeix-lo al .gitignore i esborra'l quan ja no el necessitis. A diferència d'exec, pull omet amb un avís un secret que no existeix i escriu igualment els altres.",
      errorsTitle: 'Errors habituals en la primera execució',
      errorsIntro:
        'Cada bloc mostra el text que imprimeix envilder. Amb exec, tots acaben amb el codi 125 i la teva ordre no arriba a arrencar.',
      errNoMapTitle: 'No es troba el fitxer de mapatge',
      errNoMapFix:
        "envilder busca l'envilder.json al directori actual. Executa'l des de l'arrel del projecte o passa --map=camí/a/envilder.json.",
      errCredsTitle: "Sense credencials d'AWS",
      errCredsFix:
        'L\'SDK d\'AWS no ha trobat credencials. Executa aws configure, o aws sso login per a un perfil SSO. Per fer servir un perfil amb nom, passa --profile=nom o defineix "profile" a $config.',
      errDeniedTitle: 'Accés denegat per AWS',
      errDeniedFix:
        "Les credencials funcionen, però la identitat no pot llegir aquest paràmetre. Permet ssm:GetParameter sobre l'ARN del paràmetre, i kms:Decrypt si el paràmetre fa servir una clau gestionada pel client.",
      errNotFoundTitle: 'Secret no trobat',
      errNotFoundFix:
        "L'identificador o la regió no són correctes. A AWS, Envilder pren la regió d'AWS_REGION, després d'AWS_DEFAULT_REGION, després del perfil, i com a últim recurs fa servir us-east-1. Compara-ho amb aws ssm get-parameter --name /my-app/dev/db-password amb el mateix perfil. A Azure, revisa el nom del secret al vault.",
      errVaultTitle: 'Azure sense URL del vault',
      errVaultFix:
        'Afegeix "vaultUrl": "https://<nom-del-vault>.vault.azure.net" a $config, o passa --vault-url.',
      errOrderTitle: "Opcions abans d'exec",
      errOrderFix:
        "Les opcions escrites abans d'exec es rebutgen en lloc d'ignorar-se. Mou-les darrere d'exec, com indica el missatge.",
      errEnvfileTitle: '--envfile amb exec',
      errEnvfileFix:
        'exec mai escriu cap fitxer. Treu --envfile, o fes servir pull (envilder --envfile=.env) quan necessitis el fitxer.',
      nextTitle: 'Següents passos',
      nextMap:
        'Referència del fitxer de mapatge: $config, perfils, regles de validació i diversos entorns',
      nextExec: 'envilder exec: codis de sortida, senyals i ús a CI',
      nextPull: 'Mode pull: totes les opcions per generar fitxers .env',
    },
    mapFileReference: {
      prereqTitle: 'Requisits previs',
      prereqDesc:
        "Aquesta pàgina descriu el fitxer de mapatge tal com el llegeixen la CLI d'envilder (0.16) i la GitHub Action. Els SDK de runtime llegeixen el mateix fitxer. Si encara no has resolt cap secret, comença per la guia d'inici.",
      structureTitle: 'Estructura',
      structureDesc:
        "Un fitxer de mapatge és un únic objecte JSON. Les claus que comencen per $ estan reservades; qualsevol altra clau declara una variable d'entorn i el seu valor és l'identificador del secret que l'omple.",
      thKey: 'Clau',
      thMeaning: 'Significat',
      keySchema:
        'URL opcional del JSON Schema. Els editors la fan servir per autocompletar i validar; envilder la ignora.',
      keyConfig:
        'Objecte opcional que selecciona el proveïdor i la seva configuració. Consulta els camps més avall.',
      keyOtherDollar:
        "envilder omet qualsevol altra clau que comenci per $. L'schema la rebutja, així que no la facis servir per a metadades.",
      keyVariable:
        'Nom de variable (clau) i identificador del secret (valor de tipus string). El valor és opac: el seu format depèn del proveïdor.',
      configTitle: 'Camps de $config',
      configDesc:
        "Tots els camps són opcionals. Un fitxer sense $config fa servir AWS SSM amb la cadena de credencials per defecte d'AWS.",
      thField: 'Camp',
      thValues: 'Valors',
      thDefault: 'Per defecte',
      thBehaviour: 'Comportament',
      fieldProvider:
        "Backend de secrets. No distingeix majúscules de minúscules. Qualsevol valor diferent d'aws o azure atura l'execució.",
      valueProfileName: "Nom de perfil de l'AWS CLI",
      defaultProfile: "Cadena per defecte d'AWS",
      fieldProfile:
        "Perfil amb nom de ~/.aws/config o ~/.aws/credentials. Només AWS: amb azure s'ignora i es mostra un avís.",
      fieldVaultUrl:
        'URL del Key Vault, per exemple https://my-vault.vault.azure.net. Obligatòria per a azure. aws la ignora.',
      configSdkNote:
        "Els SDK de runtime llegeixen els mateixos camps, però poden rebutjar combinacions de les quals la CLI només avisa, com profile amb azure. Cada pàgina d'SDK llista els seus propis errors.",
      providersTitle: 'Identificadors de secrets per proveïdor',
      awsTitle: 'AWS SSM Parameter Store',
      awsDesc:
        "El valor és el nom del paràmetre tal com està desat a SSM, normalment un camí jeràrquic. Envilder crida GetParameter amb desxifratge, així que funcionen tant els paràmetres String com els SecureString. La regió surt d'AWS_REGION, després d'AWS_DEFAULT_REGION, després del perfil, amb us-east-1 com a últim recurs.",
      azureTitle: 'Azure Key Vault',
      azureDesc:
        "El valor és el nom del secret. Envilder converteix les barres en guions abans de cridar Key Vault, així que pots compartir el mateix estil de camins amb un fitxer d'AWS:",
      azureRules: [
        'S\'eliminen les barres inicials i la resta de barres passen a ser guions: "/my-app/prod/stripe-api-key" llegeix my-app-prod-stripe-api-key. El CLI, la GitHub Action i tots els SDKs apliquen la mateixa regla.',
        "Tota la resta s'envia tal com està escrit. Un nom que Key Vault rebutgi (per exemple amb _ o .) falla amb l'error del mateix Key Vault.",
        'Al CLI i a la GitHub Action, dos valors diferents que resolen al mateix nom dins un fitxer són un error.',
        'Envilder sempre llegeix la versió més recent del secret.',
      ],
      priorityTitle: 'Precedència entre $config i les opcions',
      priorityDesc:
        'Cada paràmetre es resol per separat, a partir de la primera font que el defineix:',
      priority1:
        'Opcions de la CLI (--provider, --vault-url, --profile) o inputs de la GitHub Action',
      priority2: '$config al fitxer de mapatge',
      priority3:
        "Valors per defecte: provider aws, cadena de credencials per defecte d'AWS",
      priorityExplain:
        "Una opció només substitueix el camp que anomena; la resta de camps de $config continuen aplicant-se. Les mateixes regles valen per a pull, push i exec. Si s'omet --map, envilder fa servir l'envilder.json del directori actual; pull i push també fan servir .env com a valor per defecte de --envfile.",
      priorityGhaNote:
        "La GitHub Action accepta els inputs provider i vault-url, però no té input de perfil: a CI les credencials venen del workflow (per exemple, OIDC), no d'un perfil amb nom.",
      validationTitle: 'Regles de validació',
      validationDesc:
        'envilder comprova el fitxer abans de contactar cap proveïdor, de manera que un fitxer no vàlid mai resol només una part dels seus secrets:',
      validationRules: [
        "El fitxer ha de ser JSON vàlid. No s'hi permeten comentaris ni comes finals.",
        'Els noms de variable han de complir ^[A-Za-z0-9_./-]+$: lletres, dígits, guió baix, punt, guió i barra. Són els noms que un fitxer .env pot desar i tornar a llegir sense canvis. Es rebutgen espais, =, #, lletres accentuades i salts de línia.',
        'Un nom amb / (Database/Password) funciona a tot arreu: els SDKs i exec el passen tal qual, i el SDK de .NET el converteix en una secció de configuració. En escriure un fitxer .env, el CLI el manté i avisa, perquè python-dotenv carrega aquesta línia però dotenv per a Node.js, Docker Compose i bash no; fes servir exec o un nom amb __ (Database__Password) si la teva aplicació llegeix el fitxer amb un d’aquests.',
        'Es rebutja un nom buit.',
        "__proto__ no es pot fer servir com a nom de variable: l'schema el rebutja i envilder mai el resol, perquè els parsers de .env no el poden tornar a llegir.",
        "La regla de noms s'aplica a totes les claus, encara que el valor no sigui un string. Una clau amb un valor que no és string (número, objecte, null) s'omet i no es resol.",
        'Amb exec a Windows es rebutgen dos noms que només es diferencien en majúscules i minúscules, perquè Windows els tracta com una única variable.',
        "L'schema recomana noms POSIX (^[a-zA-Z_][a-zA-Z0-9_]*$). Els noms amb punts i guions s'accepten, però algunes shells i eines no els poden llegir com a variables.",
      ],
      multiEnvTitle: 'Exemple amb diversos entorns',
      multiEnvDesc:
        "Mantén un fitxer per entorn amb les mateixes claus, així el codi de l'aplicació no canvia mai. Només canvien els camins i el perfil:",
      multiEnvRun:
        "Tria el fitxer amb --map. En local, executa l'app amb el fitxer de desenvolupament; per a un artefacte de producció, genera un .env a partir del fitxer de producció:",
      multiEnvGha: "En un workflow, apunta l'action al fitxer d'aquell entorn:",
      multiEnvNaming:
        "SchemaStore reconeix els noms envilder.json i envilder.*.json, així que la majoria d'editors els validen fins i tot sense la línia $schema.",
      errorsTitle: 'Errors habituals',
      thMessage: 'Missatge',
      thFix: 'Solució',
      errInvalidNameFix:
        'Canvia el nom de la clau perquè només faci servir lletres, dígits, guió baix, punt, guió i barra.',
      errInvalidJsonFix:
        'Corregeix la sintaxi JSON: una coma final, un comentari o unes cometes que falten solen ser la causa.',
      errProviderFix:
        'Fes servir aws o azure a $config.provider o a --provider.',
      errVaultMissingFix:
        'Defineix $config.vaultUrl, o passa --vault-url, quan el proveïdor sigui azure.',
      errProfileAzureFix:
        'És un avís, no un error. Treu profile de $config, o no passis --profile, quan facis servir azure.',
      errCaseFix:
        "Canvia el nom d'una de les claus; exec a Windows rebutja noms que només es diferencien en majúscules i minúscules.",
      relatedTitle: 'Guies relacionades',
      relatedStart: "Primers passos: d'un secret a una app en marxa",
      relatedExec: "Referència d'envilder exec",
      relatedAzure: "Configuració d'Azure Key Vault",
    },
    pullReference: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      prereqTitle: 'Requisits previs',
      prereqItems: [
        "La CLI d'envilder. Aquesta pàgina descriu la versió 0.17.",
        'Un fitxer de mapatge, envilder.json per defecte, que associa cada variable a un identificador de secret.',
        'Accés de lectura a tots els secrets mapats: ssm:GetParameter a AWS (més kms:Decrypt quan un paràmetre fa servir una clau gestionada pel client), o el permís Get de secrets a Azure Key Vault, per exemple amb el rol Key Vault Secrets User.',
        "Credencials que l'SDK del proveïdor pugui trobar: un perfil AWS, una sessió SSO o variables d'entorn, o un inici de sessió d'Azure com az login o una identitat gestionada.",
      ],
      synopsisTitle: 'Sinopsi',
      synopsisDesc:
        'Pull és el mode per defecte: no hi ha cap subcomanda pull. Executa envilder sense opcions per llegir envilder.json i escriure .env al directori actual. Afegir --push, o --key, --value i --secret-path, canvia al mode push, i envilder exec és una subcomanda a part.',
      optionsTitle: 'Opcions',
      thOption: 'Opció',
      thDefault: 'Per defecte',
      thDescription: 'Descripció',
      optMapDefault: 'envilder.json al directori actual',
      optMap:
        "Fitxer de mapatge que es llegeix. L'execució s'atura si el fitxer no existeix o el valor és buit.",
      optEnvfile:
        "Fitxer que s'escriu. Es crea si no existeix i s'actualitza al seu lloc si existeix. El seu directori ha d'existir.",
      optProviderDefault: '$config.provider i, si no, aws',
      optProvider:
        "aws o azure, en majúscules o minúscules. Qualsevol altre valor atura l'execució abans de llegir cap secret.",
      optVault:
        'URL de Key Vault, per exemple https://my-vault.vault.azure.net. Obligatòria amb azure.',
      optProfileDefault:
        "$config.profile i, si no, la cadena de credencials per defecte d'AWS",
      optProfile:
        "Perfil d'AWS amb nom. Amb azure s'ignora i es mostra un avís.",
      optionsNote:
        "Una opció que rep una ruta o un nom no accepta mai un valor que comenci per -. A envilder --map --envfile=.env, --map no té valor, així que l'execució s'atura amb error: option '--map <path>' argument missing en lloc de llegir --envfile=.env com a ruta. envilder --help llista totes les opcions.",
      configTitle: 'Com es combinen $config i les opcions',
      configDesc:
        "Cada paràmetre surt de la primera font que el defineix: l'opció, després $config al fitxer de mapatge i després el valor per defecte. Una opció substitueix només el camp que anomena, així que la resta de camps de $config continuen aplicant-se. Pren aquest fitxer de producció:",
      configRun:
        'La primera comanda fa servir la configuració del fitxer. La segona en substitueix un camp i manté la resta:',
      configAwsNote:
        'La segona comanda llegeix els mateixos paràmetres amb el perfil ci-readonly. El proveïdor continua sortint de $config.',
      configAzureNote:
        "La segona comanda llegeix els mateixos noms de secret d'un altre vault. El proveïdor continua sortint de $config.",
      configLink:
        'Regles de precedència completes a la referència del fitxer de mapatge',
      exampleTitle: 'Exemple: actualitzar un .env existent',
      exampleDesc:
        'El fitxer de mapatge declara quatre variables. Al vault, SENTRY_DSN no existeix i FEATURE_FLAG és buit. El projecte ja té un fitxer .env:',
      exampleRun:
        "Executa envilder des de l'arrel del projecte. Sortida esperada amb AWS:",
      exampleOutputNote:
        "Amb Azure no es mostra la línia d'identitat d'AWS; la resta és igual. Els valors van emmascarats: un de més de 10 caràcters mostra els 3 últims, un de més curt s'amaga sencer, i les rutes mostren els 3 últims caràcters. Les línies omeses són avisos a stderr; la resta va a stdout.",
      exampleResult: 'El fitxer .env després:',
      envTitle: "Com s'actualitza un .env existent",
      envRules: [
        'Una variable mapada que ja és al fitxer es substitueix al seu lloc: la mateixa línia, el mateix comentari en línia i les mateixes cometes quan encara representen el valor nou.',
        'Una línia que ja té el valor correcte no es reescriu, així que una execució sense res de nou deixa el fitxer idèntic byte a byte.',
        "Es conserven les línies que el fitxer de mapatge no declara (LOG_LEVEL a l'exemple), els comentaris, les línies en blanc, l'ordre i els salts de línia.",
        "Les variables que encara no són al fitxer s'afegeixen al final. Un fitxer nou acaba amb un salt de línia.",
        "Un secret omès conserva el valor que el fitxer ja tenia (SENTRY_DSN a l'exemple). Envilder no elimina mai cap línia.",
        "Abans d'escriure, Envilder torna a llegir el resultat com ho fa dotenv. Si es perdés o canviés algun valor, no escriu res i s'atura amb un error que anomena les variables, mai els valors.",
      ],
      envNote:
        "Les cometes, els valors multilínia i l'únic valor que un fitxer .env no pot contenir es descriuen a",
      envNoteLink: 'què pot contenir un secret',
      envWarn:
        "El fitxer .env conté els valors reals dels secrets. Afegeix-lo a .gitignore i esborra'l quan ja no el necessitis, o fes servir envilder exec per evitar el fitxer.",
      missingTitle: 'Secrets que falten, buits o que fallen',
      missingDesc:
        "Un secret que no existeix (ParameterNotFound a AWS SSM, 404 a Key Vault) o que té el valor buit s'omet amb un avís. Els altres secrets s'escriuen igualment, el resum compta només els resolts (2/4 a l'exemple) i el codi de sortida és 0.",
      failDesc:
        "Qualsevol altra fallada, com un accés denegat, credencials que falten o un error de xarxa, atura l'execució. Envilder llista cada variable afectada amb la ruta emmascarada i el motiu, no toca el fitxer .env i surt amb 1:",
      ssoDesc:
        "Quan una sessió SSO d'AWS ha caducat i stdin i stdout són un terminal, Envilder pregunta Run 'aws sso login --profile dev' now? [y/N]. Si acceptes i l'inici de sessió funciona, ho torna a provar una vegada. A la CI, o si ho rebutges, mostra la comanda que cal executar i surt amb 1. Si un secret que falta també ha d'aturar l'execució, fes servir envilder exec: mai inicia una comanda amb un conjunt de secrets incomplet.",
      errorsTitle: 'Errors habituals',
      thMessage: 'Missatge',
      thFix: 'Solució',
      errNoMapFix:
        'Executa envilder des del directori que conté envilder.json, o passa --map=ruta/al/fitxer.json.',
      errReadMapFix:
        'El fitxer indicat amb --map no existeix o no es pot llegir. Les rutes relatives parteixen del directori actual.',
      errJsonFix:
        "Corregeix la sintaxi JSON del fitxer de mapatge. Una coma final o un comentari n'és la causa habitual.",
      errCredsFix:
        "L'SDK d'AWS no ha trobat credencials. Executa aws configure o aws sso login, o passa --profile amb un perfil configurat.",
      errDeniedFix:
        'Les credencials funcionen però no poden llegir aquest paràmetre. Permet ssm:GetParameter sobre el seu ARN, més kms:Decrypt per a una clau gestionada pel client.',
      errVaultFix:
        'Afegeix "vaultUrl": "https://<nom-del-vault>.vault.azure.net" a $config, o passa --vault-url.',
      errSsoFix:
        "Executa aws sso login --profile dev i torna a executar envilder. En un terminal, Envilder s'ofereix a fer l'inici de sessió per tu.",
      errRepresentFix:
        "El valor no es pot escriure en un fitxer .env sense canviar-lo, i no s'ha escrit res. Llegeix aquest secret amb envilder exec o un SDK, o desa'l codificat (per exemple en base64).",
      relatedTitle: 'Pàgines relacionades',
      relatedMap:
        'Referència del fitxer de mapatge: camps de $config, regles de validació i precedència de les opcions',
      relatedExec:
        'envilder exec: executa una comanda amb els mateixos secrets i sense fitxer .env',
      relatedPush: 'Mode push: puja un fitxer .env o un sol secret',
    },
    pushReference: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      prereqTitle: 'Requisits previs',
      prereqItems: [
        "La CLI d'envilder. Aquesta pàgina descriu la versió 0.17; el push d'un sol secret registra el mapatge des de la 0.16.",
        "Accés d'escriptura al destí: ssm:PutParameter a AWS, o el permís Set de secrets a Azure Key Vault, per exemple amb el rol Key Vault Secrets Officer.",
        "Per a --push, un fitxer de mapatge i un fitxer .env amb els valors. El push d'un sol secret no necessita cap dels dos: crea el fitxer de mapatge si no existeix.",
      ],
      synopsisTitle: 'Sinopsi',
      synopsisDesc:
        "Push té dues formes. --push puja valors d'un fitxer .env. --key, --value i --secret-path junts pugen un sol secret; amb ells, --push és opcional. No hi ha cap subcomanda push. --ssm-path és un àlies obsolet de --secret-path i mostra un avís.",
      thOption: 'Opció',
      thDefault: 'Per defecte',
      thDescription: 'Descripció',
      envTitle: 'Pujar un fitxer .env',
      envDesc:
        "Per a cada variable que declara el fitxer de mapatge, Envilder llegeix el seu valor del fitxer .env i l'escriu a la ruta mapada. Les variables del fitxer .env que el fitxer de mapatge no declara s'ignoren.",
      optPush: 'Selecciona el mode push. Obligatòria en aquesta forma.',
      optEnvfile: "Fitxer d'on es llegeixen els valors.",
      optMap:
        'Fitxer de mapatge amb les variables que es pugen i les seves rutes.',
      optShared:
        'Igual que al mode pull: cada opció substitueix un camp de $config, i el proveïdor per defecte és aws.',
      envExample:
        "Amb aquest fitxer de mapatge i aquest .env, envilder --push escriu dos secrets i ignora LOG_LEVEL. Sortida esperada amb AWS (Azure mostra les mateixes línies sense la d'identitat):",
      envRules: [
        "Una variable mapada que no és al fitxer .env s'omet amb un avís. Que el fitxer .env no existeixi tampoc és un error: s'ometen totes les variables i l'execució surt amb 0.",
        "Diverses variables poden apuntar a la mateixa ruta només si tenen el mateix valor. Si no, Envilder s'atura abans d'escriure res.",
        "Els secrets s'escriuen en paral·lel. Els errors de limitació (throttling) es reintenten fins a 5 vegades amb espera creixent. Qualsevol altre error atura l'execució amb codi 1, i els secrets ja escrits es queden escrits.",
      ],
      singleTitle: 'Pujar un sol secret',
      singleDesc:
        'Passa el nom de la variable, el valor i la ruta del secret. Envilder escriu el secret i registra "NOM": "<ruta>" al fitxer de mapatge, perquè el següent envilder o envilder exec el resolgui. El valor no s\'escriu mai al fitxer de mapatge.',
      optKey:
        'Nom de la variable, que es registra com a clau al fitxer de mapatge.',
      optValue: 'Valor que es desa. No pot ser buit.',
      optSecretPath:
        "Nom del paràmetre a AWS SSM, o la referència del secret per a Key Vault. Es registra tal com s'escriu.",
      optMapSingle:
        "Fitxer de mapatge que registra el mapatge i aporta $config. Es crea si no existeix; el seu directori ha d'existir.",
      optNoMapUpdate:
        'Puja sense llegir, crear ni actualitzar cap fitxer de mapatge. El proveïdor i el vault surten només de les opcions.',
      singleExample:
        'En un directori sense fitxer de mapatge, puja un secret. La comanda, la sortida esperada i el fitxer de mapatge que crea:',
      singleAwsNote:
        "aws és el proveïdor per defecte, així que no s'escriu $config. Tampoc s'escriu mai --profile: el perfil és una tria local de credencials.",
      singleAzureNote:
        'Per a Azure el fitxer nou registra $config amb provider i vaultUrl, així que les execucions següents no necessiten opcions. Al vault, el secret es diu my-app-dev-api-key.',
      mapRulesTitle: "Com s'actualitza el fitxer de mapatge",
      mapRules: [
        'Sense fitxer: Envilder el crea. Un fitxer anomenat envilder.json o envilder.*.json no rep la línia $schema, perquè els editors ja el reconeixen via SchemaStore; qualsevol altre nom la rep.',
        "La variable no és al fitxer: s'hi afegeix l'entrada, mantenint el sagnat i els salts de línia del fitxer (✓ Added API_KEY to envilder.json).",
        'La variable ja apunta a la mateixa ruta: el fitxer no es toca (✓ API_KEY already mapped in envilder.json, no changes).',
        'La variable apunta a una altra ruta: no es puja res i Envilder surt amb 1.',
        'El fitxer apunta a un altre proveïdor o vault que el push: el secret es puja, el fitxer es queda com està i un avís anomena els dos destins.',
        "El fitxer de mapatge s'escriu abans que el secret. Si el push falla, Envilder restaura el fitxer anterior, o esborra el que ha creat, de manera que el fitxer mai llista un secret que no s'ha pujat.",
      ],
      historyTitle: "--value acaba a l'historial del shell.",
      historyDesc:
        "És un argument de la línia de comandes: el shell el desa, i és visible a la llista de processos mentre la comanda s'executa. Fes-lo servir per a valors de prova. Per a secrets reals, puja des d'un fitxer .env amb --push i esborra el fitxer després.",
      storeTitle: 'Com es desen els valors',
      storeAws:
        "Cada valor s'escriu amb PutParameter com a SecureString, amb la sobreescriptura activada: es crea un paràmetre nou o l'existent rep una versió nova. Envilder no passa cap clau KMS, així que SSM fa servir la clau per defecte del compte.",
      storeAzure:
        "Cada valor s'escriu amb Set Secret, que crea el secret o hi afegeix una versió nova. El nom del secret és la ruta sense les barres inicials i amb la resta de barres convertides en guions: /my-app/dev/api-key passa a ser my-app-dev-api-key. No canvia res més, així que un nom que Key Vault no accepta, per exemple un amb _ o ., falla amb l'error propi de Key Vault. Dues referències que donen el mateix nom en una mateixa execució són un error.",
      errorsTitle: 'Errors habituals',
      thMessage: 'Missatge',
      thFix: 'Solució',
      errPartialFix:
        'Passa les tres opcions amb un valor no buit, o fes servir --push per pujar un fitxer .env.',
      errConflictFix:
        'Fes servir la ruta que el fitxer de mapatge ja registra, edita el fitxer a mà, o afegeix --no-map-update.',
      errTargetFix:
        "És un avís: el secret s'ha pujat però no s'ha registrat. Passa --map amb un fitxer de mapatge per a aquest destí, o fes coincidir --provider i --vault-url amb el fitxer.",
      errValuesFix:
        "Dona el mateix valor a les dues variables al fitxer .env, o mapa-les a rutes diferents. No s'ha pujat res.",
      errMissingVarFix:
        'És un avís: afegeix la variable al fitxer .env, o passa --envfile amb el fitxer correcte.',
      errMapDirFix:
        "Crea el directori, o passa una ruta --map dins d'un que existeixi. No s'ha pujat res.",
      errCollisionFix:
        'Fes servir una sola referència per secret de Key Vault al fitxer de mapatge.',
      errDeniedFix:
        'Les credencials funcionen però no poden escriure aquest paràmetre. Permet ssm:PutParameter sobre el seu ARN.',
      errVaultFix:
        'Amb --no-map-update no es llegeix cap fitxer de mapatge: passa --provider=azure juntament amb --vault-url.',
      relatedTitle: 'Pàgines relacionades',
      relatedMap:
        'Referència del fitxer de mapatge: camps de $config i regles de validació',
      relatedPull: 'Mode pull: escriu els secrets pujats a un fitxer .env',
      relatedAzure:
        "Configuració d'Azure Key Vault: rols i polítiques d'accés per llegir i escriure secrets",
    },
    execReference: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      prereqTitle: 'Requisits previs',
      prereqItems: [
        "La CLI d'envilder. Aquesta pàgina descriu la versió 0.17.",
        'Un fitxer de mapatge i accés de lectura a tots els secrets mapats, igual que al mode pull.',
        'La comanda que vols executar, al PATH o indicada amb la seva ruta.',
      ],
      synopsisTitle: 'Sinopsi',
      separatorTitle: 'On comença la teva comanda: la regla del --',
      separatorDesc:
        "Les opcions d'Envilder van primer. La teva comanda comença al primer argument que no és una opció d'Envilder, o just després de --. Tot el que ve després es passa a la comanda tal qual, encara que sembli una opció d'Envilder. Només necessites -- quan la comanda mateixa comença per -.",
      sepComment1: "# Tot és d'npm",
      sepComment2: "# --map és d'Envilder, la resta és d'npm",
      sepComment3: "# --map=x és d'npm: va després de la comanda",
      sepComment4: '# El mateix que abans, amb un separador explícit',
      optionsTitle: 'Opcions',
      thOption: 'Opció',
      thDescription: 'Descripció',
      thMessage: 'Missatge',
      optMap: 'Ruta al fitxer de mapatge (per defecte: envilder.json)',
      optProfile: "Perfil d'AWS CLI. Substitueix $config.profile",
      optProvider: 'aws o azure. Substitueix $config.provider',
      optVault: "URL d'Azure Key Vault. Substitueix $config.vaultUrl",
      optionsOrderDesc:
        "Les opcions d'Envilder van després d'exec, mai abans. Una opció escrita abans d'exec es rebutja amb el codi de sortida 125, i Envilder mostra la comanda corregida:",
      rejectedDesc:
        'El mode exec no llegeix ni escriu mai cap fitxer .env ni puja res, així que aquestes opcions es rebutgen amb el codi 125 abans de cap crida al proveïdor. Una opció desconeguda abans de la comanda també és un error, perquè un error tipogràfic com --mapp no arribi mai a la comanda.',
      exampleTitle: 'Exemple',
      exampleDesc:
        "El fitxer de mapatge declara DB_PASSWORD i API_TOKEN, i el shell ja exporta una DB_PASSWORD pròpia. Inicia l'aplicació a través d'Envilder:",
      outputDesc:
        "Tota la sortida d'Envilder va a stderr, així que stdout és de la teva comanda: envilder exec -- node print.js > out.json només n'escriu la sortida. El resum anomena la comanda només pel nom del programa, perquè els arguments poden contenir secrets. Amb un perfil diu (aws, profile=dev).",
      exitTitle: 'Codis de sortida',
      exitDesc:
        "Els codis de sortida segueixen GNU env i docker run, de manera que pots distingir una fallada d'Envilder del codi de sortida de la teva comanda:",
      thCode: 'Codi',
      thMeaning: 'Significat',
      exitChild: 'La teva comanda ha sortit amb el codi n',
      exitSignal:
        'La teva comanda ha estat aturada pel senyal n (per exemple, 137 per a SIGKILL)',
      exit125:
        "Envilder ha fallat abans d'iniciar la comanda: opcions incorrectes, comanda que falta, cap fitxer de mapatge, secrets no resolts o credencials caducades",
      exit126:
        "La comanda existeix però el sistema operatiu no l'ha deixat executar (per exemple, Permission denied)",
      exit127: "No s'ha trobat la comanda",
      exitNote: 'Els modes pull i push surten amb 1 quan fallen.',
      failTitle: 'Resolució fail-closed',
      failDesc:
        "Si algun secret falta, és buit o no es pot llegir (per exemple, accés denegat), la comanda no s'inicia: Envilder llista les variables afectades amb les rutes emmascarades i surt amb 125. El mode pull, en canvi, omet un secret que falta. Sortida quan un secret no existeix i un altre és buit:",
      failRules: [
        "Es rebutja un valor de secret que conté un byte NUL, perquè una variable d'entorn no en pot contenir cap.",
        'A Windows, es rebutja un fitxer de mapatge que declara dos noms que només es diferencien per majúscules (API_KEY i api_key) abans de cap crida al proveïdor, perquè Windows els tracta com una sola variable. A Linux i macOS es mantenen tots dos.',
        "Un fitxer de mapatge sense variables no és un error: Envilder mostra Map file declares no variables. i inicia la comanda amb l'entorn heretat.",
        "Els valors es resolen una sola vegada, abans que s'iniciï la comanda. Un canvi posterior al vault no arriba a una comanda en execució.",
      ],
      envTitle: 'Entorn',
      envDesc:
        "La teva comanda hereta tot l'entorn del shell que executa Envilder, més totes les variables del fitxer de mapatge. El fitxer de mapatge guanya: quan una variable heretada té el mateix nom que una de mapada, la comanda veu el valor del proveïdor, i Envilder mostra els noms (mai els valors) a stderr:",
      envWindows:
        'A Windows els noms es comparen sense distingir majúscules: un Path heretat i un PATH mapat són la mateixa variable, guanya el valor mapat i la comanda en rep una sola entrada. Els valors es passen byte a byte, sense cometes, escapament ni expansió.',
      noShellDesc:
        "No hi intervé cap shell: els arguments arriben a la comanda com una llista. El teu propi shell continua interpretant la línia primer, així que un $DB_PASSWORD sense cometes s'expandeix al valor del teu shell, no al secret, i un && sense cometes s'executa fora d'envilder exec. Per a funcions del shell, inicia un shell explícitament:",
      ssoTitle: "Sessions SSO d'AWS caducades",
      ssoDesc:
        "Quan la sessió SSO d'AWS ha caducat i stdin i stderr són un terminal, Envilder s'ofereix a executar aws sso login i després torna a provar només la resolució dels secrets: la comanda s'inicia com a molt una vegada. Si ho rebutges, l'inici de sessió falla o no hi ha terminal (a la CI, per exemple), el codi de sortida és 125. Un error després que la comanda s'hagi iniciat no es reintenta mai.",
      signalsTitle: 'Senyals',
      signalsDesc:
        "stdin, stdout i stderr s'hereten i el TTY es conserva, així que els REPL i les preguntes interactives funcionen. Ctrl+C en un terminal arriba directament a la comanda. SIGTERM i SIGHUP (de docker stop o Kubernetes, per exemple) es reenvien, i Envilder espera que la comanda acabi sense cap temps límit propi. Només els rep el fill directe: un llançador com npm ha d'aturar els seus propis fills.",
      ciTitle: 'CI i GitHub Actions',
      ciDesc:
        "A la CI, dona primer credencials del núvol al job (per exemple amb OIDC) i després executa la CLI en un pas run. Només aquest pas veu els secrets. L'Action d'Envilder ofereix el mateix comportament amb el seu input command.",
      ghaDesc:
        "Quan GITHUB_ACTIONS=true, Envilder registra cada valor resolt amb l'emmascarament de logs de GitHub (::add-mask::) a stderr abans d'iniciar la comanda, així que els valors que imprimeixi surten emmascarats al log del job.",
      ghaNote:
        "No redirigeixis l'stderr d'envilder exec fora del log del pas (2>/dev/null, per exemple): el runner hi llegeix les màscares.",
      scriptsTitle: 'Scripts de package.json',
      scriptsDesc:
        "Posa exec als teus scripts perquè tothom iniciï el projecte de la mateixa manera amb npm run dev. Afegeix envilder com a dependència de desenvolupament (npm install --save-dev envilder) perquè l'script el trobi a node_modules/.bin:",
      usesTitle: 'Altres usos habituals',
      usesDesc:
        "Qualsevol eina que llegeixi la configuració de l'entorn funciona igual. Cada línia següent s'executa amb els secrets d'envilder.json:",
      usesComment1: "# Contenidors: -e NOM sense valor el copia de l'entorn",
      usesComment2: "# Tests d'integració que llegeixen tokens de l'entorn",
      usesComment3:
        '# Migracions i scripts puntuals que necessiten DATABASE_URL',
      usesComment4:
        "# Terraform llegeix TF_VAR_<nom> com la variable d'entrada <nom>",
      usesComment5: '# Diverses comandes amb els mateixos secrets',
      usesNote:
        "Docker Compose llegeix les referències a variables de compose.yaml del seu entorn, així que no cal cap fitxer .env; Docker conserva l'entorn d'un contenidor a les seves metadades fins que s'elimina. Marca com a sensitive les variables de Terraform que contenen secrets.",
      sandboxTitle: 'No és un sandbox.',
      sandboxDesc:
        "El mode exec deixa intacte un fitxer .env existent: esborra'l tu mateix quan deixis el mode pull. La teva comanda i tots els processos que inicia poden llegir els secrets, inclosa qualsevol eina o agent d'IA que hi executi env. Executa només comandes de confiança.",
      examplesDesc:
        "Inicia LocalStack amb el token d'autenticació resolt des d'AWS SSM, o segueix push, pull i exec amb npx envilder:",
      errorsTitle: 'Errors habituals',
      thFix: 'Solució',
      errMissingFix: "Afegeix la comanda després d'exec, o després de --.",
      errUnknownFix:
        "Corregeix el nom de l'opció. Tot el que hi ha abans de la comanda ha de ser una opció d'Envilder; posa les opcions pròpies després de la comanda.",
      errNoMapFix:
        "Executa envilder des del directori que conté envilder.json, o passa --map després d'exec.",
      errNotFoundFix:
        'Codi de sortida 127. Comprova el nom del programa i el PATH. A Windows, cmd.exe mostra primer la seva pròpia línia de comanda no reconeguda.',
      errPermissionFix:
        "Codi de sortida 126. Fes el fitxer executable (chmod +x run.sh) o executa'l amb el seu intèrpret (sh ./run.sh).",
      errCaseFix: 'Només a Windows. Canvia el nom d’una de les dues variables.',
      errNulFix:
        'Treu el byte NUL del secret, o llegeix-lo dins del procés amb un SDK.',
      relatedTitle: 'Pàgines relacionades',
      relatedStart:
        'Primers passos: puja un secret i executa una aplicació amb envilder exec',
      relatedMap:
        'Referència del fitxer de mapatge: camps de $config i regles de validació',
      relatedPull:
        'Mode pull: escriu els mateixos secrets a un fitxer .env quan una eina en necessita un',
      guideLink:
        "Guia completa d'exec a GitHub: detalls de Windows i tots els missatges d'error",
    },
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
        title:
          "Comença: d'AWS SSM o Azure Key Vault a una app en marxa en 5 minuts",
        description:
          "Instal·la la CLI d'Envilder, mapeja secrets a envilder.json i executa la teva app amb envilder exec: valors d'AWS SSM o Azure Key Vault, sense .env al disc.",
        heading: 'Comença en 5 minuts',
        intro:
          "Com fas arribar un secret d'AWS SSM Parameter Store o Azure Key Vault a una app en marxa? Instal·la la CLI d'Envilder, associa el secret a un nom de variable a l'envilder.json i arrenca l'app amb envilder exec, que passa el valor al procés sense escriure cap fitxer .env. Tot plegat porta uns cinc minuts quan les teves credencials del núvol ja funcionen.",
        breadcrumb: 'Comença',
        navLabel: 'Comença',
        cardTitle: 'Comença amb Envilder',
        cardSummary:
          'Instal·la la CLI, mapeja un secret i executa la teva app amb envilder exec, per a AWS SSM o Azure Key Vault.',
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
        title:
          "Referència d'envilder.json: variables d'entorn i secrets al núvol",
        description:
          "Referència d'envilder.json: $config, proveïdors, perfils, URL del vault, precedència de les opcions, validació de noms i exemple amb diversos entorns.",
        heading: 'Referència del fitxer de mapatge',
        intro:
          "Què pot contenir l'envilder.json i com el llegeix Envilder? És un únic objecte JSON que associa noms de variables d'entorn a identificadors de secrets, amb un bloc $config opcional per al proveïdor, el perfil i la URL del vault. Les opcions de la CLI substitueixen $config camp a camp, i un nom o un proveïdor no vàlid atura l'execució abans de llegir cap secret.",
        breadcrumb: 'Fitxer de mapatge',
        navLabel: 'Fitxer de mapatge',
        cardTitle: 'Referència del fitxer de mapatge',
        cardSummary:
          'Tots els camps del fitxer, regles per proveïdor, precedència de les opcions i validació de noms.',
      },
      'cli-pull': {
        title:
          "Mode pull: escriu secrets d'AWS SSM o Azure Key Vault a un .env",
        description:
          "Referència del mode pull: opcions i valors per defecte, precedència de $config, sortida, secrets que falten, actualització d'un .env i errors habituals.",
        heading: 'Referència del mode pull',
        intro:
          "Què fa envilder quan l'executes sense --push ni exec? Llegeix envilder.json, obté cada secret mapat d'AWS SSM Parameter Store o Azure Key Vault i n'escriu els valors a .env. Un fitxer existent s'actualitza al seu lloc, les claus que el fitxer de mapatge no declara es queden com estan, i un secret que no existeix s'omet amb un avís.",
        breadcrumb: 'CLI pull',
        navLabel: 'CLI pull',
        cardTitle: 'Comanda CLI pull',
        cardSummary:
          'Genera un fitxer .env a partir dels secrets definits al fitxer de mapatge.',
      },
      'cli-push': {
        title:
          "Mode push: puja valors d'un .env o un secret a AWS SSM o Key Vault",
        description:
          "Referència del mode push: puja un .env o un sol secret amb --key, com s'actualitza envilder.json, SecureString, noms a Key Vault i errors habituals.",
        heading: 'Referència del mode push',
        intro:
          "Com deses secrets a AWS SSM Parameter Store o Azure Key Vault amb Envilder? envilder --push puja el valor del .env de cada variable que declara el fitxer de mapatge, i --key, --value i --secret-path pugen un sol secret sense fitxer .env. El push d'un sol secret també registra el mapatge a envilder.json, perquè envilder i envilder exec el puguin llegir de seguida.",
        breadcrumb: 'CLI push',
        navLabel: 'CLI push',
        cardTitle: 'Comanda CLI push',
        cardSummary: 'Puja un fitxer .env mapat o un secret al proveïdor.',
      },
      'cli-exec': {
        title:
          "envilder exec: executa una comanda amb secrets d'AWS SSM o Key Vault",
        description:
          "Referència d'envilder exec: el separador --, opcions rebutjades, codi de sortida 125, entorn i Windows, recuperació d'SSO, senyals i ús a la CI.",
        heading: "Referència d'envilder exec",
        intro:
          "Com executes una comanda amb secrets d'AWS SSM o Azure Key Vault sense escriure cap fitxer .env? envilder exec resol tots els secrets del fitxer de mapatge i inicia la comanda amb aquests valors afegits al seu entorn. Si algun secret no es pot resoldre, la comanda no s'inicia i Envilder surt amb 125; si no, surt amb el codi de la teva comanda.",
        breadcrumb: 'CLI exec',
        navLabel: 'CLI exec',
        cardTitle: 'Comanda CLI exec',
        cardSummary:
          'Inicia una comanda amb els secrets mapats en memòria, sense fitxer .env.',
      },
      'github-action': {
        title: "Carrega secrets d'AWS SSM i Azure Key Vault a GitHub Actions",
        description:
          "Carrega secrets d'AWS SSM Parameter Store o Azure Key Vault als jobs de GitHub Actions amb OIDC, sense fitxer .env: permisos IAM i RBAC mínims, workflows complets i errors de credencials.",
        heading: "Carrega secrets d'AWS SSM i Azure Key Vault a GitHub Actions",
        intro:
          "Com fas servir secrets d'AWS SSM Parameter Store o Azure Key Vault en un job de GitHub Actions sense copiar-los a GitHub Secrets? Autentica el job amb OIDC i deixa que l'Action d'Envilder llegeixi el teu envilder.json versionat i exporti els secrets als passos següents.",
        breadcrumb: 'GitHub Action',
        navLabel: 'GitHub Action',
        cardTitle: 'Guia de GitHub Action',
        cardSummary: "Configura l'acció per a AWS, Azure i diversos entorns.",
      },
      'sdk-dotnet': {
        title: "SDK .NET d'Envilder",
        description:
          "SDK .NET d'Envilder: carrega secrets d'AWS SSM o Azure Key Vault a IConfiguration o DI d'ASP.NET Core, amb IAM i RBAC mínims, precedència d'appsettings i errors.",
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
      'Puja un secret de prova amb Envilder, que també escriu el fitxer de mapatge, i després fes pull per confirmar que tot funciona:',
    awsSetupVerifySuccess:
      'Si veus ⭐ LEVEL CLEARED, la configuració AWS està completa.',
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
      'Puja un secret de prova amb Envilder, que també escriu el fitxer de mapatge, i després fes pull per confirmar que tot funciona:',
    azureSetupVerifySuccess:
      'Si veus ⭐ LEVEL CLEARED, la configuració Azure està completa.',
    azureSetupVerifySdk:
      'O carrega secrets directament des de la teva app amb el Python SDK:',
    mapThDefault: 'Per defecte',
    mapThDescription: 'Descripció',
    mapContentsTitle: 'Contingut dels secrets (els valors resolts)',
    mapContentsIntro:
      'Envilder no reescriu mai el valor d’un secret: el que retorna el proveïdor és el que rep la teva aplicació. Els límits depenen d’on es desa el valor:',
    mapThStage: 'Etapa',
    mapThLimit: 'Límit',
    mapContentsProvider: 'Proveïdor',
    mapContentsProviderLimit:
      'AWS SSM: 4 KB (estàndard) o 8 KB (nivell avançat). Azure Key Vault: 25 KB.',
    mapContentsEnvFile: 'Fitxer .env (CLI, GitHub Action)',
    mapContentsEnvFileLimit:
      'Qualsevol valor que dotenv pugui representar. Consulta l’excepció més avall.',
    mapContentsProcess: 'Entorn del procés',
    mapContentsProcessLimit:
      'El sistema operatiu no pot desar NUL (U+0000) en una variable, i Windows limita cada variable a 32.767 caràcters.',
    mapContentsResolveOnly:
      'Les APIs dels SDKs que només resolen (resolve, ResolveFile, IConfiguration) mantenen els valors en memòria i només estan subjectes als límits del proveïdor.',
    mapContentsWriterDesc:
      'El CLI escriu cada valor de manera que dotenv en llegeixi exactament el string original. Les cometes s’escullen automàticament i es comproven analitzant el resultat abans d’escriure el fitxer. La comprovació fa servir la gramàtica de dotenv ampliada a claus amb /, així que per a aquestes claus demostra que el valor es llegeix igual, no que dotenv per a Node.js les carregui (ignora aquestes línies):',
    mapContentsRoundTrip:
      '#, espais al principi i al final, cometes, barres inverses, un \\n literal, salts de línia LF/CRLF reals i Unicode es conserven tots. Si el fitxer ja existeix, cada assignació es substitueix al seu lloc (una multilínia, sencera), i es mantenen els comentaris, l’ordre i els finals de línia.',
    mapContentsUnrepresentableTitle:
      'L’únic valor que un .env no pot contenir:',
    mapContentsUnrepresentableDesc:
      'un valor que conté els tres tipus de cometes (\', " i `) juntament amb un salt de línia, espais al principi o al final, o un #. El CLI s’atura amb un error que indica la variable i deixa el fitxer .env intacte. Desa aquest valor codificat (per exemple en base64) o llegeix-lo amb un SDK.',
    mapContentsExpansionTitle: 'Expansió de variables:',
    mapContentsExpansionDesc:
      'Envilder escriu referències com $HOME literalment i dotenv no les expandeix, però altres carregadors sí. Docker Compose, per exemple, expandeix un KEY=$HOME sense cometes quan llegeix el fitxer. Tingues-ho en compte quan un secret contingui $.',
    examplesTitle: 'Exemples executables.',
    ghaSetupTitle: "Com funciona l'Action",
    ghaSetupDesc:
      "L'Action és un pas compost: instal·la Node.js 22, llegeix el fitxer de mapeig, obté cada secret amb les credencials de núvol que ja té el job i emmascara cada valor al log. Per defecte, després exporta els secrets a l'entorn de tots els passos posteriors del job; amb command o env-file, en canvi, executa una ordre o escriu un fitxer .env. No inicia sessió a AWS ni a Azure per si mateixa, així que ho ha de fer un pas anterior (aws-actions/configure-aws-credentials o azure/login). Utilitza l'etiqueta publicada macalbert/envilder/github-action@v0; no cal cap pas de compilació.",
    ghaPrerequisites: 'Prerequisits',
    ghaPrereqAws:
      "AWS: un rol IAM que GitHub pugui assumir, fet servir a través d'aws-actions/configure-aws-credentials.",
    ghaPrereqAzure:
      "Azure: un registre d'aplicació amb una credencial federada, fet servir a través d'azure/login.",
    ghaPrereqMap: 'Un envilder.json al teu repositori',
    ghaPullOnly: 'La GitHub Action només suporta el mode pull (sense push).',
    ghaBasicTitle: 'AWS SSM Parameter Store amb OIDC',
    ghaMultiEnvTitle: 'Workflow multi-entorn',
    ghaExecTitle: 'Executar una ordre amb els secrets',
    ghaExecDesc:
      "Amb l'input command, l'Action executa aquesta ordre amb bash, des de l'arrel del repositori, amb els secrets al seu entorn, i acaba el pas amb el codi de sortida de l'ordre. Els secrets no s'exporten, així que els passos posteriors, incloses les actions de tercers, no els veuen mai. Fes-lo servir quan només un pas necessita els secrets i vols la mínima exposició.",
    ghaExecNote:
      "També pots executar la CLI tu mateix amb npx envilder exec --map=envilder.json -- <ordre> en un pas run. Necessita Node.js 22.12 o posterior (actions/setup-node), i el seu stderr s'ha de quedar al log del pas, perquè és d'allà d'on GitHub llegeix les màscares.",
    ghaExecLink: "Llegeix la guia completa d'exec →",
    ghaAzureTitle: 'Azure Key Vault amb OIDC',
    ghaInputsTitle: "Inputs i outputs de l'Action",
    ghaInputsSubtitle: 'Inputs',
    ghaOutputsSubtitle: 'Outputs',
    ghaInputRequired: 'Requerit',
    ghaInputDefault: 'Per defecte',
    ghaInputDesc: 'Descripció',
    ghaOutputEnvPath:
      'Ruta al fitxer .env generat (buida si no es defineix env-file)',
    ghaThInput: 'Input',
    ghaThRequired: 'Requerit',
    ghaThOutput: 'Output',
    ghaYes: 'Sí',
    ghaNo: 'No',
    ghaInputMap: 'Ruta al fitxer JSON de mapeig',
    ghaInputEnv:
      "Opcional. Ruta a un fitxer .env per escriure, per a eines que necessiten un fitxer. Sense env-file ni command, els secrets van a l'entorn del job",
    ghaInputProvider: 'aws o azure',
    ghaInputVault: "URL d'Azure Key Vault",
    ghaInputCommand:
      "Opcional. Ordre que s'executa (amb bash) amb els secrets només al seu entorn. No es pot combinar amb env-file",
    ghaModesTitle: 'Triar un mode',
    ghaModesDesc:
      "L'Action té tres modes, i els inputs que defineixes en trien un. El mode per defecte només necessita map-file:",
    ghaModesThMode: 'Mode',
    ghaModesThSelect: 'Com es tria',
    ghaModesThScope: 'Qui pot llegir els secrets',
    ghaModesThFile: 'Fitxers escrits',
    ghaModeJob: 'Entorn del job (per defecte)',
    ghaModeJobSelect: 'Només map-file',
    ghaModeJobScope: 'Tots els passos posteriors del job',
    ghaModeCommand: 'Ordre',
    ghaModeCommandScope: 'Només aquesta ordre i els processos que inicia',
    ghaModeEnvFile: 'Fitxer .env',
    ghaModeEnvFileScope: 'Qualsevol pas o eina que llegeixi el fitxer',
    ghaModeJobFiles:
      'El fitxer GITHUB_ENV del runner, al seu directori temporal (cap .env)',
    ghaModeCommandFiles: 'Cap',
    ghaModeEnvFileFiles: 'El fitxer .env',
    ghaModesJobNote:
      "En el mode per defecte, l'Action afegeix els secrets al fitxer GITHUB_ENV del runner, i el runner els posa a l'entorn de cada pas que s'executa després dins del mateix job, incloses les actions de tercers, les actions de contenidor Docker i els passos que s'executen dins d'un container del job. Els passos els llegeixen com qualsevol altra variable: process.env.DB_PASSWORD, os.environ[\"DB_PASSWORD\"] o $DB_PASSWORD. Els altres jobs no els reben, així que cada job que necessita secrets torna a executar l'Action. Un contenidor que inicies tu mateix amb docker run no els hereta: passa'ls explícitament, per exemple amb docker run -e DB_PASSWORD.",
    ghaModesEnvFileNote:
      "Fes servir env-file només quan una eina no pot llegir els secrets de cap altra manera que d'un fitxer, per exemple docker compose --env-file. Millor una ruta dins de runner.temp, perquè el fitxer quedi fora de l'espai de treball del repositori. env-file i command no es poden combinar.",
    ghaModesSafetyNote:
      "No escriure cap fitxer .env elimina la via més habitual per on es filtren secrets a CI: un fitxer que acaba a upload-artifact, a una memòria cau, a un COPY . . d'un Dockerfile o a un git add -A. Les eines posteriors encara poden escriure les variables en fitxers, així que tracta els resultats de build i de tests com ho faries sense Envilder. Tampoc protegeix contra codi maliciós dins del job, que pot llegir les variables d'entorn tan fàcilment com un fitxer. Tots els modes emmascaren els valors al log. Els modes d'entorn del job i d'ordre fallen de manera segura: si falta algun secret o és buit, el pas falla i no s'exporta ni s'inicia res.",
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
      "El log del pas mostra el mode, la identitat d'AWS que s'utilitza, cada variable resolta amb el valor emmascarat i un resum:",
    ghaOutputMaskNote:
      "Cada valor es registra també amb l'ordre add-mask de GitHub, de manera que un pas posterior que l'imprimeixi mostra ***. Si fas servir env-file, el fitxer .env es queda al runner; no el pugis com a artefacte.",
    ghaAzureFedTitle: '1. Crea una credencial federada',
    ghaAzureFedDesc:
      "Crea un registre d'aplicació i el seu service principal, i afegeix-hi una credencial federada que confiï en els tokens d'un repositori i una branca. No es crea cap secret de client. El subjecte fa servir el mateix format que el sub d'AWS, inclosa la variant immutable quan el teu repositori l'emet.",
    ghaAzureRoleTitle: '2. Rol mínim',
    ghaAzureRoleDesc:
      "Key Vault Secrets User permet llegir els valors dels secrets i res més. Assigna'l sobre el vault, no sobre el grup de recursos ni la subscripció:",
    ghaAzurePolicyNote:
      "Si el vault fa servir polítiques d'accés en lloc d'Azure RBAC, concedeix get sobre els secrets: az keyvault set-policy --name {VAULT} --spn {APP_ID} --secret-permissions get.",
    ghaAzureMapDesc:
      'Amb $config al fitxer de mapeig, el workflow no necessita els inputs provider ni vault-url. Els noms de Key Vault només admeten lletres, dígits i guions, així que Envilder converteix les rutes: /myapp/prod/stripe-key es llegeix com a myapp-prod-stripe-key (sense la barra inicial, barres convertides en guions).',
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
      "Revisa el nom, la regió i, a Azure, el nom convertit. En el mode per defecte i amb command, un secret que falta o és buit fa fallar el pas: no s'exporta res i la comanda no s'inicia. Amb env-file és un avís, no un error: el pas acaba bé, amb menys secrets al resum que al mapeig. En un fitxer .env nou la variable queda fora. Si el fitxer ja existia (al repositori, a la memòria cau o escrit per un pas anterior), es conserva el valor antic, així que esborra el fitxer abans de l'Action quan un valor obsolet no hagi de sobreviure. Si un valor que falta ha d'aturar el desplegament, fes servir el mode per defecte o command en lloc d'env-file.",
    ghaErrVaultUrlTitle: "Falta l'URL del vault d'Azure",
    ghaErrVaultUrlFix:
      "Informa l'input vault-url o $config.vaultUrl al fitxer de mapeig. Fes servir l'URI del vault que mostra el portal d'Azure, per exemple https://my-vault.vault.azure.net.",
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
    // SDKs
    sidebarSdks: 'SDKs',
    sidebarSdkDotnet: '.NET SDK',
    sidebarSdkPython: 'Python SDK',
    sidebarSdkNodejs: 'Node.js SDK',
    sdkDotnetTitle: '.NET SDK',
    sdkDotnetDesc:
      "Com carregues secrets d'AWS SSM Parameter Store o d'Azure Key Vault en una aplicació .NET sense fitxer .env? Afegeix el paquet NuGet d'Envilder i crida AddEnvilder a la teva configuració: els secrets que llista envilder.json es resolen a l'inici i es llegeixen com qualsevol altra clau de configuració.",
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
    sdkDotnetQuickStartResolve: 'Avançat: control programàtic total',
    sdkDotnetQuickStartResolveDesc:
      "Analitza el fitxer de mapeig, resol secrets i injecta'ls a les variables d'entorn:",
    sdkDotnetFullDocs: 'Documentació completa →',
    sdkDotnetExamplesDesc:
      'Projectes de proves xUnit amb Testcontainers i Aspire que resolen un fitxer de mapeig contra AWS SSM i Azure Key Vault (emulats amb LocalStack i Lowkey Vault) i passen els valors als contenidors, sense cap fitxer .env:',
    sdkDotnetPrereqTitle: 'Prerequisits',
    sdkDotnetPrereqDesc:
      "El paquet apunta a .NET Standard 2.0, així que funciona amb qualsevol versió de .NET amb suport (les proves de l'SDK s'executen a .NET 10, l'LTS actual). Cada proveïdor fa servir la seva cadena de credencials per defecte:",
    sdkDotnetPrereqAws:
      'AWS: la cadena de credencials per defecte d\'AWS (variables d\'entorn, fitxer de credencials compartit, SSO o un rol IAM). Defineix "profile" a $config per fer servir un perfil amb nom.',
    sdkDotnetPrereqAzure:
      "Azure: DefaultAzureCredential (az login, identitat gestionada o variables d'entorn).",
    sdkDotnetIamTitle: 'Política IAM mínima per a AWS SSM',
    sdkDotnetIamDesc:
      "L'SDK només llegeix paràmetres, així que n'hi ha prou amb ssm:GetParameter sobre el teu prefix de ruta. Substitueix la regió, l'ID de compte i el prefix:",
    sdkDotnetIamKms:
      'Els valors es llegeixen amb desxifrat. Els paràmetres SecureString xifrats amb la clau aws/ssm per defecte no necessiten res més; si fan servir una clau KMS gestionada per tu, permet també kms:Decrypt sobre aquesta clau.',
    sdkDotnetRbacTitle: 'Rol RBAC mínim per a Azure Key Vault',
    sdkDotnetRbacDesc:
      "Per llegir secrets només cal el rol Key Vault Secrets User. Assigna'l a l'àmbit del magatzem, no de la subscripció:",
    sdkDotnetRbacNote:
      "Si el magatzem encara fa servir polítiques d'accés en lloc de RBAC, concedeix només el permís get de secrets:",
    sdkDotnetMapTitle: 'El fitxer de mapeig',
    sdkDotnetMapDesc:
      "El mateix envilder.json serveix per als exemples següents. Les claus esdevenen claus de configuració o noms de variables d'entorn; els valors són rutes de paràmetres a SSM:",
    sdkDotnetMapAzureDesc:
      'Per a Key Vault, defineix el proveïdor i la URL del magatzem a $config. Els valors són noms de secrets de Key Vault:',
    sdkDotnetMapAzureNote:
      "L'SDK de .NET envia els noms a Key Vault tal com els escrius, excepte que les barres es converteixen en guions, igual que la CLI: una ruta com /myapp/prod/db-password es llegeix com myapp-prod-db-password. Qualsevol altre caràcter que Key Vault rebutgi (per exemple _ o .) falla amb el seu propi error.",
    sdkDotnetAspTitle: 'ASP.NET Core amb IConfiguration',
    sdkDotnetAspDesc:
      "Crida AddEnvilder just després de CreateBuilder. Les claus es llegeixen tal com s'escriuen al fitxer de mapeig, així que fes servir noms de variable d'entorn: el mateix fitxer també funciona amb la CLI i la resta d'SDKs.",
    sdkDotnetAspOutput: "En cridar l'endpoint, la resposta és:",
    sdkDotnetAspNote:
      "Els secrets es resolen una sola vegada, mentre es construeix la configuració, amb una petició per cada entrada del fitxer. Els valors no s'actualitzen mentre l'aplicació s'executa: reinicia-la per recollir un secret rotat. Un secret que no existeix s'omet sense cap error, així que comprova les claus sense les quals l'aplicació no pot arrencar.",
    sdkDotnetDiTitle: 'Injecció de dependències',
    sdkDotnetDiDesc:
      'AddEnvilder sobre IServiceCollection registra un EnvilderClient i el fitxer de mapeig analitzat com a singletons, per al codi que resol secrets sota demanda:',
    sdkDotnetWorkerTitle: 'Worker o aplicació de consola sense DI',
    sdkDotnetWorkerDesc:
      "No cal cap host. Resol el fitxer amb Env, valida'l i fes servir el diccionari directament:",
    sdkDotnetWorkerOutput: 'Sortida quan els dos secrets es resolen:',
    sdkDotnetWorkerHost:
      "En un Worker Service, crida Env.Load abans de crear el host. Els valors passen a ser variables d'entorn del procés, que la configuració del host ja llegeix, així que els guions baixos dobles funcionen com a separadors de secció (Payments__ApiKey es llegeix com Payments:ApiKey).",
    sdkDotnetPrecTitle: 'Combinació amb appsettings.{Environment}.json',
    sdkDotnetPrecDesc:
      "ASP.NET Core aplica les fonts de configuració en ordre i guanya l'última. El host per defecte les afegeix de menys a més prioritat:",
    sdkDotnetPrec1: 'appsettings.json',
    sdkDotnetPrec2: 'appsettings.{Environment}.json',
    sdkDotnetPrec3: "Secrets d'usuari (només a Development)",
    sdkDotnetPrec4: "Variables d'entorn",
    sdkDotnetPrec5: "Arguments de línia d'ordres",
    sdkDotnetPrec6:
      "Envilder, quan s'afegeix després de CreateBuilder com a l'exemple anterior",
    sdkDotnetPrecEnvilder:
      "Com que AddEnvilder s'executa després de CreateBuilder, els seus secrets sobreescriuen totes les fonts per defecte, incloent-hi la línia d'ordres. Deixa els valors per defecte no secrets a appsettings i fes que Envilder aporti només secrets. Una clau que s'omet perquè el seu secret no existeix no esborra res: el valor d'appsettings continua vigent.",
    sdkDotnetPrecMissing:
      "Perquè les variables d'entorn tornin a guanyar en un desplegament concret, afegeix aquesta font després d'Envilder:",
    sdkDotnetPerEnvDesc:
      "Per fer servir un fitxer diferent per entorn, construeix-ne el nom a partir del nom de l'entorn:",
    sdkDotnetExecTitle: "Sense l'SDK: envilder exec",
    sdkDotnetExecDesc:
      "Si l'aplicació només necessita els valors com a variables d'entorn, prescindeix del paquet i deixa que la CLI l'arrenqui. Els secrets es passen al procés, no s'escriu cap fitxer .env i l'ordre no s'inicia si algun secret no es pot resoldre:",
    sdkDotnetExecKeys:
      "El proveïdor de variables d'entorn de .NET converteix els guions baixos dobles en separadors de secció, així que una clau com ConnectionStrings__Default es llegeix com ConnectionStrings:Default sense cap codi addicional.",
    sdkDotnetExecLink: "Referència d'envilder exec →",
    sdkDotnetErrTitle: 'Errors habituals',
    sdkDotnetErrIntro:
      "Cada missatge següent és el text exacte que llança l'SDK o que retorna el proveïdor de núvol.",
    sdkDotnetErrExpiredTitle: 'ExpiredCredentialsException',
    sdkDotnetErrExpiredFix:
      "El token de seguretat o la sessió SSO ha caducat. Renova les credencials (aws sso login si fas servir SSO) i torna a executar. L'excepció original d'AWS és a InnerException.",
    sdkDotnetErrSsoTitle: 'SsoSessionExpiredException',
    sdkDotnetErrSsoFix:
      "Executa l'ordre que indica el missatge. Sense perfil a $config, el missatge és: Your AWS SSO session has expired. Run 'aws sso login' and re-run this command. La propietat ProfileName conté el perfil, o null.",
    sdkDotnetErrMissingTitle: 'Paràmetre o secret inexistent',
    sdkDotnetErrMissingFix:
      "Un paràmetre o secret que no existeix s'omet sense error: la clau no és al diccionari ni a IConfiguration. ValidateSecrets només llança l'excepció quan no s'ha resolt res o hi ha un valor buit, així que comprova també les claus de les quals depens (per exemple amb TryGetValue) i verifica la ruta al fitxer.",
    sdkDotnetErrDeniedTitle: 'Permís denegat',
    sdkDotnetErrDeniedAwsFix:
      "La identitat no té ssm:GetParameter sobre aquest paràmetre. Compara l'ARN de Resource, regió inclosa, amb la política anterior.",
    sdkDotnetErrDeniedAzureFix:
      'Assigna Key Vault Secrets User sobre el magatzem. Les assignacions de rol poden trigar uns minuts a propagar-se.',
    sdkDotnetErrAzureNameTitle: 'Secret no trobat a Azure',
    sdkDotnetErrAzureNameFix:
      "L'SDK envia cada valor tal qual, excepte que les barres es converteixen en guions: un nom en forma de ruta com /myapp/prod/db-password es llegeix com myapp-prod-db-password, igual que al CLI. Si el secret continua sense aparèixer, comprova que el vault tingui un secret amb aquest nom; els noms que només difereixen en majúscules són el mateix secret.",
    sdkDotnetErrConfigTitle: 'Errors de configuració',
    sdkDotnetErrMessageHeader: 'Missatge',
    sdkDotnetErrFixHeader: 'Solució',
    sdkDotnetErrCfgFile:
      'La ruta és relativa al directori de treball, no a la carpeta del projecte. Copia el fitxer al directori de sortida o passa una ruta absoluta.',
    sdkDotnetErrCfgVault:
      'Afegeix "vaultUrl" a $config o passa\'l amb EnvilderOptions.',
    sdkDotnetErrCfgProfileAzure:
      'Elimina "profile" de $config: només s\'aplica a AWS.',
    sdkDotnetErrCfgVaultAws:
      'Elimina "vaultUrl" o defineix "provider" com a "azure".',
    sdkDotnetErrCfgProfileMissing:
      'Comprova el nom a ~/.aws/credentials o ~/.aws/config, o elimina "profile" per fer servir la cadena de credencials per defecte.',
    sdkDotnetBeforeTitle: 'Què substitueix',
    sdkDotnetBeforeDesc:
      "Les alternatives habituals són un fitxer .env copiat entre màquines o un script escrit a mà que crida l'SDK d'AWS o d'Azure. El primer deixa secrets en text pla al disc; el segon és codi que cada servei ha de mantenir. Aquí l'envilder.json versionat només llista rutes i els valors es queden al teu magatzem.",
    sdkDotnetRelatedTitle: 'Guies relacionades',
    sdkDotnetRelatedMap: 'Referència del fitxer de mapeig',
    sdkDotnetRelatedAws: "Configuració d'AWS SSM",
    sdkDotnetRelatedAzure: "Configuració d'Azure Key Vault",
    sdkDotnetRelatedExec: "Referència d'envilder exec",
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
