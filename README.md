# mlabsmusic.github.io

Web base de **MLABS RECORDPOOL**, una comunidad de DJs con perfiles propios, bibliotecas personales, control de cambios tipo Git musical y una librería master compartida.

## Estado actual

El proyecto ya no está planteado como una web corporativa clásica. La dirección del producto ahora es:

- comunidad de DJs con perfil público
- biblioteca personal por DJ
- workspace para leer carpeta local, detectar cambios y guardarlos como snapshots
- flujo de solicitudes hacia `0_MASTER LIBRARY`
- recordpool navegable desde la estructura visible de Google Drive

Resumen más detallado:

- [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- [CONTEXT_LOG.md](./CONTEXT_LOG.md)

## Stack

- `Astro`
- `Supabase Auth + Postgres`
- `Google Drive` como origen visible del recordpool
- `GitHub Pages` para despliegue

## Rutas principales

- `/` home del producto
- `/djs` comunidad de DJs
- `/djs/[slug]` perfil individual del DJ
- `/recordpool` explorador del recordpool
- `/workspace` espacio tipo Git musical para la biblioteca local
- `/login` acceso de usuario
- `/admin` revisión owner y gestión interna

## Scripts

```bash
npm install
npm run dev
npm run build
npm run drive:sync
npm run agent:scan -- "/ruta/a/libreria"
npm run agent:watch -- "/ruta/a/libreria"
```

## Variables de entorno

La app necesita:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

El agente local también puede usar:

- `MLABS_AGENT_EMAIL`
- `MLABS_AGENT_PASSWORD`

## Notas de producto

- La web debe mostrar solo datos reales visibles del Drive. Nada de inventar canciones o carpetas.
- Si Google Drive no expone subcarpetas o archivos con el acceso actual, la UI debe mostrar estado vacío honesto.
- El objetivo final es que cada DJ trabaje su librería local y solo suba a la master lo que pase por una revisión estilo pull request musical.
