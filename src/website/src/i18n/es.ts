import type { Translations } from './types';

export const es: Translations = {
  homeMeta: {
    title: 'Carga secretos de AWS SSM y Azure Key Vault | Envilder',
    description:
      'Envilder es una CLI, GitHub Action y SDK de runtime open source para cargar secretos desde AWS SSM Parameter Store y Azure Key Vault.',
    ogImageAlt:
      'Envilder - resolución de secretos open source para AWS SSM y Azure Key Vault',
  },
  notFound: {
    title: 'Página no encontrada | Envilder',
    description: 'La página de Envilder solicitada no existe.',
    heading: 'No hemos encontrado esta página',
    body: 'La dirección puede ser incorrecta o la página puede haberse movido.',
    home: 'Volver al inicio',
  },
  nav: {
    features: 'Funcionalidades',
    howItWorks: 'Cómo funciona',
    providers: 'Proveedores',
    githubAction: 'GitHub Action',
    sdks: 'SDKs',
    changelog: 'Cambios',
    docs: 'Docs',
    docsGettingStarted: 'Primeros pasos',
    docsCli: 'CLI',
    docsGha: 'GitHub Action',
    docsSdks: 'SDKs',
    docsReference: 'Referencia',
    getStarted: 'Empezar',
    ariaGithub: 'GitHub',
    ariaSponsor: 'Patrocinar',
    ariaToggleMenu: 'Abrir menú',
  },
  theme: {
    retro: 'Retro',
    light: 'Claro',
    ariaTheme: 'Tema',
  },
  hero: {
    title1: 'Estandariza cómo',
    title2: 'tus apps consumen',
    titleAccent: 'secretos.',
    description:
      'Deja de reinventar la carga de secretos en cada proyecto. Define un contrato de entorno y resuélvelo en todas partes.',
    positioning:
      'Resolución de secretos open source para AWS SSM y Azure Key Vault, para desarrollo local, CI/CD y el runtime de la aplicación.',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descOr: '·',
    descSuffix: ' · GitHub Action · SDKs de runtime',
    getStarted: '▶ Empezar',
    viewOnGithub: '★ Ver en GitHub',
    tabCli: 'CLI',
    tabCliDesc: 'escribe .env',
    tabExec: 'exec',
    tabExecDesc: 'sin fichero .env',
    tabSetup: 'Setup',
    tabSetupDesc: 'crea secretos',
    tabNode: 'Node.js',
    tabNodeDesc: 'en runtime',
    tabPython: 'Python',
    tabPythonDesc: 'en runtime',
    tabDotnet: '.NET',
    tabDotnetDesc: 'en runtime',
    terminalComment1: '# 1. Mapea variables a rutas SSM',
    terminalComment2: '# 2. Resuelve los secretos a .env',
    execComment1: '# Ejecuta cualquier comando con los secretos en memoria',
    execComment2: '# Nada escrito en disco',
    setupComment1: '# AWS CLI configurado con permisos a SSM',
    setupComment2: '# Sube cada secreto a SSM Parameter Store',
    sdkCommentLoad: '# Carga el mismo contrato en runtime',
    terminalSceneLabel: 'Escena de demostración del terminal',
  },
  trust: {
    label: 'COMPATIBLE CON',
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
    awsCreditsAlt: 'AWS Open Source Credits Program',
    awsCreditsLabel: 'AWS Open Source Credits',
  },
  problemSolution: {
    title: 'Por qué la gestión de secretos ',
    titleAccent: 'está rota',
    titleSuffix: '',
    subtitle:
      'Cada equipo, cada etapa, cada runtime gestiona los secretos de forma diferente. Sin estándar. Sin consistencia. Sin confianza.',
    problems: [
      {
        icon: 'skull',
        title: 'Fragmentada entre herramientas',
        description:
          'El entorno local usa archivos .env. CI/CD lee de integraciones con vaults. Producción tiene su propio método. Misma app, diferentes flujos de configuración.',
      },
      {
        icon: 'lock',
        title: 'Secretos compartidos por canales inseguros',
        description:
          'Claves API enviadas por Slack, archivos .env en repositorios, páginas wiki con credenciales en texto plano. Un incidente de seguridad esperando a ocurrir.',
      },
      {
        icon: 'snail',
        title: 'El desfase de configuración es inevitable',
        description:
          'Sin una fuente única de verdad sobre qué secretos necesita una app. Dev, staging y producción se desincronizan. Los despliegues fallan. Nadie sabe qué config es la correcta.',
      },
    ],
  },
  howItWorks: {
    title: 'Cómo ',
    titleAccent: 'funciona',
    subtitle: 'Define. Resuelve. Despliega.',
    stepLabel: 'PASO',
    steps: [
      {
        title: 'Define el modelo de mapeo',
        description:
          'Un archivo JSON que mapea nombres de variables de entorno a rutas de secretos en la nube. Haz commit. Revísalo en PRs. Compara entre entornos. Un modelo para cada etapa y runtime.',
      },
      {
        title: 'Resuelve con la CLI',
        description:
          'Un comando obtiene cada secreto de tu vault en la nube y los escribe en .env. Úsalo localmente o en scripts. Mismo mapeo, mismo comportamiento.',
      },
      {
        title: 'Carga en runtime con SDKs',
        description:
          'Sáltate el archivo .env por completo. Carga secretos directamente en tu aplicación al iniciar con SDKs nativos: Python, .NET, Node.js y más.',
      },
      {
        title: 'Push desde dev al vault',
        description:
          '¿Necesitas añadir o rotar un secreto? Sube valores desde tu entorno local al proveedor en la nube. Sin necesidad de consola.',
      },
      {
        title: 'Los secretos se quedan en tu vault',
        description:
          'Sin intermediarios. Tu nube gestiona el almacenamiento, la rotación y el control de acceso. Envilder resuelve, nunca almacena.',
      },
    ],
    terminalFetched1: '✔ Obtenido DB_PASSWORD  → ···word',
    terminalFetched2: '✔ Obtenido API_KEY      → ···key',
    terminalFetched3: '✔ Obtenido SECRET_TOKEN → ···oken',
    terminalWritten: '✔ Archivo de entorno escrito en .env',
    sdkTabPython: 'Python',
    sdkTabDotnet: '.NET',
    sdkTabNodejs: 'Node.js',
    pushTerminalPushed1: '✔ Subido DB_PASSWORD  → /my-app/prod/db-password',
    pushTerminalPushed2: '✔ Subido API_KEY      → /my-app/prod/api-key',
    pushTerminalPushed3: '✔ Subido SECRET_TOKEN → /my-app/prod/secret-token',
  },
  features: {
    title: 'Por qué ',
    titleAccent: 'Envilder?',
    subtitle:
      'Envilder es una capa de resolución sobre tu gestor de secretos existente. Los secretos se quedan en tu nube. El mapeo JSON es solo el contrato que mantiene cada entorno consistente.',
    highlights: [
      {
        icon: 'brick',
        title: 'Cero infraestructura',
        description:
          'Sin servidores, sin proxies, sin SaaS intermediario. Construido sobre AWS SSM y Azure Key Vault, servicios que ya usas y pagas.',
      },
      {
        icon: 'clipboard',
        title: 'Un archivo, todos los secretos',
        description:
          'Un solo contrato JSON define cada secreto para cada entorno. Versionado en Git, revisable en PRs, comparable. Tu equipo revisa cambios de secretos en el mismo PR que el código.',
      },
      {
        icon: 'refresh',
        title: 'Rotación de secretos segura',
        description:
          'Rota valores en AWS SSM o Azure Key Vault sin cambiar envilder.json. Los archivos .env generados solo se actualizan al volver a ejecutar Envilder; los consumidores de runtime deben reiniciarse o volver a resolver los secretos.',
      },
      {
        icon: 'cloud',
        title: 'Tu almacén de secretos, un contrato de mapeo',
        description:
          'Mantén los secretos en la configuración de AWS SSM o Azure Key Vault que ya utilizas. Envilder preserva el contrato de mapeo envilder.json entre herramientas; las credenciales y la migración de secretos siguen siendo específicas de cada proveedor.',
      },
    ],
    extrasTitle: 'También incluye',
    extras: [
      {
        icon: 'gear',
        title: 'GitHub Action',
        description:
          'Obtiene secretos en workflows CI/CD. Mismo mapeo, cero intervención manual.',
      },
      {
        icon: 'refresh',
        title: 'Sincronización bidireccional',
        description:
          'Obtiene en .env o sube valores .env a tu proveedor en la nube vía CLI.',
      },
      {
        icon: 'plug',
        title: 'Los secretos no tocan disco',
        description:
          'SDKs de runtime cargan secretos directamente en memoria al iniciar la app. Sin archivos .env escritos a disco.',
      },
      {
        icon: 'lock',
        title: 'IAM y RBAC nativo',
        description:
          'Políticas IAM de AWS o RBAC de Azure. Sin capa de auth extra.',
      },
      {
        icon: 'chart',
        title: 'Registros de acceso nativos del proveedor',
        description:
          'CloudTrail o Azure Monitor pueden registrar el acceso al proveedor cuando están configurados. Envilder no crea un registro de auditoría por sí mismo.',
      },
      {
        icon: 'person',
        title: 'Soporte de perfiles AWS',
        description:
          'Cambia entre perfiles AWS CLI para configuraciones multi-cuenta.',
      },
    ],
  },
  demo: {
    title: 'Míralo en ',
    titleAccent: 'acción',
    subtitle:
      'Mira cómo Envilder simplifica la gestión de secretos en menos de 2 minutos.',
    cliDemo: 'Demo CLI: Obtener Secretos',
    transcript:
      'Comando de la demo: envilder --map=envilder.json --envfile=.env. Envilder resuelve los secretos mapeados de tu proveedor en la nube configurado y escribe las variables resultantes en .env.',
    ghaWorkflow: 'Workflow de GitHub Action',
    comingSoon: 'Próximamente',
  },
  providers: {
    title: 'Tu nube. ',
    titleAccent: 'Tu elección.',
    subtitle:
      'Envilder funciona actualmente con AWS SSM Parameter Store y Azure Key Vault. GCP Secret Manager está planificado y aún no está disponible. Configura los proveedores disponibles en envilder.json o con flags CLI.',
    awsTitle: 'AWS SSM Parameter Store',
    awsDefault: 'Proveedor por defecto',
    awsFeatures: [
      'Soporte de GetParameter con WithDecryption',
      'Soporte de perfil AWS para multi-cuenta',
      'Control de acceso basado en políticas IAM',
      'Registro de acceso de CloudTrail cuando está configurado',
    ],
    azureTitle: 'Azure Key Vault',
    azureBadge: 'Nuevo en v0.8',
    azureFeatures: [
      'Auto-normaliza nombres de secretos (barras → guiones)',
      'Autenticación DefaultAzureCredential',
      'Control de acceso Azure RBAC',
      'Registro de acceso de Azure Monitor cuando está configurado',
    ],
    gcpTitle: 'GCP Secret Manager',
    gcpBadge: 'Planificado',
    gcpFeatures: [
      'Integración planificada con GCP Secret Manager',
      'No disponible en la CLI, la GitHub Action ni los SDKs de runtime',
    ],
    gcpRoadmapLink: 'Ver roadmap',
    configPriorityTitle: 'Prioridad de configuración',
    priorityHigh: 'Flags CLI / Inputs GHA',
    priorityMid: '$config en archivo de mapeo',
    priorityLow: 'Por defecto (AWS)',
  },
  gha: {
    title: 'GitHub Action',
    subtitle:
      'Obtén secretos en el momento del despliegue. Añádelo a cualquier workflow en minutos.',
    awsSsm: '☁️ AWS SSM',
    azureKeyVault: '🔑 Azure Key Vault',
    actionInputs: 'Inputs de la Action',
    thInput: 'Input',
    thRequired: 'Requerido',
    thDefault: 'Por defecto',
    thDescription: 'Descripción',
    inputMapDesc:
      'Ruta al archivo JSON que mapea variables de entorno a rutas de secretos',
    inputEnvDesc: 'Ruta al archivo .env a generar',
    inputProviderDesc: 'Proveedor en la nube: aws o azure (por defecto: aws)',
    inputVaultDesc: 'URL de Azure Key Vault',
    output: 'Output:',
    outputDesc: 'Ruta al archivo .env generado',
    yes: 'Sí',
    no: 'No',
  },
  sdks: {
    title: 'SDKs en tiempo de ejecución',
    subtitle:
      'Carga secretos directamente en tu aplicación al arrancar. Sin archivos .env, sin intermediarios. Solo tu vault en la nube y tu código.',
    pythonTitle: 'Python',
    pythonDesc:
      'Carga secretos con una línea. Compatible con AWS SSM y Azure Key Vault.',
    dotnetTitle: '.NET',
    dotnetDesc:
      'Integración nativa con IConfiguration. Resuelve secretos al arrancar.',
    nodejsTitle: 'Node.js',
    nodejsDesc:
      'Carga secretos directamente en Node.js. Mismo map-file, cero dependencias del CLI.',
    goTitle: 'Go',
    goDesc: 'Carga ligera de secretos para servicios Go.',
    javaTitle: 'Java',
    javaDesc: 'Soporte para Spring Boot y Java standalone.',
    install: 'Instalar',
    quickStart: 'Inicio rápido',
    available: 'Disponible',
    planned: 'Planificado',
    comingSoon: 'Próximamente',
    docsLink: 'Ver docs',
    packageLink: 'Paquete',
  },
  roadmap: {
    title: 'Qué viene ',
    titleAccent: 'ahora',
    subtitle: 'Envilder se desarrolla activamente. Aquí es adónde vamos.',
    upNext: 'Próximamente',
    items: [
      {
        status: 'done',
        label: '✅',
        title: 'Descargar secretos a .env',
        description:
          'Mapea nombres de variables de entorno a rutas de secretos en la nube vía JSON y genera archivos .env automáticamente',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Modo push (--push)',
        description:
          'Sube valores .env o secretos individuales al proveedor en la nube',
      },
      {
        status: 'done',
        label: '✅',
        title: 'GitHub Action',
        description: 'Usa Envilder en workflows CI/CD de forma nativa',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Multi-proveedor (AWS + Azure)',
        description: 'Soporte de AWS SSM Parameter Store y Azure Key Vault',
      },
      {
        status: 'done',
        label: '📖',
        title: 'Web de documentación',
        description:
          'Web de docs dedicada con guías, ejemplos y referencia API',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Python SDK (envilder)',
        description:
          'Librería para Django/FastAPI/pipelines de datos. Publicado en PyPI',
      },
      {
        status: 'done',
        label: '✅',
        title: '.NET SDK (Envilder)',
        description:
          'Librería para apps enterprise y Azure-native. Publicado en NuGet',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Node.js SDK (@envilder/sdk)',
        description:
          'Librería nativa de ejecución: carga secretos directamente en process.env desde un map-file. Publicado en npm',
      },
      {
        status: 'done',
        label: '✅',
        title: 'Modo exec (envilder exec)',
        description:
          'Ejecuta un comando con tus secretos en su entorno, sin escribir un archivo .env: envilder exec [options] [--] <command> [args...]',
      },
      {
        status: 'next',
        label: '🐹',
        title: 'Go SDK (envilder)',
        description:
          'Librería para apps cloud-native y herramientas Kubernetes. Se publicará como módulo Go',
      },
      {
        status: 'next',
        label: '☕',
        title: 'Java SDK (envilder)',
        description:
          'Librería para Spring Boot y backends Android. Se publicará en Maven Central',
      },
      {
        status: 'planned',
        label: '☁️',
        title: 'GCP Secret Manager',
        description:
          'Tercer proveedor cloud planificado; aún no está disponible',
      },
      {
        status: 'planned',
        label: '🔐',
        title: 'AWS Secrets Manager',
        description: 'Soporte de secretos JSON junto a SSM Parameter Store',
      },
      {
        status: 'planned',
        label: '✔️',
        title: 'Modo check/sync (--check)',
        description:
          'Valida secretos en la nube vs .env local. Falla CI si están desincronizados',
      },
    ],
  },
  getStarted: {
    title: 'Empieza ',
    titleAccent: 'ahora',
    subtitle: 'En funcionamiento en menos de un minuto.',
    prerequisites: 'Prerrequisitos',
    prereqNode: 'Node.js v22.12+',
    prereqProviderChoice: 'Elige un proveedor en la nube:',
    prereqAws: 'AWS SSM',
    prereqAzure: 'Azure Key Vault',
    prereqAwsNote:
      'credenciales AWS con ssm:GetParameter; añade ssm:PutParameter para --push',
    prereqAzureNote:
      'credenciales Azure con acceso Get a secretos; añade acceso Set para --push',
    install: 'Instalar',
    quickStart: 'Inicio rápido',
    step1:
      'Crea un envilder.json que mapee variables de entorno a rutas de secretos',
    step2: 'Ejecuta npx envilder',
    step3: 'Tu archivo .env está listo ✔',
    terminalTitle: 'Inicio rápido',
    commentCreate: '# Crear archivo de mapeo',
    commentPull: '# Obtener secretos',
    commentPush: '# Subir un secreto',
    doneMessage: '¡Hecho! Archivo .env generado.',
    sdkComment3: '# Los secretos ya están en os.environ',
    sdkExampleLink: 'Ver ejemplos ejecutables en GitHub',
  },
  footer: {
    tagline:
      'Un modelo de configuración para resolver secretos de forma consistente en todos los entornos y runtimes. Basado en tu infraestructura cloud existente.',
    project: 'Proyecto',
    documentation: 'Documentación',
    community: 'Comunidad',
    linkGithub: 'GitHub',
    linkNpm: 'npm',
    linkChangelog: 'Cambios',
    linkRoadmap: 'Hoja de ruta',
    linkGettingStarted: 'Empezar',
    linkPullCommand: 'Comando Pull',
    linkPushCommand: 'Comando Push',
    linkExecCommand: 'Comando Exec',
    linkGithubAction: 'GitHub Action',
    linkIssues: 'Incidencias',
    linkDiscussions: 'Discusiones',
    linkSecurity: 'Seguridad',
    linkSponsor: 'Patrocinar',
    license: 'Licencia MIT',
    copyright: 'Hecho con Astro. Código abierto en GitHub.',
    builtWith: 'Hecho con Astro. Código abierto en GitHub.',
  },
  changelogPage: {
    title: 'Cambios de Envilder: versiones de la CLI, GitHub Action y SDKs',
    description:
      'Historial de versiones de la CLI, GitHub Action y SDKs de runtime .NET, Python y Node.js de Envilder.',

    backToHome: '← Volver al inicio',
    fullChangelog: 'Historial de ',
    changelogAccent: 'cambios',
    intro: 'Historial completo de versiones. Ver también',
    releaseNotesLanguage: 'Las notas de versión se publican en inglés.',
    githubReleases: 'Versiones en GitHub',
    versions: 'Versiones',
    backToTop: 'Volver arriba',
    categoryCli: 'CLI',
    categoryGha: 'GitHub Action',
    categorySdks: 'SDKs',
    categorySdkDotnet: '.NET',
    categorySdkPython: 'Python',
    categorySdkNodejs: 'Node.js',
  },
  docs: {
    title: 'Docs Envilder: secretos con AWS SSM y Azure Key Vault',
    description:
      'Aprende a resolver variables de entorno desde AWS SSM Parameter Store y Azure Key Vault con la CLI, GitHub Action y SDKs de runtime de Envilder.',

    backToHome: '← Volver al inicio',
    pageTitle: 'Documentación de Envilder para AWS SSM y Azure Key Vault',
    intro: 'Todo lo que necesitas para empezar con Envilder.',
    pages: {
      hub: {
        title: 'Documentación de Envilder',
        description:
          'Guías para usar Envilder con AWS SSM Parameter Store, Azure Key Vault, la CLI, GitHub Action y SDKs de tiempo de ejecución.',
        heading: 'Documentación de Envilder',
        intro:
          'Elige una guía para configurar Envilder, resolver secretos o cargarlos en tiempo de ejecución.',
        breadcrumb: 'Documentación',
        navLabel: 'Documentación',
        cardTitle: 'Documentación de Envilder',
        cardSummary:
          'Encuentra guías de configuración, proveedores, CLI, GitHub Action y SDKs.',
      },
      'getting-started': {
        title: 'Primeros pasos con Envilder',
        description:
          'Instala Envilder y conoce los requisitos para resolver secretos desde tu proveedor en la nube.',
        heading: 'Primeros pasos',
        intro:
          'Instala Envilder, configura un proveedor y resuelve secretos desde un archivo de mapeo versionado.',
        breadcrumb: 'Primeros pasos',
        navLabel: 'Primeros pasos',
        cardTitle: 'Primeros pasos con Envilder',
        cardSummary:
          'Instala la CLI, revisa los requisitos y entiende el modelo de mapeo.',
      },
      'aws-ssm': {
        title: 'Usa Envilder con AWS SSM Parameter Store',
        description:
          'Configura las credenciales de AWS y los permisos IAM para Envilder con AWS SSM Parameter Store.',
        heading: 'AWS SSM',
        intro:
          'Configura credenciales, permisos IAM y un parámetro de prueba para AWS SSM Parameter Store.',
        breadcrumb: 'AWS SSM',
        navLabel: 'AWS SSM',
        cardTitle: 'Configuración de AWS SSM',
        cardSummary:
          'Configura las credenciales de AWS y los permisos que necesita Envilder.',
      },
      'azure-key-vault': {
        title: 'Usa Envilder con Azure Key Vault',
        description:
          'Configura la autenticación de Azure y el acceso a Key Vault para Envilder.',
        heading: 'Azure Key Vault',
        intro:
          'Configura la autenticación de Azure, el acceso al vault y un secreto de prueba para Azure Key Vault.',
        breadcrumb: 'Azure Key Vault',
        navLabel: 'Azure Key Vault',
        cardTitle: 'Configuración de Azure Key Vault',
        cardSummary:
          'Configura la autenticación de Azure y los permisos de Key Vault.',
      },
      'map-file': {
        title: 'Referencia del archivo de mapeo de Envilder',
        description:
          'Define mapeos de Envilder y la configuración del proveedor en envilder.json.',
        heading: 'Archivo de mapeo',
        intro:
          'Define los mapeos de variables de entorno y la configuración del proveedor en envilder.json.',
        breadcrumb: 'Archivo de mapeo',
        navLabel: 'Archivo de mapeo',
        cardTitle: 'Referencia del archivo de mapeo',
        cardSummary:
          'Asigna variables a rutas de secretos y configura el proveedor seleccionado.',
      },
      'cli-pull': {
        title: 'Descarga secretos con la CLI de Envilder',
        description:
          'Descarga secretos en la nube y genera un archivo .env local con Envilder.',
        heading: 'CLI pull',
        intro:
          'Descarga secretos del proveedor y escríbelos en un archivo .env local.',
        breadcrumb: 'CLI pull',
        navLabel: 'CLI pull',
        cardTitle: 'Comando CLI pull',
        cardSummary:
          'Genera un archivo .env con los secretos definidos en el archivo de mapeo.',
      },
      'cli-push': {
        title: 'Sube secretos con la CLI de Envilder',
        description:
          'Sube variables de entorno locales o un secreto con el modo push de Envilder.',
        heading: 'CLI push',
        intro:
          'Sube variables de entorno desde un archivo .env o envía un secreto directamente.',
        breadcrumb: 'CLI push',
        navLabel: 'CLI push',
        cardTitle: 'Comando CLI push',
        cardSummary: 'Sube un archivo .env mapeado o un secreto al proveedor.',
      },
      'cli-exec': {
        title: 'Ejecuta un comando con secretos de AWS SSM o Azure Key Vault',
        description:
          'Referencia de envilder exec: resuelve secretos de AWS SSM o Azure Key Vault en memoria y arranca tu comando con ellos, sin escribir ningún archivo .env.',
        heading: 'CLI exec',
        intro:
          'Ejecuta un comando con los secretos en su entorno, sin escribir ningún archivo .env.',
        breadcrumb: 'CLI exec',
        navLabel: 'CLI exec',
        cardTitle: 'Comando CLI exec',
        cardSummary:
          'Arranca un comando con los secretos mapeados en memoria, sin archivo .env.',
      },
      'github-action': {
        title: 'Carga secretos de AWS SSM y Azure Key Vault en GitHub Actions',
        description:
          'Carga secretos de AWS SSM Parameter Store o Azure Key Vault en un archivo .env en GitHub Actions con OIDC: permisos IAM y RBAC mínimos, workflows completos y errores de credenciales.',
        heading:
          'Carga secretos de AWS SSM y Azure Key Vault en GitHub Actions',
        intro:
          '¿Cómo usas secretos de AWS SSM Parameter Store o Azure Key Vault en un job de GitHub Actions sin copiarlos a GitHub Secrets? Autentica el job con OIDC y deja que la Action de Envilder lea tu envilder.json versionado y escriba un archivo .env para los pasos siguientes.',
        breadcrumb: 'GitHub Action',
        navLabel: 'GitHub Action',
        cardTitle: 'Guía de GitHub Action',
        cardSummary: 'Configura la acción para AWS, Azure y varios entornos.',
      },
      'sdk-dotnet': {
        title: 'SDK .NET de Envilder',
        description:
          'Carga secretos de archivos de mapeo de Envilder en aplicaciones .NET.',
        heading: 'SDK .NET',
        intro:
          'Carga secretos directamente en una aplicación .NET al iniciarse.',
        breadcrumb: 'SDK .NET',
        navLabel: 'SDK .NET',
        cardTitle: 'Guía del SDK .NET',
        cardSummary: 'Instala y usa el SDK de tiempo de ejecución .NET.',
      },
      'sdk-python': {
        title: 'SDK Python de Envilder',
        description:
          'Carga secretos de archivos de mapeo de Envilder en aplicaciones Python.',
        heading: 'SDK Python',
        intro:
          'Carga secretos directamente en una aplicación Python al iniciarse.',
        breadcrumb: 'SDK Python',
        navLabel: 'SDK Python',
        cardTitle: 'Guía del SDK Python',
        cardSummary: 'Instala y usa el SDK de tiempo de ejecución Python.',
      },
      'sdk-nodejs': {
        title: 'SDK Node.js de Envilder',
        description:
          'Carga secretos de archivos de mapeo de Envilder en aplicaciones Node.js.',
        heading: 'SDK Node.js',
        intro:
          'Carga secretos directamente en una aplicación Node.js al iniciarse.',
        breadcrumb: 'SDK Node.js',
        navLabel: 'SDK Node.js',
        cardTitle: 'Guía del SDK Node.js',
        cardSummary: 'Instala y usa el SDK de tiempo de ejecución Node.js.',
      },
    },
    breadcrumbLabel: 'Migas de pan',
    breadcrumbHome: 'Inicio',
    breadcrumbDocs: 'Documentación',
    navigationLabel: 'Navegación de documentación',
    mobileNavigation: 'Elige una página de documentación',
    navGettingStarted: 'Primeros pasos',
    navProviders: 'Proveedores',
    hubCardsLabel: 'Guías de documentación',
    openPage: 'Abrir guía',
    pagerLabel: 'Páginas de documentación',
    sidebarGettingStarted: 'Primeros pasos',
    sidebarRequirements: 'Requisitos',
    sidebarInstallation: 'Instalación',
    sidebarAwsSetup: 'Configuración AWS',
    sidebarAzureSetup: 'Configuración Azure',
    sidebarCli: 'CLI',
    sidebarMappingFile: 'Archivo de mapeo',
    sidebarPullCommand: 'Comando pull',
    sidebarPushCommand: 'Comando push',
    sidebarPushSingle: 'Push individual',
    sidebarConfigPriority: 'Prioridad de config',
    sidebarGha: 'GitHub Action',
    sidebarGhaSetup: 'Configuración',
    sidebarGhaBasic: 'Ejemplo AWS',
    sidebarGhaAzure: 'Ejemplo Azure',
    sidebarGhaMultiEnv: 'Multi-entorno',
    sidebarGhaInputs: 'Inputs y outputs',
    overviewTitle: '¿Qué es Envilder?',
    overviewDesc:
      'Envilder es un sistema de resolución de configuración basado en un modelo. Defines un mapeo JSON entre nombres de variables y rutas de secretos en la nube, y Envilder los resuelve de forma consistente: vía la CLI para desarrollo local, la GitHub Action para CI/CD o los SDKs de runtime para el inicio de la aplicación. Funciona con AWS SSM Parameter Store y Azure Key Vault.',
    overviewProblem:
      'Sin Envilder, los equipos fragmentan la gestión de secretos entre herramientas y etapas. El entorno local usa archivos .env, CI/CD lee de integraciones con vaults, producción tiene su propio método. Esto provoca desfase de configuración, credenciales filtradas e incorporaciones lentas.',
    overviewSolution:
      'Con Envilder, un modelo de mapeo es la fuente única de verdad. Los secretos se resuelven desde tu vault en la nube bajo demanda: mismo contrato, mismo comportamiento, ya sea ejecutando la CLI localmente, la GitHub Action en CI o un SDK al iniciar la app.',
    reqTitle: 'Requisitos',
    reqNode: 'Node.js v22.12+',
    reqAws: 'AWS CLI',
    reqAzure: 'Azure CLI',
    reqAwsNote: 'para AWS SSM',
    reqAzureNote: 'para Azure Key Vault',
    reqDownload: 'Descargar',
    reqInstallGuide: 'Guía de instalación',
    installTitle: 'Instalación',
    installNext: 'Y ahora, elige cómo llegan los secretos a tu aplicación:',
    installNextPull: 'CLI pull: genera un archivo .env',
    installNextExec:
      'CLI exec: ejecuta tu comando con los secretos en memoria, sin .env',
    // AWS setup
    awsSetupTitle: 'Configuración AWS',
    awsSetupIntro:
      'Todo lo que necesitas para usar Envilder con AWS SSM Parameter Store.',
    awsSetupCredTitle: '1. Configura las credenciales',
    awsSetupCredDesc:
      'Envilder usa tus credenciales AWS CLI. Configura el perfil por defecto:',
    awsSetupCredProfile:
      'O usa un perfil con nombre para configuraciones multi-cuenta:',
    awsSetupPermTitle: '2. Otorga permisos IAM',
    awsSetupPermDesc:
      'Tu usuario o rol IAM necesita acceso a los parámetros SSM:',
    awsSetupPermOperation: 'Operación',
    awsSetupPermPermission: 'Permiso',
    awsSetupPermPull: 'Pull',
    awsSetupPermPush: 'Push',
    awsSetupPolicyExample:
      'Ejemplo de política IAM (limita a tu prefijo de ruta):',
    awsSetupVerifyTitle: '3. Crea un parámetro de prueba y verifica',
    awsSetupVerifyDesc:
      'Crea un parámetro en SSM y luego haz pull con Envilder para confirmar que todo funciona:',
    awsSetupVerifySuccess:
      'Si ves ✔ Fetched, la configuración AWS está completa.',
    awsSetupVerifySdk:
      'O carga secretos directamente desde tu app con el Python SDK:',
    // Azure setup
    azureSetupTitle: 'Configuración Azure',
    azureSetupIntro:
      'Todo lo que necesitas para usar Envilder con Azure Key Vault.',
    azureSetupCredTitle: '1. Autentícate con Azure',
    azureSetupCredDesc:
      'Envilder usa Azure Default Credentials. Inicia sesión con:',
    azureSetupCredVault:
      'Proporciona la URL del vault vía $config en el archivo de mapeo o el flag --vault-url.',
    azureSetupAccessTitle: '2. Configura el acceso al vault',
    azureSetupCheck: 'Comprueba qué modelo de acceso usa tu vault:',
    azureRbacTrue: 'true → Azure RBAC (recomendado)',
    azureRbacFalse: 'false / null → Vault Access Policy (clásico)',
    azureOptionA: 'Opción A: Azure RBAC (recomendado)',
    azureOptionB: 'Opción B: Vault Access Policy',
    azureSetupPermTitle: '3. Permisos necesarios',
    azureSetupPermOperation: 'Operación',
    azureSetupPermPermission: 'Permiso',
    azureSetupPermPull: 'Pull',
    azureSetupPermPush: 'Push',
    azureSetupPullNote:
      'Para acceso solo de lectura, el rol Key Vault Secrets User es suficiente.',
    azureSetupVerifyTitle: '4. Crea un secreto de prueba y verifica',
    azureSetupVerifyDesc:
      'Crea un secreto en Key Vault y luego haz pull con Envilder para confirmar que todo funciona:',
    azureSetupVerifySuccess:
      'Si ves ✔ Fetched, la configuración Azure está completa.',
    azureSetupVerifySdk:
      'O carga secretos directamente desde tu app con el Python SDK:',
    mapTitle: 'Archivo de mapeo',
    mapIntro:
      'El archivo de mapeo (envilder.json) es el núcleo de Envilder. Es un archivo JSON que mapea nombres de variables de entorno (claves) a rutas de secretos (valores) en tu proveedor en la nube.',
    mapCalloutStructure: 'Estructura:',
    mapCalloutKey:
      'Cada clave se convierte en un nombre de variable de entorno en tu archivo .env.',
    mapCalloutValue:
      'Cada valor es la ruta donde vive el secreto en tu proveedor en la nube.',
    mapBasicTitle: 'Formato básico (AWS SSM, por defecto)',
    mapBasicDesc:
      'Cuando no hay sección $config, Envilder usa AWS SSM Parameter Store por defecto. Los valores deben ser rutas de parámetros SSM válidas (normalmente comenzando con /):',
    mapBasicGenerates: 'Esto genera:',
    mapConfigTitle: 'La sección $config',
    mapConfigDesc:
      'Añade una clave $config a tu archivo de mapeo para declarar qué proveedor en la nube usar y su configuración. Envilder lee $config para la configuración y trata todas las demás claves como mapeos de secretos.',
    mapConfigOptionsTitle: 'Opciones de $config',
    mapThKey: 'Clave',
    mapThType: 'Tipo',
    mapThDefault: 'Por defecto',
    mapThDescription: 'Descripción',
    mapProviderDesc: 'Proveedor en la nube a usar',
    mapVaultUrlDesc:
      'URL de Azure Key Vault (requerido cuando el proveedor es "azure")',
    mapProfileDesc:
      'Perfil AWS CLI para configuraciones multi-cuenta (solo AWS)',
    mapAwsProfileTitle: 'AWS SSM con perfil',
    mapAwsProfileDesc:
      'Para usar un perfil AWS CLI específico (útil para configuraciones multi-cuenta), añade profile a $config:',
    mapAwsProfileExplain:
      'Esto indica a Envilder que use el perfil prod-account de tu archivo ~/.aws/credentials en lugar del perfil por defecto.',
    mapAzureTitle: 'Azure Key Vault',
    mapAzureDesc:
      'Para Azure Key Vault, establece provider a "azure" y proporciona el vaultUrl:',
    mapAzureWarningTitle: 'Convención de nombres Azure:',
    mapAzureWarningDesc:
      'Los nombres de secretos de Key Vault solo permiten caracteres alfanuméricos y guiones. Envilder normaliza automáticamente los nombres: barras y guiones bajos se convierten en guiones (ej., /myapp/db/password → myapp-db-password).',
    mapDifferencesTitle: 'Diferencias clave por proveedor',
    mapThEmpty: '',
    mapThAwsSsm: 'AWS SSM',
    mapThAzureKv: 'Azure Key Vault',
    mapSecretPathFormat: 'Formato de ruta de secreto',
    mapAwsPathFormat: 'Rutas de parámetros con barras',
    mapAzurePathFormat: 'Nombres con guiones',
    mapRequiredConfig: '$config requerido',
    mapAwsRequiredConfig: 'Ninguno (AWS es por defecto)',
    mapAzureRequiredConfig: 'provider + vaultUrl',
    mapOptionalConfig: '$config opcional',
    mapAuthentication: 'Autenticación',
    mapAwsAuth: 'Credenciales AWS CLI',
    mapAzureAuth: 'Azure Default Credentials',
    mapMultiEnvTitle: 'Múltiples entornos',
    mapMultiEnvDesc:
      'Un patrón común es tener un archivo de mapeo por entorno. La estructura es la misma, solo cambian las rutas de los secretos:',
    mapMultiEnvThenPull: 'Luego obtén el correcto:',
    mapOverrideTitle: 'Sobreescribir $config con flags CLI',
    mapOverrideDesc:
      'Los flags CLI siempre tienen prioridad sobre los valores de $config. Esto te permite establecer valores por defecto en el archivo y sobreescribirlos por invocación:',
    mapOverrideComment1: '# Usa $config del archivo de mapeo tal cual',
    mapOverrideComment2:
      '# Sobreescribe proveedor y URL del vault, ignorando $config',
    mapOverrideComment3: '# Sobreescribe solo el perfil AWS',
    mapPriorityNote:
      'Orden de prioridad: flags CLI / inputs GHA → $config en archivo de mapeo → por defecto (AWS).',
    pullTitle: 'Comando pull',
    pullDesc:
      'Descarga secretos de tu proveedor en la nube y genera un archivo .env local.',
    pullOptions: 'Opciones',
    pullExamples: 'Ejemplos',
    pullOutput: 'Salida',
    optionHeader: 'Opción',
    pullOptMap: 'Ruta al archivo JSON de mapeo',
    pullOptEnv: 'Ruta donde escribir el .env',
    pullOptProvider: 'aws (por defecto) o azure',
    pullOptVault: 'URL de Azure Key Vault',
    pullOptProfile: 'Perfil AWS CLI a usar',
    pullCommentDefault: '# Por defecto (AWS SSM)',
    pullCommentProfile: '# Con perfil AWS',
    pullCommentAzureConfig: '# Azure vía $config en archivo de mapeo',
    pullCommentAzureFlags: '# Azure vía flags CLI',
    pullOutputTitle: 'Salida',
    pullExecTitle: '¿No quieres un archivo .env?',
    pullExecDesc:
      'Usa envilder exec: resuelve el mismo map file y arranca tu comando con los secretos en su entorno, sin escribir nada en disco.',
    pullExecGuideLink: 'Consulta la guía de CLI exec',
    execTitle: 'Comando exec',
    execDesc:
      'envilder exec resuelve todos los secretos del map file y arranca un comando con esos valores en su entorno. No se escribe nada en disco: no hay ningún archivo .env que añadir al .gitignore, mantener sincronizado o borrar. El map file y su $config funcionan exactamente igual que en el modo pull.',
    execUsageTitle: 'Uso',
    execSeparatorTitle: 'Dónde empieza tu comando: la regla del --',
    execSeparatorDesc:
      'Primero van las opciones de Envilder. Tu comando empieza en el primer argumento que no es una opción de Envilder, o justo después del -- si lo hay. Todo lo que viene a continuación llega tal cual a tu comando, aunque parezca una opción de Envilder. El -- es opcional: solo lo necesitas cuando el propio comando empieza por -.',
    execSepComment1: '# Todo es de npm',
    execSepComment2: '# --map es de Envilder, el resto es de npm',
    execSepComment3: '# --map=x es de npm: va después del comando',
    execSepComment4: '# Lo mismo, con un separador explícito',
    execOptions: 'Opciones',
    execOptMap: 'Ruta al map file (por defecto: envilder.json)',
    execOptProfile: 'Perfil AWS CLI. Tiene prioridad sobre $config.profile',
    execOptProvider: 'aws o azure. Tiene prioridad sobre $config.provider',
    execOptVault:
      'URL del Azure Key Vault. Tiene prioridad sobre $config.vaultUrl',
    execOptionsOrderDesc:
      'Las opciones de Envilder van después de exec, nunca antes. Una opción escrita antes de exec se rechaza con el código de salida 125, y Envilder te muestra el comando corregido:',
    execRejectedDesc:
      'El modo exec nunca lee ni escribe ningún archivo .env y nunca sube secretos, así que --envfile, --push, --key, --value y --secret-path se rechazan con el código de salida 125 antes de cualquier llamada al proveedor. Una opción desconocida antes del comando también es un error: una errata como --mapp nunca llega a tu comando por accidente.',
    execExamples: 'Ejemplos',
    execCommentNpx:
      '# Arranca el servidor de desarrollo con los secretos de envilder.json',
    execCommentMap: '# Usa un map file concreto',
    execCommentAzure: '# Azure Key Vault con flags de la CLI',
    execCommentDocker:
      '# Docker Compose puede interpolar los secretos en compose.yaml',
    execPackageJsonDesc: 'O intégralo en los scripts de tu package.json:',
    execOutputTitle: 'Salida',
    execOutputDesc:
      'El stdout es de tu comando. Toda la salida de Envilder va a stderr, así que envilder exec -- node print.js > out.json solo escribe en out.json la salida de tu comando. Si todo va bien, Envilder muestra una única línea de resumen que solo nombra el programa, porque los argumentos pueden contener secretos:',
    execBehaviorTitle: 'Comportamiento',
    execExitTitle: 'Códigos de salida',
    execExitDesc:
      'Los códigos de salida siguen los de GNU env y docker run, así puedes distinguir un fallo de Envilder del código de salida de tu comando:',
    execThCode: 'Código',
    execThMeaning: 'Significado',
    execThMessage: 'Mensaje',
    execExitChild: 'Tu comando terminó con el código n',
    execExitSignal:
      'Tu comando fue detenido por la señal n (por ejemplo, 137 para SIGKILL)',
    execExit125:
      'Envilder falló antes de arrancar el comando: opciones incorrectas, comando ausente, ningún map file, secretos sin resolver o credenciales caducadas',
    execExit126:
      'El comando existe pero el sistema operativo impidió ejecutarlo (por ejemplo, Permission denied)',
    execExit127: 'No se encontró el comando',
    execExitNote: 'Los modos pull y push siguen saliendo con 1 cuando fallan.',
    execFailClosedTitle: 'Fail-closed',
    execFailClosedDesc:
      'El modo pull avisa y se salta un secreto que falta. El modo exec nunca arranca tu comando con un conjunto de secretos incompleto: si algún secreto falta, está vacío o no se puede leer (por ejemplo, por acceso denegado), el comando no arranca, Envilder lista las variables afectadas con sus rutas enmascaradas y sale con 125. Los valores se resuelven una sola vez, al arrancar el comando.',
    execEnvTitle: 'Entorno',
    execEnvDesc:
      'Tu comando hereda todo el entorno de la shell que ejecuta Envilder, más todas las variables del map file. Manda el map file: cuando una variable heredada tiene el mismo nombre que una mapeada, el comando recibe el valor del proveedor, y Envilder muestra los nombres (nunca los valores) en stderr:',
    execNoShellDesc:
      "Envilder no arranca ninguna shell adicional: los argumentos llegan a tu comando como una lista. Pero tu propia shell interpreta la línea antes, así que pon entre comillas lo que no deba interpretar: '$DB_URL' o '&&' entre comillas simples llegan literalmente al comando, mientras que un $DB_URL sin comillas se expande con el valor de tu shell (no con el secreto resuelto) y un && sin comillas ejecuta un segundo comando fuera de envilder exec. Si necesitas funciones de la shell con los secretos, arranca una explícitamente:",
    execGhaTitle: 'Enmascarado en GitHub Actions',
    execGhaDesc:
      'Cuando GITHUB_ACTIONS=true, Envilder registra cada valor resuelto en el enmascarado de logs de GitHub (::add-mask::), de modo que los valores que imprima tu comando aparecen enmascarados en el log del job. Todos los registros se escriben en stderr antes de que arranque el comando; si alguno no se puede escribir, el comando no arranca (código de salida 125). La GitHub Action de Envilder no ofrece el modo exec: ejecuta la CLI desde un paso run.',
    execGhaNote:
      'No redirijas el stderr de envilder exec fuera del log del paso (por ejemplo, con 2> fichero o 2>/dev/null): es de ahí de donde el runner lee las máscaras. El runner lee stdout y stderr por canales separados, así que un valor que tu comando imprima enseguida puede llegar al log, en casos raros, antes de que se haya procesado su máscara.',
    execSignalsTitle: 'Señales',
    execSignalsDesc:
      'stdin, stdout y stderr se heredan y se conserva el TTY, así que los REPL, las shells y las preguntas interactivas funcionan como siempre. El Ctrl+C de un terminal llega directamente a tu comando. SIGTERM y SIGHUP (por ejemplo, de docker stop o Kubernetes) se reenvían al comando, y Envilder espera a que termine, sin ningún tiempo límite propio, antes de devolver su código de salida. Las señales solo llegan al hijo directo: un lanzador como npm debe encargarse de detener a sus propios hijos.',
    execSandboxTitle: 'No es un sandbox.',
    execSandboxDesc:
      'El modo exec nunca crea un archivo .env y no toca los que ya existen: si vienes del modo pull, borra tú mismo tu .env antiguo. No aísla el proceso. Tu comando y todos los procesos que arranque pueden leer los secretos de su entorno, incluida cualquier herramienta o agente de IA de programación que ejecute env o printenv a través de él. En Linux, otros procesos del mismo usuario pueden leer /proc/<pid>/environ. Ejecuta solo comandos de confianza con los secretos que mapeas.',
    execGuideLink:
      'Guía completa del comando exec en GitHub: detalles de Windows, recuperación SSO y todos los mensajes de error',
    examplesTitle: 'Ejemplos ejecutables.',
    execExamplesDesc:
      'Arranca LocalStack con envilder exec docker run, con el token de autenticación resuelto desde AWS SSM y sin escribirlo nunca en disco, o sigue paso a paso push, pull y exec con npx envilder:',
    pushTitle: 'Comando push',
    pushDesc:
      'Sube variables de entorno de un archivo .env local a tu proveedor en la nube usando un archivo de mapeo.',
    pushOptions: 'Opciones',
    pushExamples: 'Ejemplos',
    pushOptPush: 'Activa el modo push (requerido)',
    pushOptEnv: 'Ruta a tu archivo .env local (por defecto: .env)',
    pushOptMap:
      'Ruta al JSON de mapeo de parámetros (por defecto: envilder.json)',
    pushOptProvider: 'aws (por defecto) o azure',
    pushOptVault: 'URL de Azure Key Vault',
    pushOptProfile: 'Perfil AWS CLI (solo AWS)',
    pushCommentAws: '# Subir a AWS SSM (por defecto envilder.json y .env)',
    pushCommentProfile: '# Con perfil AWS',
    pushCommentAzureConfig: '# Azure vía $config en archivo de mapeo',
    pushCommentAzureFlags: '# Azure vía flags CLI',
    pushSingleTitle: 'Subir variable individual',
    pushSingleDesc:
      'Sube una variable de entorno individual directamente a tu proveedor en la nube sin usar ningún archivo .env.',
    pushSingleOptions: 'Opciones',
    pushSingleOptPush:
      'Opcional: --key, --value y --secret-path ya activan el modo push',
    pushSingleOptKey: 'Nombre de la variable de entorno',
    pushSingleOptValue: 'Valor a almacenar',
    pushSingleOptPath: 'Ruta completa del secreto en tu proveedor en la nube',
    pushSingleOptMap:
      'Opcional: archivo de mapeo del que leer $config (por defecto: envilder.json si existe; nunca requerido para una subida individual)',
    pushSingleOptProvider: 'aws (por defecto) o azure',
    pushSingleOptVault: 'URL de Azure Key Vault',
    pushSingleOptProfile: 'Perfil AWS CLI (solo AWS)',
    ghaSetupTitle: 'Cómo funciona la Action',
    ghaSetupDesc:
      'La Action es un paso compuesto: instala Node.js 22, lee el archivo de mapeo, obtiene cada secreto con las credenciales de nube que ya tiene el job, enmascara cada valor en el log y escribe el archivo .env. No inicia sesión en AWS ni en Azure por sí misma, así que debe hacerlo un paso anterior (aws-actions/configure-aws-credentials o azure/login). Usa la etiqueta publicada macalbert/envilder/github-action@v0; no hace falta ningún paso de compilación.',
    ghaPrerequisites: 'Prerrequisitos',
    ghaPrereqAws:
      'AWS: un rol IAM que GitHub pueda asumir, usado a través de aws-actions/configure-aws-credentials.',
    ghaPrereqAzure:
      'Azure: un registro de aplicación con una credencial federada, usado a través de azure/login.',
    ghaPrereqMap: 'Un envilder.json en tu repositorio',
    ghaPullOnly: 'La GitHub Action solo soporta el modo pull (sin push).',
    ghaBasicTitle: 'AWS SSM Parameter Store con OIDC',
    ghaMultiEnvTitle: 'Workflow multi-entorno',
    ghaAzureTitle: 'Azure Key Vault con OIDC',
    ghaInputsTitle: 'Inputs y outputs de la Action',
    ghaInputsSubtitle: 'Inputs',
    ghaOutputsSubtitle: 'Outputs',
    ghaInputRequired: 'Requerido',
    ghaInputDefault: 'Por defecto',
    ghaInputDesc: 'Descripción',
    ghaOutputEnvPath: 'Ruta al archivo .env generado',
    ghaThInput: 'Input',
    ghaThRequired: 'Requerido',
    ghaThOutput: 'Output',
    ghaYes: 'Sí',
    ghaNo: 'No',
    ghaInputMap: 'Ruta al archivo JSON de mapeo',
    ghaInputEnv: 'Ruta al archivo .env a generar',
    ghaInputProvider: 'aws o azure',
    ghaInputVault: 'URL de Azure Key Vault',
    ghaPrereqCheckout:
      'actions/checkout antes de la Action, para que el archivo de mapeo exista en el runner.',
    ghaPrereqPermissions:
      'El permiso id-token: write, para que el job pueda pedir un token OIDC, y contents: read.',
    ghaAwsTrustTitle: '1. Permite que GitHub asuma un rol IAM',
    ghaAwsTrustDesc:
      'Añade token.actions.githubusercontent.com como proveedor de identidad OpenID Connect en IAM (audiencia sts.amazonaws.com, una vez por cuenta) y crea un rol con esta política de confianza. La condición sub lo limita a un repositorio y una rama; usa repo:my-org/my-repo:environment:production para limitarlo a un entorno de GitHub.',
    ghaOidcSubjectNote:
      'En github.com, los repositorios creados, renombrados o transferidos a partir del 15 de julio de 2026, y los que han activado los sujetos inmutables, reciben un sub que también incluye los ID del propietario y del repositorio: repo:my-org@OWNER_ID/my-repo@REPO_ID:ref:refs/heads/main. El resto mantiene el formato solo con nombres que se muestra arriba. Consulta la configuración OIDC de tu repositorio para conocer el prefijo exacto y usa el mismo valor en la política de confianza de AWS y en la credencial federada de Azure.',
    ghaAwsPolicyTitle: '2. Permisos mínimos',
    ghaAwsPolicyDesc:
      'La Action llama a ssm:GetParameter con descifrado, una vez por cada entrada del archivo de mapeo. No lista, escribe ni borra parámetros, así que es el único permiso que necesita el rol. Limítalo a la ruta de tu aplicación:',
    ghaAwsKmsNote:
      'Los parámetros SecureString cifrados con la clave por defecto aws/ssm no necesitan nada más. Si usan una clave KMS administrada por el cliente, permite también kms:Decrypt sobre esa clave. La cuenta que aparece en el log viene de sts:GetCallerIdentity, que no necesita ningún permiso.',
    ghaWorkflowTitle: '3. Archivo de mapeo y workflow',
    ghaAwsMapDesc:
      'El archivo de mapeo es el mismo que usas con la CLI: cada variable de entorno apunta al nombre de un parámetro.',
    ghaOutputTitle: 'Salida esperada',
    ghaOutputDesc:
      'El log del paso muestra la identidad de AWS en uso, cada variable resuelta con el valor enmascarado y un resumen:',
    ghaOutputMaskNote:
      'Cada valor se registra también con el comando add-mask de GitHub, de modo que un paso posterior que lo imprima muestra ***. El archivo .env se queda en el runner; no lo subas como artefacto.',
    ghaAzureFedTitle: '1. Crea una credencial federada',
    ghaAzureFedDesc:
      'Crea un registro de aplicación y su service principal, y añade una credencial federada que confíe en los tokens de un repositorio y una rama. No se crea ningún secreto de cliente. El sujeto usa el mismo formato que el sub de AWS, incluida la variante inmutable cuando tu repositorio la emite.',
    ghaAzureRoleTitle: '2. Rol mínimo',
    ghaAzureRoleDesc:
      'Key Vault Secrets User permite leer los valores de los secretos y nada más. Asígnalo sobre el vault, no sobre el grupo de recursos ni la suscripción:',
    ghaAzurePolicyNote:
      'Si el vault usa directivas de acceso en lugar de Azure RBAC, concede get sobre los secretos: az keyvault set-policy --name {VAULT} --spn {APP_ID} --secret-permissions get.',
    ghaAzureMapDesc:
      'Con $config en el archivo de mapeo, el workflow no necesita los inputs provider ni vault-url. Los nombres de Key Vault solo admiten letras, dígitos y guiones, así que Envilder convierte las rutas: /myapp/prod/stripe_key se lee como myapp-prod-stripe-key (sin la barra inicial, barras y guiones bajos convertidos en guiones, en minúsculas).',
    ghaAzureInputsNote:
      'Los ID de cliente, tenant y suscripción identifican la aplicación; no son credenciales, así que basta con variables del repositorio. Si se informan, los inputs provider y vault-url sobrescriben el $config del archivo de mapeo.',
    ghaMultiEnvDesc:
      'Ten un archivo de mapeo por entorno y elígelo desde el input del workflow. Un job que define environment recibe un token OIDC con un sub que termina en :environment:<nombre> en lugar de :ref:refs/heads/main, así que la política de confianza de AWS (o la credencial federada de Azure) de cada entorno debe usar ese sujeto: repo:my-org/my-repo:environment:production, o repo:my-org@OWNER_ID/my-repo@REPO_ID:environment:production si tu repositorio emite sujetos inmutables. Después, cada entorno de GitHub puede tener su ARN de rol y sus reglas de protección.',
    ghaWhyTitle: 'Por qué no copiar los secretos a GitHub Secrets',
    ghaWhyDesc:
      'Copiar los valores a los secretos del repositorio funciona hasta que un valor cambia. A partir de ahí hay dos copias:',
    ghaWhyRotationLabel: 'Rotación:',
    ghaWhyRotation:
      'cuando se rota un secreto en SSM o Key Vault, cada repositorio con una copia sigue desplegando el valor antiguo hasta que alguien lo actualiza a mano.',
    ghaWhyAuditLabel: 'Divergencia y auditoría:',
    ghaWhyAudit:
      'GitHub Secrets no se puede volver a leer, así que no puedes comprobar si la copia sigue coincidiendo con el origen. Leer de la nube queda registrado con el rol o la aplicación que hizo cada petición: en CloudTrail en AWS, y en los logs de auditoría de Key Vault en Azure una vez activada la configuración de diagnóstico del vault.',
    ghaWhyKeysLabel: 'Claves de larga duración:',
    ghaWhyKeys:
      'copiar secretos suele ir acompañado de una clave de acceso de AWS o un secreto de cliente de Azure guardados también en GitHub. Con OIDC el job recibe un token de corta duración, y nada de lo guardado en GitHub funciona fuera del workflow.',
    ghaWhyListLabel: 'Una sola lista:',
    ghaWhyList:
      'el archivo de mapeo se versiona con el código, se revisa en las pull requests y es el mismo archivo que usan los desarrolladores en local con la CLI.',
    ghaWhyWhenSecrets:
      'GitHub Secrets sigue siendo una buena opción para valores que solo existen para el pipeline, como un token de un servicio de despliegue externo.',
    ghaErrorsTitle: 'Errores habituales',
    ghaErrorsDesc:
      'Mensajes tal como aparecen en el log del paso y cómo resolverlos. Envilder enmascara la ruta del secreto que muestra junto a cada variable, salvo los tres últimos caracteres. Los mensajes que vienen de AWS o de Azure se muestran tal cual y pueden incluir el nombre completo del parámetro o del recurso.',
    ghaErrMapTitle: 'No se puede leer el archivo de mapeo',
    ghaErrMapFix:
      'Falta el paso de checkout o se ejecuta después de la Action, o map-file apunta a un lugar incorrecto. Las rutas son relativas a la raíz del repositorio.',
    ghaErrAssumeTitle: 'No se puede asumir el rol',
    ghaErrAssumeFix:
      'Este error viene de aws-actions/configure-aws-credentials, antes de que se ejecute Envilder. Comprueba que el workflow tiene id-token: write y que el sub de la política de confianza coincide exactamente con el repositorio, la rama o el entorno, en el formato de sujeto que usa tu repositorio (con o sin ID inmutables). Los jobs de tag, de pull_request y con environment generan un sub distinto.',
    ghaErrNoCredsTitle: 'Sin credenciales de AWS',
    ghaErrNoCredsFix:
      'Ningún paso ha autenticado el job en AWS antes de la Action. Añade aws-actions/configure-aws-credentials antes, en el mismo job: las credenciales no pasan de un job a otro.',
    ghaErrDeniedTitle: 'Acceso denegado a un parámetro',
    ghaErrDeniedFix:
      'El rol es válido pero su política no cubre ese parámetro. Revisa la ruta de Resource y la región del ARN, que debe coincidir con el aws-region del paso de credenciales.',
    ghaErrExpiredTitle: 'Credenciales caducadas',
    ghaErrExpiredFix:
      'La sesión del rol terminó antes de que se ejecutara el paso (una hora por defecto). Ejecuta Envilder justo después del paso de credenciales, o aumenta role-duration-seconds junto con la duración máxima de sesión del rol.',
    ghaErrNotFoundTitle: 'Parámetro o secreto inexistente',
    ghaErrNotFoundFix:
      'Es un aviso, no un error: el paso termina bien, con menos secretos en el resumen que en el mapeo. En un archivo .env nuevo la variable queda fuera. Si el archivo ya existía (en el repositorio, en caché o escrito por un paso anterior), se conserva el valor antiguo, así que borra el archivo antes de la Action cuando un valor obsoleto no deba sobrevivir. Revisa el nombre, la región y, en Azure, el nombre convertido. Si un valor que falta debe detener el despliegue, compruébalo en un paso posterior.',
    ghaErrVaultUrlTitle: 'Falta la URL del vault de Azure',
    ghaErrVaultUrlFix:
      'Informa el input vault-url o $config.vaultUrl en el archivo de mapeo. Debe ser una URL https que termine en .vault.azure.net, o el dominio equivalente de una nube soberana.',
    ghaErrAzureDeniedTitle: 'Acceso denegado en Azure Key Vault',
    ghaErrAzureDeniedFix:
      'azure/login ha funcionado pero la identidad no tiene ningún rol de plano de datos sobre el vault. Asigna Key Vault Secrets User sobre el vault y espera unos minutos, porque las asignaciones de rol tardan en propagarse. Los vaults con directivas de acceso indican en cambio que la identidad no tiene el permiso get de secretos.',
    ghaErrProfileTitle: 'Perfil de AWS en el archivo de mapeo',
    ghaErrProfileFix:
      'Si envilder.json define $config.profile para uso local, la Action pasa ese perfil al SDK de AWS. Los runners de GitHub no tienen perfiles de AWS, y con un perfil definido el SDK ignora las credenciales de configure-aws-credentials. Quita el perfil del mapeo que usas en CI, o ten un mapeo separado para CI.',
    ghaRelatedTitle: 'Páginas relacionadas',
    ghaRelatedAws:
      'Configuración de AWS SSM Parameter Store: credenciales, permisos IAM y una comprobación rápida',
    ghaRelatedAzure:
      'Configuración de Azure Key Vault: RBAC o directivas de acceso y una comprobación rápida',
    ghaRelatedMap:
      'Referencia del archivo de mapeo: $config, proveedores y rutas de secretos',
    ghaRelatedRepo: 'Código fuente y README de la Action en GitHub',
    configPriorityTitle: 'Prioridad de configuración',
    configPriorityDesc:
      'Cuando hay múltiples fuentes de configuración, Envilder las resuelve en este orden (el más alto gana):',
    configPriority1: 'Flags CLI / inputs GHA',
    configPriority2: '$config en el archivo de mapeo',
    configPriority3: 'Por defecto (AWS)',
    configPriorityExplain:
      'Esto significa que --provider=azure en la CLI sobreescribirá "provider": "aws" en $config.',
    // SDKs
    sidebarSdks: 'SDKs',
    sidebarSdkDotnet: '.NET SDK',
    sidebarSdkPython: 'Python SDK',
    sidebarSdkNodejs: 'Node.js SDK',
    sdkDotnetTitle: '.NET SDK',
    sdkDotnetDesc:
      'Carga secretos directamente en tu aplicación .NET al inicio. Fachada de una línea, constructor fluido, integración con IConfiguration o control programático total.',
    sdkDotnetInstall: 'Instalación',
    sdkDotnetOneLiner: 'Una línea: resolver + inyectar',
    sdkDotnetOneLinerDesc:
      'Resuelve secretos del archivo de mapeo e inyéctalos en Environment en una sola llamada:',
    sdkDotnetResolve: 'Resolver sin inyectar',
    sdkDotnetResolveDesc:
      'Obtén secretos como un diccionario sin modificar el entorno:',
    sdkDotnetFluent: 'Constructor fluido con sobreescrituras',
    sdkDotnetFluentDesc:
      'Sobreescribe la configuración del proveedor de forma programática con la API fluida:',
    sdkDotnetEnvLoading: 'Carga basada en entorno',
    sdkDotnetEnvLoadingDesc:
      'Enruta la carga de secretos según tu entorno actual. Cada entorno mapea a su archivo de secretos:',
    sdkDotnetValidation: 'Validación de secretos',
    sdkDotnetValidationDesc:
      'Validación opcional que asegura que todos los secretos resueltos tienen valores no vacíos:',
    sdkDotnetQuickStartConfig: 'Vía IConfiguration (ASP.NET)',
    sdkDotnetQuickStartConfigDesc:
      'Añade Envilder como fuente de configuración en tu aplicación ASP.NET:',
    sdkDotnetQuickStartResolve: 'Avanzado: control programático total',
    sdkDotnetQuickStartResolveDesc:
      'Analiza el archivo de mapeo, resuelve secretos e inyéctalos en las variables de entorno:',
    sdkDotnetFullDocs: 'Documentación completa →',
    sdkDotnetExamplesDesc:
      'Proyectos de pruebas xUnit con Testcontainers y Aspire que resuelven un archivo de mapeo contra AWS SSM y Azure Key Vault (emulados con LocalStack y Lowkey Vault) y pasan los valores a los contenedores, sin ningún archivo .env:',
    sdkPythonTitle: 'Python SDK',
    sdkPythonDesc:
      'Carga secretos directamente en tu aplicación Python al inicio. Configuración en una línea o control detallado con el constructor fluido.',
    sdkPythonInstall: 'Instalación',
    sdkPythonQuickStart: 'Inicio rápido: una línea',
    sdkPythonQuickStartDesc:
      'Carga secretos desde un archivo de mapeo e inyéctalos en el entorno:',
    sdkPythonEnvLoading: 'Carga basada en entorno',
    sdkPythonEnvLoadingDesc:
      'Recomendado para aplicaciones multi-entorno. Mapea cada entorno a su archivo de secretos:',
    sdkPythonResolve: 'Resolver sin inyectar',
    sdkPythonResolveDesc:
      'Obtén secretos como un diccionario sin modificar el entorno:',
    sdkPythonFluent: 'Constructor fluido con sobreescrituras',
    sdkPythonFluentDesc:
      'Sobreescribe la configuración del proveedor de forma programática con la API fluida:',
    sdkPythonValidation: 'Validación de secretos',
    sdkPythonValidationDesc:
      'Validación opcional que asegura que todos los secretos resueltos tienen valores no vacíos:',
    sdkPythonFullDocs: 'Documentación completa →',
    sdkPythonExamplesDesc:
      'Un proyecto pytest con Testcontainers que resuelve un archivo de mapeo contra AWS SSM y Azure Key Vault (emulados con LocalStack y Lowkey Vault) y pasa los valores a los contenedores, sin ningún archivo .env:',
    sdkNodejsTitle: 'Node.js SDK',
    sdkNodejsDesc:
      'Carga secretos directamente en tu aplicación Node.js al inicio. API asíncrona con fachada de una línea o constructor fluido para control total.',
    sdkNodejsInstall: 'Instalación',
    sdkNodejsQuickStart: 'Inicio rápido: una línea',
    sdkNodejsQuickStartDesc:
      'Carga secretos desde un archivo de mapeo e inyéctalos en process.env:',
    sdkNodejsResolve: 'Resolver sin inyectar',
    sdkNodejsResolveDesc:
      'Obtén secretos como un Map sin modificar el entorno:',
    sdkNodejsFluent: 'Constructor fluido con sobreescrituras',
    sdkNodejsFluentDesc:
      'Sobreescribe la configuración del proveedor de forma programática con la API fluida:',
    sdkNodejsEnvLoading: 'Carga basada en entorno',
    sdkNodejsEnvLoadingDesc:
      'Recomendado para aplicaciones multi-entorno. Mapea cada entorno a su archivo de secretos:',
    sdkNodejsValidation: 'Validación de secretos',
    sdkNodejsValidationDesc:
      'Validación opcional que asegura que todos los secretos resueltos tienen valores no vacíos:',
    sdkNodejsFullDocs: 'Documentación completa →',
    sdkNodejsExamplesDesc:
      'Un proyecto Vitest con Testcontainers y un AppHost de Aspire en TypeScript que resuelven un archivo de mapeo contra AWS SSM y Azure Key Vault (emulados con LocalStack y Lowkey Vault) y pasan los valores a los contenedores, sin ningún archivo .env:',
    pagerPrev: 'Anterior',
    pagerNext: 'Siguiente',
  },
};
