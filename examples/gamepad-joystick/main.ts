copilli.iniciarGamepad()

// Las flechas usan la dirección dominante del joystick; el centro apaga la pantalla.
basic.forever(function () {
    if (copilli.joystickHacia(copilli.DireccionJoystick.Arriba)) {
        basic.showArrow(ArrowNames.North)
    } else if (copilli.joystickHacia(copilli.DireccionJoystick.Abajo)) {
        basic.showArrow(ArrowNames.South)
    } else if (copilli.joystickHacia(copilli.DireccionJoystick.Izquierda)) {
        basic.showArrow(ArrowNames.West)
    } else if (copilli.joystickHacia(copilli.DireccionJoystick.Derecha)) {
        basic.showArrow(ArrowNames.East)
    } else {
        basic.clearScreen()
    }
})

copilli.alPulsarBoton(copilli.BotonGamepad.C, function () {
    basic.showIcon(IconNames.Yes)
})
