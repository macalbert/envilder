import { releaseMetadata } from './releaseMetadata';
import type { Translations } from './types';

export const ca: Translations = {
  homeMeta: {
    title: 'Envilder — Centralitza els teus secrets. Una comanda.',
    description:
      "Una eina CLI i GitHub Action que centralitza de forma segura les variables d'entorn des d'AWS SSM, Azure Key Vault o GCP Secret Manager com a font de veritat única.",
  },
  nav: {
    features: 'Funcionalitats',
    howItWorks: 'Com funciona',
    providers: 'Proveïdors',
    githubAction: 'GitHub Action',
    changelog: 'Canvis',
    docs: 'Docs',
    getStarted: 'Comença',
  },
  theme: {
    retro: 'Retro',
    light: 'Clar',
  },
  hero: {
    openSource: 'Codi obert · MIT',
    title1: 'Els teus secrets.',
    title2: 'Una comanda.',
    titleAccent: 'Cada entorn.',
    description:
      "Una eina CLI i GitHub Action que centralitza de forma segura les teves variables d'entorn des de",
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descGcp: 'GCP Secret Manager',
    descOr: 'o',
    descComma: ',',
    descSuffix:
      'com a font de veritat única. Adéu a copiar i enganxar secrets.',
    getStarted: '▶ Comença',
    viewOnGithub: '★ Veure a GitHub',
    terminalComment1: '# 1. Defineix el mapeig',
    terminalComment2: '# 2. Descarrega secrets → genera .env',
    terminalFetched1: ' Obtingut DB_PASSWORD → ···pass',
    terminalFetched2: ' Obtingut API_KEY     → ···key',
    terminalWritten: " Fitxer d'entorn escrit a .env",
  },
  trust: {
    label: 'COMPATIBLE AMB',
  },
  problemSolution: {
    title: 'El ',
    titleAccent: 'problema',
    titleSuffix: ' amb fitxers .env',
    subtitle:
      "Gestionar secrets manualment no escala. És insegur, propens a errors i crea fricció per a tot l'equip.",
    problems: [
      {
        icon: '💀',
        title: 'Desincronització entre entorns',
        description:
          'Dev, staging i prod tenen secrets diferents. Els desplegaments fallen. Ningú sap quin .env és el correcte.',
      },
      {
        icon: '📨',
        title: 'Secrets compartits per Slack/email',
        description:
          'Claus API enviades en text pla per xat. Sense traçabilitat. Sense rotació. Un incident de seguretat esperant a passar.',
      },
      {
        icon: '🐌',
        title: 'Onboarding i rotacions lentes',
        description:
          "Un nou membre s'uneix a l'equip? Copia i enganxa un .env de la màquina d'algú. Algú rota? Espera que tothom actualitzi manualment.",
      },
    ],
    arrowText: '▼ envilder ho soluciona ▼',
    solutions: [
      {
        icon: '🛡️',
        title: 'Font de veritat al núvol',
        description:
          'Tots els secrets viuen a AWS SSM o Azure Key Vault. IAM/RBAC controla qui pot llegir què. Cada accés queda registrat.',
      },
      {
        icon: '⚡',
        title: 'Una comanda, sempre sincronitzat',
        description:
          'Executa envilder i el teu .env es regenera des de la font de veritat. Idempotent. Instantani. Sense marge per al desfasament.',
      },
      {
        icon: '🤖',
        title: 'Automatitzat en CI/CD',
        description:
          'Utilitza la GitHub Action per obtenir secrets en el moment del desplegament. Sense secrets als repos. Sense passos manuals als pipelines.',
      },
    ],
  },
  howItWorks: {
    title: 'Com ',
    titleAccent: 'funciona',
    subtitle: 'Tres passos. De secrets dispersos a una única font de veritat.',
    steps: [
      {
        title: 'Crea un fitxer de mapeig',
        description:
          "Mapeja els noms de les teves variables d'entorn a les seves rutes de secrets a AWS SSM o Azure Key Vault.",
      },
      {
        title: 'Executa una comanda',
        description:
          'Envilder obté cada secret del teu proveïdor al núvol i els escriu en un fitxer .env local. Idempotent i instantani.',
      },
      {
        title: 'El teu .env està llest',
        description:
          "Un fitxer d'entorn net i actualitzat — generat des de la font de veritat. Utilitza'l localment o injecta'l en CI/CD amb la GitHub Action.",
      },
    ],
    terminalFetched1: '✔ Obtingut DB_PASSWORD  → ···word',
    terminalFetched2: '✔ Obtingut API_KEY      → ···key',
    terminalFetched3: '✔ Obtingut SECRET_TOKEN → ···oken',
    terminalWritten: "✔ Fitxer d'entorn escrit a .env",
  },
  features: {
    title: 'Fet per a ',
    titleAccent: 'equips reals',
    subtitle:
      "Tot el que necessites per gestionar secrets d'entorn de forma segura i a escala.",
    features: [
      {
        icon: '☁️',
        title: 'Multi-Proveïdor',
        description:
          'AWS SSM, Azure Key Vault i GCP Secret Manager (pròximament). Tria amb --provider o $config al fitxer de mapeig.',
      },
      {
        icon: '🔄',
        title: 'Sincronització bidireccional',
        description:
          "Obté secrets a fitxers .env o puja valors .env al teu proveïdor al núvol. Suport complet d'anada i tornada.",
      },
      {
        icon: '⚙️',
        title: 'GitHub Action',
        description:
          'Action per als teus workflows CI/CD. Obté secrets en el moment del desplegament sense intervenció manual.',
      },
      {
        icon: '🔒',
        title: 'Accés IAM i RBAC',
        description:
          "Aprofita el control d'accés natiu del núvol. Les polítiques IAM d'AWS o RBAC d'Azure defineixen qui llegeix què, per entorn.",
      },
      {
        icon: '📊',
        title: 'Totalment auditable',
        description:
          'Cada lectura i escriptura queda registrada a AWS CloudTrail o Azure Monitor. Traçabilitat completa de qui ha accedit a què i quan.',
      },
      {
        icon: '🔁',
        title: 'Sincronització idempotent',
        description:
          "Només s'actualitza el que hi ha al teu mapeig. Res més es toca. Executa'l deu vegades — mateix resultat, zero efectes secundaris.",
      },
      {
        icon: '🧱',
        title: 'Zero infraestructura',
        description:
          'Construït sobre serveis natius del núvol. Sense Lambdas, sense servidors, sense infraestructura extra per gestionar o pagar.',
      },
      {
        icon: '👤',
        title: 'Suport de perfils AWS',
        description:
          'Configuració multi-compte? Utilitza --profile per canviar entre perfils AWS CLI. Perfecte per a entorns multi-etapa.',
      },
      {
        icon: '🚀',
        title: 'Mode Exec',
        description:
          'Injecta secrets directament en un procés fill sense escriure a disc. Zero fitxers .env, zero risc de fuites.',
        badge: 'Pròximament',
      },
    ],
  },
  demo: {
    title: "Mira'l en ",
    titleAccent: 'acció',
    subtitle:
      'Mira com Envilder simplifica la gestió de secrets en menys de 2 minuts.',
    cliDemo: 'Demo CLI — Obtenir Secrets',
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
  changelog: {
    title: 'Què hi ha de ',
    titleAccent: 'nou',
    subtitle:
      "Novetats de l'última versió. El suport multi-proveïdor ja és aquí.",
    releaseTitle: 'Suport Multi-Proveïdor',
    releaseDate: new Date(
      `${releaseMetadata.releaseDate}T00:00:00`,
    ).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    highlights: [
      {
        icon: '✨',
        text: 'Secció $config als fitxers de mapeig — declara proveïdor i detalls de connexió en línia',
      },
      {
        icon: '✨',
        text: "Suport d'Azure Key Vault — paritat completa amb AWS SSM",
      },
      { icon: '✨', text: 'Flags CLI --vault-url i --provider' },
      {
        icon: '✨',
        text: 'Normalització automàtica de noms de secrets per Azure (barres → guions)',
      },
      {
        icon: '⚠️',
        text: "Canvi incompatible: --ssm-path reanomenat a --secret-path (l'antic flag encara funciona com a àlies obsolet)",
      },
    ],
    fullChangelog: '📋 Historial complet',
    viewReleases: 'Veure totes les versions a GitHub →',
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
        status: 'next',
        label: '📦',
        title: 'TypeScript SDK (@envilder/sdk)',
        description:
          'Biblioteca nativa de runtime — carrega secrets directament a process.env des d’un map-file. Publicat a npm',
      },
      {
        status: 'next',
        label: '🐍',
        title: 'Python SDK (envilder)',
        description:
          'Biblioteca per a Django/FastAPI/pipelines de dades. Publicat a PyPI',
      },
      {
        status: 'next',
        label: '🐹',
        title: 'Go SDK (envilder)',
        description:
          'Biblioteca per a apps cloud-native i eines Kubernetes. Publicat com a mòdul Go',
      },
      {
        status: 'next',
        label: '🔵',
        title: '.NET SDK (Envilder)',
        description:
          'Biblioteca per a apps enterprise i Azure-native. Publicat a NuGet',
      },
      {
        status: 'next',
        label: '☕',
        title: 'Java SDK (envilder)',
        description:
          'Biblioteca per a Spring Boot i backends Android. Publicat a Maven Central',
      },
      {
        status: 'planned',
        label: '⚡',
        title: 'Mode exec (--exec)',
        description: 'Injecta secrets en un procés fill sense escriure a disc',
      },
      {
        status: 'planned',
        label: '☁️',
        title: 'GCP Secret Manager',
        description: 'Tercer proveïdor cloud — completa el trident multi-núvol',
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
          'Valida secrets al núvol vs .env local — falla CI si estan desincronitzats',
      },
    ],
  },
  getStarted: {
    title: 'Comença ',
    titleAccent: 'ara',
    subtitle: "En funcionament en menys d'un minut.",
    prerequisites: 'Prerequisits',
    prereqNode: 'Node.js v20+',
    prereqAws: 'AWS CLI configurat',
    prereqAzure: 'Azure CLI configurat',
    prereqIam: 'Permisos IAM:',
    prereqAwsNote: 'per AWS SSM',
    prereqAzureNote: 'per Azure Key Vault',
    install: 'Instal·lar',
    quickStart: 'Inici ràpid',
    step1:
      "Crea un param-map.json que mapegi variables d'entorn a rutes de secrets",
    step2: 'Executa envilder --map=param-map.json --envfile=.env',
    step3: 'El teu fitxer .env està llest ✔',
    terminalTitle: 'Inici ràpid',
    commentInstall: '# Instal·lar globalment',
    commentCreate: '# Crear fitxer de mapeig',
    commentPull: '# Obtenir secrets',
    commentPush: '# Pujar un secret',
    doneMessage: ' Fet! Fitxer .env generat.',
    pushSuccess: ' Secret pujat correctament.',
  },
  footer: {
    tagline:
      "Centralitza de forma segura les teves variables d'entorn des d'AWS SSM, Azure Key Vault o GCP Secret Manager.",
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
    title: 'Historial de canvis — Envilder',
    backToHome: "← Tornar a l'inici",
    fullChangelog: 'Historial de ',
    changelogAccent: 'canvis',
    intro: 'Historial complet de versions. Vegeu també',
    githubReleases: 'Versions a GitHub',
    versions: 'Versions',
    backToTop: 'Tornar a dalt',
  },
  docs: {
    title: 'Documentació — Envilder',
    backToHome: "← Tornar a l'inici",
    pageTitle: 'Documentació',
    intro: 'Tot el que necessites per començar amb Envilder.',
    sidebarGettingStarted: 'Primers passos',
    sidebarRequirements: 'Requisits',
    sidebarInstallation: 'Instal·lació',
    sidebarCredentials: 'Credencials del núvol',
    sidebarPermissions: 'Permisos IAM',
    sidebarCli: 'CLI',
    sidebarMappingFile: 'Fitxer de mapeig',
    sidebarPullCommand: 'Comanda pull',
    sidebarPushCommand: 'Comanda push',
    sidebarPushSingle: 'Push individual',
    sidebarGha: 'GitHub Action',
    sidebarGhaSetup: 'Configuració',
    sidebarGhaBasic: 'Exemple bàsic',
    sidebarGhaMultiEnv: 'Multi-entorn',
    sidebarGhaAzure: 'Exemple Azure',
    sidebarGhaInputs: 'Inputs i outputs',
    sidebarReference: 'Referència',
    sidebarConfigPriority: 'Prioritat de config',
    sidebarAzureSetup: 'Configuració Azure',
    overviewTitle: 'Què és Envilder?',
    overviewDesc:
      "Envilder és una eina CLI i GitHub Action que descarrega variables d'entorn d'un magatzem de secrets al núvol (AWS SSM Parameter Store o Azure Key Vault) i les escriu en un fitxer .env local — o les puja de tornada. Definiu un simple mapeig JSON entre noms de variables i rutes de secrets, i Envilder fa la resta.",
    overviewProblem:
      'Sense Envilder, els equips copien secrets a mà, els guarden en fitxers .env en text pla al repositori, o mantenen scripts de shell fràgils per cada entorn. Això porta a credencials filtrades, configuracions inconsistents i incorporacions lentes.',
    overviewSolution:
      "Amb Envilder, un fitxer param-map.json és la font única de veritat. Els secrets no surten del magatzem fins al moment d'execució, cada entorn utilitza el mateix mapeig, i un nou desenvolupador està operatiu amb una sola comanda.",
    reqTitle: 'Requisits',
    reqNode: 'Node.js v20+',
    reqAws: 'AWS CLI',
    reqAzure: 'Azure CLI',
    reqAwsNote: 'per AWS SSM',
    reqAzureNote: 'per Azure Key Vault',
    reqDownload: 'Descarregar',
    reqInstallGuide: "Guia d'instal·lació",
    installTitle: 'Instal·lació',
    credTitle: 'Credencials del núvol',
    credAwsTitle: 'AWS (per defecte)',
    credAwsDesc:
      'Envilder utilitza les teves credencials AWS CLI. Configura el perfil per defecte:',
    credAwsProfile: 'O utilitza un perfil amb nom:',
    credAzureTitle: 'Azure Key Vault',
    credAzureDesc:
      'Envilder utilitza Azure Default Credentials. Inicia sessió amb:',
    credAzureVault:
      "Proporciona l'URL del vault via $config al fitxer de mapeig o el flag --vault-url.",
    permTitle: 'Permisos IAM',
    permAwsTitle: 'AWS',
    permAwsDesc: 'El teu usuari o rol IAM necessita:',
    permOperation: 'Operació',
    permPermission: 'Permís',
    permPull: 'Pull',
    permPush: 'Push',
    permPolicyExample: 'Exemple de política IAM:',
    permAzureTitle: 'Azure',
    permAzureRbac: 'Recomanat — assigna Key Vault Secrets Officer via RBAC:',
    permAzurePullNote:
      'Per accés només de lectura, Key Vault Secrets User és suficient.',
    mapTitle: 'Fitxer de mapeig',
    mapIntro:
      "El fitxer de mapeig (param-map.json) és el nucli d'Envilder. És un fitxer JSON que mapeja noms de variables d'entorn (claus) a rutes de secrets (valors) al teu proveïdor al núvol.",
    mapCalloutStructure: 'Estructura:',
    mapCalloutKey:
      "Cada clau es converteix en un nom de variable d'entorn al teu fitxer .env.",
    mapCalloutValue:
      'Cada valor és la ruta on viu el secret al teu proveïdor al núvol.',
    mapBasicTitle: 'Format bàsic (AWS SSM — per defecte)',
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
      'Els noms de secrets de Key Vault només permeten caràcters alfanumèrics i guions. Envilder normalitza automàticament els noms — barres i guions baixos es converteixen en guions (p. ex., /myapp/db/password → myapp-db-password).',
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
      "La GitHub Action d'Envilder obté secrets d'AWS SSM o Azure Key Vault en fitxers .env durant el teu workflow CI/CD. No cal compilar — l'action està pre-construïda i llesta per utilitzar des de GitHub Marketplace.",
    ghaPrerequisites: 'Prerequisits',
    ghaPrereqAws:
      'AWS: Configura credencials amb aws-actions/configure-aws-credentials',
    ghaPrereqAzure: 'Azure: Configura credencials amb azure/login',
    ghaPrereqMap: 'Un param-map.json al teu repositori',
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
    azureSetupTitle: "Configuració d'Azure Key Vault",
    azureSetupCheck: "Comprova quin model d'accés utilitza el teu vault:",
    azureRbacTrue: 'true → Azure RBAC (recomanat)',
    azureRbacFalse: 'false / null → Vault Access Policy (clàssic)',
    azureOptionA: 'Opció A — Azure RBAC (recomanat)',
    azureOptionB: 'Opció B — Vault Access Policy',
    azureAccessNote:
      'Per accés només de lectura, get list és suficient. Afegeix set per push.',
  },
};
