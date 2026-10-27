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
        'URL del Key Vault. Obligatòria per a azure. Ha de fer servir https:// i un host de Key Vault (.vault.azure.net, .vault.azure.cn, .vault.usgovcloudapi.net o .vault.microsoftazure.de). aws la ignora.',
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
      errVaultHttpsFix:
        'Fes servir la URL https:// que apareix a la visió general del vault.',
      errVaultHostFix:
        "Fes servir l'URI del vault que dona Azure, per exemple https://my-vault.vault.azure.net, no un domini propi.",
      errProfileAzureFix:
        'És un avís, no un error. Treu profile de $config, o no passis --profile, quan facis servir azure.',
      errCaseFix:
        "Canvia el nom d'una de les claus; exec a Windows rebutja noms que només es diferencien en majúscules i minúscules.",
      relatedTitle: 'Guies relacionades',
      relatedStart: "Primers passos: d'un secret a una app en marxa",
      relatedExec: "Referència d'envilder exec",
      relatedAzure: "Configuració d'Azure Key Vault",
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
      "Puja una variable d'entorn individual directament al teu proveïdor al núvol sense fer servir cap fitxer .env. Envilder també desa el mapeig a envilder.json (i el crea si no existeix), perquè envilder exec el pugui resoldre de seguida. El valor no s'escriu mai al fitxer.",
    pushSingleOptions: 'Opcions',
    pushSingleOptPush:
      'Opcional: --key, --value i --secret-path ja activen el mode push',
    pushSingleOptKey: "Nom de la variable d'entorn",
    pushSingleOptValue: 'Valor a emmagatzemar',
    pushSingleOptPath: 'Ruta completa del secret al teu proveïdor al núvol',
    pushSingleOptMap:
      "Opcional: fitxer de mapeig que es crea o s'actualitza amb l'entrada i del qual es llegeix $config (per defecte: envilder.json)",
    pushSingleOptNoMapUpdate:
      'Opcional: puja el secret sense llegir, crear ni actualitzar cap fitxer de mapeig; el proveïdor i el vault només vénen dels flags',
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
