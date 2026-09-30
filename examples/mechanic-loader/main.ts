copilli.iniciarMaqueen()

// EJEMPLO COMPILABLE, NO CALIBRADO: ajusta con medidas seguras del Loader real.
copilli.configurarPala(copilli.PuertoServo.S1, 0, 0)

input.onButtonPressed(Button.A, function () {
    copilli.subirPala()
})
input.onButtonPressed(Button.B, function () {
    copilli.bajarPala()
})
