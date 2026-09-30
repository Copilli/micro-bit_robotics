// Firmware del micro:bit del mando. Configura el grupo con el mismo valor en el robot.
copilli.iniciarGamepad()
radio.setGroup(21)

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
