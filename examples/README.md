# Ejemplos PXT

Cada carpeta con `pxt.json` es un proyecto independiente: ábrela desde MakeCode (Importar > proyecto local) o compílala desde esa carpeta con `npx pxt install` y `npx pxt build`. Los proyectos con Copilli declaran `copilli-robotica: "file:../.."` para resolver esta extensión desde la copia local; PXT usa dependencias `file:` para paquetes locales. La compilación de estos proyectos no pudo ejecutarse aquí porque el destino intenta resolver `www.makecode.com` y la red del entorno no resuelve ese host.

Los directorios `controller` y `robot` son firmwares distintos para dos micro:bits: cada uno se abre/descarga por separado aunque ambos usen la misma extensión local. En `radio-mechanic`, C abre y D cierra la pinza; para pala, sustituye esas acciones por `subirPala()`/`bajarPala()` y sus mensajes; para montacargas usa `subirHorquillas()`/`bajarHorquillas()`. Los ejemplos con Mechanic son plantillas seguras: sus ángulos cero se rechazan; un profesor debe escribir ángulos medidos antes de cualquier movimiento.

Los canales de Radio elegidos en los ejemplos solo separan equipos; no autentican mensajes. Los intervalos de 100 ms y timeout de 500 ms son parámetros iniciales del ejemplo, no valores probados en hardware.
