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
