# API de Copilli

Los textos y API son diseño de Copilli. Control Maqueen contrastado con [DFRobot, commit fijo](https://github.com/DFRobot/pxt-maqueen/tree/a1fbb5e88ef4d53b814138d5a5ed73ab08465deb), sin importar sus tareas globales ni paquete. Radio permanece nativa, solo en ejemplos.

| API | Contrato |
|---|---|
| `iniciarMaqueen`, `iniciarGamepad` | Preparación visible, explícita, roles exclusivos. Segundo rol rechazado antes de hardware. Repetición idempotente; solo el primer inicio Maqueen detiene ruedas. |
| `avanzar`, `retroceder`, `girarHacia`, `detener` | Potencia 0–100 a 0–255; giro solo izquierda/derecha. Detener afecta ruedas, no energía del servo. |
| `moverRuedas` | -100–100 por rueda; I²C 0x10, registros 0x00/0x02, dirección 0 adelante/1 atrás. Dos órdenes independientes, sin atomicidad física garantizada. |
| `distanciaCm` | P1 disparo/P2 eco, secuencia `readUlt` del commit fijo: pausas **1/20 ms**, pulso alto/bajo según nivel inicial, timeout **29000 µs**, redondeo pulso/59. Pulso ≤0 o ≥timeout retorna -1. Sin reintento ni sustitución por 500. |
| `sobreLinea` | P13/P14; nivel bajo se interpreta como negro. Polaridad escolar pendiente de prueba. |
| `faros` | Digital P8/P12; izquierda/derecha/ambos. Dispositivo distinto de RGB ambiental. |
| `joystickHacia`, `joystickX`, `joystickY` | X positivo derecha/Y positivo arriba; dirección dominante, empate favorece X. Centro inicial 512; calibración atómica acepta 100–923 en ambos ejes. |
| `configurarZonaMuerta` | 0–30 % de cada semieje calibrado. Normaliza por longitud correspondiente, aplica umbral y reescala recorrido restante hasta ±100. Conserva extremos con centros desplazados. |
| `botonPresionado`, eventos | C=P13/D=P14/E=P15/F=P16/Z=P8, activos bajos; tres muestras estables. Pausa 10 ms más espera de `forever`, sin garantía de 30 ms. |
| `alPulsarBoton`, `alSoltarBoton` | Todos los estados se actualizan antes del despacho. Varias acciones conservadas, hasta 32 registros. Una fibra activa por manejador; repeticiones ocupadas descartadas; pulsación/liberación independientes. Bucle sin cesión puede bloquear runtime. |
| `vibrar` | P12 compartido con LED, máximo 5000 ms, solapamientos descartados, apagado al terminar. |
| `configurarPinza`, `abrirPinza`, `cerrarPinza` | Puerto y extremos apertura/cierre, independientes de elevación. |
| `configurarElevacionPinza`, `subirPinza`, `bajarPinza` | Eje opcional independiente, dos extremos baja/alta. Configurar no mueve. |
| `configurarPala`, `configurarHorquillas` y subir/bajar | Dos extremos semánticos bajo/alto. |
| `configurarSensorGiratorio`, `orientarSensor` | Push: tres ángulos distintos izquierda/frente/derecha; la placa frontal empuja al conducir. |
| `posicionMechanic` | API existente para apertura/pala/horquillas: 0 % cerrado/bajo, 100 % abierto/alto, incluso con ángulos invertidos. Enum histórico conservado; no se añadió elevación a esa firma. |
| `quitarConfiguracionMechanic(puerto)` | Retira perfil del puerto, sin movimiento ni corte de energía. |

## Estado y calibración

`maqueenPreparado`/`gamepadPreparado` consultan estado lógico, sin detección de hardware. `diagnosticoRobot`, `diagnosticoGamepad`, `diagnosticoMechanic(eje)` separan avisos. `diagnostico()` conserva el último texto de operación; **no** es estado completo. Iniciar un subsistema no borra avisos ajenos.

`EjeMechanic`: AperturaPinza=0, Pala=1, Horquillas=2, SensorPush=3, ElevacionPinza=4. Consultas sin acceso a hardware:

- `mechanicConfigurado(eje)`: existe perfil.
- `puertoMechanic(eje)`: 0=S1/1=S2/-1=sin perfil.
- `perfilMechanic(eje)`: `S#: bajo/frente/alto`; en perfiles de dos extremos frente repite bajo.
- `objetivoMechanic(eje)`: último ángulo enviado; -1 sin perfil/orden posterior a configurar. No es posición medida.
- `resultadoConfiguracionMechanic(eje)`: última solicitud aceptada/rechazada/retirada; persiste tras una acción correcta.

Se valida toda solicitud antes de sustituir el perfil. Rechazo conserva el anterior y lo declara; las acciones posteriores **seguirán usando ese perfil**. Aceptación reinicia objetivo a -1 sin movimiento. Dos actuadores/ejes no pueden ocupar el mismo puerto. Solo hay dos puertos: no se pueden configurar los cinco ejes simultáneamente.

## Migración

Namespace, valores de enums, firmas antiguas y los 35 IDs históricos se conservan. `girar(Lado, potencia)`/`copilli_girar` sigue compilando y Ambos sigue deteniendo; oculto/deprecado. Nuevos proyectos: `girarHacia(DireccionGiro, potencia)`/`copilli_girar_direccion`, solo izquierda/derecha. Ambos sigue disponible en faros.

`lucesInferiores(Color)`/`apagarLucesInferiores()` conservan IDs ocultos/deprecados. Sin salida y con diagnóstico «RGB ambiental no implementado». Se eligió excluirlo de esta versión, sin afirmar ausencia física ni migrarlo incorrectamente a faros. RGB real requiere un controlador posterior documentado y probado.

## Mando escolar de cuatro botones (DFR0536 V2)

Nombre visible y paquete: **Robotics** (`robotics`/`pxt-robotics`). El namespace `copilli` y los IDs anteriores permanecen para no romper proyectos. La descripción especifica Maqueen Lite, GamePad DFRobot y Maqueen Mechanic.

Selecciona **iniciar GamePad de botones (V2)**: arriba=P8, abajo=P13, izquierda=P14, derecha=P15; X=P1/Y=P2. Todo digital activo bajo con pull-up, sin lecturas analógicas ni tocar P16 (LED independiente). `mandoHacia`, `mandoX`, `mandoY` funcionan con ambos perfiles. V2 produce ejes -100/0/100; los opuestos simultáneos se cancelan, diagonales favorecen X. Lecturas de dirección inmediatas; `botonPresionado`/eventos aplican tres muestras estables también a direcciones y X/Y. V2 no ofrece proporcionalidad analógica.

**iniciar GamePad con joystick (V4)** conserva API/ID antiguos y admite joystick calibrable. `joystickX/Y/Hacia` y calibración requieren V4 y rechazan uso en V2. Un cambio V2↔V4 en ejecución se rechaza antes de hardware; reinicia y elige explícitamente. Botones de otro perfil se rechazan/ignoran con aviso; no se remapean silenciosamente. Los seis controllers por Radio usan ahora V2 escolar: X/Y accesorios; en pinza elevadora A/B nativos suben/bajan. `gamepad-joystick` conserva ejemplo V4.

## Movimiento por unidades y Mechanic gradual

Ver [gu?a completa](movimiento-lego.md) para contratos, calibraci?n y l?mites. Se conservan todas las firmas e IDs anteriores.

| API nueva | Contrato |
|---|---|
| `fijarPotenciaMovimiento`, `fijarPotenciaGiro` | 0?100%; iniciales 40/30. Sin movimiento; afecta ?rdenes futuras. |
| `ajustarBalanceRuedas`, `configurarMinimosRuedas` | Balance ?30?30; m?nimos 0?60% por rueda. Cero siempre detenido. Se aplican tambi?n a ?rdenes antiguas. |
| `moverContinuamente(DireccionMovimiento)` | Adelante/Atras, con potencia global. Rumbo opcional en fibra cooperativa. |
| `moverPor(direcci?n, cantidad, UnidadMovimiento)` | Segundos o Centimetros estimados; espera y detiene. M?ximo 120 s. |
| `calibrarRecorrido`, `recorridoCalibrado` | Cm/s independiente por direcci?n y revisi?n de ajustes. Configurar no mueve. |
| `prepararBrujula`, `brujulaPreparada` | Detiene antes de calibraci?n nativa; espera 500 ms. |
| `girarPor(direcci?n, cantidad, UnidadGiro)` | Grados relativos por br?jula (0?360) o segundos (0?120). Espera y detiene. |
| `mantenerRumboConBrujula`, `configurarCorreccionRumbo` | Opcional, desactivado inicialmente; ganancia 0?5, l?mite 0?50%; inicial 0,5/15. |
| `configurarToleranciaGiro` | 2?15?, inicial 5?. Fallos de lectura/progreso dejan diagn?stico y detienen. |
| `ponerEjeMechanic(EjeMechanic, porcentaje)` | Los cinco ejes. 0?100%; Push pasa por el frente calibrado en 50%. |
| `establecerPosicionInicialMechanic` | Env?a directamente una posici?n calibrada, requerida para gradual si no hay orden conocida. |
| `fijarRapidezMechanic`, `configurarRapidezEjeMechanic` | Global 1?100% (1,8?180?/s ordenados); por eje ?1 global, 0 inmediato, 1?100 gradual. |
| `detenerMovimientoMechanic` | Cancela pasos del eje conservando ?ltimo ?ngulo; no corta energ?a. |

`objetivoMechanic` es el ?ltimo ?ngulo enviado, incluido cada paso de trayectoria gradual. `detener` sigue afectando solo ruedas. `posicionMechanic(Mecanismo, porcentaje)` conserva su firma hist?rica; la nueva API por `EjeMechanic` cubre tambi?n elevaci?n y Push. Los enums nuevos usan Adelante/Segundos/Grados=0 y Atras/Centimetros/Segundos de giro=1.
