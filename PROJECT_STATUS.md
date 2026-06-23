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

Pendiente de endurecer y terminar:

- merge real `working -> published`
- PR musical hacia master
- aprobacion owner conectada extremo a extremo
- mejor lectura del Drive o estrategia de ingestion alternativa

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

- rama actual: `codex/drive-sync-recordpool`

## Siguiente objetivo recomendado

1. cerrar el flujo completo del workspace con Supabase
2. permitir aprobar o rechazar PRs musicales desde `/admin`
3. definir ingestion real de canciones desde Drive o desde carpeta local
4. conectar perfil DJ con su biblioteca cloud real
