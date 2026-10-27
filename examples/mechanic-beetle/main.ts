copilli.iniciarMaqueen()

// Perfil Beetle inicial: cerrado 100°, abierto 30°. Ajusta al montaje con ajustarLimitesMechanic.
copilli.configurarMechanic(copilli.ModeloMechanic.Beetle, copilli.PuertoServo.S1)

input.onButtonPressed(Button.A, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 100)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 0)
})
input.onButtonPressed(Button.AB, function () {
    basic.showString(copilli.diagnosticoMechanic(copilli.EjeMechanic.AperturaPinza))
})
