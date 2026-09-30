// Firmware del micro:bit del mando; C abre y D cierra la pinza.
copilli.iniciarGamepad()
radio.setGroup(22)

copilli.alPulsarBoton(copilli.BotonGamepad.C, function () {
    radio.sendString("abrir")
})
copilli.alPulsarBoton(copilli.BotonGamepad.D, function () {
    radio.sendString("cerrar")
})

basic.forever(function () {
    if (copilli.joystickHacia(copilli.DireccionJoystick.Arriba)) {
        radio.sendString("avanzar")
    } else if (copilli.joystickHacia(copilli.DireccionJoystick.Abajo)) {
        radio.sendString("retroceder")
    } else if (copilli.joystickHacia(copilli.DireccionJoystick.Izquierda)) {
        radio.sendString("izquierda")
    } else if (copilli.joystickHacia(copilli.DireccionJoystick.Derecha)) {
        radio.sendString("derecha")
    } else {
        radio.sendString("parar")
    }
    basic.pause(100)
})
