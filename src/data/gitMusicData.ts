export const gitMusicPrinciples = [
  {
    title: 'Biblioteca local primero',
    body: 'La música sigue en el ordenador del DJ. La web ayuda a verla, ordenarla y controlar qué cambia, sin obligarte a subirlo todo.',
  },
  {
    title: 'Ramas por crate o set',
    body: 'Cada DJ puede abrir una rama para preparar promos, limpiar tags o probar un set sin tocar su version estable.',
  },
  {
    title: 'Aportes a la biblioteca común',
    body: 'Solo la música que tú elijas se propone para la biblioteca compartida. El resto se queda en tu espacio privado.',
  },
];

export const gitMusicMetrics = [
  { value: '6', label: 'bibliotecas dj' },
  { value: '4', label: 'zonas principales' },
  { value: '4', label: 'ramas musicales' },
  { value: '3', label: 'estados de revisión' },
];

export const gitMusicFlow = [
  {
    step: '01',
    title: 'Conectar carpeta local',
    body: 'El DJ conecta una carpeta de música y la web hace una primera lectura para entender qué hay dentro.',
  },
  {
    step: '02',
    title: 'Ver qué ha cambiado',
    body: 'La plataforma compara el estado actual con el anterior y detecta temas nuevos, movidos, renombrados o editados.',
  },
  {
    step: '03',
    title: 'Crear ramas musicales',
    body: 'El DJ hace checkout a working, crate/latin-promos o set/afterhours y decide donde guardar cada cambio.',
  },
  {
    step: '04',
    title: 'Compartir al pool',
    body: 'Cuando un tema merece compartirse, se manda a revisión para que pueda entrar en la biblioteca común.',
  },
];

export const demoWorkingChanges = [];

export const demoPullRequests = [];

export const demoBranches = [
  {
    id: 'published',
    name: 'published',
    label: 'Biblioteca estable',
    status: 'protected',
    source: 'current_published_snapshot_id',
    description: 'La version lista para pinchar. Solo cambia cuando haces merge desde una rama de trabajo.',
  },
  {
    id: 'working',
    name: 'working',
    label: 'Trabajo diario',
    status: 'active',
    source: 'current_working_snapshot_id',
    description: 'La rama donde llegan lecturas del agente, cambios locales y pruebas antes de publicar.',
  },
  {
    id: 'crate-latin-promos',
    name: 'crate/latin-promos',
    label: 'Crate Latin promos',
    status: 'review',
    source: 'working',
    description: 'Rama de preparacion para seleccionar promos latinos antes de abrir PR musical.',
  },
  {
    id: 'set-afterhours',
    name: 'set/afterhours',
    label: 'Set afterhours',
    status: 'draft',
    source: 'working',
    description: 'Rama privada para probar una seleccion de set sin tocar published ni master.',
  },
];

export const sampleLocalTree = [
  {
    name: 'MLABSMUSIC.COM',
    children: [
      {
        name: '0_MASTER LIBRARY',
      },
      {
        name: '1_DJ LIBRARIES',
        children: [
          { name: 'MARQUES EDITION' },
          { name: 'DJ FESST' },
          { name: 'DJ NICO' },
          { name: 'ARZOMUSIC' },
          { name: 'FRANJDEEJAY' },
          {
            name: 'TEST',
            children: [
              { name: 'POR ORDENAR' },
              { name: 'FAVORITOS' },
            ],
          },
        ],
      },
      {
        name: '2_MASTER REQUESTS',
        children: [
          { name: 'PENDING' },
          { name: 'APPROVED' },
          { name: 'REJECTED' },
        ],
      },
      {
        name: '3_WEB ASSETS',
      },
    ],
  },
];
