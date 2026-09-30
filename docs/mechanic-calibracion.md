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
