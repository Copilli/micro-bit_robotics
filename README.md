# pxt-copilli-robotica

Extensión MakeCode/PXT para micro:bit con bloques en español bajo el namespace `copilli`. La categoría ofrece acciones de robot, sensores, luces, GamePad y Mechanic; Radio, pantalla, botones A/B, sonido, logo táctil, pausas y ciclos siguen siendo los bloques nativos de micro:bit.

## Instalación en MakeCode

El repositorio aún no está publicado en una URL pública autorizada. Por eso **todavía no hay enlace real que pegar en Extensiones** y no se debe asumir que aparece en búsqueda por nombre. Una vez publicada una versión y autorizado el repositorio, se podrá importar con un único enlace GitHub.

## Perfiles y preparación

- Firmware destino: micro:bit V2 (sin ensayo físico).
- Robot de referencia: Maqueen Lite clásico/v4; no se afirma compatibilidad con Lite v5, Plus o Plus V2.
- Mando de referencia: GamePad DFR0536 V4 con joystick. El pinout de esta revisión no se pudo contrastar con la guía oficial accesible y requiere confirmación física.
- Mechanic: Beetle, Loader, Forklift y Push con servo calibrado en S1/S2. El accesorio, el puerto y los ángulos se preparan por separado en cada programa del robot.

Antes de usar mecanismos, el profesor debe seguir [preparación y calibración](docs/mechanic-calibracion.md), registrar perfil, identificar cada puerto y medir extremos seguros sin carga. Las plantillas incluyen ceros rechazados a propósito: reemplazarlos únicamente por mediciones reales bajo supervisión. No hay persistencia al apagar ni confirmación de que el servo alcanzó el objetivo.

`iniciarMaqueen()` prepara solo el robot y detiene ruedas; `iniciarGamepad()` prepara solo el mando. La importación no mueve motores ni servos, inicia radio o toca salidas. Los programas de mando y robot se descargan a micro:bits distintos.

## Bloques principales

- Robot: `avanzar`, `retroceder`, `girar`, `detener`; potencia 0–100 es escala de controlador, no velocidad real.
- Sensores: `distanciaCm()` retorna `-1` sin eco válido; `sobreLinea(...)` identifica negro según polaridad pendiente de probar.
- Luces: `faros(...)`; el perfil Lite clásico/v4 no expone RGB inferior, así que los bloques RGB registran diagnóstico y no escriben pines.
- GamePad: dirección de joystick, consulta y eventos antirrebote para C/D/E/F/Z, vibración. A/B se conservan nativos.
- Mechanic: abrir/cerrar pinza, subir/bajar pala y horquillas, orientar sensor Push. Configuraciones de calibración viven en RAM del programa, no mueven el servo y requieren límites físicos medidos.
- Avanzado: ruedas proporcionales, centro/zona muerta, posición semántica, configuración de puerto y `diagnostico()`.

Lee [API y hardware](docs/api.md), [compatibilidad](docs/compatibilidad.md), [fuentes inspeccionadas](docs/fuentes.md) y [pruebas físicas pendientes](docs/pruebas-fisicas.md). No se incluye control Bluetooth, infrarrojo, HUSKYLENS, buzzer externo ni comandos de radio propios.

## Ejemplos

Cada proyecto está separado en [`examples/`](examples/README.md). Las parejas de radio tienen una carpeta `controller` y otra `robot`: son dos programas. Los ejemplos llaman explícitamente a `radio.setGroup`, usan `radio.sendString` / `radio.sendValue` y eventos de recepción nativos; sus grupos no autentican. La extensión local está indicada como dependencia relativa y debe probarse con PXT CLI.

## Compilar, probar y publicar

Node se usa únicamente para herramientas. Con Node.js y npm:

```sh
npm ci
npx pxt target microbit
npx pxt install
npm test
npm run build
```

Se fija el CLI PXT `0.5.1` en `package.json`/`package-lock.json`; `targetVersions.target: 8.0.22` registra compatibilidad. El paquete compilador del destino se instala aparte con `pxt target microbit`, así que no está bloqueado en este lockfile. Ejecuta `npx pxt install && npx pxt build` en una carpeta de ejemplo para probarla localmente. No se generaron `.hex`, proyectos compartidos ni enlaces de publicación en este repositorio. Para publicar una versión se necesita un repositorio remoto autorizado, versionado y aprobación del propietario; consulta la documentación oficial de [versionado PXT](https://makecode.com/extensions/versioning).