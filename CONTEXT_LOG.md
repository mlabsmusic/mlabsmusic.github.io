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
- Se creo una app macOS nativa para controlar carpeta local y lanzar el agente.
- Se limpio el discurso de la UI para que no suene a texto generado ni a demo falsa.
- Se arreglo el hero de video de la home con `webm`, `mp4` y `poster`.
- Se conecto el workspace a snapshots cloud reales cuando el agente ya ha sincronizado.
- Se valido el flujo `DJ -> PR musical -> owner -> 0_MASTER LIBRARY`.

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

- mejorar la UX final del owner review
- hacer visible la actividad master dentro del producto
- pulir la instalacion y el onboarding de la app macOS

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
- `macos/FolderAgentApp/Sources/MLABSFolderAgent/Services/AgentStore.swift`
- `src/pages/admin.astro`

### Notas operativas

- No incluir `.agents/` ni `skills-lock.json` en commits.
- Mantener el recordpool alineado con datos reales visibles.
- Antes de tocar copy o estructura, comprobar siempre que no volvemos a sonar a maqueta falsa.

### Checklist para retomar

1. `git checkout codex/drive-sync-recordpool`
2. `npm install`
3. `npm run dev -- --host 127.0.0.1 --port 4321`
4. `npm run build`
5. revisar `/`, `/djs`, `/recordpool`, `/workspace`, `/admin`
6. comprobar `0_MASTER LIBRARY` en Supabase
7. seguir con UX, master activity y deployment

## 2026-06-24

### Resumen de lo hecho

- Se mejoro `/admin` como cabina owner: metricas, PR activa, impacto previsto, historial y snapshots master.
- Se anadio actividad master en `/recordpool`: ultimos snapshots y reviews cerrados desde Supabase.
- Se aclaro la ingesta local en `/workspace`: app macOS, CLI agent y owner review como ruta principal.
- Se mejoro la app macOS con checklist de preparacion antes de arrancar el watch.
- Se amplio `macos/FolderAgentApp/README.md` con flujo de demo y verificacion por CLI.
- Se actualizo Playwright para el copy actual y para saltar tests privados si no hay credenciales validas.
- Se agrego `.agents/` y `skills-lock.json` a `.gitignore`.
- Se implementaron ramas musicales en `/workspace`: checkout, creacion local de ramas, branch graph y PRs etiquetadas desde la rama activa.
- Se anadio un Git graph musical estilo SourceTree en `/workspace`, con lanes para master, published, working y ramas crate/set.
- Se creo la capa comercial vendible: `/pricing`, `/for-crews`, pricing B2B, buyer segments, moats de producto y oferta Pilot/Community OS/Enterprise.
- Se conecto la home con el discurso de negocio: el valor no es almacenar tracks, sino vender control editorial para comunidades musicales.
- Se anadio captura de leads en paginas comerciales, guardada en `localStorage` bajo `mlabs_sales_leads_v1` para demos sin backend nuevo.
- Se creo `src/data/businessData.ts` para reutilizar pricing, segmentos, moats y checklist de lanzamiento.
- Se tomo el patron de venta B2B tipo TisaLabs y se adapto a MLABS: secciones "End-to-End Music Ops Platform" en home y `/for-crews`.
- Se anadio el flujo visual `Local DJ Folder -> MLABS Agent -> Music Branches -> Pull Request -> Owner Review -> 0_MASTER Library`.
- Se agregaron beneficios de venta: controlled music deployment, unified library management, traceable music decisions y community monetization layer.
- Se agrego FAQ de objeciones en `/for-crews` y CTA fijo "Reservar piloto de 7 dias".
- Se anadio en la home una seccion "App macOS Apple Silicon" con preview visual de `MLABS Folder Agent`, CTA de descarga y features de ingesta local.
- Se genero `public/downloads/MLABSFolderAgent-apple-silicon.zip` desde `dist/MLABSFolderAgent.app` para pilotos con Macs M1/M2/M3/M4.
- `macos/FolderAgentApp/script/build_and_run.sh` ahora acepta `--package` para compilar sin abrir la app.

### Validacion

- `npm run build`: OK.
- `swift build` en `macos/FolderAgentApp`: OK. Xcode muestra avisos de clases duplicadas en frameworks, pero el binario compila.
- `npx playwright test`: 15 passed, 5 skipped. Los saltados son flujos privados que requieren `TEST_DJ_EMAIL` y `TEST_DJ_PASSWORD`.

### Notas nuevas

- Las credenciales por defecto del TEST DJ ya no son validas en Supabase: el login devuelve `Invalid login credentials`.
- Para validar recordpool privado y workspace cloud completos, ejecutar:

```bash
TEST_DJ_EMAIL="..." TEST_DJ_PASSWORD="..." npx playwright test
```

- La fuente de ingesta principal queda definida como carpeta local + agente/app macOS + Supabase. Drive sigue como reflejo visible/publico de estructura.
- Las ramas viven como capa de producto/localStorage sobre el modelo actual; snapshots y change sets cloud se etiquetan con la rama activa en label, root path y descripcion sin crear tablas nuevas.
- El Git graph usa fallback local cuando no hay sesion y se alimenta de `library_snapshots` + `library_change_sets` cuando Supabase responde.
- `/pricing` y `/for-crews` no crean datos en Supabase todavia; el lead capture es intencionadamente local para poder vender y ensenar sin tocar RLS/schema.
- El CTA fijo debe vivir fuera de `.page-wrap`; si se mete dentro, el transform de entrada rompe el comportamiento fixed en mobile/desktop.
- La descarga macOS es una beta sin notarizar; el copy de web lo indica para evitar prometer distribucion publica final antes de firma/notarizacion.
