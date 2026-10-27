// Movimiento y lecturas con un solo bloque iniciar Maqueen.
copilli.iniciarMaqueen()
copilli.fijarPotenciaMovimiento(40)
input.onButtonPressed(Button.A, function () {
    copilli.moverPorSegundos(copilli.DireccionMovimiento.Adelante, 1)
})
input.onButtonPressed(Button.B, function () {
    copilli.moverPorSegundos(copilli.DireccionMovimiento.Atras, 1)
})
input.onButtonPressed(Button.AB, function () {
    copilli.detener()
})
basic.forever(function () {
    if (copilli.maqueenPreparado()) {
        serial.writeValue("distancia_cm", copilli.distanciaCm())
        if (copilli.sobreLinea(copilli.SensorLinea.Izquierdo)) {
            serial.writeLine("linea izquierda: negra")
        } else {
            serial.writeLine("linea izquierda: clara")
        }
        if (copilli.sobreLinea(copilli.SensorLinea.Derecho)) {
            serial.writeLine("linea derecha: negra")
        } else {
            serial.writeLine("linea derecha: clara")
        }
    }
    basic.pause(200)
})
