let pulsacionesC = 0
let pulsacionesD = 0
let liberacionesC = 0
let segundaAccionC = 0
let ocupadoC = false
copilli.alPulsarBoton(copilli.BotonGamepad.C, function () {
    pulsacionesC += 1
    ocupadoC = true
    basic.pause(1000)
    ocupadoC = false
})
copilli.alPulsarBoton(copilli.BotonGamepad.C, function () {
    segundaAccionC += 1
})
copilli.alPulsarBoton(copilli.BotonGamepad.D, function () {
    pulsacionesD += 1
})
copilli.alSoltarBoton(copilli.BotonGamepad.C, function () {
    liberacionesC += 1
})
copilli.iniciarGamepad()
copilli.iniciarGamepad()
basic.pause(50)
pins.digitalWritePin(DigitalPin.P13, 0)
basic.pause(200)
control.assert(ocupadoC && pulsacionesC == 1, "C empezó su pausa")
pins.digitalWritePin(DigitalPin.P13, 1)
pins.digitalWritePin(DigitalPin.P14, 0)
basic.pause(200)
control.assert(ocupadoC && pulsacionesD == 1 && liberacionesC == 1, "D y liberación durante C")
control.assert(!copilli.botonPresionado(copilli.BotonGamepad.C), "estado de liberación actualizado")
pins.digitalWritePin(DigitalPin.P13, 0)
basic.pause(200)
control.assert(pulsacionesC == 1 && segundaAccionC == 2, "repetición de ocupado descartada, otro manejador independiente")
basic.pause(1000)
control.assert(pulsacionesC == 1, "sostenido no repite")
pins.digitalWritePin(DigitalPin.P13, 1)
basic.pause(200)
pins.digitalWritePin(DigitalPin.P13, 0)
basic.pause(200)
control.assert(pulsacionesC == 2, "nueva pulsación después de completar")
serial.writeString("PXT EVENTS PASS")
