## Sin publicar ? movimientos por unidades y Mechanic gradual

- Potencias globales, balance y m?nimos de ruedas; recorridos por tiempo y cm estimados calibrables.
- Giros relativos por br?jula y correcci?n opcional de rumbo; cancelaci?n cooperativa de ?rdenes.
- Posiciones de cinco ejes Mechanic, rapidez global/por eje y cancelaci?n de trayectorias.
- Controles t?cnicos en M?s?, cinco ejemplos nuevos, pruebas de fibras PXT y protocolo f?sico.
- La suite nativa completa se compila para V2 por tama?o; APIs e IDs hist?ricos conservados.

# Cambios

## 0.1.0

- Primera implementación del perfil de referencia Maqueen Lite clásico/v4 y GamePad DFR0536 V4.
- Acciones explícitas de robot y mando, sensores, faros y perfiles Mechanic calibrables.
- Ejemplos separados, con radio nativa de MakeCode donde corresponde.
- La compatibilidad física y las calibraciones de accesorios están pendientes.

## Actualización local H01–H12 (sin release)

- Caducidad independiente de ejes de Radio y recuperación sin reutilizar muestras.
- Eventos GamePad en fibras cooperativas con multiplicidad/reentrancia acotadas, roles exclusivos y zona muerta por semieje.
- Protocolo ultrasónico contrastado con controlador fijado; RGB fuera de alcance y API antigua oculta con diagnóstico.
- Estado/resultado/perfil/objetivo por eje y elevación de pinza independiente.
- 24 ejemplos completos, herramientas fijadas, pruebas de integración, CI creado y exportación `.mkcd` importable en web.
- Conservados 35 IDs históricos; 53 IDs únicos en total. API `girar` oculta/deprecada; nuevo giro izquierda/derecha. No se cambia el significado de enums existentes.
- Resultados y pendientes concretos: `docs/revision-h01-h12.md`. Sin ensayo físico ni publicación.
