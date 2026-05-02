import { releaseMetadata } from './releaseMetadata';
import type { Translations } from './types';

export const es: Translations = {
  homeMeta: {
    title:
      'Envilder: un modelo para resolver secretos en cada entorno y runtime.',
    description:
      'Un sistema de resolución de configuración basado en un modelo. Define los mapeos de secretos una vez y resuélvelos de forma consistente: CLI, CI/CD o runtime de aplicación. Basado en AWS SSM, Azure Key Vault y GCP Secret Manager.',
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
    openSource: 'Código abierto · MIT',
    title1: 'Un modelo.',
    title2: 'Tus secretos.',
    titleAccent: 'Cada runtime.',
    description:
      'Define los mapeos de secretos una vez y resuélvelos de forma consistente desde',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descGcp: 'GCP Secret Manager',
    descOr: 'o',
    descComma: ',',
    descSuffix:
      ': localmente con la CLI, en CI/CD con la GitHub Action o al iniciar la app con SDKs de runtime.',
    getStarted: '▶ Empezar',
    viewOnGithub: '★ Ver en GitHub',
    terminalComment1: '# 1. Un modelo de mapeo para cada entorno',
    terminalComment2: '# 2. Resuelve secretos con la CLI',
    terminalFetched1: ' Obtenido DB_PASSWORD → ···pass',
    terminalFetched2: ' Obtenido API_KEY     → ···key',
    terminalWritten: ' Archivo de entorno escrito en .env',
  },
  trust: {
    label: 'COMPATIBLE CON',
  },
  sponsors: {
    title: 'Sponsors',
    localstackAlt: 'LocalStack',
  },
  problemSolution: {
    title: 'Por qué la gestión de secretos ',
    titleAccent: 'está rota',
    titleSuffix: '',
    subtitle:
      'Cada equipo, cada etapa, cada runtime gestiona los secretos de forma diferente. Sin estándar. Sin consistencia. Sin confianza.',
    problems: [
      {
        icon: '💀',
        title: 'Fragmentada entre herramientas',
        description:
          'El entorno local usa archivos .env. CI/CD lee de integraciones con vaults. Producción tiene su propio método. Misma app, diferentes flujos de configuración.',
      },
      {
        icon: '📨',
        title: 'Secretos compartidos por canales inseguros',
        description:
          'Claves API enviadas por Slack, archivos .env en repositorios, páginas wiki con credenciales en texto plano. Un incidente de seguridad esperando a ocurrir.',
      },
      {
        icon: '🐌',
        title: 'El desfase de configuración es inevitable',
        description:
          'Sin una fuente única de verdad sobre qué secretos necesita una app. Dev, staging y producción se desincronizan. Los despliegues fallan. Nadie sabe qué config es la correcta.',
      },
    ],
    arrowText: '▼ envilder lo soluciona ▼',
    solutions: [
      {
        icon: '🛡️',
        title: 'Un modelo, una fuente de verdad',
        description:
          'Un único archivo de mapeo define qué secretos necesita tu app. Versionado en Git. Revisable en PRs. El mismo contrato en cada entorno.',
      },
      {
        icon: '⚡',
        title: 'Resolución consistente en todas partes',
        description:
          'CLI para desarrollo local, GitHub Action para CI/CD, SDKs de runtime para el inicio de la app. Mismo mapeo, mismo comportamiento, mismo resultado.',
      },
      {
        icon: '🤖',
        title: 'Tu nube, sin intermediarios',
        description:
          'AWS SSM, Azure Key Vault o GCP. Sin proxy SaaS. Los secretos se quedan en tu infraestructura. Control de acceso nativo IAM/RBAC.',
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
          'Sáltate el archivo .env por completo. Carga secretos directamente en tu aplicación al iniciar con SDKs nativos: Python, .NET, TypeScript y más.',
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
    title: 'Hecho para ',
    titleAccent: 'equipos reales',
    subtitle:
      'Un sistema de resolución de configuración diseñado para seguridad, consistencia y ejecución multi-runtime.',
    features: [
      {
        icon: '📋',
        title: 'Modelo de mapeo único',
        description:
          'Un contrato JSON define todos los secretos. Versionado en Git, revisable en PRs, comparable entre entornos. El modelo es el producto.',
      },
      {
        icon: '🔌',
        title: 'SDKs de runtime',
        description:
          'Carga secretos directamente en memoria al iniciar la app: Python, .NET, TypeScript, Go, Java. Sin archivos .env en disco. Sin secretos residuales.',
      },
      {
        icon: '☁️',
        title: 'Multi-Proveedor',
        description:
          'AWS SSM, Azure Key Vault y GCP Secret Manager (próximamente). Tu nube, tus reglas. Sin dependencia de proveedor.',
      },
      {
        icon: '⚙️',
        title: 'GitHub Action',
        description:
          'Obtiene secretos en workflows CI/CD. Mismo mapeo, cero intervención manual. Integración directa.',
      },
      {
        icon: '🔄',
        title: 'Sincronización bidireccional',
        description:
          'Obtiene secretos en archivos .env o sube valores .env a tu proveedor en la nube. Soporte completo de ida y vuelta vía CLI.',
      },
      {
        icon: '🔒',
        title: 'Acceso IAM y RBAC',
        description:
          'Control de acceso nativo de la nube. Las políticas IAM de AWS o RBAC de Azure definen quién lee qué. Sin capa de auth extra.',
      },
      {
        icon: '📊',
        title: 'Totalmente auditable',
        description:
          'Cada lectura y escritura queda registrada en AWS CloudTrail o Azure Monitor. Trazabilidad completa de quién accedió a qué y cuándo.',
      },
      {
        icon: '🧱',
        title: 'Cero infraestructura',
        description:
          'Sin servidores, sin proxies, sin SaaS. Construido sobre servicios nativos de la nube que ya usas y pagas.',
      },
      {
        icon: '👤',
        title: 'Soporte de perfiles AWS',
        description:
          '¿Configuración multi-cuenta? Usa --profile para cambiar entre perfiles AWS CLI. Perfecto para entornos multi-etapa.',
      },
    ],
  },
  demo: {
    title: 'Míralo en ',
    titleAccent: 'acción',
    subtitle:
      'Mira cómo Envilder simplifica la gestión de secretos en menos de 2 minutos.',
    cliDemo: 'Demo CLI: Obtener Secretos',
    ghaWorkflow: 'Workflow de GitHub Action',
    comingSoon: 'Próximamente',
  },
  providers: {
    title: 'Tu nube. ',
    titleAccent: 'Tu elección.',
    subtitle:
      'Envilder funciona con AWS SSM Parameter Store, Azure Key Vault y GCP Secret Manager (próximamente). Configura en línea o con flags CLI.',
    awsTitle: 'AWS SSM Parameter Store',
    awsDefault: 'Proveedor por defecto',
    awsFeatures: [
      'Soporte de GetParameter con WithDecryption',
      'Soporte de perfil AWS para multi-cuenta',
      'Control de acceso basado en políticas IAM',
      'Registro de auditoría CloudTrail',
    ],
    azureTitle: 'Azure Key Vault',
    azureBadge: 'Nuevo en v0.8',
    azureFeatures: [
      'Auto-normaliza nombres de secretos (barras → guiones)',
      'Autenticación DefaultAzureCredential',
      'Control de acceso Azure RBAC',
      'Registro de auditoría Azure Monitor',
    ],
    gcpTitle: 'GCP Secret Manager',
    gcpBadge: 'Próximamente',
    gcpFeatures: [
      'Integración con Google Cloud Secret Manager',
      'Application Default Credentials (ADC)',
      'Control de acceso basado en IAM',
      'Cloud Audit Logs',
    ],
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
  changelog: {
    title: 'Qué hay de ',
    titleAccent: 'nuevo',
    subtitle:
      'Novedades de la última versión. El sitio de documentación ya está en línea.',
    releaseTitle: 'Documentación y Estabilidad',
    releaseDate: new Date(
      `${releaseMetadata.releaseDate}T00:00:00Z`,
    ).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    highlights: [
      {
        icon: '✨',
        text: 'Sitio de documentación publicado en envilder.com: guías completas, historial y docs multiidioma',
      },
      {
        icon: '✨',
        text: 'Corregido: @types/node movido a devDependencies. Sin dependencias de runtime innecesarias',
      },
      {
        icon: '✨',
        text: 'Corregido: inestabilidad en tests e2e. Rutas SSM únicas por ejecución evitan condiciones de carrera',
      },
    ],
    fullChangelog: '📋 Historial completo',
    viewReleases: 'Ver todas las versiones en GitHub →',
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
        description: 'Tercer proveedor cloud. Completa el tridente multi-nube',
      },
      {
        status: 'planned',
        label: '⚡',
        title: 'Modo exec (--exec)',
        description: 'Inyecta secretos en un proceso hijo sin escribir a disco',
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
    prereqNode: 'Node.js v20+',
    prereqAws: 'AWS CLI configurado',
    prereqAzure: 'Azure CLI configurado',
    prereqIam: 'Permisos IAM:',
    prereqAwsNote: 'para AWS SSM',
    prereqAzureNote: 'para Azure Key Vault',
    install: 'Instalar',
    quickStart: 'Inicio rápido',
    step1:
      'Crea un param-map.json que mapee variables de entorno a rutas de secretos',
    step2: 'Ejecuta envilder --map=param-map.json --envfile=.env',
    step3: 'Tu archivo .env está listo ✔',
    terminalTitle: 'Inicio rápido',
    commentInstall: '# Instalar globalmente',
    commentCreate: '# Crear archivo de mapeo',
    commentPull: '# Obtener secretos',
    commentPush: '# Subir un secreto',
    doneMessage: ' ¡Hecho! Archivo .env generado.',
    pushSuccess: ' Secreto subido correctamente.',
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
    title: 'Changelog Envilder | Versiones y actualizaciones',

    backToHome: '← Volver al inicio',
    fullChangelog: 'Historial de ',
    changelogAccent: 'cambios',
    intro: 'Historial completo de versiones. Ver también',
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
    title: 'Docs Envilder | CLI, GitHub Action y AWS SSM',

    backToHome: '← Volver al inicio',
    pageTitle: 'Documentación',
    intro: 'Todo lo que necesitas para empezar con Envilder.',
    sidebarGettingStarted: 'Primeros pasos',
    sidebarRequirements: 'Requisitos',
    sidebarInstallation: 'Instalación',
    sidebarCredentials: 'Credenciales de nube',
    sidebarPermissions: 'Permisos IAM',
    sidebarCli: 'CLI',
    sidebarMappingFile: 'Archivo de mapeo',
    sidebarPullCommand: 'Comando pull',
    sidebarPushCommand: 'Comando push',
    sidebarPushSingle: 'Push individual',
    sidebarGha: 'GitHub Action',
    sidebarGhaSetup: 'Configuración',
    sidebarGhaBasic: 'Ejemplo básico',
    sidebarGhaMultiEnv: 'Multi-entorno',
    sidebarGhaAzure: 'Ejemplo Azure',
    sidebarGhaInputs: 'Inputs y outputs',
    sidebarReference: 'Referencia',
    sidebarConfigPriority: 'Prioridad de config',
    sidebarAzureSetup: 'Configuración Azure',
    overviewTitle: '¿Qué es Envilder?',
    overviewDesc:
      'Envilder es un sistema de resolución de configuración basado en un modelo. Defines un mapeo JSON entre nombres de variables y rutas de secretos en la nube, y Envilder los resuelve de forma consistente: vía la CLI para desarrollo local, la GitHub Action para CI/CD o los SDKs de runtime para el inicio de la aplicación. Funciona con AWS SSM Parameter Store y Azure Key Vault.',
    overviewProblem:
      'Sin Envilder, los equipos fragmentan la gestión de secretos entre herramientas y etapas. El entorno local usa archivos .env, CI/CD lee de integraciones con vaults, producción tiene su propio método. Esto provoca desfase de configuración, credenciales filtradas e incorporaciones lentas.',
    overviewSolution:
      'Con Envilder, un modelo de mapeo es la fuente única de verdad. Los secretos se resuelven desde tu vault en la nube bajo demanda: mismo contrato, mismo comportamiento, ya sea ejecutando la CLI localmente, la GitHub Action en CI o un SDK al iniciar la app.',
    reqTitle: 'Requisitos',
    reqNode: 'Node.js v20+',
    reqAws: 'AWS CLI',
    reqAzure: 'Azure CLI',
    reqAwsNote: 'para AWS SSM',
    reqAzureNote: 'para Azure Key Vault',
    reqDownload: 'Descargar',
    reqInstallGuide: 'Guía de instalación',
    installTitle: 'Instalación',
    credTitle: 'Credenciales de nube',
    credAwsTitle: 'AWS (por defecto)',
    credAwsDesc:
      'Envilder usa tus credenciales AWS CLI. Configura el perfil por defecto:',
    credAwsProfile: 'O usa un perfil con nombre:',
    credAzureTitle: 'Azure Key Vault',
    credAzureDesc: 'Envilder usa Azure Default Credentials. Inicia sesión con:',
    credAzureVault:
      'Proporciona la URL del vault vía $config en tu archivo de mapeo o el flag --vault-url.',
    permTitle: 'Permisos IAM',
    permAwsTitle: 'AWS',
    permAwsDesc: 'Tu usuario o rol IAM necesita:',
    permOperation: 'Operación',
    permPermission: 'Permiso',
    permPull: 'Pull',
    permPush: 'Push',
    permPolicyExample: 'Ejemplo de política IAM:',
    permAzureTitle: 'Azure',
    permAzureRbac: 'Recomendado: asigna Key Vault Secrets Officer vía RBAC:',
    permAzurePullNote:
      'Para acceso solo de lectura, Key Vault Secrets User es suficiente.',
    mapTitle: 'Archivo de mapeo',
    mapIntro:
      'El archivo de mapeo (param-map.json) es el núcleo de Envilder. Es un archivo JSON que mapea nombres de variables de entorno (claves) a rutas de secretos (valores) en tu proveedor en la nube.',
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
    pushTitle: 'Comando push',
    pushDesc:
      'Sube variables de entorno de un archivo .env local a tu proveedor en la nube usando un archivo de mapeo.',
    pushOptions: 'Opciones',
    pushExamples: 'Ejemplos',
    pushOptPush: 'Activa el modo push (requerido)',
    pushOptEnv: 'Ruta a tu archivo .env local',
    pushOptMap: 'Ruta al JSON de mapeo de parámetros',
    pushOptProvider: 'aws (por defecto) o azure',
    pushOptVault: 'URL de Azure Key Vault',
    pushOptProfile: 'Perfil AWS CLI (solo AWS)',
    pushCommentAws: '# Subir a AWS SSM',
    pushCommentProfile: '# Con perfil AWS',
    pushCommentAzureConfig: '# Azure vía $config en archivo de mapeo',
    pushCommentAzureFlags: '# Azure vía flags CLI',
    pushSingleTitle: 'Subir variable individual',
    pushSingleDesc:
      'Sube una variable de entorno individual directamente sin ningún archivo.',
    pushSingleOptions: 'Opciones',
    pushSingleOptPush: 'Activa el modo push (requerido)',
    pushSingleOptKey: 'Nombre de la variable de entorno',
    pushSingleOptValue: 'Valor a almacenar',
    pushSingleOptPath: 'Ruta completa del secreto en tu proveedor en la nube',
    pushSingleOptProvider: 'aws (por defecto) o azure',
    pushSingleOptVault: 'URL de Azure Key Vault',
    pushSingleOptProfile: 'Perfil AWS CLI (solo AWS)',
    ghaSetupTitle: 'Configuración de GitHub Action',
    ghaSetupDesc:
      'La GitHub Action de Envilder obtiene secretos de AWS SSM o Azure Key Vault en archivos .env durante tu workflow CI/CD. No hace falta compilar. La action está pre-construida y lista para usar desde GitHub Marketplace.',
    ghaPrerequisites: 'Prerrequisitos',
    ghaPrereqAws:
      'AWS: Configura credenciales con aws-actions/configure-aws-credentials',
    ghaPrereqAzure: 'Azure: Configura credenciales con azure/login',
    ghaPrereqMap: 'Un param-map.json en tu repositorio',
    ghaPullOnly: 'La GitHub Action solo soporta el modo pull (sin push).',
    ghaBasicTitle: 'Ejemplo básico de workflow',
    ghaMultiEnvTitle: 'Workflow multi-entorno',
    ghaAzureTitle: 'Workflow de Azure Key Vault',
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
    configPriorityTitle: 'Prioridad de configuración',
    configPriorityDesc:
      'Cuando hay múltiples fuentes de configuración, Envilder las resuelve en este orden (el más alto gana):',
    configPriority1: 'Flags CLI / inputs GHA',
    configPriority2: '$config en el archivo de mapeo',
    configPriority3: 'Por defecto (AWS)',
    configPriorityExplain:
      'Esto significa que --provider=azure en la CLI sobreescribirá "provider": "aws" en $config.',
    azureSetupTitle: 'Configuración de Azure Key Vault',
    azureSetupCheck: 'Comprueba qué modelo de acceso usa tu vault:',
    azureRbacTrue: 'true → Azure RBAC (recomendado)',
    azureRbacFalse: 'false / null → Vault Access Policy (clásico)',
    azureOptionA: 'Opción A: Azure RBAC (recomendado)',
    azureOptionB: 'Opción B: Vault Access Policy',
    azureAccessNote:
      'Para acceso solo de lectura, get list es suficiente. Añade set para push.',
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
    pagerPrev: 'Anterior',
    pagerNext: 'Siguiente',
  },
};
