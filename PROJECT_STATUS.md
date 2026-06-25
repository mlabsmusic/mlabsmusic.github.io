# PROJECT STATUS

Ultima actualizacion: 2026-06-24

## Direccion del producto

MLABS pasa a ser un **recordpool comunitario para DJs**.

Vision actual:

- cada DJ tiene un perfil propio
- cada DJ tiene una biblioteca personal
- la biblioteca personal puede leerse desde una carpeta local
- los cambios se guardan como snapshots y cambios revisables
- el owner revisa aportaciones hacia `0_MASTER LIBRARY`
- el recordpool publico refleja la estructura visible de Google Drive
- el producto se presenta como una **End-to-End Music Ops Platform**: carpeta local, agente, ramas, PR musical, owner review y master publicado

## Lo que ya esta montado

### Frontend

- Home enfocada al producto recordpool
- Vista de comunidad en `/djs`
- Perfil individual en `/djs/[slug]`
- Recordpool en `/recordpool`
- Workspace tipo Git musical en `/workspace`
- Pricing comercial en `/pricing`
- Pagina de venta para crews, sellos, promotoras y recordpools en `/for-crews`
- Demo comercial de 3 minutos en `/demo`
- Login en `/login`
- Panel owner en `/admin`
- Hidratacion cloud del workspace cuando el agente local ya ha subido snapshots
- Cabina owner con metricas, impacto previsto del merge y snapshots master recientes
- Actividad de `0_MASTER LIBRARY` visible desde `/recordpool`
- Bloque de ingesta local dentro de `/workspace`
- Ramas musicales en `/workspace`: `published`, `working`, `crate/*`, `set/*`, checkout y creacion local de ramas
- Git graph musical en `/workspace`, estilo SourceTree, para ver commits, ramas, snapshots, merges y PRs
- Captura de leads desde paginas comerciales, guardada localmente para preparar demos
- Seccion Music Ops en home y `/for-crews`, con diagrama end-to-end, beneficios B2B, FAQ de objeciones y CTA fijo de piloto
- Seccion App Mac en home con preview de `MLABS Folder Agent` y descarga para Apple Silicon

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
- muestra checklist de preparacion antes de iniciar el watch
- descarga publica pausada durante desarrollo para evitar bloqueos de Gatekeeper en pilotos
- requisito comunicado en web: macOS 14+ y Macs con procesador M1/M2/M3/M4 en entrega manual

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
- capa de ramas compatible con snapshots/change sets actuales sin migracion nueva

Pendiente de endurecer y terminar:

- credenciales validas para smoke tests privados en CI/local
- preparar distribucion Developer ID firmada/notarizada de la app macOS antes de entregar descarga publica
- mejorar lectura profunda de Drive si Google expone permisos de subcarpetas/canciones
- conectar el lead capture a Supabase/CRM cuando se decida el flujo comercial real

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

Tests:

```bash
npm run build
npx playwright test
TEST_DJ_EMAIL="..." TEST_DJ_PASSWORD="..." npx playwright test
```

Los tests privados de recordpool/workspace se saltan si no se definen credenciales validas.

Validacion actual:

- `npm run build`: OK, 16 paginas generadas.
- `npx playwright test`: 15 passed, 5 skipped por falta de credenciales privadas.

## Rama de trabajo

- revisar rama actual antes de commit con `git branch --show-current`

## Siguiente objetivo recomendado

1. conectar credenciales validas para correr los smoke tests privados completos
2. hacer build de demo y revisar `/recordpool`, `/workspace`, `/admin`
3. preparar commit, push y demo externa
4. decidir si se firma/notariza `MLABSFolderAgent.app`
