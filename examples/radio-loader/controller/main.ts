// Perfil escolar: DFR0536 V2 con cuatro botones de dirección, X/Y y A/B nativos.
// Firmware del micro:bit del mando; C sube y D baja la pala.
copilli.iniciarGamepadBotones()
radio.setGroup(24)

copilli.alPulsarBoton(copilli.BotonGamepad.X, function () {
    radio.sendString("subir")
})
copilli.alPulsarBoton(copilli.BotonGamepad.Y, function () {
    radio.sendString("bajar")
})

basic.forever(function () {
    if (copilli.mandoHacia(copilli.DireccionJoystick.Arriba)) {
        radio.sendString("avanzar")
    } else if (copilli.mandoHacia(copilli.DireccionJoystick.Abajo)) {
        radio.sendString("retroceder")
    } else if (copilli.mandoHacia(copilli.DireccionJoystick.Izquierda)) {
        radio.sendString("izquierda")
    } else if (copilli.mandoHacia(copilli.DireccionJoystick.Derecha)) {
        radio.sendString("derecha")
    } else {
        radio.sendString("parar")
    }
    basic.pause(100)
})
