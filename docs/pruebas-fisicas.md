# Lista de verificación física para el profesor

**Todas las pruebas siguientes están pendientes.** No se han conectado ni ensayado dispositivos físicos en este trabajo. Las pruebas de lógica y una compilación simulada no son ensayos físicos.

- [ ] Identificar y registrar revisión exacta de micro:bit, Maqueen y GamePad; comparar pinout y alimentación con la documentación de esa revisión.
- [ ] Comprobar conexiones, polaridad, alimentación separada/compartida permitida por el fabricante y masa común; comenzar con ruedas levantadas.
- [ ] Confirmar parada al llamar `iniciarMaqueen()` y el sentido individual de ambas ruedas a baja potencia.
- [ ] Verificar saturación, potencia cero, retroceso, giros y parada explícita antes de bajar el robot al suelo.
- [ ] Confirmar eco válido, timeout y sensor ausente; un resultado inválido es `-1` y no camino libre.
- [ ] Confirmar sensor de línea izquierdo/derecho, sentido de montaje y que el nivel bajo corresponde a negro sobre fondo claro.
- [ ] Revisar los faros y verificar qué ocurre con P8/P12 en la revisión de robot real.
- [ ] Confirmar pines y polaridad de botones/joystick del GamePad V4; particularmente P16 frente a la implementación histórica que lo usa como LED.
- [ ] Confirmar centro, extremos, sentido de X/Y, zona muerta, eventos únicos por pulsación y vibración compartida con LED.
- [ ] Confirmar puerto real del servo, mecanismo sin carga, límites calibrados estrechos, acción de cada extremo y espacio libre; detener si hay esfuerzo, atasco o calentamiento.
- [ ] En parejas de radio, verificar grupo, liberación del joystick, mensaje `parar`, pérdida de radio y timeout de 500 ms con ruedas levantadas.
- [ ] Verificar que mensajes de accesorio o desconocidos no mantengan movimiento y que pérdida de radio no abra una pinza.

El grupo de Radio separa equipos por canal/grupo, pero no es autenticación ni control de acceso.

- [ ] Con C ejecutando pausa/sonido, pulsar D y soltar C: comprobar antirrebote, independencia y ausencia de repeticiones mientras se sostiene.
- [ ] Radio proporcional: cortar solo x o solo y, comprobar parada y que un solo eje posterior no reinicia. Enviar pareja nueva y `parar`; verificar con ruedas levantadas.
- [ ] Pinza elevadora: identificar geometría escolar, probar apertura/elevación por separado, conflictos de puerto, dirección y carga permitida. No extrapolar compatibilidad desde Plus original.
- [ ] Registrar fecha, revisión de placa/sensor, alimentación, programa, límites por eje y observaciones; conservar resultados fallidos también.

La documentación oficial V4 ahora pudo consultarse y respalda el mapa de pines; eso no marca como realizadas estas pruebas. RGB ambiental no está implementado en esta versión.

- [ ] Mando escolar V2: identificar revisión y verificar arriba=P8/abajo=P13/izquierda=P14/derecha=P15, X=P1/Y=P2; P16 es LED, no botón F. Probar cancelación de opuestos, diagonales, eventos X/Y y vibración P12. Seleccionar inicio V2, nunca V4 por defecto.

## Protocolo de movimiento por unidades y Mechanic gradual

Pendiente de medici?n f?sica de esta mejora. Registrar montaje y orientaci?n de micro:bit, bater?a, superficie, carga, versi?n local del programa, potencia, balance y m?nimos. La confirmaci?n previa del usuario de que el robot se mueve no valida estas nuevas funciones.

- [ ] Balance y m?nimos: ruedas levantadas, luego suelo; verificar ambos sentidos y cero con m?nimos no nulos. Medir si ambas ruedas arrancan y si una correcci?n mejora la recta.
- [ ] Calibrar cm/s para adelante y atr?s con los ajustes definitivos. Repetir si cambian o si cambia la bater?a/carga/superficie.
- [ ] Ejecutar cinco recorridos de 20 cm y cinco de 50 cm en cada direcci?n. Registrar distancia real, error firmado, promedio y rango (m?ximo menos m?nimo).
- [ ] Registrar rumbo con motores apagados y encendidos, en toda la vuelta, para comprobar montaje y alteraci?n magn?tica. No suponer que la br?jula es fiable por tener lecturas entre 0 y 359.
- [ ] Ejecutar cinco giros de 90?, 180? y 360? en cada sentido. Medir ?ngulo f?sico con referencia externa, registrar rumbo inicial/final, error y dispersi?n.
- [ ] Probar cruce del norte, rumbo en reversa y parada durante una maniobra; comprobar que una orden antigua no reaparece.
- [ ] Comparar recta con rumbo activado/desactivado, con los mismos ajustes. Registrar deriva lateral y rumbo real.
- [ ] Mechanic sin carga: l?mites medidos, posici?n inicial directa, 25/50/75%, rapidez global/por eje y parada. Verificar apertura/elevaci?n separadas y movimientos simult?neos dentro del montaje permitido.

| Programa/maniobra | Objetivo | Repetici?n (1?5) | Medida f?sica | Error firmado | Observaci?n/diagn?stico |
|---|---|---|---|---|---|
| | | | | | |

No completar casillas ni presentar precisi?n hasta registrar mediciones reales. La br?jula no mide distancia; el ?ltimo ?ngulo del servo no es posici?n medida.
