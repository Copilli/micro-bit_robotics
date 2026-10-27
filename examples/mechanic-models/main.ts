// Elige el mismo modelo en los selectores. Beetle es la pinza.
copilli.iniciarMaqueen()
copilli.configurarMechanic(copilli.ModeloMechanic.Beetle, copilli.PuertoServo.S1)
// Opcional: ajusta inicio/fin al montaje sin cambiar de bloques.
// copilli.ajustarLimitesMechanic(copilli.ModeloMechanic.Beetle, 100, 30)
input.onButtonPressed(Button.A, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 0)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 100)
})
input.onButtonPressed(Button.AB, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 50)
})
