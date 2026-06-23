import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const audioExtensions = new Set([
  '.mp3',
  '.wav',
  '.aiff',
  '.aif',
  '.m4a',
  '.aac',
  '.flac',
]);

function parseArgs(argv) {
  const args = { mode: 'scan', root: '', email: '', password: '', intervalMs: 2500, silent: false };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--') && !args.root) {
      args.root = token;
      continue;
    }

    if (token === '--watch') args.mode = 'watch';
    if (token === '--silent') args.silent = true;
    if (token === '--email') args.email = argv[index + 1] || '', index += 1;
    if (token === '--password') args.password = argv[index + 1] || '', index += 1;
    if (token === '--interval') args.intervalMs = Number(argv[index + 1] || 2500), index += 1;
  }

  return args;
}

const args = parseArgs(process.argv.slice(2));

if (!args.root) {
  console.error('Usage: node app/music-agent.mjs "/ruta/a/tu/libreria" [--watch] [--email mail] [--password pass] [--silent]');
  process.exit(1);
}

function log(...messages) {
  if (!args.silent) console.log(...messages);
}

async function walk(dir, baseDir, files = []) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(absolutePath, baseDir, files);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!audioExtensions.has(extension)) continue;

    const stat = await fsp.stat(absolutePath);
    const relativePath = path.relative(baseDir, absolutePath);
    const signature = crypto
      .createHash('sha1')
      .update(`${relativePath}:${stat.size}:${stat.mtimeMs}`)
      .digest('hex');

    files.push({
      path: relativePath,
      name: entry.name,
      extension,
      size: stat.size,
      modifiedAt: new Date(stat.mtimeMs).toISOString(),
      signature,
    });
  }

  return files;
}

function diffSnapshots(previous, next) {
  const prevMap = new Map(previous.map((item) => [item.path, item]));
  const nextMap = new Map(next.map((item) => [item.path, item]));
  const changes = [];

  for (const item of next) {
    if (!prevMap.has(item.path)) {
      changes.push({ entity_type: 'track', change_type: 'added', entity_key: item.name, before_json: null, after_json: item });
      continue;
    }

    const previousItem = prevMap.get(item.path);
    if (previousItem.signature !== item.signature) {
      changes.push({ entity_type: 'track', change_type: 'updated', entity_key: item.name, before_json: previousItem, after_json: item });
    }
  }

  for (const item of previous) {
    if (!nextMap.has(item.path)) {
      changes.push({ entity_type: 'track', change_type: 'removed', entity_key: item.name, before_json: item, after_json: null });
    }
  }

  return changes;
}

function totalBytes(snapshot) {
  return snapshot.reduce((sum, item) => sum + (item.size || 0), 0);
}

function loadEnv() {
  const envPath = path.resolve('.env');
  const parsed = {};

  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\n+/)) {
      if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
      const separator = line.indexOf('=');
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      if (key) parsed[key] = value;
    }
  }

  return {
    ...parsed,
    ...process.env,
  };
}

function getCachePath(root) {
  return path.join(root, '.mlabs-git-music-cache.json');
}

async function readCache(root) {
  try {
    return JSON.parse(await fsp.readFile(getCachePath(root), 'utf8'));
  } catch {
    return { snapshot: [], lastCloudSnapshotId: '', libraryId: '' };
  }
}

async function writeCache(root, cache) {
  await fsp.writeFile(getCachePath(root), JSON.stringify(cache, null, 2));
}

async function getSupabaseContext(root) {
  const env = loadEnv();
  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
  const email = args.email || process.env.MLABS_AGENT_EMAIL;
  const password = args.password || process.env.MLABS_AGENT_PASSWORD;

  if (!email || !password) {
    throw new Error('Faltan credenciales. Usa --email y --password o define MLABS_AGENT_EMAIL y MLABS_AGENT_PASSWORD.');
  }

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;

  const userId = signIn.data.user.id;
  const profileRes = await supabase.from('profiles').select('id, display_name, slug').eq('id', userId).single();
  if (profileRes.error) throw profileRes.error;

  let libraryRes = await supabase
    .from('libraries')
    .select('id, name, slug, current_working_snapshot_id, current_published_snapshot_id')
    .eq('profile_id', userId)
    .eq('kind', 'personal')
    .maybeSingle();

  if (libraryRes.error) throw libraryRes.error;

  if (!libraryRes.data) {
    const inserted = await supabase
      .from('libraries')
      .insert({
        profile_id: userId,
        name: `${profileRes.data.display_name || 'DJ'} Library`,
        slug: `${profileRes.data.slug || userId}-library`,
        kind: 'personal',
        is_public: false,
      })
      .select('id, name, slug, current_working_snapshot_id, current_published_snapshot_id')
      .single();

    if (inserted.error) throw inserted.error;
    libraryRes = { data: inserted.data };
  }

  const cache = await readCache(root);
  return {
    supabase,
    profile: profileRes.data,
    library: libraryRes.data,
    cache,
  };
}

