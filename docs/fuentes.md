# Fuentes y estado de verificación

Consultadas de nuevo el 5 de octubre de 2026. Lectura de documentación, inspección de código, compilación y ensayo físico son evidencias distintas. Los bloqueos de red de la versión anterior no describen esta sesión: las fuentes siguientes pudieron abrirse.

| Fuente | Evidencia inspeccionada | Uso y límites |
|---|---|---|
| [DFRobot pxt-maqueen, commit a1fbb5e88ef4d53b814138d5a5ed73ab08465deb](https://raw.githubusercontent.com/DFRobot/pxt-maqueen/a1fbb5e88ef4d53b814138d5a5ed73ab08465deb/maqueen.ts) | `readUlt` líneas 153–175, motorRun/Stop 188–240, línea 250–257, LED 268–275, servoRun 286–295 | Registros I²C 0x10, motores 0x00/0x02, servos 0x14/0x15, faros P8/P12, línea P13/P14. Fuente fija inspeccionada, sin importar tareas globales del paquete. Atribución MIT en `THIRD_PARTY_NOTICES.md`; ensayo físico pendiente. |
| [Core microbit v8.0.22](https://raw.githubusercontent.com/microsoft/pxt-microbit/v8.0.22/libs/core/pxt.json) / [Radio v8.0.22](https://raw.githubusercontent.com/microsoft/pxt-microbit/v8.0.22/libs/radio/pxt.json) | Manifiestos y paquetes instalados de la versión fijada | Radio es paquete separado; cada ejemplo debe declararlo. Target 8.0.22/PXT 12.0.19 realmente compilado. |
| [Comparación Maqueen V4/V5](https://wiki.dfrobot.com/mbt0046/docs/21333) | Tabla y separación de luces ambientales/faros | WS2812 ambientales descritos en V4 y V5; no se afirma que Lite carezca de RGB. Copilli elige dejar RGB fuera del alcance. |
| [RGB ambiental Lite](https://wiki.dfrobot.com/rob0148-en/docs/20848) | Página de ejemplo, requisitos y NeoPixel | Confirma documentación de iluminación ambiental integrada distinta de faros. No se extrajo ni incorporó el programa enlazado. |
| [DFR0536 V4/V2](https://wiki.dfrobot.com/dfr0536/) | Especificaciones y pinout V4/V2 | V4 confirma X=P1/Y=P2/Z=P8, C/D/E/F=P13/P14/P15/P16 y vibrador/LED=P12, teclas activas bajas. No confirma identidad de las placas escolares ni comportamiento físico. |
| [Guía Mechanic](https://learn.dfrobot.com/makelog-308436.html) | Semántica Beetle/Loader/Forklift/Push, recomendación general 10°–170° | Fuente documental accesible; sin copiar imágenes/textos ni extraer programas MakeCode. Los límites no reemplazan calibración segura. Elevador de pinza histórico Plus original no prueba montaje Lite. |
| PXT instalado (`pxt-core` 12.0.19 y `pxt-microbit` 8.0.22) | Compilador/decompilador, `pxtsim.js`, shim `basic.forever`, empaquetador `MainPackage.compressToFileAsync` y descompresor | Prueba de fibras con pausas reales y exportación `.mkcd` usando formato oficial. Entradas físicas sustituidas; no es prueba de placa. |
| Editor [MakeCode micro:bit](https://makecode.microbit.org) | Importación real y conversiones mediante UI con Playwright, versiones declaradas por `pxt.appTarget.versions` | microbit 9.0.12/PXT 13.0.9. Fuentes convertidas, capturas y logs en `output/playwright/`. No se publicó ni compartió ningún proyecto. |

## Ultrasónico

Se preserva el protocolo del `readUlt` fijado: P1 alto, pausa **1 ms**, bajo, consulta nivel de P2; rama de polaridad con pausa **20 ms**, P1 bajo y `pulseIn` alto/bajo según entrada. Timeout **500×58=29000 µs** y conversión redondeada pulso/59. Las pausas de milisegundos son deliberadas conforme a esa fuente, no un pulso HC-SR04 supuesto por intuición. Copilli no replica los reintentos ni el reemplazo de error por 500 de `Ultrasonic`; usa -1 para que el ejemplo de obstáculos detenga ruedas. Las pruebas observan llamadas reales de bajo nivel, sin devolver una distancia prefabricada.

## Referencias históricas no verificadas de nuevo

Se reabrió [pxt-gamePad, commit b509667f2d9acf19327c1c50e89b2c764d0dbb78](https://github.com/DFRobot/pxt-gamePad/tree/b509667f2d9acf19327c1c50e89b2c764d0dbb78): `main.ts` enum GamerBitPin y `gamerpad.cpp` corroboran direcciones digitales y entradas activas bajas con pull-up. Se toma el mapa de pines para V2, sin copiar ni incorporar ese paquete LGPL; no equivale a V4 ni prueba la placa escolar. Los proyectos MakeCode y tutoriales adicionales del encargo anterior no se extrajeron en esta actualización. El adjunto de H01–H12 sí está disponible; no se recibió aquí el texto completo del encargo original ni un archivo que documente físicamente el elevador escolar. No se atribuye revisión del código de un proyecto por abrir únicamente su página.
