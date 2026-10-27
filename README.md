# Robotics: Maqueen, GamePad DFRobot y Maqueen Mechanic

Extensión MakeCode/PXT con bloques en español bajo `copilli`. Robot, sensores externos, faros, GamePad y Mechanic se combinan con Radio, pantalla, A/B, sonido, logo, sensores integrados, pausas y ciclos **nativos**. Producción no administra Radio.

## Perfiles y preparación

- Destino micro:bit V2; Maqueen Lite con dos sensores de línea, y DFR0536 V2 de botones o V4 con joystick. El controlador se adapta al robot de este proyecto; las otras versiones se consultan como referencia.
- Inicio único en **Preparación**: `iniciar Maqueen`, sin selector de versiones. Las diferencias del controlador pertenecen a la implementación interna, no al programa del alumno.
- Roles exclusivos por programa: el segundo se rechaza antes de tocar hardware. Repetir el mismo inicio es idempotente y no vuelve a detener un robot ya preparado. Mando y receptor se descargan a micro:bits distintos.
- Importar y configurar no actúa sobre hardware. Los perfiles están en RAM, sin persistencia ni realimentación de posición.
- Mechanic se elige en un único bloque con perfiles iniciales y [límites ajustables por modelo](docs/mechanic-calibracion.md). Los ejemplos ya no necesitan sustituir ceros de servo para emitir órdenes. Los límites físicos del montaje siguen siendo propios de cada robot.

## Bloques

Robot: avanzar, retroceder, girar izquierda/derecha y detener; potencia 0–100 es escala del controlador. Sensores: distancia (`-1` sin eco válido) y línea. Luces: faros delanteros. **RGB ambiental no está implementado**; sus APIs antiguas están ocultas/deprecadas, con diagnóstico explícito. Esto no significa que Lite carezca de RGB.

Bloques básicos: `fijar velocidad de movimiento a N %`, `mover adelante/atrás durante N segundos` y `mover adelante/atrás por N cm estimados`. El porcentaje configura potencia; los cm necesitan calibración. Ver [movimiento y calibración](docs/movimiento-lego.md). El ultrasónico reintenta hasta cinco veces; `-1` indica que no obtuvo un eco válido, incluso fuera de alcance. El valor 500 que devuelve la extensión original sin eco no representa una distancia medida; ver [revisión del código original](docs/fuentes.md#ultrasónico).

GamePad: cuatro botones de dirección y X/Y en V2 (mando escolar), o joystick y C/D/E/F/Z en V4. Vibración P12; solo V4 comparte esa salida con LED. Varios manejadores del mismo evento se conservan; cada uno tiene como máximo una ejecución activa y descarta repeticiones mientras está ocupado. Hasta 32 registros. Una fibra cooperativa no neutraliza un bucle que nunca cede ejecución.

Mechanic: `configurar Mechanic [Beetle (pinza) / Loader (pala) / Forklift (horquillas) / Push (sensor giratorio) / elevación de pinza] en [S1/S2]`, `poner Mechanic [modelo] en N %` y `poner Mechanic [modelo] a N grados de servo`. Beetle y pinza son una sola opción. En Avanzado puedes cambiar los límites, establecer cero y mover por grados relativos. Las APIs anteriores siguen compilando con sus IDs, ocultas del menú.

Para una pinza que no responde en S1, importa el ejemplo local `servo-s1-test` para enviar 80° con A y 100° con B directamente, sin perfil de accesorio. Luego usa `mechanic-beetle` y ajusta apertura/cierre. [Pasos de comprobación](docs/mechanic-calibracion.md#comprobar-una-pinza-conectada-en-s1). Los cambios locales deben importarse como `.mkcd`; no actualizan la extensión publicada de MakeCode.

Los sensores del robot son distancia y línea izquierda/derecha. No se añaden opciones de sensores ausentes. Los faros usan P8/P12 y el control de motores/servos mantiene el protocolo de la placa de dos sensores.

Consulta [API](docs/api.md), [compatibilidad](docs/compatibilidad.md), [fuentes](docs/fuentes.md), [pruebas físicas pendientes](docs/pruebas-fisicas.md) y [trazabilidad H01–H12](docs/revision-h01-h12.md).

## Ejemplos e importación web

Hay 32 proyectos independientes; [índice e importación](examples/README.md). Empieza con `maqueen-basic` para movimiento o `mechanic-models` para elegir un accesorio en S1. Todos usan el mismo bloque `iniciar Maqueen`. Las parejas `controller`/`robot` son dos programas.

Todavía no hay URL pública autorizada que pegar en Extensiones. Se conserva una sola extensión raíz; los `.mkcd` exportados incluyen una copia de sus fuentes para permitir importación sin dependencia `file:` ni publicación previa. Tras ejecutar `npm run export:web`, en [MakeCode micro:bit](https://makecode.microbit.org) selecciona **Importar → Abrir archivos desde tu equipo**, carga el archivo de `output/makecode/` y confirma. Calibra Mechanic antes de descargar a una placa. Las carpetas CLI con dependencias `file:` no se importan directamente en el editor web.

## Desarrollo reproducible

Comprobado: Node 24.16.0, npm 11.13.0; wrapper `pxt` 0.5.1; **pxt-microbit 8.0.22**, **pxt-core 12.0.19**; TypeScript auxiliar 5.9.3. Target y transitivas están fijados en `package-lock.json`; `targetVersions` solo aporta metadatos.

```sh
npm ci
npm run setup:pxt
npx pxt install
npm test
npm run validate:pxt
npm run test:sim
npm run export:web
```

En PowerShell usa `npm.cmd`/`npx.cmd` si se bloquean `.ps1`. Este equipo necesitó `NODE_OPTIONS=--use-system-ca` para usar certificados del sistema sin desactivar TLS. No sustituyas el target fijado con `pxt target microbit`.

`npm test` prueba las fuentes reales con dobles auxiliares y una prueba con compilador, simulador y fibras PXT reales. `validate:pxt` instala y compila raíz/pruebas y cada ejemplo, decompila los 32 ejemplos y rechaza bloques grises. Informes: `built/validation/`. `npm run test:pxt` compila la suite completa para micro:bit V2/CODAL (supera la flash de V1); `pxt run` ejecuta `test.ts` en simulador.

El editor web usa microbit 9.0.12/PXT 13.0.9 y se valida por separado. Compilar, convertir bloques o simular no demuestra funcionamiento físico. CI está creado, sin ejecución remota. Los avisos de herramientas de `npm audit` siguen pendientes de evaluación antes de publicación.

No se hicieron commits, push, PR, releases ni publicación. Antes de distribuir a alumnos: identificar y probar físicamente cada montaje bajo supervisión. Antes de publicar: revisar herramientas, CI remoto e importación mediante el enlace autorizado.

Para instalar sin descargar el navegador auxiliar de Puppeteer: en PowerShell establece `$env:PUPPETEER_SKIP_DOWNLOAD='true'` antes de `npm.cmd ci`; en bash usa `PUPPETEER_SKIP_DOWNLOAD=true npm ci`. Esa instalación sí se completó. El navegador auxiliar no se utiliza para compilar.

La revisión local de Maqueen y Mechanic se verifica con pruebas de paquetes I²C y compilación/decompilación PXT. El funcionamiento físico se confirma por separado en el robot.
