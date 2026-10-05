# Ejemplos PXT y uso en MakeCode web

24 proyectos independientes. Cada `pxt.json`/`main.ts` es un programa; controller y robot pertenecen a micro:bits separados. Carpetas con dependencia `file:` sirven para el desarrollo CLI local, no para importarlas directamente en el navegador.

## Importación sin publicación

1. En la raíz, instala herramientas fijadas y ejecuta `npm run setup:pxt`, `npm run validate:pxt` y `npm run export:web` (véase README).
2. Se generan 24 archivos `.mkcd` en `output/makecode/`. Cada uno contiene su propio programa, bloques y una copia local de las mismas fuentes de Copilli; no depende de `file:` ni de un GitHub no publicado. Es una instantánea: vuelve a exportar si cambia la extensión.
3. Abre [MakeCode micro:bit](https://makecode.microbit.org). Selecciona **Importar → Abrir archivos desde tu equipo**, elige el `.mkcd` y confirma. Por ejemplo `radio-loader-controller.mkcd` y `radio-loader-robot.mkcd` son dos proyectos, no un programa combinado.
4. Revisa puerto/límites con el profesor y sustituye los ceros solo por valores medidos. Importar no reemplaza esta calibración. Descarga al micro:bit correspondiente después de aprobar físicamente el montaje.

Antes del cambio final de nombre/perfil escolar, el editor web importó/convirtió 23 proyectos; la revisión final de 24 proyectos queda pendiente por petición del usuario. evidencia de revisión en `output/playwright/`, trazabilidad en [H01–H12](../docs/revision-h01-h12.md). No hay enlace público de extensión autorizado todavía. Exportar estas instantáneas no publica el repositorio ni crea otra extensión mantenida.

## Índice

| Proyecto / pareja | Contenido | Radio |
|---|---|---|
| `native-v2` | Referencia solo nativa micro:bit, sin Copilli | — |
| `copilli-native-v2` | Copilli robot + A/B/logo/sonido/pantalla/temperatura/luz/gestos nativos | — |
| `gamepad-only` | Mando escolar V2, cuatro direcciones y X/Y | — |
| `gamepad-joystick` | Referencia V4 con joystick y C/D/E/F/Z | — |
| `maqueen-drive` | Conducción/faros con A/B | — |
| `maqueen-obstacle` | Lectura inválida/obstáculo detiene ruedas | — |
| `mechanic-beetle` | Abrir/cerrar pinza | — |
| `mechanic-lifting-gripper` | Apertura S2/elevación S1 independientes; montaje pendiente | — |
| `mechanic-loader` | Subir/bajar pala | — |
| `mechanic-forklift` | Subir/bajar horquillas | — |
| `mechanic-push` | Orientar ultrasónico | — |
| `push-football` | Plantilla Push de conducción | — |
| `radio-drive/controller`, `robot` | Conducción por dirección | 21 |
| `radio-mechanic/controller`, `robot` | Conducción + abrir/cerrar pinza simple | 22 |
| `radio-proportional/controller`, `robot` | Ejes x/y con caducidad independiente | 23 |
| `radio-loader/controller`, `robot` | Conducción + pala X/Y | 24 |
| `radio-forklift/controller`, `robot` | Conducción + horquillas X/Y | 25 |
| `radio-lifting-gripper/controller`, `robot` | Conducción + X/Y apertura, A/B nativos elevación | 26 |

Todos los proyectos con Radio declaran `radio: "*"`; la extensión raíz solo depende de core. Grupos separan equipos, no autentican. Emisión nominal cada 100 ms y ventana de ejemplo 500 ms, sin garantía física/industrial. Accesorios/desconocidos no prolongan conducción. En proporcional ambos ejes deben haberse recibido recientemente; caducar uno o recibir `parar` descarta la pareja; recuperar exige dos muestras nuevas. Receptor comprueba vencimiento antes de procesar mensajes, además del vigilante.

Plantillas Mechanic mantienen ángulos cero rechazados y sin salida servo. El orden de calibración puede conservar un perfil válido anterior al rechazar una nueva solicitud: comprobar `resultadoConfiguracionMechanic` y `perfilMechanic`. El timeout solo detiene ruedas, nunca abre pinza ni libera carga.

Los controllers actuales usan **GamePad de botones V2**, el mando indicado por la escuela. `gamepad-joystick` conserva V4. En proporcional, V2 transmite direcciones discretas -100/0/100 mediante `mandoX/Y`; para potencia analógica se necesita V4 y su inicio explícito. La implementación no detecta automáticamente revisiones. X/Y controlan accesorios; A/B nativos elevan/bajan pinza en el controller de dos ejes.

En PowerShell, la instalación comprobada omite la descarga del navegador auxiliar de Puppeteer (no se usa para compilar): `$env:PUPPETEER_SKIP_DOWNLOAD='true'; npm.cmd ci`. La importación web se comprobó con Edge mediante Playwright por separado.
