import type { Translations } from './types';

export const es: Translations = {
  homeMeta: {
    title: 'Ejecuta apps con secretos de AWS SSM y Azure Key Vault | Envilder',
    description:
      'Mapea variables de entorno a AWS SSM o Azure Key Vault una vez y ejecuta cualquier comando con los secretos en su entorno. Sin .env en disco. CLI, Action y SDKs open source.',
    ogImageAlt:
      'Envilder - ejecuta apps con secretos de AWS SSM y Azure Key Vault, sin archivo .env',
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
    cream: 'Crema',
    ariaTheme: 'Tema',
  },
  hero: {
    title1: 'Ejecuta tu app',
    title2: 'con secretos de la nube.',
    titleAccent: 'Sin archivo .env.',
    description:
      'Mapea cada variable de entorno a una ruta de AWS SSM o Azure Key Vault en envilder.json. Un solo comando las resuelve y arranca tu app con los valores en su entorno.',
    positioning:
      'Open source, sin servidor ni SaaS de por medio: los secretos se quedan en tu cuenta de la nube. ¿Necesitas un archivo para una herramienta o la CI? pull escribe el .env. ¿Prefieres código? SDKs para Node.js, Python y .NET.',
    descAws: 'AWS SSM',
    descAzure: 'Azure Key Vault',
    descOr: '·',
    descSuffix: ' · GitHub Action · SDKs de runtime',
    getStarted: '▶ Empezar',
    viewOnGithub: '★ Ver en GitHub',
    tabGroupCli: 'CLI',
    tabGroupSdk: 'SDK',
    tabPull: 'pull',
    tabPullDesc: 'escribe .env',
    tabExec: 'exec',
    tabExecDesc: 'ejecuta tu app, sin .env',
    tabPush: 'push',
    tabPushDesc: 'guarda un secreto y escribe envilder.json',
    tabNode: 'Node.js',
    tabNodeDesc: 'en runtime',
    tabPython: 'Python',
    tabPythonDesc: 'en runtime',
    tabDotnet: '.NET',
    tabDotnetDesc: 'en runtime',
    terminalComment1: '# 1. Mapea variables a rutas SSM',
    terminalComment2: '# 2. Resuelve los secretos a .env',
    execComment1: '# Ejecuta tu app con los secretos en su entorno',
    execComment2: '# Nada escrito en disco',
    setupComment1:
      '# Sube un secreto a SSM. Envilder escribe el archivo de mapeo',
    setupComment2: '# El mapeo ya está listo. El valor nunca toca el archivo',
    setupAzureComment1:
      '# Sube un secreto a Azure Key Vault. Envilder escribe el archivo de mapeo',
    sdkCommentLoad: '# Carga el mismo contrato en runtime',
    terminalSceneLabel: 'Escena de demostración del terminal',
    terminalPause: 'Pausa la demostración',
    terminalPlay: 'Reanuda la demostración',
    execMapComment: '# Mapea cada variable a una ruta de secreto',
  },
  trust: {
    label: 'COMPATIBLE CON',
  },
  proof: {
    ariaLabel: 'Adopción',
    stars: 'estrellas en GitHub',
    npmMonthly: 'descargas de npm el último mes',
    pypiMonthly: 'descargas de PyPI el último mes',
    nugetTotal: 'descargas de NuGet',
    openssfBadge: 'Insignia de OpenSSF Best Practices',
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
    title: 'Cómo ',
    titleAccent: 'funciona',
    subtitle: 'Mapea una vez. Ejecútalo en cualquier sitio.',
    stepLabel: 'PASO',
    steps: [
      {
        title: 'Mapea cada variable una vez',
        description:
          'envilder.json lista los nombres de las variables de entorno y las rutas de los secretos, nunca los valores. Al subir un secreto, Envilder añade su entrada por ti, o puedes escribirlo a mano. Haz commit y revisa los cambios en pull requests como cualquier otro código.',
      },
      {
        title: 'Ejecuta tu app con exec',
        description:
          'envilder exec resuelve todos los secretos mapeados y arranca tu comando con ellos en su entorno. Ningún archivo .env en disco, nada que limpiar, y el comando nunca arranca si falta un secreto.',
      },
      {
        title: 'O cárgalos desde el código',
        description:
          'Los SDKs de runtime para Node.js, Python y .NET resuelven el mismo mapeo dentro del proceso al arrancar.',
      },
      {
        title: '¿Necesitas un archivo? Usa pull',
        description:
          'Algunas herramientas y pasos de CI esperan un archivo .env. pull escribe uno a partir del mismo mapeo, y la GitHub Action lo hace en tus workflows. Trata el archivo generado como un secreto.',
      },
    ],
    sdkTabPython: 'Python',
    sdkTabDotnet: '.NET',
    sdkTabNodejs: 'Node.js',
  },
  features: {
    title: '¿Por qué ',
    titleAccent: 'Envilder?',
    subtitle:
      'Envilder es una capa de resolución sobre el gestor de secretos que ya usas. Nunca almacena secretos: el archivo de mapeo es lo único que añade a tu repositorio.',
    highlights: [
      {
        icon: 'plug',
        title: 'Secretos fuera del disco',
        description:
          'exec y los SDKs ponen los valores directamente en el entorno del proceso. Ningún .env en texto plano en la carpeta del proyecto, en las copias de seguridad ni en una imagen de contenedor.',
      },
      {
        icon: 'brick',
        title: 'Sin servidor ni SaaS',
        description:
          'Nada que alojar ni pagar. Envilder lee AWS SSM Parameter Store o Azure Key Vault directamente con tus propias credenciales de la nube.',
      },
      {
        icon: 'clipboard',
        title: 'Un solo archivo revisado',
        description:
          'envilder.json es la lista única de lo que necesita cada app, igual para el desarrollo local, la CI y producción. Los cambios pasan por pull requests.',
      },
      {
        icon: 'lock',
        title: 'IAM y RBAC nativos',
        description:
          'El acceso lo gobiernan AWS IAM o Azure RBAC, y CloudTrail o Azure Monitor pueden registrarlo si está configurado. Sin capa de autenticación extra.',
      },
    ],
  },
  providers: {
    title: 'Tu nube. ',
    titleAccent: 'Tu elección.',
    subtitle:
      'Envilder funciona hoy con AWS SSM Parameter Store y Azure Key Vault. Elige el proveedor en envilder.json o con flags de la CLI.',
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
    configPriorityTitle: 'Prioridad de configuración',
    priorityHigh: 'Flags CLI / Inputs GHA',
    priorityMid: '$config en archivo de mapeo',
    priorityLow: 'Por defecto (AWS)',
    roadmapNote:
      '¿Necesitas Google Cloud Secret Manager o AWS Secrets Manager? Ambos están en el roadmap, aún no disponibles.',
    roadmapLink: 'Ver el roadmap',
  },
  faq: {
    title: 'Preguntas ',
    titleAccent: 'frecuentes',
    items: [
      {
        q: '¿Qué es Envilder?',
        a: 'Envilder es una CLI, una GitHub Action y un conjunto de SDKs de runtime open source que resuelven los secretos de la aplicación desde AWS SSM Parameter Store o Azure Key Vault con un único archivo de mapeo JSON versionado. Puede ejecutar tu comando con esos secretos en su entorno, escribir un archivo .env cuando una herramienta lo necesita, o cargarlos dentro del proceso.',
      },
      {
        q: '¿Envilder almacena mis secretos?',
        a: 'No. Los valores se quedan en AWS SSM Parameter Store o Azure Key Vault. envilder.json solo contiene nombres de variables y rutas de secretos, así que puedes hacer commit sin riesgo. No hay ningún servidor ni servicio alojado de Envilder.',
      },
      {
        q: '¿Envilder tiene un modo exec?',
        a: 'Sí. Desde la CLI v0.15.0, envilder exec -- <comando> resuelve los secretos de tu map file y arranca el comando con ellos como variables de entorno, sin escribir un archivo .env. Funciona con AWS SSM Parameter Store y Azure Key Vault.',
      },
      {
        q: '¿En qué se diferencia envilder exec de un archivo .env?',
        a: 'exec resuelve los secretos y se los pasa a tu comando como variables de entorno, así que no se escribe nada en disco. Falla de forma cerrada: si un secreto falta, está vacío o no se puede leer, el comando no arranca. El comando y los procesos que lanza pueden leer los valores; exec no es un sandbox.',
      },
      {
        q: '¿Puedo usarlo en CI/CD?',
        a: 'Sí. La GitHub Action obtiene los secretos mapeados en un archivo .env dentro del workflow, y la CLI (exec o pull) funciona en cualquier runner de CI con credenciales de la nube.',
      },
      {
        q: '¿Qué almacenes de secretos soporta?',
        a: 'AWS SSM Parameter Store y Azure Key Vault. Google Cloud Secret Manager y AWS Secrets Manager están en el roadmap pero aún no están disponibles.',
      },
      {
        q: '¿Cómo se compara con dotenvx, Chamber o Doppler?',
        a: 'dotenvx cifra archivos .env para que se pueda hacer commit de ellos. Doppler es una plataforma de secretos alojada. Chamber es una CLI para los almacenes de secretos de AWS. Envilder mantiene los valores en el AWS SSM o Azure Key Vault que ya usas, añade un único archivo de mapeo revisado y cubre la CLI, la CI y los SDKs de runtime con ese mismo mapeo.',
      },
      {
        q: '¿Es gratuito?',
        a: 'Sí. Envilder tiene licencia MIT. Solo pagas los costes habituales de tu proveedor por SSM Parameter Store o Key Vault.',
      },
    ],
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
      'credenciales AWS con ssm:GetParameter; añade ssm:PutParameter para subir secretos',
    prereqAzureNote:
      'credenciales Azure con acceso Get a secretos; añade acceso Set para subir secretos',
    install: 'Instalar',
    quickStart: 'Inicio rápido',
    step1:
      'Sube un secreto con npx envilder --key --value --secret-path: Envilder escribe envilder.json por ti',
    step2:
      'Ejecuta npx envilder exec -- seguido de tu comando de arranque habitual',
    step3: 'Tu app arranca con sus secretos ✔',
    terminalTitle: 'Inicio rápido',
    commentCreate: '# Sube un secreto. Envilder escribe envilder.json',
    commentPull: '# O escribe un archivo .env',
    doneMessage: 'Archivo .env generado.',
    sdkComment3: '# Los secretos ya están en os.environ',
    sdkExampleLink: 'Ver ejemplos ejecutables en GitHub',
    commentExec: '# Ejecuta tu app con los secretos',
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
    gettingStartedGuide: {
      tabAws: 'AWS SSM',
      tabAzure: 'Azure Key Vault',
      overviewTitle: 'Qué vas a hacer',
      overviewSteps: [
        'Instalar la CLI de envilder.',
        'Subir un secreto de prueba a AWS SSM Parameter Store o a Azure Key Vault con envilder, que también escribe envilder.json.',
        'Revisar el envilder.json que ha creado: asocia un nombre de variable al secreto, nunca al valor.',
        'Arrancar una pequeña app de Node.js con envilder exec y comprobar que recibe el valor.',
      ],
      prereqTitle: 'Requisitos previos',
      prereqNode: 'Node.js 22.12 o posterior.',
      prereqAws:
        'la AWS CLI con credenciales que funcionen (aws configure, o aws sso login para perfiles SSO) y una identidad con permiso para llamar a ssm:GetParameter sobre los parámetros que mapees. Si un parámetro SecureString está cifrado con una clave KMS gestionada por el cliente, la identidad también necesita kms:Decrypt sobre esa clave.',
      prereqAwsLink: 'Configuración de AWS SSM',
      prereqAzure:
        'un Key Vault existente, la Azure CLI con la sesión iniciada mediante az login y el rol Key Vault Secrets User sobre el vault (o una directiva de acceso con Get sobre secretos). Envilder se autentica con DefaultAzureCredential, así que una identidad administrada o credenciales en variables de entorno también sirven.',
      prereqAzureLink: 'Configuración de Azure Key Vault',
      prereqWrite:
        'El paso 2 crea un secreto, lo que requiere permiso de escritura (ssm:PutParameter, o Key Vault Secrets Officer). Si el secreto ya existe, sáltalo y escribe envilder.json a mano como se muestra en el paso 3.',
      installTitle: '1. Instala la CLI',
      installDesc:
        'Instala envilder de forma global. Si prefieres no instalarlo, antepón npx a cada comando de esta guía.',
      installVerify:
        'Comprueba que el comando está en el PATH. Muestra la versión:',
      secretTitle: '2. Sube un secreto de prueba',
      secretDesc:
        'Elige tu proveedor. Un solo comando de envilder guarda el secreto en el vault y registra la asociación en envilder.json, así que este paso no necesita ni la AWS CLI ni la Azure CLI. La guía usa un único secreto: la contraseña de la base de datos de un entorno de desarrollo. El valor queda en el historial de la terminal; para secretos reales, haz el push desde un archivo .env con el modo push.',
      secretAwsNote:
        'En AWS, --provider=aws y --profile son opcionales: aws es el proveedor por defecto y, sin --profile, Envilder usa la cadena de credenciales por defecto de AWS. El perfil es una elección local y no se escribe en envilder.json.',
      secretAzureNote:
        'Los nombres de Key Vault solo admiten letras, dígitos y guiones. Envilder convierte las barras en guiones y elimina la barra inicial antes de llamar a Azure, así que "/my-app/dev/db-password" resolvería el mismo secreto. Todo lo demás se envía tal como está escrito.',
      mapTitle: '3. Revisa envilder.json',
      mapDesc:
        'El push ha creado envilder.json en el directorio actual, o ha añadido la entrada si el archivo ya existía. Cada clave es el nombre de variable que lee tu app y cada valor es el identificador del secreto en tu vault. Para Azure también ha escrito $config con provider y vaultUrl; AWS no necesita $config.',
      mapNote:
        'El archivo contiene rutas de secretos, nunca valores, así que guárdalo en el repositorio junto al código. Los editores validan envilder.json a través de SchemaStore sin línea $schema. Para subir un secreto sin tocar el archivo de mapeo, añade --no-map-update.',
      runTitle: '4. Ejecuta tu app con envilder exec',
      runDesc:
        'Crea un pequeño script que lea la variable y arráncalo a través de Envilder. Todo lo que va después de -- es tu comando, que se pasa tal cual, sin shell.',
      runOutput:
        'Salida esperada. La primera línea es Envilder en stderr; la segunda, tu app en stdout:',
      runExplain:
        'Envilder resuelve todos los secretos mapeados y después arranca el comando con esos valores añadidos a su entorno. No escribe nada en disco. Si algún secreto falta, está vacío o no se puede leer, el comando no arranca y envilder termina con el código 125; si no, termina con el código de tu comando.',
      runScriptDesc:
        'Para que esta sea la forma habitual de arrancar el proyecto, ponlo en un script de package.json y sigue usando npm run dev:',
      pullTitle: 'Alternativa: escribir un archivo .env',
      pullDesc:
        'Algunas herramientas solo leen un archivo, como el env_file de Docker Compose o una configuración de ejecución del IDE. En esos casos, descarga los secretos a un archivo .env. Sin opciones, envilder lee envilder.json y escribe .env en el directorio actual:',
      pullOutput: 'Salida esperada con AWS, seguida del archivo que escribe:',
      pullWarn:
        'El archivo .env contiene los valores reales de los secretos: añádelo a .gitignore y bórralo cuando ya no lo necesites. A diferencia de exec, pull omite con un aviso un secreto que no existe y escribe igualmente los demás.',
      errorsTitle: 'Errores habituales en la primera ejecución',
      errorsIntro:
        'Cada bloque muestra el texto que imprime envilder. Con exec, todos terminan con el código 125 y tu comando no llega a arrancar.',
      errNoMapTitle: 'No se encuentra el archivo de mapeo',
      errNoMapFix:
        'envilder busca envilder.json en el directorio actual. Ejecútalo desde la raíz del proyecto o pasa --map=ruta/a/envilder.json.',
      errCredsTitle: 'Sin credenciales de AWS',
      errCredsFix:
        'El SDK de AWS no ha encontrado credenciales. Ejecuta aws configure, o aws sso login para un perfil SSO. Para usar un perfil con nombre, pasa --profile=nombre o define "profile" en $config.',
      errDeniedTitle: 'Acceso denegado por AWS',
      errDeniedFix:
        'Las credenciales funcionan, pero la identidad no puede leer ese parámetro. Permite ssm:GetParameter sobre el ARN del parámetro, y kms:Decrypt si el parámetro usa una clave gestionada por el cliente.',
      errNotFoundTitle: 'Secreto no encontrado',
      errNotFoundFix:
        'El identificador o la región no son correctos. En AWS, Envilder toma la región de AWS_REGION, después de AWS_DEFAULT_REGION, después del perfil, y como último recurso usa us-east-1. Compáralo con aws ssm get-parameter --name /my-app/dev/db-password usando el mismo perfil. En Azure, revisa el nombre del secreto en el vault.',
      errVaultTitle: 'Azure sin URL del vault',
      errVaultFix:
        'Añade "vaultUrl": "https://<nombre-del-vault>.vault.azure.net" a $config, o pasa --vault-url.',
      errOrderTitle: 'Opciones antes de exec',
      errOrderFix:
        'Las opciones escritas antes de exec se rechazan en lugar de ignorarse. Muévelas detrás de exec, como indica el mensaje.',
      errEnvfileTitle: '--envfile con exec',
      errEnvfileFix:
        'exec nunca escribe un archivo. Quita --envfile, o usa pull (envilder --envfile=.env) cuando necesites el archivo.',
      nextTitle: 'Siguientes pasos',
      nextMap:
        'Referencia del archivo de mapeo: $config, perfiles, reglas de validación y varios entornos',
      nextExec: 'envilder exec: códigos de salida, señales y uso en CI',
      nextPull: 'Modo pull: todas las opciones para generar archivos .env',
    },
    mapFileReference: {
      prereqTitle: 'Requisitos previos',
      prereqDesc:
        'Esta página describe el archivo de mapeo tal como lo leen la CLI de envilder (0.16) y la GitHub Action. Los SDK de runtime leen el mismo archivo. Si todavía no has resuelto ningún secreto, empieza por la guía de inicio.',
      structureTitle: 'Estructura',
      structureDesc:
        'Un archivo de mapeo es un único objeto JSON. Las claves que empiezan por $ están reservadas; cualquier otra clave declara una variable de entorno y su valor es el identificador del secreto que la rellena.',
      thKey: 'Clave',
      thMeaning: 'Significado',
      keySchema:
        'URL opcional del JSON Schema. Los editores la usan para autocompletar y validar; envilder la ignora.',
      keyConfig:
        'Objeto opcional que selecciona el proveedor y su configuración. Consulta los campos más abajo.',
      keyOtherDollar:
        'envilder omite cualquier otra clave que empiece por $. El schema la rechaza, así que no la uses para metadatos.',
      keyVariable:
        'Nombre de variable (clave) e identificador del secreto (valor de tipo string). El valor es opaco: su formato depende del proveedor.',
      configTitle: 'Campos de $config',
      configDesc:
        'Todos los campos son opcionales. Un archivo sin $config usa AWS SSM con la cadena de credenciales por defecto de AWS.',
      thField: 'Campo',
      thValues: 'Valores',
      thDefault: 'Por defecto',
      thBehaviour: 'Comportamiento',
      fieldProvider:
        'Backend de secretos. No distingue mayúsculas de minúsculas. Cualquier valor distinto de aws o azure detiene la ejecución.',
      valueProfileName: 'Nombre de perfil de la AWS CLI',
      defaultProfile: 'Cadena por defecto de AWS',
      fieldProfile:
        'Perfil con nombre de ~/.aws/config o ~/.aws/credentials. Solo AWS: con azure se ignora y se muestra un aviso.',
      fieldVaultUrl:
        'URL del Key Vault. Obligatoria para azure. Debe usar https:// y un host de Key Vault (.vault.azure.net, .vault.azure.cn, .vault.usgovcloudapi.net o .vault.microsoftazure.de). aws la ignora.',
      configSdkNote:
        'Los SDK de runtime leen los mismos campos, pero pueden rechazar combinaciones que la CLI solo avisa, como profile con azure. Cada página de SDK lista sus propios errores.',
      providersTitle: 'Identificadores de secretos por proveedor',
      awsTitle: 'AWS SSM Parameter Store',
      awsDesc:
        'El valor es el nombre del parámetro tal como está guardado en SSM, normalmente una ruta jerárquica. Envilder llama a GetParameter con descifrado, así que funcionan tanto los parámetros String como los SecureString. La región sale de AWS_REGION, después de AWS_DEFAULT_REGION, después del perfil, con us-east-1 como último recurso.',
      azureTitle: 'Azure Key Vault',
      azureDesc:
        'El valor es el nombre del secreto. Envilder convierte las barras en guiones antes de llamar a Key Vault, así que puedes compartir el mismo estilo de rutas con un archivo de AWS:',
      azureRules: [
        'Se eliminan las barras iniciales y el resto de barras pasan a ser guiones: "/my-app/prod/stripe-api-key" lee my-app-prod-stripe-api-key. El CLI, la GitHub Action y todos los SDKs aplican la misma regla.',
        'Todo lo demás se envía tal como está escrito. Un nombre que Key Vault rechace (por ejemplo con _ o .) falla con el error del propio Key Vault.',
        'En el CLI y la GitHub Action, dos valores distintos que resuelven al mismo nombre dentro de un archivo son un error.',
        'Envilder siempre lee la versión más reciente del secreto.',
      ],
      priorityTitle: 'Precedencia entre $config y las opciones',
      priorityDesc:
        'Cada ajuste se resuelve por separado, a partir de la primera fuente que lo define:',
      priority1:
        'Opciones de la CLI (--provider, --vault-url, --profile) o inputs de la GitHub Action',
      priority2: '$config en el archivo de mapeo',
      priority3:
        'Valores por defecto: provider aws, cadena de credenciales por defecto de AWS',
      priorityExplain:
        'Una opción solo sustituye el campo que nombra; los demás campos de $config siguen aplicándose. Las mismas reglas valen para pull, push y exec. Si se omite --map, envilder usa envilder.json en el directorio actual; pull y push también usan .env como valor por defecto de --envfile.',
      priorityGhaNote:
        'La GitHub Action acepta los inputs provider y vault-url, pero no tiene input de perfil: en CI las credenciales vienen del workflow (por ejemplo, OIDC), no de un perfil con nombre.',
      validationTitle: 'Reglas de validación',
      validationDesc:
        'envilder comprueba el archivo antes de contactar con ningún proveedor, así que un archivo no válido nunca resuelve solo una parte de sus secretos:',
      validationRules: [
        'El archivo debe ser JSON válido. No se permiten comentarios ni comas finales.',
        'Los nombres de variable deben cumplir ^[A-Za-z0-9_./-]+$: letras, dígitos, guion bajo, punto, guion y barra. Son los nombres que un archivo .env puede guardar y volver a leer sin cambios. Se rechazan espacios, =, #, letras acentuadas y saltos de línea.',
        'Un nombre con / (Database/Password) funciona en todas partes: los SDKs y exec lo pasan tal cual, y el SDK de .NET lo convierte en una sección de configuración. Al escribir un archivo .env, el CLI lo mantiene y avisa, porque python-dotenv carga esa línea pero dotenv para Node.js, Docker Compose y bash no; usa exec o un nombre con __ (Database__Password) si tu aplicación lee el archivo con uno de ellos.',
        'Se rechaza un nombre vacío.',
        '__proto__ no se puede usar como nombre de variable: el schema lo rechaza y envilder nunca lo resuelve, porque los parsers de .env no pueden volver a leerlo.',
        'La regla de nombres se aplica a todas las claves, aunque el valor no sea un string. Una clave con un valor que no es string (número, objeto, null) se omite y no se resuelve.',
        'Con exec en Windows se rechazan dos nombres que solo se diferencian en mayúsculas y minúsculas, porque Windows los trata como una única variable.',
        'El schema recomienda nombres POSIX (^[a-zA-Z_][a-zA-Z0-9_]*$). Los nombres con puntos y guiones se aceptan, pero algunas shells y herramientas no pueden leerlos como variables.',
      ],
      multiEnvTitle: 'Ejemplo con varios entornos',
      multiEnvDesc:
        'Mantén un archivo por entorno con las mismas claves, así el código de la aplicación no cambia nunca. Solo cambian las rutas y el perfil:',
      multiEnvRun:
        'Elige el archivo con --map. En local, ejecuta la app con el archivo de desarrollo; para un artefacto de producción, genera un .env a partir del archivo de producción:',
      multiEnvGha:
        'En un workflow, apunta la action al archivo de ese entorno:',
      multiEnvNaming:
        'SchemaStore reconoce los nombres envilder.json y envilder.*.json, así que la mayoría de editores los validan incluso sin la línea $schema.',
      errorsTitle: 'Errores habituales',
      thMessage: 'Mensaje',
      thFix: 'Solución',
      errInvalidNameFix:
        'Renombra la clave para que solo use letras, dígitos, guion bajo, punto, guion y barra.',
      errInvalidJsonFix:
        'Corrige la sintaxis JSON: una coma final, un comentario o unas comillas que faltan suelen ser la causa.',
      errProviderFix: 'Usa aws o azure en $config.provider o en --provider.',
      errVaultMissingFix:
        'Define $config.vaultUrl, o pasa --vault-url, cuando el proveedor sea azure.',
      errVaultHttpsFix:
        'Usa la URL https:// que aparece en la vista general del vault.',
      errVaultHostFix:
        'Usa el URI del vault que da Azure, por ejemplo https://my-vault.vault.azure.net, no un dominio propio.',
      errProfileAzureFix:
        'Es un aviso, no un error. Quita profile de $config, o no pases --profile, cuando uses azure.',
      errCaseFix:
        'Renombra una de las claves; exec en Windows rechaza nombres que solo se diferencian en mayúsculas y minúsculas.',
      relatedTitle: 'Guías relacionadas',
      relatedStart: 'Primeros pasos: de un secreto a una app en marcha',
      relatedExec: 'Referencia de envilder exec',
      relatedAzure: 'Configuración de Azure Key Vault',
    },
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
        title:
          'Primeros pasos: de AWS SSM o Azure Key Vault a una app en marcha en 5 minutos',
        description:
          'Instala la CLI de Envilder, mapea secretos en envilder.json y ejecuta tu app con envilder exec: valores de AWS SSM o Azure Key Vault, sin .env en disco.',
        heading: 'Primeros pasos en 5 minutos',
        intro:
          '¿Cómo llevas un secreto de AWS SSM Parameter Store o Azure Key Vault a una app en marcha? Instala la CLI de Envilder, asocia el secreto a un nombre de variable en envilder.json y arranca la app con envilder exec, que pasa el valor al proceso sin escribir ningún archivo .env. Todo lleva unos cinco minutos cuando tus credenciales de la nube ya funcionan.',
        breadcrumb: 'Primeros pasos',
        navLabel: 'Primeros pasos',
        cardTitle: 'Primeros pasos con Envilder',
        cardSummary:
          'Instala la CLI, mapea un secreto y ejecuta tu app con envilder exec, para AWS SSM o Azure Key Vault.',
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
        title:
          'Referencia de envilder.json: variables de entorno y secretos en la nube',
        description:
          'Referencia de envilder.json: $config, proveedores, perfiles, URL del vault, precedencia de opciones, validación de nombres y ejemplo con varios entornos.',
        heading: 'Referencia del archivo de mapeo',
        intro:
          '¿Qué puede contener envilder.json y cómo lo lee Envilder? Es un único objeto JSON que asocia nombres de variables de entorno a identificadores de secretos, con un bloque $config opcional para el proveedor, el perfil y la URL del vault. Las opciones de la CLI sustituyen $config campo a campo, y un nombre o un proveedor no válido detiene la ejecución antes de leer ningún secreto.',
        breadcrumb: 'Archivo de mapeo',
        navLabel: 'Archivo de mapeo',
        cardTitle: 'Referencia del archivo de mapeo',
        cardSummary:
          'Todos los campos del archivo, reglas por proveedor, precedencia de las opciones y validación de nombres.',
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
          'SDK .NET de Envilder: carga secretos de AWS SSM o Azure Key Vault en IConfiguration o DI de ASP.NET Core, con IAM y RBAC mínimos, precedencia de appsettings y errores.',
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
      'Sube un secreto de prueba con Envilder, que también escribe el archivo de mapeo, y luego haz pull para confirmar que todo funciona:',
    awsSetupVerifySuccess:
      'Si ves ⭐ LEVEL CLEARED, la configuración AWS está completa.',
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
      'Sube un secreto de prueba con Envilder, que también escribe el archivo de mapeo, y luego haz pull para confirmar que todo funciona:',
    azureSetupVerifySuccess:
      'Si ves ⭐ LEVEL CLEARED, la configuración Azure está completa.',
    azureSetupVerifySdk:
      'O carga secretos directamente desde tu app con el Python SDK:',
    mapThDefault: 'Por defecto',
    mapThDescription: 'Descripción',
    mapContentsTitle: 'Contenido de los secretos (los valores resueltos)',
    mapContentsIntro:
      'Envilder nunca reescribe el valor de un secreto: lo que devuelve el proveedor es lo que recibe tu aplicación. Los límites dependen de dónde se guarda el valor:',
    mapThStage: 'Etapa',
    mapThLimit: 'Límite',
    mapContentsProvider: 'Proveedor',
    mapContentsProviderLimit:
      'AWS SSM: 4 KB (estándar) u 8 KB (nivel avanzado). Azure Key Vault: 25 KB.',
    mapContentsEnvFile: 'Archivo .env (CLI, GitHub Action)',
    mapContentsEnvFileLimit:
      'Cualquier valor que dotenv pueda representar. Consulta la excepción más abajo.',
    mapContentsProcess: 'Entorno del proceso',
    mapContentsProcessLimit:
      'El sistema operativo no puede guardar NUL (U+0000) en una variable, y Windows limita cada variable a 32.767 caracteres.',
    mapContentsResolveOnly:
      'Las APIs de los SDKs que solo resuelven (resolve, ResolveFile, IConfiguration) mantienen los valores en memoria y solo están sujetas a los límites del proveedor.',
    mapContentsWriterDesc:
      'El CLI escribe cada valor de forma que dotenv lea exactamente el string original. Las comillas se eligen automáticamente y se comprueban analizando el resultado antes de escribir el archivo. La comprobación usa la gramática de dotenv ampliada a claves con /, así que para esas claves demuestra que el valor se lee igual, no que dotenv para Node.js las cargue (ignora esas líneas):',
    mapContentsRoundTrip:
      '#, espacios al principio y al final, comillas, barras invertidas, un \\n literal, saltos de línea LF/CRLF reales y Unicode se conservan todos. Si el archivo ya existe, cada asignación se sustituye en su sitio (una multilínea, entera), y se mantienen los comentarios, el orden y los finales de línea.',
    mapContentsUnrepresentableTitle:
      'El único valor que un .env no puede contener:',
    mapContentsUnrepresentableDesc:
      'un valor que contiene los tres tipos de comillas (\', " y `) junto con un salto de línea, espacios al principio o al final, o un #. El CLI se detiene con un error que indica la variable y deja el archivo .env intacto. Guarda ese valor codificado (por ejemplo en base64) o léelo con un SDK.',
    mapContentsExpansionTitle: 'Expansión de variables:',
    mapContentsExpansionDesc:
      'Envilder escribe referencias como $HOME literalmente y dotenv no las expande, pero otros cargadores sí. Docker Compose, por ejemplo, expande un KEY=$HOME sin comillas al leer el archivo. Tenlo en cuenta cuando un secreto contenga $.',
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
    execUseCasesTitle: 'Casos de uso habituales',
    execUseCasesDesc:
      'En todos los casos los valores solo existen en el entorno de tu comando y de los procesos que arranque, Envilder nunca crea un archivo .env, y el código de salida de tu comando pasa a ser el código de salida de Envilder. Lo que el comando haga después con los valores depende de él: Docker, por ejemplo, guarda el entorno de un contenedor en sus metadatos en disco (visibles con docker inspect) hasta que se elimina el contenedor.',
    execUcLocalstackTitle: 'Arranca LocalStack con su token de autenticación',
    execUcLocalstackDesc:
      'Cuándo lo necesitas: LocalStack necesita LOCALSTACK_AUTH_TOKEN y no quieres el token en un archivo .env ni en el historial de tu shell.',
    execUcLocalstackComposeDesc:
      'Con Docker Compose, haz referencia a la variable en compose.yaml. Compose toma su valor del entorno en el que se ejecuta, así que no hace falta ningún archivo .env:',
    execUcLocalstackDockerDesc:
      'Con Docker a secas, -e NOMBRE sin valor copia la variable del entorno del cliente docker, así que el token nunca aparece en la línea de comandos:',
    execUcLocalstackExamplesDesc:
      'Tienes la misma configuración con Testcontainers (TypeScript, Python, .NET) y Aspire en',
    execUcTestsTitle: 'Tests de integración que arrancan contenedores',
    execUcTestsDesc:
      'Cuándo lo necesitas: tus tests arrancan contenedores (por ejemplo, con Testcontainers) y leen un token o unas credenciales del entorno (process.env, os.environ, Environment.GetEnvironmentVariable) para pasárselos.',
    execUcTestsNote:
      'Si los tests fallan, se conserva su código de salida y la CI sigue fallando. Si un secreto no se puede resolver, los tests no arrancan y el código de salida es 125.',
    execUcMigrationsTitle: 'Migraciones de base de datos y scripts puntuales',
    execUcMigrationsDesc:
      'Cuándo lo necesitas: una herramienta de migraciones o un script necesita DATABASE_URL una sola vez, y no quieres la cadena de conexión en disco. Usa --map para ejecutar el mismo comando contra otro entorno.',
    execUcTerraformTitle: 'Terraform y otras herramientas IaC',
    execUcTerraformDesc:
      'Cuándo lo necesitas: una variable de entrada de Terraform contiene un secreto. Terraform lee las variables de entorno TF_VAR_<nombre> como valores de la variable de entrada <nombre>.',
    execUcTerraformNote:
      'Declara la variable con sensitive = true para que Terraform la oculte en la salida del plan. Terraform sigue guardando en el estado los valores que escribe en los recursos, así que protege el estado como siempre.',
    execUcDevTitle: 'Servidor de desarrollo local con scripts de package.json',
    execUcDevDesc:
      'Cuándo lo necesitas: todo el equipo debe arrancar la aplicación con los mismos secretos ejecutando npm run dev.',
    execUcDevNote:
      'Añade envilder como dependencia de desarrollo (npm install --save-dev envilder) para que el script lo encuentre en node_modules/.bin.',
    execUcGhaTitle: 'Un paso de GitHub Actions',
    execUcGhaDesc:
      'Cuándo lo necesitas: un paso de un workflow necesita los secretos, y solo ese paso. Configura las credenciales de AWS con OIDC y ejecuta tu comando con npx envilder exec:',
    execUcGhaNote:
      'Los valores resueltos se registran en el enmascarado de logs de GitHub antes de que arranque el comando, y los pasos siguientes no los ven.',
    execUcChainTitle: 'Varios comandos con los mismos secretos',
    execUcChainDesc:
      'Cuándo lo necesitas: quieres encadenar comandos o seguir trabajando en una shell que tenga los secretos.',
    execUcChainNote:
      'Pon todo el script de sh -c entre comillas simples para que tu shell no ejecute el && fuera de envilder exec. El exec delante del último comando sustituye la shell por ese comando, así que las señales que reenvía Envilder llegan directamente a npm start. En la shell interactiva, todos los comandos que ejecutes ven los secretos; escribe exit para salir.',
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
      'Arranca LocalStack con envilder exec docker run, con el token de autenticación resuelto desde AWS SSM sin ningún archivo .env (Docker lo guarda en los metadatos del contenedor hasta que se elimina), o sigue paso a paso push, pull y exec con npx envilder:',
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
      'Sube una variable de entorno individual directamente a tu proveedor en la nube sin usar ningún archivo .env. Envilder también guarda el mapeo en envilder.json (y lo crea si no existe), para que envilder exec lo pueda resolver enseguida. El valor nunca se escribe en el archivo.',
    pushSingleOptions: 'Opciones',
    pushSingleOptPush:
      'Opcional: --key, --value y --secret-path ya activan el modo push',
    pushSingleOptKey: 'Nombre de la variable de entorno',
    pushSingleOptValue: 'Valor a almacenar',
    pushSingleOptPath: 'Ruta completa del secreto en tu proveedor en la nube',
    pushSingleOptMap:
      'Opcional: archivo de mapeo que se crea o actualiza con la entrada y del que se lee $config (por defecto: envilder.json)',
    pushSingleOptNoMapUpdate:
      'Opcional: sube el secreto sin leer, crear ni actualizar ningún archivo de mapeo; el proveedor y el vault solo vienen de los flags',
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
    ghaExecTitle: 'Ejecutar un comando sin escribir un archivo .env',
    ghaExecDesc:
      'La acción siempre escribe un archivo .env. Si prefieres que los secretos no toquen el disco del runner, no uses la acción y ejecuta envilder exec en un paso run, después del mismo paso de credenciales. Las opciones de Envilder van antes de --, y tu comando, después. Envilder enmascara todos los valores resueltos en el log del job, y el comando no arranca si falta algún secreto.',
    ghaExecNote:
      'La CLI necesita Node.js 22.12 o posterior, así que configúralo con actions/setup-node antes del paso. No redirijas el stderr de envilder exec fuera del log del paso: es de ahí de donde GitHub lee las máscaras.',
    ghaExecLink: 'Lee la guía completa de exec →',
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
      'Con $config en el archivo de mapeo, el workflow no necesita los inputs provider ni vault-url. Los nombres de Key Vault solo admiten letras, dígitos y guiones, así que Envilder convierte las rutas: /myapp/prod/stripe-key se lee como myapp-prod-stripe-key (sin la barra inicial, barras convertidas en guiones).',
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
    // SDKs
    sidebarSdks: 'SDKs',
    sidebarSdkDotnet: '.NET SDK',
    sidebarSdkPython: 'Python SDK',
    sidebarSdkNodejs: 'Node.js SDK',
    sdkDotnetTitle: '.NET SDK',
    sdkDotnetDesc:
      '¿Cómo cargas secretos de AWS SSM Parameter Store o de Azure Key Vault en una aplicación .NET sin un archivo .env? Añade el paquete NuGet de Envilder y llama a AddEnvilder en tu configuración: los secretos que lista envilder.json se resuelven al arrancar y se leen como cualquier otra clave de configuración.',
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
    sdkDotnetQuickStartResolve: 'Avanzado: control programático total',
    sdkDotnetQuickStartResolveDesc:
      'Analiza el archivo de mapeo, resuelve secretos e inyéctalos en las variables de entorno:',
    sdkDotnetFullDocs: 'Documentación completa →',
    sdkDotnetExamplesDesc:
      'Proyectos de pruebas xUnit con Testcontainers y Aspire que resuelven un archivo de mapeo contra AWS SSM y Azure Key Vault (emulados con LocalStack y Lowkey Vault) y pasan los valores a los contenedores, sin ningún archivo .env:',
    sdkDotnetPrereqTitle: 'Requisitos previos',
    sdkDotnetPrereqDesc:
      'El paquete apunta a .NET Standard 2.0, así que funciona con cualquier versión de .NET con soporte (las pruebas del SDK se ejecutan en .NET 10, la LTS actual). Cada proveedor usa su cadena de credenciales por defecto:',
    sdkDotnetPrereqAws:
      'AWS: la cadena de credenciales por defecto de AWS (variables de entorno, archivo de credenciales compartido, SSO o un rol IAM). Define "profile" en $config para usar un perfil con nombre.',
    sdkDotnetPrereqAzure:
      'Azure: DefaultAzureCredential (az login, identidad administrada o variables de entorno).',
    sdkDotnetIamTitle: 'Política IAM mínima para AWS SSM',
    sdkDotnetIamDesc:
      'El SDK solo lee parámetros, así que basta con ssm:GetParameter sobre tu prefijo de ruta. Sustituye la región, el ID de cuenta y el prefijo:',
    sdkDotnetIamKms:
      'Los valores se leen con descifrado. Los parámetros SecureString cifrados con la clave aws/ssm por defecto no necesitan nada más; si usan una clave KMS gestionada por ti, permite también kms:Decrypt sobre esa clave.',
    sdkDotnetRbacTitle: 'Rol RBAC mínimo para Azure Key Vault',
    sdkDotnetRbacDesc:
      'Para leer secretos solo hace falta el rol Key Vault Secrets User. Asígnalo al ámbito del almacén, no de la suscripción:',
    sdkDotnetRbacNote:
      'Si el almacén todavía usa políticas de acceso en lugar de RBAC, concede solo el permiso get de secretos:',
    sdkDotnetMapTitle: 'El archivo de mapeo',
    sdkDotnetMapDesc:
      'El mismo envilder.json sirve para los ejemplos siguientes. Las claves se convierten en claves de configuración o nombres de variables de entorno; los valores son rutas de parámetros en SSM:',
    sdkDotnetMapAzureDesc:
      'Para Key Vault, define el proveedor y la URL del almacén en $config. Los valores son nombres de secretos de Key Vault:',
    sdkDotnetMapAzureNote:
      'El SDK de .NET envía los nombres a Key Vault tal como los escribes, salvo que las barras se convierten en guiones, igual que la CLI: una ruta como /myapp/prod/db-password se lee como myapp-prod-db-password. Cualquier otro carácter que Key Vault rechace (por ejemplo _ o .) falla con su propio error.',
    sdkDotnetAspTitle: 'ASP.NET Core con IConfiguration',
    sdkDotnetAspDesc:
      'Llama a AddEnvilder justo después de CreateBuilder. Las claves se leen tal como se escriben en el archivo de mapeo, así que usa nombres de variable de entorno: el mismo archivo funciona también con la CLI y el resto de SDKs.',
    sdkDotnetAspOutput: 'Al llamar al endpoint, la respuesta es:',
    sdkDotnetAspNote:
      'Los secretos se resuelven una sola vez, mientras se construye la configuración, con una petición por cada entrada del archivo. Los valores no se actualizan mientras la aplicación se ejecuta: reiníciala para recoger un secreto rotado. Un secreto que no existe se omite sin error, así que comprueba las claves sin las que tu aplicación no puede arrancar.',
    sdkDotnetDiTitle: 'Inyección de dependencias',
    sdkDotnetDiDesc:
      'AddEnvilder sobre IServiceCollection registra un EnvilderClient y el archivo de mapeo analizado como singletons, para el código que resuelve secretos bajo demanda:',
    sdkDotnetWorkerTitle: 'Worker o aplicación de consola sin DI',
    sdkDotnetWorkerDesc:
      'No hace falta ningún host. Resuelve el archivo con Env, valídalo y usa el diccionario directamente:',
    sdkDotnetWorkerOutput: 'Salida cuando los dos secretos se resuelven:',
    sdkDotnetWorkerHost:
      'En un Worker Service, llama a Env.Load antes de crear el host. Los valores pasan a ser variables de entorno del proceso, que la configuración del host ya lee, así que los guiones bajos dobles funcionan como separadores de sección (Payments__ApiKey se lee como Payments:ApiKey).',
    sdkDotnetPrecTitle: 'Combinación con appsettings.{Environment}.json',
    sdkDotnetPrecDesc:
      'ASP.NET Core aplica las fuentes de configuración en orden y gana la última. El host por defecto las añade de menor a mayor prioridad:',
    sdkDotnetPrec1: 'appsettings.json',
    sdkDotnetPrec2: 'appsettings.{Environment}.json',
    sdkDotnetPrec3: 'Secretos de usuario (solo en Development)',
    sdkDotnetPrec4: 'Variables de entorno',
    sdkDotnetPrec5: 'Argumentos de línea de comandos',
    sdkDotnetPrec6:
      'Envilder, cuando se añade después de CreateBuilder como en el ejemplo anterior',
    sdkDotnetPrecEnvilder:
      'Como AddEnvilder se ejecuta después de CreateBuilder, sus secretos sobrescriben todas las fuentes por defecto, incluida la línea de comandos. Deja los valores por defecto que no son secretos en appsettings y haz que Envilder aporte solo secretos. Una clave que se omite porque su secreto no existe no borra nada: el valor de appsettings sigue vigente.',
    sdkDotnetPrecMissing:
      'Para que las variables de entorno vuelvan a ganar en un despliegue concreto, añade esa fuente después de Envilder:',
    sdkDotnetPerEnvDesc:
      'Para usar un archivo distinto por entorno, construye su nombre a partir del nombre del entorno:',
    sdkDotnetExecTitle: 'Sin el SDK: envilder exec',
    sdkDotnetExecDesc:
      'Si la aplicación solo necesita los valores como variables de entorno, prescinde del paquete y deja que la CLI la arranque. Los secretos se pasan al proceso, no se escribe ningún archivo .env y el comando no se inicia si algún secreto no se puede resolver:',
    sdkDotnetExecKeys:
      'El proveedor de variables de entorno de .NET convierte los guiones bajos dobles en separadores de sección, así que una clave como ConnectionStrings__Default se lee como ConnectionStrings:Default sin código adicional.',
    sdkDotnetExecLink: 'Referencia de envilder exec →',
    sdkDotnetErrTitle: 'Errores habituales',
    sdkDotnetErrIntro:
      'Cada mensaje siguiente es el texto exacto que lanza el SDK o que devuelve el proveedor de nube.',
    sdkDotnetErrExpiredTitle: 'ExpiredCredentialsException',
    sdkDotnetErrExpiredFix:
      'El token de seguridad o la sesión SSO ha caducado. Renueva las credenciales (aws sso login si usas SSO) y vuelve a ejecutar. La excepción original de AWS está en InnerException.',
    sdkDotnetErrSsoTitle: 'SsoSessionExpiredException',
    sdkDotnetErrSsoFix:
      "Ejecuta el comando que indica el mensaje. Sin perfil en $config, el mensaje es: Your AWS SSO session has expired. Run 'aws sso login' and re-run this command. La propiedad ProfileName contiene el perfil, o null.",
    sdkDotnetErrMissingTitle: 'Parámetro o secreto inexistente',
    sdkDotnetErrMissingFix:
      'Un parámetro o secreto que no existe se omite sin error: la clave no está en el diccionario ni en IConfiguration. ValidateSecrets solo lanza la excepción cuando no se ha resuelto nada o hay un valor vacío, así que comprueba también las claves de las que dependes (por ejemplo con TryGetValue) y verifica la ruta en el archivo.',
    sdkDotnetErrDeniedTitle: 'Permiso denegado',
    sdkDotnetErrDeniedAwsFix:
      'La identidad no tiene ssm:GetParameter sobre ese parámetro. Compara el ARN de Resource, región incluida, con la política anterior.',
    sdkDotnetErrDeniedAzureFix:
      'Asigna Key Vault Secrets User sobre el almacén. Las asignaciones de rol pueden tardar unos minutos en propagarse.',
    sdkDotnetErrAzureNameTitle: 'Secreto no encontrado en Azure',
    sdkDotnetErrAzureNameFix:
      'El SDK envía cada valor tal cual, salvo que las barras se convierten en guiones: un nombre en forma de ruta como /myapp/prod/db-password se lee como myapp-prod-db-password, igual que en el CLI. Si el secreto sigue sin aparecer, comprueba que el vault tenga un secreto con ese nombre; los nombres que solo difieren en mayúsculas son el mismo secreto.',
    sdkDotnetErrConfigTitle: 'Errores de configuración',
    sdkDotnetErrMessageHeader: 'Mensaje',
    sdkDotnetErrFixHeader: 'Solución',
    sdkDotnetErrCfgFile:
      'La ruta es relativa al directorio de trabajo, no a la carpeta del proyecto. Copia el archivo al directorio de salida o pasa una ruta absoluta.',
    sdkDotnetErrCfgVault:
      'Añade "vaultUrl" a $config o pásalo con EnvilderOptions.',
    sdkDotnetErrCfgProfileAzure:
      'Elimina "profile" de $config: solo se aplica a AWS.',
    sdkDotnetErrCfgVaultAws:
      'Elimina "vaultUrl" o define "provider" como "azure".',
    sdkDotnetErrCfgProfileMissing:
      'Comprueba el nombre en ~/.aws/credentials o ~/.aws/config, o elimina "profile" para usar la cadena de credenciales por defecto.',
    sdkDotnetBeforeTitle: 'Qué sustituye',
    sdkDotnetBeforeDesc:
      'Las alternativas habituales son un archivo .env copiado entre máquinas o un script escrito a mano que llama al SDK de AWS o de Azure. El primero deja secretos en texto plano en el disco; el segundo es código que cada servicio debe mantener. Aquí el envilder.json versionado solo lista rutas y los valores se quedan en tu almacén.',
    sdkDotnetRelatedTitle: 'Guías relacionadas',
    sdkDotnetRelatedMap: 'Referencia del archivo de mapeo',
    sdkDotnetRelatedAws: 'Configuración de AWS SSM',
    sdkDotnetRelatedAzure: 'Configuración de Azure Key Vault',
    sdkDotnetRelatedExec: 'Referencia de envilder exec',
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
