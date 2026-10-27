copilli.iniciarMaqueen()

// PLANTILLA CON CALIBRACIÓN PENDIENTE: ajusta con medidas seguras del Forklift real.
copilli.configurarMechanic(copilli.ModeloMechanic.Forklift, copilli.PuertoServo.S1)

input.onButtonPressed(Button.A, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Forklift, 100)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Forklift, 0)
})
