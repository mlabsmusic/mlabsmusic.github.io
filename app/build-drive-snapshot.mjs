import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const inputPath = process.argv[2] || path.join(cwd, 'app', 'drive-snapshot.json');
const outputPath = path.join(cwd, 'src', 'data', 'driveSnapshot.ts');

function q(value) {
  return JSON.stringify(value);
}

function renderFolder(folder) {
  return `  {
    id: ${q(folder.id)},
    name: ${q(folder.name)},
    parentId: ${folder.parentId ? q(folder.parentId) : 'null'},
    description: ${q(folder.description || '')},
  },`;
}

function renderProfile(profile) {
  return `  {
    slug: ${q(profile.slug)},
    name: ${q(profile.name)},
    city: ${q(profile.city)},
    genres: [${(profile.genres || []).map((genre) => q(genre)).join(', ')}],
    heroImage: ${q(profile.heroImage)},
    folderId: ${q(profile.folderId)},
  },`;
}

async function main() {
  const raw = await fs.readFile(inputPath, 'utf8');
  const data = JSON.parse(raw);

  if (!data.root || !Array.isArray(data.folders) || !Array.isArray(data.profiles)) {
    throw new Error('El JSON necesita root, folders y profiles.');
  }

  const output = `export const driveRoot = {
  id: ${q(data.root.id)},
  name: ${q(data.root.name)},
  url: ${q(data.root.url)},
  syncedAt: ${q(data.root.syncedAt)},
};

export const driveVisibleFolders = [
${data.folders.map(renderFolder).join('\n')}
] as const;

export const driveDjProfiles = [
${data.profiles.map(renderProfile).join('\n')}
] as const;
`;

  await fs.writeFile(outputPath, output, 'utf8');
  process.stdout.write(`Snapshot escrito en ${outputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
