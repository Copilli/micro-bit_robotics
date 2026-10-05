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
