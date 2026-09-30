# Compatibilidad declarada

## Perfil implementado

| Componente | Perfil de referencia | Estado |
|---|---|---|
| Placa controladora | micro:bit V2 | Requisito del curso; compilación para el destino micro:bit, prueba física pendiente |
| Robot | Maqueen Lite clásico/v4 | Solo mapa de control base (motores, servos S1/S2, P1/P2 ultrasónico, P13/P14 línea, P8/P12 faros) del controlador DFRobot inspeccionado; revisión física de la escuela desconocida |
| Mando | GamePad DFR0536 V4 con joystick | Pinout implementado según perfil declarado en el issue: X=P1, Y=P2, Z=P8, C/D/E/F=P13/P14/P15/P16, vibrador/LED compartido P12. No verificado con la guía del fabricante ni con una placa real |
| Mechanic | Beetle, Loader, Forklift y Push giratorio | Control genérico de servo por S1/S2; el accesorio y los ángulos deben configurarse de forma local para cada montaje |

No se afirma compatibilidad con Maqueen Lite v5, Plus, Plus V2, GamePad V2 antiguo ni revisiones no identificadas. En particular, no se mezclan los registros RGB/funciones que aparecen en el namespace V5 del controlador oficial.

## Conflicto de fuentes y riesgo pendiente

La documentación web de DFR0536 no fue accesible por resolución DNS en esta sesión. Además, el código histórico de [`DFRobot/pxt-gamePad` en `b509667f2d9acf19327c1c50e89b2c764d0dbb78`](https://github.com/DFRobot/pxt-gamePad/tree/b509667f2d9acf19327c1c50e89b2c764d0dbb78) define un mando `gamer:bit` distinto: `keyState()` trata P1/P2 como botones y reserva P8/P13/P14/P15 para direcciones; P16 controla un LED. Ese código no demuestra el pinout del perfil V4 con joystick pedido, no se integra y no debe usarse para identificar las placas del colegio. En el perfil implementado P1/P2 son entradas analógicas y P16 es botón F: confirme físicamente antes de conectar/alimentar.

La implementación no tiene detección automática de revisión ni configuración universal. Si la placa real no coincide exactamente, no use el perfil; se requiere revisar documentación de esa variante y adaptar el controlador aislado en `hardware.ts`.

## Compatibilidad de bloques / compilación

El manifiesto declara destino `microbit` y `targetVersions.target` `8.0.22`, tomado de la metadata de la versión de controlador inspeccionada. Ese campo registra compatibilidad, no fija por sí solo la versión del paquete compilador. El lockfile fija el wrapper CLI `pxt` 0.5.1; PXT instala el paquete de destino por separado. Que un proyecto compile no aprueba la conexión eléctrica ni el comportamiento del robot.

Durante el intento de compilación se instaló temporalmente el paquete de destino; `npm audit` reportó hallazgos en sus dependencias de herramientas (incluidos hallazgos críticos). Ese árbol no se conserva en el lockfile: no forma parte del firmware ni de la extensión, y solo queda fijado el wrapper PXT sin hallazgos en `npm audit`. El profesor/desarrollador debe revisar la auditoría actual del target antes de instalarlo.

Versiones observadas durante el trabajo: Node.js `24.21.0`, npm `11.19.0`, wrapper PXT `0.5.1`. La compilación PXT y conversión de los ejemplos no se pudieron comprobar porque el sandbox no resuelve `www.makecode.com`. Las pruebas físicas permanecen pendientes.
