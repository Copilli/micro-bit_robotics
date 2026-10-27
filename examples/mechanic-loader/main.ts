copilli.iniciarMaqueen()

// PLANTILLA CON CALIBRACIÓN PENDIENTE: ajusta con medidas seguras del Loader real.
copilli.configurarMechanic(copilli.ModeloMechanic.Loader, copilli.PuertoServo.S1)

input.onButtonPressed(Button.A, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Loader, 100)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Loader, 0)
})
