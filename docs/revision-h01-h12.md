# Cierre local de H01–H12

El usuario autorizó implementar la ampliación y posteriormente pidió cambiar el componente a Robotics, admitir el GamePad escolar de cuatro botones y finalizar sin ejecutar más pruebas. Se detuvieron las validaciones en curso. No se realizaron commits, push, PR, releases ni publicación.

## Línea base y evidencia

Inicio: commit `0b47cf6764e1b5135de7c00fad7e403caf4ec312`, sin cambios locales. Seis archivos de producción, 15 proyectos, 35 IDs. Reproducción auxiliar del código original mediante `scripts/reproduce-baseline.cjs`: H01 conservó ruedas 80/80 con un eje antiguo; H02 D se despachó 1000 ms después de C; H06 centro=100/raw=0/zona=30 produjo 0. Evidencia en `built/validation/baseline.json`. Son pruebas auxiliares con entradas controladas, no ensayo físico.

Herramientas reales: Node 24.16.0/npm 11.13.0; wrapper pxt 0.5.1; target pxt-microbit 8.0.22/PXT core 12.0.19; TypeScript auxiliar 5.9.3. `npm ci` sin omitir descarga Puppeteer falló por caché de navegador incompleta; con `PUPPETEER_SKIP_DOWNLOAD=true` se completó y `setup:pxt` confirmó versiones. TLS requirió certificados del sistema (`NODE_OPTIONS=--use-system-ca`), sin desactivarlo.

Antes del último cambio de nombre/perfil escolar: raíz y 23 ejemplos compilaron, decompilaron sin bloques grises, se exportaron/importaron en MakeCode web y completaron bloques→JS→bloques→JS; se recompiló la salida y se compararon argumentos de APIs, puertos, grupos y calibraciones. Editor web microbit 9.0.12/PXT 13.0.9, distinto del target local. `pxt run` ejecutó las aserciones de `test.ts`. Evidencias locales en `built/validation/` y `output/playwright/`.

Tras añadir el perfil escolar V2: `npm test` obtuvo **34 casos aprobados**, incluyendo entradas digitales de cuatro direcciones/X/Y y ausencia de acceso analógico/P16; 24 proyectos `.mkcd` fueron exportados y decodificados. Los 24 builds CLI pasaron en una ejecución, pero la fase auxiliar de decompilación falló por una referencia del script al alias antiguo de la dependencia. Se corrigió a `robotics`. La repetición final se detuvo por petición del usuario: no se declara validada esa fase ni la importación web de la revisión final. Los informes en disco pueden incluir ejecuciones interrumpidas; consultar el estado de cada registro, no solo la existencia del archivo.

## Hallazgos, cambios y cierre

Se conserva la clasificación del informe: cuatro altos, siete medios, uno bajo; sin defecto crítico demostrado. «Software comprobado previo» no aprueba hardware ni equivale a validación final de todos los cambios.

