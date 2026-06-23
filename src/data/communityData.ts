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
    description: 'Foto, bio, ciudad, estilos y una pequeña presentación para que cualquiera entienda rápido quién es ese DJ.',
  },
  {
    title: 'Carpetas y subcarpetas',
    description: 'Cada DJ entra a sus carpetas principales, baja por sus subcarpetas y encuentra la música ya ordenada de una forma clara.',
  },
  {
    title: 'Catalogo',
    description: 'Además del Drive, la app ofrece una vista cómoda para buscar por BPM, tonalidad, tipo de edit y descargas.',
  },
  {
    title: 'Comunidad',
    description: 'Cada tema puede quedarse privado o compartirse con la comunidad, sin perder el orden de la biblioteca personal.',
  },
];

export const drivePlan = [
  {
    title: 'Drive como origen',
    body: 'La música sigue guardada en Google Drive. La web la organiza para que navegarla, escucharla y descargarla sea mucho más fácil.',
  },
  {
    title: 'Todo bien organizado',
    body: 'Perfiles, favoritos, datos de los tracks y actividad del pool se guardan aparte para que todo esté mejor ordenado y sea más útil.',
  },
  {
    title: 'Perfil + biblioteca',
    body: 'Cada DJ tiene su perfil y su propia biblioteca. Entras, ves quién es, qué estilo mueve y después recorres su música.',
  },
];

export const djProfiles = driveDjProfiles.map((profile) => ({
    ...profile,
    summary:
      `Perfil de ${profile.name} dentro de la comunidad. Su carpeta ya está creada en Drive y servirá como base para organizar su biblioteca personal.`,
    mission:
      'La idea es que este perfil muestre tanto la identidad del DJ como la entrada a su biblioteca real, respetando la estructura que tenga en Drive.',
    ownerRoots: [profile.folderId],
    highlights: [
      'Carpeta real ya visible dentro de 1_DJ LIBRARIES',
      'Preparado para enseñar subcarpetas y música en cuanto Drive devuelva contenido',
      'Buen punto de partida para una biblioteca bien cuidada dentro de la comunidad',
    ],
    portfolio: [
      { label: 'Estado', value: 'Carpeta creada' },
      { label: 'Enfoque', value: 'Biblioteca personal + comunidad' },
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
