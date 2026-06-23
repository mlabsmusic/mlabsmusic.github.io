export const gitMusicPrinciples = [
  {
    title: 'Biblioteca local primero',
    body: 'La música sigue en el ordenador del DJ. La web ayuda a verla, ordenarla y controlar qué cambia, sin obligarte a subirlo todo.',
  },
  {
    title: 'Borrador y versión estable',
    body: 'Cada DJ puede probar cambios con calma y decidir cuándo pasan a su biblioteca lista para usar.',
  },
  {
    title: 'Aportes a la biblioteca común',
    body: 'Solo la música que tú elijas se propone para la biblioteca compartida. El resto se queda en tu espacio privado.',
  },
];

export const gitMusicMetrics = [
  { value: '5', label: 'bibliotecas dj' },
  { value: '4', label: 'zonas principales' },
  { value: '3', label: 'estados de revisión' },
  { value: '0', label: 'canciones visibles hoy' },
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
    title: 'Ordenar y confirmar',
    body: 'El DJ revisa los cambios y decide qué se queda como borrador y qué pasa a su biblioteca estable.',
  },
  {
    step: '04',
    title: 'Compartir al pool',
    body: 'Cuando un tema merece compartirse, se manda a revisión para que pueda entrar en la biblioteca común.',
  },
];

export const demoWorkingChanges = [];

export const demoPullRequests = [];

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