| ID / severidad | Estado y archivos modificados | Prueba ejecutada / resultado real | Pendiente concreto |
|---|---|---|---|
| H01 alto | Corregido: `examples/radio-proportional/robot/main.ts`, líneas 13–59; validez/tiempos por eje, descarte y verificación antes de recibir. | Receptor real con reloj/entradas: un eje, ambos recientes, caducidad simétrica, recuperación, 0/0, mensajes inválidos y parada; pasan. Salida convertida web también probada. | Pérdida parcial de Radio y tiempo efectivo en placas. |
| H02 alto | Corregido: `gamepad.ts`, `pollButtons`, `dispatchButton`, `startButtonAction`; muestreo separado y fibras, una activa por registro, sin cola. | Dobles auxiliares y compilador/simulador/fibras PXT reales: D y liberación durante pausa C, sostenido, reentrada, dos manejadores, inicio repetido; pasan. | Ensayo físico de ambos mandos; bucle sin cesión sigue pudiendo bloquear runtime. |
| H03 alto | Corregido: manifiestos de seis parejas Radio; producción raíz solo core; dependencia local renombrada a `robotics`. | Declaraciones/paths comprobados y builds independientes; pasan. | Revalidación completa del empaquetado final renombrado, detenida. |
| H04 alto | Entorno fijado y scripts/lockfile/exportación añadidos; `scripts/validate-pxt.cjs`, `web-roundtrip.cjs`, `export-web.cjs`. | Revisión anterior: 23 builds y conversiones web completas aprobadas. Revisión V2: 24 builds CLI pasan; decompilador auxiliar falló por alias, corregido sin repetición completa. | **Validación final pendiente por solicitud del usuario**, especialmente 24 proyectos renombrados y V2 en web. |
| H05 medio | Decisión B: `robot.ts:152`, API RGB histórica oculta/deprecada, diagnóstico de no implementado; docs corregidas. | Faros escriben P8/P12; RGB no escribe y avisa; APIs antiguas compilan/conservan IDs. | RGB real fuera del alcance, sin afirmar ausencia física. |
| H06 medio | `copilli.ts:122` y calibración `gamepad.ts`: zona muerta sobre cada semieje, rechazo atómico de centro inválido/NaN. | Centros 100/512/923, extremos, inversión, umbral y monotonía; pasan. | Calibración del joystick físico V4; V2 no tiene ejes analógicos. |
| H07 medio | `hardware.ts:59`: protocolo `readUlt` de commit DFRobot fijo, ambas polaridades, ms/µs diferenciados, timeout→-1. | Secuencia de llamadas real con dobles, ambas polaridades, distancia, timeout y obstáculo inválido; pasan. | Sensor físico identificado, alimentación y eco repetido real. |
| H08 medio | `diagnostics.ts`, `mechanic.ts:25`, consultas de perfil/resultado/objetivo; avisos separados. | Configuración válida/rechazo/conservación/nuevo éxito, conflicto/puerto inválido, eje independiente y consultas sin hardware; pasan. | Profesor debe comprobar perfil vigente tras rechazo; no hay posición real medida. |
| H09 medio | `tests/`, scripts y `.github/workflows/validate.yml`; I²C después de construir buffer, sensores/eventos/vibración/Radio. | 34 casos pasan antes del último cierre; runtime PXT real para concurrencia, demás dobles auxiliares identificados. | CI remoto **creado, no ejecutado**; revisión final no repetida y hardware pendiente. |
| H10 medio | `diagnostics.ts:30` y ambos inicios: exclusividad robot/mando, segundo rechazado antes de hardware. También cambio V2↔V4 rechazado. | Ambos órdenes de inicio, idempotencia, ninguna escritura posterior del rol rechazado; pasan. | Identificación física, sin autodetección. |
| H11 medio | Ejemplo combinado nativo, parejas completas Loader/Forklift/pinza elevadora, índice y `.mkcd`. Ahora seis controllers escolares V2; `gamepad-joystick` conserva V4. | Revisión previa: 23 compilaciones/importaciones/conversiones. V2: 24 exports decodificados y builds CLI. | Última conversión web pendiente, calibración real de plantillas y enlace público autorizado. |
| H12 bajo | `copilli.ts`, `robot.ts:168`, `gamepad.ts`: giro izquierda/derecha, inicio visible, varios manejadores conservados. | Giro antiguo Ambos conserva parada; IDs RGB/giro decompilan; multiplicidad/reentrada probadas. | Revisión visual final de Robotics/V2 pendiente; pruebas de uso infantil físico. |

## Ajuste escolar y Mechanic

Componente visible **Robotics**, paquete `robotics`/`pxt-robotics`; descripción Maqueen Lite, mandos DFRobot y Maqueen Mechanic. Namespace `copilli`, firmas, enums e IDs históricos se conservan por compatibilidad. No había una publicación anterior que migrar.

`iniciarGamepadBotones()` selecciona DFR0536 V2 de cuatro direcciones. Mapa contrastado con controlador histórico fijo: arriba P8, abajo P13, izquierda P14, derecha P15, X P1/Y P2, vibrador P12; P16 LED independiente queda sin acceso. No se copió el paquete LGPL. El parecido del mando escolar no confirma su revisión exacta: sigue pendiente identificarlo físicamente. `iniciarGamepad()` conserva V4 joystick; no se cambia silenciosamente. `mandoHacia`, `mandoX/Y` sirven para ambos; V2 es discreto -100/0/100, opuestos cancelados. Eventos/consulta estable disponibles para direcciones y X/Y; botones de otro perfil se rechazan o ignoran con aviso. A/B permanecen nativos.

Pinza: `configurarPinza`/abrir/cerrar y nuevos `configurarElevacionPinza`/subir/bajar tienen perfiles y objetivos independientes. Conflicto de puerto rechazado, configuración sin movimiento, extremos medidos. Referencia S1 elevación/S2 apertura en Plus original no garantiza Lite. Dos puertos disponibles, no cinco actuadores simultáneos. Acciones no confirman posición ni fuerza; detener solo afecta ruedas.

## Limitaciones restantes

Sin conexión de hardware ni prueba física. Sin publicación/importación mediante enlace GitHub real, CI remoto ni aprobación de compatibilidad adicional. Auditoría actual: 71 avisos en herramientas (5 bajos/35 moderados/28 altos/3 críticos), no atribuidos al firmware y sin actualización forzada. Antes de publicar hay que resolver/evaluar esos avisos y validar de nuevo el entorno elegido. No se redactaron las 30 sesiones ni manual final. La última instrucción del usuario cierra este trabajo local sin más pruebas, dejando expresamente pendientes las verificaciones finales.
