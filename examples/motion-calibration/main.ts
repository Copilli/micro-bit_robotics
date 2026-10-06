// Mide con regla la distancia recorrida en 2 segundos, en cada dirección.
// Ajusta balance/mínimos antes de medir. No cambia la calibración automáticamente.
copilli.iniciarMaqueen()
copilli.fijarPotenciaMovimiento(40)
copilli.ajustarBalanceRuedas(0)
input.onButtonPressed(Button.A, function () {
    copilli.moverPor(copilli.DireccionMovimiento.Adelante, 2, copilli.UnidadMovimiento.Segundos)
})
input.onButtonPressed(Button.B, function () {
    copilli.moverPor(copilli.DireccionMovimiento.Atras, 2, copilli.UnidadMovimiento.Segundos)
})
input.onButtonPressed(Button.AB, function () {
    copilli.detener()
})
