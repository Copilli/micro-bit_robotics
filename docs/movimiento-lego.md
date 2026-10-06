# Movimiento por unidades y Mechanic gradual

Los nuevos bloques están en Robotics. Los controles con `advanced=true` aparecen en **Más…**. La potencia es una orden al controlador, no velocidad física medida.

## Preparar y mover

1. Usa `iniciar Maqueen` y fija potencia de movimiento (inicial 40%) y de giro (inicial 30%).
2. Ajusta balance: negativo reduce izquierda; positivo reduce derecha; cero no compensa.
3. Usa `mover adelante/atrás continuamente`, `mover adelante/atrás por cantidad segundos/cm estimados`, `girar izquierda/derecha por cantidad grados/segundos` y `detener robot`.

Las órdenes por cantidad esperan con pausas cooperativas y detienen al terminar. Cada orden sustituye la anterior; una fibra antigua no puede reactivar ni detener la nueva. `detener` cancela la maniobra actual, no una secuencia de bloques que el usuario programe después de ella. Los ajustes se capturan al empezar cada maniobra; los setters solo afectan órdenes futuras.

En Más… están los controles anteriores con potencia explícita y el control por rueda. Conservan sus firmas e IDs. Balance y mínimos se aplican también a esas órdenes; la corrección de rumbo se usa en los nuevos bloques rectos.

### Balance y mínimo de arranque

Balance: −30 a +30, reducción porcentual de la rueda indicada. Mínimos: 0–60% por rueda, inicialmente cero. Para una magnitud no nula `p`, la salida es `mínimo + p × (100 − mínimo) / 100`, después balance y escala a 0–255. Cero siempre queda detenido. Balance y mínimo son ajustes distintos: compensación entre ruedas y umbral de arranque. Comprueba el arranque real después de aplicar ambos.

### Centímetros estimados

El controlador Lite utilizado no proporciona lectura de encoders. Los cm se calculan por tiempo:

1. Usa `motion-calibration` y mide con regla cuánto recorre en 2 segundos con tus ajustes. A: adelante; B: atrás; A+B: detener.
2. En `motion-centimeters`, sustituye los dos ceros por esas distancias. Conserva la misma potencia, balance y mínimos.
3. `calibrarRecorrido(dirección, cm, segundos)` guarda cm/s sin mover. `moverPor` calcula `tiempo = cm / (cm/s)`.

La calibración es independiente por dirección. Cambiar potencia de movimiento, balance, mínimos, activación de rumbo o intensidad/límite de corrección invalida ambas calibraciones. Volver al valor anterior no las recupera. Cambiar potencia de giro o tolerancia no las invalida. Una solicitud rechazada conserva el perfil previo.

Sin calibración vigente no inicia el recorrido. Máximo: 120 segundos por maniobra. Las calibraciones viven en RAM. Batería, carga y superficie pueden cambiar el recorrido sin que el programa lo detecte; los cm son una estimación.

### Brújula y giros

`prepararBrujula()` exige Maqueen iniciado, cancela el movimiento, detiene ruedas, ejecuta `input.calibrateCompass()` y espera 500 ms. Sigue la calibración de la pantalla antes de mover.

Los grados requieren preparación explícita. El giro es relativo en la dirección elegida: acumula diferencias normalizadas, cruza 359°/0° y admite hasta 360°. Lee cada 20 ms, reduce a la mitad la potencia en los últimos 20° y termina dentro de la tolerancia (inicial 5°, ajustable 2–15°). Un giro menor o igual a la tolerancia no inicia motores.

Lectura inválida, salto mayor a 45° entre muestras, 2 segundos sin progreso neto de al menos 1° o 30 segundos de duración detienen y dejan diagnóstico. No se cambia automáticamente a tiempo. Los giros por segundos no usan brújula y admiten hasta 120 segundos.

