# MOBILE APP READY

## Ya preparado en esta rama

- layout revisado para movil
- soporte de safe areas tipo app
- manifest PWA
- service worker para app shell
- iconos base para instalacion
- metadatos `apple-mobile-web-app` y `theme-color`

## Resultado

La web ya queda lista para:

- instalarse como PWA en Android
- anadirse a pantalla de inicio en iPhone
- servir como base para empaquetado nativo posterior

## Siguiente paso para binario nativo

Cuando queramos llevarlo a App Store y Google Play, la ruta recomendable es:

1. mantener esta web como shell principal
2. envolverla con `Capacitor`
3. activar login persistente, storage y deep links
4. decidir si la lectura local del workspace vivira solo en desktop o en companion app

## Nota de producto

El `workspace` tipo Git musical tiene mucho mas sentido completo en desktop, mientras que:

- comunidad
- perfiles DJ
- recordpool
- revisiones ligeras

funcionan muy bien como experiencia movil y futura app.
