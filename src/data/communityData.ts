import { driveDjProfiles } from './driveSnapshot';
import { recordpoolFolders, recordpoolTracks } from './recordpoolData';

export const platformStats = [
  { value: '6', label: 'djs en comunidad' },
  { value: '0', label: 'tracks visibles ahora' },
  { value: '15', label: 'carpetas visibles' },
  { value: '1', label: 'biblioteca compartida' },
];

export const libraryBlueprint = [
  {
    title: 'Portfolio',
    description: 'Cada perfil presenta al DJ con imagen, ciudad, identidad musical y una entrada clara a su universo sonoro.',
  },
  {
    title: 'Carpetas y subcarpetas',
    description: 'La librería conserva el orden real del DJ, pero lo muestra de una forma mucho más cómoda para explorar, seleccionar y volver rápido a lo importante.',
  },
  {
    title: 'Catalogo',
    description: 'La vista catálogo convierte una carpeta de música en una herramienta útil para pinchar: filtros, contexto, selección y acceso rápido.',
  },
  {
    title: 'Comunidad',
    description: 'Cada DJ mantiene su espacio y, al mismo tiempo, puede aportar valor al pool común cuando decide compartir música.',
  },
];

export const drivePlan = [
  {
    title: 'Drive como origen',
    body: 'Tu música sigue donde ya trabajas. MLABS la convierte en una experiencia mucho más ágil para revisar, buscar y moverte por ella.',
  },
  {
    title: 'Todo bien organizado',
    body: 'Perfiles, estados, favoritos y actividad del pool aportan orden y contexto sin obligarte a cambiar tu forma de trabajar.',
  },
  {
    title: 'Perfil + biblioteca',
    body: 'Cada DJ tiene presencia propia dentro de la plataforma: entras en su perfil, entiendes su línea y accedes a su librería desde el mismo sitio.',
  },
];

export const djProfiles = driveDjProfiles.map((profile) => ({
    ...profile,
    summary:
      `${profile.name} ya tiene su espacio dentro de la comunidad, listo para crecer con sets, carpetas, favoritos y música compartida.`,
    mission:
      'Este perfil está pensado para unir imagen, criterio musical y acceso directo a una librería trabajada con orden y personalidad.',
    ownerRoots: [profile.folderId],
    highlights: [
      'Espacio propio dentro del pool compartido',
      'Base lista para organizar promos, edits y favoritos',
      'Perfil preparado para enseñar identidad y librería en una sola vista',
    ],
    portfolio: [
      { label: 'Estado', value: 'Perfil activo' },
      { label: 'Enfoque', value: 'Colección propia + pool' },
      { label: 'Formato', value: 'Perfil + librería' },
    ],
  }));

function getDescendantIds(rootIds) {
  const collected = new Set();

  const walk = (folderId) => {
    collected.add(folderId);
    for (const folder of recordpoolFolders.filter((item) => item.parentId === folderId)) {
      walk(folder.id);
    }
  };

  rootIds.forEach(walk);
  return collected;
}

function rootCardsFor(rootIds) {
  return recordpoolFolders.filter((folder) => rootIds.includes(folder.id));
}

function childCardsFor(rootIds) {
  const allowed = getDescendantIds(rootIds);
  return recordpoolFolders.filter((folder) => allowed.has(folder.id) && folder.parentId && rootIds.includes(folder.parentId));
}

function tracksFor(rootIds) {
  const allowed = getDescendantIds(rootIds);
  return recordpoolTracks.filter((track) => allowed.has(track.folderId));
}

export function getCommunityProfiles() {
  return djProfiles.map((profile) => {
    const tracks = tracksFor(profile.ownerRoots);
    const rootCards = rootCardsFor(profile.ownerRoots);
    const firstLayerChildren = childCardsFor(profile.ownerRoots);

    return {
      ...profile,
      trackCount: tracks.length,
      rootCount: rootCards.length,
      childCount: firstLayerChildren.length,
      featuredTracks: tracks.slice(0, 6),
      rootCards,
      firstLayerChildren,
    };
  });
}

export function getCommunityProfile(slug) {
  return getCommunityProfiles().find((profile) => profile.slug === slug);
}
