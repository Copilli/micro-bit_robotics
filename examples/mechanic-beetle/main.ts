copilli.iniciarMaqueen()

// PLANTILLA CON CALIBRACIÓN PENDIENTE: reemplaza ambos ceros por ángulos medidos
// sin carga y bajo supervisión. Mientras sigan en cero no se ordena ningún servo.
copilli.configurarPinza(copilli.PuertoServo.S1, 0, 0)

input.onButtonPressed(Button.A, function () {
    copilli.abrirPinza()
})
input.onButtonPressed(Button.B, function () {
    copilli.cerrarPinza()
})
