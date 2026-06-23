# CONTEXT LOG

Este archivo guarda contexto operativo para retomar el trabajo rapido en futuras sesiones.

## 2026-06-23

### Resumen de lo hecho

- Se rehizo la narrativa del sitio alrededor de un recordpool comunitario.
- Se sustituyeron datos falsos del recordpool por una foto real de la estructura visible de Google Drive.
- Se dejaron perfiles DJ reales a partir de las carpetas visibles:
  - Marques Edition
  - DJ Fesst
  - DJ Nico
  - ArzoMusic
  - Franjdeejay
- Se anadio un workspace que representa la idea de Git musical.
- Se implemento un agente local base que escanea librerias y sube snapshots a Supabase.
- Se limpio el discurso de la UI para que no suene a texto generado ni a demo falsa.
- Se arreglo el hero de video de la home con `webm`, `mp4` y `poster`.

### Estructura visible confirmada del Drive

Root compartido:

- `MLABSMUSIC.COM`

Carpetas principales:

- `0_MASTER LIBRARY`
- `1_DJ LIBRARIES`
- `2_MASTER REQUESTS`
- `3_WEB ASSETS`

Subcarpetas DJ visibles:

- `MARQUES EDITION`
- `DJ FESST`
- `DJ NICO`
- `ARZOMUSIC`
- `FRANJDEEJAY`

Subcarpetas de requests visibles:

- `PENDING`
- `APPROVED`
- `REJECTED`

### Decisiones de producto ya tomadas

- La web no debe inventar canciones si el Drive no las expone.
- Cada DJ tendra su biblioteca personal.
- `0_MASTER LIBRARY` sera la libreria comun.
- Las aportaciones a master deben pasar por una revision tipo PR musical.
- El workspace debe funcionar como una experiencia parecida a Git pero para musica.
- La carpeta local del usuario es la fuente principal para detectar cambios.

### Cosas pendientes

#### Prioridad alta

- conectar el login y las bibliotecas reales de Supabase con el workspace
- hacer merge real de snapshots `working -> published`
- conectar `2_MASTER REQUESTS` al panel owner
- permitir aprobar y rechazar PRs musicales desde la web

#### Prioridad media

- mejorar ingestion de contenido profundo del Drive
- decidir si el master vive solo en Drive o en una mezcla `Drive + metadata en Supabase`
- enriquecer perfiles DJ con portfolio real y actividad

#### Prioridad baja

- refinar aun mas microcopy y detalles visuales
- automatizar sincronizacion del snapshot del Drive

### Archivos clave

- `src/data/driveSnapshot.ts`
- `src/data/recordpoolData.ts`
- `src/data/communityData.ts`
- `src/data/gitMusicData.ts`
- `src/pages/recordpool.astro`
- `src/pages/workspace.astro`
- `src/pages/djs/index.astro`
- `src/pages/djs/[slug].astro`
- `app/build-drive-snapshot.mjs`
- `app/music-agent.mjs`

### Notas operativas

- No incluir `.agents/` ni `skills-lock.json` en commits.
- Mantener el recordpool alineado con datos reales visibles.
- Antes de tocar copy o estructura, comprobar siempre que no volvemos a sonar a maqueta falsa.

### Checklist para retomar

1. `git checkout codex/drive-sync-recordpool`
2. `npm install`
3. `npm run dev -- --host 127.0.0.1 --port 4321`
4. `npm run build`
5. revisar `/`, `/djs`, `/recordpool`, `/workspace`
6. seguir con merge real y PR musical owner
