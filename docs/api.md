# API de Copilli

Los nombres, grupos, textos infantiles y simplificaciones de este paquete son diseño propio de Copilli; no son bloques oficiales de DFRobot. El controlador de referencia inspeccionado es [`pxt-maqueen` 1.7.17, commit `a1fbb5e88ef4d53b814138d5a5ed73ab08465deb`](https://github.com/DFRobot/pxt-maqueen/tree/a1fbb5e88ef4d53b814138d5a5ed73ab08465deb). La tabla de procedencia y las limitaciones están en [fuentes](fuentes.md) y [compatibilidad](compatibilidad.md).

| Bloque / API `copilli` | Acción interna | Hardware / perfil | Fuente del control |
|---|---|---|---|
| `iniciarMaqueen()` | Marca listo una sola vez y ordena velocidad cero a los dos motores | Maqueen Lite clásico/v4; controlador I²C `0x10` | `pxt-maqueen/maqueen.ts`: `motorStop`, registros `0x00`/`0x02` |
| `avanzar`, `retroceder`, `girar`, `detener`, `moverRuedas` | Limita potencia y transforma signo a dirección y escala 0–255; dos órdenes independientes | Motores de Maqueen Lite clásico/v4 | `maqueen.ts`: `motorRun(index, direction, speed)` |
| `distanciaCm()` | Pulso de eco de P2 con disparo P1; devuelve `-1` si no hay eco válido | Ultrasónico del perfil de robot | `maqueen.ts`: `readUlt` usa P1/P2 y timeout; su `Ultrasonic()` convierte lecturas fallidas en `500`, por eso aquí se usa `-1` |
| `sobreLinea(sensor)` | Lee P13/P14; nivel bajo se interpreta como línea negra | Sensores de línea del perfil | `maqueen.ts`: `readPatrol`; la polaridad de negro debe comprobarse físicamente |
| `faros(lado, encendidos)` | Escritura digital de P8/P12 | Faros Maqueen Lite clásico/v4 | `maqueen.ts`: `writeLED` y enum `LED` |
| `lucesInferiores(color)`, `apagarLucesInferiores()` | No escriben pines; guardan diagnóstico de perfil no compatible | No disponible en Maqueen Lite clásico/v4 | RGB en el namespace Maqueen V5 de `maqueen.ts` usa un protocolo distinto; no se copia ni se mezcla |
| `iniciarGamepad()` | Prepara entradas de botones y arranca un solo sondeo cooperativo de botones | Perfil solicitado DFR0536 V4; el pinout de esta variante requiere prueba física | Pinout solicitado por el issue; documentación DFR0536 inaccesible en esta sesión |
| `joystickHacia`, `joystickX`, `joystickY` | Lee P1/P2, zona muerta configurable como porcentaje y centro calibrado manualmente | GamePad DFR0536 V4 con joystick | Perfil solicitado; no usar como prueba de otra revisión |
| `botonPresionado`, `alPulsarBoton`, `alSoltarBoton` | Un sondeo compartido, tres muestras estables (≈30 ms) y despacho por transición | Entradas adicionales C–F y Z del perfil solicitado | Perfil solicitado; polaridad activa baja basada en el perfil de referencia, pendiente prueba |
| `vibrar(ms)` | Salida temporal en P12, limitado a 5000 ms | GamePad DFR0536 V4; salida compartida con LED | Perfil solicitado; no existe control independiente del LED |
| `configurarPinza`, `configurarPala`, `configurarHorquillas` | Guarda puerto y dos posiciones semánticas sin mover | Servo Mechanic Beetle, Loader o Forklift conectado al puerto S1/S2 de Maqueen | Registro de servo del controlador: `servoRun`, registros `0x14`/`0x15`; rangos físicos requieren calibración |
| `configurarSensorGiratorio`, `orientarSensor` | Guarda y ordena posiciones izquierda/frente/derecha | Push: servo orienta el ultrasónico; la placa empuja al conducir | Registro de servo de `pxt-maqueen`; comportamiento del montaje no se ha verificado con fuente física accesible |
| Acciones Beetle/Loader/Forklift | Interpola posición semántica o envía extremo calibrado y retorna de inmediato | Mecanismo configurado por el profesor | No hay sensor de confirmación; `detener()` solo detiene ruedas |
| `posicionMechanic`, `quitarConfiguracionMechanic`, `diagnostico` | Posición avanzada, liberación lógica de puerto y último aviso no bloqueante | Perfil Mechanic | Decisión de API propia |

## Límites importantes

- El valor de potencia 0–100 es una escala de software convertida linealmente a 0–255 del controlador; no es velocidad física.
- En el joystick, X positivo es derecha y Y positivo es arriba. La dirección con mayor magnitud gana; un empate se resuelve por el eje X. El centro está dentro de la zona muerta.
- Las funciones no preparan otro dispositivo silenciosamente. Antes de usar una lectura/acción hay que llamar explícitamente a `iniciarMaqueen()` o `iniciarGamepad()`, en el micro:bit correspondiente.
- La importación sola no escribe en hardware. `iniciarMaqueen()` detiene ruedas; `iniciarGamepad()` configura entradas y sondea botones, pero no escribe vibración, luces o motores.
- No hay `radio.*` en archivos de producción. Se combinan los eventos oficiales de Radio con acciones de Copilli en los proyectos de ejemplo.
