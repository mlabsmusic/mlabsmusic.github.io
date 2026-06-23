import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const sourceAgentPath = path.join(rootDir, 'app', 'music-agent.mjs');
const distDir = path.join(rootDir, 'dist', 'macos-folder-agent');

const packageJson = {
  name: 'mlabs-macos-folder-agent',
  private: true,
  type: 'module',
  scripts: {
    scan: 'node ./music-agent.mjs',
    watch: 'node ./music-agent.mjs --watch',
  },
  dependencies: {
    '@supabase/supabase-js': '^2.49.4',
  },
};

const envExample = `PUBLIC_SUPABASE_URL=https://fenjuzfypyqsdkebpfsb.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_CPPtU22MxhzUxNidXVxKRg_EcRc17-B
MLABS_AGENT_EMAIL=
MLABS_AGENT_PASSWORD=
`;

const readme = `# MLABS macOS Folder Agent

Este paquete prepara el agente local que lee una carpeta musical, detecta cambios y los sincroniza con MLABS Recordpool.

## 1. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

## 2. Configurar acceso

Duplica \`.env.example\` como \`.env\` y completa:

- \`MLABS_AGENT_EMAIL\`
- \`MLABS_AGENT_PASSWORD\`

## 3. Lanzar modo watch

Puedes abrir el lanzador de macOS:

\`\`\`
start-watch.command
\`\`\`

O usar terminal:

\`\`\`bash
npm run watch -- "/ruta/a/tu/libreria"
\`\`\`

## 4. Escaneo puntual

\`\`\`bash
npm run scan -- "/ruta/a/tu/libreria"
\`\`\`

El agente crea un cache local \`.mlabs-git-music-cache.json\` dentro de la carpeta musical para comparar cambios entre lecturas.
`;

const watchLauncher = `#!/bin/zsh
set -e
cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
  echo "Falta .env. Duplica .env.example y rellena tus credenciales."
  read -r "REPLY?Pulsa Enter para cerrar..."
  exit 1
fi

if [ -z "$1" ]; then
  echo "Uso: abre este archivo pasando una carpeta o ejecuta:"
  echo "./start-watch.command \\"/ruta/a/tu/libreria\\""
  read -r "REPLY?Pulsa Enter para cerrar..."
  exit 1
fi

npm install
node ./music-agent.mjs "$1" --watch
`;

async function main() {
  await fs.mkdir(distDir, { recursive: true });

  const agentSource = await fs.readFile(sourceAgentPath, 'utf8');

  await Promise.all([
    fs.writeFile(path.join(distDir, 'music-agent.mjs'), agentSource),
    fs.writeFile(path.join(distDir, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`),
    fs.writeFile(path.join(distDir, '.env.example'), envExample),
    fs.writeFile(path.join(distDir, 'README.md'), readme),
    fs.writeFile(path.join(distDir, 'start-watch.command'), watchLauncher),
  ]);

  await fs.chmod(path.join(distDir, 'start-watch.command'), 0o755);

  console.log(`[agent-dist] preparado en ${distDir}`);
}

await main();
