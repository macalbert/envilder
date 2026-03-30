import { releaseMetadata } from './releaseMetadata';
import type { Translations } from './types';

export const es: Translations = {
  homeMeta: {
    title: 'Envilder — Centraliza tus secretos. Un comando.',
    description:
      'Una herramienta CLI y GitHub Action que centraliza de forma segura las variables de entorno desde AWS SSM, Azure Key Vault o GCP Secret Manager como fuente única de verdad.',
  },
  nav: {
    features: 'Funcionalidades',
    howItWorks: 'Cómo funciona',
    providers: 'Proveedores',
    githubAction: 'GitHub Action',
    changelog: 'Cambios',
    docs: 'Docs',
    getStarted: 'Empezar',
  },
  theme: {
    retro: 'Retro',
    light: 'Claro',
  },
  hero: {
    openSource: 'Código abierto · MIT',
    title1: 'Tus secretos.',
    title2: 'Un comando.',
    titleAccent: 'Cada entorno.',
    description:
      'Una herramienta CLI y GitHub Action que centraliza de forma segura tus variables de entorno desde',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descGcp: 'GCP Secret Manager',
    descOr: 'o',
    descComma: ',',
    descSuffix:
      'como fuente única de verdad. Se acabó copiar y pegar secretos.',
    getStarted: '▶ Empezar',
    viewOnGithub: '★ Ver en GitHub',
    terminalComment1: '# 1. Define tu mapeo',
    terminalComment2: '# 2. Descarga secretos → genera .env',
    terminalFetched1: ' Obtenido DB_PASSWORD → ···pass',
    terminalFetched2: ' Obtenido API_KEY     → ···key',
    terminalWritten: ' Archivo de entorno escrito en .env',
  },
  trust: {
    label: 'COMPATIBLE CON',
  },
  problemSolution: {
    title: 'El ',
    titleAccent: 'problema',
    titleSuffix: ' con archivos .env',
    subtitle:
      'Gestionar secretos manualmente no escala. Es inseguro, propenso a errores y crea fricción para todo el equipo.',
    problems: [
      {
        icon: '💀',
        title: 'Desincronización entre entornos',
        description:
          'Dev, staging y prod tienen secretos diferentes. Los despliegues fallan. Nadie sabe qué .env es el correcto.',
      },
      {
        icon: '📨',
        title: 'Secretos compartidos por Slack/email',
        description:
          'Claves API enviadas en texto plano por chat. Sin trazabilidad. Sin rotación. Un incidente de seguridad esperando a ocurrir.',
      },
      {
        icon: '🐌',
        title: 'Onboarding y rotaciones lentas',
        description:
          '¿Un nuevo miembro se une al equipo? Copia y pega un .env de la máquina de alguien. ¿Alguien rota? Espera que todos actualicen manualmente.',
      },
    ],
    arrowText: '▼ envilder lo soluciona ▼',
    solutions: [
      {
        icon: '🛡️',
        title: 'Fuente de verdad en la nube',
        description:
          'Todos los secretos viven en AWS SSM o Azure Key Vault. IAM/RBAC controla quién puede leer qué. Cada acceso queda registrado.',
      },
      {
        icon: '⚡',
        title: 'Un comando, siempre sincronizado',
        description:
          'Ejecuta envilder y tu .env se regenera desde la fuente de verdad. Idempotente. Instantáneo. Sin margen para el desfase.',
      },
      {
        icon: '🤖',
        title: 'Automatizado en CI/CD',
        description:
          'Usa la GitHub Action para obtener secretos en el momento del despliegue. Sin secretos en los repos. Sin pasos manuales en los pipelines.',
      },
    ],
  },
  howItWorks: {
    title: 'Cómo ',
    titleAccent: 'funciona',
    subtitle: 'Tres pasos. De secretos dispersos a una única fuente de verdad.',
    steps: [
      {
        title: 'Crea un archivo de mapeo',
        description:
          'Mapea los nombres de tus variables de entorno a sus rutas de secretos en AWS SSM o Azure Key Vault.',
      },
      {
        title: 'Ejecuta un comando',
        description:
          'Envilder obtiene cada secreto de tu proveedor en la nube y los escribe en un archivo .env local. Idempotente e instantáneo.',
      },
      {
        title: 'Tu .env está listo',
        description:
          'Un archivo de entorno limpio y actualizado — generado desde la fuente de verdad. Úsalo localmente o inyéctalo en CI/CD con la GitHub Action.',
      },
    ],
    terminalFetched1: '✔ Obtenido DB_PASSWORD  → ···word',
    terminalFetched2: '✔ Obtenido API_KEY      → ···key',
    terminalFetched3: '✔ Obtenido SECRET_TOKEN → ···oken',
    terminalWritten: '✔ Archivo de entorno escrito en .env',
  },
  features: {
    title: 'Hecho para ',
    titleAccent: 'equipos reales',
    subtitle:
      'Todo lo que necesitas para gestionar secretos de entorno de forma segura y a escala.',
    features: [
      {
        icon: '☁️',
        title: 'Multi-Proveedor',
        description:
          'AWS SSM, Azure Key Vault y GCP Secret Manager (próximamente). Elige con --provider o $config en tu archivo de mapeo.',
      },
      {
        icon: '🔄',
        title: 'Sincronización bidireccional',
        description:
          'Obtén secretos en archivos .env o sube valores .env a tu proveedor en la nube. Soporte completo de ida y vuelta.',
      },
      {
        icon: '⚙️',
        title: 'GitHub Action',
        description:
          'Action para tus workflows CI/CD. Obtén secretos en el momento del despliegue sin intervención manual.',
      },
      {
        icon: '🔒',
        title: 'Acceso IAM y RBAC',
        description:
          'Aprovecha el control de acceso nativo de la nube. Las políticas IAM de AWS o RBAC de Azure definen quién lee qué, por entorno.',
      },
      {
        icon: '📊',
        title: 'Totalmente auditable',
        description:
          'Cada lectura y escritura queda registrada en AWS CloudTrail o Azure Monitor. Trazabilidad completa de quién accedió a qué y cuándo.',
      },
      {
        icon: '🔁',
        title: 'Sincronización idempotente',
        description:
          'Solo se actualiza lo que hay en tu mapeo. Nada más se toca. Ejecútalo diez veces — mismo resultado, cero efectos secundarios.',
      },
      {
        icon: '🧱',
        title: 'Cero infraestructura',
        description:
          'Construido sobre servicios nativos de la nube. Sin Lambdas, sin servidores, sin infraestructura extra que gestionar o pagar.',
      },
      {
        icon: '👤',
        title: 'Soporte de perfiles AWS',
        description:
          '¿Configuración multi-cuenta? Usa --profile para cambiar entre perfiles AWS CLI. Perfecto para entornos multi-etapa.',
      },
      {
        icon: '🔌',
        title: 'SDKs en tiempo real',
        description:
          'Carga secretos directamente en tu app al iniciar — TypeScript, Python, Go, .NET, Java. Sin archivos .env, sin intermediarios.',
        badge: 'Próximamente',
      },
    ],
  },
  demo: {
    title: 'Míralo en ',
    titleAccent: 'acción',
    subtitle:
      'Mira cómo Envilder simplifica la gestión de secretos en menos de 2 minutos.',
    cliDemo: 'Demo CLI — Obtener Secretos',
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
  changelog: {
    title: 'Qué hay de ',
    titleAccent: 'nuevo',
    subtitle:
      'Novedades de la última versión. El soporte multi-proveedor ya está aquí.',
    releaseTitle: 'Soporte Multi-Proveedor',
    releaseDate: new Date(
      `${releaseMetadata.releaseDate}T00:00:00`,
    ).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    highlights: [
      {
        icon: '✨',
        text: 'Sección $config en archivos de mapeo — declara proveedor y detalles de conexión en línea',
      },
      {
        icon: '✨',
        text: 'Soporte de Azure Key Vault — paridad completa con AWS SSM',
      },
      { icon: '✨', text: 'Flags CLI --vault-url y --provider' },
      {
        icon: '✨',
        text: 'Normalización automática de nombres de secretos para Azure (barras → guiones)',
      },
      {
        icon: '⚠️',
        text: 'Cambio incompatible: --ssm-path renombrado a --secret-path (el antiguo flag sigue funcionando como alias obsoleto)',
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
        status: 'next',
        label: '📦',
        title: 'TypeScript SDK (@envilder/sdk)',
        description:
          'Librería nativa de ejecución — carga secretos directamente en process.env desde un map-file. Publicado en npm',
      },
      {
        status: 'next',
        label: '🐍',
        title: 'Python SDK (envilder)',
        description:
          'Librería para Django/FastAPI/pipelines de datos. Publicado en PyPI',
      },
      {
        status: 'next',
        label: '🐹',
        title: 'Go SDK (envilder)',
        description:
          'Librería para apps cloud-native y herramientas Kubernetes. Publicado como módulo Go',
      },
      {
        status: 'next',
        label: '🔵',
        title: '.NET SDK (Envilder)',
        description:
          'Librería para apps enterprise y Azure-native. Publicado en NuGet',
      },
      {
        status: 'next',
        label: '☕',
        title: 'Java SDK (envilder)',
        description:
          'Librería para Spring Boot y backends Android. Publicado en Maven Central',
      },
      {
        status: 'planned',
        label: '⚡',
        title: 'Modo exec (--exec)',
        description: 'Inyecta secretos en un proceso hijo sin escribir a disco',
      },
      {
        status: 'planned',
        label: '☁️',
        title: 'GCP Secret Manager',
        description: 'Tercer proveedor cloud — completa el tridente multi-nube',
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
          'Valida secretos en la nube vs .env local — falla CI si están desincronizados',
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
      'Centraliza de forma segura tus variables de entorno desde AWS SSM, Azure Key Vault o GCP Secret Manager.',
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
    title: 'Historial de cambios — Envilder',
    backToHome: '← Volver al inicio',
    fullChangelog: 'Historial de ',
    changelogAccent: 'cambios',
    intro: 'Historial completo de versiones. Ver también',
    githubReleases: 'Versiones en GitHub',
    versions: 'Versiones',
    backToTop: 'Volver arriba',
  },
  docs: {
    title: 'Documentación — Envilder',
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
      'Envilder es una herramienta CLI y GitHub Action que descarga variables de entorno de un almacén de secretos en la nube (AWS SSM Parameter Store o Azure Key Vault) y las escribe en un archivo .env local — o las sube de vuelta. Defines un simple mapeo JSON entre nombres de variables y rutas de secretos, y Envilder hace el resto.',
    overviewProblem:
      'Sin Envilder, los equipos copian secretos a mano, los guardan en archivos .env en texto plano en el repositorio, o mantienen scripts de shell frágiles por cada entorno. Esto lleva a credenciales filtradas, configuraciones inconsistentes e incorporaciones lentas.',
    overviewSolution:
      'Con Envilder, un archivo param-map.json es la fuente única de verdad. Los secretos no salen del almacén hasta el momento de ejecución, cada entorno usa el mismo mapeo, y un nuevo desarrollador está operativo con un solo comando.',
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
    permAzureRbac: 'Recomendado — asigna Key Vault Secrets Officer vía RBAC:',
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
    mapBasicTitle: 'Formato básico (AWS SSM — por defecto)',
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
      'Los nombres de secretos de Key Vault solo permiten caracteres alfanuméricos y guiones. Envilder normaliza automáticamente los nombres — barras y guiones bajos se convierten en guiones (ej., /myapp/db/password → myapp-db-password).',
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
      'La GitHub Action de Envilder obtiene secretos de AWS SSM o Azure Key Vault en archivos .env durante tu workflow CI/CD. No hace falta compilar — la action está pre-construida y lista para usar desde GitHub Marketplace.',
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
    azureOptionA: 'Opción A — Azure RBAC (recomendado)',
    azureOptionB: 'Opción B — Vault Access Policy',
    azureAccessNote:
      'Para acceso solo de lectura, get list es suficiente. Añade set para push.',
  },
};
