copilli.iniciarMaqueen()

// Push: el servo orienta el ultrasonido. La placa frontal empuja al conducir.
// Ejemplo de recorrido corto: ajusta puerto y ángulos al montaje antes de ejecutar.
// Configurar no mueve; establecer posición inicial sí envía el ángulo de frente.
copilli.configurarMechanic(copilli.ModeloMechanic.Push, copilli.PuertoServo.S1)
copilli.establecerPosicionInicialMechanic(copilli.EjeMechanic.SensorPush, 50)
copilli.establecerCeroMechanic(copilli.ModeloMechanic.Push)

input.onButtonPressed(Button.A, function () {
    copilli.girarMechanicGrados(copilli.ModeloMechanic.Push, -10)
})
input.onButtonPressed(Button.B, function () {
    copilli.girarMechanicGrados(copilli.ModeloMechanic.Push, 10)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    copilli.orientarMechanicGrados(copilli.ModeloMechanic.Push, 0)
})
