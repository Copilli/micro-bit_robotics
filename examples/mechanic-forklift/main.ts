copilli.iniciarMaqueen()

// EJEMPLO COMPILABLE, NO CALIBRADO: ajusta con medidas seguras del Forklift real.
copilli.configurarHorquillas(copilli.PuertoServo.S1, 0, 0)

input.onButtonPressed(Button.A, function () {
    copilli.subirHorquillas()
})
input.onButtonPressed(Button.B, function () {
    copilli.bajarHorquillas()
})
