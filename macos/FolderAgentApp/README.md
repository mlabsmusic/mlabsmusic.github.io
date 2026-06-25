# MLABS Folder Agent for macOS

App nativa para macOS que vigila una carpeta local de música y lanza el agente de sync hacia MLABS Recordpool.

## Qué hace

- elegir carpeta musical desde Finder
- guardar email, contraseña e intervalo de lectura
- iniciar y detener el watch local
- ver actividad del agente en tiempo real
- mostrar una preparación rápida antes de arrancar: carpeta, cuenta y destino cloud

## Flujo recomendado de demo

1. Abre la app generada en `dist/MLABSFolderAgent.app`.
2. En ajustes, introduce el email y contraseña del DJ de prueba.
3. Confirma que la URL y publishable key de Supabase apuntan al proyecto de MLABS.
4. Elige una carpeta local con archivos de audio.
5. Pulsa `Iniciar` y espera a que el log confirme el sync.
6. Abre `/workspace` con la misma cuenta y revisa snapshots/change sets.
7. Marca cambios para master y aprueba o rechaza la PR desde `/admin`.

## Ejecutar desde Codex

Desde esta carpeta:

```bash
./script/build_and_run.sh
```

La app compilada se deja en:

```bash
../../dist/MLABSFolderAgent.app
```

Para compilar sin abrir la app:

```bash
./script/build_and_run.sh --package
```

Para preparar la descarga web para Macs con Apple Silicon:

```bash
CODESIGN_IDENTITY="Developer ID Application: Tu Nombre (TEAMID)" ./script/build_and_run.sh --package
```

Si no se define `CODESIGN_IDENTITY`, el script usa firma ad-hoc (`-`) para builds locales. Para una descarga pública que macOS abra sin advertencias hace falta firmar con `Developer ID Application` y notarizar el zip/app con Apple. Un certificado `Apple Development` o una firma ad-hoc corrigen la integridad del bundle, pero Gatekeeper seguirá tratándolo como build de piloto no notarizada.

## Verificación rápida por CLI

Para una lectura puntual:

```bash
npm run agent:scan -- "/ruta/a/libreria" --email "dj@example.com" --password "password"
```

Para dejar el watch activo:

```bash
npm run agent:watch -- "/ruta/a/libreria" --email "dj@example.com" --password "password"
```

El agente guarda una cache local `.mlabs-git-music-cache.json` dentro de la carpeta vigilada para comparar cambios entre lecturas.
