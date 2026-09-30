copilli.iniciarMaqueen()

// Push: el servo orienta el ultrasonido. La placa frontal empuja al conducir.
// EJEMPLO COMPILABLE, NO CALIBRADO: reemplaza los ceros con ángulos medidos.
copilli.configurarSensorGiratorio(copilli.PuertoServo.S1, 0, 0, 0)

input.onButtonPressed(Button.A, function () {
    copilli.orientarSensor(copilli.DireccionSensor.Izquierda)
})
input.onButtonPressed(Button.B, function () {
    copilli.orientarSensor(copilli.DireccionSensor.Derecha)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    copilli.orientarSensor(copilli.DireccionSensor.Frente)
})
