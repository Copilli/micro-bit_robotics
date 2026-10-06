# Robotics: Maqueen, GamePad DFRobot y Maqueen Mechanic

Extensión MakeCode/PXT con bloques en español bajo `copilli`. Robot, sensores externos, faros, GamePad y Mechanic se combinan con Radio, pantalla, A/B, sonido, logo, sensores integrados, pausas y ciclos **nativos**. Producción no administra Radio.

## Perfiles y preparación

- Destino micro:bit V2; referencias Maqueen Lite clásico/v4 y DFR0536 V2 de botones o V4 con joystick. No se declaran compatibles otras revisiones.
- Inicio explícito en **Preparación**: el primer `iniciarMaqueen()` detiene ruedas; `iniciarGamepad()` prepara entradas y un solo sondeo.
- Roles exclusivos por programa: el segundo se rechaza antes de tocar hardware. Repetir el mismo inicio es idempotente y no vuelve a detener un robot ya preparado. Mando y receptor se descargan a micro:bits distintos.
- Importar y configurar no actúa sobre hardware. Los perfiles están en RAM, sin persistencia ni realimentación de posición.
- Mechanic requiere [calibración del profesor](docs/mechanic-calibracion.md). Los ceros de las plantillas se rechazan deliberadamente. El filtro 10°–170° no garantiza un recorrido seguro.

## Bloques

Robot: avanzar, retroceder, girar izquierda/derecha y detener; potencia 0–100 es escala del controlador. Sensores: distancia (`-1` sin eco válido) y línea. Luces: faros delanteros. **RGB ambiental no está implementado**; sus APIs antiguas están ocultas/deprecadas, con diagnóstico explícito. Esto no significa que Lite carezca de RGB.

GamePad: cuatro botones de dirección y X/Y en V2 (mando escolar), o joystick y C/D/E/F/Z en V4. Vibración P12; solo V4 comparte esa salida con LED. Varios manejadores del mismo evento se conservan; cada uno tiene como máximo una ejecución activa y descarta repeticiones mientras está ocupado. Hasta 32 registros. Una fibra cooperativa no neutraliza un bucle que nunca cede ejecución.

Mechanic: abrir/cerrar pinza, **subir/bajar pinza mediante un eje independiente**, subir/bajar pala y horquillas, orientar ultrasónico Push. Configuración y diagnóstico están en Avanzado. S1 elevación/S2 apertura es referencia histórica de Plus original, sin garantía mecánica de Lite.

Consulta [API](docs/api.md), [compatibilidad](docs/compatibilidad.md), [fuentes](docs/fuentes.md), [pruebas físicas pendientes](docs/pruebas-fisicas.md) y [trazabilidad H01–H12](docs/revision-h01-h12.md).

## Ejemplos e importación web

Hay 29 proyectos independientes; [índice e importación](examples/README.md). Las parejas `controller`/`robot` son dos programas. Cada ejemplo con Radio nativa declara su dependencia.

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

`npm test` prueba las fuentes reales con dobles auxiliares y una prueba con compilador, simulador y fibras PXT reales. `validate:pxt` instala y compila raíz/pruebas y cada ejemplo, decompila los 24 ejemplos y rechaza bloques grises. Informes: `built/validation/`. `npm run test:pxt` compila la suite completa para micro:bit V2/CODAL (supera la flash de V1); `pxt run` ejecuta `test.ts` en simulador.

El editor web usa microbit 9.0.12/PXT 13.0.9 y se valida por separado. Compilar, convertir bloques o simular no demuestra funcionamiento físico. CI está creado, sin ejecución remota. Los avisos de herramientas de `npm audit` siguen pendientes de evaluación antes de publicación.

No se hicieron commits, push, PR, releases ni publicación. Antes de distribuir a alumnos: identificar y probar físicamente cada montaje bajo supervisión. Antes de publicar: revisar herramientas, CI remoto e importación mediante el enlace autorizado.

Para instalar sin descargar el navegador auxiliar de Puppeteer: en PowerShell establece `$env:PUPPETEER_SKIP_DOWNLOAD='true'` antes de `npm.cmd ci`; en bash usa `PUPPETEER_SKIP_DOWNLOAD=true npm ci`. Esa instalación sí se completó. El navegador auxiliar no se utiliza para compilar.

**Cierre solicitado sin más pruebas:** la última adaptación de nombre y mando escolar no tiene una validación final completa. Los resultados anteriores no se trasladan automáticamente a esta revisión; consulta la trazabilidad.
