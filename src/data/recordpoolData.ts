import { driveRoot, driveVisibleFolders } from './driveSnapshot';

export const recordpoolSource = {
  name: driveRoot.name,
  folderUrl: driveRoot.url,
  folderId: driveRoot.id,
  syncedAt: driveRoot.syncedAt,
};

export const recordpoolLayers = [
  {
    title: 'Estructura real del Drive',
    description: 'La web ya parte de la jerarquía visible en Google Drive: biblioteca master, librerías de DJs, solicitudes y assets.',
  },
  {
    title: 'Bibliotecas por DJ',
    description: 'Cada DJ tiene su carpeta propia dentro de la comunidad. Cuando haya más contenido visible, aparecerá aquí con su misma estructura.',
  },
  {
    title: 'Solicitudes a master',
    description: 'Las propuestas para la biblioteca común se ordenan por estado para que el flujo de revisión sea claro y fácil de seguir.',
  },
];

function buildFolderUrl(id) {
  return `https://drive.google.com/drive/folders/${id}?usp=sharing`;
}

const baseFolders = driveVisibleFolders.map((folder) => ({
  ...folder,
  vibe: folder.description,
  type: 'folder',
  folderUrl: buildFolderUrl(folder.id),
}));

function buildFolderMeta(parentId, folders, depth = 0, parentPath = []) {
  const children = folders
    .filter((folder) => folder.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));

  return children.flatMap((folder) => {
    const path = [...parentPath, folder.name];
    return [
      {
        ...folder,
        depth,
        playlistPath: path.join(' / '),
      },
      ...buildFolderMeta(folder.id, folders, depth + 1, path),
    ];
  });
}

export function getFolderDescendantIds(folderId, folders = recordpoolFolders) {
  const branch = [folderId];
  const walk = (parentId) => {
    for (const folder of folders.filter((item) => item.parentId === parentId)) {
      branch.push(folder.id);
      walk(folder.id);
    }
  };

  walk(folderId);
  return branch;
}

export const recordpoolTracks = [];

function countTracksForFolder(folderId) {
  const branchIds = new Set(getFolderDescendantIds(folderId, baseFolders));
  return recordpoolTracks.filter((track) => branchIds.has(track.folderId)).length;
}

export const recordpoolFolders = baseFolders.map((folder) => ({
  ...folder,
  directChildCount: baseFolders.filter((item) => item.parentId === folder.id).length,
  trackCount: countTracksForFolder(folder.id),
  mappingStatus: countTracksForFolder(folder.id) > 0 ? 'Indexado' : 'Sin canciones visibles',
}));

export const recordpoolFolderTree = buildFolderMeta(null, recordpoolFolders);
