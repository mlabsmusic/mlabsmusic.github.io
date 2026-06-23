# PROJECT STATUS

Ultima actualizacion: 2026-06-23

## Direccion del producto

MLABS pasa a ser un **recordpool comunitario para DJs**.

Vision actual:

- cada DJ tiene un perfil propio
- cada DJ tiene una biblioteca personal
- la biblioteca personal puede leerse desde una carpeta local
- los cambios se guardan como snapshots y cambios revisables
- el owner revisa aportaciones hacia `0_MASTER LIBRARY`
- el recordpool publico refleja la estructura visible de Google Drive

## Lo que ya esta montado

### Frontend

- Home enfocada al producto recordpool
- Vista de comunidad en `/djs`
- Perfil individual en `/djs/[slug]`
- Recordpool en `/recordpool`
- Workspace tipo Git musical en `/workspace`
- Login en `/login`
- Panel owner en `/admin`
- Hidratacion cloud del workspace cuando el agente local ya ha subido snapshots

### Datos reales del Drive

Se creo una sincronizacion visible del Drive:

- fuente: `app/drive-snapshot.json`
- generador: `app/build-drive-snapshot.mjs`
- consumo web: `src/data/driveSnapshot.ts`

La web ya usa esa fuente para:

- estructura del recordpool
- lista de perfiles DJ visibles
- copy y estados vacios honestos

### Agente local

Existe un agente local funcional base:

- archivo: `app/music-agent.mjs`
- escanea una carpeta local
- detecta audio por extension
- genera firma por ruta, tamano y fecha
- compara contra cache local
- crea snapshots en Supabase
- crea change sets y cambios detectados
- soporta modo watch
- recuerda carpeta, email, intervalo y modo dentro de la app macOS

### App macOS

Existe una app macOS nativa funcional:

- carpeta: `macos/FolderAgentApp`
- bundle generado: `dist/MLABSFolderAgent.app`
- selecciona carpeta local
- guarda configuracion basica
- arranca y detiene el agente
- muestra estado, log y vista previa local

Scripts disponibles:

```bash
npm run agent:scan -- "/ruta/a/libreria"
npm run agent:watch -- "/ruta/a/libreria"
```

## Estado real del Drive visible hoy

Root:

- `MLABSMUSIC.COM`

Zonas visibles:

- `0_MASTER LIBRARY`
- `1_DJ LIBRARIES`
- `2_MASTER REQUESTS`
- `3_WEB ASSETS`

DJs visibles:

- `MARQUES EDITION`
- `DJ FESST`
- `DJ NICO`
- `ARZOMUSIC`
- `FRANJDEEJAY`

Estados visibles de solicitudes:

- `PENDING`
- `APPROVED`
- `REJECTED`

## Limitacion actual importante

Con el acceso actual del conector de Google Drive, la web esta viendo bien la estructura principal, pero no siempre el contenido profundo de cada carpeta DJ ni canciones internas.

Consecuencia:

- la UI muestra las carpetas reales visibles
- si no hay canciones accesibles, muestra empty states honestos
- no se inventan tracks

## Base de datos y modelo

La estructura de Supabase ya esta orientada a:

- perfiles
- bibliotecas
- snapshots
- change sets
- cambios individuales
- flujo de revision

Ya validado extremo a extremo:

- merge `working -> published` en biblioteca personal
- PR musical a `0_MASTER LIBRARY`
- aprobacion owner desde `/admin`
- merge owner que publica snapshot real en master
- lectura de snapshots cloud en `/workspace`

Pendiente de endurecer y terminar:

- convertir la publicacion a master en una experiencia mas editorial y menos tecnica
- mostrar mejor la actividad master en la web publica
- mejor lectura del Drive o estrategia de ingestion alternativa
- instalacion mas pulida del agente/app macOS

## Validacion operativa hecha hoy

Se valido el flujo completo con el perfil `TEST`:

- login web real
- sync del agente desde carpeta local de prueba
- snapshots en Supabase
- change sets en la libreria personal
- PR musical hacia master
- merge owner desde `/admin`
- publicacion real en `0_MASTER LIBRARY`

Resultado confirmado:

- `0_MASTER LIBRARY` tiene snapshot publicado real
- archivo validado en master: `Latin/Promos/afterhours-tool.aac`
- bundle macOS funcional en `dist/MLABSFolderAgent.app`

## Comandos utiles

Desarrollo:

```bash
npm run dev -- --host 127.0.0.1 --port 4321
```

Build:

```bash
npm run build
```

Refrescar snapshot visible del Drive:

```bash
npm run drive:sync
```

## Rama de trabajo

- revisar rama actual antes de commit con `git branch --show-current`

## Siguiente objetivo recomendado

1. mejorar la UX del owner review y la visibilidad del master
2. mostrar actividad master y ultimos merges en la web
3. definir ingestion real de canciones desde Drive o desde carpeta local
4. preparar commit, push y demo externa
