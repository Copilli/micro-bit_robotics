// Perfil escolar: DFR0536 V2 con cuatro botones de dirección, X/Y y A/B nativos.
copilli.iniciarGamepadBotones()

// Las flechas usan la dirección dominante del mando; el centro apaga la pantalla.
basic.forever(function () {
    if (copilli.mandoHacia(copilli.DireccionJoystick.Arriba)) {
        basic.showArrow(ArrowNames.North)
    } else if (copilli.mandoHacia(copilli.DireccionJoystick.Abajo)) {
        basic.showArrow(ArrowNames.South)
    } else if (copilli.mandoHacia(copilli.DireccionJoystick.Izquierda)) {
        basic.showArrow(ArrowNames.West)
    } else if (copilli.mandoHacia(copilli.DireccionJoystick.Derecha)) {
        basic.showArrow(ArrowNames.East)
    } else {
        basic.clearScreen()
    }
})

copilli.alPulsarBoton(copilli.BotonGamepad.X, function () {
    basic.showIcon(IconNames.Yes)
})
