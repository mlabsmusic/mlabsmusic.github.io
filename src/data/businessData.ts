export const commercialMetrics = [
  { value: '7 dias', label: 'para enseñar un piloto con datos reales' },
  { value: '3 min', label: 'para entender el pitch completo' },
  { value: '4 ramas', label: 'para operar musica como Git' },
  { value: '1 master', label: 'para publicar con criterio editorial' },
];

export const pricingTiers = [
  {
    name: 'Pilot',
    price: '490 EUR',
    cadence: '/ mes',
    badge: 'Validar rápido',
    description: 'Para una crew que quiere probar el flujo con pocos DJs, biblioteca real y owner review.',
    features: [
      '1 recordpool privado',
      'Hasta 5 DJs invitados',
      'Workspace con snapshots, ramas y PRs',
      'Demo comercial lista para enseñar',
      'Soporte de onboarding inicial',
    ],
    cta: 'Reservar piloto',
  },
  {
    name: 'Community OS',
    price: '1.490 EUR',
    cadence: '/ mes',
    badge: 'Producto principal',
    description: 'Para crews, sellos o promotoras que quieren operar su catalogo como producto vivo.',
    features: [
      'Hasta 25 DJs, curators o A&Rs',
      'Master library con historial completo',
      'Owner review, checks y estados de aprobacion',
      'Paginas publicas de comunidad y perfiles',
      'Reporting mensual de actividad y adopcion',
    ],
    cta: 'Vender esta version',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    badge: 'White label',
    description: 'Para recordpools, distributors o marcas que necesitan permisos, integraciones y rollout propio.',
    features: [
      'Marca, dominio y estructura a medida',
      'Roles avanzados para equipos editoriales',
      'Integraciones con storage y catalogos existentes',
      'SLA, soporte y roadmap compartido',
      'Licencia anual negociada',
    ],
    cta: 'Hablar de licencia',
  },
];

export const buyerSegments = [
  {
    segment: 'Crews de DJs',
    pain: 'Tienen musica repartida en chats, Drives y carpetas personales.',
    outcome: 'Un master comunitario vivo, con aportes revisados y perfiles que dan identidad.',
  },
  {
    segment: 'Sellos y A&Rs',
    pain: 'Reciben promos y edits sin trazabilidad, duplicados ni contexto editorial.',
    outcome: 'Branches por release, PRs musicales y decisiones registradas antes de publicar.',
  },
  {
    segment: 'Promotoras',
    pain: 'Necesitan activar comunidades, residencias y lineups sin perder criterio.',
    outcome: 'Un hub privado donde cada DJ aporta valor y la marca conserva control.',
  },
  {
    segment: 'Recordpools',
    pain: 'Compiten con catalogos planos y poco diferenciados.',
    outcome: 'Una capa premium de versionado, review y comunidad que justifica ticket alto.',
  },
];

export const productMoats = [
  {
    title: 'Workflow propietario',
    body: 'La ventaja no es subir musica. Es operar aportes, ramas, reviews y master con una logica que los DJs entienden.',
  },
  {
    title: 'Datos de actividad',
    body: 'Cada snapshot, PR y merge genera senales: quien aporta, que se aprueba, donde crece el catalogo y que ramas mueven negocio.',
  },
  {
    title: 'Distribucion por comunidad',
    body: 'Cada cliente trae varios DJs. Si el owner adopta el sistema, el producto entra por red y no solo por usuario individual.',
  },
  {
    title: 'White label defendible',
    body: 'La misma base puede venderse a crews pequenas, sellos y recordpools grandes sin rehacer la narrativa de valor.',
  },
];

export const musicOpsFlow = [
  {
    step: '01',
    title: 'Local DJ Folder',
    body: 'El DJ trabaja desde su carpeta real, sin cambiar su rutina ni entregar toda su biblioteca privada.',
  },
  {
    step: '02',
    title: 'MLABS Agent',
    body: 'El agente detecta audio, cambios, firmas y snapshots para convertir una carpeta en una fuente versionada.',
  },
  {
    step: '03',
    title: 'Music Branches',
    body: 'Cada crate, set, promo o release puede vivir en su propia rama antes de tocar el master.',
  },
  {
    step: '04',
    title: 'Pull Request',
    body: 'El DJ propone solo los tracks que merecen entrar al pool comun, con contexto y cambios visibles.',
  },
  {
    step: '05',
    title: 'Owner Review',
    body: 'El owner revisa impacto, notas, duplicados y criterio editorial antes de aprobar.',
  },
  {
    step: '06',
    title: '0_MASTER Library',
    body: 'El master publicado queda limpio, trazable y listo para operar como recordpool privado o white label.',
  },
];

export const musicOpsBenefits = [
  {
    title: 'Controlled Music Deployment',
    body: 'Nada entra en el master por accidente. Cada subida pasa por branch, PR y decision editorial.',
  },
  {
    title: 'Unified Library Management',
    body: 'Cada DJ conserva su espacio, mientras la comunidad opera desde una biblioteca comun y gobernada.',
  },
  {
    title: 'Traceable Music Decisions',
    body: 'Snapshots, merges y reviews explican quien aporto, que cambio y por que se publico.',
  },
  {
    title: 'Community Monetization Layer',
    body: 'La comunidad deja de ser un chat con enlaces y se convierte en una plataforma vendible.',
  },
];

export const musicOpsFaqs = [
  {
    question: 'Esto reemplaza el Drive?',
    answer: 'No necesariamente. MLABS puede convivir con Drive, storage existente o carpetas locales. La diferencia es que anade control, historial y review.',
  },
  {
    question: 'El DJ pierde control de su musica?',
    answer: 'No. La biblioteca privada sigue siendo privada. Solo entra al master lo que el DJ propone y el owner aprueba.',
  },
  {
    question: 'Por que una crew pagaria por esto?',
    answer: 'Porque convierte musica dispersa, decisiones invisibles y aportes informales en un sistema operable con permisos, master y actividad medible.',
  },
  {
    question: 'Como se vende el piloto?',
    answer: 'Con una biblioteca real, tres ramas, varias PRs musicales y un merge al master delante del comprador.',
  },
];

export const macAgentFeatures = [
  {
    title: 'Conecta una carpeta real',
    body: 'El DJ elige desde Finder la carpeta donde ya organiza promos, edits, crates o sets.',
  },
  {
    title: 'Detecta cambios en local',
    body: 'La app lee audio compatible, subcarpetas, firmas y modificaciones sin mover la musica.',
  },
  {
    title: 'Sincroniza al workspace',
    body: 'Cada lectura genera snapshots y cambios revisables para abrir branches y PRs musicales.',
  },
  {
    title: 'Controlado por el DJ',
    body: 'El watch se puede iniciar, pausar y configurar con cuenta, intervalo y destino cloud.',
  },
];

export const launchChecklist = [
  'Conectar una biblioteca real de un DJ fundador',
  'Abrir 3 ramas: promos, set actual y edits privados',
  'Crear 5 PRs musicales con notas de decision',
  'Aprobar un master snapshot delante del comprador',
  'Cerrar el piloto con precio mensual y fecha de onboarding',
];