`mantenerRumboConBrujula(true)` activa corrección opcional en los nuevos movimientos rectos. Captura el rumbo inicial, aplica 0,5 puntos de potencia por grado, limitado a ±15, y funciona también en reversa. En Más…: intensidad 0–5, límite 0–50%. No invierte ruedas para corregir. Lecturas inválidas o saltos mayores a 45° detienen también la trayectoria recta.

La micro:bit tiene magnetómetro y acelerómetro, no giroscopio. La brújula mide orientación, no distancia. Verifica el montaje y las lecturas en todo el giro, con motores apagados/encendidos; campos magnéticos y metal pueden alterarlas. No se garantiza detectar una lectura incorrecta pero plausible ni demostrar movimiento físico. Referencias: [rumbo MakeCode](https://makecode.microbit.org/reference/input/compass-heading), [calibración con accesorios](https://support.microbit.org/support/solutions/articles/19000008874-calibrating-the-micro-bit-compass).

## Posición y rapidez de Mechanic

Configura puerto y extremos con límites medidos. Configurar no mueve. `ponerEjeMechanic(eje, porcentaje)` incluye apertura/elevación de pinza, pala, horquillas y sensor Push.

| Eje | 0% | 50% | 100% |
|---|---|---|---|
| Apertura de pinza | Cerrada | Intermedia | Abierta |
| Elevación de pinza | Baja | Intermedia | Alta |
| Pala | Baja | Intermedia | Alta |
| Horquillas | Bajas | Intermedia | Altas |
| Sensor Push | Izquierda | Frente | Derecha |

Admite ángulos invertidos. Push interpola dos tramos respetando el frente calibrado. Abrir/cerrar, subir/bajar y orientar usan el mismo controlador.

Sin configurar rapidez, las órdenes siguen enviando inmediatamente el objetivo. `fijarRapidezMechanic(1–100)` habilita trayectoria gradual global: 1,8–180°/s de ángulo ordenado, con pasos cada 20 ms. No mide rapidez ni posición físicas.

Antes del primer movimiento gradual, usa `establecerPosicionInicialMechanic(eje, porcentaje)`: **envía directamente ese ángulo**. Comprueba espacio libre y límites; no se supone un centro de 90°. Reconfigurar un perfil válido reinicia su posición ordenada conocida y exige establecerla de nuevo.

En Más…, `configurarRapidezEjeMechanic` tiene prioridad sobre global: −1 hereda global, 0 inmediato, 1–100 gradual. Los setters afectan órdenes futuras. Las trayectorias esperan cooperativamente; ejes distintos pueden trabajar en fibras diferentes. Otra orden del mismo eje, quitar su configuración o reemplazarla cancela su trayectoria anterior.

`detenerMovimientoMechanic(eje)` cancela pasos futuros y conserva el último ángulo enviado; no corta energía ni libera cargas. `detener robot` afecta solo a ruedas. `objetivoMechanic` cambia durante los pasos y siempre significa último ángulo enviado, no medido.

## Probar esta revisión

Los cambios son locales hasta recibir una instrucción de publicación. La URL pública importa la versión publicada. Para probar esta revisión, ejecuta `npm run export:web` e importa los `.mkcd` de `output/makecode` mediante **Importar → Abrir archivos desde tu equipo** en MakeCode.

Ejemplos nuevos: `motion-calibration`, `motion-centimeters`, `motion-compass-square`, `motion-heading`, `mechanic-gradual`. Los ceros de cm y Mechanic permanecen inválidos hasta introducir medidas propias. El cuadrado usa lados por tiempo y giros por brújula; interrumpe su secuencia ante diagnóstico de fallo.

La suite completa `npm run test:pxt` selecciona micro:bit V2 (CODAL) con límites reales de flash; no cabe en V1. `validate:pxt` conserva la compilación normal de raíz/ejemplos y ejecuta la suite completa para V2. Ver [protocolo físico](pruebas-fisicas.md) antes de atribuir precisión.
