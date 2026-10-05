# Preparación y calibración de Mechanic

La configuración vive en el programa y en RAM; no persiste al apagar. Antes de probar, el profesor identifica el perfil del robot, conecta un solo accesorio por puerto S1/S2 y obtiene los valores con prueba física supervisada, sin carga. No hay una calibración universal. El límite de 10°–170° es solo un rechazo conservador de valores extremos, no una recomendación de recorrer el rango.

## Preparación del programa

1. Con el robot estable y el accesorio sin carga, confirma el puerto y fija límites seguros estrechos para ese montaje.
2. Reemplaza los ceros de la plantilla por los valores calibrados y deja las llamadas `configurar...` en el inicio del programa.
3. Configurar no centra ni mueve nada. Después llama a `iniciarMaqueen()` de forma explícita. Esa inicialización detiene las ruedas y no mueve servos.
4. Ordena una acción de baja consecuencia y observa el movimiento bajo supervisión. El envío retorna inmediatamente; usa una pausa nativa antes de ordenar el siguiente movimiento.
5. Revisa montaje, dirección y límites en cada sesión. El envío de un ángulo no confirma que el mecanismo llegó, cerró o sostuvo una carga.

`0 %` equivale al extremo cerrado/bajo y `100 %` al abierto/alto según la semántica, aunque los valores de servo estén invertidos. `posicionMechanic` limita el porcentaje a 0–100. `quitarConfiguracionMechanic(puerto)` elimina la asignación lógica para permitir reemplazar el mecanismo; no envía ninguna orden al servo. Un puerto asignado a otro mecanismo se rechaza.

## Plantillas seguras

Los ejemplos `mechanic-*` contienen valores `0`, intencionalmente rechazados. Reemplázalos únicamente con valores calibrados en el montaje físico. Mientras no se configure un perfil válido, las acciones no escriben al servo y `diagnostico()` explica la causa.

Para un accesorio impreso en 3D que use un servo, primero revisa su geometría, torque/carga y montaje, conecta el servo a un puerto compatible y calibra manualmente sus extremos. Solo entonces se puede usar una de las configuraciones existentes si su semántica encaja. No se declara compatible un accesorio impreso específico.

`detener()` detiene ruedas, pero no corta energía de servo ni libera una carga. No hay control de fuerza ni confirmación de posición.

## Dos ejes de pinza y configuración vigente

`configurarPinza` controla apertura/cierre; `configurarElevacionPinza` controla subida/bajada y exige otro puerto. `subirPinza`/`bajarPinza` no cambian el objetivo de apertura, y abrir/cerrar no cambia elevación. El ejemplo usa S1 elevación/S2 apertura como referencia histórica de Plus original: el montaje mecánico en Lite debe identificarse y probarse, no se declara garantizado.

Se valida toda solicitud antes de reemplazar un perfil. Si se rechaza, continúa vigente el anterior y las próximas acciones lo usan. Consulta `resultadoConfiguracionMechanic(eje)`, `perfilMechanic(eje)`, `mechanicConfigurado(eje)` y `objetivoMechanic(eje)`; el objetivo es un ángulo enviado, no medido. Configurar correctamente vuelve a objetivo -1 sin mover. Los avisos de cada eje son independientes. `diagnostico()` solo es el último texto de operación; usa `diagnosticoMechanic(eje)` para ese eje.

Solo S1/S2; dos ejes ocupan los dos puertos. Los cinco perfiles posibles no pueden coexistir físicamente a la vez. Quitar configuración libera la asignación lógica, no desconecta energía ni mueve el servo. Probar ambos ejes por separado sin carga, verificar espacio libre y registrar extremos medidos antes de combinarlos.
