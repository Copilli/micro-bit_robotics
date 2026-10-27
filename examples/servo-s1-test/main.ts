// Prueba directa de S1, sin configurar pinza ni activar rapidez gradual.
// No mueve el servo al iniciar. A envía 80 grados; B envía 100 grados.
// Es un recorrido de prueba, no una calibración de apertura/cierre.
copilli.iniciarMaqueen()
input.onButtonPressed(Button.A, function () {
    copilli.ponerServoGrados(copilli.PuertoServo.S1, 80)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerServoGrados(copilli.PuertoServo.S1, 100)
})
input.onButtonPressed(Button.AB, function () {
    basic.showString(copilli.diagnostico())
})
