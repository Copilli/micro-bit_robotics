// Mide con regla la distancia recorrida en 2 segundos, en cada dirección.
// Ajusta balance/mínimos antes de medir. No cambia la calibración automáticamente.
copilli.iniciarMaqueen()
copilli.fijarPotenciaMovimiento(40)
copilli.ajustarBalanceRuedas(0)
input.onButtonPressed(Button.A, function () {
    copilli.moverPorSegundos(copilli.DireccionMovimiento.Adelante, 2)
})
input.onButtonPressed(Button.B, function () {
    copilli.moverPorSegundos(copilli.DireccionMovimiento.Atras, 2)
})
input.onButtonPressed(Button.AB, function () {
    copilli.detener()
})