async function scanRoot(root) {
  const absoluteRoot = path.resolve(root);
  const snapshot = await walk(absoluteRoot, absoluteRoot);
  return {
    root: absoluteRoot,
    scannedAt: new Date().toISOString(),
    fileCount: snapshot.length,
    totalBytes: totalBytes(snapshot),
    snapshot,
  };
}

async function syncSnapshot(root, scanResult) {
  const { supabase, profile, library, cache } = await getSupabaseContext(root);
  const previousSnapshot = cache.snapshot || [];
  const changes = diffSnapshots(previousSnapshot, scanResult.snapshot);

  if (!changes.length && cache.lastCloudSnapshotId) {
    log(`[agent] sin cambios en ${scanResult.root}`);
    return { synced: false, reason: 'no_changes' };
  }

  const snapshotInsert = await supabase
    .from('library_snapshots')
    .insert({
      library_id: library.id,
      created_by: profile.id,
      label: `${path.basename(scanResult.root)} agent snapshot`,
      source_kind: 'local_agent',
      root_path: scanResult.root,
      file_count: scanResult.fileCount,
      total_bytes: scanResult.totalBytes,
      based_on_snapshot_id: cache.lastCloudSnapshotId || null,
      snapshot_json: scanResult.snapshot,
    })
    .select('id')
    .single();

  if (snapshotInsert.error) throw snapshotInsert.error;

  const snapshotId = snapshotInsert.data.id;

  await supabase
    .from('libraries')
    .update({
      current_working_snapshot_id: snapshotId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', library.id);

  if (changes.length) {
    const changeSetInsert = await supabase
      .from('library_change_sets')
      .insert({
        library_id: library.id,
        created_by: profile.id,
        title: `Auto sync · ${new Date().toLocaleString('es-ES')}`,
        description: `${changes.length} cambios detectados por el agente local.`,
        target_kind: 'library',
        status: 'draft',
        from_snapshot_id: library.current_published_snapshot_id || null,
        to_snapshot_id: snapshotId,
      })
      .select('id')
      .single();

    if (changeSetInsert.error) throw changeSetInsert.error;

    const rows = changes.map((change) => ({
      change_set_id: changeSetInsert.data.id,
      entity_type: change.entity_type,
      change_type: change.change_type,
      entity_key: change.entity_key,
      before_json: change.before_json,
      after_json: change.after_json,
      selected_for_master: false,
    }));

    const changeInsert = await supabase.from('library_changes').insert(rows);
    if (changeInsert.error) throw changeInsert.error;
  }

  await writeCache(root, {
    snapshot: scanResult.snapshot,
    lastCloudSnapshotId: snapshotId,
    libraryId: library.id,
  });

  log(`[agent] synced ${scanResult.fileCount} archivos · ${changes.length} cambios · snapshot ${snapshotId}`);
  return { synced: true, snapshotId, changeCount: changes.length };
}

async function runScan() {
  const result = await scanRoot(args.root);

  if (args.email || process.env.MLABS_AGENT_EMAIL) {
    await syncSnapshot(args.root, result);
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

async function runWatch() {
  const absoluteRoot = path.resolve(args.root);
  await runScan();

  let timer = null;
  const resync = async () => {
    try {
      const result = await scanRoot(absoluteRoot);
      await syncSnapshot(absoluteRoot, result);
    } catch (error) {
      console.error('[agent] sync error:', error.message);
    }
  };

  const watcher = fs.watch(absoluteRoot, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(resync, args.intervalMs);
  });

  log(`[agent] watching ${absoluteRoot}`);

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

if (args.mode === 'watch') {
  await runWatch();
} else {
  await runScan();
}
