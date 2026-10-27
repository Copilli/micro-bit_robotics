copilli.iniciarMaqueen()

// Push usa su placa frontal para empujar con el desplazamiento del robot.
// El servo solo orienta el ultrasónico; no es un pateador.
// Ajusta los límites del modelo al montaje real.
copilli.configurarMechanic(copilli.ModeloMechanic.Push, copilli.PuertoServo.S1)

input.onButtonPressed(Button.A, function () {
    copilli.avanzar(30)
    basic.pause(500)
    copilli.detener()
})
input.onButtonPressed(Button.B, function () {
    copilli.detener()
})
