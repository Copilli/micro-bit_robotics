# Avisos de terceros

## DFRobot pxt-maqueen

`hardware.ts` implementa el protocolo mínimo de motores y servos descrito por el controlador Maqueen clásico/v4 de DFRobot: dirección I²C `0x10`, registros de motores `0x00`/`0x02` y registros de servos `0x14`/`0x15`. La implementación de este repositorio es propia; no se incluye el paquete `pxt-maqueen` ni su tarea de sondeo, bloques, dependencia infrarroja o código de otras revisiones. Fuente inspeccionada: [`maqueen.ts` en el commit a1fbb5e88ef4d53b814138d5a5ed73ab08465deb](https://github.com/DFRobot/pxt-maqueen/blob/a1fbb5e88ef4d53b814138d5a5ed73ab08465deb/maqueen.ts).

El paquete de origen declara licencia MIT, Copyright © 2019 DFRobot. Su licencia completa se conserva a continuación. La atribución no implica aprobación de Copilli ni compatibilidad física con una placa escolar sin identificar.

```text
MIT License

Copyright (c) 2019 DFRobot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## DFRobot pxt-gamePad

La extensión DFRobot [`pxt-gamePad`](https://github.com/DFRobot/pxt-gamePad) fue inspeccionada solo para contrastar sus asignaciones. No se copia ni se depende de su código: su manifiesto indica `GNU`, su README también indica `GNU` y el encabezado del TypeScript dice LGPL, pero no se encontró un archivo `LICENSE` que permita resolver la licencia exacta. Su pinout de `gamer:bit` no se usa como evidencia de la revisión DFR0536 V4 solicitada.
