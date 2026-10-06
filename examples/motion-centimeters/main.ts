// Sustituye los ceros por cm medidos en 2 segundos a 40%, con estos mismos ajustes.
// Los ceros mantienen el ejemplo sin movimiento hasta calibrarlo.
let cmAdelanteMedidos = 0
let cmAtrasMedidos = 0
copilli.iniciarMaqueen()
copilli.fijarPotenciaMovimiento(40)
copilli.ajustarBalanceRuedas(0)
copilli.calibrarRecorrido(copilli.DireccionMovimiento.Adelante, cmAdelanteMedidos, 2)
copilli.calibrarRecorrido(copilli.DireccionMovimiento.Atras, cmAtrasMedidos, 2)
input.onButtonPressed(Button.A, function () {
    copilli.moverPor(copilli.DireccionMovimiento.Adelante, 20, copilli.UnidadMovimiento.Centimetros)
})
input.onButtonPressed(Button.B, function () {
    copilli.moverPor(copilli.DireccionMovimiento.Atras, 20, copilli.UnidadMovimiento.Centimetros)
})
input.onButtonPressed(Button.AB, function () {
    copilli.detener()
})
