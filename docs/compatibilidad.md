# Compatibilidad y límites comprobados

| Componente | Perfil | Evidencia / pendiente |
|---|---|---|
| micro:bit | V2 | PXT y ejemplo combinado logo/sonido/A/B/pantalla/sensores nativos; ensayo físico pendiente. |
| Maqueen | Lite clásico/v4 | Control contrastado con commit fijo DFRobot; revisión escolar desconocida. Probar alimentación, polaridad y salidas. |
| GamePad | DFR0536 V4 joystick | Guía oficial accesible y pinout coincidente: X=P1/Y=P2/Z=P8, C/D/E/F=P13/P14/P15/P16, vibrador/LED=P12, botones activos bajos. Ensayo físico pendiente. |
| GamePad escolar | DFR0536 V2 de cuatro direcciones | Referencia digital arriba=P8/abajo=P13/izquierda=P14/derecha=P15; X=P1/Y=P2; vibrador=P12/LED=P16. Sin lecturas analógicas ni acceso a P16. Identidad física escolar pendiente. |
| Mechanic | Beetle, Loader, Forklift, Push | Guía consultada, perfiles calibrables. Montaje escolar no confirmado. Elevación independiente de pinza: referencia histórica Plus original, sin garantía mecánica Lite. |

No se declaran compatibles Lite v5/Plus/Plus V2/variantes desconocidas. Sin autodetección ni cambio de rol en ejecución. El mapa de cuatro direcciones del controlador histórico se usa como referencia de V2; no se importa su código. La [guía V4](https://wiki.dfrobot.com/dfr0536/) distingue revisiones. Buzzer externo fuera de alcance; sonido nativo micro:bit.

La [comparación V4/V5](https://wiki.dfrobot.com/mbt0046/docs/21333) describe WS2812 ambientales en ambas y distingue faros. **RGB ambiental no implementado** en Copilli: APIs antiguas ocultas con diagnóstico, sin afirmar ausencia física.

## Entornos

Local comprobado: Node 24.16.0/npm 11.13.0, `pxt` 0.5.1, `pxt-microbit` 8.0.22, `pxt-core` 12.0.19 y TypeScript auxiliar 5.9.3. Lockfile fija target/transitivas. `setup:pxt` selecciona y verifica target; `targetVersions` no fija compilador.

Editor web consultado el 5 de octubre de 2026: microbit 9.0.12/PXT 13.0.9; validación separada, sin aprobación general de target 9 ni otras revisiones físicas. `.mkcd` incorpora una instant?nea local de fuentes. Futura importación por enlace requiere autorización y nueva prueba de revisión remota.

Informes locales en `built/validation/` y `output/playwright/`; [alcance H01–H12](revision-h01-h12.md). Workflow creado, sin ejecución remota. `.hex` locales generados durante compilación; ninguno probado en hardware.

## Herramientas y publicación

Instalación reportó 71 avisos: 5 bajos/35 moderados/28 altos/3 críticos; auditoría actual en `built/validation/npm-audit.json`. Son herramientas de desarrollo, no prueba de vulnerabilidad del firmware. No se ejecutó `npm audit fix --force`, que podría cambiar versiones verificadas. Revisar avisos y seleccionar/validar un entorno adecuado sigue pendiente antes de presentar la extensión como lista para publicación.

No se conectó hardware. I²C correcto no confirma dispositivo ni posición. Sin sensores de fuerza/atasco/posición. Timeout Radio cooperativo de ejemplo, no garantía industrial. `detener()` no libera cargas ni desconecta servos. Identificar y [probar físicamente](pruebas-fisicas.md) cada montaje antes de usar con alumnos.

La suite nativa completa de esta mejora requiere V2/CODAL por tama?o de flash. Los ejemplos se compilan por separado. Giros usan magnet?metro, sin giroscopio; cm usan tiempo calibrado, sin encoders. La respuesta de br?jula en el montaje Lite y la precisi?n f?sica permanecen pendientes.
