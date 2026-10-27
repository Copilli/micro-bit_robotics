# Mechanic: un selector de modelo

En Preparación usa **configurar Mechanic [modelo] en [S1/S2]**. Beetle es la pinza; no hay otra opción duplicada llamada pinza. Loader es pala, Forklift horquillas y Push sensor giratorio. Elevación de pinza es un eje adicional y requiere otro puerto.

Configurar no mueve. Usa primero el único bloque iniciar Maqueen. No hay selector de versión de placa en la experiencia del alumno. Las configuraciones viven en RAM.

## Valores iniciales ajustables

| Modelo | Inicio: 0% | Centro: 50% | Fin: 100% |
|---|---|---|---|
| Beetle (pinza) | Cerrada, 100° | Intermedia, 65° | Abierta, 30° |
| Loader (pala) | Baja, 120° | Intermedia, 90° | Alta, 60° |
| Forklift (horquillas) | Bajas, 120° | Intermedias, 90° | Altas, 60° |
| Push (sensor giratorio) | Izquierda, 40° | Frente, 90° | Derecha, 140° |
| Elevación de pinza | Baja, 120° | Intermedia, 90° | Alta, 60° |

Estos son perfiles de partida elegidos por esta extensión, no calibraciones universales certificadas por DFRobot. La guía del fabricante recomienda el rango general 10–170°. Montaje del brazo, carga y orientación pueden exigir invertir o reducir los extremos.

En Avanzado, **ajustar límites de [modelo] inicio [grados] fin [grados]** cambia el perfil de ese modelo conservando su puerto. Para Push puedes expandir el bloque y fijar centro; omitirlo o usar 0 toma el punto medio. Los ángulos son enteros de 10 a 170; inicio y fin distintos; frente de Push entre extremos. Una solicitud inválida conserva el perfil previo. El objetivo ordenado vuelve a desconocido al cambiar límites.

Seleccionar otro modelo en un puerto ocupado sustituye explícitamente su asignación, sin mover. Solo hay dos puertos: no pueden coexistir cinco accesorios conectados. Repetir configurar Mechanic restaura los valores iniciales del modelo; por eso los ajustes de límites van después del bloque de configuración.

## Controles comunes

- **poner Mechanic [modelo] en N %**: 0–100 dentro de los extremos. Push interpola dos tramos y conserva frente en 50%.
- **poner Mechanic [modelo] a N grados de servo**: ángulo absoluto entero dentro de los límites configurados.
- En Avanzado: **establecer posición ordenada de [modelo] como cero**, **orientar [modelo] a N grados desde cero** y **mover [modelo] N grados desde su posición ordenada**. Positivo va hacia fin; negativo hacia inicio. No permiten acumular vueltas fuera de los límites.

El cero se toma del último ángulo enviado; no lee posición física ni mueve el servo. Inicialmente el cero es inicio, excepto Push donde es frente. Establecer cero cancela los pasos pendientes de ese eje. Los controles de porcentaje siguen usando los extremos originales.

La rapidez global y por eje, las posiciones iniciales y la cancelación existentes también se aplican a los controles comunes. Con rapidez gradual activa, primero usa establecer posición inicial del eje: esta orden sí envía directamente la posición. Detener robot detiene ruedas, no desconecta el servo ni libera cargas.

Los bloques antiguos abrir/cerrar pinza, subir/bajar pala/horquillas y orientar sensor siguen compilando, con sus firmas e IDs, pero están ocultos del menú. Los ejemplos usan los controles comunes y ya no configuran ceros inválidos.

## Comprobar una pinza conectada en S1

Los cambios locales no actualizan una extensión ya instalada en MakeCode. Importa los archivos .mkcd de output/makecode mediante Importar → Abrir archivos desde tu equipo.

Usa **mechanic-models.mkcd**. Selecciona Beetle y S1; A ordena cerrado, B abierto y A+B intermedio. Ajusta sus límites al montaje. El inicio es el mismo para todos los ejemplos.

Para motores usa **maqueen-basic.mkcd**: A adelante un segundo, B atrás un segundo, A+B detener. La consola serie muestra los datos del robot disponibles en el controlador.

**servo-s1-test.mkcd** es una prueba directa de S1 con el mismo inicio común: A envía 80° y B 100°, sin configurar accesorio. No mueve el servo al iniciar. Este recorrido prueba respuesta, no garantiza apertura/cierre completo.

El bloque avanzado ponerServoGrados también permite probar S1/S2 sin perfil. Con perfil respeta límites, cancela pasos pendientes y actualiza el objetivo. Una transmisión I²C no confirma recepción ni movimiento. Si tampoco responde con inicialización y modelo correctos, contrasta el mismo puerto con la extensión oficial y registra versión exacta del robot, alimentación y respuesta.

## Sensor giratorio Push por grados

Selecciona Push y su puerto con el mismo bloque configurar Mechanic. Por ejemplo, posición 50% ordena frente=90°; establece cero allí y orienta Push a 15° desde cero para ordenar 105° de servo. El ejemplo mechanic-push usa A −10°, B +10° y logo vuelve a cero. Los límites iniciales son 40/90/140; pueden ajustarse, incluso invertirse.

## Fuentes y verificación

[Controlador oficial V4/V5](https://github.com/DFRobot/pxt-maqueen/blob/a1fbb5e88ef4d53b814138d5a5ed73ab08465deb/maqueen.ts): inicialización V5 en líneas 584–615; motores 664–685; servo 850–859. [Guía oficial Mechanic](https://learn.dfrobot.com/makelog-308436.html): modelos, función de cada accesorio y rango general. Los repositorios de tutoriales Beetle y Loader contienen PDF; no se atribuyen a esos PDF valores de calibración que no se hayan extraído.

Pruebas de paquetes I²C, lógica, compilación y conversión a bloques son evidencia de software. Ensayo físico y precisión del montaje siguen pendientes.
