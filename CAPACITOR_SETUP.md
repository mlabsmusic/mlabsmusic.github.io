# CAPACITOR SETUP

Base nativa preparada para llevar MLABS Recordpool a iOS y Android.

## Lo que ya queda hecho

- dependencias de Capacitor instaladas
- configuracion base en `capacitor.config.ts`
- scripts para `sync`, `copy` y apertura de proyectos nativos
- PWA previa ya montada para compartir shell visual y assets

## Comandos

```bash
npm run cap:sync
npm run cap:open:ios
npm run cap:open:android
```

## App id actual

```txt
com.mlabsmusic.recordpool
```

## Enfoque recomendado

- `Home`, `DJs`, `Recordpool` y parte social funcionan perfecto como experiencia app.
- `Workspace` tipo Git musical sigue teniendo mucho mas sentido completo en desktop.
- Si mas adelante queremos companion app seria buena idea dejar el `Workspace` en modo lectura ligera dentro de movil y mantener la gestion pesada en ordenador.

## Siguiente capa

1. ajustar icono y splash definitivos de marca
2. adaptar navegacion tipo tab bar para movil nativo
3. controlar tecla back en Android y estado de sesion persistente
4. revisar permisos y flujos si algun dia queremos subida local o descargas gestionadas nativamente
