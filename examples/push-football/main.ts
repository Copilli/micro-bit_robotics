copilli.iniciarMaqueen()

// Push usa su placa frontal para empujar con el desplazamiento del robot.
// El servo solo orienta el ultrasónico; no es un pateador.
// Reemplaza los ceros solo tras calibrar el montaje real.
copilli.configurarSensorGiratorio(copilli.PuertoServo.S1, 0, 0, 0)

input.onButtonPressed(Button.A, function () {
    copilli.avanzar(30)
    basic.pause(500)
    copilli.detener()
})
input.onButtonPressed(Button.B, function () {
    copilli.detener()
})
