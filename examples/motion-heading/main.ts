copilli.iniciarMaqueen()
copilli.fijarPotenciaMovimiento(40)
copilli.prepararBrujula()
copilli.mantenerRumboConBrujula(true)
input.onButtonPressed(Button.A, function () {
    copilli.moverPor(copilli.DireccionMovimiento.Adelante, 2, copilli.UnidadMovimiento.Segundos)
})
input.onButtonPressed(Button.B, function () {
    copilli.moverPor(copilli.DireccionMovimiento.Atras, 2, copilli.UnidadMovimiento.Segundos)
})
input.onButtonPressed(Button.AB, function () {
    copilli.detener()
})
